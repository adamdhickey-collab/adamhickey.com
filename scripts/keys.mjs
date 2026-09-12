#!/usr/bin/env node
/**
 * keys.mjs -- the key ideas of each article, generated from its headings.
 *
 *   node scripts/keys.mjs            check: every list, eyebrow and count matches the h2s
 *   node scripts/keys.mjs --write    regenerate them
 *   node scripts/keys.mjs --root <path>
 *
 * A Blinked article carries its argument three times: as the h2s down the
 * page, as the numbered list of key ideas under the dek, and as the "Key
 * idea 2 of 6" eyebrow over each section. Three copies of one thing drift,
 * so two of them are written by this script from the third. The h2 is the
 * source: its text is the list entry, its position is the eyebrow's number,
 * and its id is the link between them. Edit the heading, run --write, and
 * the list and the eyebrows follow. The index gets the count the same way:
 * "6 ideas · 6 min read" beside each entry, the ideas from the h2s and the
 * minutes from the article's own kicker.
 *
 * The check is the same question seo.mjs asks of the sitemap: is what the
 * page says about itself what the page is. A heading reworded without a
 * --write is a red check, on purpose, because a list that names a section
 * the page no longer has is the exact thing a reader would notice and a
 * script would not.
 *
 * What it edits, and only this:
 *   - the `id` attribute on each h2 in an article's main, if it has none
 *   - the <p class="writing-eyebrow"> immediately before each h2
 *   - the block between <!-- keys:start --> and <!-- keys:end --> in the hero
 *     (inserted after the dek if the markers are missing)
 *   - the <p class="writing-meta"> of each entry on the index
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const rootIdx = args.indexOf('--root');
const ROOT = resolve(rootIdx >= 0 ? args[rootIdx + 1] : process.cwd());
const DIR = resolve(ROOT, 'writing');

const say = (s) => process.stdout.write(`${s}\n`);
const commit = () => {
  try {
    const sha = execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() ? ' (uncommitted changes)' : '';
    return `${sha}${dirty}`;
  } catch { return 'not a git checkout'; }
};

const articles = readdirSync(DIR).filter((f) => f.endsWith('.html') && f !== 'index.html').sort();
say(`keys.mjs: ${ROOT}, ${articles.length} articles, ${commit()}`);

/* The heading's text as a list entry: tags out, entities kept, whitespace
   folded, because the entry is HTML and the heading already is. */
const inner = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/* The id: the text with its entities decoded to nothing, lowercased, hyphened. */
const slug = (html) => inner(html).replace(/&[a-z]+;|&#\d+;/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const faults = [];
const fault = (f, msg) => faults.push(`${f}: ${msg}`);

const ideas = new Map(); // slug -> { count, minutes }

for (const f of articles) {
  const path = resolve(DIR, f);
  const src = readFileSync(path, 'utf8');
  const mainStart = src.indexOf('<main id="main">');
  const mainEnd = src.indexOf('</main>');
  if (mainStart < 0 || mainEnd < 0) { fault(f, 'no <main id="main">'); continue; }
  let main = src.slice(mainStart, mainEnd);

  /* 1. Every h2 gets an id. */
  const heads = [];
  main = main.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (m, attrs = '', body) => {
    const idm = attrs.match(/\sid="([^"]+)"/);
    const id = idm ? idm[1] : slug(body);
    const rest = attrs.replace(/\sid="[^"]+"/, '');
    heads.push({ id, text: inner(body) });
    return `<h2 id="${id}"${rest}>${body}</h2>`;
  });
  if (!heads.length) { fault(f, 'no h2 in main'); continue; }
  const M = heads.length;

  /* 2. The eyebrow before each h2, numbered. Any eyebrow already there comes
     out first, so the pass is the same whether it is the first run or the
     fortieth; the h2's own indentation is the eyebrow's. */
  main = main.replace(/[ \t]*<p class="writing-eyebrow">[^<]*<\/p>\n(?=[ \t]*<h2 id=")/g, '');
  let n = 0;
  main = main.replace(/^([ \t]*)(<h2 id=")/gm, (m, indent, h2) => {
    n += 1;
    return `${indent}<p class="writing-eyebrow">Key idea ${n} of ${M}</p>\n${indent}${h2}`;
  });

  /* 3. The list under the dek. */
  const list = [
    '<!-- keys:start -->',
    '<!-- The key ideas, one per section, written by scripts/keys.mjs from the',
    '     h2s below. Edit the heading, not this list; `node scripts/keys.mjs',
    '     --write` regenerates it and the eyebrows. -->',
    '<nav class="writing-keys" aria-labelledby="writing-keys-label">',
    '  <p class="writing-keys-label" id="writing-keys-label">In this article</p>',
    '  <ol>',
    ...heads.map((h) => `    <li><a href="#${h.id}">${h.text}</a></li>`),
    '  </ol>',
    '</nav>',
    '<!-- keys:end -->',
  ];
  const keysRe = /([ \t]*)<!-- keys:start -->[\s\S]*?<!-- keys:end -->/;
  if (keysRe.test(main)) {
    main = main.replace(keysRe, (m, indent) => list.map((l) => indent + l).join('\n'));
  } else {
    const dek = main.match(/([ \t]*)<p class="build-dek">[\s\S]*?<\/p>\n/);
    if (!dek) { fault(f, 'no <p class="build-dek"> to put the key ideas under'); continue; }
    const indent = dek[1];
    main = main.replace(dek[0], dek[0] + list.map((l) => indent + l).join('\n') + '\n');
  }

  const minutes = (src.match(/<p class="case-kicker">Writing &middot; (\d+) min read<\/p>/) || [])[1];
  if (!minutes) fault(f, 'no "Writing · N min read" kicker to take the minutes from');
  ideas.set(basename(f, '.html'), { count: M, minutes });

  const next = src.slice(0, mainStart) + main + src.slice(mainEnd);
  if (next !== src) {
    if (WRITE) { writeFileSync(path, next); say(`  wrote ${f}: ${M} key ideas`); }
    else fault(f, `key ideas, eyebrows or ids are out of step with its ${M} h2s; \`node scripts/keys.mjs --write\``);
  } else {
    say(`  ok    ${f}: ${M} key ideas`);
  }
}

/* 4. The index: "N ideas · M min read" per entry. */
{
  const path = resolve(DIR, 'index.html');
  const src = readFileSync(path, 'utf8');
  let next = src;
  for (const [s, { count, minutes }] of ideas) {
    const re = new RegExp(`(<a class="writing-link" href="${s}\\.html">[\\s\\S]*?<p class="writing-meta">)[^<]*(<\\/p>)`);
    if (!re.test(next)) { fault('index.html', `no entry for ${s}.html`); continue; }
    next = next.replace(re, `$1${count} ideas &middot; ${minutes} min read$2`);
  }
  if (next !== src) {
    if (WRITE) { writeFileSync(path, next); say('  wrote index.html: idea counts'); }
    else fault('index.html', 'idea counts are out of step with the articles; `node scripts/keys.mjs --write`');
  } else {
    say('  ok    index.html: idea counts');
  }
}

if (faults.length) {
  say('');
  for (const m of faults) say(`  FAULT ${m}`);
  say(`\n${faults.length} fault${faults.length === 1 ? '' : 's'}`);
  process.exit(1);
}
say(`\nevery list, eyebrow and count matches its headings`);
