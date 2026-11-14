# Changelog

This file is published with a public repository.

It must never contain IP addresses, hostnames, MAC addresses, internal paths, usernames, email addresses, vault IDs, credentials, or pane IDs.

Detailed private notes may go into `CHANGELOG.private.md`. That file is gitignored in a public repository. Do not commit it.

Newest first. Dates are Europe/Berlin, `YYYY-MM-DD`.

Use one heading per change: `## YYYY-MM-DD — title`. Under it, keep only the subsections that have items. End with a Why line.

## 2026-11-14 — Patch npm lockfile advisories

### Security

- Updated the root npm lockfile so the available advisory fixes apply. Direct dependencies are unchanged. The site build and garden tests succeed on this lockfile.
- The slides lockfile is unchanged here. Some slides advisories already have open Dependabot pull requests. The rest need a major Slidev update, which is out of scope for this change.

**Why:** Apply the smallest lockfile-only fix for the open root advisories.

## 2026-11-14 — Documentation rule

### Changed

- AGENTS.md: the Documentation, commit & push section now says changes are documented in this repo's own files (not memory notes or chat), staged by explicit path, and that force-pushes need Axel.

**Why:** standing rule from Axel (2026-11-14) for every Grok Bot and Herdr agent.

## 2026-11-13 — Work tracking rule

### Changed

- AGENTS.md has a Work tracking section: open work goes on the owner's GitHub Project board, not into new TODO.md items.

**Why:** one board for all open work (Axel, 2026-11-13).

## 2026-11-12 — Public repo standard

### Added

- The repo-standard file set: `AGENTS.md` skeleton, `CLAUDE.md` symlink, `ROADMAP.md`, `TODO.md`, `BUGFIXES.md`, `SECURITY.md`, `justfile`, `just/website.just`, `.githooks/pre-commit`, `scripts/check-secrets.sh`, `scripts/lint.sh`, `scripts/docs-index.sh`, `scripts/repo-audit.sh`, `.gitleaks.toml`, `.github/workflows/gitleaks.yml`, and `.env.example` (names only).
- `docs/README.md` indexes the existing topic pages. No docs were moved.

### Changed

- `AGENTS.md` follows the skeleton and keeps the site rules. The Herdr agent line is Julian (Web) · personal websites.
- `README.md` follows the repo-standard layout and keeps the host map and the field architecture.
- `LICENSE` has two parts. Site content (text, images, slides) is CC BY-NC-SA 4.0. Site code (HTML, CSS, JS, build scripts) is PolyForm Noncommercial 1.0.0. Before this commit the package metadata said UNLICENSED and there was no `LICENSE` file.
- This changelog uses the public layout. Older notes below keep their dates and drop a pane ID.
- Garden docs and `garden/SECURITY.md` no longer name a local vault path. `garden/scripts/export-published.mjs` requires `GARDEN_VAULT` and prints only the note count.
- `package.json` points at `LICENSE`.

### Security

- Branch protection on main (set by Shepherd on GitHub): pull request required (0 approvals, administrators included), force-push and deletion blocked. From now on changes reach the default branch through a pull request.
- `pre-commit` runs `scripts/check-secrets.sh --staged` after `just setup`.
- GitHub Actions runs gitleaks on push and pull_request.

**Why:** This public repository needs an explicit license, a secret check, and a file map before further edits.

## 2026-11-12 — Name the agent

### Added

- A Role section in `AGENTS.md`.
- The Herdr agent line: Julian (Web) · personal websites.

**Why:** Name the agent that owns these sites.

## 2026-11-12 — Documentation, commit, and push

### Added

- The standing rule for documenting a change, secret-checking the staged diff, and pushing the existing remote only after that check.

**Why:** Agents were committing without a shared secret check.

## 2026-09-12 — Garden screening room

### Changed

- The garden landing is an abstract screening room: dark walls, a mirror floor, a hairline square, and a gyroid lattice as a sculpture in the opening. The camera moves from a far room into the square.
- Gallery and notes zoom into the square. Particles sit behind the cinema wall. The field does not follow the pointer. Hover washes the article frame.
- Wikilinks and nav links for a note slug navigate in JS, including when the fragment does not change.
- Callouts keep inline markdown instead of leaking slot tokens.

**Why:** The garden should read as a screening room, and a note link should always render its target.

## 2026-09-11 — Digital garden

### Added

- Password-gated garden of markdown notes with `published: true`. Wikilinks, backlinks, graph, search, outline, hover preview, callouts, embeds, and Dataview TABLE/LIST over published frontmatter.
- Tests for the publish pipeline, plus a Vite build and an encrypted-artifact scan.
- The public artifact is ciphertext. The passphrase is not in this repo. HTTPS is required.

**Why:** Publish selected notes without putting plaintext bodies on the public host.

## 2026-09-01 — Gallery motion modal

### Changed

- The gallery does not probe WebXR and does not show the immersive-website motion modal.
- Gyro is requested on the first tap where the browser allows it. Otherwise look is the stick and drag.

**Why:** Some mobile browsers cannot accept that modal, so the room never started.

## 2026-08-27 — Slides, quieter fields, gallery walk

### Added

- Slides spike using the shared tokens. Layouts from cover through end, field and chart components, and a local poster. Demo copy is placeholder text. Not deployed.
- Design notes and the portable token files.
- A local script for social banners. The rendered images stay gitignored.
- Gallery walk stick on touch screens. Gyro still looks.
- Gallery doorways overlap so a walk can leave the lobby.
- Nearby gallery loops play after a gesture. On iOS the hanging animates from a filmstrip, because video cannot be a texture there.

### Changed

- Presence fields, the ventures field, and the slides cover field are quieter so type still reads.
- Gallery walk is about 2.5 m/s. Fullscreen is desktop-only.
- Gallery soundtrack loops from a trimmed, crossfaded file.
- NFT and Other pin a stills strip over the room. All is the 3D room.

**Why:** The fields were competing with the type, and the gallery had to be walkable on a phone.

## 2026-08-24 — Ventures thesis

### Changed

- The ventures page is a business angel for solopreneurs who build and scale with AI agents.
- The mast title is AQ Ventures. The decorative index and the personal name are gone.

**Why:** The page is the cheque, not a second presence site.

## 2026-08-21 — Ventures page

### Added

- Ventures app. Same tokens as the presence site, with a gyroid field instead of the chapter scroll.

**Why:** Give the angel work its own page.

## 2026-08-20 — Art gallery

### Added

- Art gallery app. Point-field stills and live rotating frames.
- Shared paper and ink mark as the favicon on the presence site and the gallery.

### Changed

- Contact-stage links sit above the canvas so they can be clicked.

**Why:** The work needed a room, and the contact links were under the field.

## 2026-08-18 — Presence site

### Added

- Static presence site with five scroll sections.
- Density-grid letterform, auto-rotating helicoid, and torus knot.
- Editorial type and a hairline skills list.
- Pages deploy for the presence site.

### Changed

- The presence site is public. An earlier client-side password gate on that site was removed.

### Removed

- The client-side password gate and its markup.
- External design-reference mentions from docs and source comments.

**Why:** Publish a restrained presence site with the field behind the type.
