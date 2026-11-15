# Chapter 1 pilot — integration staging notes

The first image pilot is distributed as a separate ZIP (not committed in this branch yet). Asset bytes cannot be staged by the connected GitHub text-only writer; a local checkout or Claude Code can copy the files.

## Exact image mapping

In `writing/what-changes-when-you-design-the-task-instead-of-the-app.html`, replace three image elements:

| Existing image basename | Proposed image basename |
|---|---|
| `lesson-what-changes-when-you-design-the-task-instead-of-the-app.webp` | `chapter1-lesson1-hero.webp` |
| `what-changes-when-you-design-the-task-instead-of-the-app-scene.webp` | `chapter1-lesson1-dispatcher.webp` |
| `what-changes-when-you-design-the-task-instead-of-the-app-idea.webp` | `chapter1-lesson1-human-decision.webp` |

Stage the images under `img/writing/shift/narrative-ink/chapter-1/`. Update width/height to 1600×900, 1200×675, and 1200×675 respectively, and write captions/alt text reflecting the new illustration.

**Do not change** `writing/index.html`'s four chapter mosaic images until all four chapters have coordinated replacements; avoid one mismatched card in a series. Keep the existing semantic comparison diagram, flow list, checks, and all global CSS. The pilot includes six optional editorial icons, but the lesson has no existing illustrated-icon slots: do not insert them without a content reason.

For installation, use `apply-lesson1.py --repo <checkout> --dry-run`, then `--apply` on this branch. Review the resulting `git diff`, inspect responsive layouts and alt text, and test for broken references before publishing.

This branch deliberately does not change production HTML or site assets. See `writing/NARRATIVE_INK_PANORAMA.md` for the intended style.
