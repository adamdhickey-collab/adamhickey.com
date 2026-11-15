# Narrative Ink Panorama: The Shift's illustration system

**Scope.** The drawings in The Shift in Product Design: the series landing
(`writing/index.html`), the twelve lessons, and the four share-card pictures
`scripts/og.mjs` names. This document governs editorial illustration only.
It does not override `COLOR.md`, `TYPOGRAPHY.md`, the site's interface icons,
any lesson's words, or a figure built in HTML. Where it and `writing/shift.css`
disagree about a slot's size or ground, the stylesheet is the truth and this
file is the bug.

Companions:

- [NARRATIVE_INK_MANIFEST.md](NARRATIVE_INK_MANIFEST.md): every placement,
  its size now, its treatment, and its status. Generated; never hand-edited.
- [NARRATIVE_INK_BRIEFS.md](NARRATIVE_INK_BRIEFS.md): what each replacement
  shows, lesson by lesson, tied to the lesson's argument.
- [SHIFT_CH1_PILOT.md](SHIFT_CH1_PILOT.md): the Chapter 1 pilot, how to
  install it, and the two slot mismatches to resolve first.

## 1. Visual grammar

The hand is engraved and woodcut editorial illustration of the kind found in
dense Japanese narrative printmaking: a panorama read from a distance for its
shape and up close for its crowd. Contemporary subject matter only. The
lesson's argument picks the scene; the technique never does.

**Always**

- Charcoal ink on warm paper, high contrast. Most of every picture is those
  two.
- Line does the shading: fine hatching, cross-hatching, stippling, and
  repeated ink texture (rows of windows, rows of desks, rows of cards). No
  tonal gradients, airbrush, or soft shadows.
- Miniature people, rooms, objects, and the connections between them, at
  several scales in one frame. One figure or object is the focal mass, and it
  reads at thumbnail size.
- Large cloud-shaped negative spaces of bare paper, which separate the
  layers and give the eye somewhere to rest. At least a quarter of a
  panorama is open paper.
- Flattened, theatrical staging: layered planes, a high or straight-on
  viewpoint, one strict viewpoint per picture.
- One chapter accent, used as a structural highlight on what the argument
  turns on (the decision, the stop, the line), never as a wash.

**Never**

- The reference artwork's red, or any hue but the chapter's. No yellow, no
  rose, no skin or wood tones. Skin and wood are paper and hatching.
- Flat vector illustration, painterly gradients, glossy 3-D, photorealism,
  pastel fills.
- Japanese cultural motifs used as decoration: no torii, kimono, pagodas,
  Mount Fuji, cherry blossom, or wave crests. The technique is borrowed; the
  world is a contemporary office, kitchen, workshop, or screen.
- Robots, glowing brains, circuit faces, or sparkles as shorthand for AI.
  An agent is shown by what it does: a stack it gathered, a question it
  stopped on, a line it will not cross.
- Words, numbers, logos, or legible UI text in the drawing. Every label is
  the page's own text (the existing rule in `writing/shift.css`). Screens
  carry hatched bars and blocks, not copy.
- An invented Dispatch Cockpit, Agent Review, or After Send screen drawn as
  if it were a screenshot.

## 2. Color

The chapter hues are interface colors declared with measured rows in
`COLOR.md` section 2 and set in `writing/shift.css`. The artwork uses each
chapter's `-fill` value. These do not change.

| Chapter | Name | Accent (`--shift-*-fill`) | Use in the art |
| --- | --- | --- | --- |
| 1 | The job is changing | sage `#657D60` | the one thread, path, or desk the person's job runs through |
| 2 | Inside the agent | slate `#56718C` | the part of the system that acts, or the point where it stops |
| 3 | Designing the product | terracotta `#C0714E` | the boundary, the test, the thing a team agrees on |
| 4 | In practice | plum `#7A5A78` | the person, or the choice the practice protects |

Shared neutrals in every chapter:

| Role | Value |
| --- | --- |
| Ink | charcoal `#252525` |
| Paper | warm paper `#F5F5F0` |

Rules:

1. One accent per picture, the chapter's. Its tints are allowed (the accent
   over paper at 20 to 60 percent, laid as flat hatched fills), so a picture
   reads in two values of one hue at most.
2. The accent covers under a quarter of the picture's ink, and under a tenth
   in a panorama. It marks; it does not fill.
3. Ink is charcoal in every chapter. The current set draws every chapter's
   outlines in one dark green, which is why a slate brain or a plum scale
   reads as part of chapter 1. That ends with this system.
4. `node scripts/narrative-ink.mjs palette <files> --chapter N` enforces rule
   1 by the pixel: under 0.5 percent of the opaque pixels may fall outside
   neutral and the chapter's hue, and it warns above 25 percent accent. On
   the tree at c5e75fbf, 95 of the 96 current pictures fail it; only
   `chapter-1.webp` passes.

## 3. Three levels

| Level | Slots (`writing/shift.css`) | Largest render, CSS px | Export | Ground | Accent |
| --- | --- | --- | --- | --- | --- |
| **A. Panorama** | `.shift-hero-art` | 713 x 401 (at 768) | **1600 x 900** WebP | paper knocked out to alpha, so the ink sits on `--shift-ground` | 1 to 3 small regions |
| **A. Panorama** | `.writing-scene` | 832 x 469 (from 64rem) | **1920 x 1080** WebP | warm paper, framed by the slot's edge and shadow | one figure or object |
| **A. Panorama** | share card, `og.mjs` | 1600 x 900 in the card | **1600 x 900** WebP | warm paper | 1 to 3 small regions |
| **B. Supporting** | `.shift-concept-art` | 440 x 294 | **1200 x 800** WebP, 3:2 | warm paper on the slot's white card | the one thing the concept line names |
| **B. Supporting** | `.shift-pair-art` | 381 x 254 | **960 x 640** WebP each, 3:2 | warm paper | the circled, joined, or chosen part only |
| **B. Supporting** | `.shift-chapter-art`, `.shift-mosaic` | 640 x 360 tile | **1280 x 720** WebP | alpha | the emblem's working part |
| **C. Icon** | `.shift-stage-art`, `.shift-stack-art` | 48 x 48 (40 at 390) | **512 x 512** master PNG, **256 x 256** WebP | alpha (the stack slot draws white under it) | one shape at most |

Every export is at least twice the largest render, so it is sharp on a 2x
screen. `narrative-ink.mjs shots` flags any picture that is not. Two slots
are below that today: the scene, which ships 1600 px into an 832 px box
(1664 needed), and the pair, which ships 720 px into a 381 px box (762
needed). The exports above correct both.

**Aspect ratios are fixed by the stylesheet.** `.shift-hero-art` declares
16:9, and `.shift-concept-art` and `.shift-pair-art` declare 3:2 with the
default `object-fit: fill`. A 16:9 picture in a 3:2 slot is stretched, not
cropped. Export to the slot's ratio; never change the slot's CSS to fit a
picture.

### A. Panorama

- A story told across the width: a foreground plane with the person, a
  middle plane with the system they work in, and a far plane of crowd,
  buildings, or repeated objects, separated by cloud-shaped paper.
- **The 342 px test.** On a phone, a hero is 342 px wide. Downscale to 342
  and look: the focal figure and the accent must still read as a shape. If
  the picture turns to grey noise, cut the crowd, not the focal mass.
- The hero is transparent: knock the paper out to alpha after export, so the
  chapter ground shows through the open space, the way the heroes on `main`
  have sat since #1189. A paper rectangle on a tinted ground reads as a
  pasted-in card.
- The scene is the lesson's story with the people in it. It keeps the
  subject its caption and alt already describe, so the page's words stay
  true.

### B. Supporting

- One idea, one object or one small situation, centered with generous paper
  around it. Fewer secondary objects than a panorama, the same line weight
  and hatching.
- A pair is drawn as one sheet and cut into two, so both halves share a
  scale and a hand. The two states differ in one visible way, and the accent
  sits only on the side that resolves.
- The concept picture shows the state the concept line describes, not a
  metaphor for AI in general.

### C. Icon

- One recognizable object, three-quarter or straight-on, filling about 70
  percent of the square.
- A contour weight that survives at 48 px: at 512 px masters, outer contour
  14 to 16 px, inner lines 6 to 8 px, hatching no finer than 4 px with 6 px
  gaps. Downscale to 48 px and check it before committing.
- Limited hatching, on one side only, to give the object weight. No crowd,
  no ground plane.
- The accent on one shape at most. A set (a lesson's six stages, a stack's
  four rows) is drawn as one sheet so every icon shares a hand.
- These are editorial marks. They never stand in for a functional control:
  navigation, buttons, the read-aloud player, and the disclosure chevrons
  keep the site's own line icons.

## 4. What stays as it is

- Every figure built in HTML or SVG: `.shift-flow`, `.shift-compare`,
  `.shift-stack` and `.shift-stages` text, number rows, the terms, and the
  questions. Their labels are the accessible explanation, and no drawing
  replaces them.
- Real product screenshots. The Shift's lessons carry none today; if a
  lesson adds one, it is evidence, not an illustration, and this system does
  not apply to it.
- The page layout, type, tokens, and `shift.js`. A replacement changes a
  file path, `width`, `height`, alt text, and the cache-buster, and nothing
  else.

## 5. Files

### Naming

```
img/writing/shift/narrative-ink/
  manifest.json                         generated; see the manifest doc
  chapter-1/
    chapter1-lesson1-hero.webp           level A, the hero
    chapter1-lesson1-dispatcher.webp     level A, the scene, named for its subject
    chapter1-lesson1-human-decision.webp level B, the concept, named for its idea
    chapter1-icon-<subject>.webp         level C, 256 web size
    chapter1-icon-<subject>@512.png      level C master, kept beside it
    chapter1-emblem.webp                 the landing's chapter art
    chapter1-share.webp                  the og.mjs picture
  chapter-2/ ...
  chapter-3/
    chapter3-lesson7-pair-form.webp      level B, the left half of a pair
    chapter3-lesson7-pair-menu.webp      level B, the right half
```

- `chapter{N}-lesson{L}-{role}`: N is the chapter, L the lesson's place in
  the series (1 to 12), role is `hero` or a one- or two-word subject. The
  pilot set this pattern; every later file follows it.
- Icons belong to the chapter, not the lesson, so an icon can be reused
  inside its chapter without a copy: `chapter{N}-icon-{object}`.
- Lowercase, hyphens, no dates or version numbers in a name. A new version
  of the same picture keeps its name and bumps the page's `?v=`.

### Source and inbox

- Generated sheets, raw downloads, and `narrative-ink.mjs shots` output go
  in `img/inbox/narrative-ink/`, which `.gitignore` keeps out of the tree. The WebP
  in `img/writing/shift/narrative-ink/` is the artifact.
- Icon masters (512 px PNG) are committed beside their WebP, because a
  re-export at another size needs them and a generator will not draw the
  same icon twice.

### Rollback

- Old pictures are not deleted when a lesson moves to the new hand. They
  stay at their paths until all four chapters have shipped, so reverting a
  lesson is a one-commit change to its HTML. A cleanup pull request removes
  the old set at the end and lists every path it removes.

## 6. Prompts

Generated in ChatGPT through the loop in `scripts/draw.mjs` and the local
`draw-in-the-browser` skill. The first job of a chapter carries the style
block and an approved reference image (the pilot's hero once accepted); the
rest open "Same style, same chapter." Never put a word in a prompt you would
not accept as a word in the picture.

**Style block (every first job)**

```
Engraved editorial illustration in the manner of dense Japanese narrative
woodblock printmaking, applied to a contemporary scene. Charcoal #252525 ink
on warm paper #F5F5F0. All shading by fine hatching, cross-hatching,
stippling, and repeated line texture; no gradients, no soft shadows, no
airbrush. Miniature people and objects at several scales, flattened
theatrical staging, one strict viewpoint, and large cloud-shaped areas of
bare paper between the layers. One accent color only, {ACCENT_NAME}
{ACCENT_HEX}, used sparingly as flat hatched fills on {ACCENT_ROLE}.
No other colors: no red, no yellow, no skin or wood tones. No words, letters,
numbers, logos, or legible screen text anywhere. No Japanese cultural motifs,
no robots, no glowing brains.
```

**Panorama (hero, scene, share)**

```
{STYLE BLOCK}
16:9, 1920 x 1080. {SCENE: the people, the place, the moment from the brief}.
Foreground: {focal figure and action}. Middle: {the system around them}.
Far: {the crowd or repeated objects}. The accent marks only {the one thing}.
Leave at least a quarter of the frame as open paper. The focal figure must
read as a clear silhouette when the image is shrunk to 342 pixels wide.
```

**Supporting (concept, pair, emblem)**

```
{STYLE BLOCK}
3:2, 1200 x 800. A single {object} showing {state from the brief}, centered,
with generous open paper around it. Few secondary objects. The accent only on
{the part the concept line names}.
For a pair: one sheet, two panels side by side at the same scale, left
{state A}, right {state B}; the accent only on the right.
```

**Icon set**

```
{STYLE BLOCK}
One sheet, a {cols} x {rows} grid of square cells on transparent or plain
paper, one object per cell, each filling 70% of its cell: {object list in
order}. Bold even outer contours, a little hatching on one side only, no
ground, no crowd. The accent on at most one shape per object. Every object
must stay recognizable at 48 pixels.
```

## 7. Export and integration

1. **Cut and size.** Slice sheets into tiles at one shared scale
   (`scripts/illustrate.mjs` and `scripts/draw.mjs take` already do this for
   the old set; give them the export sizes above). Panoramas to 1920 x 1080
   for scenes, 1600 x 900 for heroes and share cards; concepts to 1200 x
   800; pairs to 960 x 640; icons to 512 master, 256 web.
2. **Ground.** Heroes, emblems, and icons: knock the paper out to alpha.
   Scenes, concepts, pairs, and share cards: keep the paper.
3. **Encode.** WebP through Chromium, the site's one encoder (see
   `asset-swap-encoding` in the project notes): quality 82 for panoramas, 85
   for supporting, lossless or 90 for icons. Budgets: hero 180 KB, scene 240
   KB, concept 90 KB, pair 60 KB, icon 15 KB. Hatching is expensive to
   compress; if a file is over budget, lower quality before lowering size.
4. **Check the art.** `node scripts/narrative-ink.mjs palette
   img/writing/shift/narrative-ink/chapter-N --chapter N` passes.
5. **Swap.** In the lesson, change only `src` (and its `?v=`), `width`,
   `height`, and `alt`. Keep `class`, `loading`, `decoding`, and every
   caption.
6. **Check the page.** Before the swap, `node scripts/narrative-ink.mjs
   shots <page> --label before`; after it, `--label after`; compare the two
   folders. Then the repository's own checks: the fast six, `readtime.mjs`
   (alt text is part of what a read time counts), and `resting.mjs` and
   `states.mjs` scoped to the page, at the same counts as before.
7. **Regenerate the manifest.** `node scripts/narrative-ink.mjs manifest`;
   the status column moves in the same commit.

A swap that touches only files under `img/` and the `src`, `width`, and
`height` of the tags pointing at them can take the asset carve-out in
`CLAUDE.md`. A new alt text worth more than a typo fix, which every one of
these is, makes it a normal change on a branch.

## 8. Accessibility and responsive rules

- **Alt by slot**, and the manifest names each one's policy. Heroes,
  icons, and the landing's mosaic tiles take `alt=""`: the title or row
  label beside them already says it. Scenes, concepts, pairs, and the
  landing's chapter-band emblem take alt text that names who or what is
  shown and the one detail the caption or concept line points at, in one
  sentence, without "image of."
- **Alt follows the picture.** A redrawn scene that keeps its subject keeps
  most of its alt; describe what is now drawn, not what used to be.
- **Reading order is the markup's.** No picture moves in the DOM, and none
  is set as a CSS background.
- **No text in the picture**, so nothing a reader needs is trapped in pixels
  and nothing needs translating.
- **Intrinsic size on every tag**, `width` and `height` equal to the file,
  so the slot reserves the right box and nothing shifts as it decodes.
- **Above the fold, eager; below it, lazy.** The hero keeps no `loading`
  attribute; everything else keeps `loading="lazy"`.
- **Motion.** None of these pictures animates. `shift.js` builds figures on
  scroll without changing opacity, and that stays its business.

## 9. Visual QA checklist

Run per picture, then per page, then once per chapter with every lesson
open side by side.

**Per picture**

- [ ] Shows the brief's subject, and the caption and alt beside it are
      still true.
- [ ] `palette --chapter N` passes: neutral plus the chapter's accent only.
- [ ] Accent marks the one thing the brief names, under a tenth of a
      panorama's ink.
- [ ] No words, numbers, logos, legible screen text, robots, or cultural
      decoration.
- [ ] Line, hatching, and stipple only; no gradient, blur, or airbrush.
- [ ] At least a quarter open paper (panoramas), generous margin
      (supporting), 70 percent fill (icons).
- [ ] The 342 px test (heroes), the 48 px test (icons).
- [ ] Exact export size and ratio for its slot; within its byte budget.
- [ ] Ground correct: alpha for hero, emblem, and icon; paper for the rest.

**Per page** (`narrative-ink.mjs shots` at 390, 768, and 1440)

- [ ] Every picture loads; none soft at 2x; file ratio matches its
      attributes.
- [ ] No sideways scroll at any width.
- [ ] The hero sits on the chapter ground with no visible rectangle.
- [ ] The scene's frame, the concept card, and the pair cards look exactly
      as they did before; only the drawing inside changed.
- [ ] Total picture weight within 10 percent of the page's before.
- [ ] Alt text read aloud in order makes sense with the captions.
- [ ] The fast six, `readtime.mjs`, and scoped `resting.mjs` and
      `states.mjs` pass at the same counts.

**Per chapter**

- [ ] The chapter's lessons, heroes side by side, read as one hand and one
      hue.
- [ ] Set against another finished chapter, the two read as one family
      with different accents.
- [ ] The landing's mosaic is replaced only when all four emblems are
      ready, so it never shows one tile in a different hand.
