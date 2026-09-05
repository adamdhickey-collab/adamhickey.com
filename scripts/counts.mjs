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

/* Every page of the site: the unit almost every claim below counts in. */
function htmlPages(dir = root, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
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

/* The pages this tree deliberately does not ship to the live site. The live
   site is another repository and is not here to be counted, so the claim built
   on this list recounts the half that IS here: fifteen pages, less these five.
   Both halves have to hold. If one of these stopped being a page the
   subtraction would still return a number, and a wrong answer shaped like
   arithmetic is the failure this whole file was written against -- see the
   guard below, which refuses rather than answers. */
const HELD_BACK = [
  'case-study/door-county-found.html',
  'case-study/lucy-learns.html',
  'case-study/while-were-here.html',
  'engagement/product-clarity.html',
  'design-system/index.html',
];

const WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
                7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven',
                12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
                16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
                20: 'twenty' };

/* ---------------------------------------------------------------------------
 * The claims. `says` is the sentence as written and has to still be findable;
 * `n` is the number that sentence asserts; `of` recounts it from the tree.
 * ------------------------------------------------------------------------- */
const CLAIMS = [
  { doc: 'README.md',
    says: 'Fifteen pages in six families',
    n: 15, what: 'pages', of: () => PAGES.length },

  { doc: 'README.md',
    says: 'Fifteen pages in six families',
    n: 6, what: 'families in the README table', of: familyTableRows },

  { doc: 'README.md',
    says: 'Fifteen pages in six families',
    n: 15, what: 'pages summed across the family table', of: familyTableSum },

  { doc: 'README.md',
    says: 'which all fifteen pages',
    n: 15, what: 'pages loading type.css', of: () => pagesLoading('type.css') },

  { doc: 'README.md',
    says: 'hand-written into all fifteen pages',
    n: 15, what: 'pages loading site-nav.css', of: () => pagesLoading('site-nav.css') },

  /* The claim this file's own header says it exists to hold, and did not: the
     header promised "nothing now holds it to it" was fixed, while the editions
     table went unregistered and drifted a page behind the tree. A gap exactly
     where the prose said there was none is the reason to enter claims rather
     than trust that someone did. */
  { doc: 'design-system/index.html',
    says: 'Fifteen pages: everything live has',
    n: 15, what: 'staging-root pages', of: () => PAGES.length },
  { doc: 'design-system/index.html',
    says: 'Seventeen of them',
    n: 17, what: 'component entries on the page',
    of: () => countClass('design-system/index.html', 'ds-component') },

  { doc: 'COLOR.md',
    says: 'It is loaded by nine pages',
    n: 9, what: 'pages loading style.css', of: () => pagesLoading('style.css') },

  { doc: 'COLOR.md',
    says: 'token files are loaded by all fifteen',
    n: 15, what: 'pages loading color.css', of: () => pagesLoading('color.css') },

  /* The claim that drifted furthest before anyone entered it: README read "11
     of these 18 pages" for as long as it took `writing/` to ship and be
     deleted. Nothing here can see the live repository, so what is checked is
     the subtraction -- the tree, less the pages named as held back -- which is
     precisely the half that moved. */
  { doc: 'README.md',
    says: 'The live site carries 10 of these 15 pages',
    n: 10, what: 'pages here that are not held back from live',
    of: () => PAGES.length - HELD_BACK.length },
];

if (PAGES.length < 5) {
  say(`\n  Cannot check: found ${PAGES.length} pages. The scan is wrong, not the site.\n`);
  process.exit(2);
}

/* HELD_BACK is a list of paths, and a list of paths rots the way prose does.
   Confirm every one is still a page before subtracting them from the tree:
   a held-back page that was deleted would silently raise the count of pages
   said to be live, which is the wrong direction to be wrong in. */
const strayHeldBack = HELD_BACK.filter(p => !PAGES.includes(p));
if (strayHeldBack.length) {
  say(`\n  Cannot check: README names ${strayHeldBack.length} held-back ` +
      `page${strayHeldBack.length === 1 ? ' that no longer exists' : 's that no longer exist'}:\n`);
  for (const p of strayHeldBack) say(`    ${p}`);
  say('\n  Either the page went and the held-back list in this file did not, or');
  say('  the scan is wrong. Subtracting a list nobody re-read is not a count.\n');
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
  say('\n  The prose was reworded and this entry was not. That is not a licence to');
  say('  delete the entry: without it the claim goes unchecked and the output still');
  say('  reads green, which is the one outcome worse than a failure.\n');
}

process.exit(1);
