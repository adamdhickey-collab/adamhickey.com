#!/usr/bin/env node
/* Agent Review's homepage card: the three ways to archive on the loop's
   dark panel, under one centered line that says what the page is about.

   Since the evening of 2026-10-27 the three are the case study's step 3,
   exactly: the prototype's Explore scene (agent-review src/review/
   SceneScreen, #/scenes/explore) draws each direction as a tile, a small
   screen of the batch over its name and its cost, and this script captures
   those three tiles from the app and sets them on the card, so the card and
   step 3 cannot drift apart. Dark, the app's Night sage, as step 3 is. Before
   that the card drew its own screens in the opener's list colors (#685,
   #689), and before those it was white placeholders (#680), a drawing
   (#666), the three-directions scene (#672), the app's screens whole (#677)
   and each moment in Relay's colors (#679).

     img/lab/agent-review-cycle-card.webp    2560 x 1440, the homepage card

   The site's own stylesheets are read from --from (a static server at the
   repository root), and the prototype from --app, its deployed address by
   default; pass a local build served under /agent-review/ to take the card
   before the app's change has merged. The script refuses a card that runs
   past its frame.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     python3 -m http.server 8000      # from the repository root, in another shell
     node scripts/cycle-card.mjs      # --from http://localhost:<port>/ --app http://localhost:4173/agent-review/ */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return (i > -1 ? process.argv[i + 1] : fallback).replace(/\/?$/, '/');
};
const from = arg('--from', 'http://localhost:8000/');
const app = arg('--app', 'https://adamdhickey-collab.github.io/agent-review/');
const OUT = 'img/lab/agent-review-cycle-card.webp';

const browser = await chromium.launch({ executablePath: CHROME });
try {
  /* Step 3's three tiles, from the app, at the scale the card prints them:
     each is about 1.8 times its size in the 800px scene, on a 2x card. */
  const scene = await browser.newContext({ viewport: { width: 800, height: 450 }, deviceScaleFactor: 4, reducedMotion: 'reduce', colorScheme: 'dark' });
  const s = await scene.newPage();
  await s.addInitScript(() => localStorage.setItem('agent-review:theme', 'dark'));
  await s.goto(`${app}#/scenes/explore`, { waitUntil: 'networkidle' });
  await s.evaluate(() => document.fonts.ready);
  await s.waitForTimeout(400);
  const ways = await s.$$('.stage-scene__way');
  if (ways.length !== 3) throw new Error(`the Explore scene has ${ways.length} tiles, not 3`);
  const tiles = [];
  for (const w of ways) tiles.push(`data:image/png;base64,${(await w.screenshot({ type: 'png', omitBackground: true })).toString('base64')}`);
  const box = await ways[0].boundingBox();
  await scene.close();

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
  .row { width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-xl); }
  .row img { display: block; width: 100%; height: auto; aspect-ratio: ${box.width} / ${box.height}; }
</style></head><body>
  <h1>Three ways to archive. <em>One designer&rsquo;s call.</em></h1>
  <div class="row">${tiles.map((t) => `<img src="${t}" alt="">`).join('')}</div>
</body></html>`;

  const card = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const p = await card.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (await p.evaluate(() => document.body.scrollHeight > 720)) throw new Error('the card runs past 720px');
  const file = path.join(ROOT, OUT);
  fs.writeFileSync(file, await p.screenshot({ type: 'webp', quality: 90 }));
  console.log(`${OUT}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB, tiles from ${app}`);
  await card.close();
} finally {
  await browser.close();
}
