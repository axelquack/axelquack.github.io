---
title: Catalog
slug: catalog
type: index
status: active
date: "2026-01-05"
description: "Dataview fixture."
published: true
---

# Catalog

Published essays:

```dataview
TABLE title, type, status
FROM ""
WHERE type = "essay"
```

Active notes:

```dataview
LIST
FROM ""
WHERE status = "active"
```
