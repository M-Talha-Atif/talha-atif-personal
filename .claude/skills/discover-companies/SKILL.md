---
name: discover-companies
description: Discover and score real, evidence-matched remote opportunities across two tracks — Software Engineering (Full-Stack/Backend/Java-Spring/Node-MERN/React-Next.js) and Applied AI + Full-Stack (AI/LLM/agentic engineering roles that are still hands-on software engineering, not research ML) — realistically executable from Pakistan, using career.md and Evidence/ as the source of truth. Applies a hard seniority filter (1-3 years primary target; rejects Staff/Principal/Lead/Architect/Engineering Manager/Director by default), a hard geographic filter (rejects on-site, hybrid, relocation-required, India-only, Turkey-only, and any country-restricted role that excludes Pakistan), and an aggressive recency priority (searches last-24h postings first, expanding only if needed, and generally excludes postings older than 30 days) before any deep research. Persists every opportunity that clears these gates into the local Companies/ record via sync-local-repo. Use when the user wants to find new companies or open roles worth researching and reaching out to — not for generic job-board browsing or writing outreach messages.
---

# Discover Companies

Find specific, real, currently-open remote software engineering opportunities that genuinely match this person's actual background AND that could realistically be executed while physically located in Pakistan — then score and report them. Never a generic job list, never a volume dump, and never a list of "remote" jobs that turn out to be on-site, hybrid, relocation-required, or country-restricted once you look closely.

This skill only discovers, researches, and scores opportunities. It does not draft outreach messages or resumes (that is a separate, future skill) and it does not directly write any file itself other than the report it produces — persisting a discovered opportunity into `Companies/<slug>/` is done exclusively by invoking the `sync-local-repo` skill (see Local Repository Integration below), never by this skill writing files directly.

## Workflow Position

```
discover-companies → sync-local-repo → research-company → sync-local-repo
  → find-relevant-contact → sync-local-repo → find-contact-email → sync-local-repo
  → prepare-outreach → sync-local-repo → draft-outreach → sync-local-repo
  → explicit human approval → send-outreach → sync-local-repo → (optional git commit/push)
```

The local repository (`Companies/<slug>/`, maintained by `sync-local-repo`) is the primary source of truth for this entire pipeline. Notion, if used at all, is a secondary operational dashboard synced from the local record — it is never required for this or any downstream skill to function.

## The Core Problem This Skill Solves

"Remote" is not a qualification by itself. Most job boards default to "Remote (US)," require on-site/hybrid attendance despite a "remote" label, require relocation, or restrict hiring to a specific country that doesn't include Pakistan. That is a hard mistake to avoid: **geographic and hiring eligibility must be checked immediately after discovering a candidate, before any deep technical research happens** — not as an afterthought at the end. Seniority mismatches are the same kind of trap: a title can say "Software Engineer" while the actual posting describes Staff-level ownership, or say "Senior" while the actual requirement is well within reach — the real posting text, not the title, is what decides.

The person running this skill is based in **Pakistan**, with **approximately 1-3 years of professional experience**. The objective is not "find remote jobs." The objective is: **find high-quality, hands-on engineering opportunities where a Pakistan-based engineer at this experience level has a realistic probability of being hired**, matched against their actual technical background — across both a Software Engineering track and an Applied AI + Full-Stack track.

## Source of Truth (read these first, every run)

Read in this order before doing anything else:

1. `career.md` — primary source of truth: career goals, role priority, technical stack, strengths, honest weaknesses, competency matrix, experience log, decision log, gaps.
2. `Evidence/projects.md` — detailed project writeups (professional, personal, open source).
3. `Evidence/achievements.md` — condensed achievement statements.
4. `Evidence/metrics.md` — every measured before/after number, with what changed. Only these numbers may be cited as fact.
5. `Evidence/technical-decisions.md` — architecture decisions with context, options considered, trade-offs, failure scenarios handled.
6. `Outreach/ideal-companies.md` — company-type preferences, firm geographic constraint, and the "companies already evaluated" reference table.
7. `Outreach/target-roles.md` — role priority tiers, signal checklist for a strong-fit posting, roles to decline.
8. `Outreach/strategy.md` — the broader search strategy this discovery work feeds into (context only, do not duplicate its content in the report).

Treat `career.md` as authoritative for goals and direction. Treat the `Evidence/` files as the only valid source for specific claims about skills, technologies used, and metrics. If a fact isn't in one of these files, it is not a fact you can assert about this person — it's either an inference (label it) or unknown (label it).

## Hard Constraints (never violate)

- Never invent experience, technologies, achievements, or metrics not present in `career.md` or `Evidence/`.
- Never claim the person has worked on something unless a specific file and line/section backs it up.
- Never assume a company is hiring without finding an actual, current, verifiable job posting or direct evidence of an open role. "This company seems like a good fit" is not a discovered opportunity — it's a lead that still needs a real posting before it goes in the report.
- Never present speculation as fact. Every claim in the report must be tagged as **Confirmed**, **Evidence**, **Inference**, or **Unknown** (see below).
- Never optimize for the number of opportunities found. Fifteen well-researched, genuinely relevant opportunities beat thirty shallow ones. If nothing this run clears a reasonable relevance bar, say so plainly instead of padding the report.
- Never violate the firm geographic constraint in `Outreach/ideal-companies.md`: exclude India-based and Turkey-based companies regardless of remote status, compensation, or role quality.
- Never treat a generic aggregator listing (LinkedIn "Easy Apply" spam, a scraped job board row with no company detail) as sufficient research on its own — always attempt to find the actual company, product, and hiring context behind it.
- **Never infer Pakistan compatibility merely because a job posting says "remote."** The word "remote" alone carries zero weight in the Pakistan Remote Eligibility Score. Only concrete evidence (see below) may raise the score.
- **Reject immediately, without deep research:** on-site roles in any country, hybrid roles requiring office attendance, relocation-required roles, India-only roles, Turkey-only roles, and any country-restricted role that explicitly or by enumeration excludes Pakistan. See Hard Geographic Rejection Rules below.
- **Never treat Staff, Principal, Lead, Architect, Engineering Manager, or Director roles as normal target opportunities.** Apply the Seniority Filter below immediately after discovery, before any deep research — it is cheaper to check than Pakistan eligibility (title + stated experience requirement only, no external research needed) and should run first.
- **Never mix an exceptional Staff/Principal/Lead/Director-tier opportunity into the main ranked list.** If one is exceptional enough to include at all, it goes in a separate, clearly labeled "Stretch Opportunities" section — never blended into the primary ranking.
- **Never judge seniority by title alone.** A "Senior" title is acceptable only when the actual stated experience requirement and responsibilities are realistically close to this profile's ~1-3 years documented level; a plain non-senior title can still be rejected if its actual requirements clearly exceed that.
- **Do not let a technically interesting company bypass the seniority filter.** No exception without an explicitly stated, genuinely exceptional reason — "the company looks great" is not sufficient on its own.
- **Do not restrict search to identity/IAM alone.** A strong Full-Stack, Backend, Software Engineering, or Applied AI role at a high-quality company is a valid target regardless of domain — domain priority (below) breaks ties and shapes search effort, it does not gate inclusion.
- **Do not prioritize pure research or highly theoretical ML roles** (roles requiring a PhD, publications, or deep specialized ML research) unless the role is unusually close to this profile's actual software-engineering-first Applied AI positioning.
- **Do not begin a search pass with an unfiltered, all-time historical search.** Start with a last-24-hours filter/sort, expanding to 48 hours, 7 days, then 14 days only if the candidate pool is insufficient. See Recency Priority below.
- **Do not treat a stale posting (30d+) as equivalent to a fresh one** merely because a job board still lists it as open, and do not treat an aggregator's "refreshed" date as a genuine repost without checking whether the platform actually indicates the role was reopened.

## Target Role Taxonomy

This profile targets two tracks. Both are valid primary targets — neither is a fallback for the other.

### Track 1 — Software Engineering (highest priority)

- Full-Stack Developer / Full-Stack Engineer
- Software Engineer
- Backend Engineer
- Java Developer / Java Engineer
- Spring Boot Engineer
- Node.js Engineer
- MERN Engineer
- React Engineer
- Next.js Engineer

### Track 2 — Applied AI + Full-Stack

- AI Engineer / AI Developer
- Applied AI Engineer
- AI Software Engineer
- AI Full-Stack Engineer / AI Full-Stack Developer / Full-Stack AI Engineer
- AI Product Engineer
- Software Engineer — AI Applications
- Generative AI Engineer
- LLM Application Engineer
- AI Platform Engineer
- AI Integration Engineer
- AI Workflow Engineer / AI Automation Engineer
- AI Agent Engineer / Agentic AI Engineer
- Conversational AI Engineer

The ideal role combines **Full-Stack Engineering + Backend Systems + Applied AI + Agentic Workflows** — a role doesn't need to hit all four to qualify, but the more of these that are genuinely present, the stronger the fit.

### Priority Order (approximate — adjust for actual technical fit, seniority, and remote eligibility)

1. Full-Stack Engineer / Full-Stack Developer
2. AI Full-Stack Engineer / AI Product Engineer
3. Software Engineer building AI products
4. Backend Engineer
5. AI Engineer / Applied AI Engineer
6. AI Agent Engineer / Agentic AI Engineer
7. Java / Spring Boot Engineer
8. Node.js / TypeScript Engineer
9. React / Next.js Engineer

This is a starting ordering, not a mechanical rule — a role lower on this list with an exceptional technical/company fit can outrank a role higher on the list with a weak fit. State the reasoning when overriding the default order.

## Fact-Labeling System

Every substantive claim in the output must be tagged with one of:

- **Confirmed** — directly verifiable from what was researched this run (e.g. "the job posting states this role is fully remote," "the company's site confirms 45 employees").
- **Evidence** — traced to a specific fact in `career.md` or `Evidence/` (e.g. "Evidence/metrics.md: gRPC migration cut inter-service latency 50%").
- **Inference** — a reasonable judgment call that isn't directly stated anywhere (e.g. "likely a Series A given the funding announcement date and headcount, though exact stage isn't disclosed"). Always say why.
- **Unknown** — could not be determined this run. Say so directly. Do not guess and do not omit the field silently — write "Unknown" and, if relevant, what would resolve it.

This same labeling discipline applies to the Pakistan Remote Eligibility Score — it is always an **estimate**, never a fact. Never write "this company can hire from Pakistan." Always write "Estimated Pakistan hiring compatibility: X/100" with the evidence behind the number.

## Seniority Filter

This is the **first** gate applied to every candidate, before the Pakistan Remote Eligibility Filter and before any deep research — it costs nothing but reading the posting's title and stated experience requirement, so there's no reason to run it after anything more expensive.

### Seniority Priority (in order)

1. **1-3 years experience** — primary target band.
2. **2-4 years experience** — secondary target band.
3. **3-5 years** — only when the technical fit is exceptionally strong; do not default to including these.

### "Senior" Titles

A "Senior" title (from either track in the Target Role Taxonomy above) is acceptable **only** when, on reading the actual posting:
- The stated experience requirement is reasonably close to this profile's documented ~1-3 years of production experience (career.md Section 1) — not a role clearly written for 5-7+ years.
- The responsibilities are hands-on engineering, not staff-level architecture ownership, org-wide technical strategy, or people management.
- The technical stack strongly matches (career.md Section 3 / Evidence/).
- Nothing in the posting signals it's actually a staff-level role wearing a "Senior" title as a courtesy (e.g. "define technical direction across multiple teams," "mentor senior engineers," "own architecture for the whole platform").

### Exclude by Default

- Staff Software Engineer / Staff Product Engineer / any Staff-tier title
- Principal Engineer / Principal Software Engineer
- Lead Engineer
- Software Architect
- Engineering Manager
- Director (any Director-level engineering role)

Do not spend significant research time on any of these once the title (or the posting's actual seniority signals) make the level clear — reject fast, the same way a hard geographic reject gets rejected fast. Log it briefly in the Rejected section (or the Stretch Opportunities section — see below) rather than researching it in depth.

**Exception:** an excluded-tier role may still be included, but only as an explicitly labeled **"Stretch Opportunity"** in its own separate section (never mixed into the main ranked list), and only when there's an exceptional reason to make an exception — e.g. the domain match is extraordinary or the actual stated requirements, despite the title, turn out to be genuinely close to this profile's level. State the exceptional reason explicitly. A technically interesting company is never, by itself, a sufficient reason to bypass this filter.

### Evaluating the Actual Role, Not Just the Title

Title is a first-pass signal, not the final word:
- A non-senior title (e.g. "Software Engineer," "AI Engineer") can still be rejected if the actual requirements (years of experience, ownership scope, required depth in an unfamiliar stack) clearly exceed this profile's documented level.
- A "Senior" title can be accepted if the actual requirements are reasonably close to this profile's level (see above).
- Read the real posting text for experience requirements ("X+ years"), ownership language ("own architecture," "set technical direction," "mentor the team"), and scope language ("across the platform," "for the org") — these matter more than the title itself.

### Seniority Filter Outcome

For every candidate, record one of:
- **Primary target** — matches a Track 1 or Track 2 title and requirements are in the 1-3 (or 2-4) year range.
- **Senior — accepted** — "Senior" title, but requirements/responsibilities verified as close to this profile's level.
- **Senior — rejected** — "Senior" title, but requirements/responsibilities are clearly beyond this profile's level (state why, e.g. "5+ years required").
- **Excluded by default** — Staff/Principal/Lead/Architect/Engineering Manager/Director title or equivalent scope, not exceptional enough to warrant a Stretch Opportunity exception.
- **Stretch Opportunity** — excluded-tier role, included anyway with an explicitly stated exceptional reason.

Only "Primary target" and "Senior — accepted" outcomes proceed to the Pakistan Remote Eligibility Filter as normal candidates. "Stretch Opportunity" outcomes proceed too, but are flagged for the separate Stretch section from this point forward. "Senior — rejected" and "Excluded by default" outcomes stop here — do not spend further research on them.

## Pakistan Remote Eligibility Filter

This is the second gate, applied only to candidates that passed the Seniority Filter above — **before** any deep technical, role, or company-quality research. Its job is to stop the skill from wasting research effort on opportunities that will never be realistically available regardless of technical fit.

### Hard Geographic Rejection Rules (check these first, reject immediately if any apply)

Reject immediately, without spending further research time, if the posting is:
- **On-site**, in any country.
- **Hybrid**, requiring office attendance of any frequency.
- **Relocation-required**, regardless of destination.
- **India-only** or **Turkey-only** (per the firm geographic constraint in `Outreach/ideal-companies.md` — this applies regardless of remote status, compensation, or role quality).
- **Country-restricted to a specific list that does not include Pakistan** — e.g. "Remote (US, Canada only)," "Remote (EU only)," "Remote (UK, Ireland, Poland)." An enumerated country list that omits Pakistan is a real restriction, not neutral silence.

The fact that a company is remote *somewhere in the world* is not sufficient — the specific role must realistically be executable from Pakistan.

### Categories (for roles that pass the Hard Geographic Rejection Rules)

**Category A — Pakistan-Compatible.** The posting or company clearly indicates one or more of:
- Worldwide / global remote hiring
- "Hire from anywhere"
- Remote across multiple countries, explicitly including Pakistan
- International contractor hiring
- EOR-based international hiring that can support Pakistan specifically
- Explicit Pakistan hiring
- Explicit Asia/South Asia/APAC hiring that realistically includes Pakistan
- A current or recent Pakistan-based employee is publicly evidenced (e.g. LinkedIn, team page, engineering blog byline)
- The company has a demonstrated history of hiring internationally outside its headquarters region

These generally pass the eligibility filter. A company already employing people from Pakistan, or with a demonstrated track record of hiring internationally, should score positively here — but this is a positive signal, not a requirement. The company does not need to explicitly mention Pakistan if the role is genuinely global-remote with no restriction that would exclude it.

**Category B — Probably Pakistan-Compatible.** No explicit Pakistan confirmation, but strong evidence hiring from Pakistan is realistically possible:
- Global remote company structure
- International distributed team (evidenced, not just claimed)
- Employees distributed across multiple countries/regions (evidenced via team pages, LinkedIn, engineering blog author locations)
- International contractor model
- EOR model (e.g. Deel, Remote.com, Oyster mentioned in job posting or careers page)
- Company has hired outside its headquarters country (evidenced)
- Job posting says "remote anywhere" without enumerating countries
- Company has existing employees in South Asia or nearby regions

Investigate further; can pass if evidence supports at least 60% likelihood.

**Category C — Uncertain.** Says "remote" but doesn't clarify allowed countries, employment model, geographic restrictions, visa requirements, or timezone restrictions. Do not assume Pakistan-compatible. Investigate further only if there are strong additional signals (e.g. distributed team evidence found elsewhere); otherwise this stays uncertain and is treated per the hard qualification rule below.

**Category D — Pakistan-Incompatible.** Already caught by the Hard Geographic Rejection Rules above in most cases; also reject early (do not spend significant research effort) if the opportunity explicitly requires:
- US citizenship
- US/EU/UK/Canada work authorization or visa
- Physical presence in a specific country with no international option
- A specific timezone requirement whose band excludes Pakistan Standard Time (UTC+5) by a wide margin

### Preferred Markets (positive signal, not a requirement)

Prioritize companies and opportunities headquartered in or primarily operating from:
- United States, United Kingdom, Canada, Netherlands, Ireland
- Malaysia, United Arab Emirates / Dubai, Saudi Arabia

Also consider other countries when the company offers genuine international remote work and strong compensation potential — this list shapes preference, it does not exclude companies outside it.

### Pakistan Remote Eligibility Score (0–100)

An evidence-based estimate of the likelihood the company could hire someone physically located in Pakistan. Always label it explicitly as **"Estimated Pakistan hiring compatibility"** — never present it as settled fact. Always explain the evidence behind the number in one or two lines.

- **90–100**: Explicitly Pakistan-compatible (Category A, direct confirmation)
- **75–89**: Strong global/international hiring evidence (Category A/B, no direct Pakistan confirmation but very strong distributed-hiring evidence)
- **60–74**: Probably possible but requires verification (Category B, moderate evidence)
- **40–59**: Uncertain (Category C, no useful signal either way)
- **0–39**: Probably incompatible (Category C with negative signals short of an explicit D-level requirement, or borderline D)

**The score must never be based only on the word "remote."** A listing that says "Remote" with no other signal sits at 40–50 (Uncertain), not higher, until further evidence is found.

### Research Signals (investigate for every candidate that isn't an obvious Category D)

Using public, professional, and company-related information only — never assume, always look:

1. Does the company explicitly state it hires internationally?
2. Does the company use contractors?
3. Does the company use an EOR (Deel, Remote.com, Oyster, Papaya Global, etc.)?
4. Does the company mention global hiring anywhere (careers page, job posting, engineering blog)?
5. Does the company have employees outside its headquarters country? (Check LinkedIn company page, team page, engineering blog author bios.)
6. Does the company have employees in Asia or South Asia specifically?
7. Does the company have employees in Pakistan specifically?
8. Does the company have a distributed engineering team? (Different timezones represented on the team page/LinkedIn.)
9. Does the job posting specify which countries are allowed?
10. Does the company require work authorization (and for which country)?
11. Does the company require physical presence anywhere?
12. Does the company have stated timezone requirements, and if so, how far are they from Pakistan Standard Time (UTC+5)?
13. Does the company have a track record of hiring remote engineers internationally (prior job postings, blog posts about the team, "our team across the world" type pages)?

### Hard Qualification Rule

For the primary opportunity list, only include opportunities with **Estimated Pakistan hiring compatibility ≥ 60**, unless the opportunity is exceptionally technically strong — in which case it goes into a separate **"Tier 3 — High-value but eligibility unclear"** section instead of being dropped silently. Never mix uncertain-eligibility opportunities into the actionable (Tier 1/Tier 2) list.

## Technical Fit

### Software Engineering Stack

Java, Spring Boot, Node.js, TypeScript, JavaScript, React, Next.js, MERN, REST APIs, gRPC, microservices, distributed systems, PostgreSQL, MongoDB, Redis, Kafka, Docker, Kubernetes, AWS, cloud platforms.

### Applied AI / Agentic Stack

Python, LangChain, LangGraph, CrewAI, AutoGen, OpenAI APIs, Anthropic APIs, LLM applications, RAG, vector databases, embeddings, AI agents, agentic workflows, tool calling, MCP, AI orchestration, AI evaluation, AI automation.

This profile's AI positioning is **Applied AI + Full-Stack/Backend Engineering, not pure research ML**. Score a role higher the more it looks like hands-on engineering with LLMs/agents integrated into a real product, and lower the more it looks like research, publications, or deep specialized ML theory requiring a PhD — per the Hard Constraints above, don't prioritize the latter unless it's unusually close to this software-engineering-first profile anyway.

## Domain Priority

Prioritize, in this order, when choosing where to spend search effort — but do not restrict the search to domain #1 alone (see Hard Constraints):

1. Identity, IAM, IGA, authentication, authorization, and security infrastructure
2. Social media, communication, collaboration, and community platforms
3. Developer tools and SaaS
4. AI products and AI infrastructure
5. Fintech
6. High-growth technology startups

A strong Full-Stack, Backend, Software Engineering, or Applied AI role at a high-quality company is a valid target regardless of which domain (or none of the above) it falls into.

## Recency Priority

Recency is an aggressive, near-gating priority — a technically excellent posting that's gone stale is a much weaker candidate than a fresh one, because stale postings are far more likely to already be filled or abandoned.

### Recency Bands

1. **0–24h** — posted or refreshed within the last 24 hours. Highest priority.
2. **24–48h** — very high priority.
3. **3–7d** — high priority.
4. **8–14d** — acceptable.
5. **15–30d** — include only if exceptionally strong (technical fit, seniority fit, and eligibility all genuinely strong, not just one dimension).
6. **30d+** — generally exclude, unless the company or posting explicitly confirms the role is still actively hiring (e.g. a "still accepting applications" note, a recent reshare, direct confirmation on the careers page) — do not assume staleness is fine just because the role still appears live on a job board.

**Do not treat a recently refreshed old listing as equivalent to a genuinely new job** unless the platform clearly indicates the role was reposted or actively reopened (not just re-indexed by an aggregator). A job board's "posted 2 days ago" on a listing that's actually been open for two months is not a 3–7d posting — check the original posting date on the company's own ATS/careers page when the aggregator's date looks suspicious.

### Recency as a Tie-Breaker

When multiple opportunities have similar technical, seniority, geographic, and company fit, **the more recently posted opportunity must rank higher.** Recency does not override a genuinely stronger fit on those other dimensions — it breaks ties and shapes priority among comparable candidates, per the ranking order in Step 8.

### Required Recency Fields (per opportunity)

Record for every opportunity, alongside the other Required Verification fields:
- **Posted date/time**, if available.
- **Last updated/refreshed date/time**, if available (and whether it reflects an actual repost/reopen vs. a passive re-index).
- **Age of posting**, in hours or days.
- **Recency category**: one of `0–24h`, `24–48h`, `3–7d`, `8–14d`, `15–30d`, `30d+`.

If a posting has no visible date at all, say so directly ("Unknown — platform does not expose a posting date") rather than guessing a recency category.

## Opportunity Pipeline

```
DISCOVERY
  ↓
SENIORITY FILTER (title + actual stated requirements — no research needed)
  ↓
REJECT STAFF/PRINCIPAL/LEAD/ARCHITECT/EM/DIRECTOR ROLES
  (unless exceptional → flagged as a separate Stretch Opportunity, never mixed into main tiers)
  ↓
HARD GEOGRAPHIC REJECTION (on-site / hybrid / relocation-required / India-only / Turkey-only / country-list excludes Pakistan)
  ↓
PAKISTAN ELIGIBILITY CHECK (for roles that passed the hard geographic gate)
  ↓
REJECT CLEARLY INCOMPATIBLE OPPORTUNITIES (Category D)
  ↓
RESEARCH ELIGIBILITY FOR UNCERTAIN OPPORTUNITIES (Category B/C)
  ↓
KEEP ONLY OPPORTUNITIES WITH >= 60 ESTIMATED PAKISTAN COMPATIBILITY
  (exceptionally strong sub-60 opportunities go to Tier 3 instead of being dropped)
  ↓
RECENCY CHECK (record posted/refreshed date, age, recency band; exclude 30d+ unless confirmed still active)
  ↓
TECHNICAL FIT ANALYSIS
  ↓
ROLE FIT ANALYSIS
  ↓
COMPANY QUALITY ANALYSIS
  ↓
COMPENSATION ANALYSIS
  ↓
PERSONALIZATION ANALYSIS
  ↓
FINAL RANKING
```

Deep technical/company/compensation research only happens for opportunities that clear the Seniority Filter, the Hard Geographic Rejection Rules, and the Pakistan eligibility gate. Do not spend research budget scoring the technical fit of a Staff/Principal/Lead/Director-tier posting, an on-site/hybrid/relocation-required posting, or a Category D opportunity in detail — reject any of these fast and move on.

## Workflow

### Step 1 — Load the profile
Read all files listed under Source of Truth. Build a working mental model of:
- Strongest technical capabilities (from the Competency Matrix and Evidence/metrics.md — prioritize what has hard numbers behind it: Kafka/event-driven systems, gRPC migrations, PostgreSQL/OpenSearch at scale, Spring Boot/Java, performance diagnosis, zero-downtime migrations, applied AI/RAG pipelines).
- Target roles in priority order (Target Role Taxonomy above, career.md Section 2, and `Outreach/target-roles.md`).
- Firm constraints (geography, company type to avoid, roles to decline).
- What "good fit" has looked like historically (the evaluated-companies table in `Outreach/ideal-companies.md`) — use this as a calibration reference, not a limit on where to look.

### Step 2 — Define the search scope for this run
Before searching, state explicitly (in your own reasoning, and briefly in the report's intro) what you're prioritizing this run: which role tier/track, which company types, which technical angle. Don't try to cover everything in one pass — a focused pass with real research beats a shallow pass across everything.

### Step 3 — Search broadly, by role first, then by company, and by recency first, then expanding

**Recency-first search sequencing:** start each search pass with queries and filters targeting jobs posted in the **last 24 hours** — most job boards and ATSs support a "posted today"/"last 24 hours" filter or sort-by-date; use it before running an unfiltered search. Only expand to 48 hours, then 7 days, then 14 days if the candidate pool from the tighter window is insufficient. Do not begin with broad historical searches (e.g. an unfiltered "all time" search) — that buries fresh, high-priority postings under stale ones and wastes research effort on roles that may already be filled.

**Search sources** — use at least these, as available:

LinkedIn Jobs, LinkedIn company pages, Google Search, Google Jobs, Glassdoor, Wellfound, Y Combinator Work at a Startup, Hacker News "Who's Hiring," We Work Remotely, Remote OK, Himalayas, Remotive, Working Nomads, Remote.co, Dynamite Jobs, Built In, Otta / Welcome to the Jungle, Arc.dev, FlexJobs, Jobspresso, NoDesk, Remote100K, HiringCafe, Greenhouse job boards, Lever job boards, Ashby job boards, Workable job boards, YC company pages, startup career pages, and direct company career pages.

Use job boards for discovery, but verify any opportunity worth including against the company's actual career page or ATS whenever possible — a job-board snippet alone is never sufficient research (see Hard Constraints).

**Search strategy — role first, then identify the strongest companies.** Example query patterns:
- "Full Stack Engineer remote 1-3 years"
- "Full Stack Developer remote 2-3 years"
- "Software Engineer remote Java Spring Boot"
- "Backend Engineer remote Java"
- "Java Developer remote international"
- "Spring Boot Engineer remote worldwide"
- "Node.js TypeScript Engineer remote"
- "React Next.js Engineer remote"
- "AI Engineer remote 1-3 years"
- "Applied AI Engineer remote"
- "AI Full Stack Engineer remote"
- "AI Agent Engineer remote"
- "Agentic AI Engineer remote"
- "LLM Application Engineer remote"
- "LangGraph Engineer remote"
- "LangChain Developer remote"
- "AI Software Engineer startup remote"

Search for currently open, recently-posted roles, not merely companies that sound interesting — a company without a real, currently-open, verified, sufficiently-recent posting is not a discovered opportunity (it can still go on the Monitor List, see Output below). Actively look for roles posted today and yesterday specifically, including postings from just the last few hours where the platform exposes an exact timestamp — these are the highest-priority finds, not an afterthought.

Do **not** spend most of the search budget on US-only YC/Work at a Startup listings — check eligibility signals immediately rather than assuming compatibility. Rebalance search effort toward sources more likely to surface Pakistan-compatible opportunities: globally distributed/remote-first companies, companies explicitly hiring worldwide or across multi-country lists, companies known to use EOR providers (Deel, Remote.com, Oyster, Papaya Global), companies with publicly visible distributed engineering teams, and companies with existing South Asian engineering teams.

### Step 4 — Seniority filter (immediately, before anything else — cheapest check first)
For every candidate surfaced in Step 3, before any eligibility or technical research:
1. Read the posting's title and its actual stated experience/responsibility requirements.
2. If the title is Staff/Principal/Lead/Architect/Engineering Manager/Director (or the actual responsibilities clearly amount to that level regardless of title), stop — record the Seniority Filter Outcome as "Excluded by default" and move on, unless there's a genuinely exceptional reason to flag it as a Stretch Opportunity (state the reason explicitly).
3. If the title matches a Track 1 or Track 2 role at a non-senior level, record "Primary target" and proceed.
4. If the title is "Senior [Role]," read the actual requirements against the "Senior" Titles criteria above and record "Senior — accepted" or "Senior — rejected" with the reasoning.
5. Only "Primary target," "Senior — accepted," and "Stretch Opportunity" outcomes proceed to Step 5.

### Step 5 — Hard geographic rejection, then Pakistan eligibility check
For every candidate that passed Step 4:
1. Check the Hard Geographic Rejection Rules first: on-site anywhere, hybrid, relocation-required, India-only, Turkey-only, or a country list that excludes Pakistan. If any apply, reject now — log it briefly for the Rejected section, don't dig further.
2. If it passed the hard rejection check, scan the posting for explicit country/citizenship/work-authorization/timezone language.
3. If it's Category A (explicit Pakistan/global/worldwide hiring), note the evidence and proceed to deep research.
4. If it's Category B or C, run the Research Signals checklist above — check the company's careers page, team/about page, LinkedIn company page, and any "our team" or "life at X" engineering blog content for distributed-hiring evidence — before assigning a score and deciding whether it clears 60.

### Step 6 — Deep research (only for opportunities that cleared Steps 4 and 5 at ≥ 60, or that are flagged for Tier 3 or Stretch)
For each surviving candidate, dig in:
- What does the company actually build? What's the core technical problem?
- Team size, funding stage/signal, engineering culture signals (code review, testing, documentation mentioned; ownership language in the posting).
- The actual job posting: title, responsibilities, required/preferred stack, employment type, location and remote policy, seniority signals, actual stated experience requirement.
- Compensation, if disclosed anywhere (posting, levels.fyi-style source, public range).
- Company location and legal/HQ jurisdiction (to enforce the geographic constraint in `Outreach/ideal-companies.md`, which is about company HQ/target-market preference and is separate from the Pakistan hiring-eligibility question).

### Step 7 — Compare against actual background and evidence
For each opportunity, explicitly map required/preferred skills in the posting against career.md's technical stack (both the Software Engineering stack and the Applied AI/Agentic stack, as applicable) and Evidence/ files. Identify:
- Which required skills are directly backed by evidence (cite the file/story).
- Which are adjacent/transferable but not literally used before (say so — don't blur this into a false match).
- Which are gaps, and whether career.md's honest weaknesses section already flags them.

### Step 8 — Score and rank the opportunity
Rank opportunities primarily by, in this order:
1. **Role fit** — alignment with the Target Role Taxonomy and Priority Order above.
2. **Seniority fit** — how close the actual stated requirement is to the 1-3 (or 2-4) year band.
3. **Ability to work from Pakistan** — the Pakistan Remote Eligibility Score.
4. **Technical match** — depth of real stack overlap (Software Engineering and/or Applied AI/Agentic stack).
5. **Compensation potential** — only score if there's real signal; otherwise mark Unknown.
6. **Company quality** — engineering maturity signals, product seriousness, funding/stability signal.
7. **Domain relevance** — per Domain Priority above, as a tiebreaker, not a gate.
8. **Outreach potential** — how much specific, genuine material exists to build real outreach on later.

**Recency is the tie-breaker on top of this ordering, not a 9th independent factor**: when two or more opportunities are comparable on role fit, seniority fit, Pakistan eligibility, and company quality, the one in the higher Recency Band (per Recency Priority above) ranks first. Recency never promotes a genuinely weaker opportunity above a genuinely stronger one on the primary dimensions above it.

Additionally record the 1-5 dimension scores below (with reasoning, not just the number) for the Output Format:
- **Technical fit** — how directly the role's required stack and problems match the Competency Matrix and Evidence/ (not just keyword overlap).
- **Role fit** — alignment with the Target Role Taxonomy and Priority Order.
- **Company quality** — engineering maturity, product seriousness, funding/stability, real product company vs. thin wrapper or outsourcing shop.
- **Growth potential** — room to grow technically and in scope.
- **Compensation potential** — X or Unknown; flag if a US/EU-market band may be adjusted downward for a Pakistan-based hire.
- **Personalization potential** — how much specific, genuine material exists to build real outreach on.
- **Strength of evidence I could contribute** — how many concrete, evidence-backed stories from career.md/Evidence/ would map convincingly to this role.

**Overall opportunity score**: a holistic judgment (not a mechanical average) weighted per the ranking order above — explain the weighting reasoning in one line per opportunity. The Pakistan Remote Eligibility Score is reported separately, not folded into this average, since it's a gate/qualifier rather than a quality dimension.

### Step 9 — Decide whether it's worth deeper research and outreach
State a clear recommendation: worth immediate outreach, worth monitoring/revisiting, worth a direct eligibility question, or not a fit (and why). Be honest when something doesn't clear the bar — the goal is signal, not encouragement.

### Step 10 — Produce the structured report
Use the format and structure below. Do not skip fields — mark them Unknown if not found.

### Step 11 — Persist every cleared opportunity to the local repository
For every opportunity in the ranked output, the Top 10, the Top 5, or the Monitor List (Rejected/Category D/Excluded-by-default opportunities are not persisted as accepted opportunities — they weren't real candidates, though a Monitor List entry for an exceptional company with no current open role may still get a lightweight company-only record), invoke `sync-local-repo` once per opportunity:
1. `sync-local-repo` normalizes the company name and checks `Companies/*` for an existing directory (by slug, name, or domain) and an existing opportunity entry (by job URL, then company + role) before creating anything — this skill never creates or names a company directory itself.
2. If no existing record is found, `sync-local-repo` initializes `Companies/<slug>/` and writes the opportunity's discovery-stage data: `company.md` (product/stage/size as discovered), `opportunities.md` (role, job URL, company URL, discovery date, Pakistan compatibility score/category, seniority filter outcome, recommendation), and `status.json` with `status: "Discovered"`.
3. If a record already exists for this exact opportunity (re-running discovery surfaced something already tracked), `sync-local-repo` updates only the discovery-stage fields and does not regress the status if it's already past `Discovered`.
4. Report the sync result (created/updated/already current, and the resulting local path) inline with that opportunity in the output — see Output Format.

## Local Repository Integration

This skill owns exactly one write path into the local record: the initial discovery-stage population of `company.md`, `opportunities.md`, and `status.json`'s `status: "Discovered"` plus `opportunity.role`/`opportunity.jobUrl`/`opportunity.companyUrl` — always via `sync-local-repo`, never by writing `Companies/` files directly. It never touches `contacts.md` or `outreach.md`, and never sets any status beyond `Discovered` (a later stage's `sync-local-repo` call is responsible for advancing it further). If `sync-local-repo` reports the opportunity already exists at a later status, accept that and do not overwrite it with discovery-stage data.

## Required Verification (per opportunity)

Before an opportunity appears in the ranked output, verify and record all of:

1. Company
2. Exact current job title
3. Live job URL
4. Company URL
5. Actual experience requirement (quote or closely paraphrase the posting)
6. Actual seniority level (per the Seniority Filter Outcome)
7. Employment type (full-time / contract, employee / contractor / EOR)
8. Remote eligibility (Confirmed/Inference/Unknown + detail)
9. Country restrictions (explicit list, or "none stated")
10. Whether Pakistan is realistically eligible (the Pakistan Remote Eligibility Score + category)
11. Technical stack
12. Technical fit (to this profile)
13. Seniority fit (to this profile)
14. Compensation signal (or Unknown)
15. Company quality
16. Domain relevance
17. Outreach potential
18. Posted date/time, if available
19. Last updated/refreshed date/time, if available
20. Age of posting (hours/days)
21. Recency category (`0–24h` / `24–48h` / `3–7d` / `8–14d` / `15–30d` / `30d+`)

## Output Format

For each opportunity that cleared both gates (or is placed in Tier 3):

```
## [Company Name] — [Role Title]

- **Job URL:** [link or "Unknown — could not locate a live posting"]
- **Company URL:** [link]
- **Location:** [city/country or "Unknown"]
- **Remote status:** [Confirmed/Inference/Unknown + detail]
- **Employment type:** [Full-time/Contract, Employee/Contractor/EOR]
- **Company stage/size:** [detail + Confirmed/Inference/Unknown tag]
- **Product/business summary:** [2-3 sentences, Confirmed from research]

**Seniority Filter Outcome:** [Primary target / Senior — accepted / Stretch Opportunity (with exceptional reason stated)]
**Actual experience requirement stated:** [e.g. "2-4 years" or "not specified" — quote or closely paraphrase the posting, don't infer]

**Posted:** [date/time, or "Unknown — platform does not expose a posting date"]
**Last updated/refreshed:** [date/time, or "Unknown" — note if this reflects an actual repost/reopen vs. passive re-index]
**Age:** [X hours / X days]
**Recency category:** [0–24h / 24–48h / 3–7d / 8–14d / 15–30d / 30d+]

**Estimated Pakistan hiring compatibility:** [0-100] — [Category A/B/C/D]
**Country restrictions:** [explicit list, or "none stated"]
**Evidence supporting Pakistan compatibility:** [specific evidence found — team page, EOR mention, distributed-hiring statement, existing South Asia/Pakistan employees, etc. — or "no positive evidence found beyond the word 'remote'"]
**Employment model:** [employee / contractor / EOR / unknown]
**Timezone requirements:** [stated requirement, or "none stated" — note distance from Pakistan Standard Time (UTC+5) if relevant]
**Work authorization requirements:** [stated requirement, or "none stated"]
**Pakistan-specific risks:** [e.g. "compensation band may be adjusted downward for Pakistan-based hires under their EOR provider"; "no evidence of any hire outside North America found"]
**Confidence level of the eligibility estimate:** [High/Medium/Low — based on how much direct evidence vs. inference the score rests on]

**Relevant technical context:** [what they actually build/use, tagged Confirmed/Inference]

**Why this matches the profile:** [explicit mapping to the Target Role Taxonomy/Priority Order + technical stack]

**Relevant evidence from the career workspace:**
- [Specific story/metric/decision, cited to file — e.g. "Evidence/technical-decisions.md, Decision 2: gRPC for sync lookups, Kafka for async — directly relevant to their event-driven order pipeline"]

**Scores (1-5, with reasoning):**
- Technical fit: X — [why]
- Role fit: X — [why]
- Company quality: X — [why]
- Growth potential: X — [why]
- Compensation potential: X or Unknown — [why]
- Personalization potential: X — [why]
- Strength of evidence I could contribute: X — [why]
- **Overall opportunity score: X/5** — [weighting reasoning, per the ranking order in Step 8]

**Key risks or unknowns:** [bullet list — be specific, e.g. "Team size not disclosed anywhere public"; "Posting is 6 weeks old, may already be filled"]

**Recommended next action:** [Pursue now / Pursue with direct eligibility question / Monitor / Pass — with a one-line reason]

**Local Repository Sync:** [Created / Updated / Already current] — `Companies/[slug]/` — status: `Discovered`
```

### Report Structure

The final report must be organized into exactly these four sections, in this order:

1. **Top [N] Ranked Opportunities** (up to 30) — every opportunity that cleared the Seniority Filter, the Hard Geographic Rejection Rules, and the Pakistan eligibility gate, ranked per Step 8's ordering, each with the full Required Verification data. If fewer than 30 pass the quality bar, list the actual number — never pad with on-site, hybrid, India-only, Turkey-only, relocation-required, seniority-incompatible, pure-research-ML, or weak-technical-fit roles just to approach 30.
2. **Top 10 Immediate Outreach Candidates** — the strongest realistic subset of the ranked list, chosen for combined role fit, seniority fit, eligibility confidence, and outreach potential. If fewer than 10 opportunities are genuinely ready for outreach (vs. needing a direct eligibility question first), say so explicitly rather than forcing 10.
3. **Top 5 Exact Technical Matches** — the strongest alignment specifically with Full-Stack Engineering, Java/Spring Boot, Node.js/TypeScript, React/Next.js, microservices/distributed systems, and Applied AI/LangChain/LangGraph/agentic workflows — regardless of where these five rank on the main list.
4. **Monitor List** — exceptional companies where no suitable role is currently open, or where a real role exists but was rejected on seniority/stack/geography grounds despite the company itself being exceptional. State plainly why each is on this list rather than the ranked list.

A fifth, unlabeled short log — **Rejected** — may follow for clearly incompatible opportunities (hard geographic rejects, Category D, Excluded-by-default on seniority), listed briefly with the disqualifying evidence, not deeply researched. This is a log, not a researched section, and is not one of the four required output sections.

Precede the full report with a short intro stating: what this run focused on (Step 2), how many candidates were considered, how many were excluded by the Seniority Filter, how many were excluded by the Hard Geographic Rejection Rules, how many were excluded for being too stale (30d+ with no confirmation still active), how many cleared the Pakistan eligibility gate, the recency-band breakdown of what's in the final report (e.g. "6 in 0–24h, 9 in 24–48h, 11 in 3–7d, 4 in 8–14d"), and a brief note on search-source coverage this run.

If nothing found this run meets a reasonable bar, say that directly instead of stretching weak candidates to fill space. Quality over hitting a target count applies to every gate in this pipeline — a title-matched, geography-matched, but shallow list is not the goal.
