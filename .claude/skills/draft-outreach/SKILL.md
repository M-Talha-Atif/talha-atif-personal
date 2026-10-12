---
name: draft-outreach
description: Draft one extremely short, personalized cold outreach email (60-100 words, 4-5 lines) for one already-prepared company/role/contact opportunity, pointing the reader to their personalized outreach page (/r/[slug]) for the full story. Loads the prepared package from the local Companies/ record via sync-local-repo rather than requiring it to be re-pasted. Does NOT discover companies, research companies, find contacts, prepare outreach-page content, send the email, or mark anything as Sent — it only produces a draft for human review.
---

# Draft Outreach

Write the email that gets someone to click the personalized portfolio page — not the email that tries to be the pitch itself.

The detailed story — engineering evidence, selected projects, culture fit, evaluation paths — already lives on the company-specific outreach page (`https://talhaatif.tech/r/[slug]`, built by `prepare-outreach` and rendered by the existing `/r/[slug]` template). This skill's only job is the hook: a short, specific, evidence-backed email that makes the recipient curious enough to open that page. It is the trailer, not the movie. It must never try to explain the whole career.

## Workflow Position

Runs after all four research/prep skills, expects the opportunity to already be at `Outreach Prepared`, and stops at a human-reviewable draft — it never sends anything or advances the status past `Drafted`:

```
Outreach Prepared (local record)
      ↓
draft-outreach → sync-local-repo
      ↓
Drafted
      ↓
Human Review → explicit approval
      ↓
send-outreach → sync-local-repo
      ↓
Sent
```

This skill does not perform broad company discovery or research — that already happened in `discover-companies` and `research-company`.

## Local Repository Check (do this before anything else)

1. Ask `sync-local-repo` to locate the company/opportunity record under `Companies/<slug>/`.
2. **If no record is found, or `status.json.status` hasn't reached `"Outreach Prepared"` yet:** stop. Report plainly: "No prepared outreach package found locally for [Company]/[Role]. Run `prepare-outreach` first and persist it via `sync-local-repo`, or provide the local record path if this company is tracked under a different slug." Do not draft from a bare company/role description alone and do not invent the missing package.
3. **If a record is found at `Outreach Prepared` or later:** read `outreach.md` (the prepared package) and the relevant contact section of `contacts.md` (name, title, email if present). This is the primary source — do not ask the user to re-paste `prepare-outreach`'s output.
4. Also check whether `outreach.md` already has a draft (`status.json.status` at `"Drafted"` or later) that's still current (no new prepare-outreach or contact change since it was written). If so, report the existing draft and recommend reusing/reviewing it instead of redrafting from scratch.

## Input

- Company name
- Role title
- Company URL
- Job URL
- Contact name
- Contact role
- Contact email, if available
- Contact LinkedIn, if available
- Prepared outreach package (loaded from the local record above)
- Company-specific outreach page URL (`https://talhaatif.tech/r/[slug]`)

Example:
```
Company: Atomic
Role: Backend Engineer
Contact: [Name]
Contact Role: [Role]
Contact Email: [Email]
Outreach Page: https://talhaatif.tech/r/atomic
```

The local record found above is the primary source for the prepared package and contact info. Only fall back to a conversation-pasted `prepare-outreach` output if the local record is missing or thinner than what's available directly in the conversation. Never re-run broad company research to fill a gap. If a critical fact is still missing after checking both, don't invent it — omit the claim, or state plainly what's missing and ask, rather than guessing.

## Source of Truth

- `career.md`, `Evidence/projects.md`, `Evidence/achievements.md`, `Evidence/metrics.md`, `Evidence/technical-decisions.md` — the only valid source for claims about this person's experience.
- The supplied `prepare-outreach` package — the valid source for which evidence/project/decision was already selected as strongest for this company; reuse its selection rather than re-choosing independently, unless it's missing something this email specifically needs.
- `Outreach/outreach-rules.md` — the existing tone and structure rules for cold outreach (communication style, message shape, what never goes in outreach, subject-line conventions). This skill is that file's rules applied specifically to the email-drafting step.
- `Brand/voice.md` — technical, clear, thoughtful, direct; no em dashes; no generic motivational language; no corporate buzzwords.
- Existing portfolio identity: name "Talha Atif" / "M. Talha Atif", portfolio `https://talhaatif.tech`, GitHub `https://github.com/M-Talha-Atif`, LinkedIn `https://www.linkedin.com/in/muhammad-talha-atif/`. Use these for the signature — never invent contact details.

## Hard Constraints (never violate)

- The email body is a maximum of 4-5 logical sentences, roughly 60-100 words. Subject, greeting, signature, and the portfolio URL itself don't count toward that.
- Never open with a generic self-introduction ("My name is Talha and I am a software engineer..."). The company/problem is the subject of the opening line, not the sender.
- Never list the full technology stack. One primary technical connection per email.
- Never invent metrics, technologies, company details, funding, team size, customers, contact responsibilities, or product capabilities. Every claim about this person traces to `career.md`/`Evidence/`; every claim about the company traces to existing research already in the workflow (the job posting, `research-company` output, or other verified context already available). If a claim is uncertain, omit it — don't hedge it into the email either.
- Never write "Here is my portfolio" — the page must be framed as built specifically for this company (see Line 4 below).
- Never default to asking for a 30-minute meeting. The CTA is low-friction and optional (see Line 5).
- Never use generic enthusiasm language: "passionate about," "excited to leverage," "I'd love to join your amazing team," "synergy," "rockstar," "ninja." Never open with "I hope this email finds you well." No em dashes anywhere in the email (per `Brand/voice.md` and `Outreach/outreach-rules.md`).
- Never send a technical-architecture-essay email to a recruiter, or a recruiter-style role-alignment email to an engineering leader — adapt the angle per Contact-Specific Personalization below, but the length constraint applies regardless of recipient.
- Never leave internal fact-labels (Confirmed / Evidence / Inference / Unknown) in the final email — those exist only in the Internal Personalization Notes.
- Never discover companies, perform broad company research, find contacts, or create/modify outreach-page content — this skill only drafts the email.
- Never send the email, mark it Sent, or update a Notion status to `Sent`. This skill's ceiling is `Drafted`.

## Fact-Labeling System (internal reasoning only — never appears in the email)

- **Confirmed** — directly stated by a primary source already in the workflow (job posting, company site, prior research output).
- **Evidence** — traced to a specific `career.md`/`Evidence/` fact — cite the file when reasoning through candidates, even though the final email won't cite it.
- **Inference** — a reasonable judgment call, stated as such internally, and never phrased as fact in the email.
- **Unknown** — not established. Don't use it as an email claim; omit instead.

## Required Email Structure

Five logical parts, written as plain natural prose — no "Line 1:" labels or section headers in the actual email, just short sentences/paragraphs in this order:

1. **Specific observation** — one specific, verified observation about the company's product, technical problem, role, stage, or a relevant engineering challenge. The company is the subject of the sentence, not the sender.
2. **Relevant connection** — connect that observation to one relevant area of this person's experience. One primary technical connection, not the whole stack.
3. **Concrete evidence** — one documented proof point from `career.md`/`Evidence/`/the portfolio's project data: a real technical decision, production result, migration, performance improvement, reliability improvement, or ownership example. Never invent a number.
4. **Personalized portfolio page** — introduce the page as built specifically for this company/role, not a generic link drop. E.g. "I put together a short page specifically for [Company] showing the relevant engineering overlap and selected evidence: [URL]."
5. **Optional low-friction CTA** — e.g. "If the overlap looks relevant, I'd be glad to talk," "If this is relevant to what you're building, happy to connect," "If the fit looks interesting, I'd be glad to go through whatever evaluation process works best for you." Never a hard ask for a specific meeting length.

Shape to match (wording must be generated fresh per company, never copied):
```
Hi [Name] — I noticed [specific observation about Company].

I've worked on a similar class of problem involving [relevant technical area], including [specific documented evidence].

I put together a short page specifically for [Company] showing the relevant engineering overlap, selected projects, and how I'd approach evaluating the fit: [portfolio URL]

If the overlap looks relevant, I'd be glad to talk.

Best,
Talha
```

## Contact-Specific Personalization

Adapt the angle in Lines 1-2 to the recipient, while keeping the same structure and length:

- **Founder** — product problem, company stage, ownership, speed of execution, ability to contribute across boundaries. Avoid corporate recruiting language.
- **Engineering Leader** — technical problem, architecture, reliability, performance, engineering judgment, production experience. Technical language is fine, but stay concise.
- **Hiring Manager** — role requirements, relevant evidence, execution ability, evaluation readiness.
- **Recruiter** — role alignment, relevant stack, eligibility, remote compatibility, a clear next step. Never send an architecture essay to a recruiter.

## Subject Line

Produce one recommended subject and two alternatives. Subjects must be specific, relevant, concise, non-clickbait, and tied to a real company problem, a specific technical overlap, a relevant product area, or a thoughtful observation.

Never use: "Job Application," "Backend Engineer Application," "Interested in joining your company," "Looking for opportunities," "Open to opportunities."

## Personalized Portfolio Link

Use the existing company-specific route exactly: `https://talhaatif.tech/r/[slug]` (or whatever canonical production domain the portfolio is already deployed to, if different from this default — never invent a new route format). The slug must match the company, and the URL must match what's stored in `outreach.md`'s `pageUrl`/`status.json.outreach.pageUrl` in the local record. Never substitute the generic portfolio homepage when a company-specific page already exists.

## Signature

Use the existing identity as-is: "Talha" or "Talha Atif" for the sign-off, and only the links actually relevant to this email — typically the main portfolio and, where it adds something the email doesn't already cover, GitHub or LinkedIn. Don't append every social link by default (X, LeetCode, phone number) — that belongs on the portfolio page, not the email. Never invent a contact detail that isn't already established (email address, phone number, handle).

## Workflow

### Step 1 — Load inputs
Per Local Repository Check above, load the prepared package and contact info from the local record. Confirm the contact's role/type to select the right personalization angle.

### Step 2 — Select the specific observation
Pick the single strongest, most specific, verifiable observation about the company/role/problem — reuse `prepare-outreach`'s central narrative or "what you're solving" points if available, rather than re-deriving independently.

### Step 3 — Select the one technical connection
Pick one primary connection between that observation and this person's experience — reuse the `relevantEvidence` selection from `prepare-outreach` if available.

### Step 4 — Select the one concrete evidence point
Pick one real, documented proof point (a decision, metric, migration, or ownership story) from `Evidence/` or the prepared package's `realDecision` — never a number that isn't already documented.

### Step 5 — Draft the email
Write Lines 1-5 as natural prose, angled per Contact-Specific Personalization, respecting the hard length constraint (4-5 sentences, ~60-100 words in the body, excluding subject/greeting/signature/URL). Read it back and cut anything that isn't doing one of the five jobs.

### Step 6 — Draft subject lines
One recommended + two alternatives, per Subject Line rules above.

### Step 7 — Assemble the signature
Name + only the relevant existing links, per Signature above.

### Step 8 — Write internal personalization notes
Outside the email: which company-specific observation was used, which contact angle was used, which career/evidence source backs the proof point, why this portfolio page is the relevant link, and any uncertainty that should be reviewed before sending.

### Step 9 — Persist to the local repository (never beyond Drafted)
Invoke `sync-local-repo`:
- `outreach.md`: recommended subject, alternative subjects, final email draft, contact targeted, draft date.
- `status.json`: set `outreach.draftStatus` to `"Drafted"`. Advance `status` to `"Drafted"` — only if the current status isn't already past that point (never regress, never write `Approved` or `Sent`).
- Do not touch `company.md`, `opportunities.md`, `contacts.md`, or the prepared-package fields of `outreach.md` (`prepare-outreach`'s job) — this step only owns the draft fields.
- Notion sync, if used, remains `sync-outreach-notion`'s separate responsibility via `sync-local-repo`'s own Notion relay — this skill does not talk to Notion directly and does not depend on it being configured.

### Step 10 — Produce the output
Use the Output Format below.

## Output Format

```
## Draft Outreach: [Company] — [Role]

### Recommended Subject
[strongest subject line]

### Alternative Subjects
1. [alternative]
2. [alternative]

### Final Email
[Complete email, ready for human review — greeting, 4-5 sentence body, portfolio link, optional CTA, signature]

### Internal Personalization Notes
- Company-specific observation used: [...]
- Contact-specific angle used: [Founder / Engineering Leader / Hiring Manager / Recruiter — why]
- Career/Evidence source used: [file/section cited]
- Why this portfolio page is relevant here: [...]
- Uncertainty or claims to double-check before sending: [...] (or "None identified")

### Local Repository Sync
- Record: [Updated / Reused without changes] — `Companies/[slug]/outreach.md`
- Status: [unchanged at X / advanced to "Drafted"]
```

## Human Review Requirement

This skill produces a draft only. It never sends the email, never marks the opportunity `Sent`, and never writes a `Sent` status to Notion — sending is a separate, explicitly human-driven step that happens after this draft is reviewed and approved.

```
Outreach Prepared → Drafted → Human reviews → Ready to Send → Email is actually sent → Sent
```

## Local Repository Integration

This skill owns the draft fields of `outreach.md` (recommended subject, alternative subjects, final email, targeted contact, draft date) and `status.json.outreach.draftStatus`, plus the `"Drafted"` status transition — always via `sync-local-repo`. It never touches `company.md`, `opportunities.md`, `contacts.md`, or the prepared-package/send fields of `outreach.md`.

## Workflow Boundary

This skill must NOT:

- Discover companies.
- Perform broad company research.
- Find contacts.
- Modify `career.md`, `Evidence/`, or `Brand/`.
- Modify the portfolio frontend or create outreach pages.
- Send emails.
- Mark emails, or the local/Notion record, as `Sent` or `Approved`.
- Write any `Companies/` file directly — only through `sync-local-repo`.

It only creates a highly personalized, concise email draft for human review.
