# Portfolio, client-safe edition

A variant of Adam Hickey's next-generation portfolio for audiences where the
independent products should not be shown yet.

**How this differs from the main version:**

- No "Built end to end" section: the two independently built products are
  absent from the homepage, the engagement pages, the stylesheet and the
  image folders. Their build write-ups are deleted rather than hidden, so
  nothing is reachable by URL.
- The Connect design system card on the shelf is a static `div`, not a link.
  It shows the work without opening the client's design system.
- Everything else tracks the main version: the same positioning, case
  studies, engagements, tree story and About.

The main version continues to be developed in `adamdhickey-collab/Claude-Local`
on `claude/next-portfolio-version-hfm0ba`, and the live `adamhickey.com` lives
in its own repository and is not modified by anything here.

## The staged portfolio

Forked from the **current live site** (`adamhickey.com` @ `ef927d5`), not from
the older copy in `00 Archive/`. Everything the live site had (the shared
header, the custom cursor, the flight-story HUD and route branches, the
kinetic lead-in quotes, the draw-in line icons, the email popover, the
case-study scroll motion) carries over unchanged.

| File | Notes |
| --- | --- |
| `index.html` | The new single-page portfolio (practice positioning) |
| `style.css` | Live stylesheet + a marked `V2 — INDEPENDENT PRACTICE ADDITIONS` block at the bottom |
| `site-nav.css` | Shared header, unchanged from live |
| `cursor.js` | Custom cursor, unchanged from live |
| `case-study/*.html` | Six case studies, same filenames/URLs as live |
| `case-study/case-motion.{css,js}` | Case-study scroll motion, unchanged from live |
| `img/CBRE.svg` | Local client logo |
| `img/portrait-illus.webp` | Hero portrait illustration, 900px square |
| `js/vendor/anime.esm.min.js` | anime.js 4.5.0 (MIT), vendored; scrubs the design-to-build scene against scroll |
| `img/about/*.webp` | Three About images, each as a frame thumbnail and a full size for the lightbox |
| `img/engagement/*.webp` | Four flat illustrations, one per engagement card |
| `Adam Hickey Resume.pdf` | Résumé linked from the header and footer; rendered by `scripts/resume.mjs` in the staging repository and copied here |
| `TYPOGRAPHY.md` | Type notes, carried over from live |
| `archive/adam-hickey-portfolio/` | Older portfolio snapshot, kept for reference |

### What changed vs. the live site

Structure: hero (new positioning, proof strip, client logos) → Selected work →
**Built end to end** (new) → Earlier experience → **When people bring me in**
(new) → **The design-to-build shift** (the flight story) → About (rewritten as
the career arc) → **Contact** (new) → **Footer** (new).

### Images

Two things are worth knowing before swapping any of them out.

**The About images are exposure-matched, not colour-matched.** All three keep
their own colour at full strength; what makes them read as a set is one shared
contrast curve (1.06) and a per-image exposure shift solved so each lands on
the same mean luminance of 122. Drop a new photograph in without that solve and
it will sit visibly brighter or darker than its neighbours, whatever its
colour. Each is stored twice: a 600x450 frame thumbnail and a full size the
lightbox fetches only when someone opens it.

**The engagement illustrations follow one written style spec**, so a
replacement has to match it or the four stop being a set: flat vector on a warm
cream ground, muted sage / charcoal-navy / slate with a single terracotta
accent, paper grain, no text anywhere in the image. 4:3 at 720x540, which
covers 2x of the widest the slot ever gets.

### Deployment

**This repository is the live site.** `.github/workflows/pages.yml` uploads
the repository root to GitHub Pages on every push to `main`, and `CNAME` plus
the custom-domain setting on the Pages page put that upload at
https://adamhickey.com. There is no build step and nothing in between: a merge
is public about a minute after the workflow finishes.

| | |
| --- | --- |
| Live at | https://adamhickey.com |
| Deploys from | `main`, repository root, via `pages.yml` |
| Staged first in | `adamdhickey-collab/adamhickey-next`, at https://adamdhickey-collab.github.io/adamhickey-next/ |

Changes are made and checked in the staging repository and carried here once
they have been looked at there, so a file here and its copy in staging are
expected to match after a change has moved across. What does not move is the
staging apparatus: every staging page carries a `noindex` meta marked
`STAGING ONLY`, omits the analytics snippet at a `STAGING NOTE` comment, and
omits the canonical link. This site has none of that: no `noindex` anywhere,
the Google Analytics tag `G-BLY8X4YCNK` on every page, and `index.html`
carrying `<link rel="canonical">` and `og:url` for https://adamhickey.com/.
A page copied across from staging needs those three restored before it merges.

`checks.yml` is the other workflow. It runs on every pull request and push to
`main`, reports, and deploys nothing; the two are separate on purpose so a
failing check reads as a failing check rather than as a failed deploy.

**Two things the workflow will not do for you.**

- **The deploy has not always fired on a merge.** The squash-merge of #17 on
  2026-09-03 ran `checks` and never ran `pages.yml`; the merge before it did
  run both. After merging, look at the Actions list for a *Deploy static site
  to GitHub Pages* run on the merge commit, and if there is none, start one:

  ```
  gh workflow run pages.yml --ref main
  ```

- **Pages caches for ten minutes** (`cache-control: max-age=600`), so a fetch
  straight after a deploy can still return the old bytes. Add a query string
  to see past the cache before deciding the deploy failed.

It used to be worse than a stale README: this repository once deployed its
root with the client prototypes and the archive inside it, reachable by anyone
who guessed a path. They moved out, to the repositories under "What lives
where", and what remains here is only what should be public.

All internal links and assets are **relative** (no root-absolute `/...`
paths), so the same files work from the staging subpath and from this root
domain. The one exception is `og:image` in `index.html`, which has to be
absolute because scrapers do not resolve relative URLs, and so names
https://adamhickey.com/img/og-card.jpg explicitly.

## Making this the production site

Configuration work, not a rewrite:

1. **Remove noindex.** Delete the `STAGING ONLY` robots `<meta>` line from
   `index.html` and the six `case-study/*.html` files (search `STAGING ONLY`).
2. **Restore analytics.** Re-add the `gtag.js` snippet from the
   `adamhickey.com` repo at each `STAGING NOTE` comment (search `STAGING NOTE`).
3. **Add canonical/OG URLs.** Add `<link rel="canonical">` and restore
   `<meta property="og:url">` pointing at `https://www.adamhickey.com/...`
   (omitted while staged so shared links don't claim the wrong canonical home).
4. **Host it.** Either point `adamhickey.com` at this repo's Pages deployment
   (custom-domain setting + `CNAME` file + DNS), or copy the files in the table
   above into the `adamhickey.com` repo's deploy root. No path changes either
   way, because every reference is relative.
5. **URL continuity.** Case-study URLs match the live site exactly, so
   existing deep links keep working. Re-verify before DNS cutover.
6. **Re-sync first.** If the live site has moved on since `ef927d5`, diff it
   against these files before switching, so newer fixes aren't lost.
7. Retire/archive the old portfolio repo once DNS has switched.

## What lives where

This folder holds the portfolio source and nothing else:

```
index.html, style.css, site-nav.css, cursor.js, case-study/, img/
```

Everything else moved out, so each thing lives with the repository that
serves it:

| Was here | Now |
| --- | --- |
| the deployed site | `adamdhickey-collab/adamhickey-next` |
| `walking-meditation/` | `adamdhickey-collab/walking-meditation` |
| `archive/` (finished client work) | `adamdhickey-collab/client-archive`, private |

Self-contained projects with their own remotes (the live adamhickey.com,
Cargill Sprout System, RBA Design System, Lightbox) are gitignored and live
in `~/Projects/` alongside this repo. See `.gitignore`.
