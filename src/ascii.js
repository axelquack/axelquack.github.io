/**
 * Sample display text into a regular 3D point lattice.
 * Renders glyphs on an offscreen canvas, then keeps dark pixels as cells
 * with a density attribute (0–1) for shader sizing / alpha.
 */

/**
 * @param {string} text
 * @param {object} [opts]
 * @returns {{ positions: Float32Array, densities: Float32Array, count: number }}
 */
export function sampleTextPoints(text, opts = {}) {
  const {
    width = 1600,
    height = 900,
    fontWeight = "700",
    fontSize = 420,
    fontFamily = "Georgia, 'Times New Roman', serif",
    cell = 3,
    maxPoints = 28000,
    scaleX = 8.4,
    scaleY = 4.7,
    /** ink darkness threshold 0–255 (lower = only darkest) */
    threshold = 210,
  } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      positions: new Float32Array(0),
      densities: new Float32Array(0),
      count: 0,
    };
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let size = fontSize;
  const lines = String(text).split("\n");
  const maxW = width * 0.92;

  // Fit font to canvas
  for (let guard = 0; guard < 40; guard++) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    let widest = 0;
    for (const line of lines) {
      widest = Math.max(widest, ctx.measureText(line).width);
    }
    if (widest <= maxW && size * lines.length * 1.05 <= height * 0.9) break;
    size *= 0.93;
  }

  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  const lineHeight = size * 0.98;
  const blockH = lineHeight * lines.length;
  let y0 = height / 2 - blockH / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y0);
    y0 += lineHeight;
  }

  const { data } = ctx.getImageData(0, 0, width, height);
  const positions = [];
  const densities = [];

  // Strict grid — regular cell lattice
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const i = (y * width + x) * 4;
      const lum = data[i]; // 0 black … 255 white
      if (lum >= threshold) continue;

      const density = 1 - lum / 255; // 1 = full ink
      const nx = (x / width - 0.5) * scaleX;
      const ny = -(y / height - 0.5) * scaleY;
      // Near-flat field — tiny z only for layering
      const nz = (1 - density) * 0.04;

      positions.push(nx, ny, nz);
      densities.push(density);
    }
  }

  let count = densities.length;
  if (count === 0) {
    return {
      positions: new Float32Array(0),
      densities: new Float32Array(0),
      count: 0,
    };
  }

  if (count > maxPoints) {
    // Uniform stride downsample to preserve grid rhythm
    const stride = Math.ceil(count / maxPoints);
    const p2 = [];
    const d2 = [];
    for (let i = 0; i < count; i += stride) {
      p2.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      d2.push(densities[i]);
    }
    return {
      positions: new Float32Array(p2),
      densities: new Float32Array(d2),
      count: d2.length,
    };
  }

  return {
    positions: new Float32Array(positions),
    densities: new Float32Array(densities),
    count,
  };
}
