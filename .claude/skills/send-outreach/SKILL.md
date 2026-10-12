---
name: send-outreach
description: Send one already-drafted, explicitly approved outreach email for one opportunity, then persist the confirmed-sent result to the local Companies/ record via sync-local-repo. Requires fresh, explicit approval in the current conversation or a local record already marked Approved — never sends merely because a draft or prepared outreach page exists. Does NOT discover companies, research companies, find contacts, prepare outreach content, draft or rewrite the email, or modify the portfolio. This is the one skill in the pipeline with an external side effect (sending real email) and always requires the user's explicit go-ahead before it acts.
---

# Send Outreach

Send one previously reviewed and explicitly approved outreach email. This is the external side-effect step of the outreach pipeline — the only one that touches the outside world — and it does exactly that, nothing more: validate the approved email, send it through whatever provider is actually available, confirm what the provider actually said, and sync that real result to Notion.

This skill never decides whether an email should be sent. It never drafts, rewrites, or improves the email. It never discovers, researches, or finds anything. The approved email is the source of truth; this skill's job is to get it out the door faithfully and report exactly what happened, no more and no less than what the provider actually confirms.

**This is a real side effect on a real external system.** Per the standing safety rules this assistant operates under, sending a message on someone's behalf always requires the user's explicit, in-the-moment go-ahead — the approval check below is not a formality this skill performs once and forgets; it's a hard gate that must be satisfied fresh, every time, regardless of what any upstream status field says.

## Workflow Position

```
discover-companies → sync-local-repo → research-company → sync-local-repo
  → find-relevant-contact → sync-local-repo → find-contact-email → sync-local-repo
  → prepare-outreach → sync-local-repo → draft-outreach → sync-local-repo
  → Human Review → Approved (persisted via sync-local-repo)
  → send-outreach → Email Provider Accepted → sync-local-repo → Sent
```

This skill only operates on an opportunity that has reached `Approved` — either an existing workflow/Notion state explicitly marked `Approved`, or explicit approval given by the user in the current conversation. It does not run discovery, research, contact-finding, or drafting itself; those are `discover-companies`, `research-company`, `find-relevant-contact`, and `draft-outreach`.

## Local Repository Check (do this before anything else)

1. Ask `sync-local-repo` to locate the company/opportunity record under `Companies/<slug>/`.
2. **If no record is found, or `outreach.md` has no draft (`status.json.status` hasn't reached `"Drafted"`):** stop. Report plainly: "No drafted outreach found locally for [Company]/[Role]. Run `draft-outreach` first and persist it via `sync-local-repo`, or provide the local record path if this company is tracked under a different slug." Do not send from a bare company/role description alone.
3. **If a record is found:** read `status.json` and `outreach.md` — the approved subject/body, recipient, and portfolio URL come from here as the primary source. Read `status.json.outreach.approvalStatus` and `status.json.outreach.sentStatus` before doing anything else (see Approval Requirement and Duplicate-Send Protection below).

## Required Input

Loaded from the local record above wherever available; only required as direct conversation input when the local record is missing a field:

- Company name
- Role
- Recipient name
- Recipient email
- Contact role
- Approved subject
- Approved email body
- Company-specific portfolio URL
- Sending account/provider information, if available

Example:
```
Company: Atomic
Role: Backend Engineer
Recipient: Jane Doe
Recipient Role: CTO
Recipient Email: jane@example.com
Subject: [approved subject]
Email Body: [approved 4-5 line email]
Portfolio URL: https://talhaatif.tech/r/atomic
```

## Approval Requirement (hard gate — check first, every time)

```
Drafted ≠ Approved ≠ Sent
```

Valid approval is one of:
- An explicit instruction in the current conversation — "Send it," "Approved," "Send this email," or equivalent.
- The local record's `status.json.outreach.approvalStatus` already explicitly set to `"Approved"` (or `status.json.status` already at `"Approved"` or later) from a prior, genuine approval instruction persisted via `sync-local-repo`.

Approval is **never** inferred from any of the following, no matter how complete they look:
- A draft existing (from `draft-outreach`).
- A prepared outreach page existing (from `prepare-outreach`).
- A local record or Notion record merely existing.
- A prior research result, however positive.

If approval is missing or ambiguous, stop immediately and return exactly:
```
Cannot send: explicit approval is required.
```
Do not proceed to validation or sending. Do not ask a leading question designed to manufacture approval — if it's unclear, say so and wait for a real answer.

**As soon as valid approval is confirmed** (whether given fresh in this conversation, or already on file locally), and before Pre-Send Validation runs, persist it via `sync-local-repo`: `status.json.outreach.approvalStatus = "Approved"`, `status.json.status = "Approved"` (never regress if already further along). If approval was freshly given this conversation and wasn't yet on file, this is the moment it gets written — don't wait until after sending to record that approval happened.

## Pre-Send Validation

Run all four before sending anything. Any failure stops the send.

**Recipient**
- A valid recipient email exists and is not missing.
- The recipient matches the researched contact for this opportunity (name, role, and company align with what `find-relevant-contact` established).
- If the email looks uncertain, guessed, or belongs to a different person than the approved contact, stop — never silently substitute a different address.

**Company and role**
- The company and role match the approved opportunity exactly.
- The recipient is actually relevant to this role/company (per the contact research already on record).
- Never silently substitute a different contact, company, or role than what was approved.

**Portfolio URL**
- Uses the existing company-specific route exactly: `https://talhaatif.tech/r/[slug]` (or the actual canonical production domain already established, if different).
- The slug matches the company.
- Never invent a different URL or fall back to the generic homepage when a company-specific page exists.

**Email length and shape**
- Confirms the approved email still respects the `draft-outreach` constraints: 4-5 logical sentences, roughly 60-100 words of actual content, one company-specific observation, one technical connection, one concrete evidence point, one personalized portfolio URL, one low-friction CTA.
- Do not rewrite the email to fix a violation — if it violates these constraints, stop and return the issue for revision by a human or another `draft-outreach` pass. Sending is not the place to edit copy.

## Duplicate-Send Protection

Before sending, check `status.json.outreach.sentStatus` and `status.json.status` in the local record (the primary check — Notion, if synced separately, is not authoritative here). Do not send if the record already shows `Sent`, unless the user explicitly requests a follow-up or a separate new email — in that case, treat it as a distinct send, not a correction of the prior one. If already `Sent` and no explicit follow-up was requested, stop and report:
```
This opportunity is already marked as Sent.
```
Never send the same approved email twice.

## Sending

Use whatever email-sending capability is actually configured in the current environment (a connected email/MCP tool, an integration the user has set up). **Do not assume one exists.** As of this writing, no outbound email-sending provider is configured in this workspace — the portfolio's `nodemailer`/SMTP setup in `Portfolio/my-portfolio/src/app/api/contact/route.ts` handles *inbound* contact-form submissions, not outbound sends on this person's behalf, and is not a usable provider for this skill. Check for an actual sending tool before assuming otherwise; this note should be revisited once/if one is connected.

**If no sending capability is available:**
- Do not pretend the email was sent.
- Do not mark the opportunity `Sent`.
- Report plainly that the email is approved but cannot currently be sent through any available provider, and what would need to be connected to enable it.

**If a provider is available:**
1. Send the approved email exactly as approved — no edits.
2. Wait for the provider's result.
3. Confirm the provider actually accepted the message (not just that the request was issued).
4. Capture the provider's message ID / delivery reference if it returns one.

**Provider acceptance is not delivery, and delivery is not read.** Never claim the recipient received, opened, or read the email unless the provider explicitly reports that — by default, only claim "accepted by provider" unless told more.

## Local Repository Update

Only after confirmed provider acceptance, invoke `sync-local-repo` to persist:
- `outreach.md`: sent timestamp, recipient, provider, provider confirmation/result.
- `status.json`: `outreach.sentStatus = "Sent"`, `status = "Sent"`, plus provider message ID, recipient email, subject, outreach page URL, sending provider where the schema supports it.

Never overwrite existing research, contact, or prepared-outreach content — this step only owns the send-record fields.

Never mark `Sent` if:
- Sending failed.
- The provider returned an error.
- The provider's result is unknown/ambiguous.
- The email was never actually submitted.
- No sending capability was available.

If any of the above apply, persist the failure/ambiguous state instead: leave `status.json.status` at its last confirmed value (e.g. `"Approved"`), and record the failed attempt in `outreach.md` so a retry doesn't look like the first attempt.

If the send succeeded but the local persistence itself fails, report both states plainly rather than picking one:
```
Email Status: Sent
Local Repository Status: Sync Pending
```
Do not automatically resend the email to "fix" a local sync failure — the email side effect already happened; retrying the sync is safe, retrying the send is not.

Notion sync, if used, remains `sync-outreach-notion`'s separate responsibility, reconciled from this local record — this skill does not talk to Notion directly and does not depend on it being configured.

## Failure and Retry Rules

If sending fails:
- Report the failure plainly.
- Preserve the approved draft exactly as it was.
- Do not mark `Sent`.
- Do not automatically modify the email.
- Do not automatically retry repeatedly.

If the result is ambiguous (provider response unclear, timeout, no confirmation either way), report:
```
Unknown send state
```
and stop. Determine whether the provider actually accepted the message before considering any further action. When genuinely uncertain whether a send already went out, prefer reporting a **possible duplicate** risk and asking, over silently resending and risking an **accidental duplicate email** — the two failure modes are not equally bad, and this skill must lean toward the safer one.

## Output Format

```
## Send Result: [Company] — [Role]

- Company: [name]
- Role: [title]
- Recipient: [name <email>]
- Subject: [subject]
- Portfolio URL: [url]
- Provider: [provider name, or "none available"]
- Provider message ID: [id, if returned, else "Unknown"]
- Timestamp: [when the send was attempted/confirmed]

**Confirmation level:** [Accepted by provider / Delivered / Opened — state only what the provider actually confirmed, default to the lowest level the response supports]

## Local Repository Sync

- Previous status: [...]
- New status: [Sent / unchanged, with reason if unchanged]
- Synchronization: [Succeeded / Sync Pending / Not attempted, with reason]
```

If the send did not happen (missing approval, failed validation, no provider, already Sent, ambiguous result), report that outcome directly instead of the format above — do not force a "Send Result" section for a send that didn't occur.

## Human Safety Boundary

This skill sends external communication on the user's behalf. Therefore, it must:
- Never send without explicit, fresh approval.
- Never silently change the recipient.
- Never silently rewrite the approved email.
- Never silently change the portfolio URL.
- Never mark an email `Sent` before confirmed provider acceptance.

The approved email, exactly as approved, is the only thing this skill is authorized to send.

## Local Repository Integration

This skill owns the approval and send fields: `status.json.outreach.approvalStatus` (written the moment valid approval is confirmed), `status.json.outreach.sentStatus`, and the send-record fields of `outreach.md` (timestamp, recipient, provider, confirmation) — always via `sync-local-repo`, and only after the applicable gate (approval confirmed; provider acceptance confirmed) has genuinely been met. It never touches `company.md`, `opportunities.md`, `contacts.md`, or the prepared-package/draft fields of `outreach.md`.

## Workflow Boundary

This skill must NOT:

- Discover companies.
- Research companies.
- Find contacts.
- Create or modify portfolio pages.
- Modify `career.md`, `Evidence/`, or `Brand/`.
- Rewrite the approved email.
- Automatically send follow-ups.
- Automatically resend an ambiguous or failed send.
- Mark the local record (or Notion) `Sent` before successful provider confirmation.
- Write any `Companies/` file directly — only through `sync-local-repo`.

It only validates and sends an explicitly approved outreach email, then persists the real, confirmed result.
