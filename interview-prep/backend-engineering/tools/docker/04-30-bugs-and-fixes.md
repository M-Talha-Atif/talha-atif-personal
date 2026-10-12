# 04. 30 Common Docker Bugs: Symptom → Cause → Fix

Format: **Symptom**, **Why it happens**, **Fix**. In an interview, tell them as stories: "I hit X, diagnosed with Y, fixed with Z."

---

## Networking

### 1. `ECONNREFUSED 127.0.0.1:5432` / `localhost` doesn't work between containers
- **Why:** `localhost` inside a container is the container itself.
- **Fix:** use the service name: `DB_HOST=db` (Compose) on a shared network. To reach the *host* machine: `host.docker.internal` (Win/Mac; on Linux add `extra_hosts: ["host.docker.internal:host-gateway"]`).

### 2. App runs in the container but browser can't reach it (`ERR_CONNECTION_REFUSED`)
- **Why:** app is bound to `127.0.0.1` inside the container, so only the container can hit it.
- **Fix:** listen on `0.0.0.0` (`app.listen(3000, '0.0.0.0')`; Next.js `HOSTNAME=0.0.0.0`; Spring `server.address=0.0.0.0`).

### 3. Forgot to publish the port
- **Why:** `EXPOSE` doesn't publish anything.
- **Fix:** `-p 3000:3000` or Compose `ports: ["3000:3000"]`. Check with `docker ps` (PORTS column).

### 4. `port is already allocated` / `bind: address already in use`
- **Why:** host port taken by another container or local process.
- **Fix:** change host side (`-p 3001:3000`), or find the culprit: `docker ps`, `netstat -ano | findstr :3000` (Windows) / `lsof -i :3000`.

### 5. Service A can't resolve service B by name (`getaddrinfo ENOTFOUND`)
- **Why:** they're on different networks, or you used the default bridge (no DNS), or you started them with separate `docker run`.
- **Fix:** put both on the same user-defined network (Compose does it automatically per project). Verify: `docker network inspect <net>`.

### 6. Frontend (Next.js/React) calls `http://api:3000` and fails in the browser
- **Why:** the browser runs on the user's machine, which knows nothing about Docker DNS. `api` only resolves inside the network.
- **Fix:** browser → public URL (`http://localhost:3000` or domain). Server-side code (SSR, API routes) → internal URL (`http://api:3000`). Keep two env vars.

---

## Startup and lifecycle

### 7. Container exits immediately (Exited (0) or (1))
- **Why:** a container lives only as long as PID 1. Foreground process ended or crashed.
- **Fix:** `docker logs <c>`; check exit code with `docker inspect -f '{{.State.ExitCode}}' <c>`. Make sure the main process runs in foreground (no `nginx` daemon mode, no `&`). To debug: `docker run -it --entrypoint sh image`.

### 8. App starts before DB is ready → crash (`connection refused` at boot)
- **Why:** `depends_on` only waits for the container to *start*, not to be *ready*.
- **Fix:** healthcheck on DB + `depends_on: db: condition: service_healthy`, **and** retry logic with backoff in the app (production has no Compose).

### 9. Container restarts in a loop (`Restarting (1)`)
- **Why:** app crashes on boot + `restart: always` hides it.
- **Fix:** `docker logs --tail 50 <c>`. Usually missing env var, bad DB URL, or port conflict. Fix root cause. Temporarily set `restart: "no"` to debug.

### 10. `docker stop` takes 10 seconds, app doesn't shut down gracefully
- **Why:** shell-form `CMD node app.js` wraps in `sh -c`; SIGTERM goes to sh, not node. After 10s Docker sends SIGKILL.
- **Fix:** exec form `CMD ["node","app.js"]`, handle `SIGTERM` in code, or `docker run --init` / `init: true` (tini) to reap zombies and forward signals. Don't use `npm start` as the entrypoint for the same reason.

### 11. Exit code 137
- **Why:** SIGKILL = 128+9. Usually **OOM killed** (memory limit hit) or force-killed after stop timeout.
- **Fix:** `docker inspect -f '{{.State.OOMKilled}}' <c>`. Raise memory limit, fix the leak, tune the heap (`-XX:MaxRAMPercentage`, `--max-old-space-size`).

### 12. `exec format error` / `exec /usr/local/bin/docker-entrypoint.sh: exec format error`
- **Why:** CPU architecture mismatch. Built on Apple Silicon (arm64), running on amd64 server (or vice versa). Also happens with Windows CRLF line endings in shell scripts.
- **Fix:** `docker buildx build --platform linux/amd64 ...` (or multi-arch). For scripts: convert to LF (`dos2unix`, `.gitattributes: *.sh text eol=lf`).

### 13. `standard_init_linux.go: exec: "./entrypoint.sh": permission denied` / `no such file`
- **Why:** script not executable, or has CRLF line endings (the `\r` makes the interpreter path `/bin/sh\r` which doesn't exist: confusing "no such file").
- **Fix:** `RUN chmod +x entrypoint.sh` (or `COPY --chmod=755`), convert to LF.

---

## Build problems

### 14. Every build reinstalls all dependencies (slow builds)
- **Why:** `COPY . .` before `npm install`, which invalidates cache on any file change.
- **Fix:** copy manifests first, install, then copy source. Use BuildKit cache mounts.

### 15. Huge image (1-2 GB)
- **Why:** full base image, dev deps, build tools, no multi-stage, no `.dockerignore`.
- **Fix:** multi-stage, alpine/slim/distroless, `npm ci --omit=dev`, `.dockerignore`. Inspect with `docker history` or `dive`.

### 16. Code changes don't show up after rebuild
- **Why:** cached layer, or container not recreated, or you edited a file outside the build context / ignored by `.dockerignore`.
- **Fix:** `docker compose up -d --build` (recreates), `--no-cache` to confirm it's cache, check `.dockerignore`.

### 17. `COPY failed: file not found in build context`
- **Why:** path is outside the context (`COPY ../shared .` is not allowed), or excluded by `.dockerignore`.
- **Fix:** run build from a parent dir (`docker build -f svc/Dockerfile .`), or set Compose `build: { context: ., dockerfile: svc/Dockerfile }` for monorepos.

### 18. Host `node_modules` overwrites the container's (native module errors like `bcrypt` / `Error loading shared library`)
- **Why:** `COPY . .` (or a bind mount) brings Windows/Mac binaries into a Linux container.
- **Fix:** `.dockerignore` with `node_modules`; in dev bind mounts add an anonymous volume: `- /app/node_modules`.

### 19. `npm ci` fails: "package-lock.json missing" / out of sync
- **Why:** lockfile not copied or not committed, or `package.json` changed without updating the lock.
- **Fix:** `COPY package*.json ./`; run `npm install` locally, commit the lockfile.

### 20. Alpine-specific failures (`bcrypt`, `sharp`, `node-gyp`, glibc errors)
- **Why:** Alpine uses musl libc, and native prebuilt binaries target glibc.
- **Fix:** switch to `node:20-slim` (Debian), or install build deps (`apk add python3 make g++`) in the build stage only.

### 21. Secrets leaked into the image
- **Why:** `COPY .env`, `ENV TOKEN=...`, or `ARG` used for secrets. All visible via `docker history`.
- **Fix:** runtime env/secret managers; BuildKit `--mount=type=secret`; rotate the leaked secret (deleting the layer is not enough; the image was already pushed).

### 22. `NEXT_PUBLIC_API_URL` is `undefined` or wrong in production Next.js
- **Why:** `NEXT_PUBLIC_*` is baked in at **build** time. Setting it at `docker run` is too late.
- **Fix:** pass as `ARG` → `ENV` in the build stage per environment, or load runtime config via a server endpoint.

---

## Data and volumes

### 23. Database data disappears after `docker compose down`/recreate
- **Why:** no volume; data lived in the container's writable layer.
- **Fix:** named volume `pgdata:/var/lib/postgresql/data`. And beware `docker compose down -v` deletes volumes.

### 24. Postgres init scripts / new password don't apply
- **Why:** `/docker-entrypoint-initdb.d` and `POSTGRES_PASSWORD` only run on **first init** (empty data dir). Existing volume = ignored.
- **Fix:** `docker compose down -v` (dev only!) to re-init, or migrate with SQL/migration tool.

### 25. `permission denied` writing to a mounted volume
- **Why:** container runs as non-root UID (e.g. 1000) but the host dir is owned by root or another UID.
- **Fix:** `chown` the dir to the container UID, set `user: "1000:1000"`, or use named volumes (Docker sets perms). Linux/SELinux: add `:z` to the mount.

### 26. File changes on host don't trigger hot reload in container (Windows/WSL)
- **Why:** filesystem events don't propagate across Windows → Docker VM, or the project is on the Windows drive instead of WSL2 fs.
- **Fix:** keep the repo inside WSL2 filesystem; or enable polling (`CHOKIDAR_USEPOLLING=true`, `WATCHPACK_POLLING=true` for Next).

---

## Compose and config

### 27. Env var is empty/undefined inside container
- **Why:** `.env` is used for *Compose variable substitution* (`${VAR}`), not automatically injected into containers. Or typo, or quoting issues in `.env`.
- **Fix:** use `env_file: .env` or `environment: - DB_HOST=${DB_HOST}`. Debug: `docker compose config` (shows resolved values) and `docker exec c env`.

### 28. YAML errors / "services.x must be a mapping" / tabs
- **Why:** YAML forbids tabs, indentation is meaningful.
- **Fix:** 2 spaces, `docker compose config` to validate.

### 29. Orphan/old containers & name conflicts (`container name "/api" is already in use`)
- **Why:** earlier container with same fixed `container_name` still exists.
- **Fix:** `docker rm -f api`; avoid `container_name` in Compose (it blocks scaling too), use `docker compose down --remove-orphans`.

---

## Host-level

### 30. `no space left on device`
- **Why:** accumulated images, stopped containers, build cache, unrotated logs.
- **Fix:** `docker system df` to see → `docker system prune -a` (add `--volumes` only if you're sure). Set log rotation. In CI, prune regularly.

### Bonus 31. `Cannot connect to the Docker daemon` / `permission denied /var/run/docker.sock`
- **Why:** daemon not running (Docker Desktop closed) or user not in `docker` group.
- **Fix:** start Docker Desktop / `sudo systemctl start docker`; `sudo usermod -aG docker $USER` then re-login.

### Bonus 32. DNS/pull fails behind VPN/corporate proxy (`TLS handshake timeout`, `i/o timeout`)
- **Fix:** configure proxy in Docker Desktop settings; set DNS (`"dns": ["8.8.8.8"]` in daemon.json).

### Bonus 33. Container is "unhealthy" but the app works fine (healthcheck uses `localhost`)
- **Why:** on Alpine/newer images `localhost` resolves to IPv6 `::1` first, while the app listens only on IPv4 (`0.0.0.0`). `wget localhost` fails → `unhealthy` → dependents never start (`dependency failed to start`).
- **Fix:** use `127.0.0.1` in the HEALTHCHECK, or make the app listen on `::`. Diagnose with `docker inspect --format '{{json .State.Health}}' <c>`; it shows the failing command output.

---

## 🔎 Your universal debugging flow (say this when asked "how do you debug?")
1. `docker ps -a`: is it running? exit code?
2. `docker logs --tail 100 <c>`: what did the app say?
3. `docker inspect <c>`: env, mounts, network, health, OOMKilled.
4. `docker exec -it <c> sh`: look inside; `curl`/`ping` the other service.
5. `docker compose config`: is the file resolving as I think?
6. Reproduce minimal: `docker run -it --entrypoint sh image`.
7. Check host: `docker system df`, ports, daemon health.
