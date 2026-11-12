Herdr agent: Julian (Web) · personal websites

Lead bot: Julian / Visibility: public / Default branch: main / Push: PR only

`CLAUDE.md` is a symlink to `AGENTS.md` (`ln -sf AGENTS.md CLAUDE.md`). Edit `AGENTS.md` only. Do not keep a second copy.

## Role

### Project

A static personal presence site (not a job-application pack, CMS, or SPA framework app). Copy is first-person and restrained. Visual system: white editorial chapters and graphite WebGL point fields on transparent stages.

Four apps share that system. Live names, aliases, and DNS are in `README.md`. Do not repeat them here.

The presence site is a five-section scroll: hero, intro, helicoid stage, skills, and contact. `src/main.js` activates the `.stage` with the most viewport coverage and loads `src/scene.js` after first paint. `data-scene` is `name` (sampled glyph lattice), `mono` (hyperbolic helicoid), or `talk` (torus knot). Solid content sits on `.screen`, above the canvas. WebGL runs only on `.stage[data-scene]`.

The gallery is an A-Frame museum. It does not probe WebXR and it does not show an immersive motion modal. Add works in `gallery/public/works.json` and `gallery/public/media/`. See `docs/gallery.md` and `BUGFIXES.md`.

Ventures is a business angel page for solopreneurs building and scaling with AI agents, globally. Same tokens, different layout: a gyroid field, not the presence-site chapter scroll. See `docs/ventures.md`.

The garden is a password-gated digital garden of markdown notes with `published: true`. Same tokens. The screening-room landing belongs to the garden only (see `docs/design.md`), with a typographic cinema-wall gallery. It has Obsidian-style nav, search, backlinks, outline, graph, and hover, plus Dataview TABLE/LIST, callouts, and embeds. The published Pages repository is StatiCrypt ciphertext. See `docs/garden.md` and `garden/SECURITY.md`.

Slides are a local spike and are not deployed. Slidev, plus the AQ layouts and components. Demo copy is placeholder text. Do not put talk copy in the templates. See `docs/slides.md`.

Keep the tokens in sync: `src/tokens.css`, `docs/tokens.json`, and `docs/design.md`. Match the existing type tokens (`--font-display`, `--pad-x`, and the rest) rather than inventing a new scale.

### This agent owns

- Presence sources: `index.html` and `src/`.
- `gallery/`, `ventures/`, `garden/`, and the unpublished `slides/` spike.
- Token sync across `src/tokens.css`, `docs/tokens.json`, and `docs/design.md`.
- The existing Pages workflows. Do not add a slides workflow.
- The repo-standard files in the file map.

### Out of scope & handoff

- INWX, DNS, and GitHub Pages domain settings. Do not change them without an explicit request. Do not alter MX, TXT, or iCloud mail records unless asked. The host map is in `README.md`.
- Unpublished vault notes. Commit a garden note only when `published: true`.
- Build output: `node_modules/`, `dist/`, `dist-gallery/`, `dist-garden/`, `dist-garden-public/`, `dist-ventures/`, `dist-slides/`, and `slides/exports/`. Do not commit them. Do not publish the garden plaintext build.
- Deploy keys and the garden password. They are GitHub Actions secrets: `GALLERY_DEPLOY_KEY`, `VENTURES_DEPLOY_KEY`, `GARDEN_DEPLOY_KEY`, and `GARDEN_SITE_PASSWORD`. The password is not in this repo.
- A password gate on the presence site. Do not reintroduce one unless explicitly requested. The garden stays password-gated (StatiCrypt).
- Analytics, cookie banners, and marketing funnels, unless asked.
- A hostname for the slides spike, or a slides deploy workflow, unless explicitly requested.
- Naming or citing third-party personal portfolio sites in docs or comments.
- The published Pages repositories. They are deploy targets, not other codebases, unless a workflow in this repo already publishes to them.
- The agent-platform repository. Do not edit it from this tree.
- Commands against hosts, devices, VMs, or containers, unless Axel asks.

## Start here

Read in this order:

1. `AGENTS.md` (this file).
2. `README.md`.
3. `BUGFIXES.md` and `SECURITY.md`.
4. `HANDOFF.md`, the last three entries in `CHANGELOG.md`, and `git log -5`. In this public repo `HANDOFF.md` is gitignored. The public handoff lives in the agent-platform repository at `handoffs/<repo>.md`. Do not write that note from this tree.
5. The current ticket, or else `TODO.md` and `ROADMAP.md`.
6. `docs/README.md`.

## File map

| File | What it is for | Who updates it |
| --- | --- | --- |
| `.env.example` | Setting names only. No values. | Whoever adds a setting |
| `.githooks/pre-commit` | Runs the staged secret check before a commit. | Whoever changes the check |
| `.github/workflows/deploy-gallery.yml` | Builds the gallery and publishes it to its Pages repository. | Julian, when that deploy changes |
| `.github/workflows/deploy-garden.yml` | Tests the garden, encrypts the build, and publishes ciphertext. | Julian, when that deploy changes |
| `.github/workflows/deploy-ventures.yml` | Builds the ventures page and publishes it to its Pages repository. | Julian, when that deploy changes |
| `.github/workflows/deploy.yml` | Builds the presence site and publishes it with Pages. | Julian, when that deploy changes |
| `.github/workflows/gitleaks.yml` | Runs gitleaks on push and pull_request. | Whoever changes the CI check |
| `.gitignore` | Ignore rules, including the public handoff and the private changelog. | Whoever changes ignore rules |
| `.gitleaks.toml` | Gitleaks rules and the license-text allowlist. | Whoever changes the secret check |
| `AGENTS.md` | Rules for the herdr agent. | The owning agent, when the role or the rules change |
| `BUGFIXES.md` | Durable bug writeups, BF-NNN. | Whoever records the fix |
| `CHANGELOG.md` | What changed, newest first, with a why. Public variant. | Whoever makes the change |
| `CLAUDE.md` | Symlink to AGENTS.md. Same text. No second copy. | Nobody. Recreate it with ln -sf AGENTS.md CLAUDE.md |
| HANDOFF.md | Done, next, and open questions. Gitignored in this public repo. The public note lives in the agent-platform handoff folder. | The agent, before stopping |
| `LICENSE` | Content under CC BY-NC-SA 4.0. Code under PolyForm Noncommercial 1.0.0. | Axel |
| `README.md` | What the repo is, the status line, the host map, and where to start. | The person who changes the project |
| `ROADMAP.md` | Now, next, later, ideas, and done recently. | The owning agent, when the plan moves |
| `SECURITY.md` | Threat model, where secrets live, and leak response. | The owning agent, when the threat model changes |
| `TODO.md` | Interim task list until the agent-ops board exists. | The agent who holds the work |
| `docs/README.md` | Index of every Markdown page under docs/. | Whoever adds or removes a docs page |
| `docs/design.md` | Type, colour, space, and WebGL rules. | Julian, when the visual system changes |
| `docs/gallery.md` | What the gallery shows and how it is published. | Julian, when the gallery changes |
| `docs/garden.md` | What the garden shows and how notes are published. | Julian, when the garden changes |
| `docs/slides.md` | Layouts for the local slides spike. | Julian, when the slides spike changes |
| `docs/tokens.json` | Token values as JSON. Keep them aligned with src/tokens.css. | Julian, when a token changes |
| `docs/ventures.md` | What the ventures page says and how it is published. | Julian, when the ventures page changes |
| `gallery/index.html` | Gallery shell: room, catalog strip, and HUD. | Julian, when gallery copy or structure changes |
| `gallery/public/CNAME` | Custom domain file for the published gallery. | Axel, and only when a domain change is requested |
| `gallery/public/apple-touch-icon.png` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `gallery/public/audio/soundtrack.wav` | Gallery soundtrack audio. | Julian, when the soundtrack changes |
| `gallery/public/favicon.ico` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `gallery/public/favicon.svg` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `gallery/public/media/.gitkeep` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/clifford-i-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/clifford-i.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/clifford-i.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/clifford-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/clifford-iii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/gyroid-i-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/gyroid-i.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/gyroid-i.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/gyroid-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/gyroid-iii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-i-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-i.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-i.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-iii-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-iii.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-iii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-iv.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/helicoid-v.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/hopf-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/hopf-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/hopf.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/hopf.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-32-b.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-32-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-32.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-32.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-43-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-43.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-43.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-52.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/knot-72.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lissajous-25.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lissajous-34.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lorenz-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lorenz-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lorenz.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/lorenz.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mass-i-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mass-i.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mass-i.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mass-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mass-iii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mobius-ii.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mobius-loop.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mobius.mp4` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/media/mobius.png` | Still, filmstrip, or loop for a gallery work. | Julian, when that work changes |
| `gallery/public/soundtrack.json` | Loop metadata for the gallery soundtrack. | Julian, when the soundtrack changes |
| `gallery/public/works.json` | Catalog of gallery works. | Julian, when a work is added or retitled |
| `gallery/scripts/render-loops.mjs` | Renders filmstrip loops for gallery works. | Julian, when the render pipeline changes |
| `gallery/scripts/render-math-art.mjs` | Renders gallery stills. | Julian, when the render pipeline changes |
| `gallery/scripts/render-videos.mjs` | Renders gallery loop videos. | Julian, when the render pipeline changes |
| `gallery/src/disable-webxr.js` | Stops the gallery from probing WebXR. | Julian, when gallery look controls change |
| `gallery/src/live-field.js` | Plays the nearest gallery loop after a gesture. | Julian, when live hangings change |
| `gallery/src/main.js` | Gallery HUD, catalog strip, audio, and walk stick. | Julian, when gallery behaviour changes |
| `gallery/src/scene.js` | Museum room, frames, and collision. | Julian, when the room changes |
| `gallery/src/style.css` | Gallery layout. Uses the shared tokens. | Julian, when gallery layout changes |
| `gallery/vite.config.js` | Vite config for the gallery. | Julian, when the gallery build changes |
| `garden/SECURITY.md` | Garden threat model. Distinct from the repo SECURITY.md. | Julian, when the garden threat model changes |
| `garden/index.html` | Garden page shell. | Julian, when garden copy or structure changes |
| `garden/notes/graph.md` | Published garden note. Only notes with published set are committed. | Julian, when that note changes |
| `garden/notes/how-this-garden-works.md` | Published garden note. Only notes with published set are committed. | Julian, when that note changes |
| `garden/notes/index.md` | Published garden note. Only notes with published set are committed. | Julian, when that note changes |
| `garden/notes/presence.md` | Published garden note. Only notes with published set are committed. | Julian, when that note changes |
| `garden/public/CNAME` | Custom domain file for the published garden. | Axel, and only when a domain change is requested |
| `garden/public/apple-touch-icon.png` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `garden/public/favicon.ico` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `garden/public/favicon.svg` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `garden/public/robots.txt` | Asks crawlers not to index the garden. | Julian, when garden publishing rules change |
| `garden/scripts/encrypt.mjs` | Inlines the garden build and optionally encrypts it. | Julian, when garden publishing changes |
| `garden/scripts/export-published.mjs` | Copies published notes from the directory in GARDEN_VAULT. | Julian, when the export changes |
| `garden/src/field.js` | Gyroid field behind the garden. | Julian, when the garden field changes |
| `garden/src/graph.js` | Note graph view. | Julian, when the graph changes |
| `garden/src/main.js` | Garden navigation, search, and views. | Julian, when garden behaviour changes |
| `garden/src/publish/build.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/dataview.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/frontmatter.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/index.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/links.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/render.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/scan.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/search.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/publish/util.js` | Garden publish-pipeline module. | Julian, when the publish pipeline changes |
| `garden/src/style.css` | Garden layout. Screening room on this app only. | Julian, when garden layout changes |
| `garden/templates/password.html` | Password page wrapped around the encrypted garden. | Julian, when the gate page changes |
| `garden/test/artifact.test.js` | Checks the encrypted garden artifact. | Julian, when the publish pipeline changes |
| `garden/test/fixtures/callout-embed.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/dataview-index.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/no-flag.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/pixel.png` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/published-alpha.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/published-beta.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/fixtures/unpublished-secret.md` | Fixture for the garden publish tests. Unpublished fixtures must stay unpublished. | Julian, when those tests change |
| `garden/test/publish.test.js` | Tests the publish pipeline. | Julian, when the publish pipeline changes |
| `garden/test/tokens.test.js` | Checks that the garden still uses the shared tokens. | Julian, when tokens change |
| `garden/vite.config.js` | Vite config for the garden. | Julian, when the garden build changes |
| `index.html` | Presence page: hero, intro, helicoid stage, skills, and contact. | Julian, when www copy or structure changes |
| `just/website.just` | Build and serve recipes. Imported by the root justfile. | Whoever adds a recipe |
| `justfile` | Repeatable recipes, including the secret check. Imports just/website.just. | Whoever adds a recipe |
| `package-lock.json` | Locked dependency tree for the presence site and the sibling apps. | Julian, when dependencies change |
| `package.json` | Package metadata and npm scripts. The license field points at LICENSE. | Julian, when scripts or dependencies change |
| `public/CNAME` | Custom domain file for the presence site. | Axel, and only when a domain change is requested |
| `public/apple-touch-icon.png` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `public/favicon.ico` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `public/favicon.svg` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `public/photo.jpg` | Presence-site image asset. | Julian, when that asset changes |
| `scripts/check-secrets.sh` | Fails on a secret-shaped file name or a gitleaks finding. | Whoever changes the check |
| `scripts/docs-index.sh` | Refreshes the generated list in docs/README.md. | Whoever changes the index |
| `scripts/lint.sh` | Shellcheck, then a whitespace check. | Whoever changes the check |
| `scripts/render-x-header.mjs` | Renders local social banners. The images stay gitignored. | Julian, when that script changes |
| `scripts/repo-audit.sh` | Reports standard files that are missing. | Whoever changes the standard |
| `slides/components/AqChart.vue` | Slide component. | Julian, when slide components change |
| `slides/components/AqField.vue` | Slide component. | Julian, when slide components change |
| `slides/components/AqMetrics.vue` | Slide component. | Julian, when slide components change |
| `slides/components/AqVideo.vue` | Slide component. | Julian, when slide components change |
| `slides/decks/hermes-agent.md` | Demo deck source. Placeholder copy. | Julian, when the demo deck changes |
| `slides/hermes-agent.md` | Demo deck entry. Placeholder copy. | Julian, when the demo deck changes |
| `slides/index.html` | Slides page shell. | Julian, when the slides shell changes |
| `slides/layouts/aq-agenda.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-columns.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-cover.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-device.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-end.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-fill.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-grid.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-media.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-photo.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-quote.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-section.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-split.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-stat.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/layouts/aq-statement.vue` | Slide layout. | Julian, when slide layouts change |
| `slides/lib/field.js` | Point field used by slide covers. | Julian, when the slide field changes |
| `slides/package-lock.json` | Locked dependency tree for the slides spike. | Julian, when slide dependencies change |
| `slides/package.json` | Slides scripts and dependencies. Own lockfile. | Julian, when the slides spike changes |
| `slides/public/apple-touch-icon.png` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `slides/public/favicon.ico` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `slides/public/favicon.svg` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `slides/public/media/gyroid-i.png` | Still used by the slides spike. | Julian, when that slide media changes |
| `slides/public/media/helicoid-i.png` | Still used by the slides spike. | Julian, when that slide media changes |
| `slides/public/media/hermes-setup.jpg` | Still used by the slides spike. | Julian, when that slide media changes |
| `slides/public/media/knot-32.png` | Still used by the slides spike. | Julian, when that slide media changes |
| `slides/public/media/mobius.png` | Still used by the slides spike. | Julian, when that slide media changes |
| `slides/styles/index.css` | Slide styles. Imports the shared tokens. | Julian, when slide styles change |
| `slides/variants.md` | Catalog of slide layouts. | Julian, when layouts change |
| `slides/vite.config.ts` | Vite config for the slides dev servers. | Julian, when the slides build changes |
| `src/ascii.js` | Samples a glyph into a point lattice. | Julian, when the hero letterform changes |
| `src/forms.js` | Parametric point clouds for the fields. | Julian, when a field shape changes |
| `src/main.js` | Scroll, pointer, and clock wiring for the presence site. | Julian, when www behaviour changes |
| `src/scene.js` | Three.js scene for the presence site. | Julian, when the www field changes |
| `src/style.css` | Presence-site layout. | Julian, when www layout changes |
| `src/tokens.css` | Source of truth for colour, type, and space. | Julian, when a token changes |
| `ventures/index.html` | Ventures page: mast and thesis over a gyroid field. | Julian, when ventures copy changes |
| `ventures/public/CNAME` | Custom domain file for the ventures page. | Axel, and only when a domain change is requested |
| `ventures/public/apple-touch-icon.png` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `ventures/public/favicon.ico` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `ventures/public/favicon.svg` | Paper and ink mark used as the icon. | Julian, when the mark changes |
| `ventures/src/main.js` | Ventures page wiring. | Julian, when ventures behaviour changes |
| `ventures/src/scene.js` | Gyroid field for the ventures page. | Julian, when the ventures field changes |
| `ventures/src/style.css` | Ventures layout. Uses the shared tokens. | Julian, when ventures layout changes |
| `ventures/vite.config.js` | Vite config for the ventures page. | Julian, when the ventures build changes |
| `vite.config.js` | Vite config for the presence site. | Julian, when the www build changes |

## Hard limits

- Secrets never go into git. No tokens, auth keys, `.env` files other than `.env.example`, `auth.json`, credential files, private keys, or session exports. Use a placeholder such as `<SECRET>`.
- This repository is public. Never add IP addresses, hostnames, MAC addresses, internal paths, usernames, email addresses, vault IDs, credentials, or pane IDs. The public contact already in the page source stays there. Do not copy it into other files.
- Prefer editing `index.html` for copy, `src/tokens.css` for colour, type, and space, `src/style.css` for layout, and `src/scene.js`, `src/forms.js`, and `src/ascii.js` for the presence field.
- Gallery works go in `gallery/public/works.json` and `gallery/public/media/`.
- The ventures page uses the gyroid field, not the presence-site chapter scroll.
- A garden note in git must have `published: true`.
- Slides demo copy stays placeholder text.
- Solid content stays on `.screen`. WebGL stays on `.stage[data-scene]`.
- Secrets are out of band: Proton Pass or `pass-cli`.
- Do not commit `node_modules/` or any `dist*` tree or `slides/exports/`.
- Do not rewrite history or force-push unless Axel asks.
- Mark anything you have not verified as **unverified**.

## Commands

Node 22 matches CI.

```bash
npm ci
npm run dev                 # presence site, port 5173
npm run dev:gallery         # port 5174
npm run dev:ventures        # port 5175
npm run dev:garden          # port 5178
npm test
cd slides && npm ci && cd ..
npm run dev:slides          # port 5176
npm run dev:slides:variants # port 5177
npm run build
npm run preview
```

## Deploy

- Default branch: `main`.
- `.github/workflows/deploy.yml` publishes the presence site with Pages.
- Gallery source is `gallery/`. `.github/workflows/deploy-gallery.yml` publishes it with `GALLERY_DEPLOY_KEY`. A separate repository is only a redirect. Names are in `README.md`.
- `.github/workflows/deploy-ventures.yml` publishes `ventures/` with `VENTURES_DEPLOY_KEY`.
- `.github/workflows/deploy-garden.yml` publishes `garden/` with `GARDEN_DEPLOY_KEY` and `GARDEN_SITE_PASSWORD`. The public artifact is ciphertext.
- Slides have no workflow.
- DNS is recorded in `README.md`. Do not change it, and do not change mail records, unless asked.
- From 2026-11-12, changes reach `main` through a pull request. Pages still deploys from `main` via Actions.

## Workflow

- Work through tickets and pull requests when the agent-ops board exists. Until then, track the task in `TODO.md`.
- One ticket at a time. Write a holder line on the ticket before you start, so two agents do not take the same ticket.
- Push is PR only. Branch protection on main (set by Shepherd on GitHub): pull request required (0 approvals, administrators included), force-push and deletion blocked. Open a pull request against `main`. Axel or a lead merges. Do not push the default branch directly.
- After a meaningful change, update `README.md`, `docs/`, and `CHANGELOG.md`, and run `npm run build`, then open the pull request.
- Stage by explicit path. Do not use `git add -A` or `git add .`.
- No force-push. A history rewrite needs Axel's approval.
- If a permission question or a blocker cannot be resolved, stop and say so.

## Documentation, commit & push

Standing rule from Axel (2026-11-12), for every Grok bot and herdr agent working in this repo:

- Document every change in this project: README, `docs/`, and the changelog (`CHANGELOG.md` or `docs/changelog.md`), with date and what/why.
- Commit with a clear message, then push to the repo's existing remote, public or private, after the secret check.
- Before each commit, run a secret check: `git diff --cached --name-only` and `git diff --cached`. Never commit `.env*`, keys, tokens, `auth.json`, credentials, session exports, or `*.bak*` files. If one is staged, unstage it and add it to `.gitignore`.
- Public repos (`gh repo view --json visibility`): be extra strict. Before pushing, review the full diff being pushed (`git diff @{u}..HEAD`) for secrets, tokens, private IPs and hostnames the repo does not already contain, personal data, and session exports. If anything looks sensitive, do not push; report it to Axel.
- If the repo has no remote, commit locally and report that.
- Commit only your own change; do not sweep in someone else's uncommitted work.

## Secrets

Secrets live in Proton Pass, in `pass-cli`, in the local Grok env file outside this repository, or on Axel's secure secret cards. They do not live in this repository.

Before every commit, run:

```
git diff --cached --name-only
git diff --cached
scripts/check-secrets.sh --staged
```

The `pre-commit` hook runs `scripts/check-secrets.sh --staged` after `just setup`.

If a secret was committed: rotate it first, tell Axel, and do not rewrite history unless Axel approves the force-push.

## Handoff

Before you stop, write what you did, what is next, and the open questions.

In a private repository, update `HANDOFF.md` and keep it tracked.

In a public repository, `HANDOFF.md` is gitignored. Write the note in the agent-platform repository at `handoffs/<repo>.md`. Do not commit `HANDOFF.md` here.
