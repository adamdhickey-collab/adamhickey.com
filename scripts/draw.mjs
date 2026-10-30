#!/usr/bin/env node
/**
 * draw.mjs -- queue the writing scenes for a browser to draw, and file what
 * comes back.
 *
 *   node scripts/draw.mjs queue [id,id]   write img/inbox/QUEUE.json, and the reference PNG
 *   node scripts/draw.mjs status          what is drawn, what is owed
 *   node scripts/draw.mjs next            the next job's prompt, to put in the composer
 *   node scripts/draw.mjs clip 0          the clipboard's picture -> the job's PNG
 *   node scripts/draw.mjs land 0 [file]   the newest ~/Downloads picture -> the job's PNG
 *   node scripts/draw.mjs take 0          the job's PNG -> img/writing/<slug>[-2].webp, via illustrate.mjs
 *   node scripts/draw.mjs sheet <name>    the clipboard's picture -> img/inbox/<name>-sheet.png (a rail's sheet)
 *   node scripts/draw.mjs slice <name> <tile,tile,-,...> [360x240] [--out img/lab] [--alpha]
 *                                         a rail's 3 x 2 sheet -> img/writing/<tile>.webp, one shared scale, trimmed across
 *                                         (--out files them elsewhere; --alpha makes the white ground transparent)
 *
 * The drawings are made in ChatGPT through the user's own Chrome, in the
 * chat the account already pays for, rather than through the image API. The
 * loop is in CLAUDE.md under "Drawing in the browser": the browser draws,
 * this files. Nothing here needs a package; the clipboard is read by
 * AppleScript, a download is copied, and the WebP is cut by illustrate.mjs
 * with the same Chrome the checks use.
 *
 * The jobs are scripts/writing-scenes.mjs. The first job in a queue carries
 * the style preamble and attaches the reference; the rest open "Same style"
 * and attach nothing, because the thread already holds the style and
 * re-sending 4 MB a picture is slow. Each prompt ends with the aspect,
 * because the web composer takes no size argument.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import * as scenes from './writing-scenes.mjs';
import * as features from './writing-features.mjs';
import * as proof from './proof-cards.mjs';
import * as tour from './tour-scenes.mjs';

/* --set features draws the article's top picture (and its index card, cut
   from the same source); the default set stays the second, in-body scene.
   The two differ in their prompts, their style anchor, and what a finished
   job produces -- a feature is two WebPs, a scene one.
   --set proof draws the homepage's four "How I work" cards, which are the
   same hand and, since #150, the same 16:9: `illustrate.mjs card`, 640x360
   for a 280px column, rather than the writing set's full-width `feature`.
   It took the 3:2 `step` until then, and that crop cost each picture 8% of
   its width a side -- the ground the drawings are framed with. The file is
   still filed at a path the registry names rather than one derived from
   the id.
   --set tour draws the small picture beside each note of the Agent Review
   tour, 16:9 at 960x540 (`illustrate.mjs tour`) for a column about 410px wide.
   Each job names its own output under img/lab/.
   --set loop draws the six steps of the same page's loop, from the same
   registry under its own preamble (`style`): square, on a transparent
   ground, each built on a disc, cut by `illustrate.mjs mark` to 352x352.
   A mark has no wall and no mean luminance, so `take` files it and skips
   the report.
   Everything that used to be a `FEATURES ?` ternary is a column here, so a
   fourth set is a row rather than an edit in five places. */
const SETS = {
  scenes:   { mod: scenes,   jobs: 'SCENES',   registry: 'writing-scenes.mjs',   suffix: '-2', role: 'feature', card: false },
  features: { mod: features, jobs: 'FEATURES', registry: 'writing-features.mjs', suffix: '',   role: 'feature', card: true  },
  proof:    { mod: proof,    jobs: 'PROOF',    registry: 'proof-cards.mjs',      suffix: '',   role: 'card',    card: false },
  tour:     { mod: tour,     jobs: 'TOUR',     registry: 'tour-scenes.mjs',      suffix: '',   role: 'tour',    card: false },
  loop:     { mod: tour,     jobs: 'LOOP',     registry: 'tour-scenes.mjs',      suffix: '',   role: 'mark',    card: false, style: 'LOOP_STYLE', aspect: 'Draw this as a square 1:1 image.' },
};
const argv = process.argv.slice(2);
const si = argv.indexOf('--set');
const SET = si >= 0 ? argv.splice(si, 2)[1] : 'scenes';
if (!SETS[SET]) { console.error(`--set is ${Object.keys(SETS).join(', ')}, not ${SET}`); process.exit(2); }
const { mod, registry: REGISTRY, suffix: SUFFIX, role: ROLE, card: CARDS } = SETS[SET];
const STYLE = mod[SETS[SET].style || 'STYLE'];
const { REF } = mod;
const JOBS = mod[SETS[SET].jobs];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = resolve(root, 'img/inbox');
const QUEUE = resolve(INBOX, 'QUEUE.json');
const REF_PNG = resolve(INBOX, 'style-reference.png');
const DOWNLOADS = join(homedir(), 'Downloads');
const ASPECT = SETS[SET].aspect || 'Draw this as a wide 16:9 landscape image.';

const short = (p) => p.replace(`${root}/`, '');
const readQueue = () => {
  if (!existsSync(QUEUE)) { console.error(`No queue at ${short(QUEUE)}. Run: node scripts/draw.mjs queue`); process.exit(1); }
  return JSON.parse(readFileSync(QUEUE, 'utf8'));
};
const writeQueue = (jobs) => writeFileSync(QUEUE, `${JSON.stringify(jobs, null, 2)}\n`);
const line = (j, i) => `${i}  ${j.done ? '✓' : '·'}  ${j.id}  → ${short(j.out)}`;

const cmd = argv[0] ?? 'status';

if (cmd === 'queue') {
  const only = argv[1]?.split(',').map((s) => s.trim()).filter(Boolean);
  const todo = JOBS.filter((s) => !only || only.includes(s.id));
  if (!todo.length) { console.error(`nothing matches ${only?.join(',')}; ids: ${JOBS.map((s) => s.id).join(', ')}`); process.exit(1); }
  mkdirSync(INBOX, { recursive: true });
  /* The reference the set was drawn to, as a PNG, because the chat's file
     input will not take a WebP. sips is the one converter every Mac has.
     Remade when the reference is newer than the copy, because a set that
     changes its anchor and keeps the old PNG attaches the wrong picture. */
  const refSrc = resolve(root, REF);
  if (!existsSync(refSrc)) { console.error(`the style reference is missing: save it at ${REF}`); process.exit(1); }
  if (!existsSync(REF_PNG) || statSync(refSrc).mtimeMs > statSync(REF_PNG).mtimeMs) {
    execFileSync('sips', ['-s', 'format', 'png', refSrc, '--out', REF_PNG], { stdio: 'ignore' });
  }
  const jobs = todo.map((s, i) => ({
    id: s.id,
    out: resolve(INBOX, `${s.id}${SUFFIX}.png`),
    /* A set whose registry names its own output path uses it; the writing
       sets derive one from the id, which is their slug. */
    final: s.out ? resolve(root, s.out) : resolve(root, `img/writing/${s.id}${SUFFIX}.webp`),
    attach: i === 0 ? [REF_PNG] : [],
    /* The accent is named in every prompt, not once at the top: the thread
       holds the style but not which of the three colours this picture takes,
       and the group is the index's section rather than the artist's choice.
       The sentence is the registry's, so it and the preamble agree on what
       else a picture may carry. */
    /* A job that names its own colours (`colours`) says them in place of
       the group's line, because the line also allows the two reveal
       colours, and a job with a different second colour would be told
       both. The first is the agent article's ochre, 2026-10-08. */
    prompt: `${i === 0 ? `${STYLE}\n\n` : ''}${s.prompt}${s.group ? `\n\n${s.colours || features.accentLine(s.group)}` : ''}\n\n${ASPECT}`,
    done: existsSync(resolve(INBOX, `${s.id}${SUFFIX}.png`)),
    ...(CARDS ? { card: resolve(root, `img/writing/${s.id}-card.webp`) } : {}),
    /* Both sets carry a group now, so `take` measures a scene's hue too. */
    ...(s.group ? { group: s.group } : {}),
  }));
  writeQueue(jobs);
  console.log(`${jobs.length} job(s) → ${short(QUEUE)}`);
  for (const [i, j] of jobs.entries()) console.log(`  ${line(j, i)}`);
  /* A PNG in the inbox from before the prompts changed reads as "done" and
     `take` would file it. The registry's own mtime is the line: anything
     older than it was drawn to a prompt that no longer exists. */
  const registry = resolve(root, 'scripts', REGISTRY);
  const stale = jobs.filter((j) => j.done && statSync(j.out).mtimeMs < statSync(registry).mtimeMs);
  if (stale.length) console.log(`\n${stale.length} "done" PNG(s) predate ${short(registry)}; delete them from img/inbox before drawing, or take files the old picture`);
  console.log('\nnode scripts/draw.mjs next   # then draw it, and clip or land it back');
} else if (cmd === 'status') {
  const jobs = readQueue();
  for (const [i, j] of jobs.entries()) console.log(line(j, i));
  console.log(`\n${jobs.filter((j) => !j.done).length} of ${jobs.length} still to draw`);
} else if (cmd === 'next') {
  const jobs = readQueue();
  const i = argv[1] !== undefined ? Number(argv[1]) : jobs.findIndex((j) => !j.done);
  if (i < 0) { console.log('all drawn'); }
  else {
    const j = jobs[i];
    console.log(`# job ${i}: ${j.id} → ${short(j.out)}`);
    console.log(`# attach: ${j.attach.length ? j.attach.map(short).join(', ') : 'nothing (the thread holds the style)'}`);
    console.log(`\n${j.prompt}\n`);
  }
} else if (cmd === 'clip') {
  const jobs = readQueue();
  const i = Number(argv[1]);
  const job = jobs[i];
  if (!job) { console.error(`no job ${i}`); process.exit(1); }
  mkdirSync(dirname(job.out), { recursive: true });
  /* AppleScript is the only thing on the Mac that hands the clipboard's
     picture over as bytes. */
  execFileSync('osascript', [
    '-e', `set f to open for access POSIX file "${job.out}" with write permission`,
    '-e', 'set eof f to 0',
    '-e', 'write (the clipboard as «class PNGf») to f',
    '-e', 'close access f',
  ]);
  jobs[i].done = true;
  writeQueue(jobs);
  console.log(`✓ clipboard → ${short(job.out)}  (${statSync(job.out).size} bytes)`);
} else if (cmd === 'land') {
  const jobs = readQueue();
  const i = Number(argv[1]);
  const job = jobs[i];
  if (!job) { console.error(`no job ${i}`); process.exit(1); }
  let src = argv[2] ? resolve(argv[2]) : null;
  if (!src) {
    const files = readdirSync(DOWNLOADS)
      .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
      .map((f) => ({ f, t: statSync(join(DOWNLOADS, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    if (!files.length) { console.error(`nothing drawn in ${DOWNLOADS}`); process.exit(1); }
    src = join(DOWNLOADS, files[0].f);
  }
  mkdirSync(dirname(job.out), { recursive: true });
  copyFileSync(src, job.out);
  jobs[i].done = true;
  writeQueue(jobs);
  console.log(`✓ ${src} → ${short(job.out)}  (${statSync(job.out).size} bytes)`);
} else if (cmd === 'take') {
  const jobs = readQueue();
  const i = Number(argv[1]);
  const job = jobs[i];
  if (!job) { console.error(`no job ${i}`); process.exit(1); }
  if (!existsSync(job.out)) { console.error(`${short(job.out)} is not drawn yet`); process.exit(1); }
  const extra = argv.slice(2);
  const lift = extra.length ? extra : ['--brightness', '1'];
  const cut = (role, out) => execFileSync('node', [resolve(root, 'scripts/illustrate.mjs'), role, job.out, out, ...lift], { stdio: 'inherit', cwd: root });
  cut(ROLE, job.final);
  /* A feature is stored twice, and the card has to be cut from the same
     source in the same run -- cutting it later, from the WebP, would put a
     second lossy pass on it. */
  if (job.card) cut('card', job.card);
  if (ROLE !== 'mark') execFileSync('node', [resolve(root, 'scripts/illustrate.mjs'), 'report', job.final], { stdio: 'inherit', cwd: root });
  /* The colour group is the index's section, so a drawing that comes back in
     the wrong accent breaks the grouping a reader scrolls past. The generator
     cannot hit a hex, so this measures what it actually did rather than
     trusting the prompt: the most common non-grey, non-white bin, by hue. */
  if (job.group) {
    const want = features.ACCENTS[job.group];
    const hue = Number(execFileSync('node', [resolve(root, 'scripts/lib/accent.mjs'), job.final], { cwd: root }).toString().trim());
    const band = hue < 45 || hue > 330 ? 'release' : hue < 70 ? 'amber (no group)' : hue < 170 ? 'ai' : hue < 270 ? 'systems' : 'judgment';
    const ok = band === job.group;
    console.log(`\n  ${ok ? '\u2713' : '\u2717'} accent hue ${hue} reads as ${band}; ${want.section} wants ${want.name} ${want.hex}`);
    if (!ok) console.log('    redraw it naming the colour again, or the index loses its three groups');
  }
} else if (cmd === 'sheet') {
  /* THE RAIL (style.css) is drawn differently from the scenes: one 3 x 2
     sheet of small wordless glyphs per figure, in one chat whose first
     message attached the rail reference, so every step of a figure is in
     one hand. A sheet is not a queued job; this files the clipboard's
     picture under the figure's name for slice to cut. */
  const name = argv[1];
  if (!name) { console.error('sheet <name>'); process.exit(1); }
  const out = resolve(INBOX, `${name}-sheet.png`);
  mkdirSync(INBOX, { recursive: true });
  execFileSync('osascript', [
    '-e', `set f to open for access POSIX file "${out}" with write permission`,
    '-e', 'set eof f to 0',
    '-e', 'write (the clipboard as «class PNGf») to f',
    '-e', 'close access f',
  ]);
  console.log(`✓ clipboard → ${short(out)}  (${statSync(out).size} bytes)`);
} else if (cmd === 'slice') {
  /* A sheet's six cells, read left to right and top to bottom, cut to one
     tile per name; "-" skips a cell, so one sheet can hold two figures.
     Each cell's drawing is found by its non-white pixels, and every tile
     of one cut is the same crop size -- the widest drawing, or the tallest
     at the tile's aspect, plus a margin -- centred on its own drawing, so
     a figure's drawings print at one scale. A crop wider than its cell
     sees only its own cell, on white: the neighbour does not bleed in.
     That masking also blanks a drawing's OWN ink past the seam, which is
     invisible in the tile -- the drawing just stops, with white beyond it,
     and no edge check can see it. The dcf process sheet lost a browser
     window's right border that way. So ink within 2px of a cell's edge
     refuses the whole cut, naming the tile and the edge: redraw the sheet
     with the drawing inside its cell, or cut that one tile by hand from
     the full sheet when the neighbour cell is empty.
     Near-white goes to white, so the tile sits on the page's ground.
     Then each tile is trimmed across to its ink, 4px either side, and keeps
     the full height: the rail prints a drawing by its height, so the scale
     holds, and the drawing starts on its words' left edge (2026-10-30).
     The width it prints is the tile's width attribute.
     --alpha, since 2026-10-30: the white ground goes transparent instead,
     for a tile that sits on a ground that is not white (The Shortlist's
     decisions, on the warm chapter). The threshold is the same 251 the
     flatten uses, so a tile cut either way carries the same ink; the
     anti-aliased edge keeps its white, which on the warm (#f5f5f0) is
     under a hairline's worth of difference. --out <dir> files the tiles
     somewhere other than img/writing/. */
  const alpha = argv.includes('--alpha');
  const oi = argv.indexOf('--out');
  const outDir = oi >= 0 ? argv.splice(oi, 2)[1] : 'img/writing';
  if (alpha) argv.splice(argv.indexOf('--alpha'), 1);
  const [, name, namesArg, size = '360x240'] = argv;
  if (!name || !namesArg) { console.error('slice <name> <tile,tile,-,...> [WxH]'); process.exit(1); }
  const sheet = resolve(INBOX, `${name}-sheet.png`);
  if (!existsSync(sheet)) { console.error(`no sheet at ${short(sheet)}; run: node scripts/draw.mjs sheet ${name}`); process.exit(1); }
  const names = namesArg.split(',');
  const [OW, OH] = size.split('x').map(Number);
  const { loadChromium, findChrome } = await import('./lib/harness.mjs');
  const browser = await loadChromium('draw.mjs slice').launch({ executablePath: findChrome() });
  const page = await browser.newPage();
  const dataUrl = `data:image/png;base64,${readFileSync(sheet).toString('base64')}`;
  const res = await page.evaluate(async ({ dataUrl, skip, OW, OH, alpha }) => {
    const im = new Image(); im.src = dataUrl; await im.decode();
    const W = im.naturalWidth, H = im.naturalHeight, cw = W / 3, ch = H / 2;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const px = g.getImageData(0, 0, W, H).data;
    const boxes = skip.map((_, k) => {
      const x0 = (k % 3) * cw, y0 = Math.floor(k / 3) * ch;
      let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
      for (let y = Math.round(y0) + 4; y < y0 + ch - 4; y++) for (let x = Math.round(x0) + 4; x < x0 + cw - 4; x++) {
        const i = (y * W + x) * 4;
        if (Math.min(px[i], px[i + 1], px[i + 2]) < 225) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
      }
      const touches = [minx <= x0 + 6 && 'left', maxx >= x0 + cw - 7 && 'right', miny <= y0 + 6 && 'top', maxy >= y0 + ch - 7 && 'bottom'].filter(Boolean);
      return { x0, y0, w: maxx - minx, h: maxy - miny, cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, touches };
    });
    const crossed = boxes.flatMap((b, k) => (!skip[k] && b.touches.length ? [{ k, edges: b.touches.join(' and ') }] : []));
    if (crossed.length) return { crossed };
    const ar = OW / OH;
    const side = Math.ceil(Math.max(...boxes.filter((_, k) => !skip[k]).map((b) => Math.max(b.w, b.h * ar))) * 1.16);
    const out = boxes.map((b, k) => {
      if (skip[k]) return null;
      const cell = document.createElement('canvas'); cell.width = W; cell.height = H;
      const cg = cell.getContext('2d'); cg.fillStyle = '#fff'; cg.fillRect(0, 0, W, H);
      cg.drawImage(c, b.x0, b.y0, cw, ch, b.x0, b.y0, cw, ch);
      const t = document.createElement('canvas'); t.width = OW; t.height = OH;
      const tg = t.getContext('2d'); tg.fillStyle = '#fff'; tg.fillRect(0, 0, OW, OH);
      tg.imageSmoothingQuality = 'high';
      tg.drawImage(cell, b.cx - side / 2, b.cy - side / ar / 2, side, side / ar, 0, 0, OW, OH);
      const d = tg.getImageData(0, 0, OW, OH); const p = d.data;
      for (let i = 0; i < p.length; i += 4) if (Math.min(p[i], p[i + 1], p[i + 2]) >= 251) { p[i] = p[i + 1] = p[i + 2] = 255; if (alpha) p[i + 3] = 0; }
      tg.putImageData(d, 0, 0);
      let l = OW, r = -1;
      for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
        const i = (y * OW + x) * 4;
        if (Math.min(p[i], p[i + 1], p[i + 2]) < 235) { l = Math.min(l, x); r = Math.max(r, x); }
      }
      const L = Math.max(0, l - 4), w = Math.min(OW, r + 5) - L;
      const o = document.createElement('canvas'); o.width = w; o.height = OH;
      o.getContext('2d').drawImage(t, L, 0, w, OH, 0, 0, w, OH);
      return { url: o.toDataURL('image/webp', 0.9), w };
    });
    return { side, out };
  }, { dataUrl, skip: names.map((x) => x === '-'), OW, OH, alpha });
  await browser.close();
  if (res.crossed) {
    for (const { k, edges } of res.crossed) console.error(`✗ ${names[k]}: ink within 2px of its cell's ${edges} edge -- the cut sees only the cell, so anything past the seam goes white`);
    console.error('  nothing written. Redraw the sheet with the drawing inside its cell, or cut that tile by hand from the full sheet if the neighbour cell is empty (1b262784 is the worked example).');
    process.exit(1);
  }
  const dir = resolve(root, outDir);
  res.out.forEach((t, k) => {
    if (!t) return;
    const f = resolve(dir, `${names[k]}.webp`);
    writeFileSync(f, Buffer.from(t.url.split(',')[1], 'base64'));
    console.log(`✓ ${short(f)}  ${t.w}x${OH}  (${statSync(f).size} bytes)`);
  });
  console.log(`  one scale: ${res.side}px of sheet across each ${OW}x${OH} cell, trimmed across to its ink`);
} else {
  console.error('queue [ids] | status | next [i] | clip <i> | land <i> [file] | take <i> [illustrate args] | sheet <name> | slice <name> <tiles> [WxH]');
  process.exit(1);
}
