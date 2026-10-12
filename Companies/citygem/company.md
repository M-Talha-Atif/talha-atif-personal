# CityGem

- **URL:** https://citygem.app
- **Product (Confirmed, company site):** Mobile walking app for iOS and Android that gamifies urban exploration. Thousands of predefined routes with audio descriptions, GPS-guided navigation, nearby point-of-interest alerts, group walking events, step tracking and achievement badges.
- **Footprint (Confirmed, company site):** 100+ French cities, expanding to Spain, Italy, Portugal, Germany, UK, US, Canada, Japan, Argentina and others.
- **Business model:** Free to download. Monetization not disclosed on the site; premium group walking experiences are mentioned.
- **Founded:** 2020, Ile de France (CB Insights).
- **Positioning:** Eco-conscious local tourism plus daily walking.
- **Competitors (CB Insights, search):** Questo, GPSmyCity, Go Jauntly, CityCheck, Tiny Melon, PocketSights.

## Pain point (Inference)
Producing and refreshing route and audio content in every new city without a large local content team, while keeping the mobile experience fast. Monetization of the free app is unclear from the public site.

## Best-fit evidence (career.md, Evidence/)
- Moodly: React Native app plus NestJS backend plus FastAPI AI service, RabbitMQ async pipeline, AI wait cut from 4-8s to under 1s (Evidence/projects.md, metrics.md). Overlap type: Transferable experience.
- Chunked async processing decision (technical-decisions.md, Decision 4) for batch content generation with progress and resume.
- Honest gap: no GPS or maps product, no tourism domain.
