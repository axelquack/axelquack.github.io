---
title: How this garden works
slug: how-this-garden-works
type: note
tags:
  - garden
status: active
date: "2026-09-11"
description: "published: true, wikilinks, backlinks, Dataview."
published: true
---

# How this garden works

GARDEN_HOW_BODY

The source of a note is still a markdown file with YAML. The garden only indexes notes whose frontmatter has **`published: true`**. `published: false` and notes with no flag never become pages, never enter search, never appear on the [[graph]].

## Wikilinks

A link such as [[presence]] or [[presence|the presence system]] or [[presence#Type]] resolves among published notes. A wikilink to an unpublished note is not a page and does not leak that note’s body.

![[presence]]

## Dataview

Queries run only over published frontmatter (`title`, `type`, `tags`, `status`, `date`, `description`):

```dataview
LIST
FROM ""
WHERE type = "note"
```

> [!tip]
> Flip `published:` in the markdown, rebuild, and the note appears or disappears. The file itself stays markdown.
