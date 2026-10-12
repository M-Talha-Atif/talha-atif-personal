# 02. Production Practices (what separates juniors from "has shipped this")

## 1. Multi-stage builds: the #1 thing to mention
Build tools (compilers, devDependencies, Maven) are not needed to *run* the app. Build in one stage, copy only the result into a tiny final stage.

Typical results: Node 1.1 GB → ~150 MB. Spring Boot with JDK 700 MB → ~250 MB with JRE.

## 2. Pick a small, specific base image
- `node:20-alpine` (small, but musl libc: some native modules break → use `-slim` if so)
- `eclipse-temurin:21-jre` for Java runtime (JRE, not JDK)
- `distroless` / `gcr.io/distroless/nodejs20` (no shell, tiny attack surface)
- Pin versions: `node:20.11-alpine`, not `node:latest`

## 3. Run as non-root
If an attacker breaks out of your app, root in the container is dangerous.
```dockerfile
USER node          # node images ship this user
# or: RUN addgroup -S app && adduser -S app -G app && USER app
```

## 4. `.dockerignore` (always)
```
node_modules
.git
.env
*.log
Dockerfile
docker-compose*.yml
target
.next
```
Why: smaller build context (faster), no secrets leaking into layers, no host `node_modules` overwriting the container's.

## 5. Config & secrets
- **12-factor rule:** config from environment, one image for all environments.
- ❌ Never `COPY .env` or `ENV DB_PASSWORD=...` in the Dockerfile. It stays in image layers forever (`docker history` shows it).
- ✅ Runtime: `--env-file`, Compose `environment:`, or **secrets** (Docker/Swarm secrets, Kubernetes Secrets, AWS Secrets Manager, Vault).
- Build-time secrets: `RUN --mount=type=secret,id=npmrc ...` (BuildKit), which doesn't persist in layers.

## 6. Healthchecks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```
- "Running" ≠ "ready". A DB container is *running* seconds before it *accepts connections*.
- In Compose: `depends_on: db: condition: service_healthy`.
- Orchestrators use health to restart or stop routing traffic to sick containers.

## 7. Logging
- Log to **stdout/stderr**, not files. Docker collects them (`docker logs`), and log drivers ship them to ELK/Loki/CloudWatch.
- Set rotation or logs fill the disk:
```yaml
logging:
  driver: json-file
  options: { max-size: "10m", max-file: "3" }
```

## 8. Resource limits
Without limits, one leaky container can eat the whole host (and the OOM killer picks a victim).
```yaml
deploy:
  resources:
    limits: { cpus: "0.5", memory: 512M }
```
Java note: modern JVMs (10+) respect container limits; use `-XX:MaxRAMPercentage=75`.
Node note: set `--max-old-space-size` below the container limit.

## 9. Restart policies
`restart: unless-stopped` (or `on-failure`) so the app comes back after a crash or reboot. A crash loop means look at logs; the policy just hides it.

## 10. Image security checklist
- [ ] Non-root user
- [ ] Minimal base, pinned tag/digest
- [ ] No secrets in layers
- [ ] `docker scout cves myimage` or `trivy image myimage` in CI
- [ ] Read-only root filesystem (`read_only: true`) where possible
- [ ] Drop capabilities (`cap_drop: [ALL]`)
- [ ] Don't mount `/var/run/docker.sock` into containers (it's root on the host)

## 11. Build speed
- Order layers by change frequency
- BuildKit cache mounts: `RUN --mount=type=cache,target=/root/.npm npm ci`
- CI: `--cache-from` / `--cache-to` (registry or GitHub Actions cache)
- Multi-platform: `docker buildx build --platform linux/amd64,linux/arm64`. (Mac M1 builds arm64 by default, then the amd64 server says `exec format error`. See Bug #12.)

## 12. CI/CD flow (one paragraph you can say)
"On push: run tests → `docker build` with commit SHA tag → scan image → push to registry (ECR/GHCR) → deploy by updating the image tag on the server/ECS/Kubernetes → healthcheck gates the rollout, and rollback is just redeploying the previous tag."

## 13. Docker vs Kubernetes (they'll ask)
Docker/Compose = build & run containers (single host). Kubernetes = orchestrate many containers across many hosts: scaling, self-healing, rolling updates, service discovery, secrets. Compose is great for dev and small deployments; K8s when you need scale and HA.
