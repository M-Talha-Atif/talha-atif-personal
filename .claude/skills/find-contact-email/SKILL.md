---
name: find-contact-email
description: Given one already-selected, already-verified contact (from find-relevant-contact), first check the local Companies/ record for an existing verified email before spending any enrichment credits, then — only if needed — attempt to find one via the Apollo connector, and persist the result to the local record via sync-local-repo. Does NOT discover companies, does NOT pick a different contact unless the given one is invalid, does NOT draft or send an email, and never marks an opportunity Drafted/Approved/Sent. If Apollo isn't connected or returns nothing verified, reports that plainly and recommends the next legitimate channel — it never guesses or fabricates an email address.
---

# Find Contact Email

Take the one contact `find-relevant-contact` already identified and try to find a real, verified professional email address for them — nothing more. This is a narrow enrichment step between contact-finding and outreach prep, not a second contact search and not a license to guess.

## Workflow Position

```
research-company → find-relevant-contact → sync-local-repo → find-contact-email
  → sync-local-repo → prepare-outreach → draft-outreach → human approval
  → send-outreach → sync-local-repo
```

This skill only runs after a contact has already been identified and verified as relevant by `find-relevant-contact`. It does not re-run that skill's research, and it does not feed into `prepare-outreach`/`draft-outreach` with anything beyond an email result — the content of the outreach itself is out of scope here.

## Local Repository Check (do this first, before even checking Apollo — this step exists to avoid spending enrichment credits on work already done)

1. Ask `sync-local-repo` to locate the company/opportunity record under `Companies/<slug>/`.
2. **If no record is found:** stop. Report plainly: "No local record found for [Company]/[Role]. This step assumes `find-relevant-contact` has already run and been persisted via `sync-local-repo`. Run that first, or provide the local record path if this company is tracked under a different slug." Do not proceed to Apollo/Snov and do not invent a record.
3. **If a record is found:** read `status.json` and `contacts.md` for the target contact.
   - If `contacts.md` already shows an email with `emailStatus: Verified` for this exact contact, **stop here** — do not call Apollo, Snov, or any other enrichment source. Report the existing verified email and its recorded source/date as the result. Only re-verify if the user explicitly asks for a re-check (e.g. the email might have gone stale) or the contact's employment has changed since it was recorded.
   - If it shows `Found but unverified`, `Not found`, or `Ambiguous`, that's not a blocking result — proceed to Apollo/Snov as normal, but mention the prior attempt (date, source, result) in the report for context rather than presenting this as the first-ever attempt.
   - If `contacts.md` has no email field at all yet, proceed normally — this is the first attempt.

## Input

Expects an already-selected contact. The local record found above is the primary source for name/title/company/LinkedIn/domain — only fall back to a conversation-supplied contact description if the local record is missing or thinner:

```
Company: CoverGo
Role: Senior Full Stack Engineer
Contact: Victor Makovsky
Title: Head of Engineering
Company: CoverGo
LinkedIn: [profile URL]
Company domain: covergo.com
```

If any of name, company, or company domain is missing from both the local record and the conversation, resolve it from whichever is available before asking — don't re-research the company to fill the gap, that step already happened.

## Apollo Connector Availability (check this first among the enrichment sources, every time the Local Repository Check above didn't already resolve it)

**As of this writing, no Apollo MCP connector is installed in this workspace** — a registry search for "apollo," "apollo.io," "email finder," "contact enrichment," "sales intelligence," and "lead enrichment" all returned zero connectors. Do not assume this has changed. Every run of this skill must:

1. Check for an available Apollo tool (search for tools with "apollo" in the name; if none are loaded, use the MCP registry search to check whether a connector is installed).
2. If no Apollo connector is available, stop the enrichment attempt immediately and report:
   ```
   Apollo is not connected in this environment. Email outreach is blocked until it is.
   ```
   Then follow the registry's normal flow for suggesting a connector if the user wants to connect one — do not attempt to search for an email through any other means as a substitute (see Hard Constraints).
3. If Apollo **is** available, read its actual tool schema before calling anything — use whichever real tool name and parameters that connector exposes for person search / email enrichment. **Never hardcode or assume a specific Apollo tool name or field name in advance** — the exact tools depend entirely on what's actually connected, and inventing plausible-sounding ones (e.g. a guessed `apollo_search_people` call) is exactly what this skill must not do.

## Primary Source: Apollo (once connected)

When Apollo is available, use it as the only email-enrichment source for this skill:

1. Search for the exact person at the exact company — full name plus company name and/or company domain, not a fuzzy or partial match.
2. Prefer a verified professional/work email over any other result type Apollo returns.
3. Confirm the person-company association as far as the connector's own data allows (current employer match, title match) — don't accept a same-name result at a different company.
4. Record the source and confidence exactly as Apollo reports it — don't upgrade a low-confidence result to "verified" by assumption.
5. Avoid personal emails unless the connector surfaces one as the only available option **and** using it is clearly justified and stated as such — professional email is always preferred.
6. Never guess an email address from a naming pattern (e.g. `first.last@company.com`), whether or not Apollo returns anything.
7. Never treat an inferred or pattern-generated email as verified, even if Apollo itself labels something as a lower-confidence guess — only Apollo's own highest-confidence verified result counts as "Verified" in this skill's output.

## Hard Constraints (never violate)

- Never discover new companies or re-run broad company research.
- Never select a different contact than the one supplied, unless that contact is clearly invalid (wrong company, no longer there, unresolvable identity) — and if so, say exactly why before falling back to anything else, rather than silently substituting someone.
- Never draft an outreach email or any message content.
- Never send anything.
- Never mark an opportunity `Sent`.
- Never guess or pattern-generate an email address, under any circumstance, including as a fallback when Apollo finds nothing.
- Never use a personal/private contact channel (personal phone number, personal email scraped from an unrelated context, etc.) as a substitute for a verified professional email.
- Never invent an Apollo tool name, parameter, or response field that hasn't actually been observed in that connector's real schema this run.
- Must be safe to run repeatedly on the same opportunity without creating a duplicate Notion record or corrupting the existing outreach status — every Notion write here is a partial, idempotent update (see Notion Integration).

## Email Result States

- **Verified** — a professional email returned with strong confidence by Apollo, with a confirmed person-company association.
- **Found but unverified** — Apollo returns an email, but confidence is insufficient to treat it as ready for outreach.
- **Not found** — no usable email found.
- **Ambiguous** — multiple possible people or emails exist and identity cannot be confidently resolved to the one contact supplied.

Only **Verified** counts as ready for email outreach. Everything else blocks email outreach and routes to the next legitimate channel instead (typically the contact's LinkedIn, or the company's official application/contact channel) — never a guessed address.

## Workflow

### Step 0 — Local Repository Check
Per Local Repository Check above. If it already resolved a `Verified` email, skip straight to Step 7 (Persist — a no-op re-confirmation) and Step 8 (Report) without touching Apollo/Snov at all.

### Step 1 — Confirm Apollo availability
Per Apollo Connector Availability above. If unavailable, skip straight to the Output Format's "blocked" state and stop — do not attempt any other lookup method as a substitute.

### Step 2 — Confirm the contact
Take the supplied contact as-is. Only treat it as invalid (triggering a stop-and-report, not a silent re-selection) if it's clearly wrong — e.g. the person has publicly left the company, or the company/domain doesn't match.

### Step 3 — Search
Using Apollo's actual person-search/enrichment tool (per its real schema), search for the exact person at the exact company/domain.

### Step 4 — Evaluate the result
Classify into one of the four Email Result States. Record Apollo's own stated confidence and source detail — don't add or subtract confidence based on outside reasoning.

### Step 5 — Determine outreach readiness
Only `Verified` → ready for email outreach. Everything else → not ready, with the recommended next channel stated.

### Step 6 — Persist to the local repository
Invoke `sync-local-repo`:
- `contacts.md`: append to the existing contact entry — email, verification status, confidence, provider/source, verification date, whether it's safe for outreach.
- `status.json`: set `contact.email`/`contact.emailStatus`. Advance `status` to `"Email Found"` only if the result is `Verified` or `Found but unverified` (a usable result) — if `Not found` or `Ambiguous`, record that in `contacts.md` but leave `status` at `"Contact Found"`, and never regress it if it's already further along.
- Never mark `Drafted`, `Approved`, or `Sent` as a side effect of this step — finding an email changes nothing about those fields.
- Do not touch `company.md`, `opportunities.md`, `outreach.md`, or the contact-discovery fields (name/title/relevance) in `contacts.md` — this step only owns the email fields.

### Step 7 — Report
Use the Output Format below.

## Output Format

```
## Find Contact Email: [Company] — [Contact Name]

### Contact
- Name: [name]
- Title: [title]
- Company: [company]

### Local Repository Check
- Existing email on file: [None / Verified — reused, no lookup performed / Found but unverified, dated [date] — retrying / Not found, dated [date] — retrying]

### Email Result
- Email: [email, or "Not found"]
- Status: Verified / Found but unverified / Not found / Ambiguous
- Confidence: High / Medium / Low
- Source: Apollo / Snov.io / Local record reuse (or "Apollo not connected" if blocked at Step 1)
- Reason: [brief explanation of the result]

### Outreach Readiness
- Email outreach ready: Yes / No
- Reason: [one or two sentences]
- Recommended channel if not ready: [LinkedIn profile URL / company application channel / "none — Apollo not connected"]

### Local Repository Sync
- Record: [Updated / Reused without changes] — `Companies/[slug]/contacts.md`
- Status: [unchanged at "Contact Found" / advanced to "Email Found"]
```

If Apollo isn't connected at all and no local email is already on file, report that at the top of the Email Result section and skip straight to Local Repository Sync with "Not attempted — no email result to record" rather than forcing the rest of the format.

## Workflow Boundary

This skill must NOT:

- Discover or research companies.
- Select a different contact than the one supplied, except to reject a clearly invalid one (with a stated reason).
- Draft an outreach email.
- Send an email.
- Mark an opportunity `Sent`.
- Guess or pattern-generate an email address.
- Re-run Apollo/Snov enrichment when the local record already shows a `Verified` email for this exact contact (see Local Repository Check).
- Use personal/private contact information as a substitute for a verified professional email.
- Write any `Companies/` file directly — only through `sync-local-repo`.
- Create a duplicate contact entry, or advance/regress the existing outreach workflow status beyond what Step 6 permits.

It only attempts to find a verified professional email for an already-selected contact, and records the real result.

## Local Repository Integration

This skill owns exactly the email-related fields of `contacts.md` (email, verification status, confidence, provider/source, verification date, outreach-safety) and `status.json.contact.email`/`contact.emailStatus`, plus the `"Email Found"` status transition — always via `sync-local-repo`. It never writes the contact-discovery fields (name/title/relevance — `find-relevant-contact`'s job) and never touches `company.md`, `opportunities.md`, or `outreach.md`. Notion sync, if used, remains `sync-outreach-notion`'s separate, optional responsibility — this skill's local persistence does not depend on Notion being configured at all.
