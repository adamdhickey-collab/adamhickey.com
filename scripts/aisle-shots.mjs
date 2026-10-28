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
 *   aisle-arrive.webp
 *     The hero's picture: the In the store screen with the comparison
 *     closed, the same 2x frame as the three above but cut under the
 *     shelf counts and Compare side by side, so in the hero's .build-phone it prints
 *     at a phone's own size and every line of it reads.
 *   aisle-card.webp
 *     The lab index's card, 1600x900: the trip's two ends side by side, the
 *     photo at the friend's house and the two lamps in the aisle, each the app's own
 *     content from its title down, flat on white cards on the charcoal
 *     ground, no phone shells. At the card's 18rem a phone's screen is too
 *     small to read; two panels at 1.8x are not. It replaced a trio of
 *     staggered phones (2026-10-28) whose words could not be read at that
 *     size.
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
  arrive:  { press: ['[data-go="results"]', '[data-save="hollis"]', '[data-save="bexley"]', '[data-go="plan"]', '[data-go="store"]'], cut: '.ai-saved + .ai-row' },
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
  const box = await page.$eval('.ai-app', (el, cut) => {
    const r = el.getBoundingClientRect();
    /* A cut ends the frame 12px under that element: the rows below it sit
       16px down, so any more and the top of the next one shows. */
    const end = cut ? el.querySelector(cut).getBoundingClientRect().bottom + 12 : r.bottom;
    return { x: r.left + scrollX, y: r.top + scrollY, height: end - r.top };
  }, SHOTS[name].cut || null);
  const buf = await page.screenshot({
    type: 'png',
    fullPage: true,
    clip: { x: box.x, y: box.y, width: WIDTH, height: Math.min(HEIGHT, box.height) },
  });
  await context.close();
  return { buf, height: Math.round(Math.min(HEIGHT, box.height)) };
}

const wanted = Object.keys(SHOTS).filter((n) => !only.length || only.some((o) => n.includes(o)));
const pngs = {};
for (const name of wanted) {
  const shot = await screen(name);
  pngs[name] = shot.buf;
  const height = shot.height;
  /* The same frame, as the webp the page loads. */
  const context = await browser.newContext({ viewport: { width: WIDTH, height }, deviceScaleFactor: SCALE });
  const page = await context.newPage();
  await page.setContent(`<html><body style="margin:0;background:#fff"><img src="data:image/png;base64,${pngs[name].toString('base64')}" style="display:block;width:${WIDTH}px;height:auto"></body></html>`);
  const file = path.join(OUT, `aisle-${name}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: WIDTH, height } }));
  console.log(`  ${path.relative(ROOT, file)}  ${WIDTH * SCALE}x${height * SCALE}`);
  await context.close();
}

/* The card: the trip's two ends, the photo at the friend's house and the lamps in the
   aisle, each panel the app's own content from its title to the end of what
   it shows. Taken at 3x and printed at 1.8x, so the bitmap is always being
   reduced. The composition page loads the site's own stylesheets, so the
   edge and the shadow are tokens rather than hex. The ground is not the
   site's: since 2026-10-28 it is Agent Review's scene ground, #2b3a2f
   (agent-review src/review/SceneScreen, agent-review#78), so the two lab
   cards that sit side by side under Experimental lab work share one dark
   sage. It was --color-charcoal. */
async function panel(press, from, to) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.site-nav { display: none !important; }' });
  for (const sel of press) {
    const hit = await page.$(sel);
    if (!hit) throw new Error(`card: nothing matches ${sel}`);
    await hit.click();
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const box = await page.$eval('.ai-app', (el, [f, t]) => {
    const r = el.getBoundingClientRect();
    const a = el.querySelector(f).getBoundingClientRect();
    const z = el.querySelector(t).getBoundingClientRect();
    return { x: r.left + scrollX, y: a.top + scrollY, width: r.width, height: z.bottom - a.top };
  }, [from, to]);
  const buf = await page.screenshot({ type: 'png', fullPage: true, clip: box });
  await context.close();
  return { src: `data:image/png;base64,${buf.toString('base64')}`, height: box.height };
}

if (!only.length || only.some((o) => 'card'.includes(o))) {
  const at = await panel([], '.ai-head-row', '.ai-photo-frame');
  const aisle = await panel(SHOTS.arrive.press, '.ai-head-row', '.ai-saved-item:last-child .ai-saved-stock');
  const K = 1.8;
  const tall = Math.ceil(Math.max(at.height, aisle.height) * K);
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${origin}/404.html`, { waitUntil: 'load' });
  await page.setContent(`<!doctype html><html><head>
    <link rel="stylesheet" href="/color.css"><link rel="stylesheet" href="/style.css">
    <style>
      html, body { margin: 0; width: 1600px; height: 900px; overflow: hidden; }
      body { --scene-sage: #2b3a2f; background: var(--scene-sage); display: flex; align-items: center; justify-content: center; gap: 56px; }
      .pn { box-sizing: content-box; width: ${WIDTH * K}px; height: ${tall}px; padding: 36px 0; overflow: hidden;
            background: var(--color-white); border: 2px solid var(--rule-card); border-radius: 28px; box-shadow: var(--shadow-card); }
      .pn img { display: block; width: 100%; }
    </style></head>
    <body><div class="pn"><img src="${at.src}"></div><div class="pn"><img src="${aisle.src}"></div></body></html>`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  const file = path.join(OUT, 'aisle-card.webp');
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86 }));
  console.log(`  ${path.relative(ROOT, file)}  1600x900`);
  await context.close();
}

await browser.close();
server.close();
