/* aisle-shots.mjs -- The Shortlist prototype's pictures,
 * taken from the running prototype rather than captured by hand, so a
 * restyle of a screen is one run here and the picture and the thing a
 * reader can press cannot drift apart (the same arrangement the cockpit
 * has in cockpit-shots.mjs and Agent Review in scenes.mjs).
 *
 *   node scripts/aisle-shots.mjs            # every picture
 *   node scripts/aisle-shots.mjs plan       # one, by name
 *
 * What it makes, all under img/lab/:
 *
 *   aisle-plan.webp
 *     The app's screen alone (.ai-app, no chrome) at 2x, 736 wide and cut
 *     at 1520 tall: the trip planned, with the stale count. og.mjs sets it
 *     on the write-up's share card. Until 2026-10-29 the write-up also
 *     printed it in a row with aisle-results and aisle-store, and its hero
 *     was aisle-arrive; the prototype itself runs there now, and those
 *     three left the tree with the captures that showed it.
 *   aisle-card.webp
 *     The lab index's card, 1600x900: the trip's two ends side by side, the
 *     photo at the friend's house and the two lamps in the aisle, each in
 *     its phone, the two level and cut off by the card's foot, on a painted
 *     store aisle (img/lab/aisle-ground.webp). Cutting the phones is what
 *     lets their screens print at 1.6x, near enough the 1.8x of the flat
 *     white panels that stood here on 2026-10-28, which had replaced a trio
 *     of whole phones whose words could not be read at the card's size.
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
const PAGE = 'lab/inspiration-to-aisle.html';

/* Under 64rem the write-up's hero is one column and the phone takes each
   screen's own height, which is what a picture wants; from 64rem it holds
   one height and scrolls the screen inside (inspiration-to-aisle.css). So
   the pictures are taken at 1000 wide, under that, rather than at 1280. */
const VIEW = { width: 1000, height: 1000 };

/* The screen's width inside the shell at the phone's own 24rem
   frame: 384 less two 8px bezels. 760 tall is a little over the first
   screen's own height, so a longer screen is cut where a phone would cut it. */
const WIDTH = 368;
const HEIGHT = 760;
const SCALE = 2;

/* Since 2026-10-28 every shot after the first has the shopper say the wood
   legs matter, so the pictures show the one thing the trip carries: the
   matches checked on it, and the comparison with its row first. */
const SHOTS = {
  plan:    { press: ['[data-pref="legs"]', '[data-go="results"]', '[data-save="hollis"]', '[data-save="bexley"]', '[data-go="plan"]'] },
};
/* The In the store screen, which the card's second panel shows. */
const ARRIVE = ['[data-pref="legs"]', '[data-go="results"]', '[data-save="hollis"]', '[data-save="bexley"]', '[data-go="plan"]', '[data-go="store"]'];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const chromium = loadChromium('aisle-shots.mjs');
const chromePath = findChrome();
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

async function screen(name) {
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: SCALE, reducedMotion: 'reduce' });
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
  const box = await page.$eval('.ai-app', (el, [cut, from]) => {
    const r = el.getBoundingClientRect();
    /* A cut ends the frame 12px under that element: the rows below it sit
       16px down, so any more and the top of the next one shows. A from
       starts it at that element instead of the app's top. */
    const top = from ? el.querySelector(from).getBoundingClientRect().top : r.top;
    const end = cut ? el.querySelector(cut).getBoundingClientRect().bottom + 12 : r.bottom;
    return { x: r.left + scrollX, y: top + scrollY, height: end - top };
  }, [SHOTS[name].cut || null, SHOTS[name].from || null]);
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

/* The card: the trip's two ends, the photo at the friend's house and the
   lamps in the aisle, each the app's screen from its bar down, in the phone
   the write-up runs it in, rising from the card's foot. Since 2026-10-29
   the phones stand on a painted store aisle, as the Lucy Learns card
   stands on its entryway (built-cards.mjs): the back wall the lamps are
   on, kept quiet, drawn in ChatGPT at 1672x941 and kept at
   img/lab/aisle-ground.webp. Before that the two were flat white panels on
   Agent Review's dark sage, with no phone, because the panels could print
   at 1.8x; the phones print at 1.6x, which is as large as two can stand
   side by side with the aisle still showing round them.

   Each screen is taken at 3x, so the bitmap is always being reduced, and
   set in style.css's own .build-phone, so the bezel, chrome and shadow are
   tokens rather than a capture of the prototype's frame, which is the same
   object. The two phones stand level, and so do their screens: the store
   screen's back link is left out, so both open on the bar, then the place's
   badge and name at one height. One cut ends both, halfway down the gap
   under the photo; the store screen shows its two lamps and nothing after
   them, so the cut falls in white there too rather than through a line. */
async function phone(press, last, { next, hide = '' } = {}) {
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  /* The card shows the list as something to read, so the per-lamp "Not on
     the shelf?" press is left out of it: at the card's size it would sit
     under one lamp and be cut off under the other. */
  await page.addStyleTag({ content: '.site-nav { display: none !important; } .ai-saved-act { display: none !important; }' });
  for (const sel of press) {
    const hit = await page.$(sel);
    if (!hit) throw new Error(`card: nothing matches ${sel}`);
    await hit.click();
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  /* What the card leaves out of this screen, once the presses are done:
     before, it could hide a button they need. */
  if (hide) await page.addStyleTag({ content: hide });
  /* The whole screen, where the last block shown ends, where the next
     block starts if there is one, and the top of the badge the two must
     share. */
  const box = await page.$eval('.ai-app', (el, [a, b]) => {
    const r = el.getBoundingClientRect();
    const y = (sel, edge) => el.querySelector(sel).getBoundingClientRect()[edge] - r.top;
    return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height,
             end: y(a, 'bottom'), next: b ? y(b, 'top') : null, badge: y('.ai-badge', 'top') };
  }, [last, next]);
  const buf = await page.screenshot({ type: 'png', fullPage: true, clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  await context.close();
  return { src: `data:image/png;base64,${buf.toString('base64')}`, ...box };
}

if (!only.length || only.some((o) => 'card'.includes(o))) {
  const at = await phone([], '.ai-photo-frame', { next: '.ai-photo-cap' });
  const aisle = await phone(ARRIVE, '.ai-saved', {
    hide: '.ai-app .ai-back { display: none !important; } .ai-app .ai-saved ~ * { visibility: hidden !important; }',
  });
  const cut = (at.end + at.next) / 2;
  if (Math.abs(at.badge - aisle.badge) > 0.5) throw new Error(`card: the badges stand at ${at.badge} and ${aisle.badge}, not level`);
  if (aisle.end > cut) throw new Error(`card: the store's list ends at ${aisle.end}, under the cut at ${cut}`);
  const K = 1.6, BEZEL = 8, H = 900;
  /* The phones' one top, so the card's foot lands on the cut. */
  const top = Math.round(H - (BEZEL + cut) * K);
  const context = await browser.newContext({ viewport: { width: 1600, height: H }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${origin}/404.html`, { waitUntil: 'load' });
  await page.setContent(`<!doctype html><html><head>
    <link rel="stylesheet" href="/color.css"><link rel="stylesheet" href="/shell.css"><link rel="stylesheet" href="/style.css">
    <style>
      html, body { margin: 0; width: 1600px; height: ${H}px; overflow: hidden; }
      body { background: url("/img/lab/aisle-ground.webp") center / cover, var(--color-muted-light);
             display: flex; align-items: flex-start; justify-content: center; gap: var(--space-4xl); }
      .build-phone { width: ${WIDTH + 2 * BEZEL}px; zoom: ${K}; }
    </style></head>
    <body>
      <div style="margin-top: ${top}px"><div class="build-phone"><img src="${at.src}" alt=""></div></div>
      <div style="margin-top: ${top}px"><div class="build-phone"><img src="${aisle.src}" alt=""></div></div>
    </body></html>`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  const file = path.join(OUT, 'aisle-card.webp');
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86 }));
  console.log(`  ${path.relative(ROOT, file)}  1600x900  (phones at ${top}, cut at ${cut.toFixed(1)})`);
  await context.close();
}

await browser.close();
server.close();
