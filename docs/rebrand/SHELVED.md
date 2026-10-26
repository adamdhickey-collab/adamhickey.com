# The visual direction, shelved

On 2026-10-26 the site was redesigned around senior digital design, brand-led
visual work and interactive craft, then shelved the same day. The live site
at adamhickey.com was never changed. This branch keeps everything that was
made, so the direction can be picked up again.

## What is here

| Path | What it is |
| --- | --- |
| The repository root | The live product-design site, byte for byte as `main` had it at `8e15228` |
| `visual/` | The redesigned site as it was built: the homepage, the twelve case studies, the writing and experiments indexes, the rewritten résumés, and the Say When storefront under `visual/say-when/` |
| `visual/_type-trial.html` | A switcher that shows the redesign in five other type pairings |
| `docs/rebrand/` | The decision record: the audit, positioning, architecture, visual system, the Say When brief and identity rationale, the asset manifest, the quality review, and `recovery.md` for the product-design archive |
| `docs/rebrand/type-trial/` | The type contact sheet and the script that applies the chosen pairing |
| `docs/rebrand/screenshots/` | Before and after captures of the redesign |

Say When is a self-initiated fictional coffee brand. None of it is for sale,
and its packaging images are renders, not print runs.

## How to look at it

```bash
git fetch origin
git worktree add ../adamhickey-visual portfolio-visual-direction-2026-10-26
python3 -m http.server 8320 --directory ../adamhickey-visual
```

Then open http://localhost:8320/visual/. The pages link to each other
relatively, so the whole edition works from there. To try the type
pairings, open http://localhost:8320/visual/_type-trial.html.

## Where it stopped

The redesign itself was finished and checked as a whole-site replacement
(`docs/rebrand/quality-review.md`). Moving it under `visual/` was the next
step, and only its first commit landed. Before `visual/` could go live:

- **Absolute URLs.** The canonical links, Open Graph tags and structured data in `visual/` still name the root paths. They would need `/visual/` added.
- **Checks.** The check scripts don't yet treat `visual/` as a second site. The root has to measure exactly as `main` does, and `visual/` needs a pass of its own.
- **Indexing.** No `noindex` tag yet. The plan was to keep `visual/` out of search and out of the sitemap, with no links between the two sites.
- **Type.** Newsreader and Hanken Grotesk were chosen to replace Fraunces and Instrument Sans, and were tested on every page. They were never applied. To apply them, run `node docs/rebrand/type-trial/font-swap.mjs visual`, then update `TYPOGRAPHY.md`, the share cards and the résumés. Say When keeps its own type: Fraunces in its soft cut, outlined into the brand's artwork.

## Related

- The product-design site is also archived on its own, as tag
  `portfolio-product-design-2026-10-26`, with a ZIP on its GitHub Release.
- The working branch `claude/visual-brand-repositioning` and pull request
  #640 (closed, not merged) hold the history.
