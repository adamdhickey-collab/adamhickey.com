# Product Systems: The Shift's picture system

**Scope.** Every picture in When Software Starts Making Decisions (The
Shift): the series landing (`writing/index.html`), the twelve lessons, and
the share-card pictures `scripts/og.mjs` names. It replaced the Narrative Ink
engravings on 2026-11-16; their documents are kept, marked historical
([NARRATIVE_INK_PANORAMA.md](NARRATIVE_INK_PANORAMA.md) and its neighbors).
The live inventory, generated, is
[PRODUCT_SYSTEMS_MANIFEST.md](PRODUCT_SYSTEMS_MANIFEST.md).

**What a picture is.** A conceptual interface diagram of the decision or the
mechanism a lesson turns on: Fleet, Hours, and Orders feeding one Assign load
card, a Paid status that unfolds into three checked facts, a run that pauses
at a boundary. It is not a screenshot and claims no shipped product looks
like it. Coherence, not sameness: one grammar, twelve different mechanisms.

## The grammar

| Part | Rule |
| --- | --- |
| Canvas | `--color-warm`, flat. No gradient, grain, glass, or decoration. |
| Card | `--color-white`, 18-unit corner, 1.5-unit `--color-tag-border` hairline, a two-step shadow (1-unit and 14-unit blur, charcoal at 5% and 6%). |
| Title | Montserrat 600 in `--color-charcoal`, 24 to 34 units on a 1280-wide frame. |
| Secondary label | Montserrat 500 in `--color-muted-gray`. Section labels are tracked, never uppercase in the art. |
| Skeleton line | A `--color-tag-border` bar with round ends, where words would only be decoration. |
| Icon tile | One glyph from the set below, 1.6 stroke on a 24 grid, in the chapter's `-ink`, on a tile of the chapter's `-soft` with a `-ground` edge. |
| Connector | 2-unit `--color-muted-gray` line with an open chevron head; the one path the picture is about takes the chapter's `-fill`. Dashed means not yet known. |
| Done | A `-fill` circle with a white tick. |
| Not yet | An open dashed `--color-muted-gray` ring. Nothing reads finished that is not. |
| Pill | Accent (`-soft` ground, `-ink` text), solid (`-ink` ground, white text), or neutral (dashed, `--color-muted-gray`). |
| Button | Primary is `-ink` with white text; secondary is white with a `--color-rule` edge. |
| Key element | One card per picture takes the chapter's `-fill` as its edge, at 2 to 2.5 units. |

The accent sits only on controls, state marks, connectors, and that one
element. White on each chapter's `-ink` is 6.0:1 or better (COLOR.md,
section 2), so every solid pill and button clears 4.5:1.

**The palette is read, not typed.** `scripts/lib/product-systems-art.mjs`
reads every color from `color.css` and `writing/shift.css` at build time,
the four chapters through `--shift-{sage,slate,terracotta,plum}-{fill,ground,soft,ink}`.
A token that moves moves the pictures on the next build, and a token that is
missing stops the build.

## The kinds

| Kind | Frame | Export | Served as | Where |
| --- | --- | --- | --- | --- |
| Lesson hero | 1280x720 (16:9) | 1600x900 WebP | `heroes/lesson-NN.webp` | The lesson's hero, and small in the foot of the lesson before |
| Chapter picture | 1280x720 (16:9) | 1600x900 WebP | `chapters/chapter-N.webp` | The landing's mosaic tile and its chapter band: one file, two placements |
| Icon | 64x64 | the SVG itself | `icons/chN-<name>.svg` | Leads a row in `.shift-stack` and `.shift-stages.has-art` |
| Comparison | 960x640 (3:2) | 1200x800 WebP | `pairs/lesson-NN-<name>.webp` | The two halves of a split in lessons 7 and 9 |
| Share picture | 840x840 | 840x840 WebP | `social/chapter-N.webp` | Framed beside the title in each lesson's 1200x630 card |

All under `img/writing/shift/product-systems/`, each next to the SVG it was
exported from. Anything with words is rasterized: an SVG loaded as an `<img>`
cannot load a web font, and a fallback face would set every label at a
different width. Icons have no words, so they stay vector.

The chapter pictures are the chapter's arc as a flow of cards, the same
grammar as the heroes, so the landing reads as their table of contents:
Context, Task, and Decision; Know, Act, Check, and Stop; Define the bar to
Evaluate and ship; Research, Onboarding, and Redesign. The share pictures
are the same arcs, stacked to fit a square.

## Placing them

- **Hero.** A surface on the chapter's ground: the chapter's `-fill` as its
  edge, `--radius-xl`, `--shadow-card`, 16:9. From 64rem it fills the right
  column beside the title; below, it sits under the title at the column's
  width. No `mix-blend-mode`: the engravings printed white paper through
  multiply, and a diagram has a ground of its own.
- **Phone.** At 390px a hero is about 340px wide and its labels are about
  8px. That is deliberate: on a phone the diagram is a picture of the
  mechanism, and the meaning is carried by its alt text and the caption
  under it, both of which say what the diagram shows.
- **Alt text.** Heroes, comparisons, and the chapter bands carry alt text
  that says what the diagram shows, because each now carries the lesson's
  content. The mosaic tile and the next-lesson picture are repeats beside
  words that say the same, and take `alt=""`. Icons take `alt=""`: the row
  names them.
- **Caption.** Each hero's caption describes the diagram in its own terms
  and ends on a dry second line. The captions were rewritten with the
  pictures, because the old ones described engravings that are gone.

## The icon set

Fifty-six icons, one per row the lessons already had, drawn from a set of
glyphs in `product-systems-art.mjs` (`G`). Each is one simple outlined form,
original to this series. The name says what the row is, not what the
picture draws; the manifest has every old to new pair.

## Regenerating

```bash
node scripts/product-systems.mjs build            # every SVG and WebP, from the scenes
node scripts/product-systems.mjs build hero       # or one kind, or an id: 7, ch3-trust
node scripts/product-systems.mjs manifest         # rewrite the manifest from the pages
node scripts/product-systems.mjs manifest --check # exit 1 if anything is stale or stray
node scripts/og.mjs what- who- why- how-do writing # the thirteen share cards
```

`build` needs Chrome (`CHROME`, as for the checks) and the network once, for
Montserrat. When the bytes at a path change, bump that path's `?v=` on every
page that loads it, and the `og:image` `?v=` on the pages whose card changed.

To change a picture, change its scene in
`scripts/lib/product-systems-scenes.mjs` and rebuild: never edit an exported
WebP or a generated SVG by hand. To add one, add it to the registry in
`scripts/lib/product-systems-registry.mjs` (the one list the build and the
manifest read), then a scene for it.

## Counts

At 2026-11-16: **80 artworks** (12 heroes, 4 chapter pictures, 56 icons, 4
comparisons, 4 share pictures) in **104 placements**, 91 on the thirteen
pages and 13 in the share-card registry. The 80 replace the 80 Narrative Ink
originals the series placed, one for one; the four share pictures replace
the chapter engravings og.mjs used, `img/writing/shift/chapter-N-wide.webp`.
About 1 MB in all, every hero under 40 KB.

## History

- 2026-11-14: The Shift ships with chapter engravings (#1178).
- 2026-11-15: Narrative Ink, a panorama-and-icon engraving system (#1193 and
  after).
- 2026-11-16: Product Systems replaces every picture in the series. It was
  meant to start from a supplied kit; the kit never reached the repository,
  so the generator was written here, from the approved four-chapter
  reference, and there is no approved Lesson 1 raster to match.
