#!/usr/bin/env node
/* rebalance-shots.mjs -- capture the rebalancing cockpit for its hero and its
 * share card.
 *
 *   node scripts/rebalance-shots.mjs     writes img/rebalance/hero.webp
 *                                        and img/site/rebalance-cockpit.webp
 *
 * Both are of the saved reading, never the live feed: the browser here is
 * driven by Playwright, so navigator.webdriver is set and the page plays
 * prototype/rebalance-snapshot.js, the same stations every run. Retake
 * them after `node scripts/rebalance-snapshot.mjs`, and bump the ?v= on the
 * hero's two references, then run `node scripts/og.mjs rebalance-cockpit`.
 *
 * The hero is the panel from the empty station's card through the
 * recommendation, cut square from the top at 2x; the card is the same square
 * at the 1000px cockpit.mjs gives og.mjs. Chromium encodes the WebP, for the
 * reason lucy.mjs gives: one encoder, one answer to how a pixel is rounded. */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('rebalance-shots.mjs');
const OUT = [
  { file: 'img/rebalance/hero.webp', size: 1640 },
  { file: 'img/site/rebalance-cockpit.webp', size: 1000 },
];
const QUALITY = 0.82;

const chromium = loadChromium('rebalance-shots.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1040, height: 1200 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await page.goto(`${origin}/prototype/rebalance-cockpit.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('.ck-lead');
/* The same chrome off as cockpit.mjs takes: the site's header, the device
   bezel, the switcher and the situation's two lines are the page explaining
   the screen, and the picture is the screen. */
await page.addStyleTag({ content: [
  '.site-nav { display: none !important; }',
  '.ck-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.ck { padding: 0 !important; }',
  '.rb-feed, .ck-situation, .ck-tabs-label, .ck-tabs { display: none !important; }',
  '.ck-stage { display: block !important; margin: 0 !important; padding: 40px !important; }',
].join(' ') });
await page.waitForTimeout(400);
const png = await page.locator('#ck-panel').screenshot({ type: 'png' });
fs.mkdirSync(path.join(root, 'img/rebalance'), { recursive: true });
for (const { file, size } of OUT) {
  const b64 = await page.evaluate(async ({ dataUrl, size, quality }) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.width, img.width, 0, 0, size, size);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, size, quality: QUALITY });
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(root, file), buf);
  console.log(`  ${file}  ${size}x${size}  ${(buf.length / 1024).toFixed(1)} KB`);
}
await browser.close();
server.close();
