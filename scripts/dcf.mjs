/* The Door County Found phone screens, and the homepage card, grabbed from
 * the product itself.
 *
 *   node scripts/dcf.mjs                          all three, from a fresh build
 *   node scripts/dcf.mjs card                     only the homepage card
 *   node scripts/dcf.mjs phones                   only the two phone screens
 *   node scripts/dcf.mjs --app <path>             a checkout somewhere else
 *   node scripts/dcf.mjs --no-build               reuse the dist/ already there
 *
 * The sibling folder is the default. Every output lands at the path the
 * write-up already points to, so a re-run after the site changes is the whole
 * swap, and the cache-buster on the tag is the only thing left to bump by
 * hand. Same arrangement as lucy.mjs, for the same reason: these were captured
 * by hand, and a hand capture is the one that drifts.
 *
 * It builds and serves dist/ rather than talking to `astro dev`. A dev server
 * is a second thing to be running and a second thing to be wrong about -- and
 * the built page is the one readers get. The build takes about two seconds.
 *
 * The framing is the one the write-up already had, and deliberately so: a
 * 620x1342 viewport, which is where the chips sit five to a row and the dog
 * guide's heading stays on one line. It is wider than a phone, and that is a
 * difference from lucy.mjs worth stating rather than quietly fixing -- the
 * alt text on both tags describes what is visible at this width, and a 390px
 * recapture would cut the map off mid-peninsula and lose the Dogs welcome
 * list the caption promises. Reframing these is a separate decision from
 * sharpening them.
 *
 * What was actually wrong was the scale. The files they replace were captured
 * at that viewport at deviceScaleFactor 1 -- 620 CSS pixels written to 620
 * image pixels, no supersampling anywhere. The write-up draws the phone frame
 * at 404px and the frame takes --bezel off each side, so the picture itself is
 * 388 CSS pixels and a 2x screen wants 776 across. It had 620. Capturing at 2x
 * and coming down to 810 covers that with a little to spare; a materially
 * bigger file would only be bigger. If the frame ever grows past 405px, this
 * number is the thing to revisit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const APP = path.resolve(opt('--app', path.join(ROOT, '..', 'door-county-found')));
const BUILD = !args.includes('--no-build');

const chromium = loadChromium('dcf.mjs');
const chromePath = findChrome();

/* The viewport is the framing; the file is what the write-up can draw. */
const VIEW = { width: 620, height: 1342, scale: 2 };
const OUT = { width: 810, height: 1753 };   /* covers 388px at 2x, on VIEW's aspect */
const QUALITY = 0.82;

/* `ready` is what has to be true before the shot, expressed as a function of
 * the page rather than a number of milliseconds. The map is the reason: it
 * paints its own chrome immediately and its tiles over the next second or
 * two, so a fixed wait either captures a half-drawn peninsula or is padded
 * long enough that nobody knows which. */
const SCREENS = [
  {
    file: 'img/dcf/phone-map.webp',
    url: '/map/index.html',
    /* Leaflet marks each tile .leaflet-tile-loaded as it arrives. Wait for a
       count that has stopped moving AND for the town markers the picture is
       actually of, which are drawn by the page rather than fetched. */
    ready: async (page) => {
      await page.waitForSelector('.leaflet-tile-loaded', { timeout: 20000 });
      await page.waitForFunction(() => {
        const n = document.querySelectorAll('.leaflet-tile-loaded').length;
        const was = window.__tiles; window.__tiles = n;
        return n > 0 && n === was;
      }, null, { timeout: 20000, polling: 600 });
    },
  },
  {
    file: 'img/dcf/phone-dogs.webp',
    url: '/dogs/index.html',
    /* Two polaroids and the first row of cards, all photographs. Only the
       ones ON SCREEN: the card grid below the fold is loading="lazy", and a
       lazy image outside the viewport never completes, so "every image" is a
       condition this page cannot meet. */
    ready: async (page) => {
      await page.waitForFunction(() => {
        const h = window.innerHeight;
        return [...document.images]
          .filter((i) => { const b = i.getBoundingClientRect(); return b.top < h && b.bottom > 0; })
          .every((i) => i.complete && i.naturalWidth > 0);
      }, null, { timeout: 20000 });
    },
  },
];

/* THE HOMEPAGE CARD, since 2026-10-21: the site's own first screen, its
 * header and the whole hero, at the 16:9 the Built end to end cards print
 * at. The hero is 838px tall at every desktop width, so a 1490x838 viewport
 * is the header and the hero exactly, at 16:9, and nothing of the section
 * under it. Until then the card cropped img/products/door-county-found.webp,
 * a 1400x897 capture, to 16:9 from the middle, which cut the logo in half;
 * that file stays, since the write-up's share card is drawn from it. Written
 * at the other cards' 1672x941 (scripts/built-cards.mjs). */
const CARD = {
  name: 'card',
  file: 'img/products/door-county-found-card.webp',
  url: '/index.html',
  view: { width: 1490, height: 838, scale: 2 },
  out: { width: 1672, height: 941 },
};

/* `node scripts/dcf.mjs card` writes only the card, and `phones` only the
 * two phone screens; with neither, all three. A re-encode is never
 * byte-identical, so writing only what changed keeps the diff honest. */
const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--app');
const wants = (name) => !only.length || only.includes(name);

/* Chromium is the only WebP encoder this repository relies on; lucy.mjs and
 * illustrate.mjs made the same choice, and a second encoder would be a second
 * answer to how a pixel is rounded. */
async function encode(page, bytes, mime, { width, height }, quality = QUALITY) {
  const dataUrl = `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
  const b64 = await page.evaluate(async ({ dataUrl, width, height, quality }) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas'); c.width = width; c.height = height;
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { dataUrl, width, height, quality });
  return Buffer.from(b64, 'base64');
}

function write(rel, buf, out = OUT) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
  console.log(`  ${rel}  ${out.width}x${out.height}  ${(buf.length / 1024).toFixed(1)} KB`);
}

if (!fs.existsSync(path.join(APP, 'package.json'))) {
  console.error(`\n  no site at ${APP}; pass --app <path to door-county-found>\n`); process.exit(2);
}

console.log(`\n  ${APP}`);
if (BUILD) {
  console.log('  building...');
  execFileSync('npm', ['run', 'build'], { cwd: APP, stdio: ['ignore', 'ignore', 'inherit'] });
}
const dist = path.join(APP, 'dist');
if (!fs.existsSync(path.join(dist, 'map', 'index.html'))) {
  console.error(`\n  no build at ${dist}; drop --no-build\n`); process.exit(2);
}

const { server, origin } = await serve(dist);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({
  viewport: { width: VIEW.width, height: VIEW.height },
  deviceScaleFactor: VIEW.scale,
  isMobile: true, hasTouch: true,
  reducedMotion: 'reduce',
});
const encoder = await ctx.newPage();
console.log('');
for (const s of wants('phones') ? SCREENS : []) {
  const page = await ctx.newPage();
  await page.goto(origin + s.url, { waitUntil: 'load' });
  await s.ready(page);
  await page.waitForTimeout(400);
  const png = await page.screenshot({ type: 'png' });
  write(s.file, await encode(encoder, png, 'image/png', OUT));
  await page.close();
}
if (wants(CARD.name)) {
  /* A desktop, not the phone context above: the header is the whole point,
     and it only carries the logo beside the full menu at this width. */
  const desk = await browser.newContext({
    viewport: { width: CARD.view.width, height: CARD.view.height },
    deviceScaleFactor: CARD.view.scale,
    reducedMotion: 'reduce',
  });
  const page = await desk.newPage();
  await page.goto(origin + CARD.url, { waitUntil: 'load' });
  await page.waitForFunction(() => [...document.images]
    .filter((i) => i.getBoundingClientRect().top < window.innerHeight)
    .every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const png = await page.screenshot({ type: 'png' });
  write(CARD.file, await encode(encoder, png, 'image/png', CARD.out), CARD.out);
  await desk.close();
}
await browser.close();
server.close();
console.log('');
