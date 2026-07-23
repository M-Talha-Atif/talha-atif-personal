# Brand Guide — Muhammad Talha Atif / DevWeekends

This file is the entry point. It links the other brand files and defines the
rules that don't fit neatly into colors, type, or voice — the ones about how
everything gets assembled.

Related files:
- `colors.md` — palette and where each color is used
- `typography.md` — font, weights, sizes
- `voice.md` — how the writing sounds

---

## Identity

- **Name:** Muhammad Talha Atif
- **Stylized mark:** `Muhammad Talha Atif();`
- **Handle:** @iam-talhaatif
- **Publication:** DevWeekends
- **Category tag:** Backend Engineering

## Naming Rules

- Never use the word "Series."
- Never use episode numbers.
- No role descriptor beyond **Full Stack Engineer** — no extra taglines like
  "ships, debugs, traces, asks why" on final assets.
- No em dashes anywhere in copy or captions.

## Asset Types

### 1. Article Header (1200×630)
The main cover image for an article. Full branding applies:
- Top left: category tag, e.g. `⚙️ BACKEND ENGINEERING` — white text, small gear emoji, no series/number.
- Top right: `Muhammad Talha Atif();` stylized mark.
- Body: small pill badge (category, no number) + two-line title (line 1 white,
  line 2 primary green) + one short description line.
- Bottom left: avatar circle (initials "MT") + name + "Full Stack Engineer."
- Bottom right: `DEVWEEKENDS · BACKEND ENGINEERING` + handle.
- Faint rotated "Dev Weekends" watermark centered in the background.
- Outer 1px hairline border, inset 24px from the edge.

### 2. Inside-Article Diagram
Used inline in the body of an article to explain a concept (flow, architecture,
comparison). No branding at all — no name, no handle, no category tag, no
avatar, no watermark. Just:
- Same background, same border frame.
- Blocks/nodes with **primary-color borders** (this is the one branded
  element that carries over).
- Arrows or connecting lines between blocks, muted gray, not primary.
- Labels in Inter, white for the node name, muted gray/light for a
  sub-description if needed.

### 3. Funny / Illustrative Image
Same dark base and border frame as the diagram type, still no name/handle
branding, but looser: emoji allowed, more whitespace, a caption line at the
top in primary color, a lighter sub-caption underneath in muted gray. Built
for comedic or metaphorical explanations (e.g. "thundering herd" as a
stampede), not literal architecture.

## Layout Constants

- Canvas: 1200×630 for headers, wider (e.g. 1400×500–1400×700) for horizontal
  diagrams or illustrations that need more room.
- Outer frame: 1px solid `#232326`, inset 24px on all sides.
- Side margins for content: 56px left/right.
- Card/node background: `#17171A`, border `#2A2A2E` (non-highlighted),
  `#CFFFDC` (highlighted/primary).
- Corner radius: 10–14px for boxes, 20px for pill badges, 50% for avatars.

## Build Process

Assets are built as HTML/CSS and rendered to PNG via Playwright at the target
canvas size. Fonts are embedded as base64 so rendering doesn't depend on
network access. This keeps every asset reproducible from source.

## Do Not

- Don't add a title/series episode number to any asset.
- Don't call anything a "series."
- Don't put full branding (name, handle, avatar) on inside-article diagrams.
- Don't use em dashes in on-image copy.
- Don't add taglines beyond "Full Stack Engineer" for the role line.
