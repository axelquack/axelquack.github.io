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

## Local development

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve dist
```

Node 22+ recommended (matches CI).

## Deploy

Push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

DNS (INWX): `www` CNAME → `axelquack.github.io`; apex A/AAAA → GitHub Pages anycast. Mail MX/TXT untouched.

## Repository layout

```
index.html
public/CNAME
public/photo.jpg          # unused by current markup; kept as asset
src/
  main.js
  scene.js
  ascii.js
  forms.js
  style.css
vite.config.js
AGENTS.md
CHANGELOG.md
```

## License

UNLICENSED — private personal site.
