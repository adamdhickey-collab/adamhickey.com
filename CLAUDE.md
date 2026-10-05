# Working in this repository

## What this repository is

`adamhickey.com` is the **live public site** and, since 2026-09-08, the
working repository. `.github/workflows/pages.yml` uploads the repository root
on every push to `main`, and `CNAME` puts that upload at https://adamhickey.com
about a minute later. There is no build step and no gate in between: a merge
is public.

Until 2026-09-08 the work happened in `adamdhickey-collab/adamhickey-next`, a
private staging repository deploying to a `noindex` host, and every change was
carried here by hand as a diff. That repository is archived, read-only, at its
#169, which is exactly what #27 brought this tree level with. There is no
staging any more. The branch and the checks that run on it are the gate, and
the site is what a stranger sees the minute the merge lands. `README.md` has
the full arrangement and the history.

If a file here and its copy in the archive disagree, **this one is the truth.**
The archive stopped; this tree did not. The one thing to go back to the archive
for is its `CLAUDE.md`, which carries a ledger of every measured count that
moved between 2026-09-03 and 2026-09-06 and the arithmetic behind each. That
ledger stayed there on purpose; read it when a number here looks wrong and
the section below on counts does not explain why.

`scripts/mirror.mjs` went with the archive. It compared the staging tree
against this one, and there is no second tree.

## Where your session is running, and what changes

| | Sees | Use it for |
| --- | --- | --- |
| **Local** (`claude` on the Mac) | The whole filesystem: this repo, the sibling checkouts (`../lucy-learns`, `../door-county-found`, the archived `../adamhickey-next`), Downloads | Visual iteration, anything involving images, the capture scripts |
| **Remote Control** (`claude --rc`, or `/rc` mid-session) | The same. Claude still runs on the Mac; claude.ai and the phone are windows onto it. A photo attached from either is seen directly in the message; other files are downloaded to the Mac and passed as `@` references | Steering that same work from away |
| **Cloud** (`claude --cloud`, or claude.ai/code) | A fresh clone of **this repository only** | Well-defined batch jobs: link audits, unused-CSS sweeps, running `states.mjs` over every page |

If you are a cloud session, you cannot see the sibling checkouts or the
archive's local clone, so `scripts/dcf.mjs` and `scripts/lucy.mjs` will not
run. Say so rather than guessing at what they would have captured. `claude
--teleport` pulls a cloud session down to the Mac, branch and history intact,
so starting in the cloud does not commit anyone to finishing there.

## Git

Work happens on a `claude/<task-name>` branch and lands through a pull
request. **A merge never waits on a check.** The fast five run locally before
the push, because they cost a second; the five browser checks run scoped to
the page when the change is one page, and otherwise ride the post-merge run
(below). The one change worth holding a merge for is a stylesheet more than
one page loads -- `gh workflow run checks.yml --ref <branch>` and read it
before merging. **Never push to `main` directly.** `main` is the
live site, and there is no host in front of it any more. One carve-out, below.

### Asset swaps go straight to `main`

Replacing an image does not need a branch, a pull request or a merge. Commit it
to `main` and let Pages deploy. A change qualifies when **both** hold:

- The diff touches only files under `img/`, plus, at most, the `src`, `width`
  and `height` attributes of the tags pointing at them.
- `node scripts/resting.mjs <page> --strict` **and** `node scripts/states.mjs
  <page> --strict` both pass, at the same counts as before the change.

Anything else is a normal change: stylesheets, specs, copy, structure, and any
alt text or figcaption worth more than a typo fix. Those keep the branch.

Two things the carve-out does not excuse. `width` and `height` move with the
file, always: a hero is `fetchpriority="high"` above the fold, and attributes
left at the old dimensions reserve the wrong box and shift the page as it
decodes. And the cache-buster gets bumped whenever the bytes at a path change,
because the path alone will not tell a browser anything moved.

The reason this is safe is narrow and worth stating: the pull request gates
nothing here. Pages deploys from `main`, so a bad merge is live either way, and
nobody reviews these but you. The protection is the two contrast checks and
reading the diff, and all of that happens before the push regardless. What the
carve-out removes is ceremony, not review.

**`resting.mjs` is the one that matters here.** `states.mjs` forces hover,
focus and script-applied state and cannot see text sitting on a photograph,
which is the whole risk of swapping the photograph. `resting.mjs` measures ink
over artwork by the pixel. Put the hero caption back to the scrim it had
before that fix, so it measures 3.34:1 against a 4.5 floor, and `states.mjs`
passes the page while `resting.mjs` fails it on `.hero-caption-name`. That
failure was live on this site at 3.88:1 the day the rule was written, and a
swap of `hero-portrait.mp4` is exactly the change the carve-out waves
through. `states.mjs` stays in the condition: a caption that changes color on
hover over a new photograph is its question, not `resting.mjs`'s.

**Pull requests are squash-merged.** A squash replaces the branch's commits
with a single new commit on `main`, so the branch and `main` diverge by
construction; the branch then reports as "ahead" while containing nothing
`main` does not already have.

**Sync the branch to `main` immediately after each merge**, not at the start of
the next task:

```bash
node scripts/syncable.mjs --apply             # checks, then syncs only if it passes
```

`--apply` does the fetch, the check, the reset and the force-push in one run.
Use it rather than the four commands separately, because separately is how the
check gets skipped: it prints two commands, and a caller who runs them before
reading the exit code has overruled the guard without noticing. `--apply`
refuses on a dirty tree, refuses to sync a branch you are not standing on, and
refuses on anything that is not a clean pass.

```bash
git fetch origin main                         # syncable.mjs reads origin/main; stale ref, wrong answer
node scripts/syncable.mjs                     # exit 0 = the force cannot lose work
git checkout -B <branch> origin/main
git push -u origin <branch> --force-with-lease
```

`syncable.mjs` is the guard, and it is deliberately **not** `git diff --stat
origin/main origin/<branch>`. A non-empty diff has two causes that look
identical and want opposite responses: the branch being *behind*, where forcing
is safe and the entire point, and the branch being *unique*, where forcing
destroys the only copy. The script answers the real question per file: does
the branch's blob for this path appear anywhere in `main`'s history for it?
**Exit 0** means force away; **exit 1** means stop, the branch holds work
`main` has never seen; **exit 2** means it could not tell, which is *not* a
yes. Never force without it.

## A green `checks` does not mean the site updated

Those are two workflows and they fail independently. `checks.yml` reports on
the tree; `pages.yml` ships it. A commit can pass all ten checks and never
reach the URL, and when that happens the site does not look broken. It looks
unchanged, which is indistinguishable from a change nobody made.

Two shapes of that, both real:

- **The deploy fails.** Staging's #111 replaced the whole Lucy Learns image
  set, went green on `checks`, and failed the deploy fourteen seconds in,
  because it had also committed `node_modules` as a symlink to a path on one
  Mac. The artifact is a tar of the repository root with `--dereference`, so
  one entry the runner cannot follow loses the whole deploy. `node
  scripts/deployable.mjs` now runs first in `checks.yml` and immediately
  before the upload in `pages.yml`: it refuses any tracked symlink and any
  tracked path `.gitignore` matches, so a pull request like that goes red on
  its own branch.
- **The deploy never fires.** The squash-merge of #17 ran `checks` and never
  ran `pages.yml`; the merges before and after ran both. After merging, look
  at the Actions list for a *Deploy static site to GitHub Pages* run on the
  merge commit, and if there is none, start one:

  ```bash
  gh workflow run pages.yml --ref main
  ```

Unlike staging's, this repository's `pages.yml` does not open an issue when it
fails; a red run in a tab nobody has open is the only notice. That step is in
the archive's `pages.yml` and is worth carrying across. Pages also caches for
ten minutes (`cache-control: max-age=600`), so a fetch straight after a deploy
can return the old bytes; add a query string before deciding the deploy
failed.

## Running the site

Nothing to install to **serve** it. Every internal link and asset reference is
relative, so any static server works, and the one generated file is committed.

```bash
python3 -m http.server 8000        # from the repository root
```

Serve from the root, not from a subdirectory. Pages link sideways to
`design-system/` and to `img/`, so a narrower root 404s them.

### One file is built

`case-study/case-tailwind.css` is generated from `tailwind.config.js` and the
six Tailwind case-study pages, and `checks.yml` rebuilds it and diffs the
bytes. There is no `package.json`; the install is `--no-save`:

```bash
npm install --no-save --no-audit --no-fund playwright-core tailwindcss@3.4.19
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/tw-input.css
npx tailwindcss -c tailwind.config.js -i /tmp/tw-input.css \
  -o case-study/case-tailwind.css --minify
```

**Install both packages in one command.** Without a manifest, `npm install
--no-save <one>` prunes whatever the previous install left, so installing
Tailwind after Playwright removes Playwright, and the other way round removes
Tailwind ("added 1 package, and removed 72 packages"). `checks.yml` learned
this the hard way and installs them together.

**The trap is not the red check, it is the silence before it.** The build
emits only the classes those six pages actually use, so a class the markup
names but the build has never seen is not an error. It is nothing at all: the
type simply measures wrong at every width and the console says nothing. Grep
the built file for a class before trusting it, or add it to the markup and
rebuild, which is what makes it exist.

The trap runs the other way too. The `content` glob is `case-study/*.html`,
which includes the three build write-ups that never load the file, and
Tailwind reads every word in those files as a candidate class. A sentence
containing the word "fixed" made the build emit `.fixed`, the committed file
lacked it, and `checks` went red on a pull request that had not touched a
Tailwind page. The config header lists the utilities that already ship this
way. Reword the sentence rather than commit the rule.

Hand-editing the built file fails on a step whose report reads the difference
correctly and guesses the cause wrong ("same selectors, different bytes -- a
Tailwind version change, most likely"). Verify the way CI does: build to
`/tmp/tw-built.css` and `diff -q` it against the committed file.

## Images and assets

Assets live in `img/<project>/`: `img/lucy/`, `img/dcf/`, `img/wwh/`,
`img/engagement/`, `img/about/`, `img/products/`, `img/shelf/`, `img/site/`.
Follow the existing naming in the folder you are adding to; `img/lucy/` is the
pattern worth copying (`era-03-lavender.webp`, `release-before.webp`,
`tab-progress.webp`).

Two sets have a written rule that an optimize-and-commit step will quietly
break, so do not run a generated image into either without checking
`README.md` first: the **About photographs** are exposure-matched to a mean
luminance of 122 on a shared 1.06 contrast curve, and the **engagement
illustrations** follow a style spec at 3:2, 1080x720, and go in through `node
scripts/illustrate.mjs`, which crops, resamples, lifts and solves a hero's
wall to 8:1 against charcoal (README, "Images"). A file that misses either
does not look wrong on its own. It makes the set stop reading as a set.

The **Lucy Learns** phone screens and art-era scenes are captured by `node
scripts/lucy.mjs` from the sibling `lucy-learns` checkout, and the **Door
County Found** captures by `node scripts/dcf.mjs` from its sibling, so a
restyle there is one run here rather than an afternoon of screenshots. Re-run
the script rather than capturing by hand; a hand capture is the one that
drifts.

### Drawing in the browser

The drawings are generated in ChatGPT through the user's own Chrome, in the
chat the account already pays for, and taken into the set by
`illustrate.mjs`. `scripts/draw.mjs` is the loop's two ends: `queue` writes
the jobs from `scripts/writing-scenes.mjs` to `img/inbox/QUEUE.json` (the
first job carries the style preamble PR #53 used and attaches the reference
as a PNG; the rest open "Same style"), `next` prints the prompt to put in the
composer, `clip` or `land` files what comes back from the clipboard or from
`~/Downloads`, and `take` runs `illustrate.mjs feature` on it. The browser
side, with the exact page scripts that work (type through
`execCommand('insertText')`, send through `send-button.click()`, poll for
`img[alt^="Generated image"]`, `fetch` it same-origin to the clipboard), is
the local skill `.claude/skills/draw-in-the-browser/SKILL.md`, which
`.gitignore` keeps out of the tree; if it is missing, the header of
`draw.mjs` and the `how-long-is-now` sibling's skill of the same name are the
source. A chat that stops answering has hit the account's image cap for the
period; `draw.mjs status` says what is still owed.


## Before pushing a change to color, type, spacing or motion

The four specs are normative: `TYPOGRAPHY.md`, `COLOR.md`, `SPACING.md`,
`MOTION.md`. Where a spec and the stylesheet disagree, one of them is a bug,
and it is not always the stylesheet; all four have been found stale at least
once.

```bash
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node scripts/deployable.mjs               # the tree can be tarred into an artifact
node scripts/tokens.mjs                   # every token the docs name actually exists
node scripts/counts.mjs                   # every number the docs assert, recounted
node scripts/seo.mjs                      # what the site tells a machine, vs the site
node scripts/keys.mjs                     # every key idea on an article is still its h2
node scripts/resting.mjs --strict         # every color a reader can SEE, untouched
node scripts/states.mjs --strict          # hover, focus and script-applied state
node scripts/typescale.mjs                # every rendered size against the fourteen steps
node scripts/curves.mjs                   # no partial border on a rounded surface
node scripts/cards.mjs                    # every card on a ground has an edge that reads
node scripts/states.mjs <page> --strict   # just the page you touched
```

`checks.yml` runs all of these plus the two Tailwind steps **on push to
`main`, after the merge**, and on demand with `gh workflow run checks.yml
--ref <branch>`. Nothing runs on a pull request, so nothing to wait for
before merging; a failure opens an issue naming the commit, which by then is
live. `tokens.mjs`, `counts.mjs` and `seo.mjs` need nothing installed and
finish in about a second between them, so run those every time.

### How much of that to run, and when

The cost is not spread evenly across the ten. `deployable.mjs`,
`tokens.mjs`, `counts.mjs`, `seo.mjs` and `keys.mjs` finish in about a second together and
need nothing installed. The five browser checks are the entire bill: each
renders every page in the tree, and `typescale.mjs` renders each of them at
four widths. Unscoped, that is minutes locally and was 9m11s in CI on #78.

**The post-merge run is the full sweep, so a local run is about catching a
failure before it is live rather than about coverage.** That makes it a
question of aim rather than volume: scope it to what changed, and never hold
a merge for it. The row below says which changes are worth the wait. Scoped to
the page you touched, all five browser checks together take about forty
seconds, most of it `typescale.mjs` visiting its four widths; `resting.mjs`
alone on one page is a second. That is the difference between a check you run
and a check you skip because you are in a hurry.

| What the change touches | Run locally |
| --- | --- |
| Copy, markup, SEO, images | The fast five |
| Color, type, spacing or motion **on one page** | The fast five, plus the five browser checks scoped to that page |
| A stylesheet more than one page loads (`style.css`, `color.css`, `type.css`, `shell.css`) | The whole suite. This is the one worth waiting for: `gh workflow run checks.yml --ref <branch>` on the branch, rather than minutes of local browser time |
| Anything else | Merge; the push-to-`main` run is the full sweep, and a failure opens an issue |

Every browser check takes a page argument, and that is the scoped form:

```bash
node scripts/resting.mjs   prototype/dispatch-cockpit.html --strict
node scripts/states.mjs    prototype/dispatch-cockpit.html --strict
node scripts/typescale.mjs prototype/dispatch-cockpit.html
node scripts/curves.mjs    prototype/dispatch-cockpit.html
node scripts/cards.mjs     prototype/dispatch-cockpit.html
```

The shared-stylesheet row is the one that genuinely needs the unscoped run,
and it is the reason this is a table rather than a rule saying "scope it."
One deleted `a:hover` in `style.css` costs nine state rules, one on each page
that loads it, and a page scoped out of the run is a page whose loss nothing
notices. The tripwire counts below are the only instrument that catches a
whole page falling out of measurement, and they only read true when every page
was measured.

The five browser checks take `--root <path>` and otherwise measure the current
directory, and **every one of them prints the path, page count and commit it
measured before it does anything else.** That printing is not decoration. Two
of them used to resolve the root from their own file location and two from
`cwd`, so pointing them at another site produced one tree's numbers under the
other's name. A wrong target you can see is a mistake; a wrong target you
cannot see is a false result.

**`cards.mjs` IS IN `checks.yml` SINCE 2026-09-21, WHICH IT SPENT ITS WHOLE
LIFE SO FAR WAITING FOR.** It asks whether a card on a ground has an edge a
reader can see, at a floor of 1.2:1, and it was merged in #247 deliberately
OUTSIDE the workflow because it was red on 19 surfaces the day it arrived: a
leg known to be red tells you nothing about the commit that turned it red,
and `checks.yml` is the one instrument every other merge is read against. Its
own header said to wire it in the day the site passed. Two changes did that
— `--rule-card` and the depth ladder on the cockpit, then the sweep onto the
other fourteen — and it is a fifth leg of the browser matrix now.

**So the browser bill is five, not four**, and the shape of the advice does
not change: `cards.mjs` renders every page once, like `resting.mjs` and
`curves.mjs`, so it is nowhere near `typescale.mjs`'s four widths. Scope it
to the page you touched the same way.

The reason to keep reading the count rather than only the verdict applies
here too, and more sharply than elsewhere: this one reports **raised
surfaces**, 276 across 29 pages, and a run that comes back green with
materially fewer of them has stopped looking at something rather than
started passing it.

**Four kinds of question.** `resting.mjs`, `states.mjs`, `typescale.mjs`,
`curves.mjs` and `cards.mjs` read the specs as **rules** and the rendered page
as evidence: does this color clear its floor, is this size on the scale, does
this border follow the whole curve, does this card's edge separate it from the
ground behind it. `cards.mjs` is the one whose defect is invisible in the
stylesheet: a charcoal tint composites over the card's own fill when it is a
border and over the ground when it is a shadow's ring, so the declaration that
draws nothing looks exactly like the one that draws a hairline. `tokens.mjs` reads the specs as **claims**: every
`--token` the four specs or the design system page names either exists in the
CSS or is declared retired in the script's own registry -- **except where the
design system page resolves a name rather than discussing one.** Its swatches
and its token table carry the name in `data-token` and hand it to the browser,
so a retired token there is a blank card in a grid of colors rather than a
sentence about a color that was removed. Those 54 are held to a declaration
and retirement does not excuse them, which is what stops a token the site has
merged away from coming back as a swatch nobody notices is dead.
`counts.mjs` does the
same for numbers: each entry pairs a sentence as written with a function that
recounts it from the tree, and the sentence has to still be findable, so a
registered sentence that gets reworded is a red check until the registry is
reworded with it. `seo.mjs` asks its question of the metadata no reader ever
sees: the canonical URL, the Open Graph card and the JSON-LD graph on each
page, and the sitemap listing every page once. It also generates the sitemap,
with `--write`, which is what makes the drift possible in the first place. Both
registries are curated by hand, and deliberately so: the specs discuss deleted
tokens and record historical measurements on purpose.

`resting.mjs` and `states.mjs` do not cover each other. A color can be perfect
at rest and fail on hover, and it can fail sitting still, which no amount of
state-forcing notices; the resting color is the one state that is never forced.

**All four now press things, and only on two pages.** They load a page, wait for
it to settle and measure what is there, which is the whole of twenty-eight of
the thirty. The two pages under `prototype/` are the exception:
`prototype/dispatch-cockpit.html` renders its comparison, its override
question, its refused button and its opened rows from JavaScript in response
to a press, so twelve of its states were in no DOM any check ever saw and
every one of them said "✓" about a page it had measured a sixth of; since
2026-09-28 `prototype/deploy-console.html` does the same with its failed
build, its reading, its rollback plan and its rolled-back rows, and carries
its own seven states in the same registry. `scripts/lib/reachable.mjs` is the registry -- per page, named
states and the selectors to click to reach each from a fresh load -- and all
four import it. It is curated by hand and lives outside the page deliberately,
like the registries in `counts.mjs` and `tokens.mjs`: a `window.__states` the
page exported would ship test scaffolding to readers and let a change to the
page quietly edit the list of what gets measured. `reach()` throws on a
selector that matches nothing, so a stale state fails the run rather than
silently covering less. It found a live 1.29:1 hover on its first pass.

A state pass in `states.mjs` measures only the rules that GAINED elements.
Forcing all of them again per state was still running after eleven minutes on
one page when it was killed -- every element costs at least the 60ms floor in
`settle()` and nearly every row duplicated one already measured at rest. Adding
a state to the registry is cheap; adding one that re-measures the resting page
is not.

**Watch the counts, not only the verdict.** `states.mjs` once passed clean at
416 state rules and at 617, and the gap was a third of the site going
unmeasured. At 2026-10-05 the tree measures 12020 resting colors, 2201 state
rules, 49800 type sizes, 30031 elements checked for a partial border on a
curve and 377 raised surfaces, across 32 pages (the thirty-one of the site
and `404.html`, which the browser checks measure and `counts.mjs` and
`seo.mjs` leave out; **32 since the lab landed on 2026-10-01**, two pages at
once, and every one of the five moved with them) and 20 reachable states
(13 on the deploy console and 7 on the cockpit; **20 since #313**, up from
the 14 the 30-page set was measured with, and a reachable state is a fresh
load that moves three of the five without a page arriving), plus 129 token
names against 221 declarations in 16 stylesheets (printed as 222 at 37644b5,
and on every sweep from #369 until #398 corrected the instrument, for a
selector read as a declaration; the drift paragraph below has it), 6
retired by name, 54 of them resolved by the design system page rather than
described, and 26 counted claims across 6 documents.

**There are five browser numbers now, not four.** `cards.mjs` went into
`checks.yml` on 2026-09-21 and its raised-surface count joins the sentence
above, where it belongs: it is the leg whose count is the most worth reading,
because its floor is 1.2:1 and a card that quietly stops being raised stops
being asked the question rather than failing it.

Three of the first four jumped when the checks learned to press things, and
all of the jump is one page: resting 4024 -> 5784, type sizes 16886 ->
23838, curve elements 9673 -> 14246 **as the tree stood at #109**, each
exactly the
cockpit's own increase. Those three right-hand figures are the record of that
change rather than the current count -- the sentence above carries the current
one, and it has moved since. **The state rule count did not move, on
purpose** -- rules come out of the stylesheet and are the same in every
state, so `states.mjs` counts them once per page. A reachable state that
inflated this number would be corrupting the one instrument the section below
asks you to trust. **The five browser numbers are maintained by hand and
nothing verifies them** -- nor the token total printed beside them, which
the paragraph on declarations below sets out. They will drift. Treat them as a tripwire rather than a
record: a run that comes back materially smaller means something stopped
being measured, and that is worth more than the digits being exactly right.
Read the page count first, then the measurements; a whole page leaving moves
every number at once.

**The resting figure once moved because the instrument did, not because the
site did**, and the account is kept because that is the exact failure the
rest of this section exists to catch. It is the #278 row of the ladder for
#276 through #280 below rather than the current figure now. #278 took the resting count from
6010 to 6099 without touching a page:
`resting.mjs` now measures with `prefers-reduced-motion: reduce`, and the 89
are elements it had never once looked at. The site reveals on scroll and the
checks never scroll, so anything below the fold of a 1000px viewport was
still at `opacity: 0` when the measuring started -- and skipping an element at
`opacity: 0` is deliberate, because text nobody can see has no contrast to
fail. 8 of the 89 are on the homepage behind `.reveal`; the other 81 are the
six Tailwind case studies, which hide their own behind an inline
`opacity: 0`. **This is the shape of failure this whole section is about**, and
it had been sitting inside the instrument the rest of it asks you to trust: a
green check, a plausible number, and a seventh of the site's readable text
never asked the question.

The arithmetic divides by nothing, which is the point -- these are elements
counted once per page at rest, on 7 pages, and 8 + 81 is the 89. **The other
four did not move, and that was checked rather than assumed.** Only
`resting.mjs` skips on opacity, so a revealed block was never hidden from the
rest; run with the preference, `states.mjs`, `typescale.mjs` and `cards.mjs`
come back at 1874, 24798 and 276 either way, those being the figures as the
tree stood at #278. `curves.mjs` came back at 14879,
**down 14**, and chasing that down is what settled where the change belongs:
`cursor.js` builds `.cursor-dot` and `.cursor-ring` only for a reader who has
not asked for stillness, so 2 rounded surfaces on each of the 7 pages with a
custom cursor stopped existing. Those are surfaces an ordinary reader does
see. A count that comes back smaller gets an explanation before it gets
accepted, and the explanation here said to scope the preference to the one
check with the defect rather than spend 14 real elements on four checks that
gain nothing.

The figures above are a re-measurement, not a delta. They were taken by the
CI run of `checks.yml` on **`main` at 37644b5**, run 37375088662 -- the
post-merge sweep rather than a run against a branch, which is the cheapest
way to take one, since that sweep runs whether anybody reads it or not. They
replace the 2026-10-01 set of 11725 / 2143 / 48584 / 29624 / 379 at d90efe7,
run 36900617872, the first 32-page set, which replaced the
2026-09-28 set of 8550 / 1986 / 34868 / 20706 / 374 at 8bb54d3,
the first 30-page set and the last taken with 14 reachable states, which
replaced the
2026-09-28 set of 6479 / 1890 / 26350 / 15519 / 275 at 87f91bf, the last
29-page set, which replaced the
2026-09-22 set of 6414 / 1878 / 26086 / 15312 / 275 at 4e5fb53, which
replaced the earlier 2026-09-22 sets of 6409 / 1876 / 26058 / 15276 / 276
at fc86a61 and
6371 / 1876 / 25886 / 15205 / 276 at d819fe2,
which replaced the 2026-09-21 set of 6099 / 1874 / 24798 / 14893 / 276,
taken the same way at
2c783bc, which replaced the 2026-09-20 set of 5991 / 1858 / 24842 / 14749 at
774df5e, which replaced the 2026-09-19 set of 6002 / 1859 / 24720 / 15094
from `claude/assigned-button-ink` at d0b4be7. The set written here between
those last two, at c680512, is not quoted again: it is the #267 row of the
last ladder below, which is a better record of it than a sentence. The page count
moved twice across them, each time at a set's own commit -- 29 through
87f91bf, 30 at 8bb54d3, 32 at d90efe7 and since -- and it is the number to
read first.

**That run took two attempts, and the first one is the kind of red this
section has no other name for.** Four of the five browser legs finished on
attempt 1. The fifth, `states.mjs`, was nine and a half minutes into a leg
that takes twelve and a half when the runner was shut down under it ("The
runner has received a shutdown signal"), so the run went red, the report job
opened #394, "checks failed on 37644b5, which is live", and nothing about
the commit had failed. `gh run rerun 37375088662 --failed` ran that one leg
again, it passed, and 2201 is attempt 2's figure; the other four are
attempt 1's. Read the failing leg's last lines before reading the issue's
title: a check that fails prints a verdict and a list, and a leg that was
killed prints neither.

**A local run does not have to agree with the runner to the digit.** A full
run on the Mac at 37644b5 the same day read 49800 type sizes and 377 raised
surfaces, as the runner did, and 30032 curve elements where the runner read
30031. The one was not chased, and it cannot be from here: the sweep prints
a total and no page, so there is nothing to subtract from. Every set in
this section is the runner's, and a figure taken locally is compared with a
figure taken locally.

**Two sets in one day is not a warning about the tree.** It is what the
section asks for working: d819fe2's set was taken while a branch was open
against it, that branch merged, and the sweep of the merge was sitting in
the Actions list before anybody had to remember to look. Re-measuring cost
three `gh run view --log` calls. The cost of NOT doing it is the residuals
further down.

**Fifty-nine commits between d90efe7 and 37644b5, and all fifty-nine have
a sweep in the Actions list, one of them in two attempts.** Fifty-three are
pull requests, #339 through #393 less #355, which is still open, and #356,
which was closed without merging; the other six are captures and image
swaps committed to `main` under the carve-out above (d2c4023, d39884b,
cbca016, 342bca7, e7e9673, 3f24faf). Thirty-two rows are flat and
twenty-seven moved a count. The reachable states held at 20 throughout, so
this ladder has no `reach` column: every row is measured on the same 14
console loads and 8 cockpit loads as the row above it. The names column
holds at 129 and is kept for the pair.

| after | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #338 `d90efe7` | 11725 | 2143 | 48584 | 29624 | 379 | 129 | 221 |
| **#339** `1aa77f3` | **11698** | 2143 | **48480** | **29589** | 379 | 129 | 221 |
| **#340** `f14145e` | **11736** | 2143 | **48632** | **29660** | **378** | 129 | 221 |
| #342 `f5b5916` | 11736 | 2143 | 48632 | 29660 | 378 | 129 | 221 |
| **#344** `89c7397` | **11748** | 2143 | **48680** | **29671** | 378 | 129 | 221 |
| **#343** `3561917` | **11793** | **2146** | **48860** | **29767** | 378 | 129 | 221 |
| **#345** `702aa28` | **11794** | 2146 | **48864** | **29768** | 378 | 129 | 221 |
| #341, #346, #347, #348 | 11794 | 2146 | 48864 | 29768 | 378 | 129 | 221 |
| **#349** `1c27749` | **11791** | 2146 | **48860** | **29765** | 378 | 129 | 221 |
| d2c4023 | 11791 | 2146 | 48860 | 29765 | 378 | 129 | 221 |
| **#351** `d3bb802` | 11791 | 2146 | 48860 | **29766** | **379** | 129 | 221 |
| **#350** `0b29193` | **11792** | 2146 | **48864** | **29767** | 379 | 129 | 221 |
| d39884b, cbca016 | 11792 | 2146 | 48864 | 29767 | 379 | 129 | 221 |
| **#352** `a5a5bdf` | **11798** | **2148** | **48888** | **29780** | **380** | 129 | 221 |
| #353, 342bca7 | 11798 | 2148 | 48888 | 29780 | 380 | 129 | 221 |
| **#354** `9ac36b6` | **11791** | 2148 | **48860** | **29762** | 380 | 129 | 221 |
| **#358** `c81888e` | **11800** | 2148 | **48896** | **29777** | 380 | 129 | 221 |
| #357 `7dfd237` | 11800 | 2148 | 48896 | 29777 | 380 | 129 | 221 |
| **#359** `d293cb5` | **11810** | 2148 | **48936** | **29790** | 380 | 129 | 221 |
| #360, #361 | 11810 | 2148 | 48936 | 29790 | 380 | 129 | 221 |
| **#362** `c3c09b3` | **11812** | 2148 | **48944** | **29792** | 380 | 129 | 221 |
| **#363** `9fccbfb` | **11835** | 2148 | **49036** | **29819** | 380 | 129 | 221 |
| **#364** `e9ff360` | **12078** | 2148 | **50008** | **30097** | 380 | 129 | 221 |
| #366, #365 | 12078 | 2148 | 50008 | 30097 | 380 | 129 | 221 |
| **#367** `2f1242f` | **12087** | 2148 | **50044** | **30107** | 380 | 129 | 221 |
| **#368** `953a34d` | **12056** | 2148 | **49920** | **30041** | **379** | 129 | 221 |
| **#369** `6d93402` | **12074** | 2148 | **49992** | **30070** | 379 | 129 | **222** |
| **#370** `c2dad34` | 12074 | 2148 | **49996** | **30073** | 379 | 129 | 222 |
| **#371** `64af113` | **12075** | **2200** | **50004** | **30077** | 379 | 129 | 222 |
| #372, #373, #374, #375, #378, #379 | 12075 | 2200 | 50004 | 30077 | 379 | 129 | 222 |
| **#376** `a2cead9` | 12075 | 2200 | 50004 | **30096** | 379 | 129 | 222 |
| **#377** `4aaef80` | **12099** | **2201** | **50132** | **30178** | 379 | 129 | 222 |
| e7e9673, #380, #381, #382, #383, #384 | 12099 | 2201 | 50132 | 30178 | 379 | 129 | 222 |
| **#385** `222f7c2` | **12152** | 2201 | **50344** | **30262** | 379 | 129 | 222 |
| 3f24faf | 12152 | 2201 | 50344 | 30262 | 379 | 129 | 222 |
| **#386** `3340ba7` | 12152 | 2201 | 50344 | 30262 | **381** | 129 | 222 |
| **#387** `e4d33ce` | **12153** | 2201 | **50348** | **30267** | 381 | 129 | 222 |
| #388, #389, #390, #392 | 12153 | 2201 | 50348 | 30267 | 381 | 129 | 222 |
| **#391** `8df937a` | **12020** | 2201 | **49800** | **30033** | **378** | 129 | 222 |
| **#393** `37644b5` | 12020 | 2201 | 49800 | **30031** | **377** | 129 | 222 |

**Every moving row was reconciled against its pages, not only read off.**
Each of the twenty-seven was re-measured on the Mac at the commit and at
its parent, scoped to the pages its diff touched beyond a cache-buster or a
date stamp, and the per-page deltas add up to the sweep's delta to the
digit on all twenty-seven: twenty-six from their pages, and #386 from the
one stylesheet it changed. That is what makes the arithmetic below a
reading rather than a guess, and it cost about ten minutes of browser time
for the whole stretch. Where a row below says a page and not its elements,
the page is measured and the elements were not read out.

**#391 is the row to read first, because it is the one that came back
smaller, and a count that comes back smaller gets an explanation before it
gets accepted.** It is one page on one load, plus one element on the lab
index. The Agent Review case study went from 275 / 1148 / 575 / 6 to 143 /
604 / 342 / 3, as resting / type sizes / curve elements / raised, which is
-132 / -544 / -233 / -3; `lab/index.html` lost one element holding text,
-1 / -4 / -1. The page stopped describing the product's earlier iterations:
233 elements gone, 136 of them holding text by `typescale.mjs`'s rule (136
x 4 is the 544) and 132 by `resting.mjs`'s, the four between them under the
two-character floor or hidden, and three raised surfaces with them. Not
itemized by element beyond that.

**#340 is a link on every page but one, and the multipliers are the whole
row.** `Lab` went into the site's navigation: an `li` and its `a`, the `a`
holding text, so +1 / +4 / +2 on each of 28 pages on one load; the console
took it on 14 loads (+14 / +56 / +28) and the cockpit on 8 (+8 / +32 / +16);
the design system page is unlisted, has no navigation, and held. The
homepage is the rest: the lab band of #338 became one card under Selected
work, -12 / -48 / -29 and the one raised surface, not itemized. 28 + 14 +
8 - 12 is the 38, 112 + 56 + 32 - 48 the 152, and 56 + 28 + 16 - 29 the 71.

**#364 is seventeen pages rewritten to scan, and every one of the seventeen
divides by four.** Nine articles and eight case studies gained 243 elements
holding text, each at four widths (the 972), and 35 holding none (the 278).
The largest is the supervising-an-agent article at +38 / +152 / +45 and the
smallest two case studies at +1 / +4 / +1; no raised surface and no state
rule, which is what a rewrite that adds no card and no stylesheet rule
should look like. #344 is the nine articles the day before, +12 / +48 / +11
across them, four of them smaller than they were.

**Six rows are the Agent Review case study alone**, each on one load: #363
(+23 / +92 / +27: 13 `li` and 10 `strong` holding text, under 4 `ul`), #368
(-31 / -124 / -66 and a raised surface: the page at 1,351 words instead of
2,377), #369 (+18 / +72 / +29: 10 `li`, 7 `strong` and a `p` holding text;
3 `ul`, 4 `picture` and 4 `source` holding none), #376 (curve elements +19
and nothing else: four `svg` line icons and the fifteen `path`s inside
them, which hold no text), #377 (+24 / +128 / +82 and a state rule: the
tour), and #385 (+53 / +212 / +84: the second iteration). #377's 128 is 32
elements at four widths against 24 for `resting.mjs`, and the eight between
them read as the seven one-digit numbers on the notes and the visually
hidden `h2`, which `typescale.mjs` counts and `resting.mjs` skips. #343 is
that page and the homepage: +41 / +164 / +98 on the case study, where the
markup accounts for 77 of the elements and the read-aloud player
`read-aloud.js` builds at load for the other 21 -- its bar, its buttons and
voice menu, their labels and icons -- which a diff cannot show and a
measurement can; and +4 / +16 / -2 on the homepage. #387 is one figure:
`figure`, `picture`, `source`, `img` and a `figcaption` holding text, +1 /
+4 / +5.

**The homepage rows are small, and all of them divide.** #345 is one
`strong` around "The result:", +1 / +4 / +1. #350 is one link in the shift's
paragraph, +1 / +4 / +1. #370 moved that link onto its own line: a `p`, an
`a`, an arrow `span` and a visually hidden `span` in for the inline `a`, +3
curve elements; the `a` holds text in both, the `p` none of its own, the
arrow is one character and `aria-hidden`, and the visually hidden span is
counted by `typescale.mjs` and not by `resting.mjs`, so +4 against a
resting count that held. #351 put the lab card's screen in a laptop: one
`div` for the lid, +1 curve element and +1 raised surface; #393 took the lid
off again, there and on the case study's tour, -2 curve elements and the
card's -1 raised. #354 and #367 are the lab card rewritten, -7 / -28 / -18
and then +6 / +24 / +7, with +3 / +12 / +3 on the case study in the second.

**#349 is the one whose markup went the other way from its counts, and the
page's own script is why.** The homepage's diff adds a link, and three
counts fell. The lead-in under How I think is split into a `span` per word
by a script on the page, and "Now I build what I design, with coding
agents." is nine words where "The judgment didn't change. The distance
between thinking and making did." was eleven: two words fewer is four spans
fewer, which with the link is curve elements -3. Two of the nine words are
"I", under the two-character floor, so `resting.mjs` counts seven words
where it counted eleven, and -4 + 1 is its -3; `typescale.mjs` has no
floor, so -2 + 1 is one element, the -4. The checks measure the rendered
page, and a diff of the file is not the rendered page.

**The state rule count moved four times, and each is a stylesheet gaining
a page or a page gaining a stylesheet.** `states.mjs --list` prints every
rule it counts, page by page, and diffing that list across each commit is
how these were read. #343 is `read-aloud.css`, which the case study started
loading, and its three `:hover` rules (`.ra-listen`, `.ra-btn`,
`.ra-voice`), +3 on one page. #352 is `design-psychology.css` gaining the
SAP case study, +2, the same two rules #286 and #338 recorded. #371 is
`.glance-facts a:hover` and `:focus-visible` in `style.css`, which 26 pages
load: 2 x 26 is the 52. #377 is `.wt.is-tour .wt-skip` in `walkthrough.css`,
a state class setting a colour, on the one page that loads it, +1.

**#352's other numbers are one page.** The SAP case study gained a Design
psychology note: 13 elements, 6 holding text, one raised card, +6 / +24 /
+13 / +1. The homepage, an engagement page, both prototypes and three
articles the commit also touched held.

**#386 is a declaration, and the raised count moved by two, which this
section says to chase before accepting.** It gave the Human judgment notes
the Design psychology note's tea-light ground in place of their warm one.
Five of them are on the case study: three in warm chapters, one in a tea
chapter, one in a white one. `cards.mjs` does not count a surface the
colour of its own ground as raised, so in the warm fill the three on warm
were not counted and the other two were; in tea-light the three on warm are
and the one on tea is not. Two counted became four: the page's raised
surfaces went 4 to 6, and nothing else on the page or the site moved.

**#358, #359 and #362 are one page each**: the design system page, +9 /
+36 / +15; the lab index, +10 / +40 / +13; and two `code` elements on the
design system page, +2 / +8 / +2.

**#369 moved the printed declarations, 221 -> 222, and the 222nd was not a
token.** The column reads 222 from that row to the foot of the ladder
because that is what the check printed; the true figure on every one of
those rows is 221, and the paragraph on declarations below has it, with
#398's correction. #377 is the 16th stylesheet, `walkthrough.css`,
declaring nothing.

**The six image commits are flat, as the carve-out requires**, and so are
#341, which was the previous rewrite of this section, #342, #346 to #348,
#353, #357, #360, #361, #365, #366, #372 to #375, #378 to #384, #388 to
#390 and #392.

**Thirty-eight commits between 8bb54d3 and d90efe7, and all thirty-eight
have a sweep in the Actions list, one of them cut short.** Thirty-seven are
pull requests, #302 through #338, and the thirty-eighth is e10d336, an image
swap committed to `main` under the carve-out above. Eighteen rows are flat
and twenty moved a count. Three of the moves are the instrument rather than
the site, two are pages, one is a figure crossing the two-character floor,
and the rest are the deploy console being built, which is where most of the
ladder's digits come from. This ladder carries a `reach` column the older
ones do not, for the same reason the third one below carries `names`: the
number of reachable states moved three times in this stretch, and a jump
read without that column looks like a page arriving.

| after | reach | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #301 `8bb54d3` | 14 | 8550 | 1986 | 34868 | 20706 | 374 | 128 | 198 |
| #303 `876250a` | 14 | 8550 | 1986 | 34868 | 20706 | 374 | 128 | 198 |
| **#302** `6053370` | **15** | **8858** | **1987** | **36164** | **21439** | **385** | 128 | 198 |
| **#304** `196f985` | **19** | -- | **1988** | **43492** | **25542** | **433** | 128 | 198 |
| **#305** `d9df6cc` | 19 | **10694** | 1988 | 43492 | **25544** | 433 | **129** | **199** |
| **#306** `4768768` | 19 | **10704** | 1988 | **43532** | **25623** | 433 | 129 | **200** |
| #307 `fca7b8f` | 19 | 10704 | 1988 | 43532 | 25623 | 433 | 129 | 200 |
| **#308** `d25483f` | 19 | **10702** | 1988 | **43524** | **25615** | 433 | 129 | 200 |
| #309, #310, #311 | 19 | 10702 | 1988 | 43524 | 25615 | 433 | 129 | 200 |
| **#312** `b488a5d` | 19 | **10726** | 1988 | **43636** | **25855** | 433 | 129 | 200 |
| **#313** `c9ea12a` | **20** | **11268** | **2004** | **45936** | **28459** | **374** | 129 | **220** |
| #314 `3ebe838` | 20 | 11268 | 2004 | 45936 | 28459 | 374 | 129 | 220 |
| **#315** `e54fb13` | 20 | 11268 | 2004 | 45936 | **28473** | 374 | 129 | 220 |
| **#316** `fcf63cc` | 20 | **11296** | 2004 | **46048** | **28499** | 374 | 129 | **221** |
| **#317** `547bc6a` | 20 | **11328** | 2004 | **46168** | **28533** | 374 | 129 | 221 |
| **#318** `54f6313` | 20 | **11364** | 2004 | **46308** | **28572** | 374 | 129 | 221 |
| **#319** `99cf0ce` | 20 | **11384** | 2004 | **47252** | **28905** | 374 | 129 | 221 |
| **#320** `d260726` | 20 | **11440** | 2004 | **47484** | **29089** | 374 | 129 | 221 |
| **#321** `adb4ef5` | 20 | 11440 | 2004 | 47484 | **29130** | 374 | 129 | 221 |
| **#322** `5756907` | 20 | **11460** | 2004 | **47516** | **29020** | 374 | 129 | 221 |
| #323, #324 | 20 | 11460 | 2004 | 47516 | 29020 | 374 | 129 | 221 |
| **#325** `398fd80` | 20 | **11452** | 2004 | **47484** | **29012** | 374 | 129 | 221 |
| #326 `c9ee96d` | 20 | 11452 | 2004 | 47484 | 29012 | 374 | 129 | 221 |
| **#327** `8c019ff` | 20 | **11466** | 2004 | 47484 | **29026** | 374 | 129 | 221 |
| **#328** `3534767` | 20 | **11530** | **2005** | **47792** | **29216** | 374 | 129 | 221 |
| #329, #330, #331, #333, #332, #334, #335, e10d336 | 20 | 11530 | 2005 | 47792 | 29216 | 374 | 129 | 221 |
| **#336** `07f237e` | 20 | **11532** | 2005 | **47796** | **29217** | 374 | 129 | 221 |
| #337 `958c3c2` | 20 | 11532 | 2005 | 47796 | 29217 | 374 | 129 | 221 |
| **#338** `d90efe7` | 20 | **11725** | **2143** | **48584** | **29624** | **379** | 129 | 221 |

**#338 is the row to read first, because it moved the page count, and it is
the one row in the ladder that divides to the digit.** It added
`lab/index.html` and `lab/agent-review.html`, the tenth family, and a band
on the homepage that points at them. Measured scoped at d90efe7, as resting
/ state rules / type sizes / curve elements / raised: the lab index is 21 /
68 / 92 / 76 / 0 and the case study 168 / 70 / 680 / 323 / 5. The homepage
band is a `section`, its `container`, a `header`, an eyebrow `p`, an `h2`, a
dek `p`, a CTA `p` and its `a`: 8 elements, 4 of them holding text. The sums
are 21 + 168 + 4 for the 193, 92 + 680 + 16 for the 788 and 76 + 323 + 8 for
the 407, and the five raised surfaces are all the case study's. **State rules +138 is 68 +
70, and the 2 between them is `design-psychology.css`**, which the case
study loads for its two notes and the index does not; #286 below recorded
that file as carrying exactly two state rules, and it still does. Neither
page registers a reachable state, so every lab element is counted on one
load. `counts.mjs` went from 29 pages to 31 and held at 26 claims, and
`tokens.mjs` held at 221, because the nine lines #338 added to `style.css`
declare nothing.

**#337 is flat, and it was expected to move.** It is the Human judgment
note, a variant of the Design psychology note for the Agent Review case
study -- but what landed in #337 is the variant's rule in
`design-psychology.css`, one selector and a `background` declaration, plus
the cache-buster bump on the nine pages that load the file. The markup that
uses the class arrived with the case study in #338, where it is part of
the 168. A declaration is not a thing any of the five counts, which #277
showed first, in the ladder for #276 through #280 below; here it is again,
with the note's whole visible existence one row later.

**The instrument moved three times in this stretch, and the `reach` column
is where.** #302 gave the console an eighth reachable state (a rollback in
flight), #304 four more (the first deploy before and during its press,
staging, the services alone) and #313 a thirteenth (the environment menu
open): 14 -> 15 -> 19 -> 20 across the two prototypes. A reachable state is
a fresh load, so each one adds roughly a console's worth of resting colors,
type sizes and curve elements and nothing to state rules, and a row where
`reach` moves is a row whose other digits are mostly not the site changing.
The console is counted on 14 loads now, its rest plus 13 states, and the
cockpit on 8; 14 is the divisor to try first on every console row below.
None of the five scripts changed in the stretch. `reachable.mjs` did, three
times, and once more in #317 to reword a comment.

**#304's sweep was cancelled, and the dash in its resting column is what
that costs.** #305 merged eleven seconds after it, and `checks.yml` cancels
the surviving legs of the run before, by design, since the sweep of the
later merge measures the same tree and more. The legs are a matrix, so four
of the five had finished: state rules, type sizes, curve elements and raised
surfaces are #304's own, and resting was still running. Its resting figure
is unmeasured, so #305's resting move, 8858 -> 10694, is two commits'
worth: #304's four states and the console's map, feed and first deploy,
plus #305's own share, which the other four columns say is nothing holding
text.

**#302 is the console's first row** and the only one before #313 with a
state rule in it: one rule, in a stylesheet one page loads. It gave the
console the in-flight rollback as a state and its hero four checked lines,
and the homepage a pair of prototype cards closing the Built section; the
raised +11 is that pair's card plus the console's panels counted once more
on their ninth load. The rest is the console's and is not itemized.

**#305 is `--color-slate`, and two divs.** `color.css` declared it and
COLOR.md named it with a measured row, so names and declarations each move
by one, 128 -> 129 and 198 -> 199. The two articles that had no progress
line gained one, a `div` with no text and `aria-hidden`, so curve elements
+2 and nothing in either text count; the other seven already had the line
and only took its new colour.

**#306 and #308 are a pair that nearly cancels.** #306 named the two
prototypes and gave them icons: `--app-icon` is the 200th declaration, set
at three widths under one name, and the 10 text elements it added are
resting +10 and type sizes +40. #308 took the icons off the homepage cards
again: -2 / -8 / -8, two elements holding text at four widths and eight
elements in all.

**#312 is where resting and typescale disagree by 16**, and the gap is four
elements. It put one size on every line of the console and the homepage
pair: 24 new elements holding two characters or more and 4 holding one, so
resting +24 and type sizes +(28 x 4) = +112. State rules held across 41
lines added to `style.css`, none of them a state.

**#313 is the row this whole section is about, and the raised column is
why.** The console took the platform's own dashboard direction: a dark
canvas, 21 `--rd-*` declarations in and one out (200 -> 220), the
environment menu as a thirteenth state, 16 state rules in a stylesheet one
page loads, and 542 / 2300 / 2604 of console surface on fourteen loads.
**Raised surfaces fell by 59, to 374, and that reading had to be chased
rather than accepted**, because 374 is the figure this stretch started from,
and a reader comparing the ladder's two ends would see the column flat. It
is not flat. The dark canvas set `--rd-radius: 2px` on every console
surface, and `cards.mjs` asks its question only of a surface whose corner is
8px or more, so `.dc-project`, `.dc-lead`, `.dc-card`, `.dc-status` and
`.dc-table-wrap` stopped qualifying. Measured with each tree's own scripts,
the console went from 12 raised surfaces at rest to 7 -- the case-study
wrapper's own white cards and its callout -- and from 157 across its loads
at b488a5d to 98 at d90efe7. 157 - 98 is the 59, and 374 - 98 is 276, which
is the rest of the site (the 275 of the 29-page sets plus #302's homepage
card) and has not moved since. Those five panels are real surfaces on a dark
ground that a reader does see, and the edge question is now asked of none
of them. **That is the exact shape of failure this section exists to catch:
inside a green run, with the total landing by chance on the number it
started from.** Whether a 2px-cornered panel on a dark canvas is a card
`cards.mjs` ought to be asking about is a question for that script's header
rather than for this ledger; what the ledger owes is that the count says so.

**#315 is one element a load, holding no text**: curve elements +14 on a
page measured on 14 loads, and nothing in either text count. **#316 is the
221st declaration**, `--rd-red-hairline`, with 2 new text elements a load:
28 / 112 / 26. **#325 is the clean one**: the cockpit's "What this is" list
dropped a bullet, one `li` on 8 loads, so -8 / -32 / -8 exactly. **#327 is
14 and 14 with nothing between**: one element a load holding text of two
characters or more that `typescale.mjs` does not count, which it does only
for `aria-hidden` or an element inside an `svg`. **#319 is the one to read
twice**: resting +20 against type sizes +944, which is 236 elements for
`typescale.mjs` against 20 for `resting.mjs`, and the 216 between them are
elements one counts and the other skips -- under two characters, or at
`opacity: 0`. Which of the two it is was not chased here. #328 carries the
stretch's third state rule, 2004 -> 2005. #317, #318, #320, #321 and #322
are the console being built, and are not itemized, as #300's row below was
not: a prototype measured on fourteen fresh loads is its author's
arithmetic, and #322's curve elements going DOWN 110 while its resting went
up 20 is what "its borrowed furniture takes a shape of its own" looks like
in a count.

**#336 is two elements, one of them not new.** The build write-up gained a
fifth `li` under its checks, for `cards.mjs`: +1 curve element, +1 resting,
+4 type sizes. Its number row's `dt` went from `9` to `10` as the checks
went from nine to ten: the same element, one character longer, crossing the
two-character floor `resting.mjs` skips at, which is #291 below run in
reverse and the second resting +1. **The row's real content is in
`counts.mjs`**: 10 claims across 3 documents became 26 across 6, sixteen of
the write-up's figures about the site now recounted from the tree on every
run. The sentence at the top of this section said 10 until #336 and 26
after it, rewritten in the same commit, which is the right way round.

**e10d336 is the carve-out in use**, an image swap committed to `main`
without a branch, and its row is flat, which is the condition the carve-out
sets: both contrast checks at the same counts as before.

**#339 landed while this ladder was being written**, and its sweep, run
36903028111 at 1aa77f3, is the first row of the next one: 11698 / 2143 /
48480 / 29589 / 379 / 129 / 221. It cut the Agent Review case study to half
its length, one page on one load: 35 elements gone, 27 of them holding text
by `resting.mjs`'s rule and 26 by `typescale.mjs`'s (26 x 4 is the 104), the
odd one being an element the type check skips. State rules and raised
surfaces held, which is what a cut that deletes no stylesheet rule and no
card should look like. The figures at the top of this section stayed
d90efe7's until the 37644b5 set replaced them, because d90efe7 is the set
this ladder closes on; the ladder above starts from this row, as this
paragraph said it would.

**Fifteen commits between 4e5fb53 and 8bb54d3, and the sweeps of all
fifteen were still in the Actions list.** Eleven are flat, four moved a
count, three of the four divide, and the fourth is a page:

| after | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #286 `4e5fb53` | 6414 | 1878 | 26086 | 15312 | 275 | 128 | 197 |
| #287, #288, #289, #290 | 6414 | 1878 | 26086 | 15312 | 275 | 128 | 197 |
| **#291** `8188e64` | **6413** | 1878 | 26086 | 15312 | 275 | 128 | 197 |
| **#292** `648dc17` | **6453** | **1890** | **26246** | **15392** | 275 | 128 | 197 |
| **#293** `c0e09ce` | **6447** | 1890 | **26222** | **15383** | 275 | 128 | 197 |
| #294, #295, #296 | 6447 | 1890 | 26222 | 15383 | 275 | 128 | 197 |
| **#297** `5c9aa82` | **6479** | 1890 | **26350** | **15519** | 275 | 128 | 197 |
| #298, #299 `87f91bf` | 6479 | 1890 | 26350 | 15519 | 275 | 128 | 197 |
| **#300** `c648b3e` | **8550** | **1986** | **34868** | **20706** | **374** | 128 | **198** |
| #301 `8bb54d3` | 8550 | 1986 | 34868 | 20706 | 374 | 128 | 198 |

**#300 is the row to read first, because it is the one that moved the page
count.** It added `prototype/deploy-console.html`, a second prototype with
seven reachable states of its own in `reachable.mjs`, a fifteenth
stylesheet declaring a 198th token, and its share of the index, the
case studies and the articles that now link to it. Every one of the five
moved, and none of it is itemized here: a whole page measured on eight
fresh loads is its author's arithmetic to write, as #267's was. What this
row is FOR is that the stretch above starts from it rather than from the
29-page set, and that a count read against the wrong one of those
two would be off by a page. #301 is this ladder, and it is flat.

**#291 is the smallest move a count can make, and it is the two-character
floor.** It made the SAP figures agree everywhere, and on the SAP article's
number row that turned `>½` into `½`: the same `dt`, one character
shorter, under the floor `resting.mjs` skips at. Type sizes held, because
`typescale.mjs` has no floor, and curve elements held, because the element
is still there.

**#292 is four pages and a shared stylesheet, and all four of its numbers
divide.** Each of four case studies (dispatch complexity, the Innovators
Studio identity, SAP, USDA) gained a "How I measured this" disclosure under
its impact table: a `details`, its `summary` holding a `span`, an `svg` and
its `path`, a body `div` with an intro `p`, and a `dl` of N pairs, each a
`div` with a `dt` and a `dd`. That is 8 + 3N elements a page, at N = 5, 2,
5 and 4: 23 + 14 + 23 + 20 is the 80 curve elements. The label span, the
intro p and the 2N of each list hold text: 12 + 6 + 12 + 10 is the 40
resting, and 40 at 4 widths is the 160 type sizes. State rules +12 is the
shared-stylesheet multiplier again: `.case-method-row:hover` and
`:focus-visible` went into `case-study-base.css`, which six pages load,
and 2 x 6 is 12.

**#293 is one row of figures taken off three pages.** Lucy Learns's "18
days on the phone" left the case study, the design system page's demo of
that component and the working-prototype article, a `div` with a `dt` and
a `dd` each time: 9 curve elements, 6 elements holding text (the `dt`
"18" is two characters, so it counted), and 6 at 4 widths is the 24. The
`0` that took its place in the design system's specimen `<pre>` is text
inside an element that was already counted.

**#297 is the cockpit's hero dek turned into a list**, one page at 8 loads:
four `li`, each holding an `svg`, its `path` and a `span`, under one
`ul`. 17 elements x 8 is the 136 curve elements; the four spans x 8 is the
32 resting, and x 4 widths the 128 type sizes. The svg is `aria-hidden`,
which `typescale.mjs` skips. No state rule was added, and #298 and #299
changed only declarations and words on those same four lines, which is why
the last row is flat.

**#294 is worth a sentence for holding still.** It put the site's `:hover`
rules under `@media (hover: hover) and (pointer: fine)`, and the state rule
count came back at 1890 either side of it: a rule inside a media query is
still a rule, and `states.mjs` still counts it. #295 recropped a capture,
#296 moved the disclosure chevron ahead of its label (the same elements,
reordered), #288 rewrote this section, #289 redrew two pictures, #290
moved a margin, and #287 is the regex in `variant.mjs` the paragraph
below promised would come back flat.

**Two commits between fc86a61 and 4e5fb53, and both have pages in them.**
#285 is the cockpit's language pass and #286 the redraw of the writing
family against the roles. #287 landed after 4e5fb53 and is one regex in
`variant.mjs`, which no check reads; it is the first flat row of the
ladder above, as this paragraph said it would be.

| after | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #282 `fc86a61` | 6409 | 1876 | 26058 | 15276 | 276 | 128 | 197 |
| **#285** `bef738e` | **6441** | 1876 | **26186** | **15324** | 276 | 128 | 197 |
| **#286** `4e5fb53` | **6414** | **1878** | **26086** | **15312** | **275** | 128 | 197 |

**#285 is one page, and every figure is a multiple of its 8 loads** (the
rest plus its 7 reachable states). Four new elements holding text -- a `li`
under What this is, a `li` and its `strong` for the half-built record, and
a `p` under the questions -- are resting +32 and type sizes +128, which is
4 x 8 x 4 widths. Curve elements +48 is those four plus the two `div`s
wrapping the new paragraph, 6 x 8. No stylesheet moved, so state rules and
raised surfaces sat still.

**#286 is five pages, and the whole of it is those five**, measured one at
a time against the tree at bef738e, as resting / curve elements / type
sizes. Three retired: the HAX article at 129 / 226 / 524,
ambiguity-to-release at 97 / 183 / 392, developer-tools at 99 / 193 / 408.
Three added: the agent article at 102 / 202 / 424, the developer bad-day
article at 86 / 178 / 352, the design-system-with-AI article at 86 / 178 /
352. Two edited: the decide article +7 / +8 / +28 for its seventh key idea,
the design-engineer article +17 / +24 / +68 for its eighth. The sums are
-27, -12 and -100, which are the three deltas in the table exactly, and
-100 is 25 elements at 4 widths. **State rules +2 is a stylesheet gaining a
page**: the developer-tools article never loaded `design-psychology.css`,
all three new pages do, and that file carries exactly two state rules.
**Raised surfaces -1 is 5 against 4**: the retired pages carried 2 + 2 + 1,
the new ones carry 2 + 1 + 1, and the edited pages held at 2 and 1. The
index, two retitled Next links and nine case studies restamped by `seo.mjs
--write` add or remove nothing any of the five can see, which is the
ordinary case, and the page count held at 29 because three came off as
three went on. The stretch before this one, d819fe2 to fc86a61, is the
next ladder down.

**That one is three commits, and only one of them has a site in it.** The
commits between d819fe2 and fc86a61 are #281, #283 and #282:

| after | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #281 `1356622` | 6371 | 1876 | 25886 | 15205 | 276 | 128 | 197 |
| #283 `1967d9d` | 6371 | 1876 | 25886 | 15205 | 276 | 128 | 197 |
| **#282** `fc86a61` | **6409** | 1876 | **26058** | **15276** | 276 | 128 | 197 |

Two of the three could not move a browser count and are given rows anyway,
because a row that holds still is what makes the row under it one commit's
work rather than a stretch's. #281 rewrote this section.

**#283 is the one to read twice, and its whole content is invisible here.**
It closed a hole in `tokens.mjs`: the design system page writes token names
into `data-token` attributes and resolves them at runtime, so a swatch for a
retired token rendered blank and passed, because the registry pardons a
retired name anywhere in a document. The pardon now stops at the attribute,
and the 54 names the page RESOLVES are held to a declaration. **None of that
is a number in this table.** A check getting stricter changes what a count
means while leaving the count alone, and no tripwire can see that -- which
is worth knowing before reading a flat row as a quiet commit. The figure it
did add, the 54, is in the sentence at the top of this section rather than
here, because it is a property of the check and not of the tree.

**#282 is the only commit in the stretch with pages in it, and its three
numbers divide across two of them.** On `case-study/lucy-learns.html`:
three lists and a chapter's headings are 15 `li` and 3 `h3`, then a number
row replacing a paragraph is 6 `dt`/`dd` less that `p`. On
`design-system/index.html`: one component entry, 20 elements holding text.
Resting +38 is 21 + 17, type sizes +172 is (23 x 4) + (20 x 4), and curve
elements +71 is 30 + 41. State rules held at 1876 across a commit that
edited `style.css`, which is correct and worth saying out loud: it
de-scoped four selectors and added one, and none of the five is a state.

**Its branch run and its squash's sweep agree to the digit**, 6409 / 1876 /
26058 / 15276 / 276 at both `358b03e` and `fc86a61`, and that agreement is
free evidence rather than a coincidence: the branch was cut from d819fe2
and never rebased, so the two can only match if everything merged between
them moved nothing. #281 and #283 are the two flat rows above saying so
independently. When a branch run and the sweep of its own merge DISAGREE,
the difference is somebody else's commit, and the ladder is how you find
whose.

**The five one-character elements are why resting and typescale disagree**, and
chasing that disagreement is what turned up the error corrected at the foot
of this section. lucy-learns gains 23 elements holding text and resting
asks the question of 21; the design system entry gains 20 and resting asks
17. The five skipped are the `1` and `0` of the number row's own tiles, and
the `1`, `0` and `<code>0</code>` of the entry that documents it. A row of
figures is the one component that reliably trips this rule, because a
one-character figure is exactly what it exists to set large.

**The specimen's `<pre>` IS counted, although it sits in a closed
`<details>`.** Chrome hides that content with `content-visibility` on the
slot rather than `display: none` on the element, so the display check in
`resting.mjs` does not skip it. Worth having written down before a future
entry's arithmetic is read as one element short.

**The set before this one splits into five, and it leaves no residual at
all.** The commits
between 2c783bc and d819fe2 are #276 through #280, each with its own
post-merge sweep still in the Actions list, so that stretch costs five
`gh run view --log` calls:

| after | resting | state rules | type sizes | curve elements | raised | names | decl |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #276 `996e8e2` | 6010 | 1874 | 24798 | 14893 | 276 | 126 | 194 |
| **#277** `23364a5` | 6010 | 1874 | 24798 | 14893 | 276 | **128** | **197** |
| **#278** `db33eb1` | **6099** | 1874 | 24798 | 14893 | 276 | 128 | 197 |
| #279 `69019d5` | 6099 | 1874 | 24798 | 14893 | 276 | 128 | 197 |
| **#280** `d819fe2` | **6371** | **1876** | **25886** | **15205** | 276 | 128 | 197 |

It carries a `names` column the older ladder below does not, because #277 is
the one commit in the stretch that moved that number, and a table without it
would have shown three declarations arriving from nowhere.

#276 rewrote this section and #279 reworded a dek. Neither adds or removes a
thing any of the counts can see, which is the ordinary case.

**#277 restructured most of the cockpit's motion and moved no browser count
at all**, which is worth reading as a rule rather than as a quiet commit: a
transition is a declaration, and none of the five counts elements, text
nodes or state rules that a declaration brings with it. What it did move is
the pair on the right. `reveal.css` is a fourteenth stylesheet and declares
`--motion-press-firm`, `--motion-rise-tight` and `--sweep`, which is 194 ->
197; MOTION.md names two of the three, which is 126 -> 128. A names count
moving by less than the declaration count is the normal direction, because
`tokens.mjs` holds every name the docs USE to a declaration and not the
reverse.

**#278 is the instrument change the section above sets out**, and its 89 are
the only figures in this stretch that are not the site's own.

**#280 is two changes in one merge, and they separate exactly.** It linked
the cockpit's Context fact to the case study that fact names, and rewrote the
five decision disclosures from paragraphs into lists. The link is one `<a>`
and two state rules: resting +8 and curve elements +8 are one new thing on
each of that page's 8 fresh loads, type sizes +32 is the same one across
8 x 4 widths, and state rules +2 are its `:hover` and `:focus-visible`,
counted once because one page loads that stylesheet. The lists are all the
rest -- resting +264 and type sizes +1056 are 33 new text nodes at those same
two multipliers, and curve elements +304 is 38 new elements, being 5 `ul` +
20 `li` + 20 `strong` against the 7 `p` they replaced. That is the 272, the
1088 and the 312 in the table, and all six divide. Raised surfaces held at
276, which is what a stretch that adds no card should look like.

**That ladder is what this section keeps asking for**, and it was cheap
for one reason only: five sweeps, all still in the Actions list. The ladder
below is the same exercise over twelve, and the residuals under that are what
the exercise costs when the sweeps have aged out and nobody read them.

**The set before this one splits too, and into twelve.**
Twenty-eight commits sit between 774df5e and 2c783bc, and the last twelve
landed inside four hours on 2026-09-21, each with its own post-merge run
sitting there unread. Reading the twelve back gives a ladder rather than a
residual:

| after | resting | state rules | type sizes | curve elements | raised | decl |
| --- | --- | --- | --- | --- | --- | --- |
| #262 `af8bb59` | 5983 | 1858 | 24690 | 14656 | 276 | 193 |
| #263, #264, #266 | 5983 | 1858 | 24690 | 14656 | 276 | 193 |
| **#265** `7ec6560` | 5983 | 1858 | 24690 | **14800** | 276 | 193 |
| #269, #268 | 5983 | 1858 | 24690 | 14800 | 276 | 193 |
| **#267** `c680512` | **5978** | **1835** | **24670** | **14792** | 276 | 193 |
| #270, #271 | 5978 | 1835 | 24670 | 14792 | 276 | 193 |
| **#273** `1afc44b` | 5978 | **1874** | 24670 | **14837** | 276 | 193 |
| **#272** `0fb9fd2` | 5978 | 1874 | 24670 | 14837 | 276 | **194** |
| **#275** `2c783bc` | **6010** | 1874 | **24798** | **14893** | 276 | 194 |

Seven of the twelve moved nothing at all, which is the ordinary case and
worth seeing: #263, #264, #266, #268 and #269 retook captures, restyled a
caret and set the factor rows for a cab; #270 rewrote this section; #271
reworked a transition. None of that adds or removes a thing any of the five
counts.

**#265 is 144 curve elements, and the arithmetic is the whole lesson.** It
unified the cockpit page's two disclosure patterns, which put three elements
into each of six summaries -- a `<span>` around the label, an `<svg>` and its
`<path>` -- and 6 x 3 x 8 fresh loads, the rest plus the seven reachable
states, is 144. Nothing else moved, and each of the other four says why in
its own rule: the `::after` chevron it replaced never counted, because a
pseudo-element is not an element; the span wraps text that was already there,
so `resting.mjs` gains no text node; the svg is `aria-hidden`, which
`typescale.mjs` skips; and no stylesheet rule was added or deleted, only
regrouped, so the state count sat still. **A change can be invisible to four
of the five and still be the largest single move in the stretch.**

**#273 is the other side of that coin, and the multiplier is the difference.**
It carried the same fix to the design system's fifteen `.ds-usage`
summaries, three elements into each again, and that is 45 rather than 675:
the design system page registers no reachable state, so its elements are
counted on one load where the cockpit's are counted on eight. It also moved
the shared row into `style.css`, which is the number worth having the
arithmetic for -- **state rules up 39** -- because it is the one of the five
that multiplies by pages rather than by loads. `.disclosure-row:hover` and
`summary:focus-visible` are two rules across the 23 pages that load
`style.css`, so +46; `dispatch-cockpit.css` gave up three grouped `:hover`
selectors and two of the four in its `:focus-visible` group, so -5; `ds.css`
gave up its own two, so -2. `states.mjs` splits a grouped selector on the
comma and counts each of them, which is what makes 46 - 5 - 2 come out
whole.

**#275 is the two-for-one, and the pair is the check on itself.** It gave
the design system page a seventeenth component entry, for the disclosure the
page had been using sixteen times and documenting nowhere: 32 text nodes,
and 32 x 4 widths is the 128 that `typescale.mjs` reports. Two counts
moving in exact proportion is the cheapest confirmation available that
neither is reading something the other is not, and it is free -- the
multiplier is already written down two paragraphs up.

**Its raised-surface count did NOT move, and that reading had to be
checked rather than accepted.** A new entry brings a new `.ds-demo`, a
white card with `--shadow-card` on it, and a raised-surface count that
declines to notice one is the exact shape of the failure this section
warns about. It is not that: `cards.mjs` keys its findings and counts a
kind once, so the entry's demo box is the 65th of something already
counted. A count that stays still for a reason you have read in the script
is a different fact from a count that stays still.

#267 is the rest of it -- resting down 5, type sizes down 20, curve elements
down 8, state rules down 23, and a sixth token retired by name -- and it was
the only one before #273 to touch a stylesheet more than one page loads. It
retired `--color-accent-deep` into `--color-accent-text` across sixty-four
uses and merged selectors as it went; the 23 rules are not itemized here,
because that is its author's arithmetic to write and this paragraph is not
going to invent one. **What matters is that it is one commit and the ladder
says so**, which is the thing the residual below could never do.

The fifteen commits from #248 to #262 are still a residual, because they
predate anybody reading the sweeps back: resting down 8, type sizes down 152,
curve elements down 93, state rules unmoved, two more token names and two
more declarations. What the ladder costs is one `gh run view --log` call per
commit, and what it buys is the difference between those two paragraphs.

**The 774df5e set did not split cleanly, and the part that would not split
was its finding.** #246 took the cockpit's slideshow off the page, along with the
captures beside four of its five decisions, and its own share was measured
scoped against the tree it was cut from: resting down 184, type sizes down
800, curve elements down 808, and three state rules, which were the
slideshow's own hover and focus rules. Each of the first three divides by
its own multiplier -- 23 text nodes and 101 elements over the eight fresh
loads a page with seven reachable states costs, and 25 text nodes over the
thirty-two renders that four widths of those make -- because everything
removed sat outside the cockpit. **The state rules did not divide by
anything, and that is the check working**: rules come out of the stylesheet
and are counted once per page whatever is pressed.

Subtract that share and the residual is the drift of #226 through #245,
twenty-one commits: resting UP 173, type sizes UP 922, curve elements UP
463, state rules up two. Nobody measured those one at a time, and this
paragraph is not going to invent an account of them -- #227 rebuilt the
cockpit page around problem-first and five decisions, #229 put the
watch-for lines on the card, #238 moved each decision's argument to its
measure, and eight of the twenty-one retook captures. What the residual is
FOR is its size: a tripwire that drifts by nine hundred type sizes in
three weeks is one to re-measure on that cadence rather than when somebody
remembers, and the post-merge sweep above is sitting there every time.

**The token declarations drift too, and nothing checks them either.** 192 at
d0b4be7, 193 after those same twenty-one, 190 after #246 deleted
`--slide-w`, `--slide-gap` and `--slide-x` along with the slideshow that
named them, 191 at 774df5e when the cockpit's cards took an elevation
instead of a 1px line and the one card a screen asks you to act on needed a
second resting height to say so, which is `--shadow-card-raised`, 193
through #267, 194 through #272, 197 through #299, 198 at #300, 221 at #316,
and 221 now, printed as 222 from #369 until #398. The total held across #267 while a token was
being retired, which is the kind of thing only a count can tell you:
`--color-accent-deep` left the stylesheets and the same commit's focus-ring
work put two more in, so the number that moved there is the retired-by-name
one, 5 to 6. The 194th is #272's, for a surface that is pressed rather than
read, and 195 through 197 are #277's three in `reveal.css`, set out in the
ladder for #276 through #280 above. The 198th is the deploy console's own stylesheet
arriving with #300; the 199th is #305's `--color-slate`, the 200th #306's
`--app-icon`, 201 through 220 are #313's `--rd-*` set for the console's dark
canvas (21 in, 1 out), and the 221st is #316's `--rd-red-hairline`, all of
them rows in the ladder for #302 through #338 above. The names count moved once in that
stretch, 128 -> 129, for `--color-slate`, which COLOR.md names with a
measured row.

**The 222nd was not a token, and the count went up for it anyway, until
#398.** #369 put `.build-laptop--adapts::after` in `style.css`, and
`tokens.mjs` found a declaration by looking for two hyphens, a name and a
colon: `--adapts:` is there, inside a class with a modifier and a
pseudo-element after it. So from 6d93402 the total it printed was 221
custom properties and one selector, 222 at #393's 37644b5 and at #396's
0062d55. The verdict was not wrong for it -- nothing in the specs names
`--adapts`, and a declaration only ever vouches for a name somebody uses --
but it was the instrument moving rather than the site, in the one count
here that looked too simple to do that. #398 corrected the instrument: a
declaration starts at a property position, so the scan now refuses a match
whose previous character could be part of an identifier, which is exactly
where a selector's modifier leaves one. Run over every stylesheet and
`style=""` attribute in the tree, the old and new scans differ by that one
name, and at d90efe7, before #369, they agree on every name; the count is
221 again, in 16 stylesheets, and the names held at 129. The stylesheet
count moved in the same stretch for an ordinary reason: `walkthrough.css`
is the 16th, arriving with the tour in #377, and it declares nothing. This
is #283's lesson from the other side. There the check got stricter and the
count held while its meaning changed; here the count moved and the site had
not, and a ladder column read without the arithmetic would have taken the
222 for a token. `tokens.mjs` holds every name the docs USE to a
declaration; the total it prints is a count, and a count in prose here is
the same kind of hand-maintained number as the four above.

The older sets carry an account of how they were reached, and all of them
are kept, because what a stale tripwire costs is a reading that comes back
low -- the direction that hides a page falling out of measurement rather
than announcing it. Re-measure and rewrite these five when they have
visibly drifted again, and name the commit measured, the way this paragraph
does. The seven ladders above are what that looks like when the sweeps are
read back while they are still in the Actions list; the residuals under them
are what it looks like when they are not.

The arithmetic is usually simple once you know what each counts. `states.mjs`
counts a rule once for every page that loads its stylesheet, so one deleted
`a:hover` in `style.css` costs nine, the nine pages that load it.

**`resting.mjs` counts ELEMENTS THAT DIRECTLY HOLD TEXT, not text nodes**,
and skips one whose own text is under two characters. This sentence said
"text nodes" until 2026-09-22, and the two only diverge where an element has
inline children: `<p>...<code>x</code>...<code>y</code>...</p>` is five text
nodes and three counted elements, because the `p`, and each `code`, holds
text of its own. Most markup here is a `li` with words in it, where the two
agree, which is why a wrong rule survived this long -- it was #282's
documentation entry, a paragraph with two `code`s and list items with `b`
and `code` inside them, whose arithmetic refused to divide until the rule
was read out of `restingText()` rather than out of this file. `typescale.mjs`
counts the same elements with no length floor, at four widths, so one new
element holding text is four, and it skips `aria-hidden` and anything inside
an `svg`. The gap between the two counts is exactly the elements holding one
character.

`curves.mjs` counts elements, and a pseudo-element is not an element. A ground
is a variant, not a state: `states.mjs` reads any `.is-*` class as a
script-applied state, which is why the section grounds are `ground-*`. And a
state added to `reachable.mjs` multiplies the cockpit's share of three of these
by roughly one whole page each, because a reachable state is measured on its
own fresh load.

**Compare a count against the commit your branch was cut from, not against a
run of `main` from earlier in the day**, and measure last, after the final
merge. Content lands on `main` several times a day, and a number written from
the run before the merge records a tree that was never pushed. Every check
prints the commit it measured, and says when the tree has uncommitted changes.
To measure the base itself without leaving the branch:

```bash
mkdir -p /tmp/base && git archive origin/main | tar -x -C /tmp/base && node scripts/resting.mjs --root /tmp/base <page>
```

When a number moves, write down why in the pull request, as arithmetic: which
elements, on how many pages, at how many widths. The archive's `CLAUDE.md` has
three weeks of worked examples of exactly that.

## What the site tells a machine

`robots.txt` names the assistant crawlers and the two training opt-out tokens
deliberately, with the reasoning in its header; a change there is a rights
decision and goes with a sentence saying why. `seo.mjs` holds every page to
its canonical, its Open Graph card and its JSON-LD graph, all of which name
https://adamhickey.com/ absolutely because scrapers do not resolve a relative
address. The design system page is unlisted and stays out of the homepage's
navigation, but it is in the sitemap and indexable, on purpose.

Four rules that came with #29, each held by `seo.mjs`:

- **Dates are stamped, not typed.** Every case study's Article carries
  `datePublished` (the day the page first existed at its address; set once
  by hand) and `dateModified`, and the sitemap carries a `lastmod` per page.
  `node scripts/seo.mjs --write` resolves one date per page -- the later of
  the file's last commit (or today, while it has uncommitted changes) and
  the stamp the page already carries -- and writes that same value to both,
  so the two cannot disagree. Run it in the same commit as any edit to a
  page. The check faults a page whose git date is more than fourteen days
  past its stamp; the grace exists because a squash-merge gives every file
  a new commit date without a new stamp.

  **A stamp never moves backwards, and that is a rule rather than an
  accident.** Until #244 the date was read fresh at each of the two places
  that write it, and a clean page stamped later than its last commit got
  pulled back to the commit date -- which put five pages nobody had edited
  into a branch's diff, and told a crawler the page had grown younger. The
  write also made the file dirty, so the sitemap then read the date as
  today and the same run wrote the two two days apart. Because `--write`
  can no longer correct a stamp that is wrong in the other direction, the
  check faults a `dateModified` or a `lastmod` dated in the future.

  **How a stamp got ahead of its commit in the first place** was a timezone
  seam, closed in #245: git's `%as` is the author date in the author's own
  offset, and `today()` was UTC, so anything committed after 19:00 at -0500
  was stamped tomorrow. Three commits on the evening of 2026-09-18 put five
  case studies on 2026-09-19 that way, which is where #244's backwards drag
  found its material. Those five still read 09-19 and are left alone on
  purpose: a restamp has to commit them, which gives them that day's git
  date, so correcting a one-day error would have written a two-day one. The
  next real edit to each page sets it right.
- **A FAQ is on the page first.** The four "How I work" pages answer the
  questions people ask in a panel under "When it is one of the other
  three", in the page's own facts (how long it takes, whether it is done
  alone, what the team gives, what it leaves with, where it has worked,
  role or engagement), and the same pairs sit in the page's graph as a
  FAQPage. The check faults a question in the graph that the page does not
  ask in words. Never put a price in one: since 2026-09-17 the pages state
  no length and no fee, and the engagement is one sentence at the close.
- **Every page names its own card.** `node scripts/og.mjs` renders
  `img/og/<slug>.jpg` from a registry of kicker, title and picture, using
  the same Chrome as the checks; keep the registry's title in step with the
  page's `<title>`, and re-run it when either moves. The homepage's is
  `img/og/index.jpg`, since 2026-09-17; before that it kept a hand-drawn
  `img/og-card.jpg`, which is why a stale card outlived two repositionings.
- **`404.html` is not a page.** Pages serves it for every miss at any depth,
  so its links are root-absolute, it is noindexed, it has no canonical and
  it is out of the sitemap and the twenty-two. The browser checks still
  measure it, which is why they say twenty-three pages.

Two more since #32:

- **The `<title>` is search language; the h1 is the site's.** A buyer who
  does not know the name searches "enterprise design system consultant",
  not "Design System Foundation", so the homepage and the four "How I work"
  pages carry the search phrase in `<title>`, `og:title` and the
  description, and keep their own name in the h1 and on the share card.
  `seo.mjs` holds `og:title` to `<title>`. Do not rewrite the page's prose
  to sound like the title; the translation lives in the head, on purpose,
  and the five terms it translates into are listed in `README.md` under
  Deployment. The whole set is meant to be judged against Search Console's
  query report, not guessed at again.
- **IndexNow.** `ab8eb2c23b8aa943256cadc405e3473d.txt` at the root is the
  key, public by design, and `node scripts/indexnow.mjs --submit` reads it
  and the sitemap and tells Bing which pages changed. Run it after the
  deploy has landed, not before, because the engine fetches what it is
  told about and Pages caches for ten minutes. Google does not read
  IndexNow; its sitemap is submitted once, in Search Console, and the
  verification for that and for Bing Webmaster Tools lives in those
  accounts, not in this tree. If either asks for a file at the root, a
  non-HTML file there is invisible to every check here.

- **The articles are the search doors, and the dek is the answer.** Since
  #34 `writing/` holds an index and nine articles, each titled as the
  question a buyer asks before knowing the name, and each answering it in
  the dek under the h1 in three or four sentences that stand on their own.
  That paragraph is what a search engine or an assistant can quote whole;
  the essay under it is the argument. Every article ends on one line
  naming the "How I work" page it describes and the account it draws on,
  which is the article-to-method-to-case-study path the site is built to
  carry, and every figure in one traces to a case study or a build
  write-up on this site. The prose is drawn from the practice essays in
  the sibling `independent-practice` checkout, which stay canonical
  there; an article here is a rendering for a buyer, not the essay. A new
  article is a new page: the `og.mjs` registry, the sitemap through
  `seo.mjs --write`, `llms.txt`, the README's family table and the counts
  it feeds all move with it.

- **Each article is a Blink.** Since the writing-blinks branch an article
  carries its argument the way a Blinkist summary carries a book: the dek
  answers, a numbered list of key ideas under it maps the sections, each
  section opens on a "Key idea 2 of 6" eyebrow and an h2 that is the idea
  as a sentence, one figure breaks the column every section or two, one
  line a section is marked and one of them stands as a pull, and the
  article ends on a recap and one thing to do. The list and the eyebrows
  are written from the h2s by `node scripts/keys.mjs --write`, and the
  check runs in `checks.yml`, so **reword a heading and run --write in the
  same commit.** Three figure kinds, all inside the essay column and all in
  tokens: a flow (`.writing-flow`, stages with a rising bar), a split
  (`.writing-split`, two columns behind two rules) and a number row
  (`.build-facts.writing-facts`). A figure with a label is code, never a
  generated image, because the checks cannot read a label in a bitmap and
  the style spec forbids text in the drawings anyway. The second drawing
  in an article body is `img/writing/<slug>-2.webp`, from
  `scripts/writing-scenes.mjs` through the loop below.

`llms.txt` at the root is the site in a page of markdown for an assistant
that reads that first: the person, the four things he brings to a team,
and every page with one line each. It is written by hand, so a new page or
a changed page is an edit there too.
