#!/usr/bin/env node
/* Is it safe to force this branch onto main?
 *
 * Pull requests here are squash-merged, so after a merge the branch and main
 * diverge by construction and the branch has to be reset onto main. The reset
 * is a force-push, and a force-push is only safe if the branch holds nothing
 * main has not already got.
 *
 * The rule used to be "git diff --stat origin/main origin/<branch> must be
 * empty". That is right about the danger and wrong about the test, because a
 * non-empty diff has two causes that look identical and want opposite
 * responses:
 *
 *   the branch is BEHIND   main moved after the PR was opened. The branch's
 *                          version of the file is one main has had before.
 *                          Forcing is safe -- it is the entire point.
 *
 *   the branch is UNIQUE   the branch holds content main has never seen.
 *                          Forcing destroys it.
 *
 * This happened on the day this script was written. Main gained a commit while
 * PR #19 was open; the guard fired on style.css; the force was safe, but only
 * a by-hand blob comparison established that. A rule that says stop when the
 * answer is usually go is a rule that gets argued past, and the argument only
 * has to be wrong once.
 *
 * So the test is per file, and it is about content, not commits: does the
 * branch's blob for this path appear anywhere in main's history for that path?
 * If yes, main has seen it and moved on. If no, the branch is the only place
 * it exists.
 *
 *   node scripts/syncable.mjs                 # the current branch, report only
 *   node scripts/syncable.mjs <branch>
 *   node scripts/syncable.mjs --apply         # check, and sync if it passes
 *
 * Exit 0 means every difference is the branch being behind. Exit 1 means stop
 * and look. Exit 2 means the question could not be answered, which is not the
 * same as a yes.
 *
 * WHY --apply EXISTS. Reporting and acting used to be separate: this script
 * printed two commands and trusted the reader to notice the exit code first.
 * That is a gate you can walk around, and it got walked around -- a sync ran
 * the reset before the check and then pushed over a 1, which was safe only
 * because the branch's content had already been squashed onto main. The guard
 * was right and was overruled by the order the commands happened to be typed
 * in.
 *
 * So --apply does the reset and the push itself, on the same run that answered
 * the question. There is no window between the answer and the action for a
 * stale answer, a wrong order, or an ignored exit code to fit into. Anything
 * other than a clean pass refuses and changes nothing.
 *
 * A rename reads as unique, because the new path has no history on main. That
 * is the safe direction to be wrong in: it stops you rather than letting you
 * force.
 */
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const gitQuiet = (...args) => {
  try { return git(...args); } catch { return ''; }
};

const say = (s = '') => console.log(s);

const apply = process.argv.includes('--apply');
let branch = process.argv.slice(2).find((a) => !a.startsWith('-'));
try {
  if (!branch) branch = git('rev-parse', '--abbrev-ref', 'HEAD');
} catch {
  console.error('\n  Not inside a git repository.\n');
  process.exit(2);
}

/* origin/main has to be current or every answer below is about a main that no
 * longer exists -- which is exactly the state that produced the near-miss this
 * script exists for. Fetching is cheap; being wrong about it is not. */
try {
  git('fetch', 'origin', 'main');
} catch {
  console.error('\n  Could not fetch origin/main, so this cannot be answered.\n');
  console.error('  Fix the network or the remote and run it again. Do not force\n' +
                '  on a stale origin/main.\n');
  process.exit(2);
}

/* A ref that does not resolve must not be treated as an empty tree: that would
 * report "nothing unique" and wave through a force-push. rev-parse also echoes
 * its own argument back for an unresolvable path rather than failing the way a
 * caller expects, which is why --verify --quiet is not optional here. */
const resolve = (rev) => gitQuiet('rev-parse', '--verify', '--quiet', rev);

/* The only route from "safe" to "done". Every exit-0 path calls it, so the
   check and the force are one decision rather than two commands with a gap
   between them. It refuses on anything it did not establish itself. */
function syncOrPrint(branchName, reason) {
  if (!apply) {
    say(`      git checkout -B ${branchName} origin/main`);
    say(`      git push -u origin ${branchName} --force-with-lease`);
    say('');
    say('  Or let this script do both, so the check cannot be skipped:');
    say('');
    say('      node scripts/syncable.mjs --apply');
    say('');
    process.exit(0);
  }

  /* checkout -B carries uncommitted work onto the reset branch, or fails
     halfway and leaves the checkout somewhere nobody asked for. Neither is a
     thing to discover during a force-push. */
  const dirty = gitQuiet('status', '--porcelain');
  if (dirty) {
    say('  ✗ Not applying: the working tree has uncommitted changes.\n');
    for (const l of dirty.split('\n').slice(0, 8)) say(`      ${l}`);
    say('\n  Commit or stash them first.\n');
    process.exit(2);
  }

  /* Syncing a branch you are not on would switch the checkout underneath you,
     which in a repository where several sessions share one worktree is how a
     commit lands on someone else's branch. */
  const head = gitQuiet('rev-parse', '--abbrev-ref', 'HEAD');
  if (head !== branchName) {
    say(`  ✗ Not applying: you are on ${head}, not ${branchName}.\n`);
    say('  Check it out first. This script will not move your checkout for you.\n');
    process.exit(2);
  }

  say(`  ${reason}`);
  try {
    git('checkout', '-B', branchName, 'origin/main');
    git('push', '-u', 'origin', branchName, '--force-with-lease');
  } catch (e) {
    say('\n  ✗ The sync failed part-way. Nothing here retries it for you.\n');
    say(`      ${String(e.message || e).split('\n')[0]}\n`);
    process.exit(2);
  }
  say(`  ✓ ${branchName} reset onto origin/main and force-pushed.`);
  say(`    now at ${gitQuiet('rev-parse', '--short', 'HEAD')}\n`);
  process.exit(0);
}
const ref = `refs/remotes/origin/${branch}`;
const target = resolve(ref) ? `origin/${branch}` : (resolve(branch) ? branch : '');
if (!target) {
  console.error(`\n  No such branch: ${branch}\n`);
  process.exit(2);
}

const changed = gitQuiet('diff', '--name-only', 'origin/main', target)
  .split('\n').filter(Boolean);

/* Identical content is not the same as nothing to do. Squashing a branch whose
 * work was all one commit leaves main with the same tree under a different
 * commit, so the diff is empty while the branch still points at pre-squash
 * history -- which is the stale state the sync exists to clear, and which reads
 * as unpushed work to anything watching the repository. The first version of
 * this script said "nothing to sync" here and was believed, which is the one
 * thing a guard must not be when it is wrong. */
const ahead = gitQuiet('rev-list', '--count', `origin/main..${target}`);
if (!changed.length) {
  if (ahead === '0') {
    say(`\n  ✓ ${target} is already at origin/main. Nothing to do.\n`);
    process.exit(0);
  }
  say(`\n  ✓ ${target} and origin/main hold identical content, but the branch`);
  say(`    still points at ${ahead} pre-squash ` +
      `commit${ahead === '1' ? '' : 's'}. Reset it — the force cannot`);
  say('    lose work, because the trees already match.\n');
  syncOrPrint(branch, 'Trees already match; clearing the pre-squash history.');
}

const behind = [], unique = [];
for (const file of changed) {
  const blob = resolve(`${target}:${file}`);

  /* Absent from the branch, present on main: main added it. Behind. */
  if (!blob) { behind.push([file, 'main added it']); continue; }

  const touching = gitQuiet('rev-list', 'origin/main', '--', file)
    .split('\n').filter(Boolean);
  const seen = touching.some((c) => resolve(`${c}:${file}`) === blob);

  if (seen) behind.push([file, 'main has had this exact version']);
  else unique.push(file);
}

say(`\n  ${changed.length} ${changed.length === 1 ? 'file differs' : 'files differ'} ` +
    `between origin/main and ${target}.\n`);

if (behind.length) {
  say(`  ${behind.length} where the branch is only behind:\n`);
  for (const [f, why] of behind) say(`      ${f}  --  ${why}`);
  say('');
}

if (unique.length) {
  say(`  ✗ ${unique.length} that exist only on the branch:\n`);
  for (const f of unique) say(`      ${f}`);
  say('');
  say('  Do NOT force. Main has never held these versions, so the reset would');
  say('  be the only copy going away. Open a pull request for this work, or');
  say('  merge origin/main in and keep going.\n');
  process.exit(1);
}

say('  ✓ Every difference is the branch trailing main. The force cannot lose');
say('    work, because none of this content is only here.\n');
syncOrPrint(branch, 'Every difference is the branch trailing main.');
