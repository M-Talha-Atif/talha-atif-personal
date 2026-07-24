---
name: sync-local-repo
description: Maintain Companies/<slug>/ as the detailed, canonical local record for each outreach opportunity, and the PRIMARY source of truth for the entire outreach pipeline — read the relevant company record before running any pipeline skill (to avoid duplicate research, contact-finding, email-enrichment, or outreach), and write each skill's result into the record immediately after it completes, so no stage ever depends on a full report being re-pasted into the conversation. Does NOT perform research, contact-finding, email-finding, drafting, or sending itself, and does NOT invent data. Notion, if used at all, is a secondary operational dashboard synced from this record, never a requirement for the pipeline to function.
---

# Sync Local Repo

Keep `Companies/<company-slug>/` as the detailed, file-based **primary source of truth** for the outreach pipeline. Every pipeline skill reads the relevant record before doing its own work (to avoid repeating research, contact-finding, email-finding, or outreach prep that already happened, and to avoid requiring the previous skill's full output to be re-pasted into the conversation) and writes each stage's result back into the record, through this skill, immediately after it completes — before that skill's own final report is produced.

This skill does not do the pipeline's actual work. It does not research companies, find contacts, find emails, draft outreach, or send anything — it persists what those skills already produced, and tells the caller what already exists before they redo it.

## Workflow Position

```
discover-companies → sync-local-repo → research-company → sync-local-repo
  → find-relevant-contact → sync-local-repo → find-contact-email → sync-local-repo
  → prepare-outreach → sync-local-repo → draft-outreach → sync-local-repo
  → explicit human approval (persisted via sync-local-repo)
  → send-outreach → sync-local-repo → (optional, separate git commit/push checkpoint)
```

`sync-local-repo` runs around every one of those steps, not after just one of them:

- **Before** a pipeline skill runs, to check whether the work it's about to do has already been done (and to hand it the prior stages' data instead of requiring pasted context).
- **After** a pipeline skill produces output, to persist it — required, not optional, before that skill's final report.
- **Optionally, afterward,** to relay a summary/status to Notion via `sync-outreach-notion`, if Notion is configured for this session — never a blocking dependency for any pipeline skill.

Git commit/push is explicitly **not** part of this skill's job and is not triggered automatically by any pipeline skill — it's a separate, explicit checkpoint the user invokes when they choose to (see GitHub Synchronization below).

## Company Record Layout

```
Companies/
└── <company-slug>/
    ├── company.md
    ├── opportunities.md
    ├── contacts.md
    ├── outreach.md
    └── status.json
```

`Companies/` and a slug-per-company layout is already the intended convention in this workspace (the directory exists, currently empty) — this skill is what actually populates it. Do not invent a different top-level directory or a different per-company shape. If a future run finds an existing company directory that doesn't match this exact shape, reuse and extend it rather than creating a competing structure next to it.

**Slug rule:** lowercase, hyphenated, derived from the company name (e.g. "CoverGo" → `covergo`, "Atomic" → `atomic`). Normalize before comparing — strip legal suffixes (Inc, Ltd, GmbH), punctuation, and casing differences when checking whether a company directory already exists.

**File responsibilities:**
- `company.md` — company-level facts: what they build, stage/size, funding, engineering culture, Pakistan hiring compatibility, source URLs. Written/updated by `research-company` syncs.
- `opportunities.md` — one section per job opportunity at this company (a company can have more than one open role tracked at once). Role, job URL, requirements, evidence-match assessment, risks, recommendation. Written/updated by `research-company` syncs.
- `contacts.md` — one section per contact found for this company. Name, title, LinkedIn, relevance score/confidence/reason (from `find-relevant-contact`), then email/verification/provider/confidence (from `find-contact-email`) appended to the same contact entry, not a separate file.
- `outreach.md` — one section per opportunity's outreach content and drafts: `prepare-outreach` package, `draft-outreach` subject/body/status, and (after send) the send record.
- `status.json` — compact machine-readable state for the opportunity (see Status.json below). If a company has multiple opportunities, use one `status.json` per opportunity subpath instead of collapsing them (`Companies/<slug>/<role-slug>/status.json`) — decide this the first time a company gets a second tracked opportunity, and report the layout choice rather than silently picking one.

## When to Read the Local Repository

Read the relevant company record **before** any of these run, so their own workflow can check for existing work first:

1. `research-company` — has this company/opportunity already been researched?
2. `find-relevant-contact` — are contacts already known for this company?
3. `find-contact-email` — has this contact's email already been found or verified?
4. `prepare-outreach` — has outreach content already been prepared for this opportunity?
5. `draft-outreach` — has an email already been drafted?
6. `send-outreach` — has outreach already been sent for this opportunity?
7. Any Notion status update — what does the local record say, so Notion can be reconciled against it rather than treated independently.

**Token-efficiency reading strategy — do not load every file for every check:**

1. Always read `status.json` first — it's small and answers "does this exist, and how far along is it" without touching the larger markdown files.
2. Read only the file relevant to the current stage:
   - `find-contact-email` → `status.json` + `contacts.md`. Do not reread `company.md`/`opportunities.md`.
   - `prepare-outreach` → `status.json` + `company.md` + `opportunities.md` + `contacts.md`, plus `Evidence/`/project files only as actually needed.
   - `draft-outreach` → `status.json` + `outreach.md` + the relevant contact section of `contacts.md`. Do not rerun or reread full company research.
   - `send-outreach` → `status.json` + `outreach.md` (the approved draft specifically). Do not reread research or contact-discovery content.
3. Read additional files only when the current step genuinely needs them, not by default.

If `status.json` shows the relevant stage is already complete and current, report that plainly and recommend reusing it instead of repeating the work — do not silently redo it, and do not silently skip it either; surface the decision.

## Field Ownership (single writer per field — no skill overwrites another's data)

| File / field | Owner (writer) | Written on status transition |
|---|---|---|
| `company.md` (product, stage, funding, culture, Pakistan compatibility, sources) | `discover-companies` (initial) + `research-company` (deepens) | `Discovered` / `Researched` |
| `opportunities.md` (role, job URL, requirements, evidence-match, risks, recommendation) | `discover-companies` (initial) + `research-company` (deepens) | `Discovered` / `Researched` |
| `contacts.md` — discovery fields (name, title, LinkedIn, relevance, confidence, reason, evidence) | `find-relevant-contact` | `Contact Found` |
| `contacts.md` — email fields (email, verification status, provider, confidence, verified date) | `find-contact-email` | `Email Found` |
| `outreach.md` — prepared package (hero, evidence selection, culture fit, hiring paths, closing, slug/pageUrl) | `prepare-outreach` | `Outreach Prepared` |
| `outreach.md` — draft (subject, alternatives, body, draft date, targeted contact) | `draft-outreach` | `Drafted` |
| `outreach.md` — send record (timestamp, recipient, provider, confirmation) | `send-outreach` | `Sent` (or failure noted, no advance) |
| `status.json.status` (overall lifecycle) | Advanced by whichever stage just completed, per that stage's own allowed transition — never regressed | See Status Model |
| `status.json.opportunity.*` | `discover-companies` (create) + `research-company` (confirm/update if a fact changed) | — |
| `status.json.contact.name`/`title` | `find-relevant-contact` | — |
| `status.json.contact.email`/`emailStatus` | `find-contact-email` | — |
| `status.json.outreach.pageUrl` | `prepare-outreach` | — |
| `status.json.outreach.draftStatus` | `draft-outreach` | — |
| `status.json.outreach.approvalStatus` | `send-outreach` (written the moment valid approval is confirmed, before sending) | — |
| `status.json.outreach.sentStatus` | `send-outreach` (written only after confirmed provider acceptance) | — |
| `status.json.notion.*` | `sync-outreach-notion` only, relayed through this skill | — |

A skill invoking this one only ever supplies data for the fields it owns. When persisting, only update those fields — never touch a field owned by a different stage, even if the caller happens to have that data available (e.g. `draft-outreach` must not touch `contacts.md`'s email fields even if the email was mentioned in its input).

## When a Record Can't Be Found

Two different situations, handled differently:

- **Entry-point skills** (`discover-companies` always; `research-company` when invoked standalone without a prior `discover-companies` run) are allowed to initialize a new record after this skill's duplicate-detection confirms none exists — this is not "silently creating an unrelated duplicate," it's the sanctioned first write for a genuinely new opportunity.
- **Every downstream skill** (`find-relevant-contact`, `find-contact-email`, `prepare-outreach`, `draft-outreach`, `send-outreach`) assumes a record already exists from an earlier stage. If this skill reports no match for the company/opportunity they're asking about, that downstream skill must stop and report the gap — asking for the local record path if the company might be tracked under a different slug, or stating plainly that the opportunity must first be initialized via `discover-companies`/`research-company` + this skill. It must never fabricate a company directory to paper over the gap.

## When to Write to the Local Repository

Write immediately after each stage produces real output. Every write is additive/updating, never a destructive overwrite of stronger existing evidence with weaker evidence.

**After company discovery** (`discover-companies`):
- Create the company directory if it doesn't exist (after the duplicate-prevention check below).
- `opportunities.md`: add the opportunity (source URL, job URL, discovery date).
- `status.json`: create with `status: "Discovered"`.

**After `research-company`:**
- `company.md`: company-level facts, tagged Confirmed / Public Evidence / Inference / Unknown, cited to source.
- `opportunities.md`: the specific opportunity's requirement breakdown, evidence-match assessment (Strong/Partial/Transferable/Skill gap/Unknown), risks, recommendation.
- Never overwrite a stronger existing fact with a weaker/less-confident one — if new research contradicts prior research, note both and flag the conflict rather than silently replacing.
- `status.json`: advance to `"Researched"` (subject to the never-downgrade rule below).

**After `find-relevant-contact`:**
- `contacts.md`: name, title, company, profile URL, relevance score, confidence, reason for selection, evidence, unknowns.
- `status.json`: advance to `"Contact Found"`.

**After `find-contact-email`:**
- `contacts.md`: append to the existing contact entry — email, verification status, confidence, provider/source, verification date, whether it's safe for outreach. Never guess an email address; if none was found, record that plainly rather than leaving the field silently blank with no explanation.
- `status.json`: advance to `"Email Found"` only if a usable (Verified or Found-but-unverified) result exists; if the result was "Not found" or "Ambiguous," record that in `contacts.md` but do not advance status past `"Contact Found"`.

**After `prepare-outreach`:**
- `outreach.md`: outreach page slug, portfolio URL, personalized evidence used, relevant projects, culture-fit reasoning, hiring-path options, closing CTA, preparation status.
- `status.json`: advance to `"Outreach Prepared"`.

**After `draft-outreach`:**
- `outreach.md`: recommended subject, alternative subjects, final email draft, contact targeted, draft date.
- `status.json`: `status: "Drafted"`.

**After explicit human approval** (a real conversational instruction, not inferred from an artifact existing):
- `status.json`: `status: "Approved"`. Do not write this from any other trigger.

**After `send-outreach`, only once the email provider confirms acceptance:**
- `outreach.md`: sent timestamp, recipient, provider, provider confirmation/result.
- `status.json`: `status: "Sent"`, plus the same details.
- If sending fails or the result is ambiguous: do not mark `Sent`. Record the failure/ambiguous state in `outreach.md` and leave `status.json` at its last confirmed status (e.g. `"Approved"`), noting the failed attempt rather than silently retrying or advancing.

## Status Model

```
Discovered → Researched → Contact Found → Email Found → Outreach Prepared
  → Drafted → Approved → Sent → Replied → Interview → Offer → Closed
```

Terminal/alternative states, reachable from anywhere: `Rejected`, `Not Eligible`, `No Contact`, `Email Not Found`, `Failed`, `Paused`.

Rules:
- Never skip states silently — if a sync would jump more than one step ahead (e.g. straight to `Outreach Prepared` with no recorded `Contact Found`), write the intermediate state's data if it's available in the input, or flag the gap explicitly rather than silently advancing status alone.
- Never downgrade an existing status. If `status.json` already shows `"Sent"` and a later `research-company` re-run happens (e.g. refreshing stale info), the status stays `"Sent"` — only the relevant content files update, `status.json`'s status field does not move backward.
- `Email Not Found` / `No Contact` are legitimate terminal-ish states for a given attempt, not failures to hide — record them plainly.

## status.json

Compact, machine-readable. One file per opportunity (see Company Record Layout for the multi-opportunity note).

```json
{
  "company": "CoverGo",
  "slug": "covergo",
  "status": "Email Found",
  "lastUpdated": "2026-07-24",
  "opportunity": {
    "role": "Senior Full Stack Engineer",
    "jobUrl": "...",
    "companyUrl": "..."
  },
  "contact": {
    "name": "...",
    "title": "...",
    "email": "...",
    "emailStatus": "Verified"
  },
  "outreach": {
    "pageUrl": "...",
    "draftStatus": "Not Started",
    "approvalStatus": "Not Approved",
    "sentStatus": "Not Sent"
  },
  "notion": {
    "synced": false,
    "recordUrl": null
  }
}
```

Adapt fields as new stages need new data — additive only, never remove a field that's already populated just because the current sync doesn't mention it.

## Duplicate Prevention

**Before creating a company directory:**
1. Normalize the company name (strip legal suffixes, punctuation, casing) into a candidate slug.
2. Search existing `Companies/*` directories for a match by slug, company name, or domain.
3. Reuse the existing directory if found — never create `covergo` and `co-vergo` as separate records for the same company.

**Before adding an opportunity:**
1. Search by company + role within the existing company directory.
2. Search by exact job URL.
3. Reuse the existing opportunity entry if it's the same job — update it, don't duplicate it.

**Before adding a contact:**
1. Check the existing `contacts.md` for the company.
2. Deduplicate by name, LinkedIn URL, or email.
3. Append new information (e.g. an email found later) to the existing contact entry rather than creating a second entry for the same person.

## GitHub Synchronization (explicit checkpoint only)

This skill is responsible for local persistence only — it does not run `git add`/`commit`/`push`, and no pipeline skill triggers a commit automatically after an individual stage. Committing/pushing `Companies/` changes is a separate, explicit action the user requests as its own step (e.g. "commit the CoverGo record" or a periodic batch commit across several opportunities) — never an automatic side effect of any single sync.

## Notion Relationship

**The local repository is now the primary source of truth for the entire pipeline** — every read-before-work and write-after-work check described above happens against `Companies/`, not Notion, and no pipeline skill requires Notion to be configured in order to function.

Notion, when configured, is a **secondary operational dashboard**: company, role, contact, email, job URL, portfolio URL, current status, last action, next action, timestamps, and the Notion record URL — a summary view relayed from the local record via `sync-outreach-notion`, never the other way around, and never a blocking dependency.

Do not blindly copy everything local into Notion. After a local update, sync only the relevant summary/status to Notion **through `sync-outreach-notion`** — this skill does not talk to Notion directly, it hands off to that skill.

- If no Notion record exists yet: do not assume a sync succeeded silently. Locate or create the correct record via `sync-outreach-notion`'s existing discovery/deduplication workflow, and report the Notion record URL once available, storing it in `status.json`'s `notion.recordUrl`.
- If a Notion record exists: update it, never create a duplicate merely because a search was inconvenient this run.

## Conflict Resolution

If the local repository and Notion disagree:

1. The local repository is the primary source of truth for both content/evidence and status — Notion is a secondary dashboard, not an independent authority.
2. Never downgrade the local status to match a stale or lagging Notion state — local status only ever moves forward per the Status Model, regardless of what Notion shows.
3. Sync Notion to match the local workflow state when they diverge (e.g. local shows `Sent` with a confirmed send record, Notion still shows `Drafted` — push the update to Notion).
4. The one exception: if Notion shows a status local has no record of at all (e.g. a manual edit made directly in Notion, outside this pipeline), don't silently trust it as more advanced — report the discrepancy and ask, since it might reflect real out-of-band activity or might just be a stale/manual edit with no evidence behind it.
5. If the conflict materially affects what should happen next (e.g. Notion says `Sent` but the local repo has no send record at all), report the conflict directly instead of picking a side silently.

## Source and Evidence Discipline

Preserve the fact-labeling discipline already used across the pipeline (`Confirmed` / `Public Evidence` or `Evidence` / `Inference` / `Unknown`) when writing into `company.md`/`opportunities.md`/`contacts.md` — carry the label through from the source skill's output, don't flatten it into plain prose.

Never convert:
- An inference into a stated fact.
- A guessed/pattern-generated email into a verified one.
- Old information into current information without checking whether it's stale (e.g. a contact's title from three months ago).

Preserve existing evidence unless new evidence is stronger or explicitly supersedes it — when it does, note both the old and new value rather than silently deleting the old one.

## Output Behavior

After running this skill, report briefly:

```
## Local Repo Sync: [Company] — [Role]

- Company record: Created / Updated / Already current
- Files changed: [list, or "None"]
- Current workflow status: [status.json status]
- Notion synced: Yes / No / Not attempted
- Notion record URL: [url, or "None"]
- Next valid workflow step: [one concrete next step]
```

Do not produce a long explanation unless requested — this is a persistence step, not a report-generation step.

## Skill Boundary

This skill manages local repository state only. It must NOT:

- Perform company research itself.
- Discover contacts itself.
- Find emails itself.
- Draft or send outreach itself.
- Invent missing data or guess an email address.
- Silently modify unrelated files or other skills.
- Silently create a Notion record itself — that's `sync-outreach-notion`'s job; this skill only triggers/hands off to it.

It is a persistence and synchronization skill, not a research or outreach skill. Every write it makes reflects work another skill already did.
