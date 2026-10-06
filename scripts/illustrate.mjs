#!/usr/bin/env node
/**
 * illustrate.mjs -- take a generated engagement drawing into the set.
 *
 *   node scripts/illustrate.mjs step   img/inbox/step-clarity-01.png img/engagement/step-clarity-01.webp
 *   node scripts/illustrate.mjs invite img/inbox/clarity-invite.png  img/engagement/clarity-invite.webp
 *   node scripts/illustrate.mjs hero   img/inbox/clarity-hero.png    img/engagement/clarity-hero.webp
 *   node scripts/illustrate.mjs feature img/inbox/sap-fiori.png       img/writing/standardizing-ux-across-40-sap-fiori-apps.webp --brightness 1
 *   node scripts/illustrate.mjs card    img/inbox/sap-fiori.png       img/writing/standardizing-ux-across-40-sap-fiori-apps-card.webp --brightness 1
 *   node scripts/illustrate.mjs card    img/inbox/01-clarity.png       img/engagement/01-clarity.webp --brightness 1 --breathe 0.94
 *   node scripts/illustrate.mjs mark    img/inbox/loop-system.png      img/lab/loop-system.webp
 *   node scripts/illustrate.mjs stage   img/inbox/tour-stage.png       img/lab/tour-stage.webp --part cup=1264,0,272,244
 *   node scripts/illustrate.mjs cutout  img/inbox/tour-mat.png         img/lab/tour-mat.webp --part ruler=120,120,700,180
 *   node scripts/illustrate.mjs report img/engagement/clarity-hero.webp
 *   node scripts/illustrate.mjs wall   img/engagement/step-system-02.webp --match img/engagement/system-hero.webp
 *   node scripts/illustrate.mjs grain  img/engagement/step-embedded-03.webp
 *
 * The README's style spec describes three passes that were only ever done by
 * hand, in a Chromium canvas, and redone for every batch. This is that code.
 *
 *   crop     A generator batch sometimes comes back with a pale border baked
 *            in, rounded corners and all. The border is measured from the
 *            corner color inward, a fixed 24px is taken past it, and the
 *            largest rectangle of the slot's aspect inside that is kept. A
 *            fixed step rather than a search for the first non-pale pixel,
 *            because a scene with a legitimately pale floor loses a figure
 *            to the search (README, "Two step sets move onto the sage wall").
 *   resample To the slot: steps 1080x720, invitations 1536x1024, heroes
 *            1774x887, which are the native sizes the set is stored at.
 *            The writing features are 16:9, 1600x900 on the article and
 *            640x360 as the card on the index, both cut from one drawing.
 *   breathe  Opt-in, and only with --breathe s: the drawing is set at s of the
 *            slot on its own ground, centred and anchored to the bottom edge,
 *            which is how a picture the generator framed too tight gets its
 *            band of ground without being redrawn. The flag's own comment has
 *            why the anchor is the bottom and not the centre.
 *   lift     Steps and invitations: brightness 1.15 (or --brightness n), contrast 1.06,
 *            saturation left alone. Heroes: the same contrast, and the
 *            brightness binary-searched until the wall lands at 8.0:1 against
 *            charcoal, because the title, kicker and dek sit on that wall with
 *            no scrim. The wall is sampled where the spec says it has to be
 *            empty: the left two-fifths, upper half.
 *
 * `report` measures a file the way the README's figures are quoted: mean
 * luminance 0-255 (the set sits at 126-184) and, for a 2:1 file, the wall
 * ratio against charcoal.
 *
 * `wall` re-exposes a drawing that is already in the set so that it carries
 * its page's wall. The README has said since 2026-09-04 that each page's six
 * drawings share the color its hero was solved to, and nothing enforced it:
 * the hero is solved and the other five take the flat 1.15, which multiplies
 * whatever exposure the generator happened to return. So the walls drifted
 * apart while every file stayed inside the set's 126-184 mean, which is a
 * whole-image figure and cannot see a wall. Measured against their heroes the
 * sixteen steps and four invitations ran from 14 below to 28 above, and the
 * two worst were on one page, which is how it was noticed -- by eye, on
 * Design System Foundation, where the invitation and step 2 sit at 9.9:1
 * against charcoal beside a hero at 7.9:1.
 *
 * It takes the same binary search the hero takes, against `--match`'s wall
 * rather than a fixed 8:1, so like is compared with like: the reference is
 * measured by the same probe in the same run. No crop and no contrast --
 * contrast 1.06 is already in these files and applying it twice compounds.
 * Re-exposure only, at the same pixel size.
 *
 * The probe is the modal color of the top eighth, quantized to 8 levels a
 * channel, not the hero's mean of the left two-fifths. A hero's wall is
 * specified to be empty there because the title sits on it; a step's subject
 * can be anywhere, and a mean of a box a monitor intrudes into is a reading of
 * the monitor. The mode ignores an intruder until it takes over the strip, and
 * it reproduces the five solved heroes at 7.87 to 8.06:1 -- close enough to
 * the box probe to be the same measurement, which is the point of matching a
 * reference rather than a constant.
 */
/* Through the harness, like the other five browser scripts. This one imported
   playwright-core and launched with no executablePath, so it found a browser
   only where Playwright's own download happened to be current -- and CHROME,
   which every other script here honors, did nothing. */
import { findChrome, loadChromium } from './lib/harness.mjs';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const chromium = loadChromium('illustrate.mjs');

const SLOT = {
  step:   { w: 1080, h: 720 },
  invite: { w: 1536, h: 1024 },
  hero:   { w: 1774, h: 887 },
  /* The writing features. One 16:9 drawing per article, stored twice: the
     feature under the article's dek, and the card beside its entry on the
     index. Both from the same source in one pass each, so the card is the
     feature's crop and not a second guess at it. These drawings come back
     from the generator at the set's exposure already (158-191 mean against
     the engagement set's 126-184 band), so they take --brightness 1 rather
     than the flat 1.15 the drab step batches needed. */
  feature: { w: 1600, h: 900 },
  card:    { w: 640,  h: 360 },
  tour:    { w: 960,  h: 540 },
  /* A spot drawing on a transparent ground, built on a disc: the six steps
     of the Agent Review loop (draw.mjs --set loop). Square, and 352 because
     it is printed at most 11rem wide, 176px, and a capture is never printed
     above half its file. Not cropped by border, not lifted: see `mark`
     below. */
  mark:    { w: 352,  h: 352 },
  /* A ground for words to sit on: the desk behind the Agent Review tour
     (tour-scenes.mjs, STAGE), the screen and the notes laid over it, for
     one afternoon; the tour's ground is a CSS mat now. 3:2,
     the generator's own size, because the box it fills runs from about 1.2
     to 1.8 wide to tall with the window and is cut by background-size:
     cover. Not lifted and not contrasted: its ground is SOLVED to
     --color-tea-light, exactly, so the notes over it read at the ratios
     COLOR.md quotes for that ground (see `stage` below). */
  stage:   { w: 1536, h: 1024 },
  /* Objects drawn on a TRANSPARENT ground, to lie on a ground the page
     draws itself: the cutting mat behind the Agent Review tour, whose grid
     is CSS, so no ground in a picture could line up with it. Nothing is
     solved, lifted or contrasted; each --part is trimmed to the opaque
     pixels inside its rectangle and written with its alpha. With no
     --part, the run only lists the groups it finds, which is how the
     rectangles are measured after a redraw. */
  cutout:  { w: 1536, h: 1024 },
};
/* The share of a mark's slot its disc spans, in every file of the set, so
   six drawings side by side carry six discs of one size on one line
   whatever the generator did with the frame. 0.72 is the most the six of
   2026-10-06 take: at 0.76 four of them lose the end of a brick, an arm or
   a branch off a side, and the cut refuses. --disc overrides it for a
   drawing whose object reaches further out than the set's. */
let DISC = 0.72;
const CHARCOAL = [0x25, 0x25, 0x25];
const TEA_LIGHT = [0xe8, 0xed, 0xe5];   // --color-tea-light, the ground a stage is solved to
const WALL_TARGET = 8.0;
const LIFT = { brightness: 1.15, contrast: 1.06 };
const QUALITY = 0.86;

/* --crop x,y,w,h takes a source rectangle by hand, for the batch where the
   generator put a second accent at the edge of an otherwise right picture.
   It has to be the slot's aspect, near enough; the tool refuses otherwise
   rather than stretch. */
const args = process.argv.slice(2);
let manualCrop = null;
const ci = args.indexOf('--crop');
if (ci >= 0) { manualCrop = args[ci + 1].split(',').map(Number); args.splice(ci, 2); }
/* --brightness n overrides the flat lift for a step or invitation the
   generator returned bright rather than drab: a flat lay of cream paper on
   sage came back at 183.9 and the 1.15 lift pushed it to 212, past the set's
   184. Heroes ignore it, since their brightness is solved, not chosen. */
const bi = args.indexOf('--brightness');
if (bi >= 0) { LIFT.brightness = Number(args[bi + 1]); args.splice(bi, 2); }
/* --breathe s gives a drawing that came back framed too tight the air it
   should have been drawn with, without redrawing it: the crop is resampled to
   s of the slot and set on the slot's own ground, centred, and anchored to the
   BOTTOM edge. The anchor is the whole point and not a default worth changing
   casually. These compositions hang one black shape off an edge -- 01's stream
   off the bottom, 02's rope off both sides -- and a drawing centred in its new
   frame lifts that shape off the edge it was drawn to leave by, which reads as
   a different picture rather than the same one with room around it.
   Bottom-anchored, the band the picture gains is all at the top, which is the
   edge a generator run crowds.
   The alternative -- sliding the drawing down inside its own frame and letting
   the bottom rows go -- keeps the object at full size but shortens whatever
   runs off the bottom by exactly as much, and on 01 that is the stream the
   card is about: at 80px of slide it is a stub. Scaling costs a few percent of
   object and keeps the composition. */
let breathe = 1;
const ai = args.indexOf('--breathe');
if (ai >= 0) { breathe = Number(args[ai + 1]); args.splice(ai, 2); }
/* --match <hero> is the wall mode's reference: the page's hero, whose wall
   every other drawing on the page is supposed to be sitting on. */
let matchPath = null;
const mi = args.indexOf('--match');
if (mi >= 0) { matchPath = args[mi + 1]; args.splice(mi, 2); }
/* --ceiling n overrides the grain mode's 0.45. */
let ceiling = 0.45;
const gi = args.indexOf('--ceiling');
if (gi >= 0) { ceiling = Number(args[gi + 1]); args.splice(gi, 2); }
/* --floor n goes the other way: a drawing the generator returned FLATTER than
   the set gets matched grain added. Opt-in, because the ceiling is the rule
   the set needed and a wall nobody complained about should be left alone. */
let floor = 0;
const fi = args.indexOf('--floor');
if (fi >= 0) { floor = Number(args[fi + 1]); args.splice(fi, 2); }
/* --part name=x,y,w,h, as many as wanted, stage only: instead of the whole
   picture, write each rectangle of the solved picture to <out>-<name>.webp.
   A stage is a few objects on an empty ground, and a box that changes
   shape with the window cannot hold one picture's corners still under
   background-size: cover, so each group is cut out and pinned to its own
   corner. The rectangles come from the registry (tour-scenes.mjs, STAGE). */
const parts = [];
for (let pi; (pi = args.indexOf('--part')) >= 0;) {
  const [name, spec] = args[pi + 1].split('=');
  /* A cutout's rectangle may go on to name the sides it cuts through on
     purpose (ruler=148,205,632,67,top), so an object the page means to show
     cropped is not reported as cut by accident. */
  const fields = spec.split(',');
  parts.push({ name, rect: fields.slice(0, 4).map(Number), cuts: fields.slice(4) });
  args.splice(pi, 2);
}
const di = args.indexOf('--disc');
if (di >= 0) { DISC = Number(args[di + 1]); args.splice(di, 2); }
const [role, inPath, outPath] = args;
/* A stage takes no lift: its ground is moved onto the token instead, and a
   brightness or contrast laid on top would move it off again. */
if (role === 'stage') { if (bi < 0) LIFT.brightness = 1; LIFT.contrast = 1; }
if (parts.length && role !== 'stage' && role !== 'cutout') { console.error('  ✗ --part cuts a stage or a cutout; it does not apply to ' + role); process.exit(2); }
const wallMode = role === 'wall';
const grainMode = role === 'grain';
if (wallMode && !matchPath) { console.error('  ✗ wall needs --match <the page\'s hero>'); process.exit(2); }
if (grainMode && !(ceiling > 0)) { console.error('  \u2717 --ceiling must be positive'); process.exit(2); }
if (grainMode && floor >= ceiling) { console.error('  \u2717 --floor must be under --ceiling'); process.exit(2); }
if (!role || !inPath || (role !== 'report' && !wallMode && !grainMode && (!SLOT[role] || !outPath)) || !(LIFT.brightness > 0)) {
  console.error('usage: illustrate.mjs <step|invite|hero|feature|card|tour|mark|stage|cutout> <in> <out> [--crop x,y,w,h] [--brightness n] [--breathe s] [--disc f]\n       illustrate.mjs wall <file> [<out>] --match <hero>\n       illustrate.mjs grain <file> [<out>] [--ceiling n]\n       illustrate.mjs report <file>');
  process.exit(2);
}
if (!(breathe > 0 && breathe <= 1)) { console.error('  ✗ --breathe is a fraction of the slot, over 0 and at most 1'); process.exit(2); }
/* Refused rather than ignored on the three roles that measure rather than
   frame. A hero's brightness is solved against a wall probe that reads a fixed
   box of the slot, and a band of ground moved under that box is a reading of
   the band; wall and grain re-expose a file that is already in the set at the
   size it is already stored at. */
if (breathe !== 1 && ['hero', 'wall', 'grain', 'report'].includes(role)) {
  console.error(`  ✗ --breathe does not apply to ${role}; it frames a drawing, and ${role} measures one`);
  process.exit(2);
}
if (role === 'mark' && (manualCrop || breathe !== 1)) {
  console.error('  ✗ a mark is framed by its disc, not by --crop or --breathe; use --disc');
  process.exit(2);
}
if (!(DISC > 0 && DISC < 1)) { console.error('  ✗ --disc is the disc\'s share of the slot, between 0 and 1'); process.exit(2); }
if (manualCrop && role !== 'report') {
  const want = SLOT[role].w / SLOT[role].h, got = manualCrop[2] / manualCrop[3];
  if (Math.abs(want - got) > 0.01) { console.error(`  ✗ --crop is ${got.toFixed(3)}:1; the ${role} slot is ${want.toFixed(3)}:1`); process.exit(2); }
}

const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(inPath).toLowerCase()];
const dataUrl = `data:${mime};base64,${readFileSync(inPath).toString('base64')}`;
const asUrl = (f) => `data:${{ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(f).toLowerCase()]};base64,${readFileSync(f).toString('base64')}`;
const matchUrl = matchPath ? asUrl(matchPath) : null;

const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const page = await browser.newPage();

const result = await page.evaluate(async ({ dataUrl, matchUrl, role, slot, charcoal, tea, wallTarget, lift, quality, manualCrop, breathe, ceiling, floor, disc, parts }) => {
  const lum = (r, g, b) => {
    const c = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(...a), lum(...b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  const img = new Image(); img.src = dataUrl; await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;

  // Read the source once for the border measurement and the report.
  const src = document.createElement('canvas'); src.width = W; src.height = H;
  const sctx = src.getContext('2d', { willReadFrequently: true }); sctx.drawImage(img, 0, 0);
  const px = (ctx, x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3);
  const meanOf = (ctx, x0, y0, w, h) => {
    const d = ctx.getImageData(x0, y0, w, h).data; let r = 0, g = 0, b = 0, l = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; l += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; }
    return { rgb: [r / n, g / n, b / n], mean: l / n };
  };
  const wallBox = (w, h) => [Math.round(w * 0.03), Math.round(h * 0.08), Math.round(w * 0.35), Math.round(h * 0.47)];

  /* Which pixels of the top eighth are wall: the ones in the modal bin, with
     the strip quantized to 8 levels a channel. It returns the offsets, not a
     color, and that is the whole trick. Re-running the mode after each step
     of the search reads a DIFFERENT set of pixels, because a bin boundary
     moves under the picture as it brightens, so the measurement jumps and the
     search does not converge -- three of the twenty files stopped 0.1 to 0.2
     short of their target that way. The mask is taken once, from the source,
     and the same pixels are measured at every brightness. A multiplier is
     monotonic on a fixed set, which is what the halving assumes.

     `share` is the bin's fraction of the strip. Under about a third, the top
     of this picture is not mostly wall and the reading is of whatever it is. */
  const wallMask = (ctx, w, h) => {
    const d = ctx.getImageData(0, 0, w, Math.round(h * 0.125)).data, bins = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const k = (d[i] >> 5) * 4096 + (d[i + 1] >> 5) * 64 + (d[i + 2] >> 5);
      let e = bins.get(k); if (!e) { e = { n: 0, at: [] }; bins.set(k, e); }
      e.n++; e.at.push(i);
    }
    let best = null; for (const e of bins.values()) if (!best || e.n > best.n) best = e;
    return { at: best.at, share: best.n / (d.length / 4), stripH: Math.round(h * 0.125) };
  };
  const wallAt = (ctx, w, mask) => {
    const d = ctx.getImageData(0, 0, w, mask.stripH).data;
    let r = 0, g = 0, b = 0; for (const i of mask.at) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    return [r / mask.at.length, g / mask.at.length, b / mask.at.length];
  };
  const hexOf = (rgb) => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

  /* Grain over the wall pixels: the RMS of a radius-1 high pass, on INTERIOR
     wall only -- every pixel within the blur's own radius has to be wall too.
     Measuring the mask's edge instead reports the subject: the blur reaches 2px,
     so a wall pixel beside a head takes some of the head, and the spread among
     masked pixels goes UP. Two files came back grainier after smoothing that
     way, which is the probe misreading, not the picture getting worse. */
  const GRAIN_R = 2;
  const grainOf = (ctx, w, mask) => {
    const d = ctx.getImageData(0, 0, w, mask.stripH).data, h = mask.stripH;
    const L = new Float64Array(w * h), inMask = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) L[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    for (const i of mask.at) inMask[i >> 2] = 1;
    const interior = (x, y) => {
      if (x < GRAIN_R || x >= w - GRAIN_R || y < GRAIN_R || y >= h - GRAIN_R) return false;
      for (let dy = -GRAIN_R; dy <= GRAIN_R; dy++) for (let dx = -GRAIN_R; dx <= GRAIN_R; dx++)
        if (!inMask[(y + dy) * w + (x + dx)]) return false;
      return true;
    };
    let sum = 0, n = 0;
    for (const i of mask.at) {
      const p = i >> 2, x = p % w, y = (p / w) | 0;
      if (!interior(x, y)) continue;
      let a = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (dx || dy) a += L[(y + dy) * w + (x + dx)]; }
      const v = L[p] - a / 8; sum += v * v; n++;
    }
    return { rms: n ? Math.sqrt(sum / n) : 0, n };
  };

  if (role === 'grain') {
    const mask = wallMask(sctx, W, H);
    const g0 = grainOf(sctx, W, mask), before = g0.rms;
    const wallBefore = ratio(wallAt(sctx, W, mask), charcoal);
    /* Too little interior wall and the number is noise about noise. */
    if (g0.n < 2000) return { width: W, height: H, before: +before.toFixed(3), interior: g0.n, share: +mask.share.toFixed(2), tooLittle: true };
    if (before < floor) {
      /* Add rather than take away. Zero-mean monochrome noise, so the wall the
         file was solved to keeps its color; the amplitude is searched the same
         way and through the encoder for the same reason. Seeded, so a re-run
         reproduces the file byte for byte. */
      let seed = 0x9e3779b9;
      const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 0xffffffff) - 0.5; };
      const noise = new Float64Array(W * H);
      for (let i = 0; i < W * H; i++) noise[i] = rnd();
      const src2 = sctx.getImageData(0, 0, W, H), s2 = src2.data;
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const octx = out.getContext('2d', { willReadFrequently: true });
      const im = octx.createImageData(W, H), od = im.data;
      const enc = document.createElement('canvas'); enc.width = W; enc.height = H;
      const ectx = enc.getContext('2d', { willReadFrequently: true });
      const rt = document.createElement('img');
      const addAt = async (amp) => {
        for (let p = 0; p < W * H; p++) {
          const n = noise[p] * amp;
          for (let ch = 0; ch < 3; ch++) od[p * 4 + ch] = Math.max(0, Math.min(255, s2[p * 4 + ch] + n));
          od[p * 4 + 3] = 255;
        }
        octx.putImageData(im, 0, 0);
        const u = out.toDataURL('image/webp', quality);
        rt.src = u; await rt.decode(); ectx.drawImage(rt, 0, 0);
        return u;
      };
      let lo = 0, hi = 24, amp = 0, u = null;
      for (let i = 0; i < 16; i++) {
        amp = (lo + hi) / 2; await addAt(amp);
        if (grainOf(ectx, W, mask).rms < floor) lo = amp; else hi = amp;
      }
      amp = hi; u = await addAt(amp);
      return {
        width: W, height: H, added: +amp.toFixed(2), interior: g0.n,
        before: +before.toFixed(3), after: +grainOf(ectx, W, mask).rms.toFixed(3),
        wallBefore: +wallBefore.toFixed(2), wallAfter: +ratio(wallAt(ectx, W, mask), charcoal).toFixed(2),
        share: +mask.share.toFixed(2), webp: u.split(',')[1],
      };
    }
    if (before <= ceiling) return { width: W, height: H, before: +before.toFixed(3), after: +before.toFixed(3), strength: 0, interior: g0.n, wallBefore: +wallBefore.toFixed(2), wallAfter: +wallBefore.toFixed(2), share: +mask.share.toFixed(2), untouched: true };

    /* Blur once, weight per pixel by how flat it is there, blend. The weight
       is what keeps this off the subject: a Gaussian in the local gradient,
       full at zero and effectively nothing by six levels, so an edge keeps
       every bit of its contrast however hard the flat ground is smoothed. */
    const src = sctx.getImageData(0, 0, W, H), sd = src.data;
    const L = new Float64Array(W * H);
    for (let i = 0, p = 0; i < sd.length; i += 4, p++) L[p] = 0.2126 * sd[i] + 0.7152 * sd[i + 1] + 0.0722 * sd[i + 2];

    const R = 2, tmp = new Float64Array(W * H * 3), blur = new Float64Array(W * H * 3);
    for (let y = 0; y < H; y++) for (let ch = 0; ch < 3; ch++) {
      let acc = 0, n = 0;
      for (let x = 0; x < W; x++) {
        if (x === 0) { for (let k = -R; k <= R; k++) { acc += sd[(y * W + Math.min(W - 1, Math.max(0, k))) * 4 + ch]; n++; } }
        else { acc += sd[(y * W + Math.min(W - 1, x + R)) * 4 + ch] - sd[(y * W + Math.max(0, x - R - 1)) * 4 + ch]; }
        tmp[(y * W + x) * 3 + ch] = acc / n;
      }
    }
    for (let x = 0; x < W; x++) for (let ch = 0; ch < 3; ch++) {
      let acc = 0, n = 0;
      for (let y = 0; y < H; y++) {
        if (y === 0) { for (let k = -R; k <= R; k++) { acc += tmp[(Math.min(H - 1, Math.max(0, k)) * W + x) * 3 + ch]; n++; } }
        else { acc += tmp[(Math.min(H - 1, y + R) * W + x) * 3 + ch] - tmp[(Math.max(0, y - R - 1) * W + x) * 3 + ch]; }
        blur[(y * W + x) * 3 + ch] = acc / n;
      }
    }
    const GK = 6.0, flat = new Float64Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const gx = Math.abs(L[y * W + Math.min(W - 1, x + 1)] - L[y * W + Math.max(0, x - 1)]);
      const gy = Math.abs(L[Math.min(H - 1, y + 1) * W + x] - L[Math.max(0, y - 1) * W + x]);
      const g = Math.hypot(gx, gy);
      flat[y * W + x] = Math.exp(-(g * g) / (2 * GK * GK));
    }

    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const octx = out.getContext('2d', { willReadFrequently: true });
    const img2 = octx.createImageData(W, H), od = img2.data;
    /* Measured through the encoder, not in the canvas. WebP at 0.86 puts back
       0.10 to 0.14 of high frequency -- which is the only frequency this
       measures -- so a strength solved on the canvas ships a file 25% over its
       ceiling. Three of the system files did exactly that: solved to 0.45,
       read 0.565, 0.591, 0.574 once written. The encode is the last thing that
       touches these pixels, so it has to be inside the loop. */
    const enc = document.createElement('canvas'); enc.width = W; enc.height = H;
    const ectx = enc.getContext('2d', { willReadFrequently: true });
    const roundTrip = document.createElement('img');
    const apply = async (strength) => {
      for (let p = 0; p < W * H; p++) {
        const w = strength * flat[p];
        for (let ch = 0; ch < 3; ch++) od[p * 4 + ch] = sd[p * 4 + ch] * (1 - w) + blur[p * 3 + ch] * w;
        od[p * 4 + 3] = 255;
      }
      octx.putImageData(img2, 0, 0);
      const url = out.toDataURL('image/webp', quality);
      roundTrip.src = url; await roundTrip.decode();
      ectx.drawImage(roundTrip, 0, 0);
      return url;
    };
    // Monotonic in strength on a fixed pixel set, so the same halving works.
    let lo = 0, hi = 1, strength = 0, url = null;
    for (let i = 0; i < 16; i++) {
      strength = (lo + hi) / 2; await apply(strength);
      if (grainOf(ectx, W, mask).rms > ceiling) lo = strength; else hi = strength;
    }
    strength = hi; url = await apply(strength);
    return {
      width: W, height: H, strength: +strength.toFixed(3),
      before: +before.toFixed(3), after: +grainOf(ectx, W, mask).rms.toFixed(3), interior: g0.n,
      wallBefore: +wallBefore.toFixed(2), wallAfter: +ratio(wallAt(ectx, W, mask), charcoal).toFixed(2),
      share: +mask.share.toFixed(2),
      webp: url.split(',')[1],
    };
  }

  if (role === 'wall') {
    // What this page's hero puts on the wall, under this same probe.
    const ref = new Image(); ref.src = matchUrl; await ref.decode();
    const rc = document.createElement('canvas'); rc.width = ref.naturalWidth; rc.height = ref.naturalHeight;
    const rctx = rc.getContext('2d', { willReadFrequently: true }); rctx.drawImage(ref, 0, 0);
    const refMask = wallMask(rctx, ref.naturalWidth, ref.naturalHeight);
    const refRgb = wallAt(rctx, ref.naturalWidth, refMask);
    const target = ratio(refRgb, charcoal);

    const mask = wallMask(sctx, W, H);
    const beforeRgb = wallAt(sctx, W, mask);
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const octx = out.getContext('2d', { willReadFrequently: true });
    const draw = (b) => { octx.filter = `brightness(${b})`; octx.clearRect(0, 0, W, H); octx.drawImage(img, 0, 0); };

    // Same twenty-two halvings the hero takes, on the pixels the mask fixed.
    let lo = 0.6, hi = 1.6, brightness = 1;
    for (let i = 0; i < 22; i++) {
      brightness = (lo + hi) / 2; draw(brightness);
      if (ratio(wallAt(octx, W, mask), charcoal) < target) lo = brightness; else hi = brightness;
    }
    draw(brightness);
    const afterRgb = wallAt(octx, W, mask);
    return {
      width: W, height: H, brightness: +brightness.toFixed(4),
      refWall: { hex: hexOf(refRgb), ratio: +target.toFixed(2), share: +refMask.share.toFixed(2) },
      before: { hex: hexOf(beforeRgb), ratio: +ratio(beforeRgb, charcoal).toFixed(2), share: +mask.share.toFixed(2), mean: +meanOf(sctx, 0, 0, W, H).mean.toFixed(1) },
      after: { hex: hexOf(afterRgb), ratio: +ratio(afterRgb, charcoal).toFixed(2), share: +mask.share.toFixed(2), mean: +meanOf(octx, 0, 0, W, H).mean.toFixed(1) },
      webp: out.toDataURL('image/webp', quality).split(',')[1],
    };
  }

  /* A CUTOUT is objects on transparency. The ground is checked rather than
     assumed: a generator asked for transparency sometimes paints a
     checkerboard instead, and that is a picture of transparency with every
     pixel opaque. Each part is the opaque pixels (alpha 8 and up) inside its
     rectangle, trimmed to their bounds; a part whose opaque pixels reach its
     rectangle's edge has had an object cut through, and says so. With no
     parts, the groups are found on a 16px lattice and listed. */
  if (role === 'cutout') {
    const d = sctx.getImageData(0, 0, W, H).data;
    const a = (x, y) => d[(y * W + x) * 4 + 3];
    let clear = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] === 0) clear++;
    const share = clear / (W * H);
    if (share < 0.2) return { width: W, height: H, share, refused: true };
    const bounds = (x0, y0, w, h) => {
      let l = x0 + w, r = -1, t = y0 + h, b = -1;
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        if (a(x, y) < 8) continue;
        if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y;
      }
      return r < 0 ? null : [l, t, r - l + 1, b - t + 1];
    };
    if (!parts.length) {
      const S = 16, gw = Math.ceil(W / S), gh = Math.ceil(H / S), on = new Uint8Array(gw * gh), seen = new Uint8Array(gw * gh);
      for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
        let hit = 0;
        for (let y = gy * S; y < Math.min(H, gy * S + S) && !hit; y++) for (let x = gx * S; x < Math.min(W, gx * S + S); x++) if (a(x, y) >= 8) { hit = 1; break; }
        on[gy * gw + gx] = hit;
      }
      const groups = [];
      for (let i = 0; i < on.length; i++) {
        if (!on[i] || seen[i]) continue;
        const stack = [i]; seen[i] = 1; let l = gw, r = 0, t = gh, b = 0, n = 0;
        while (stack.length) {
          const j = stack.pop(), x = j % gw, y = (j / gw) | 0; n++;
          l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
          /* Two cells of reach, so an offcut a few pixels from its knife is
             one group with it rather than a group of its own. */
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
            const k = yy * gw + xx;
            if (on[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
          }
        }
        groups.push({ cells: n, rect: bounds(l * S, t * S, Math.min(W, (r + 1) * S) - l * S, Math.min(H, (b + 1) * S) - t * S) });
      }
      return { width: W, height: H, share, groups: groups.sort((p, q) => q.cells - p.cells) };
    }
    const cut = parts.map(({ name, rect: [x, y, w, h], cuts = [] }) => {
      const bb = bounds(x, y, w, h);
      if (!bb) return { name, rect: [x, y, w, h], empty: true };
      const [l, t, bw, bh] = bb;
      const touches = [l === x && 'left', t === y && 'top', l + bw === x + w && 'right', t + bh === y + h && 'bottom'].filter(Boolean)
        .filter(side => !cuts.includes(side) && !((side === 'left' && x === 0) || (side === 'top' && y === 0) || (side === 'right' && x + w === W) || (side === 'bottom' && y + h === H)));
      const c = document.createElement('canvas'); c.width = bw; c.height = bh;
      c.getContext('2d').drawImage(img, l, t, bw, bh, 0, 0, bw, bh);
      return { name, rect: [x, y, w, h], box: bb, touches, webp: c.toDataURL('image/webp', quality).split(',')[1] };
    });
    return { width: W, height: H, share, cut };
  }

  /* A MARK is framed by its disc, not by its edges. The generator is asked
     for one circle, centred, two-thirds of the frame, and puts it somewhere
     near there, a different somewhere each time; six of them side by side
     would carry six discs of six sizes on six lines. So the disc is found
     and every file is cut to the same square around it: the disc's centre
     at the slot's centre, its diameter `disc` of the slot.

     The disc is the drawing's commonest opaque colour near the pale sage
     it was asked to be filled with, and its edge is wherever that fill meets the outline with transparency
     just past it. Where the object crosses the edge there is object past
     the outline, not transparency, so those stretches of the edge are left
     out of the fit rather than read as a dent. A least-squares circle
     through what is left, refitted once without the worst residuals, is
     the disc. Nothing is lifted: the ground is transparent, so there is no
     wall to solve and no mean luminance to hold. */
  if (role === 'mark') {
    const d = sctx.getImageData(0, 0, W, H).data;
    const at = (x, y) => (y * W + x) * 4;
    const bins = new Map();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 250) continue;
      const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
      bins.set(k, (bins.get(k) || 0) + 1);
    }
    /* Commonest is not enough on its own: a clipboard's sheet is more white
       than its disc is sage. So the disc is the commonest bin near the fill
       the prompt asks for, tea-light #E8EDE5, which the generator returns
       a few levels off; failing that, the commonest that is not white. */
    const near = (k) => { const c = [(k >> 8) * 16 + 8, ((k >> 4) & 15) * 16 + 8, (k & 15) * 16 + 8]; return Math.max(...c.map((v, j) => Math.abs(v - [0xE8, 0xED, 0xE5][j]))) <= 24; };
    const white = (k) => (k >> 8) >= 15 && ((k >> 4) & 15) >= 15 && (k & 15) >= 15;
    const ranked = [...bins.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const mode = ranked.find((k) => near(k) && !white(k)) ?? ranked.find((k) => !white(k));
    let fr = 0, fg = 0, fb = 0, fn = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 250) continue;
      if (((d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4)) !== mode) continue;
      fr += d[i]; fg += d[i + 1]; fb += d[i + 2]; fn++;
    }
    const fill = [fr / fn, fg / fn, fb / fn];
    const isFill = (x, y) => { const i = at(x, y); return d[i + 3] > 200 && Math.abs(d[i] - fill[0]) < 16 && Math.abs(d[i + 1] - fill[1]) < 16 && Math.abs(d[i + 2] - fill[2]) < 16; };
    const reach = Math.max(6, Math.round(W * 0.014));
    const clearPast = (x, y, dx, dy) => {
      for (let k = 1; k <= reach; k++) {
        const xx = x + dx * k, yy = y + dy * k;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H || d[at(xx, yy) + 3] < 40) return true;
      }
      return false;
    };
    const pts = [];
    for (let y = 0; y < H; y += 2) {
      let l = -1, r = -1;
      for (let x = 0; x < W; x++) if (isFill(x, y)) { if (l < 0) l = x; r = x; }
      if (l >= 0 && clearPast(l, y, -1, 0)) pts.push([l, y]);
      if (r >= 0 && clearPast(r, y, 1, 0)) pts.push([r, y]);
    }
    for (let x = 0; x < W; x += 2) {
      let t = -1, b = -1;
      for (let y = 0; y < H; y++) if (isFill(x, y)) { if (t < 0) t = y; b = y; }
      if (t >= 0 && clearPast(x, t, 0, -1)) pts.push([x, t]);
      if (b >= 0 && clearPast(x, b, 0, 1)) pts.push([x, b]);
    }
    // Kasa: x^2 + y^2 + Dx + Ey + F = 0, solved by its normal equations.
    const fit = (ps) => {
      let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0; const n = ps.length;
      for (const [x, y] of ps) { const z = x * x + y * y; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; sxz += x * z; syz += y * z; }
      const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]], B = [-sxz, -syz, -sz];
      const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const D0 = det(A);
      const col = (j) => A.map((row, i) => row.map((v, k) => (k === j ? B[i] : v)));
      const [D, E, F] = [0, 1, 2].map((j) => det(col(j)) / D0);
      const cx = -D / 2, cy = -E / 2;
      return { cx, cy, r: Math.sqrt(cx * cx + cy * cy - F) };
    };
    let c = fit(pts);
    const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - c.cx, y - c.cy) - c.r));
    const cut = [...res].sort((a, b) => a - b)[Math.floor(res.length * 0.8)];
    const kept = pts.filter((_, i) => res[i] <= Math.max(cut, 2));
    c = fit(kept);

    const side = (2 * c.r) / disc;
    const sx = c.cx - side / 2, sy = c.cy - side / 2;
    // What of the drawing falls outside that square, so a cut that clips an
    // object reaching far out of its disc says so rather than shipping it.
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[at(x, y) + 3] > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    const clip = { left: Math.max(0, Math.round(sx - minX)), top: Math.max(0, Math.round(sy - minY)), right: Math.max(0, Math.round(maxX - (sx + side))), bottom: Math.max(0, Math.round(maxY - (sy + side))) };

    const out = document.createElement('canvas'); out.width = slot.w; out.height = slot.h;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high';
    octx.drawImage(img, sx, sy, side, side, 0, 0, slot.w, slot.h);
    return {
      width: W, height: H, fill: fill.map(Math.round), points: pts.length, kept: kept.length,
      disc: { cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1), r: +c.r.toFixed(1) },
      offset: { x: +((c.cx - W / 2) / W).toFixed(3), y: +((c.cy - H / 2) / H).toFixed(3) },
      share: +((2 * c.r) / W).toFixed(3), clip,
      webp: out.toDataURL('image/webp', quality).split(',')[1],
    };
  }

  if (role === 'report') {
    const all = meanOf(sctx, 0, 0, W, H);
    const out = { width: W, height: H, meanLuminance: +all.mean.toFixed(1) };
    if (Math.abs(W / H - 2) < 0.05) { const wall = meanOf(sctx, ...wallBox(W, H)); out.wallRatio = +ratio(wall.rgb, charcoal).toFixed(2); out.wallHex = '#' + wall.rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
    return out;
  }

  // Border: walk inward from each of the four edges along its middle line
  // until the pixel leaves the corner color. A frame is a frame only when
  // all four sides find one and the widest is within half again of the
  // narrowest -- the generator's frames are near-equal, not equal. A
  // mottled wall leaves the corner color at a different distance on every
  // side and touches the subject on at least one, and a scan from one edge
  // alone once took 147px of plain wall for a border and cropped the
  // composition out of a hero. Under 6px is grain, not a frame.
  const corner = px(sctx, 1, 1);
  const differs = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 36;
  const walk = (at) => { for (let i = 0; i < Math.min(W, H) / 2; i++) { if (differs(at(i), corner)) return i; } return 0; };
  const my = Math.round(H / 2), mx = Math.round(W / 2);
  const sides = [walk(i => px(sctx, i, my)), walk(i => px(sctx, W - 1 - i, my)), walk(i => px(sctx, mx, i)), walk(i => px(sctx, mx, H - 1 - i))];
  const agree = Math.min(...sides) >= 6 && Math.max(...sides) <= Math.min(...sides) * 1.5;
  const border = agree ? Math.min(...sides) : 0;
  const inset = border >= 6 ? border + 24 : 0;

  // Largest rectangle of the slot's aspect inside the inset, centered --
  // unless a rectangle was given by hand.
  const aw = W - 2 * inset, ah = H - 2 * inset, aspect = slot.w / slot.h;
  let cw = aw, ch = Math.round(aw / aspect);
  if (ch > ah) { ch = ah; cw = Math.round(ah * aspect); }
  let cx = Math.round((W - cw) / 2), cy = Math.round((H - ch) / 2);
  if (manualCrop) [cx, cy, cw, ch] = manualCrop;

  const out = document.createElement('canvas'); out.width = slot.w; out.height = slot.h;
  const octx = out.getContext('2d', { willReadFrequently: true });
  /* The ground the breathed band is filled with is the SOURCE's own corner,
     not the spec's hex: the generator returns a flat field a few levels off
     whatever it was asked for, and a band painted the asked-for colour beside
     a drawing painted the returned one is a seam down the top of the picture.
     The fill takes the same filter as the drawing, so the lift cannot part
     them either. */
  const bw = Math.round(slot.w * breathe), bh = Math.round(slot.h * breathe);
  const bx = Math.round((slot.w - bw) / 2), by = slot.h - bh;   // centred, bottom-anchored
  const render = (brightness) => {
    octx.filter = `brightness(${brightness}) contrast(${lift.contrast})`;
    octx.clearRect(0, 0, slot.w, slot.h);
    if (breathe !== 1) { octx.fillStyle = `rgb(${corner[0]},${corner[1]},${corner[2]})`; octx.fillRect(0, 0, slot.w, slot.h); }
    octx.drawImage(img, cx, cy, cw, ch, bx, by, bw, bh);
  };

  let brightness = lift.brightness, wallRatio = null, wallHex = null;
  if (role === 'hero') {
    // Binary search the brightness that puts the wall at the target. The
    // relation is monotonic, so twenty halvings land within a hundredth.
    let lo = 0.7, hi = 1.8;
    for (let i = 0; i < 22; i++) {
      brightness = (lo + hi) / 2; render(brightness);
      const r = ratio(meanOf(octx, ...wallBox(slot.w, slot.h)).rgb, charcoal);
      if (r < wallTarget) lo = brightness; else hi = brightness;
    }
  }
  render(brightness);
  /* STAGE: the ground is the commonest colour, binned at 4 levels a channel
     and averaged inside its bin. Every pixel within 12 of it (summed over
     the channels) becomes --color-tea-light exactly, which also flattens the
     generator's faint grain; every other pixel moves by the same offset the
     ground did, so an outline's antialiasing still meets the ground it
     sits on. The text over a stage is then measured against a known colour
     rather than against whatever the generator returned. */
  let ground = null;
  if (role === 'stage') {
    const id = octx.getImageData(0, 0, slot.w, slot.h), d = id.data;
    const key = (i) => ((d[i] >> 2) << 12) | ((d[i + 1] >> 2) << 6) | (d[i + 2] >> 2);
    const bins = new Map();
    for (let i = 0; i < d.length; i += 4) { const k = key(i); bins.set(k, (bins.get(k) || 0) + 1); }
    let bk = 0, bn = 0;
    for (const [k, n] of bins) if (n > bn) { bn = n; bk = k; }
    const sum = [0, 0, 0]; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (key(i) === bk) { sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; n++; }
    const g = sum.map(v => v / n), off = tea.map((t, c) => t - g[c]);
    let flat = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - g[0]) + Math.abs(d[i + 1] - g[1]) + Math.abs(d[i + 2] - g[2]) <= 12) { d[i] = tea[0]; d[i + 1] = tea[1]; d[i + 2] = tea[2]; flat++; }
      else for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round(d[i + c] + off[c])));
    }
    octx.putImageData(id, 0, 0);
    ground = { found: g.map(v => Math.round(v)), shift: off.map(v => Math.round(v)), flat: +(flat / (d.length / 4)).toFixed(3) };
    ground.parts = parts.map(({ name, rect: [x, y, w, h] }) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(out, x, y, w, h, 0, 0, w, h);
      return { name, rect: [x, y, w, h], webp: c.toDataURL('image/webp', quality).split(',')[1] };
    });
  }
  if (role === 'hero') { const wall = meanOf(octx, ...wallBox(slot.w, slot.h)); wallRatio = +ratio(wall.rgb, charcoal).toFixed(2); wallHex = '#' + wall.rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
  const all = meanOf(octx, 0, 0, slot.w, slot.h);
  const webp = out.toDataURL('image/webp', quality).split(',')[1];
  return { source: { width: W, height: H, border, inset, crop: [cx, cy, cw, ch] }, breathe: { scale: breathe, box: [bx, by, bw, bh] }, brightness: +brightness.toFixed(3), meanLuminance: +all.mean.toFixed(1), wallRatio, wallHex, ground, webp };
}, { dataUrl, matchUrl, role, slot: SLOT[role] || null, charcoal: CHARCOAL, tea: TEA_LIGHT, wallTarget: WALL_TARGET, lift: LIFT, quality: QUALITY, manualCrop, breathe, ceiling, floor, disc: DISC, parts });

await browser.close();

if (role === 'report') {
  console.log(`  ${inPath}\n  ${result.width}x${result.height}, mean luminance ${result.meanLuminance}` +
    (result.wallRatio ? `, wall ${result.wallHex} at ${result.wallRatio}:1 against charcoal` : ''));
  process.exit(0);
}

if (grainMode) {
  const dest = outPath || inPath;
  console.log(`  ${inPath}` + (result.untouched ? '' : (dest === inPath ? ' (in place)' : ` -> ${dest}`)));
  if (result.share < 0.33) { console.log(`  \u2717 the top eighth is only ${(result.share * 100).toFixed(0)}% one color; this picture has no wall to measure`); process.exit(1); }
  if (result.tooLittle) { console.log(`  \u25cf only ${result.interior}px of interior wall; too little to measure grain on, left alone`); process.exit(0); }
  if (result.untouched) { console.log(`  wall grain ${result.before} over ${result.interior}px of wall, inside the ${floor ? floor + '-' : ''}${ceiling} band; left alone`); process.exit(0); }
  if (result.added !== undefined) {
    console.log(`  wall grain ${result.before} -> ${result.after} over ${result.interior}px of wall, grain added at amplitude ${result.added}, floor ${floor}`);
    if (Math.abs(result.wallAfter - result.wallBefore) > 0.05) { console.log(`  \u2717 the wall moved, ${result.wallBefore}:1 -> ${result.wallAfter}:1`); process.exit(1); }
    console.log(`  wall held at ${result.wallAfter}:1 against charcoal`);
    const d2 = outPath || inPath;
    writeFileSync(d2, Buffer.from(result.webp, 'base64'));
    console.log(`  ${result.width}x${result.height}, ${(statSync(d2).size / 1024).toFixed(0)}KB`);
    process.exit(0);
  }
  console.log(`  wall grain ${result.before} -> ${result.after} over ${result.interior}px of wall, strength ${result.strength}, ceiling ${ceiling}`);
  /* Blurring preserves a local mean, so the wall it was solved to should not
     have moved. If it has, the wall solve and this one are fighting. */
  if (Math.abs(result.wallAfter - result.wallBefore) > 0.05) { console.log(`  \u2717 the wall moved, ${result.wallBefore}:1 -> ${result.wallAfter}:1`); process.exit(1); }
  console.log(`  wall held at ${result.wallAfter}:1 against charcoal`);
  writeFileSync(dest, Buffer.from(result.webp, 'base64'));
  console.log(`  ${result.width}x${result.height}, ${(statSync(dest).size / 1024).toFixed(0)}KB`);
  process.exit(0);
}

if (wallMode) {
  const dest = outPath || inPath;
  const { refWall: r, before: b, after: a } = result;
  console.log(`  ${inPath}` + (dest === inPath ? ' (in place)' : ` -> ${dest}`));
  console.log(`  ${matchPath} wall ${r.hex} at ${r.ratio}:1, ${(r.share * 100).toFixed(0)}% of its top eighth`);
  console.log(`  wall ${b.hex} ${b.ratio}:1 -> ${a.hex} ${a.ratio}:1 at brightness ${result.brightness}, mean ${b.mean} -> ${a.mean}`);
  /* A strip the wall does not mostly own is not a wall reading, and solving
     against it moves the picture to put a monitor where the wall should be. */
  if (b.share < 0.33) { console.log(`  ✗ the top eighth is only ${(b.share * 100).toFixed(0)}% one color; this picture has no wall to match`); process.exit(1); }
  if (Math.abs(a.ratio - r.ratio) > 0.05) { console.log(`  ✗ did not reach ${r.ratio}:1`); process.exit(1); }
  writeFileSync(dest, Buffer.from(result.webp, 'base64'));
  console.log(`  ${result.width}x${result.height}, ${(statSync(dest).size / 1024).toFixed(0)}KB`);
  if (a.mean < 126 || a.mean > 184) console.log(`  ● mean luminance ${a.mean} is outside the set's 126-184; look at it beside its neighbors before committing`);
  process.exit(0);
}

if (role === 'cutout') {
  if (result.refused) { console.log(`  ✗ ${inPath}: only ${(result.share * 100).toFixed(0)}% of the picture is transparent; a cutout is objects on transparency (a painted checkerboard is not)`); process.exit(1); }
  console.log(`  ${inPath}, ${result.width}x${result.height}, ${(result.share * 100).toFixed(1)}% transparent`);
  if (result.groups) {
    for (const g of result.groups) console.log(`  group at ${g.rect.join(',')}`);
    console.log('  cut each with --part name=x,y,w,h, a rectangle with transparency all round the group');
    process.exit(0);
  }
  let bad = 0;
  for (const p of result.cut) {
    if (p.empty) { console.log(`  ✗ ${p.name}: nothing opaque in ${p.rect.join(',')}`); bad++; continue; }
    const file = outPath.replace(/\.webp$/, `-${p.name}.webp`);
    writeFileSync(file, Buffer.from(p.webp, 'base64'));
    console.log(`  ${p.name}: ${p.box.join(',')} -> ${file}, ${p.box[2]}x${p.box[3]}, ${(statSync(file).size / 1024).toFixed(1)}KB`);
    if (p.touches.length) { console.log(`  ✗ ${p.name} reaches the ${p.touches.join(' and ')} of its rectangle; an object may be cut through`); bad++; }
  }
  process.exit(bad ? 1 : 0);
}

if (role === 'mark') {
  writeFileSync(outPath, Buffer.from(result.webp, 'base64'));
  const { disc: c, offset: o, clip } = result;
  console.log(`  ${inPath} -> ${outPath}`);
  console.log(`  source ${result.width}x${result.height}, disc fill rgb(${result.fill.join(', ')}), edge from ${result.kept} of ${result.points} points`);
  console.log(`  disc at ${c.cx},${c.cy} r ${c.r}: ${(result.share * 100).toFixed(1)}% of the source's width, off centre by ${(o.x * 100).toFixed(1)}% across and ${(o.y * 100).toFixed(1)}% down`);
  console.log(`  ${SLOT.mark.w}x${SLOT.mark.h} with the disc at ${(DISC * 100).toFixed(0)}% of it, ${(statSync(outPath).size / 1024).toFixed(0)}KB`);
  const lost = Object.entries(clip).filter(([, v]) => v > 0);
  if (lost.length) { console.log(`  ✗ the cut clips the drawing: ${lost.map(([k, v]) => `${v}px off the ${k}`).join(', ')}; try a smaller --disc`); process.exit(1); }
  process.exit(0);
}

if (!result.ground?.parts?.length) writeFileSync(outPath, Buffer.from(result.webp, 'base64'));
if (role === 'stage') {
  const g = result.ground;
  if (!g.parts.length) console.log(`  ${inPath} -> ${outPath}, ${(statSync(outPath).size / 1024).toFixed(0)}KB`);
  console.log(`  ground rgb(${g.found.join(', ')}) moved by ${g.shift.map(v => (v >= 0 ? '+' : '') + v).join('/')} onto --color-tea-light; ${(g.flat * 100).toFixed(1)}% of the picture is that ground exactly`);
  for (const part of g.parts) {
    const file = outPath.replace(/\.webp$/, `-${part.name}.webp`);
    writeFileSync(file, Buffer.from(part.webp, 'base64'));
    console.log(`  ${part.name}: ${part.rect.join(',')} -> ${file}, ${(statSync(file).size / 1024).toFixed(1)}KB`);
  }
  process.exit(0);
}
const s = result.source;
console.log(`  ${inPath} -> ${outPath}`);
console.log(`  source ${s.width}x${s.height}` + (s.border ? `, border ${s.border}px on all four sides, ${s.inset}px taken off each` : ', no border') + `, crop ${s.crop.join('x')}` +
  (result.breathe.scale !== 1 ? `, breathed to ${result.breathe.scale} of the slot at ${result.breathe.box.join('x')} on the source's ground` : ''));
console.log(`  ${SLOT[role].w}x${SLOT[role].h}, brightness ${result.brightness} contrast ${LIFT.contrast}, mean luminance ${result.meanLuminance}` +
  (result.wallRatio ? `, wall ${result.wallHex} at ${result.wallRatio}:1 against charcoal` : '') + `, ${(statSync(outPath).size / 1024).toFixed(0)}KB`);
if (role === 'hero' && Math.abs(result.wallRatio - WALL_TARGET) > 0.05) { console.log(`  ✗ wall did not reach ${WALL_TARGET}:1; the left two-fifths may not be empty wall`); process.exit(1); }
if (result.meanLuminance < 126 || result.meanLuminance > 184) console.log(`  ● mean luminance is outside the set's 126-184; look at it beside its neighbors before committing`);
