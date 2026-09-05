#!/usr/bin/env node
/* Every rendered type size on every page, measured against the scale.
 *
 * TYPOGRAPHY.md §2 says it plainly: "Every type size on the site is one of
 * these. There are no others." The design system page says the same thing in
 * the past tense -- seven passes in, it is done. Nothing ran that claim against
 * the site. It was believed because it was written down, and it was wrong: the
 * glance block on the three build write-ups carried 13, 15 and 17px by hand,
 * none of them a step, on pages the claim explicitly covered.
 *
 * Same idiom as states.mjs: one loopback server, one Chromium, nothing off this
 * machine. Exit 0 when every rendered size is on the scale, 1 with the list
 * when it is not, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/typescale.mjs            every page
 *   node scripts/typescale.mjs lucy       just the pages whose path matches
 */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('typescale.mjs');
const only = pageFilters();

/* TYPOGRAPHY.md §2. Fourteen steps, 11px to 80px, base 16. */
const STEPS = [11, 12, 14, 16, 18, 20, 24, 28, 34, 40, 48, 56, 68, 80];

/* One ramp is deliberately off the scale, and the design system page argues for
   it at length: --type-title-inset runs 36 -> 64 because the homepage hero is
   sized against the 47% column it shares with the portrait, not against the
   page. It is a declared token, not a hand-written size, so it is allowed here
   by name. Anything else off the scale is the thing this script looks for. */
const RAMP_EXCEPTIONS = new Map([[36, '--type-title-inset floor'], [64, '--type-title-inset ceiling']]);

/* The ramps interpolate, so between their endpoints a fluid size is off-step by
   construction and measuring there would report the design working as intended.
   The claim can only hold where every clamp is pinned: at or below the 25rem
   floor, at or above the 80rem ceiling. --type-title-inset pins at 1280 too. */
const WIDTHS = [375, 400, 1280, 1440];

const say = (s = '') => console.log(s);

const chromium = loadChromium('typescale.mjs');

/* Served over HTTP for the same reason states.mjs does it: a file:// page is
   its own opaque origin and the cascade becomes unreadable. */
const { server, origin } = await serve(root);

const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
/* Webfonts do not set font-size; blocking them makes the run hermetic and stops
   it hanging on a machine with no route to Google Fonts. */
await ctx.route(/^https?:/, r =>
  new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await ctx.newPage();

/* ---------------------------------------------------------------------------
 * Everything below this line runs inside the page.
 * ------------------------------------------------------------------------- */
const IN_PAGE = String.raw`
(() => {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    /* Artwork is not interface. COLOR.md exempts the aria-hidden illustration
       scenes from the palette rule for the same reason it applies here: a glyph
       a screen reader never announces is decoration, and .product-link-ext is
       deliberately the site's one relative size, sized to track whatever link
       it is set in. Measuring it would report that decision as a defect. */
    if (el.closest('svg') || el.closest('[aria-hidden="true"]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    /* font-size is inherited, so every element has one whether or not it shows
       type. Only elements with their own non-empty text node render a size. */
    let text = '';
    for (const n of el.childNodes) if (n.nodeType === 3) text += n.data;
    if (!text.trim()) continue;
    out.push({
      px: Math.round(parseFloat(cs.fontSize) * 100) / 100,
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').split(' ')[0] || '',
      sample: text.trim().slice(0, 32),
    });
  }
  return out;
})()`;

const chosen = pages(root).filter(f => !only.length || only.some(o => f.includes(o)));
if (!chosen.length) {
  console.error(`\n  No page matches ${only.join(', ')}.\n`);
  server.close(); await browser.close();
  process.exit(2);
}

const off = new Map();
let measured = 0;
let allowedByRamp = 0;

for (const rel of chosen) {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.goto(`${origin}/${rel}`, { waitUntil: 'domcontentloaded' });
    const rows = await page.evaluate(IN_PAGE);
    if (!rows.length) {
      say(`\n  ${rel} rendered no measurable text at ${w}px. Cannot tell whether it conforms.\n`);
      server.close(); await browser.close();
      process.exit(2);
    }
    for (const r of rows) {
      measured++;
      if (STEPS.includes(r.px)) continue;
      if (RAMP_EXCEPTIONS.has(r.px)) { allowedByRamp++; continue; }
      if (!off.has(r.px)) off.set(r.px, { count: 0, pages: new Set(), widths: new Set(), example: r });
      const e = off.get(r.px);
      e.count++; e.pages.add(rel); e.widths.add(w);
    }
  }
}

server.close();
await browser.close();

const widths = WIDTHS.join(', ');
if (!off.size) {
  say(`\n  ✓ every rendered type size is on the scale`);
  say(`    ${measured} measured across ${chosen.length} pages at ${widths}px` +
      (allowedByRamp ? `, plus ${allowedByRamp} on --type-title-inset` : '') + '\n');
  process.exit(0);
}

say(`\n  ${measured} rendered sizes measured across ${chosen.length} pages at ${widths}px.`);
say(`\n  ${off.size} size${off.size === 1 ? ' is' : 's are'} on no step of the scale:\n`);
for (const [px, e] of [...off].sort((a, b) => a[0] - b[0])) {
  const near = STEPS.reduce((a, b) => Math.abs(b - px) < Math.abs(a - px) ? b : a);
  say(`    ${px}px  ×${e.count}  at ${[...e.widths].join('/')}px  —  nearest step ${near}px`);
  say(`        ${e.example.tag}${e.example.cls ? '.' + e.example.cls : ''}  "${e.example.sample}"`);
  say(`        ${[...e.pages].slice(0, 4).join(', ')}` +
      (e.pages.size > 4 ? ` +${e.pages.size - 4} more` : ''));
}
say('\n  Either the size moves onto a step, or the scale gains one and');
say('  TYPOGRAPHY.md §2 says so. A third option is not on the table.\n');
process.exit(1);
