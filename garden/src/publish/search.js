/** Title + body search over published garden notes. */

export function searchNotes(notes, query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return [];
  const hay = (note) => {
    const title = String(note.title || "").toLowerCase();
    const body = String(
      note.searchText || note.markdown || note.body || "",
    ).toLowerCase();
    return `${title}\n${body}`;
  };
  return notes.filter((note) => hay(note).includes(q));
}
