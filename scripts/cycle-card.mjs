#!/usr/bin/env node
/* Agent Review's homepage card: the three ways to archive on the loop's
   dark panel, under one centered line that says what the page is about,
   each screen with a two-line label centered under it, none of them marked
   as chosen.

   Since the afternoon of 2026-10-27 each screen is a simplified drawing of
   the case study opener's five-customer list, the moment after Archive,
   in that list's colors (agent-review.css, "IN THE SCENES' COLORS"), so the
   card and the page it opens show one product. For a few hours before that
   they were white placeholders (#680). Before those the card was a drawing
   (#666), the three-directions scene (#672), the app's screens whole (#677)
   and each moment drawn in Relay's colors (#679).

     img/lab/agent-review-cycle-card.webp    2560 x 1440, the homepage card

   Every screen is 16:9, every label two lines, and the script refuses a
   label on one line or three, or a card that runs past its frame.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     python3 -m http.server 8000      # from the repository root, in another shell
     node scripts/cycle-card.mjs      # --from http://localhost:<port>/ */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const i = process.argv.indexOf('--from');
const from = (i > -1 ? process.argv[i + 1] : 'http://localhost:8000/').replace(/\/?$/, '/');
const OUT = 'img/lab/agent-review-cycle-card.webp';

/* Each screen is the case study opener's list of five customers a moment
   after Archive, drawn in that list's colors and shapes: the bar on warm,
   slate checks, the three active customers on the caution ground. Names are
   bars and statuses are wordless chips, so the only words are the bar's, at
   a size the card can print. */
const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5l2.5 2.5L12 5.5"/></svg>';
const undo = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5L2.5 6.5l3 3M2.5 6.5H10a3.5 3.5 0 010 7H7"/></svg>';
const CUSTOMERS = [['72%', true], ['64%', true], ['48%', false], ['80%', false, 'blocked'], ['56%', true]];
const rows = (mark) => CUSTOMERS.map(([w, active, blocked], n) => {
  const m = mark(n, active, blocked);
  return `<div class="tr${active && m.risk !== false ? ' active' : ''}${m.gone ? ' gone' : ''}">${m.box ?? ''}<i class="name" style="width:${w}"></i><i class="chip${m.chip ? ` ${m.chip}` : ''}"></i></div>`;
}).join('');
const box = (on) => `<i class="box${on ? ' on' : ''}">${on ? tick : ''}</i>`;

const WAYS = [
  { id: 'undo', label: 'Archive, with the option to undo',
    screen: `<div class="bar"><span>4 archived</span><b class="btn">${undo}Undo</b></div>
      ${rows((n, active, blocked) => (blocked ? { chip: 'stop', risk: false } : { gone: true, risk: false }))}` },
  { id: 'confirm', label: 'Confirm once, then archive',
    screen: `<div class="bar ask"><span>Archive all 5?</span><b class="btn go">Archive</b></div>
      ${rows(() => ({ box: box(true) }))}` },
  { id: 'review', label: 'Check each one, then archive',
    screen: `<div class="bar"><span>Check each</span><b class="btn go">Archive 3</b></div>
      ${rows((n, active, blocked) => (blocked ? { box: '<i class="box no"></i>', chip: 'stop' } : { box: box(n !== 1) }))}` },
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap">
<style>
  html, body { margin: 0; }
  body { width: 1280px; height: 720px; overflow: hidden; box-sizing: border-box; padding: var(--space-4xl);
    background: var(--color-charcoal); color: var(--ink-on-dark); font-family: var(--font-sans);
    display: grid; align-content: center; justify-items: center; gap: var(--space-4xl); text-align: center; }
  h1 { margin: 0; font-weight: var(--weight-semibold); font-size: var(--text-6xl); line-height: var(--leading-display); letter-spacing: var(--tracking-title); }
  h1 em { font-style: normal; color: var(--color-accent-on-dark); }
  .row { width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4xl); }
  figure { margin: 0; display: grid; align-content: start; gap: var(--space-xl); }
  figcaption { justify-self: center; max-width: 8.5em; font-size: var(--text-4xl); font-weight: var(--weight-semibold); line-height: var(--leading-display); letter-spacing: var(--tracking-title); }
  .screen { aspect-ratio: 16 / 9; overflow: hidden; display: flex; flex-direction: column; text-align: left;
    background: var(--color-white); border-radius: var(--radius-xl); color: var(--color-charcoal); }
  .screen svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .bar { flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--rule-hairline); background: var(--color-warm);
    font-size: var(--text-xl); font-weight: var(--weight-semibold); line-height: var(--leading-tight); }
  .bar.ask { background: var(--color-caution-light); }
  .btn { display: inline-flex; align-items: center; gap: var(--space-2xs); padding: 0 var(--space-xs);
    font-size: var(--text-lg); font-weight: var(--weight-semibold); border: 2px solid var(--color-charcoal); background: var(--color-white); }
  .btn svg { width: 1em; height: 1em; }
  .btn.go { border-color: var(--color-caution-text); color: var(--color-caution-text); }
  .tr { flex: 1; display: flex; align-items: center; gap: var(--space-sm); padding: 0 var(--space-md); border-top: 1px solid var(--rule-hairline); }
  .tr:first-of-type { border-top: 0; }
  .tr.active { background: var(--color-caution-light); }
  .tr.gone > * { visibility: hidden; }
  .tr.gone { background: repeating-linear-gradient(-45deg, transparent 0 var(--space-xs), var(--rule-hairline) 0 calc(var(--space-xs) + 1px)); }
  .box { flex: none; width: var(--space-lg); height: var(--space-lg); box-sizing: border-box; border: 2px solid var(--color-slate); color: var(--color-white); }
  .box.on { background: var(--color-slate); }
  .box.no { border-color: var(--color-rule); background: var(--color-warm); }
  .name { flex: none; height: var(--space-xs); border-radius: var(--radius-pill); background: var(--color-rule); max-width: 50%; }
  .chip { flex: none; margin-left: auto; width: var(--space-3xl); height: var(--space-lg); box-sizing: border-box; border-radius: var(--radius-pill);
    border: 1px solid var(--color-rule); background: var(--color-warm); }
  .tr.active .chip { border: 2px solid var(--color-caution-text); background: var(--color-white); }
  .chip.stop { border: 2px solid var(--color-caution-text); background: var(--color-caution-text); width: var(--space-4xl); }
</style></head><body>
  <h1>Three ways to archive. <em>One designer&rsquo;s call.</em></h1>
  <div class="row">${WAYS.map((w) => `<figure>
      <div class="screen">${w.screen}</div>
      <figcaption>${w.label}</figcaption>
    </figure>`).join('')}</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: CHROME });
try {
  const card = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const p = await card.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const problems = await p.evaluate(() => [
    ...[...document.querySelectorAll('.screen')].filter((s) => s.scrollHeight > s.clientHeight + 0.5).map((s, n) => `screen ${n + 1} runs past its 16:9 frame`),
    ...[...document.querySelectorAll('figcaption')].filter((c) => Math.round(c.getBoundingClientRect().height / parseFloat(getComputedStyle(c).lineHeight)) !== 2).map((c) => `"${c.textContent}" is not two lines`),
    ...(document.body.scrollHeight > 720 ? ['the card runs past 720px'] : []),
  ]);
  if (problems.length) throw new Error(problems.join('\n'));
  const file = path.join(ROOT, OUT);
  fs.writeFileSync(file, await p.screenshot({ type: 'webp', quality: 90 }));
  console.log(`${OUT}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  await card.close();
} finally {
  await browser.close();
}
