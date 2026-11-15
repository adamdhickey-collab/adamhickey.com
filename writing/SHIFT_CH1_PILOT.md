# Chapter 1 pilot: integration notes

The pilot's pictures arrive as a separate bundle,
`shift_chapter1_illustration_pilot_v2.zip`. Its bytes are not in this branch
yet. Nothing in the lesson points at a path under
`img/writing/shift/narrative-ink/` until the files are in the repository.

**Status, 2026-11-14: installed, then redrawn once on review.** The bundle's
installer ran dry, then applied, on this branch. The owner reviewed the three
on the page three times and asked for changes, and all three were regenerated in ChatGPT
from the bundle's hero as the style reference. The bundle's originals are in
this branch's history at fd5a55fc.

| Picture | Review note | Now |
| --- | --- | --- |
| `chapter1-lesson1-hero.webp` | Round one: compass dead center and upright, the middle empty. Round two: the redrawn compass too large, cramped in the corner, its tip like a claw | 1600x900. A slim compass about a quarter of the frame's height stands upper left of center on the sage arc it is drawing, a plain pencil lead on one leg, open paper around it. People walk the arc from the app screens to the task spiral, over a faint circular grid. No robot. |
| `chapter1-lesson1-dispatcher.webp` | Round one: same symmetry as the hero, the sun and paths out of the monitor read as odd. Round two: no lines from the notepad, widescreen monitors, a headset instead of a phone. Round three: typing on a keyboard, not writing | 1664x936, a new picture. The dispatcher sits lower left in a headset at three 16:9 monitors, typing on a keyboard; a highway, a clock with resting drivers, and a warehouse float apart above her, joined by nothing but her. Sharp at 2x in the 832 px slot. |
| `chapter1-lesson1-human-decision.webp` | Good, but she had a third arm at her chin | 960x640, drawn at 3:2. The hand at her chin is gone; nothing else changed. |

All three pass the palette check, and `narrative-ink.mjs shots` is clean at
390, 768, and 1440. Page picture weight: 222 KB before the pilot, 779 KB now,
at WebP quality 0.7.

**Chapter 1 is complete in the new hand.** After Lesson 1 was approved as
the model, Lessons 2 and 3 were drawn in the same chat: a hero, a scene, and
a concept each, and twelve icons on two sheets (six stages in Lesson 2; the
stack and the three failures in Lesson 3). Two scenes came back with a third
arm and were regenerated with simpler poses; that became the first review
rule in the spec. Every source was toned to the exact sage before export,
the six pilot icons included, so all 45 files in `chapter-1/` pass the
palette check. The three lessons are clean in `shots` at 390, 768, and 1440.

**Closed on 2026-11-14, after "fix open":**

- **The heroes' pale rectangle.** The three heroes carry
  `shift-hero-art--plate`, a new rule in `writing/shift.css`: the card
  radius, a hairline, and the resting shadow, so the plate reads as a
  framed card on the sage ground, like the scene and the term cards.
- **The wave-pattern jacket, kept and extended.** It was edited out, and
  the owner asked for it back: it is now the series' signature. Lesson 1's
  dispatcher wears the wave scale in all three pictures, Lesson 2's
  designer a herringbone, Lesson 3's a star lattice. Lesson 3's scene was
  redrawn in side view after its rear view came back with awkward arms, a
  narrow waist, and a window frame that stopped short, and then its idle
  arm was hidden behind her.
- **The off-hue pilot icons.** Toned with everything else.

**Chapter 2 is complete in the new hand** (2026-11-14, slate `#56718C`).
Lessons 4, 5, and 6: a hero, a scene, and where the lesson has one a
concept, with twelve icons on two sheets, all in
`img/writing/shift/narrative-ink/chapter-2/`. Patterns: interlocking rings
(Lesson 4), diamond lattice (Lesson 5), arrow fletching (Lesson 6). Three
were redrawn on review: Lesson 4's hero lost an impossible spiral staircase
for straight flights and landings; Lesson 6's first hero became its scene,
with its squarish monitor made widescreen, and a wider panorama took the
hero's place; Lesson 6's concept, a roll of paper that read as a toilet
roll, became a stack of fan-folded printout. Lesson 5's icon sheet came out
a little flatter than Lesson 4's.

**Chapter 3 is started and paused** (2026-11-14, terracotta `#C0714E`).
ChatGPT's image allowance for the account ran out after Lesson 7's hero;
the notice said it resets on 2026-11-15 at 3:02 PM. Lesson 7's hero is
drawn and kept as a source in `img/inbox/narrative-ink/src3/` (not in the
tree, not on the page): the archive wall of drawers with four pulled open,
and a team at four folders, basket-weave pattern on the main figure. Still
to draw for Chapter 3: Lesson 7's scene, pair, and four icons; Lesson 8's
hero, scene, concept, and eight icons; Lesson 9's hero, scene, pair, and
four icons. Patterns planned: basket weave (7), key fret (8), nested
hexagons (9). `tone` now treats very light pixels as paper, because tan
paper sits next to terracotta on the color wheel.

**Still open, by design or by nature:**

1. **The six pilot icons** (binoculars, signpost, compass, blocks, chart,
   seedling) are in the library and on no page.
2. **Weight.** About 770 to 890 KB of pictures a lesson, against about 220
   before. Hatching does not compress; the only lever left is quality
   below 0.7, which starts to soften the linework.
3. **The landing and the share cards** still show the old chapter emblem:
   all four chapters change there together.

## Exact image mapping

In `writing/what-changes-when-you-design-the-task-instead-of-the-app.html`:

| Slot | Current file | Pilot file | Pilot size | Slot needs |
| --- | --- | --- | --- | --- |
| `.shift-hero-art` | `lesson-what-changes-when-you-design-the-task-instead-of-the-app.webp`, 1600x900, alpha | `chapter1-lesson1-hero.webp` | 1600x900 | 16:9, at least 1426 wide, framed by `shift-hero-art--plate` |
| `.writing-scene` | `what-changes-when-you-design-the-task-instead-of-the-app-scene.webp`, 1600x900 | `chapter1-lesson1-dispatcher.webp` | 1200x675 | 16:9, **at least 1664 wide** |
| `.shift-concept-art` | `what-changes-when-you-design-the-task-instead-of-the-app-idea.webp`, 1200x800 | `chapter1-lesson1-human-decision.webp` | 1200x675 | **3:2**, at least 880 wide |

Files go under `img/writing/shift/narrative-ink/chapter-1/`. Change only each
tag's `src` (with `?v=1`), `width`, `height`, and `alt`. Keep the captions, the
comparison figures, the flow list, the checks, and all CSS.

## Two mismatches to resolve first

Measured on the live layout with `node scripts/narrative-ink.mjs shots`, not
read from the stylesheet:

1. **The concept picture would be squashed.** `.shift-concept-art` declares
   `aspect-ratio: 3 / 2` with the default `object-fit: fill`, so a 1200x675
   (16:9) file is stretched to 3:2, about 19 percent taller than drawn. The fix
   is the picture, not the slot: re-export the concept at 1200x800, or redraw
   it at 3:2. Changing the slot's CSS would change every concept card in the
   series. If neither is possible today, ship the hero and the scene and leave
   the concept on the current picture.
2. **The scene would be soft on a 2x screen.** `.writing-scene` renders 832 px
   wide from 64rem, so it needs 1664 px. The current file is 1600 (already a
   little short, and the before run flags it); the pilot's 1200 would be
   noticeably soft at desktop. Export it at 1920x1080 from the master. If the
   bundle has no larger master, it can ship at 1200 with that noted as a known
   shortfall, but it should not be the model the rest of the series copies.

And one check the installer cannot make:

3. **The hero's ground.** Heroes have sat on the chapter ground with a
   transparent background since #1189. If `chapter1-lesson1-hero.webp` carries
   warm paper, it will read as a pale rectangle on the sage ground. Knock the
   paper out to alpha, or confirm on the after screenshot that it does not
   show.

## Alt text

- Hero: `alt=""`, as now; the title beside it says what the lesson is.
- Scene: describe the drawing as it is, keeping the caption true. Draft, to
  check against the picture: "An engraved drawing of a dispatcher at three
  screens, a phone on her shoulder, copying a number onto the notepad that is
  the only place the three meet."
- Concept: name the object and the state. Draft: "Three tools, a truck, a
  clock, and a list, lined up behind a single card under a person's hand."

Rewrite both drafts once the pictures can be seen; an alt for a picture
nobody has looked at is a guess.

## Checks for the pilot

```bash
node scripts/narrative-ink.mjs palette img/writing/shift/narrative-ink/chapter-1 --chapter 1
node scripts/narrative-ink.mjs shots writing/what-changes-when-you-design-the-task-instead-of-the-app.html --label after
node scripts/deployable.mjs && node scripts/tokens.mjs && node scripts/counts.mjs && node scripts/seo.mjs && node scripts/keys.mjs && node scripts/oxford.mjs
node scripts/readtime.mjs writing/what-changes-when-you-design-the-task-instead-of-the-app.html
node scripts/resting.mjs writing/what-changes-when-you-design-the-task-instead-of-the-app.html --strict
node scripts/states.mjs writing/what-changes-when-you-design-the-task-instead-of-the-app.html --strict
node scripts/narrative-ink.mjs manifest
```

Compare `img/inbox/narrative-ink/after/` with the before set. The six icons in
the bundle go into `img/writing/shift/narrative-ink/chapter-1/` as library
assets with their 512 masters, and onto no page: the lesson has no icon slot,
and the spec does not add one to use them.

**Do not change** `writing/index.html`'s four chapter images until all four
emblems are ready together.
