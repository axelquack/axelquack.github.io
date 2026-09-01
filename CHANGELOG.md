# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
for release tags when used.

## [Unreleased]

### Added

- AQ Slides spike (`slides/`) — Slidev decks using `src/tokens.css`; Hermes Agent demo from Obsidian (`npm run dev:slides` :5176). Local only; no Pages host yet. Full inventory: [docs/slides.md](docs/slides.md)
- Slides layouts (`aq-cover` … `aq-end`): cover gyroid field, quote, agenda (CSS 01–08), photo split, section, fill (lists + Monaco), media, three columns, giant stat, 2×2 grid, device frame, statement, split, inverse knot end; variants catalog on :5177
- Slides components: `AqField` (gyroid / knot), `AqMetrics`, `AqChart` (static ink bars), `AqVideo` (local poster then YouTube nocookie iframe); `{monaco-run}` on the Hermes skill-shape slide
- Slides media: gallery stills (`gyroid-i`, `helicoid-i`, `knot-32`, `mobius`) plus `hermes-setup.jpg` poster
- Demo deck copy is lorem ipsum (layouts, stills, and `AqVideo` unchanged)
- Slide chrome is Markdown: cover `h1 + p` is the lede, `>` is a note, stat `h1 + p` is the caption (no classed HTML)
- Design styleguide (`docs/design.md`) and portable tokens (`src/tokens.css`, `docs/tokens.json`) extracted from the live site
- Art Gallery app (`gallery/`) at `gallery.axelquack.de` (alias `art.axelquack.de`) — A-Frame WebXR museum; point-field stills plus live rotating frames (helicoid, knot, gyroid, …)
- Shared paper/ink **A** favicon on www, gallery, and art (`favicon.svg`, `favicon.ico`, apple-touch)
- Ventures app (`ventures/`) at `axelquack.ventures` — pre-seed angel, deep tech & AI; gyroid field, not the www chapter scroll
- Gallery mobile walk stick: hairline analog joystick (touch only); gyro still looks
- Gallery doorways: walk volumes overlap rooms so you can leave the lobby (and side halls)
- Gallery live hangings: still as poster; nearest looping MP4s play after a gesture (no extra preloader UI)
- Gallery iOS hangings animate from filmstrip PNGs (WebKit will not texture `<video>`)
- Local social banners script (`scripts/render-x-header.mjs`) — X / Facebook / YouTube; PNGs stay gitignored

### Changed

- Gallery walk is faster (~2.5 m/s stick and WASD)
- Gallery fullscreen control is desktop-only
- Gallery does not probe WebXR or show A-Frame’s “immersive website” motion modal (Brave iOS could not accept it). iOS gyro is requested on the first tap in Safari; Brave uses the stick and drag-to-look.
- Slides cover/end field: quieter gyroid/knot (~9k points, opacity ~0.58) so display type still reads
- www fields: slightly quieter AQ lattice, helicoid, and knot so labels and contact copy contrast
- Ventures gyroid: ~14k points, opacity 0.58 so thesis type still reads
- Ventures mast: title is **AQ Ventures** only (no personal name); remove decorative ghost “01” and unused mast/ghost CSS
- Ventures thesis: business angel for global solopreneurs who build and scale with AI agents (was deep tech / Europe enterprise)
- Gallery HUD: play/pause is a toggling icon plus song title; stock A-Frame VR box replaced with a hairline fullscreen control
- Gallery **NFT** / **Other** pin a ~40% 2D stills strip over the live room; **All** is the 3D room
- Gallery soundtrack loops via Web Audio on a trimmed, crossfaded WAV (no MP3 gap)
- Title **Art Gallery**; second Pages repo `axelquack/gallery`; alias `art.axelquack.de` via `axelquack/art`
- Contact-stage Email / LinkedIn / Art Gallery links sit above the WebGL canvas so they are clickable

## [1.0.0] — 2026-08-18

### Added

- Static Vite + Three.js presence site with five-section scroll narrative
- Density-grid “AQ” hero letterform (`sampleTextPoints` + pointer warp)
- Auto-rotating hyperbolic helicoid and torus-knot interludes
- Editorial CSS type system; Skills chapter with hairline list
- GitHub Actions Pages deploy; `public/CNAME` for `www.axelquack.de`
- `AGENTS.md` and this changelog

### Changed

- Public site (password gate removed)
- Canonical host `www.axelquack.de` (apex redirects via GitHub Pages)

### Removed

- Client-side password gate (`gate.js` and related CSS/markup)
- External design-reference mentions from docs and source comments
