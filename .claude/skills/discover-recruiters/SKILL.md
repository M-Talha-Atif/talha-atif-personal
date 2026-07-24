---
name: discover-recruiters
description: Find real technical recruiters, talent acquisition professionals, and technical sourcers currently and actively recruiting for Full-Stack/Backend/Java-Spring/Node-React/Applied AI/Agentic engineering roles matching this profile (~2+ years experience), to build a recruiter-outreach pipeline independent of company-by-company job discovery. Applies a strict recency filter (last 24h highest priority, generally excludes anything with no confirmed activity in 30+ days) and a quality filter that requires real evidence of CURRENT recruiting activity, not just a "Recruiter" title. Never guesses emails — only reports a verified email from an actual enrichment result. Persists only qualifying recruiters via sync-local-repo under Companies/Recruiters/<slug>/. Standalone workflow — does not modify discover-companies, discover-companies-browser, discover-startups, discover-startups-nonhiring, discover-founders, or any other existing skill.
---

# Discover Recruiters

Find real, currently-active technical recruiters, talent acquisition partners, and technical sourcers who are actually recruiting right now for roles matching this profile — not a generic list of anyone with "Recruiter" in their title. The objective is not merely to find recruiters; it's to find the ones who can realistically create **multiple** relevant job opportunities, so outreach effort compounds instead of resetting with every single company.

This is a **standalone discovery workflow**, independent of company-by-company job discovery. It never modifies `discover-companies`, `discover-companies-browser`, `discover-startups`, `discover-startups-nonhiring`, `discover-founders`, or any other existing skill — its only file-system effect is its own file, plus, via `sync-local-repo`, the shared `Companies/Recruiters/` local record.

## Workflow Position

```
discover-recruiters (standalone — parallel to discover-companies / discover-companies-browser)
        ↓
   sync-local-repo (shared persistence target — Companies/Recruiters/<slug>/)
        ↓
(future recruiter-outreach pipeline: draft a recruiter-specific message, human approval, send)
```

`discover-recruiters` does not feed into `research-company`, `find-relevant-contact`, or `find-contact-email` — those skills work per-company for direct outreach. A recruiter is a different kind of contact, tracked in its own namespace (`Companies/Recruiters/`) so it's never confused with a company record.

## Source of Truth (read these first, every run)

1. `career.md` — technical stack, role priority, experience level, honest weaknesses, competency matrix.
2. `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for specific claims about skills, technologies used, and metrics.
3. `Outreach/target-roles.md` — role priority tiers and the signal checklist for a strong-fit posting.
4. `Outreach/ideal-companies.md` — firm geographic constraint (India/Turkey exclusion) and company-type preferences, which extend to which recruiters are worth pursuing (a recruiter whose entire book is agencies/outsourcing shops career.md says to avoid is a weak target even if otherwise active).

## Hard Constraints (never violate)

- Never invent a recruiter, a company, a job posting, an activity date, or an email address.
- Never present speculation as fact. Tag every claim **Confirmed**, **Public Evidence**, **Inference**, or **Unknown**.
- **Never guess or pattern-generate an email address** (e.g. `first.last@company.com`), under any circumstance — the same hard rule `find-contact-email` follows. Only report an email as verified if a real enrichment provider (Apollo, Snov.io, or another connected tool) actually returned it as verified, or it's genuinely published publicly (e.g. printed on a speaker bio or official team page).
- **Never report an unverified email as verified.** If no verified email exists, report exactly: `Email: Not found`, plus the LinkedIn/public profile and the best available outreach channel.
- **Never confuse "recruiter at a company" with "recruiter currently hiring for relevant engineering roles."** A title match alone is not evidence of current activity — see Recruiter Quality Filter below.
- **Never treat an old profile or a stale job post as evidence of current recruiting activity.** Recency is checked explicitly, not assumed.
- **Do not bypass authentication, access controls, or CAPTCHAs** on LinkedIn or any other source. If a page isn't accessible, use Google-indexed public results, public recruiter pages, public job posts, company sites, or recruitment-agency sites instead — never circumvent a restriction to get there.
- **Do not pad the list.** Quality over quantity — thirty real, evidenced recruiters beats forty with half of them padding.
- Never modify `discover-companies`, `discover-companies-browser`, `discover-startups`, `discover-startups-nonhiring`, `discover-founders`, or any other existing skill file.

## Candidate Profile (what this recruiter needs to be recruiting for)

### Software Engineering
Full-Stack Engineer/Developer, Software Engineer, Backend Engineer, Java Engineer, Spring Boot Engineer, Node.js/MERN Engineer, React/Next.js Engineer.

### Applied AI / Agentic Engineering
AI Engineer, AI Developer, AI Full-Stack Engineer, LLM Engineer, Generative AI Engineer, Agentic AI Engineer, AI Application Engineer, LangChain Engineer, LangGraph Engineer, RAG Engineer, AI Automation Engineer.

### Relevant Stack
Java, Spring Boot, Node.js, JavaScript, TypeScript, React, Next.js, Python, REST, gRPC, Kafka, microservices, distributed systems, PostgreSQL, MongoDB, Redis, Docker, AWS, LangChain, LangGraph, RAG, LLM APIs, AI agents, tool calling, MCP, vector databases.

### Experience Target
Approximately 2+ years of professional software engineering experience.

### Seniority De-Prioritization
Do not prioritize a recruiter whose active searches are exclusively Staff Engineer, Principal Engineer, Lead Engineer, Architect, Engineering Manager, Director, VP, or CTO roles — **unless** that same recruiter is also recruiting for junior-to-mid-level engineering roles matching this profile. A recruiter working both bands is still a valid target for their non-senior searches.

## Target Recruiter Types (priority order)

1. Technical Recruiter
2. Engineering Recruiter
3. Technical Talent Acquisition Partner
4. Technical Sourcer
5. Startup Recruiter
6. Talent Partner
7. Recruiting Manager
8. Founder/Recruiter at an early-stage startup

### Strong Positive Signals
- Currently recruiting software engineers.
- Recently posted engineering vacancies.
- Works with startups or technology companies.
- Recruits internationally or remotely.
- Recruits from Pakistan or South Asia.
- Recruits for US, UK, Ireland, Canada, Netherlands, UAE/Dubai, Saudi Arabia, or other remote-friendly markets.
- Recent activity mentioning Java, Spring Boot, Node.js, React, full-stack, backend, AI, LLM, or agentic engineering specifically.

## Geographic Priority

Prioritize recruiters working with companies in, in this order: United States, United Kingdom, Canada, Ireland, Netherlands, UAE/Dubai, Saudi Arabia, Malaysia, and remote-first global companies generally.

**Pakistan hiring is a strong positive signal, not a requirement.**

**Reject** a recruiter whose entire active portfolio is India-only, Turkey-only, on-site-only, relocation-required, or otherwise clearly excludes Pakistan. A recruiter may still be included if they recruit globally overall even if some individual roles in their book are region-specific — the rejection is about the recruiter's *entire* portfolio being closed off, not about any single role.

## Recency Requirement (critical — this gates inclusion, not just ranking)

Prioritize evidence of activity in this order:

1. **Last 24 hours** — highest priority.
2. **Last 2-3 days.**
3. **Last 7 days.**
4. **Last 30 days** — the outer edge of "current."

Prefer recruiters who recently posted a job, shared a hiring announcement, announced an open engineering role, mentioned actively hiring, posted multiple relevant vacancies, or shared a job link/hiring call-to-action. **Do not treat an old profile or an old job post as evidence of current recruiting activity** — a recruiter whose most recent visible activity is months old goes to the Monitor List, not the ranked output, regardless of how good their historical fit looks. Record the exact activity date whenever possible; if only a relative date is available ("2 weeks ago"), record that and note it's an estimate.

## Recruiter Quality Filter

Only include a recruiter if there is evidence that:

1. The person exists (a real, findable individual, not a placeholder or a generic agency inbox).
2. Their current or recent role is genuinely related to recruiting.
3. Their recruiting activity is relevant to software engineering or applied AI specifically.
4. Their target geography or companies are relevant per Geographic Priority above.
5. There is real evidence of recent activity or current recruiting work — not just a static "Recruiter" title with no visible recent output.

**Do not create a generic list of random recruiters, and do not include someone merely because their title says "Recruiter."** A title match with no evidence of current, relevant, geographically-relevant activity does not clear this filter — it's either Monitor (if genuinely promising but stale) or excluded entirely (if there's nothing to go on).

## Search Strategy

Use every available legitimate search source — never rely on LinkedIn alone, and never bypass an access restriction to reach one that isn't otherwise available (see Hard Constraints).

### Example Query Patterns
- `"Technical Recruiter" Java Spring Boot remote`
- `"Engineering Recruiter" full stack remote`
- `"Technical Sourcer" backend engineer remote`
- `"Talent Acquisition" software engineer remote`
- `"Startup Recruiter" JavaScript React Node`
- `"AI Recruiter" LLM LangChain LangGraph`
- `"Technical Recruiter" Pakistan remote software engineer`
- `"recruiting software engineers" startup remote`
- `"actively hiring" Java engineer recruiter`
- `"actively hiring" full stack engineer recruiter`
- `"actively hiring" AI engineer recruiter`

### Sources
LinkedIn public search results where accessible (never behind an authentication bypass), recruiters' public profiles and public activity, company career pages, Greenhouse, Lever, Ashby, Workable, Wellfound, Remote OK, We Work Remotely, Himalayas, FlexJobs, Otta/Welcome to the Jungle, YC company pages, startup directories, recruitment agency websites, and public job posts indexed by Google.

If a LinkedIn page can't be reached directly, use Google-indexed public LinkedIn results, public recruiter pages, public job posts, company websites, or recruitment-agency sites instead of forcing access. This mirrors `discover-companies-browser`'s LinkedIn Safety Boundary: human-in-the-loop, interactive reading of what's actually visible — never an unattended scraper, never mass profile visits, never bypassing a restriction.

## Contact Information

Prioritize, in this order:

1. Verified professional email.
2. Public company email.
3. Verified email through an approved enrichment provider (Apollo, Snov.io, or another connected tool — use whichever is actually connected this session; never invent a tool name or field that hasn't been observed, per `find-contact-email`'s existing discipline).
4. Public LinkedIn profile.
5. Public company contact page.

**Never guess an email address. Never report an unverified email as verified.** If no verified email is available:

```
Email: Not found
LinkedIn: [public profile URL]
Outreach channel: LinkedIn or other verified public channel
```

## Scoring (0-5 per dimension, 40 points total)

- **Stack relevance** — how directly their recruiting activity matches the Relevant Stack above.
- **Current recruiting activity** — how much real, visible evidence exists that they're actively recruiting right now, not historically.
- **Geographic relevance** — alignment with Geographic Priority.
- **Remote/Pakistan compatibility** — per the same eligibility discipline `discover-companies` uses: never assume compatibility from "remote" alone; look for real signals (international team, EOR use, prior Pakistan/South Asia hires, explicit worldwide hiring language).
- **Experience-level fit** — how closely their active searches match the ~2+ years target band.
- **Recent activity** — the Recency Requirement above, scored directly (0-24h scores highest, 30d+ scores lowest without disqualifying).
- **Contactability** — how reachable they actually are (verified email > public company email > LinkedIn-only).
- **Outreach potential** — how much specific, genuine material exists to build a real, non-generic outreach message (a named current search, a specific stack mention, a specific company).

**Overall score: sum out of 40.** Show the reasoning per dimension, not just the number — a bare score without reasoning isn't useful for prioritization later.

## Workflow

### Step 1 — Load the profile
Read the Source of Truth files. Build a working model of target stack, experience level, and geographic constraints.

### Step 2 — Define this run's scope
State explicitly which recruiter types, stacks, or geographies this run is prioritizing, and which search sources will be used.

### Step 3 — Search
Run the example query patterns (and reasonable variations) across the listed sources, recency-first — start with queries/filters targeting the last 24 hours, expand to 2-3 days, 7 days, then 30 days only as needed, the same recency-first sequencing `discover-companies-browser` uses for job search.

### Step 4 — Recruiter Quality Filter
Apply the filter above to every candidate found. Reject fast (or route to Monitor, if genuinely promising but stale) — do not spend further research on a name that doesn't clear it.

### Step 5 — Recency check
Record the most recent relevant activity and its date (exact if available, relative + noted-as-estimate otherwise) for every candidate that passed Step 4. Anything with nothing inside the last 30 days moves to Monitor rather than the ranked list.

### Step 6 — Geographic and seniority check
Apply Geographic Priority and the Seniority De-Prioritization rule. Reject a recruiter whose entire active book is India-only/Turkey-only/on-site-only/relocation-required. Reject (or note as partial) a recruiter whose only active searches are Staff+/Director+/VP+/CTO-level.

### Step 7 — Contact research
Find contact information per the priority list above. Use connected enrichment tools (Apollo/Snov.io/etc.) if available for this session, following the exact discipline `find-contact-email` already established — real tool schemas only, never invented ones, never a guessed email.

### Step 8 — Score
Score each surviving recruiter on the 8 dimensions (0-5 each, 40 total), with reasoning per dimension.

### Step 9 — Produce the report
Use the Output Format below.

### Step 10 — Persist through sync-local-repo
For every recruiter who cleared the Quality Filter (Monitor-list recruiters are reported but only get a lightweight record — see Local Repository Integration), invoke `sync-local-repo`:
1. Search `Companies/Recruiters/*` first, using **name + company** as the primary identity key (not just name alone, since recruiter names aren't unique) — never create a duplicate.
2. If a record exists, update it: append new evidence, update `last_checked` and current-activity fields, never overwrite prior research that's still useful.
3. If no record exists, initialize one.
4. Record the sync result for the Output.

## Local Repository Integration

This skill uses a **distinct sub-namespace** so recruiters are never confused with company records:

```
Companies/
  Recruiters/
    <recruiter-slug>/
      recruiter.md
      opportunities.md
      contact.md
      status.json
```

- **`recruiter.md`** — who they are: name, current title, company/agency, location, recruiter type, relevant technologies, why they're relevant (Confirmed/Public Evidence/Inference/Unknown throughout).
- **`opportunities.md`** — the specific hiring evidence: current/recent open roles or hiring campaigns they're running, with source and date for each.
- **`contact.md`** — email (verified or "Not found"), verification status/provider, LinkedIn/public profile URL, best outreach channel.
- **`status.json`** — compact machine-readable state (see Status below), plus `last_checked` and the 8-dimension score.

**Identity key: name + company/agency**, not name alone — mirrors `sync-local-repo`'s own duplicate-prevention discipline, adapted for people instead of companies. Before writing anything, search for an existing record by that key. Never create a duplicate. If a record already exists: update it, preserve prior research, append new evidence, update `last_checked` and current-activity fields — never overwrite useful historical information just because this run found something new.

Only recruiters who cleared the Quality Filter and Recency Requirement (i.e., landed in the Top 30, Top 10, or Top 5 sections) get a full persisted record with a real status. Monitor List entries get a lightweight `recruiter.md` + `status.json` (status `Monitor`) so they're not lost, but without the full contact/opportunities research until they show fresher activity.

## Status

```
Discovered → Researching → Contact Found → Outreach Ready → Contacted → Replied → Opportunity Received
```

Terminal/alternative states, reachable from anywhere: `Rejected`, `Inactive`, `Monitor`.

A recruiter is only marked **Outreach Ready** when all of the following hold:
- They're relevant (cleared the Quality Filter).
- Current activity is reasonably supported (recency evidence within the acceptable window).
- The outreach channel is known (email or LinkedIn, specifically identified).
- Contact information is verified where applicable (never inferred as verified).

Never skip states silently, and never move a status backward — the same discipline `sync-local-repo` applies to company opportunities applies here.

## Output Format

### Top 30 Recruiters
Ranked by total score (40 points). For every recruiter:

```
## [Rank]. [Name] — [Current Title]

- Company/Agency: [name]
- Location: [city/country or Unknown]
- Recruiter type: [Technical Recruiter / Engineering Recruiter / Technical TA Partner / Technical Sourcer / Startup Recruiter / Talent Partner / Recruiting Manager / Founder-Recruiter]
- Relevant technologies: [stack terms actually evidenced]
- Current hiring evidence: [specific — a named role, a specific post, a specific campaign]
- Most recent activity date: [exact date, or relative + "estimate"]
- Relevant open roles/hiring campaigns: [list, with source links]
- Target hiring geography: [countries/regions]
- Pakistan compatibility: [evidence-based assessment, per discover-companies' eligibility discipline]
- Remote compatibility: [Confirmed/Inference/Unknown + detail]
- Experience-level compatibility: [assessment against ~2+ years target]
- Public LinkedIn/profile URL: [link]
- Verified email: [address, or "Not found"]
- Email verification status: [Verified / Not found — never "assumed"]
- Best outreach channel: [Email / LinkedIn / other]
- Score: [X/40] — [per-dimension breakdown with reasoning]
- Confidence level: [High/Medium/Low]
- Why this recruiter is relevant: [2-3 sentences, specific, not generic]
```

### Top 10 Immediate Outreach Candidates
Only recruiters with strong evidence of current activity and a realistic match. For each: why now, what they're currently hiring for, why this profile is relevant to that specific search, best outreach channel, and whether email or LinkedIn is preferable.

### Top 5 Highest-Value Recruiters
Recruiters who could plausibly connect this profile with **multiple** relevant opportunities, not just one job — prioritize startup-focused recruiters, technical recruitment agencies, recruiters running multiple active engineering searches at once, recruiters hiring internationally, and recruiters working with remote-first companies.

### Monitor List
Recruiters with strong relevance but insufficient evidence of current activity — state plainly why each is here rather than in the ranked list (e.g. "last visible hiring post 3 months ago; strong stack/geography fit otherwise").

### Final Summary
Report:
- Number of recruiters found
- Number with current activity within 24 hours
- Number active within 7 days
- Number with relevant engineering roles
- Number with verified email
- Number with LinkedIn/public contact only
- Number ready for immediate outreach (`Outreach Ready`)
- Number persisted to the local repository

If nothing found this run meets a reasonable bar, say so directly rather than padding the list — the same discipline `discover-companies` applies to opportunities applies here to recruiters.

## Workflow Boundary

This skill must NOT:

- Modify `discover-companies`, `discover-companies-browser`, `discover-startups`, `discover-startups-nonhiring`, `discover-founders`, or any other existing skill.
- Bypass authentication, access controls, or CAPTCHAs on any source.
- Build or run an unattended scraper or mass-collection workflow against LinkedIn or any other source.
- Guess or pattern-generate an email address, or report an unverified one as verified.
- Create a duplicate recruiter record when one already exists (matched by name + company).
- Mark a recruiter `Outreach Ready` without a known outreach channel and, where applicable, verified contact information.
- Draft outreach messages, find company contacts, or send anything — this skill only discovers, evaluates, and persists recruiter records.

It is a standalone discovery path into its own `Companies/Recruiters/` sub-namespace, not a replacement for or modification of any existing pipeline.
