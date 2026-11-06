/* wren-shots.mjs -- the After Send prototype's pictures, taken from the
 * running prototype rather than captured by hand, so a restyle of a screen
 * is one run here and the picture and the thing a reader can press cannot
 * drift apart (the arrangement aisle-shots.mjs and cockpit-shots.mjs have).
 *
 *   node scripts/wren-shots.mjs            # every picture
 *   node scripts/wren-shots.mjs card       # one, by name
 *
 * What it makes, all under img/lab/:
 *
 *   after-send-record.webp
 *     The window alone at 2x in an 820 viewport, where the two facts still
 *     sit side by side, cut square from its top: the record once the
 *     supplier has processed, with Processed by supplier and Ready to
 *     match to invoice beside each other. og.mjs sets it on the write-up's
 *     share card, whose picture is a square.
 *   after-send-card.webp
 *     The lab index's and the homepage's card, 1600x900: the same window
 *     on the site's muted ground, large enough that the two facts read at
 *     half the section, cut off by the card's foot as The Shortlist's
 *     phones are.
 *
 * The screen is reached by the same presses scripts/lib/reachable.mjs
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
const PAGE = 'lab/after-send.html';

/* The window at the container's width inside a 1280 viewport, the site's
   desk; its own width is what the picture takes. */
const VIEW = { width: 1280, height: 1000 };
const SCALE = 2;

/* The record screen the pictures show: the followed payment, processed by
   the supplier and back as the buyer, the match not yet reviewed. */
const RECORD = ['[data-open="larkspur-20483"]', '[data-role="supplier"]', '[data-process]', '[data-role="buyer"]'];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const chromium = loadChromium('wren-shots.mjs');
const chromePath = findChrome();
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

/* The window, as a PNG at 2x, and its CSS size. */
async function window_(press, view = VIEW) {
  const context = await browser.newContext({ viewport: view, deviceScaleFactor: SCALE, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.site-nav { display: none !important; }' });
  for (const sel of press) {
    const hit = await page.$(sel);
    if (!hit) throw new Error(`nothing matches ${sel}`);
    await hit.click();
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const box = await page.$eval('.wr-frame', (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
  });
  const buf = await page.screenshot({ type: 'png', fullPage: true, clip: box });
  await context.close();
  return { buf, ...box };
}

/* A PNG placed in a page of the given size and written as the webp. */
async function compose(file, { width, height, html }) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${origin}/404.html`, { waitUntil: 'load' });
  await page.setContent(html);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width, height } }));
  console.log(`  ${path.relative(ROOT, file)}  ${width}x${height}`);
  await context.close();
}

const want = (n) => !only.length || only.some((o) => n.includes(o));
const shot = await window_(RECORD);
const src = `data:image/png;base64,${shot.buf.toString('base64')}`;

if (want('record')) {
  /* The window in the narrower viewport, square from its top. */
  const narrow = await window_(RECORD, { width: 820, height: 1000 });
  const W = Math.round(narrow.width), H = W;
  await compose(path.join(OUT, 'after-send-record.webp'), {
    width: W, height: H,
    html: `<!doctype html><html><body style="margin:0;background:#fff;overflow:hidden"><img src="data:image/png;base64,${narrow.buf.toString('base64')}" style="display:block;width:${W}px;height:auto"></body></html>`,
  });
}

if (want('card')) {
  /* The card: the window at 1400 wide on the muted ground, its top 60px
     down, cut by the card's foot, with a margin either side that the
     homepage's thumbnail crop can spend. */
  const W = 1600, H = 900, SHOWN = 1400, TOP = 60;
  await compose(path.join(OUT, 'after-send-card.webp'), {
    width: W, height: H,
    html: `<!doctype html><html><head>
      <link rel="stylesheet" href="/color.css"><link rel="stylesheet" href="/shell.css">
      <style>
        html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
        body { background: var(--color-muted-light); display: flex; justify-content: center; }
        img { display: block; width: ${SHOWN}px; height: auto; margin-top: ${TOP}px; border-radius: 22px; box-shadow: var(--shadow-lift); }
      </style></head>
      <body><img src="${src}"></body></html>`,
  });
}

await browser.close();
server.close();
