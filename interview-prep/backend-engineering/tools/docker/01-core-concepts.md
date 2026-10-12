# 01. Core Concepts (the easy version)

## 1. Image vs Container
- **Image** = a recipe + frozen snapshot (read-only). Like a class, or an installer.
- **Container** = a running instance of an image. Like an object, or an installed running app.
- One image → many containers.

## 2. Container vs VM
| | VM | Container |
|---|---|---|
| Has its own OS kernel | Yes | **No**, shares host kernel |
| Size | GBs | MBs |
| Startup | Minutes | Seconds / ms |
| Isolation | Stronger | Process-level (namespaces + cgroups) |

**How isolation works (say this):**
- **Namespaces** = what a process can *see* (its own PIDs, network, filesystem, hostname).
- **cgroups** = how much a process can *use* (CPU, memory limits).

## 3. Layers & cache (the key to fast builds)
Every Dockerfile instruction (`RUN`, `COPY`, `ADD`) creates a layer. Docker caches layers. **If a layer changes, every layer after it rebuilds.**

So order from *least* to *most* frequently changing:

```dockerfile
COPY package*.json ./     # changes rarely
RUN npm ci                # cached unless package.json changed
COPY . .                  # changes constantly
```

Copying all source *before* `npm install` = reinstalling dependencies on every code edit. Classic mistake.

## 4. Dockerfile instructions people mix up
| Pair | Difference |
|---|---|
| `CMD` vs `ENTRYPOINT` | ENTRYPOINT = the executable that always runs. CMD = default args, easily overridden. Together: `ENTRYPOINT ["node"]` + `CMD ["server.js"]` |
| `COPY` vs `ADD` | Use COPY. ADD also untars and fetches URLs (surprising magic) |
| `RUN` vs `CMD` | RUN executes at **build** time. CMD at **container start** |
| `ARG` vs `ENV` | ARG = build time only. ENV = also available at runtime |
| `EXPOSE` vs `-p` | EXPOSE is documentation only. `-p 3000:3000` actually publishes the port |
| Shell vs exec form | `CMD ["node","app.js"]` (exec, good: node is PID 1 and gets SIGTERM) vs `CMD node app.js` (shell, wraps in `sh -c`, signals may not arrive) |

## 5. Networking
- Default **bridge** network: containers reach each other by IP only.
- **User-defined bridge** (what Compose creates): containers reach each other **by service name** (built-in DNS). `http://users:3000`.
- `localhost` inside a container = *that container itself*, not your machine and not another container. (Bug #1 in the real world.)
- `-p HOST:CONTAINER` → `-p 8080:3000` means host 8080 → container 3000.
- Other drivers: `host` (shares host network, Linux only), `none`, `overlay` (multi-host, Swarm/K8s).

## 6. Storage
| Type | Use |
|---|---|
| **Volume** (`-v pgdata:/var/lib/postgresql/data`) | Persistent data (DBs). Managed by Docker. **Production choice.** |
| **Bind mount** (`-v ./src:/app/src`) | Dev: live-reload your code into the container |
| **tmpfs** | In-memory, secrets/scratch, gone on stop |

Container filesystem is **ephemeral**. Delete the container, lose its data, unless it's on a volume.

## 7. Compose in 30 seconds
One YAML file describing multiple services, networks, volumes.
```
docker compose up -d --build   # start
docker compose logs -f api     # follow logs
docker compose down            # stop + remove (add -v to also delete volumes ⚠️)
```

## 8. Commands you must know cold
```bash
docker build -t myapp:1.0 .
docker run -d --name api -p 3000:3000 --env-file .env myapp:1.0
docker ps -a                     # all containers
docker logs -f --tail 100 api
docker exec -it api sh           # shell into running container
docker inspect api               # full JSON config (IP, mounts, env)
docker stats                     # live CPU/mem
docker system df                 # disk usage
docker system prune -a --volumes # ⚠️ nuke unused stuff
docker compose config            # validate + show resolved compose file
docker history myapp:1.0         # layers and sizes
```

## 9. Lifecycle of a stopping container
`docker stop` sends **SIGTERM**, waits 10s, then **SIGKILL**. Your app should handle SIGTERM to shut down gracefully (finish requests, close DB). That's why PID 1 and exec form matter.

## 10. Registry & tags
Image name = `registry/repo:tag` e.g. `ghcr.io/me/api:1.4.2`.
- **Never rely on `:latest` in production**, since it's just a tag and not "newest". Pin versions or digests (`@sha256:...`).
