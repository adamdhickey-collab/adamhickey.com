#!/usr/bin/env node
/* Reorders the homepage and the writing index to lead with one of three
 * proofs, and puts them back.
 *
 *   node scripts/variant.mjs --apply <file.json>   reorder to the variant
 *   node scripts/variant.mjs --revert              back to the base ordering
 *   node scripts/variant.mjs --status              what is live, and whether it is the base
 *
 * WHAT A VARIANT IS. The search plan (2026-09-17) found that the twenty
 * roles on the board want one of three things led with -- craft and
 * building, enterprise substance, or AI as the product's material -- and
 * that a version of the site is which proof leads, not a different site. So
 * a variant is an ORDERING: of the four "How I work" cards, of the six hero
 * facts, of the three writing collections and the articles inside each, plus
 * the one sentence under the hero title. Nothing is added, nothing is
 * removed, and nothing is reworded but that sentence. The same blocks, the
 * same pictures, the same counts.
 *
 * WHY ORDERING AND NOT COPIES. Thirty pages of hand-written HTML and
 * nine checks that hold the tree to its documentation make a second copy of
 * the homepage the most expensive thing this repository could grow: another
 * canonical, another sitemap entry, another set of claims to recount. A
 * reorder moves no text node and no rule, so every count the checks print is
 * the same before and after by construction -- and that is checked below,
 * not assumed: after writing, the script re-reads what it wrote and refuses
 * to leave a tree whose block counts moved.
 *
 * WHY THE DOM MOVES AND NOT CSS `order`. This site reads itself aloud in
 * document order and is walked by screen readers in document order. A CSS
 * reorder would show one page and speak another.
 *
 * WHERE THE VARIANTS LIVE. In the private practice-hq repository, in
 * site-variants/, beside the résumé variants and for the same reason
 * resumes/README.md gives: a file naming who a version is for has no
 * business in a tree that deploys to a public URL. The base ordering lives
 * HERE, in BASE below, so this repository can always restore itself without
 * the private one. The base is the `craft` ordering, which is what #177 and
 * #178 put on main, and craft.json over there is the same ordering written
 * as a variant so the index of versions is complete.
 *
 * IDENTITY, NOT POSITION. A variant names a card by the page it links to, a
 * fact by its label, a collection by its eyebrow and an article by its slug.
 * Every name must match exactly one block, and every block must be named,
 * or the script refuses before writing anything -- a reorder that silently
 * dropped a card would be worse than one that did not run. The card numerals
 * and the facts' --i stagger are positions, and are renumbered with the
 * order, the way #177 did by hand.
 *
 * THE DEK. The one sentence that changes is `.hero-invite`. The script
 * replaces its text whole; the base sentence is in BASE.
 *
 * A DIRTY TREE IS REFUSED, the way syncable.mjs --apply refuses one: a
 * variant is its own commit, and applying one over uncommitted work is how a
 * reorder and an edit get merged into one diff nobody can read. The two
 * files this script writes are the exception, because trying one ordering,
 * then another, then reverting, is the loop a person runs before committing,
 * and each of those writes only over the last one.
 *
 * WHAT THIS DOES NOT DO. It does not run the checks; it prints the scoped
 * commands to run, which take about half a minute. It does not touch the
 * résumé: the variant file may carry a `resume` field naming the résumé
 * variant that goes with it, and that is for the person, not this script.
 * It does not commit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME = path.join(root, 'index.html');
const INDEX = path.join(root, 'writing', 'index.html');
const argv = process.argv.slice(2);

/* The base: the craft ordering, as main has carried it since #177 and #178. */
const BASE = {
  name: 'craft',
  dek: 'I design complex software and build it: the interface, the design system that holds it together, and working prototypes in real code.',
  cards: ['prototype/dispatch-cockpit.html', 'case-study/sap-product-maturity.html', 'case-study/dispatch-complexity.html', 'writing/how-i-move-a-complex-workflow-from-ambiguity-to-release.html'],
  facts: ['Design systems', 'Prototypes', 'Accessibility', 'Complex workflows', 'AI decisions', 'Research'],
  writing: {
    'Systems and teams': ['where-does-design-end-and-development-begin-now', 'what-does-a-product-design-engineer-actually-do', 'what-makes-an-interface-feel-finished', 'why-enterprise-ux-problems-are-organizational-problems', 'standardizing-ux-across-40-sap-fiori-apps'],
    'Getting to a release': ['designing-for-the-moment-the-workflow-breaks', 'how-i-move-a-complex-workflow-from-ambiguity-to-release', 'what-should-a-working-prototype-actually-prove'],
    'AI in the workflow': ['what-microsofts-hax-framework-gets-right-about-enterprise-ai', 'enterprise-ai-should-help-people-decide-not-just-answer', 'is-your-design-system-ready-for-ai-agents'],
  },
};

const die = (msg) => { console.error(`\n  ✗ ${msg}\n`); process.exit(1); };
const say = (msg) => console.log(msg);

/* --------------------------------------------------------------------------
 * Reading the blocks. Each reader returns { head, items, tail, key(item) } so
 * one reorder routine serves all four lists. The shapes are the ones the
 * markup has carried since the hire-me pass; a shape that stops matching
 * fails here with the count it found, which is the whole protection.
 * ------------------------------------------------------------------------ */
function list(src, open, itemRe, close, key, expect, what) {
  const start = src.indexOf(open);
  if (start < 0) die(`${what}: cannot find the container ${JSON.stringify(open)}`);
  const end = src.indexOf(close, start);
  if (end < 0) die(`${what}: cannot find the container's end`);
  const body = src.slice(start + open.length, end);
  const items = body.match(itemRe) || [];
  if (items.length !== expect) die(`${what}: found ${items.length} blocks, expected ${expect}`);
  if (items.join('') !== body) die(`${what}: the container holds something besides its ${expect} blocks; refusing to reorder around it`);
  return { start: start + open.length, end, items, key };
}

const cards = (src) => list(src,
  '<div class="engagement-grid stagger">',
  /\n          <a class="engagement-card reveal" href="[^"]+">[\s\S]*?\n          <\/a>/g,
  '\n        </div>',
  (b) => b.match(/href="([^"]+)"/)[1], 4, 'the four cards');

const facts = (src) => list(src,
  '<ul class="hero-proof reveal" aria-label="At a glance">',
  /\n          <li>[\s\S]*?\n          <\/li>/g,
  '\n        </ul>',
  (b) => b.match(/hero-proof-label">([^<]+)</)[1], 6, 'the six facts');

const collections = (src) => list(src,
  '<section class="case-section case-overview">\n      <div class="container case-narrow">\n',
  /        <p class="writing-eyebrow">[^<]+<\/p>\n        <p class="writing-collection-dek">[\s\S]*?<\/p>\n        <ol class="writing-list">\n[\s\S]*?\n        <\/ol>\n/g,
  '      </div>\n    </section>',
  (b) => b.match(/writing-eyebrow">([^<]+)</)[1], 3, 'the three collections');

const articles = (block, name, expect) => list(block,
  '<ol class="writing-list">\n',
  /          <li class="writing-item">\n[\s\S]*?\n          <\/li>\n/g,
  '        </ol>',
  (b) => b.match(/href="([a-z0-9-]+)\.html"/)[1], expect, `the articles in ${name}`);

/* Put a list's items in the named order, or refuse. */
function reorder(l, order, what) {
  const have = l.items.map(l.key);
  const missing = order.filter((k) => !have.includes(k));
  const unnamed = have.filter((k) => !order.includes(k));
  if (missing.length) die(`${what}: names ${missing.map((m) => JSON.stringify(m)).join(', ')} match no block`);
  if (unnamed.length) die(`${what}: ${unnamed.map((m) => JSON.stringify(m)).join(', ')} not named; every block must be placed`);
  if (new Set(order).size !== order.length) die(`${what}: a name is given twice`);
  return order.map((k) => l.items[have.indexOf(k)]);
}
const splice = (src, l, items) => src.slice(0, l.start) + items.join('') + src.slice(l.end);

/* --------------------------------------------------------------------------
 * Applying. Returns the two rewritten sources; writes nothing itself.
 * ------------------------------------------------------------------------ */
function apply(home, index, v) {
  /* the cards, renumbered by position */
  let c = reorder(cards(home), v.cards, 'cards');
  c = c.map((b, i) => b.replace(/(engagement-num" aria-hidden="true">)\d\d(<\/span>)/, `$1${String(i + 1).padStart(2, '0')}$2`));
  home = splice(home, cards(home), c);
  /* the facts, with the stagger renumbered */
  let f = reorder(facts(home), v.facts, 'facts');
  f = f.map((b, i) => {
    const n = (b.match(/--i:\d+/g) || []).length;
    if (n !== 1) die(`facts: expected one --i in ${JSON.stringify(facts(home).key(b))}, found ${n}`);
    return b.replace(/--i:\d+/, `--i:${i}`);
  });
  home = splice(home, facts(home), f);
  /* the dek */
  const dekRe = /(<p class="hero-invite reveal">)([\s\S]*?)(<\/p>)/;
  const m = home.match(dekRe);
  if (!m) die('the dek: cannot find <p class="hero-invite reveal">');
  if ((home.match(/class="hero-invite reveal"/g) || []).length !== 1) die('the dek: more than one hero-invite');
  home = home.replace(dekRe, `$1${v.dek}$3`);
  /* the writing index: collections, then the articles inside each */
  const col = collections(index);
  const names = Object.keys(v.writing);
  let blocks = reorder(col, names, 'collections');
  blocks = blocks.map((b, i) => {
    const name = names[i];
    const a = articles(b, name, v.writing[name].length);
    return splice(b, a, reorder(a, v.writing[name], `articles in ${name}`));
  });
  index = splice(index, col, blocks);
  return { home, index };
}

/* What is live: the orders read straight back off the two files. */
function status(home, index) {
  const col = collections(index);
  const writing = {};
  for (const b of col.items) {
    const name = col.key(b);
    writing[name] = articles(b, name, (b.match(/<li class="writing-item">/g) || []).length).items.map((x) => x.match(/href="([a-z0-9-]+)\.html"/)[1]);
  }
  return {
    dek: home.match(/<p class="hero-invite reveal">([\s\S]*?)<\/p>/)[1],
    cards: cards(home).items.map(cards(home).key),
    facts: facts(home).items.map(facts(home).key),
    writing,
  };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* --------------------------------------------------------------------------
 * The command.
 * ------------------------------------------------------------------------ */
const home0 = fs.readFileSync(HOME, 'utf8');
const index0 = fs.readFileSync(INDEX, 'utf8');
const live = status(home0, index0);
const baseShape = { dek: BASE.dek, cards: BASE.cards, facts: BASE.facts, writing: BASE.writing };

if (argv.includes('--status')) {
  say(`\n  ${path.relative(process.cwd(), HOME)} and ${path.relative(process.cwd(), INDEX)}`);
  say(`  ${same(live, baseShape) ? 'the base ordering (craft)' : 'NOT the base ordering'}\n`);
  say(`  dek     ${live.dek}`);
  say(`  cards   ${live.cards.join('  ')}`);
  say(`  facts   ${live.facts.join('  ')}`);
  for (const [k, v] of Object.entries(live.writing)) say(`  ${k.padEnd(22)} ${v.join('  ')}`);
  say('');
  process.exit(0);
}

const revert = argv.includes('--revert');
const ai = argv.indexOf('--apply');
if (!revert && ai < 0) {
  say('\n  node scripts/variant.mjs --apply <file.json> | --revert | --status\n');
  process.exit(2);
}

let variant = BASE;
if (!revert) {
  const file = argv[ai + 1];
  if (!file) die('--apply needs a file');
  const p = path.resolve(file);
  if (p.startsWith(root + path.sep)) die('a variant file inside this repository would be published with it; keep it in practice-hq/site-variants/');
  variant = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const k of ['name', 'dek', 'cards', 'facts', 'writing']) if (!(k in variant)) die(`${file}: no "${k}"`);
}

/* Not trimmed as a whole: porcelain's status is two columns and the first
   line's leading space is the unstaged column, which trim() would eat. */
const dirty = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' }).split('\n')
  .filter((l) => l.trim() && !/^ M (index\.html|writing\/index\.html)$/.test(l));
if (dirty.length) die(`the tree has uncommitted changes besides an ordering; a variant is its own commit\n\n${dirty.join('\n')}`);

const next = apply(home0, index0, variant);
/* The proof, before writing: the same blocks, in the requested order. */
const check = status(next.home, next.index);
const want = { dek: variant.dek, cards: variant.cards, facts: variant.facts, writing: variant.writing };
if (!same(check, want)) die('the rewrite does not read back as the requested ordering; nothing written');
const count = (s) => (s.match(/<(li|a|p|h2|h3|img)\b/g) || []).length;
if (count(next.home) !== count(home0) || count(next.index) !== count(index0)) die('the rewrite changed the number of blocks; nothing written');

if (same(live, want)) {
  say(`\n  already the "${variant.name}" ordering; nothing to do\n`);
  process.exit(0);
}
fs.writeFileSync(HOME, next.home);
fs.writeFileSync(INDEX, next.index);
say(`\n  ✓ ${variant.name}: the cards, the facts, the dek and the writing index now lead with it`);
say(`    ${variant.target ? variant.target : revert ? 'the base ordering' : ''}`);
say(`\n  Now: node scripts/counts.mjs && node scripts/seo.mjs && node scripts/keys.mjs`);
say(`       node scripts/resting.mjs index.html --strict && node scripts/states.mjs index.html --strict`);
say(`       node scripts/resting.mjs writing/index.html --strict && node scripts/states.mjs writing/index.html --strict`);
say(`  then commit, on a branch, as its own change.\n`);
