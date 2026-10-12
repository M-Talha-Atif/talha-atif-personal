# AI instructions: build an interview-prep page for ANY topic

You are creating a study page that a candidate reads in the browser before an interview.
Reference implementation: `../backend-engineering/tools/docker/index.html`. Copy its depth, tone and structure.
Skeleton to start from: `./index.html` (this folder).

## Inputs you need (ask only if missing)
- **Topic** (e.g. Kubernetes, Redis, Spring Boot, System Design, React, PostgreSQL, AWS)
- **Target role/level** (default: backend/full-stack, 1-3 years)
- **Candidate's stack**, so labs use it (default: Node/Express, Spring Boot, Next.js)

## Steps
1. Pick the category folder (see "Folder map" below), then `cp -r interview-prep/_template interview-prep/<category>/<topic>` and delete `AI-INSTRUCTIONS.md` from the copy.
   Folder name = lowercase slug (`redis`, `tcp-ip`, `spring-boot`).
   **Fix the relative paths for the new depth**: in `index.html` the `../assets/` prefix must have one `../` per folder level below `interview-prep/` (e.g. `backend-engineering/tools/redis/` → `../../../assets/`, `frameworks/react/` → `../../assets/`), and the sidebar "All topics" link must point to the root `index.html` the same way.
2. Open `<topic>/index.html`. Replace every `TODO`. Search for `TODO` until none remain. Remove the banner comment.
3. Keep the section ids and order: `plan, s1, s2, s3, s4, s5, labs, cheat`. The sidebar builds itself from `<h2 id>`.
   You may add sections (new `<h2 id="...">`) or drop one that truly doesn't apply (e.g. no labs for pure theory topics, so use "worked examples" instead).
4. Register the page on the landing page: add one entry to the `TOPICS` array in `interview-prep/index.html` (`slug` is the path from `interview-prep/`, e.g. `backend-engineering/tools/redis`).
5. **Verify** (see checklist below). If a runnable lab exists, actually run it and fix what breaks. Untested labs must be labeled untested.

## Folder map
```
interview-prep/
├── frameworks/            (React, Next.js, Spring Boot, Express…)
├── language/              (JavaScript, TypeScript, Java…)
├── network/               (HTTP, TCP/IP, DNS, TLS…)
├── operating-system/      (processes, memory, Linux…)
├── system-design/
├── companies/             (project-defense docs: one folder per project, e.g. intimec/ with .md + index.html)
└── backend-engineering/
    ├── microservices/
    ├── monolithic/
    ├── chaos-engineering/
    ├── resilience-systems/
    └── tools/             (docker, kubernetes, redis, nginx…)
```

## Writing rules (this is what makes it good, not boring)
- **Plain language first, jargon second.** Every concept: one analogy or one-sentence definition, then detail.
- **Short.** Paragraphs ≤ 3 sentences. Prefer tables, lists, diagrams, code over prose.
- **Spoken answers.** Q&A answers and the pitch must be sayable out loud in under 30 seconds, first person where natural.
- **Practical.** Every concept ties to a command, config or code the candidate can run.
- **Interview framing.** Mark traps with `callout warn`, anti-patterns with `callout bad`, polished sentences with `callout say`.
- **No filler, no hype, no emojis except in the logo and sparingly in headings.**
- Be accurate. If unsure of a fact or version, say so or leave it out. Never invent commands, flags or API names.

## Required content (minimums)
| Section | Minimum |
|---|---|
| Pitch | 1 callout.say |
| `plan` | 3-4 day plan cards + 6-8 item readiness checklist |
| `s1` Core concepts | 5-8 concepts, **at least 3 diagrams**, 1-2 comparison tables, "mixed-up pairs" table |
| `s2` Best practices | 8-12 production practices, a security/quality checklist |
| `s3` Real-world scenarios | how it behaves in the situations interviewers probe (scale, architecture, tradeoffs) + 1-2 diagrams |
| `s4` Bugs | **25-33 `window.BUGS`** entries across 4-6 categories: symptom → why → fix, + a debugging-flow diagram |
| `s5` Q&A | **25+ `window.QA`** entries in 4-6 categories incl. "Scenarios" + an "experience" answer template |
| `labs` | 3-4 labs with complete runnable code, run commands, 4-8 experiments incl. "break it on purpose" |
| `cheat` | 8 cards |

## Component reference (all styles come from `../assets/style.css`)
```html
<!-- callouts: default | say | tip | warn | bad -->
<div class="callout warn"><b class="t">Gotcha</b><p>…</p></div>

<!-- code: raw text, no escaping. data-lang = highlight.js language id -->
<script type="text/plain" class="code" data-lang="yaml" data-title="compose.yaml">…</script>

<!-- table -->
<div class="tablewrap"><table><tr><th>A</th><th>B</th></tr><tr><td>…</td><td>…</td></tr></table></div>

<!-- cards -->
<div class="grid"><div class="card"><span class="pill">Day 1</span><h4>Title</h4><p>Text</p></div></div>

<!-- numbered step cards / saved checklist -->
<ol class="steps"><li>…</li></ol>
<ul class="checklist"><li>…</li></ul>
```
Inline `<code>` for identifiers. Escape `<`, `>`, `&` in normal HTML text (`&lt;`), but NOT inside `script.code`.
`window.BUGS` / `window.QA` strings: plain text with `` `code` `` and `**bold**` only; double-quote JS strings; escape inner double quotes as `\"`.

## Diagram kit (inline SVG, theme-aware, no images)
Always: `<figure class="diagram"><svg class="d" viewBox="0 0 760 H">…</svg><figcaption>takeaway</figcaption></figure>`
Width is always **760**; pick height H to fit. The arrow `<marker id="arr">` already exists once per page.

| Element | Markup |
|---|---|
| Box colors | `<rect class="n|p|g|o|r|v" x y width height rx="8"/>`: n neutral, **p** blue (main), **g** green (good/healthy/runtime), **o** orange (data/warn), **r** red (bad/ephemeral), **v** purple (infra/tool) |
| Dashed group | add class `dash`: `<rect class="v dash" …/>` to draw a network/boundary behind boxes (draw it first) |
| Title text | `<text class="h" x y>` (bold) · small gray: `class="m"` · normal: no class |
| Arrow | `<path class="ln" d="M170 68 H298"/>` one-way · `ln2` two-way · `lnp` blue emphasis · `lnx` red dashed "blocked" |
| Curve | `d="M75 80 C75 160 300 175 598 165"` |

Rules: ≥ 20 px gap between boxes; text must fit the box (≈ 7 px per character at 13 px); leave labels off arrows crossing boxes;
one idea per diagram; always a caption. Good diagram types: before/after, request flow, layered stack, lifecycle/state, timeline, decision tree, architecture with boundaries.

## Labs: rules
- Put real files in `<topic>/labs/` next to the page **and** show the same code in the page.
- Prefer tiny, dependency-light examples so they run in minutes.
- Each lab: goal → code → exact run commands → experiments that *prove understanding* → at least one "break it on purpose".
- Actually run them. Fix what fails. Add the discovered pitfall to `window.BUGS` (real stories are the best content).

## Final verification checklist
- [ ] No `TODO` left; page `<title>` and sidebar logo set
- [ ] Opens from `file://` with no console errors (sidebar TOC populated, bugs/Q&A render, code highlighted, copy buttons work)
- [ ] Dark and light themes both readable (diagrams use only the classes above)
- [ ] ≥ 8 diagrams across the page, none overflowing at 360 px width
- [ ] Bugs ≥ 25, Q&A ≥ 25, labs ≥ 3, each with runnable code
- [ ] Every command/flag/version was checked; labs executed or labeled "untested"
- [ ] Topic registered in `interview-prep/index.html`
