#!/usr/bin/env node
/* cockpit-shots.mjs -- capture the cockpit's own screen, in pieces, for the
 * page that explains it and for the homepage card that opens it.
 *
 *   node scripts/cockpit-shots.mjs              all of them, into img/cockpit/
 *   node scripts/cockpit-shots.mjs close-call   just that one
 *
 * WHY THIS EXISTS. A sentence naming where to go and look is not evidence, so
 * what the prototype page shows is captured from the running prototype rather
 * than drawn: a drawing of an interface is a claim about an interface, and
 * these are meant to be the thing itself.
 *
 * FOUR CAPTURES, DOWN FROM SIXTEEN. Until 2026-09-20 this file also made the
 * eight slides of a scroll-snap slideshow above the demo and a capture for
 * each of the five design decisions below it, and every one of those was a
 * photograph of something the reader could press for themselves a screen
 * away. The page keeps the four that earn a still: the hero's close call, the
 * rule and the stale reading under decision 02, which are the one comparison
 * the live panel can only make across two tab presses, and the wide close
 * call the HOMEPAGE's prototype card prints -- the one capture here that is
 * not for this page at all.
 *
 * It is a script and not an afternoon of screenshots for the reason dcf.mjs
 * and lucy.mjs are: the cockpit is still being designed. A restyle is one run
 * here, and a hand capture is the one that drifts out of step with the live
 * demo a section above it, which is the one place on this site where a stale
 * screenshot would be caught immediately and look worst.
 *
 * HOW A SHOT IS FRAMED. The page is loaded whole, then stripped to the
 * cockpit: the fixed header goes, the device bezel goes, and the switcher and
 * the situation's own two lines go.
 * That is the same strip cockpit.mjs does for the share card, and for the same
 * reason -- the rail is the page explaining the cockpit, and these captures
 * are what it is explaining. Then the shot clips to the union of one or more
 * elements, with a margin of warm ground so nothing is cut at the edge -- or
 * flush to the element, where the page draws the frame itself. `css` is the
 * per-shot half of that: what the card stops drawing once the file's own
 * edge is its edge.
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
 * A SLIDE IS FRAMED DIFFERENTLY FROM A SHOT. A shot clips to a card and stops
 * where the card stops, so it reads as a detail lifted out of a screen. A
 * slide names an `aspect` instead: the clip takes the region's own top edge
 * and then a fixed window of that ratio down from it, whatever is in the way.
 * So a slide is a WINDOW ON THE SCREEN rather than a cut-out of one, and a
 * card that runs past the bottom edge runs past it the way it does on a
 * monitor. One slide is left -- the homepage card's -- and `aspect` stays
 * because that card's whole argument is that the window is the device's own
 * 4:3 shape.
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
   which reads as a miscut rather than as context.

   THE HERO OVERRIDES THREE SIDES TO ZERO, and it is not an exception to that
   reasoning so much as the other end of it. Ground reads as context when the
   file's edge is the only edge. When the page puts the file inside a rounded,
   keylined figure -- which .ckw-hero-figure img does, and nothing else on
   this page does -- the ground is not context, it is a second frame inside
   the first, and the card looks like it is floating in a tray. */
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
    /* 900 gives the comparison's three columns room without stretching them
       into a band no hero column can carry.

       WAS .ck-pair, WHICH NO LONGER EXISTS. The close call was two option
       cards side by side and is now one comparison table, so the crop runs
       from the top of the card to the bottom of that table -- which ends on
       the two Assign buttons, and is the whole argument in one frame. */
    width: 900,
    clip: ['.ck-lead'],
    /* FLUSH ON THREE SIDES, BECAUSE THE PAGE ALREADY DRAWS THIS ONE'S EDGE.
       The pad here was 24 a side, then 12 at the top -- the gap above is 24,
       so a 24 pad cut straight through .ck-load's bottom border and the blur
       under it. Both numbers were answering the wrong question. The page
       prints this file through .ckw-hero-figure img, which gives it a 12px
       radius and --shadow-media: a keyline, a contact shadow and a tucked
       drop. So the ground inside the file was sitting between two edges --
       the card's own 20px curve and the figure's 12px one -- and what a
       reader saw was a band of cream with a rounded rectangle floating in
       it. One frame, not two. The crop runs to the card's border box and the
       figure's shape IS the card's shape.

       The bottom is the exception and stays a cut, for the reason padBottom
       gives: the card carries on past .ck-vs, and the frame says so. */
    padTop: 0,
    padLeft: 0,
    padRight: 0,
    /* What the card stops drawing, now that the file's edge is its edge. The
       20px curve would leave a wedge of cream in each top corner inside the
       figure's 12px one. The 1px border would sit against the keyline in
       --shadow-media and make a 2px edge, which is the one thing that
       token's own comment asks a consumer not to do. And a shadow has
       nothing left to fall on. The fill and the padding are untouched, so
       nothing inside the card moves a pixel. */
    css: '.ck-lead { border-radius: 0 !important; border-color: transparent !important; box-shadow: none !important; }',
    /* The record card under it is decision 02's picture and would double the
       height of a hero image; the cut lands in the flat ground between the
       two, so the crop ends on the card's own background rather than on a
       sentence in half. */
    bottomOf: '.ck-vs',
    padBottom: 10,
    note: 'the hero: two options the system will not separate',
  },
  /* Decision 02's two frames, since 2026-09-19: the rule and the reading,
     one above the other on the page so a reader sees that they are not the
     same colour of thing even though they share the one caution colour. */
  {
    name: 'rule',
    scenario: 'rule',
    width: 1320,
    /* The card alone. The recommendation under it is slide 4's picture. */
    clip: ['.ck-rule'],
    /* Cut into both neighbours, and for the same reason close-call cut into
       one: 24 of pad against a 24 gap above (.ck-load) and a 20 gap below
       (.ck-lead). The top carried .ck-load's border and the blur under it;
       the bottom carried 4px of .ck-lead's own top edge, which reads as a
       second card starting rather than as ground. Both land in the flat
       ground now. */
    padTop: 12,
    padBottom: 10,
    note: '02, first frame: a rule, before any score',
  },
  {
    name: 'stale',
    scenario: 'tie',
    width: 1320,
    /* The note the close call adds when one side's hours figure is older
       than load.staleMin, with the heading over it so the note has a
       subject. The comparison under both is the hero's picture. */
    clip: ['.ck-reco-h', '.ck-fresh'],
    note: '02, second frame: a figure the system will not vouch for',
  },

  /* ----- the homepage card's window --------------------------------------
     THE ONE CAPTURE HERE THAT IS NOT FOR THE PROTOTYPE PAGE. index.html's
     prototype card prints this inside a tablet, so it is a window on the
     screen rather than a cut-out: 680 by 510, which is 4:3, and a tablet in
     landscape IS 4:3, so the window's shape is the device's shape and nothing
     has to be reconciled -- the argument the card makes. At 680 the cockpit is
     in its one-column layout, so a window this size holds one card at its real
     size rather than a whole screen at half of it. Its three companions and
     the four narrow variants went with the slideshow on 2026-09-20; check
     index.html before deleting this one. */
  {
    name: 'slide-close-call',
    scenario: 'tie',
    width: 680,
    aspect: 4 / 3,
    stagePad: 20,
    /* THE WINDOW STARTS AT THE STALE NOTE, NOT AT THE HEADLINE. It started
       at the headline while this was slide 2 of four, where the picture had
       to say the tradeoff in words because nothing beside it did. On the
       homepage the card says it: the h3 names the recommendation a
       dispatcher can check and overrule, and the paragraph under it says
       the AI shows the factors and the tradeoffs. A second copy of that in
       the picture cost the evidence -- the headline, its dek and the note
       are 270 of the window's 510, so the comparison got the option heads
       and one row cut through its bar, and the one thing a card like this
       is for is showing that the thing is real.

       Anchored 20 above the note, the same warm margin the other shots
       leave, the window holds the note, the option heads and BOTH rows the
       comparison marks "the tradeoff", each with its figure, its direction
       and its bar, and opens on the third. That third row running past the
       bottom edge is the point of a window rather than a cut-out: the
       screen carries on. */
    clip: ['.ck-fresh'],
    padTop: 20,
    note: 'the homepage card: the stale note, and the two rows that separate the trucks',
  },

];

/* The strip. Everything here is page furniture around the cockpit, or the
   page talking about it: the switcher, the sentence saying what the situation
   is and the nudge under it. All three belong to the page, and a capture that
   kept them would be a picture of this page rather than of the interface. */
const strip = (pad = 40, ground) => [
  '.site-nav { display: none !important; }',
  /* The ground the window is cut from. The screen's own is warm, and a slide
     anchored on the tea-light answer zone shows that warm as a 20px margin
     down each side of the tablet -- which on a device reads as a gutter, a
     screen that does not fill its glass, rather than as the interface's
     ground. A shot that names a ground paints the cockpit that color so the
     zone runs to the edge of the glass. The layout does not move: same
     widths, same 20px, only what the margin is filled with. */
  ground ? `.ck { background: var(--color-${ground}) !important; }` : '',
  '.ck-frame { width: 100% !important; padding: 0 !important; background: none !important; box-shadow: none !important; }',
  '.ck { padding: 0 !important; border-radius: 0 !important; }',
  '.ck-situation, .ck-tabs-label, .ck-tabs { display: none !important; }',
  /* The moved markers go too, and for the same reason the switcher does.
     They say "this row changed rank since the situation you were just
     looking at", which is true of a reader flicking between four tabs and
     meaningless in a still picture -- the picture has no previous situation.
     The script loads the scenarios in one page, so without this every
     capture after the first carries arrows nothing in the frame explains. */
  '.ck-rank-moved { display: none !important; }',
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
  await page.addStyleTag({ content: strip(shot.stagePad, shot.ground) + (shot.css ?? '') });
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
  /* `padTop` was a slide's dial only, and a shot's top edge was the one side
     of the four that could not be moved -- which is why close-call and rule
     both shipped with a hairline and the blur under it along the very top.
     Same override, same default, now read by both branches. */
  const top = shot.padTop ?? PAD;
  /* A slide takes the viewport whole and a height from its ratio; a shot
     takes the union and stops where the union stops. The union is still what
     a slide is positioned BY -- it is the thing the window is aimed at -- it
     just no longer decides where the window ends. */
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
