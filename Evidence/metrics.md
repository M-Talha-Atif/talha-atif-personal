# Metrics Log

Last updated: July 2026

Every metric below is tied to a specific change I made, with before and after values. No metric is included without a concrete technical action behind it.

---

## Performance Metrics

| Metric | Before | After | Change | What Changed |
|---|---|---|---|---|
| Feed API latency (Cunocovo) | 3 seconds | 700ms | 77% reduction | Composite index, DTO cleanup, query optimisation, 5-min in-memory cache |
| Leaderboard API latency (Memingo) | 30 seconds | 90ms | ~333x reduction | Replaced per-request computation with Redis precomputed cache |
| Inter-service auth latency (Intimec) | REST baseline | 50% lower | 50% reduction | Migrated Auth/Identity/Access Portal calls from REST to gRPC |
| Role assignment validation latency (Intimec) | 800ms-2s | Under 5ms | ~99% reduction | Replaced nested-loop duplication check with HashSet-based lookup |
| Perceived AI processing wait (Moodly) | 4-8 seconds | Under 1 second | 87.5% reduction | Async RabbitMQ pipeline decoupling inference from booking flow |
| Comment button response (Cunocovo) | ~2 seconds | 0ms | Eliminated | Removed a redundant API pre-check that was already available in local state |

---

## Scale Metrics

| Metric | Value | Context |
|---|---|---|
| Bulk role assignment | 5,000+ users per operation | Async, chunked, with real-time progress and partial failure recovery |
| OpenSearch documents migrated | 5M+ | Zero-downtime migration via alias switching |
| OpenSearch analytics throughput | 100K+ logs per cycle | After schema redesign resolving production drift |
| Microservices owned/contributed to | 8+ | Across Auth, Identity, Access Portal, Workflow, Application Permissions, Core services |
| Nested role hierarchy depth handled | 10,000+ records | Business Roles Catalog with BFS cycle detection |

---

## Reliability Metrics

| Metric | Result |
|---|---|
| Downtime during AWS EC2 → Fly.io migration | None (zero-downtime, phased cutover) |
| Downtime during OpenSearch schema migration | None (alias-based, zero-downtime) |
| Compliance-critical bugs caught pre-production | 2 (rule engine operator leak, audit triggeredBy loss) |
| Notification duplication incidents after fix | 0 (transactional rewrite eliminated the race condition) |
| Cross-platform rendering issues after fix | 0 (Android, iOS, Safari all confirmed stable) |

---

## Open Source Metrics

| Metric | Value |
|---|---|
| Merged pull requests | 4 |
| Projects contributed to | 2 (Apache Checkstyle, OpenSRE/Tracer Cloud) |
| Test suites passed on OpenSRE PR #3702 | 12/12 across 4 test files |

---

## Notes on Methodology

Every number above came from a before/after comparison I personally measured — either through application logs, EXPLAIN ANALYZE query plans, load testing at different configuration values (e.g. testing chunk sizes of 100/500/1000, consumer counts of 1/3/5), or direct timing comparisons. None of these are estimates without a measurement behind them.
