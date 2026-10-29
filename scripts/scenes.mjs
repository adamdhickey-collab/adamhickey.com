#!/usr/bin/env node
/* The Agent Review scenes: each stage of the prototype's design cycle as one
   16:9 picture, and two more, the batch the case study opens on and the
   three directions side by side, which is the homepage card. Since
   2026-10-26 they are drawn by the prototype itself, at its address
   #/scenes/<id> (agent-review src/review/SceneScreen), from its own
   components and tokens, so a picture on the site cannot drift from the app
   it shows. Until then the stages were HTML on the case study, set in the
   site's type and colors, and the homepage card a separate drawing; neither
   looked like the prototype a reader opened next.

   A scene is 800 by 450 and is captured at 3.2x, 2560 by 1440, the
   homepage card's size, so it stays sharp printed anywhere up to 1280px.
   800 is below the app's first zoom step (app/scale.css), so the root is
   never scaled; the script refuses a capture whose root zoom isn't 1. Dark,
   the app's default since 2026-10-27 (agent-review#58) — its charcoal since
   2026-10-29 (agent-review#79), Night sage before that — chosen the way the
   app's toggle chooses it; --theme light takes the light palette instead.
   They were light from 2026-10-24.

   The prototype is read from its deployed address by default. Pass --from
   for a local build served under /agent-review/ (vite preview), which is how
   a scene is taken before the app's change has merged.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/scenes.mjs                         # every scene
     node scripts/scenes.mjs evaluate three          # only these
     node scripts/scenes.mjs --from http://localhost:4173/agent-review/
     node scripts/scenes.mjs --theme light           # the light palette

   Writes img/lab/agent-review-scene-<id>.webp, quality 86 like the other lab
   captures. Chrome's WebP output is not byte-stable between runs, so scope a
   re-run to the scenes that moved, and bump each one's ?v= where it's used. */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SCENES = ['batch', 'discover', 'define', 'explore', 'three', 'evaluate', 'delegate', 'learn'];
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'img/lab');
const args = process.argv.slice(2);
const at = args.indexOf('--from');
const from = (at >= 0 ? args[at + 1] : 'https://adamdhickey-collab.github.io/agent-review/').replace(/\/?$/, '/');
const th = args.indexOf('--theme');
const theme = th >= 0 ? args[th + 1] : 'dark';
if (theme !== 'dark' && theme !== 'light') {
  console.error(`--theme is dark or light, not ${theme}`);
  process.exit(2);
}
const asked = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--from' && args[i - 1] !== '--theme');
const unknown = asked.filter((a) => !SCENES.includes(a));
if (unknown.length) {
  console.error(`No scene named ${unknown.join(', ')}. Scenes: ${SCENES.join(', ')}`);
  process.exit(2);
}
const ids = asked.length ? asked : SCENES;

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
console.log(`scenes: ${ids.length} from ${from}, ${theme}`);
for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 800, height: 450 }, deviceScaleFactor: 3.2, reducedMotion: 'reduce', colorScheme: theme });
  await page.addInitScript((t) => localStorage.setItem('agent-review:theme', t), theme);
  await page.goto(`${from}#/scenes/${id}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('.scene');
  await page.waitForTimeout(400); /* the scene clears a press's focus at 100ms */
  const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
  if (zoom !== '1') throw new Error(`${id}: the root is zoomed (${zoom}), so the picture would not be the app's own size`);
  const over = await page.evaluate(() => [...document.querySelectorAll('.scene__body > *')].filter((e) => e.getBoundingClientRect().bottom > 450.5).length);
  if (over) console.warn(`${id}: ${over} part(s) run past the frame's foot`);
  const file = path.join(OUT, `agent-review-scene-${id}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86 }));
  console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  await page.close();
}
await browser.close();
