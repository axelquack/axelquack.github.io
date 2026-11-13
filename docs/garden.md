# Garden — garden.axelquack.de

Password-gated digital garden of markdown notes with `published: true`. Same paper / ink tokens as [www.axelquack.de](https://www.axelquack.de). Hosted on GitHub Pages; the public artifact is StatiCrypt ciphertext (the wedding-site pattern), not plaintext HTML/JS.

Obsidian Publish’s reading chrome is here — navigation, search, backlinks, outline, hover preview, graph — plus Dataview `TABLE` / `LIST` over **published** frontmatter, callouts, and embeds. Sliding panes, theme toggle, and SEO/sitemaps are out of scope.

**Hosts**

| Host | Role |
|------|------|
| [garden.axelquack.de](https://garden.axelquack.de) | Canonical. GitHub Pages custom domain on `axelquack/garden` (ciphertext). |
| Source | `garden/` in this repo. Notes stay markdown. |

## What you see

- **Landing** — empty hash is an **abstract screening room**: dark walls, mirror floor, a hairline square of gyroid particles as a **sculpture sticking out of the opening**. Camera starts further back and dollies into that square. Title sits beside it. Click or Enter to `#/gallery`.
- **Gallery** — `#/gallery` zooms into the square (hairline gone; moving particles as backdrop). Cinema wall of published notes as **typographic stills**. Hover highlights the whole frame. The field does not follow the pointer.
- **Notes** — `#/slug` stays inside the particle field (inverse type, outline/backlinks as credits). Escape returns to the gallery. `#/` is the landing.
- **Search** — titles and bodies of published notes. `/` focuses the field.
- **Outline** — headings on the current note.
- **Backlinks** — published notes that wikilink here.
- **Graph** — **Graph** in the mast opens published notes as nodes and wikilinks as edges; size follows degree.
- **Hover preview** — title + lede of a linked published note.
- **Markdown** — toggle the original note body (still markdown).
- **Callouts** — `> [!note]`, `summary`, `tip`, `warning`, `todo` (and the usual aliases).
- **Embeds** — `![[note]]` transcludes a published note; `![[image]]` inlines the file.
- **Dataview** — `TABLE` / `LIST` with `FROM` / `WHERE` against published `title`, `type`, `tags`, `status`, `date`, `description`.

Unpublished notes (`published: false` or no flag) are not pages, not search hits, not graph nodes. Wikilinks to them do not leak their bodies.

## Authoring

Canonical field is **`published:`** (not `publish:`). URL slug comes from `slug:` when present, otherwise the filename.

```yaml
---
title: Example
slug: example
type: note
tags:
  - garden
status: active
date: "2026-09-11"
description: "A published note."
published: true
---
```

In-repo notes live in `garden/notes/` (what CI publishes). To copy published notes from a local vault, set `GARDEN_VAULT` to that directory and run `node garden/scripts/export-published.mjs`. The variable is required. The script copies only notes with `published: true`. Never commit unpublished notes, and do not write the local vault path into this repo.

## Local

```bash
npm ci
npm test                 # node:test (fixtures + build/encrypt)
npm run dev:garden       # http://localhost:5178
npm run build:garden     # → dist-garden/ (plaintext, local preview)
npm run preview:garden   # http://localhost:4178
npm run encrypt:garden   # → dist-garden-public/ (password-gated)
```

`GARDEN_VAULT` is the local vault for that export. It has no default path in the script.

Local encrypt uses `GARDEN_SITE_PASSWORD` or `SITE_PASSWORD`. The production passphrase is **not** in this public repo — GitHub secret `GARDEN_SITE_PASSWORD` and Proton Pass.

## Deploy

- Workflow: `.github/workflows/deploy-garden.yml` tests, encrypts, then publishes `dist-garden-public/` to `axelquack/garden` (`gh-pages`) with a pinned action and `GARDEN_DEPLOY_KEY`. The branch is replaced by one new commit.
- Secret `GARDEN_DEPLOY_KEY` (write deploy key on `axelquack/garden`)
- Secret `GARDEN_SITE_PASSWORD`
- DNS: `garden` is a CNAME to the GitHub Pages host for this project.
- GitHub Pages **Enforce HTTPS** is on. StatiCrypt needs a secure context (`https://` or localhost) for `crypto.subtle`. HTTP redirects to HTTPS.

## Design

Imports [`src/tokens.css`](../src/tokens.css). This host is the screening-room exception in [docs/design.md](design.md) (garden only): inverse tokens, hairline gyroid sculpture, cinema-wall gallery. Paper `#f7f7f7` / ink `#0a0a0a` still bind; the password gate is paper. No brand-colour accent, no pills/shadows.

`robots.txt` is `Disallow: /`; `noindex` on the gate and the app.
