#!/usr/bin/env node
/* console-shots.mjs -- capture the deploy console's own screen, in pieces,
 * for the page that explains it and for the homepage card that opens it.
 *
 *   node scripts/console-shots.mjs              all of them, into img/console/
 *   node scripts/console-shots.mjs failed       just that one
 *
 * cockpit-shots.mjs, for the second prototype. The argument is there and is
 * not repeated: what the page shows is captured from the running prototype
 * rather than drawn, and it is a script so a restyle is one run rather than
 * an afternoon of screenshots that drift out of step with the live panel a
 * section above them.
 *
 * FOUR CAPTURES. The hero's reading, the refusal and the reading under
 * decision 02, which are the one comparison the live panel can only make
 * across two tab presses and a scroll, and the wide reading the HOMEPAGE's
 * prototype card prints -- the one capture here that is not for this page.
 *
 * A shot clips to the union of one or more elements and stops where the
 * union stops, flush where the page draws the frame itself. A slide names
 * an `aspect` instead and is a window on the screen. The viewport is part
 * of the shot: the answer zone puts its card and its panel side by side
 * from 800px, and the widths below are chosen so a capture lands near the
 * size it is displayed at.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('console-shots.mjs');
const OUT_DIR = 'img/console';
const QUALITY = 0.82;
const SCALE = 2;
const PAD = 24;

const SHOTS = [
  {
    name: 'live-failing',
    scenario: 'degraded',
    /* 900 puts the card and the panel side by side without stretching the
       figures into a band. The crop runs from the top of the zone to the
       bottom of the reading card, which ends on the Roll back button. */
    width: 900,
    clip: ['.dc-lead'],
    padTop: 0,
    padLeft: 0,
    padRight: 0,
    /* Flush on three sides, for the reason the cockpit's hero is: the page
       prints this file through .dcw-hero-figure img, which draws a 12px
       radius and --shadow-media, so the zone stops drawing its own edge. */
    css: '.dc-lead { border-radius: 0 !important; border-color: transparent !important; box-shadow: none !important; }',
    bottomOf: '.dc-read',
    padBottom: 10,
    note: 'the hero: a deploy that is live and failing, read rather than refused',
  },
  /* Decision 02's two frames: the refusal and the reading, one above the
     other on the page, so a reader sees that they are not the same kind of
     thing even though they share the one caution colour. */
  {
    name: 'failed',
    scenario: 'failed',
    width: 1320,
    clip: ['.dc-fail'],
    padTop: 0,
    padBottom: 0,
    padLeft: 0,
    padRight: 0,
    /* The 2px caution edge stays: it is the argument of the card. The curve
       comes to the 12px the figure clips at. */
    css: '.dc-fail { border-radius: 12px !important; }',
    note: '02, first frame: a refusal, on the caution ground',
  },
  {
    name: 'reading',
    scenario: 'degraded',
    width: 1320,
    clip: ['.dc-read'],
    padTop: 0,
    padBottom: 0,
    padLeft: 0,
    padRight: 0,
    css: '.dc-read { border-radius: 12px !important; }',
    note: '02, second frame: a reading, on white with the dark edge',
  },

  /* ----- the homepage card's window --------------------------------------
     index.html's prototype card prints this inside a tablet, so it is a
     window on the screen: 680 by 510, which is 4:3, a tablet in landscape.
     At 680 the zone is in its one-column layout, so the window holds the
     reading card at its real size. Anchored 20 above the card's own top
     edge, the window holds the head, the three figures with their befores,
     and opens on what changed, which runs past the bottom edge the way a
     screen does. */
  {
    name: 'slide-failing',
    scenario: 'degraded',
    width: 680,
    aspect: 4 / 3,
    stagePad: 20,
    ground: 'muted-light',
    clip: ['.dc-read'],
    padTop: 20,
    note: 'the homepage card: the figures since the deploy, beside the figures before it',
  },
];

/* The strip: page furniture around the console, and the page talking about
   it. The project card goes too, for these shots: every one is a picture of
   the answer, and the project's four facts above it belong to the screen
   rather than to the argument the capture is evidence for. */
const strip = (pad = 40, ground) => [
  '.site-nav { display: none !important; }',
  ground ? `.dc { background: var(--color-${ground}) !important; }` : '',
  '.dc-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.dc { padding: 0 !important; border-radius: 0 !important; }',
  '.dc-situation, .dc-tabs-label, .dc-tabs, .dc-project { display: none !important; }',
  `.dc-stage { display: block !important; margin: 0 !important; padding: ${pad}px !important; }`,
].join(' ');

const want = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const shots = want.length ? SHOTS.filter((s) => want.includes(s.name)) : SHOTS;
if (!shots.length) {
  console.error(`  no such shot. Known: ${SHOTS.map((s) => s.name).join(', ')}`);
  process.exit(2);
}

const chromium = loadChromium('console-shots.mjs');
const { server, origin } = await serve(root);
const browser = await chromium.launch({ executablePath: findChrome() });
fs.mkdirSync(path.join(root, OUT_DIR), { recursive: true });

console.log(`\n  ${root}\n  ${shots.length} shot${shots.length === 1 ? '' : 's'} -> ${OUT_DIR}/\n`);

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: 1400 },
    deviceScaleFactor: SCALE,
    reducedMotion: 'reduce',
  });
  await page.goto(`${origin}/prototype/deploy-console.html`, { waitUntil: 'networkidle' });
  await page.click(`[data-scenario="${shot.scenario}"]`);
  await page.waitForTimeout(200);
  await page.addStyleTag({ content: strip(shot.stagePad, shot.ground) + (shot.css ?? '') });
  if (shot.open) await page.click(`${shot.open} summary`);
  await page.waitForTimeout(400);

  const box = await page.evaluate(({ sels, bottomOf }) => {
    const box = (s) => {
      const el = document.querySelector(s);
      if (!el) throw new Error(`no element for ${s}`);
      const r = el.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
    };
    const rects = sels.map(box);
    return {
      x: Math.min(...rects.map((r) => r.x)),
      y: Math.min(...rects.map((r) => r.y)),
      right: Math.max(...rects.map((r) => r.r)),
      bottom: bottomOf ? box(bottomOf).b : Math.max(...rects.map((r) => r.b)),
    };
  }, { sels: shot.clip, bottomOf: shot.bottomOf });

  const left = shot.padLeft ?? PAD;
  const top = shot.padTop ?? PAD;
  const clip = shot.aspect
    ? {
        x: 0,
        y: Math.max(0, Math.round(box.y - top)),
        width: shot.width,
        height: Math.round(shot.width / shot.aspect),
      }
    : {
        x: Math.max(0, Math.round(box.x - left)),
        y: Math.max(0, Math.round(box.y - top)),
        width: Math.round(box.right - box.x + left + (shot.padRight ?? PAD)),
        height: Math.round(box.bottom - box.y + top + (shot.padBottom ?? PAD)),
      };
  const png = await page.screenshot({ type: 'png', fullPage: true, clip });

  const b64 = await page.evaluate(async ({ dataUrl, w, h, quality }) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, w: clip.width * SCALE, h: clip.height * SCALE, quality: QUALITY });

  const buf = Buffer.from(b64, 'base64');
  const out = `${OUT_DIR}/${shot.name}.webp`;
  fs.writeFileSync(path.join(root, out), buf);
  console.log(`  ${out.padEnd(34)} ${String(clip.width * SCALE).padStart(5)}x${String(clip.height * SCALE).padEnd(5)}  ${(buf.length / 1024).toFixed(1).padStart(6)} KB   ${shot.note}`);
  await page.close();
}

console.log('');
await browser.close();
server.close();
