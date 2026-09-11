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

Work happens on a `claude/<task-name>` branch and lands through a pull request
that `checks.yml` has run on. **Never push to `main` directly.** `main` is the
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
node scripts/resting.mjs --strict         # every color a reader can SEE, untouched
node scripts/states.mjs --strict          # hover, focus and script-applied state
node scripts/typescale.mjs                # every rendered size against the fourteen steps
node scripts/curves.mjs                   # no partial border on a rounded surface
node scripts/states.mjs <page> --strict   # just the page you touched
```

`checks.yml` runs all of these plus the two Tailwind steps on every pull
request, so a change that fails them fails CI. Run them locally first anyway;
the browser step is slow. `tokens.mjs`, `counts.mjs` and `seo.mjs` need
nothing installed and finish in about a second between them, so run those
every time.

The four browser checks take `--root <path>` and otherwise measure the current
directory, and **every one of them prints the path, page count and commit it
measured before it does anything else.** That printing is not decoration. Two
of them used to resolve the root from their own file location and two from
`cwd`, so pointing them at another site produced one tree's numbers under the
other's name. A wrong target you can see is a mistake; a wrong target you
cannot see is a false result.

**Four kinds of question.** `resting.mjs`, `states.mjs`, `typescale.mjs` and
`curves.mjs` read the specs as **rules** and the rendered page as evidence:
does this color clear its floor, is this size on the scale, does this border
follow the whole curve. `tokens.mjs` reads the specs as **claims**: every
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

**Watch the counts, not only the verdict.** `states.mjs` once passed clean at
416 state rules and at 617, and the gap was a third of the site going
unmeasured. At 2026-09-11 the tree measures 3447 resting colors, 1701 state
rules, 14620 type sizes and 8127 elements checked for a partial border
on a curve, across 28 pages (the twenty-seven of the site and `404.html`,
which the browser checks measure and `counts.mjs` and `seo.mjs` leave
out), plus
121 token names against 184 declarations and 10 counted claims. **The four browser numbers are the only ones here that
nothing verifies.** They are maintained by hand and will drift. Treat them as
a tripwire rather than a record: a run that comes back materially smaller
means something stopped being measured, and that is worth more than the digits
being exactly right. Read the page count first, then the measurements; a whole
page leaving moves every number at once.

The arithmetic is usually simple once you know what each counts. `states.mjs`
counts a rule once for every page that loads its stylesheet, so one deleted
`a:hover` in `style.css` costs nine, the nine pages that load it. `resting.mjs`
counts text nodes and skips one under two characters. `typescale.mjs` measures
at four widths, so one new text node is four, and it skips `aria-hidden`.
`curves.mjs` counts elements, and a pseudo-element is not an element. A ground
is a variant, not a state: `states.mjs` reads any `.is-*` class as a
script-applied state, which is why the section grounds are `ground-*`.

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
  `node scripts/seo.mjs --write` stamps `dateModified` and `lastmod` from
  the file's last commit, or today while it has uncommitted changes, so the
  two cannot disagree. Run it in the same commit as any edit to a page.
  The check faults a page whose git date is more than fourteen days past
  its stamp; the grace exists because a squash-merge gives every file a new
  commit date without a new stamp.
- **A FAQ is on the page first.** The four engagement pages answer the
  questions people ask in a panel under "When another engagement fits", in
  the page's own facts (length, fee model, who it is for, what the team
  gives, what it leaves with), and the same pairs sit in the page's graph
  as a FAQPage. The check faults a question in the graph that the page does
  not ask in words. Never put a price in one that the page does not state.
- **Every page names its own card.** `node scripts/og.mjs` renders
  `img/og/<slug>.jpg` from a registry of kicker, title and picture, using
  the same Chrome as the checks; keep the registry's title in step with the
  page's `<title>`, and re-run it when either moves. The homepage keeps
  `img/og-card.jpg`.
- **`404.html` is not a page.** Pages serves it for every miss at any depth,
  so its links are root-absolute, it is noindexed, it has no canonical and
  it is out of the sitemap and the twenty-two. The browser checks still
  measure it, which is why they say twenty-three pages.

Two more since #32:

- **The `<title>` is search language; the h1 is the site's.** A buyer who
  does not know the name searches "enterprise design system consultant",
  not "Design System Foundation", so the homepage and the four engagement
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
  #34 `writing/` holds an index and six articles, each titled as the
  question a buyer asks before knowing the name, and each answering it in
  the dek under the h1 in three or four sentences that stand on their own.
  That paragraph is what a search engine or an assistant can quote whole;
  the essay under it is the argument. Every article ends on one line
  naming the engagement it describes and the account it draws on, which is
  the article-to-engagement-to-case-study path the site is built to
  carry, and every figure in one traces to a case study or a build
  write-up on this site. The prose is drawn from the practice essays in
  the sibling `independent-practice` checkout, which stay canonical
  there; an article here is a rendering for a buyer, not the essay. A new
  article is a new page: the `og.mjs` registry, the sitemap through
  `seo.mjs --write`, `llms.txt`, the README's family table and the counts
  it feeds all move with it.

`llms.txt` at the root is the site in a page of markdown for an assistant
that reads that first: the person, the four engagements with their length
and fee model, and every page with one line each. It is written by hand, so
a new page or a changed engagement is an edit there too.
