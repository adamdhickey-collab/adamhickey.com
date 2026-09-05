# adamhickey.com

The live public site of Adam Hickey's independent product design practice: a
single-page portfolio, nine case studies, four engagement pages and a design
system reference. Static HTML, CSS and JavaScript, no build step and no
`package.json`. The one built file is the case studies' Tailwind stylesheet,
built once from `tailwind.config.js` into `case-study/case-tailwind.css` and
committed (#14); the header of that config says how to rebuild it. The check
scripts under `scripts/` need `playwright-core` and Tailwind installed ad hoc;
see Checks.

## Two repositories

| | | |
| --- | --- | --- |
| `adamdhickey-collab/adamhickey.com` | public | This one. The live site, deployed from `main`; see Deployment. |
| `adamdhickey-collab/adamhickey-next` | private | Staging, at https://adamdhickey-collab.github.io/adamhickey-next/. Where the work happens. The four normative specs and the check scripts are authored there and copied here. |

Changes are made and checked in staging and carried here once they have been
looked at. Nothing automates the carry: a change moves as a diff applied by
hand, and a file here and its copy in staging are expected to match once it
has. There is no script that compares the two trees; staging's `mirror.mjs`
names staging as both sides and reports clean whatever has drifted.

**The two editions have converged.** This site was the client-safe edition of
the portfolio: no "Built end to end" section, the three independently built
products absent from the homepage and their write-ups not here at all, so
nothing was reachable by URL. That distinction ended with #20. This tree is
the staging tree, page for page -- fifteen pages, including Door County Found,
Lucy Learns and While We're Here.

That was a decision about positioning rather than about confidentiality, and
it is worth saying which, because one of the two reasons the section gave has
quietly stopped being true and the other never was. The Connect design system
card on the shelf is a static `div` here and a static `div` in staging -- both
show the work without opening the client's system, so nothing about carrying
the tree across changes what a client's system is exposed to. The build
write-ups are the author's own products, and the case for holding them back
was that they read as a side pursuit next to enterprise work. The case for
carrying them is that they are the longest and most specific writing on the
site, and they were sitting on a host that told every crawler to ignore them.

**Where the carry stands.** #20 brought this tree level with staging at its
#136, on 2026-09-05. Staging has merged nine pull requests since -- #138
through #144 and #146 -- and none of them is here yet. Among them: the
homepage lost the four-step "How each of these got made" panel and the
three-station proof strip and gained an ask at the foot of every case study
(#142); `engagement/ai-product-prototype.html` became
`engagement/working-product-prototype.html` in the same pass, which is a live
URL changing and so wants a redirect decision before it is carried (see the
404 note below); the two career case studies got visible links from About
(#143); and the era notes on the Lucy Learns write-up lost their file listings
(#138). Staging's #145, the American English sweep, arrived here as #21, run
as its own sweep over this tree rather than as a diff. Read `git log` on
staging's `main` from `4e17002` forward for the current list.

**One live URL now 404s.** `engagement/brand-identity-illustration.html` was
retired in staging (its #49) and has been gone here since #20. Nothing on this
site links it any more -- the engagement cards came across from staging, which
dropped it -- but anything outside that does will get a 404 rather than a
redirect. GitHub Pages cannot serve a 301, so the options are to leave it, or
to put a stub at that path that canonicals to the engagements section. It is
left, deliberately; a stub is a page, and `seo.mjs` would then want it in the
sitemap, where a redirect does not belong. The engagement page rename above is
the same question again, and is why that one is not carried yet.

**What still differs.** Staging keeps `CLAUDE.md` and its own README and
workflows; this repository keeps `CNAME`, its own README and its own
workflows. Staging's pages carry the staging apparatus described under
Deployment. `scripts/counts.mjs` here drops the one entry in staging's
registry that describes the live site from the outside, because from here that
is the inside. Everything a reader can reach is the same in both, at the carry
point above.

## What is here

| File | Notes |
| --- | --- |
| `index.html` | The homepage |
| `style.css` | The stylesheet; the homepage, the engagement pages, the three build write-ups and the design system page load it |
| `color.css`, `type.css`, `shell.css` | The token files, loaded by all fifteen pages. Color, type scale, and the page shell |
| `site-nav.css` | The shared header, loaded by every page |
| `cursor.js` | The custom cursor |
| `case-study/*.html` | Nine case studies: four client engagements, two career-arc pages and three build write-ups |
| `case-study/case-study-base.css`, `case-study/case-motion.{css,js}` | The six Tailwind case studies' shared base, and every case study's scroll motion |
| `case-study/case-tailwind.css`, `tailwind.config.js` | The built Tailwind stylesheet the six older case studies load instead of `style.css`, and the config it is built from |
| `engagement/*.html` | Four engagement pages, one per card in "When people bring me in" |
| `design-system/index.html`, `design-system/ds.css` | The design system reference: tokens, type, spacing and components, read off the stylesheets |
| `robots.txt`, `sitemap.xml` | What a crawler is told. The sitemap is generated -- `node scripts/seo.mjs --write` -- and `node scripts/seo.mjs` fails if it stops matching the pages on disk |
| `scripts/` | The seven check scripts and the capture and render scripts, copied from staging with #20. `checks.yml` runs two of the checks; see Checks |
| `js/vendor/anime.esm.min.js` | anime.js 4.5.0 (MIT), vendored; scrubs the design-to-build scene against scroll |
| `img/` | See Images |
| `Adam Hickey Resume.pdf` | The résumé, linked from the footer; rendered by `scripts/resume.mjs`, which is here as well as in staging |
| `TYPOGRAPHY.md`, `COLOR.md`, `SPACING.md`, `MOTION.md` | The four normative specs. The check scripts read them as rules and this tree as evidence |
| `CNAME`, `.nojekyll` | Pages configuration: the custom domain, and no Jekyll pass over the tree |
| `.github/workflows/` | `pages.yml` deploys, `checks.yml` reports; see below |

### The homepage

Sections in file order: the hero (the portrait clip with its pause control and
the client logos) → When people bring me in (the four engagement cards) →
Selected work → The design-to-build shift (the scroll story) → Built end to
end, which also holds the four-step "How each of these got made" panel, the
"Identity and illustration, for clients" shelf and the Craft / Systems /
Independent proof strip → Earlier experience → About → the contact section,
headed "Describe what is happening". The header carries Work, Services, About
and Contact, an email icon and a LinkedIn icon, and every page loads it from
`site-nav.css`.

## The pages, by family

Fifteen pages in six families, all hand-written HTML with no include step and
no build. The inventory lives here rather than on the design system page,
because a site inventory describes *this* site where the rest of that page
describes anything built with the system.

**A family is not a directory.** `/case-study/` holds three of them. What
makes a family is the content model and the shell it wears, not the path.

**The shell is copied, not included.** The fixed header, the nav links, the
email icon and the skip link are hand-written into all fifteen pages, so a
change to the shell is a change to fifteen files.

**Two regimes.** There is no single base stylesheet, but there is a single
base ladder, and both regimes read it from `type.css`, which all fifteen pages
load. Regime A loads `style.css`; regime B is the six older pages on the built
Tailwind stylesheet, which cannot see anything `style.css` declares.

| Family | Pages | Regime | What it is |
|---|---|---|---|
| Homepage | 1 | A | The page every other page hangs off. |
| Client case studies | 4 | B | Client work under NDA-safe framing. The oldest pages on the site. |
| Career-arc pages | 2 | B | A span of years, told as a shelf of engagements. |
| Build write-ups | 3 | A | Products built end to end, alone. |
| Engagements | 4 | A | What you can hire, one page each. |
| Reference | 1 | A | The design system page. Unlisted; nothing links to it. |

**Homepage** -- `index.html`

**Client case studies** -- `case-study/dispatch-complexity.html`,
`case-study/innovators-studio-visual-identity.html`,
`case-study/sap-product-maturity.html`, `case-study/usda-operational-overhead.html`

**Career-arc pages** -- `case-study/enterprise-consulting.html`,
`case-study/hybrid-designer.html`. They share the case-study shell but the
content model is a list of many small pieces rather than one deep one.

**Build write-ups** -- `case-study/door-county-found.html`,
`case-study/lucy-learns.html`, `case-study/while-were-here.html`. Same
directory as the client work, different family: these load `style.css` and
carry no Tailwind.

**Engagements** -- `engagement/ai-product-prototype.html`,
`engagement/design-system-foundation.html`,
`engagement/embedded-senior-product-design.html`,
`engagement/product-clarity.html`. The first is
`engagement/working-product-prototype.html` in staging since its #142; see
"Where the carry stands".

**Reference** -- `design-system/index.html`

### Images

| Folder | Holds |
| --- | --- |
| `img/site/` | Case-study screens, client logos and the built-step drawings, the bulk of the folder |
| `img/about/` | Three photographs, each as a 600x450 frame thumbnail and a full size the lightbox fetches only when opened |
| `img/engagement/` | The four card illustrations at 1080x720, each engagement page's hero and invitation, and the numbered step drawings. The retired brand page's and The Whole Thing's drawings stay, as part of the set |
| `img/shelf/` | The four shelf cards |
| `img/products/` | The Built end to end product shots, used by the homepage, the Lucy Learns write-up and the prototype engagement page |
| `img/dcf/`, `img/lucy/`, `img/wwh/` | One folder per build write-up: Door County Found captures, Lucy Learns phone screens and art-era scenes, While We're Here book photographs. The first two are captured by `scripts/dcf.mjs` and `scripts/lucy.mjs` from sibling checkouts on the Mac, so a restyle there is one run rather than an afternoon of screenshots |
| `img/casework/` | One image, on the Hybrid Designer page |
| `img/hero-portrait.mp4` | The hero clip |
| `img/og-card.jpg` | The 1200x630 share image, named absolutely in `index.html` |
| the rest of `img/` | Two portrait stills, the CBRE logo, the favicons, the touch icon and `icon-192` / `icon-512` |

Two things are worth knowing before swapping any of them out.

**The About photographs are exposure-matched, not color-matched.** All three
keep their own color at full strength; what makes them read as a set is one
shared contrast curve (1.06) and a per-image exposure shift solved so each
lands on the same mean luminance of 122. Drop a new photograph in without
that solve and it will sit visibly brighter or darker than its neighbors,
whatever its color.

**The engagement illustrations follow one written style spec**, so a
replacement has to match it or the set stops reading as a set: flat vector on
a warm cream ground, muted sage / charcoal-navy / slate with a single
terracotta accent, paper grain, no text anywhere in the image. 3:2 at
1080x720, and they go in through `scripts/illustrate.mjs`, which crops,
resamples, lifts and solves a hero's wall against the charcoal.

Cache-busters: the stylesheets, the images and the hero clip are loaded with a
`?v=` query, and it gets bumped whenever the bytes at a path change, because
the path alone will not tell a browser anything moved.

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

**The other seven checks are here and are not wired in.** Until #20 they lived
only in staging, which is private, so this repository's `GITHUB_TOKEN` could
not check them out; the closing comment in `checks.yml` still says so, and
still says `typescale.mjs` does not pass on this tree. Both predate #20. The
scripts are under `scripts/` now, and all seven pass here:

```
npm install --no-save --no-audit --no-fund playwright-core tailwindcss@3.4.19
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node scripts/deployable.mjs               # the tree can be tarred into an artifact
node scripts/tokens.mjs                   # every token the docs name actually exists
node scripts/counts.mjs                   # every number the docs assert, recounted
node scripts/seo.mjs                      # what the site tells a machine, vs the site
node scripts/resting.mjs --strict         # every color a reader can see, untouched
node scripts/states.mjs --strict          # hover, focus and script-applied state
node scripts/typescale.mjs                # every rendered size against the fourteen steps
node scripts/curves.mjs                   # no partial border on a rounded surface
```

The first four need nothing installed and finish in about a second between
them. The last four need Playwright and a browser; `CHROME` has to name one
that exists, and the scripts check. Each prints the path, page count and
commit it measured before doing anything else; read that line first, because
a wrong target you cannot see is a false result. At #21 the four measure 2522
resting colors, 605 state rules, 10680 type sizes and 6245 elements checked
for a partial border, across fifteen pages. Nothing verifies those four
numbers; treat them as a tripwire, and a run that comes back materially
smaller means something stopped being measured.

Wiring all seven into `checks.yml` is the open step, and staging's
`checks.yml` is the model: it runs them on every pull request and needs no
token now that the scripts are in the tree. `counts.mjs` is the one script
that differs from its staging copy, by one entry: staging's registry holds a
claim about how many of its pages the live site carries, which cannot be
counted from here because here is the live site.

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
staging page carries a `noindex` meta marked `STAGING ONLY`, and omits the
analytics snippet at a `STAGING NOTE` comment. This site has neither: no
`noindex` anywhere, and the Google Analytics tag `G-BLY8X4YCNK` on every page.
A page copied across from staging needs those two restored before it merges.
The canonical link, the Open Graph card and the JSON-LD graph come across
unchanged: every page in both trees names its https://adamhickey.com/ address
absolutely, `seo.mjs` holds each page to it, and the sitemap it generates
lists the fifteen live addresses.

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
domain. The exceptions are the addresses a machine reads: `og:image`,
`og:url`, the canonical link and the structured data, which scrapers do not
resolve relatively, and so name https://adamhickey.com/ explicitly.

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
| #19 | This file describes this repository, not the one it was copied from |
| #20 | The live site catches up with staging at its #136: fifteen pages, the four specs, the scripts, canonicals and structured data on every page; the brand page retired; `noindex` gone |
| #21 | American English throughout, the same sweep as staging's #145 |
