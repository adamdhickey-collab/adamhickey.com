#!/usr/bin/env node
/* Every list of three or more carries the comma before its "and" or "or".
 *
 * THE RULE. VOICE.md, section 3, the habits table: "phone, store, and
 * person," never "phone, store and person." No exceptions, and that includes
 * the places nobody proofreads -- the <title>, the meta description, the Open
 * Graph and Twitter cards, the JSON-LD graph, llms.txt, the share cards that
 * og.mjs renders, and the dek variant.mjs writes into the homepage. Pages
 * written before the rule broke it, and nothing held the ones written after
 * to it, so a list without its comma was a habit coming back one page at a
 * time. This is the thing that holds it.
 *
 * WHAT IT READS. The text a reader or a machine meets, not the markup:
 *   - every HTML page: the visible text with <script>, <style>, <pre>, and
 *     comments taken out, plus alt and aria-label, which a screen reader
 *     speaks; and from the head the <title>, the meta description, every
 *     og: and twitter: content, and every string inside the JSON-LD
 *   - llms.txt, VOICE.md, README.md, and the four specs, with fenced code
 *     taken out
 *   - the kicker, title, and sub of every card in og.mjs, and the dek in
 *     variant.mjs's BASE
 * Inline code, <code> or backticks, is read as the one word "code", so a
 * list of class names is still a list and its excerpt still says where it
 * is.
 *
 * WHAT IT FLAGS. A comma, then one to four words with no punctuation, then
 * "and" or "or": the shape of "A, B and C". The Oxford form, "A, B, and C",
 * never matches, because its middle item ends in a comma. A handful of
 * cheap tests below let the commonest look-alikes go before anyone has to
 * read them: an item that opens a clause or carries a verb, one that is a
 * participle or prepositional phrase hung off the sentence, and a pair like
 * "four words or fewer".
 *
 * WHY AN ALLOWLIST. The pattern is a heuristic, and what is left of the
 * same shape after those tests is still sometimes not a list: a clause
 * after an introductory one ("When it ships, design and engineering
 * agree"), a pair in apposition ("the next builder, person or agent"), a
 * name with "and" inside it, or one item of a longer list that carries its
 * own "and" ("its photograph, its town and category, and its badges"). No
 * pattern tells those apart from a real list without reading the sentence,
 * so a person reads it once and enters it below: the file, a phrase from
 * the excerpt the check printed, and one line saying why it is not a list.
 * That is the arrangement counts.mjs and tokens.mjs make with their
 * registries, and it is held to the same standard: an entry whose phrase
 * nothing in its file contains any more is dead weight, and fails.
 *
 * It held 76 entries the day it arrived, against 308 series across 48
 * files that the first sweep fixed, and the number is worth keeping down. A phrase that
 * reads as a missing comma to this script often reads that way to a person
 * too, and rewording it is usually better than excusing it.
 *
 * No browser. Exit 0 when every list has its comma, 1 with the list of
 * phrases when one does not, 2 when it could not find out -- which is not a
 * pass.
 *
 *   node scripts/oxford.mjs             every page and document
 *   node scripts/oxford.mjs --verbose   also show what each source contributed
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const verbose = process.argv.includes('--verbose');
const say = (s = '') => console.log(s);
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

/* ---------------------------------------------------------------------------
 * Reviewed phrases that match the pattern and are not lists. `phrase` is
 * copied from the excerpt this script prints for `file`, and excuses that
 * excerpt only in that file; `why` is the one line that makes it safe.
 * Pages first, then documents, each by file, for the person pruning it.
 * ------------------------------------------------------------------------- */
const ALLOW = [
  { file: 'case-study/door-county-found.html', phrase: 'its town and category stamped above',
    why: 'one item in a list that has its comma' },
  { file: 'case-study/faunaform.html', phrase: 'grayed blue sky and shadow',
    why: 'one ink, sky and shadow, in a list that has its comma' },
  { file: 'case-study/lucy-learns.html', phrase: 'step 1 of 6, ring or knock once',
    why: 'alt text reading the screen: a step, then its instruction' },
  { file: 'case-study/lucy-learns.html', phrase: 'the blue chair and gray bed unchanged',
    why: 'an absolute phrase on a scene, not a third item' },
  { file: 'case-study/lucy-learns.html', phrase: 'leash in one hand and treat pouch in',
    why: 'an absolute phrase: one hand and the other' },
  { file: 'case-study/while-were-here.html', phrase: 'paced spread by spread and proofed',
    why: 'a participle phrase after the list, not its third item' },
  { file: 'design-system/index.html', phrase: 'on the full grid and the compact one',
    why: 'a pair: where the thumbnail moves on hover' },
  { file: 'design-system/index.html', phrase: 'same code shape, different ground and position',
    why: 'two contrasts, the second a pair' },
  { file: 'design-system/index.html', phrase: 'round caps and joins',
    why: 'one item, round caps and round joins, in a list that has its comma' },
  { file: 'design-system/index.html', phrase: 'against 11 tokens, 26 hex and 54 code',
    why: 'the eighty values split in two, not a list' },
  { file: 'design-system/index.html', phrase: 'naming position and subject',
    why: 'a participle phrase, then a pair' },
  { file: 'lab/agent-review.html', phrase: 'remote or Twin Cities hybrid',
    why: 'a pair: remote, or hybrid in the Twin Cities' },
  { file: 'lab/inspiration-to-aisle.html', phrase: 'One trip, today and connected',
    why: 'a title in apposition: the one trip, shown today and connected' },
  { file: 'prototype/dispatch-cockpit.html', phrase: 'distance and driver hours',
    why: 'a pair naming the two rows' },
  { file: 'writing/enterprise-ai-should-help-people-decide-not-just-answer.html', phrase: 'say what it measures and watch a real',
    why: 'an instruction after a clause' },
  { file: 'writing/how-should-you-test-a-product-now-that-ai-can-help.html', phrase: 'who I need, five or six tasks',
    why: '"five or six", inside a list that has its comma' },
  { file: 'writing/how-should-you-test-a-product-now-that-ai-can-help.html', phrase: 'agents walk every path and flag dead ends',
    why: 'a clause after an introductory one' },
  { file: 'writing/how-should-you-test-a-product-now-that-ai-can-help.html', phrase: 'a dispatcher and a manager say',
    why: 'an apposition naming the two kinds' },
  { file: 'writing/what-changes-when-ai-agents-join-the-product-team.html', phrase: 'a UX and accessibility check',
    why: 'a clause after an introductory one' },
  { file: 'writing/what-does-a-design-system-need-once-ai-is-in-the-product.html', phrase: 'five of them empty and the fourth holding',
    why: 'an absolute phrase: five hooks and the sixth' },
  { file: 'writing/what-does-a-developer-need-from-an-interface-on-a-bad-day.html', phrase: 'the step names and times in a',
    why: 'the last of three phrases, which carries no conjunction' },
  { file: 'writing/what-does-a-person-need-to-supervise-an-ai-agent.html', phrase: 'ask or do less, rather than guess and do more',
    why: 'two pairs' },
  { file: 'writing/what-does-a-product-design-engineer-actually-do.html', phrase: 'a React and Storybook system',
    why: 'an apposition: one system built in two tools' },
  { file: 'writing/what-does-a-product-design-engineer-actually-do.html', phrase: 'each with its file and line',
    why: 'a pair after a clause' },
  { file: 'writing/what-is-a-product-designer-for-when-anyone-can-build.html', phrase: 'the guide I built and my sister keeps',
    why: 'an apposition with a relative clause' },
  { file: 'writing/what-is-a-product-designer-for-when-anyone-can-build.html', phrase: 'person or agent',
    why: 'a pair in apposition to "builder"' },
  { file: 'writing/what-makes-a-good-product-designer-now.html', phrase: 'person or agent',
    why: 'a pair in apposition to "builder"' },
  { file: 'writing/what-makes-a-good-product-designer-now.html', phrase: 'nothing that ends or reduces a subscription',
    why: 'a pair inside a clause' },
  { file: 'writing/what-makes-an-interface-feel-finished.html', phrase: 'motion as a duration and a curve',
    why: 'a pair: color as one thing, motion as another' },
  { file: 'writing/what-makes-an-interface-feel-finished.html', phrase: 'two solid black and the middle one',
    why: 'an absolute phrase on the drawing' },
  { file: 'writing/what-should-a-working-prototype-actually-prove.html', phrase: 'maybe a demo or three',
    why: 'an idiom, "a demo or three"' },
  { file: 'writing/who-decides-when-software-can-act-on-its-own.html', phrase: 'a large, reassuring button and puts',
    why: 'two adjectives, then a verb' },
  { file: 'writing/who-decides-when-software-can-act-on-its-own.html', phrase: 'with the AI, right or wrong',
    why: 'a pair after a clause' },
  { file: 'COLOR.md', phrase: 'the code rule and the list dash',
    why: 'polysyndeton: "and the list dash and the numbered caption spans"' },
  { file: 'COLOR.md', phrase: 'for the name, 6.43 and 6.50 for the',
    why: 'a pair of measurements after one' },
  { file: 'COLOR.md', phrase: 'built by hand, small and gray',
    why: 'a pair after a clause' },
  { file: 'COLOR.md', phrase: 'identical in lightness and nothing alike',
    why: 'a pair after the subject' },
  { file: 'COLOR.md', phrase: '74 one way and 73 the other',
    why: 'a pair: one way and the other' },
  { file: 'COLOR.md', phrase: 'on the light grounds, code and code',
    why: 'an apposition naming the two siblings' },
  { file: 'COLOR.md', phrase: 'two of them, code and code',
    why: 'an apposition naming the two' },
  { file: 'COLOR.md', phrase: 'a card or control filled slightly',
    why: 'an apposition defining "surface tint"' },
  { file: 'MOTION.md', phrase: '150ms as both code and code',
    why: 'two pairs, each "both A and B"' },
  { file: 'MOTION.md', phrase: '42ms a word, 12 and 30ms a stroke',
    why: 'a pair of measurements after one' },
  { file: 'MOTION.md', phrase: 'give it one or leave it as',
    why: 'an instruction after a clause' },
  { file: 'README.md', phrase: 'never merged there, code and code',
    why: 'an apposition naming the two branches' },
  { file: 'README.md', phrase: 'craft and code, enterprise and operational software',
    why: 'items that carry their own "and"' },
  { file: 'README.md', phrase: 'slate code for Systems and teams',
    why: 'a section named "Systems and teams"' },
  { file: 'README.md', phrase: 'butter yellow code and dusty rose code',
    why: 'an apposition naming the two colours' },
  { file: 'TYPOGRAPHY.md', phrase: 'section and subsection headings',
    why: 'one item in a list with no conjunction' },
  { file: 'TYPOGRAPHY.md', phrase: 'block and card titles',
    why: 'one item in a list with no conjunction' },
  { file: 'TYPOGRAPHY.md', phrase: '400 only, upright and italic',
    why: 'a pair: the two styles of one weight' },
  { file: 'TYPOGRAPHY.md', phrase: '500 nav and quiet labels',
    why: 'items that carry their own "and"' },
  { file: 'TYPOGRAPHY.md', phrase: '34px on a phone and 68px at 1280',
    why: 'a pair: the two ends of a ramp' },
  { file: 'TYPOGRAPHY.md', phrase: 'code and code loosened 1.1',
    why: 'a list of clauses with no conjunction' },
  { file: 'VOICE.md', phrase: 'phone, store and person',
    why: 'the rule quoting the form it forbids' },
  { file: 'llms.txt', phrase: 'paced spread by spread and proofed',
    why: 'the same sentence as the While We’re Here write-up' },
  { file: 'llms.txt', phrase: 'motion as a duration and a curve',
    why: 'a pair: color as one thing, motion as another' },
  { file: 'llms.txt', phrase: 'design systems that people and agents build from',
    why: 'a relative clause after a pair' },
  { file: 'llms.txt', phrase: 'worked through',
    why: 'a participle phrase on a credit, then a pair' },
  { file: 'llms.txt', phrase: 'one portal and Power BI platform',
    why: 'one item in a list that has its comma' },
];

/* --------------------------------------------------------------- sources -- */

function htmlPages(dir = root, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlPages(p, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(root, p));
  }
  return out.sort();
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–',
  hellip: '…', middot: '·', times: '×', rarr: '→', larr: '←', thinsp: ' ',
  hairsp: ' ', shy: '', zwj: '', eacute: 'é' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => (n in ENTITIES ? ENTITIES[n] : m));

/* Tags that end a run of text. Everything else is inline and joins its
   neighbours, so "<strong>phone</strong>, store and person" reads whole. */
const BLOCK = /^(?:p|li|ul|ol|h[1-6]|div|section|article|aside|header|footer|nav|main|figure|figcaption|blockquote|table|thead|tbody|tr|td|th|dl|dt|dd|br|hr|button|label|option|select|summary|details|title|form|input|textarea|picture|video|iframe|svg|body|head|html)$/i;

function htmlText(src) {
  const out = [];
  /* The head, and what a machine is told. */
  const title = src.match(/<title>([\s\S]*?)<\/title>/i);
  if (title) out.push(title[1]);
  for (const m of src.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const key = (tag.match(/\b(?:name|property)="([^"]+)"/i) || [])[1] || '';
    if (/^(?:description|og:|twitter:)/i.test(key) && !/:(?:image|url|type|card|site|creator|locale)/i.test(key)) {
      const c = tag.match(/\bcontent="([^"]*)"/i);
      if (c) out.push(c[1]);
    }
  }
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    let d;
    try { d = JSON.parse(m[1]); } catch { continue; }
    const walk = (v) => {
      if (typeof v === 'string') { if (/\s/.test(v) && !/^https?:/.test(v)) out.push(v); }
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(d);
  }
  /* The body, and what a reader meets. */
  const body = src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head\b[\s\S]*?<\/head>/i, '')
    .replace(/<(script|style|pre)\b[\s\S]*?<\/\1>/gi, '\n')
    /* Code is taken out but leaves a word behind, so "<code>a</code>,
       <code>b</code> and <code>c</code>" is still read as the list it is. */
    .replace(/<code\b[\s\S]*?<\/code>/gi, 'code');
  for (const m of body.matchAll(/\b(?:alt|aria-label)="([^"]*)"/gi)) out.push(m[1]);
  const text = body
    /* A close tag hard against an open one is two things set apart by the
       stylesheet -- a bold label and the line under it -- never one phrase. */
    .replace(/<\/[a-z][a-z0-9]*>(?=<[a-z])/gi, '\n')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (m, tag) => (BLOCK.test(tag) ? '\n' : ''));
  out.push(...text.split('\n'));
  return out.map((s) => decode(s));
}

function markdownText(src) {
  return src
    .replace(/^```[\s\S]*?^```/gm, '\n')
    .replace(/`[^`\n]*`/g, 'code')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\n\s*\n|\n(?=\s*(?:[-*]|\d+\.|\||#)\s)|\|/)
    .map((s) => s.replace(/[*_]{1,2}/g, ''));
}

/* The strings a share card prints, and the dek a variant writes. Read as
   source, not imported: og.mjs renders on import, and a check that launched
   Chrome to read a string would not be a one-second check. */
function registryText(file, keys) {
  const src = read(file);
  const re = new RegExp(`\\b(?:${keys.join('|')}):\\s*'((?:\\\\.|[^'\\\\])*)'`, 'g');
  return [...src.matchAll(re)].map((m) => m[1].replace(/<[^>]+>/g, ''));
}

const SOURCES = [];
for (const p of htmlPages()) SOURCES.push({ file: p, runs: () => htmlText(read(p)) });
for (const f of ['llms.txt', 'VOICE.md', 'README.md', 'TYPOGRAPHY.md', 'COLOR.md', 'SPACING.md', 'MOTION.md'])
  SOURCES.push({ file: f, runs: () => markdownText(read(f)) });
SOURCES.push({ file: 'scripts/og.mjs', runs: () => registryText('scripts/og.mjs', ['kicker', 'title', 'sub']) });
SOURCES.push({ file: 'scripts/variant.mjs', runs: () => registryText('scripts/variant.mjs', ['dek']) });

/* ------------------------------------------------------------- the match -- */

/* A word. A dot only inside one -- U.S., 4.93, COLOR.md -- never at its end,
   which is a sentence ending and not a word. */
const W = `[A-Za-z0-9](?:[\\w'’&/+-]|\\.(?=\\w))*`;
/* , ITEM and|or NEXT -- ITEM one to four words with no punctuation. */
const SERIES = new RegExp(`, ((?:${W} ){0,3}${W}) (and|or) (${W})((?: ${W}){0,2})`, 'g');

/* The cheap tests, before the allowlist. First, an item that opens on a
   word that opens a clause, or carries a verb that makes it one: "Below
   48px, space is fixed and comes from the scale." */
const CLAUSE = /^(?:and|or|but|so|yet|nor|which|who|whom|whose|that|then|because|when|where|whether|while|if|though|although|unless|until|since|as|both|either|neither|some|I|we|you|he|she|it|they|there|this|these|those|not|no|just|only|even|also|all|once|plus|almost|always|often|usually|mostly|sometimes|never)$/i;
const VERB = /^(?:is|are|was|were|be|been|being|am|has|have|had|do|does|did|can|could|will|would|should|may|might|must|isn’t|aren’t|wasn’t|doesn’t|don’t|didn’t|can’t|won’t|it’s|that’s|there’s)$/i;
/* An item that opens on a preposition is an adverbial far more often than a
   list -- ", before and after", ", at rest and in every state" -- so it
   counts only when the item before it opens on the same preposition: "in
   email, in print and in person". */
const PREP = /^(?:at|on|in|for|with|from|to|by|of|into|onto|over|under|before|after|without|within|across|through|between|beside|behind|around|about|against|along|among|toward|towards|like|per|via|than|then)$/i;
/* "four words or fewer", "once or twice", "more or less": the conjunction
   closes a pair, not a list. */
const PAIR_END = /^(?:fewer|more|less|so|not|never|two|twice|after|out|off|down|then|else)$/i;

const IRREGULAR = /^(?:built|made|done|seen|written|kept|set|held|told|run|read|cut|shown|given|taken|known|found|sent|left|brought|bought|thought|drawn|grown|hung|led|paid|put|shut|spent|struck|won|worn|broken|chosen|spoken|stolen|frozen|hidden|ridden|proven)$/i;
const PART = (w = '') => /..(?:ed|ing)$/i.test(w) || IRREGULAR.test(w);
const LEADS = (w = '') => /^(?:the|a|an|in|into|to|by|from|with|through|once|whether|on|for|of|at|its|their|his|her|my|our|your|it|them|him|me|us|since|across|over|under|up|out|down|off|back|away|as|so|like|than|together|what|how|why|where|when|which|who|whose|each|every)$/i.test(w) || /..ly$/i.test(w);

function findings(text) {
  const hits = [];
  for (const m of text.matchAll(SERIES)) {
    const [whole, item, , next] = m;
    const words = item.split(' ');
    if (CLAUSE.test(words[0]) || words.some((w) => VERB.test(w)) || PAIR_END.test(next)) continue;
    /* The item before the comma: back to the last mark that ends a phrase. */
    const before = text.slice(0, m.index);
    const start = Math.max(...[',', ';', ':', '. ', '! ', '? ', '(', ')', '—', '–', '"', '“', '”'].map((c) => {
      const i = before.lastIndexOf(c);
      return i < 0 ? -1 : i + c.length - 1;
    })) + 1;
    const prev = before.slice(start).trim();
    if (!prev) continue;
    /* An item that opens on a participle is usually a phrase hung off the
       sentence -- "the corner, taking the idea and making it", "real tasks,
       watched and measured" -- and only a list when the item before it is
       one too: "designed, built and illustrated", "stated in a sentence,
       sorted into an order and made tangible". So it is let go when it
       reads as a phrase (the participle, then a word that leads a phrase)
       or as a pair of participles, and the item before it carries none. */
    const pw = prev.split(' ');
    const parallel = PART(pw[0]) || PART(pw[pw.length - 1]);
    if (!parallel && PART(words[0]) &&
        ((words.length > 1 && LEADS(words[1])) || (words.length === 1 && PART(next)))) continue;
    if (PREP.test(words[0])) {
      const first = prev.split(' ').slice(-words.length - 1);
      if (!first.some((w) => w.toLowerCase() === words[0].toLowerCase())) continue;
    }
    hits.push(`${prev}${whole}`);
  }
  return hits;
}

/* ------------------------------------------------------------------- run -- */

const commit = () => {
  try {
    const sha = execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() ? ' (uncommitted changes)' : '';
    return `${sha}${dirty}`;
  } catch { return 'not a git checkout'; }
};

const pages = SOURCES.filter((s) => s.file.endsWith('.html')).length;
say(`oxford.mjs: ${root}, ${pages} pages and ${SOURCES.length - pages} documents, ${commit()}`);

for (const s of SOURCES) {
  if (!fs.existsSync(path.join(root, s.file))) {
    say(`\n  Cannot check: ${s.file} is missing.\n`);
    process.exit(2);
  }
}
if (pages < 5) {
  say(`\n  Cannot check: found ${pages} pages. The scan is wrong, not the site.\n`);
  process.exit(2);
}

const used = new Set();
const faults = [];
let runs = 0, series = 0;
for (const s of SOURCES) {
  const seen = new Set();
  let n = 0;
  for (const raw of s.runs()) {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    runs++; n++;
    for (const hit of findings(text)) {
      series++;
      if (seen.has(hit)) continue;
      seen.add(hit);
      const ok = ALLOW.find((a) => a.file === s.file && hit.includes(a.phrase));
      if (ok) { used.add(ok); continue; }
      faults.push({ file: s.file, hit });
    }
  }
  if (verbose) say(`    ${s.file}: ${n} runs of text`);
}

const dead = ALLOW.filter((a) => !used.has(a));

if (!faults.length && !dead.length) {
  say(`\n  ✓ every list of three carries its comma`);
  say(`    ${runs} runs of text across ${SOURCES.length} sources, ${series} candidate series, ` +
      `${ALLOW.length} allowed by name\n`);
  process.exit(0);
}

if (faults.length) {
  say(`\n  ✗ ${faults.length} ${faults.length === 1 ? 'series reads' : 'series read'} without the comma before "and" or "or":\n`);
  let last = '';
  for (const f of faults) {
    if (f.file !== last) say(`    ${f.file}`);
    last = f.file;
    say(`        ${f.hit}`);
  }
  say('\n  Put the comma in: "phone, store, and person." If the phrase is not a list --');
  say('  a clause, a name, items that carry their own commas -- reword it, or enter it');
  say('  in ALLOW in this file with one line saying why.\n');
}

if (dead.length) {
  say(`  ✗ ${dead.length} allowed ${dead.length === 1 ? 'phrase is' : 'phrases are'} no longer in the tree:\n`);
  for (const a of dead) say(`        ${a.file}: ${a.phrase}`);
  say('\n  Take the entry out. A list nobody prunes becomes a list nobody trusts.\n');
}

process.exit(1);
