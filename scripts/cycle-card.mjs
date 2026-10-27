#!/usr/bin/env node
/* Agent Review's homepage card: the three ways to archive on the loop's
   dark panel, under one line that says what the page is about, each with
   its name and what it costs under it, the one Alex chose ringed in sage.

   Since 2026-10-26 (evening) the screens are the prototype's own, whole:
   each direction's Relay screen after its Archive press, taken from the
   live app's Explore stage as a 16:9 window, so nothing is cut off the
   foot of the table. Before that the card was a drawing (from #666) and
   then the prototype's three-directions scene (#672), which cut each
   screen to its top on a light ground; Adam asked for the dark panel and
   headline back, the screens whole, and every screen 16:9.

   The window is WINDOW wide at the app's own size (zoom 1), which is the
   narrowest at which the review screen, the tallest of the three, fits in
   16:9 with its twelve rows; the other two sit at the top of the same
   window, as they would on a screen. The script refuses a screen that runs
   past its window rather than cutting it.

     img/lab/agent-review-cycle-card.webp    2560 x 1440, the homepage card

   Colours and type are the site's tokens, read from color.css, type.css
   and shell.css.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     python3 -m http.server 8000      # from the repository root, in another shell
     node scripts/cycle-card.mjs      # --from http://localhost:<port>/, --app <prototype URL> */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return (i > -1 ? process.argv[i + 1] : fallback).replace(/\/?$/, '/');
};
const from = arg('--from', 'http://localhost:8000/');
const app = arg('--app', 'https://adamdhickey-collab.github.io/agent-review/');
const OUT = 'img/lab/agent-review-cycle-card.webp';
const WINDOW = 1312;
const TALL = Math.round((WINDOW * 9) / 16);

/* The words under each are the case study's: its name in the prototype,
   and what it costs, from the scene the app draws (#/scenes/three). */
const WAYS = [
  { id: 'undo', tab: 'Archive now, undo after', cost: 'A mistake is only caught if someone notices the bar.', chosen: true },
  { id: 'confirm', tab: 'Confirm first, naming who', cost: 'A question every time. People learn to press through it.' },
  { id: 'review', tab: 'Review the batch, then archive', cost: 'The most steps, and a new pattern for the system to own.' },
];

const browser = await chromium.launch({ executablePath: CHROME });
try {
  /* ---------- the screens, from the prototype ---------- */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 2000 }, deviceScaleFactor: 2, reducedMotion: 'reduce', colorScheme: 'light' });
  await ctx.addInitScript(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(':root { --zoom: 1 !important; }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    try { localStorage.setItem('agent-review:theme', 'light'); } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(`${app}#/cycle/discover`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const stage = async (id) => {
    await page.evaluate((id) => (location.hash = `#/cycle/${id}`), id);
    await page.waitForFunction((id) => document.title.toLowerCase().startsWith(`design cycle: ${id}`), id);
    await page.waitForTimeout(500);
  };
  const choose = (name) => page.getByRole('button', { name: new RegExp(`^Choose\\s+${name}$`) }).click();
  /* Explore opens once Discover and Define are decided (agent-review#50),
     on the path the case study tells, as lab-shots.mjs reaches it. */
  await choose('Correct it');
  await stage('define');
  await choose('Nothing leaves without a way back');
  await stage('explore');
  const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
  if (zoom !== '1') throw new Error(`the app is drawn at ${zoom}, not 1`);
  const shots = {};
  for (const way of WAYS) {
    await page.getByRole('tab', { name: new RegExp(way.tab) }).click();
    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    const frame = page.locator('.cycle__product-frame').first();
    await frame.evaluate((el, [w, h]) => {
      /* Lifted out of its column to the window's corner, over everything,
         so the wider window neither overflows the column nor takes in the
         panel beside it. */
      Object.assign(el.style, { position: 'fixed', left: '0', top: '0', zIndex: '1000', margin: '0', maxWidth: 'none', width: `${w}px` });
      el.style.minHeight = `${h}px`;
      el.style.boxSizing = 'border-box';
    }, [WINDOW, TALL]);
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const box = await frame.boundingBox();
    if (box.height > TALL + 0.5) throw new Error(`${way.id}: the screen is ${Math.round(box.height)}px tall, past its ${TALL}px window`);
    shots[way.id] = (await page.screenshot({ type: 'png', clip: { x: box.x, y: box.y, width: WINDOW, height: TALL } })).toString('base64');
    await frame.evaluate((el) => el.removeAttribute('style'));
    console.log(`${way.id}: ${WINDOW} x ${TALL}, ${Math.round(box.height)}px of it the screen's own`);
  }
  await ctx.close();

  /* ---------- the card ---------- */
  const figure = (w) => `<figure${w.chosen ? ' class="chosen"' : ''}>
      <img src="data:image/png;base64,${shots[w.id]}" alt="">
      <figcaption><strong>${w.tab}</strong><span>${w.cost}</span></figcaption>
    </figure>`;
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${from}color.css"><link rel="stylesheet" href="${from}type.css"><link rel="stylesheet" href="${from}shell.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text&family=Montserrat:wght@500;600&display=swap">
<style>
  html, body { margin: 0; }
  body { width: 1280px; height: 720px; overflow: hidden; box-sizing: border-box; padding: var(--space-4xl);
    background: var(--color-charcoal); color: var(--ink-on-dark); font-family: var(--font-sans);
    display: grid; align-content: center; gap: var(--space-3xl); }
  header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-xl); }
  h1 { margin: 0; font-family: var(--font-serif); font-weight: var(--weight-regular); font-size: var(--text-8xl); line-height: var(--leading-display); letter-spacing: var(--tracking-display); }
  h1 em { font-style: normal; color: var(--color-accent-on-dark); }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2xl); }
  figure { margin: 0; display: grid; grid-template-rows: subgrid; grid-row: span 2; gap: var(--space-xl); }
  img { display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: var(--radius-xl); box-shadow: var(--shadow-card); }
  .chosen img { outline: 4px solid var(--color-accent-on-dark); outline-offset: 4px; }
  figcaption { display: grid; align-content: start; gap: var(--space-xs); }
  figcaption strong { font-size: var(--text-3xl); font-weight: var(--weight-semibold); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); }
  figcaption span { font-size: var(--text-2xl); line-height: var(--leading-tight); color: var(--ink-on-dark-secondary); }
</style></head><body>
  <header><h1>Three ways to archive. <em>One designer&rsquo;s call.</em></h1></header>
  <div class="row">${WAYS.map(figure).join('')}</div>
</body></html>`;
  const card = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const p = await card.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() => document.body.scrollHeight > 720);
  if (over) throw new Error('the card runs past 720px');
  const file = path.join(ROOT, OUT);
  fs.writeFileSync(file, await p.screenshot({ type: 'webp', quality: 86 }));
  console.log(`${OUT}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  await card.close();
} finally {
  await browser.close();
}
