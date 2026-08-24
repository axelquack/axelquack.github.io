# Ventures — axelquack.ventures

Personal **business angel** page. Same paper / graphite system as [www.axelquack.de](https://www.axelquack.de), different layout: type sits in a live **gyroid** field (not the AQ lattice, not the five-chapter scroll). Pre-seed cheques into solopreneurs who build and scale with AI agents — globally.

| | |
|--|--|
| Live | [axelquack.ventures](https://axelquack.ventures) |
| Source | `ventures/` in this repo |
| Publish | `axelquack/ventures` (`gh-pages`) |

Hats: **www** is the operator. **capturetheflag.today** is the log. **ventures** is the cheque. DeSoc / crypto thesis stays off this domain (quiet pointer only if added later). No invented portfolio.

## Local

```bash
npm run dev:ventures     # http://localhost:5175
npm run build:ventures   # → dist-ventures/ (gitignored)
```

## What is different from www

- One continuous canvas, always on; copy scrolls over it
- Gyroid point field + pointer tear (not letterform / helicoid / knot scenes)
- Vertical spine, italic mast (“AQ Ventures”), thesis column offset into the field
- No clock, skills chapter, or contact-stage inverse

Same tokens, type, hairlines, favicon.

## Deploy

GitHub Pages: one custom domain per repo. Apex **`axelquack.ventures`** is this site.

Push to `main` runs [`.github/workflows/deploy-ventures.yml`](../.github/workflows/deploy-ventures.yml) (`VENTURES_DEPLOY_KEY`).

### DNS (INWX) — do not touch MX / TXT

Apex cannot CNAME. GitHub Pages A / AAAA:

| Host | Type | Value |
|------|------|--------|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153` |
| `@` | AAAA | `2606:50c0:8001::153` |
| `@` | AAAA | `2606:50c0:8002::153` |
| `@` | AAAA | `2606:50c0:8003::153` |

`ventures/public/CNAME` is `axelquack.ventures`.
