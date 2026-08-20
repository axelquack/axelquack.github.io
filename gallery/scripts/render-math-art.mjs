/**
 * Still frames of the same point-field maths as the presence site.
 * Paper + graphite. Writes PNG + works.json.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildHelicoid,
  buildTorusKnot,
  buildParticleField,
  buildCliffordBand,
} from "../../src/forms.js";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "../public/media");
const W = 1400;
const H = 875;
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
  return { u: x1 * f, v: y1 * f, zc };
}

function splat(acc, x, y, r, a) {
  const x0 = Math.max(0, Math.floor(x - r));
  const x1 = Math.min(W - 1, Math.ceil(x + r));
  const y0 = Math.max(0, Math.floor(y - r));
  const y1 = Math.min(H - 1, Math.ceil(y + r));
  const r2 = r * r;
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const dx = px + 0.5 - x;
      const dy = py + 0.5 - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const w = a * (1 - d2 / r2);
      const i = py * W + px;
      acc[i] = Math.min(1, acc[i] + w);
    }
  }
}

function renderField(field, yaw, pitch, scale = 1) {
  const acc = new Float32Array(W * H);
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
    const x = W * 0.5 + p.u * (H * 0.34);
    const y = H * 0.5 - p.v * (H * 0.34);
    const dens = densities[i];
    const r = 0.7 + dens * 1.35;
    splat(acc, x, y, r, 0.045 + dens * 0.09);
  }
  const rgb = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const t = Math.min(1, acc[i]);
    const g = 1 - t;
    rgb[i * 3] = Math.round(PAPER[0] * g + INK[0] * t);
    rgb[i * 3 + 1] = Math.round(PAPER[1] * g + INK[1] * t);
    rgb[i * 3 + 2] = Math.round(PAPER[2] * g + INK[2] * t);
  }
  return encodePNG(W, H, rgb);
}

function gyroid(count = 16000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  let i = 0;
  let g = 0;
  while (i < count && g < count * 30) {
    g++;
    const x = (Math.random() * 2 - 1) * 2.2;
    const y = (Math.random() * 2 - 1) * 2.2;
    const z = (Math.random() * 2 - 1) * 2.2;
    const s =
      Math.sin(x * 1.6) * Math.cos(y * 1.6) +
      Math.sin(y * 1.6) * Math.cos(z * 1.6) +
      Math.sin(z * 1.6) * Math.cos(x * 1.6);
    if (Math.abs(s) > 0.18) continue;
    const i3 = i * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    densities[i] = 0.4 + 0.5 * (1 - Math.abs(s) / 0.18);
    i++;
  }
  return {
    positions: positions.subarray(0, i * 3),
    densities: densities.subarray(0, i),
    count: i,
  };
}

function mobius(count = 14000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = (Math.random() * 2 - 1) * 0.55;
    const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
    const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
    const z = v * Math.sin(u / 2);
    const i3 = i * 3;
    positions[i3] = x * 1.7;
    positions[i3 + 1] = y * 1.7;
    positions[i3 + 2] = z * 1.9;
    densities[i] = 0.35 + 0.5 * (1 - Math.abs(v) / 0.55);
  }
  return { positions, densities, count };
}

function hopf(count = 15000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const eta = Math.acos(2 * Math.random() - 1);
    const xi = Math.random() * Math.PI * 2;
    const zeta = Math.random() * Math.PI * 2;
    const a = Math.sin(eta) * Math.cos(xi);
    const b = Math.sin(eta) * Math.sin(xi);
    const c = Math.cos(eta) * Math.cos(zeta);
    const d = Math.cos(eta) * Math.sin(zeta);
    const den = 1 - d;
    const i3 = i * 3;
    positions[i3] = (a / den) * 1.15;
    positions[i3 + 1] = (b / den) * 1.15;
    positions[i3 + 2] = (c / den) * 1.15;
    densities[i] = 0.3 + 0.6 * Math.sin(eta);
  }
  return { positions, densities, count };
}

function lorenz(count = 18000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  let x = 0.1;
  let y = 0;
  let z = 0;
  const dt = 0.004;
  for (let i = 0; i < count; i++) {
    const dx = 10 * (y - x);
    const dy = x * (28 - z) - y;
    const dz = x * y - (8 / 3) * z;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    const i3 = i * 3;
    positions[i3] = x * 0.12;
    positions[i3 + 1] = (z - 25) * 0.1;
    positions[i3 + 2] = y * 0.12;
    densities[i] = 0.35 + 0.5 * (i / count);
  }
  return { positions, densities, count };
}

function lissajous(count = 12000, a = 3, b = 4) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2 * 6 + Math.random() * 0.04;
    const r = 0.08 * Math.random();
    const i3 = i * 3;
    positions[i3] = Math.sin(a * t) * 2.1 + r;
    positions[i3 + 1] = Math.sin(b * t + Math.PI / 4) * 1.6 + r;
    positions[i3 + 2] = Math.cos((a + b) * 0.5 * t) * 1.4;
    densities[i] = 0.45 + 0.4 * Math.random();
  }
  return { positions, densities, count };
}

const pieces = [
  {
    id: "helicoid-i",
    title: "Hyperbolic helicoid I",
    year: "2026",
    medium: "Point field · u,v ∈ helicoid",
    field: () => buildHelicoid(22000),
    yaw: 0.45,
    pitch: 0.35,
  },
  {
    id: "helicoid-ii",
    title: "Hyperbolic helicoid II",
    year: "2026",
    medium: "Point field · u,v ∈ helicoid",
    field: () => buildHelicoid(22000),
    yaw: 1.2,
    pitch: -0.15,
  },
  {
    id: "helicoid-iii",
    title: "Hyperbolic helicoid III",
    year: "2026",
    medium: "Point field · u,v ∈ helicoid",
    field: () => buildHelicoid(22000),
    yaw: -0.7,
    pitch: 0.55,
  },
  {
    id: "knot-32",
    title: "Torus knot (3,2)",
    year: "2026",
    medium: "Point field · T(3,2)",
    field: () => buildTorusKnot(20000, 3, 2),
    yaw: 0.6,
    pitch: 0.4,
  },
  {
    id: "knot-52",
    title: "Torus knot (5,2)",
    year: "2026",
    medium: "Point field · T(5,2)",
    field: () => buildTorusKnot(20000, 5, 2),
    yaw: 0.9,
    pitch: 0.25,
  },
  {
    id: "knot-43",
    title: "Torus knot (4,3)",
    year: "2026",
    medium: "Point field · T(4,3)",
    field: () => buildTorusKnot(20000, 4, 3),
    yaw: -0.4,
    pitch: 0.5,
  },
  {
    id: "mass-i",
    title: "Crumpled mass I",
    year: "2026",
    medium: "FBM volume · domain warp",
    field: () => buildParticleField(24000),
    yaw: 0.3,
    pitch: 0.2,
  },
  {
    id: "mass-ii",
    title: "Crumpled mass II",
    year: "2026",
    medium: "FBM volume · domain warp",
    field: () => buildParticleField(24000),
    yaw: 1.1,
    pitch: -0.25,
  },
  {
    id: "clifford-i",
    title: "Clifford band I",
    year: "2026",
    medium: "Stereographic Clifford torus",
    field: () => buildCliffordBand(18000),
    yaw: 0.2,
    pitch: 0.45,
  },
  {
    id: "clifford-ii",
    title: "Clifford band II",
    year: "2026",
    medium: "Stereographic Clifford torus",
    field: () => buildCliffordBand(18000),
    yaw: 1.4,
    pitch: 0.15,
  },
  {
    id: "gyroid-i",
    title: "Gyroid I",
    year: "2026",
    medium: "Level set · sin x cos y + …",
    field: () => gyroid(18000),
    yaw: 0.5,
    pitch: 0.3,
  },
  {
    id: "gyroid-ii",
    title: "Gyroid II",
    year: "2026",
    medium: "Level set · sin x cos y + …",
    field: () => gyroid(18000),
    yaw: -0.9,
    pitch: 0.5,
  },
  {
    id: "mobius",
    title: "Möbius",
    year: "2026",
    medium: "Ruled strip · u,v",
    field: () => mobius(16000),
    yaw: 0.7,
    pitch: 0.55,
  },
  {
    id: "hopf",
    title: "Hopf fibration",
    year: "2026",
    medium: "S³ → S² stereographic",
    field: () => hopf(18000),
    yaw: 0.4,
    pitch: 0.35,
  },
  {
    id: "lorenz",
    title: "Lorenz attractor",
    year: "2026",
    medium: "σ=10 ρ=28 β=8/3",
    field: () => lorenz(20000),
    yaw: 0.15,
    pitch: 0.2,
  },
  {
    id: "lissajous-34",
    title: "Lissajous (3,4)",
    year: "2026",
    medium: "Harmonic curve",
    field: () => lissajous(14000, 3, 4),
    yaw: 0.25,
    pitch: 0.1,
  },
  {
    id: "lissajous-25",
    title: "Lissajous (2,5)",
    year: "2026",
    medium: "Harmonic curve",
    field: () => lissajous(14000, 2, 5),
    yaw: 0.8,
    pitch: 0.4,
  },
  {
    id: "knot-72",
    title: "Torus knot (7,2)",
    year: "2026",
    medium: "Point field · T(7,2)",
    field: () => buildTorusKnot(20000, 7, 2),
    yaw: 0.5,
    pitch: 0.45,
  },
  {
    id: "helicoid-iv",
    title: "Hyperbolic helicoid IV",
    year: "2026",
    medium: "Point field · u,v ∈ helicoid",
    field: () => buildHelicoid(22000),
    yaw: 2.2,
    pitch: 0.1,
  },
  {
    id: "mass-iii",
    title: "Crumpled mass III",
    year: "2026",
    medium: "FBM volume · domain warp",
    field: () => buildParticleField(24000),
    yaw: -0.6,
    pitch: 0.4,
  },
  {
    id: "gyroid-iii",
    title: "Gyroid III",
    year: "2026",
    medium: "Level set · sin x cos y + …",
    field: () => gyroid(18000),
    yaw: 0.1,
    pitch: -0.4,
  },
  {
    id: "clifford-iii",
    title: "Clifford band III",
    year: "2026",
    medium: "Stereographic Clifford torus",
    field: () => buildCliffordBand(18000),
    yaw: -1.1,
    pitch: 0.6,
  },
  {
    id: "knot-32-b",
    title: "Torus knot (3,2) II",
    year: "2026",
    medium: "Point field · T(3,2)",
    field: () => buildTorusKnot(20000, 3, 2),
    yaw: 2.0,
    pitch: -0.2,
  },
  {
    id: "mobius-ii",
    title: "Möbius II",
    year: "2026",
    medium: "Ruled strip · u,v",
    field: () => mobius(16000),
    yaw: -0.5,
    pitch: 0.2,
  },
  {
    id: "hopf-ii",
    title: "Hopf fibration II",
    year: "2026",
    medium: "S³ → S² stereographic",
    field: () => hopf(18000),
    yaw: 1.3,
    pitch: 0.15,
  },
  {
    id: "lorenz-ii",
    title: "Lorenz attractor II",
    year: "2026",
    medium: "σ=10 ρ=28 β=8/3",
    field: () => lorenz(20000),
    yaw: 1.6,
    pitch: 0.5,
  },
  {
    id: "helicoid-v",
    title: "Hyperbolic helicoid V",
    year: "2026",
    medium: "Point field · u,v ∈ helicoid",
    field: () => buildHelicoid(22000),
    yaw: 3.0,
    pitch: -0.45,
  },
];

mkdirSync(outDir, { recursive: true });
const catalog = [];
for (const piece of pieces) {
  const png = renderField(piece.field(), piece.yaw, piece.pitch);
  const file = `${piece.id}.png`;
  writeFileSync(join(outDir, file), png);
  catalog.push({
    id: piece.id,
    title: piece.title,
    year: piece.year,
    kind: "other",
    medium: piece.medium,
    image: `/media/${file}`,
  });
  process.stdout.write(`wrote ${file}\n`);
}
writeFileSync(
  join(root, "../public/works.json"),
  JSON.stringify({ works: catalog }, null, 2) + "\n"
);
process.stdout.write(`catalog ${catalog.length} works\n`);
