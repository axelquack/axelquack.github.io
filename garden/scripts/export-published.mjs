#!/usr/bin/env node
/**
 * Copy vault notes with `published: true` into garden/notes.
 * Unpublished notes are not copied. Does not delete existing garden notes
 * unless --prune is passed.
 */
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanVault, selectPublished } from "../src/publish/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "notes");
const vault =
  process.env.GARDEN_VAULT ||
  join(process.env.HOME || "", "Obsidian/AQCapital");
const prune = process.argv.includes("--prune");

const published = selectPublished(scanVault(vault));
if (prune) {
  rmSync(dest, { recursive: true, force: true });
}
mkdirSync(dest, { recursive: true });
for (const note of published) {
  const target = join(dest, note.path);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(note.absPath, target);
  console.log(`published ${note.path} → ${note.slug}`);
}
console.log(`${published.length} published notes from ${vault}`);
