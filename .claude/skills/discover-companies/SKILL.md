---
name: discover-companies
description: Discover and score real, evidence-matched software engineering opportunities (backend, full-stack, Java/Spring Boot, distributed systems, platform/infra, AI-adjacent) at startups and product companies that can realistically hire someone based in Pakistan, using career.md and Evidence/ as the source of truth. Use when the user wants to find new companies or open roles worth researching and reaching out to — not for generic job-board browsing or writing outreach messages.
---

# Discover Companies

Find specific, real, currently-open software engineering opportunities that genuinely match this person's actual background AND that could realistically hire someone physically located in Pakistan — then score and report them. Never a generic job list, never a volume dump, and never a list of "remote" jobs that turn out to be US/EU-only once you look closely.

This skill only discovers, researches, and scores opportunities. It does not draft outreach messages or resumes (that is a separate, future skill) and it does not modify any file in this workspace other than the report it produces.

## The Core Problem This Skill Solves

"Remote" is not a qualification by itself. Most YC/startup job boards default to "Remote (US)" or require US/EU/Canada work authorization even when the listing says "remote." Prior runs of this skill spent most of the research budget on US-only listings that turned out to be ineligible after the fact. That is now a hard mistake to avoid: **geographic and hiring eligibility must be checked immediately after discovering a candidate, before any deep technical research happens** — not as an afterthought at the end.

The person running this skill is based in **Pakistan**. The objective is not "find remote jobs." The objective is: **find high-quality software engineering opportunities where a Pakistan-based engineer has a realistic probability of being hired**, matched against their actual technical background.

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
- Never optimize for the number of opportunities found. Five well-researched, genuinely relevant opportunities beat thirty shallow ones. If nothing this run clears a reasonable relevance bar, say so plainly instead of padding the report.
- Never violate the firm geographic constraint in `Outreach/ideal-companies.md`: exclude India-based and Turkey-based companies regardless of remote status, compensation, or role quality.
- Never treat a generic aggregator listing (LinkedIn "Easy Apply" spam, a scraped job board row with no company detail) as sufficient research on its own — always attempt to find the actual company, product, and hiring context behind it.
- **Never infer Pakistan compatibility merely because a job posting says "remote."** The word "remote" alone carries zero weight in the Pakistan Remote Eligibility Score. Only concrete evidence (see below) may raise the score.

## Fact-Labeling System

Every substantive claim in the output must be tagged with one of:

- **Confirmed** — directly verifiable from what was researched this run (e.g. "the job posting states this role is fully remote," "the company's site confirms 45 employees").
- **Evidence** — traced to a specific fact in `career.md` or `Evidence/` (e.g. "Evidence/metrics.md: gRPC migration cut inter-service latency 50%").
- **Inference** — a reasonable judgment call that isn't directly stated anywhere (e.g. "likely a Series A given the funding announcement date and headcount, though exact stage isn't disclosed"). Always say why.
- **Unknown** — could not be determined this run. Say so directly. Do not guess and do not omit the field silently — write "Unknown" and, if relevant, what would resolve it.

This same labeling discipline applies to the Pakistan Remote Eligibility Score — it is always an **estimate**, never a fact. Never write "this company can hire from Pakistan." Always write "Estimated Pakistan hiring compatibility: X/100" with the evidence behind the number.

## Pakistan Remote Eligibility Filter

This is a gate that runs immediately after a candidate opportunity is discovered — **before** any deep technical, role, or company-quality research. Its job is to stop the skill from wasting research effort on opportunities that will never be realistically available regardless of technical fit.

### Categories

**Category A — Pakistan-Compatible.** The posting or company clearly indicates one or more of:
- Worldwide / global remote hiring
- "Hire from anywhere"
- Remote across multiple countries, explicitly including Pakistan
- International contractor hiring
- EOR-based international hiring that can support Pakistan specifically
- Explicit Pakistan hiring
- Explicit Asia hiring that includes Pakistan
- A current or recent Pakistan-based employee is publicly evidenced (e.g. LinkedIn, team page, engineering blog byline)
- The company has a demonstrated history of hiring internationally outside its headquarters region

These generally pass the eligibility filter.

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

**Category D — Pakistan-Incompatible.** Reject early (do not spend significant research effort) if the opportunity explicitly requires:
- US citizenship
- US work authorization / US visa
- Physical presence in the United States
- A specific US state or US timezone with no international option
- EU work authorization
- UK work authorization
- Canada work authorization
- Any location-specific employment model where Pakistan is clearly excluded

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

## Opportunity Pipeline

```
DISCOVERY
  ↓
PAKISTAN ELIGIBILITY CHECK
  ↓
REJECT CLEARLY INCOMPATIBLE OPPORTUNITIES (Category D)
  ↓
RESEARCH ELIGIBILITY FOR UNCERTAIN OPPORTUNITIES (Category B/C)
  ↓
KEEP ONLY OPPORTUNITIES WITH >= 60 ESTIMATED PAKISTAN COMPATIBILITY
  (exceptionally strong sub-60 opportunities go to Tier 3 instead of being dropped)
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

Deep technical/company/compensation research (the old Steps 4–6) only happens for opportunities that clear the eligibility gate. Do not spend research budget scoring the technical fit of a Category D opportunity in detail — reject it fast and move on.

## Workflow

### Step 1 — Load the profile
Read all files listed under Source of Truth. Build a working mental model of:
- Strongest technical capabilities (from the Competency Matrix and Evidence/metrics.md — prioritize what has hard numbers behind it: Kafka/event-driven systems, gRPC migrations, PostgreSQL/OpenSearch at scale, Spring Boot/Java, performance diagnosis, zero-downtime migrations, applied AI/RAG pipelines).
- Target roles in priority order (career.md Section 2 / Outreach/target-roles.md).
- Firm constraints (geography, company type to avoid, roles to decline).
- What "good fit" has looked like historically (the evaluated-companies table in `Outreach/ideal-companies.md`) — use this as a calibration reference, not a limit on where to look.

### Step 2 — Define the search scope for this run
Before searching, state explicitly (in your own reasoning, and briefly in the report's intro) what you're prioritizing this run: which role tier, which company types, which technical angle. Don't try to cover everything in one pass — a focused pass with real research beats a shallow pass across everything.

### Step 3 — Search for companies and open roles (optimized for Pakistan-realistic hiring)
Do **not** spend most of the search budget on US-only YC/Work at a Startup listings — that was the biggest inefficiency in prior runs, since most of those require US citizenship/visa or physical US presence. Rebalance search effort toward sources more likely to surface Pakistan-compatible opportunities:

- Globally distributed startups and remote-first companies (search explicitly for "hire from anywhere," "work from anywhere," "distributed team")
- Companies explicitly hiring worldwide or across specific multi-country lists that include Pakistan or "Asia"/"South Asia"
- Companies known to use EOR providers (Deel, Remote.com, Oyster, Papaya Global) — search for the provider names alongside role/stack terms
- International contractor-friendly startups
- European startups hiring globally (not just EU-authorization-required roles)
- UK companies with international engineering teams (not just UK-authorization-required roles)
- UAE-based companies with international engineering teams
- Singapore-based companies hiring globally
- Companies with publicly visible distributed engineering teams (team/about pages showing engineers across multiple countries)
- Companies with existing South Asian engineering teams (evidenced via LinkedIn/team pages)
- Still include strong YC/startup listings when relevant, but check eligibility signals immediately rather than assuming compatibility — many YC companies do hire globally via EOR even when the primary listed range is US-based.

Use available research tools:
- **Olostep MCP tools** (`mcp__olostep__search_web`, `scrape_website`, `get_webpage_content`, `get_website_urls`, `create_crawl`/`get_crawl_results`, `batch_scrape_urls`, `answers`) — primary tools for web search, company site scraping, and careers-page discovery.
- **WebSearch / WebFetch** — fallback or supplement when Olostep tools aren't available or a targeted fetch is simpler.
- Prefer primary sources: the company's own careers page, their engineering blog, team/about pages, LinkedIn company pages, YC/AngelList/Wellfound listings with real detail — over secondhand aggregator summaries.

### Step 4 — Pakistan eligibility check (immediately, before deep research)
For every candidate surfaced in Step 3, before doing any further technical or company research:
1. Scan the job posting itself for explicit country/citizenship/work-authorization/timezone language.
2. If it's an obvious Category D (explicit US/EU/UK/Canada work authorization or physical-presence requirement with no international option), reject it now and move on — log it briefly for the Rejected section, don't dig further.
3. If it's Category A (explicit Pakistan/global/worldwide hiring), note the evidence and proceed to deep research.
4. If it's Category B or C, run the Research Signals checklist above — check the company's careers page, team/about page, LinkedIn company page, and any "our team" or "life at X" engineering blog content for distributed-hiring evidence — before assigning a score and deciding whether it clears 60.

### Step 5 — Deep research (only for opportunities that cleared Step 4 at ≥ 60, or that are flagged for Tier 3)
For each surviving candidate, dig in:
- What does the company actually build? What's the core technical problem?
- Team size, funding stage/signal, engineering culture signals (code review, testing, documentation mentioned; ownership language in the posting).
- The actual job posting: title, responsibilities, required/preferred stack, location and remote policy, seniority signals.
- Compensation, if disclosed anywhere (posting, levels.fyi-style source, public range).
- Company location and legal/HQ jurisdiction (to enforce the geographic constraint in `Outreach/ideal-companies.md`, which is about company HQ/target-market preference and is separate from the Pakistan hiring-eligibility question).

### Step 6 — Compare against actual background and evidence
For each opportunity, explicitly map required/preferred skills in the posting against career.md's technical stack and Evidence/ files. Identify:
- Which required skills are directly backed by evidence (cite the file/story).
- Which are adjacent/transferable but not literally used before (say so — don't blur this into a false match).
- Which are gaps, and whether career.md's honest weaknesses section already flags them.

### Step 7 — Score the opportunity
Score each dimension 1-5 (1 = poor fit/quality, 5 = excellent), using the rubric below, plus the separate 0-100 Pakistan Remote Eligibility Score above. Show the reasoning for each score, not just the number.

- **Technical fit** — how directly the role's required stack and problems match the Competency Matrix and Evidence/ (not just keyword overlap; weight real depth, e.g. Kafka/event-driven, gRPC, distributed systems, Spring Boot, performance diagnosis, applied AI).
- **Role fit** — alignment with role priority tiers in career.md/target-roles.md (Priority 1 backend/distributed systems roles score highest; pure frontend or pure ML-research roles score low per target-roles.md).
- **Company quality** — engineering maturity signals, product seriousness, funding/stability signal, whether it's a real product company vs. thin wrapper or pure outsourcing shop.
- **Growth potential** — room to grow technically and in scope; small team with real ownership scores higher than a large team with narrow scope, per ideal-companies.md.
- **Compensation potential** — only score if there's real signal (disclosed range, credible market data for the role/level/location); otherwise mark Unknown and exclude it from the overall average rather than guessing a number. Note if compensation is stated as a US/EU-market band that may be adjusted downward for a Pakistan-based hire (common with EOR/global-hiring companies) — flag this explicitly rather than presenting the headline number as guaranteed.
- **Personalization potential** — how much specific, genuine material exists (their engineering blog, a specific technical problem they've written about, a specific stack choice) to build real outreach on later, as opposed to a generic posting with nothing to hook into.
- **Strength of evidence I could contribute** — how many concrete, evidence-backed stories from career.md/Evidence/ would map convincingly to this role in an actual interview, not just on paper.

**Overall opportunity score**: a holistic judgment (not a mechanical average) weighted toward technical fit, role fit, and strength-of-evidence — explain the weighting reasoning in one line per opportunity. The Pakistan Remote Eligibility Score is reported separately, not folded into this average, since it's a gate/qualifier rather than a quality dimension.

### Step 8 — Decide whether it's worth deeper research and outreach
State a clear recommendation: worth immediate outreach, worth monitoring/revisiting, worth a direct eligibility question, or not a fit (and why). Be honest when something doesn't clear the bar — the goal is signal, not encouragement.

### Step 9 — Produce the structured report
Use the format and tiering below. Do not skip fields — mark them Unknown if not found.

## Output Format

For each opportunity that cleared the eligibility gate (or is placed in Tier 3):

```
## [Company Name] — [Role Title]

- **Job URL:** [link or "Unknown — could not locate a live posting"]
- **Company URL:** [link]
- **Location:** [city/country or "Unknown"]
- **Remote status:** [Confirmed/Inference/Unknown + detail]
- **Company stage/size:** [detail + Confirmed/Inference/Unknown tag]
- **Product/business summary:** [2-3 sentences, Confirmed from research]

**Estimated Pakistan hiring compatibility:** [0-100] — [Category A/B/C/D]
**Evidence supporting Pakistan compatibility:** [specific evidence found — team page, EOR mention, distributed-hiring statement, existing South Asia/Pakistan employees, etc. — or "no positive evidence found beyond the word 'remote'"]
**Employment model:** [employee / contractor / EOR / unknown]
**Timezone requirements:** [stated requirement, or "none stated" — note distance from Pakistan Standard Time (UTC+5) if relevant]
**Work authorization requirements:** [stated requirement, or "none stated"]
**Pakistan-specific risks:** [e.g. "compensation band may be adjusted downward for Pakistan-based hires under their EOR provider"; "no evidence of any hire outside North America found"]
**Confidence level of the eligibility estimate:** [High/Medium/Low — based on how much direct evidence vs. inference the score rests on]

**Relevant technical context:** [what they actually build/use, tagged Confirmed/Inference]

**Why this matches the profile:** [explicit mapping to career.md role priority + technical stack]

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
- **Overall opportunity score: X/5** — [weighting reasoning]

**Key risks or unknowns:** [bullet list — be specific, e.g. "Team size not disclosed anywhere public"; "Posting is 6 weeks old, may already be filled"]

**Recommended next action:** [Pursue now / Pursue with direct eligibility question / Monitor / Pass — with a one-line reason]
```

### Report Structure

The final report must separate opportunities into these sections, in this order:

1. **Tier 1 — Actionable from Pakistan** (Estimated Pakistan hiring compatibility ≥ 75)
2. **Tier 2 — Probable but requires verification** (Estimated Pakistan hiring compatibility 60–74)
3. **Tier 3 — High-value but eligibility unclear** (technically excellent opportunities scoring below 60, worth a direct eligibility question rather than being discarded)
4. **Rejected** (clearly incompatible opportunities — Category D — listed briefly with the disqualifying evidence, not deeply researched)

The primary discovery results (what the intro and summary emphasize) should focus on Tier 1 and Tier 2. Tier 3 is secondary and clearly labeled as speculative on eligibility. Rejected is a short log, not a researched section.

Precede the full list with a short intro stating: what this run focused on (Step 2), how many candidates were considered vs. how many cleared the Pakistan eligibility gate, and a brief note on the search-source rebalancing (e.g. "prioritized globally-distributed and EOR-hiring companies over US-only YC listings this run").

If nothing found this run meets a reasonable bar, say that directly instead of stretching weak candidates to fill space.
