# Quality review

What was checked on the repositioned site before the pull request, what
the checks found, what the eye found, and what is left. The screenshots
this refers to are in `screenshots/` beside this file, before and after at
half scale; the full-size "before" set is on the archive release
(`recovery.md`).

## The checks

Run on the final tree of the branch, every page, with the runner's
Chromium.

| Check | Result |
| --- | --- |
| `deployable.mjs` | Passes: no tracked symlink, nothing tracked that `.gitignore` matches |
| `tokens.mjs` | Passes: 134 names across 5 documents against the declarations in the tree |
| `counts.mjs` | Passes: 33 claims across 7 documents, 42 pages; every page-count sentence and the README family table moved to the tree as it stands |
| `seo.mjs` | Passes: 42 canonicals, 42 Open Graph cards, 84 structured-data nodes, 42 sitemap entries; the four `engagement/` redirect stubs are not pages |
| `keys.mjs` | Passes: every article's list and eyebrows match its headings |
| `resting.mjs --strict` | Passes: 8,307 measurements across 43 pages plus 8 reachable states |
| `curves.mjs` | Passes, 43 pages |
| `cards.mjs` | Passes, 43 pages |
| `typescale.mjs` | Passes, 43 pages at four widths |
| `readtime.mjs` | Passes on every page that states a read time |
| `states.mjs --strict` | Passes |

Two defects the checks caught during the work, both fixed at the source:
the About portrait's caption measured 2.57:1 on the clip's brightest frame
when a 768px column shrank the circle to 235px (the portrait now stacks
above its text until 1024), and the band-and-paper figures in `work.css`
put a muted caption inside a project's colour and drew no card edge (the
ground and edge are on the picture now, and the caption stays on the page).
The Tailwind build was rebuilt after two pages left that regime and six
words of alt text were reworded so the build emits no stray utility.

## The eye

Reviewed at 375, 768 and 1440, scrolled so lazy images had loaded.

- **Homepage.** The headline sets at two lines on a phone and on a desktop.
  The wall reads as one shelf; the Say When tile, the Innovators identity,
  the Door County board, Lucy's welcome screen, the Fulton site and the
  bear hold their crops. The flagship band, the featured card, the four
  cards and the depth row descend in weight. What I bring and About read as
  one column on a phone and two from 768 and 1024 respectively.
- **Say When.** The storefront reads as a brand, not as this site; the
  concept label sits in the first line of every page; the finder works by
  keyboard with its states visible; the checkout says it is pretend. The
  case study is the longest page on the site (14 minutes) and every chapter
  earns its figure; a tighter cut is a candidate for a follow-up.
- **Innovators Studio, Door County Found, Lucy Learns, the studio years.**
  The hero facts and cover land before the first paragraph; strips and
  grids keep the pictures large; the captions carry the decisions. Every
  claim and caveat from the previous pages is present.
- **The enterprise pages.** Unchanged templates, new framing; they read as
  depth under the creative work, which is the intent.
- **Navigation.** Six links on every page; the wordmark and its reveal as
  they were; the four retired addresses redirect to Approach and say so.

## Keyboard, motion, reduced motion

Every link and control reachable by Tab with a visible ring; the storefront
cart drawer traps focus and closes on Escape; the finder is a set of
buttons with `aria-pressed`. Under `prefers-reduced-motion: reduce` nothing
animates and nothing is hidden: the chapter arrivals, the wall's hover
lift, the card tilt and the storefront's pour all stop, and the portrait
clip pauses with its control still present.

## What is left

- `style.css` still carries the previous homepage's hero, proof strip,
  engagement grid and scroll-story rules, which nothing selects now. A
  dead-CSS pass with before-and-after measurement is the next change to
  that file; it was kept out of this one so the repositioning diff stays
  readable.
- `scripts/variant.mjs` and the private résumé variants were written for
  the previous homepage and résumé and no longer apply.
- The Say When share card and homepage tile are renders of the SVG
  artwork; real photography is briefed in `asset-manifest.md`.
- The `docs/rebrand/` folder deploys with the site (Pages uploads the
  repository root). The pull request proposes keeping `docs/` out of the
  artifact.
- The previous site's CLAUDE.md ledger of measured counts closes on the
  38-page tree; the next ladder starts from this merge's sweep.
