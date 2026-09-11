# Garden — garden.axelquack.de

Password-gated digital garden of markdown notes with `published: true`. Same paper / ink tokens as [www.axelquack.de](https://www.axelquack.de). Hosted on GitHub Pages; the public artifact is StatiCrypt ciphertext (the wedding-site pattern), not plaintext HTML/JS.

Obsidian Publish’s reading chrome is here — navigation, search, backlinks, outline, hover preview, graph — plus Dataview `TABLE` / `LIST` over **published** frontmatter, callouts, and embeds. Sliding panes, theme toggle, and SEO/sitemaps are out of scope.

**Hosts**

| Host | Role |
|------|------|
| [garden.axelquack.de](https://garden.axelquack.de) | Canonical. GitHub Pages custom domain on `axelquack/garden` (ciphertext). |
| Source | `garden/` in this repo. Notes stay markdown. |

## What you see

- **Notes** — left nav of published titles (hairline list). Hash routes `#/slug`.
- **Search** — titles and bodies of published notes. `/` focuses the field.
- **Outline** — headings on the current note.
- **Backlinks** — published notes that wikilink here.
- **Graph** — nodes = published notes, edges = wikilinks; size follows degree. Local graph in the aside; **Graph** in the mast for the full set.
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

In-repo notes live in `garden/notes/` (the live vault for CI). Optional export from the Obsidian vault:

```bash
GARDEN_VAULT="$HOME/Obsidian/AQCapital" node garden/scripts/export-published.mjs
```

That copies **only** `published: true` files. Never commit unpublished vault notes.

## Local

```bash
npm ci
npm test                 # node:test (fixtures + build/encrypt)
npm run dev:garden       # http://localhost:5178
npm run build:garden     # → dist-garden/ (plaintext, local preview)
npm run preview:garden   # http://localhost:4178
npm run encrypt:garden   # → dist-garden-public/ (password-gated)
```

`GARDEN_VAULT` overrides the notes directory (default `garden/notes`).

Local encrypt uses `GARDEN_SITE_PASSWORD` or `SITE_PASSWORD`. The production passphrase is **not** in this public repo — GitHub secret `GARDEN_SITE_PASSWORD` and Proton Pass.

## Deploy

- Workflow: `.github/workflows/deploy-garden.yml` → encrypt → `axelquack/garden` (`gh-pages`)
- Secret `GARDEN_DEPLOY_KEY` (write deploy key on `axelquack/garden`)
- Secret `GARDEN_SITE_PASSWORD`
- DNS: INWX CNAME `garden` → `axelquack.github.io` (see `inwx` Terraform). More specific than the VPS wildcard `*`.
- GitHub’s custom-domain certificate can lag the first CNAME by several minutes. StatiCrypt needs a secure context (`https://` or localhost) for `crypto.subtle`; until GitHub issues the cert, the HTTP gate page loads but will not decrypt. Then: Pages → Enforce HTTPS.

## Design

Imports [`src/tokens.css`](../src/tokens.css). Paper `#f7f7f7`, ink `#0a0a0a`, muted `#8a8a8a`, Instrument Serif + Inter + IBM Plex Mono, 720px stack. No brand-colour accent, no cards/pills/shadows. Password prompt uses the same paper/ink.

`robots.txt` is `Disallow: /`; `noindex` on the gate and the app.
