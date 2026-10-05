#!/usr/bin/env node
/* The countable claims the documentation makes about the site, recounted.
 *
 * WHAT WAS LOST. checks.yml says it plainly, in the note explaining what the
 * consolidation could not bring across: a step used to read the page counts off
 * design-system/index.html and fail when they disagreed with the files on disk.
 * It ran from a private repository that is not this one, so it is gone -- "the
 * check is genuinely lost, not relocated. design-system/index.html currently
 * claims eighteen pages in seven families. It is right today, and nothing now
 * holds it to it."
 *
 * This holds it to it, and to more than that. The page count is one claim of
 * six here, and the site offers more than six: how many pages load a given
 * stylesheet, how many families there are, how many hand-write the shell. Every
 * one is a number written in prose, and prose does not recompute. The registry
 * below is meant to grow -- what it holds is what someone has bothered to
 * enter, which is not the same as everything that could be checked.
 *
 * IT FOUND TWO ON ITS FIRST RUN. COLOR.md called style.css "loaded by nine
 * pages; the token files are loaded by fifteen" and named that the only
 * architectural rule in the document that matters. The site had grown to
 * eighteen pages since, so the real numbers were twelve and eighteen. The RULE
 * was still exactly right -- the gap between the two counts is the six Tailwind
 * case studies that cannot see style.css, and six is what both spellings give
 * -- which is precisely why nobody caught it. A claim can rot while the
 * sentence around it stays true.
 *
 * WHY A REGISTRY, AGAIN. Same reason tokens.mjs has one, and the same trap. The
 * documentation is full of numbers that are HISTORY and must not be recounted:
 * ".case-section h3 never wins" records 0 of 20 h3 elements across seven pages,
 * a measurement of the site as it was when a rule was deleted. Ten pages use
 * .case-section today. Recounting that would report a correct historical record
 * as a defect and teach the reader to skim the output -- the specific failure
 * this repository has already had once, from resting.mjs reporting a legible
 * caption as 1:1. So a claim is checked because someone entered it here, and
 * what goes here is only what the documentation asserts about the site NOW.
 *
 * THE ANCHOR IS THE POINT. Each entry carries the sentence as written, and the
 * sentence has to still be there. A check keyed only on a number would pass
 * vacuously the moment someone reworded the prose around it -- coverage would
 * lapse silently and the output would still say green. Rewording is fine; doing
 * it without updating the entry is not.
 *
 * No browser. Exit 0 when every claim recounts, 1 with the arithmetic when one
 * does not, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/counts.mjs             every claim
 *   node scripts/counts.mjs --verbose   also show the claims that hold
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verbose = process.argv.includes('--verbose');
const say = (s = '') => console.log(s);
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

/* Every page of the site: the unit almost every claim below counts in.
   404.html is what Pages serves for a miss, not a page of the site, and is
   not one of the twenty-two; seo.mjs skips it the same way. */
function htmlPages(dir = root, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
    if (dir === root && e.name === '404.html') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlPages(p, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(root, p));
  }
  return out.sort();
}
const PAGES = htmlPages();

/* A stylesheet is loaded by a page if the page LINKS it. Matching the bare
   filename anywhere would count it from a <code> sample or a comment, which is
   the mistake tokens.mjs made with CSS comments and had to be taught out of. */
const linksStylesheet = (src, file) =>
  new RegExp(`<link[^>]+href="[^"]*(?:^|/)?${file.replace('.', '\\.')}(?:\\?[^"]*)?"`, 'i').test(src);
const pagesLoading = (file) => PAGES.filter(p => linksStylesheet(read(p), file)).length;

/* A class is present only as a whole token in a class attribute. Substring
   matching would let .case-section-title answer for .case-section. */
function hasClass(src, cls) {
  const re = /class\s*=\s*"([^"]*)"/g;
  for (let m; (m = re.exec(src)); ) if (m[1].split(/\s+/).includes(cls)) return true;
  return false;
}
const pagesWithClass = (cls) => PAGES.filter(p => hasClass(read(p), cls)).length;

function countClass(file, cls) {
  const re = /class\s*=\s*"([^"]*)"/g;
  const src = read(file);
  let n = 0;
  for (let m; (m = re.exec(src)); ) if (m[1].split(/\s+/).includes(cls)) n++;
  return n;
}

/* The per-family table in README.md, summed. This is the claim that was NOT
   being checked when the nineteenth page landed: the headline "Nineteen pages"
   was in the registry and got updated, the family it belonged to was not, and
   Engagements sat at 4 against 5 files on disk. A total that agrees with the
   tree while its own parts do not is the most convincing kind of wrong. */
function familyTableSum() {
  const rows = read('README.md').matchAll(/^\| [A-Z][A-Za-z -]+ \| (\d+) \| [AB] \|/gm);
  return [...rows].reduce((n, m) => n + Number(m[1]), 0);
}
const familyTableRows = () =>
  [...read('README.md').matchAll(/^\| [A-Z][A-Za-z -]+ \| \d+ \| [AB] \|/gm)].length;

/* Staging's copy of this file, archived with its repository on 2026-09-08,
   carried a HELD_BACK list here and a claim built on it -- how many of its
   pages the live site carried. This repository IS the live site, so from here
   that count has no outside to be measured against, and the entry never came
   across. See README, "What the archive holds that this tree does not". */

/* The checks, read from the workflow that runs them rather than from a list
   kept here. A static check is a `run: node scripts/<name>.mjs` step; a
   browser check is a `check:` entry in the browser job's matrix. The Tailwind
   job builds and diffs a stylesheet, which is a step and not a script, and
   the prose counts scripts. cards.mjs joined the matrix on 2026-09-21 and
   the build write-up went on saying nine checks and four renderers for nine
   days, which is the reason these are entries and not a sentence. */
const WORKFLOW = '.github/workflows/checks.yml';
const staticChecks = () =>
  new Set([...read(WORKFLOW).matchAll(/^\s+run: node scripts\/([a-z-]+)\.mjs/gm)].map(m => m[1])).size;
const browserChecks = () =>
  [...read(WORKFLOW).matchAll(/^\s+- check: ([a-z-]+)$/gm)].length;
const scriptsInTree = () =>
  fs.readdirSync(path.join(root, 'scripts')).filter(f => f.endsWith('.mjs')).length;
const filesPresent = (...files) => files.filter(f => fs.existsSync(path.join(root, f))).length;

/* Every node of every page's schema.org graph, summed: the "sixty-one nodes"
   the build write-up stated was sixty-three by the time anyone counted. A
   page with no graph contributes nothing rather than failing the count. */
function schemaNodes() {
  let n = 0;
  for (const p of PAGES) {
    for (const m of read(p).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const d = JSON.parse(m[1]);
      n += (d['@graph'] || [d]).length;
    }
  }
  return n;
}

const WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
                7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven',
                12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
                16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
                20: 'twenty', 21: 'twenty-one', 22: 'twenty-two',
                23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five',
                26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty', 31: 'thirty-one',
                63: 'sixty-three', 67: 'sixty-seven' };

/* ---------------------------------------------------------------------------
 * The claims. `says` is the sentence as written and has to still be findable;
 * `n` is the number that sentence asserts; `of` recounts it from the tree.
 * ------------------------------------------------------------------------- */
const CLAIMS = [
  /* The headline, and the summary table at the top of the file that had been
     contradicting it. README opened with "18 pages in seven families" while
     saying "Fifteen pages in six families" six hundred lines down, and only
     the second one was registered here -- so the check passed, every run,
     with the wrong number in the first paragraph a reader meets. A claim
     that is checked somewhere is not the same as a claim that is checked
     everywhere it is made. */
  { doc: 'README.md',
    says: 'Thirty-one pages in ten families',
    n: 31, what: 'pages', of: () => PAGES.length },

  { doc: 'README.md',
    says: 'The site: 31 pages in ten families',
    n: 31, what: 'pages, as the summary table states them', of: () => PAGES.length },

  { doc: 'README.md',
    says: 'Thirty-one pages in ten families',
    n: 10, what: 'families in the README table', of: familyTableRows },

  { doc: 'README.md',
    says: 'Thirty-one pages in ten families',
    n: 31, what: 'pages summed across the family table', of: familyTableSum },

  { doc: 'README.md',
    says: 'which all thirty-one pages',
    n: 31, what: 'pages loading type.css', of: () => pagesLoading('type.css') },

  { doc: 'README.md',
    says: 'hand-written into all thirty-one pages',
    n: 31, what: 'pages loading site-nav.css', of: () => pagesLoading('site-nav.css') },

  /* The claim this file's own header says it exists to hold, and did not: the
     header promised "nothing now holds it to it" was fixed, while the editions
     table went unregistered and drifted a page behind the tree. A gap exactly
     where the prose said there was none is the reason to enter claims rather
     than trust that someone did. */
  { doc: 'design-system/index.html',
    says: 'Thirty-one pages, and the only edition',
    n: 31, what: 'pages, as the editions list states them', of: () => PAGES.length },
  { doc: 'design-system/index.html',
    says: 'Eighteen of them',
    n: 18, what: 'component entries on the page',
    of: () => countClass('design-system/index.html', 'ds-component') },

  { doc: 'COLOR.md',
    says: 'It is loaded by twenty-five pages',
    n: 25, what: 'pages loading style.css', of: () => pagesLoading('style.css') },

  { doc: 'COLOR.md',
    says: 'token files are loaded by all thirty-one',
    n: 31, what: 'pages loading color.css', of: () => pagesLoading('color.css') },

  /* The build write-up about this site, which is the one page whose whole
     argument is that its numbers are checked, and which carried twenty-eight
     pages, nine checks, four renderers, twenty-five scripts and sixty-one
     schema nodes into October 2026 with nothing holding any of them. The
     browser counts in the same section are dated in the prose instead,
     because no check without a browser can recount them. */
  { doc: 'case-study/this-site.html',
    says: 'Thirty-one pages of plain HTML, no framework and no build step',
    n: 31, what: 'pages, as the dek states them', of: () => PAGES.length },
  { doc: 'case-study/this-site.html',
    says: 'thirty-one pages of plain HTML with no framework and no build step',
    n: 31, what: 'pages, as the description states them', of: () => PAGES.length },
  { doc: 'case-study/this-site.html',
    says: '31 pages, 3 token files, 4 specs, 32 scripts',
    n: 31, what: 'pages, as the size row states them', of: () => PAGES.length },
  { doc: 'case-study/this-site.html',
    says: '31 pages, 3 token files, 4 specs, 32 scripts',
    n: 3, what: 'token files', of: () => filesPresent('color.css', 'type.css', 'shell.css') },
  { doc: 'case-study/this-site.html',
    says: '31 pages, 3 token files, 4 specs, 32 scripts',
    n: 4, what: 'specs', of: () => filesPresent('TYPOGRAPHY.md', 'COLOR.md', 'SPACING.md', 'MOTION.md') },
  { doc: 'case-study/this-site.html',
    says: '31 pages, 3 token files, 4 specs, 32 scripts',
    n: 32, what: 'scripts in scripts/', of: scriptsInTree },
  { doc: 'case-study/this-site.html',
    says: 'Ten checks; five of them render every page in a real browser',
    n: 10, what: 'checks in checks.yml', of: () => staticChecks() + browserChecks() },
  { doc: 'case-study/this-site.html',
    says: 'Ten checks; five of them render every page in a real browser',
    n: 5, what: 'browser checks in the matrix', of: browserChecks },
  { doc: 'case-study/this-site.html',
    says: 'Thirty-one pages, each a plain HTML file',
    n: 31, what: 'pages, as the pages chapter states them', of: () => PAGES.length },
  { doc: 'case-study/this-site.html',
    says: 'a change to the shell is a change to thirty-one files',
    n: 31, what: 'pages carrying the shell (site-nav.css)', of: () => pagesLoading('site-nav.css') },
  { doc: 'case-study/this-site.html',
    says: 'Ten checks run on every merge. Five read the tree',
    n: 10, what: 'checks in checks.yml', of: () => staticChecks() + browserChecks() },
  { doc: 'case-study/this-site.html',
    says: 'Ten checks run on every merge. Five read the tree',
    n: 5, what: 'static checks in checks.yml', of: staticChecks },
  { doc: 'case-study/this-site.html',
    says: 'The other five open every page in Chrome',
    n: 5, what: 'browser checks in the matrix', of: browserChecks },
  { doc: 'case-study/this-site.html',
    says: 'sixty-seven nodes across the site',
    n: 67, what: 'schema.org graph nodes across the pages', of: schemaNodes },

  { doc: 'llms.txt',
    says: 'ten checks that measure the rendered page',
    n: 10, what: 'checks in checks.yml', of: () => staticChecks() + browserChecks() },

  { doc: 'writing/what-does-a-product-design-engineer-actually-do.html',
    says: 'five of them render every page in a real browser',
    n: 5, what: 'browser checks in the matrix', of: browserChecks },
];

if (PAGES.length < 5) {
  say(`\n  Cannot check: found ${PAGES.length} pages. The scan is wrong, not the site.\n`);
  process.exit(2);
}

const missing = [], wrong = [], held = [];
for (const c of CLAIMS) {
  if (!fs.existsSync(path.join(root, c.doc))) {
    say(`\n  Cannot check: ${c.doc} is missing.\n`);
    process.exit(2);
  }
  /* The entry has to be internally honest before it can judge anything: if the
     number it records is not the number its own sentence spells, the entry was
     edited carelessly and its verdict is worthless either way. */
  const word = WORDS[c.n];
  if (word && !new RegExp(`\\b(${word}|${c.n})\\b`, 'i').test(c.says)) {
    say(`\n  Cannot check: the entry for "${c.what}" records ${c.n}, which its own`);
    say(`  sentence does not say: "${c.says}"\n`);
    process.exit(2);
  }
  if (!read(c.doc).includes(c.says)) { missing.push(c); continue; }
  const actual = c.of();
  if (actual !== c.n) wrong.push({ ...c, actual });
  else held.push({ ...c, actual });
}

if (verbose) {
  say('');
  for (const c of held) say(`    ✓ ${c.doc}  ${c.what}: ${c.n}`);
}

if (!missing.length && !wrong.length) {
  say(`\n  ✓ every counted claim still counts`);
  say(`    ${CLAIMS.length} claims across ${new Set(CLAIMS.map(c => c.doc)).size} documents, ` +
      `${PAGES.length} pages\n`);
  process.exit(0);
}

say(`\n  ${CLAIMS.length} claims checked across ${PAGES.length} pages.\n`);

if (wrong.length) {
  say(`  ${wrong.length} ${wrong.length === 1 ? 'claim no longer counts' : 'claims no longer count'}:\n`);
  for (const c of wrong) {
    say(`    ${c.doc}`);
    say(`        "${c.says}"`);
    say(`        says ${c.n} (${WORDS[c.n] || c.n}), counted ${c.actual} ${c.what}`);
  }
  say('\n  The number in the prose is stale, or the site changed and the sentence');
  say('  around it needs rewriting too. Update both, and the entry in this file.\n');
}

if (missing.length) {
  say(`  ${missing.length} claim${missing.length === 1 ? '' : 's'} this file checks ` +
      `cannot be found any more:\n`);
  for (const c of missing) {
    say(`    ${c.doc}`);
    say(`        "${c.says}"   (${c.what})`);
  }
  say('\n  The prose was reworded and this entry was not. That is not a license to');
  say('  delete the entry: without it the claim goes unchecked and the output still');
  say('  reads green, which is the one outcome worse than a failure.\n');
}

process.exit(1);
