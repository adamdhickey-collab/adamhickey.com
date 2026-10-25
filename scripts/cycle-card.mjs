#!/usr/bin/env node
/* Agent Review's card since 2026-10-25, when the prototype became a design
   cycle: the three working archive screens from Explore, side by side on
   the loop's dark panel, each cut to the top of its screen, where the line
   that makes it different sits (the undo bar, the question, the review),
   the one Alex chose marked, under one
   line that says what the page is about. Real captures, not a drawing: the
   point of the card is that the directions are working software and a
   person chose between them.

   Two sizes from one composition, both at 2x:
     img/lab/agent-review-cycle-card.webp    1280 x 720, the lab index's card
     img/lab/agent-review-cycle-share.webp   1200 x 630, og.mjs's `full` for the case study

   It reads the three captures lab-shots.mjs takes (cycle-undo,
   cycle-confirm, cycle-review), so retake those first when the prototype
   changes. The colours and type are the site's tokens, read from
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

const page = (w, h) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text&family=Montserrat:wght@500;600&display=swap">
<style>
  html, body { margin: 0; }
  body { width: ${w}px; height: ${h}px; overflow: hidden; background: var(--color-charcoal); color: var(--ink-on-dark);
    font-family: var(--font-sans); display: grid; grid-template-rows: auto 1fr; box-sizing: border-box; padding: var(--space-2xl); }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-xl); }
  h1 { margin: 0; font-family: var(--font-serif); font-weight: var(--weight-regular); font-size: var(--text-5xl); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); }
  h1 em { font-style: normal; color: var(--color-accent-on-dark); }
  .kicker { margin: 0; font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--ink-on-dark-secondary); white-space: nowrap; }
  .row { display: grid; grid-template-rows: repeat(3, minmax(0, 1fr)); gap: var(--space-md); min-height: 0; margin-top: var(--space-xl); }
  figure { margin: 0; display: grid; grid-template-columns: 15rem minmax(0, 1fr); align-items: center; gap: var(--space-lg); min-height: 0; }
  figcaption { flex-wrap: wrap; font-size: var(--text-xl); font-weight: var(--weight-semibold); color: var(--ink-on-dark-secondary); display: flex; align-items: center; gap: var(--space-sm); }
  .shot { height: 100%; min-height: 0; border-radius: var(--radius-xl); overflow: hidden; background: var(--color-white); box-shadow: var(--shadow-card); }
  .shot img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
  .chosen figcaption { color: var(--ink-on-dark); }
  .chosen .shot { outline: 4px solid var(--color-accent-on-dark); outline-offset: 4px; }
  .tag { font-size: var(--text-base); padding: var(--space-2xs) var(--space-sm); border-radius: var(--radius-pill); background: var(--color-accent-on-dark); color: var(--color-charcoal); }
</style></head><body>
  <div class="head"><h1>Three working screens. <em>One designer&rsquo;s call.</em></h1><p class="kicker">Agent Review</p></div>
  <div class="row">
    <figure class="chosen"><figcaption>Archive, then undo <span class="tag">Chosen</span></figcaption><div class="shot"><img src="${from}img/lab/agent-review-cycle-undo.webp"></div></figure>
    <figure><figcaption>Confirm first</figcaption><div class="shot"><img src="${from}img/lab/agent-review-cycle-confirm.webp"></div></figure>
    <figure><figcaption>Review the batch</figcaption><div class="shot"><img src="${from}img/lab/agent-review-cycle-review.webp"></div></figure>
  </div>
</body></html>`;

const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const s of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.setContent(page(s.width, s.height), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const file = path.join(ROOT, s.out);
    fs.writeFileSync(file, await p.screenshot({ type: 'webp', quality: 86 }));
    console.log(`${s.out}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
