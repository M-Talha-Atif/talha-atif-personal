# 05. Interview Q&A: Say These Out Loud

## Fundamentals
**Q: What is Docker and why use it?**
Packages an app + dependencies into an image that runs identically anywhere. Fixes "works on my machine", speeds onboarding, makes deployment repeatable and environments disposable.

**Q: Image vs container?**
Image is a read-only template made of layers. Container is a running instance with a thin writable layer on top.

**Q: How is a container different from a VM?**
Shares host kernel, isolation via namespaces + cgroups; no guest OS, so it's MBs and starts in seconds.

**Q: What happens on `docker run`?**
Pull the image if missing → create container (writable layer, network, mounts) → start the process (PID 1) with the configured CMD/ENTRYPOINT.

**Q: What are layers and why do they matter?**
Each instruction = a cached, shareable layer. Good ordering gives fast builds; shared layers save disk and bandwidth.

**Q: CMD vs ENTRYPOINT?**
ENTRYPOINT = fixed executable; CMD = default args that can be overridden.

**Q: What is PID 1 in a container and why care?**
It's your main process; if it exits the container stops. It gets signals (SIGTERM) and must reap zombies → exec form, handle signals, or use `--init`.

## Dockerfile / images
**Q: How do you reduce image size?**
Multi-stage builds, slim/alpine/distroless base, only prod deps, `.dockerignore`, combine/clean in the same `RUN`, no build tools in the final stage.

**Q: Explain multi-stage builds.**
Several `FROM` stages; build in a fat stage and `COPY --from=build` only artifacts into a lean runtime stage. Less size, less attack surface.

**Q: How do you handle secrets?**
Never in image/ENV/git. Inject at runtime (env, orchestrator secrets, Vault/AWS SM), BuildKit secret mounts at build time. Rotate if leaked.

**Q: `COPY` vs `ADD`?** COPY; ADD has implicit extraction/URL fetching.

**Q: ARG vs ENV?** ARG = build-time only; ENV = persists into runtime.

## Networking / storage
**Q: How do containers talk to each other?**
Same user-defined network, by service name via embedded DNS. Only publish ports that must be reachable from outside.

**Q: Bridge vs host vs overlay?**
Bridge: private network on one host (default). Host: shares host's network stack (no isolation, no port mapping). Overlay: spans multiple hosts (Swarm/K8s).

**Q: Volume vs bind mount?**
Volume: Docker-managed, persistent, production. Bind mount: host path mapped in, for development.

**Q: How do you persist a database?** Named volume on the data dir + backups (`pg_dump`); volume ≠ backup.

## Compose / orchestration
**Q: What does `depends_on` do?** Start order only; use `condition: service_healthy` with a healthcheck for readiness, plus retries in code.

**Q: How do you scale a service in Compose?** `docker compose up --scale api=3` (no fixed `container_name`, no fixed host port) behind a load balancer/nginx.

**Q: Compose vs Swarm vs Kubernetes?**
Compose: single host definition. Swarm: simple native clustering. K8s: industry-standard orchestration with auto-scaling, self-healing, rolling updates.

## Production / security
**Q: How do you secure containers?**
Non-root user, minimal base, pinned versions, image scanning (Trivy/Scout), read-only FS, dropped capabilities, no docker.sock mount, resource limits, secrets outside the image.

**Q: How do you do zero-downtime deploys?**
Rolling update behind a load balancer using healthchecks: start new version → wait healthy → shift traffic → stop old. Rollback = redeploy previous tag.

**Q: How do you monitor and log?**
Log to stdout, ship with a log driver/agent (Loki, ELK, CloudWatch); metrics via Prometheus/cAdvisor; `docker stats` for quick checks; healthchecks.

**Q: A container keeps restarting; what do you do?** → See the debug flow at the bottom of `04-30-bugs-and-fixes.md`.

**Q: Why not use `latest`?** Mutable tag → non-reproducible builds and surprise upgrades. Pin version or digest; tag with git SHA.

## "Tell me about your experience" (template)
> "I containerized a Node/Express API with Postgres and Redis using a multi-stage Dockerfile, non-root user and a healthcheck, and ran the stack with Compose. I hit the classic issues: the app starting before Postgres was ready, which I fixed with healthcheck-gated `depends_on` plus retry logic, and environment-specific config, which I moved to env files and secrets so the same image runs everywhere. For a microservices setup I put an nginx gateway in front, kept services on a private network, and used a database per service."
