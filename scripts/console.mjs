#!/usr/bin/env node
/* console.mjs -- capture the deploy console prototype for its share card.
 *
 *   node scripts/console.mjs        writes img/site/deploy-console.webp
 *
 * The page is its own picture: og.mjs frames img/site/deploy-console.webp in
 * the 420px square every case study's card carries, so what a feed shows is
 * the reading as it renders, not a drawing of it. Re-run this after any
 * change to the console's answer zone, then `node scripts/og.mjs
 * deploy-console` to re-render the card.
 *
 * THE READING, NOT THE OPENING SCREEN. cockpit.mjs captures the cockpit's
 * first situation because the recommendation is the argument; this
 * console's first situation is the one where nothing is wrong, which is the
 * right screen to open on and the wrong one to put in a feed. The square is
 * cut from the top of the answer zone on "Live, but failing": the headline,
 * then the figures beside their befores.
 *
 * Captured at 960px wide so the card and the panel beside it sit side by
 * side, and cropped to a square from the top of the zone. Chromium encodes
 * the WebP, for the reason lucy.mjs gives: one encoder, one answer to how a
 * pixel is rounded. */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('console.mjs');
const OUT = 'img/site/deploy-console.webp';
const SIZE = 1000;
const QUALITY = 0.82;

const chromium = loadChromium('console.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
/* 1040, not 960: the zone keeps its 960 of content and takes 40 of ground
   each side inside the frame, so the capture does not run to the bezel. */
const page = await browser.newPage({ viewport: { width: 1040, height: 1400 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await page.goto(`${origin}/prototype/deploy-console.html`, { waitUntil: 'networkidle' });
await page.click('[data-scenario="degraded"]');
await page.waitForTimeout(200);
/* The header is fixed, and an element screenshot scrolls the panel under
   it. The card is of the console, not the site's chrome, and the device
   bezel is site chrome by the same reading; the switcher and the situation's
   own two lines are the page explaining the console. */
await page.addStyleTag({ content: [
  '.site-nav { display: none !important; }',
  '.dc-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.dc { padding: 0 !important; }',
  '.dc-situation, .dc-tabs-label, .dc-tabs, .dc-project { display: none !important; }',
  '.dc-stage { display: block !important; margin: 0 !important; padding: 40px !important; }',
].join(' ') });
await page.waitForTimeout(400);
const png = await page.locator('.dc-answer').screenshot({ type: 'png' });
const b64 = await page.evaluate(async ({ dataUrl, size, quality }) => {
  const img = new Image(); img.src = dataUrl; await img.decode();
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, img.width, img.width, 0, 0, size, size);
  return c.toDataURL('image/webp', quality).split(',')[1];
}, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, size: SIZE, quality: QUALITY });
const buf = Buffer.from(b64, 'base64');
fs.writeFileSync(path.join(root, OUT), buf);
console.log(`  ${OUT}  ${SIZE}x${SIZE}  ${(buf.length / 1024).toFixed(1)} KB`);
await browser.close();
server.close();
