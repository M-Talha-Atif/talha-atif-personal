# Pogo

- **URL:** https://www.joinpogo.com/ (joinpogo.ai redirects here)
- **Consumer app (company site):** earn on everyday spending from card transactions, receipts, e-receipts, location and app data. 3M+ opted-in US users and 470B+ dollars of annual transaction value reported by Pogo. SOC 2 Type II badge. Card linking via Plaid (secondary sources).
- **Enterprise AI product (secondary source, June 2026):** AI research platform connecting brands with purchase-verified buyers through AI-moderated interviews and surveys.
- **Founders (secondary source):** Dom Wong, Oskar Melking, Shikhar Mohan. Investors reported include Buckley Ventures, 20VC, Village Global, Mantis and the founders of Honey.
- **Role:** Full Stack Engineer on the enterprise AI SaaS product. Builds AI agents, backend services, APIs and web UIs, plus internal tools for GTM, finance and support. Values calculated speed, ownership, heavy use of AI coding tools.

## Hardest challenge (inference)
The chain from a purchase signal to a finished, verified, AI-moderated interview at the scale of millions of users, with no double invites, no silent drops and trustworthy results.

## Evidence mapping (career.md, Evidence/)
- Rule engine with grouped conditions (Intimec), eligibility and targeting
- Duplicate notification race fix (Digital Upgraders), never-twice invites
- Kafka and RabbitMQ pipelines with dead-letter queues, no silent loss
- Memingo Gemini tutor with session context and structured output, interview agent
- Async bulk engine with per-item failure reasons, ops console
- Honest gaps: Plaid and card data, consumer scale