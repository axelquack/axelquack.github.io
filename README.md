# axelquack.github.io

Static personal presence site for **Axel Quack**, deployed to GitHub Pages at
[`www.axelquack.de`](https://www.axelquack.de) (apex redirects to `www`).

## Architecture

| Layer | Role |
|--------|------|
| **HTML** | Five scroll sections: hero, intro, helicoid stage, skills, contact |
| **CSS** | Editorial type system (Instrument Serif + Inter + IBM Plex Mono); solid `.screen` chapters sit above a fixed WebGL canvas |
| **`src/main.js`** | Scroll/pointer wiring; activates the stage whose viewport coverage is highest |
| **`src/scene.js`** | Three.js scene: density-grid “AQ” letterform, hyperbolic helicoid, torus knot |
| **`src/ascii.js`** | Offscreen canvas → point lattice sampler (`sampleTextPoints`) |
| **`src/forms.js`** | Parametric point clouds (`buildHelicoid`, `buildTorusKnot`, unused helpers) |

### Scroll / scene modes

`data-scene` on transparent `.stage` sections drives WebGL visibility:

| `data-scene` | Geometry | Notes |
|--------------|----------|--------|
| `name` | Sampled “AQ” glyph lattice | Pointer repulsion / light drag |
| `mono` | Hyperbolic helicoid | Continuous auto-rotation |
| `talk` | Torus knot (3,2) | White points on black contact stage |

Solid `.screen` chapters (intro, skills) cover the canvas so type stays crisp.

### Rendering notes

- `ShaderMaterial` point sprites (square cells, density-weighted size/alpha)
- Pixel ratio capped at 2; animation paused when `document.hidden`
- `prefers-reduced-motion: reduce` disables WebGL (static CSS fallback on hero)

## Stack

- **Vite 8** (ESM, `base: '/'`)
- **Three.js** `^0.185` (dynamic `import()` of `scene.js` after first paint)
- **GitHub Actions** → `actions/upload-pages-artifact` + `deploy-pages`
- Custom domain: `public/CNAME` → `www.axelquack.de`

## Art Gallery

[gallery.axelquack.de](https://gallery.axelquack.de) (NFT + other work). Alias [art.axelquack.de](https://art.axelquack.de) redirects to it (`axelquack/art`). A-Frame WebXR room, same tokens. App in `gallery/`; published to repo `axelquack/gallery`. DNS, catalog, audio: [docs/gallery.md](docs/gallery.md).

```bash
npm run dev:gallery    # http://localhost:5174
npm run build:gallery  # → dist-gallery/
```

## Local development

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve dist
```

Node 22+ recommended (matches CI).

## Deploy

Push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (www) and [`.github/workflows/deploy-gallery.yml`](.github/workflows/deploy-gallery.yml) (art gallery → `axelquack/gallery`).

DNS (INWX): `www` / `gallery` / `art` CNAME → `axelquack.github.io`; apex A/AAAA → GitHub Pages anycast. Mail MX/TXT untouched.

## Design system

Reusable styleguide for other projects:

| File | |
|------|--|
| [docs/design.md](docs/design.md) | Principles, type, colour, components, WebGL rules |
| [src/tokens.css](src/tokens.css) | CSS custom properties (this site imports them) |
| [docs/tokens.json](docs/tokens.json) | Same values as JSON |

## Repository layout

```
index.html
public/CNAME
public/favicon.svg        # paper/ink A; ICO + apple-touch rasters alongside
public/photo.jpg          # unused by current markup; kept as asset
src/
  main.js
  scene.js
  ascii.js
  forms.js
  style.css
  tokens.css
gallery/                  # Art Gallery app (Vite, port 5174)
docs/
  design.md
  tokens.json
  gallery.md
.github/workflows/
  deploy.yml
  deploy-gallery.yml
vite.config.js
AGENTS.md
CHANGELOG.md
```

## License

UNLICENSED — private personal site.
