#!/usr/bin/env node
/* Every token the documentation names, checked against the tokens that exist.
 *
 * The other three checks measure the SITE against the specs: resting.mjs and
 * states.mjs ask whether a rendered color clears its floor, typescale.mjs asks
 * whether a rendered size is on the scale. All three read the specs as rules
 * and the pages as evidence. None of them reads the specs as CLAIMS -- and the
 * specs are full of claims, one per token name in prose, every one of them
 * falsifiable and none of them checked.
 *
 * WHAT LET THIS IN. COLOR.md described `--color-black` twice in the present
 * tense: "exists for shadows and scrims only" in §2, and "Eight tokens, all
 * built on --color-black" under Elevation. Step 6 of the same document, some
 * four hundred lines further down, recorded that it had been DELETED for having
 * no consumers. Both halves of the §2 sentence had stopped being true by then:
 * the eight shadows carry their own literal rgba(0,0,0,...) in shell.css, and
 * the scrim is --color-scrim. The design system page had copied the Elevation
 * sentence verbatim, so the site repeated it too. Three passages, one dead
 * token, and nothing that could tell -- because no check had ever compared the
 * prose to the stylesheet.
 *
 * WHAT IT ASKS. Every `--token` named in the four specs or on the design system
 * page is either DEFINED somewhere the browser will see it, or DECLARED RETIRED
 * below. There is no third state. A name that is neither is a claim about a
 * token that does not exist, which is exactly the bug above.
 *
 * WHY A REGISTRY AND NOT A HEURISTIC. The specs discuss deleted tokens on
 * purpose and at length -- most of COLOR.md §7 and TYPOGRAPHY.md §3 are the
 * record of what was removed and why, which is the most useful thing in either
 * document. A check that flagged those would be telling the specs to stop
 * explaining themselves. So retirement is declared, once, by hand: naming a
 * dead token in prose is free, and naming it without saying it is dead is not.
 *
 * The registry is held to the same standard it enforces. An entry whose token
 * has come back is stale, and an entry nothing mentions any more is dead weight;
 * both fail. A list nobody prunes becomes a list nobody trusts.
 *
 * No browser, so this is the one check that runs anywhere in about a second.
 * Exit 0 when every named token is accounted for, 1 with the list when it is
 * not, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/tokens.mjs             the four specs and the design system page
 *   node scripts/tokens.mjs --verbose   also list what each source names
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verbose = process.argv.includes('--verbose');
const say = (s = '') => console.log(s);

/* The documents that make claims. The four specs are normative; the design
   system page is the same claims rendered for a reader, and drifts from them
   by being copied out of them. */
const SPECS = ['COLOR.md', 'TYPOGRAPHY.md', 'SPACING.md', 'MOTION.md'];
const DOCS = [...SPECS, 'design-system/index.html'];

/* Tokens the documentation names on purpose, having removed them. Each entry
   has to say where it went, because "retired" with no reason is how a token
   that was actually just misspelled hides for a year. */
const RETIRED = new Map([
  ['--color-accent',      'COLOR.md §4: never defined at all; site-nav.css resolved it through a literal fallback'],
  ['--color-accent-soft', 'COLOR.md §7 step 5: the accent at 10%, no consumers, deleted'],
  ['--color-black',       'COLOR.md §7 step 6: no consumers; the shadows carry literal rgba(0,0,0,...)'],
  ['--shadow-sm',         'COLOR.md §7 step 5: no consumers at all, deleted'],
  ['--type-display',      'TYPOGRAPHY.md §3: a first-draft ramp whose premises were all false'],
]);

/* A token name, not a fragment of one. The specs write bare prefixes --
   "--color-", "--shadow-", "--text-" -- when they mean a family, and markdown
   rules ("---") and table borders lex identically to a name if you let them.
   Require a letter first and alphanumeric last, so a rule falls out.
   The trailing lookahead is what makes a family prefix fall out TOO, and it is
   not optional: without it "--color-" happily matches as "--color", because the
   engine just backtracks off the hyphen it was told not to end on. The first
   run of this check reported --color, --shadow and --text as missing tokens --
   three false alarms, each one a prefix the specs wrote on purpose. */
const NAME = /--[a-z][a-z0-9-]*[a-z0-9](?![a-z0-9-])/g;
const names = (text) => new Set(text.match(NAME) || []);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(path.relative(root, p));
  }
  return out;
}

const files = walk(root);
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

/* ---------------------------------------------------------------------------
 * What exists.
 *
 * Deliberately NOT "any --x: in any file". The design system page prints token
 * definitions inside <code> samples as documentation, and counting those as
 * definitions would let the page vouch for its own claims -- a dead token shown
 * in a sample would define itself and the check would pass. So: declarations
 * come from stylesheets, from inline style="" attributes, and from
 * setProperty(), which is every place a browser actually learns a custom
 * property in this repository. Prose does not get a vote.
 * ------------------------------------------------------------------------- */
const DECLARE = /(--[a-z][a-z0-9-]*[a-z0-9])(?![a-z0-9-])\s*:/g;

/* Comments are not declarations, and in this repository they read exactly like
   them. style.css carries "/* Deeper than --color-accent: at 12px ... *\/" --
   prose, with a colon in the right place. Scanning the raw file counted it as a
   definition of --color-accent, which is the one token COLOR.md goes out of its
   way to say does not exist. The check would have vouched for the token whose
   absence is the spec's own worked example. Strip comments first. */
const uncomment = (css) => css.replace(/\/\*[\s\S]*?\*\//g, ' ');
const STYLE_ATTR = /style\s*=\s*"([^"]*)"/gi;
const SET_PROP = /setProperty\(\s*['"`](--[a-z][a-z0-9-]*[a-z0-9])/g;

/* ---------------------------------------------------------------------------
 * What is not a token at all.
 *
 * The specs describe how the checks are RUN, and a script's flags are spelled
 * exactly like a custom property. A paragraph in COLOR.md §5 saying resting.mjs
 * "reports these separately, under `--probes`" made this check announce that a
 * CSS token was missing, which is the failure it exists to prevent wearing the
 * other face: not a claim that went unchecked, but a confident answer naming
 * the wrong cause. The author reworded the prose to get past it. That is the
 * wrong direction of accommodation -- the prose was right.
 *
 * DERIVED, NOT LISTED. A hand-written list of flags would go stale the first
 * time a script gained one, and this file already asks two registries to be
 * maintained; a third, for something a machine can read, would be pushing it.
 * The scripts declare their own flags by testing argv against them, so that is
 * where the set comes from. Add a flag to any check and this one learns it.
 *
 * IT ONLY EVER EXCUSES. A flag name is consulted for one purpose: to explain a
 * name that is otherwise a phantom. If something is both a declared token and a
 * flag, the declaration wins and the token is checked as normal -- being named
 * --strict would not buy a real token an exemption. And the count is reported,
 * because a flag silently shadowing a token is precisely the sort of quiet
 * un-measuring this repository has learned to distrust.
 * ------------------------------------------------------------------------- */
const ARGV_FLAG = /argv[^;\n]*?\.(?:includes|indexOf)\s*\(\s*['"`](--[a-z][a-z0-9-]*)['"`]/g;
const flags = new Set();
for (const f of files.filter(f => f.endsWith('.mjs') || f.endsWith('.js')))
  for (const m of read(f).matchAll(ARGV_FLAG)) flags.add(m[1]);

const defined = new Map();          // token -> Set of files that declare it
const note = (tok, file) => {
  if (!defined.has(tok)) defined.set(tok, new Set());
  defined.get(tok).add(file);
};

let cssFiles = 0;
for (const f of files) {
  const ext = path.extname(f);
  if (ext === '.css') {
    cssFiles++;
    for (const m of uncomment(read(f)).matchAll(DECLARE)) note(m[1], f);
  } else if (ext === '.html') {
    const src = read(f);
    for (const a of src.matchAll(STYLE_ATTR))
      for (const m of a[1].matchAll(DECLARE)) note(m[1], f);
    for (const m of src.matchAll(SET_PROP)) note(m[1], f);
  } else if (ext === '.js' || ext === '.mjs') {
    for (const m of read(f).matchAll(SET_PROP)) note(m[1], f);
  }
}

if (!cssFiles || defined.size < 50) {
  say(`\n  Cannot check: found ${defined.size} token declarations in ${cssFiles} stylesheets.`);
  say('  That is far too few to be the whole system, so the scan is wrong, not the site.\n');
  process.exit(2);
}

/* ---------------------------------------------------------------------------
 * What the documentation says exists.
 * ------------------------------------------------------------------------- */
const claimed = new Map();          // token -> Set of documents that name it
for (const doc of DOCS) {
  if (!fs.existsSync(path.join(root, doc))) {
    say(`\n  Cannot check: ${doc} is missing.\n`);
    process.exit(2);
  }
  for (const tok of names(read(doc))) {
    if (!claimed.has(tok)) claimed.set(tok, new Set());
    claimed.get(tok).add(doc);
  }
}

if (verbose) {
  for (const doc of DOCS) {
    const mine = [...claimed].filter(([, docs]) => docs.has(doc)).map(([t]) => t).sort();
    say(`\n  ${doc} names ${mine.length} tokens`);
    for (const t of mine) say(`      ${t}${defined.has(t) ? '' : RETIRED.has(t) ? '   (retired)' : '   ← UNDEFINED'}`);
  }
  say('');
}

/* ---------------------------------------------------------------------------
 * The three ways this can be wrong.
 * ------------------------------------------------------------------------- */
const phantom = [];                 // named, not defined, not retired, not a flag
const asFlag = [];                  // named, and a flag of one of the checks
for (const [tok, docs] of claimed) {
  if (defined.has(tok) || RETIRED.has(tok)) continue;
  if (flags.has(tok)) { asFlag.push(tok); continue; }
  phantom.push([tok, docs]);
}

const resurrected = [];             // declared retired, but defined again
for (const [tok] of RETIRED)
  if (defined.has(tok)) resurrected.push([tok, defined.get(tok)]);

const unmentioned = [];             // declared retired, mentioned by nothing
for (const [tok] of RETIRED)
  if (!claimed.has(tok)) unmentioned.push(tok);

phantom.sort(([a], [b]) => a.localeCompare(b));

const scale = `${claimed.size} names across ${DOCS.length} documents, ` +
              `${defined.size} tokens declared in ${cssFiles} stylesheets`;

if (!phantom.length && !resurrected.length && !unmentioned.length) {
  say(`\n  ✓ every token the documentation names exists`);
  say(`    ${scale}, ${RETIRED.size} retired by name` +
      (asFlag.length ? `, ${asFlag.length} a flag rather than a token` : '') + '\n');
  process.exit(0);
}

say(`\n  ${scale}.\n`);

if (phantom.length) {
  say(`  ${phantom.length} token${phantom.length === 1 ? ' is' : 's are'} named by the documentation ` +
      `and defined nowhere:\n`);
  for (const [tok, docs] of phantom) {
    say(`    ${tok}`);
    say(`        named in ${[...docs].join(', ')}`);
    /* A token gets used; a flag only gets mentioned. If nothing anywhere puts
       this name inside a var(), say so -- the reader is more likely looking at
       a flag this check has not been taught than at a missing token. */
    const used = DOCS.some(d => read(d).includes(`var(${tok}`)) ||
                 [...defined.keys()].includes(tok);
    if (!used) {
      say(`        never used in a var() by anything here`);
      say(`        if it is a flag, the script that parses it will teach this check to skip it`);
    }
    const family = tok.replace(/-[a-z0-9]+$/, '');
    const near = family.length < 4 ? []
      : [...defined.keys()].filter(d => d.startsWith(family) && d !== tok).sort();
    if (near.length) say(`        nearby, and real: ${near.slice(0, 4).join(', ')}`);
  }
  say('\n  Either the prose is describing a token that was removed -- in which case');
  say('  say so where it is named, and add it to RETIRED in this file -- or the');
  say('  token should exist and does not. Both are bugs; only one is in the CSS.');
  say('  A third possibility, if the name is spelled like a flag: it is one, and no');
  say('  script parses it yet. Then the prose is ahead of the code, not wrong.\n');
}

if (resurrected.length) {
  say(`  ${resurrected.length} token${resurrected.length === 1 ? '' : 's'} declared retired here, ` +
      `but defined again:\n`);
  for (const [tok, where] of resurrected) say(`    ${tok}   now in ${[...where].join(', ')}`);
  say('\n  The registry is out of date. Drop the entry.\n');
}

if (unmentioned.length) {
  say(`  ${unmentioned.length} retired token${unmentioned.length === 1 ? '' : 's'} ` +
      `no document mentions any more:\n`);
  for (const tok of unmentioned) say(`    ${tok}   ${RETIRED.get(tok)}`);
  say('\n  Nothing needs excusing. Drop the entry, so the list stays worth reading.\n');
}

process.exit(1);
