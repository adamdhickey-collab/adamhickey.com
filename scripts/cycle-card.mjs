#!/usr/bin/env node
/* Agent Review's homepage card: the three ways to archive on the loop's
   dark panel, under one line that says what the page is about, each screen
   with one label under it, the one Alex chose ringed in sage.

   Since 2026-10-27 the screens are drawn here, in HTML, rather than taken
   from the app. The card prints at about 620px wide on a desktop and 300px
   on a phone, and a whole screen of the prototype at that size is a table
   nobody can read (#677). So each screen is the moment after Archive is
   pressed, cut to what that moment says: the table's head, the bar, the
   question or the review, and the few rows it is about, at the site's own
   type sizes. The words are the prototype's; the colors are Relay's, from
   agent-review's src/tokens/tokens.css, which #57 there left unchanged when
   the review around it took this site's colors. Before this the card was a
   drawing (#666), the three-directions scene (#672), and the app's screens
   whole (#677).

     img/lab/agent-review-cycle-card.webp    2560 x 1440, the homepage card

   Every screen is 16:9, and the script refuses one whose content runs past
   its frame rather than letting the frame cut it.

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

const check = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const undo = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5L2.5 6.5l3 3M2.5 6.5H10a3.5 3.5 0 010 7H7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const box = (on) => `<i class="box${on ? ' on' : ''}">${on ? check : ''}</i>`;
const row = (name, badge, kind, on) => `<div class="tr">${on === undefined ? '' : box(on)}<span class="name">${name}</span><b class="badge ${kind}">${badge}</b></div>`;

const WAYS = [
  {
    id: 'undo', label: 'Archive, then undo', chosen: true,
    screen: `<div class="head">Customers <span>8</span></div>
      <div class="bar"><span>4 customers archived.</span><button class="btn">${undo}Undo</button></div>
      ${row('Monarch Dental Group', 'Past due', 'warn')}
      ${row('Okafor Logistics', 'Active', 'ok')}
      ${row('Pinecrest Credit Union', 'Active', 'ok')}`,
  },
  {
    id: 'confirm', label: 'Confirm, then archive',
    screen: `<div class="head">Customers <span>12</span></div>
      <div class="bar ask"><span><strong>Archive 5?</strong> 3 are active.</span><button class="btn danger">Archive 5</button></div>
      ${row('Halvorsen Freight', 'Active', 'ok', true)}
      ${row('Brightwater Clinics', 'Active', 'ok', true)}
      ${row('Okafor Logistics', 'Active', 'ok', false)}`,
  },
  {
    id: 'review', label: 'Review, then archive',
    screen: `<div class="head">Customers <span>12</span></div>
      <div class="review">
        <strong>Review 5 before archiving</strong>
        <div class="line"><b class="badge warn">Can&rsquo;t archive</b><span>Monarch Dental Group</span></div>
        <div class="line">${box(true)}<span>Halvorsen Freight</span><b class="badge ok">Active</b></div>
        <div class="foot"><button class="btn danger">Archive 4</button></div>
      </div>`,
  },
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text&family=Montserrat:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<style>
  html, body { margin: 0; }
  body { width: 1280px; height: 720px; overflow: hidden; box-sizing: border-box; padding: var(--space-2xl);
    background: var(--color-charcoal); color: var(--ink-on-dark); font-family: var(--font-sans);
    display: grid; align-content: center; gap: var(--space-3xl); }
  h1 { margin: 0; font-family: var(--font-serif); font-weight: var(--weight-regular); font-size: var(--text-8xl); line-height: var(--leading-display); letter-spacing: var(--tracking-display); }
  h1 em { font-style: normal; color: var(--color-accent-on-dark); }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-lg); }
  figure { margin: 0; display: grid; gap: var(--space-xl); }
  figcaption { font-size: var(--text-4xl); font-weight: var(--weight-semibold); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); }
  .chosen .screen { outline: 4px solid var(--color-accent-on-dark); outline-offset: 4px; }

  /* Relay, the product under review: its own tokens, from agent-review's
     src/tokens/tokens.css, drawn at the site's sizes so they read here. */
  .screen {
    --surface: #ffffff; --sunken: #f2f2f4; --border: #e4e4e8; --control: #8c8c96;
    --text: #1b1b1f; --muted: #6a6a76; --accent: #2f5fd6; --accent-subtle: #e9effc;
    --ok: #1f7a3f; --ok-subtle: #e6f4ea; --ok-border: oklch(0.86 0.07 150);
    --warn: #8a5a00; --warn-subtle: #fbf1dc; --warn-border: oklch(0.72 0.12 75);
    --danger: #b42318; --danger-border: oklch(0.86 0.07 25);
    aspect-ratio: 16 / 9; overflow: hidden; box-sizing: border-box;
    display: flex; flex-direction: column;
    background: var(--surface); color: var(--text); border-radius: var(--radius-xl); box-shadow: var(--shadow-card);
    font-family: Inter, system-ui, sans-serif; font-size: var(--text-xl); line-height: var(--leading-tight); }
  .screen svg { width: 1em; height: 1em; }
  .head { padding: var(--space-xs) var(--space-md); font-weight: 600; border-bottom: 1px solid var(--border); }
  .head span { color: var(--muted); font-weight: 400; }
  .bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm);
    padding: var(--space-xs) var(--space-md); border-bottom: 1px solid var(--border); }
  .bar.ask { background: var(--accent-subtle); }
  .bar strong { font-weight: 600; }
  .btn { display: inline-flex; align-items: center; gap: var(--space-xs); flex: none;
    font: 500 var(--text-lg) / 1 Inter, system-ui, sans-serif; color: var(--text);
    background: var(--surface); border: 1px solid var(--control); border-radius: 6px; padding: var(--space-2xs) var(--space-sm); }
  .btn.danger { color: var(--danger); border-color: var(--danger); }
  .tr, .line { display: flex; align-items: center; gap: var(--space-sm); }
  .tr { padding: var(--space-xs) var(--space-md); border-bottom: 1px solid var(--border); }
  .tr:last-child { border-bottom: 0; }
  .name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .badge { flex: none; font-weight: 500; font-size: var(--text-base); padding: 0.1em var(--space-xs); border-radius: 3px; border: 1px solid; }
  .badge.ok { color: var(--ok); background: var(--ok-subtle); border-color: var(--ok-border); }
  .badge.warn { color: var(--warn); background: var(--warn-subtle); border-color: var(--warn-border); }
  .box { flex: none; display: grid; place-items: center; width: 1em; height: 1em; box-sizing: border-box;
    border: 1.5px solid var(--control); border-radius: 3px; color: #fff; }
  .box.on { background: var(--accent); border-color: var(--accent); }
  .review { flex: 1; display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm) var(--space-md); background: var(--sunken); }
  .review strong { font-weight: 600; }
  .line span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .foot { margin-top: auto; display: flex; justify-content: flex-end; }
</style></head><body>
  <h1>Three ways to archive. <em>One designer&rsquo;s call.</em></h1>
  <div class="row">${WAYS.map((w) => `<figure${w.chosen ? ' class="chosen"' : ''}>
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
    ...[...document.querySelectorAll('.name, .line span')].filter((s) => s.scrollWidth > s.clientWidth + 0.5).map((s) => `"${s.textContent}" is cut off`),
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
