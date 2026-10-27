#!/usr/bin/env node
/* Agent Review's homepage card: the three ways to archive on the loop's
   dark panel, under one centered line that says what the page is about,
   each screen with a two-line label centered under it, none of them marked
   as chosen.

   Since the afternoon of 2026-10-27 the screens are placeholders, solid
   white at 16:9, while the prototype takes a new skin: the drawn moments of
   #679 described the old one. When the new screens are drawn, each goes in
   its way's `screen`, and the frame, gaps and labels stay as they are.
   Before this the card was a drawing (#666), the three-directions scene
   (#672), the app's screens whole (#677) and each moment drawn in Relay's
   colors (#679).

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

const WAYS = [
  { id: 'undo', label: 'Archive, with the option to undo', screen: '' },
  { id: 'confirm', label: 'Confirm once, then archive', screen: '' },
  { id: 'review', label: 'Check each one, then archive', screen: '' },
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap">
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
  /* Placeholder until the new skin's screens are drawn. */
  .screen { aspect-ratio: 16 / 9; overflow: hidden; background: var(--color-white); border-radius: var(--radius-xl); }
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
