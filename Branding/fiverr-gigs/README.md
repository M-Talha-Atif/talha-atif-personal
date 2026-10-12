# Fiverr gig images

- `fullstack-web-saas-gig.png`: 1280x769 gig header, "Full Stack Web SaaS" (same layout as the mobile app gig).
- `build-gig.js`: generator. Edit the text, chips, bullets, stats and screenshot filenames near the top of `main()`, then run it
  from the portfolio repo (it needs that project's `node_modules` for `sharp`, `react` and `next/og`):

      node build-gig.js <path-to-portfolio-repo> <output.png>

Screens used: Intimec dashboard / roles / access portal (public/intimecProject) and Cunocovo sign-up (public/cunocovoProject).
The test email visible in the Cunocovo screenshot is replaced with a placeholder.

## Cunocovo proof gig

- `cunocovo-proof-gig.png`: with the live link (uppercase.cc) and a "Visit the Live App" button.
- `cunocovo-proof-gig-no-link.png`: same image with no URL (Order Now button), for places that do not allow external links.
- `build-proof.js`: generator.  `node build-proof.js <portfolio-repo> <out.png> [link|nolink] ["5,000+"]`
  The last argument is the active-users number printed on the card.

Facts used: live site, stack, 3s to 700ms feed, zero-downtime migration, WebSockets, admin moderation come from
src/lib/projects/cunocovo.ts. The active-users number is supplied by the owner (the portfolio page currently says 2,000+ registered).

## Intimec Identity Governance gig header

- `intimec-identity-governance-gig.png` (1280x769), generator `build-iga.js`
- Run: `node build-iga.js <portfolio-repo-root> <out.png>`
- Same template as the Full Stack Web SaaS header: stack chips, 3-line headline, "Built for" chips, two columns of green ticks, 3 proof cards, Order Now.
- Screens are real Intimec IGA captures (command center, roles catalogue, workflow designer, permission matrix) inside browser frames with a neutral URL.
- Numbers come from `src/lib/projects/intimec.ts`: 8+ microservices, 5K+ users, 50% inter-service latency cut via gRPC.

## Full Stack Web Development promo video (65s)

- `fullstack-web-dev-promo-65s.mp4`: 1920x1080, 30fps, H.264 + AAC, burned-in captions, voiceover + soft music pad.
- Source in `video-src/`: `script.json` (narration), `synth.ps1` (Windows voice synth), `render.js` (frame renderer, Satori + sharp).
- Voice is the built-in Windows "Zira" voice. To use a natural voice, record or generate `s1..s6` narration lines from `script.json` and remix with the same offsets.

## Promo video with the owner's own voice (71s)

- `fullstack-web-dev-promo-71s-my-voice.mp4`: 1920x1080, 30fps, 71.2s total.
- Source recording: `D:\Upwork\11 Oct, 17.06_.m4a` (80s single take). Processing in `video-src/`: `transcribe.py` (noise reduction with noisereduce + faster-whisper base.en word timestamps), `process_audio.py` (cut into 6 scenes, trim pauses, 1.15x pitch-preserved speed, loudness normalise), `words.py`, `render.js` (animations anchored to spoken words via the CUES table).

## Promo video v2, no links (71s)

- `fullstack-web-dev-promo-71s-my-voice-no-links.mp4`: same voice and timing, with the uppercase.cc and talhaatif.tech links removed.
- Added "Live in production" tag (Cunocovo scene) and a closing differentiator row: Fast delivery, Reliable code, Bug-fix support.
