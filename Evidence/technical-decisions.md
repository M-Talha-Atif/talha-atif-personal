# Technical Decisions Log

Last updated: July 2026

Format for each entry: Context → Options Considered → Decision → Trade-off Accepted → Failure Scenario Handled

---

## Decision 1: Kafka for Approval Workflows (over REST or WebSockets)

**Context:** The Access Portal needed to notify the Workflow Service of submitted requests, and the Workflow Service needed to notify back on approval/rejection/completion, across a distributed system where any service could be temporarily unavailable.

**Options considered:**
- REST: simple, synchronous, but couples caller availability directly to callee availability. No replay if a message is "lost" mid-failure.
- WebSockets: real-time bidirectional, but requires a persistent connection for a process that takes minutes to hours — wasteful and adds connection-state complexity for no benefit.
- Kafka: async, durable, replayable, decouples producer from consumer entirely.

**Decision:** Kafka.

**Trade-off accepted:** Added operational complexity of running and monitoring a Kafka cluster, and gave up the simplicity of a direct synchronous call.

**Failure scenario handled:** If the Provisioning Service is down when an approval event is published, the event sits durably in Kafka and is processed when the service recovers — no data loss, no need for the caller to retry.

---

## Decision 2: gRPC for Synchronous Identity Lookups (Kafka retained for lifecycle events)

**Context:** Auth Service needed fast identity and manager resolution during login (every request), while Identity Service also needed to broadcast lifecycle changes (creation, updates, deletion) to other services.

**Options considered:**
- REST for everything: simplest, but adds JSON serialization and HTTP header overhead on every login, compounding at high login volume.
- Kafka for everything: async by nature, cannot be used for a call where the caller needs an immediate response (login cannot wait for an async consumer).
- gRPC for sync, Kafka for async: split by actual requirement.

**Decision:** gRPC with Protocol Buffers for the synchronous identity/manager lookup path; Kafka retained for lifecycle events that can tolerate eventual consistency.

**Trade-off accepted:** Two different communication patterns to maintain instead of one, and gRPC's binary format is not human-readable without the shared `.proto` schema.

**Failure scenario handled:** If Auth Service is down, identity lifecycle events still queue in Kafka and are processed on recovery — lifecycle operations are not blocked by Auth Service availability.

---

## Decision 3: Alias-Based OpenSearch Migration (over in-place mapping change)

**Context:** Production OpenSearch index had mapping conflicts (text+keyword dual mapping) on high-cardinality fields, breaking aggregation queries, but 5M+ documents needed to migrate without downtime.

**Options considered:**
- In-place mapping change: not supported by OpenSearch for existing fields on an existing index — would require deleting and rebuilding the index, causing downtime.
- Full rebuild with a maintenance window: simplest to implement, but user-facing downtime is not acceptable.
- Alias-based migration: create new index with correct mapping → reindex in background → verify → atomic alias switch.

**Decision:** Alias-based migration.

**Trade-off accepted:** More steps and more careful verification required (comparing document counts and query results between old and new index before cutover) versus a straightforward rebuild.

**Failure scenario handled:** If the reindex process fails partway through, the alias still points at the old index, so production traffic is completely unaffected until the new index is verified correct.

---

## Decision 4: Chunk-Based Async Processing for Bulk Role Assignment

**Context:** Synchronous bulk role assignment was timing out above 500 users, with zero visibility into which users succeeded or failed.

**Options considered:**
- Single bulk INSERT: fast, but no progress tracking and no partial failure recovery — if it fails at row 4,000 of 5,000, you don't know what succeeded.
- Per-record processing with individual transactions: full visibility and recoverability, but slow — thousands of individual round trips.
- Chunked async processing: batch into groups (tested at 100, 500, 1000 records per chunk).

**Decision:** Chunked async processing at 500 records per chunk via Kafka worker, with a Batch Job table tracking progress.

**Trade-off accepted:** More implementation complexity (job tracking table, chunk coordination) than a single bulk insert, in exchange for observability and recoverability.

**Failure scenario handled:** If the worker crashes mid-batch, the Batch Job table records the last completed chunk, and processing resumes from there on restart instead of starting over or losing track of partial progress.

---

## Decision 5: Set-Based Lookup Over Nested Loop for Duplication Check

**Context:** The role assignment approval flow was intermittently timing out; profiling showed 800ms-2s spent purely on checking whether requested roles were already assigned, using a nested loop over existing assignments for every requested role.

**Options considered:**
- Optimise the loop with early exits: marginal improvement, still fundamentally O(n×m).
- Move the check to the database with a query per role: reduces application-side compute but adds N database round trips.
- Precompute a HashSet of existing role IDs once, then do O(1) lookups per requested role.

**Decision:** HashSet-based lookup.

**Trade-off accepted:** Slightly higher upfront memory to hold the set in memory, in exchange for eliminating the O(n×m) compute cost entirely.

**Failure scenario handled:** N/A (pure performance fix, not a reliability concern) — but the fix directly prevented the timeout failure scenario the nested loop was causing under load.

---

## Decision 6: Extract Method to New Spring Bean to Fix AOP Self-Invocation Bypass

**Context:** Spring AOP audit advice was silently not firing on certain rule engine methods because they were called from within the same bean (self-invocation), bypassing the Spring proxy that applies the aspect.

**Options considered:**
- Refactor the calling pattern to always go through an injected reference to itself: works but is an unusual and confusing pattern to maintain.
- Switch to AspectJ compile-time weaving instead of Spring AOP's proxy-based approach: solves the root cause but is a much larger architectural change affecting the whole codebase.
- Extract the specific audited method(s) into a separate Spring bean: small, targeted fix.

**Decision:** Extract to a separate bean.

**Trade-off accepted:** Slightly more classes/beans in the codebase versus a single consolidated service class.

**Failure scenario handled:** Ensures the audit trail — a compliance requirement — cannot be silently skipped due to an internal implementation detail of how a method was called.

---

## Decision 7: Keep EC2 Running as Fallback During Fly.io Cutover

**Context:** Migrating Digital Upgraders' production backend from AWS EC2 to Fly.io with real users actively on the platform.

**Options considered:**
- Hard cutover: deploy to Fly.io, switch DNS immediately, decommission EC2. Fastest, but no fallback if something is wrong post-cutover.
- Phased cutover with fallback: deploy to Fly.io on a temp subdomain, smoke test, lower DNS TTL in advance, cut over DNS while keeping EC2 running, decommission only after full propagation and verification.

**Decision:** Phased cutover with fallback.

**Trade-off accepted:** Slower migration timeline and double infrastructure cost during the overlap window, in exchange for a safety net.

**Failure scenario handled:** If the Fly.io deployment had an unexpected issue post-cutover, DNS could be reverted back to EC2 while the issue was resolved, rather than users experiencing an outage during debugging.
