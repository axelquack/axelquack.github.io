/**
 * 6×8 filmstrips (48 frames, 640×400): one full turn, 24 fps in the room.
 */
import { deflateSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCliffordBand,
  buildGyroid,
  buildHelicoid,
  buildHopf,
  buildLorenz,
  buildMobius,
  buildParticleField,
  buildTorusKnot,
} from "../../src/forms.js";

const root = dirname(fileURLToPath(import.meta.url));
const media = join(root, "../public/media");
const COLS = 6;
const ROWS = 8;
const FRAMES = COLS * ROWS;
const FW = 640;
const FH = 400;
const SW = FW * COLS;
const SH = FH * ROWS;
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
    chunk("IDAT", deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function project(x, y, z, yaw, pitch, dist = 6.2) {
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
  return { u: x1 * f, v: y1 * f };
}

function renderFrame(field, yaw, pitch, rgb, ox, oy) {
  const acc = new Float32Array(FW * FH);
  const { positions, densities, count } = field;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const p = project(positions[i3], positions[i3 + 1], positions[i3 + 2], yaw, pitch);
    const x = FW * 0.5 + p.u * (FH * 0.34);
    const y = FH * 0.5 - p.v * (FH * 0.34);
    const dens = densities[i];
    const r = 0.7 + dens * 1.35;
    const a = 0.04 + dens * 0.09;
    const x0 = Math.max(0, Math.floor(x - r));
    const x1 = Math.min(FW - 1, Math.ceil(x + r));
    const y0 = Math.max(0, Math.floor(y - r));
    const y1 = Math.min(FH - 1, Math.ceil(y + r));
    const r2 = r * r;
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = px + 0.5 - x;
        const dy = py + 0.5 - y;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const idx = py * FW + px;
        acc[idx] = Math.min(1, acc[idx] + a * (1 - d2 / r2));
      }
    }
  }
  for (let py = 0; py < FH; py++) {
    for (let px = 0; px < FW; px++) {
      const t = acc[py * FW + px];
      const g = 1 - t;
      const dx = ((oy + py) * SW + (ox + px)) * 3;
      rgb[dx] = Math.round(PAPER[0] * g + INK[0] * t);
      rgb[dx + 1] = Math.round(PAPER[1] * g + INK[1] * t);
      rgb[dx + 2] = Math.round(PAPER[2] * g + INK[2] * t);
    }
  }
}

const BUILD = {
  helicoid: () => buildHelicoid(22000),
  knot32: () => buildTorusKnot(20000, 3, 2),
  knot43: () => buildTorusKnot(20000, 4, 3),
  mass: () => buildParticleField(22000),
  clifford: () => buildCliffordBand(18000),
  gyroid: () => buildGyroid(18000),
  mobius: () => buildMobius(16000),
  hopf: () => buildHopf(18000),
  lorenz: () => buildLorenz(20000),
};

const catalogPath = join(root, "../public/works.json");
const data = JSON.parse(readFileSync(catalogPath, "utf8"));

for (const work of data.works) {
  if (!work.live || !work.field || !BUILD[work.field]) continue;
  const field = BUILD[work.field]();
  const sheet = Buffer.alloc(SW * SH * 3, 247);
  const pitch = work.pitch || 0.32;
  const yaw0 = work.yaw || 0.4;
  for (let f = 0; f < FRAMES; f++) {
    const col = f % COLS;
    const row = Math.floor(f / COLS);
    const yaw = yaw0 + (f / FRAMES) * Math.PI * 2;
    renderFrame(field, yaw, pitch, sheet, col * FW, row * FH);
    process.stdout.write(`  ${work.id} ${f + 1}/${FRAMES}\r`);
  }
  const file = `${work.id}-loop.png`;
  writeFileSync(join(media, file), encodePNG(SW, SH, sheet));
  work.loop = `/media/${file}`;
  work.cols = COLS;
  work.rows = ROWS;
  work.fps = 4;
  process.stdout.write(`wrote ${file}                    \n`);
}

writeFileSync(catalogPath, JSON.stringify(data, null, 2) + "\n");
process.stdout.write("done\n");
