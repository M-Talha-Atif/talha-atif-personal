---
name: prepare-outreach
description: Transform an already-researched company/role opportunity — loaded from the local Companies/ record via sync-local-repo, not re-pasted — and real career evidence into the specific outreach-page content needed to populate the existing portfolio /r/[slug] template (hero, evidence, culture fit, hiring paths, closing, contact context). Does NOT create or modify React components, pages, design tokens, or frontend architecture, and does NOT draft or send the actual outreach email. Use once a company/role has been discovered, researched, and a contact identified, and it's time to prepare the personalized content for that company's outreach page.
---

# Prepare Outreach

Turn one already-selected company, one specific job opportunity, existing company/contact research, and real career evidence into a personalized outreach-page content package — the exact content needed to populate the existing portfolio route `/r/[slug]`, built on the `OutreachPage` data model in `Portfolio/my-portfolio/src/lib/outreach/types.ts`.

This skill does not discover companies, does not repeat a full company-research pass, does not touch the frontend, and does not draft or send the outreach email itself. It answers one question:

**"What is the strongest, most credible, and most personalized argument for why this specific company should spend time evaluating me?"**

Not a generic customized page. A specific argument, built from:

```
Company problem
  ↓
Role requirements
  ↓
My relevant experience
  ↓
Specific evidence
  ↓
Potential contribution
  ↓
A low-friction way to evaluate me
```

The reader should come away thinking "this person actually understood what we're building and picked evidence relevant to our problems" — not "this is a nice-looking templated page."

## Local Repository Check (do this before anything else)

1. Ask `sync-local-repo` to locate the company/opportunity record under `Companies/<slug>/`.
2. **If no record is found:** stop. Report plainly: "No local record found for [Company]/[Role]. This step assumes `research-company` and (ideally) `find-relevant-contact` have already run and been persisted via `sync-local-repo`. Run those first, or provide the local record path if this company is tracked under a different slug." Do not proceed on conversation memory alone and do not invent a record.
3. **If a record is found:** read `status.json` first, then `company.md`, `opportunities.md`, and `contacts.md`. Treat these as already-established fact for company/technical/role context, Pakistan compatibility, and contact info — do not re-research any of it. Only re-verify a specific fact if it looks stale, or research the gap directly if something this skill needs wasn't covered there (e.g. no strong technical-context detail exists) — never by repeating `research-company`'s or `find-relevant-contact`'s full workflow.
4. Also check `outreach.md` and `status.json.status`. If a prepared outreach package for this exact opportunity already exists at `Outreach Prepared` or later and nothing suggests it's stale (no new research/contact/email since it was written), report the existing package and recommend reusing it instead of regenerating.

## Input

Expects an already-selected opportunity, supplied as some combination of:
- Company name
- Company URL
- Job URL
- Role title

The local record found above is the primary source for company/technical/role context, contact info, and email status. Conversation-pasted `research-company`/`find-relevant-contact` output is only a fallback when the local record is missing or thinner than what's available directly in the conversation:

```
Company: Atomic
Role: Backend Engineer
Company URL: https://www.atomicvest.com
Job URL: https://www.ycombinator.com/companies/atomic/jobs/XWj8902-backend-engineer
```

If given only a bare company name with no prior local research, do the minimum research needed to fill the gaps (do not perform broad discovery, and do not repeat `research-company`'s full workflow) and note explicitly in the output which parts are freshly researched versus reused from the local record.

## Source of Truth (read these first, every run)

1. `career.md` — goals, technical stack, strengths, honest weaknesses, competency matrix, experience log, decision log.
2. `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for specific claims about skills, technologies, and metrics.
3. `Outreach/outreach-rules.md` and `Outreach/strategy.md` — tone/positioning consistency, context only.
4. `Brand/` — voice, and any existing visual asset conventions, to decide which existing images to reference.
5. `Portfolio/my-portfolio/src/lib/outreach/types.ts` — the `OutreachPage` type this output must match.
6. `Portfolio/my-portfolio/src/lib/outreach/atomic.ts` — the existing reference example of a fully populated outreach page; match its shape and level of detail.
7. `Portfolio/my-portfolio/src/lib/projects/index.ts` (`projectsMetadata`) — the only valid source of existing project slugs/titles/images for the Selected Projects section. Reading these files is inspection only — this skill never edits anything under `Portfolio/`.
8. Supplied `research-company` and `find-relevant-contact` output, when provided — treat as established, don't re-derive.

Treat `career.md` and `Evidence/` as the only valid source for claims about this person. Treat supplied `research-company` output as the valid source for company/role facts. If a fact isn't in one of these, it isn't a fact — label it Inference or Unknown.

## Hard Constraints (never violate)

- Never invent skills, achievements, metrics, technologies, company facts, technical claims, or hiring information.
- Every important claim must trace to either company-research evidence or real career evidence — cite the source.
- Never claim a previous system was identical to the company's system — distinguish direct match, transferable experience, and conceptual overlap explicitly (see Fact-Labeling).
- Never fabricate metrics, code, or project details. Use only documented numbers from `Evidence/metrics.md` and `Evidence/technical-decisions.md`.
- Never select a project that doesn't already exist in `projectsMetadata` — never invent a project or case study.
- Never write generic filler anywhere in the output: "I am passionate about your mission," "I am a perfect fit," "I would love to join your amazing team," "I am excited about this opportunity," "build scalable systems," "work with a great team," "solve challenging problems." Every sentence should point at a concrete intersection between the company's actual problem and this person's actual experience.
- Never write a generic headline like "Backend Engineer Looking for Opportunities" — the hero headline must express the single strongest concrete connection found.
- In the hiring-paths content: never make Premium sound arrogant or demanding, never imply Premium is objectively better than Silver or Bronze, never criticize or disparage a traditional multi-round process. The throughline is "comfortable being evaluated through whatever process works best for you," not a ranked preference.
- Never draft the final outreach email or message — that is a future skill's job.
- Never send anything, update Notion directly, or discover new companies.
- Never create or modify a React component, page, layout, design token, or any file under `Portfolio/`. This skill's output is a content package, not a code change.
- Never modify `career.md`, `Evidence/`, `Brand/`, or any other skill file. The only local write this skill makes is persisting the prepared package into `outreach.md`/`status.json`, and that happens exclusively through `sync-local-repo`.
- Never propose a new visual asset — only reference existing images already present in `Portfolio/my-portfolio/public/` (via `projectsMetadata` or the known profile image path) or already-established links (e.g. the existing Calendly URL, the existing contact email).

## Fact-Labeling System

Every substantive claim: **Confirmed** (directly stated by a primary source found this run or in supplied research) / **Evidence** (traced to a specific `career.md`/`Evidence/` fact — cite the file) / **Inference** (reasonable judgment, state why) / **Unknown** (say so directly).

Every experience-to-requirement connection in the Relevant Evidence section: **Direct match** (the same kind of problem, solved the same way) / **Transferable experience** (a closely related, evidenced capability — explain the transfer logic, don't just assert it) / **Conceptual overlap** (same underlying principle, different domain — be explicit that it's conceptual, not literal).

## Core Principle

Do not build a generic customized portfolio page. Build a specific argument. Every section below exists to strengthen one chain of reasoning: this company's real problem → this role's real requirements → this person's real, evidenced experience → a low-friction way to verify it.

## Workflow

### Step 1 — Load inputs
Read the Source of Truth files. Absorb any supplied `research-company` / `find-relevant-contact` output as established fact. Confirm the exact company, role, and (if available) contact being prepared for.

### Step 2 — Find the central narrative
Identify the strongest concrete intersection between the company's product, its engineering problem, the role's requirements, and this person's documented experience. This narrative should answer why this company, why this role, why this person, why now — using a specific technical or product angle, not enthusiasm. Keep it concise enough to underpin a single web page, not a full cover letter.

### Step 3 — Hero content
Generate a headline expressing the strongest connection found in Step 2 (e.g. the shape of "reliability at the boundary between services," generated fresh for this company, not copied from any example), a one-line subtext naming the company/role, a CTA label, and a CTA target. Match `atomic.ts`'s pattern: `ctaTarget` is typically an in-page anchor like `#evidence`.

### Step 4 — Relevant Evidence introduction
Write a 3-4 line introduction before the main evidence card: specific to the company's actual problem, technically credible, professional, and just memorable enough to make the reader want to continue — not a joke, not a motivational line.

### Step 5 — What the company is solving
Exactly three concise, specific points at the intersection of the company's product, the role, and this person's potential contribution. No generic filler ("build scalable systems").

### Step 6 — Relevant evidence
Pick the single strongest evidence connection. Write the company's problem, what this person actually did (cited to `Evidence/`), and the overlap — explicitly labeled Direct match / Transferable experience / Conceptual overlap, with the reasoning stated, not just the label. Select one existing project from `projectsMetadata` to feature as the case study (name, image path, URL) — never invent one.

### Step 7 — Real engineering decision
Select one real, documented decision from `Evidence/technical-decisions.md` relevant to the company or role, structured as Problem → Decision → Trade-off → Result. Use only documented metrics. No fabricated code, no fabricated numbers.

### Step 8 — Project exploration
Select 2-4 existing projects from `projectsMetadata`, ranked by relevance to this specific company/role, each with why it's relevant. Do not pad with irrelevant projects.

### Step 9 — Culture fit
Company-specific working-style content grounded in real evidence, covering observable behaviors (ownership, working through ambiguity, learning speed, technical decision-making, communication, AI-assisted engineering, startup execution, production responsibility) — not vague personality adjectives. Cite the supporting evidence for each trait where possible. Match `atomic.ts`'s `cultureFit.traits` shape.

### Step 10 — Three hiring paths
Generate Premium (direct one-hour interview, framed as efficient not arrogant), Silver (hands-on assignment or live coding in an AI-assisted environment, framed as modern practice not skill-avoidance), and Bronze (traditional multi-round process, framed as comfortable, not as a fallback) — tone adapted to the company, following the Hard Constraints above.

### Step 11 — Closing note
A short, human, direct, 2-3 line closing specific to this company. No generic enthusiasm. It should lead naturally into the two closing actions: book a call directly, or email directly (matching `closing.scheduleCtaLabel`/`scheduleCtaTarget` and `emailCtaLabel`/`emailCtaTarget` in the real data model — reuse the existing Calendly link and existing contact email, never invent new ones).

### Step 12 — Contact context
If `find-relevant-contact` output was supplied, summarize: primary contact, their role, why they're relevant, and the recommended outreach angle. Do not draft the actual outreach message — that's the next skill's job. If no contact research was supplied, say so and note that `find-relevant-contact` should be run before outreach is sent.

### Step 13 — Brand and visual context
Confirm which existing assets to reference: the profile image (`/personal/profileImage.png` unless a workspace file says otherwise), and the project image for the selected case-study project (from `projectsMetadata`). Never propose creating a new image or redesigning anything.

### Step 14 — Persist to the local repository
Invoke `sync-local-repo` before producing the final output:
- `outreach.md`: outreach page slug, portfolio URL, hero content, selected evidence/project, culture-fit reasoning, hiring-path options, closing CTA, preparation status.
- `status.json`: set `outreach.pageUrl`. Advance `status` to `"Outreach Prepared"` — only if the current status isn't already past that point (never regress).
- Do not touch `company.md`, `opportunities.md`, or `contacts.md` — this step only owns the prepared-package fields of `outreach.md`.

### Step 15 — Produce the structured output
Use the Output Format below. Tag every claim per the Fact-Labeling System.

## Output Format

Structure the output to map directly onto `OutreachPage` (`Portfolio/my-portfolio/src/lib/outreach/types.ts`), so it can be transcribed into a new `src/lib/outreach/<slug>.ts` file by a future step without re-deriving anything:

```
# Outreach Package: [Company] — [Role]

## Opportunity
- Company: [name]
- Role: [title]
- Company URL: [link]
- Job URL: [link or Unknown]
- Suggested slug: [lowercase-slug for /r/[slug]]

## hero
- headline: [...]
- subtext: [...]
- ctaLabel: [...]
- ctaTarget: [typically "#evidence"]
- profileImage: [existing asset path]

## whatYouAreSolving.points (exactly 3)
1. [...]
2. [...]
3. [...]

## relevantEvidence
- intro: [3-4 lines]
- companyProblem: [...]
- myExperience: [...] (Evidence: [file/section])
- overlap: [Direct match / Transferable experience / Conceptual overlap — with reasoning]
- Selected project: [project title/slug from projectsMetadata]
- projectImage: [existing asset path]
- caseStudyLabel: [...]
- caseStudyUrl: [/projects/[slug]]

## realDecision
- problem: [...]
- decision: [...]
- tradeoff: [...]
- result: [...]
- Evidence source: [Evidence/technical-decisions.md, Decision N]

## cultureFit
- intro: [...]
- traits: [{ trait, description (Evidence: [source]) }, ...]

## hiringPaths (exactly 3: Premium, Silver, Bronze)
- Premium: { title, message, ctaLabel, ctaTarget }
- Silver: { title, message, ctaLabel, ctaTarget }
- Bronze: { title, message, ctaLabel, ctaTarget }

## scheduling
- url: [existing Calendly link]
- heading: [...]
- subtext: [...]

## relevantProjects (2-4 existing slugs, ranked)
- [slug]: why relevant
- [slug]: why relevant

## closing
- note: [2-3 lines]
- scheduleCtaLabel / scheduleCtaTarget: [...] / "#schedule"
- emailCtaLabel / emailCtaTarget: [...] / [existing mailto: link]

## backToPortfolio
- label: "← Back to Talha's portfolio"
- href: "/"

## metadata
- title: [...]
- description: [...]

## Contact Context
[From find-relevant-contact, if supplied: Primary contact, role, why relevant, recommended outreach angle. Otherwise: "Not yet researched — run find-relevant-contact before outreach."]

## Evidence and Confidence
[Every substantive claim, tagged Confirmed / Evidence / Inference / Unknown, source cited]

## Local Repository Sync
- Record: [Created / Updated / Reused without changes] — `Companies/[slug]/outreach.md`
- Status: [unchanged at X / advanced to "Outreach Prepared"]
```

## Local Repository Integration

This skill owns the prepared-package fields of `outreach.md` (slug, page URL, hero content, evidence selection, culture fit, hiring paths, closing, preparation status) and `status.json.outreach.pageUrl`, plus the `"Outreach Prepared"` status transition — always via `sync-local-repo`. It never touches `company.md`, `opportunities.md`, `contacts.md`, or the draft/send fields of `outreach.md` (those belong to `draft-outreach` and `send-outreach`).

## Workflow Boundary

This skill stops the moment the outreach package above is produced and persisted. It must NOT:

- Draft the final outreach email or message.
- Send anything on the user's behalf.
- Update Notion directly.
- Modify the portfolio frontend, create a new React page, or change any design.
- Modify `career.md`, `Evidence/`, or `Brand/`.
- Discover new companies or perform broad job discovery.
- Write any `Companies/` file directly — only through `sync-local-repo`.

The output is meant to be handed to a future outreach-writing and delivery workflow, or transcribed manually into a new `src/lib/outreach/<slug>.ts` file — this skill does not do either of those itself.
