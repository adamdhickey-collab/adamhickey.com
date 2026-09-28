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
    /* THE HERO IS A CROP A READER CAN READ. The whole shell printed at the
       hero column's width was seven-pixel type; the crop is the answer's
       head, the note and the comparison, at 900 wide so the frame prints it
       near its drawn size. The whole console is the next shot, behind the
       caption's link. */
    width: 900,
    clip: ['.dc-lead'],
    bottomOf: '.dc-series',
    padRight: 0,
    css: '',
    note: 'the hero: a deploy that is live and failing, read rather than refused',
  },
  {
    name: 'console-full',
    scenario: 'degraded',
    /* THE WHOLE SCREEN, TO THE FOOT OF THE ANSWER: the crumbs with the
       environment in them, the menu down the left with the incident chip,
       the project card and the reading. Linked from the hero's caption. */
    width: 1100,
    clip: ['.dc-shell'],
    bottomOf: '.dc-lead',
    padRight: 0,
    css: '',
    /* A reference behind a link, not a print: a lighter encode. */
    quality: 0.72,
    note: 'the whole console, behind the hero caption\'s link',
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
    /* NO EDGE IN THE FILE. The card's 2px caution edge is the argument of
       the card, and the page draws it -- .dcw-frame--fail img carries the
       same border in the same ink -- so the file is the fill and its
       contents, square-cornered, and the figure's own radius and border
       are the only edge a reader sees. An edge captured in the file sat
       inside the figure's edge and read as two lines. */
    /* The padding box only: the page draws the 2px red edge on the figure
       at the width the screen draws it. */
    css: '.dc-fail { border: 0 !important; border-radius: 0 !important; }',
    note: '02, first frame: a refusal, on the caution ground',
  },
  {
    name: 'reading',
    scenario: 'degraded',
    /* 1000, not 1320: the table runs the answer's width beside the menu,
       and at 1320 the file came out far wider than the frame prints it,
       which is 7px type. At 1000 the table is about 650 wide and the frame
       prints it near its drawn size. */
    width: 1000,
    /* THE TRACE AND THE TIMELINE, on the zone's own ground. The reading
       stopped being a white card on 2026-09-28 and became the cockpit's
       close call: a raised note and a table of the two deploys. The frame is
       those two with the zone's muted-light around them, so the picture
       carries its ground and the page frames it the ordinary way. */
    clip: ['.dc-trace', '.dc-series'],
    /* The actions row starts under the table, inside the bottom margin, and
       a sliver of the button came into the frame; the frame is the reading,
       so the row is hidden for the capture and the ground runs on. */
    css: '.dc-vs-foot, .dc-routes { visibility: hidden !important; }',
    note: '02, second frame: a reading, the two deploys compared',
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
    clip: ['.dc-read'],
    /* The zone's own hairline ran down the left of the frame, one line
       with nothing on the far side of it; the zone's edge is not the
       picture, so it is hidden for the capture. */
    css: '.dc-lead { border-color: transparent !important; }',
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
  }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, w: clip.width * SCALE, h: clip.height * SCALE, quality: shot.quality ?? QUALITY });

  const buf = Buffer.from(b64, 'base64');
  const out = `${OUT_DIR}/${shot.name}.webp`;
  fs.writeFileSync(path.join(root, out), buf);
  console.log(`  ${out.padEnd(34)} ${String(clip.width * SCALE).padStart(5)}x${String(clip.height * SCALE).padEnd(5)}  ${(buf.length / 1024).toFixed(1).padStart(6)} KB   ${shot.note}`);
  await page.close();
}

console.log('');
await browser.close();
server.close();
