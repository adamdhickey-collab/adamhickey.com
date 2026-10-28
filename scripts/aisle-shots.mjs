/* aisle-shots.mjs -- the From Inspiration to Aisle prototype's pictures,
 * taken from the running prototype rather than captured by hand, so a
 * restyle of a screen is one run here and the picture and the thing a
 * reader can press cannot drift apart (the same arrangement the cockpit
 * has in cockpit-shots.mjs and Agent Review in scenes.mjs).
 *
 *   node scripts/aisle-shots.mjs            # every picture
 *   node scripts/aisle-shots.mjs store      # one, by name
 *
 * What it makes, all under img/lab/:
 *
 *   aisle-results.webp, aisle-plan.webp, aisle-store.webp
 *     The app's screen alone (.ai-app, no chrome) at 2x, 736 wide and cut
 *     at 1520 tall, so the three print at one height; the write-up's
 *     .build-phone draws the shell around each. Results is the four
 *     matches with the first one's reasons open; plan is the trip with the
 *     stale count; store is the aisle with the comparison open.
 *   aisle-trio.webp
 *     The three screens in phone shells on the warm ground at 1600x900,
 *     for the write-up's hero, the lab index's card and the share cards.
 *
 * The screens are reached by the same presses scripts/lib/reachable.mjs
 * registers, so a hook that goes stale fails here as it would there.
 *
 * Needs playwright-core and a Chromium (npm install --no-save
 * playwright-core; CHROME=/path/to/chrome if the harness cannot find one).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'img', 'lab');
const PAGE = 'prototype/aisle.html';

/* The screen's width inside the shell at the prototype page's own 24rem
   frame: 384 less two 8px bezels. 760 tall is a little over the first
   screen's own height, so a longer screen is cut where a phone would cut it. */
const WIDTH = 368;
const HEIGHT = 760;
const SCALE = 2;

const SHOTS = {
  results: { press: ['[data-go="results"]', '[data-why="hollis"]'] },
  plan:    { press: ['[data-go="results"]', '[data-save="hollis"]', '[data-save="bexley"]', '[data-go="plan"]'] },
  store:   { press: ['[data-go="results"]', '[data-save="hollis"]', '[data-save="bexley"]', '[data-go="plan"]', '[data-go="store"]', '[data-go="compare"]'] },
};

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const chromium = loadChromium('aisle-shots.mjs');
const chromePath = findChrome();
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

async function screen(name) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: SCALE, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  /* The site's header is fixed, so once a press scrolls the page it sits
     over the phone. It is not part of the app. */
  await page.addStyleTag({ content: '.site-nav { display: none !important; }' });
  for (const sel of SHOTS[name].press) {
    const hit = await page.$(sel);
    if (!hit) throw new Error(`${name}: nothing matches ${sel}`);
    await hit.click();
    await page.waitForTimeout(150);
  }
  /* The open disclosure's summary keeps focus after the press, and a focus
     ring is not part of the picture. */
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  /* The box in page coordinates, since the presses scroll the page and a
     clip on a full-page shot is measured from its top. */
  const box = await page.$eval('.ai-app', (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, height: r.height };
  });
  const buf = await page.screenshot({
    type: 'png',
    fullPage: true,
    clip: { x: box.x, y: box.y, width: WIDTH, height: Math.min(HEIGHT, box.height) },
  });
  await context.close();
  return buf;
}

const wanted = Object.keys(SHOTS).filter((n) => !only.length || only.some((o) => n.includes(o)));
const pngs = {};
for (const name of wanted) {
  pngs[name] = await screen(name);
  /* The same frame, as the webp the page loads. */
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE });
  const page = await context.newPage();
  await page.setContent(`<html><body style="margin:0;background:#fff"><img src="data:image/png;base64,${pngs[name].toString('base64')}" style="display:block;width:${WIDTH}px;height:auto"></body></html>`);
  const file = path.join(OUT, `aisle-${name}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } }));
  console.log(`  ${path.relative(ROOT, file)}  ${WIDTH * SCALE}x${HEIGHT * SCALE}`);
  await context.close();
}

/* The trio: three shells on the warm ground, in the site's own device
   chrome (style.css, "Device chrome"), at 16:9. Only when all three were
   taken this run. */
if (['results', 'plan', 'store'].every((n) => pngs[n])) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const shell = (name, dy) => `<div style="position:absolute;left:0;top:${dy}px;width:${WIDTH + 16}px;padding:8px;background:#1b1d22;border-radius:26px;box-shadow:0 1px 2px rgba(0,0,0,0.06),0 12px 28px -12px rgba(0,0,0,0.28)"><img src="data:image/png;base64,${pngs[name].toString('base64')}" style="display:block;width:${WIDTH}px;height:${HEIGHT}px;border-radius:18px;object-fit:cover;object-position:top"></div>`;
  await page.setContent(`<html><body style="margin:0;width:1600px;height:900px;background:#f5f5f0;overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:1600px;height:900px">
      <div style="position:absolute;left:184px;top:120px">${shell('results', 0)}</div>
      <div style="position:absolute;left:608px;top:60px">${shell('plan', 0)}</div>
      <div style="position:absolute;left:1032px;top:120px">${shell('store', 0)}</div>
    </div></body></html>`);
  const file = path.join(OUT, 'aisle-trio.webp');
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86 }));
  console.log(`  ${path.relative(ROOT, file)}  1600x900`);
  await context.close();
}

await browser.close();
server.close();
