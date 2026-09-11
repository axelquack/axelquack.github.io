# Security — garden.axelquack.de

Threat model for the password-gated garden. This presence repo is **public**; treat `garden/notes/` as publishable demo/source notes, not the private Obsidian vault.

## Threat model

| Surface | Intent |
|---------|--------|
| This git repo (`axelquack/axelquack.github.io`, `garden/`) | App source + fixture/demo markdown. No unpublished vault notes. |
| Public Pages repo (`axelquack/garden`) | Encrypted HTML only — no plaintext note bodies in HTML/JS/JSON |
| GitHub Pages | Static host; no HTTP basic auth |
| StatiCrypt password prompt | AES-256 in-browser gate |
| INWX DNS | CNAME `garden` → `axelquack.github.io` |

## Secrets

| Item | Where it lives | Commit? |
|------|----------------|---------|
| Site password | GitHub Actions secret `GARDEN_SITE_PASSWORD`; Proton Pass | **Never** in this repo or in `axelquack/garden` |
| Deploy key for `axelquack/garden` | GitHub secret `GARDEN_DEPLOY_KEY` | **Never** |
| Obsidian vault | `~/Obsidian/AQCapital` (Sync) | **Never** unpublished notes |
| INWX / GitHub credentials | Proton Pass / `gh` | **Never** |

## What password protection actually does

GitHub Pages cannot do HTTP Basic Auth. The deploy workflow inlines the Vite build into one HTML file and encrypts it with StatiCrypt (AES-256). Without the passphrase the public file is ciphertext. Favicons, `CNAME`, and `robots.txt` are the only other public files; they contain no note bodies.

Limits (this is a gate, not a vault):

- A short shared passphrase is dictionary-attackable if someone downloads the HTML.
- `remember` is 14 days in `localStorage` on that browser.
- Demo notes in `garden/notes/` are also in this **public** source repo. Real private notes should be exported locally (`export-published.mjs`) and not committed, or the source of those notes kept out of git.

## Repo rules for agents

1. Never push unencrypted `dist-garden/` (note bodies in JS) to `axelquack/garden`.
2. Do not log `GARDEN_SITE_PASSWORD` in CI.
3. `robots.txt` is `Disallow: /`; keep `noindex` on the password page and the app.
4. Canonical publish field is `published:` (boolean). Do not ingest the whole AQCapital vault.
5. After threat-model changes, update this file and `CHANGELOG.md`.
