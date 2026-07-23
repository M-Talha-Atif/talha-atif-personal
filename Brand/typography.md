# Typography

## Typeface

**Inter** — used everywhere, no exceptions. Replaces any earlier
monospace/terminal font choice.

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(data:font/woff2;base64,...) format('woff2');
}
/* repeat per weight: 300, 400, 500, 600, 700, 800 */
```

Fonts are embedded as base64 `@font-face` blocks directly in the HTML source
used to render each asset, so nothing depends on an external font request at
render time.

## Weights In Use

| Weight | Used for |
|---|---|
| 300 | Body/description copy, sub-labels, footnotes — anything meant to sit quietly |
| 700 | Names, node labels, badge text, author name |
| 800 | Title lines (the big headline text on a header image) |

Avoid weights outside this set (no 100/200/900) — they don't appear in the
embedded subset and will fall back unpredictably.

## Scale (header/1200×630 canvas)

| Element | Size | Weight | Notes |
|---|---|---|---|
| Title (both lines) | 47px | 800 | letter-spacing -1px, line-height ~1.18 |
| Stylized name mark | 20px | 700 | letter-spacing 0.5px |
| Category tag (top bar) | 11px | 700 | uppercase, letter-spacing 1.5px |
| Pill badge | 11px | 700 | uppercase, letter-spacing 1.5px |
| Description line | 14.5px | 300 | line-height 1.7, max-width ~640px so it wraps to 2 lines |
| Author name (footer) | 14px | 700 | |
| Author role (footer) | 11.5px | 400–300 | |
| Footer right meta | 11px | 400 | uppercase-ish tracking for the "DEVWEEKENDS · ..." line |
| Avatar initials | 15px | 800 | centered in circle |

## Scale (diagram/illustration canvas, wider format)

| Element | Size | Weight | Notes |
|---|---|---|---|
| Node label | 15–17px | 700 | centered or left-aligned depending on layout |
| Node sub-description | 10.5–13px | 300 | muted color, tight line-height |
| Caption (top of illustration) | 15px | 700 | uppercase, primary color |
| Sub-caption | 12.5px | 300 | muted gray |

## General Rules

- Titles are always two lines: line 1 in heading white, line 2 in primary
  green. Keep each line under ~40 characters so it doesn't wrap at 47px.
- Never use em dashes in on-image text — rewrite the sentence instead.
- Uppercase + letter-spacing is reserved for labels/tags/badges, never for
  full sentences or titles.
- Letter-spacing on the title is slightly negative (-1px); every other
  uppercase label uses positive tracking (1–2px). Don't mix these up.
