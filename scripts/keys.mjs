#!/usr/bin/env node
/**
 * keys.mjs -- every article's headings, and the read time the index shows.
 *
 *   node scripts/keys.mjs            check
 *   node scripts/keys.mjs --write    fix what it can
 *   node scripts/keys.mjs --root <path>
 *
 * Until 2026-10-30 most articles were Blinks: the argument carried three
 * times, as the h2s, as a numbered list of key ideas under the dek, and as
 * a "Key idea 2 of 6" eyebrow over each section, with a recap at the end.
 * This script wrote the list and the eyebrows from the h2s so the three
 * could not drift. #897 took the frame off three personal essays; on
 * 2026-10-30 it came off the rest, when the four articles in The system
 * and The judgment became two. The frame added a list, an eyebrow per
 * section and a recap to every page for articles a reader finishes in five
 * minutes, and every one of them is an essay now.
 *
 * What it does now, and only this:
 *   - gives each h2 in an article's main an `id`, if it has none, so a
 *     section can still be linked to
 *   - takes out any key-ideas list, eyebrow or recap that comes back, and
 *     faults one on a check
 *   - writes the <p class="writing-meta"> of each entry on the index, "5 min
 *     read", from the article's own kicker
 *
 * The index is held to listing every article, so an article cannot be
 * added at an address without a door on the index, and a forwarding note
 * is not an article (lib/harness.mjs).
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

/* A forwarding note is an old address, not an article (lib/harness.mjs). */
const articles = readdirSync(DIR).filter((f) => f.endsWith('.html') && f !== 'index.html'
  && !/<meta http-equiv="refresh"/i.test(readFileSync(resolve(DIR, f), 'utf8'))).sort();
say(`keys.mjs: ${ROOT}, ${articles.length} articles, ${commit()}`);

/* The heading's text as a list entry: tags out, entities kept, whitespace
   folded, because the entry is HTML and the heading already is. */
const inner = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/* The id: the text with its entities decoded to nothing, lowercased, hyphened. */
const slug = (html) => inner(html).replace(/&[a-z]+;|&#\d+;/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const faults = [];
const fault = (f, msg) => faults.push(`${f}: ${msg}`);

const minutesOf = new Map(); // slug -> minutes

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

  /* 2. No eyebrow over a section, no list under the dek, no recap. */
  main = main.replace(/[ \t]*<p class="writing-eyebrow">[^<]*<\/p>\n(?=[ \t]*<h2 id=")/g, '');
  main = main.replace(/[ \t]*<!-- keys:start -->[\s\S]*?<!-- keys:end -->\n/, '');
  if (/class="writing-recap"/.test(main)) fault(f, 'an article carries no recap; take the "In one breath" aside out');

  const minutes = (src.match(/<p class="case-kicker">Writing &middot; (\d+) min read<\/p>/) || [])[1];
  if (!minutes) fault(f, 'no "Writing · N min read" kicker to take the minutes from');
  minutesOf.set(basename(f, '.html'), minutes);

  const next = src.slice(0, mainStart) + main + src.slice(mainEnd);
  if (next !== src) {
    if (WRITE) { writeFileSync(path, next); say(`  wrote ${f}: ids, no key ideas or eyebrows`); }
    else fault(f, 'an h2 without an id, or a key-ideas list or eyebrow; `node scripts/keys.mjs --write`');
  } else {
    say(`  ok    ${f}: ${heads.length} sections`);
  }
}

/* 4. The index: "M min read" per entry. */
{
  const path = resolve(DIR, 'index.html');
  const src = readFileSync(path, 'utf8');
  let next = src;
  for (const [s, minutes] of minutesOf) {
    const re = new RegExp(`(<a class="writing-link" href="${s}\\.html">[\\s\\S]*?<p class="writing-meta">)[^<]*(<\\/p>)`);
    if (!re.test(next)) { fault('index.html', `no entry for ${s}.html`); continue; }
    next = next.replace(re, `$1${minutes} min read$2`);
  }
  if (next !== src) {
    if (WRITE) { writeFileSync(path, next); say('  wrote index.html: read times'); }
    else fault('index.html', 'read times are out of step with the articles; `node scripts/keys.mjs --write`');
  } else {
    say('  ok    index.html: read times');
  }
}

if (faults.length) {
  say('');
  for (const m of faults) say(`  FAULT ${m}`);
  say(`\n${faults.length} fault${faults.length === 1 ? '' : 's'}`);
  process.exit(1);
}
say(`\nevery article is an essay, and every read time on the index is its article's`);
