---
title: Garden
slug: index
type: note
tags:
  - garden
status: active
date: "2026-09-11"
description: "A private digital garden of published notes."
published: true
---

# Garden

GARDEN_INDEX_BODY

These notes stay markdown. Setting `published: true` on a note is what puts it here. Everything around that file — [[how-this-garden-works|wikilinks]], backlinks, the [[graph]], search, hover previews, [[presence|the paper/ink type]] — is generated.

This host is private. Without the password the published bodies are not on the public Pages artifact.

## Start

- [[how-this-garden-works]] — `published: true`, wikilinks, Dataview
- [[presence]] — tokens, callouts, no brand colour
- [[graph]] — notes as nodes, wikilinks as edges

```dataview
TABLE title, type, description
FROM ""
WHERE published = true
```
