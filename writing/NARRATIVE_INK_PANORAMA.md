# Narrative Ink Panorama — Editorial illustration system (pilot)

**Scope:** The Shift in Product Design, 12 Writing lessons / 4 chapters. This document governs narrative editorial illustrations only. It does not override `COLOR.md`, the site's interaction icons, article text, or the real screenshots/diagrams used as evidence.

## Visual grammar

- Shared black ink `#252525` and warm paper `#F5F5F0`. High-contrast woodcut and engraved linework, crosshatching, stippling, densely populated miniature scenes, theatrical layering, and large cloud-shaped negative spaces.
- ONE chapter accent per artwork; accent is a rare structural highlight, not a large multicolor wash. The CSS chapter colors are canonical and already defined in `writing/shift.css`:
  1. **The job is changing:** sage `#657D60`.
  2. **Inside the agent:** slate `#56718C`.
  3. **Designing the product:** terracotta `#C0714E`.
  4. **In practice:** plum `#7A5A78`.
- Avoid adding the red, yellow, rose, pastels, gradients, photorealism, or generic glossy 3-D effects from older assets or generated examples. Don't import unrelated Japanese cultural motifs merely because the visual references have them.
- Subject matter is contemporary design and human decisions; the concept of each lesson determines the scene, not a generic robot motif.

## Three levels of illustration

1. **Panoramic hero** — 16:9, circa 1600×900; ambitious detailed narrative with quiet space, useful when scaled responsively.
2. **Supporting vignette** — 16:9 or 3:2 per existing slot; one clear idea, fewer secondary objects, consistent ink texture.
3. **Editorial pictogram** — single metaphor, consistent contour weight and limited hatching, no captions baked into the image; 512px transparent source, 256px web rendition. Never use these intricate raster icons as functional 16–24px UI controls.

## Semantic integrity

- Preserve the meaning of existing lesson copy and captions; judge artwork by how well it communicates a specific argument.
- Do not replace actual product screenshots with invented diagrams.
- Keep literal labels, steps, checklists, and evidence in semantic HTML/SVG. Imagery may decorate but may not substitute for the accessible explanation.
- Add accurate alt text when artwork conveys meaning; use empty alt when redundant to adjacent HTML labels.

## Pilot review gate

The first pilot is Lesson 1, `writing/what-changes-when-you-design-the-task-instead-of-the-app.html`. It illustrates a dispatcher moving between truck-map, driver-hours, and orders data, and the agent gathering evidence before a human decision. Treat examples as editorial metaphors, never as real Dispatch Cockpit screenshots.

The package supplied separately for local review contains three WebP scenes, six engraved icons, a contact board, an HTML review preview, a JSON manifest, and a staged-change installer. **Do not point published pages to package paths until the image files have been added to the repository.**

Approval requires: visual match to the four chapter colors, legibility at mobile widths, no conflicting depiction of the lesson, optimized assets, alt-text review, no broken references, and no accidental style changes outside Lesson 1. Roll out by chapter after this pilot is accepted.
