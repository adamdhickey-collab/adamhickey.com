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
| `Adam Hickey Resume.pdf` | Résumé linked from the header and footer |
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

**This repository does not publish anything.** It has no Pages workflow and
Pages is switched off in its settings. The portfolio files here are the
*source*; the site is served from its own repository:

| | |
| --- | --- |
| Published from | `adamdhickey-collab/adamhickey-next` |
| Staged at | https://adamdhickey-collab.github.io/adamhickey-next/ |

Editing `index.html` or `style.css` here changes nothing online until the
change is copied across and pushed to that repository.

It used to work the other way: this repo deployed its own root, which also put
the client prototypes and the archive on the internet for anyone who guessed a
path. That is why the split happened.

All internal links and assets are **relative** (no root-absolute `/...`
paths), so the site works identically from a project subpath and from a root
domain. The one exception is `og:image` in `index.html`, which has to be
absolute because scrapers do not resolve relative URLs, and so needs updating
whenever the host changes.

### Search indexing (staging noindex)

Every page carries:

```html
<meta name="robots" content="noindex, nofollow" />
```

in its `<head>`, marked with a `STAGING ONLY` comment directly above it:
`index.html` plus the six `case-study/*.html` files, 7 in total. This is the
only noindex mechanism (a `robots.txt` cannot work from a Pages project
subpath), and it exists only in this repo.

### Analytics

The live site's Google Analytics tag (`G-BLY8X4YCNK`) is **deliberately
omitted** from every staged page, so traffic to the staging URL doesn't mix
into the production property's data. Each page has a `STAGING NOTE` comment
where the snippet was, and the original lives in the `adamhickey.com` repo.

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
