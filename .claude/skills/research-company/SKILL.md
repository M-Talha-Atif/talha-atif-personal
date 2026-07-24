---
name: research-company
description: Deep-dive research on ONE already-selected company and ONE specific job opportunity — company/product/technical context, role breakdown, match against career.md and Evidence/, Pakistan hiring compatibility, personalization angles, relevant people, risks, and a final recommendation. Takes a specific company/role/URL as input. Reads and updates the local Companies/ record via sync-local-repo instead of relying on pasted conversation context. Does NOT discover new companies or search broadly for jobs (use discover-companies for that) and does NOT draft outreach messages.
---

# Research Company

Deep research on a single, already-identified opportunity — one company, one role — to produce a decision-grade report: what the company actually does, what the role actually requires, how that maps to this person's real documented experience, whether a Pakistan-based hire is realistic, who the relevant people are, and what the honest risks are.

This skill does not discover new companies, does not search broadly across job boards, and does not draft outreach messages, cover letters, or portfolio pages. It takes an opportunity that has already been found (by `discover-companies`, or supplied directly by the user) and researches it thoroughly.

## Local Repository Check (do this before anything else)

The local record under `Companies/<slug>/`, not pasted conversation output, is the primary source for "has this already been researched." Before doing any research work:

1. Ask `sync-local-repo` to locate the company record (normalized name/domain/job-URL match against `Companies/*`).
2. **If a record exists:** read `status.json` first, then `company.md` and `opportunities.md` for this opportunity. If `status` is already `Researched` or later and the content doesn't look stale (no obvious contradiction with anything freshly stated in this conversation), report what's already on file and recommend reusing it instead of re-researching — do the research pass only if the user asks for a refresh, the existing data is thin/missing something this run needs, or something looks outdated. When refreshing, never overwrite a stronger existing fact with a weaker one (see Step 9 below).
3. **If no record exists:** this skill is a legitimate entry point (it doesn't require `discover-companies` to have run first), so initialize one via `sync-local-repo` using the company/role/URL supplied here, rather than researching into a conversation void with nothing persisted. State plainly that no prior local record existed and a new one is being created.
4. Never invent a competing local structure — `sync-local-repo` owns the directory layout and duplicate-detection; this skill only reads and requests writes through it.

## Input

The skill expects an already-selected opportunity, supplied as some combination of:
- Company name
- Company URL
- Job URL
- Role title

Example invocation:
```
Company: Atomic
Role: Backend Engineer
Company URL: https://www.atomicvest.com
Job URL: https://www.ycombinator.com/companies/atomic/jobs/XWj8902-backend-engineer
```

Treat the local record found above as the primary context for anything it already covers (company facts, prior score/category, prior recommendation). Conversation-pasted `discover-companies` output is only a fallback when the local record is missing or thinner than what's supplied directly in the conversation — never the other way around.

If the job URL is missing but the company and role are known, locate the live posting first (via the company's careers page, YC/Work at a Startup, or a targeted search) before proceeding — do not analyze a role from memory or a secondhand summary alone. If no live posting can be found, say so explicitly in the report rather than inventing role requirements.

If given only a company name with no role, ask which specific opening to research rather than guessing — this skill is for one opportunity, not a company-wide survey.

## Source of Truth (read these first, every run)

Read in this order before doing anything else:

1. `career.md` — primary source of truth: career goals, role priority, technical stack, strengths, honest weaknesses, competency matrix, experience log, decision log, gaps.
2. `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for specific claims about skills, technologies used, and metrics.
3. `Outreach/target-roles.md` — role priority tiers, the signal checklist for a strong-fit posting, and the resume-variant mapping table (useful for noting which existing resume angle would best suit this role, without drafting new content).
4. `Outreach/ideal-companies.md` — company-type preferences and the firm geographic constraint (India/Turkey exclusion for company HQ/target market — separate from the Pakistan hiring-eligibility question below).
5. `Outreach/outreach-rules.md` and `Outreach/strategy.md` — context only, so recommendations stay consistent with the broader approach already documented; do not draft outreach content from these, just stay aware of the tone/positioning rules for later use by other skills.
6. `.claude/skills/discover-companies/SKILL.md` — reuse its Pakistan Remote Eligibility Filter categories, scoring bands, and research signals exactly (see Section 7 below) rather than reinventing a different scale.

Treat `career.md` as authoritative for goals and direction. Treat the `Evidence/` files as the only valid source for specific claims about skills, technologies used, and metrics. If a fact isn't in one of these files, it is not a fact you can assert about this person — it's either an inference (label it) or unknown (label it).

## Hard Constraints (never violate)

- Never invent experience, technologies, achievements, or metrics not present in `career.md` or `Evidence/`.
- Never claim the person has used a technology unless a specific workspace file backs it up.
- Never speculate about private/internal architecture and present it as fact — clearly mark anything beyond what's publicly discoverable as Inference or Unknown.
- Never present speculation as fact anywhere in the report. Every substantive claim is tagged Confirmed, Public Evidence, Inference, or Unknown (see below).
- Never assume "remote" means remote-from-Pakistan. Apply the same Pakistan eligibility discipline as `discover-companies`: the word "remote" alone carries zero weight in the compatibility score.
- Never guess or fabricate a person's email address or private contact details. Only report what is publicly discoverable (name, title, public profile URL).
- Never assume someone is the hiring manager, recruiter, or relevant contact without evidence connecting them to the company, team, or posting.
- Never treat every listed technology in a job posting as equally important — always separate core / secondary / nice-to-have requirements rather than flattening them.
- Never optimize the final assessment for compensation alone — always explain trade-offs (technical learning, ownership, stability, career direction) alongside comp.
- Do not draft an outreach email, cover letter, or personalized portfolio content. Do not directly create or modify any file other than the report output requested in the conversation — the only file-system effect this skill has is persisting research results into the local `Companies/<slug>/` record, and that happens exclusively through `sync-local-repo`, never by writing files itself.
- Do not discover or evaluate other companies or roles in the same run — stay scoped to the one opportunity given.

## Fact-Labeling System

Every substantive claim in the report must be tagged with one of:

- **Confirmed** — directly stated by a primary source found this run (the job posting itself, the company's own site, an official filing/announcement).
- **Public Evidence** — supports a conclusion but isn't a direct first-party statement (e.g. a LinkedIn profile showing an employee's location, a press article about funding, a GitHub org showing contributor locations).
- **Inference** — a reasonable judgment call not directly stated anywhere. Always say why (e.g. "likely Series A given the funding amount and headcount, though the round isn't explicitly named").
- **Unknown** — could not be determined this run. State it directly and, where useful, what would resolve it.

Additionally, every mapping between the role's requirements and this person's background must be tagged with one of:

- **Strong match** — directly, specifically evidenced (cite the exact file/section/story).
- **Partial match** — evidenced but narrower or shallower than the requirement asks for.
- **Transferable match** — no direct evidence of that exact technology/situation, but a closely related, evidenced capability explains why it would transfer. Always explain the transfer logic, not just assert it.
- **Skill gap** — no evidence exists and no reasonable transfer argument applies. State it plainly; do not disguise a gap as a transferable match.
- **Unknown** — not enough information in the job posting or workspace to assess this requirement.

## Workflow

### Step 1 — Load the profile and confirm the target opportunity
Read the Source of Truth files. Confirm exactly which company, role, and posting are being researched. If the job URL wasn't supplied, locate the live posting now. If it can't be found, state that clearly in the Role Analysis section rather than fabricating requirements from the role title alone.

### Step 2 — Research the company
Using primary sources first (company site, careers page, official blog, press/funding announcements, LinkedIn company page, Crunchbase-style data when accessible), determine:
- What the company actually builds and its core product
- Target customers and business model, when discoverable
- Stage and approximate size, when verifiable
- Funding information, when relevant
- Founders and technical leadership, when relevant
- Current product direction and any recent meaningful developments (launches, funding rounds, notable partnerships)

Tag every claim Confirmed / Public Evidence / Inference / Unknown. Do not fill gaps with plausible-sounding guesses.

### Step 3 — Research the technical context
Look for the company's engineering blog, conference talks, published documentation, open-source repos, and any public technical writing. Investigate:
- Technical product challenges and relevant engineering problems
- Architecture-related challenges, only where publicly discoverable (never speculate about private internals)
- Scale and reliability requirements
- Data or infrastructure challenges
- API or platform challenges
- Developer tooling and engineering practices (testing, CI/CD, code review culture — if mentioned anywhere)

If nothing public exists on the technical side, say so — "Unknown, no public engineering content found" is a valid and expected outcome for smaller/earlier-stage companies.

### Step 4 — Analyze the role
Read the actual job posting (not a summary of it) and extract:
- Core responsibilities
- Required skills, preferred skills, and nice-to-have skills — kept as three distinct tiers:
  - **Core requirements** — skills that appear essential to doing the job
  - **Secondary requirements** — useful but plausibly learnable on the job
  - **Nice-to-have requirements** — should not disqualify a candidate lacking them
- Seniority expectations and expected ownership
- Team context (who they'd work with, reporting line, if stated)
- The technical problems this specific role likely addresses (grounded in what was found in Step 3, not invented)
- Explicit location and employment requirements (exact wording from the posting)

### Step 5 — Match against actual background
Read `career.md`, the relevant `Evidence/` files, and (when useful for framing, not for inventing new claims) `Outreach/target-roles.md` and the applicable `Resumes/` variant. For every important role requirement identified in Step 4, classify the match:

```
Role requires: [requirement]
Evidence: [specific workspace file, e.g. Evidence/technical-decisions.md]
Relevant experience: [the specific story/decision/metric that applies]
Assessment: Strong match / Partial match / Transferable match / Skill gap / Unknown
```

Never invent experience. Never claim a technology was used unless a workspace file supports it. When calling something a transferable match, always explain the transfer logic (e.g. "no direct Kafka-in-production-at-this-scale evidence, but the gRPC migration and event-driven Kafka approval pipeline in Evidence/technical-decisions.md demonstrate the same distributed-systems judgment this requirement is really testing for").

### Step 6 — Identify the strongest personalization angles
Find 2–5 specific, genuine connections between (a) the company's actual product/technical problems, (b) the role's actual requirements, and (c) this person's documented experience. Rank strongest to weakest.

Reject generic filler — never produce angles like "I'm passionate about your mission," "I love your company," "I'd be a great fit," "I've always admired your work." Every angle must point to a concrete intersection: a specific technical problem solved before, a specific architectural decision, a production reliability story, a measurable optimization, a domain connection, or a directly transferable capability — each cited to its source file.

### Step 7 — Identify relevant people
Search for publicly identifiable people connected to the company who would plausibly matter for this opportunity: founder, technical co-founder, CTO, VP Engineering, Head of Engineering, engineering manager, hiring manager, technical recruiter. For each person found, report:
- Name
- Current role (Confirmed/Public Evidence)
- Why they may be relevant to this specific opportunity
- The evidence connecting them to the company/team (not just a name match)
- Public professional profile URL, if available

Never assume someone is the hiring manager or recruiter for this specific role without evidence (e.g. they're tagged on the job posting, they run the team the posting reports into, they've publicly posted about this exact opening). If no such evidence exists, list the person with their real role and mark the "relevance to this opening" as Inference or Unknown rather than asserting they're the contact.

Never guess email addresses or fabricate contact details of any kind.

### Step 8 — Analyze Pakistan hiring compatibility
Apply the exact same Pakistan Remote Eligibility Filter used by `.claude/skills/discover-companies/SKILL.md` — same categories, same 0–100 scoring bands, same research-signal checklist — rather than inventing new logic:

- **Category A** (explicit Pakistan/worldwide/global hiring, or evidenced current/recent Pakistan-based employee) → typically 90–100
- **Category B** (strong distributed-hiring/EOR/contractor evidence, no direct Pakistan confirmation) → typically 60–89 depending on strength of evidence
- **Category C** (says "remote," no clarifying evidence either way) → typically 40–59
- **Category D** (explicit US/UK/EU/Canada work authorization, physical-presence, or specific-timezone-only requirement) → typically 0–39; reject fast, don't over-research

Investigate: does the company hire globally; does it use contractors; does it use an EOR (Deel, Remote.com, Oyster, Papaya Global, etc.); does it have international employees; does it have employees in Asia or South Asia specifically; does it have employees in Pakistan specifically; does the role's own posting allow international remote work; does it require specific work authorization; does it require relocation; what are the timezone expectations. Use public, professional, company-related information only — never assume Pakistan compatibility merely because the listing says "remote."

Report:
- **Estimated Pakistan hiring compatibility: X/100** (explicitly labeled as an estimate, never presented as fact)
- **Eligibility category:** A/B/C/D
- **Employment model:** employee / contractor / EOR / unknown
- **Supporting evidence**
- **Remaining uncertainties**
- **Confidence level:** High/Medium/Low

### Step 9 — Assess company quality and career value
Evaluate, with reasoning rather than bare scores: technical quality, product quality, engineering learning potential, career growth potential, company stability, compensation potential (only from real signal — mark Unknown otherwise), relevance to the long-term career direction in `career.md`, and potential for meaningful ownership. Explicitly discuss trade-offs — do not let compensation alone drive the framing.

### Step 10 — Risk analysis
Identify and clearly distinguish confirmed vs. inferred risks: experience-level mismatch, technology gaps, location/hiring restrictions, compensation uncertainty, company-stage risk, role ambiguity, likely interview difficulty (cross-reference `career.md`'s honest gaps, e.g. the noted interview-confidence gap, where relevant), and any other meaningful risk surfaced during research.

### Step 11 — Final recommendation
Choose exactly one: **Strong pursue / Pursue / Pursue after clarification / Monitor / Pass.** Explain the reasoning in a few sentences, referencing the strongest factors from the research (Pakistan compatibility, technical fit, company quality, risks) rather than restating every section.

### Step 12 — Persist to the local repository
Invoke `sync-local-repo` to write this run's result before producing the final report:
- `company.md`: company-level facts from Steps 2-3 (product, stage/size, funding, engineering culture), tagged Confirmed/Public Evidence/Inference/Unknown.
- `opportunities.md`: this opportunity's requirement breakdown (Step 4), evidence-match table (Step 5), personalization angles (Step 6), Pakistan compatibility (Step 8), risks (Step 10), and final recommendation (Step 11).
- `status.json`: advance `status` to `"Researched"` — only if the current status isn't already past `Researched` (never regress; if this run is a refresh of an already-more-advanced opportunity, update the content files but leave `status` untouched and say so).
- If this run contradicts a stronger existing fact already on file (e.g. prior research said Category A, this run finds evidence for Category C), do not silently overwrite it — record both and flag the conflict in the report rather than picking one.

## Local Repository Integration

This skill owns the research-depth content of `company.md` and `opportunities.md` (company facts, role breakdown, evidence-match, personalization angles, Pakistan compatibility, risks, recommendation) and the `"Researched"` status transition — always via `sync-local-repo`, never by writing `Companies/` files directly. It never touches `contacts.md` or `outreach.md`. It may initialize a new company record (Local Repository Check, step 3) only when none exists yet for this exact opportunity; it never overwrites contact or outreach data a later stage already wrote, and never regresses `status` below its current value.

## Output Format

Produce the report as a response with these sections, in this order:

```
# Company Research: [Company] — [Role]

## Executive Summary
[3-5 sentences: what the company does, the role, the headline verdict, and the Pakistan compatibility score up front]

## Company Overview
[Stage/size/funding/leadership, tagged Confirmed/Public Evidence/Inference/Unknown]

## Product and Business
[What they build, customers, business model]

## Technical Context
[Engineering challenges, architecture context where public, scale/reliability signals, engineering culture/tooling signals, links to any blog posts/talks found]

## Role Analysis
[Core / Secondary / Nice-to-have requirements, seniority, ownership, team context, explicit location/employment wording]

## Pakistan Hiring Compatibility
- Estimated Pakistan hiring compatibility: X/100
- Eligibility category: A/B/C/D
- Employment model: employee / contractor / EOR / unknown
- Supporting evidence
- Remaining uncertainties
- Confidence level: High/Medium/Low

## My Evidence Match
[Per-requirement table/list: Role requires → Evidence → Relevant experience → Assessment (Strong/Partial/Transferable/Skill gap/Unknown)]

## Strongest Personalization Angles
[2-5 ranked, concrete, source-cited angles]

## Relevant People
[Name, role, relevance, evidence, public profile — or "No specific individuals could be confidently identified" if that's the honest outcome]

## Company and Career Assessment
[Technical/product quality, learning and growth potential, stability, compensation signal, long-term career-direction fit, ownership potential, trade-offs discussed explicitly]

## Risks and Unknowns
[Confirmed risks vs. inferred risks, clearly separated]

## Final Recommendation
[Strong pursue / Pursue / Pursue after clarification / Monitor / Pass — with reasoning]

## Recommended Next Action
[One concrete, specific next step — e.g. "confirm remote-from-Pakistan eligibility directly before applying" or "apply now via the listed posting" — not an outreach draft]

## Local Repository Sync
- Record: [Created / Updated / Reused without changes] — `Companies/[slug]/`
- Status: [unchanged at X / advanced to "Researched"]
```

Do not draft an outreach email, cover letter, or portfolio content anywhere in this report — that is out of scope for this skill.
