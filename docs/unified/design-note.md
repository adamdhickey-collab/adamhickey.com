# One career, one site: the unified portfolio

The design note for the pull request of 2026-10-26 that made adamhickey.com
one portfolio for one career: the graphic designer's eye and the enterprise
product work, together, without redefining the career again. It records the
positioning, the three visual directions weighed and the one chosen, what
happened to every page, what the checks' counts did and why, what still
needs a local pass, and a critique from three chairs.

## The positioning

**Title, everywhere a recruiter or a machine reads one: Senior Product
Designer.** The `<title>`, `og:title`, the description, the hero eyebrow,
the résumé header, the JSON-LD `jobTitle` and `llms.txt` all say it. At
software companies the volume of senior roles is posted under that title
and recruiters filter on it; creative directors judge the work, not the
title. The breadth lives in the line under it, the dek, the selected work
and the capabilities, not in the title words.

**The headline:** "Making digital experiences clear, distinctive, and
beautifully designed."

**The dek:** "I'm a Minneapolis-based senior product designer with twenty
years across visual design, interactive experiences and enterprise
software. I bring clarity to complex products and personality to digital
experiences, from early concepts to the finished details."

**The one idea the whole site reinforces:** he brings visual intelligence
to digital products and understands what it takes to make them work. The
intersection is the specialty.

**What it does not claim.** Product strategy as a specialty, executive
leadership, a research specialization, creative direction of campaigns, or
twenty years of brand work. Technical fluency and building with coding
agents are tools in the story, not the identity. Say When is a
self-initiated fictional concept and says so wherever it appears. Nothing
on the site is invented: no research, no outcomes, no approvals beyond
what the pages already carried.

**The career facts, as the site states them:** graphic designer and hybrid
interactive designer and developer at ByDesign, LEVEL and Pixel Farm (2005
to 2013); thirteen years at RBA designing enterprise applications, design
systems and complex digital products (2013 to 2026); products of his own
since. Employers, titles, dates and accomplishments are the ones the repo
and the résumé already stated.

## Three directions, and the one chosen

The brief asked for the system on `main` to be evaluated against the
creative branch's (`claude/visual-brand-repositioning`, pull request #640,
shelved) and for three directions to be sketched.

**A. The site's own system, with new content.** Crimson Text and
Montserrat, the sage accent on warm paper and charcoal, the five grounds,
the portrait hero, the card grids, the charcoal band, the still lifes. The
system is mature: every ratio in `COLOR.md` is measured, eleven checks hold
every page to the four specs, and 38 pages were built on it. What changes
is what the pages say and which work leads.

**B. The creative branch's system.** Fraunces and Instrument Sans, a petrol
teal accent, the portrait moved to About, a wall of six tiles as the first
screen, and `work.css` as a storytelling vocabulary for the case studies.
More editorial on first sight, and already measured on that branch. It
reads as a different site, and Adam preferred the one he has.

**C. A hybrid.** Keep the type pair and the sage, borrow the creative
branch's wall of work for the hero and its storytelling system for every
case study, and move the portrait down. Half the recognizability of A for
half the lift of B.

**A was chosen**, at Adam's word while this branch was being built: the
product-design site's design stays, and the content moves to the unified
positioning. One piece of B comes across because it is content rather than
look: `work.css` is a layout vocabulary written entirely in the site's own
tokens, so the four case studies rebuilt on it (Innovators Studio, Door
County Found, Lucy Learns, the studio years) and the Say When case study
render in Crimson, Montserrat and sage, on the same chapter grounds the
build write-ups already use. Nothing in `color.css`, `type.css` or
`shell.css` moved; `style.css` gained the rules for the What I bring card
and nothing else.

## What happened to every page

| Page | Decision |
| --- | --- |
| `index.html` | Rewritten in place, on the existing layout: new hero copy, the six facts reworded, Selected work as six cards in one grid (SAP, Innovators Studio, Lucy Learns, Door County Found, the studio years, Say When), What I bring in place of How I work, Experiments and independent work in place of Built end to end, About as one story, Contact and the footer reworded. The lab card and its quiet-cancel figure left the page. |
| `case-study/sap-product-maturity.html` | Kept on its template; the description and the Related row reframed toward visual coherence. Every metric and its measurement disclosure unchanged. |
| `case-study/innovators-studio-visual-identity.html` | Rebuilt on `work.css`, from the creative branch's revision, in the site's own type and accent: the identity and its system as the protagonists, every outcome and the timesheet caveat kept word for word. Off Tailwind. |
| `case-study/lucy-learns.html` | Rebuilt on `work.css` from the creative revision, with the glance chapter strengthened on how illustration, type, layout and interaction help someone follow an instruction with a leash in one hand. Shipped, retired, concept and idea are marked on the tiles. |
| `case-study/door-county-found.html` | Rebuilt on `work.css` from the creative rewrite: identity, voice and photography first, the browsing and the editor's workflow showing it is a working product, "See it live" at the foot. |
| `case-study/hybrid-designer.html` | Rebuilt on `work.css` as the studio years, the work shown large, every claim at the level the old page made. Off Tailwind. |
| `case-study/say-when.html`, `say-when/*` | New, from the creative branch: a self-initiated fictional coffee brand concept and its storefront prototype, labeled fictional on every page. |
| `case-study/usda-operational-overhead.html`, `dispatch-complexity.html`, `enterprise-consulting.html` | Kept; descriptions reframed toward clarity and coherence; the enterprise years' foot continues to the studio years. |
| `engagement/*.html` (four) | Folded into What I bring. Each address is a redirect stub (a meta refresh to `index.html#problems`, noindex), which the checks treat as not a page. |
| `lab/index.html` | Retitled Experiments: Agent Review, the dispatch cockpit, the Say When storefront and the motion study, with the position article last as the argument behind the first two. |
| `lab/agent-review.html`, `lab/designing-motion.html`, `prototype/dispatch-cockpit.html` | Kept whole; kickers and breadcrumbs say Experiments. |
| `writing/*` | Kept; the index dek widened; every Related row that pointed at an engagement page points at What I bring. |
| `other.html`, `design-system/index.html`, `404.html` | Kept, with the navigation, the links and the counted sentences updated. |
| Résumé (both PDFs) | Rewritten in `scripts/resume.mjs` for senior product design roles with a visual-craft focus; title, employers, dates and figures unchanged. |
| `llms.txt`, share cards, JSON-LD | Rewritten to the positioning. |

## What the counts did

`counts.mjs`: 34 claims across 7 documents, 42 pages. The page count went
38 to 42: the four engagement pages left (redirect stubs are not pages),
the Say When case study and its seven storefront pages arrived. `type.css`
is loaded by all 42; `color.css` and the shell by 35, because the
storefront wears its brand's own chrome. `style.css` by 31 (the four
engagement pages out, Innovators Studio, the studio years and Say When
in). Scripts 33 to 34 (`say-when.mjs`). Schema nodes 81 to 85. Stylesheets
19 to 27 by `tokens.mjs`: `work.css`, the five per-project stylesheets and
the storefront's.

The six browser checks, unscoped, on this branch and on `origin/main` at
8e15228 (extracted with `git archive` and measured with the branch's
scripts; the registry did not change, so one set of scripts measures both):

| | main (39 pages) | branch (43 pages) | delta |
| --- | --- | --- | --- |
| resting colors | 8176 | 8313 | +137 |
| state rules | 3174 | 3295 | +121 |
| type sizes | 32988 | 33768 | +780 |
| curve elements | 19934 | 20303 | +369 |
| raised surfaces | 327 | 300 | -27 |
| read times | 27 | 28 | +1 |

Reachable states hold at 8. Four pages left and eight arrived, the eight
small, so the text counts move less than the page count suggests. **The
raised-surface count came back smaller, and was chased before it was
accepted.** Measured scoped, page by page, on both trees: the four
engagement pages carried 8 raised surfaces each, 32 out; Innovators Studio
went 19 to 5 and the studio years 8 to 2 as they left the Tailwind cards
for `work.css` figures, Lucy Learns 20 to 11 and Door County Found 7 to 6
for the same reason; the homepage went 44 to 47; the Say When case study
is 10 and its seven storefront pages 26 between them. That sums to -23
against the sweep's -27; `cards.mjs` keys its findings and counts a kind
once, so per-page sums and the sweep differ by the surfaces two pages
share. Every page that was not touched measures the same on both trees
(SAP 16, USDA 13, dispatch 9, the enterprise years 7, the design system
page 28, Agent Review 11).

## What needs a local pass

This branch was built in a cloud session that sees only this repository.

- **Captures from the sibling checkouts.** `scripts/lucy.mjs` and
  `scripts/dcf.mjs` were not run; every Lucy Learns and Door County Found
  picture is the one already in the tree.
- **Drawings.** No ChatGPT drawing was made. The What I bring band reuses
  the four still lifes. A drawing for the Say When homepage tile and a
  photograph for its share card are still owed (`docs/rebrand/asset-manifest.md`).
- **The hero clip and the About photographs** are untouched.
- **Share cards and the résumé PDFs** were rendered here with the runner's
  Chromium; the pull request says which, and a render on the Mac is the
  same command.

## Three chairs

**A product-design hiring manager.** Strongest: the SAP case study and the
What I bring band, which tie four plain strengths to shipped work with
measured outcomes and the measurement disclosed. The dispatch and USDA
pages are one click away with real metrics. Weakest: the six-card Selected
work gives the enterprise work one slot of six on first sight, and a reader
hiring for a dense operational product has to read the band to find
dispatch and USDA. Fix applied: the hero's facts open on "Complex
workflows" and the first card is SAP; the band links both.

**A visual-design hiring manager.** Strongest: the type ladder, the
measured palette and the consistency across 42 pages, which the design
system page can prove; the Innovators Studio and Door County Found pages,
where the identity work is shown large with the decisions annotated.
Weakest: the SAP page still presents its interfaces as 45% of a warm card
beside a bulleted list, the oldest template on the site. Not rebuilt in
this pull request, on purpose: the user asked to keep the site's design,
and a rebuild of that page is one change to one page, worth its own
review. The studio-years page carries captures from the studio's own
portfolio at the resolution they were kept at.

**A creative director.** Strongest: the Say When concept, carried from a
sentence to a bag to a shop you can try, and labeled fictional at every
step; the Door County Found identity, with its ephemera and its rule that
real places get real photographs. Weakest: the homepage opens on a
portrait and a sentence rather than on the work, and the still lifes under
What I bring are objects rather than the work itself. Both are the site's
own choices, kept at Adam's word; the work is one scroll down and the
cards are large.
