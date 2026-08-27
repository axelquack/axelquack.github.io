---
theme: default
title: AQ Slides — layout variants
author: Axel Quack
colorSchema: light
highlighter: shiki
fonts:
  sans: Inter
  serif: Instrument Serif
  mono: IBM Plex Mono
transition: fade
canvasWidth: 1280
layout: aq-cover
kicker: Layout catalog
foot: Same tokens as www · not the Slidesgo palette
---

# Variants

Structures inspired by a lead-funnel deck — photo split, agenda,
columns, grid, giant number, device frame — in paper, ink, hairlines.

---
layout: aq-agenda
kicker: Catalog
---

# Layouts

::left::
1. Cover + field
2. Quote
3. Agenda
4. Photo split

::right::
1. Columns
2. Grid
3. Giant number
4. Device frame

---
layout: aq-statement
kicker: Section
foot: Structure only. No gradient, no cards.
---

# Table of contents, then image.

---
layout: aq-photo
kicker: Photo · right
image: /media/gyroid-i.png
alt: Gyroid still
side: right
---

# Copy, then field

Full-height still from the gallery. Hairline, not a card. Swap the file — keep the crop.

- `side: right` (default)
- `side: left` to reverse

---
layout: aq-photo
kicker: Photo · left
image: /media/helicoid-i.png
alt: Helicoid still
side: left
---

# Reverse the pane

Same layout. Image leads. Type sits in the remaining column.

---
layout: aq-columns
kicker: Three
---

# Equal columns

::a::
### Observe

Hairline between panes. Display for the head. Body for the note.

::b::
### Write

Skills as Markdown. No icon grid. No coloured bullets.

::c::
### Run

The leftover height is the column — don’t leave a strip at the top.

---
layout: aq-grid
kicker: Four
---

# Four cells

::a::
### 01 · Cover
Gyroid field, kicker, title, foot.

::b::
### 02 · Fill
Lists and code grow into leftover height.

::c::
### 03 · Media
Full-bleed 16:9 video.

::d::
### 04 · End
Inverse paper. Links.

---
layout: aq-stat
kicker: Giant number
note: Catch the eye, then the unit.
---

# 90

Default turn budget · parent agent

---
layout: aq-device
kicker: Device frame
image: /media/knot-32.png
alt: Knot still
---

# Hairline as the bezel

A 1px ink rectangle around a still — not a cartoon monitor.

---
layout: aq-end
kicker: AQ Slides
foot: npm run dev:slides
---

# Use them

`layout: aq-photo` and the rest. Tokens stay in `src/tokens.css`.
