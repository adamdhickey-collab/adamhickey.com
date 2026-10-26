#!/usr/bin/env node
/* Agent Review's card since 2026-10-25, when the prototype became a design
   cycle: the three working archive screens from Explore, side by side on
   the loop's dark panel, each cut to the top of its screen, where the line
   that makes it different sits (the undo bar, the question, the review),
   the one Alex chose marked, under one
   line that says what the page is about. Until 2026-10-26 they were real
   captures; they are drawn now (below).

   Two sizes from one composition, both at 2x:
     img/lab/agent-review-cycle-card.webp    1280 x 720, the lab index's card
     img/lab/agent-review-cycle-share.webp   1200 x 630, og.mjs's `full` for the case study

   The colours and type are the site's tokens, read from
   color.css and type.css, so nothing here is a value of its own.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     python3 -m http.server 8000      # from the repository root, in another shell
     node scripts/cycle-card.mjs      # or --from http://localhost:<port>/ */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const i = process.argv.indexOf('--from');
const from = (i > -1 ? process.argv[i + 1] : 'http://localhost:8000/').replace(/\/?$/, '/');

const SIZES = [
  { out: 'img/lab/agent-review-cycle-card.webp', width: 1280, height: 720 },
  { out: 'img/lab/agent-review-cycle-share.webp', width: 1200, height: 630 },
];

/* The three screens are drawn, not captured, since 2026-10-26 (Adam: more
   conceptual, simpler, each a screen of its own with the case for it
   under it). Each is a customer list cut to five rows of grey bars, so the
   one thing that differs reads first: the Undo after the press, the
   question before it, the batch laid out to choose from. The words on
   them are the prototype's (agent-review src/data/cycle.ts); under each
   is its name and one line on its main advantage (Adam, 2026-10-26: a gain
   and a cost under each made the card busy; the case study carries both). The title is centered
   in the sans, and the screens take the width (Adam: much larger). */
// One row per customer: a box and a grey bar for the name. Each string in
// `kinds` is that row's state: '' plain, 'on' ticked, 'gone' archived,
// 'risk' an active customer, left unticked and named.
const rows = (kinds) => kinds.map((k, n) =>
  `<div class="r ${k}"><i></i><b style="width:${[62, 48, 70, 54, 44, 58, 50][n]}%"></b>${k === 'risk' ? '<em>Active</em>' : ''}</div>`).join('');

const screen = (body, bar = '<span class="btn">Archive</span>') =>
  `<div class="shot"><div class="top"><span>Customers</span>${bar}</div><div class="list">${body}</div></div>`;

const page = (w, h) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text&family=Montserrat:wght@500;600&display=swap">
<style>
  html, body { margin: 0; }
  body { width: ${w}px; height: ${h}px; overflow: hidden; background: var(--color-charcoal); color: var(--ink-on-dark);
    font-family: var(--font-sans); display: grid; align-content: center; box-sizing: border-box; padding: var(--space-3xl) var(--space-4xl); }
  /* The title is the sans, so it reads apart from the serif headline the
     card sets beside it; the second sentence carries the sage. */
  h1 { margin: 0; font-family: var(--font-sans); font-weight: var(--weight-semibold); font-size: var(--text-6xl); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); text-align: center; white-space: nowrap; }
  h1 em { font-style: normal; color: var(--color-accent-on-dark); }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3xl); margin-top: var(--space-3xl); }
  figure { margin: 0; display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: var(--space-xl); }
  figcaption { justify-self: stretch; display: grid; gap: var(--space-xs); text-align: center; }
  figcaption strong { justify-self: center; white-space: nowrap; font-size: var(--text-4xl); font-weight: var(--weight-semibold); line-height: var(--leading-heading); color: var(--ink-on-dark); }
  figcaption span { font-size: var(--text-2xl); line-height: var(--leading-tight); color: var(--ink-on-dark-secondary); }

  .shot { position: relative; aspect-ratio: 16 / 9; border-radius: var(--radius-xl); overflow: hidden; background: var(--color-white); color: var(--color-charcoal); box-shadow: var(--shadow-card); }
  .shot > * { zoom: var(--k, 1); }
  .chosen .shot { outline: 4px solid var(--color-accent-on-dark); outline-offset: 4px; }
  .top { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--rule-card); font-size: var(--text-base); font-weight: var(--weight-semibold); }
  .btn { font-size: var(--text-sm); font-weight: var(--weight-semibold); padding: var(--space-2xs) var(--space-sm); border-radius: var(--space-xs); border: 1px solid var(--rule-strong); background: var(--color-white); color: var(--color-charcoal); }
  .btn.go { background: var(--color-charcoal); border-color: var(--color-charcoal); color: var(--ink-on-dark); }
  .btn.ghost { border-color: transparent; color: var(--color-muted-gray); }
  .list { padding: var(--space-2xs) var(--space-md); }
  .r { display: flex; align-items: center; gap: var(--space-sm); height: var(--space-xl); border-bottom: 1px solid var(--rule-hairline); }
  .r i { flex: none; width: var(--space-md); height: var(--space-md); border-radius: var(--space-2xs); border: 1.5px solid var(--rule-strong); }
  .r.on i { background: var(--color-charcoal); border-color: var(--color-charcoal); }
  .r b { height: var(--space-sm); border-radius: var(--radius-pill); background: var(--color-muted-light); }
  .r.gone { opacity: .35; }
  .r.risk b { background: var(--color-caution-light); }
  .r em { margin-left: auto; font-style: normal; font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-caution-text); }

  .toast { position: absolute; left: var(--space-md); right: var(--space-md); bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md); border-radius: var(--space-sm); background: var(--color-charcoal); color: var(--ink-on-dark); font-size: var(--text-sm); font-weight: var(--weight-semibold); box-shadow: var(--shadow-popover); }
  .toast .btn { background: var(--color-accent-on-dark); border-color: var(--color-accent-on-dark); color: var(--color-charcoal); }
  .scrim { position: absolute; inset: 0; background: color-mix(in srgb, var(--color-charcoal) 35%, transparent); display: grid; place-items: center; padding: var(--space-md); }
  .dialog { width: 85%; box-sizing: border-box; padding: var(--space-sm) var(--space-md); border-radius: var(--space-sm); background: var(--color-white); box-shadow: var(--shadow-popover); display: grid; gap: var(--space-xs); }
  .dialog p { margin: 0; font-size: var(--text-sm); line-height: var(--leading-ui); }
  .dialog p:first-child { font-size: var(--text-base); font-weight: var(--weight-semibold); }
  .dialog .acts { display: flex; justify-content: flex-end; gap: var(--space-xs); }
  .sub { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-muted-gray); padding-top: var(--space-xs); }
</style></head><body>
  <h1>Three ways to archive. <em>One designer&rsquo;s call.</em></h1>
  <div class="row">
    <figure class="chosen">
      ${screen(rows(['', 'gone', 'gone', 'gone', 'gone']) + '<div class="toast"><span>4 customers archived</span><span class="btn">Undo</span></div>')}
      <figcaption><strong>Archive, then undo</strong><span>One press, even in bulk</span></figcaption>
    </figure>
    <figure>
      ${screen(rows(['on', 'on', 'on', 'on', 'on']) + '<div class="scrim"><div class="dialog"><p>Archive 5 customers?</p><p>3 of them are active.</p><div class="acts"><span class="btn ghost">Cancel</span><span class="btn go">Archive 5</span></div></div></div>')}
      <figcaption><strong>Confirm first</strong><span>Names who&rsquo;s at risk first</span></figcaption>
    </figure>
    <figure>
      ${screen('<div class="sub">Review 5 before archiving</div>' + rows(['on', 'risk', 'risk', 'risk', 'on']), '<span class="btn go">Archive 2</span>')}
      <figcaption><strong>Review the batch</strong><span>Catches the most mistakes</span></figcaption>
    </figure>
  </div>
</body></html>`;

const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const s of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.setContent(page(s.width, s.height), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    // Each screen is drawn at 362px wide and scaled to the width it gets.
    await p.evaluate(() => {
      for (const s of document.querySelectorAll('.shot')) s.style.setProperty('--k', s.getBoundingClientRect().width / 362);
    });
    await p.waitForTimeout(300);
    const file = path.join(ROOT, s.out);
    fs.writeFileSync(file, await p.screenshot({ type: 'webp', quality: 86 }));
    console.log(`${s.out}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
