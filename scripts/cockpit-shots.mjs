#!/usr/bin/env node
/* cockpit-shots.mjs -- capture the cockpit's own screen, in pieces, for the
 * page that explains it.
 *
 *   node scripts/cockpit-shots.mjs            all six, into img/cockpit/
 *   node scripts/cockpit-shots.mjs factors    just that one
 *
 * WHY THIS EXISTS. The prototype page argues four design decisions and, until
 * #78, ended each one with a sentence naming where to go and look. A sentence
 * is not evidence. Each decision now sits beside the piece of interface that
 * makes it, and the pieces are captured from the running prototype rather than
 * drawn, because a drawing of an interface is a claim about an interface and
 * these are meant to be the thing itself.
 *
 * It is a script and not an afternoon of screenshots for the reason dcf.mjs
 * and lucy.mjs are: the cockpit is still being designed. A restyle is one run
 * here, and a hand capture is the one that drifts out of step with the live
 * demo three sections above it, which is the one place on this site where a
 * stale screenshot would be caught immediately and look worst.
 *
 * HOW A SHOT IS FRAMED. The page is loaded whole, then stripped to the
 * cockpit: the fixed header goes, the device bezel goes, and the switcher and
 * the situation's own two lines go.
 * That is the same strip cockpit.mjs does for the share card, and for the same
 * reason -- the rail is the page explaining the cockpit, and these captures
 * are what it is explaining. Then the shot clips to the union of one or more
 * elements, with a margin of warm ground so nothing is cut at the edge.
 *
 * THE VIEWPORT IS PART OF THE SHOT. The cockpit is responsive and two of its
 * arrangements are load-bearing: the close call puts its two options side by
 * side from 800px, and the fleet data table is 60rem wide before it starts to
 * scroll inside its wrapper. Each shot names the viewport that renders it the
 * way the decision beside it describes, and the widths below are chosen so a
 * capture lands near the size it is displayed at -- a 960px table shown at 660
 * is 10px type, and the whole point of showing the table is that it can be
 * read.
 *
 * THE SLIDES ARE FRAMED DIFFERENTLY FROM THE SHOTS, and the difference is the
 * whole reason they can sit on the same page. A shot clips to a card and stops
 * where the card stops, so it reads as a detail lifted out of a screen. A slide
 * names a `aspect` instead: the clip takes the region's own top edge and then a
 * fixed 16:10 window down from it, whatever is in the way. So a slide is a
 * WINDOW ON THE SCREEN rather than a cut-out of one, every slide is the same
 * shape as every other, and a card that runs past the bottom edge runs past it
 * the way it does on a monitor. That is what keeps the slideshow above from
 * printing the same six pictures the four decisions print below.
 *
 * A uniform shape is not a nicety here. The slides sit in a scroller where the
 * next one shows at the edge, and a track of ragged heights is the difference
 * between a gallery and a pile. It is the reason `aspect` exists rather than a
 * per-slide pad.
 *
 * Chromium encodes the WebP, for the reason lucy.mjs gives: one encoder, one
 * answer to how a pixel is rounded. 0.82, which is what cockpit.mjs and
 * dcf.mjs use for a capture of a screen; the 0.86 in illustrate.mjs is for
 * artwork with gradients in it, and there is none here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, resolveRoot, serve } from './lib/harness.mjs';

const root = resolveRoot('cockpit-shots.mjs');
const OUT_DIR = 'img/cockpit';
const QUALITY = 0.82;
/* Two device pixels per CSS pixel, then the file is written at the capture's
   own CSS size: the page displays these under 700px and a 2x source is what
   keeps a Retina reader from seeing a soft screenshot of a sharp interface. */
const SCALE = 2;
/* Warm ground left around each clip. --space-lg, in the value it resolves to
   at these widths; a clip flush to the element reads as a torn-out rectangle
   rather than a piece of a screen. A shot overrides one side where 24 would
   reach past the gap between two cards and let a sliver of the neighbour in,
   which reads as a miscut rather than as context. */
const PAD = 24;

/* Each shot: the situation to load, the viewport that renders it correctly,
   what to clip to, and anything to do first. `open` expands a <details>.

   `aspect` makes it a slide instead of a shot: the clip keeps the union's top
   edge and its full width, and takes its height from the ratio rather than
   from where the content happens to end. `padTop` moves that top edge, which
   is the one dial a slide has -- everything below follows from it. */
const SHOTS = [
  {
    name: 'close-call',
    scenario: 'tie',
    /* 900 clears the 800px the pair needs to sit side by side and leaves the
       panel at 820, which is near the width the hero shows it at. Wider
       stretches the two option cards into a band no hero column can carry. */
    width: 900,
    clip: ['.ck-lead'],
    /* Top of the close-call card down to the bottom of the two options. The
       record card under them is decision 02's picture and it would double the
       height of a hero image; the cut lands in the flat ground between the
       two, so what the crop ends on is the card's own background rather than
       a sentence in half. */
    bottomOf: '.ck-pair',
    /* 24 under the pair reaches into the gap above the record card and lets
       its top edge through; the gap is --space-lg. */
    padBottom: 10,
    note: 'the hero: two options the system will not separate',
  },
  {
    name: 'factors',
    scenario: 'confident',
    /* 1320 is the width the cockpit is designed for, not the width a laptop
       gives it. The frame on the page runs to 1920 because this is a monitor
       interface, and at 1240 of panel the fleet data table is whole, the pair
       is side by side and the factor card is 600 wide -- near the size these
       captures are displayed at. At 1440, a laptop, the panel is 912 and the
       table scrolls inside its wrapper; that is real, and it is not what
       these four are about. */
    width: 1320,
    clip: ['.ck-card'],
    /* The gap to the record card beside it is 24, so a 24 pad lands exactly
       on that card's border. */
    padRight: 12,
    note: '01: the factor list, on its own',
  },
  {
    name: 'outcomes',
    scenario: 'confident',
    width: 1320,
    /* Expanded, not summarised. The decision this sits beside is that the
       exceptions are the useful part, and a capture of the closed disclosure
       would show the percentage the decision argues against. */
    open: '.ck-misses',
    clip: ['.ck-confidence'],
    padLeft: 12,
    padBottom: 12,
    note: '02: the record, with the two misses open',
  },
  {
    name: 'override-choose',
    scenario: 'confident',
    width: 1320,
    /* The head and three rows, not the whole table: 04 below shows the table
       whole, and two captures of the same seven rows a section apart would
       read as one picture printed twice. This one is about the control at the
       end of every row. */
    clip: ['.ck-table thead', '.ck-table tbody tr:nth-child(3)'],
    /* No margin under it. The clip ends on the third row's own bottom rule,
       and a pad there would let a quarter of the fourth row through, which
       reads as a mistake rather than as a table that continues. */
    padBottom: 0,
    note: '03, first frame: Assign on every row the rule allows',
  },
  {
    name: 'override-after',
    scenario: 'override',
    width: 1320,
    clip: ['.ck-status', '.ck-why'],
    note: '03, second frame: the question afterwards',
  },
  {
    name: 'fleet',
    scenario: 'rule',
    width: 1320,
    clip: ['.ck-fleet'],
    note: '04: the whole fleet, and the row a rule removed',
  },

  /* ----- the slides ------------------------------------------------------
     Five windows on the screen, in the order the section walks them. All
     1320 by 880, all at the same 1240 of panel, so the interface is the same
     size on every slide and the track has one height. The only dial is where
     the window starts, and each says what it is anchored to and why. */
  {
    name: 'slide-pick',
    scenario: 'confident',
    width: 1320,
    aspect: 1.5,
    clip: ['.ck-load'],
    /* 46 above the load bar puts the window's top edge just into the warm
       margin over the screen, and the 880 that follows lands six pixels
       short of the fleet data table: the load, the whole recommendation and
       the line that says what the system settled on, ending on ground. */
    padTop: 46,
    note: 'slide 1: the load, the pick and its reasons',
  },
  {
    name: 'slide-record',
    scenario: 'confident',
    width: 1320,
    aspect: 1.5,
    open: '.ck-misses',
    clip: ['.ck-reco'],
    /* 20 into the 24 of ground between the load bar and the recommendation.
       40 reached past it and let the load card's bottom border through, and
       a rounded corner cut off by the top edge of a slide reads as a miscut
       rather than as a screen that continues. Every slide here starts on
       ground for that reason. */
    padTop: 20,
    note: 'slide 2: the outcome record, with both misses open',
  },
  {
    name: 'slide-close-call',
    scenario: 'tie',
    width: 1320,
    aspect: 1.5,
    clip: ['.ck-reco'],
    /* The headline is the slide -- it is where the tradeoff is said in
       words -- so the window starts there and the record card below runs
       past the bottom edge rather than the headline being dropped to fit
       it. */
    padTop: 20,
    note: 'slide 3: two trucks the system will not separate',
  },
  {
    name: 'slide-override',
    scenario: 'override',
    width: 1320,
    aspect: 1.5,
    clip: ['.ck-status', '.ck-why'],
    /* The only slide that does not start at the top of the screen. It starts
       in the ground under the recommendation, which is still up there and is
       what the caption says; what this window is for is the three things
       below it -- the line that says what happened, the question, and the row
       in the data table now reading Assigned, Undo. */
    padTop: 18,
    note: 'slide 4: the question, after the override',
  },
  {
    name: 'slide-rule',
    scenario: 'rule',
    width: 1320,
    aspect: 1.5,
    clip: ['.ck-reco'],
    /* Anchored on the caution card rather than on the data table. The table
       under this situation is the `fleet` shot four sections down, and a
       slide cut from the same rows would be that picture printed twice. */
    padTop: 20,
    note: 'slide 5: a rule, above the best truck the rule allows',
  },

  /* ----- the same five slides, for a phone ------------------------------
     A 1320px capture shown 330px wide is a picture of an interface nobody
     could read, which on a page arguing that seven trucks stay in reach at
     once would be the worst place on this site to make that claim badly. So
     the narrow slides are not the wide ones scaled: they are the cockpit's
     own phone layout, captured at the width it is designed for, and the
     slideshow serves them under 48rem with <picture>.

     390 by 820 rather than 16:10, because that is the shape of the thing
     being photographed. A phone screen is portrait and every card on it is
     stacked, so a landscape window would hold two rows of one card. */
  {
    name: 'slide-pick-sm',
    scenario: 'confident',
    width: 390,
    aspect: 390 / 820,
    stagePad: 16,
    clip: ['.ck-load'],
    padTop: 16,
    note: 'slide 1, narrow',
  },
  {
    name: 'slide-record-sm',
    scenario: 'confident',
    width: 390,
    aspect: 390 / 820,
    stagePad: 16,
    open: '.ck-misses',
    /* Anchored on the record card itself and not on the recommendation. On a
       phone the two cards are stacked rather than side by side, so starting
       at the top of the recommendation would spend the whole window on the
       factor list and never reach the misses this slide is about. */
    clip: ['.ck-confidence'],
    padTop: 16,
    note: 'slide 2, narrow',
  },
  {
    name: 'slide-close-call-sm',
    scenario: 'tie',
    width: 390,
    aspect: 390 / 820,
    stagePad: 16,
    clip: ['.ck-reco'],
    padTop: 16,
    note: 'slide 3, narrow',
  },
  {
    name: 'slide-override-sm',
    scenario: 'override',
    width: 390,
    aspect: 390 / 820,
    stagePad: 16,
    clip: ['.ck-status', '.ck-why'],
    padTop: 16,
    note: 'slide 4, narrow',
  },
  {
    name: 'slide-rule-sm',
    scenario: 'rule',
    width: 390,
    aspect: 390 / 820,
    stagePad: 16,
    clip: ['.ck-reco'],
    padTop: 16,
    note: 'slide 5, narrow',
  },
];

/* The strip. Everything here is page furniture around the cockpit, or the
   page talking about it: the switcher, the sentence saying what the situation
   is and the nudge under it. All three belong to the page, and a capture that
   kept them would be a picture of this page rather than of the interface. */
const strip = (pad = 40) => [
  '.site-nav { display: none !important; }',
  '.ck-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.ck { padding: 0 !important; border-radius: 0 !important; }',
  '.ck-situation, .ck-tabs-label, .ck-tabs { display: none !important; }',
  /* The ground left around the screen inside the capture. 40 is a tenth of a
     390px phone frame and reads as a margin rather than as ground, so the
     narrow slides ask for 16 instead. */
  `.ck-stage { display: block !important; margin: 0 !important; padding: ${pad}px !important; }`,
].join(' ');

const want = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const shots = want.length ? SHOTS.filter((s) => want.includes(s.name)) : SHOTS;
if (!shots.length) {
  console.error(`  no such shot. Known: ${SHOTS.map((s) => s.name).join(', ')}`);
  process.exit(2);
}

const chromium = loadChromium('cockpit-shots.mjs');
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
  await page.goto(`${origin}/prototype/dispatch-cockpit.html`, { waitUntil: 'networkidle' });
  /* The situation is chosen before the strip hides the tabs: the tab is the
     only way in, and hiding it first would leave the click with no target. */
  await page.click(`[data-scenario="${shot.scenario}"]`);
  await page.waitForTimeout(200);
  await page.addStyleTag({ content: strip(shot.stagePad) });
  if (shot.open) await page.click(`${shot.open} summary`);
  await page.waitForTimeout(400);

  /* The union of the clip targets, in page coordinates, padded. A full-page
     screenshot is what takes the clip: the panel is taller than the viewport
     and a viewport shot cannot clip outside itself. */
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
  /* A slide takes the viewport whole and a height from its ratio; a shot
     takes the union and stops where the union stops. The union is still what
     a slide is positioned BY -- it is the thing the window is aimed at -- it
     just no longer decides where the window ends. */
  const clip = shot.aspect
    ? {
        x: 0,
        y: Math.max(0, Math.round(box.y - (shot.padTop ?? PAD))),
        width: shot.width,
        height: Math.round(shot.width / shot.aspect),
      }
    : {
        x: Math.max(0, Math.round(box.x - left)),
        y: Math.max(0, Math.round(box.y - PAD)),
        width: Math.round(box.right - box.x + left + (shot.padRight ?? PAD)),
        height: Math.round(box.bottom - box.y + PAD + (shot.padBottom ?? PAD)),
      };
  const png = await page.screenshot({ type: 'png', fullPage: true, clip });

  /* Down to the capture's CSS size and into WebP, in the page's own canvas.
     Same encoder every time is the whole reason this does not shell out. */
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
  /* The dimensions are printed because the markup has to carry them: a
     figure without width and height reserves the wrong box and shifts the
     page as it decodes, which is the one rule the asset carve-out in
     CLAUDE.md will not waive. */
  console.log(`  ${out.padEnd(34)} ${String(clip.width * SCALE).padStart(5)}x${String(clip.height * SCALE).padEnd(5)}  ${(buf.length / 1024).toFixed(1).padStart(6)} KB   ${shot.note}`);
  await page.close();
}

console.log('');
await browser.close();
server.close();
