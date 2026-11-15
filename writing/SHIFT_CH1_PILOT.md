# Chapter 1 pilot: integration notes

The pilot's pictures arrive as a separate bundle,
`shift_chapter1_illustration_pilot_v2.zip`. Its bytes are not in this branch
yet. Nothing in the lesson points at a path under
`img/writing/shift/narrative-ink/` until the files are in the repository.

**Status, 2026-11-14: installed.** The bundle's installer ran dry, then
applied, on this branch. Lesson 1 now shows the three pilot pictures. What was
done to them, and what is still open:

| Picture | As shipped in the bundle | As committed | Why |
| --- | --- | --- | --- |
| `chapter1-lesson1-hero.webp` | 1600x900, 457 KB | 1600x900, 289 KB | Re-encoded at WebP quality 0.7; no visible loss at 1:1 on the finest hatching. Alt set back to `""`, the series rule for a hero beside its title. |
| `chapter1-lesson1-dispatcher.webp` | 1200x675, 299 KB | 1200x675, 203 KB | Re-encoded at 0.7. |
| `chapter1-lesson1-human-decision.webp` | 1200x675 (16:9), 295 KB | 960x640 (3:2), 133 KB | Cropped to the slot's ratio, 94 px off each side, so it is no longer drawn 16 percent too tall; then scaled and re-encoded. The dispatcher, the board, the agent, and both buttons are inside the crop. |

Page picture weight: 222 KB before, 1,051 KB as shipped, 625 KB as committed.

**Open, for review:**

1. **The scene is soft on a 2x screen** at 768 and 1440 (1200 px file in a
   620 and 832 px slot). Needs a 1920x1080 export from the master; the bundle
   has none.
2. **The hero carries its paper**, so it sits on the sage ground as a pale,
   square-cornered rectangle where the old hero was transparent. Either
   knock the paper out at the source or accept the plate and give the slot's
   pictures a consistent treatment across the series; that second choice is
   a stylesheet decision, not made here.
3. **Two things in the art break the spec as written**: a humanoid robot
   stands for the agent in the hero and the concept, and the dispatcher's
   jacket carries a wave pattern from the reference prints. Either the
   pictures change or section 1's "Never" list does, before the series
   copies them.
4. **The six icons fail the palette check**: 13 to 32 percent of their
   pixels are a yellower green than sage `#657D60`. They are in the library
   (`chapter1-icon-*.webp` and `@512.png` masters) and on no page; correct
   their hue before any placement.

## Exact image mapping

In `writing/what-changes-when-you-design-the-task-instead-of-the-app.html`:

| Slot | Current file | Pilot file | Pilot size | Slot needs |
| --- | --- | --- | --- | --- |
| `.shift-hero-art` | `lesson-what-changes-when-you-design-the-task-instead-of-the-app.webp`, 1600x900, alpha | `chapter1-lesson1-hero.webp` | 1600x900 | 16:9, at least 1426 wide, **paper knocked out to alpha** |
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
