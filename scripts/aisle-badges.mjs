/* aisle-badges.mjs -- the two small pictures that sit in a circle beside the
 * titles of the Aisle prototype's two places, cut from one ChatGPT sheet.
 *
 *   node scripts/aisle-badges.mjs
 *
 * img/inbox/aisle-place-badges.png is one 2:1 image holding both, drawn in
 * the same thread so they share a hand: bold flat shapes, about a dozen to
 * a scene, so each still reads at 56px, with no mark, sign or word of any
 * real store. Drawn first in bright retail colors, then recolored shape for
 * shape to the site's own palette: sage, tea and warm grounds, charcoal,
 * slate, a little rust and blush, and a pale butter for the lamplight. The
 * friend's house at dusk on the left, the home-goods store on the right,
 * each a strict front elevation. Each is cut to a square tight on its
 * subject, since the circle clips the corners and the badge prints at 56px, and encoded at 192
 * (3x) as img/lab/aisle-badge-house.webp and aisle-badge-store.webp. The
 * circle itself is CSS, not part of the file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'img', 'inbox', 'aisle-place-badges.png');
const SIZE = 192;
const CUTS = {
  house: { x: 45, y: 20, side: 800 },
  store: { x: 905, y: 27, side: 860 },
};

const chromium = loadChromium('aisle-badges.mjs');
const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const page = await browser.newPage();
const src = `data:image/png;base64,${fs.readFileSync(SRC).toString('base64')}`;
const out = await page.evaluate(async ({ src, CUTS, SIZE }) => {
  const img = new Image(); img.src = src; await img.decode();
  const res = {};
  for (const [name, c] of Object.entries(CUTS)) {
    const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
    const ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, c.x, c.y, c.side, c.side, 0, 0, SIZE, SIZE);
    res[name] = cv.toDataURL('image/webp', 0.9);
  }
  return res;
}, { src, CUTS, SIZE });
for (const [name, url] of Object.entries(out)) {
  const file = path.join(ROOT, 'img', 'lab', `aisle-badge-${name}.webp`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`  ${path.relative(ROOT, file)}  ${SIZE}x${SIZE}`);
}
await browser.close();
