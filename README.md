# axelquack.github.io

Static personal presence site for Axel Quack. Copy is first-person and restrained. Visual system: white editorial chapters and graphite WebGL point fields on transparent stages.

## Status

2026-11-12, Europe/Berlin: public repository on the repo standard. Site content (text, images, slides) is CC BY-NC-SA 4.0. Site code (HTML, CSS, JS, build scripts) is PolyForm Noncommercial 1.0.0. Before this change there was no `LICENSE` file.

## Start here

1. `AGENTS.md`
2. This file
3. `BUGFIXES.md` and `SECURITY.md`
4. `HANDOFF.md`, the last three entries in `CHANGELOG.md`, and `git log -5`. `HANDOFF.md` is gitignored in this public repository.
5. The current ticket, or else `TODO.md` and `ROADMAP.md`
6. `docs/README.md`

## Layout

| Path | What |
| --- | --- |
| `AGENTS.md` | Agent rules. `CLAUDE.md` is a symlink to this file. |
| `README.md` | This page. |
| `CHANGELOG.md` | What changed, newest first. |
| `ROADMAP.md` | Now, next, later, ideas, done recently. |
| `TODO.md` | Interim tasks until the agent-ops board exists. |
| `BUGFIXES.md` | Durable bug writeups (`BF-NNN`). |
| `HANDOFF.md` | Done, next, open questions. Tracked in a private repo. Gitignored in a public repo. |
| `SECURITY.md` | Threat model and where secrets live. |
| `LICENSE` | Rights for this repo. Content and code are licensed separately. |
| `justfile` | Recipes. `just` lists them. `just setup` installs the git hook. Imports `just/website.just`. |
| `just/website.just` | Build and serve the presence site. Not a file at the repository root. |
| `docs/` | Longer docs. Index: `docs/README.md`. |
| `.env.example` | Setting names only. |
| `.githooks/` | `pre-commit` runs the secret check. |
| `scripts/check-secrets.sh` | Secret check for the working tree, the index, or history. |
| `index.html` | Presence page. |
| `src/` | Presence styles and the Three.js field. |
| `gallery/` | Art gallery app. |
| `ventures/` | Angel page. |
| `garden/` | Password-gated garden. Plaintext build output is not published. |
| `slides/` | Slidev spike. Not deployed. |

## Hosts

| Host | Source | What |
| --- | --- | --- |
| [www.axelquack.de](https://www.axelquack.de) | `index.html`, `src/` | Five-section scroll. The apex redirects to `www`. |
| [gallery.axelquack.de](https://gallery.axelquack.de) | `gallery/` | A-Frame WebXR museum. Alias [art.axelquack.de](https://art.axelquack.de). |
| [axelquack.ventures](https://axelquack.ventures) | `ventures/` | Business angel for solopreneurs building and scaling with AI agents. |
| [garden.axelquack.de](https://garden.axelquack.de) | `garden/` | Password-gated notes. The public Pages repo is ciphertext. |

Slides have no host. Do not add one unless Axel asks.

## Architecture

| Layer | Role |
| --- | --- |
| HTML | Five scroll sections: hero, intro, helicoid stage, skills, contact |
| CSS | Editorial type (Instrument Serif, Inter, IBM Plex Mono). Solid `.screen` chapters sit above a fixed WebGL canvas |
| `src/main.js` | Scroll and pointer wiring. Activates the stage whose viewport coverage is highest |
| `src/scene.js` | Three.js scene: density-grid letterform, hyperbolic helicoid, torus knot |
| `src/ascii.js` | Offscreen canvas to a point lattice |
| `src/forms.js` | Parametric point clouds |

`data-scene` on a transparent `.stage` drives the field:

| `data-scene` | Geometry | Notes |
| --- | --- | --- |
| `name` | Sampled glyph lattice | Pointer repulsion |
| `mono` | Hyperbolic helicoid | Continuous auto-rotation |
| `talk` | Torus knot (3,2) | Light points on the contact stage |

Solid `.screen` chapters cover the canvas so type stays crisp. Point sprites are square and density-weighted. The pixel ratio is capped at 2. Animation pauses when the document is hidden. Reduced motion hides the canvas.

## Stack

- Vite 8 (`base: '/'`)
- Three.js, loaded after first paint
- GitHub Actions publishes the presence site with pinned `actions/upload-pages-artifact` and `deploy-pages`
- `public/CNAME` is `www.axelquack.de`

Gallery, ventures, and the garden each have their own workflow and their own Pages repository. The map is in `docs/gallery.md`, `docs/ventures.md`, and `docs/garden.md`.

## Local development

```bash
npm ci
npm run dev                 # www, port 5173
npm run dev:gallery         # port 5174
npm run dev:ventures        # port 5175
npm run dev:garden          # port 5178
npm test
cd slides && npm ci && cd ..
npm run dev:slides          # port 5176
npm run dev:slides:variants # port 5177
npm run build               # www → dist/
npm run preview
```

`just serve` and `just build` run the presence-site scripts. Node 22 or newer matches CI.

## Deploy

Pushing `main` runs `.github/workflows/deploy.yml` (www), `.github/workflows/deploy-gallery.yml`, `.github/workflows/deploy-ventures.yml`, and `.github/workflows/deploy-garden.yml`. Each action is pinned to a commit SHA. Gallery, ventures, and the garden publish with their existing deploy keys. Dependabot opens a weekly pull request for minor and patch updates of those actions. From 2026-11-12, changes reach `main` through a pull request. Slides have no workflow.

DNS: `www`, `gallery`, `art`, and `garden` are CNAMEs to `axelquack.github.io`. The apex of `axelquack.de` and the apex of `axelquack.ventures` use GitHub Pages A and AAAA records. The ventures records are listed in `docs/ventures.md`. Do not change mail records.

## Design system

| File | |
| --- | --- |
| [docs/design.md](docs/design.md) | Principles, type, colour, components, WebGL rules |
| [src/tokens.css](src/tokens.css) | CSS custom properties |
| [docs/tokens.json](docs/tokens.json) | The same values as JSON |

## License

See `LICENSE`. Site content and site code are licensed separately.
