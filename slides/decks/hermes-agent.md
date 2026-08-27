---
theme: default
title: Lorem ipsum
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
kicker: Lorem ipsum
foot: Dolor sit amet · consectetur
---

# Lorem ipsum

Dolor sit amet, consectetur adipiscing elit — sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua.

---
layout: aq-quote
kicker: Dolor sit
attribution: Lorem · Ipsum
---

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

---
layout: aq-agenda
kicker: Consectetur
---

# Adipiscing elit

::left::
1. Lorem
2. Ipsum
3. Dolor
4. Sit amet

::right::
1. Consectetur
2. Adipiscing
3. Elit sed
4. Eiusmod

---
layout: aq-photo
kicker: Elit sed
image: /media/gyroid-i.png
alt: Gyroid still from the AQ gallery
side: right
---

# Lorem ipsum dolor sit

Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.

- Ut enim ad minim
- Quis nostrud exercitation
- Ullamco laboris nisi

---
layout: aq-section
kicker: 01 · Lorem
---

# Ipsum dolor

<AqMetrics
  :rows="[
    { label: 'Lorem', value: 'Ipsum' },
    { label: 'Dolor', value: 'Sit amet' },
    { label: 'Consectetur', value: 'Adipiscing' },
    { label: 'Elit', value: 'Sed do eiusmod' },
    { label: 'Tempor', value: 'Incididunt' },
  ]"
/>

---
layout: aq-fill
kicker: 02 · Ipsum
---

# Ut labore et dolore

> Magna aliqua. Ut enim ad minim veniam, quis nostrud.

- Exercitation ullamco laboris nisi ut aliquip
- Duis aute irure dolor in reprehenderit
- Voluptate velit esse cillum dolore
- Eu fugiat nulla pariatur
- Excepteur sint occaecat cupidatat

---
layout: aq-fill
kicker: 03 · Dolor
---

# Sit amet elit

```ts
type Lorem = {
  ipsum: string
  dolor: string[]
  sit: number
}

function amet(rows: Lorem[]) {
  const elit = rows.map((r) => r.ipsum)
  return elit.join(" · ")
}
```

---
layout: aq-fill
kicker: 04 · Sit
---

# Amet consectetur

```ts {monaco-run}
type Lorem = {
  name: string
  when: string
  steps: string[]
}

const lorem: Lorem = {
  name: "ipsum-dolor",
  when: "consectetur adipiscing elit",
  steps: ["sed do", "eiusmod tempor", "incididunt ut"],
}

console.log(JSON.stringify(lorem, null, 2))
```

---
layout: aq-section
kicker: Adipiscing elit
---

# Sed do eiusmod

<AqChart
  title="Lorem ipsum · dolor (relative %)"
  :labels="['Lorem', 'Ipsum', 'Dolor', 'Sit']"
  :values="[100, 41, 32, 5]"
  unit="%"
/>

---
layout: aq-media
---

<AqVideo
  id="uycgV-eulGE"
  poster="/media/hermes-setup.jpg"
  title="Play video"
/>

---
layout: aq-columns
kicker: Tempor incididunt
---

# Ut labore et

::a::
### Lorem

Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.

::b::
### Ipsum

Ut labore et dolore magna aliqua. Ut enim ad minim veniam quis.

::c::
### Dolor

Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.

---
layout: aq-stat
kicker: Magna aliqua
note: Ut enim ad minim
---

# 00

Dolor sit amet · consectetur adipiscing

---
layout: aq-grid
kicker: Veniam quis
---

# Nostrud exercitation

::a::
### Lorem

Sit amet, consectetur adipiscing elit sed do eiusmod.

::b::
### Ipsum

Tempor incididunt ut labore et dolore magna aliqua.

::c::
### Dolor

Ut enim ad minim veniam, quis nostrud exercitation.

::d::
### Sit

Ullamco laboris nisi ut aliquip ex ea commodo consequat.

---
layout: aq-photo
kicker: Ullamco laboris
image: /media/helicoid-i.png
alt: Helicoid still from the AQ gallery
side: left
---

# Consectetur adipiscing

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

---
layout: aq-device
kicker: Nisi ut aliquip
image: /media/knot-32.png
alt: Torus knot still from the AQ gallery
---

# Lorem ipsum dolor

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

---
layout: aq-statement
kicker: Ex ea commodo
foot: Consequat duis aute.
---

# Dolor sit amet elit.

---
layout: aq-split
kicker: 02 · Irure
---

# Dolor in reprehenderit

::left::
### Lorem
- Ipsum dolor sit amet
- Consectetur adipiscing
- Elit sed do eiusmod
- Tempor incididunt ut

::right::
### Ipsum
- Labore et dolore magna
- Aliqua ut enim ad
- Minim veniam quis

---
layout: aq-end
kicker: Voluptate velit
foot: www.axelquack.de · axelquack.ventures
---

# Esse cillum

Dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

> Sunt in culpa qui officia deserunt mollit anim id est laborum.
