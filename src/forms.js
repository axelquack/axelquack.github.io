/**
 * Parametric mathematical point fields (same density-grid spirit as the AQ letterform).
 */

/**
 * Hyperbolic helicoid — slow auto-rotate friendly.
 * @returns {{ positions: Float32Array, densities: Float32Array, count: number }}
 */
export function buildHelicoid(count = 18000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  const uMax = Math.PI * 2.6;
  let i = 0;
  let guard = 0;
  while (i < count && guard < count * 8) {
    guard++;
    const u = (Math.random() * 2 - 1) * uMax;
    const v = (Math.random() * 2 - 1) * 2.35;
    const denom = Math.cosh(v) + 0.28;
    const x = (Math.sinh(v) * Math.cos(u)) / denom;
    const y = (Math.sinh(v) * Math.sin(u)) / denom;
    const z = u * 0.32 + Math.sin(v * 1.2) * 0.06;
    const r = Math.hypot(x, y);
    if (r > 1.55 && Math.random() > 0.4) continue;
    // denser near the core
    const dens = Math.max(0.25, 1 - r * 0.45 + Math.random() * 0.15);
    const i3 = i * 3;
    positions[i3] = x * 2.15;
    positions[i3 + 1] = y * 2.15;
    positions[i3 + 2] = z * 1.25;
    densities[i] = dens;
    i++;
  }
  return {
    positions: positions.subarray(0, i * 3),
    densities: densities.subarray(0, i),
    count: i,
  };
}

/**
 * Torus knot (3, 2) — distinct from the helicoid.
 */
export function buildTorusKnot(count = 16000, p = 3, q = 2) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  const R = 1.15;
  const rTube = 0.38;

  for (let i = 0; i < count; i++) {
    // sample along the knot + tube cross-section
    const t = Math.random() * Math.PI * 2;
    const tube = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * rTube;

    const ct = Math.cos(t);
    const st = Math.sin(t);
    const cp = Math.cos(p * t);
    const sp = Math.sin(p * t);
    const cq = Math.cos(q * t);
    const sq = Math.sin(q * t);

    // centerline
    const cx = (R + cq) * ct;
    const cy = (R + cq) * st;
    const cz = sq * 0.85;

    // rough normal frame
    const nx = -st;
    const ny = ct;
    const nz = 0;
    const bx = -cq * ct * 0.3;
    const by = -cq * st * 0.3;
    const bz = cp;

    const i3 = i * 3;
    positions[i3] = (cx + rad * Math.cos(tube) * nx + rad * Math.sin(tube) * bx) * 1.55;
    positions[i3 + 1] =
      (cy + rad * Math.cos(tube) * ny + rad * Math.sin(tube) * by) * 1.55;
    positions[i3 + 2] =
      (cz + rad * Math.cos(tube) * nz + rad * Math.sin(tube) * bz) * 1.55;

    densities[i] = 0.4 + 0.6 * (1 - rad / rTube) * (0.7 + 0.3 * Math.random());
  }
  return { positions, densities, count };
}

/** Hash → [0,1) */
function hash3(x, y, z) {
  let n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Trilinear value noise */
function valueNoise(x, y, z) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fy = y - y0;
  const fz = z - z0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3(x0, y0, z0);
  const n100 = hash3(x0 + 1, y0, z0);
  const n010 = hash3(x0, y0 + 1, z0);
  const n110 = hash3(x0 + 1, y0 + 1, z0);
  const n001 = hash3(x0, y0, z0 + 1);
  const n101 = hash3(x0 + 1, y0, z0 + 1);
  const n011 = hash3(x0, y0 + 1, z0 + 1);
  const n111 = hash3(x0 + 1, y0 + 1, z0 + 1);

  const nx00 = n000 * (1 - ux) + n100 * ux;
  const nx10 = n010 * (1 - ux) + n110 * ux;
  const nx01 = n001 * (1 - ux) + n101 * ux;
  const nx11 = n011 * (1 - ux) + n111 * ux;
  const nxy0 = nx00 * (1 - uy) + nx10 * uy;
  const nxy1 = nx01 * (1 - uy) + nx11 * uy;
  return nxy0 * (1 - uz) + nxy1 * uz;
}

/** Fractal Brownian motion */
function fbm(x, y, z, octaves = 5) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

/**
 * Organic crumpled mass — FBM volume (dense core, wispy irregular edges).
 * Matches the amorphous particle structure from the reference, not a sphere shell.
 */
export function buildParticleField(count = 22000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  let i = 0;
  let guard = 0;
  const maxGuard = count * 40;

  // Domain warp seeds for asymmetry / “crumple”
  const warpAmp = 0.85;
  const scale = 1.35;

  while (i < count && guard < maxGuard) {
    guard++;
    // Sample in a box, keep only high-density volume
    let x = (Math.random() * 2 - 1) * 1.7;
    let y = (Math.random() * 2 - 1) * 1.55;
    let z = (Math.random() * 2 - 1) * 1.7;

    // Domain warp → irregular lobes
    const wx = fbm(x * 1.1 + 2.1, y * 1.1, z * 1.1, 4);
    const wy = fbm(x * 1.1, y * 1.1 + 5.3, z * 1.1, 4);
    const wz = fbm(x * 1.1, y * 1.1, z * 1.1 + 9.7, 4);
    const qx = x + (wx * 2 - 1) * warpAmp;
    const qy = y + (wy * 2 - 1) * warpAmp * 0.9;
    const qz = z + (wz * 2 - 1) * warpAmp;

    const n = fbm(qx * scale, qy * scale, qz * scale, 5);
    const r = Math.sqrt(x * x + y * y * 1.05 + z * z);
    // Soft radial falloff so the mass stays centered but not spherical
    const radial = 1 - Math.min(1, r / 1.85);
    const field = n * 0.72 + radial * 0.38;

    // Threshold: keep the solid mass; occasional wisps near the edge
    const threshold = 0.52;
    if (field < threshold) {
      // rare edge particles for wispy silhouette
      if (field < threshold - 0.08 || Math.random() > 0.04) continue;
    }

    const dens = Math.min(
      1,
      0.25 + (field - threshold + 0.12) * 2.2 + Math.random() * 0.12
    );

    const i3 = i * 3;
    positions[i3] = x * 2.15;
    positions[i3 + 1] = y * 2.05;
    positions[i3 + 2] = z * 2.15;
    densities[i] = dens;
    i++;
  }

  return {
    positions: positions.subarray(0, i * 3),
    densities: densities.subarray(0, i),
    count: i,
  };
}

/**
 * Clifford torus projection / stereographic-ish band.
 */
export function buildCliffordBand(count = 14000) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const a = 1.1;
    const denom = 1.2 - Math.sin(u) * Math.sin(v) * 0.35;
    const x = (a * Math.cos(u) * Math.sin(v)) / denom;
    const y = (a * Math.sin(u) * Math.sin(v)) / denom;
    const z = (a * Math.cos(v)) / denom;
    const i3 = i * 3;
    positions[i3] = x * 1.7;
    positions[i3 + 1] = y * 1.7;
    positions[i3 + 2] = z * 1.7;
    densities[i] = 0.35 + 0.55 * Math.random();
  }
  return { positions, densities, count };
}

export function buildGyroid(count = 16000) {
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

export function buildMobius(count = 14000) {
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

export function buildHopf(count = 15000) {
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
    const den = 1 - d || 1e-4;
    const i3 = i * 3;
    positions[i3] = (a / den) * 1.15;
    positions[i3 + 1] = (b / den) * 1.15;
    positions[i3 + 2] = (c / den) * 1.15;
    densities[i] = 0.3 + 0.6 * Math.sin(eta);
  }
  return { positions, densities, count };
}

export function buildLorenz(count = 18000) {
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

export function buildLissajous(count = 12000, a = 3, b = 4) {
  const positions = new Float32Array(count * 3);
  const densities = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2 * 6;
    const i3 = i * 3;
    positions[i3] = Math.sin(a * t) * 2.1;
    positions[i3 + 1] = Math.sin(b * t + Math.PI / 4) * 1.6;
    positions[i3 + 2] = Math.cos((a + b) * 0.5 * t) * 1.4;
    densities[i] = 0.45 + 0.4 * (i / count);
  }
  return { positions, densities, count };
}
