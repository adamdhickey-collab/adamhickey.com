/* The Shift's Product Systems manifest, rebuilt from the tree. Run through
 * scripts/product-systems.mjs:
 *
 *   node scripts/product-systems.mjs manifest           writes both files
 *   node scripts/product-systems.mjs manifest --check   writes nothing; exits 1 on any finding
 *
 * Reads every <img> under <main> in writing/index.html and the twelve
 * lessons, and the share pictures scripts/og.mjs names; matches each to the
 * registry; and writes img/writing/shift/product-systems/manifest.json (one
 * row per placement, plus the old -> new mapping, one row per artwork) and
 * writing/PRODUCT_SYSTEMS_MANIFEST.md, the same to read.
 *
 * Findings: a page still naming a Narrative Ink picture; a placement whose
 * file is not in the registry or not on disk; width and height attributes
 * that are not the file's shape; a registered artwork no page or card uses;
 * a hero, pair, or chapter-band picture without alt text; and either output
 * file stale.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ALL, BASE } from './product-systems-registry.mjs';

const LESSONS = [
  'what-changes-when-you-design-the-task-instead-of-the-app',
  'what-is-ux-for-when-agents-build-the-software',
  'how-do-you-write-design-quality-down-so-an-agent-can-use-it',
  'what-is-an-ai-agent-actually-made-of',
  'what-should-you-never-do-when-building-an-agent',
  'why-does-designing-with-ai-feel-slower-than-it-should',
  'what-does-a-requirements-doc-need-once-the-product-is-ai',
  'how-do-you-run-a-design-sprint-for-an-ai-product',
  'why-didnt-more-ai-answers-bring-more-clarity',
  'who-sets-the-rules-when-research-uses-digital-twins',
  'what-makes-onboarding-in-an-ai-app-feel-personal',
  'what-should-come-first-when-you-redesign-an-ai-product',
];
const ALT_REQUIRED = new Set(['shift-hero-art', 'shift-pair-art', 'shift-chapter-art']);

function size(file) {
  const b = fs.readFileSync(file);
  if (file.endsWith('.svg')) { const m = /viewBox="0 0 (\d+) (\d+)"/.exec(b.toString()); return m ? [+m[1], +m[2]] : null; }
  if (b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 4) !== 'RIFF') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  return null;
}
const attr = (tag, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag); return m ? m[1] : null; };

export function manifest(argv) {
  const ROOT = process.cwd();
  const byFile = new Map(ALL.map((a) => [a.file, a]));
  const findings = [];
  const rows = [];

  const place = (page, lesson, tag, slot) => {
    const src = attr(tag, 'src').split('?')[0].replace(/^\.\.\//, '');
    if (src.includes('/narrative-ink/')) { findings.push(`${page}: still names ${src}`); return; }
    if (!src.startsWith(BASE + '/')) return; // a project capture or the site's own furniture
    const a = byFile.get(src);
    if (!a) { findings.push(`${page}: ${src} is not in the registry`); return; }
    const disk = path.join(ROOT, src);
    if (!fs.existsSync(disk)) { findings.push(`${page}: ${src} is missing`); return; }
    const [fw, fh] = size(disk);
    const w = Number(attr(tag, 'width')), h = Number(attr(tag, 'height'));
    if (w && h && Math.abs(w / h - fw / fh) > 0.01) findings.push(`${page}: ${src} is ${fw}x${fh} but its tag says ${w}x${h}`);
    const alt = attr(tag, 'alt');
    if (alt === null) findings.push(`${page}: ${src} has no alt attribute`);
    else if (ALT_REQUIRED.has(slot) && !alt) findings.push(`${page}: ${src} in ${slot} needs alt text`);
    rows.push({ page, lesson, slot, id: `${a.kind}:${a.id}`, path: src, v: (/\?v=(\w+)/.exec(attr(tag, 'src')) || [])[1] || null, attrs: `${w}x${h}`, alt });
  };

  {
    const t = fs.readFileSync(path.join(ROOT, 'writing/index.html'), 'utf8');
    const main = t.slice(t.indexOf('<main'));
    for (const m of main.matchAll(/<img\b[^>]*>/g)) place('writing/index.html', 0, m[0], attr(m[0], 'class') || 'shift-landing');
  }
  LESSONS.forEach((slug, i) => {
    const page = `writing/${slug}.html`;
    const t = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const main = t.slice(t.indexOf('<main'));
    for (const m of main.matchAll(/<img\b[^>]*>/g)) place(page, i + 1, m[0], attr(m[0], 'class') || 'figure');
  });
  {
    const og = fs.readFileSync(path.join(ROOT, 'scripts/og.mjs'), 'utf8');
    for (const m of og.matchAll(/^\s*'([a-z-]+)':.*image: '(img\/writing\/shift\/[^']+)'/gm)) place('scripts/og.mjs', 0, `<img src="${m[2]}" alt="">`, `og:${m[1]}`);
  }

  const used = new Set(rows.map((r) => r.path));
  for (const a of ALL) if (!used.has(a.file)) findings.push(`${a.file} is registered but nothing uses it`);

  const art = ALL.map((a) => {
    const disk = path.join(ROOT, a.file);
    const s = fs.existsSync(disk) ? size(disk) : null;
    return { id: `${a.kind}:${a.id}`, kind: a.kind, chapter: a.chapter, old: a.old, new: a.file, source: a.svg,
      size: s ? s.join('x') : 'missing', kb: fs.existsSync(disk) ? Math.round(fs.statSync(disk).size / 102.4) / 10 : 0,
      placements: rows.filter((r) => r.path === a.file).length };
  });
  const olds = new Set(art.map((a) => a.old));
  if (olds.size !== art.length) findings.push('two artworks claim the same Narrative Ink original');

  const json = JSON.stringify({ generatedBy: 'node scripts/product-systems.mjs manifest', artwork: art, placements: rows }, null, 1) + '\n';
  const kinds = (k) => art.filter((a) => a.kind === k).length;
  const pageRows = rows.filter((r) => r.page !== 'scripts/og.mjs').length;
  let md = `# The Shift: Product Systems manifest

Generated by \`node scripts/product-systems.mjs manifest\` from the tree; do
not edit by hand. The grammar, palette, and how to regenerate are in
[PRODUCT_SYSTEMS.md](PRODUCT_SYSTEMS.md).

**${art.length} artworks** (${kinds('hero')} lesson heroes, ${kinds('chapter')} chapter pictures,
${kinds('icon')} icons, ${kinds('pair')} comparison pictures, ${kinds('social')} share pictures) in
**${rows.length} placements**: ${pageRows} on the thirteen pages and ${rows.length - pageRows} in the
share-card registry. Each artwork replaces exactly one Narrative Ink (or,
for the share pictures, chapter-engraving) original.

## Old to new, one row per artwork

| Artwork | Replaces | New file | Size | Placements |
| --- | --- | --- | --- | --- |
`;
  for (const a of art) md += `| ${a.id} | \`${a.old.replace('img/writing/shift/', '')}\` | \`${a.new.replace(BASE + '/', '')}\` | ${a.size}, ${a.kb} KB | ${a.placements} |\n`;
  md += '\n## Placements\n';
  let last = null;
  for (const r of rows) {
    const h = r.page === 'scripts/og.mjs' ? 'Share cards (scripts/og.mjs)' : r.lesson ? `Lesson ${r.lesson}: ${r.page.replace('writing/', '')}` : 'Series landing (writing/index.html)';
    if (h !== last) { md += `\n### ${h}\n\n| Slot | File | Tag | Alt |\n| --- | --- | --- | --- |\n`; last = h; }
    md += `| ${r.slot} | \`${r.path.replace(BASE + '/', '')}\`${r.v ? ` ?v=${r.v}` : ''} | ${r.attrs} | ${r.alt ? r.alt.replace(/\|/g, '\\|').replace(/&rsquo;/g, '’') : '`""`'} |\n`;
  }

  const outJson = path.join(ROOT, BASE, 'manifest.json');
  const outMd = path.join(ROOT, 'writing/PRODUCT_SYSTEMS_MANIFEST.md');
  if (argv.includes('--check')) {
    for (const [f, s] of [[outJson, json], [outMd, md]]) if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s) findings.push(`${path.relative(ROOT, f)} is stale; run node scripts/product-systems.mjs manifest`);
    for (const f of findings) console.log(`  ✗ ${f}`);
    if (!findings.length) console.log(`  ✓ ${art.length} artworks, ${rows.length} placements, every one registered, sized, and current`);
    process.exit(findings.length ? 1 : 0);
  }
  fs.writeFileSync(outJson, json);
  fs.writeFileSync(outMd, md);
  for (const f of findings) console.log(`  ✗ ${f}`);
  console.log(`  ${art.length} artworks, ${rows.length} placements -> ${path.relative(ROOT, outJson)}, ${path.relative(ROOT, outMd)}`);
  if (findings.length) process.exit(1);
}
