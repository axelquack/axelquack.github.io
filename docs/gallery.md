# Art Gallery — gallery.axelquack.de

WebXR museum of NFT and other work (A-Frame). Same paper / graphite system as [www.axelquack.de](https://www.axelquack.de). Floor plan after oncyber showcase spaces (lobby → nave → side galleries → rear). Open doorways, graphite frames, no social chrome.

**Hosts**

| Host | Role |
|------|------|
| [gallery.axelquack.de](https://gallery.axelquack.de) | Canonical. GitHub Pages custom domain on `axelquack/gallery`. |
| [art.axelquack.de](https://art.axelquack.de) | Alias. CNAME → GitHub Pages repo `axelquack/art` (static redirect to the canonical host). |
| [www.axelquack.de](https://www.axelquack.de) | Presence site (this repo’s Pages). Links to the gallery as **Art Gallery**. |

```
          [ rear hall ]
              ║
   [west] ══ nave ══ [east]
              ║
           [lobby]  ← spawn
```

## What you see

- **Title** — “Art Gallery”. Kicker: NFT · other work. Link back to axelquack.de.
- **All** — walk the 3D room. Click to look (pointer lock). **WASD** to walk. Collision is AABB rooms + doorways.
- **NFT** / **Other** — a transparent ~40% strip on the left, stills at native 8∶5 (1400×875), scrollable, over the live room. The rest of the view stays the museum. **Escape** or **All** clears the strip.
- **NFT** is empty until works in `works.json` have `"kind": "nft"`. Everything generated so far is `"kind": "other"`.
- Hover / click a hanging in the room for a caption (title, year, medium). Optional outbound `link`.
- **Audio** — looping bed *Monotonie 001*. Minimal play icon swaps to pause. First click anywhere also starts it. Volume 0.55.
- **Fullscreen** — hairline expand / collapse icon. A-Frame’s default VR box is hidden (`xr-mode-ui` off).

No voice, users list, broadcast, or screenshot UI.

## Local

From the **presence** repo (`axelquack.github.io`):

```bash
npm ci
npm run dev:gallery    # http://localhost:5174
npm run build:gallery  # → dist-gallery/ (gitignored)
npm run preview:gallery
```

The gallery Vite app lives in `gallery/`. It imports `src/tokens.css` and `src/forms.js` from the parent site (`server.fs.allow`).

## Catalog (`works.json`)

`gallery/public/works.json` is the source of truth. Each work:

```json
{
  "id": "still-01",
  "title": "Still 01",
  "year": "2021",
  "kind": "nft",
  "medium": "Still · Ethereum",
  "image": "/media/still-01.jpg",
  "link": "https://opensea.io/assets/ethereum/…",
  "linkLabel": "OpenSea"
}
```

| Field | |
|-------|--|
| `id` | URL hash (`#still-01`) |
| `kind` | `nft` or `other` (3D hang + 2D strip filter) |
| `image` | Still, `gallery/public/media/` |
| `link` | Optional. Shown on the room caption and 2D strip |
| `live` | If true, the hanging uses a looping MP4 (`video`) while you walk |
| `video` | `/media/<id>.mp4` — 24 fps, 12 s, 1280×800 (`npm run gallery:videos`) |
| `loop` | Leftover filmstrip PNG from an earlier pipeline; videos are preferred |

Do not invent NFT titles. Real NFT stills go in `media/` with `kind: "nft"`.

### Generated mathematical stills

Same point fields as the presence site (helicoid, torus knots, gyroid, Möbius, Hopf, Lorenz, Lissajous, Clifford, crumpled mass):

```bash
npm run gallery:stills    # PNG 1400×875
npm run gallery:videos    # 24 fps / 12 s / 1280×800 for live: true works
npm run gallery:loops     # optional filmstrip PNGs (legacy)
```

Scripts: `gallery/scripts/render-math-art.mjs`, `render-videos.mjs`, `render-loops.mjs`.

Reduced motion: live hangings fall back to the still PNG.

## Soundtrack

| | |
|--|--|
| Source | Desktop `Sound-Monotonie001.aif` (PCM 48 kHz stereo) |
| Shipped | `gallery/public/audio/soundtrack.wav` |
| Title | `gallery/public/soundtrack.json` → **Monotonie 001** |

HTML `audio.loop` on the first MP4/MP3 encode clicked: encoder delay plus **~150 ms of trailing silence** in the AIF. The WAV is trimmed to the last audible sample and given an **80 ms equal-power crossfade** so the join is continuous. Playback is **Web Audio** (`AudioBufferSourceNode.loop`), not `HTMLMediaElement.loop`.

To rebuild from the AIF: trim trailing silence (`silencedetect` ~−50 dB), crossfade 80 ms of tail onto the head, write PCM WAV, point `soundtrack.json` `src` at it.

## Layout / HUD

| Layer | |
|-------|--|
| A-Frame scene | Full viewport, paper fog, WASD + look-controls |
| `#catalog` | `z-index: 12`, ~40vw left strip, transparent, overflow scroll |
| HUD | `z-index: 20` — title, filters, caption, hint, audio, fullscreen |

Filters sit under the title while the strip is open; on **All** they return to the bottom-left with the walk hint.

## Deploy

GitHub Pages is **one custom domain per repo**. `axelquack.github.io` is already `www.axelquack.de`, so the gallery is a **second** public repo:

| Repo | Pages | Domain |
|------|--------|--------|
| `axelquack/axelquack.github.io` | workflow `deploy.yml` | `www.axelquack.de` |
| `axelquack/gallery` | `gh-pages` (built `dist-gallery/`) | `gallery.axelquack.de` |
| `axelquack/art` | `main` (static HTML redirect) | `art.axelquack.de` |

Source of the gallery stays in this repo (`gallery/`). Push to `main` runs [`.github/workflows/deploy-gallery.yml`](../.github/workflows/deploy-gallery.yml): `npm run build:gallery`, then force-pushes `dist-gallery/` to `axelquack/gallery` `gh-pages` using deploy key secret `GALLERY_DEPLOY_KEY`.

`gallery/public/CNAME` contains `gallery.axelquack.de` (copied into the Pages artifact).

### DNS (INWX)

Do **not** touch MX / TXT / iCloud / apex A-AAAA for mail.

| Host | Type | Value |
|------|------|--------|
| `www` | CNAME | `axelquack.github.io` (existing) |
| `gallery` | CNAME | `axelquack.github.io` |
| `art` | CNAME | `axelquack.github.io` |

`gallery` / `art` must **not** stay on the `*.axelquack.de` wildcard A (INWX webhosting). Each hostname needs its own CNAME so GitHub can issue a cert. GitHub Pages allows **one** custom domain per repo, so `art` is a tiny redirect site (`axelquack/art`) rather than a second domain on the museum repo. (INWX `URL` records against this zone returned 500 from their redirect farm.)

Until DNS + cert succeed, the room only runs at `http://localhost:5174`.

## File map

```
gallery/
  index.html              HUD + catalog mount
  vite.config.js          port 5174, outDir dist-gallery/, fs.allow parent
  src/main.js             filters, catalog, Web Audio, fullscreen
  src/scene.js            rooms, slots, hangings, WASD containment
  src/live-field.js       VideoTexture for live works
  src/style.css           tokens import, HUD, catalog strip
  public/CNAME
  public/works.json
  public/soundtrack.json
  public/audio/soundtrack.wav
  public/media/           stills + mp4
  scripts/                still / video / loop generators
docs/gallery.md           this file
.github/workflows/deploy-gallery.yml
```

## Related

- Tokens / type: [`docs/design.md`](design.md), [`src/tokens.css`](../src/tokens.css)
- Presence site README: [`README.md`](../README.md)
