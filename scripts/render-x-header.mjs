/**
 * X / Twitter header: 4500×1500 (3× the 1500×500 spec) so it stays sharp
 * when X downsamples. Paper + graphite, same fields as www.axelquack.de.
 * Composition sits right of the avatar overlay (lower-left).
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTorusKnot, buildHelicoid } from "../src/forms.js";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "../docs");
const sizes = {
  x: { w: 4500, h: 1500, prefix: "x-header", cx: 0.58, cy: 0.46, mag: 0.52, ss: 2 },
  facebook: { w: 3280, h: 1248, prefix: "facebook-cover", cx: 0.58, cy: 0.46, mag: 0.52, ss: 2 },
  // Official YouTube channel art: 2560×1440, ≥2048×1152, ≤6MB.
  youtube: { w: 2560, h: 1440, prefix: "youtube-banner", cx: 0.52, cy: 0.5, mag: (423 / 1440) * 0.88, ss: 3 },
};
const target = sizes[process.argv[2]] ? process.argv[2] : "x";
const { w: W, h: H, prefix, cx: cxN, cy: cyN, mag: magN, ss: SS } = sizes[target];
const PAPER = [247, 247, 247];
const INK = [10, 10, 10];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    rgb.copy(raw, row + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function project(x, y, z, yaw, pitch, dist = 6.6) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y1 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const zc = z2 + dist;
  const f = 2.35 / Math.max(0.35, zc);
  return { u: x1 * f, v: y1 * f, zc };
}

function splatGauss(acc, rw, rh, x, y, sigma, a) {
  const r = sigma * 2.6;
  const x0 = Math.max(0, Math.floor(x - r));
  const x1 = Math.min(rw - 1, Math.ceil(x + r));
  const y0 = Math.max(0, Math.floor(y - r));
  const y1 = Math.min(rh - 1, Math.ceil(y + r));
  const inv = 1 / (2 * sigma * sigma);
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const dx = px + 0.5 - x;
      const dy = py + 0.5 - y;
      const d2 = dx * dx + dy * dy;
      acc[py * rw + px] += a * Math.exp(-d2 * inv);
    }
  }
}

function renderField(field, { yaw, pitch, scale, cx, cy, mag }) {
  const rw = W * SS;
  const rh = H * SS;
  const acc = new Float32Array(rw * rh);
  const { positions, densities, count } = field;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const p = project(
      positions[i3] * scale,
      positions[i3 + 1] * scale,
      positions[i3 + 2] * scale,
      yaw,
      pitch
    );
    const x = (cx + p.u * mag) * SS;
    const y = (cy - p.v * mag) * SS;
    const dens = densities[i];
    const sigma = (0.42 + dens * 0.28) * SS;
    const a = 0.09 + dens * 0.07;
    splatGauss(acc, rw, rh, x, y, sigma, a);
  }
  const rgb = Buffer.alloc(W * H * 3);
  const samples = SS * SS;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let oy = 0; oy < SS; oy++) {
        for (let ox = 0; ox < SS; ox++) {
          sum += acc[(y * SS + oy) * rw + (x * SS + ox)];
        }
      }
      const t = 1 - Math.exp((-1.65 * sum) / samples);
      const g = 1 - t;
      const i = (y * W + x) * 3;
      rgb[i] = Math.round(PAPER[0] * g + INK[0] * t);
      rgb[i + 1] = Math.round(PAPER[1] * g + INK[1] * t);
      rgb[i + 2] = Math.round(PAPER[2] * g + INK[2] * t);
    }
  }
  return encodePNG(W, H, rgb);
}

mkdirSync(outDir, { recursive: true });

const knot = renderField(buildTorusKnot(420000, 3, 2), {
  yaw: 0.72,
  pitch: 0.38,
  scale: 1.05,
  cx: W * cxN,
  cy: H * cyN,
  mag: H * magN,
});
writeFileSync(join(outDir, `${prefix}-knot.png`), knot);

const heli = renderField(buildHelicoid(480000), {
  yaw: 0.55,
  pitch: 0.32,
  scale: 1.15,
  cx: W * cxN,
  cy: H * cyN,
  mag: H * magN,
});
writeFileSync(join(outDir, `${prefix}-helicoid.png`), heli);

console.log(`wrote docs/${prefix}-knot.png and docs/${prefix}-helicoid.png (${W}×${H}, paper)`);
