#!/usr/bin/env node
/* Does every read time say what its page takes?
 *
 *   node scripts/readtime.mjs              check every page that states one
 *   node scripts/readtime.mjs <page>       just that page
 *   node scripts/readtime.mjs --write      rewrite the labels that are off
 *   node scripts/readtime.mjs --root <path>
 *
 * THE RULE, which this file is the statement of. The words a reader meets in
 * <main> at 238 a minute, plus the pictures a reader stops to look at, rounded
 * to the nearest minute and never under one.
 *
 *   - Words are main's innerText at 1440 wide, split on white space, counting
 *     a token only if it holds a letter or a digit. Captions, tables, a number
 *     row and the words drawn into a figure in code all count: a reader reads
 *     them. Taken out first: the site and section navigation, the Related
 *     list, the contact ask, the "Continue reading" foot, anything visually
 *     hidden and anything aria-hidden (a pull quote repeats a line already
 *     counted). A closed disclosure is not counted, because a reader opens it
 *     or does not; innerText leaves it out on its own.
 *   - 238 is silent reading of non-fiction (Brysbaert, 2019), and it is the
 *     rate #355 set every label to on 2026-10-02.
 *   - A picture is an <img> with alt text, so a screenshot, a photograph or a
 *     drawing that carries something, and not the decorative tiles of a rail,
 *     whose alt is empty and whose words are the page's own text. It costs 12
 *     seconds for the first, a second less for each after, and 3 from the
 *     tenth on, which is Medium's allowance and the one most readers have
 *     met. Until 2026-10-22 the labels counted words alone, and Agent Review,
 *     at about 1,530 words and ten interface screenshots, said 6 minutes for
 *     a page that takes 8.
 *
 * 1440 because that is MEASURING's width, and because the build write-ups'
 * glance points show from there and fold away on a phone. A phone reader
 * meets about a tenth fewer words on those five pages and the same number on
 * every other.
 *
 * WHY RENDERED. The words a reader meets are not the words in the file: the
 * Tailwind case studies carry the site's navigation inside <main>, the glance
 * points hide under 640, a closed disclosure hides its body, and a pull quote
 * is in the markup twice. Counting the file would count all of that.
 *
 * What it edits, and only this: the number in a page's
 * <p class="case-kicker">...N min read</p> or <span class="case-readtime">N
 * min read</span>. The writing index's "N ideas · M min read" is keys.mjs's,
 * taken from the kickers, so run `node scripts/keys.mjs --write` after a
 * --write here, and `node scripts/seo.mjs --write` for the dates.
 */

import fs from 'node:fs';
import path from 'node:path';
import { AT_REST, findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';

const RATE = 238;
const pictureSeconds = (n) => { let s = 0; for (let i = 0; i < n; i++) s += Math.max(12 - i, 3); return s; };

/* Pages whose read time is an example of the component, not a claim about
   the page it sits on. */
const SPECIMENS = new Set(['design-system/index.html']);

/* What a reader does not read, inside <main>. */
const SKIP = [
  'nav.site-nav', 'nav.case-toc', 'nav.related',
  'footer', '.case-ask',
  '.visually-hidden', '.sr-only', '[aria-hidden="true"]',
].join(', ');

const LABEL = /(<p class="case-kicker">[^<]*?|<span class="case-readtime">)(\d+)( min read)/;

const WRITE = process.argv.includes('--write');
const root = resolveRoot('readtime.mjs');
const only = pageFilters();
const say = (s = '') => console.log(s);

const targets = pages(root).filter((f) => !SPECIMENS.has(f)
  && (!only.length || only.some((o) => f.includes(o)))
  && LABEL.test(fs.readFileSync(path.join(root, f), 'utf8')));
if (!targets.length) { say('\n  No page here states a read time.\n'); process.exit(2); }

const chromium = loadChromium('readtime.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
const context = await browser.newContext(AT_REST);

const rows = [];
for (const f of targets) {
  const page = await context.newPage();
  await page.goto(`${origin}/${f}`, { waitUntil: 'load' });
  const { words, pictures } = await page.evaluate((skip) => {
    const main = document.querySelector('main');
    for (const e of main.querySelectorAll(skip)) e.style.setProperty('display', 'none', 'important');
    const words = main.innerText.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
    const pictures = [...main.querySelectorAll('img')]
      .filter((i) => (i.getAttribute('alt') || '').trim() && i.getBoundingClientRect().width > 0).length;
    return { words, pictures };
  }, SKIP);
  await page.close();

  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const stated = Number(src.match(LABEL)[2]);
  const exact = words / RATE + pictureSeconds(pictures) / 60;
  const minutes = Math.max(1, Math.round(exact));
  rows.push({ f, words, pictures, exact, minutes, stated });
  if (WRITE && minutes !== stated) fs.writeFileSync(path.join(root, f), src.replace(LABEL, `$1${minutes}$3`));
}
await browser.close();
server.close();

say('');
for (const r of rows) {
  const mark = r.minutes === r.stated ? '✓' : WRITE ? '→' : '✗';
  const was = r.minutes === r.stated ? '' : `, says ${r.stated}`;
  say(`  ${mark} ${String(r.minutes).padStart(2)} min  ${r.f}  (${r.words.toLocaleString('en-US')} words, ${r.pictures} picture${r.pictures === 1 ? '' : 's'}: ${r.exact.toFixed(2)}${was})`);
}
const off = rows.filter((r) => r.minutes !== r.stated);
say(`\n    ${rows.length} read times, at ${RATE} words a minute plus the pictures`);
if (!off.length) { say('\n  ✓ every read time says what its page takes\n'); process.exit(0); }
if (WRITE) {
  say(`\n  wrote ${off.length}; now \`node scripts/keys.mjs --write\` and \`node scripts/seo.mjs --write\`\n`);
  process.exit(0);
}
say(`\n  ✗ ${off.length} read time${off.length === 1 ? '' : 's'} off; \`node scripts/readtime.mjs --write\`\n`);
process.exit(1);
