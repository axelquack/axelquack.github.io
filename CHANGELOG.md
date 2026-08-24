# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
for release tags when used.

## [Unreleased]

### Added

- Design styleguide (`docs/design.md`) and portable tokens (`src/tokens.css`, `docs/tokens.json`) extracted from the live site
- Art Gallery app (`gallery/`) at `gallery.axelquack.de` (alias `art.axelquack.de`) — A-Frame WebXR museum; point-field stills plus live rotating frames (helicoid, knot, gyroid, …)
- Shared paper/ink **A** favicon on www, gallery, and art (`favicon.svg`, `favicon.ico`, apple-touch)
- Ventures app (`ventures/`) at `axelquack.ventures` — pre-seed angel, deep tech & AI; gyroid field, not the www chapter scroll

### Changed

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
