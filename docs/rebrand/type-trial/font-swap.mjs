// Swap the visual edition's type pair from Fraunces + Instrument Sans to
// Newsreader + Hanken Grotesk. Mechanical part only: the Google Fonts link on
// every portfolio page, the two tokens wherever they are declared, and the
// cache-busters of the stylesheets whose bytes change. The Say When storefront
// loads its own brand cut (Fraunces SOFT) through a different URL and is left
// alone on purpose. Run against the edition's own directory (visual/ after the
// move), never the repository root.
//
//   node font-swap.mjs <siteDir> [--dry]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dir = process.argv[2];
const dry = process.argv.includes('--dry');
if (!dir) { console.error('usage: node font-swap.mjs <siteDir> [--dry]'); process.exit(2); }

const OLD_LINK = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Instrument+Sans:wght@400;500;600;700&display=swap';
const NEW_LINK = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Hanken+Grotesk:wght@400;500;600;700&display=swap';
const TOKENS = [
  [/--font-sans:\s*"Instrument Sans",/g, '--font-sans: "Hanken Grotesk",'],
  [/--font-serif:\s*"Fraunces",/g, '--font-serif: "Newsreader",'],
];
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts', 'docs']);

function walk(d, out = []) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, out); }
    else out.push(p);
  }
  return out;
}

const files = walk(dir);
const changedCss = [];
const report = { links: 0, tokenFiles: [], busters: 0, stillNamingOld: [] };

// 1. Tokens, in any stylesheet that declares them.
for (const f of files.filter(f => f.endsWith('.css'))) {
  let s = readFileSync(f, 'utf8'); const before = s;
  for (const [re, to] of TOKENS) s = s.replace(re, to);
  if (s !== before) {
    changedCss.push(f.split('/').pop());
    report.tokenFiles.push(relative(dir, f));
    if (!dry) writeFileSync(f, s);
  }
}

// 2. The font link, and 3. the cache-busters of every stylesheet changed above.
for (const f of files.filter(f => f.endsWith('.html'))) {
  let s = readFileSync(f, 'utf8'); const before = s;
  const n = s.split(OLD_LINK).length - 1;
  s = s.split(OLD_LINK).join(NEW_LINK);
  report.links += n;
  for (const css of changedCss) {
    const re = new RegExp(`(${css.replace(/[.]/g, '\\.')}\\?v=)(\\d+)`, 'g');
    s = s.replace(re, (_, pre, v) => { report.busters++; return pre + (Number(v) + 1); });
  }
  if (s !== before && !dry) writeFileSync(f, s);
  if (/Fraunces:ital,opsz,wght@0,9\.\.144,400/.test(s)) report.stillNamingOld.push(relative(dir, f));
}

console.log(`${dry ? '[dry] ' : ''}font links replaced: ${report.links}`);
console.log(`token files: ${report.tokenFiles.join(', ') || 'none'}`);
console.log(`cache-busters bumped: ${report.busters}`);
console.log(`pages still loading the old portfolio pair: ${report.stillNamingOld.length ? report.stillNamingOld.join(', ') : 'none'}`);
