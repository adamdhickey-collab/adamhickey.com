# Chapter 1 pilot: integration notes

The pilot's pictures arrive as a separate bundle,
`shift_chapter1_illustration_pilot_v2.zip`. Its bytes are not in this branch
yet. Nothing in the lesson points at a path under
`img/writing/shift/narrative-ink/` until the files are in the repository.

**Status, 2026-11-14:** the bundle was not found on the working Mac (Downloads,
Desktop, Documents, iCloud Drive, the temp folders, a Spotlight search for its
name and for `apply-lesson1.py`). The lesson is unchanged. Everything that does
not need the pictures is done: the spec, the manifest, the briefs, the two
checks, and "before" screenshots of the lesson at 390, 768, and 1440.

## Where to put the bundle

```
~/Downloads/shift_chapter1_illustration_pilot_v2.zip
```

Unpack it into its own empty folder outside the repository, and run its
installer against this branch's worktree, dry run first:

```bash
mkdir -p ~/Downloads/shift-pilot && unzip -o ~/Downloads/shift_chapter1_illustration_pilot_v2.zip -d ~/Downloads/shift-pilot
python3 -I ~/Downloads/shift-pilot/apply-lesson1.py --repo /Users/adamhickey/Projects/adamhickey-narrative-ink --dry-run
```

Read the installer and its dry-run diff before `--apply`. Then resolve the two
mismatches below before committing.

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
