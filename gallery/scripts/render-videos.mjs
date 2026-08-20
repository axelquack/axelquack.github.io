/**
 * 24 fps, 12 s (same pace as 48 frames @ 4 fps) — high-res 2D video loops.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
const FPS = 24;
const SECONDS = 12;
const FRAMES = FPS * SECONDS;
const W = 1280;
const H = 800;
const PAPER = [247, 247, 247];
const INK = [10, 10, 10];

const BUILD = {
  helicoid: () => buildHelicoid(18000),
  knot32: () => buildTorusKnot(16000, 3, 2),
  knot43: () => buildTorusKnot(16000, 4, 3),
  mass: () => buildParticleField(18000),
  clifford: () => buildCliffordBand(15000),
  gyroid: () => buildGyroid(15000),
  mobius: () => buildMobius(14000),
  hopf: () => buildHopf(15000),
  lorenz: () => buildLorenz(16000),
};

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

function renderFrame(field, yaw, pitch, rgb) {
  rgb.fill(247);
  const acc = new Float32Array(W * H);
  const { positions, densities, count } = field;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const p = project(positions[i3], positions[i3 + 1], positions[i3 + 2], yaw, pitch);
    const x = (W * 0.5 + p.u * (H * 0.34)) | 0;
    const y = (H * 0.5 - p.v * (H * 0.34)) | 0;
    if (x < 1 || x >= W - 1 || y < 1 || y >= H - 1) continue;
    const a = 0.08 + densities[i] * 0.16;
    const idx = y * W + x;
    acc[idx] = Math.min(1, acc[idx] + a);
    acc[idx - 1] = Math.min(1, acc[idx - 1] + a * 0.45);
    acc[idx + 1] = Math.min(1, acc[idx + 1] + a * 0.45);
    acc[idx - W] = Math.min(1, acc[idx - W] + a * 0.45);
    acc[idx + W] = Math.min(1, acc[idx + W] + a * 0.45);
  }
  for (let i = 0; i < W * H; i++) {
    const t = acc[i];
    if (t < 0.002) continue;
    const g = 1 - t;
    const o = i * 3;
    rgb[o] = (PAPER[0] * g + INK[0] * t) | 0;
    rgb[o + 1] = (PAPER[1] * g + INK[1] * t) | 0;
    rgb[o + 2] = (PAPER[2] * g + INK[2] * t) | 0;
  }
}

function encodeVideo(dest, onFrame) {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      "ffmpeg",
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        `${W}x${H}`,
        "-r",
        String(FPS),
        "-i",
        "pipe:0",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        dest,
      ],
      { stdio: ["pipe", "inherit", "inherit"] }
    );
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg ${code}`));
    });
    const rgb = Buffer.alloc(W * H * 3);
    (async () => {
      try {
        for (let f = 0; f < FRAMES; f++) {
          onFrame(f, rgb);
          if (!ff.stdin.write(rgb)) {
            await new Promise((res) => ff.stdin.once("drain", res));
          }
        }
        ff.stdin.end();
      } catch (err) {
        ff.kill();
        reject(err);
      }
    })();
  });
}

mkdirSync(media, { recursive: true });
const catalogPath = join(root, "../public/works.json");
const data = JSON.parse(readFileSync(catalogPath, "utf8"));

for (const work of data.works) {
  if (!work.live || !work.field || !BUILD[work.field]) continue;
  const field = BUILD[work.field]();
  const file = `${work.id}.mp4`;
  const dest = join(media, file);
  const yaw0 = work.yaw || 0.4;
  const pitch = work.pitch || 0.32;
  process.stdout.write(`${work.id}…\n`);
  await encodeVideo(dest, (f, rgb) => {
    const yaw = yaw0 + (f / FRAMES) * Math.PI * 2;
    renderFrame(field, yaw, pitch, rgb);
    if (f % 24 === 0) process.stdout.write(`  ${work.id} ${f}/${FRAMES}\n`);
  });
  work.video = `/media/${file}`;
  work.fps = 24;
  process.stdout.write(`wrote ${file}\n`);
}

writeFileSync(catalogPath, JSON.stringify(data, null, 2) + "\n");
process.stdout.write("done\n");
