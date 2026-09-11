import { escapeHtml } from "./util.js";

function unquote(value) {
  const s = String(value || "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function splitTop(expr, sep) {
  const out = [];
  let buf = "";
  let quote = null;
  const upper = expr;
  const needle = sep.toUpperCase();
  let i = 0;
  while (i < upper.length) {
    const ch = upper[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      i += 1;
      continue;
    }
    if (upper.slice(i, i + needle.length).toUpperCase() === needle) {
      const before = upper[i - 1];
      const after = upper[i + needle.length];
      const boundary = (c) => !c || /\s/.test(c);
      if (boundary(before) && boundary(after)) {
        out.push(buf.trim());
        buf = "";
        i += needle.length;
        continue;
      }
    }
    buf += ch;
    i += 1;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function parseClause(raw) {
  const s = raw.trim();
  const m = s.match(/^([A-Za-z_][\w.]*)\s*(=|!=)\s*(.+)$/);
  if (!m) return { op: "true" };
  return {
    op: m[2] === "=" ? "eq" : "neq",
    field: m[1],
    value: unquote(m[3].trim()),
  };
}

function parseAnd(expr) {
  const parts = splitTop(expr, " AND ");
  if (parts.length === 1) return parseClause(parts[0]);
  return { op: "and", args: parts.map(parseClause) };
}

function parseWhere(expr) {
  const parts = splitTop(expr, " OR ");
  if (parts.length === 1) return parseAnd(parts[0]);
  return { op: "or", args: parts.map(parseAnd) };
}

function parseColumns(spec) {
  return spec
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const bits = part.split(/\s+as\s+/i);
      const field = bits[0].trim();
      const label = (bits[1] || field).trim();
      return { field, label };
    });
}

export function parseDataview(query) {
  const lines = String(query || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out = {
    type: "list",
    columns: [],
    from: { kind: "all", value: null },
    where: null,
    sort: null,
    limit: null,
  };
  for (const line of lines) {
    const table = line.match(/^TABLE\s+(.*)$/i);
    if (table) {
      out.type = "table";
      out.columns = parseColumns(table[1]);
      continue;
    }
    if (/^LIST\b/i.test(line)) {
      out.type = "list";
      const rest = line.replace(/^LIST\b/i, "").trim();
      if (rest) out.columns = parseColumns(rest);
      continue;
    }
    const from = line.match(/^FROM\s+(.*)$/i);
    if (from) {
      const v = from[1].trim();
      if (!v || v === '""' || v === "''") {
        out.from = { kind: "all", value: null };
      } else if (v.startsWith("#")) {
        out.from = { kind: "tag", value: unquote(v.slice(1)) };
      } else {
        out.from = { kind: "folder", value: unquote(v) };
      }
      continue;
    }
    const where = line.match(/^WHERE\s+(.*)$/i);
    if (where) {
      out.where = parseWhere(where[1]);
      continue;
    }
    const sort = line.match(/^SORT\s+(\S+)(?:\s+(ASC|DESC))?/i);
    if (sort) {
      out.sort = {
        field: sort[1],
        dir: (sort[2] || "ASC").toUpperCase(),
      };
      continue;
    }
    const limit = line.match(/^LIMIT\s+(\d+)/i);
    if (limit) {
      out.limit = Number(limit[1]);
      continue;
    }
  }
  return out;
}

function fmBag(note) {
  return note.frontmatter || note.data || {};
}

export function fieldValue(note, field) {
  if (!field) return "";
  const name = field.replace(/^file\./, "");
  const fm = fmBag(note);
  if (field === "title" || name === "title") return note.title ?? fm.title ?? "";
  if (field === "slug") return note.slug ?? fm.slug ?? "";
  if (field === "path" || field === "file.path" || field === "file.name") {
    return note.path || note.filename || "";
  }
  const value = fm[name];
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function asList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value == null || value === "") return [];
  return [String(value)];
}

function valuesEqual(value, want) {
  const wantS = String(want).toLowerCase();
  if (Array.isArray(value)) {
    return asList(value).some((v) => v.toLowerCase() === wantS);
  }
  if (value == null || value === "") return false;
  return String(value).toLowerCase() === wantS;
}

function matchClause(note, clause) {
  if (!clause) return true;
  if (clause.op === "or") return clause.args.some((c) => matchClause(note, c));
  if (clause.op === "and") return clause.args.every((c) => matchClause(note, c));
  if (clause.op === "true") return true;
  const value = fieldValue(note, clause.field);
  const eq = valuesEqual(value, clause.value);
  return clause.op === "eq" ? eq : !eq;
}

function matchFrom(note, from) {
  if (!from || from.kind === "all") return true;
  if (from.kind === "tag") {
    const tags = asList(fieldValue(note, "tags")).map((t) =>
      t.replace(/^#/, "").toLowerCase(),
    );
    return tags.includes(String(from.value || "").toLowerCase());
  }
  if (from.kind === "folder") {
    const prefix = String(from.value || "").replace(/^\/+|\/+$/g, "");
    if (!prefix) return true;
    const path = String(note.path || "");
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  return true;
}

/**
 * Evaluate a Dataview TABLE/LIST query against published notes only.
 * Frontmatter fields: title, type, tags, status, date, description.
 */
export function evaluateDataview(query, publishedNotes) {
  const parsed = typeof query === "string" ? parseDataview(query) : query;
  let rows = (publishedNotes || []).filter((n) => n && n.published !== false);
  rows = rows.filter((n) => matchFrom(n, parsed.from) && matchClause(n, parsed.where));
  if (parsed.sort) {
    const field = parsed.sort.field;
    const dir = parsed.sort.dir === "DESC" ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = String(fieldValue(a, field) ?? "");
      const bv = String(fieldValue(b, field) ?? "");
      return av.localeCompare(bv) * dir;
    });
  }
  if (parsed.limit != null) rows = rows.slice(0, parsed.limit);
  return { type: parsed.type, columns: parsed.columns, rows, query: parsed };
}

function displayField(note, field) {
  const value = fieldValue(note, field);
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "";
  return String(value);
}

export function renderDataview(query, publishedNotes) {
  const result = evaluateDataview(query, publishedNotes);
  if (result.type === "table") {
    const cols =
      result.columns.length > 0
        ? result.columns
        : [{ field: "title", label: "title" }];
    const head = cols
      .map((c) => `<th>${escapeHtml(c.label)}</th>`)
      .join("");
    const body = result.rows
      .map((note) => {
        const cells = cols
          .map((c) => {
            if (c.field === "title") {
              return `<td><a class="wiki link" href="#/${escapeHtml(note.slug)}" data-slug="${escapeHtml(note.slug)}">${escapeHtml(note.title)}</a></td>`;
            }
            return `<td>${escapeHtml(displayField(note, c.field))}</td>`;
          })
          .join("");
        return `<tr data-slug="${escapeHtml(note.slug)}">${cells}</tr>`;
      })
      .join("");
    return `<table class="dataview dataview-table" data-dataview="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
  const items = result.rows
    .map(
      (note) =>
        `<li data-slug="${escapeHtml(note.slug)}"><a class="wiki link" href="#/${escapeHtml(note.slug)}" data-slug="${escapeHtml(note.slug)}">${escapeHtml(note.title)}</a></li>`,
    )
    .join("");
  return `<ul class="dataview dataview-list" data-dataview="list">${items}</ul>`;
}
