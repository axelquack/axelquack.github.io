/** Shared helpers for the garden publish pipeline. */

export function toPosix(p) {
  return String(p || "").replace(/\\/g, "/");
}

export function slugify(text) {
  const slug = String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "note";
}

export function headingId(text) {
  return slugify(text);
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function isImageTarget(target) {
  return /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(String(target || "").trim());
}

export function mimeFromExt(ext) {
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
  };
  return map[String(ext || "").toLowerCase()] || "application/octet-stream";
}

export function stripCode(body) {
  return String(body || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ");
}

export function formatFmValue(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value == null) return "";
  return value;
}
