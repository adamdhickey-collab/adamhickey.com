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
 *   node scripts/draw.mjs take 0          the job's PNG -> img/writing/<slug>-2.webp, via illustrate.mjs
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
import { STYLE, REF, SCENES } from './writing-scenes.mjs';

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

const cmd = process.argv[2] ?? 'status';

if (cmd === 'queue') {
  const only = process.argv[3]?.split(',').map((s) => s.trim()).filter(Boolean);
  const todo = SCENES.filter((s) => !only || only.includes(s.id));
  if (!todo.length) { console.error(`nothing matches ${only?.join(',')}; ids: ${SCENES.map((s) => s.id).join(', ')}`); process.exit(1); }
  mkdirSync(INBOX, { recursive: true });
  /* The reference the set was drawn to, as a PNG, because the chat's file
     input will not take a WebP. sips is the one converter every Mac has. */
  if (!existsSync(REF_PNG)) {
    execFileSync('sips', ['-s', 'format', 'png', resolve(root, REF), '--out', REF_PNG], { stdio: 'ignore' });
  }
  const jobs = todo.map((s, i) => ({
    id: s.id,
    out: resolve(INBOX, `${s.id}-2.png`),
    final: resolve(root, `img/writing/${s.id}-2.webp`),
    attach: i === 0 ? [REF_PNG] : [],
    prompt: `${i === 0 ? `${STYLE}\n\n` : ''}${s.prompt}\n\n${ASPECT}`,
    done: existsSync(resolve(INBOX, `${s.id}-2.png`)),
  }));
  writeQueue(jobs);
  console.log(`${jobs.length} job(s) → ${short(QUEUE)}`);
  for (const [i, j] of jobs.entries()) console.log(`  ${line(j, i)}`);
  console.log('\nnode scripts/draw.mjs next   # then draw it, and clip or land it back');
} else if (cmd === 'status') {
  const jobs = readQueue();
  for (const [i, j] of jobs.entries()) console.log(line(j, i));
  console.log(`\n${jobs.filter((j) => !j.done).length} of ${jobs.length} still to draw`);
} else if (cmd === 'next') {
  const jobs = readQueue();
  const i = process.argv[3] !== undefined ? Number(process.argv[3]) : jobs.findIndex((j) => !j.done);
  if (i < 0) { console.log('all drawn'); }
  else {
    const j = jobs[i];
    console.log(`# job ${i}: ${j.id} → ${short(j.out)}`);
    console.log(`# attach: ${j.attach.length ? j.attach.map(short).join(', ') : 'nothing (the thread holds the style)'}`);
    console.log(`\n${j.prompt}\n`);
  }
} else if (cmd === 'clip') {
  const jobs = readQueue();
  const i = Number(process.argv[3]);
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
  const i = Number(process.argv[3]);
  const job = jobs[i];
  if (!job) { console.error(`no job ${i}`); process.exit(1); }
  let src = process.argv[4] ? resolve(process.argv[4]) : null;
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
  const i = Number(process.argv[3]);
  const job = jobs[i];
  if (!job) { console.error(`no job ${i}`); process.exit(1); }
  if (!existsSync(job.out)) { console.error(`${short(job.out)} is not drawn yet`); process.exit(1); }
  const extra = process.argv.slice(4);
  execFileSync('node', [resolve(root, 'scripts/illustrate.mjs'), 'feature', job.out, job.final, ...(extra.length ? extra : ['--brightness', '1'])], { stdio: 'inherit', cwd: root });
  execFileSync('node', [resolve(root, 'scripts/illustrate.mjs'), 'report', job.final], { stdio: 'inherit', cwd: root });
} else {
  console.error('queue [ids] | status | next [i] | clip <i> | land <i> [file] | take <i> [illustrate args]');
  process.exit(1);
}
