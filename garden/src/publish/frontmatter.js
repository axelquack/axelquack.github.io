import { parse as parseYaml } from "yaml";

/**
 * Split a markdown document into YAML frontmatter and body.
 * Missing or invalid frontmatter yields `{}` and the original text as body.
 */
export function parseFrontmatter(raw) {
  const text = String(raw ?? "");
  if (!text.startsWith("---")) {
    return { data: {}, body: text };
  }
  const rest = text.slice(3);
  const nl = rest.startsWith("\n") || rest.startsWith("\r\n") ? rest.search(/\r?\n/) : 0;
  if (nl === -1) return { data: {}, body: text };
  const afterOpen = rest.slice(nl).replace(/^\r?\n/, "");
  const endMatch = afterOpen.match(/\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!endMatch) return { data: {}, body: text };
  const yamlSrc = afterOpen.slice(0, endMatch.index);
  const body = afterOpen.slice(endMatch.index + endMatch[0].length);
  let data = {};
  try {
    const parsed = parseYaml(yamlSrc);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed;
    }
  } catch {
    data = {};
  }
  return { data, body };
}
