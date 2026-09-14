/**
 * accent.mjs -- the dominant accent hue of an illustration, in degrees.
 *
 * The writing features are colour-coded to the index's three sections, and a
 * generator returns "sage" as whatever green it felt like. This reads what
 * actually came back so the grouping is measured rather than assumed: every
 * pixel binned coarsely, greys and near-whites dropped (they are the line
 * work and the ground, never the accent), and the hue of the biggest bin
 * printed. Called by draw.mjs `take`; usable on its own for a whole set.
 */
import { findChrome, loadChromium } from './harness.mjs';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const chromium = loadChromium('accent.mjs');
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage();
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

for (const f of process.argv.slice(2)) {
  const url = `data:${MIME[extname(f).toLowerCase()]};base64,${readFileSync(f).toString('base64')}`;
  const hue = await page.evaluate(async (u) => {
    const im = new Image(); im.src = u; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const bins = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn < 26) continue;              /* grey: the line work */
      if (mx > 245 && mn > 200) continue;      /* near-white: the ground */
      const k = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
      bins.set(k, (bins.get(k) || 0) + 1);
    }
    const top = [...bins].sort((a, b) => b[1] - a[1])[0];
    if (!top) return -1;
    const [r, g, b] = top[0].split(',').map(Number);
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const mx = Math.max(rr, gg, bb), mn = Math.min(rr, gg, bb), dd = mx - mn;
    if (!dd) return -1;
    let h = mx === rr ? 60 * (((gg - bb) / dd) % 6) : mx === gg ? 60 * ((bb - rr) / dd + 2) : 60 * ((rr - gg) / dd + 4);
    return Math.round(h < 0 ? h + 360 : h);
  }, url);
  console.log(process.argv.length > 3 ? `${hue}  ${f}` : hue);
}
await browser.close();
