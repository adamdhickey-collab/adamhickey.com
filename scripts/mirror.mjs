#!/usr/bin/env node
/* Has the published site drifted from this one?
 *
 *   node scripts/mirror.mjs            report
 *   node scripts/mirror.mjs --strict   exit 1 if anything has drifted
 *
 * Needs no `gh`: it uses `gh` when present, then GITHUB_TOKEN, then an
 * unauthenticated request, and names which routes failed if none works.
 *
 * WHY. The site lives in two repositories on parallel histories:
 *
 *   Claude-Local      this one — where the work happens
 *   adamhickey-next   the one with the Pages workflow — what the world sees
 *
 * Only the second publishes. Nothing keeps them in step, and nothing ever
 * announced that they had stopped being in step. On 23 Aug 2026 Lucy Learns was
 * restored here, committed, and pushed — and was still not live, because the
 * change had gone to the repository that does not deploy. They had to be
 * mirrored by hand afterwards.
 *
 * That copy was only safe because the two trees happened to be byte-identical
 * beforehand. They will not always be. Copying a file from one to the other
 * while they have diverged silently discards whatever the other one knew.
 *
 * WHAT IT COMPARES, and how it avoids downloading the site. Git blob SHAs are
 * content hashes: two files with the same SHA are the same bytes. So this asks
 * GitHub for the published tree — one API call, paths and SHAs only — and hashes
 * the local files with `git hash-object`. No clone, no file transfer, exact.
 *
 * THE THREE EXCEPTIONS ARE NOT A FUDGE. Each repository is allowed to describe
 * itself: its README says what it is, its .gitignore names the neighbours it has
 * to ignore, and only the publishing one carries a Pages workflow. Those three
 * differ ON PURPOSE and are listed below. Everything else — every page, every
 * stylesheet, every image — must match, and this fails when it does not.
 *
 * The direction of the check is deliberate: every file PUBLISHED must exist here
 * and match. A file that exists only here is fine — it is unpublished work, not
 * drift.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = 'adamdhickey-collab/adamhickey-next';
const BRANCH = 'main';

/* Files each repository is allowed to hold its own version of. */
const OWN = new Set([
  'README.md',                    // each repo says what it is
  '.gitignore',                   // this one ignores neighbouring project repos
  '.github/workflows/pages.yml',  // only the published repo deploys
]);

/* Whole trees the publishing repository owns, matched by prefix.
 *
 * /clientsafe/ is the third edition the README describes -- the same design
 * with the products withheld. It was built on `portfolio-standalone`, a branch
 * that never merged to main here, so it exists only where it is served from.
 *
 * Without this, every run reported 125 files as "published and do not exist
 * here at all" -- on the one script whose job is to say exactly that. The real
 * signal, twelve genuinely drifted files, was buried under ten times its own
 * length in false alarm, which is how a check stops being read. */
const OWN_TREES = ['clientsafe/'];
const owned = (p) => OWN.has(p) || OWN_TREES.some((t) => p.startsWith(t));

const strict = process.argv.includes('--strict');
const root = process.cwd();
const say = (...a) => console.log(...a);

/* One endpoint, three ways to reach it. `gh` was the only way for a while, which
 * made this script unrunnable anywhere `gh` is not installed — a CI job, a
 * container, an agent session — and the failure blamed `gh` rather than saying
 * what else it had tried, because it had not tried anything else.
 *
 * The API call needs no `gh`: it is a plain GET, and Node has had global fetch
 * since 18. So `gh` first when it is there (it carries the login you already
 * have), then a token from the environment, then unauthenticated, which is
 * enough for a public repository until the hourly limit runs out. */
const ENDPOINT = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
const HEADERS = { 'user-agent': 'mirror.mjs', accept: 'application/vnd.github+json' };

async function readPublishedTree() {
  const tried = [];

  try {
    const raw = execFileSync('gh',
      ['api', `repos/${REPO}/git/trees/${BRANCH}?recursive=1`],
      { encoding: 'utf8', maxBuffer: 1 << 24, stdio: ['ignore', 'pipe', 'ignore'] });
    return { tree: JSON.parse(raw), via: 'gh' };
  } catch (e) {
    tried.push(`gh — ${/ENOENT/.test(String(e.message)) ? 'not installed' : 'failed or not logged in'}`);
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  for (const [label, headers] of [
    ...(token ? [['token from the environment', { ...HEADERS, authorization: `Bearer ${token}` }]] : []),
    ['unauthenticated', HEADERS],
  ]) {
    try {
      const res = await fetch(ENDPOINT, { headers });
      if (res.ok) return { tree: await res.json(), via: label };
      const body = await res.text().catch(() => '');
      const msg = (() => { try { return JSON.parse(body).message; } catch { return ''; } })();
      tried.push(`${label} — HTTP ${res.status}${msg ? ` (${msg})` : ''}`);
    } catch (e) {
      tried.push(`${label} — ${String(e.message || e).split('\n')[0]}`);
    }
  }
  return { tried };
}

const fetched = await readPublishedTree();
if (!fetched.tree) {
  say('  · could not read the published tree. Every route was tried:\n');
  for (const t of fetched.tried) say(`      ${t}`);
  say('');
  say('    Any one of these fixes it: install and log in to `gh`, or set');
  say('    GITHUB_TOKEN to a token with read access to the repository.');
  say('');
  say('    A 404 on the unauthenticated attempt does not mean the repository is');
  say('    missing. GitHub answers 404 rather than 403 for a private repository');
  say('    you cannot see, which is what the published repo is -- so anonymous');
  say('    will never work here, whatever the rate limit says.');
  say('');
  process.exit(strict ? 1 : 0);
}

/* A tree over 100,000 entries comes back truncated, and a truncated tree would
 * report every missing file as drift. Refuse rather than mislead. */
if (fetched.tree.truncated) {
  say('  · the published tree came back truncated, so this comparison would be');
  say('    wrong in the alarming direction — every unlisted file reads as absent.');
  process.exit(strict ? 1 : 0);
}
const tree = fetched.tree.tree.filter((t) => t.type === 'blob');

const drifted = [];
const absent = [];
let matched = 0;
let excepted = 0;

for (const entry of tree) {
  if (owned(entry.path)) { excepted += 1; continue; }
  const local = path.join(root, entry.path);
  if (!fs.existsSync(local)) { absent.push(entry.path); continue; }
  /* `git hash-object` is the same hash git itself stores, so this compares
     content exactly — no normalisation, no guessing about line endings. */
  const sha = execFileSync('git', ['hash-object', local], { encoding: 'utf8' }).trim();
  if (sha === entry.sha) matched += 1;
  else drifted.push(entry.path);
}

const bad = drifted.length + absent.length;
say('');
if (!bad) {
  say(`  ✓ the published site matches this one`);
  say(`    ${matched} files identical · ${excepted} each repo owns its own copy of`);
} else {
  if (drifted.length) {
    say(`  ✗ ${drifted.length} published file(s) differ from this repository:\n`);
    for (const f of drifted) say(`      ${f}`);
  }
  if (absent.length) {
    say(`\n  ✗ ${absent.length} published file(s) do not exist here at all:\n`);
    for (const f of absent) say(`      ${f}`);
  }
  say(`\n  ${matched} matched. The live site is ${REPO}; this repository does not`);
  say('  publish. Do not copy either way until you know which side is newer —');
  say(`  \`git clone https://github.com/${REPO}.git\` and diff before overwriting`);
  say('  anything.');
}
say('');
process.exit(strict && bad ? 1 : 0);
