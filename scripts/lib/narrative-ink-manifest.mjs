/* HISTORICAL since 2026-11-16: no longer called (scripts/narrative-ink.mjs
 * refuses MANIFEST); the live one is lib/product-systems-manifest.mjs.
 *
 * The Shift's illustration manifest, rebuilt from the tree. Run through
 * scripts/narrative-ink.mjs:
 *
 *   node scripts/narrative-ink.mjs manifest           writes both files
 *   node scripts/narrative-ink.mjs manifest --check   exits 1 if either is stale
 *
 * Reads every <img> in writing/index.html and the twelve lessons, plus the
 * share-card pictures og.mjs names, and writes:
 *   img/writing/shift/narrative-ink/manifest.json   one row per placement
 *   writing/NARRATIVE_INK_MANIFEST.md                the same, to read
 *
 * Treatment and alt policy come from the slot (the class on the <img>), as
 * writing/NARRATIVE_INK_PANORAMA.md sets them out. Status is "narrative-ink"
 * once a placement's src points into img/writing/shift/narrative-ink/,
 * "pilot: awaiting bundle" for Lesson 1's three, and "brief written" for the
 * rest, so the rollout's progress is this file's diff. Dimensions are read
 * from the WebP header, so nothing here needs a browser.
 */
import fs from 'node:fs';
import path from 'node:path';

export function manifest(argv) {
const ROOT = process.cwd();
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
const CHAPTERS = { 1: 'The job is changing (sage)', 2: 'Inside the agent (slate)',
                   3: 'Designing the product (terracotta)', 4: 'In practice (plum)' };

/* Slot -> level, export size, purpose and alt policy. The export sizes are
   the rendered maximum at 2x, measured by `narrative-ink.mjs shots`, rounded
   up to a size a generator returns cleanly. */
const SLOTS = {
  'shift-hero-art':    { level: 'A panorama', export: 'free-standing, cut to its ink by bleed --trim, paper lifted to white', purpose: 'Lesson hero beside the title, multiplied onto the chapter ground', alt: 'empty: the title beside it says what the lesson is' },
  'writing-scene':     { level: 'A panorama', export: '1920x1080 (16:9), on paper', purpose: 'The person in the lesson\'s story, framed, wide column', alt: 'required: who, doing what, and the detail the caption points at' },
  'shift-concept-art': { level: 'B supporting', export: '1200x800 (3:2), on paper', purpose: 'The lesson\'s idea as one object, beside its concept line', alt: 'required: the object and the state that carries the idea' },
  'shift-pair-art':    { level: 'B supporting', export: '960x640 (3:2) each, drawn as one sheet, paper lifted to white by bleed', purpose: 'Two states side by side, each over a one-line label', alt: 'required: the state, not the label again' },
  'shift-stage-art':   { level: 'C icon', export: '512x512 source, 256x256 web, alpha', purpose: 'Leads a row in a list of steps, at 40-48px', alt: 'empty: the row names it' },
  'shift-stack-art':   { level: 'C icon', export: '512x512 source, 256x256 web, alpha', purpose: 'Leads a row in a stack, on white, at 40-48px', alt: 'empty: the row names it' },
  'shift-chapter-art': { level: 'B supporting', export: '1280x720 (16:9), alpha', purpose: 'Chapter emblem on the series landing', alt: 'required on the chapter band; empty on the mosaic tile' },
  'og':                { level: 'A panorama', export: '1600x900 (16:9), on paper', purpose: 'Share-card picture og.mjs sets beside the title', alt: 'n/a: rendered into the card' },
};
const PILOT = {
  'lesson-what-changes-when-you-design-the-task-instead-of-the-app.webp': 'narrative-ink/chapter-1/chapter1-lesson1-hero.webp',
  'what-changes-when-you-design-the-task-instead-of-the-app-scene.webp': 'narrative-ink/chapter-1/chapter1-lesson1-dispatcher.webp',
  'what-changes-when-you-design-the-task-instead-of-the-app-idea.webp': 'narrative-ink/chapter-1/chapter1-lesson1-human-decision.webp',
};

function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  return null;
}
const attr = (tag, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag); return m ? m[1] : null; };
const decode = (s) => s.replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&amp;/g, '&');

const rows = [];
function add(page, lesson, chapter, tag, slotOverride, before = '') {
  const src = attr(tag, 'src').split('?')[0].replace(/^\.\.\//, '');
  if (src.includes('/site/')) return;
  const cls = attr(tag, 'class') || '';
  const slot = slotOverride || Object.keys(SLOTS).find((k) => cls.split(/\s+/).includes(k))
    || (/class="[^"]*writing-scene[^"]*"[^<]*(<picture[^>]*>\s*)?$/.test(before) || before.endsWith('writing-scene') ? 'writing-scene' : null);
  const file = path.join(ROOT, src);
  const size = fs.existsSync(file) ? webpSize(file) : null;
  const base = path.basename(src);
  const spec = SLOTS[slot] || { level: '?', export: '?', purpose: '?', alt: '?' };
  rows.push({
    page, lesson, chapter, chapterName: CHAPTERS[chapter] || '',
    slot, path: src, size: size ? size.join('x') : 'missing',
    kb: fs.existsSync(file) ? Math.round(fs.statSync(file).size / 1024) : 0,
    attrs: `${attr(tag, 'width') || '?'}x${attr(tag, 'height') || '?'}`,
    alt: attr(tag, 'alt') === null ? null : decode(attr(tag, 'alt')),
    level: spec.level, purpose: spec.purpose, export: spec.export, altPolicy: spec.alt,
    treatment: src.includes('/narrative-ink/') ? 'keep' : 'replace',
    status: src.includes('/narrative-ink/') ? 'narrative-ink'
      : PILOT[base] ? 'pilot: awaiting bundle' : 'brief written',
    replacement: PILOT[base] ? `img/writing/shift/${PILOT[base]}` : null,
  });
}

{
  const t = fs.readFileSync(path.join(ROOT, 'writing/index.html'), 'utf8');
  const main = t.slice(t.indexOf('<main'));
  let ch = 0;
  for (const m of main.matchAll(/shift-ch-(\d)|<img\b[^>]*>/g)) {
    if (m[1]) { ch = Number(m[1]); continue; }
    const before = main.slice(Math.max(0, m.index - 400), m.index);
    add('writing/index.html', 0, ch, m[0], before.includes('shift-mosaic') && !m[0].includes('shift-chapter-art') ? 'shift-chapter-art' : null);
  }
}
LESSONS.forEach((slug, i) => {
  const page = `writing/${slug}.html`;
  const t = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const main = t.slice(t.indexOf('<main'));
  const ch = Number(/shift-ch-(\d)/.exec(main)[1]);
  for (const m of main.matchAll(/<img\b[^>]*>/g)) {
    const before = main.slice(Math.max(0, m.index - 300), m.index);
    const fig = before.lastIndexOf('<figure');
    add(page, i + 1, ch, m[0], before.slice(fig).includes('writing-scene') ? 'writing-scene' : null);
  }
});
{
  const og = fs.readFileSync(path.join(ROOT, 'scripts/og.mjs'), 'utf8');
  const seen = new Set();
  for (const m of og.matchAll(/image: '(img\/writing\/shift\/[^']+)'/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const ch = Number((/chapter-(\d)/.exec(m[1]) || [])[1] || 0);
    add('scripts/og.mjs', 0, ch, `<img src="${m[1]}" alt="">`, 'og');
  }
}

const json = JSON.stringify({ generatedBy: 'node scripts/narrative-ink.mjs manifest', placements: rows }, null, 1) + '\n';

const count = (f) => rows.filter(f).length;
const files = new Set(rows.map((r) => r.path));
let md = `# The Shift: illustration manifest

Generated by \`node scripts/narrative-ink.mjs manifest\` from the tree; do not
edit by hand. The rules each column applies are in
[NARRATIVE_INK_PANORAMA.md](NARRATIVE_INK_PANORAMA.md), and the brief for each
replacement is in [NARRATIVE_INK_BRIEFS.md](NARRATIVE_INK_BRIEFS.md).

**${rows.length} placements of ${files.size} files**: ${count((r) => r.level.startsWith('A'))} panorama,
${count((r) => r.level.startsWith('B'))} supporting, ${count((r) => r.level.startsWith('C'))} icon.
${count((r) => r.status === 'narrative-ink')} in the new hand, ${count((r) => r.status.startsWith('pilot'))} waiting on the
Chapter 1 pilot bundle, ${count((r) => r.status === 'brief written')} briefed and waiting on the pilot's approval.

**Preserve.** None of these placements is a product screenshot or a
diagram drawn as a picture. Every figure that carries labels, steps, or
evidence in these lessons is HTML (\`.shift-flow\`, \`.shift-compare\`,
\`.shift-stack\`, \`.shift-stages\`, the number rows) and stays exactly as it
is. Only the drawings in the rows below change.

`;
let last = null;
for (const r of rows) {
  const head = r.page === 'scripts/og.mjs' ? 'Share cards (scripts/og.mjs)'
    : r.lesson === 0 ? 'Series landing (writing/index.html)'
    : `Lesson ${r.lesson}, chapter ${r.chapter}: ${r.page.replace('writing/', '')}`;
  if (head !== last) {
    md += `\n## ${head}\n\n| Picture | Slot | Now | Level and export | Status | Alt |\n| --- | --- | --- | --- | --- | --- |\n`;
    last = head;
  }
  const alt = r.alt === null ? '**missing**' : r.alt === '' ? '`""`' : r.alt.replace(/\|/g, '\\|');
  md += `| \`${path.basename(r.path)}\` | ${r.slot} | ${r.size}, ${r.kb} KB | ${r.level}: ${r.export} | ${r.status}${r.replacement ? ` -> \`${path.basename(r.replacement)}\`` : ''} | ${alt}<br>*${r.altPolicy}* |\n`;
}

const outJson = path.join(ROOT, 'img/writing/shift/narrative-ink/manifest.json');
const outMd = path.join(ROOT, 'writing/NARRATIVE_INK_MANIFEST.md');
if (argv.includes('--check')) {
  const stale = [[outJson, json], [outMd, md]].filter(([f, s]) => !fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s);
  for (const [f] of stale) console.log(`  ✗ ${path.relative(ROOT, f)} is stale; run node scripts/narrative-ink.mjs manifest`);
  if (!stale.length) console.log(`  ✓ manifest current: ${rows.length} placements`);
  process.exit(stale.length ? 1 : 0);
}
fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, json);
fs.writeFileSync(outMd, md);
console.log(`  ${rows.length} placements of ${files.size} files -> ${path.relative(ROOT, outJson)}, ${path.relative(ROOT, outMd)}`);
}
