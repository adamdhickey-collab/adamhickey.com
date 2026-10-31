#!/usr/bin/env node
/* Does every margin item in an article sit beside its text, and fit there?
 *
 *   node scripts/margins.mjs              every article
 *   node scripts/margins.mjs <page>       just the ones matching
 *   node scripts/margins.mjs --root <path>
 *
 * THE LAYOUT. From 72rem an article is two columns: the essay on its
 * measure, and a margin to its right that holds the scenes, the pull, the
 * splits and the Design psychology note, each a float (style.css, THE
 * MARGIN). A float takes no room from the text, so nothing in the
 * stylesheet can say where one lands against the words or how far it runs.
 * Only the rendered page can, so this measures at 1440.
 *
 * THE TWO RULES, which this file is the statement of.
 *
 *   - TOP. A margin item's top meets the first line of the paragraph after
 *     it in the source: within 16px below that paragraph's top, which is the
 *     float's --space-xs and a little. An item whose top lands lower is
 *     hanging under the end of a block, which is what the pull did while it
 *     followed its sentence (2026-10-31: 85 to 411px low on every article).
 *   - FIT. A section's text column is never left blank beside an item that
 *     ran on. An h2 clears the margin, so an item that outruns its section's
 *     text pushes the next heading down and leaves the column empty above it;
 *     a figure that spans both columns, and the end of the essay, do the same.
 *     Blank is where the block starts less where it would start with no float
 *     beside it, and more than one line of the essay's text fails: under a
 *     line reads as spacing, a line or more as a hole. Before this rule a
 *     picture beside the paragraph it names, late in a short section, left
 *     100 to 440px.
 *
 * The fix for a FIT failure is to move the item up its section, toward the
 * section's first paragraph, until it ends in time, and when two or three
 * items cannot all fit beside one section's text, to move one into a
 * neighboring section that argues the same thing and has room (on
 * 2026-10-31 a note, a split and two pulls went that way); the fix for a TOP failure
 * is to move it just ahead of the paragraph it should start beside. Both are
 * moves in the source, and the paragraph an item names is the place to start.
 *
 * Exit 0 when every item passes, 1 with the list when one does not, 2 when
 * there was nothing to measure, which is not a pass.
 */
import { findChrome, loadChromium, MEASURING, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';

const TOP = 16;

const root = resolveRoot('margins.mjs');
const only = pageFilters();
const say = (s = '') => console.log(s);

const targets = pages(root).filter((f) => f.startsWith('writing/') && f !== 'writing/index.html'
  && (!only.length || only.some((o) => f.includes(o))));
if (!targets.length) { say('\n  No article here.\n'); process.exit(2); }

const chromium = loadChromium('margins.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
const context = await browser.newContext({ ...MEASURING, reducedMotion: 'reduce' });

const faults = [];
let items = 0, measured = 0;
for (const f of targets) {
  const page = await context.newPage();
  await page.goto(`${origin}/${f}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const found = await page.evaluate(({ TOP }) => {
    const m = document.querySelector('.writing-progress ~ main .case-section .writing-measure');
    if (!m) return null;
    const BLANK = parseFloat(getComputedStyle(m.querySelector(':scope > p')).lineHeight);
    const kids = [...m.children];
    const cs = (el) => getComputedStyle(el);
    const isFloat = (el) => cs(el).float === 'right';
    const name = (el) => el.tagName === 'H2' ? `h2 "${el.textContent.trim().slice(0, 48)}"`
      : `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`;
    const what = (el) => el.classList.contains('writing-pull') ? `pull "${el.textContent.trim().slice(0, 40)}"`
      : el.querySelector('figcaption') ? `${name(el)} "${el.querySelector('figcaption').textContent.trim().slice(0, 40)}"`
      : name(el);
    const out = [];
    let count = 0;
    kids.forEach((el, i) => {
      if (!isFloat(el)) return;
      count++;
      const next = kids.slice(i + 1).find((k) => !isFloat(k));
      if (!next || next.tagName === 'H2' || cs(next).clear === 'both') {
        out.push(`${what(el)}: nothing to sit beside before ${next ? name(next) : 'the end'}`);
        return;
      }
      const d = el.getBoundingClientRect().top - next.getBoundingClientRect().top;
      if (d < 0 || d > TOP) out.push(`${what(el)}: top ${Math.round(d)}px from its paragraph's first line`);
    });
    // FIT: every block that clears, and the end of the column
    const ends = kids.map((el, i) => [el, i]).filter(([el]) => el.tagName === 'H2' || (!isFloat(el) && cs(el).clear !== 'none'));
    for (const [el, i] of ends) {
      const prev = kids.slice(0, i).reverse().find((k) => !isFloat(k));
      if (!prev) continue;
      const natural = prev.getBoundingClientRect().bottom + Math.max(parseFloat(cs(prev).marginBottom), parseFloat(cs(el).marginTop));
      const blank = el.getBoundingClientRect().top - natural;
      if (blank > BLANK) out.push(`${name(el)}: ${Math.round(blank)}px of blank column above it`);
    }
    const last = kids.slice().reverse().find((k) => !isFloat(k));
    const tail = m.getBoundingClientRect().bottom - (last.getBoundingClientRect().bottom + parseFloat(cs(last).marginBottom));
    if (tail > BLANK) out.push(`the end of the essay: ${Math.round(tail)}px of blank column`);
    return { count, out };
  }, { TOP });
  await page.close();
  if (!found) continue;
  measured++;
  items += found.count;
  for (const o of found.out) faults.push(`${f}  ${o}`);
}
await browser.close();
server.close();

say(`\n    ${items} margin items across ${measured} articles, at 1440`);
if (!measured) { say('\n  No article here has a margin to measure.\n'); process.exit(2); }
if (!faults.length) { say('\n  ✓ every margin item starts beside its paragraph and ends inside its section\n'); process.exit(0); }
say(`\n  ✗ ${faults.length} margin fault${faults.length === 1 ? '' : 's'}\n`);
for (const x of faults) say(`    ${x}`);
say('');
process.exit(1);
