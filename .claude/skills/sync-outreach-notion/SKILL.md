---
name: sync-outreach-notion
description: Create or update one Notion record per job opportunity (Company + Role + Job URL), keeping Notion as the operational system of record for the career outreach workflow. Synchronizes output from discover-companies, research-company, find-relevant-contact, and prepare-outreach into Notion using partial, idempotent, never-regressing updates. Does NOT discover companies, research companies, find contacts, prepare outreach content, draft emails, send emails, or modify the portfolio or career evidence — it only writes workflow data into Notion.
---

# Sync Outreach to Notion

Keep Notion as the operational system of record for the career outreach pipeline: one record per **opportunity** (not per company), created or updated as it moves through discovery → research → contact → outreach preparation → sending → reply, without ever creating duplicates or silently moving a record backwards.

This skill has one job: take the output of `discover-companies`, `research-company`, `find-relevant-contact`, or `prepare-outreach` and reflect it into the correct Notion record. It does not perform any of that upstream work itself, and it stops the moment Notion is updated.

## Core Model

**Track the opportunity, not the company.** `Atomic — Backend Engineer` and `Atomic — Senior Platform Engineer` are two separate records — different job URLs, different requirements, different evidence, possibly different contacts and status. Company name alone is never the identity key.

**Identity key, in priority order:**
1. `Job URL` (strongest — use whenever available)
2. `Company + Role` (fallback when no job URL exists yet, e.g. right after discovery before a live posting is confirmed)

## Notion Database Discovery (do this before ever writing anything)

Never assume a database name, ID, or schema. Search first, fetch to inspect the real schema, and only then decide what to write.

1. Search the workspace (`notion-search`, or the equivalent `notion-*` tools available in the current session — the exact tool name prefix is connection-specific, look for the `notion-search` / `notion-fetch` / `notion-query-data-sources` / `notion-query-database-view` / `notion-create-pages` / `notion-update-page` / `notion-create-database` / `notion-update-data-source` tools) for terms like "Outreach", "Applications", "Job Application Tracker", "Jobs Apply Tracker".
2. Fetch each candidate result to see whether it's a real Notion **database** (has a `<data-source>` with a SQLite schema — queryable, one page per row, typed properties) versus a plain **page** containing a markdown table (not queryable, no property types, no per-row identity for reliable dedup).
3. As of the last inspection, two candidates exist in this workspace and are worth checking again first, since they may have been extended since:
   - **"Applications"** database (parent page "Job Application Tracker") — a real Notion database, but with a minimal schema: `Company` (title), `Link` (url), `Position` (text), `Stage` (status: `No Answer` / `To apply` / `Applied` / `Offer` / `Rejected`). No contact fields, no evidence/score fields, no separate Company URL vs. Job URL, no Company Slug or Outreach Page URL, and the status options don't cover the full lifecycle this workflow needs (no Researching, Research Complete, Contact Found, Outreach Prepared, Ready to Send, Follow-up Due, Replied, Interviewing).
   - **"Jobs Apply Tracker"** page — not a database, a markdown table block on a regular page, but its columns already closely match this workflow's needs: Company, Date applied, Job Link, Contact Person, Person Role, Role, Product / Service, Apply Type, Outreach Status, Application Status, Interview Scheduled?, Notes, Next Action, Follow-up Date. Being a markdown table (not a real data source), it can't be queried or deduplicated reliably by the database tools — any sync against it has to re-read and re-parse the table's markdown text, which is fragile.
4. Decide, and confirm with the user before writing anything the first time this skill runs in a session:
   - If a real database's schema already reasonably covers the required fields, use it directly.
   - If a real database exists but is missing fields this workflow needs (e.g. "Applications" today), do **not** silently expand it. Report exactly which fields are missing and ask whether to extend the schema (`notion-update-data-source` with `ADD COLUMN` / `ALTER COLUMN` statements, additive only, never dropping or retyping existing columns) or proceed using only what exists, folding anything unmapped into Notes.
   - If only an unstructured table-on-a-page exists (e.g. "Jobs Apply Tracker") and no real database exists, report this distinction plainly and ask whether to (a) keep syncing against that page's table via page-content edits, accepting weaker deduplication, or (b) create a proper Notion database modeled on that table's own already-established columns and status vocabulary (via `notion-create-database`), so the new database doesn't invent a divergent taxonomy from what's already in use.
   - **Never create a new database silently, and never silently pick a database the user hasn't confirmed.** If nothing adequate exists and the user hasn't decided, stop and report the gap instead of guessing.
5. Once the target is confirmed for this session, reuse it for the rest of the session's sync operations without re-asking.

## Recommended Field Mapping

Map these logical fields to whatever the real, confirmed database's property names actually are — never assume the names below are literal:

**Opportunity** — Company, Role, Company URL, Job URL, Company Slug, Outreach Page URL
**Contact** — Contact Name, Contact Role, Contact Email, Contact LinkedIn, Contact Type
**Evaluation** — Opportunity Score, Eligibility Confidence, Technical Fit, Role Fit
**Workflow Status** — Outreach Status, Next Action, Notes
**Dates** — Date Discovered, Date Researched, Date Contact Found, Date Outreach Prepared, Date Sent, Follow-up Date

If the confirmed database is "Applications" as currently structured: `Company` → Company, `Link` → Job URL (verify against existing rows whether `Link` has historically held job-posting links or company links before assuming), `Position` → Role, `Stage` → Outreach Status (mapped per the Status Progression section below). Everything else in the Recommended list has no existing property yet — surface this gap rather than inventing values for fields that don't exist.

## Deduplication

Before creating any record:
1. Search/query the confirmed database by Job URL.
2. If no match and a Job URL wasn't available to search on, query by Company + Role.
3. Match found → update it. Do not create a duplicate.
4. No match → create a new record.

Running this skill twice on the same opportunity must never produce two records. When using a real database, do the lookup with `notion-query-data-sources` (SQL mode, e.g. `SELECT * FROM "collection://<id>" WHERE "Job URL" = ?`) or `notion-query-database-view`. When working against an unstructured table-on-a-page, do the lookup by re-reading the page content and matching the Job Link / Company+Role text — call this out explicitly as a weaker, best-effort match in the output, since there's no real uniqueness constraint to lean on.

## Status Progression (never move backwards)

```
Discovered → Researching → Research Complete → Contact Found → Outreach Prepared
  → Ready to Send → Sent → Follow-up Due → Replied → Interviewing → Closed
```

Terminal/negative states, reachable from anywhere: `Rejected`, `No Response`, `Closed`.

Before writing a status, read the record's current status first. Only move forward in the progression above (or into a terminal state), never backward — e.g. a `research-company` sync must never downgrade a record already at `Sent` back to `Research Complete`. If the input implies an earlier stage than the record's current status, skip the status write entirely (still update whatever other fields are present) and note in the output that the status was preserved.

**Use the confirmed database's real existing status options.** If it uses a different taxonomy (e.g. "Applications"' real `Stage` options today: `No Answer`, `To apply`, `Applied`, `Offer`, `Rejected`), map each logical status to the closest existing option and state the mapping explicitly in the output rather than inventing new options silently. Only add missing status options via `notion-update-data-source` with the user's explicit confirmation (per Notion Database Discovery step 4) — never as an automatic side effect of a sync.

## Email Status (never mark Sent early)

Distinguish, using a dedicated property if one exists, or a clearly-labeled convention inside Notes if the confirmed database has only one status field:

- **Not Sent** — no outreach message sent yet.
- **Drafted** — message content prepared, not sent.
- **Ready to Send** — reviewed and ready.
- **Sent** — actually sent. Only set this when a sending workflow explicitly confirms the send — never because a portfolio page was prepared, a draft was written, a contact was found, or `prepare-outreach` completed. This skill has no sending step of its own, so it should essentially never write `Sent` unless the calling context explicitly states the email was sent.
- **Replied** — the contact responded.

## Outreach Page URL

When `prepare-outreach` supplies a slug, the public URL follows the existing route exactly: `/r/[slug]`. The known deployed base for this portfolio is `https://talhaatif.tech` (confirmed from existing Notion outreach notes), giving e.g. `https://talhaatif.tech/r/atomic`. Never invent a different route or a different base domain. Store it in the Outreach Page URL field if one exists; otherwise note it in Notes. Never modify the portfolio codebase to "make" this URL work — it already exists.

## Inputs and Default/Update Status

| Source skill | Typical data | Status on sync |
|---|---|---|
| `discover-companies` | Company, Role, Company URL, Job URL, location, remote status, company stage, opportunity score, eligibility info, recommendation | `Discovered` |
| `research-company` | Company/product/engineering research, technical stack, hiring context, remote eligibility, compensation, evidence, risks | `Research Complete` |
| `find-relevant-contact` | Contact name, role, email, LinkedIn, contact type, why relevant, recommended outreach angle | `Contact Found` |
| `prepare-outreach` | Company slug, outreach page URL, hero content, relevant evidence, selected projects, culture fit, hiring paths, closing note, contact context | `Outreach Prepared` |

These are the status a fresh sync from that source would imply — always subject to the never-move-backwards rule above.

## Update Rules

- Update only the fields present in the current input. Never erase a field because the current sync's source doesn't mention it — e.g. a later `research-company` sync must not wipe out contact info a prior `find-relevant-contact` sync already wrote.
- Never replace a populated field (especially a URL) with an empty value.
- Treat every write as a partial update (`notion-update-page` with `update_properties`, only including the properties that actually changed).

## Notes

Keep Notes concise and operationally useful, not a dumped research report: preserve important eligibility constraints, key risks, the recommended next action, the outreach angle, and any unknowns still needing verification. Only paste a fuller report if the confirmed database is explicitly designed for that (e.g. a long-text field intended for full notes) — default to a short operational summary.

## Date Handling

Set the milestone date for whichever step just completed, using today's date, and never set a later milestone's date preemptively:
- `Date Discovered` — when first discovered.
- `Date Researched` — when research completes.
- `Date Contact Found` — when a contact is found.
- `Date Outreach Prepared` — when outreach content is prepared.
- `Date Sent` — only when a send is actually confirmed, never during preparation.
- `Follow-up Date` — when a follow-up is scheduled (from `find-relevant-contact`'s recommended sequence or explicit user input).

## Hard Constraints (never violate)

- Never create a duplicate record for the same opportunity.
- Never mark an email as `Sent` without an explicit, confirmed send.
- Never overwrite a later workflow status with an earlier one.
- Never delete existing contact information or existing research content.
- Never replace a valid, populated URL with an empty value.
- Never modify `career.md`, `Evidence/`, `Brand/`, the portfolio, or any other skill's file.
- Never discover companies, perform broad company research, find contacts, prepare outreach content, draft emails, or send emails — this skill only writes already-produced workflow data into Notion.
- Never create a new Notion database, or expand an existing one's schema, without first reporting the gap and getting explicit confirmation.

## Workflow

### Step 1 — Confirm the Notion target
Follow Notion Database Discovery above. If already confirmed earlier in the session, reuse it.

### Step 2 — Identify the opportunity and its source data
Determine which upstream skill's output is being synced (or accept a direct company/role/job-URL input) and what data it provides.

### Step 3 — Deduplicate
Search by Job URL, then Company + Role, per the Deduplication section. Determine: create or update.

### Step 4 — Read the existing record (if updating)
Fetch the current record's properties, especially its current status, before writing anything, so the status-safety and partial-update rules can be applied correctly.

### Step 5 — Map fields
Map the input data to the confirmed database's real property names per Recommended Field Mapping. Never invent a value for a field that isn't in the input.

### Step 6 — Apply status safety
Compute the new status implied by this sync's source (per Inputs table), compare against the current status's position in the Status Progression, and only write it if it's a forward move (or a terminal state). Otherwise skip the status field and note why.

### Step 7 — Write the update
Create (`notion-create-pages`) or update (`notion-update-page`, `update_properties`) with only the changed/new fields. Set the relevant milestone date. Write a concise Notes update per the Notes section.

### Step 8 — Report

```
## Sync Result: [Company] — [Role]

**Record Action:** Created / Updated / Already up to date / Skipped

**Opportunity**
- Company: [name]
- Role: [title]
- Job URL: [link or Unknown]

**Notion Record**
- Page: [URL or ID]
- Current status: [status]

**Fields Updated**
- [field]: [old → new, only fields actually changed]

**Current Workflow State**
[Company] → [Role] → [status]

**Next Action**
[one concrete next step, e.g. "Draft personalized outreach email" or "Confirm the Notion target database before further syncs"]
```

If the Notion target couldn't be confirmed (Step 1 blocked), report that instead of the above, stating exactly what was found and what decision is needed from the user.

## Workflow Boundary

This skill stops the moment Notion has been updated (or the target-database question has been reported). It must NOT:

- Discover companies.
- Perform broad company research.
- Find contacts.
- Prepare outreach page content.
- Draft or send emails.
- Modify the portfolio.
- Modify career evidence.

It only synchronizes already-produced workflow data into Notion.
