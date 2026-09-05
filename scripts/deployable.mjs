#!/usr/bin/env node
/* Can this tree be uploaded as a Pages artifact at all?
 *
 * Every other check here asks whether the site is RIGHT. This one asks the
 * question underneath that: whether the bytes can leave the runner. A tree can
 * pass all six and still not reach the URL, and when that happens nothing
 * about the site is wrong -- it is simply the previous deploy, still being
 * served, looking exactly like a site that was never changed.
 *
 * WHAT HAPPENED. #111 replaced the whole Lucy Learns image set and bumped
 * every cache-buster correctly. It also committed `node_modules` as a symlink
 * (mode 120000) pointing at /Users/adamhickey/Projects/adamhickey-next/
 * node_modules, which is a path that exists on exactly one machine on earth.
 * `checks` went green. Deploy to Pages died fourteen seconds in:
 *
 *     tar: ./node_modules: File removed before we read it
 *     ##[error]Process completed with exit code 1
 *
 * upload-pages-artifact tars the repository root, so one unresolvable entry
 * anywhere in the tree loses the entire artifact -- not the file, the deploy.
 * The plaster-room redraw sat on main for eight minutes looking published
 * while the site served the pass before it, and the only thing that said so
 * was a red mark on a workflow nobody was looking at.
 *
 * WHY THE TEST IS "NO SYMLINK" AND NOT "NO BROKEN SYMLINK". The tar runs with
 * --dereference: it follows links and stores what it finds. On the Mac that
 * link resolved, so tarring the tree here would have SUCCEEDED, and a guard
 * that tested whether the link resolves would have passed on the machine where
 * the mistake was made and failed only where it costs a deploy. A symlink is
 * uploadable exactly when its target happens to exist on the runner, which is
 * not a property of this repository. So: none of them, and the message says
 * what to do instead.
 *
 * THE SECOND NET, AND WHY IT DID NOT CATCH THIS ONE. `node_modules/` has been
 * in .gitignore the whole time, and the trailing slash is why that was no
 * protection: it matches a directory, and what got staged was a symlink, which
 * is a file. `git check-ignore node_modules` at b10cabe exits 1 -- git did not
 * consider the path ignored, so it did not object to adding it. The slash is
 * gone from .gitignore now, so the same `git add` would need a -f.
 *
 * The net stays because it catches the neighbouring accident: a file that IS
 * ignored, staged by name anyway -- built output, a local config, an installed
 * dependency. .gitignore has nothing to say about a path you name explicitly,
 * so nothing else here would notice.
 *
 *   node scripts/deployable.mjs
 *   node scripts/deployable.mjs --root <path>
 *
 * Exit 0 means the tree can be uploaded. Exit 1 means it cannot, and names
 * what. Exit 2 means the question could not be answered, which is not a yes.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { revision } from './lib/harness.mjs';

const argv = process.argv.slice(2);
const rootArg = argv.indexOf('--root');
const root = path.resolve(rootArg === -1 ? process.cwd() : argv[rootArg + 1] ?? '.');

const say = (s = '') => console.log(s);
const git = (...args) =>
  execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).replace(/\0$/, '');

/* Same header as the six: which tree, and which version of it. */
say(`\n  ${root}`);
let tracked;
try {
  tracked = git('ls-files', '-s', '-z').split('\0').filter(Boolean);
} catch {
  say('  not a git checkout -- nothing to check\n');
  process.exit(2);
}
const rev = revision(root);
if (rev) say(`  ${rev}`);
say(`  ${tracked.length} tracked path${tracked.length === 1 ? '' : 's'}`);

/* <mode> <sha> <stage>\t<path>. Mode 120000 is a symlink; the blob is its
   target, which is the useful half of the report. */
const links = tracked
  .map((line) => line.split('\t'))
  .filter(([meta]) => meta.startsWith('120000'))
  .map(([meta, file]) => [file, git('cat-file', 'blob', meta.split(' ')[1]).trim()]);

const ignored = git('ls-files', '-i', '-c', '--exclude-standard', '-z')
  .split('\0')
  .filter(Boolean);

if (!links.length && !ignored.length) {
  say('\n  ✓ No symlinks and nothing tracked that .gitignore matches. The tar');
  say('    that builds the Pages artifact has nothing here it cannot read.\n');
  process.exit(0);
}

if (links.length) {
  say(`\n  ✗ ${links.length} tracked symlink${links.length === 1 ? '' : 's'}:\n`);
  for (const [file, target] of links) {
    const escapes = path.isAbsolute(target) || target.startsWith('..');
    say(`      ${file}  ->  ${target}`);
    if (escapes) say('          leaves the repository; it resolves on one machine at most');
  }
  say('');
  say('  upload-pages-artifact tars the root with --dereference, so a link it');
  say('  cannot follow fails the whole artifact and the site keeps serving the');
  say('  previous deploy. Untrack it -- `git rm --cached <path>` -- and leave');
  say('  the real file or directory in place locally.');
}

if (ignored.length) {
  say(`\n  ✗ ${ignored.length} tracked path${ignored.length === 1 ? '' : 's'} that .gitignore matches:\n`);
  for (const file of ignored) say(`      ${file}`);
  say('');
  say('  .gitignore does not apply to a path that was staged by name. If it is');
  say('  ignored it is not meant to ship: `git rm --cached <path>`.');
}

say('');
process.exit(1);
