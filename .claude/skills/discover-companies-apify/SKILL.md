---
name: discover-companies-apify
description: High-volume company/opportunity discovery using the connected Apify integration as the primary discovery engine (job-posting actors, LinkedIn/company-signal actors, general web-scraping actors) — for Full-Stack/Backend/Java-Spring/Node-React/Applied AI/Agentic engineering roles matching this profile. Every Apify-sourced result is treated as unverified until cross-checked against the company's actual career page or ATS (Greenhouse/Lever/Ashby/Workable) or a legitimate job platform — Apify gives breadth and speed, the verification pass gives trust. Applies the same seniority filter (1-3yr primary, reject Staff/Principal/Lead/Architect/Manager/Director/VP by default) and hard geographic filter (reject on-site/hybrid/relocation-required/India-only/Turkey-only/any-geography-excluding-Pakistan) as the rest of the discovery pipeline. Persists only verified opportunities via sync-local-repo. Standalone — does not modify discover-companies (which remains Olostep-based) or any other existing skill.
---

# Discover Companies (Apify)

Use the connected **Apify** integration as a high-volume, high-speed discovery engine for real, currently-open Software Engineering and Applied AI opportunities — then verify every promising result against a primary source before treating it as real. Apify is for breadth and speed; the verification pass is what makes a result trustworthy enough to act on.

**This skill never modifies `discover-companies`, which stays Olostep-based and unchanged.** It is a fully independent workflow that happens to share the same profile, seniority filter, geographic filter, and local-repository target as every other discovery skill in this pipeline (`discover-companies`, `discover-companies-browser`, `discover-recruiters`).

## Workflow Position

```
discover-companies (Olostep-based, primary automated web research)
discover-companies-browser (Claude in Chrome / Browser pane, interactive research)
discover-companies-apify (Apify-based, high-volume actor-driven discovery)  ← this skill
        ↓ (all three feed the same target)
   sync-local-repo (shared persistence target — Companies/<slug>/)
        ↓
research-company → find-relevant-contact → find-contact-email → prepare-outreach
  → draft-outreach → explicit human approval → send-outreach → sync-local-repo
```

All three discovery skills feed the same `Companies/` local record through `sync-local-repo`. None owns the pipeline exclusively.

## Apify Connector Availability (check this first, every run)

Apify's exact tool names and actor set are connection-specific and were **not observed as connected** as of the last check in this workspace. Every run of this skill must:

1. Check for available Apify tools (search for tools with "apify" in the name; if none are loaded, use the MCP registry search/list-connectors tools to check whether Apify is actually connected this session).
2. If no Apify connector is available, **stop immediately** and report: `Apify is not connected in this environment. This discovery run cannot proceed until it is.` Then follow the registry's normal flow for suggesting the connector if the user wants to connect one — do not substitute Olostep, WebSearch, or any other tool as a silent fallback (that's what `discover-companies` and `discover-companies-browser` are for; mixing sources here defeats the point of having a dedicated Apify-only engine to compare against them).
3. If Apify **is** available, read its actual tool/actor schema before calling anything. **Never hardcode or assume a specific Apify actor name, input schema, or field name in advance** — Apify exposes different actors depending on what's actually configured for this connection, and inventing a plausible-sounding actor (e.g. a guessed `apify_linkedin_jobs_scraper` call with invented input fields) is exactly what this skill must not do. Discover the real, callable actors/tools first, then use them.

## Source of Truth (read these first, every run)

1. `career.md` — technical stack, role priority, experience level, honest weaknesses, competency matrix.
2. `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for specific claims about skills, technologies used, and metrics.
3. `Outreach/ideal-companies.md` — firm geographic constraint (India/Turkey exclusion) and company-type preferences.
4. `Outreach/target-roles.md` — role priority tiers and the signal checklist for a strong-fit posting.

## Hard Constraints (never violate)

- Never invent a company, a job posting, a posting date, or an Apify actor/tool/field that hasn't actually been observed this run.
- **Apify results are not automatically verified.** A result surfaced by an Apify actor is a lead, not a discovered opportunity, until it clears the Critical Verification Rule below.
- Never treat a LinkedIn result (surfaced via Apify or otherwise) as sufficient proof a job is currently open — cross-check against the company's own career page/ATS whenever reasonably possible.
- **Reject immediately:** on-site roles, hybrid roles, relocation-required roles, India-only roles, Turkey-only roles, and any role explicitly restricted to a country/region that excludes Pakistan.
- **Reject by default:** Staff Engineer, Principal Engineer, Lead Engineer, Architect, Engineering Manager, Director, VP — regardless of title, check the actual stated experience requirement and job description. Do not trust the title alone in either direction: a "Software Engineer" posting can still be rejected if the real requirement is senior; a role that merely sounds senior isn't automatically excluded if the actual requirement is in range (though titles literally reading Staff/Principal/Lead/Architect/Manager/Director/VP are excluded by default per above).
- Never present speculation as fact. Tag every claim **Confirmed**, **Evidence**, **Inference**, or **Unknown**.
- Do not pad the results to reach 30. If fewer than 30 genuine opportunities pass every filter, report the actual number and explain the specific bottleneck (e.g. "Apify's job-posting actor surfaced 40 candidates; 22 failed geographic verification, 11 failed seniority, 3 were closed on the original ATS, 4 passed").
- Never modify `discover-companies`, `discover-companies-browser`, `discover-recruiters`, or any other existing skill file.

## Target Role Taxonomy

### Primary Roles (priority order)
1. Full-Stack Engineer / Full-Stack Developer
2. Software Engineer
3. Backend Engineer
4. Java Engineer
5. Spring Boot Engineer
6. Node.js / MERN Engineer
7. React / Next.js Engineer
8. AI Engineer
9. AI Developer
10. AI Full-Stack Engineer
11. Agentic AI Engineer
12. LLM Application Engineer

Full-stack engineering should generally rank above generic backend roles when the fit is otherwise comparable. Applied AI + full-stack roles rank highly when they involve practical software engineering, not pure research.

## Seniority Filter

- **Strongly prioritize:** 1-3 years, 2-4 years.
- **Consider 3-5 years only** when the technical and company fit is exceptionally strong — do not default to including these.
- **Reject by default:** Staff Engineer, Principal Engineer, Lead Engineer, Architect, Engineering Manager, Director, VP.
- **Do not trust the job title alone.** Inspect the actual experience requirement and job description text for every candidate before accepting or rejecting on seniority grounds — a non-senior title with staff-level scope language ("own architecture for the whole platform," "mentor senior engineers," "set technical direction org-wide") is excluded just as much as an explicit Staff/Principal title.

## Technical Fit

### Backend / Full Stack
Java, Spring Boot, Node.js, TypeScript, JavaScript, React, Next.js, REST APIs, GraphQL, microservices, distributed systems, PostgreSQL, MongoDB, Redis, Kafka, Docker, Kubernetes, AWS.

### Applied AI / Agentic Engineering
Python, LLM applications, LangChain, LangGraph, CrewAI, AutoGen, RAG, vector databases, embeddings, tool calling, MCP, AI agents, agentic workflows, AI-powered SaaS, AI + backend/full-stack engineering.

**Do not prioritize pure ML research, PhD-level research, or roles requiring deep academic machine-learning research** unless the role is clearly practical application engineering.

## Hard Geographic Rejection Rules

Reject immediately, without spending further verification effort:
- On-site roles, in any country.
- Hybrid roles, requiring office attendance of any frequency.
- Relocation-required roles, regardless of destination.
- India-only or Turkey-only roles (per `Outreach/ideal-companies.md`'s firm geographic constraint).
- Any role explicitly restricted to a country or region that excludes Pakistan.

### Preferred Markets (positive signal, not a requirement)
United States, United Kingdom, Ireland, Canada, Netherlands, Malaysia, UAE/Dubai, Saudi Arabia.

**The job posting does not need to explicitly mention Pakistan.** A genuinely global remote role is a valid opportunity if there's no geographic restriction that excludes it. Prioritize companies that hire globally, have distributed teams, have existing international employees, have previously hired remotely from multiple countries, or have contractors/remote employees in Asia — these are positive eligibility signals per the same Pakistan Remote Eligibility Filter logic `discover-companies` uses (Category A/B/C/D), not a separate scale.

## Company Fit

Prioritize: VC-backed startups, Silicon Valley startups, high-growth technology companies, SaaS companies, developer infrastructure companies, identity/access-management companies, authorization/governance companies, AI startups, fintech companies, social/collaboration platforms, developer tools companies.

Company size can range from early-stage startups to established technology companies. **Do not reject a company simply because it isn't currently hiring** if it's an exceptional technical/cultural fit — route it to the Monitor List instead. Only currently-open, verified roles belong in the actionable ranked output.

## Apify Discovery Strategy

Use the connected Apify integration as the **primary** discovery source for this skill — job-posting actors, LinkedIn job/company-signal actors, public recruiter/hiring-signal actors, general web-scraping actors, or whatever combination of actors is actually available once the Apify Connector Availability check above passes. Use multiple relevant actors where available rather than relying on a single one.

### Example Query Patterns
`"full stack engineer remote"`, `"full stack developer remote"`, `"software engineer remote"`, `"backend engineer remote"`, `"java spring boot remote"`, `"node.js engineer remote"`, `"react next.js engineer remote"`, `"AI engineer remote"`, `"AI full stack engineer remote"`, `"agentic AI engineer remote"`, `"LangChain engineer remote"`, `"LangGraph engineer remote"`, `"LLM application engineer remote"`, `"AI developer remote"`.

### By Geography / Company Type
`"remote startup software engineer"`, `"remote SaaS startup engineer"`, `"remote fintech engineer"`, `"remote identity startup engineer"`, `"remote developer tools startup engineer"`, `"remote AI startup engineer"`.

### Recency
Search recent postings aggressively — prioritize last 24 hours, then last 48 hours, then last 7 days, the same recency-first sequencing the rest of this pipeline uses. Record the exact posting date (as exposed by the actor/source) and the discovery date (today) for every candidate.

## Critical Verification Rule (Apify results are leads, not opportunities)

For every promising result surfaced through Apify, extract:
1. Company name
2. Role title
3. Job URL
4. Original source URL (the page/actor the result came from)
5. Posting date
6. Location/remote wording
7. Experience requirement
8. Technology requirements

Then **verify** it against the company's actual career page or ATS whenever reasonably possible: Greenhouse, Lever, Ashby, Workable, Wellfound, Remote OK, We Work Remotely, Himalayas, Remotive, the official company career page, or another legitimate job platform.

**Do not treat a LinkedIn or Apify result alone as sufficient proof a job is currently open.** Reject:
- Closed or expired jobs.
- Duplicate jobs (same role already tracked from this or a prior run).
- Jobs where the original posting cannot be verified when verification is reasonably possible.
- Jobs whose actual description contradicts the title (e.g. titled "Software Engineer" but the real requirement is Staff-level, or titled full-stack but scoped as pure frontend).

## Ranking

Rank verified opportunities using, in this order:
1. Role fit
2. Seniority/experience fit
3. Remote compatibility
4. Ability to work from Pakistan
5. Technical match
6. Compensation potential
7. Company quality
8. Startup/growth potential
9. Domain relevance
10. Outreach potential

## Workflow

### Step 1 — Confirm Apify availability
Per Apify Connector Availability above. Stop and report if unavailable — do not substitute another discovery method silently.

### Step 2 — Load the profile
Read the Source of Truth files. Build a working model of target roles/stack, experience level, and geographic constraints.

### Step 3 — Define this run's scope
State explicitly which actors/query patterns this run is using and why, before running them.

### Step 4 — Run Apify discovery
Execute the relevant actors/queries per Apify Discovery Strategy above, recency-first (last 24h → 48h → 7 days). Record every candidate's raw extracted fields (the 8 fields under Critical Verification Rule) before doing anything else.

### Step 5 — Seniority filter
Apply the Seniority Filter to every candidate. Reject fast (title-based exclusions) or after reading the real requirement text (title-ambiguous cases). Log rejections with the reason.

### Step 6 — Hard geographic rejection
Apply the Hard Geographic Rejection Rules to every candidate that passed Step 5. Reject fast; log rejections with the reason.

### Step 7 — Verification
Walk the Critical Verification Rule for every remaining candidate — cross-check against the original career page/ATS. Reject closed/expired/duplicate/contradictory postings even if Apify still lists them as live.

### Step 8 — Technical and company fit
Map each verified opportunity's required stack against career.md/Evidence/ (Confirmed/Evidence/Inference/Unknown), and assess company fit per Company Fit above.

### Step 9 — Rank
Apply the Ranking order above.

### Step 10 — Produce the report
Use the Output Format below.

### Step 11 — Persist through sync-local-repo
For every **verified, actionable** opportunity:
1. Search `Companies/*` first — never create a duplicate company record.
2. If a record exists, read the existing files first, preserve historical information, add the new opportunity rather than overwriting, and update status appropriately.
3. If no record exists, initialize one via `sync-local-repo`.
4. Record the discovery source as `Apify` explicitly, and retain: discovery source, original source URL, job URL, discovery date, posting date, verification date, current status.
5. Only opportunities that passed every gate above get persisted — Monitor List entries get a lightweight record at most (company/domain fit noted, no accepted opportunity).

## Output Format

### 1. Top 30 Ranked Opportunities
For each: Rank, Company, Role, Job URL, Original discovery source, Source URL, Exact posting date, Discovery date, Location, Remote status, Pakistan compatibility, Experience requirement, Seniority fit, Technical stack, Technical fit score, Company quality, Domain, Compensation signal, Outreach potential, Verification status, Why it fits this profile, Key risks.

### 2. Top 10 Immediate Outreach Candidates
Only genuinely actionable opportunities: currently open role, suitable seniority, genuine remote status, no geographic restriction excluding Pakistan, strong technical fit, a legitimate company, a realistic outreach path.

### 3. Top 5 Exact Technical Matches
Ignore geographic uncertainty temporarily — identify the strongest technical matches regardless of eligibility clarity. Mark each clearly as: Actionable from Pakistan / Eligibility unclear / Geographically restricted.

### 4. Monitor List
Strong companies with no current suitable opening, companies with excellent technical fit but uncertain eligibility, and companies likely to hire similar roles soon.

If nothing found this run meets a reasonable bar, say so directly instead of stretching weak candidates to fill space. Do not pad to 30 — report the actual number and the specific bottleneck.

## Workflow Boundary

This skill must NOT:

- Modify `discover-companies`, `discover-companies-browser`, `discover-recruiters`, or any other existing skill.
- Invent an Apify actor name, input schema, or output field that hasn't actually been observed this run.
- Treat an Apify or LinkedIn result as a verified opportunity without cross-checking the original career page/ATS.
- Persist a closed, expired, duplicate, or contradictory posting.
- Create a duplicate company record when one already exists in `Companies/`.
- Draft outreach, find contacts, find emails, or send anything — this skill only discovers and verifies opportunities.

It is a complementary, Apify-driven discovery path into the same shared local repository — not a replacement for `discover-companies` or `discover-companies-browser`.
