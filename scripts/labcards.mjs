#!/usr/bin/env node
/* The lab cards on the homepage and the lab index say the same thing.
 *
 * THE RULE. Since 2026-11-17 (Adam: "those two should always be synced up
 * when one is updated"), each lab piece that has a card on both pages
 * carries the same picture, headline, lead, and one-line description on
 * both. The homepage is the source. Each shared part sits between
 * markers in both files:
 *
 *   <!-- card:<piece>:<part> --> ... <!-- /card -->
 *
 * where <part> is graphic, title, lead, or desc. The markers go inside the
 * element, so each page keeps its own wrapper and classes (the lab index's
 * picture is aria-hidden inside a link that already names the piece; the
 * homepage's is not).
 *
 * WHAT IT DOES. Without arguments it compares every marked part, line by
 * line with the indentation ignored, and fails naming the part that
 * differs. With --write it copies each homepage part into the lab index,
 * re-indented to where the lab index holds it. A part marked on one page
 * and not the other fails either way: a card that lost its markers has
 * stopped being held, and that is the failure this exists to catch.
 *
 * Edit the homepage, then run `node scripts/labcards.mjs --write`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'index.html';
const COPY = 'lab/index.html';
const RX = /<!-- card:([a-z-]+:[a-z]+) -->([\s\S]*?)<!-- \/card -->/g;

const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const indentAt = (text, i) => text.slice(text.lastIndexOf('\n', i) + 1).match(/^[ \t]*/)[0];
function parts(text) {
  const out = new Map();
  for (const m of text.matchAll(RX)) {
    if (out.has(m[1])) throw new Error(`card:${m[1]} is marked twice`);
    out.set(m[1], { body: m[2], index: m.index, length: m[0].length, indent: indentAt(text, m.index) });
  }
  return out;
}
/* A picture's address is the one thing that rightly differs: the homepage
   reaches img/ from the root and the lab index from one folder down. Both
   are compared, and written, as the homepage's. */
const UP = /(src|srcset)="\.\.\/img\//g, DOWN = /(src|srcset)="img\//g;
const norm = s => s.replace(UP, '$1="img/').split('\n').map(l => l.trim()).filter(Boolean).join('\n');
function reindent(body, from, to) {
  return body.split('\n').map((l, i) => {
    if (i === 0 || !l.trim()) return l;
    return l.startsWith(from) ? to + l.slice(from.length) : l;
  }).join('\n');
}

const write = process.argv.includes('--write');
const src = read(SOURCE);
let copy = read(COPY);
const a = parts(src), b = parts(copy);
const problems = [];
for (const k of a.keys()) if (!b.has(k)) problems.push(`card:${k} is on ${SOURCE} and not on ${COPY}`);
for (const k of b.keys()) if (!a.has(k)) problems.push(`card:${k} is on ${COPY} and not on ${SOURCE}`);
const differ = [...a.keys()].filter(k => b.has(k) && norm(a.get(k).body) !== norm(b.get(k).body));

console.log(`  ${root}\n  ${a.size} card parts on ${SOURCE}, ${b.size} on ${COPY}`);
if (write && differ.length) {
  // Last first, so the earlier offsets stay true.
  for (const k of differ.sort((x, y) => b.get(y).index - b.get(x).index)) {
    const s = a.get(k), t = b.get(k);
    const body = reindent(s.body, s.indent, t.indent).replace(DOWN, '$1="../img/');
    copy = copy.slice(0, t.index) + `<!-- card:${k} -->${body}<!-- /card -->` + copy.slice(t.index + t.length);
    console.log(`  wrote card:${k} into ${COPY}`);
  }
  fs.writeFileSync(path.join(root, COPY), copy);
} else {
  for (const k of differ) problems.push(`card:${k} differs: edit ${SOURCE}, then run node scripts/labcards.mjs --write`);
}
if (problems.length) {
  console.log(`  ✗ the lab cards have drifted\n` + problems.map(p => `    ${p}`).join('\n'));
  process.exit(1);
}
console.log(`  ✓ the lab cards on ${SOURCE} and ${COPY} match`);
