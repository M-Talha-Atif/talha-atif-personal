---
name: find-relevant-contact
description: Identify the single highest-value public professional contact for ONE already-researched company and role — a founder, CTO, engineering manager, hiring manager, or recruiter, chosen by evidence rather than title seniority. Loads the existing company/research record from the local Companies/ directory via sync-local-repo rather than requiring research-company's output to be re-pasted. Does NOT discover companies, research a company from scratch, or draft outreach.
---

# Find Relevant Contact

Answer one question: **"Who is the highest-value person to contact about this specific role or engineering opportunity?"** for a company and role that have already been identified (and ideally already researched by `research-company`).

This skill does not discover new companies, does not search broadly for unrelated opportunities, and does not repeat a full company research pass — it consumes existing research and focuses entirely on finding, verifying, and ranking the right person to contact. It stops once the contact and contact strategy are identified; it does not draft an outreach email or build a portfolio page.

## Local Repository Check (do this before anything else)

1. Ask `sync-local-repo` to locate the company/opportunity record under `Companies/<slug>/`.
2. **If no record is found:** stop. This skill assumes the opportunity has already been discovered/researched. Report plainly: "No local record found for [Company]/[Role]. Run `research-company` (or `discover-companies`) first to initialize this opportunity via `sync-local-repo`, or provide the local record path if this company is tracked under a different name/slug." Do not create a new company directory yourself and do not proceed on conversation memory alone.
3. **If a record is found:** read `status.json` first, then `company.md` and `opportunities.md` — this is the primary research context (company stage/size, technical context, team context, location/hiring signals, prior personalization angles). Do not ask the user to re-paste `research-company`'s output; only fall back to a conversation-supplied summary if the local record is missing something this step specifically needs (e.g. no engineering leadership context at all).
4. Also check `contacts.md` and `status.json.status`. If a contact for this exact opportunity already exists at `Contact Found` or later and nothing suggests it's gone stale (e.g. the person is confirmed to have left, or the user asks for a re-check), report the existing contact and recommend reusing it instead of re-running the full search.

## Input

Expects an already-selected opportunity, supplied as some combination of:
- Company name
- Company URL
- Job URL
- Role title

Example:
```
Company: Atomic
Role: Backend Engineer
Company URL: https://www.atomicvest.com
Job URL: https://www.ycombinator.com/companies/atomic/jobs/XWj8902-backend-engineer
```

If given only a bare company name with no role, ask which specific opening this is for — this skill finds a contact for one opportunity, not a general company contact list.

## Hard Constraints (never violate)

- Never discover new companies or evaluate other opportunities in the same run — stay scoped to the one company/role given.
- Never repeat the full company-research process if the local record already covers it — reuse it, verify only where necessary.
- Never draft an outreach email, message, or any personalized content.
- Never create or modify a portfolio page, Notion page, or any `Companies/` file directly — the only local write this skill makes is via `sync-local-repo`, into `contacts.md` and `status.json` only.
- Never send a message on the user's behalf.
- Never guess, generate, or pattern-infer an email address (e.g. first.last@company.com guessing). If no email is publicly verified, state plainly: "Direct email not publicly verified."
- Never use private, sensitive, or restricted personal information. Only public professional information: company sites, official team/leadership pages, job postings, public professional profiles, engineering blogs, public conference/speaker pages, public GitHub profiles, public interviews.
- Never assume someone is the hiring manager, recruiter, or best contact without evidence connecting them to this specific company, team, or posting.
- Never assign a high relevance score based on seniority of title alone — score on evidence of actual connection to this role.
- Never produce a long list of employees. The goal is the single best contact plus up to two backups, not a roster.
- Never recommend contacting multiple people simultaneously without a clear, stated reason — the default is one primary contact, then wait, then consider a secondary only if needed.

## Fact-Labeling System

Every claim in the output must be tagged with one of:

- **Confirmed** — directly supported by a public source found this run (the person's own profile, the job posting itself, an official company page).
- **Evidence** — supported by the person's public professional information or company information, but not a single definitive first-party statement (e.g. their LinkedIn history shows they manage the relevant team, even though no page explicitly says "hiring manager for this role").
- **Inference** — a reasonable conclusion based on role, company size, or organizational structure (e.g. "at a 3-person company, the technical co-founder is almost certainly involved in this hire" ). Always state the reasoning.
- **Unknown** — not publicly verifiable. State it directly.

Pair every recommendation with a confidence level: **High / Medium / Low**. Never present an uncertain conclusion as a fact.

## Workflow

### Step 1 — Understand the opportunity
From the input (and `research-company` output, if provided), establish:
- The target role and the technical area it sits in
- The likely engineering team this role belongs to
- The likely hiring function (founder-led, engineering-led, or recruiter-led — infer from company size/stage and posting language)
- Company size and stage (reuse from `research-company` output if available; otherwise do a light check of the company's own site/LinkedIn page — do not run a full company-research pass)
- Whether the job posting itself already names a specific hiring manager or point of contact — if so, that is the strongest possible signal and should be weighted heavily

Do not re-research anything already established unless it looks outdated or is missing.

### Step 2 — Set contact priority for this company's stage
Use company stage/size to set an initial priority order, then let actual evidence override it:

**Very early-stage (roughly pre-seed/seed, small team, technically-involved founders):**
1. Founder who is technically involved
2. Technical co-founder
3. CTO
4. Head of Engineering

**Startup / growth-stage:**
1. Engineering Manager responsible for the relevant team
2. Head of Engineering
3. CTO
4. Technical Founder
5. Internal recruiter associated with the role

**Larger/established companies:**
1. Hiring Manager (if named or identifiable)
2. Engineering Manager
3. Director or Head of Engineering
4. Technical Recruiter responsible for the role

These orders are starting points, not mechanical rules. Override them when the evidence says otherwise — e.g. a named hiring manager on the posting outranks everything regardless of stage; a 10-person company with an engineering-active founder may make the founder the best contact even though "Head of Engineering" is theoretically higher on a growth-stage list; a 500-person company role that clearly belongs to one team should point to that team's engineering manager over a generic recruiter.

### Step 3 — Research each candidate contact
For every person under consideration, verify via public sources: company site, official leadership/team pages, the job posting, public professional profiles, engineering blog author bios, public conference/speaker pages, public GitHub profiles, public interviews. Use available web research and MCP tools (including Olostep) as needed. Prefer primary, professional sources over secondhand mentions.

For each candidate, determine:
- Full name
- Current title
- Current company (confirm they're still there — leadership pages and profiles can be stale)
- Relevant team or function
- Why they may be relevant to this specific opportunity
- Evidence connecting them to the company or role (not just a name match)
- Public professional profile URL, if available
- Confidence level

Never fabricate any missing field — mark it Unknown instead.

### Step 4 — Score each candidate (0–100)
Score using these dimensions, with reasoning, not just a number:
- **Role relevance** — how directly connected is this person to this specific role/team?
- **Technical relevance** — do they lead or understand the technical area this role sits in?
- **Hiring influence** — how likely are they to actually influence this hiring decision?
- **Company stage fit** — is this person the organizationally-appropriate contact for a company this size (e.g. a CEO of a 500-person company is a poor-fit contact for an individual-contributor backend role, regardless of seniority)?
- **Personalization potential** — is there enough public professional information to write a genuinely specific message to this person later (not generic)?
- **Evidence quality** — how strong and direct is the evidence supporting this person's relevance?

A senior title alone does not justify a high score — score the actual evidence of connection to this opportunity.

### Step 5 — Identify the best contact
Select:
- **Primary Contact** — the single best person, with full detail (see Output Format).
- **Secondary Contacts** — up to 2 backups, only when genuinely appropriate (don't force two if only one good candidate exists). For each, explain why they're relevant but ranked below the primary.

Do not pad this into a roster of employees. If only one strong contact exists, report one.

### Step 6 — Recommend a contact strategy
Choose exactly one:
- Direct founder outreach
- Direct CTO / technical leadership outreach
- Engineering manager outreach
- Hiring manager outreach
- Recruiter outreach
- Multi-contact sequence with caution (only when there's a clear, stated reason — e.g. the named hiring manager appears to have left the company recently and a backup is genuinely warranted from the start)

Explain the reasoning. Default sequencing is: contact the strongest primary person, wait an appropriate period, only then consider a secondary contact if there's been no response — do not recommend messaging multiple people at once without a specific justification.

### Step 7 — Report public contact information only
Only report what's publicly available: a public professional profile, an official company contact page, a public company email address, or a professional email that is itself publicly listed (e.g. printed on a speaker bio or official team page). If no direct email is publicly verified, say exactly: "Direct email not publicly verified." The public profile itself (e.g. LinkedIn) may still be the recommended contact path even without an email.

Never guess an email address from a naming pattern and never present a guessed address as real, even if labeled as a guess — do not generate one at all.

### Step 8 — Persist to the local repository
Invoke `sync-local-repo` before producing the final report:
- `contacts.md`: for the selected primary contact (and secondary contacts, if any) — name, title, company, LinkedIn/profile URL, relevance score, confidence, reason for selection, evidence, unknowns.
- `status.json`: set `contact.name`/`contact.title`, and advance `status` to `"Contact Found"` — only if the current status isn't already past that point (never regress).
- Do not touch `company.md`, `opportunities.md`, or the email fields in `contacts.md` — those belong to `research-company` and `find-contact-email` respectively.
- If deduplication finds this exact contact already recorded (by name or LinkedIn URL), update only the fields this run actually adds or changes rather than creating a second entry.

### Step 9 — Produce the report
Use the Output Format below. Tag every claim per the Fact-Labeling System and give each recommendation a confidence level.

## Output Format

```
# Relevant Contact Research: [Company] — [Role]

## Opportunity
- Company: [name]
- Role: [title]
- Job URL: [link or Unknown]
- Company URL: [link]

## Contact Recommendation

### Primary Contact
- Name: [name]
- Title: [title]
- Company: [company — confirm current]
- Team/function: [team]
- Public professional profile: [URL or Unknown]
- Contact relevance score: [0-100]
- Confidence: [High/Medium/Low]
- Why this is the best contact: [reasoning tied to evidence, not title alone]

### Secondary Contacts (max 2)
1. Name / Title / Relevance score / Why relevant / Why secondary rather than primary
2. [same, if applicable]

## Contact Strategy
- Recommended approach: [one of the six options from Step 6]
- Reasoning: [why this approach, referencing the evidence]
- Recommended sequence: [e.g. "Contact [primary] first; wait ~1-2 weeks; only then consider [secondary] if no response"]

## Public Contact Information
[Only verified public professional contact info — profile links, official contact page, publicly listed email if one exists. Otherwise: "Direct email not publicly verified."]

## Evidence
[List of the specific evidence supporting each recommendation, source by source]

## Unknowns and Risks
- Unverified hiring-manager status (if applicable)
- Unclear team ownership (if applicable)
- Outdated public information risk (e.g. "LinkedIn title may lag an internal promotion or move")
- Role ambiguity (if applicable)
- Any other meaningful uncertainty

## Recommended Next Action
[One clear, concrete next step — e.g. "Proceed to find-contact-email for [primary contact]" — do not draft the actual message here]

## Local Repository Sync
- Record: [Created / Updated / Reused without changes] — `Companies/[slug]/contacts.md`
- Status: [unchanged at X / advanced to "Contact Found"]
```

## Local Repository Integration

This skill owns the contact-discovery fields of `contacts.md` (name, title, company, LinkedIn, relevance score, confidence, reason, evidence, unknowns) and `status.json.contact.name`/`contact.title`, plus the `"Contact Found"` status transition — always via `sync-local-repo`. It never writes the email/verification fields (`find-contact-email`'s job) and never touches `company.md`, `opportunities.md`, or `outreach.md`.

## Workflow Boundary

This skill ends the moment the best contact and contact strategy are identified and persisted. It must not draft the outreach email, create or modify a portfolio page, send any message, discover new companies, or write any `Companies/` file directly (only through `sync-local-repo`). The output is meant to be handed to a future outreach-preparation skill, not to close the loop itself.
