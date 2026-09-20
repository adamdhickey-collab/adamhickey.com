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
the push, because they cost a second; the four browser checks run scoped to
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
the tree; `pages.yml` ships it. A commit can pass all nine checks and never
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
finish in about a second between them, so run those every time. `cards.mjs`
is a sixth script and not one of the ten: see below.

### How much of that to run, and when

The cost is not spread evenly across the nine. `deployable.mjs`,
`tokens.mjs`, `counts.mjs`, `seo.mjs` and `keys.mjs` finish in about a second together and
need nothing installed. The four browser checks are the entire bill: each
renders every page in the tree, and `typescale.mjs` renders each of them at
four widths. Unscoped, that is minutes locally and was 9m11s in CI on #78.

**The post-merge run is the full sweep, so a local run is about catching a
failure before it is live rather than about coverage.** That makes it a
question of aim rather than volume: scope it to what changed, and never hold
a merge for it. The row below says which changes are worth the wait. Scoped to
the page you touched, all four browser checks together take about half a
minute, most of it `typescale.mjs` visiting its four widths; `resting.mjs`
alone on one page is a second. That is the difference between a check you run
and a check you skip because you are in a hurry.

| What the change touches | Run locally |
| --- | --- |
| Copy, markup, SEO, images | The fast five |
| Color, type, spacing or motion **on one page** | The fast five, plus the four browser checks scoped to that page |
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

The four browser checks take `--root <path>` and otherwise measure the current
directory, and **every one of them prints the path, page count and commit it
measured before it does anything else.** That printing is not decoration. Two
of them used to resolve the root from their own file location and two from
`cwd`, so pointing them at another site produced one tree's numbers under the
other's name. A wrong target you can see is a mistake; a wrong target you
cannot see is a false result.

**`cards.mjs` IS THE ONE CHECK THAT IS NOT IN `checks.yml`, AND IT IS RED.**
It asks whether a card on a ground has an edge a reader can see, at a floor
of 1.2:1. It named 13 surfaces on the cockpit when it was merged; making
`--shadow-card`'s ring opaque took that to 5, and the 5 that are left are
tinted zones carrying no elevation, which a card's drop shadow is the wrong
answer for. So it is still red, still a real finding, and still run by
hand. It is out of the workflow because a leg that is known to be red tells
you nothing about the commit that turned it red, and `checks.yml` is the one
instrument every other merge is read against. Wire it in the day the site
passes it, and move it into the fast paragraph below when you do.

**Four kinds of question.** `resting.mjs`, `states.mjs`, `typescale.mjs`,
`curves.mjs` and `cards.mjs` read the specs as **rules** and the rendered page
as evidence: does this color clear its floor, is this size on the scale, does
this border follow the whole curve, does this card's edge separate it from the
ground behind it. `cards.mjs` is the one whose defect is invisible in the
stylesheet: a charcoal tint composites over the card's own fill when it is a
border and over the ground when it is a shadow's ring, so the declaration that
draws nothing looks exactly like the one that draws a hairline. `tokens.mjs` reads the specs as **claims**: every
`--token` the four specs or the design system page names either exists in the
CSS or is declared retired in the script's own registry. `counts.mjs` does the
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
unmeasured. At 2026-09-20 the tree measures 5991 resting colors, 1858 state
rules, 24842 type sizes and 14749 elements checked for a partial border on a
curve, across 29 pages (the twenty-eight of the site and `404.html`, which
the browser checks measure and `counts.mjs` and `seo.mjs` leave out), plus
122 token names against 191 declarations and 10 counted claims.

Three of those four jumped when the checks learned to press things, and all of
the jump is one page: resting 4024 -> 5784, type sizes 16886 -> 23838, curve
elements 9673 -> 14246 **as the tree stood at #109**, each exactly the
cockpit's own increase. Those three right-hand figures are the record of that
change rather than the current count -- the sentence above carries the current
one, and it has moved since. **The state rule count did not move, on
purpose** -- rules come out of the stylesheet and are the same in every
state, so `states.mjs` counts them once per page. A reachable state that
inflated this number would be corrupting the one instrument the section below
asks you to trust. **The four browser numbers are maintained by hand and
nothing verifies them** -- nor the token total printed beside them, which
the paragraph on declarations below sets out. They will drift. Treat them as a tripwire rather than a
record: a run that comes back materially smaller means something stopped
being measured, and that is worth more than the digits being exactly right.
Read the page count first, then the measurements; a whole page leaving moves
every number at once.

The figures above are a re-measurement, not a delta. They were taken by the
CI run of `checks.yml` on **`main` at 774df5e** -- the post-merge sweep
rather than a run against a branch, which is the first of these taken that
way and the cheapest way to take one, since that sweep runs whether anybody
reads it or not -- and they replace the 2026-09-19 set of 6002 / 1859 /
24720 / 15094, taken on `claude/assigned-button-ink` at d0b4be7. The page
count did not move -- 29 before and 29 after, which is the number to read
first.

**This one does not split cleanly, and the part that will not split is the
finding.** #246 took the cockpit's slideshow off the page, along with the
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
named them, and 191 now: the cockpit's cards took an elevation instead of a
1px line, and the one card a screen asks you to act on needed a second
resting height to say so, which is `--shadow-card-raised`. `tokens.mjs`
holds every name the docs USE to a declaration; the total it prints is a
count, and a count in prose here is the same kind of hand-maintained number
as the four above.

The older sets carry an account of how they were reached, and all of them
are kept, because what a stale tripwire costs is a reading that comes back
low -- the direction that hides a page falling out of measurement rather
than announcing it. Re-measure and rewrite these four when they have
visibly drifted again, and name the commit measured, the way this paragraph
does.

The arithmetic is usually simple once you know what each counts. `states.mjs`
counts a rule once for every page that loads its stylesheet, so one deleted
`a:hover` in `style.css` costs nine, the nine pages that load it. `resting.mjs`
counts text nodes and skips one under two characters. `typescale.mjs` measures
at four widths, so one new text node is four, and it skips `aria-hidden`.
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
