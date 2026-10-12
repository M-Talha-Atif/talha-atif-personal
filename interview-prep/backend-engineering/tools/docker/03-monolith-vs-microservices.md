# 03. Docker in Monolith vs Microservices

## Monolith + Docker
```
[ one app image ]  ←→  [ postgres ]  ←→  [ redis ]
```
- **One image, one deployable.** Simple. `docker compose up` gives you the whole system.
- Scale = run more replicas of the same image behind a load balancer.
- Pain point: any change rebuilds/redeploys everything; image can get big.
- Good answer: "Dockerizing a monolith is the easiest first step: same app, now reproducible, and it makes a later split easier."

## Microservices + Docker
```
client → [ gateway / nginx ] → [ users svc ] → [ users-db ]
                             → [ orders svc ] → [ orders-db ]
                                   ↓ HTTP / queue
                               [ users svc ]
```
Rules that matter:
1. **One service = one image = one process.** Don't cram two services into one container.
2. **Database per service.** No shared DB tables between services (otherwise it's a distributed monolith).
3. **Talk by service name** over a shared Docker network (`http://users:3000`), never `localhost`, never hard-coded IPs.
4. **Only the gateway is published** to the host. Internal services have no `ports:`, so they're unreachable from outside (smaller attack surface).
5. **Each service has its own healthcheck and config** via env vars.
6. **Independent versioning**: `users:1.4.0`, `orders:2.1.3`.
7. **Startup order is not guaranteed**, so use healthchecks + retry logic in code. `depends_on` only helps locally.
8. **Async communication** (RabbitMQ/Kafka) for things that shouldn't fail together. Both run happily as containers.
9. **Observability**: stdout logs + a correlation/request ID passed between services.

## Network isolation pattern
```yaml
networks:
  frontend:     # gateway ↔ services
  backend:      # services ↔ databases (gateway can't reach DBs)
```
A service on both networks bridges them; the DB sits only on `backend`.

## Does Docker work well with Next.js?
**Yes, and it's very common.** Key points:
- Set `output: 'standalone'` in `next.config.js`. Next traces and copies only needed files → image ~150 MB instead of 1 GB+.
- `NEXT_PUBLIC_*` vars are **inlined at build time**, not runtime! If your API URL changes per environment, either rebuild per env or fetch config at runtime (API route / server-side env). **Great interview point.**
- Server-side code in the container calls the API via the Docker network (`http://api:3000`), but the *browser* calls the public URL (`https://api.example.com`). Two different URLs. Classic bug.
- Bind to all interfaces: `HOSTNAME=0.0.0.0`, or the container looks "up" but is unreachable.
- Alternatively deploy on Vercel and skip Docker, and say you know the tradeoff (Docker = portability, self-hosting, same runtime everywhere).

## Does Docker work well with Spring Boot?
Yes. Tips:
- Multi-stage: Maven/Gradle build in JDK stage → run JAR on a JRE stage.
- Use **layered jars** (`java -Djarmode=layertools`) so dependency layers are cached and only your code layer changes.
- Or skip the Dockerfile: `./mvnw spring-boot:build-image` (Cloud Native Buildpacks).
- Actuator `/actuator/health` for HEALTHCHECK. Needs `spring-boot-starter-actuator`.
- Config via env: `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/app` (relaxed binding maps env vars to properties).
- JVM memory: `-XX:MaxRAMPercentage=75.0`.
- Slow startup: tune healthcheck `start_period` (e.g. 40s) so it isn't killed while booting.

## Spring Boot ↔ Node comparison (nice to mention)
| | Node | Spring Boot |
|---|---|---|
| Build stage | `npm ci && npm run build` | `mvn package` |
| Runtime image | node alpine/slim | JRE (temurin) |
| Image size | ~150 MB | ~250 MB |
| Startup | ~1 s | 5-30 s (→ healthcheck start_period) |
| Memory | ~100 MB | 300 MB+ (set limits!) |
