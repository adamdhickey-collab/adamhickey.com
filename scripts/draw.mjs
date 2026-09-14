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

/* --set features draws the article's top picture (and its index card, cut
   from the same source); the default set stays the second, in-body scene.
   The two differ in their prompts, their style anchor, and what a finished
   job produces -- a feature is two WebPs, a scene one. */
const argv = process.argv.slice(2);
const si = argv.indexOf('--set');
const SET = si >= 0 ? argv.splice(si, 2)[1] : 'scenes';
if (!['scenes', 'features'].includes(SET)) { console.error(`--set is scenes or features, not ${SET}`); process.exit(2); }
const FEATURES = SET === 'features';
const { STYLE, REF } = FEATURES ? features : scenes;
const JOBS = FEATURES ? features.FEATURES : scenes.SCENES;
const SUFFIX = FEATURES ? '' : '-2';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = resolve(root, 'img/inbox');
const QUEUE = resolve(INBOX, 'QUEUE.json');
const REF_PNG = resolve(INBOX, 'style-reference.png');
const DOWNLOADS = join(homedir(), 'Downloads');
const ASPECT = 'Draw this as a wide 16:9 landscape image.';

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
    final: resolve(root, `img/writing/${s.id}${SUFFIX}.webp`),
    attach: i === 0 ? [REF_PNG] : [],
    /* The accent is named in every prompt, not once at the top: the thread
       holds the style but not which of the three colours this picture takes,
       and the group is the index's section rather than the artist's choice.
       The sentence is the registry's, so it and the preamble agree on what
       else a picture may carry. */
    prompt: `${i === 0 ? `${STYLE}\n\n` : ''}${s.prompt}${s.group ? `\n\n${features.accentLine(s.group)}` : ''}\n\n${ASPECT}`,
    done: existsSync(resolve(INBOX, `${s.id}${SUFFIX}.png`)),
    ...(FEATURES ? { card: resolve(root, `img/writing/${s.id}-card.webp`) } : {}),
    /* Both sets carry a group now, so `take` measures a scene's hue too. */
    ...(s.group ? { group: s.group } : {}),
  }));
  writeQueue(jobs);
  console.log(`${jobs.length} job(s) → ${short(QUEUE)}`);
  for (const [i, j] of jobs.entries()) console.log(`  ${line(j, i)}`);
  /* A PNG in the inbox from before the prompts changed reads as "done" and
     `take` would file it. The registry's own mtime is the line: anything
     older than it was drawn to a prompt that no longer exists. */
  const registry = resolve(root, 'scripts', FEATURES ? 'writing-features.mjs' : 'writing-scenes.mjs');
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
  cut('feature', job.final);
  /* A feature is stored twice, and the card has to be cut from the same
     source in the same run -- cutting it later, from the WebP, would put a
     second lossy pass on it. */
  if (job.card) cut('card', job.card);
  execFileSync('node', [resolve(root, 'scripts/illustrate.mjs'), 'report', job.final], { stdio: 'inherit', cwd: root });
  /* The colour group is the index's section, so a drawing that comes back in
     the wrong accent breaks the grouping a reader scrolls past. The generator
     cannot hit a hex, so this measures what it actually did rather than
     trusting the prompt: the most common non-grey, non-white bin, by hue. */
  if (job.group) {
    const want = features.ACCENTS[job.group];
    const hue = Number(execFileSync('node', [resolve(root, 'scripts/lib/accent.mjs'), job.final], { cwd: root }).toString().trim());
    const band = hue < 45 || hue > 330 ? 'release' : hue < 70 ? 'amber (no group)' : hue < 170 ? 'ai' : 'systems';
    const ok = band === job.group;
    console.log(`\n  ${ok ? '\u2713' : '\u2717'} accent hue ${hue} reads as ${band}; ${want.section} wants ${want.name} ${want.hex}`);
    if (!ok) console.log('    redraw it naming the colour again, or the index loses its three groups');
  }
} else {
  console.error('queue [ids] | status | next [i] | clip <i> | land <i> [file] | take <i> [illustrate args]');
  process.exit(1);
}
