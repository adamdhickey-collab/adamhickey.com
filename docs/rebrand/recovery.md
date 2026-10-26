# Recovering the product-design portfolio

The site that existed before the visual/brand repositioning is archived, whole
and recoverable, in three independent places. Nothing in the repositioning
deleted it.

## What is archived

The complete site as it stood at the moment the repositioning branch was cut:
the product-design homepage, all 11 case studies, the lab (Agent Review and
the motion piece), the 16 writing pages, the 4 engagement ("How I work")
pages, the design system page, the dispatch cockpit prototype, both résumé
PDFs, every image, every check script, and all seven spec documents
(CLAUDE.md, README.md, VOICE.md, COLOR.md, TYPOGRAPHY.md, SPACING.md,
MOTION.md). 574 tracked files.

## The identifiers

| What | Value |
| --- | --- |
| Archived commit | `8e15228878a20ed92ad96a12e566b84b32fbc3cd` |
| Archive branch | `archive/product-design-2026-10-26` |
| Annotated tag | `portfolio-product-design-2026-10-26` |
| GitHub Release | https://github.com/adamdhickey-collab/adamhickey.com/releases/tag/portfolio-product-design-2026-10-26 |
| ZIP snapshot | `adamhickey.com-product-design-2026-10-26.zip` on the release, SHA-256 `7732013ff22c84be23aa105a15941f6f8989a4af176267b3fea6fc019df13ee6` |
| Before screenshots | `before-screenshots-2026-10-26.zip` on the release: full-page 1440px captures of 23 pages, SHA-256 `adb6055bbff035a72aa9ee51d71e0ecc4fee7783777c92b246298a30d107a209` |
| Archived on | 2026-10-26 |

The branch and the tag both point at the archived commit exactly (verified by
`git ls-remote` the day they were pushed). **Never force-update or delete
either one.** The ZIP is the backstop that survives even a git accident; it
was produced by `git archive 8e15228 --format=zip`, so it holds every tracked
file and nothing untracked.

To re-create the ZIP locally at any time:

```bash
git archive portfolio-product-design-2026-10-26 --format=zip -o product-design-archive.zip
```

## How to restore the whole site

The restore goes through a normal pull request — no force-push, no history
rewrite. It makes one commit whose tree is exactly the archived tree:

```bash
git fetch origin
git checkout -b restore/product-design origin/main
git rm -rq .
git checkout portfolio-product-design-2026-10-26 -- .
git commit -m "Restore the product-design portfolio from the 2026-10-26 archive"
git push -u origin restore/product-design
```

Open a PR from `restore/product-design`, review the diff (it should read as
the repositioning in reverse), and squash-merge. Pages deploys `main` on
every push, so the old site is live about a minute after the merge. Then run
the post-merge checklist from CLAUDE.md: confirm a *Deploy static site to
GitHub Pages* run exists on the merge commit, and sync the branch.

## How to restore a single page or asset

```bash
git checkout portfolio-product-design-2026-10-26 -- case-study/lucy-learns.html
```

Any path from the archived tree can be pulled into a working branch this way.
Mind the cache-buster: if a restored stylesheet's bytes differ from what
`main` serves at that path, bump its `?v=` on the pages that load it.

## Where the repositioning lives

The redesign was built on `claude/visual-brand-repositioning`, cut from the
archived commit itself, so `git diff portfolio-product-design-2026-10-26..claude/visual-brand-repositioning`
is the entire repositioning and nothing else. The decision record for the
repositioning is the rest of `docs/rebrand/`.
