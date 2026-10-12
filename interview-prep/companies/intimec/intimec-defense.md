# Intimec: Engineering Defense Document

> Built from the real backend repository (`Intimec-Code-Backend`, read on 2026-10-09), not from memory.
> Goal: you can explain **what** was built, **why** each choice was made, **what it costs** (trade-offs), and **what you would fix next**, in plain English.

---

## 0. How to read this document

Every claim is tagged so you never defend something that is not true:

| Tag | Meaning |
|---|---|
| ✅ **CODE** | Verified in the repository. The file path is given. |
| 🔶 **INFERRED** | Not in the repo, but the evidence points to it. **Verify before you say it as fact.** |
| ❌ **GAP** | A weakness in the current system. Know it before an interviewer finds it. |
| 🗣 **YOUR STORY** | From your résumé/career notes. The repo here does not prove it either way. |

**Golden rule for interviews:** admit a gap first, then show you know the fix. Interviewers trust that more than a perfect-sounding answer.

### 0.1 Your 60-second pitch

> "Intimec is an Identity Governance platform: people request access, managers and owners approve, and the system provisions and audits it. It is **11 Spring Boot microservices** behind an API gateway. Synchronous lookups use **gRPC**, approvals and audit use **Kafka**, logs go to **OpenSearch**, and everything runs in **Docker Compose on Dokploy**. I owned the **Access Portal** (catalog, cart, requests, approvals) and the **Identity service's rule engine** that assigns roles and entitlements automatically from identity attributes. With a team of five shrinking to two, we deliberately chose a simple deployment (one host, one Postgres) over Kubernetes, and I can tell you exactly where that stops working and what I'd change first."

### 0.2 Honest corrections to your story (read this twice)

These are places where what you may say and what the code shows differ. Fix your wording **before** the interview.

| What you might say | What the code shows | Say this instead |
|---|---|---|
| "Dead-letter queues catch failures" | ✅ A real DLQ exists **only** for `identity-reconciliation-events` (`identity-service/.../KafkaConsumerConfig.java`). Core-service has comments saying DLQ "would be added". The **Access Portal consumer has none**, and it catches exceptions without acking, so its retry handler never runs. | "DLQ is implemented for identity reconciliation. For the Access Portal consumer I found the error handling swallows exceptions, and I know the fix: rethrow and publish to a `.DLT` topic." |
| "A database per service" | ✅ **One shared PostgreSQL database** (`intimec`) used by all services. Each service owns its own tables (~100 tables, no name collisions). | "Logical ownership per service, physical sharing of one Postgres for cost and operations. Here's how I'd split it." |
| "Chunk size 500 for bulk assignment" | ✅ `IDENTITY_CHUNK_SIZE = 500` is the **rule engine** identity page size. The **bulk role-assignment worker** inserts in batches of **5,000** (`BatchJobWorker.java`). | Name which chunk you mean. |
| "3 consumers for throughput" | ✅ Listener `concurrency = 3`. But topics like `role-events` are **auto-created** (default 1 partition) so 2 of the 3 threads can sit idle. Only identity-service declares 3-partition topics. | "Concurrency is 3; to actually use it, topics need ≥3 partitions. I'd declare topics explicitly." |
| "Service discovery" | ✅ There is **no discovery server**. Eureka is commented out. Services find each other through **Docker DNS names** (`dns:///identity-service:9096`). | "DNS-based discovery provided by Docker networking; a registry wasn't needed on one host." |
| "Observability / tracing" | ✅ Logs go to OpenSearch with a correlation ID. **No metrics stack and no distributed tracing** (no OpenTelemetry, Prometheus or Grafana). | "Centralized structured logging plus correlation IDs. Metrics and tracing are the next step." |
| "ABAC" | ✅ There is **RBAC** plus **conditional rules written in SpEL** that look at user attributes. It is "ABAC-lite", not a policy engine. | "RBAC with attribute conditions. I'd move to a safe expression engine or a policy engine for full ABAC." |
| "mTLS / secure service-to-service" | ✅ Internal gRPC is **plaintext** (`negotiation-type=plaintext`). Services trust gateway headers. | "Internal traffic relies on the private Docker network. mTLS is on the hardening list." |

---

## 1. The system at a glance

**What Intimec does (in one paragraph):** Companies need to control who can access which applications and roles. Intimec lets employees browse an **access catalog (tiles)**, put items in a **cart**, submit an **access request**, and track **approvals**. Compliance teams define **rules** that grant roles/entitlements automatically. Admins run **bulk role operations**. Everything is **audited**.

**Numbers (✅ CODE):**

| Fact | Value |
|---|---|
| Microservices | 11 (api-gateway, auth, identity, access-portal, application-permissions, workflows, core, configuration, connector-runtime, task-management, llm) |
| Java source files in services | ≈ 1,600 |
| Shared libraries | 9 (`common-protos`, `iam-dtos`, `iam-events`, `auditlog-dto`, `unified-logging`, `encryption-service`, `dal-core`, `dgraph-client`, `connector-framework`) |
| Database tables | ≈ 100 in one PostgreSQL database (identity-service owns 42) |
| Tech base | Spring Boot 3.5.5, Java 17 target / Java 21 runtime, Maven multi-module |
| Infrastructure | PostgreSQL (on the host), Kafka (KRaft, 1 broker), OpenSearch (1 node), Dgraph (zero + alpha) |
| Deployment | Docker Compose images on **Dokploy** (external `dokploy-network`, Traefik labels) |

**Team context (🗣 YOUR STORY):** started at 5 people (you, 3 juniors, 1 more), dropped to 3, then **2 people covering frontend, backend and deployments**. Every choice below must be read through that lens: *the team that runs it is tiny, so operational simplicity beats theoretical purity.*

```text diagram:architecture
Browser/UI
   |  HTTPS (TLS ends at Dokploy's Traefik, inferred)
   v
[ Traefik ]  -->  [ API Gateway :8081 ]  (JWT check, permission check, session activity)
                       |  HTTP (REST) with X-User-Id / X-Tenant-Id headers
   +-------+-----------+-----------+-----------+----------+
   v       v           v           v           v          v
 auth   identity   access-portal  app-perms  workflows   core / config / task / connector / llm
   \______ gRPC (plaintext) between services ______/
   \______ Kafka events (role-events, access-request-events, audit-log ...) ______/
        |            |             |            |
   PostgreSQL     Kafka        OpenSearch     Dgraph
   (ONE shared DB) (1 broker)  (logs/audit)   (graph projection)
```

---

## 2. Service catalog

| Service | Ports (HTTP / gRPC) | Responsibility (one line) | Owns | Talks to |
|---|---|---|---|---|
| **api-gateway** | 8081 | Single entry. Validates JWT, copies user/tenant into headers, checks endpoint permission via gRPC, updates session activity, routes to services. | no DB tables | auth (gRPC), app-permissions (gRPC), all services (HTTP) |
| **auth-service** | 8090 / 8002 | Login (password, LDAP, SAML, OAuth2), JWT + refresh tokens, sessions, password policy, account lockout, SSO config, user ↔ identity lookups. | 11 tables (users, sessions, refresh tokens, policies…) | identity (gRPC), configuration (gRPC), Kafka |
| **identity-service** | 8094 / 9096 | The **identity domain**: identities (employee, non-employee, non-human), **access roles** (with composition + closure), **entitlements**, **assignment rule engine**, organizations, shadow accounts, role import jobs. | 42 tables | Kafka, Dgraph, OpenSearch, auth (gRPC) |
| **access-portal-service** | 8099 | The **self-service request** domain: tiles (catalog), cart, access requests, approval steps, provisioning status, analytics. **You own this.** | 12 tables | identity + auth (gRPC), permissions (REST), Kafka |
| **application-permissions-service** | 8095 / 8001 | **Application RBAC**: modules → pages → actions → permissions → roles → user roles; dynamic rules; bulk role assignment; permission checks for the gateway. | 12 tables | identity/auth (gRPC), Kafka, Postgres NOTIFY |
| **workflows-service** | 8098 | **Approval workflow engine**: workflow definitions, templates, executions, approvals, delegation, simulation, analytics, WebSocket updates. | 9 tables | identity/auth/permissions/core (gRPC), Kafka |
| **core-service** | 8091 / 9095 | Platform services: applications onboarding, **audit log storage/query**, **log management** (OpenSearch), notifications (SSE + email), "responsibilities" aggregation. | 9 tables | OpenSearch, Kafka, gRPC to others |
| **configuration-service** | 8092 / 9091 | Tenant configuration: UI theme/branding artifacts, SSO config, key/value config with encryption. | 2 tables | Kafka |
| **connector-runtime-service** | 8093 / 9094 | Loads **connector JARs** and runs them: test connection, discover schema, search/create/update/delete objects in target apps (streamed over gRPC). | files | gRPC clients |
| **task-management-service** | 8096 | Scheduled/ad-hoc **tasks** (Quartz), run history and logs, task preview. | Quartz + 1 table | core, identity, connector, auth (gRPC) |
| **llm-service** | 8097 | Provider-agnostic LLM client, API key handling, call logging. | 2 tables | external LLM APIs |

### 2.1 Your four services in more detail

**Access Portal** (✅ `services/access-portal-service`)
- **Tile** = a catalog entry that defines *what can be requested and under what rules*: allowed item types (applications, business roles, internal roles, entitlements), `requireManagerApproval`, linked `workflowId`, `maximumRiskLevel`, `allowRequestForOthers`, visibility filters, access scope.
- **Cart** (`CartItem`) = items a user selected, each tied to a tile; supports **self** and **for others** (beneficiaries).
- **AccessRequest** = the submitted order. Children: `AccessRequestItem`, `RequestApprovalStep`, `RequestProvisioning`, `RequestAuditLog`, `RequestComment`. Statuses: `DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED/REJECTED → PROVISIONED` (plus `WITHDRAWN`, `CANCELLED`, `PARTIALLY_*`).
- **Events out:** `role-events` (start the approval workflow) and `audit-log`. **Events in:** `access-request-events` from workflows (`approval.created`, `approval.responded`, `workflow.completed`, `provisioning.started`, `role.assigned`, `role.assignment.failed`).
- **Audit** is done with **AOP aspects** (`AccessRequestAuditAspect`, `TileAuditAspect`) plus DB audit rows.

**Identity service rule engine** (✅ `identity-service/.../entitlement_management` and `.../access_roles_management`): see section 8.

**Application Permissions** (✅): the RBAC data model and the **permission check** the gateway calls on every request: see section 9.

**Auth service** (✅): hybrid JWT + server-side session: see section 9.

---

## 3. Architecture in depth

### 3.1 How services talk

| Style | Used for | Technology | Why |
|---|---|---|---|
| **Sync, external** | UI → backend | REST over HTTP through the gateway | Browsers speak REST. |
| **Sync, internal (fast lookups)** | "Who is this user's manager?", "does this user have permission?", "give me the identity" | **gRPC + Protobuf** (contracts in `shared/common-protos`) | Binary, typed, fast. Login cannot wait for async. 🗣 you measured ~50% lower latency vs REST. |
| **Sync, internal (older)** | Roles/profile/permissions lookups from Access Portal | **REST** (`UserRoleRestClient`, `BusinessRoleRestClient`, `UserProfileRestClient`) | Migration was **partial** (strangler style): hot paths moved first. |
| **Async** | Approvals, audit, notifications, bulk jobs, identity lifecycle | **Kafka** | Must never lose an event; the consumer may be down or slow. |
| **DB notification** | "User changed → re-run dynamic rules" | **Postgres `LISTEN/NOTIFY`** (trigger on `users`) | Cheap change-detection without Debezium. Only possible because of the shared DB. |

### 3.2 Service discovery ✅
- **There is no Eureka/Consul/Kubernetes.** The Eureka dependency in `api-gateway/src/pom.xml` is commented out.
- Discovery = **Docker DNS** on the shared `dokploy-network`: URLs like `http://identity-service:8094` and `dns:///identity-service:9096`. Environment variables hold the addresses.
- **Why that is fine now:** one host, fixed set of services, restart policy `unless-stopped`. **Trade-off:** no health-aware client-side load balancing, no automatic registration of replicas, so scaling out needs a load balancer/DNS round-robin.

### 3.3 Configuration ✅
- Per-service `application-{dev,prod}.properties` with `${ENV_VAR:default}` placeholders, overridden by `environment:` in compose.
- Spring Cloud Config is **present in dependencies but disabled** (`spring.cloud.config.enabled=false`). `configuration-service` is a **business** config service (tenant UI/SSO settings), **not** a config server.

### 3.4 Observability ✅/❌
| Pillar | What exists | Gap |
|---|---|---|
| **Logs** | `unified-logging` library: structured JSON via a custom HTTP appender → **OpenSearch** (`*-logs` index template, `main-logs`). Core-service exposes log search/filter/pin APIs. | Unbounded volume: permission check logs several INFO lines **per step** in the hot path. |
| **Correlation** | `CorrelationIdFilter` (gateway) + interceptor; ID flows through headers and MDC. | Not a real trace (no spans/timings). |
| **Health** | Actuator `/actuator/health` + Docker healthchecks on most services. | Some services (e.g. identity, access-portal, connector) have no compose healthcheck. |
| **Metrics** | Only Actuator `metrics` endpoint. | No Prometheus/Grafana, no alerts. |
| **Tracing** | None. | Add OpenTelemetry (Java agent) → Tempo/Jaeger. |

### 3.5 Resilience engineering ✅/❌
- **Resilience4j is only in `workflows-service`** (profile `resilience`): circuit breaker (50% failure, 30 s open), retry with exponential backoff (3 attempts), time limiter (3–10 s), bulkhead (20–25 concurrent). Scoped to identity, notification and external API calls.
- **Other services:** gRPC **deadlines** (2 s health probes, 5 s lookups, 30 s manager lookup) and Kafka producer `acks=all`, retries=3, idempotence on. **No circuit breakers** elsewhere.
- **Gateway behavior on permission-service failure:** `checkEndpointExists` fails → returns `false` (**"not managed"** → request allowed). `checkPermission` fails → denied. See gap G-03.
- **Scheduler safety:** rule cron poller uses `FOR UPDATE SKIP LOCKED` so two instances never evaluate the same rule.

### 3.6 Orchestration, not choreography
The approval flow is **orchestrated by `workflows-service`**: Access Portal says "start approval for this request" (event), workflows decides steps (manager, role owner…), talks to identity/auth, and **reports progress back** as events. That gives one place to see and change approval logic, at the cost of a central, busy service. (Choreography would have each service react to others' events with no brain in the middle, which is harder to reason about for compliance flows.)

---

## 4. Tool choices: what, why, competitors, trade-offs

> Format: **What it is → Why here → Competitors → Trade-off.** "Your decision" = documented in your notes; "inherited" = existed before you, so say "the team chose… and here's why it holds".

| Tool | Why it fits Intimec | Competitors | Trade-off / when it stops fitting |
|---|---|---|---|
| **Java + Spring Boot 3.5** (inherited) | Mature security, JPA, Kafka, gRPC starters; hiring pool; compliance-grade ecosystem for IAM. | Node/NestJS, Go, .NET, Quarkus/Micronaut | Heavy memory (JVM ~512–768 MB/service), slow start. Fine for 11 services on one big host; costly at 50. |
| **Maven multi-module + shared libs** | One repo, one build, shared protobuf/DTO/logging with consistent versions via a BOM-style root POM. | Gradle, polyrepo + artifact registry | Shared libs couple release cycles: change `common-protos` → rebuild all. A "distributed monolith" smell. |
| **Spring Cloud Gateway** (WebFlux) | One entry point for auth/permission/CORS/routing; non-blocking; filters in Java next to the rest of the code. | Nginx/Traefik only, Kong, Envoy, AWS API Gateway | You wrote security logic in a custom filter (more to maintain/test). Blocking gRPC calls run on `boundedElastic` threads. |
| **gRPC + Protobuf** (your decision) | Sync lookups on the login/permission path: smaller payloads, strict typed contracts, HTTP/2. 🗣 ~50% lower latency than REST+JSON. | REST/JSON, GraphQL, Thrift | Harder to debug (binary), needs proto discipline (see §13), browser can't call it. **Plaintext today**. |
| **Kafka (KRaft, 1 broker)** (your decision for approvals) | Approvals/audit are **reliability-sensitive, not latency-sensitive**: durable log, replay, decoupling when a consumer is down. | RabbitMQ, SQS/SNS, Redis Streams, NATS | Operationally heavy for a 2-person team; single broker = **no HA**, replication factor 1. Great for replay/audit, overkill if volume stays tiny. |
| **PostgreSQL** (shared) | ACID for requests/approvals, JSONB for rule conditions & evidence, `FOR UPDATE SKIP LOCKED`, `LISTEN/NOTIFY`. | MySQL, MongoDB, CockroachDB | One instance = single point of failure and shared connection limit (see §10). |
| **Hibernate/JPA + Criteria API** | Rule engine builds **parameterized** predicates, so no string SQL injection. `hypersistence-utils` for JSONB. | jOOQ, MyBatis, JDBC | N+1 queries are easy to write (see permission check). `ddl-auto=update` is risky (see §13). |
| **OpenSearch** (your migration) | Full-text + analytics over logs/audit (5M+ docs, 100K+ logs per cycle); alias-based reindexing. | Elasticsearch (licence), Loki, ClickHouse, Postgres FTS | **Security plugin is disabled** in compose and it's single node, replicas 0. Heavy RAM. |
| **Dgraph** | A **graph projection** of roles/entitlements (`syncRoleToGraph`, `syncEntitlementToGraph`) for relationship queries. Postgres stays the source of truth. | Neo4j, Postgres recursive CTEs, ArangoDB | Another datastore to run and keep in sync. Thin usage today: ask yourself if recursive SQL would do. |
| **Caffeine cache** (permissions) | Permission results cached 5 min (10K entries) so most checks skip the DB. | Redis, Hazelcast, no cache | **Per-instance** cache: with 2 replicas, revocation propagates unevenly (up to 5 min). |
| **Resilience4j** (workflows) | Circuit breaker/retry/bulkhead without a service mesh. | Istio/Linkerd, Hystrix (dead), Failsafe | Only applied in one service. Needs tuning per dependency. |
| **Quartz** (task-management) vs **DB poller** (identity) | Quartz for general scheduled tasks; the rule engine uses a simple **poller with `SKIP LOCKED`** (60 s) which is multi-instance safe with zero extra tables. | ShedLock, Spring `@Scheduled`, Temporal, Airflow | Two scheduling styles to understand. Poller adds ≤60 s latency; fine for governance. |
| **MapStruct + Lombok** | Compile-time mappers, less boilerplate; fast. | ModelMapper, manual | Annotation-processing build complexity. |
| **JJWT (HS256)** | Simple signed tokens; gateway validates locally. | Spring Authorization Server, Keycloak, Auth0/Okta | **Shared symmetric secret** in gateway and auth. See G-05/G-06. |
| **Log4j2 + custom OpenSearch appender** | One logging format everywhere through a starter. | ELK with Filebeat, Loki + Promtail, OTel logs | App → OpenSearch over HTTP couples app health to log pipeline; no buffering guarantees. |
| **Docker + Compose** | Reproducible runs; same compose in dev and prod. | Kubernetes, Nomad, plain systemd | Single host, no self-healing beyond `restart`, no rolling deploys. See §11–12. |
| **Dokploy (+Traefik)** (inherited) | Self-hosted PaaS: deploy compose stacks from a UI, built-in reverse proxy and (inferred) automatic TLS, **no Kubernetes expertise needed**. | Coolify, CapRover, Portainer, Render/Fly/Railway, ECS, K8s | Tied to one host. Less control than K8s; secrets and domains live in the Dokploy UI, not in the repo. |
| **SpEL for permission conditions** | Quick, flexible conditions on user attributes. | JSON-Logic, CEL, OPA/Rego, Cedar | ❌ **Dangerous with `StandardEvaluationContext`** (G-07). |
| **Springdoc OpenAPI** | Auto API docs/Swagger. | Manual OpenAPI, Redoc | Public docs endpoints must not be exposed in prod. |

---

## 5. Microservices concepts: present or not?

| Concept | Present? | How it shows up here | Next step |
|---|---|---|---|
| API Gateway | ✅ | Spring Cloud Gateway | Move cross-cutting rate limiting here |
| Service discovery | 🔶 DNS only | Docker DNS names | Fine until you scale replicas |
| Centralized config | ❌ | Env vars per service | Dokploy env groups / Vault |
| Event-driven | ✅ | Kafka topics (see §6) | Add outbox, DLQ everywhere |
| Orchestrated saga | ✅ | workflows-service | Add compensation/timeouts explicitly |
| Choreography | partly | audit + notifications | OK |
| Database per service | ❌ (logical only) | One Postgres, tables owned per service | Schema-per-service first |
| Circuit breaker/retry | partly | Workflows only | Gateway + portal clients |
| Idempotent consumers | partly | Provisioning duplicate check in portal consumer | Generic processed-events table |
| Distributed tracing | ❌ | Correlation ID only | OpenTelemetry |
| Centralized logging | ✅ | OpenSearch | Add retention + sampling |
| Health checks | ✅/partial | Actuator + compose | Add readiness gating |
| Multi-tenancy | ✅ | `tenantId` on entities, header propagation | Enforce at DB (RLS) |
| Contract-first APIs | ✅ (gRPC) | `common-protos` | Add `buf` breaking-change CI |
| Zero-trust service auth | ❌ | Header trust | mTLS + signed service tokens |

---

## 6. Event-driven architecture (how it really works)

### 6.1 Topics ✅
| Topic | Produced by | Consumed by | Purpose |
|---|---|---|---|
| `role-events` | access-portal, app-permissions | **workflows** | "A role was requested/assigned: start the workflow." |
| `access-request-events` | workflows | **access-portal** | Approval/provisioning progress for a request |
| `identity-events`, `access-events`, `application-events`, `certification-events`, `policy-events` | various | workflows | Trigger workflows from domain events |
| `audit-log` | **every** service | **core-service** (stores/indexes) | Central audit trail |
| `user-notifications` / `workflow-notifications` | workflows, perms, auth | core-service | Email + in-app notifications (SSE) |
| `identity-lifecycle-events` (3 partitions) | identity | **auth** | Keep auth users in sync with identities |
| `identity-reconciliation-events` (+ `-dlq`) | identity | identity | Reconciliation, **has DLQ** |
| `identity-relationship-events` | core/identity | identity | Relationship updates |
| `role-assignment-jobs` | app-permissions | `BatchJobWorker` (concurrency 3) | Bulk role assignment M×N |
| `role-import-events` (3 partitions) | identity | identity | Role import jobs |
| `aggregation-completed-events` | connector/core | core | Aggregation finished |

### 6.2 The approval pipeline (Access Portal) ✅

```text diagram:accessflow
 User submits cart
        |
 AccessRequestServiceImpl.submitRequest()   @Transactional
   1 validate cart  2 save AccessRequest + items  3 write audit row
   4 publishWorkflowEventsPerItem()  --kafka send-->  topic role-events
        |                                                   |
   DB commit (maybe)                                  workflows-service
        |                                           (approval steps: manager, role owner)
        |                                                   |
        |  <-- access-request-events: approval.created / approval.responded /
        |                            workflow.completed / role.assigned / role.assignment.failed
 AccessRequestEventConsumer  -> update approval steps, status, provisioning rows, audit
```

### 6.3 Delivery guarantees (what you can honestly claim) ✅
- **Producer:** `acks=all`, `retries=3`, `enable.idempotence=true` → no duplicates **from producer retries** and no loss once the broker acknowledges.
- **But:** `kafkaTemplate.send(...)` is **fire-and-forget** (no `.get()`, no callback) and happens **inside** the DB transaction → the **dual-write problem** (see §7).
- **Consumer:** manual ack, concurrency 3, `FixedBackOff(1s × 3)`. In `AccessRequestEventConsumer` the `try/catch` **swallows** exceptions, so the retry handler never fires and failed events are skipped without a DLQ ❌.
- **Ordering:** key = `accessRequestId` (cart event) or `accessRequestId_roleId` (single role) → ordered **per request** only if the topic has partitions; with 1 partition ordering is global but parallelism is 1.
- **Semantics:** **at-least-once** end to end. Do **not** say exactly-once.
- **Security smell:** the event payload **contains the user's JWT** (`payload.put("jwtToken", …)` in `AccessRequestEventPublisher.extractRequestContext`). Kafka is plaintext and retains messages, so tokens would sit in the log ❌.

---

## 7. Outbox pattern for the Access Portal

### 7.1 The problem in your own code
`AccessRequestServiceImpl` is annotated `@Transactional` at class level. In `submitRequest()` the order is:

1. `requestRepository.save(request)` (inside the transaction, not yet committed)
2. `createAuditLog(...)`
3. `publishWorkflowEventsPerItem(...)` → `kafkaTemplate.send(...)` **immediately**
4. method returns → transaction **commits**

Failure windows:

| What fails | Result |
|---|---|
| Kafka send succeeds, then DB commit fails | **Ghost event**: workflow starts for a request that does not exist. |
| DB commit succeeds, Kafka send fails/times out (async, unchecked) | **Lost event**: request stuck in `SUBMITTED` forever, nobody approves. |
| App crashes between the two | Either of the above. |

You cannot solve this with "try harder". Two different systems (Postgres + Kafka) cannot share one transaction. The **outbox** makes the event part of the **same DB transaction** as the data; a separate relay delivers it later.

```text diagram:outbox
 BEFORE (dual write)                         AFTER (outbox)
 +-----------------+                         +-----------------+
 | submitRequest() |                         | submitRequest() |   ONE DB transaction
 |  save request   |                         |  save request   |
 |  Kafka.send  X--|--> may be lost/ghost    |  save outbox row|----> commits together
 +-----------------+                         +-----------------+
                                                      |
                                             OutboxRelay (every 1s)
                                               SELECT ... FOR UPDATE SKIP LOCKED
                                               kafka.send().get()  -> mark SENT
                                                      |
                                                    Kafka  -> workflows (dedupes by eventId)
```

### 7.2 Classes to add (package `com.aidentx.access_portal_service.outbox`)

| Class | Responsibility | Why it exists |
|---|---|---|
| `OutboxEvent` (JPA entity) | One row per event: `id`, `aggregateType`, `aggregateId`, `topic`, `messageKey`, `payload` (JSONB), `headers` (JSONB), `tenantId`, `status` (`PENDING/SENT/DEAD`), `attempts`, `nextAttemptAt`, `lastError`, `createdAt`, `sentAt`. | The durable "to-do list" of events. |
| `OutboxStatus` (enum) | `PENDING`, `SENT`, `DEAD` | Clear states. |
| `OutboxEventRepository` | Native query: pick due rows with `FOR UPDATE SKIP LOCKED LIMIT n`; delete old `SENT`. | Safe with many instances; same trick as `CronSchedulerPoller` in identity. |
| `OutboxWriter` | `append(topic, key, payload, aggregate…)` annotated `@Transactional(propagation = MANDATORY)` | **MANDATORY** forces callers to be inside the business transaction. It fails fast if someone calls it outside. |
| `OutboxRelay` | `@Scheduled(fixedDelay = 1000)` loop: claim → send → mark. Exponential backoff, `DEAD` after N attempts. | The only component that talks to Kafka. |
| `OutboxProperties` | batch size, poll interval, max attempts, retention | Tunable without code changes. |
| `OutboxCleanupJob` | Deletes `SENT` rows older than N days. | Table would grow forever. |
| `ProcessedEvent` + `IdempotentConsumerGuard` | Table with unique `eventId`; consumers insert-then-process. | Outbox gives **at-least-once**, so consumers must tolerate duplicates. |
| (edit) `AccessRequestEventPublisher` | Keep payload building; replace `kafkaTemplate.send` with `outboxWriter.append`. | Smallest possible code change; call sites at `AccessRequestServiceImpl` lines ~958 and ~1083 stay the same. |
| (edit) `AccessPortalAuditPublisher` | Same change for `audit-log` events. | Audit has the same dual-write risk. |
| (edit) `AccessRequestEventConsumer` | **Rethrow** exceptions; add `DeadLetterPublishingRecoverer` → `access-request-events.DLT`. | Today errors are swallowed. |

### 7.3 Table

```sql
CREATE TABLE access_portal_outbox (
  id              UUID PRIMARY KEY,
  aggregate_type  VARCHAR(64)  NOT NULL,          -- 'ACCESS_REQUEST'
  aggregate_id    VARCHAR(64)  NOT NULL,
  topic           VARCHAR(128) NOT NULL,
  message_key     VARCHAR(128) NOT NULL,
  payload         JSONB        NOT NULL,
  headers         JSONB,
  tenant_id       VARCHAR(64)  NOT NULL,
  status          VARCHAR(16)  NOT NULL DEFAULT 'PENDING',
  attempts        INT          NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_error      TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ
);
CREATE INDEX ix_outbox_due ON access_portal_outbox (status, next_attempt_at, created_at)
  WHERE status = 'PENDING';                       -- small, fast partial index
```

### 7.4 Code skeleton

```java
// 1) Written INSIDE the business transaction
@Service
public class OutboxWriter {
    private final OutboxEventRepository repo;
    private final ObjectMapper mapper;

    @Transactional(propagation = Propagation.MANDATORY)
    public void append(String topic, String key, String aggregateType, String aggregateId,
                       String tenantId, Object payload) {
        OutboxEvent e = new OutboxEvent();
        e.setId(UUID.randomUUID());
        e.setTopic(topic);
        e.setMessageKey(key);
        e.setAggregateType(aggregateType);
        e.setAggregateId(aggregateId);
        e.setTenantId(tenantId);
        e.setPayload(mapper.valueToTree(payload));      // JSONB
        repo.save(e);                                   // same tx as requestRepository.save(...)
    }
}

// 2) AccessRequestEventPublisher: ONLY this line changes
//    kafkaTemplate.send(ROLE_EVENTS_TOPIC, partitionKey, event);
outboxWriter.append(ROLE_EVENTS_TOPIC, partitionKey, "ACCESS_REQUEST",
                    accessRequestId.toString(), tenantId, event);
```

```java
// 3) The relay: the only code that talks to Kafka
@Component
public class OutboxRelay {
    @Scheduled(fixedDelayString = "${outbox.poll-ms:1000}")
    @Transactional
    public void drain() {
        List<OutboxEvent> batch = repo.lockDue(props.getBatchSize());   // FOR UPDATE SKIP LOCKED
        for (OutboxEvent e : batch) {
            try {
                kafka.send(e.getTopic(), e.getMessageKey(), e.getPayload().toString())
                     .get(5, TimeUnit.SECONDS);            // wait for the broker ack (acks=all)
                e.setStatus(SENT);
                e.setSentAt(Instant.now());
            } catch (Exception ex) {
                int n = e.getAttempts() + 1;
                e.setAttempts(n);
                e.setLastError(ex.getMessage());
                e.setNextAttemptAt(Instant.now().plusSeconds(Math.min(300, (long) Math.pow(2, n))));
                if (n >= props.getMaxAttempts()) e.setStatus(DEAD);    // alert on DEAD rows
            }
        }
    }
}
```

```java
// Repository: pick due rows, skip rows another instance holds
@Query(value = """
   SELECT * FROM access_portal_outbox
   WHERE status = 'PENDING' AND next_attempt_at <= now()
   ORDER BY created_at
   LIMIT :limit
   FOR UPDATE SKIP LOCKED
   """, nativeQuery = true)
List<OutboxEvent> lockDue(@Param("limit") int limit);
```

### 7.5 How it works, step by step
1. User submits → `submitRequest()` saves `AccessRequest`, audit row and **outbox rows** in **one transaction**. If anything fails, **nothing** is saved (no ghost, no loss).
2. After commit, `OutboxRelay` (every second) locks a few `PENDING` rows, sends them to Kafka, waits for the ack, marks them `SENT`.
3. If Kafka is down: rows stay `PENDING`, retry with backoff. The user's request is already safely saved.
4. `workflows-service` receives the event (**possibly twice**), checks `eventId` in its processed-events table, and runs the workflow once.

### 7.6 Trade-offs (say these before they ask)
| Pro | Con |
|---|---|
| No lost or ghost events. No new infrastructure (uses your Postgres). Easy for a 2-person team. | Adds up to the poll interval (≈1 s) of latency. Fine for approvals. |
| Multi-instance safe via `SKIP LOCKED`. | **At-least-once**: duplicates happen → consumers **must** be idempotent. |
| Easy to inspect and replay (it's a table). | Table growth → cleanup job + index. |
| | Ordering: parallel relays can reorder events of the *same* key. Fix: claim by `aggregate_id` or run one relay; Kafka key keeps per-request order on a single partition. |
| | Polling load on the DB (tiny with the partial index). |

**Alternatives to mention:** (1) **Debezium CDC** reads the Postgres WAL and publishes outbox rows: no polling, lower latency, but needs Kafka Connect + logical replication = more ops (good later). (2) **`@TransactionalEventListener(AFTER_COMMIT)`** (what the identity rule engine uses for post-commit evaluation) is simpler but **not durable**: a crash right after commit loses the event. (3) **Spring Modulith event publication registry**: similar idea, built-in. (4) **Do nothing + reconciliation job**: scans requests stuck in `SUBMITTED`; useful as a safety net **in addition**.

### 7.7 Rollout plan (zero downtime)
1. Add the table + classes behind a flag `outbox.enabled=false`.
2. Deploy; turn on **dual path** in staging: write outbox rows **and** still send directly; compare counts.
3. Switch the flag: publisher writes to the outbox only. Keep the direct path deleted.
4. Add consumer-side idempotency in workflows before enabling (or duplicates will start approvals twice).
5. Monitor: count of `PENDING` older than 1 min, `DEAD` rows, relay lag. Alert.

**Test it:** integration test that kills Kafka mid-submit and asserts the event is delivered after Kafka returns; test that a rollback leaves **zero** outbox rows.

---

## 8. Identity service rule engine (entitlements and roles)

### 8.1 What it does (plain English)
A compliance officer writes a rule like *"Everyone in **Finance** whose title **contains Manager**, and who is **not** a contractor, gets the **ERP-Approver** entitlement."* The engine finds all matching identities, **grants** what's missing, **revokes** what no longer matches, and records **why** each decision was made. It runs when a rule is created/updated, on a schedule, or manually.

There are **two rule families that share the same condition format and the same field registry**:
- **Entitlement assignment rules** (`entitlement_management`): set-based evaluation **in the database**.
- **Access-role assignment rules** (`access_roles_management`): same JSON format, evaluated in the database for runs and **in memory** for previews/single-identity checks, plus a **UI expression parser** (`user.department == "Finance" && …`) that converts friendly text into the JSON format.

### 8.2 The rule format ✅
```json
[
  { "groupOperator": "AND", "interGroupOperator": "OR", "negated": false,
    "conditions": [ {"field":"department","operator":"EQUALS","value":"Finance"},
                    {"field":"jobTitle","operator":"CONTAINS","value":"Manager"} ] },
  { "groupOperator": "OR", "negated": true,
    "conditions": [ {"field":"employmentType","operator":"IN","values":["CONTRACTOR","INTERN"]} ],
    "conditionGroups": [ /* nested groups, depth ≤ 5 */ ] }
]
```
- Operators: `EQUALS, NOT_EQUALS, CONTAINS, STARTS_WITH, ENDS_WITH, IN, NOT_IN` (case-insensitive).
- Limits (constants): **≤ 10 groups**, **≤ 10 conditions per group**, **depth ≤ 5**.
- **`groupOperator`** joins conditions *inside* a group. **`interGroupOperator`** joins this group to the **next** group. Groups chain **left to right**.

### 8.3 The algorithm ✅ (`RuleEvaluationEngine` → `RuleEvaluationTransactionHelper`)

```text diagram:ruleengine
 Trigger: create/update (after commit) | cron poller (60s, SKIP LOCKED) | manual | evaluate-all
        |
 RuleEvaluationEngine.evaluateRuleSafely()      (never throws; returns a result)
        |
 RuleEvaluationTransactionHelper.evaluateRuleInTransaction()   REQUIRES_NEW
   1 resolve identity types (employee / non-employee / non-human)
   2 build WHERE = tenant AND status=ACTIVE AND grouped conditions   (JPA Criteria, parameterized)
   3 page through matching identity IDs, 500 per chunk
   4 per chunk: bulk-load snapshots, shadows, existing assignments, pending assignments
   5 per identity: shadow exists?  -> upsert assignment (idempotent)
                   no shadow?      -> create PENDING assignment (account not created yet)
                   already has it? -> count as "already assigned"
   6 after all chunks: bulk-revoke assignments from this rule that no longer match
   7 save lastEvaluatedAt
        |
 ExecutionHistoryWriter.flush()  (matched / created / revoked / per-identity evidence)
 Audit: Kafka (AOP or engine) + DB audit table
```

**Key design decisions and why:**

| Decision | Reason | Trade-off |
|---|---|---|
| **Evaluate in the database** with JPA Criteria, not loop in Java | One query finds thousands of identities; scales with indexes; no code execution. | Only simple field comparisons; no cross-entity or numeric/date logic (`IdentityFieldRegistry` allows only `String`/enum fields). |
| **Field whitelist built by reflection** (`IdentityFieldRegistry`), case-insensitive | New identity attribute → automatically usable in rules, **and** users can't reference arbitrary columns (injection/data leak). Excludes `passwordHash`, `id`, `tenantId`, etc. | Reflection at startup; schema changes need a restart. |
| **`LikePatternEscaper`** | `%` and `_` typed by a user can't act as wildcards. | none worth noting |
| **Tenant + ACTIVE filter always applied** | Safety net: a rule can never cross tenants or touch disabled identities. | A rule can't act on inactive identities (intended). |
| **Chunks of 500** | Memory flat, short lock windows. 🗣 you tested 100/500/1000. | More round trips. |
| **`REQUIRES_NEW` per rule + "safe" wrapper** | One broken rule never blocks others; history is still written on failure. | A rule over many identities is one long transaction. |
| **Pending assignments** when the target account (shadow) doesn't exist yet | The rule's decision isn't lost; it completes when the account appears. | Another state to reason about. |
| **Revoke stale** after evaluation | Rules are *declarative*: the result always equals "who matches now". | Mistakes in a rule can revoke access at scale → preview/dry-run exists (`AccessRoleAssignmentRulePreviewService`). |
| **Match evidence stored as JSONB** (`MatchEvidenceBuilder`) | An **immutable receipt**: which field values and which condition matched at that moment, even if data changes later. Auditors love it. | Storage grows. |
| **DB-backed scheduler with `FOR UPDATE SKIP LOCKED`** | Restart-safe (missed runs still due), multi-instance-safe, no extra tool. | Poll interval granularity (60 s). |
| **Post-commit listener** (`@TransactionalEventListener AFTER_COMMIT`) for create/update | Evaluate only after the rule is safely saved. | If the app dies between commit and evaluate, the cron run catches up. |

### 8.4 The bug you caught (your best story) 🗣 + ✅
**Problem:** one `operator` field was doing two jobs: joining conditions inside a group **and** joining groups together. In multi-group rules the second job silently reused the first, producing **wrong matches**, i.e. wrong **access grants** in a compliance product.

**Worked example:**
`(Dept = Finance AND Title contains Manager) OR (Level = Executive)`
With one operator for both jobs, the engine treated it like `(Dept = Finance AND Title contains Manager) AND (Level = Executive)`, and **no one matched** (or the wrong people did).

**Fix:** a separate `interGroupOperator` per group (✅ visible in `parseGroupedCondition`: "Chain subsequent groups using the PREVIOUS group's interGroupOperator") plus a **backward-compatible reader** for old flat rules (`buildLegacyFlatPredicate`, detected by "has `field` but no `groupOperator`"; `*NormalizationService`).

**How you found it:** a deliberate **26-employee, 7-category dataset** built to break operator combinations, not to confirm the happy path. Say: *"I designed test data to disprove the code, not to prove it."*

### 8.5 Roles side: extra concepts ✅
- **Role composition** (`AccessRoleComposition`): parent/child roles. **Closure** (`RoleEntitlementClosure`): a **materialized table** of direct + inherited entitlements, so reads don't walk the tree each time (read-optimized, write cost on change). 🗣 10,000+ hierarchy records.
- **Assignment source** (`V20260520_03/04` migrations): assignments are **source-scoped** (rule vs manual vs direct), so a rule revoking its own grants never removes a manual one.
- **Role import jobs** run on Kafka (`role-import-events`, 3 partitions).

### 8.6 Weak spots and fixes (be ready)
| Weak spot | Fix |
|---|---|
| Offset paging (`setFirstResult`) on live data + a `COUNT(*)` **per chunk** | **Keyset paging** (`id > :lastId ORDER BY id LIMIT 500`), count once. |
| One long transaction per rule | Commit per chunk; make chunk processing idempotent (it already is). |
| Only string/enum fields | Typed operators (`>`, `<`, `BEFORE`, `AFTER`) with typed columns. |
| Rule changes can revoke at scale | Mandatory dry-run + approval for rules that would revoke > N identities. |
| Per-service scheduling styles differ | Pick one standard (poller or Quartz). |

### 8.7 Why not Drools / OPA / SpEL?
| Option | Why not (here) |
|---|---|
| **Drools** | Powerful but heavy; rules as code; hard for non-developers; overkill. |
| **OPA / Rego, Cedar** | Great for **request-time** decisions ("may this user do X now?"). Our problem is **bulk, set-based** ("who matches?") against millions of rows. |
| **SpEL / scripts** | Executes code: security risk (see G-07) and can't be pushed into SQL. |
| **JSON + DB predicates (chosen)** | Safe, auditable, UI-buildable, set-based, scalable. |

---

## 9. Security

### 9.1 Authentication: JWT **and** sessions (both) ✅

```text diagram:authflow
 Login (password / LDAP / SAML / OAuth2)  ->  auth-service
   - lockout + password policy checks
   - create UserSession row (sessionId, ip, device, lastActivity, refreshToken)
   - return  access JWT (HS256, 15 min)  +  refresh token (stored in DB)

 Every API call -> Gateway
   1 AuthFilter: verify JWT signature+expiry (no DB)
   2 copy claims into headers: X-User-Id, X-Username, X-Tenant-Id, X-IP-Address
   3 async gRPC -> auth: update session lastActivity   (X-Session-Id header)
   4 GatewayPermissionFilter: is this endpoint "managed"? -> permission check (gRPC)
   5 route to service  (service trusts the headers)
```
- **JWT claims:** `sub=userId`, `username`, `tenantId`, `identityId`. **No roles inside the token.** Permissions are looked up per request, so a role change takes effect without waiting for token expiry (except for the 5-minute cache).
- **Why both JWT and sessions:** JWT lets the gateway validate **without a DB hit**. The server-side **session table** adds governance features compliance customers expect: **idle timeout, forced logout, concurrent-session limits**, and WebSocket notifications on session termination (`SessionControl`, `SessionActivityService`).
- **Cost:** not truly stateless: every request triggers an async gRPC that **writes `last_activity`** (write amplification, see §16). 🔶 I found **no session-validity check on the gateway path** (only an activity update), so a terminated session's JWT may stay usable until it expires (≤ 15 min). Verify, then fix by checking a revocation list/session cache at the gateway.
- **Refresh tokens** are stored in `refresh_tokens` (the token string is stored as-is ❌; hash it).
- **SSO:** LDAP, SAML2, OAuth2 clients in `auth-service/service/Auth/sso`.

### 9.2 Authorization: RBAC ✅ and "ABAC-lite" ✅

**RBAC data model (application-permissions-service):**
```text
Module -> Page -> Action (endpoint pattern + HTTP method) -> Permission -> RolePermission -> Role -> UserRole -> User
```
- An **Action** stores an **endpoint pattern** (supports `*`) and an HTTP method, so permissions map to real API calls and are **configurable in the UI**, not hard-coded with annotations.
- **Role** has a type (`SYSTEM, ADMINISTRATOR, REVIEWER, OPERATOR, VIEWER`), risk level, owners (approvers), `requireOwnerApproval`, active flag.
- **UserRole** has `assignmentType` (`MANUAL` or `DYNAMIC`), `validityDays`, `batchId`.

**How a request is authorized (`UserPermissionServiceImpl.hasPermissionForEndpoint`):**
1. Find **actions** whose method matches and whose endpoint pattern matches the URL (regex).
2. Get the user's **active roles** in the tenant.
3. For each role × action × permission: does the role hold the permission?
4. If yes, evaluate **conditional rules** on that permission (SpEL against user attributes). All must pass.
5. Allow on first success. Cache **grants** for 5 minutes (denials are not cached so new grants are instant).

**ABAC-lite:** `ConditionalRule(permissionId, conditionScript)` lets a permission apply only when e.g. `user.status == 'ACTIVE' && user.email.endsWith('@corp.com')`. **Dynamic rules** (`DynamicRule`) assign roles automatically when a script matches, scheduled IMMEDIATE/DAILY/WEEKLY/MONTHLY, triggered immediately on user changes through Postgres `NOTIFY`.

**Alternatives and why this one:**
| Model | Idea | Fit |
|---|---|---|
| **RBAC (chosen)** | Users → roles → permissions | Simple, explainable, **is the product domain** (an IGA tool is about roles). |
| **ABAC** | Decide from attributes (department, time, risk…) | Added only as conditions; full ABAC needs a policy engine. |
| **ReBAC** (Zanzibar, SpiceDB, OpenFGA) | Decide from relationships (owner/manager-of) | Great for "manager of X" rules; heavier to run. |
| **PBAC engines** (OPA, Cedar) | Policy as code, central | Strong choice for request-time checks; would replace the SpEL part. |
| **Keycloak/Auth0/Okta** | Buy authN/authZ | Not an option: Intimec **sells** identity governance, and per-tenant custom models are the product. |

### 9.3 Service-to-service security (honest)
| Question | Current answer |
|---|---|
| How do services trust each other? | ❌ **They trust headers** (`X-User-Id`, `X-Tenant-Id`) set by the gateway. Services do **not** re-validate the JWT (Access Portal doesn't even include Spring Security). |
| Is internal traffic encrypted? | ❌ No. gRPC is `plaintext`; Kafka is `PLAINTEXT`; OpenSearch security plugin is **off**. |
| Can someone bypass the gateway? | ❌ **Yes if they can reach the host ports**: compose publishes every service port (8090–8099, 9095…). Spoofed headers would be believed. |
| Tenant isolation | `tenantId` on entities + header. ❌ Access Portal **falls back to a default tenant** when the header is missing/invalid (`RequestContextUtil`), and the gateway does the same (`tenant_001`). |

### 9.4 TLS termination 🔶 INFERRED
- The repo has **no TLS config** (no keystore, no `server.ssl`). The gateway compose labels are **Traefik** labels, and the stack joins Dokploy's network. Dokploy runs Traefik as its reverse proxy, which can issue Let's Encrypt certificates per domain.
- **So the likely truth:** TLS **terminates at Traefik**; traffic from Traefik → gateway → services is **plain HTTP/gRPC inside the Docker network**. Domains/certs are configured in the **Dokploy UI**, not in this repo. **Verify in the Dokploy dashboard before stating it.**
- **Say:** "We terminate TLS at the edge proxy. Internal hops are plaintext on a private network, which is acceptable for a first version but is item 2 on my hardening list: mTLS between services."

### 9.5 Secrets management ❌
| Where secrets are today | Problem |
|---|---|
| `docker-compose.yml` environment lines (DB password, OpenSearch admin password, encryption master key) | **Committed to Git in plain text.** |
| `application-prod.properties` (DB host/IP and credentials), `.env` files | Committed. |
| JWT secret in gateway `application.yml` (must equal auth's) | Committed; **shared symmetric key** across 2+ services. |
| Mail credentials in auth properties | Committed. |
| `encryption-service` | ✅ Good design: AES-256-GCM, PBKDF2 (65,536 iterations) master key, **data keys stored in DB**, field-level encryption. ❌ But the master key and salt come from env/compose, and the salt is static. |

**Fix plan (startup-sized):** (1) **Rotate every credential** that ever sat in Git (assume leaked); (2) move to **Dokploy environment variables / secrets** (never in repo); (3) use `.env` only locally and `.gitignore` it; (4) later **Vault / cloud secret manager**; (5) switch JWT to **asymmetric RS256/EdDSA** so only auth holds the private key and the gateway holds the public key.

### 9.6 Security gap list (ranked)
| ID | Gap | Severity | Fix |
|---|---|---|---|
| G-01 | Real secrets committed in compose/properties/.env | **Critical** | Rotate, move to Dokploy secrets, scrub history |
| G-02 | Service ports published on the host; services trust headers | **Critical** | Remove `ports:` for internal services; only gateway/Traefik exposed; later signed service tokens/mTLS |
| G-03 | **Fail-open**: if permissions service is down, `isEndpointManaged` returns `false` → request **allowed**; also **unmanaged endpoints** are open to any authenticated user | **High** | Deny by default; treat "can't check" as deny; cache the managed-endpoint list in the gateway |
| G-04 | Routes without `AuthFilter`: `/main-logs/**` (proxies **OpenSearch** with security disabled), `/api/v1/llm/**`, `/api/core/**`, `/api/v1/artifacts/*` (some public by design) | **High** | Require auth; never proxy OpenSearch through the gateway |
| G-05 | HS256 shared secret in 2+ services | High | RS256 + key rotation (`kid`) |
| G-06 | Terminated session may still work for ≤15 min; refresh tokens stored unhashed | Medium | Session check/revocation cache at gateway; hash refresh tokens; rotate on use |
| G-07 | **SpEL conditions evaluated with `StandardEvaluationContext`** | **High (RCE class)** | Use `SimpleEvaluationContext.forReadOnlyDataBinding()` or replace with a JSON/CEL condition format (like the rule engine) |
| G-08 | JWT placed inside Kafka event payloads | High | Pass identity claims only; use a service token |
| G-09 | Default-tenant fallback | High | Reject requests without a valid tenant |
| G-10 | Plaintext gRPC/Kafka/OpenSearch/Dgraph (`whitelist=0.0.0.0/0`) | Medium | Private network + TLS/mTLS; enable OpenSearch security; restrict Dgraph |
| G-11 | `X-Forwarded-For` trusted from the client for the audit IP | Low | Take client IP only from the trusted proxy |
| G-12 | Dev actuator exposure (`env`, `configprops`, `refresh`) in auth dev properties | Medium (dev only; compose overrides) | Never expose beyond health/info |
| G-13 | Permission cache is per instance | Low | Short TTL + eviction event over Kafka |

---

## 10. Data: why one shared database today

### 10.1 What the code shows ✅
- Every service points at **`jdbc:postgresql://host.docker.internal:5432/intimec`**: the **same database**, running **on the host** (outside Docker). ~100 tables; no table is declared by two services.
- Connection pools (`HikariCP`): 5 per service, 15 for identity → **≈ 65 connections** at one replica each. Postgres default `max_connections` is 100.
- The permissions service **attaches a trigger to the `users` table** (owned by auth) and listens with `LISTEN/NOTIFY`. That is a **cross-service dependency through the database**.

### 10.2 Why a single DB is a reasonable *startup* choice (your defense)
| Factor | Single shared Postgres | Database per service |
|---|---|---|
| Cost | One instance (or one managed DB) | 8–11 instances or schemas to size/patch |
| Operations | 1 backup, 1 monitor, 1 upgrade | 11× everything for a 2-person team |
| Transactions/joins | Possible (and used for `NOTIFY`) | Gone; need sagas/APIs |
| Speed of delivery | Fast | Slower; more plumbing |
| Local dev | Easy | Heavier |

### 10.3 What it costs (the bottleneck you mentioned)
- **Blast radius:** one slow query or full disk affects **all** services.
- **Connection ceiling:** doubling replicas (130 connections) exceeds 100 → need **PgBouncer** or smaller pools.
- **Hidden coupling:** a table change by one team can break another; `ddl-auto=update` everywhere makes accidental changes easy.
- **Scaling:** you can only scale Postgres vertically (or add read replicas); noisy neighbours (audit, logs, rule evaluation) compete with the login path.
- **Security:** every service's DB user can read every table (they share the `postgres` user ❌).

### 10.4 How to evolve (low-risk order)
1. **Per-service DB users and schemas** (`auth`, `identity`, `portal`…) in the same instance. Grants prevent cross-reads. *No infrastructure change.*
2. Remove cross-service table reliance (`NOTIFY` on `users` → a **Kafka event** from auth).
3. Add **PgBouncer** and **read replica** for analytics/audit queries.
4. Move **hot or noisy** domains first (audit, logs, workflows) to their **own instances**.
5. Keep **reporting** reads off the OLTP primary.

### 10.5 Other stores
- **OpenSearch:** logs + audit search. Single node, `replicas: 0`, security plugin disabled → **no HA, no protection** ❌.
- **Dgraph:** relationship projection of roles/entitlements. Postgres is the system of record.
- **Kafka:** single broker, replication factor 1, auto topic creation → one disk failure loses events ❌.

---

## 11. Docker: how it's used and which concepts

### 11.1 Concepts present ✅

```text diagram:docker
 Dockerfile.base-builder  ->  intimec-base-builder image
   (Maven deps downloaded once + shared libs built once)
        |  FROM intimec-base-builder
 service builder stage:  mvn -pl <service> package   (only that service's code)
        |  COPY jar
 runtime stage: eclipse-temurin:21-jre-alpine, non-root user, curl healthcheck
```

| Concept | Where |
|---|---|
| **Multi-stage build** | Builder stage (Maven + JDK 21) → runtime stage (**`eclipse-temurin:21-jre-alpine`**) |
| **Shared base builder image** (`infrastructure/docker/Dockerfile.base-builder`) | Downloads all Maven dependencies once, builds shared libs once, installs them in the local Maven repo; **each service Dockerfile starts `FROM intimec-base-builder`** and builds only its own code. Saves minutes per build. |
| **Layer caching ordering** | POMs copied first, `dependency:go-offline`, then source |
| **BuildKit cache mounts** | `RUN --mount=type=cache,target=/root/.m2 …` |
| **Non-root user** | `addgroup/adduser appuser` + `USER appuser` |
| **Small runtime image** | JRE (not JDK), alpine |
| **JVM tuned for containers** | `JAVA_TOOL_OPTIONS=-Xmx512m…768m -XX:+UseG1GC -XX:MaxGCPauseMillis=200` |
| **Healthchecks + `depends_on: condition: service_healthy`** | auth, gateway, config, permissions, llm, workflows (curl on `/actuator/health`) |
| **Restart policy** | `unless-stopped` |
| **Networks** | external `dokploy-network` (shared with Dokploy/Traefik) |
| **Volumes** | named volumes for kafka, core storage, connector data |
| **Host access** | `extra_hosts: host.docker.internal:host-gateway` to reach the host's Postgres |
| **Labels** | Traefik labels on the gateway |
| **Compose bootstrap vs services** | `docker-compose-bootstrap.yml` (Kafka, Kafka-UI, OpenSearch, Dgraph) separate from app services |
| **Helper scripts** | `scripts/docker-deploy.sh` (build, start, restart one service) |

### 11.2 Gaps ❌ (and fixes)
| Gap | Fix |
|---|---|
| Secrets in compose env | Dokploy env/secret store (see §9.5) |
| All ports published to the host | Remove `ports:` except the proxy-facing one |
| No `mem_limit`/CPU limits in compose | Add limits so the JVMs can't starve each other |
| `latest` tags (`opensearch`, `dgraph`, `kafka-ui`) and a **legacy Bitnami Kafka image** | Pin versions |
| Postgres outside Docker with a public IP in `prod` properties | Private network/managed DB, firewall |
| Healthchecks missing for identity, access-portal, connector, task | Add; use them in `depends_on` |
| `docker compose build --no-cache` in the deploy script | Use cache; build in CI and push images to a registry |
| Java target 17 vs runtime 21 | Align (set `release 21`) |
| `ddl-auto=update` at container start | Flyway migrations (see §13) |

---

## 12. Deployment on Dokploy, and why not Kubernetes (yet)

### 12.1 What Dokploy gives a 2-person team 🔶
Deploy a Docker Compose stack from a UI/Git, built-in **Traefik** reverse proxy with domains and (automatic) TLS, environment management, logs and restarts. No cluster to learn or patch.

### 12.2 Why not Kubernetes yet: the argument
| Question | Answer for Intimec today |
|---|---|
| Do we need **auto-scaling**? | No: B2B internal tool, predictable load, bursts only on bulk jobs (async via Kafka). |
| Do we need **multi-node HA**? | Not yet: single Postgres, single Kafka broker mean Kubernetes would **not** make the system highly available by itself. |
| Who operates it? | **Two engineers** doing frontend, backend and deployment. K8s adds networking, ingress, storage classes, RBAC, upgrades, and observability tooling. |
| Cost | A managed cluster + nodes + load balancer costs more than one big VPS. |
| Time to value | Compose on Dokploy ships features today. |

**Honest statement:** *"Kubernetes solves scaling and self-healing problems we don't have yet, and it would add an operations burden we can't staff. The things that would actually make us safer, HA data stores, secrets, backups, tracing, don't require Kubernetes."*

### 12.3 When to switch (triggers)
- You need **rolling deploys with zero downtime** for paying customers (SLA).
- A single host can't hold the services (RAM > ~70% steadily).
- You need **autoscaling** for specific services (rule engine, workflows) or **multi-region**.
- You have **≥ 1 person** who can own the platform.
- You adopt a **managed Kubernetes** (EKS/GKE/AKS) to avoid running the control plane.

### 12.4 Step on the way (cheap)
Compose → **two hosts** (stateful on one, stateless on another) → **Docker Swarm or Nomad** (optional) → **managed K8s**. Your compose already maps cleanly: service → Deployment + Service, env → ConfigMap/Secret, healthcheck → probes, `dokploy-network` → cluster networking, Traefik labels → Ingress.

---

## 13. Migration strategies

### 13.1 gRPC migration (REST → gRPC) 🗣 + ✅
**How it was/should be done safely (strangler pattern):**
1. Define the contract in **`shared/common-protos`** (e.g. `UserManagerLookupService`, `UserIdentityLookupService`, `PermissionService`).
2. **Add the gRPC server next to REST** in the target service (auth: HTTP 8090 + gRPC 8002; identity: 8094 + 9096). Nothing breaks: old clients keep using REST.
3. Add the gRPC **client** in the caller (`UserManagerLookupGrpcClient`) with a **deadline** (5 s / 30 s).
4. Switch call sites **one at a time**; compare latency and results; keep REST as fallback.
5. Remove the REST path when metrics show no callers.
- ✅ The portal **still has REST clients** (roles, profile, permissions): migration was intentionally **partial**: *"hot, synchronous, user-facing calls first; low-traffic lookups later."*
- **Kafka stays** for async lifecycle events: gRPC is for calls that **must answer now** (login), Kafka for things that **must not be lost**.

**Protobuf compatibility rules (state them):** never reuse or renumber a field; add new fields as optional; use `reserved` for removed ones; deploy **servers first, clients second**; keep old fields until all clients upgrade.
❌ Today: contracts are a **shared Maven module** (all services rebuild together), **no `reserved` fields** appear in the protos, **no automated breaking-change check**. **Fix:** add `buf lint` and `buf breaking` to CI.

### 13.2 Database migrations ❌/✅
- ✅ What exists: Hibernate **`ddl-auto=update`** in nearly every service; hand-run SQL scripts in the repo root (`drop_constraints.sql`, `reset_permissions.sql`…); **versioned-looking SQL files** (`db/migration/V2026….sql` in identity, `V1.0.25…` in core, `V6…V8` in workflows) but **Flyway is a dependency only in llm-service**, so those files are **applied manually** or not at all.
- ❌ Risk: `update` never drops/renames safely, can't be reviewed, differs per environment, and can't be rolled back. `llm-service` even defaults to `create-drop`.
- **Target:** **Flyway** in every service, baseline the current schema, `ddl-auto=validate`, and the **expand → migrate → contract** pattern:
  1. *Expand:* add new nullable column/table (old code still works).
  2. *Migrate:* backfill in batches; dual-write if needed.
  3. *Contract:* after all instances run new code, remove the old column in a later release.
- ✅ Good examples of you following expand/contract in spirit: entitlement rule conditions format (grouped vs legacy flat, both readable), `identity_types` single → list (`V20260520_01`), source-scoped assignment uniqueness (`V20260520_03/04`).

### 13.3 Data migration techniques you can name
| Technique | Where |
|---|---|
| **Backward-compatible reader** (accept old + new format) | Rule conditions: legacy flat vs grouped |
| **Alias swap reindex** (index template → new index → reindex → verify → atomic alias switch) | 🗣 OpenSearch 5M+ docs, zero downtime (`config/opensearch` holds the template/init) |
| **Batch backfill with chunks** | Bulk role assignment worker (5,000 per insert), rule engine (500) |
| **Dual write / shadow compare** | Recommended for outbox rollout |
| **PII-free audit refactor** | Replace raw personal fields with IDs + metadata; preserve traceability 🗣 |
| **Feature-flag cutover** | Recommended for gRPC/outbox |

### 13.4 Event schema migration
Events are loosely typed `Map<String,Object>` with a `version` in metadata (`2.0`, `3.0`). Keep **additive** changes, version the event type, and let consumers ignore unknown fields. Better: a shared `iam-events` module (exists) with typed events and a schema registry later.

---

## 14. Is Domain-Driven Design followed?

**Verdict: DDD-inspired, not full DDD.** Say that: it's honest and still impressive.

| DDD idea | Evidence ✅ | Weakness ❌ |
|---|---|---|
| **Bounded contexts → services** | Identity (people, roles, entitlements), Access Portal (requests), Auth (credentials/sessions), Permissions (app RBAC), Workflows (orchestration), Core (audit/notify/logs) | `identity-service` (563 files, 42 tables) holds **6 contexts** (identities, roles, entitlements, organizations, shadows, policies) → a **modular monolith inside a service**. |
| **Ubiquitous language** | Same words in code and UI: Tile, Cart, Entitlement, Shadow, Archetype/Persona, Provisioning, Certification | Some terms collide (Role: app role vs access role vs business role). |
| **Aggregates** | `AccessRequest` is the aggregate root: items, approval steps, audit logs, comments, provisioning saved through one root (cascade) | Entities are mostly data holders (Lombok), logic lives in services (anemic). |
| **Factories** | `AccessRequestEntityFactory` | |
| **Domain events** | `WorkflowEvent`, `RuleEvaluationEvent` (Spring events post-commit), Kafka events | No outbox → events not guaranteed (see §7). |
| **Anti-corruption layer** | gRPC clients + MapStruct mappers translate between services' models | Shared `iam-dtos` / `common-protos` libs create a **shared kernel** coupling. |
| **Domain services** | `RuleEvaluationEngine` | |

---

## 15. Resilience and observability: target state for a tiny team
| Do now (days) | Do next (weeks) |
|---|---|
| Fix consumer error handling + DLT for portal topics | OpenTelemetry Java agent → Tempo/Jaeger |
| Explicit topic creation with ≥3 partitions + replication settings | Prometheus + Grafana (JVM, Kafka lag, Hikari, HTTP) |
| Alerts: container restarts, Kafka consumer lag, outbox `DEAD`, 5xx rate | Resilience4j in gateway + portal clients |
| Reduce INFO logging in permission hot path | Log retention + ILM in OpenSearch |
| Healthchecks for all services | Chaos drills: kill Kafka/Postgres in staging |

---

## 16. Performance and capacity

> ⚠️ The numbers below are **reasoned estimates with stated assumptions, not benchmarks.** Say so, and say how you'd measure.

### 16.1 Facts from the code
| Fact | Value |
|---|---|
| Sum of JVM max heaps (11 services) | ≈ **7.2 GB** (core 768, auth 768, identity 768, gateway 768, llm 1024, others 512) |
| Real RAM needed | JVM overhead + Kafka + OpenSearch + Dgraph + Postgres → **16 GB floor, 32 GB comfortable** |
| DB connections | ≈ 65 max (one replica each) vs Postgres default 100 |
| Permission cache | 5 min, 10K entries (per instance) |
| JWT lifetime | 15 min |
| Bulk | rule engine 500/page; bulk role insert 5,000/batch; 🗣 5,000+ users per operation |

### 16.2 The hot path (every API call) ❌
```text
Gateway
  1 JWT verify (CPU only)
  2 async gRPC -> auth: UPDATE user_session.last_activity      <-- a DB WRITE per request
  3 gRPC -> permissions: isEndpointManaged  (NOT cached: loads all actions for the HTTP method, regex-matches in memory)
  4 gRPC -> permissions: checkPermission    (cached on success; on a miss: nested loops, query per role x action x permission = N+1)
  5 route -> service -> its own DB queries
```
Problems: (3) is an uncached query + scan on **every** request; (4) is N+1 on a cache miss; (2) writes on every request; permission checks log **multiple INFO lines per step**, which ships to OpenSearch.

### 16.3 Capacity estimate
**Assumptions:** one Docker host (~8 vCPU / 16–32 GB), one replica per service, Postgres on the same host, ~10–30 ms per simple query, a user generates ~1 request per 5–10 s while active (page loads come in bursts).

| Limit | Reasoning | Rough ceiling |
|---|---|---|
| Permission service DB path | Hikari pool of 5; uncached `isEndpointManaged` query ≈ 5–20 ms → a few hundred queries/s before queuing | **~50–150 requests/s** end to end at the gateway |
| Concurrent *active* users | 50–150 req/s ÷ (1 req per 5–10 s) | **~300–1,000 concurrently active users** |
| **Named users supported** | Internal enterprise tool, typically 2–10% concurrent | **~5,000–20,000 employees** per tenant footprint comfortably; a few tenants total |
| Bulk operations | Async via Kafka, chunked | Fine to **5,000+ users/op** (your tested number); larger runs are minutes, not seconds |
| Rule engine | 500/page, DB-side match | Thousands to low hundreds of thousands of identities per rule, minutes; longer with the per-chunk `COUNT(*)` |
| Kafka | 1 broker, auto topics (1 partition) | Plenty for this volume (hundreds of msgs/s), **no HA** |

**Weak links, in order:** (1) permission check path, (2) Postgres connections and the shared instance, (3) single Kafka/OpenSearch node availability, (4) per-request session write.

### 16.4 Quick wins (hours to days, big effect)
1. **Cache `isEndpointManaged`** (and the whole action list) in the gateway/permissions with a short TTL.
2. **Fix N+1** in `hasPermissionForEndpoint`: one query joining role → permission → action for the user.
3. **Debounce session activity**: update at most every 30–60 s per session.
4. **Lower log levels** in hot paths; sample.
5. **Keyset paging + single count** in the rule engine.
6. Declare Kafka topics with 3+ partitions; add PgBouncer if replicas grow.

### 16.5 How to prove it (load-test plan)
Use **k6** or **Gatling**: login → browse tiles → add to cart → submit request (ramp 10 → 500 virtual users). Watch: p95 latency, Hikari `active/pending`, Kafka consumer lag, GC pauses, CPU. Report the knee of the curve. **That measured number is what you defend.**

---

## 17. Gaps register (one page to memorize)
| ID | Area | Gap | Sev | Fix | Effort |
|---|---|---|---|---|---|
| G-01 | Secrets | Credentials in Git | Critical | Rotate + Dokploy secrets | 1 day |
| G-02 | Network | Ports published; header trust | Critical | Remove ports; signed tokens | 1–2 days |
| G-03 | AuthZ | Fail-open endpoint check; unmanaged endpoints open | High | Deny by default | 1 day |
| G-04 | Gateway | Unauthenticated routes incl. OpenSearch proxy | High | Add `AuthFilter`, remove proxy | 1 day |
| G-07 | AuthZ | SpEL RCE class | High | Safe evaluator/CEL | 1–2 days |
| G-08 | Events | JWT inside Kafka payloads | High | Remove | 0.5 day |
| G-14 | Events | No outbox (dual write) | High | §7 | 3–5 days |
| G-15 | Events | Portal consumer swallows errors; no DLQ | High | Rethrow + DLT | 1 day |
| G-16 | Events | Topics auto-created, 1 partition, RF=1 | Medium | Declare topics | 0.5 day |
| G-17 | Data | Shared DB user + single instance | Medium | Per-service users/schemas | 2–3 days |
| G-18 | Data | `ddl-auto=update`, manual SQL | High | Flyway | 3–5 days |
| G-19 | Perf | Uncached endpoint check + N+1 + per-request session write | High | §16.4 | 2–3 days |
| G-20 | Obs | No tracing/metrics/alerts | Medium | OTel + Prometheus | 3–5 days |
| G-21 | Resilience | Circuit breakers only in workflows | Medium | Add to gateway/portal | 2 days |
| G-22 | Infra | Single-node Kafka/OpenSearch; OpenSearch security off | Medium | HA/replicas, enable security | days–weeks |
| G-23 | Infra | No container limits, `latest` tags | Medium | Pin + limit | 0.5 day |
| G-24 | gRPC | No proto breaking-change CI; plaintext | Medium | `buf` + TLS | 1–2 days |
| G-25 | Tenancy | Default-tenant fallback; no DB-level isolation | High | Reject; Postgres RLS | 2–4 days |
| G-26 | Tests | Access portal and gateway have 1 test each | Medium | Add service + consumer tests | ongoing |

### 17.1 Priority order for a team of two (30 / 60 / 90 days)
- **Days 1–7 (stop the bleeding):** G-01, G-02, G-03, G-04, G-07, G-08.
- **Days 8–30 (reliability):** G-15, G-14 (outbox), G-16, G-19 quick wins, backups + restore drill.
- **Days 31–60 (operability):** G-18 Flyway, G-17 schemas/users, G-20 metrics + tracing, G-23.
- **Days 61–90 (scale readiness):** G-21, G-22 (HA Kafka/Postgres), load test, decide Kubernetes with data.

---

## 18. Interview Q&A (answer out loud)

#### Q: Walk me through the architecture in two minutes.
Eleven Spring Boot services behind a Spring Cloud Gateway. The gateway validates a 15-minute JWT, adds user and tenant headers, checks endpoint permissions through gRPC, and routes. Services call each other synchronously with gRPC for fast lookups and asynchronously through Kafka for approvals, audit and bulk jobs. Data sits in one shared PostgreSQL with per-service tables, logs and audit in OpenSearch, a graph projection in Dgraph. It all runs as Docker Compose on Dokploy, which also gives Traefik for TLS.

#### Q: Why microservices for a startup this small?
The domains (identity, requests, auth, workflows, audit) change at different speeds and have different load shapes, and the product is multi-tenant and compliance-driven. In hindsight, 11 services for a team of 2 is a lot: the shared libraries and shared DB show we're closer to a "modular distributed monolith". I'd keep it, but resist splitting further and invest in the platform basics first.

#### Q: Why a single database?
Cost and operations. One Postgres means one backup, one upgrade, one monitor, for a team of two. We keep **logical** ownership: each service owns its tables, no table is shared. The costs are blast radius, a shared connection limit (about 65 of 100 used) and a few shortcuts like `LISTEN/NOTIFY` on the users table. My plan is per-service schemas and users first, then split noisy domains.

#### Q: Why isn't there Kubernetes?
We don't have the problems it solves (autoscaling, multi-node HA) and we don't have people to run it. Our real risks are single-node Kafka/Postgres/OpenSearch, secrets and observability, and Kubernetes fixes none of those by itself. I listed the triggers that would make me switch.

#### Q: How does authentication work: JWT or sessions?
Both. A short-lived HS256 JWT lets the gateway authenticate without a database call. A server-side session row plus DB-stored refresh token gives idle timeout, forced logout and concurrent-session control. The cost: the gateway still makes an async call per request to update session activity.

#### Q: How are permissions checked?
Permissions are data: module → page → action (endpoint pattern + HTTP method) → permission → role → user role. The gateway asks the permissions service over gRPC; it finds matching actions, the user's active roles, and the first role that holds the permission, then evaluates optional conditional rules on user attributes. Grants are cached for five minutes.

#### Q: Is it RBAC or ABAC?
RBAC with attribute conditions ("ABAC-lite"). Conditions are SpEL expressions on user attributes. I know the risk: SpEL with a standard context can execute code, so I'd switch to a read-only context or a safe expression format, as I did in the rule engine.

#### Q: What happens if the permission service is down?
Honestly, one check fails open: if the "is this endpoint managed?" call fails, the gateway treats it as unmanaged and lets the request through. The permission check itself fails closed. I'd make both deny-by-default and cache the managed-endpoint list.

#### Q: How do services trust each other?
Today by network and headers: the gateway sets `X-User-Id` and `X-Tenant-Id`, services trust them. That's only safe if services aren't reachable directly, and compose publishes their ports, so I'd close those and then add signed service tokens or mTLS.

#### Q: Where does TLS terminate?
At the edge proxy: Dokploy's Traefik. Inside the Docker network it's plain HTTP/gRPC. (Confirm the domain and certificate settings in Dokploy.) Next step: mTLS between services.

#### Q: How do you manage secrets?
Honestly, poorly: several credentials are in compose/properties files in Git. The plan is to rotate everything, move to Dokploy secrets, use RS256 so only auth holds a private key, and later Vault. The encryption library itself is solid: AES-256-GCM with a PBKDF2-derived master key and DB-stored data keys.

#### Q: Is it event-driven? How?
Yes where reliability matters. Access Portal publishes to `role-events`; workflows orchestrates approvals and answers on `access-request-events`; every service publishes to `audit-log`, which core stores. Delivery is at-least-once. The known weakness is that publishing happens inside the DB transaction, so I'd add an outbox.

#### Q: Explain the outbox pattern and how you'd add it.
Write the event into an `outbox` table in the **same transaction** as the business data, then a relay publishes pending rows to Kafka and marks them sent. It removes the dual-write problem: no lost events when Kafka fails after commit, no ghost events when commit fails after send. In the portal I'd add `OutboxEvent`, `OutboxEventRepository` (with `FOR UPDATE SKIP LOCKED`), `OutboxWriter` (`MANDATORY` propagation), `OutboxRelay`, and consumer-side idempotency.

#### Q: Isn't the outbox just moving the problem? What about duplicates?
Yes, it makes delivery at-least-once, so consumers must be idempotent: a processed-events table keyed by `eventId`. That's the right trade: duplicates are harmless, lost events aren't.

#### Q: Why Kafka instead of RabbitMQ or SQS?
Approvals and audit need durability and replay, not low latency. Kafka's log lets us re-read events and add consumers later. The honest downside is operational weight and our single broker with replication factor 1, which has no HA.

#### Q: Why gRPC for some calls and Kafka for others?
By question: *must I get an answer now?* (login, permission, manager lookup) → gRPC. *Must this never be lost but can wait?* (approval, audit, bulk jobs) → Kafka.

#### Q: How did you migrate to gRPC without downtime?
Added gRPC servers beside REST, added clients with deadlines, switched call sites one by one, kept REST as fallback, removed it after traffic dropped. I'd now add `buf breaking` checks because contracts live in one shared module and rebuild everything together.

#### Q: How do you handle database migrations?
Today: Hibernate `ddl-auto=update` plus manual SQL scripts, which is a known weakness. The target is Flyway with `validate` and expand/contract steps so old and new code run side by side.

#### Q: How did you do the OpenSearch migration with zero downtime?
Create an index template for the correct mapping, create a new index, reindex, verify counts, then atomically switch the alias so applications never change the name they query. The old index stays until confident.

#### Q: How does the rule engine work?
Rules are JSON groups of conditions with AND/OR/NOT and nested groups. It builds a parameterized JPA Criteria query restricted to the tenant and ACTIVE identities, pages through matches 500 at a time, creates missing assignments (or pending ones if the account isn't there yet), revokes stale ones, and stores evidence JSON for audit. It runs on create/update (after commit), on a cron poller using `SKIP LOCKED`, or manually.

#### Q: What was the hardest bug in the rule engine?
One `operator` field did two jobs, in-group and between groups, so multi-group rules matched the wrong people. I built a 26-person, 7-category dataset to break operator combinations, found it before production, added `interGroupOperator`, and kept old rules readable with a legacy path.

#### Q: How do you prevent injection in rules?
Fields go through a reflection-built whitelist (no passwords or ids), operators are an enum, values are bound parameters through JPA Criteria, and `LIKE` input is escaped.

#### Q: Why not use Drools or OPA?
Our problem is bulk, set-based ("who matches this rule now?") over many identities and must be auditable and safe. DB predicates scale and don't execute code. OPA/Cedar fit request-time checks better; I'd consider them to replace the SpEL conditions.

#### Q: Is it Domain-Driven Design?
DDD-inspired: services follow business contexts, `AccessRequest` is an aggregate root with a factory, mappers act as anti-corruption layers, and events exist. It isn't full DDD: entities are mostly data holders, and `identity-service` hosts several contexts.

#### Q: How many users can it handle?
My reasoned estimate, not a benchmark: roughly 50–150 requests/s at the gateway, so several hundred to about a thousand concurrently active users, comfortably serving a company of several thousand employees. The first limits are the uncached permission path and the shared Postgres. I'd prove it with a k6 test and fix the hot path (cache, N+1, session writes).

#### Q: What would you fix first?
Secrets and open ports (critical), the fail-open permission check, the portal consumer's error handling, then the outbox. Those are days of work and remove the biggest risks.

#### Q: How do you do resilience?
Resilience4j in workflows (circuit breaker, retry with backoff, time limiter, bulkhead), gRPC deadlines, producer idempotence and `acks=all`, SKIP-LOCKED schedulers. Gaps: only one service has breakers, no tracing, single-node data stores.

#### Q: What's your Docker setup?
Multi-stage builds from a shared base-builder image (dependencies and shared libs cached once), BuildKit cache mounts, JRE-alpine runtime, non-root user, G1 GC flags, healthchecks with `depends_on: service_healthy`, an external Dokploy network, named volumes. Gaps: published ports, no resource limits, unpinned images, secrets in env.

#### Q: How does multi-tenancy work?
A `tenantId` on entities and JWT claims, passed as `X-Tenant-Id` and enforced in queries (the rule engine always adds a tenant filter). Gaps: a default-tenant fallback and no database-level enforcement. I'd reject missing tenants and add Postgres row-level security.

#### Q: How is audit done without exposing personal data?
Audit rows reference identity IDs and operation metadata instead of raw personal fields, so investigators can trace without storing PII in the log, a change I made after finding raw PII in audit logs.

#### Q: Tell me about an AOP bug you fixed.
Audit advice wasn't running because of Spring AOP **self-invocation**: a method calling another method on the same bean bypasses the proxy. I moved the call across beans so the aspect applied, restoring audit coverage on sensitive operations.

---

## 19. Things NOT to claim
- Exactly-once delivery. DLQs everywhere. mTLS. Eureka/service registry. Distributed tracing. Database-per-service. Kubernetes. Full ABAC engine. "Chunk 500" for bulk inserts. Any number from §16 as a **measured** result.

## 20. Where to point in the code (cheat map)
| Topic | File (under the repo root) |
|---|---|
| Gateway routes, JWT config | `services/api-gateway/src/src/main/resources/application.yml` |
| JWT check + header propagation | `.../api_gateaway/filter/AuthFilter.java` |
| Endpoint permission filter (fail-open spot) | `.../filter/GatewayPermissionFilter.java` (`isEndpointManaged`) |
| Permission check, cache, conditional rules | `application-permissions-service/.../UserPermissionServiceImpl.java`, `config/CacheConfig.java` |
| SpEL evaluation | `.../ConditionalRuleEvaluationServiceImpl.java` |
| Login, sessions, refresh tokens | `auth-service/.../AuthServiceImpl.java`, `RefreshTokenServiceImpl.java`, `JwtUtil.java` |
| Submit request + dual write | `access-portal-service/.../AccessRequestServiceImpl.java` (`submitRequest`, `publishWorkflowEventsPerItem`) |
| Kafka publisher / consumer | `.../event/AccessRequestEventPublisher.java`, `event/consumer/AccessRequestEventConsumer.java`, `config/Kafka*Config.java` |
| Rule engine | `identity-service/.../entitlement_management/service/RuleEvaluationEngine.java`, `RuleEvaluationTransactionHelper.java`, `IdentityFieldRegistry.java`, `scheduler/CronSchedulerPoller.java`, `event/RuleEvaluationEventListener.java` |
| Role rules | `identity-service/.../access_roles_management/service/impl/AccessRoleAssignmentRule*.java` |
| Bulk role jobs | `application-permissions-service/.../event/consumer/BatchJobWorker.java` |
| DLQ (the only one) | `identity-service/.../config/KafkaConsumerConfig.java` |
| Resilience4j | `workflows-service/src/main/resources/application-resilience.yml` |
| Docker | `infrastructure/docker/docker-compose.yml`, `docker-compose-bootstrap.yml`, `Dockerfile.base-builder`, `services/*/Dockerfile` |
| gRPC contracts | `shared/common-protos/src/main/proto/*.proto` |
| Encryption | `shared/encryption-service` |
| OpenSearch template | `config/opensearch/opensearch-template.json` |

## 21. Glossary (plain English)
- **API Gateway:** the front door that checks who you are and where your request goes.
- **gRPC / Protobuf:** a fast way for services to call each other using a strict, binary contract.
- **Kafka topic:** a named, durable stream of events that services publish and read.
- **Outbox:** a table where an event waits, saved together with your data, until it is safely sent.
- **Idempotent:** doing it twice has the same result as doing it once.
- **Dual write:** writing to two systems (DB and Kafka) without one shared transaction: can leave them out of sync.
- **RBAC / ABAC:** access by role / access by attributes.
- **Circuit breaker:** stops calling a failing service for a while so it can recover.
- **Dead-letter queue (DLQ):** a parking topic for messages that keep failing.
- **TLS termination:** the place where encrypted HTTPS becomes plain HTTP.
- **Expand/contract:** change a database in two safe steps so old and new code both work.
