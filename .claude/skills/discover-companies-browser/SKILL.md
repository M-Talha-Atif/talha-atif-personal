---
name: discover-companies-browser
description: Complementary, browser-assisted discovery of fresh, currently-open Software Engineering and Applied AI opportunities using interactive Claude-in-Chrome/browser research — for sources that are hard to reach through ordinary web search (LinkedIn Jobs, LinkedIn company pages, JavaScript-rendered job boards, ATS pages that don't scrape cleanly). Independent from, and does not modify, the existing `discover-companies` skill, which remains the primary automated/web-research discovery workflow. Applies the same seniority filter (1-3 years primary target, rejects Staff/Principal/Lead/Architect/Manager/Director) and hard geographic filter (rejects on-site, hybrid, relocation-required, India-only, Turkey-only, any geography excluding Pakistan) as discover-companies, plus a strict LinkedIn safety boundary — human-in-the-loop only, no unattended scraping, no bulk profile visits, no automated connection requests or messages. Persists only verified opportunities via sync-local-repo. Use when discover-companies' automated web research can't reach a source (LinkedIn, a stubborn JS-rendered board) and interactive browser inspection is needed instead.
---

# Discover Companies (Browser-Assisted)

Find fresh, currently-open Software Engineering and Applied AI opportunities using **interactive browser research** — Claude in Chrome (for sources requiring a logged-in session, chiefly LinkedIn) and the in-app Browser pane (for JavaScript-rendered job boards and ATSs that don't yield useful content to ordinary scraping). This is a complementary tool, not a replacement: `discover-companies` remains the primary automated/web-research discovery workflow, and this skill exists specifically for the sources it can't reach cleanly.

**This skill never modifies `discover-companies` or any other existing skill.** It is a fully independent workflow that happens to share the same profile, seniority filter, geographic filter, and local-repository target.

## Workflow Position

```
discover-companies (primary, automated web research)
        +
discover-companies-browser (complementary, interactive browser research)
        ↓
   sync-local-repo (shared persistence target — Companies/<slug>/)
        ↓
research-company → find-relevant-contact → find-contact-email → prepare-outreach
  → draft-outreach → explicit human approval → send-outreach → sync-local-repo
```

Both discovery skills feed the same `Companies/` local record through `sync-local-repo`. Neither owns the pipeline exclusively — use whichever one fits the source you need to reach. When a company already has a record from the other skill's prior run, this skill updates it rather than creating a competing one (see Local Repository Integration below).

## Source of Truth (read these first, every run)

Read in this order before doing anything else:

1. `career.md` — primary source of truth: career goals, role priority, technical stack, strengths, honest weaknesses, competency matrix, experience log, decision log, gaps.
2. `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for specific claims about skills, technologies used, and metrics.
3. `Outreach/ideal-companies.md` — company-type preferences, firm geographic constraint, and the "companies already evaluated" reference table.
4. `Outreach/target-roles.md` — role priority tiers, signal checklist for a strong-fit posting, roles to decline.

Treat `career.md` as authoritative for goals and direction. Treat the `Evidence/` files as the only valid source for specific claims about skills, technologies used, and metrics. If a fact isn't in one of these files, it is not a fact — it's either an inference (label it) or unknown (label it).

## Hard Constraints (never violate)

- Never invent experience, technologies, achievements, or metrics not present in `career.md` or `Evidence/`.
- Never assume a company is hiring without finding an actual, current, verifiable job posting. A page that looks promising but can't be confirmed goes to the Needs Verification Queue, not the verified output.
- Never present speculation as fact. Tag every claim **Confirmed**, **Evidence**, **Inference**, or **Unknown**.
- Never infer Pakistan compatibility merely because a posting says "remote."
- **Reject immediately:** on-site roles, hybrid roles, relocation-required roles, India-only roles, Turkey-only roles, and any explicit geography that excludes Pakistan.
- **Reject by default:** Staff, Principal, Lead, Architect, Manager, and Director roles, and any role requiring substantially more experience than the target range — same as `discover-companies`' seniority filter, applied here too. See Seniority Filter below.
- **Never build an unattended scraper or mass-collection workflow against LinkedIn or any other source in this skill.** See LinkedIn Safety Boundary below — this is a hard constraint, not a style preference.
- **Do not reject a promising lead merely because the page is JavaScript-rendered or hard to extract programmatically.** That's precisely what this skill exists to handle via interactive browser inspection — if ordinary scraping fails, look at the actual rendered page instead of giving up on the lead.
- **Do not mark an opportunity Verified if the browser page is contradictory, closed, expired, or clearly stale.** Verification is a real check, not a formality.
- Never modify `discover-companies/SKILL.md` or any other existing skill file. This skill's only file-system effect is its own file plus, via `sync-local-repo`, the shared `Companies/` record.

## Target Role Taxonomy

Same two tracks as `discover-companies` — kept identical so the two skills' outputs are directly comparable and mergeable in the local repository.

**Software Engineering:** Full-Stack Developer / Full-Stack Engineer, Software Engineer, Backend Engineer, Java Engineer, Spring Boot Engineer, Node.js / MERN Engineer, React / Next.js Engineer.

**Applied AI + Full-Stack:** AI Engineer, AI Developer, AI Full-Stack Engineer, LLM Engineer, Agentic AI Engineer, and roles centered on LangChain / LangGraph / CrewAI / RAG / MCP / tool-calling.

A strong match on either track is a valid target — neither is a fallback for the other.

## Seniority Filter

Identical bands and logic to `discover-companies`:

- **Primary:** 1-3 years experience.
- **Secondary:** 2-4 years experience.
- **3-5 years:** only for exceptionally strong technical matches — do not default to including these.
- **Reject by default:** Staff, Principal, Lead, Architect, Manager, Director — regardless of how the title reads, check the actual posting's responsibilities and stated experience requirement. A non-senior title with staff-level scope language ("own architecture for the whole platform," "mentor senior engineers," "set technical direction org-wide") is excluded just as much as an explicit Staff title.
- A "Senior" title is acceptable only when the actual requirement is realistically close to the 1-3/2-4 year band and the responsibilities are hands-on engineering, not staff-level ownership.

## Hard Geographic Rejection Rules

Identical to `discover-companies`:

- On-site, in any country.
- Hybrid, requiring office attendance of any frequency.
- Relocation-required, regardless of destination.
- India-only or Turkey-only (per `Outreach/ideal-companies.md`'s firm geographic constraint).
- Country-restricted to an enumerated list that does not include Pakistan.

The fact that a company is remote *somewhere* is not sufficient — the role must realistically be executable from Pakistan.

## Browser-Assisted Sources

Search and inspect, as available and relevant to the current run:

LinkedIn Jobs, LinkedIn company pages, Remote OK, Wellfound, Glassdoor, Indeed, We Work Remotely, Himalayas, Remotive, Remote.co, Working Nomads, Jobgether, YC job pages, company career pages, Greenhouse, Lever, Ashby, Workable, and other JavaScript-rendered job boards or ATS pages that don't yield useful content to ordinary web-search scraping.

### Which Browser to Use

- **Claude in Chrome** (the user's real, logged-in browser) — use for LinkedIn Jobs and LinkedIn company pages, since these require an authenticated session to show meaningful content. Use only for this interactive, human-in-the-loop research; never for the automated actions listed in the LinkedIn Safety Boundary below.
- **The in-app Browser pane** — use for everything else: Remote OK, Wellfound, Glassdoor, Indeed, We Work Remotely, Himalayas, Remotive, Remote.co, Working Nomads, Jobgether, YC job pages, Greenhouse/Lever/Ashby/Workable boards, and direct company career pages, especially where a prior automated-scrape attempt (by `discover-companies` or by web-search tools) returned only page shell/navigation instead of the actual job listings.

## LinkedIn Safety Boundary (hard constraint)

LinkedIn is treated as a **human-in-the-loop browser source**, not an automatable data source. In every run:

- **Do not** build or run an unattended scraper or mass-collection workflow against LinkedIn.
- **Do not** mass-visit profiles.
- **Do not** bypass restrictions or CAPTCHAs.
- **Do not** automate connection requests.
- **Do not** automate messages.
- **Do not** perform bulk extraction of job listings, company data, or people data.

What's in scope: interactively navigating to a specific job posting or company page the user or this workflow is actively looking at, and reading/summarizing what's visible on that page — the same way a person browsing LinkedIn themselves would look at one listing at a time. If a task in this skill would require automating LinkedIn beyond that (e.g. "crawl all jobs matching X"), stop and do the equivalent research on a source that permits it instead (Remote OK, Wellfound, direct ATS boards, etc.), or ask the user how they'd like to proceed.

## Recency Priority

Search in this order, expanding only as needed:

1. **Posted within the last 24 hours** — highest priority.
2. **24-48 hours ago.**
3. **3-7 days ago.**
4. **8-14 days ago** — acceptable.

Older postings should generally be excluded unless explicitly confirmed as actively hiring (a direct statement on the careers page or ATS that the role remains open, not just the absence of a "closed" label). Record the posted/refreshed date and age for every opportunity per the Output Format below.

## Verification Lifecycle

Every browser-discovered opportunity moves through:

```
Discovered → Needs Verification → Verified → Rejected
```

- **Discovered** — found via a browser-assisted source (job board, LinkedIn, aggregator) but not yet cross-checked.
- **Needs Verification** — a real, promising lead that couldn't yet be confirmed against a primary source. Stays in its own queue in the output — never presented as if it were Verified.
- **Verified** — cross-checked against the chain below and confirmed current, open, and consistent.
- **Rejected** — failed the Seniority Filter, the Hard Geographic Rejection Rules, recency, or turned out closed/expired/stale/contradictory on verification.

### Verification Chain

Cross-check, in this order, as far as each opportunity allows:

```
Job board (where it was found) → Official company career page → Official ATS (Greenhouse/Lever/Ashby/Workable posting)
```

Use the in-app Browser pane (or Claude in Chrome, if the trail leads back to a LinkedIn company page) to navigate this chain interactively. A job-board listing alone, with no confirmation from the company's own career page or ATS, stays at **Needs Verification** — it does not get promoted to Verified on the strength of the aggregator alone.

Never mark **Verified** if, at any point in this chain, the posting is:
- Closed, expired, or marked as no longer accepting applications.
- Contradictory (e.g. the job board says "posted today" but the company's own ATS shows it's been open for two months, or the seniority/geography stated differs between sources).
- Genuinely stale despite still appearing live somewhere.

## Workflow

### Step 1 — Load the profile
Read the Source of Truth files. Build a working model of target roles, strongest evidenced technical capabilities, and firm constraints — same as `discover-companies` Step 1.

### Step 2 — Define this run's scope
State explicitly which source(s) this run is targeting (e.g. "LinkedIn Jobs for Applied AI titles," "Wellfound + a batch of Greenhouse boards that didn't scrape cleanly for `discover-companies` last time") and why browser-assisted research is needed for it specifically.

### Step 3 — Interactive search
Navigate the relevant source(s) per Browser-Assisted Sources above, using the right browser per Which Browser to Use. Read what's actually rendered on the page — this is the whole point of using a real browser instead of a scraper. Record each candidate's title, company, and (if visible) posted date before doing anything else.

### Step 4 — Seniority filter (before any further research)
Apply the Seniority Filter above to every candidate found. Reject fast; log rejections with the reason.

### Step 5 — Hard geographic rejection
Apply the Hard Geographic Rejection Rules above to every candidate that passed Step 4. Reject fast; log rejections with the reason.

### Step 6 — Recency check
Record posted/refreshed date and age for every surviving candidate. Exclude anything past 14 days unless explicitly confirmed still active — if that confirmation can't be found, route it to Needs Verification rather than excluding it outright, since recency confirmation is itself something the verification chain may resolve.

### Step 7 — Verification
Walk the Verification Chain for every remaining candidate. Assign **Verified** or **Needs Verification** honestly — do not force a Verified status to make the output look more complete.

### Step 8 — Technical and role fit
Map each Verified (and Needs Verification) opportunity's required stack against career.md/Evidence/, same fact-labeling discipline as `discover-companies` (Confirmed / Evidence / Inference / Unknown; Direct match / Transferable / Skill gap where relevant).

### Step 9 — Persist through sync-local-repo
For every **Verified** opportunity (Needs Verification items are reported but not yet persisted as accepted opportunities — see Local Repository Integration):
1. Check `Companies/*` for an existing record (by slug, company name, domain, or job URL) before creating anything.
2. If a record exists (from this skill's prior run or from `discover-companies`), update it — add the new opportunity/source/recency data, preserve all prior research, never overwrite what's already there.
3. If no record exists, initialize one via `sync-local-repo` exactly as `discover-companies` would.
4. Record the sync result for the Output.

### Step 10 — Produce the report
Use the Output Format below.

## Local Repository Integration

This skill shares `Companies/<slug>/` with `discover-companies` and every other pipeline skill — it does not own a separate namespace. Before writing anything:

- **Search first.** Normalize the company name and check for an existing directory by slug, name, domain, or job URL — exactly the duplicate-prevention discipline `sync-local-repo` already applies.
- **Never create a duplicate company record.** If the company already exists (regardless of which skill discovered it originally), update that record.
- **Preserve prior research.** Adding a new opportunity, source, or recency data point must never erase or overwrite `company.md`/`opportunities.md` content another run already wrote.
- **Add the new opportunity distinctly** if it's a different role/job URL than what's already tracked for that company, following the same identity key `sync-local-repo` uses (Job URL first, then Company + Role).
- **Record source and recency** explicitly — this skill's opportunities.md entries should note they came from browser-assisted research and which source/date, so a future reader can tell this apart from an automated `discover-companies` find.
- Only **Verified** opportunities get persisted as accepted opportunities with `status: "Discovered"` in `status.json`. **Needs Verification** items are reported in the output but not persisted until they've actually been verified (in this run or a follow-up).

## Output Format

Report in exactly these four sections, in this order:

1. **Top Verified Opportunities** — every opportunity that reached Verified status, each with the full field set below.
2. **Needs Verification Queue** — real, promising leads that couldn't be confirmed against the verification chain this run. State exactly what's missing (e.g. "found on Wellfound, company career page has no matching listing — may be filled or Wellfound's listing is stale").
3. **Rejected Opportunities (with reasons)** — a short log: which gate it failed (seniority / geography / recency / verification-contradiction) and the specific evidence.
4. **Duplicate/Existing Opportunities Updated** — companies or roles that already existed in `Companies/` before this run, what was added/updated, and confirmation that prior research was preserved rather than overwritten.

For each opportunity in sections 1 and 2, record:

```
## [Company] — [Role]

- Job URL: [exact link]
- Source: [LinkedIn Jobs / Remote OK / Wellfound / Greenhouse / etc. — where it was found]
- Posted date/time: [value, or "Unknown — not exposed by this source"]
- Age: [X hours/days]
- Recency category: [0-24h / 24-48h / 3-7d / 8-14d / older-but-confirmed-active]
- Remote status: [Confirmed/Inference/Unknown + detail]
- Geographic eligibility: [explicit country restrictions, or "none stated" + reasoning on Pakistan realism]
- Experience requirement: [quote or closely paraphrase the posting]
- Employment type: [Full-time/Contract, Employee/Contractor/EOR]
- Technology stack: [as stated in the posting]
- Technical fit: [mapping to career.md/Evidence/, Confirmed/Evidence/Inference/Unknown]
- Seniority fit: [Primary target / Senior — accepted / Senior — rejected, with reasoning]
- Verification status: [Verified / Needs Verification — with the verification chain's outcome]
- Local Repository Sync: [Created / Updated / Already current — Companies/[slug]/]
```

## Workflow Boundary

This skill must NOT:

- Modify `discover-companies/SKILL.md` or any other existing skill.
- Build or run any unattended/automated LinkedIn scraping, mass profile visits, CAPTCHA bypass, automated connection requests, or automated messaging.
- Mark an opportunity Verified without walking the verification chain.
- Create a duplicate company record when one already exists in `Companies/`.
- Persist a Needs Verification or Rejected item as an accepted opportunity.
- Draft outreach, find contacts, find emails, or send anything — this skill only discovers and verifies opportunities, exactly like `discover-companies`.

It is a complementary discovery path into the same shared local repository, not a competing pipeline.
