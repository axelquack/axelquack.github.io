# Agent instructions — axelquack.github.io

Guidance for coding agents working in this repository.

## What this is

A **static personal presence site** (not a job-application pack, CMS, or SPA framework app). Copy is first-person and restrained. Visual system: white editorial chapters + graphite WebGL point fields on transparent stages.

## Do

- Prefer editing `index.html` for copy; `src/tokens.css` for colour/type/space; `src/style.css` for layout; `src/scene.js` / `forms.js` / `ascii.js` for WebGL
- Art Gallery (`gallery/`, [gallery.axelquack.de](https://gallery.axelquack.de); alias [art.axelquack.de](https://art.axelquack.de)): A-Frame WebXR, same tokens; add works in `gallery/public/works.json` + `gallery/public/media/`. See [docs/gallery.md](docs/gallery.md)
- Ventures (`ventures/`, [axelquack.ventures](https://axelquack.ventures)): business angel, pre-seed deep tech & AI. Same tokens, different layout (gyroid field, not the www chapter scroll). See [docs/ventures.md](docs/ventures.md)
- Keep tokens in sync: `src/tokens.css` ↔ `docs/tokens.json` ↔ `docs/design.md`
- Keep solid content on `.screen` (above canvas); WebGL only on `.stage[data-scene]`
- After meaningful changes: update `CHANGELOG.md`, run `npm run build`, commit, push `main` (Pages deploys via Actions)
- Match existing type tokens (`--font-display`, `--pad-x`, etc.) rather than inventing a new system
- Treat secrets as out of band (Proton Pass / `pass-cli`); never commit credentials

## Don’t

- Don’t reintroduce a client-side password gate unless explicitly requested
- Don’t add analytics, cookie banners, or marketing funnels without being asked
- Don’t rewrite Git history or force-push unless the user explicitly asks
- Don’t cite or name third-party personal portfolio sites in docs or comments
- Don’t change INWX / DNS or GitHub Pages domain settings without an explicit request
- Don’t commit `node_modules/` or `dist/` (build artifact is produced in CI)

## Commands

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## Deploy

- Default branch: `main`
- Workflow: `.github/workflows/deploy.yml` → GitHub Pages
- Live: https://www.axelquack.de
- Art Gallery: https://gallery.axelquack.de (alias https://art.axelquack.de via repo `axelquack/art`). Source in `gallery/`; published to `axelquack/gallery` via `.github/workflows/deploy-gallery.yml` (`GALLERY_DEPLOY_KEY`)
- Ventures: https://axelquack.ventures — `ventures/` → `axelquack/ventures` via `.github/workflows/deploy-ventures.yml` (`VENTURES_DEPLOY_KEY`)

## DNS note

`www` → CNAME `axelquack.github.io`. Apex A/AAAA → GitHub Pages.  
`gallery` → CNAME `axelquack.github.io` (repo `axelquack/gallery`, custom domain).  
`art` → CNAME `axelquack.github.io` (repo `axelquack/art` redirect).  
`axelquack.ventures` apex A/AAAA → GitHub Pages (repo `axelquack/ventures`).  
**Do not** alter MX/TXT/iCloud records unless asked.
