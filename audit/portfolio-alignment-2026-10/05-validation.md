# Validation, 2026-10-27

Every check was run in the cloud container with its own Chromium
(`CHROME=/opt/pw-browsers/chromium`), scoped per `CLAUDE.md`'s table: the
fast five on every change, the six browser checks on the pages touched.
No stylesheet changed, so the whole suite was not run; the post-merge sweep
on `main` is the full one. The browser checks ran one at a time.

## The fast five, and the two Tailwind steps

| Check | Result |
| --- | --- |
| `deployable.mjs` | ✓ no symlinks, nothing tracked that `.gitignore` matches |
| `tokens.mjs` | ✓ 134 names across 5 documents, 323 declared in 19 stylesheets, 7 retired by name, 59 resolved by the design system page |
| `counts.mjs` | ✓ 33 claims across 7 documents, 38 pages |
| `seo.mjs` | ✓ 38 canonicals, 38 Open Graph cards, 81 structured-data nodes, 38 sitemap entries. `--write` restamped the edited pages and the sitemap |
| `keys.mjs` | ✓ every list, eyebrow and count matches its headings; `--write` moved nothing but the writing index's read-time meta |
| Tailwind rebuild | `diff -q` identical to the committed `case-tailwind.css`, after the role rows, the CBRE line and the SAP close changed words on three Tailwind pages |
| CDN compiler grep | not run here; no Tailwind page gained a script |

`readtime.mjs --write`: 27 read times, every label holds except one.
"What should a working prototype actually prove?" went from 5 to 4 minutes
after its one stage-setting line came out (1,008 words with two pictures was
on the rounding boundary), and the writing index's meta followed it. The
position article holds at 6 after losing about a hundred words.

`variant.mjs --status`: the base ordering (craft), with the new dek and the
new six facts.

## Browser checks, scoped

Two batches, because the pass had two rounds. Counts are the scripts' own
lines. A filter of `index.html` matches the four index pages (homepage,
writing, lab, design system), which is why the first batch reports 20 pages
for 18 arguments.

**Batch one**: the homepage, `other.html`, the four How I work pages, Agent
Review, the SAP and dispatch case studies, the writing index and eight
articles (18 arguments, 20 pages, plus the cockpit's one reachable state).

| Check | Result |
| --- | --- |
| `resting.mjs --strict` | ✓ 3,635 measurements; 18 measured against artwork. One pre-existing near-pass noted, `.ds-surface-kicker` at 4.6:1 on the design system page, untouched by this pass |
| `states.mjs --strict` | ✓ 1,741 measurements across 1,676 state rules. The four How I work pages' `button:focus-visible` on a gradient "cannot be measured from computed style", as before |
| `typescale.mjs` | ✓ 14,850 across 20 pages at four widths, plus 4 reachable-state renders, plus 84 on `--type-title-inset` |
| `curves.mjs` | ✓ 8,453 elements |
| `cards.mjs` | ✓ 132 raised surfaces |

**Batch two**: the lab index, this-site, While We're Here,
enterprise-consulting, SAP, the design system page, and the eight articles
edited in the second round (14 pages).

| Check | Result |
| --- | --- |
| `resting.mjs --strict` | ✓ 1,536 measurements; 4 against artwork |
| `states.mjs --strict` | ✓ 1,120 measurements across 1,133 state rules; the same one gradient note |
| `typescale.mjs` | ✓ 6,032 at four widths |
| `curves.mjs` | ✓ 3,503 elements |
| `cards.mjs` | ✓ 60 raised surfaces |

## The counts that moved, reconciled against the base

The base is `main` at 6b512d0, extracted with `git archive` and measured
with its own scripts, scoped the same way. Only two pages gained or lost
elements; every other edit changed words inside elements already counted.

| Page (filter) | resting | state rules | state measurements | type sizes | curve elements | raised |
| --- | --- | --- | --- | --- | --- | --- |
| `index.html` (4 pages), base | 1700 | 359 | 462 | 6994 | 3553 | 41 |
| `index.html` (4 pages), now | **1706** | 359 | **465** | **7014** | **3563** | **42** |
| `other.html`, base | 39 | 84 | 57 | 164 | 114 | 0 |
| `other.html`, now | **36** | 84 | **56** | **152** | **104** | 0 |

**The homepage, +6 / 0 / +3 / +20 / +10 / +1, is the dispatch card and the
pencil.** The card is thirteen elements: the `a`, `.case-thumb`, `img`,
`h3`, `.case-desc`, `.tag-row`, three `.tag` spans, `.case-go`, its `svg`
and two `path`s. Six hold text (`h3`, the description, three tags, the
go-label), which is resting +6. The go-label is `aria-hidden`, so
`typescale.mjs` counts five at four widths: +20. The pencil glyph is an
`svg` and three `path`s where the branch was an `svg`, a `g` and five
`path`s, so the strip gives up three elements: 13 − 3 is the +10. The card
is one raised surface, +1. State rules held at 359, as they must when no
stylesheet changes; the three extra state measurements are the card's own
hover and focus under the rules already counted. The lab index's new kicker
and the writing index's dek changed words inside counted elements.

**`other.html`, −3 / 0 / −1 / −12 / −10 / 0, is the dispatch row leaving.**
Ten elements: `section`, `.container`, `article`, `.other-feature-body`,
`h2`, `.other-lead`, `.product-actions`, its `a`, the `.other-feature-shot`
link and its `img`. Three hold text (`h2`, the lead, the link), which is −3
and, at four widths, −12. The page had no raised surface before or after;
the book row and the shelf stay.

Nothing came back smaller for a reason other than an element leaving, and
no page left measurement.

## What was not run, and why

- The unscoped suite: no shared stylesheet changed. `main`'s post-merge
  `checks.yml` run is the full sweep.
- `og.mjs`: no page title changed, so no share card needs re-rendering. The
  lab index's kicker is not on its card.
- Captures (`lab-shots.mjs`, `lucy.mjs`, `dcf.mjs`, `cycle-card.mjs`): the
  sibling checkouts are not in this container. The one picture worth
  retaking, the homepage lab card's placeholder screens, has a brief in
  `01-audit.md`.
- `indexnow.mjs --submit`: runs after the deploy lands, not before.

## The résumé

`node scripts/resume.mjs` and `--full`, both rendered here: the reading
copy at 148,271 bytes and the detailed copy at 132,276, each at 1056px of
1056. A fourth Selected work line on the reading copy put it at 1121px and
was taken back out.
