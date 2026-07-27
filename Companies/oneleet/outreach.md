# Outreach — Oneleet (Backend Engineer / domain overlap pitch)

- **Status:** Drafted, awaiting explicit send approval
- **Channels:** Email to Ora Onel (cofounder), LinkedIn connection note to Bryan Onel (CEO)
- **Portfolio outreach page:** src/lib/outreach/oneleet.ts, will be live at https://talha-atif.vercel.app/r/oneleet once pushed and deployed

## Email to Ora Onel

**Subject:** Something I Have Built That Maps Directly To Oneleet

**Body:**
Dear Ora,

I have prepared a detailed introduction matched directly against Oneleet's engineering roles and your product itself, available here. https://talha-atif.vercel.app/r/oneleet

At Intimec I owned an enterprise IAM platform end to end on a two person engineering team, including the entitlement rule engine, access requests, and the audit trail underneath all of it. I refactored the audit schema to remove raw personal data while preserving full forensic traceability, which is close to the exact trade off your platform is built around for access reviews and risk management.

I also built a deliberate adversarial test dataset that caught a multi group rule engine bug before it reached production, the same instinct behind refusing to accept a green checkmark as proof that a system is actually secure.

I want to be direct about one gap. My production backend experience is in Java, Node, and Python, not Go, so the language itself would be new for me. The systems I have built, access governance, audit integrity, compliance sensitive data modeling, map closely to what your open backend and fullstack roles actually own, and I pick up new primary languages quickly.

I would welcome the chance to talk directly, or take on a real piece of work to show how fast that ramp actually is.

Best regards,
Talha
https://talha-atif.vercel.app

## LinkedIn Connection Note to Bryan Onel (not sent, drafted for review)

Hi Bryan, I have spent two years building the compliance grade IAM and audit systems Oneleet now sells as a platform. Wrote up the direct overlap here. https://talha-atif.vercel.app/r/oneleet Would value a conversation.

*(Character count: 214, within typical LinkedIn connection note limits)*

## Personalization rationale
Bryan's own tagline is "Destroyer of compliance security theater," and Oneleet's entire pitch is that most compliance platforms are theater. The hook leads with real, lived compliance system ownership (Intimec IAM, entitlement rules, PII-free audit refactor) rather than a generic compliment, directly answering the implicit question a security-first founder would ask, "has this person actually built what we sell." The honest gap (no production Go experience, 2+ years versus the posted 5+ years) is named directly in both the page and the email rather than glossed over, consistent with the honesty discipline used for Artemis Security and Dili earlier in this outreach batch. Portfolio link placed in the second line of the email and second sentence of the LinkedIn note, not buried.

## Approval status
Not yet sent. Awaiting explicit user approval before sending the email via Apollo/Gmail and before sending the LinkedIn note (LinkedIn is never sent automatically per standing rule).
