# adamhickey.com

The live public site of Adam Hickey's independent product design practice: a
single-page portfolio, nine case studies, a "How I work" page, six
articles, and a design system reference. Static HTML, CSS, and JavaScript, no build step and no
`package.json`. The one built file is the case studies' Tailwind stylesheet,
built once from `tailwind.config.js` into `case-study/case-tailwind.css` and
committed (#14); the header of that config says how to rebuild it. The check
scripts under `scripts/` need `playwright-core` and Tailwind installed ad hoc;
see Checks.

| | |
| --- | --- |
| **What this is** | The site: 27 pages in nine families |
| **Where it goes** | https://adamhickey.com, on every push to `main` |
| **Where the work happens** | Here, since 2026-09-08. `CLAUDE.md` is the working guide |
| **Where it was staged** | `adamdhickey-collab/adamhickey-next`, archived on 2026-09-08 at its #169, which this tree matches |

## One repository, and an archive

| | | |
| --- | --- | --- |
| `adamdhickey-collab/adamhickey.com` | public | This one. The live site, deployed from `main`, and where the work happens; see Deployment, and `CLAUDE.md` for the rules. |
| `adamdhickey-collab/adamhickey-next` | private, archived | Staging until 2026-09-08, read-only since, at its #169. Its Pages site still answers at https://adamdhickey-collab.github.io/adamhickey-next/, carrying `noindex`. |

Until 2026-09-08 changes were made and checked in staging and carried here by
hand, as a diff applied with the live apparatus kept on every page. #28 ended
that. The two trees had been level since #27, page for page apart from the
apparatus, and every carry was the same three-way apply of work that had
already been reviewed once, so the second repository was costing a step and
buying nothing. Work happens here now, on a branch, through a pull request
the checks have run on; `CLAUDE.md` came across from staging, adapted, and is
the working guide. Staging is archived on GitHub, read-only.

**The two editions have converged.** This site was the client-safe edition of
the portfolio: no "Built end to end" section, the three independently built
products absent from the homepage and their write-ups not here at all, so
nothing was reachable by URL. That distinction ended with #20. This tree has been
the staging tree, page for page, since then -- fifteen pages, including Door
County Found, Lucy Learns, and While We're Here -- and since #28 it is the only
tree.

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

**How the carry went.** #20 brought this tree level with staging at its
#136, on 2026-09-05, and #24 brought it level again at #147 the same day,
carrying the eight pull requests between (#138 through #144, and #146; #145,
the American English sweep, had already arrived as #21, run as its own sweep
over this tree) and #147. The carry was staging's diff from #136 to #147,
applied as a three-way merge with the live apparatus kept on every page, and
the four browser checks measure this tree at staging's own numbers
afterward. Among what came across: the homepage lost the four-step "How each
of these got made" panel, the three-station proof strip, and the Earlier
experience cards, and gained an ask at the foot of every case study (#142);
the two career case studies are linked from About instead (#143); body copy
is primary ink on every light ground (#147); and
`engagement/ai-product-prototype.html` became
`engagement/working-product-prototype.html`, which is the second 404 below.
#26 carried the three after that: the header's section links on every
page (#149), the proof-card pictures on the engagement pages moving to where
their captions go (#148), and the editions list on the design system page
reading the same on both hosts (#150, which had already come across on its
own as #25). #27 carried the seventeen after that, #151 through #169, as
one three-way apply of staging's diff from #150 to #169 with the live
apparatus kept on every page. Among what came across: the header opens a
menu drawer below 900px, with LinkedIn in the drawer and the wordmark
whole on a phone (#155, #164, #167), which brings `site-nav.js` into this
tree; the engagement step cards carry their output line in the prose
column, in the serif's italic with "e.g." before it, and stack the number
over the text on a phone (#155, #159, #165, #168, #169); three engagement
pages and the homepage took their critiques (#158, #161, #163, #166); the
Lucy Learns write-up records the timer that replaced voice commands,
draws its diagram in HTML and scrolls its phones sideways on a phone
(#151, #157, #160), with twelve recaptured screens; and every page asks
Google Fonts for Crimson's italic cut, which only the design system page
had. Nothing landed in staging after #169, and #28 archived it there, so
there is nothing left to carry.

**Two live URLs now 404.** `engagement/brand-identity-illustration.html` was
retired in staging (its #49) and has been gone here since #20. Nothing on this
site links it any more -- the engagement cards came across from staging, which
dropped it -- but anything outside that does will get a 404 rather than a
redirect. GitHub Pages cannot serve a 301, so the options are to leave it, or
to put a stub at that path that canonicals to the engagements section. It is
left, deliberately; a stub is a page, and `seo.mjs` would then want it in the
sitemap, where a redirect does not belong. Since #29 a miss lands on the
site's own `404.html`, which names the two moves and links the four
engagements, rather than on the host's generic page. `engagement/ai-product-prototype.html`
is the same question again: it was the prototype engagement's address from
the day the engagement pages shipped until #24, and the homepage card linked
it the whole time, so it is the likelier of the two to be sitting in someone's
history. It is left the same way, for the same reason, and this paragraph is
where to look if that turns out to be the wrong call.

**What the archive holds that this tree does not.** Its `CLAUDE.md`, which
#28 adapted into this repository's own and whose ledger of measured counts
stayed behind, on purpose; its README and workflows, the deploy one opening
an issue when it fails where this one does not; an `img/inbox/` of drawings
never placed; `scripts/mirror.mjs`, which compared the two trees and has no
second tree now; and on every page the staging apparatus described under
Deployment. `scripts/counts.mjs` there carries one entry this copy never did,
a claim about how many of its pages the live site held, which from here has
no outside to be counted against. Everything a reader could reach was the
same in both at #169, and the two local branches that never merged there,
`claude/dcf-hero` and `claude/shelf-into-client-band`, were pushed before
the archive so that it holds everything staging ever had.

## What is here

| File | Notes |
| --- | --- |
| `index.html` | The homepage |
| `style.css` | The stylesheet; the homepage, the engagement pages, the five build write-ups, the eight writing pages, the design system page, and the two prototype pages load it |
| `color.css`, `type.css`, `shell.css` | The token files, loaded by all forty pages. Color, type scale, and the page shell |
| `site-nav.css` | The shared header, loaded by every page |
| `cursor.js` | The custom cursor |
| `reveal.css`, `reveal.js` | The five build write-ups arrive as they are read: every heading, paragraph, figure, and list inside a `.build-chapter` settles the site's own 20px as it comes into view. Loaded by those four and by nothing else. It decorates by class signature at runtime, like `case-study/case-motion.js` on the Tailwind pages, so no markup changed on any of the four. It is deliberately **not** `style.css`'s `.reveal`, which sets `opacity: 0` as a resting state: the five browser checks never scroll, and `resting.mjs` skips an element at opacity 0, so 28 of `index.html`'s 34 reveal blocks and 111 of its text nodes are never contrast-checked. This pair takes the contract the cockpit's own arrivals use -- a keyframe with a `from` and no `to`, styled only once the script says the block is on screen -- so an untriggered block, a page without JavaScript, and a reader who asked for no motion all see the finished page, and not one measurement moved on any of the four. Two rules it is easy to get wrong are written up in the stylesheet's header: the observer's bottom `rootMargin` must be POSITIVE so the arrival begins below the fold, and the animation must not touch opacity at all |
| `read-aloud.css`, `read-aloud.js` | "Listen to this page": the browser's own speech synthesiser reads the prose and marks it as it goes, a sage rule under the live sentence and a sage fill on the live word, scrolling to follow. Loaded by the thirty-three pages with prose worth hearing -- the fifteen writing articles, the eleven case studies, the Agent Review case study, the four engagement pages, and the two prototypes -- and by nothing else. The prototypes are the ones that read a part of themselves rather than all of it: `.ck-frame` and `.dc-frame` carry `data-read-aloud="skip"`, because the cockpit's text is generated, changes under the reader's presses and includes a live region, and its hero carries `data-read-aloud="after"`, which is how a page says the control belongs under something other than its dek. The script builds its own button and player, so a browser with no `speechSynthesis` shows no control rather than a broken one |
| `map-rail.css`, `map-rail.js` | The stage rail over a service map read under 64rem, where the stages sit in a row the reader swipes along: one disc a stage on a sage line, each a button that brings its stage into view, the stages in view filled. Loaded by `case-study/usda-operational-overhead.html` and `lab/inspiration-to-aisle.html`, the two pages with a service map. The swipe itself is CSS in each map's own stylesheet, so without the script the row still swipes and only the rail is missing |
| `app-device.css`, `app-device.js` | "Open the app" and "Open the prototype": on the homepage and the Lucy Learns write-up, at 768px and up, the link opens the live thing over the page in the device frame the site draws its captures in, as tall as the viewport allows -- `.build-phone` for Lucy Learns, and the same object at `--radius-xl` for the dispatch cockpit, which is a tablet, the shape the prototype card's own thumbnail already is. Under 768px, and without the script, the link goes where it points: the app in a new tab, the cockpit at the section of its write-up that holds it. A link declares its device by carrying `data-app-phone` or `data-app-tablet`, whose value is the dialog's label, and `data-app-src` when the address to LOAD is not the address the link points at. It was `app-phone.{css,js}` until the tablet arrived on 2026-09-18 |
| `case-study/*.html` | Eleven case studies: four client engagements, two career-arc pages, and five build write-ups |
| `case-study/case-study-base.css`, `case-study/case-motion.{css,js}` | The six Tailwind case studies' shared base, and every case study's scroll motion |
| `case-study/case-tailwind.css`, `tailwind.config.js` | The built Tailwind stylesheet the six older case studies load instead of `style.css`, and the config it is built from |
| `how-i-work.html`, `engagement/*.html` | How I work, one page since 2026-10-29: the four parts of the job, each the situation, the moves, and the account that shows it. The four pages it replaced under `engagement/` are forwarding notes now, each to its own section |
| `prototype/dispatch-cockpit.html`, `prototype/dispatch-cockpit.{css,js}` | The dispatch cockpit prototype: a self-directed, interactive page on synthetic data, with its own stylesheet and script and the fleet as one object at the top of the script. `scripts/cockpit.mjs` captures the first screen for the share card, and `scripts/cockpit-shots.mjs` the four remaining stills: the hero's close call, the two frames decision 02 sits beside, and the wide window the HOMEPAGE's prototype card prints. The page has one other mode: `?embed` hands the document `data-embed` and the stylesheet takes off the nav, the hero, the two chapters, and the footer, leaving the cockpit and its own device chrome off with them. That is what stands in the tablet the homepage card opens, and it is a flag on this page rather than a second bare file so there is one copy of the cockpit's markup, one address in the sitemap, and no public URL with no way back to the site |
| `lab/aisle.{css,js}`, `prototype/aisle.html` | The Shortlist prototype, in the write-up's hero since 2026-10-29: one shopping trip at a phone's width, from a photo of a friend's lamp to a store aisle and a hand-off to a person, on sample data written at the top of the script. Shortlist is the feature's name in the app of the made-up store, Marigold Home. What the shopper liked about the lamp is asked once and carried through every later screen, and every screen is written from what the shopper did. No image search, inventory system, or model is connected, and the page says so in its first screen. Every screen after the first is drawn on a press, so `scripts/lib/reachable.mjs` registers fourteen states for it, and `scripts/aisle-test.mjs` walks every branch and asserts what each screen says. `scripts/aisle-shots.mjs` takes its screens for the lab index and the share card. It had a page of its own for a day; `prototype/aisle.html` is a forwarding note to the write-up now, which no check measures and `seo.mjs` holds to a noindex, a canonical, and a place outside the sitemap. An independent concept: the store is made up, and no retailer's name, mark, or colors appear |
| `lab/inspiration-to-aisle.html`, `lab/inspiration-to-aisle.css`, `lab/inspiration-to-aisle.js` | The Shortlist, one page since 2026-10-29: the question and four facts, with the working prototype beside them in the hero, then the opportunity, with what retailers already ship (one linked source), one service map drawn in HTML so the checks read it (the journey and a simplified service blueprint on six shared moments, opening on three claims about what it shows, each naming its moments, with a Today/Connected switch and a moment to follow down, both lanes showing without script; under 64rem the moments sit in a row the reader swipes, their lanes lined up across all six, under `map-rail.js`'s discs), five decisions each with the guess under it, made in place of research, then the bet with the study that would test it, and a close on the twenty years of work it draws on. From 64rem the phone holds one height and its screen scrolls inside it, so a press never moves the map. Illustrative and conceptual material is labeled as such on the figure itself |
| `writing/*.html` | The index and the seven articles it lists, each answering in its first paragraph a question a buyer asks before knowing the name, and each ending on the "How I work" page it describes and the account it draws on. The search doors into the site; see "What the site tells a machine" in `CLAUDE.md` |
| `design-system/index.html`, `design-system/ds.css` | The design system reference: tokens, type, spacing, and components, read off the stylesheets |
| `ab8eb2c23b8aa943256cadc405e3473d.txt` | The IndexNow key, public by design: a file at the root whose name and content are the key is how the site proves it may submit its own URLs. `node scripts/indexnow.mjs --submit` reads it and tells Bing which pages changed; see "What the site tells a machine" in `CLAUDE.md` |
| `robots.txt`, `sitemap.xml`, `llms.txt` | What a crawler is told, and what an assistant is told. The sitemap is generated -- `node scripts/seo.mjs --write` -- with a `lastmod` per page from git, and `node scripts/seo.mjs` fails if it stops matching the pages on disk or the dates fall behind. `llms.txt` is the site in a page of markdown for an assistant that reads that first |
| `404.html` | What Pages serves for a miss, at any depth: root-absolute links, `noindex`, no canonical, and not one of the thirty-four. `seo.mjs` holds it to all four |
| `scripts/` | The eight check scripts and the capture and render scripts, copied from staging with #20 and authored here since #28. `checks.yml` runs the checks; see Checks. `og.mjs` renders the share cards; `keys.mjs` writes each article's key ideas from its headings; `draw.mjs` queues the drawings for a browser and files what it draws |
| `js/vendor/anime.esm.min.js` | anime.js 4.5.0 (MIT), vendored; scrubs the design-to-build scene against scroll |
| `img/` | See Images |
| `Adam Hickey Resume.pdf` | The résumé a person downloads, linked from the footer: two columns, the site's wordmark, about half the words. Rendered by `scripts/resume.mjs` |
| `Adam Hickey Resume (detailed).pdf` | The same facts in one column, written to be parsed; what `llms.txt` points an assistant at, and the base every tailored variant is cut from. `node scripts/resume.mjs --full` |
| `scripts/variant.mjs` | Reorders the homepage's four cards, six facts, and dek, and the writing index's collections and articles, to lead with one of three proofs -- craft, substance, or AI -- and puts them back. The three orderings live in the private practice-hq repository, in `site-variants/`, beside the résumé variants and for the same reason; the base ordering (craft, on main since #177 and #178, its cards put back to ambiguity-first and prototype-last on 2026-09-17) lives in the script, so the site can always restore itself. A variant moves no text node and no rule, so every count the checks print is the same either side, and the script refuses to write a result whose block counts moved |
| `TYPOGRAPHY.md`, `COLOR.md`, `SPACING.md`, `MOTION.md` | The four normative specs. The check scripts read them as rules and this tree as evidence |
| `CNAME`, `.nojekyll` | Pages configuration: the custom domain, and no Jekyll pass over the tree |
| `.github/workflows/` | `pages.yml` deploys, `checks.yml` reports; see below |

### The homepage

Sections in file order, in the base ordering -- `scripts/variant.mjs` can
lead with a different proof, and `--status` says which is live: the hero (the portrait clip with its pause control,
an eyebrow naming the role, the search ("Open to remote or hybrid roles" since
2026-10-24), two buttons and a résumé link, the six-item proof strip,
and the client logos) → Selected work (the three client case studies first
since 2026-10-23 -- SAP, USDA, and since 2026-10-26 the Innovators Studio
identity where dispatch was -- with no label over them since
2026-10-24, then the lab card for Agent Review, the self-directed
prototype) →
How I work inside a
product organization (four pictures and their names, each opening its
section of `how-i-work.html` since 2026-10-29) → What changes when agents can build (the scroll
story, "The design-to-build shift" until 2026-10-06) → Built end to end (four
things made end to end, and the line to the this-site write-up) → About,
which links the two career case studies → the
contact section, headed "Describe what is happening". Since #24 there is no
Earlier experience section and no four-step panel under the products;
staging's #142 cut the second half of the page by about a third, and #143
gave the two career case studies their route in from About. The hire-me pass
put the work ahead of the method, reframed the engagement grid for a hiring
manager, brought the proof strip back as a résumé-level line, and moved the
book and the shelf out of the proof; the page argues for one thing first,
hiring Adam onto a team. From 2026-09-17 the four cards opened the pages
under `engagement/`, reworked from the engagement pages into one page
per card; from #129 to then they linked straight to the accounts. Since
2026-10-29 they open the sections of one page, `how-i-work.html`. The header carries Work, How I
Work, Writing, About and Contact, an email icon, and a LinkedIn icon, and every
page loads it from `site-nav.css`.

## The pages, by family

Twenty-seven pages in nine families, all hand-written HTML with no include step
and no build. The inventory lives here rather than on the design system page,
because a site inventory describes *this* site where the rest of that page
describes anything built with the system.

**A family is not a directory.** `/case-study/` holds three of them. What
makes a family is the content model and the shell it wears, not the path.

**The shell is copied, not included.** The fixed header, the nav links, the
email icon, and the skip link are hand-written into all twenty-seven pages, so a
change to the shell is a change to thirty-seven files.

**Two regimes.** There is no single base stylesheet, but there is a single
base ladder, and both regimes read it from `type.css`, which all twenty-seven pages
load. Regime A loads `style.css`; regime B is the six older pages on the built
Tailwind stylesheet, which cannot see anything `style.css` declares.

| Family | Pages | Regime | What it is |
|---|---|---|---|
| Homepage | 1 | A | The page every other page hangs off. |
| Client case studies | 4 | B | Client work under NDA-safe framing. The oldest pages on the site. |
| Build write-ups | 5 | A | Products built end to end, alone, and this site. Faunaform, since 2026-10-20, is the first still in progress. |
| How I work | 1 | A | One page for the four parts of the job: the situation, the moves, and the account that shows each. Four pages under `engagement/` until 2026-10-29, engagement pages until 2026-09-17. |
| Writing | 8 | A | An index, the two pieces it opens with under "Start here" (a personal essay since 2026-10-27, then the position article of 2026-10-20), and five articles in three collections named for its three words since 2026-10-20: the system, the build, and the judgment. Nine more addresses are forwarding notes since 2026-10-29. |
| Reference | 1 | A | The design system page. Unlisted; nothing links to it. |
| Prototypes | 1 | A | Self-directed, interactive prototypes framed as design work: the dispatch cockpit on synthetic data. Its interface on live Citi Bike data, the rebalancing cockpit, was a second from 2026-10-27 to 2026-10-29, when the lab went back to the dispatch story and its address became a forwarding note. The deploy console was a second until 2026-10-23, and The Shortlist's prototype had a page here from 2026-10-28 until it moved into its write-up's hero the next day. |
| Lab | 4 | A | The index of the working prototypes, each asking one question about a connected service, a design system, or a live operation (since 2026-10-28; it was "Design systems for humans and agents" before), the Agent Review case study, since 2026-10-28 The Shortlist, a service design exploration of one shopping trip across phone, store, and person, and since 2026-10-21 an exploration of motion, the homepage's former scroll story. The dispatch cockpit is listed there too, at its own address; the rebalancing cockpit took its place from 2026-10-27 to 2026-10-29. Since 2026-10-01 the homepage reaches it from one card under Selected work and from the navigation. |
| Career-arc pages | 2 | B | A span of years, told as a shelf of engagements. On 2026-10-29 they were one page, `earlier-work.html`, for a day; it and `other.html` are forwarding notes to them. |

**Homepage** -- `index.html`

**Client case studies** -- `case-study/dispatch-complexity.html`,
`case-study/innovators-studio-visual-identity.html`,
`case-study/sap-product-maturity.html`, `case-study/usda-operational-overhead.html`

**Build write-ups** -- `case-study/door-county-found.html`,
`case-study/lucy-learns.html`, `case-study/while-were-here.html`,
`case-study/this-site.html`. Same directory as the client work, different
family: these load `style.css` and carry no Tailwind. The fourth, since
2026-09-17, is about the site itself: the only page whose subject is the
tree it sits in, so every number in it is one a check here prints.

**How I work** -- `how-i-work.html`, since 2026-10-29. The four pages it
replaced, `engagement/product-clarity.html`,
`engagement/design-system-foundation.html`,
`engagement/embedded-senior-product-design.html`, and
`engagement/working-product-prototype.html`, are forwarding notes to its
sections, the way `prototype/aisle.html` is to The Shortlist. The last was
`engagement/ai-product-prototype.html` until #24; see "Two live URLs now
404".

**Writing** -- `writing/index.html` and the articles beside it. No fact
block; an article has no four facts to state. The kicker, the title, and a dek
that is the article's whole answer in three or four sentences, then the essay
on the `.writing-measure` column, then one line naming the engagement it
describes and the account it draws on, the next article, and the way back. The
family shipped on staging on 2026-08-28 with two of the practice essays,
was unlinked the next day and removed in staging's #113; #34 brought the
surface back with articles written for a buyer rather than for the practice,
and the essays themselves stay canonical in the field guide.

**Nine, in three collections, since 2026-09-17.** The collections are named
for the three leads the search runs on and the résumé variants are cut to --
craft and code, enterprise and operational software, AI as the material --
so a reader who arrived from one kind of posting finds the three articles in
its vocabulary under one eyebrow. Three articles were retired to hold the
count at nine: the handoff article, whose thesis is now one sentence in the
design-engineer article; the organizational-problems article, written for a
buyer of consulting rather than a team; and the AI-agents article, whose
point is one sentence in the design-engineer article's tokens section. One
was added, on how a designer works in the developer's tools. Two moved
collection and were redrawn on their new accent, the SAP blind onto
terracotta and the prototype boot onto sage, because the drawings' colour is
the index's sections. The three retired URLs 404 the way the two engagement
URLs above do, for the same reason.

Redrawn again on 2026-09-22, against the ten postings the search is read
against, and the count held at nine the same way: three retired, three added.
The HAX article came off, its calibrated-trust and "over time" sections
folded into a seventh key idea of the decide article; the ambiguity-to-release
article came off, its argument being the product-clarity engagement page it
pointed at; and the developer-tools article came off, its green-check-is-not-
a-live-site section moving to the design-engineer article and its five
questions in order to the new developer article. The three added are one per
collection, each on a subject the postings ask about that nothing here
answered: what a developer needs from an interface on a bad day, what a design
system needs once AI is in the product, and what a person needs to supervise
an AI agent -- the word "agent" had not appeared in any of the three AI
articles. Each has its two drawings in the set's hand, on its collection's
accent.

**Redrawn a third time on 2026-10-08, and for the first time nothing 404s.**
"Craft and code" became "Designing with code", and "What a design system
needs to explain to an agent" took the design-engineer article's place at
its head: what a coding agent can build from components and tokens, what
it still cannot know about meaning, and where a reviewer's answer should
be kept, worked through Agent Review. The design-engineer article was not
retired. It keeps its address, its sitemap entry, and the links into it,
and is simply no longer listed, so the family is eleven pages and the
index still shows nine. `keys.mjs` names it in an UNLISTED set and holds
the index to not carrying it. The new article has one drawing rather than
two, by the brief it was written to, and its card's small second colour is
an ochre rather than a reveal's butter (see `img/writing/` below).

**Regrouped on 2026-10-20, around the argument rather than the hiring
lead.** The position article "What makes a good product designer now?"
went above the collections under "Start here" (#498), and the collections
took its three words: **The system** (what people and agents build from),
**The build** (designing in working software) and **The judgment** (where a
person decides). Three articles came in, one at the head of each, written
from three research essays on how designers at Netflix, Atlassian,
Justworks, Adobe, and elsewhere are working now, every outside claim checked
against its primary source the same day: what changes when AI agents join
the product team, what a product designer is for when anyone can build, and
who decides when software can act on its own. Three went off the index and
kept their addresses, like the design-engineer article: the developer's bad
day and the workflow that breaks, whose case the dispatch case study now
makes, and the SAP article, whose case study stays on the
homepage. So the family is fifteen pages and the index still shows nine,
plus the one to start with. The three new ones have no drawings yet; their
rows on the index drop the card column the way Start here does
(`writing-item--lead`), and their share cards are type alone, until the
ChatGPT infographics the same plan briefs are made.

**One more swap on 2026-10-21.** "How should you test a product now that AI
can help?" took The build's third place from "What makes an interface feel
finished?", whose case the this-site write-up makes. The interface article
keeps its address like the other four, so the family is sixteen pages and
the index still shows nine, plus the one to start with. The new article
says what an AI agent checks well and what only a person can tell you, why
synthetic users are rehearsal rather than research (Nielsen Norman Group),
and where analytics fit, worked through Lucy Learns and Agent Review. Its
feature and second scene are a desire path, and its two sequences are rails
cut from one sheet drawn to the position article's rail sheet.

**Sixteen to seven on 2026-10-29**, in the copy cut. Three merged into the
article that already made their argument: what changes when agents join
the team into what a design system needs to explain to an agent, what a
designer is for when anyone can build into the position article, and the
enterprise-AI article into who decides. Six retired: the working-prototype
article (How I work's Build to find out says it), the design-engineer and
developer articles (roles the search does not seek), the workflow-breaks
article (the dispatch case study's story), the interface-finished article
(the design system page), and the SAP article (its case study). Each of
the nine addresses is a forwarding note like `prototype/aisle.html`. The
three collections stay, at two, one, and two, because `variant.mjs`
reorders exactly three. Their drawings stay in `img/writing/`; the index's
own share card still uses one of them.

#59 added three in positions two to four, and they are the first written for a
reader hiring a designer onto a team rather than buying a piece of work: what
someone needs the moment an operational workflow breaks, what an AI feature
owes the person acting on its answer, and how a request becomes a release.
Their scenarios are illustrative and each one says so in its dek, because none
of the three describes a delivered project and a reader should not have to
work that out. Two carry a Design psychology note, which until then had only
appeared on a case study. The order is editorial rather than chronological:
`hasPart` in the index's graph is kept in the order the page lists them.

**Career-arc pages** -- `case-study/enterprise-consulting.html`,
`case-study/hybrid-designer.html`. They share the case-study shell but the
content model is a list of many small pieces rather than one deep one, each
with its pictures at full size. About links both. `earlier-work.html`, which
held them as one page on 2026-10-29, and `other.html` are forwarding notes
to them.

**Reference** -- `design-system/index.html`

**Prototypes** -- `prototype/dispatch-cockpit.html`. A working demo rather
than a write-up: a vanilla HTML, CSS, and JavaScript cockpit wrapped in the
problem it answers, five design decisions, and what would be tested next.
From 2026-10-27 to 2026-10-29 `prototype/rebalance-cockpit.html` pointed the
same interface at Citi Bike's live feed and stood in the lab in its place;
the dispatch story is the stronger one, so that address is a forwarding note
to this page now, and the page, its script, and its saved reading are at the
tag `portfolio-rebalance-cockpit-2026-10-29`.

**Lab** -- `lab/index.html`, `lab/agent-review.html`, and, since 2026-10-21,
`lab/designing-motion.html`, the homepage's former scroll story, an
exploration rather than a test; the lab index listed it last until
2026-10-28, and it stays at its address, unlisted. The tenth family,
since 2026-10-01: the door to the experiments in React, AI-assisted
prototyping, and component systems, and the first flagship's case study.
The product the case study is about, Agent Review, is a React and
Storybook project in its own public repository
(`adamdhickey-collab/agent-review`), deployed by its own workflow to
GitHub Pages, and this tree only links and embeds it: a framework and a
build step stay out of a tree whose checks walk every file and whose
write-up says it has neither. The two prototypes keep their addresses
under `prototype/` and are listed on the lab index as well; the index
wears the writing index's shell, and the case study wears the build
write-ups'. Since 2026-10-20 the homepage's featured card leads Selected
work, above the three accounts: "How product design works now", which
introduces the lab through the position article rather than through one
product. Its figure is that article's loop drawn in code (style.css, "The
loop", and `loop.js`) and a link to the article; the card's first link is
the article too, and its second the lab index. A line under the card naming
the lab's pieces came out on 2026-10-21, leaving the navigation's Lab link
and the lab index to carry them. From 2026-10-12 to 2026-10-20 the card was
Agent Review alone, and its picture was the figure the case study opened on
(below). Before that the lab was one card
under the three accounts in Selected work, where the two prototype cards sat
until 2026-10-01, and since #343 it was about Agent Review rather than the
lab as a family: the product's own screen (`img/lab/agent-review-card.webp`, from
`scripts/lab-cards.mjs`, the capture the lab index uses too: since
2026-10-03 the delegated work, the product's front door, at its tablet
layout (784px, and 832px since 2026-10-05, where the app's top bar holds on
one line), one column of type that can be read at card size; before that run
1's change screen at 720, and before 2026-10-02 the full desktop review,
which could not be read at that size) in a tablet, one bezel all round
(the case studies' laptop until 2026-10-05), beside the question the lab
asks, the project, its result and two links, with the two prototypes and
the lab index as one line under it. The write-up's four figures are `scripts/lab-shots.mjs`, not hand
captures: each is taken from the deployed product and Storybook at two
sizes, a desktop one at 1100px (1440 for the hero, which prints wider) and a
phone one at 375 on a touch device, and the page offers the phone's through
`<picture>`, because a 1440px capture printed at 832 was seven-pixel type and
at a phone's width was a quarter of the screen.

The write-up opens on "Would you ship this?" over Relay's customer list,
a batch selected for archiving, since the evening of 2026-10-26, so the
opener, the pictures under it, the prototype's first screen, and the
homepage card follow one feature. Since the same night those pictures are
the prototype's own: agent-review draws each stage, the opener's batch, and
the three directions side by side as a 16:9 scene at `#/scenes/<id>`, and
`scripts/scenes.mjs` captures them to `img/lab/agent-review-scene-*.webp`.
The three directions side by side (`three`) are the lab index's card.
Since 2026-10-27 (agent-review#58) the scenes are dark, in the prototype's
default dark — the site's charcoal since 2026-10-29 (agent-review#79, which
took Night sage's green-black out) — and each stage scene is one decision: the cycle as
six dots, the call as the title, the agent's position in slate and the
person's in sage, and one fact set large. The case study's Explore row is
the `explore` scene, the three directions drawn as shapes, where it was
`three`. `scenes.mjs --theme light` takes the light palette. The cycle card
(`scripts/cycle-card.mjs`) still draws the case study's share card. From 2026-10-21 it opened on "Every action is a button. Except
cancel.", the billing run's hand-built "Cancel subscription" link drawn in
code (`quiet-cancel.css` and `quiet-cancel.js`, which were the homepage
card's picture for one day and left with it); that run is the case study's
second example now, after the cycle. That figure replaced the figure of
the earlier run 1's color example, which opened the page from 2026-10-12
and was the homepage card's picture until 2026-10-20; its connector,
`same-red.js`, and its rules in `style.css` went with it. On 2026-10-21, at
Adam's request, the guided tour under the hero came out entirely: the
`<details>` tour, `walkthrough.css`, `walkthrough.js`, and the
`img/lab/agent-review-tour-*.webp` captures it stepped through. From
2026-10-08 it listed seven steps beside the product in a tablet, in the
order their parts sit on the screen, each opening as the reader scrolled to
it; before that it was seven notes, one at a time, with a previous and a
next button at the two ends of a row of progress bars. Each note carried a
small drawing, `img/lab/tour-<part>.webp`, until 2026-10-05, when they came
off the page and out of the tree so the product could take the room; the
prompts that drew them are `scripts/tour-scenes.mjs`, behind
`scripts/draw.mjs --set tour`, as the record of the set. The drawing the
homepage card carried before its first capture, and the script that drew
it, are gone. The lab band that briefly sat
between Built and About went with the pair, and Lab joined the navigation
on every page.

The page lets the reader press the thing before it explains it. Since
2026-09-20 the problem is followed straight by the live cockpit, and the
decisions come after, as the argument about an interface the reader has
already had their hands on. Two arrangements came off to get there and both
were the same mistake at different sizes: a rail of numbered callouts beside
the demo, which annotated a screen nobody had looked at yet and left a
monitor-width interface two thirds of the frame; and then a scroll-snap
slideshow of four captures above it, which put a photograph of the prototype
between the reader and the prototype and pushed the hero's own "Try the
prototype" button four thousand pixels down the page. What survives is the
pair under decision 02 -- the rule and the stale reading, side by side,
because that comparison is the one the live panel can only make across two
tab presses and a scroll -- and they are made from the running prototype by
`scripts/cockpit-shots.mjs`, so the picture and the live demo cannot drift
apart. Its
own directory rather than `case-study/`, because `tailwind.config.js` reads
every word of every file there as a candidate class, and a page with this
much interactive markup would have emitted utilities into the built
stylesheet. It is labelled on the page, in its head and in `llms.txt` as
self-directed and synthetic, informed by the Midwest Couriers cockpit and not
an account of it. The homepage's Selected work section closed on it, in a
card that spanned the grid, from 2026-09-15 until the deploy console made
the two a pair; the card still says in its first line that everything above
it is client work and this is not, and the AI article and the Working Product
Prototype page link to it as well. Until that card it was reachable only by
reading one of those two pages to the end, while its own breadcrumb told a
search engine it sat under Work.

`prototype/deploy-console.html` was the second prototype, from 2026-09-28
until 2026-10-23: the cockpit's arrangement applied to a developer's bad
day, a deploy console named Rollcall, on synthetic data. It came off the
site on 2026-10-23, with its stylesheet, its script, `img/console/`, its
share card, and its two capture scripts, and the pages that linked to it
were rewritten to stand without it. Git history has all of it.

### Images

| Folder | Holds |
| --- | --- |
| `img/site/` | Case-study screens, client logos, and the built-step drawings, the bulk of the folder |
| `img/about/` | Three photographs, each as a 600x450 frame thumbnail and a full size the lightbox fetches only when opened |
| `img/engagement/` | The four card still lifes at 1080x720, each "How I work" page's hero, and the numbered step drawings (the four invitation drawings went with the invitation band on 2026-09-17). **The four card pictures are the still lifes again since 2026-09-17**: `01-clarity`, `02-system`, `03-embedded`, and `04-ai` are the homepage's "How I work" grid, real objects on an office theme, each on its own wall, at this folder's 3:2 and 1080x720, the bytes the archive's #77 and #104 left them at. From #135 to then they were redrawn in the writing set's hand -- flat vector, one everyday object cropped by the frame -- from `scripts/proof-cards.mjs` through `scripts/draw.mjs --set proof`, cut to 16:9 (#150); that registry stays, and nothing on the site loads its output now. They keep their paths because only the homepage loads them. Everything else in the folder is still the engagement spec below. The retired brand page's drawings stay, as part of the set. The Whole Thing's six went to the archive on 2026-09-08: no page here loads them, they were the one set never solved to its hero, and `adamhickey-next` holds them at the bytes they left with |
| `img/writing/` | Two drawings per article in one hand: the feature, stored as the 1600x900 picture under the article's dek and the 640x360 card beside its entry on the index, both cut from one source through `scripts/illustrate.mjs feature` and `card`, prompts in `scripts/writing-features.mjs`; and `<slug>-2.webp`, the same object seen again for the argument's second half, at 1600x900 in the body, from `scripts/writing-scenes.mjs`. Both go through `scripts/draw.mjs`, which takes `--set features` for the first. The hand is a magazine lead's rather than a diagram's, after the grammar The Atlantic's art department uses: the essay's most literal noun with the essay's verb performed on it once, drawn as one everyday object bigger than the frame, flat vector with a single outline weight on a putty-cream ground, black used as a solid shape (a strap, a cord, a shadow) and never as shading, no people, no text. The reference is `img/inbox/reference-binoculars.png`, tracked by name. Four passes before this one were diagrams of the argument, and the card at about 300 CSS pixels is what showed it. **A feature's accent colour is its section on the index** -- sage `#657d60` for AI in the workflow, slate `#56718c` for Systems and teams, terracotta `#c0714e` for Getting to a release -- so `draw.mjs take` measures the dominant hue of what came back (`scripts/lib/accent.mjs`) and says which group it landed in; three of each ten flip it, a cream object on the full accent field. Two colours beyond the accent, butter yellow `#F0DF7C` and dusty rose `#D9A3B4`, are allowed only inside a reveal, a small second picture inside the object, and never as the object, so the hue measurement still finds the section. One picture carries a third, on purpose: the agent article's feature (2026-10-08) pins a small card in muted ochre `#D4A548`, a deeper sibling of the butter, to one of two identical slate panels, because its brief asked for ink-blue, cream, and a small ochre; the job says so in its own colour line (`colours` in `writing-features.mjs`) The engagement set's luminance band does not govern these; `illustrate.mjs` will flag the cream-ground pictures bright and the accent-field pictures dark, and both are correct **Rail tiles, since 2026-10-20, are a third kind and a different hand**: `<slug>-<figure>-<n>.webp` 240 high and trimmed across to the drawing (cut at 360x240, so one figure is one scale), the drawings of a rail figure (`.writing-rail` in `style.css`), small wordless interface glyphs on white in the sage line of Agent Review's learning loop, each flush with its step's words and no line between them, with rose only where a person reads or decides. Each figure is one 3 x 2 sheet drawn in ChatGPT, filed by `draw.mjs sheet <name>` to `img/inbox/<name>-sheet.png` (kept local) and cut by `draw.mjs slice` to tiles at one shared scale; every word of the figure is the page's text and every tile is `alt=""`. |
| `img/shelf/` | The four shelf cards |
| `img/og/` | The share cards, one per page, rendered by `scripts/og.mjs` from the page's title and its own picture. The homepage's is `index.jpg`, and the design system page, which has no card of its own, points at that one. Until 2026-09-17 the homepage kept a hand-drawn `img/og-card.jpg`; it named the independent practice a week after the site stopped, and went the day the eyebrow moved to Senior |
| `img/products/` | The Built end to end product shots, used by the homepage, the Lucy Learns write-up, and the prototype engagement page |
| `img/cockpit/` | The dispatch cockpit prototype page's pictures: six crops of the running prototype, captured by `scripts/cockpit-shots.mjs` so a restyle of the cockpit is one run rather than an afternoon of screenshots, and two drawings of the room it is used in, cut to the writing features' 16:9 through `scripts/illustrate.mjs feature` |
| `img/dcf/`, `img/lucy/`, `img/wwh/` | One folder per build write-up: Door County Found captures, Lucy Learns phone screens, and art-era scenes, While We're Here book photographs. The first two are captured by `scripts/dcf.mjs` and `scripts/lucy.mjs` from sibling checkouts on the Mac, so a restyle there is one run rather than an afternoon of screenshots |
| `img/casework/` | One image, on the Hybrid Designer page |
| `img/hero-portrait.mp4` | The hero clip |
| the rest of `img/` | Two portrait stills, the CBRE logo, the favicons, the touch icon, and `icon-192` / `icon-512` |

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
resamples, lifts, and solves a hero's wall against the charcoal. **This spec
governs the heroes and the step drawings; the four homepage cards are the
still lifes**, real objects on their own walls rather than drawings, and
are not held to it. From #135 to 2026-09-17 they were drawings in the
writing hand instead; `scripts/proof-cards.mjs` still carries those prompts
and the reasons, and `illustrate.mjs step` flagged their cream ground as
above the set's 126-184 band, correctly.

**The six client wordmarks share one left edge.** Each SVG in the homepage
strip is a 200x98 box, and each file's `viewBox` is shifted so its ink
begins at exactly 31.86 units in; the number and the reason sit in a
comment at the top of every file. At the 1280 container the
box is 150.67px wide inside its `--space-md` inset, so the ink starts
16 + 31.86 x 0.7533 = 40px into its sixth, which is `--space-3xl`, the inset
the six facts above the strip carry (#165). A replacement wordmark goes in
the same way: draw it in the 200x98 box at whatever width matches the
others, measure where its ink starts, and set the `viewBox` x to that
minus 31.86. Drop one in at `viewBox="0 0 200 98"` and its mark upstairs
will miss it by however much whitespace the file happens to carry.

Cache-busters: the stylesheets, the images, and the hero clip are loaded with a
`?v=` query, and it gets bumped whenever the bytes at a path change, because
the path alone will not tell a browser anything moved.

## Checks

`checks.yml` runs on push to `main`, after the merge, and on demand with
`gh workflow run checks.yml --ref <branch>`. It does not run on pull
requests: from #15 to #147 it did, and it never gated a merge -- `main` has
no branch protection -- while putting the four browser legs on the clock of
every merge. #148 took that away and left nothing checking a merge at all,
which was worse; #151 settled on checking after the merge, where the runner
waits instead of a person, and opening an issue when a leg goes red. It
reports and deploys nothing; the two workflows are separate on purpose so a failing check
reads as a failing check rather than as a failed deploy. It is the eight
scripts that came across from staging with #20, four written here
(`keys.mjs`, `cards.mjs`, `readtime.mjs`, and `oxford.mjs`), and the two
Tailwind steps this repository had first, fourteen steps in all:

- **The tree can be tarred** -- `deployable.mjs`. No tracked symlink and
  nothing tracked that `.gitignore` matches, because the Pages artifact is a
  tar of the root and one entry tar cannot follow loses the whole deploy.
  `pages.yml` runs it too, immediately before the upload.
- **Every token the documentation names exists** -- `tokens.mjs`. The specs
  read as claims: every `--token` they name exists or is declared retired.
- **Every counted claim still counts** -- `counts.mjs`. The numbers the specs
  and this file assert, recounted from the tree.
- **What the site tells a machine still matches the site** -- `seo.mjs`. A
  canonical, an Open Graph card, and a JSON-LD graph per page, and a sitemap
  listing every page once with a `lastmod` that agrees with the page's own
  `dateModified` and is within a fortnight of the file's last commit; every
  FAQ question in a page's graph is on the page in words; and `404.html` is
  noindexed, uncanonical and out of the sitemap. None of it renders, so none
  of it looks wrong. `--write` regenerates the sitemap and restamps the dates.
- **Every key idea is still its heading** -- `keys.mjs`. Each article says
  its argument three times, as the h2s, as the list of key ideas under the
  dek and as the eyebrow over each section, and the last two are written
  from the first. A heading reworded without `--write` is a list naming a
  section the page no longer has.
- **Every list of three keeps its Oxford comma** -- `oxford.mjs`. VOICE.md's
  rule, "phone, store, and person," held over every page's visible text,
  alt text, titles, descriptions, and metadata (Open Graph, Twitter,
  JSON-LD), plus `llms.txt`, the `og.mjs` registry, the `variant.mjs`
  registry, this file, and the four specs. A
  phrase that only looks like a list is allowed by name in the script, with
  its file and one line saying why, and an entry nothing matches any more
  fails.
- **The built Tailwind stylesheet is current.** It rebuilds from
  `tailwind.config.js` and the markup and compares; when the bytes differ it
  reports at the class level, which selectors the markup uses that the
  committed file lacks and which are committed but no longer built, because
  both files are one minified line and a plain diff says nothing.
- **No page compiles Tailwind in the browser.** One grep for the CDN
  compiler, which #14 removed from all six case studies.
- **Contrast, at rest and in every reachable state** -- `resting.mjs` and
  `states.mjs`, both `--strict`. Neither covers the other: a color can be
  perfect at rest and fail on hover, and it can fail sitting still, which no
  amount of state-forcing notices.
- **No partial border on a curved surface** -- `curves.mjs`.
- **Every type size is on the scale** -- `typescale.mjs`.
- **Every card on a ground has an edge that reads** -- `cards.mjs`, at 1.2:1
  or better.
- **Every read time says what its page takes** -- `readtime.mjs`. The words a
  reader meets in `<main>` at 238 a minute, plus 12 seconds for the first
  picture with alt text, a second less for each after and 3 from the tenth,
  rounded to the nearest minute; the script's header has the whole rule. It
  ran by hand from #568 until it joined the sweep, and it is the one browser
  check that measures only some pages: the 27 that state a read time. After
  a change to a page's words or pictures, `node scripts/readtime.mjs
  --write`, then `keys.mjs --write` for the writing index.

"Every reachable state" was an overclaim for one page until the four browser
checks learned to press things. They load a page, wait for it to settle and
measure what is there, which is the whole of twenty-eight of the thirty
pages -- and about a sixth of each page under `prototype/`: the cockpit renders
its comparison, its override question, its refused button, and its opened rows
from JavaScript in response to a press, and the deploy console its failed
build, its reading, its rollback plan, and its rolled-back rows. Twelve such states existed in no DOM
any check ever saw, so every `querySelector` for them came back empty and every
check said "✓" in good conscience.

`scripts/lib/reachable.mjs` is the registry that fixes it: per page, a list of
named states and the selectors to click, in order, to get to each from a fresh
load. Every browser check but `readtime.mjs` imports it and measures each
state on its own reload; a read time is a claim about the page at rest. It is
curated by hand and lives outside the page on purpose -- a `window.__states` the
page exported would ship test scaffolding to readers and let a change to the
page quietly edit the list of what gets measured. `reach()` throws on a selector
that matches nothing, so a state going stale fails the run rather than silently
covering less.

Reaching a state is not the same as measuring it, and two of the console's
proved it. A first deploy and a rollback in flight are moments the page ends
itself about two seconds after the press, and `states.mjs`, which walks a
state's rules one element at a time, measured the rollback's finished Undo
button under the in-flight name in every run that was looked at, while
`resting.mjs`, measuring with reduced motion, never saw either moment at
all. A state like that now names a `holds` selector. It is measured on a
page whose clock the registry stops just before the press, so the beats
that would end the moment never come, and every check asks afterwards
whether the moment is still there and still the same element, failing the
run as unmeasurable when it is not. The first deploy's far side, which
lands four beats after the press and which only `resting.mjs` had ever
measured, by accident, is a state of its own reached the same way: the
stopped clock is run forward until the landed screen is there. Since
2026-10-23, when the console left the site, no state holds a moment and the
cockpit is the only page in the registry; the machinery stays for the next.

It found a real one on its first pass. `table` is a type selector, so
`.ck table .ck-btn:hover` outranks `.ck .ck-btn-primary:hover`, and the
comparison is a `<table>` -- hovering its Assign button kept the near-white ink
and swapped the accent green for a pale wash. Measured on a real pointer:
5.32:1 at rest, 1.29:1 under the cursor.

The six static checks need nothing installed and report before anything
is; the browser checks use the runner image's Chrome and fall back to
fetching Chromium. Locally, the same twelve scripts:

```
npm install --no-save --no-audit --no-fund playwright-core tailwindcss@3.4.19
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node scripts/deployable.mjs               # the tree can be tarred into an artifact
node scripts/tokens.mjs                   # every token the docs name actually exists
node scripts/counts.mjs                   # every number the docs assert, recounted
node scripts/seo.mjs                      # what the site tells a machine, vs the site
node scripts/keys.mjs                     # every key idea on an article is still its h2
node scripts/oxford.mjs                   # every list of three keeps its Oxford comma
node scripts/resting.mjs --strict         # every color a reader can see, untouched
node scripts/states.mjs --strict          # hover, focus and script-applied state
node scripts/typescale.mjs                # every rendered size against the fourteen steps
node scripts/curves.mjs                   # no partial border on a rounded surface
node scripts/cards.mjs                    # every card on a ground has an edge that reads
node scripts/readtime.mjs                 # every read time against its page's words and pictures
```

`CHROME` has to name a browser that exists, and the scripts check. Each
prints the path, page count, and commit it measured before doing anything
else; read that line first, because a wrong target you cannot see is a false
result. At #62 the four browser checks measure 3335 resting colors, 1627
state rules, 14172 type sizes, and 7871 elements checked for a partial
border, across twenty-nine pages (thirty since the deploy console): the twenty-eight of the site as it then stood and `404.html`, which
the browser checks measure and the inventory does not count. Nothing
verifies those four numbers; treat them as a tripwire, and a run that comes back materially smaller means something
stopped being measured.

The scripts came across from staging with #20 and are authored here since
#28. `counts.mjs` never took staging's one extra entry, a claim about how
many of its pages the live site carried, because here is the live site.

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
| Staged first in | Nowhere, since 2026-09-08. The pull request's checks are the gate; see `CLAUDE.md` |

This site carries no `noindex` anywhere but `404.html`, and the Google
Analytics tag `G-BLY8X4YCNK` on every page. Staging's pages carried the reverse, a
`noindex` meta marked `STAGING ONLY` and a `STAGING NOTE` comment where the
tag would be, so a page lifted from the archive needs those two swapped
before it merges. Every page names its https://adamhickey.com/ address
absolutely in the canonical link, the Open Graph card, and the JSON-LD graph,
`seo.mjs` holds each page to it, and the sitemap it generates lists the
thirty-four live addresses, each dated. Every case study's and every article's
Article carries `datePublished`, the date the page first existed at its
address, and `dateModified`, which `seo.mjs --write` stamps from git; every engagement's
graph carries the questions its page answers as a FAQPage; and every page
but two names its own share card under `img/og/`. Since #29 the domain
enforces HTTPS, so plain `http://` redirects rather than serving a second
copy of the site.

Since #32 the `<title>` of the homepage and the four engagement pages is
written in the words a buyer types before knowing the name, "Enterprise
Design Systems for Product Teams" rather than "Design System Foundation",
while the h1 keeps the page's own name. Those titles name the work rather
than the working arrangement: three of them ended in "Consultant", which is
the one word a hiring manager reads as a permanent commitment to consulting,
and every head term survives without it. The description and the Person's `knowsAbout`
say the same five things the practice wants to be found for: complex
enterprise software, enterprise design systems, legacy modernization, AI
product prototyping, and agentic workflows (since 2026-10-06, where it said
AI-supported decision workflows), embedded senior product design. `seo.mjs` holds each
page's `og:title` to its `<title>`, and the share cards `og.mjs` renders
carry the h1's name, since a feed is where the name is the thing to
recognize.

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
paths), so the same files work from a subpath, as they did on the staging
host, and from this root domain. The exceptions are the addresses a machine reads: `og:image`,
`og:url`, the canonical link, and the structured data, which scrapers do not
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
| #20 | The live site catches up with staging at its #136: fifteen pages, the four specs, the scripts, canonicals, and structured data on every page; the brand page retired; `noindex` gone |
| #21 | American English throughout, the same sweep as staging's #145 |
| #22 | This file describes the tree #20 left behind, and `counts.mjs` stops asking how many pages the live site carries |
| #23 | `checks.yml` runs all seven scripts, not just the two Tailwind steps, and `pages.yml` refuses a tree it cannot tar |
| #24 | Level with staging again, at its #147: eight pull requests carried as one three-way merge, the prototype engagement page renamed, and `.gitignore` stops matching `node_modules/` with a slash, which is how staging once committed a symlink |
| #25 | The editions list on the design system page reads the same on both hosts; staging's #150 |
| #26 | Level with staging at its #150: the header's section links on every page and the engagement proof cards, staging's #148 and #149 |
| #27 | Level with staging at its #169: seventeen pull requests carried as one three-way apply -- the phone menu drawer and `site-nav.js`, the step cards' output line, four critiques, the Lucy Learns write-up, and the italic cut on every page |
| #28 | Staging is archived at its #169 and the work happens here: `CLAUDE.md` arrives, adapted from staging's; `mirror.mjs` goes; the editions list on the design system page says there is one edition; and `robots.txt` stops describing a host it is no longer served from |
| #30 | The two build write-ups stop linking out to their products; the write-up is the evidence, and the products are not offered from this site |
| #29 | What the site tells a machine, widened: dates on every Article and in the sitemap, stamped from git by `seo.mjs --write`; a share card per page from `og.mjs`; the questions people ask, answered on the four engagement pages and in their graphs; `llms.txt`; a `404.html` with the way back in; titles and descriptions cut to the length a result shows; and one plain sentence in About saying who this is |
| #32 | The homepage and the four engagement pages are titled in the words a buyer searches, the h1s keep their names, the Person says what it knows, and the site can tell Bing what changed through IndexNow |
| #34 | The Writing family comes back, as search doors: an index and six articles, each answering a buyer's question in its first paragraph and ending on the engagement it describes and the account it draws on; twenty-two pages in seven families |
| #59 | Three articles on operational work in positions two to four -- the moment a workflow breaks, AI that helps someone decide rather than only answer, and a request carried through to a release; the opening article closes on the account rather than the engagement, and the index lede leads with the three; twenty-five pages in seven families |
| #62 | The first Prototypes page: a self-directed dispatch cockpit on synthetic data, vanilla HTML, CSS, and JavaScript in its own directory, arguing in four working states that people skip verifying a recommendation when they can predict its misses; the AI article and the Working Product Prototype page link to it; twenty-seven pages in eight families |
