# Achievements Log

Last updated: July 2026

---

## Engineering Achievements

**Built an enterprise IAM platform from zero**
Owned the Access Portal end to end at Intimec — no prior codebase to inherit for this feature, no documentation, no team to hand off to. Went from requirements conversation with a non-technical CEO to a deployed, auditable, self-service system.

**Reduced inter-service latency by 50%**
Migrated Auth, Identity, and Access Portal service communication from REST to gRPC with Protocol Buffers, cutting authentication-path latency in half.

**Caught a compliance-critical bug before production**
Built a deliberate 26-employee, 7-category test dataset to stress-test the entitlement rule engine, uncovering an operator-leak bug that would have caused incorrect access grants in a compliance system.

**Reduced feed API latency by 77%**
Diagnosed and fixed four separate bottlenecks (missing index, unused DTO fields, no caching, unoptimised query) in the Cunocovo feed API, cutting load time from 3 seconds to 700ms.

**Led two zero-downtime production migrations**
AWS EC2 to Fly.io (Digital Upgraders) and OpenSearch index migration reindexing 5M+ documents (Intimec) — both executed without user-facing downtime.

**Refactored audit infrastructure for compliance**
Rebuilt the audit log schema at Intimec to remove PII exposure while preserving full forensic traceability, resolving a compliance risk.

**Fixed a data race condition under concurrent load**
Diagnosed and eliminated a notification duplication bug at Digital Upgraders caused by non-transactional concurrent writes.

**Resolved cross-platform rendering failures**
Fixed scroll jank and tap-registration failures on Android, iOS, and Safari using passive event listeners, requestAnimationFrame, and Intersection Observer, without any design system changes.

**Built and shipped bulk operations at scale**
Designed an async, chunk-based role assignment engine at Intimec supporting 5,000+ users per operation with real-time progress tracking and partial failure recovery.

**Authored onboarding infrastructure from scratch**
Reverse-engineered environment setup, wrote documentation, and created seed test data for a previously undocumented codebase.

---

## Open Source Achievements

**4 merged pull requests across 2 projects**

- **Apache Checkstyle** — [PR #18807](https://github.com/checkstyle/checkstyle/pull/18807) — Documentation contribution to a Java static analysis tool used by thousands of production projects.
- **OpenSRE (Tracer Cloud)** — [PR #3702](https://github.com/Tracer-Cloud/opensre/pull/3702) — Refactored scattered broad exception handling into a centralized, named exception hierarchy with a single `safe_execute()` boundary, improving auditability of fallback behavior in the agent harness.
- **OpenSRE (Tracer Cloud)** — [PR #3620](https://github.com/Tracer-Cloud/opensre/pull/3620) — Fixed stale documentation paths after an internal module reorganization, scoped precisely to the reported issue.
- **OpenSRE (Tracer Cloud)** — [PR #3618](https://github.com/Tracer-Cloud/opensre/pull/3618) — Removed a legacy constant no longer in use while preserving backward-compatible migration support for older installs, with care taken not to break uninstall cleanup.

---

## Personal Projects Shipped Solo

**Moodly — AI-powered mood-based experience booking platform**
Owned every layer: NestJS backend, FastAPI AI inference service, React Native mobile app, AWS deployment. Built a multimodal emotion detection pipeline (voice + facial) with async RabbitMQ processing reducing perceived wait time from 4-8 seconds to under 1 second.

**Memingo — AI-powered language learning platform**
Resolved a leaderboard bottleneck by replacing per-request computation with a Redis precomputed cache, reducing API response time from 30 seconds to 90ms.

---

## Academic and Competitive

- Runner-up, App Development Hackathon 2025 (Punjab University)
- Ranked, ICPC Asia Topi Online Programming Contest 2024
