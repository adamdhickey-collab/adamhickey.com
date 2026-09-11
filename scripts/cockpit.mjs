#!/usr/bin/env node
/* cockpit.mjs -- capture the dispatch cockpit prototype for its share card.
 *
 *   node scripts/cockpit.mjs        writes img/site/dispatch-cockpit.webp
 *
 * The page is its own picture: og.mjs frames img/site/dispatch-cockpit.webp
 * in the 420px square every case study's card carries, so what a feed shows
 * is the recommendation panel as it renders, not a drawing of it. Re-run
 * this after any change to the cockpit's first screen, then `node
 * scripts/og.mjs dispatch-cockpit` to re-render the card.
 *
 * Captured at 960px wide so the recommendation pair sits side by side, and
 * cropped to a square from the top of the panel: the load, the leader's
 * factors, the record. Chromium encodes the WebP, for the reason lucy.mjs
 * gives: one encoder, one answer to how a pixel is rounded. */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('cockpit.mjs');
const OUT = 'img/site/dispatch-cockpit.webp';
const SIZE = 1000;
const QUALITY = 0.82;

const chromium = loadChromium('cockpit.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
/* 1040, not 960: the panel keeps its 960 of content and takes 40 of ground
   each side inside the frame, so the capture does not run to the bezel. */
const page = await browser.newPage({ viewport: { width: 1040, height: 1200 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await page.goto(`${origin}/prototype/dispatch-cockpit.html`, { waitUntil: 'networkidle' });
/* The header is fixed, and an element screenshot scrolls the panel under
   it. The card is of the cockpit, not the site's chrome -- and the device
   bezel the page frames the prototype in is site chrome by the same reading.
   Dropping it is also what keeps the 960 below meaning what it says: the
   frame insets the panel by its margins, its bezel and the screen's padding,
   so a capture that left it standing would come back at 768 and quietly
   recrop the card. The card shows the interface; the page shows the object
   the interface sits in. */
await page.addStyleTag({ content: [
  '.site-nav { display: none !important; }',
  '.ck-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.ck { padding: 0 !important; }',
  /* The switcher and the situation's own two lines are the page explaining
     the cockpit; the card is the cockpit. */
  '.ck-situation, .ck-tabs-label { display: none !important; }',
  /* the switcher is sticky on the page; in a still it is just a bar */
  '.ck-tabs { position: static !important; }',
  '.ck-stage { display: block !important; margin: 0 !important; padding: 40px !important; }',
].join(' ') });
await page.waitForTimeout(400);
/* The element, then the square cut from its top in the canvas: a clip on a
   viewport screenshot has to be inside the viewport, and the panel is not. */
const png = await page.locator('#ck-panel').screenshot({ type: 'png' });
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
