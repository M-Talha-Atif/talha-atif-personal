# Outreach — Dawnguard (Medior Software Engineer, Full Stack)

- **Status:** Sent
- **Channel:** Email to Kim Van Lavieren (Co-Founder & CTO), kim@dawnguard.ai
- **Portfolio outreach page:** src/lib/outreach/dawnguard.ts, live at https://talha-atif.vercel.app/r/dawnguard
- **Tailored documents:** Resumes/Dawnguard Resume/dawnguard-engineer.tex and dawnguard-cover-letter.tex, both link to the outreach page. No compiled PDF exists yet, Docker Desktop was not running locally when compilation was attempted and starting it was judged not worth the disruption for this request; user was told directly rather than silently skipping it.

## Email sent (cover letter content used as the email body, standard practice)

**Subject:** Application, Medior Software Engineer, Full Stack, Muhammad Talha Atif

Dear Kim,

I am writing to apply for the Medior Software Engineer, Full Stack role. I have also prepared a page matched directly against this posting, available here. https://talha-atif.vercel.app/r/dawnguard

What drew me in specifically is the idea of shift left security done properly, validating design and generating production ready infrastructure as code before a single line of application code exists, rather than bolting security on after the fact. That is a genuinely different way to think about the problem, and it is close to how I already think about the systems I build.

My most recent role was on a compliance heavy Identity Governance and Access Management platform, where I owned the Access Portal end to end, the service layer handling request lifecycle state, the Next.js and TypeScript operational UI, and the audit trail underneath all of it. Security and auditability were not an afterthought there either, every access decision had to be explainable after the fact. I built a Kafka based event driven approval pipeline with dead letter queues for reliable failure recovery, and refactored the entire audit log schema to remove personal data while preserving forensic traceability, the kind of compliance versus usability trade off I imagine comes up constantly at Dawnguard.

On the stack side, I work in TypeScript daily across NestJS and Express services and Next.js frontends, with real experience in event driven design (Kafka, RabbitMQ), NoSQL data (MongoDB, Redis), and Docker based CI/CD pipelines. Claude and GitHub Copilot are part of my everyday workflow already, not an occasional tool, which lines up directly with how your team wants to use AI agents to write secure, stable, and maintainable TypeScript.

I have not worked with Angular or Pulumi specifically, and I want to say that plainly rather than imply otherwise. My frontend production experience is in React and Next.js, and my infrastructure as code exposure has been lighter touch than owning a Pulumi codebase directly. What I can say honestly is that I pick up new frameworks quickly when the underlying systems problem, in this case secure, typed, event driven full stack development, is one I already understand and care about.

I would welcome the chance to talk through where my background fits and where it would need to grow. Thank you for considering my application.

Best regards,
Muhammad Talha Atif
https://talha-atif.vercel.app

## Approval status
**Sent.** Sent via Apollo emailer (talhaatif573@gmail.com to kim@dawnguard.ai) 2026-07-30 13:07 UTC, status `completed`.
