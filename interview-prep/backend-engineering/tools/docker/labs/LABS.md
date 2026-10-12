# 🧪 Hands-on Labs

Prereq: Docker Desktop running. Check: `docker version` and `docker compose version`.

---

## Lab 1: Node + Postgres + Redis (production-style)
```bash
cd labs/lab1-node
docker compose up -d --build
docker compose ps                 # wait for db "healthy"
curl http://localhost:3000/health
curl http://localhost:3000/visits # call it a few times
```
**Prove you understand it. Do each of these and explain what happened:**
1. `docker compose down` then `up -d` → hit `/visits`. Counter persisted? (DB: yes via volume. Redis: no volume → resets!)
2. `docker compose down -v` → data gone. Why? (`-v` deletes volumes)
3. `docker compose logs -f api` while you `docker compose stop db` → watch behaviour.
4. `docker compose stop api` → how long did it take? (Fast = SIGTERM handled. Remove `init`/exec form and compare.)
5. `docker exec -it $(docker compose ps -q api) sh` → run `whoami` (should be `node`, not root).
6. `docker images` → check size. Then `docker history <image>` to see layers.
7. **Break it on purpose:** change `DB_HOST` to `localhost` → read the error → fix. (Bug #1)
8. **Cache experiment:** edit `server.js`, rebuild → "npm install" step should say CACHED. Edit `package.json` → it reruns.
9. Scale: remove the `ports:` line, then `docker compose up -d --scale api=3` (needs a load balancer in front to be useful; that's Lab 4).

## Lab 2: Spring Boot
1. Generate a project at start.spring.io (Maven, Java 21, Web + Actuator + JPA + PostgreSQL).
2. Copy `lab2-springboot/Dockerfile` and `compose.yaml` into it.
3. `docker compose up -d --build`, then `curl localhost:8080/actuator/health`.
4. Compare sizes: build once with `eclipse-temurin:21-jdk` as final image vs the JRE version.
5. Watch startup time in `docker compose logs -f app` and explain why `start_period` is 45s.
6. Set memory limit to `128M` → watch it die → `docker inspect -f '{{.State.OOMKilled}}'` (Bug #11).

## Lab 3: Next.js
1. `npx create-next-app@latest web` → in `next.config.js` add `output: 'standalone'`.
2. Copy Dockerfile, `.dockerignore`, compose in. `docker compose up -d --build`.
3. Compare image size with a naive single-stage Dockerfile (`npm run build && npm start`).
4. **Experiment:** print `process.env.NEXT_PUBLIC_API_URL` on a page. Change it only in `docker run -e` → doesn't change. Rebuild with the ARG → changes. (Bug #22: explain it.)

## Lab 4: Microservices + gateway
```bash
cd labs/lab4-microservices
docker compose up -d --build
curl http://localhost:8080/users/1
curl http://localhost:8080/orders/1      # orders → users call over Docker DNS
curl http://localhost:3000/users/1       # FAILS: not published (that's the point)
```
**Experiments:**
1. `docker compose stop users` → `curl /orders/1` → 502 with a helpful error (what a *resilient* caller looks like). Start users again → recovers without restarting orders.
2. `docker compose exec orders wget -qO- http://users:3000/users/2` → DNS by service name.
3. `docker network ls` and `docker network inspect lab4-microservices_internal` → see who's connected.
4. Add a `ports:` to `users`, try direct access, then remove it. Say why a gateway-only exposure is safer.
5. Add a database per service (postgres for users, another for orders) on the `internal` network, and say why they don't share one.

---

## After the labs, you can honestly say you've:
- Multi-stage built Node, Spring Boot, and Next.js images
- Run app + DB + cache with Compose, healthcheck-gated startup, persistent volumes
- Run non-root, with graceful shutdown, log rotation, resource limits
- Built a gateway-fronted microservice setup with private networks
- Diagnosed OOM, networking, startup-order, and env-var issues

## Cleanup
```bash
docker compose down -v
docker system prune -f
```
