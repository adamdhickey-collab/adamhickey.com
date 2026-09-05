#!/usr/bin/env node
/* A border on a curved surface either follows the whole curve, or is not there.
 *
 * WHAT THIS IS ABOUT. The design system page marked the section you were
 * reading with a 2px rule down the left of the nav item. The item has a 6px
 * radius, so the rule ran straight into the corner and stopped: not an edge of
 * the shape, but a bar that had been clipped by it. At a glance it reads as a
 * rendering fault rather than a decision, which is the worst thing a state
 * marker can do -- it draws the eye for the wrong reason.
 *
 * The rule is narrow and worth stating exactly, because the pattern either side
 * of it is fine. A border on ALL four sides of a rounded box follows the curve
 * and is correct; that is what the code specimens use. A border on ONE side of
 * a SQUARE box is a rule, and also correct; that is what .ds-rules uses down
 * the left of each entry, and it looks deliberate because nothing curves away
 * from it. What does not work is the combination: a partial border on a rounded
 * box, where the border has to stop short of a corner that is still visibly
 * turning.
 *
 * WHY IT IS RENDERED RATHER THAN READ. Grepping the stylesheet finds the case
 * where one rule sets both, and misses every case where it takes two: a base
 * rule with the radius, a state rule adding the border. The nav was exactly
 * that shape -- .ds-side-link carried border-radius and a transparent
 * border-left, and .is-active only supplied the color. Computed style is the
 * only place the two are ever in the same room.
 *
 * States are forced, not just measured at rest, for the same reason states.mjs
 * exists: the offending border here was on .is-active, and a resting scan of a
 * page whose scroll position had not reached that section would have found
 * nothing and said so confidently.
 *
 * Exit 0 when no rounded box carries a partial border, 1 with the list when one
 * does, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/curves.mjs            every page
 *   node scripts/curves.mjs <page>     just the ones matching
 */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('curves.mjs');
const only = pageFilters();
const say = (s = '') => console.log(s);

let chromium;
try { ({ chromium } = await import('playwright-core')); }
catch { say('\n  Cannot measure: playwright-core is not installed.\n'); say('    npm i --no-save playwright-core\n'); process.exit(2); }

const { server, origin } = await serve(root);

const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route(/^https?:/, r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await ctx.newPage();

/* A side counts as drawn only if it has width, a style, and a color that is
   not fully transparent. The nav reserved its space with a transparent
   border-left for years without ever showing one, and flagging that would be
   reporting the absence of the defect. */
const IN_PAGE = String.raw`
(() => {
  const out = [];
  const SIDES = ['Top', 'Right', 'Bottom', 'Left'];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const radii = ['borderTopLeftRadius','borderTopRightRadius',
                   'borderBottomLeftRadius','borderBottomRightRadius'].map(k => parseFloat(cs[k]) || 0);
    if (!radii.some(r => r > 0)) continue;
    const drawn = SIDES.filter(s =>
      (parseFloat(cs['border' + s + 'Width']) || 0) > 0 &&
      cs['border' + s + 'Style'] !== 'none' &&
      cs['border' + s + 'Color'] !== 'transparent' &&
      !/^rgba\(.*,\s*0\)$/.test(cs['border' + s + 'Color']));
    if (drawn.length === 0 || drawn.length === 4) continue;
    out.push({
      sel: el.tagName.toLowerCase() +
           (typeof el.className === 'string' && el.className
             ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
      sides: drawn.join('+'),
      radius: Math.max(...radii),
      width: parseFloat(cs['border' + drawn[0] + 'Width']),
    });
  }
  return out;
})()`;

/* Every class the site uses to mean "this one is current". The offending
   border lived on one of these, so measuring only the resting page would
   have depended on where the scroll happened to be. */
const FORCE = `document.querySelectorAll('a,button,summary,li,[tabindex]').forEach(function (e) {
  try { e.classList.add('is-active', 'is-open', 'is-current', 'active'); } catch (x) {}
});`;

const chosen = pages(root).filter(f => !only.length || only.some(o => f.includes(o)));
if (!chosen.length) { console.error(`\n  No page matches ${only.join(', ')}.\n`); server.close(); await browser.close(); process.exit(2); }

const found = new Map();
let scanned = 0, elements = 0;
for (const rel of chosen) {
  await page.goto(`${origin}/${rel}`, { waitUntil: 'domcontentloaded' });
  const rest = await page.evaluate(IN_PAGE);
  elements += await page.evaluate(`document.querySelectorAll('body *').length`);
  await page.evaluate(FORCE);
  const forced = await page.evaluate(IN_PAGE);
  scanned++;
  for (const r of [...rest, ...forced]) {
    const key = `${r.sel}|${r.sides}`;
    if (!found.has(key)) found.set(key, { ...r, pages: new Set() });
    found.get(key).pages.add(rel);
  }
}
server.close();
await browser.close();

if (!found.size) {
  say(`\n  ✓ no rounded surface carries a partial border`);
  say(`    ${elements} elements across ${scanned} pages, at rest and with states forced\n`);
  process.exit(0);
}

say(`\n  ${elements} elements across ${scanned} pages, at rest and with states forced.`);
say(`\n  ${found.size} rounded ${found.size === 1 ? 'surface carries' : 'surfaces carry'} a partial border:\n`);
for (const [, r] of found) {
  say(`    ${r.sel}`);
  say(`        border-${r.sides} at ${r.width}px, against a ${r.radius}px radius`);
  say(`        ${[...r.pages].slice(0, 4).join(', ')}${r.pages.size > 4 ? ` +${r.pages.size - 4} more` : ''}`);
}
say('\n  Either the border goes round all four sides and follows the curve, or the');
say('  radius goes and it becomes a rule on a square edge. A border that stops');
say('  at a corner still turning reads as a clipping fault, not a decision.\n');
process.exit(1);
