# Design — Axel Quack presence system

Styleguide extracted from [www.axelquack.de](https://www.axelquack.de). Use this (and the tokens) on other personal or editorial projects that should feel like the same hand.

| File | Role |
|------|------|
| [`src/tokens.css`](../src/tokens.css) | Source of truth (CSS custom properties). This site imports it. |
| [`docs/tokens.json`](tokens.json) | Same values, DTCG-ish JSON for other stacks. |
| This document | Principles, type, components, WebGL rules, do / don’t. |

Copy is first-person and restrained. Visual system: **white editorial chapters** + **graphite WebGL point fields** on transparent stages.

## Principles

1. **Paper, then field.** Solid `.screen` chapters sit above the canvas so type stays crisp. WebGL only shows through empty `.stage` sections.
2. **Three voices, never four.** Display serif for thought. UI sans for chrome. Mono for metadata. Do not add a second serif or a display sans.
3. **Near-black, not brand colour.** Ink is `#0a0a0a`, paper `#f7f7f7`. No accent hue. Emphasis is size, weight, and hairlines.
4. **Hairlines instead of boxes.** 1px `var(--line)` rules, underline-on-hover links, list rows — not cards, fills, or shadows.
5. **Clamp, don’t breakpoint-hop type.** Sizes are `clamp(min, vw, max)`. The only layout breakpoint is **720px** (stack chrome).
6. **Motion is easing, not bounce.** `cubic-bezier(0.22, 1, 0.36, 1)`. Short (0.25–0.5s). Honour `prefers-reduced-motion`.
7. **Quiet chrome.** Buttons are text. Links are muted until hover. No pills, no gradients, no drop shadows.

## Layers

```text
z-2  .screen   solid paper chapters (intro, skills)
z-1  #bg       fixed WebGL canvas (pointer on stages only)
z-0  .stage    transparent full-viewport scenes (hero, helicoid, contact)
```

Pointer events: canvas is `none` until `.is-visible`; stage children re-enable clicks for labels/links.

## Colour

Light (default body):

| Token | Value | Use |
|-------|--------|-----|
| `--bg` | `#f7f7f7` | Page / chapter fill |
| `--bg-chrome` | `#fafafa` | `theme-color` only (browser chrome) |
| `--ink` | `#0a0a0a` | Text, hero points |
| `--muted` | `#8a8a8a` | Secondary text, text-buttons, kickers |
| `--line` | `rgba(10,10,10,0.12)` | Hairlines |
| `--wash` | `rgba(12,12,12,0.02)` | List-row hover |
| `--selection` | `rgba(10,10,10,0.12)` | Text selection |

Dark (contact stage + `body.scene-dark`):

| Token | Value | Use |
|-------|--------|-----|
| `--bg-inverse` | `#000` | Contact stage, body when knot is active |
| `--ink-inverse` | `#f2f2f2` | Contact stage text root |
| `--ink-inverse-hover` | `#fff` | Light link hover |
| `--copy-inverse` | `rgba(255,255,255,0.7)` | Contact paragraph |
| `--muted-inverse` | `rgba(255,255,255,0.5)` | Light links |
| `--faint-inverse` | `rgba(255,255,255,0.35)` | Footer meta |
| `--selection-inverse` | `rgba(255,255,255,0.22)` | Selection on black |

Point fields (Three.js `uColor`):

| Token | Value | Scene |
|-------|--------|--------|
| `--field-name` | `#0a0a0a` | Hero “AQ” lattice |
| `--field-mono` | `#121212` | Helicoid |
| `--field-talk` | `#f0f0f0` | Torus knot on black |

Do not introduce a brand red/blue. If a project needs status colour, keep it out of this palette and namespace it locally.

## Type

Load (Google Fonts, as on the site):

```
Instrument Serif 400 (roman + italic)
Inter opsz 14..32, wght 400 + 500
IBM Plex Mono 400 + 500
```

| Role | Family | Size | Line | Tracking | Example |
|------|--------|------|------|----------|---------|
| Display XL | `--font-display` | `--text-display-xl` | 1.02 | -0.03em | “Skills” |
| Display | `--font-display` | `--text-display` | 1.16 | -0.02em | Intro paragraphs |
| Display MD | `--font-display` | `--text-display-md` | 1.2 | -0.02em | Skills lede |
| Body / list | `--font-ui` | `--text-body` | 1.55 | 0 | Skill rows |
| UI | `--font-ui` 500 | `--text-ui` / `--text-label` | — | -0.01em | Name, contact label, text-btn |
| Mono | `--font-mono` | `--text-mono` … `--text-kicker` | — | 0.16em on kickers | Role, clock, locations, interlude quote |

Display measure: **18em** (MD **20em**). List / contact bar: **42rem**. On viewports ≤720px, drop max-width on display so lines fill `--pad-x`.

Antialiased UI (`-webkit-font-smoothing: antialiased`). Clock uses `tabular-nums`.

## Space

Horizontal page pad is `--pad-x` (`clamp(1.5rem, 5vw, 4rem)`). Chapters use large vertical pad `--pad-chapter-y`. Stages use `--pad-y`. Prefer these clamps over a 4/8px grid — this system is editorial, not app chrome.

Hairline = **1px**. List row padding **1.25rem 0**. Hover nudge **0.65rem** left.

Full viewport stages: `min-height: 100svh` (with `100vh` fallback).

## Motion

| Token | Value |
|-------|--------|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--duration-fast` | `0.25s` (colour) |
| `--duration` | `0.3s` (list pad, arrow) |
| `--duration-slow` | `0.45s` (interlude fade) |
| `--duration-scene` | `0.5s` (body background) |

Canvas opacity `0.4s`. Link underline: `scaleX(0 → 1)` from the left, `0.35s`. Text-btn arrow: `translateX(3px)`.

**Reduced motion:** `scroll-behavior: auto`; hide `#bg`; hero shows a static CSS “AQ” watermark; contact stage stays solid black above the (hidden) canvas.

## Components

Reuse these patterns; do not invent cards.

**Text button** (`.text-btn`) — no border, muted, ink on hover, optional `→` that nudges.

**Link** (`.link`) — muted, no underline at rest; 1px currentColor underline scales in on hover/focus. Inverse: `.link.light` (mono, 0.9rem).

**Contact bar** — hairline top + bottom, label left, links right, max 42rem.

**Hairline list** (`.skill-list`) — no bullets; 1px rules; hover wash + pad-left.

**Kicker** (`.interlude-hint`) — mono, 0.7rem, uppercase, 0.16em tracking, muted, fades in when the stage is active.

**Clock** — mono 0.75rem, tabular, leading `●`.

**Focus:** no outline box. Hover and `:focus-visible` share the same ink/underline treatment.

## WebGL (this site only)

Other projects can skip 3D and still use colour/type/space. If they keep the field language:

| `data-scene` | Geometry | Point colour |
|--------------|----------|--------------|
| `name` | Sampled “AQ” glyph lattice | `--field-name` |
| `mono` | Hyperbolic helicoid, auto-rotate | `--field-mono` |
| `talk` | Torus knot (3,2) | `--field-talk` |

Renderer clear is transparent (`0x000000`, alpha 0). Square point sprites, density-weighted size. Pixel ratio capped at 2. Pause when `document.hidden`.

## Applying this to another project

1. Copy [`src/tokens.css`](../src/tokens.css) (or [`docs/tokens.json`](tokens.json) and emit CSS).
2. Load the three Google Fonts faces (or self-host the same files).
3. Set `body { font-family: var(--font-ui); color: var(--ink); background: var(--bg); }`.
4. Map headings → `--font-display` + a display size token. Meta → `--font-mono` + `--muted`.
5. Use `--line` for dividers, `.link` behaviour for navigation, `--ease` for any transition.
6. One inverse surface is enough (black + `--copy-inverse`). Do not add a third theme.

JSON import: treat each `{ "value", "type" }` as a Design Tokens Community Group leaf. Names match CSS without the `--` prefix.

## Do / don’t

| Do | Don’t |
|----|--------|
| First-person, short sentences | Marketing funnels, cookie banners, analytics unless asked |
| Instrument Serif + Inter + IBM Plex Mono | A fourth family, or Inter for display |
| Graphite on paper, white points on black | Brand-colour accents, gradients, drop shadows |
| Hairlines and text buttons | Cards, chips, filled CTAs |
| `clamp` type + 720px stack | A 12-column grid for this voice |
| Reduced-motion static fallback | Mandatory WebGL |

## Drift

If a value in `style.css` disagrees with `tokens.css`, **tokens win** — update the stylesheet. `theme-color` stays `--bg-chrome` (`#fafafa`); page fill stays `--bg` (`#f7f7f7`).
