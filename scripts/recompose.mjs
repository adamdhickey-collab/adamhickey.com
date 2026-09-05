#!/usr/bin/env node
/* The recompose step for the four built-step drawings: frame a rendered PNG
 * into the 900x675 file that goes in img/site/, on a ground pinned to the
 * token.
 *
 * WHY THIS EXISTS AS A FILE. `built-steps.mjs` draws the scenes and README
 * described what happened to each PNG afterward -- clustered by column, the
 * largest cluster the subject, the others moved to a fixed gap, the frame the
 * content bounding box plus a margin, centered, at 4:3. It described it and
 * nothing implemented it. Every change to these drawings therefore began by
 * rebuilding the step from that paragraph and hoping the numbers came out the
 * same, which is a reproducibility problem dressed up as a formatting detail:
 * the four images only read as a set because they share a framing, and a
 * framing nobody can re-run is one that drifts on the next pass.
 *
 * THE GROUND IS THE PART THAT BITES. These files sit in the tea panel with no
 * border, no radius and no plate, so what makes them read as ink on the panel
 * rather than four pictures pasted onto it is that the file's own ground IS
 * --color-tea-light. A lossy encoder moves a flat color by a few levels and a
 * few levels is a visible rectangle at that size -- step 02 once encoded three
 * levels down and read as a lighter box in the row while the other three were
 * invisible. So this does not merely fill the ground with the token and hope:
 * it decodes what it just wrote and fails if the ground came back more than
 * TOLERANCE off. The four in the tree decode at a delta of 3 and do not show.
 *
 * FILL IS AN ARGUMENT, NOT A CONSTANT, and that is a finding rather than a
 * shrug. Recovered from the four committed files, the ink takes up 83.4% of the
 * governing axis on 01, 83.7% on 02, 94.4% on 03 and 88.2% on 04 -- no constant
 * margin, in frame pixels or source pixels or as a fraction of the bounding
 * box, produces that spread. It was chosen per drawing. Pass the number the
 * drawing had, or a new one deliberately; the default suits a subject that is
 * wider than it is tall.
 *
 * THE GAP IS REAL AND ONLY 03 USES IT. Three of the four are one cluster of
 * ink and the move is a no-op on them. 03 is a laptop and a phone, and its
 * committed file sits them 40 frame pixels apart where a straight crop of the
 * same render gives 28 -- the second cluster was moved, and moved further out,
 * not merely cropped. That is why --gap defaults to 40 rather than to off: a
 * re-render of 03 has to land where 03 already is.
 *
 *   CHROME=<chrome binary> node scripts/recompose.mjs <in.png> <out.webp> \
 *     [--fill 0.88] [--gap 40] [--quality 0.9]
 *
 * Exit 0 when the file is written and its ground survived, 1 when the ground
 * drifted or the source held no ink to frame.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const W = 900, H = 675;              // the frame every one of these is stored at
const GROUND = [0xe8, 0xed, 0xe5];   // --color-tea-light, exactly
const TOLERANCE = 6;                 // summed channel drift the encoder may add
const MERGE = 14;                    // source px of blank column that still reads as one piece

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : Number(args[i + 1]);
};
const [src, out] = args.filter(a => !a.startsWith('--') && !/^[\d.]+$/.test(a));
const FILL = flag('fill', 0.88), GAP = flag('gap', 40), Q = flag('quality', 0.9);

if (!src || !out) {
  console.error('usage: recompose.mjs <in.png> <out.webp> [--fill n] [--gap px] [--quality n]');
  process.exit(2);
}
if (!existsSync(src)) { console.error(`no such file: ${src}`); process.exit(2); }

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');

const dataUrl = (file, type) =>
  `data:image/${type};base64,` + readFileSync(file).toString('base64');

const result = await page.evaluate(async ([url, W, H, FILL, GAP, Q, G, MERGE]) => {
  const load = async s => {
    const i = new Image();
    await new Promise((res, rej) => { i.onload = res; i.onerror = rej; i.src = s; });
    return i;
  };
  const img = await load(url);
  const c = document.getElementById('c');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const px = g.getImageData(0, 0, c.width, c.height).data;

  // the source's own ground is its corner pixel; ink is anything off it
  const g0 = [px[0], px[1], px[2]];
  const isInk = i =>
    Math.abs(px[i] - g0[0]) + Math.abs(px[i + 1] - g0[1]) + Math.abs(px[i + 2] - g0[2]) > 12;

  const cols = new Array(c.width).fill(0);
  let y0 = Infinity, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (!isInk((y * c.width + x) * 4)) continue;
    cols[x]++;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (y1 < 0) return { empty: true };

  // columns of ink, merged across blanks too narrow to read as a separation
  const runs = [];
  for (let x = 0, s = null; x <= c.width; x++) {
    const on = x < c.width && cols[x] > 0;
    if (on && s === null) s = x;
    if (!on && s !== null) { runs.push({ x0: s, x1: x - 1 }); s = null; }
  }
  const cl = [];
  for (const r of runs) {
    const last = cl[cl.length - 1];
    if (last && r.x0 - last.x1 - 1 <= MERGE) last.x1 = r.x1; else cl.push({ ...r });
  }
  for (const k of cl) { k.ink = 0; for (let x = k.x0; x <= k.x1; x++) k.ink += cols[x]; }

  const subject = cl.reduce((a, b) => (b.ink > a.ink ? b : a), cl[0]);
  const inkH = y1 - y0 + 1;

  /* Move every other cluster to sit GAP frame pixels from its neighbor. The
     gap is stated in the frame, the move happens in the source, and the scale
     between them depends on the width the move produces -- so solve it rather
     than assume it. Four passes is far more than it needs. */
  let scale = Math.min(W * FILL / (cl[cl.length - 1].x1 - cl[0].x0 + 1), H * FILL / inkH);
  let shifts = cl.map(() => 0), width = 0;
  for (let pass = 0; pass < 4; pass++) {
    const gapSrc = GAP / scale;
    shifts = cl.map(() => 0);
    const k = cl.indexOf(subject);
    for (let i = k + 1; i < cl.length; i++)
      shifts[i] = (cl[i - 1].x1 + shifts[i - 1] + 1 + gapSrc) - cl[i].x0;
    for (let i = k - 1; i >= 0; i--)
      shifts[i] = (cl[i + 1].x0 + shifts[i + 1] - gapSrc) - (cl[i].x1 + 1);
    const left = Math.min(...cl.map((k2, i) => k2.x0 + shifts[i]));
    const right = Math.max(...cl.map((k2, i) => k2.x1 + shifts[i]));
    width = right - left + 1;
    scale = Math.min(W * FILL / width, H * FILL / inkH);
  }

  // lay the clusters down where they now belong, on the pinned ground
  const mid = document.createElement('canvas');
  mid.width = c.width; mid.height = c.height;
  const mg = mid.getContext('2d');
  mg.fillStyle = `rgb(${G[0]},${G[1]},${G[2]})`;
  mg.fillRect(0, 0, mid.width, mid.height);
  for (let i = 0; i < cl.length; i++) {
    const k = cl[i], w = k.x1 - k.x0 + 1;
    mg.drawImage(c, k.x0, 0, w, c.height, k.x0 + shifts[i], 0, w, c.height);
  }
  const x0 = Math.min(...cl.map((k, i) => k.x0 + shifts[i]));
  const x1 = Math.max(...cl.map((k, i) => k.x1 + shifts[i]));

  // the frame: the content box plus a margin, centered, at 4:3
  const cw = W / scale, ch = H / scale;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const o = document.createElement('canvas');
  o.width = W; o.height = H;
  const og = o.getContext('2d');
  og.fillStyle = `rgb(${G[0]},${G[1]},${G[2]})`;
  og.fillRect(0, 0, W, H);
  og.imageSmoothingQuality = 'high';
  og.drawImage(mid, cx - cw / 2, cy - ch / 2, cw, ch, 0, 0, W, H);

  const url2 = o.toDataURL('image/webp', Q);
  // decode what we just encoded and read its ground back
  const back = await load(url2);
  const b = document.createElement('canvas');
  b.width = W; b.height = H;
  const bg = b.getContext('2d', { willReadFrequently: true });
  bg.drawImage(back, 0, 0);
  const d = bg.getImageData(0, 0, 2, 2).data;

  return {
    url: url2,
    clusters: cl.map((k, i) => ({ w: k.x1 - k.x0 + 1, shift: Math.round(shifts[i]) })),
    ink: [Math.round(x1 - x0 + 1), inkH],
    fill: [(x1 - x0 + 1) * scale / W, inkH * scale / H],
    ground: [d[0], d[1], d[2]],
  };
}, [dataUrl(src, src.split('.').pop()), W, H, FILL, GAP, Q, GROUND, MERGE]);

await browser.close();

console.log(`\n  ${src}  ->  ${out}`);
if (result.empty) {
  console.log('\n  ✗ the source holds no ink: nothing to frame\n');
  process.exit(1);
}

const moved = result.clusters.filter(k => k.shift !== 0);
console.log(`  ${result.clusters.length} cluster${result.clusters.length === 1 ? '' : 's'}` +
  (moved.length ? `, ${moved.length} moved to a ${GAP}px gap (${moved.map(k => k.shift > 0 ? `+${k.shift}` : k.shift).join(', ')} source px)`
                : ', nothing to move'));
console.log(`  ink ${result.ink.join('x')} in a ${W}x${H} frame` +
  `  fill ${result.fill.map(f => (f * 100).toFixed(1) + '%').join(' ')}  at --fill ${FILL}`);

const drift = result.ground.reduce((a, v, i) => a + Math.abs(v - GROUND[i]), 0);
const hex = '#' + GROUND.map(v => v.toString(16).padStart(2, '0')).join('');
if (drift > TOLERANCE) {
  // nothing is written: a file that reads as a rectangle is worse than no file
  console.log(`\n  ✗ the ground drifted encoding: rgb(${result.ground}) against ${hex}, ` +
    `${drift} levels off\n    It would read as a rectangle on the tea panel, so ${out} was ` +
    `not written.\n    Raise --quality.\n`);
  process.exit(1);
}
writeFileSync(out, Buffer.from(result.url.split(',')[1], 'base64'));
console.log(`\n  ✓ written, ground intact\n    rgb(${result.ground}) against ${hex}, ${drift} level${drift === 1 ? '' : 's'} off, ${TOLERANCE} allowed\n`);
