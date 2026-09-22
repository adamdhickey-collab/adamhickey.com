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

**All four now press things, and only on one page.** They load a page, wait for
it to settle and measure what is there, which is the whole of twenty-eight of
the twenty-nine. `prototype/dispatch-cockpit.html` is the exception: it renders
its comparison, its override question, its refused button and its opened rows
from JavaScript in response to a press, so twelve of its states were in no DOM
any check ever saw and every one of them said "✓" about a page it had measured
a sixth of. `scripts/lib/reachable.mjs` is the registry -- per page, named
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
unmeasured. At 2026-09-22 the tree measures 6409 resting colors, 1876 state
rules, 26058 type sizes, 15276 elements checked for a partial border on a
curve and 276 raised surfaces, across 29 pages (the twenty-eight of the site
and `404.html`, which the browser checks measure and `counts.mjs` and
`seo.mjs` leave out), plus 128 token names against 197 declarations, 6
retired by name, 54 of them resolved by the design system page rather than
described, and 10 counted claims.

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
rest of this section exists to catch. It is the #278 row of the second
ladder below rather than the current figure now. #278 took the resting count from
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
CI run of `checks.yml` on **`main` at fc86a61** -- the post-merge sweep
rather than a run against a branch, which is the cheapest way to take one,
since that sweep runs whether anybody reads it or not. They replace the
earlier 2026-09-22 set of 6371 / 1876 / 25886 / 15205 / 276 at d819fe2,
which replaced the 2026-09-21 set of 6099 / 1874 / 24798 / 14893 / 276,
taken the same way at
2c783bc, which replaced the 2026-09-20 set of 5991 / 1858 / 24842 / 14749 at
774df5e, which replaced the 2026-09-19 set of 6002 / 1859 / 24720 / 15094
from `claude/assigned-button-ink` at d0b4be7. The set written here between
those last two, at c680512, is not quoted again: it is a row in the third
ladder below, which is a better record of it than a sentence. The page count
did not move -- 29 through all of them, which is the number to read first.

**Two sets in one day is not a warning about the tree.** It is what the
section asks for working: d819fe2's set was taken while a branch was open
against it, that branch merged, and the sweep of the merge was sitting in
the Actions list before anybody had to remember to look. Re-measuring cost
three `gh run view --log` calls. The cost of NOT doing it is the residuals
further down.

**This one is three commits, and only one of them has a site in it.** The
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
through #267, 194 through #272, and 197 now. The total held across #267 while a token was
being retired, which is the kind of thing only a count can tell you:
`--color-accent-deep` left the stylesheets and the same commit's focus-ring
work put two more in, so the number that moved there is the retired-by-name
one, 5 to 6. The 194th is #272's, for a surface that is pressed rather than
read, and 195 through 197 are #277's three in `reveal.css`, set out in the
second ladder above. `tokens.mjs`
holds every name the docs USE to a declaration; the total it prints is a
count, and a count in prose here is the same kind of hand-maintained number
as the four above.

The older sets carry an account of how they were reached, and all of them
are kept, because what a stale tripwire costs is a reading that comes back
low -- the direction that hides a page falling out of measurement rather
than announcing it. Re-measure and rewrite these five when they have
visibly drifted again, and name the commit measured, the way this paragraph
does. The three ladders above are what that looks like when the sweeps are
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
