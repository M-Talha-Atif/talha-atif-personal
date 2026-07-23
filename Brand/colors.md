# Colors

## Core Palette

| Token | Hex | Role |
|---|---|---|
| Primary | `#CFFFDC` | Accent, highlighted borders, second title line, category tag icon color, badge dot, highlighted node border/text |
| Background | `#0B0B0D` | Base canvas background |
| Body text | `#CFCFCF` | Description copy, sub-text, secondary paragraphs |

These three are the ones to reach for first. Everything below exists to
support them — structure, hierarchy, and states — and should stay muted so
the primary green keeps its impact.

## Supporting Palette

| Token | Hex | Role |
|---|---|---|
| Heading white | `#F2F2F2` | Titles, names, node labels — primary readable white (not pure #FFFFFF) |
| Muted label | `#6B6B70` | Small caps labels, top-right tag text when not white, secondary meta |
| Faint label | `#4E4E52` / `#8A8A8E` | Lowest-emphasis text — handles, footnotes, sub-descriptions |
| Frame border | `#232326` | Outer 1px hairline frame |
| Card background | `#17171A` | Node/box background |
| Card border (default) | `#2A2A2E` | Node/box border when not highlighted |
| Card border (highlight) | `#CFFFDC` | Node/box border for the emphasized step (primary) |
| Connector line | `#3A3A3E` | Arrows and connecting lines between blocks |

## Situational / Illustrative Colors

Used only in illustrative or "funny" images — never in the core template
chrome (header, name, tag, badge).

| Token | Hex | Role |
|---|---|---|
| Warning red (dashed box) | `#5A2A2A` border / `#C77` text | Expired/failed state, e.g. an expired cache box |
| Warning glow | `rgba(255,80,80,0.12)` | Soft box-shadow around an "under load" element |

## Usage Rules

- Background is always `#0B0B0D` — never pure black, never a gradient.
- Primary `#CFFFDC` is reserved for: the second line of a title, the one
  highlighted node/border in a diagram, category badge dots/accents, and the
  brand name's last word in the stylized mark. Don't use it for large filled
  areas — it's an accent, not a fill.
- Body copy is always `#CFCFCF`, never pure white — pure white (`#F2F2F2`) is
  reserved for headings, names, and labels that need to read as "primary
  content" rather than supporting text.
- Don't introduce new hues into the core template. If an illustration needs a
  extra color (like the red "expired" state above), keep it desaturated and
  low-opacity so it doesn't compete with the green.
