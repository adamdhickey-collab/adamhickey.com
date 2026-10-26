# The unified direction, shelved

On 2026-10-26 the site was rebuilt as one portfolio for one career, the
graphic designer's eye and the enterprise product work told together under
the title Senior Product Designer, and shelved the same day in favor of the
product-design site that was already live. The live site at adamhickey.com
was never changed. This branch keeps everything that was made, so the
direction can be picked up again or quoted from.

Unlike the visual direction's archive, where the redesign sits under
`visual/` beside the live site, this tree is the redesign itself: the
repository root here is the unified site as it was built, cut from `main`
at `8e15228` and never merged.

## What is here

| Path | What it is |
| --- | --- |
| The repository root | The unified site, 42 pages: the homepage rewritten on the site's own design (the hero, six facts, Selected work as six cards, What I bring in place of How I work, Experiments and independent work, About as one story), on `main`'s type, color and shell |
| `case-study/` | SAP, USDA, dispatch and the enterprise years kept and reframed; Innovators Studio, Lucy Learns, Door County Found and the studio years rebuilt on `work.css` from the creative branch's revisions; `say-when.html` new |
| `say-when/` | The Say When storefront prototype, seven pages, a self-initiated fictional coffee brand labeled as such on every page |
| `engagement/` | The four "How I work" pages as redirect stubs to What I bring (meta refresh, `noindex`), which the checks treat as not pages |
| `lab/`, `writing/` | The lab retitled Experiments; the writing kept, with Related rows pointed at What I bring |
| `scripts/resume.mjs`, the two PDFs | Both résumé copies rewritten for senior product design roles with a visual-craft focus; title, employers, dates and figures unchanged |
| `docs/unified/design-note.md` | The decision record: the positioning, the three directions and the one kept, what happened to every page, what the counts did, what still needs a local pass, and the three-chair critique |
| `docs/unified/screenshots/` | QA captures at 375, 768, 1280 and 1440, with motion on and with keyboard focus, for the homepage, the four rebuilt case studies, Say When and Experiments |

Say When is a self-initiated fictional coffee brand. None of it is for sale,
and its packaging images are renders, not print runs.

## How to look at it

```bash
git fetch origin
git worktree add ../adamhickey-unified portfolio-unified-direction-2026-10-26
python3 -m http.server 8321 --directory ../adamhickey-unified
```

Then open http://localhost:8321/. Every link is relative, so the whole site
works from there, the storefront at http://localhost:8321/say-when/ and the
design note at `docs/unified/design-note.md`.

The same tree is on the GitHub Release for this tag as a ZIP, for a look
without git.

## Why it is not indexed

It was never deployed. GitHub Pages ships `main` and nothing else, so this
tree has no address, and its canonicals, Open Graph tags and JSON-LD still
name the root paths at https://adamhickey.com/. Hosting it for reference
would be a separate step: a `noindex` on every page, out of the sitemap,
the absolute URLs repointed, and no links between it and the live site, the
same list the visual direction's `docs/rebrand/SHELVED.md` wrote down.

## Where it stopped

The branch was finished and checked as a whole-site replacement: the fast
five and the six browser checks run unscoped on both trees, the counts
reconciled page by page, and pull request #641 opened for review. Adam read
it and kept the product-design direction instead. Two things were on the
table when it stopped:

- **Selected work.** The brief's six-project table put SAP, Innovators
  Studio, Lucy Learns, Door County Found, the studio years and Say When on
  the band, which moved USDA and dispatch off it. The pull request's own
  critique names that the weakest point for a product-design hiring
  manager, and the proposed fix, not made, was SAP, USDA, dispatch,
  Innovators Studio, Lucy Learns and Door County Found, with the studio
  years in Career and Say When under Experiments.
- **Pictures.** The design note lists the captures and drawings that need
  a local pass (the sibling checkouts and the ChatGPT drawing loop are not
  reachable from the cloud session that built this).

## Related

- The visual and brand direction is archived as tag
  `portfolio-visual-direction-2026-10-26` and branch
  `archive/visual-direction-2026-10-26`, with `docs/rebrand/SHELVED.md`.
- The product-design site, which stayed live, is archived as tag
  `portfolio-product-design-2026-10-26` and branch
  `archive/product-design-2026-10-26`, with a ZIP on its GitHub Release.
- The working branch `claude/unified-ux-visual-portfolio` and pull request
  #641 (closed, not merged) hold the history.
