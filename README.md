# adamhickey.com

The live public site of Adam Hickey's independent product design practice: a
single-page portfolio, six case studies and four engagement pages. Static
HTML, CSS and JavaScript, no build step and no `package.json`. The one
exception is the case studies' Tailwind stylesheet, built once from
`tailwind.config.js` into `case-study/case-tailwind.css` and committed (#14);
the header of that config says how to rebuild it.

## Two repositories

| | | |
| --- | --- | --- |
| `adamdhickey-collab/adamhickey.com` | public | This one. The live site, deployed from `main`; see Deployment. |
| `adamdhickey-collab/adamhickey-next` | private | Staging, at https://adamdhickey-collab.github.io/adamhickey-next/. Where the work happens, and where the four normative specs and the checks live. |

Changes are made and checked in staging and carried here once they have been
looked at. Nothing automates the carry: a change moves as a diff applied by
hand, and a file here and its copy in staging are expected to match once it
has. There is no script that compares the two trees; staging's `mirror.mjs`
names staging as both sides and reports clean whatever has drifted.

**Where the two differ on purpose.** This site is the client-safe edition of
the portfolio:

- No "Built end to end" section. The independently built products (Door
  County Found, Lucy Learns, While We're Here) are absent from the homepage,
  the stylesheet and the image folders, and their build write-ups are not here
  at all, so nothing is reachable by URL.
- The Connect design system card on the shelf is a static `div`, not a link.
  It shows the work without opening the client's design system.

**Where they differ because staging has moved on.** Staging retired
`engagement/brand-identity-illustration.html` (its #49); this site still serves
it and links it from the engagement cards. Staging has a Writing section and
the pages under `writing/`; this site has neither. Neither change has been
carried across yet, and each is a decision about the live site rather than
drift to fix in passing.

## What is here

| File | Notes |
| --- | --- |
| `index.html` | The homepage |
| `style.css` | The stylesheet, tokens in `:root`; the homepage and the engagement pages load it |
| `site-nav.css` | The shared header, loaded by every page |
| `cursor.js` | The custom cursor |
| `case-study/*.html` | Six case studies |
| `case-study/case-motion.{css,js}` | The case studies' scroll motion |
| `case-study/case-tailwind.css`, `tailwind.config.js` | The built Tailwind stylesheet the six case studies load instead of `style.css`, and the config it is built from |
| `engagement/*.html` | Four engagement pages, one per card in "When people bring me in" |
| `js/vendor/anime.esm.min.js` | anime.js 4.5.0 (MIT), vendored; scrubs the design-to-build scene against scroll |
| `img/` | See Images |
| `Adam Hickey Resume.pdf` | The résumé, linked from the footer; rendered by `scripts/resume.mjs` in staging and copied here |
| `TYPOGRAPHY.md` | The type system: two families chosen by the role the text plays, and the sizes |
| `CNAME`, `.nojekyll` | Pages configuration: the custom domain, and no Jekyll pass over the tree |
| `.github/workflows/` | `pages.yml` deploys, `checks.yml` reports; see below |

### The homepage

Sections in order: the hero (the portrait clip with its pause control, the
Craft / Systems / Independent timeline, the client logos) → Selected work →
When people bring me in (the four engagement cards) → The design-to-build
shift (the scroll story) → Brand, identity, illustration (the shelf) → Earlier
experience → About → Start a conversation. The header carries Work, Services,
About, Contact and Email, and every page loads it from `site-nav.css`.

### Images

| Folder | Holds |
| --- | --- |
| `img/site/` | Case-study screens and client logos, the bulk of the folder |
| `img/about/` | Three photographs, each as a 600x450 frame thumbnail and a full size the lightbox fetches only when opened |
| `img/engagement/` | Four card illustrations at 1080x720, plus three screen fragments the engagement pages use as proof |
| `img/shelf/` | The four shelf cards |
| `img/casework/` | One image, shared by the Pixel Farm case study and the brand engagement page |
| `img/hero-portrait.mp4` | The hero clip |
| `img/og-card.jpg` | The 1200x630 share image, named absolutely in `index.html` |
| favicons, touch icon, `icon-192` / `icon-512` | The monogram at each size |

Two things are worth knowing before swapping any of them out.

**The About photographs are exposure-matched, not colour-matched.** All three
keep their own colour at full strength; what makes them read as a set is one
shared contrast curve (1.06) and a per-image exposure shift solved so each
lands on the same mean luminance of 122. Drop a new photograph in without
that solve and it will sit visibly brighter or darker than its neighbours,
whatever its colour.

**The engagement illustrations follow one written style spec**, so a
replacement has to match it or the four stop being a set: flat vector on a
warm cream ground, muted sage / charcoal-navy / slate with a single terracotta
accent, paper grain, no text anywhere in the image. 3:2 at 1080x720.

Cache-busters: the stylesheets and the hero clip are loaded with a `?v=`
query, and it gets bumped whenever the bytes at a path change, because the
path alone will not tell a browser anything moved.

## Checks

`checks.yml` runs on every pull request and push to `main`. It reports and
deploys nothing; the two workflows are separate on purpose so a failing check
reads as a failing check rather than as a failed deploy. Today it asks two
things:

- **The built Tailwind stylesheet is current.** It rebuilds from
  `tailwind.config.js` and the markup and compares; when the bytes differ it
  reports at the class level, which selectors the markup uses that the
  committed file lacks and which are committed but no longer built, because
  both files are one minified line and a plain diff says nothing.
- **No page compiles Tailwind in the browser.** One grep for the CDN
  compiler, which #14 removed from all six case studies.

The browser checks are not here yet, and the reason is access rather than
appetite. Contrast at rest, hover and focus state, the type scale and partial
borders on curves are `resting.mjs`, `states.mjs`, `typescale.mjs` and
`curves.mjs` in staging, which is private, so this public repository's
`GITHUB_TOKEN` cannot check it out. Every one of them takes `--root`, which
exists so they can be aimed at this tree from the Mac:

```
node ../adamhickey-next/scripts/resting.mjs --root . --strict
```

Each prints the path and page count it measured before doing anything else;
read that line first, because a wrong target you cannot see is a false
result. Copying the scripts into this repository is deliberately not done:
two copies of the same check drift, and they drift invisibly.

## Deployment

**This repository is the live site.** `.github/workflows/pages.yml` uploads
the repository root to GitHub Pages on every push to `main`, and `CNAME` plus
the custom-domain setting on the Pages page put that upload at
https://adamhickey.com. There is no build step and nothing in between: a merge
is public about a minute after the workflow finishes. Pages built from the
branch with the legacy builder until 4600455 moved it to the workflow.

| | |
| --- | --- |
| Live at | https://adamhickey.com |
| Deploys from | `main`, repository root, via `pages.yml` |
| Staged first in | `adamdhickey-collab/adamhickey-next`, at https://adamdhickey-collab.github.io/adamhickey-next/ |

What does not move across from staging is the staging apparatus: every
staging page carries a `noindex` meta marked `STAGING ONLY`, omits the
analytics snippet at a `STAGING NOTE` comment, and omits the canonical link.
This site has none of that: no `noindex` anywhere, the Google Analytics tag
`G-BLY8X4YCNK` on every page, and `index.html` carrying
`<link rel="canonical">` and `og:url` for https://adamhickey.com/. A page
copied across from staging needs those three restored before it merges.

**Two things the workflow will not do for you.**

- **The deploy has not always fired on a merge.** The squash-merge of #17 on
  2026-09-03 ran `checks` and never ran `pages.yml`; the merges before and
  after it ran both. After merging, look at the Actions list for a *Deploy
  static site to GitHub Pages* run on the merge commit, and if there is none,
  start one:

  ```
  gh workflow run pages.yml --ref main
  ```

- **Pages caches for ten minutes** (`cache-control: max-age=600`), so a fetch
  straight after a deploy can still return the old bytes. Add a query string
  to see past the cache before deciding the deploy failed.

All internal links and assets are **relative** (no root-absolute `/...`
paths), so the same files work from the staging subpath and from this root
domain. The one exception is `og:image` in `index.html`, which has to be
absolute because scrapers do not resolve relative URLs, and so names
https://adamhickey.com/img/og-card.jpg explicitly.

## History worth knowing

The history before 837e3da is the previous site, positioned for senior
product roles; that commit relaunched it as the independent practice, and
everything above is the site since. A few later commits explain why things
are the way they are:

| | |
| --- | --- |
| 4600455 | Pages deploys through the Actions workflow rather than the legacy builder |
| #13 | 27 contrast failures fixed, the fill sage used as text at 4.12:1 among them, found by pointing staging's scripts at this tree by hand |
| #14 | The case studies stop compiling Tailwind in the browser; the stylesheet is built once and committed |
| #15 | `checks.yml`, so that #13 cannot quietly come back |
| #16 | Every rendered type size lands on the fourteen-step scale, except the hero |
| #17 | The résumé catches up with staging, and gets a source there |
| #18 | This file's Deployment section stops claiming the repository publishes nothing |
