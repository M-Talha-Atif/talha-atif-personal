# Project Portfolio

Last updated: July 2026

---

## Professional Projects

### IAM Access Portal — Intimec via MicroTechX

**Role:** Owner, end to end (backend, frontend, architecture)
**Complexity:** High
**Scale:** 5,000+ users per bulk operation, 8+ microservices, 10,000+ role hierarchy records
**Timeline:** Dec 2025 – Jun 2026

**What it is:** A self-service enterprise Identity Governance and Administration platform. Employees browse available access, submit scoped requests, and track approvals. Compliance teams define automated entitlement policies. Admins run bulk role operations at scale.

**My contribution:** Built the Access Portal from scratch — tile catalog, cart, multi-user requests, approval routing, provisioning. Designed the generic rule-based engine assigning roles and entitlements to identities through grouped condition evaluation. Migrated inter-service communication from REST to gRPC (50% latency reduction). Refactored audit infrastructure to be PII-free. Led a zero-downtime OpenSearch migration across 5M+ documents. Authored onboarding documentation and standardised the frontend theme and component library.

**Impact:** Replaced a fully manual, unauditable access process with a structured, compliant, self-service system now used company-wide.

**Key learning:** Event-driven architecture is the right choice when reliability matters more than speed — approval workflows don't need millisecond responses, they need to never silently lose an event.

---

### Cunocovo — Digital Upgraders LLC

**Role:** Full stack contributor
**Complexity:** Medium-High
**Scale:** Live production platform, real user base
**Timeline:** Sep 2025 – Jan 2026

**What it is:** A social platform for photographers, videographers, and creative professionals to share work and build community.

**My contribution:** Diagnosed and fixed a 3-second feed API bottleneck down to 700ms. Fixed a notification duplication race condition. Resolved cross-platform rendering failures on Android, iOS, and Safari. Led a zero-downtime migration from AWS EC2 to Fly.io.

**Impact:** 77% feed latency reduction, eliminated a production race condition, restored consistent behaviour across all client platforms, migrated infrastructure with zero user-facing downtime.

**Key learning:** Performance problems are rarely one thing. The feed slowdown had four separate causes, and fixing only one would have left the problem mostly unsolved.

---

## Personal Projects

### Moodly — AI-Powered Mood-Based Experience Booking Platform

**Role:** Solo owner
**Complexity:** High
**Scale:** Multimodal AI inference pipeline, async processing

**What it is:** A mobile platform that detects a user's mood through voice and facial analysis and recommends real-world experiences matched to that emotional state.

**My contribution:** Built the entire stack solo — NestJS backend, FastAPI AI inference service (HuBERT for voice, DeepFace for facial emotion), React Native mobile app, RabbitMQ async pipeline, AWS deployment.

**Impact:** Reduced perceived AI processing wait time from 4-8 seconds to under 1 second through async decoupling.

**Key learning:** Building a multi-service personal project alone means integration issues (like the .m4a vs .wav audio format mismatch between Expo and FastAPI) surface late if you don't test the seams early.

**Links:** [Demo](https://talha-atif.vercel.app/projects/moodly) | [Backend](https://github.com/M-Talha-Atif/AI-Moodler-Backend)

---

### Memingo — AI-Powered Language Learning Platform

**Role:** Solo owner
**Complexity:** Medium

**What it is:** An interactive language learning platform with AI-powered object detection vocabulary and a conversational AI tutor.

**My contribution:** Built the leaderboard system, fixed a major performance bottleneck, integrated Gemini API for conversational tutoring with session-aware context.

**Impact:** Reduced leaderboard API response time from 30 seconds to 90ms via Redis precomputed caching.

**Key learning:** Precomputing expensive calculations ahead of read-time is almost always better than optimising the calculation itself when read frequency is high.

---

## Open Source Contributions

### OpenSRE (Tracer Cloud)

**Role:** Contributor
**Complexity:** Medium

Merged 3 pull requests on an open source site reliability engineering / agent observability platform:

- **[PR #3702](https://github.com/Tracer-Cloud/opensre/pull/3702):** Refactored scattered exception handling in `evidence_agent.py` into a centralized, named exception hierarchy (`AgentExecutionError`, `GatherLlmLoadError`, `GatherEvidenceExecutionError`) with a single `safe_execute()` broad-catch boundary. Preserved existing fallback behavior while making it explicit and auditable. Verified with `ruff`, `mypy`, and 4 targeted pytest suites, all passing.
- **[PR #3620](https://github.com/Tracer-Cloud/opensre/pull/3620):** Fixed stale environment variable documentation paths after an internal module reorganization (`interactive_shell/ui/output` → `surfaces/interactive_shell/ui/output`), scoped precisely to the 4 environment variables named in the linked issue.
- **[PR #3618](https://github.com/Tracer-Cloud/opensre/pull/3618):** Removed an unused legacy constant (`LEGACY_TRACER_HOME_DIR`) while preserving the still-needed legacy migration path (`LEGACY_INTEGRATIONS_STORE_PATH`), and updated uninstall cleanup logic so older installs are still handled correctly. Verified with targeted pytest, mypy, and ruff checks.

**Key learning:** Contributing to someone else's production codebase requires narrower, more disciplined scoping than personal projects — every PR here was deliberately kept to exactly what the linked issue asked for, no more.

### Apache Checkstyle

**Role:** Contributor

**[PR #18807](https://github.com/checkstyle/checkstyle/pull/18807):** Merged documentation contribution to a Java static analysis tool used across thousands of production projects.

**Key learning:** Even a small documentation contribution to a widely-used Apache project requires understanding the existing conventions and contribution process, which is a different discipline than writing docs for your own codebase.
