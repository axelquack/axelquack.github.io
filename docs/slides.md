# AQ Slides (spike)

Browser presentations from Markdown, styled with the same paper / graphite system as [www.axelquack.de](https://www.axelquack.de). Engine: [Slidev](https://sli.dev) (`@slidev/cli` ^52, Vue 3, `theme-default` as a shell that AQ CSS overrides).

**Status:** local spike, **not on GitHub Pages**. No `slides.axelquack.de`, no deploy workflow. Do not add DNS or CI until asked.

| | |
|--|--|
| App | `slides/` (own `package.json` + lockfile) |
| Canonical deck | `slides/hermes-agent.md` (placeholder lorem; layouts + video unchanged) |
| Duplicate | `slides/decks/hermes-agent.md` — same bytes; **edit the root file** |
| Layout catalog | `slides/variants.md` |
| Theme CSS | `slides/styles/index.css` |
| Tokens | `@import ../../src/tokens.css` |
| Field | `slides/lib/field.js` ← `src/forms.js` (`buildGyroid`, `buildTorusKnot`) |
| Vite | `slides/vite.config.ts` — `server.fs.allow` parent repo |
| Favicon | `slides/public/` (same paper/ink **A** as www) |
| Stills | `slides/public/media/` |
| Build out | `dist-slides/` (gitignored) |
| PDF/PPTX | `slides/exports/` (gitignored) |

## Commands

Root `package.json` prefixes into `slides/`. First time (and after lockfile changes) install **inside** `slides/` — it is not an npm workspace of the presence app.

```bash
cd slides && npm ci
cd ..

npm run dev:slides               # hermes-agent.md → http://localhost:5176/
npm run dev:slides:variants      # variants.md     → http://localhost:5177/
npm run build:slides             # → dist-slides/
npm run export:slides:pdf        # Playwright Chromium (devDependency in slides/)
npm run export:slides:pptx       # screenshot PPTX, not editable Office layouts
```

Slidev extras on the same origin:

| Path | |
|------|--|
| `/presenter/` | Presenter view |
| `/overview/` | Grid of slides |
| `/export/` | In-browser export UI |

Canvas is **1280×720** (`canvasWidth: 1280` in deck frontmatter). Transition: `fade`. `colorSchema: light`. Fonts: Inter / Instrument Serif / IBM Plex Mono (loaded in `slides/index.html`, same Google Fonts URL as www).

## How tokens get in

1. `slides/styles/index.css` imports `src/tokens.css`.
2. `slides/vite.config.ts` allows Vite to read `..` so that import and `src/forms.js` resolve.
3. Layouts force paper (`--bg` / `--ink`) over `theme-default`. Cover is **transparent** so the gyroid shows through. `aq-end` / `.aq-inverse` use `--bg-inverse` / `--ink-inverse`.
4. Shared chrome classes: `.aq-kicker` (mono uppercase), `.aq-lede` (display lede), `.aq-note` (muted meta), `.aq-split` (two columns). Lists are hairline rows, not bullets. Type clamp + **720px** stack matches [design.md](design.md).
5. `prefers-reduced-motion: reduce` kills CSS transitions in the theme; `createField` returns a no-op (no WebGL).

## Shared frontmatter

Every custom layout accepts some of:

| Key | Type | Used by |
|-----|------|---------|
| `layout` | `aq-*` | All |
| `kicker` | string | Almost all (mono line above the title) |
| `foot` | string | `aq-cover`, `aq-statement`, `aq-end` (meta at the bottom) |
| `attribution` | string | `aq-quote` |
| `note` | string | `aq-stat` (top-right, opposite the kicker) |
| `image` | path | `aq-photo`, `aq-device` (from `slides/public/`, e.g. `/media/gyroid-i.png`) |
| `alt` | string | Same |
| `side` | `left` \| `right` | `aq-photo` (default `right`) |

Deck-level (Hermes / variants):

```yaml
theme: default
title: Hermes Agent
author: Axel Quack
colorSchema: light
highlighter: shiki
fonts:
  sans: Inter
  serif: Instrument Serif
  mono: IBM Plex Mono
transition: fade
canvasWidth: 1280
layout: aq-cover
kicker: Research note · AQ Slides spike
foot: Adapted from Obsidian · 2026-04-20-hermes-agent
```

Slidev slots: `::left::` / `::right::` (split, agenda); `::a::` … `::d::` (columns, grid).

**Markdown, not HTML, for chrome copy:**

| In the `.md` | Looks like |
|--------------|------------|
| Paragraph right after `#` on `aq-cover` | Display lede (was `<p class="aq-lede">`) |
| `>` blockquote | Muted mono note (was `<p class="aq-note">`) |
| Paragraph right after `#` on `aq-stat` | Caption under the giant number (was `<small>`) |

Leave Vue tags for widgets only: `AqMetrics`, `AqChart`, `AqVideo`. Those are not type — they *are* the slide.

## Layouts (`slides/layouts/`)

| Layout | File | What it is | Frontmatter / slots |
|--------|------|------------|---------------------|
| `aq-cover` | `aq-cover.vue` | Title over a **live gyroid** (`AqField`). Content max-width ~22rem, vertically centred. Kicker top, `foot` bottom. Title/lede get a paper text-shadow so they read on the field. Pointer-events on the field; links in the copy stay clickable. | `kicker`, `foot` |
| `aq-quote` | `aq-quote.vue` | Display pull-quote (`.aq-lede`), vertically centred. | `kicker`, `attribution` |
| `aq-agenda` | `aq-agenda.vue` | Title + two numbered columns. CSS counters: left `01…`, right starts at **05** (`counter-reset: aq 4`). Hairline under each item. | `kicker`; `::left::` `::right::` (use `<ol>`) |
| `aq-photo` | `aq-photo.vue` | Copy column + full-height still (~42% width), hairline between. `object-fit: cover`. Zero layout padding; copy uses `--pad-x/y`. | `kicker`, `image`, `alt`, `side` |
| `aq-section` | `aq-section.vue` | Chapter body. `h1` fixed; `.aq-metrics` / `.aq-chart` grow into leftover height. | `kicker` |
| `aq-fill` | `aq-fill.vue` | Title (+ optional note) then **lists or code** eat leftover height. Lists `space-evenly`; Monaco/`{monaco-run}` and `<pre>` stretch. | `kicker` |
| `aq-split` | `aq-split.vue` | Optional title, then two equal columns. Inner `.aq-split` stacks at 720px. | `kicker`; `::left::` `::right::` |
| `aq-columns` | `aq-columns.vue` | Title + three hairline panes. Display `h2/h3` in the cell. | `kicker`; `::a::` `::b::` `::c::` |
| `aq-grid` | `aq-grid.vue` | Title + 2×2. Cell `h3` is mono kicker; body is Inter. | `kicker`; `::a::`–`::d::` |
| `aq-stat` | `aq-stat.vue` | Giant display number (`h1` or `p` → clamp ~4.2–8.5rem). `<small>` under the figure is muted mono. | `kicker`, `note` |
| `aq-device` | `aq-device.vue` | Ink **1px rectangle** around a still (not a fake laptop), copy on the right. | `kicker`, `image`, `alt` |
| `aq-statement` | `aq-statement.vue` | Oversized title (max ~12ch) sitting on the bottom of the slide. | `kicker`, `foot` |
| `aq-media` | `aq-media.vue` | Full-bleed black stage, no title chrome. Slot is an iframe/video/`AqVideo` filling the 16:9 slide. | — |
| `aq-end` | `aq-end.vue` | Inverse of cover: **knot** field (`AqField inverse`), black ground, light type, `foot` at the bottom. | `kicker`, `foot` |
| `default` | Slidev | Plain body if you omit `layout`. | — |

Cover field: ~9k gyroid points, graphite `#121212`, opacity `0.58`. End field: torus knot (3,2), `#f0f0f0` at `0.52` on black. Same quieter register as www / ventures so display type still reads. Pointer tear via `uMouse` / `uRepel`. Pixel ratio capped at 2. Honour reduced motion (no WebGL).

## Components (`slides/components/`)

Slidev auto-registers these from the folder (no import in Markdown).

### `AqField`

Used by cover/end layouts, not usually in Markdown.

| Prop | Default | |
|------|---------|--|
| `inverse` | `false` | `false` → gyroid / dark points; `true` → knot / light points |

### `AqMetrics`

Hairline definition list. Put on `aq-section`.

```vue
<AqMetrics
  :rows="[
    { label: 'License', value: 'MIT' },
    { label: 'Language', value: 'Python' },
  ]"
/>
```

`label` → mono kicker; `value` → display serif.

### `AqChart`

Horizontal bars, ink on a hairline track. **Not a live API** — pass percentages yourself.

```vue
<AqChart
  title="Open-source agents · stars (relative %)"
  :labels="['OpenClaw', 'Hermes', 'OpenCode', 'Agent Zero']"
  :values="[100, 41, 32, 5]"
  unit="%"
/>
```

Values are clamped 0–100 and used as bar width. No accent hues.

### `AqVideo`

Poster + hairline play control. Click loads a YouTube **nocookie** iframe (`autoplay`, modest branding, no related). No YouTube preview chrome.

| Prop | |
|------|--|
| `id` | YouTube video id (required) |
| `poster` | Image URL; default `https://i.ytimg.com/vi/{id}/maxresdefault.jpg` |
| `title` | `aria-label` / iframe title |

Hermes uses a local poster: `poster="/media/hermes-setup.jpg"`.

### Live code

````md
```ts {monaco-run}
const skill = { name: "summarise-thread", steps: ["extract goals"] }
console.log(JSON.stringify(skill, null, 2))
```
````

`aq-fill` is the layout that sizes Monaco to leftover height.

## Media (`slides/public/media/`)

Copied from the Art Gallery unless noted.

| File | Used |
|------|------|
| `gyroid-i.png` | Hermes photo (right); variants photo |
| `helicoid-i.png` | Hermes photo (left); variants reverse photo |
| `knot-32.png` | Hermes + variants `aq-device` |
| `mobius.png` | On disk (variants / spare) |
| `hermes-setup.jpg` | `AqVideo` poster (not a gallery still) |

Paths in Markdown are site-root: `/media/…`.

## Demo deck map (`slides/hermes-agent.md`)

Filename is leftover from the Obsidian note. **Copy is lorem ipsum** so the layouts can be judged without the Hermes talk. Structure, stills, and the video are unchanged.

| # | Layout | What’s on the slide |
|---|--------|---------------------|
| 1 | `aq-cover` | Live gyroid; lorem lede |
| 2 | `aq-quote` | Lorem pull-quote; attribution Cicero · De finibus |
| 3 | `aq-agenda` | Eight lorem items (counters 01–08) |
| 4 | `aq-photo` | `side: right`, gyroid still |
| 5 | `aq-section` | `AqMetrics` placeholder rows |
| 6 | `aq-fill` | Lorem hairline list |
| 7 | `aq-fill` | Architecture sketch (`ts` fence, not live) |
| 8 | `aq-fill` | `{monaco-run}` placeholder object |
| 9 | `aq-section` | `AqChart` static bars (Lorem / Ipsum / Dolor / Sit) |
| 10 | `aq-media` | `AqVideo` id `uycgV-eulGE`, poster `/media/hermes-setup.jpg` |
| 11 | `aq-columns` | Three lorem panes |
| 12 | `aq-stat` | `00` |
| 13 | `aq-grid` | Four lorem cells |
| 14 | `aq-photo` | `side: left`, helicoid still |
| 15 | `aq-device` | Knot still |
| 16 | `aq-statement` | Oversized lorem line |
| 17 | `aq-split` | Two lorem lists |
| 18 | `aq-end` | Inverse knot field; foot www + ventures |

**Variants deck** (`slides/variants.md`, :5177): cover, agenda, statement, photo ×2, columns, grid, stat (`90`), device, end — no Hermes copy; for judging structure.

## Adding a deck

1. New `slides/<name>.md` with the shared frontmatter (`layout: aq-cover` on the first slide).
2. Add a script in `slides/package.json` (and a root alias if you want `npm run dev:slides:<name>`).
3. Keep stills under `slides/public/media/`.
4. Do not invent a fourth typeface or a brand accent — [design.md](design.md).

## What is not done

- Theme hardening after review (Hermes end slide still says this)
- Obsidian helper to emit `layout: aq-*` from vault notes
- Host `slides.axelquack.de` (would be a **separate** Pages repo + INWX, same pattern as gallery/ventures)
- npm workspaces (root `npm ci` does not install `slides/` deps)
- Deleting the duplicate `slides/decks/hermes-agent.md`

## Related

| Doc | |
|-----|--|
| [design.md](design.md) | Tokens, type, hairlines, reduced motion |
| [gallery.md](gallery.md) | Source of the stills |
| [ventures.md](ventures.md) | Same gyroid family as the cover field |
