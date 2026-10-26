#!/usr/bin/env node
/* The Say When artwork, built from a few numbers.
 *
 * Say When is a self-initiated, fictional coffee brand concept (case-study/
 * say-when.html, say-when/). Everything under img/say-when/ is drawn by this
 * script: the four logo directions and the chosen one's iterations, the
 * lockups in every cut, the pattern, the three bags flat and presented, the
 * sampler, the gift box, the shipper, the outdoor poster, the social tiles,
 * and the two raster cards the site needs. Nothing here is a photograph and
 * nothing is a print run; docs/rebrand/asset-manifest.md says what a real
 * production would still need.
 *
 * WHY A SCRIPT. A packaging family is a system or it is three drawings. The
 * bag's shape, the level line's weight, the wordmark's size and the place
 * every word sits are one set of numbers below, and each product differs in
 * the four things the strategy says it should: its ground, the height of its
 * line (its "when"), its vessel and its words. Change the line's weight here
 * and every bag, the poster and the tiles move together.
 *
 * TYPE IS OUTLINED. Every word is path data from scripts/say-when-outline.py
 * (fontTools over the fonts' own files), so the SVGs draw the same in any
 * viewer with no font installed, and no browser check reads a bag as text.
 * The fonts are Google's Fraunces (variable: opsz, wght; the SuperSoft cut)
 * and Instrument Sans (variable: wght), fetched to a directory this script
 * is pointed at and never committed.
 *
 *   SW_FONTS=/path/to/fonts node scripts/say-when.mjs            every file
 *   SW_FONTS=/path/to/fonts node scripts/say-when.mjs --raster   the two webp cards too (needs Chromium)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const out = path.join(root, 'img', 'say-when');
fs.mkdirSync(out, { recursive: true });
const FONTS = process.env.SW_FONTS || '/tmp/claude-0/-home-user-adamhickey-com/edf422f7-5b56-5d50-9588-b63f00e79300/scratchpad/sw-fonts';
const SERIF = path.join(FONTS, 'fraunces-var.woff2');
const SANS = path.join(FONTS, 'instrument.woff2');
for (const f of [SERIF, SANS]) if (!fs.existsSync(f)) { console.error(`no font at ${f}; see docs/rebrand/asset-manifest.md`); process.exit(2); }

/* ---------- the palette (artwork; COLOR.md section 6) ----------------------
   ink on paper 13.0; ink on butter 9.27; ink on clay 4.80; paper on plum 10.97;
   red on paper 5.05; brown on paper 6.71. Measured, and repeated in
   say-when/say-when.css where the same values style the storefront. */
const C = {
  paper: '#f4ecdd', cream: '#fbf7ef', ink: '#2b2420', brown: '#6b4a3a',
  butter: '#f0c45b', clay: '#d4784f', plum: '#3b2d3e', red: '#b4382e',
  kraft: '#c9a27a', kraftDeep: '#a8825c',
};

/* ---------- type ------------------------------------------------------- */
const cache = new Map();
function outline(font, size, wght, text, { soft = 100, opsz = 144 } = {}) {
  const key = [font, size, wght, text, soft, opsz].join('|');
  if (cache.has(key)) return cache.get(key);
  const json = execFileSync('python3', [path.join(root, 'scripts', 'say-when-outline.py'), font, String(size), String(wght),
    font === SERIF ? String(soft) : '-', font === SERIF ? String(opsz) : '-', text], { encoding: 'utf8' });
  const r = JSON.parse(json);
  cache.set(key, r);
  return r;
}
/* A word placed at x, y (its baseline), in a fill. */
const word = (o, x, y, fill, extra = '') => `<path d="${o.d}" fill="${fill}" transform="translate(${x} ${y})"${extra}/>`;
const serif = (size, text, wght = 700, opsz = 144) => outline(SERIF, size, wght, text, { opsz });
const sans = (size, text, wght = 500) => outline(SANS, size, wght, text);

/* ---------- the mark ----------------------------------------------------
   The level line and its tick: a horizontal rule that stops in a short
   upright, the hand that says "when". One function draws it everywhere, in
   one weight relative to its length, so the mark on a poster and the mark
   under the wordmark are the same gesture. */
function level(x1, x2, y, w, color, tick = true) {
  const t = w * 1.9;
  return `<path d="M${x1} ${y}H${x2}${tick ? `V${(y - t).toFixed(2)}` : ''}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* The cup in profile: a tumbler with a slightly flared rim, the line inside
   it at a height, in a 100-unit box. */
function cup(color, levelY = 58, w = 6, bg = null) {
  const body = 'M24 28 Q22 24 26 24 H74 Q78 24 76 28 L70 86 Q69 91 64 91 H36 Q31 91 30 86 Z';
  return `${bg ? `<rect width="100" height="100" rx="22" fill="${bg}"/>` : ''}<path d="${body}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round"/>` +
    level(34, 62, levelY, w, color);
}

const svg = (w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${extra}>\n${body}\n</svg>\n`;
const write = (name, s) => { fs.writeFileSync(path.join(out, name), s); console.log('  ' + name); };

/* ---------- 1. Logo directions ------------------------------------------- */
console.log('directions');
{
  const W = serif(100, 'Say When');
  const S = serif(100, 'Say ');
  const whenX = S.width;
  // A. The wordmark with the line under "When", stopping in the tick.
  write('direction-a-wordmark.svg', svg(560, 200,
    `<rect width="560" height="200" fill="${C.paper}"/>` +
    word(W, 40, 120, C.ink) +
    level(40 + whenX, 40 + W.width, 148, 7, C.red)));
  // B. The cup symbol over small caps.
  const B = sans(22, 'SAY WHEN', 600);
  write('direction-b-symbol.svg', svg(560, 200,
    `<rect width="560" height="200" fill="${C.paper}"/>` +
    `<g transform="translate(230 10) scale(1.1)">${cup(C.ink, 58, 6)}</g>` +
    word(B, 280 - B.width / 2, 170, C.ink)));
  // C. The typographic stack, the line as the rule between the words.
  const C1 = serif(96, 'SAY'), C2 = serif(96, 'WHEN');
  write('direction-c-stack.svg', svg(560, 200,
    `<rect width="560" height="200" fill="${C.paper}"/>` +
    word(C1, 280 - C1.width / 2, 92, C.ink) +
    level(280 - C2.width / 2, 280 + C2.width / 2, 108, 7, C.red, false) +
    word(C2, 280 - C2.width / 2, 186, C.ink)));
  // D. A badge: the cup ringed by the name.
  const D1 = sans(18, 'SAY WHEN · COFFEE · SAY WHEN · COFFEE ·', 600);
  write('direction-d-badge.svg', svg(560, 200,
    `<rect width="560" height="200" fill="${C.paper}"/>` +
    `<circle cx="280" cy="100" r="86" fill="none" stroke="${C.ink}" stroke-width="5"/>` +
    `<circle cx="280" cy="100" r="62" fill="none" stroke="${C.ink}" stroke-width="2"/>` +
    `<g transform="translate(250 72) scale(0.6)">${cup(C.ink, 58, 8)}</g>` +
    `<defs><path id="ring" d="M280 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>` +
    `<text font-family="Instrument Sans, sans-serif" font-size="13" font-weight="600" letter-spacing="2.2" fill="${C.ink}" aria-hidden="true"><textPath href="#ring">SAY WHEN · COFFEE · SAY WHEN · COFFEE · SAY WHEN ·</textPath></text>`));
  void D1;
}

/* ---------- 2. Iterations of A ------------------------------------------- */
console.log('iterations');
{
  const W = serif(100, 'Say When');
  const whenX = serif(100, 'Say ').width;
  const base = (body) => svg(560, 200, `<rect width="560" height="200" fill="${C.paper}"/>` + word(W, 40, 120, C.ink) + body);
  // 1. A plain underline under both words. Reads as a link.
  write('iteration-1.svg', base(level(40, 40 + W.width, 148, 4, C.ink, false)));
  // 2. Under "When" only, still no tick. Reads as an underline, still.
  write('iteration-2.svg', base(level(40 + whenX, 40 + W.width, 148, 4, C.ink, false)));
  // 3. The tick arrives; the line is a level now. Too thin against the stems.
  write('iteration-3.svg', base(level(40 + whenX, 40 + W.width, 148, 4, C.ink)));
  // 4. The weight matches the W's stem, and the line takes the red: the one
  //    coloured thing on the mark is the moment you say it.
  write('iteration-4.svg', base(level(40 + whenX, 40 + W.width, 148, 7, C.red)));
}

/* ---------- 3. The lockups ----------------------------------------------- */
console.log('lockups');
function wordmark(size, ink, line, x = 0, y = 0) {
  const W = serif(size, 'Say When');
  const whenX = serif(size, 'Say ').width;
  const lw = size * 0.07, ly = size * 0.28;
  return { body: word(W, x, y, ink) + level(x + whenX, x + W.width, y + ly, lw, line), width: W.width, height: size * 1.08 };
}
function lockup(ink, line, bg) {
  const wm = wordmark(100, ink, line, 150, 118);
  const w = 150 + wm.width + 40, h = 200;
  return svg(w, h, (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '') +
    `<g transform="translate(34 40) scale(1.1)">${cup(ink, 58, 7)}</g>` + wm.body);
}
write('logo-primary.svg', lockup(C.ink, C.red, null));
write('logo-primary-on-paper.svg', lockup(C.ink, C.red, C.paper));
write('logo-mono.svg', lockup(C.ink, C.ink, null));
write('logo-reverse.svg', lockup(C.paper, C.paper, C.plum));
{
  // The stacked secondary lockup, for a narrow space: Say over When, the
  // level under When as on the wordmark.
  const A = serif(100, 'Say'), B = serif(100, 'When');
  const w = B.width + 80;
  const body = (ink, line, bg) => svg(w, 300, (bg ? `<rect width="${w}" height="300" fill="${bg}"/>` : '') +
    word(A, 40, 110, ink) + word(B, 40, 220, ink) + level(40, 40 + B.width, 248, 7, line));
  write('logo-stacked.svg', body(C.ink, C.red, null));
  write('logo-stacked-reverse.svg', body(C.paper, C.paper, C.plum));
}
write('symbol.svg', svg(100, 100, cup(C.ink, 58, 7)));
write('symbol-reverse.svg', svg(100, 100, cup(C.paper, 58, 7, C.plum)));
write('symbol-app.svg', svg(100, 100, cup(C.ink, 58, 7, C.butter)));
{
  // Clear space and minimum size, drawn: the cap height of the wordmark is
  // the margin on every side; the smallest the lockup is used is 120px wide
  // (the symbol alone to 24px).
  const wm = wordmark(100, C.ink, C.red, 230, 198);
  const w = 230 + wm.width + 120, h = 360;
  const cap = 70;
  write('logo-clearspace.svg', svg(w, h,
    `<rect width="${w}" height="${h}" fill="${C.cream}"/>` +
    `<rect x="${114 - cap}" y="${120 - cap}" width="${wm.width + 116 + cap * 2}" height="${110 + cap * 2}" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="8 8"/>` +
    `<g transform="translate(114 120) scale(1.1)">${cup(C.ink, 58, 7)}</g>` + wm.body +
    `<rect x="${114 - cap}" y="${120 - cap}" width="${cap}" height="${cap}" fill="${C.red}" fill-opacity="0.18"/>` +
    `<rect x="${114 + wm.width + 116}" y="${230}" width="${cap}" height="${cap}" fill="${C.red}" fill-opacity="0.18"/>` +
    word(sans(16, 'Clear space on every side: the wordmark’s cap height.', 500), 114 - cap, h - 36, C.brown)));
}

/* ---------- 4. The pattern ----------------------------------------------- */
console.log('pattern');
{
  // Level lines at three heights, the family's three "whens", as a tile.
  const t = (color, bg) => svg(240, 240,
    `<rect width="240" height="240" fill="${bg}"/>` +
    level(24, 112, 60, 5, color) + level(136, 216, 160, 5, color) + level(24, 112, 200, 5, color) + level(136, 216, 100, 5, color));
  write('pattern-tile.svg', t(C.ink, C.paper));
  write('pattern-tile-reverse.svg', t(C.paper, C.plum));
}

/* ---------- 5. The bags --------------------------------------------------
   One pouch, three products. What differs is written in PRODUCTS and nothing
   else: the ground, the height of the line, the vessel and the words. */
const PRODUCTS = [
  { slug: 'first-pour', name: 'First Pour', when: 'the morning', level: 0.72, ground: C.butter, ink: C.ink, line: C.ink,
    tastes: 'tastes like toast with marmalade', roast: 'light roast · washed · whole bean · 12 oz', vessel: 'mug' },
  { slug: 'second-pour', name: 'Second Pour', when: 'the middle of the day', level: 0.56, ground: C.clay, ink: C.ink, line: C.ink,
    tastes: 'tastes like caramel and a walnut', roast: 'medium roast · natural · whole bean · 12 oz', vessel: 'tumbler' },
  { slug: 'last-pour', name: 'Last Pour', when: 'the evening', level: 0.40, ground: C.plum, ink: C.paper, line: C.paper,
    tastes: 'tastes like dark chocolate and a quiet house', roast: 'decaf · medium-dark · whole bean · 12 oz', vessel: 'cup' },
];
const POUCH = 'M60 72 Q60 28 104 28 H456 Q500 28 500 72 V748 Q500 796 452 796 H108 Q60 796 60 748 Z';
function vessel(kind, color, w) {
  // Line drawings in a 120-unit box, each with the level line passing through
  // at y = 70, so the bag's line reads as the coffee in the cup.
  const s = `fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  if (kind === 'mug') return `<path d="M22 34 H88 V96 Q88 108 76 108 H34 Q22 108 22 96 Z" ${s}/><path d="M88 50 H98 Q112 50 112 66 Q112 82 98 82 H88" ${s}/>`;
  if (kind === 'tumbler') return `<path d="M26 22 H94 L86 110 Q85 116 79 116 H41 Q35 116 34 110 Z" ${s}/><path d="M22 22 H98" ${s}/>`;
  return `<path d="M24 44 H96 L88 92 Q86 102 76 102 H44 Q34 102 32 92 Z" ${s}/><path d="M96 54 H104 Q116 54 116 66 Q116 78 104 78 H92" ${s}/><path d="M14 114 H106" ${s}/>`;
}
function bag(p, presented) {
  const W = 560, H = 820;
  const wm = wordmark(34, p.ink, p.line, 100, 118);
  // One name size for the family: the largest at which the longest name
  // stays inside 300 units, so the three read as one set and none wraps.
  const nameSize = Math.min(84, ...PRODUCTS.map((q) => Math.floor(84 * 300 / serif(84, q.name).width)));
  const name = serif(nameSize, p.name);
  // The tasting line wraps once at the middle word when it would run past
  // the vessel; two short lines read better than one small one.
  const tw = p.tastes.split(' ');
  const tastesLines = sans(20, p.tastes, 500).width > 380
    ? [tw.slice(0, Math.ceil(tw.length / 2)).join(' '), tw.slice(Math.ceil(tw.length / 2)).join(' ')]
    : [p.tastes];
  const roast = sans(15, p.roast, 500);
  const lineY = Math.round(28 + (796 - 28) * (1 - p.level));
  // The vessel straddles the line at its own fill height, to the right of
  // where the line stops; the words sit above and below it.
  const vx = 340, vy = lineY - 70;
  const defs = presented ? `<defs>
  <linearGradient id="form" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.18"/><stop offset="0.12" stop-color="#000" stop-opacity="0.04"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.06"/><stop offset="0.88" stop-color="#000" stop-opacity="0.05"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></linearGradient>
  <linearGradient id="seal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="drop" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#2b2420" flood-opacity="0.22"/></filter>
</defs>` : '';
  const body = defs +
    `<g${presented ? ' filter="url(#drop)"' : ''}>` +
    `<path d="${POUCH}" fill="${p.ground}"/>` +
    (presented ? `<path d="${POUCH}" fill="url(#form)"/><path d="M60 72 Q60 28 104 28 H456 Q500 28 500 72 V96 H60 Z" fill="url(#seal)"/>` : '') +
    `<path d="M60 96 H500" stroke="${p.ink}" stroke-opacity="0.18" stroke-width="2"/>` +
    `<circle cx="452" cy="138" r="9" fill="none" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="2"/><circle cx="452" cy="138" r="3" fill="${p.ink}" fill-opacity="0.35"/>` +
    wm.body +
    // the level line, with the vessel standing on it
    level(100, 320, lineY, 7, p.line) +
    `<g transform="translate(${vx} ${vy})">${vessel(p.vessel, p.ink, 6)}</g>` +
    // Never nearer the wordmark than 200: a high line (First Pour) would
    // otherwise put the name on top of it.
    word(name, 100, Math.max(lineY - 92, 200), p.ink) +
    tastesLines.map((l, i) => word(sans(20, l, 500), 100, lineY + 66 + i * 28, p.ink)).join('') +
    word(sans(15, `roasted for ${p.when}`, 500), 100, lineY + 66 + tastesLines.length * 28 + 6, p.ink) +
    word(roast, 100, 744, p.ink) +
    `</g>`;
  return svg(W, H, body);
}
console.log('bags');
for (const p of PRODUCTS) {
  write(`bag-${p.slug}-flat.svg`, bag(p, false));
  write(`bag-${p.slug}.svg`, bag(p, true));
}
{
  // The family in one frame, presented, on paper: the three whens in a row.
  const bodies = PRODUCTS.map((p, i) => `<g transform="translate(${80 + i * 600} 90) scale(0.96)">${bag(p, true).replace(/^<svg[^>]*>\n|\n<\/svg>\n$/g, '')}</g>`);
  write('family.svg', svg(1960, 980, `<rect width="1960" height="980" fill="${C.paper}"/>` + bodies.join('')));
}

/* ---------- 6. Sampler, gift, shipper ------------------------------------ */
console.log('boxes');
{
  // The Taster: three 4 oz bags in a tray; the lid shows the three levels in
  // the three grounds, each named, so the box says the whole family at once.
  const title = serif(72, 'The Taster');
  const sub = sans(20, 'three whens, four ounces each', 500);
  let rows = '';
  PRODUCTS.forEach((p, i) => {
    const y = 300 + i * 96;
    rows += `<rect x="64" y="${y - 30}" width="632" height="68" rx="14" fill="${p.ground}"/>` +
      level(88, 300 + i * 60, y + 4, 6, p.ink) +
      word(serif(30, p.name), 420, y + 14, p.ink);
  });
  write('sampler-taster.svg', svg(760, 640,
    `<rect width="760" height="640" rx="28" fill="${C.paper}" stroke="${C.ink}" stroke-opacity="0.25" stroke-width="2"/>` +
    wordmark(30, C.ink, C.red, 64, 92).body +
    word(title, 64, 196, C.ink) + word(sub, 64, 232, C.brown) + rows +
    word(sans(15, 'say when · a self-initiated concept, not for sale', 500), 64, 600, C.brown)));
}
{
  // The gift: a plum box with the reverse lockup and one line.
  const line1 = serif(44, 'A bag for their when,'), line2 = serif(44, 'and a cup to say it in.');
  write('gift-box.svg', svg(760, 640,
    `<rect width="760" height="640" rx="28" fill="${C.plum}"/>` +
    `<rect x="24" y="24" width="712" height="592" rx="18" fill="none" stroke="${C.paper}" stroke-opacity="0.35" stroke-width="2"/>` +
    wordmark(40, C.paper, C.paper, 72, 118).body +
    word(line1, 72, 330, C.paper) + word(line2, 72, 392, C.paper) +
    level(72, 420, 452, 7, C.butter) +
    `<g transform="translate(560 420) scale(1.2)">${cup(C.paper, 58, 6)}</g>` +
    word(sans(15, 'one bag · one cup · a card they fill in', 500), 72, 584, C.paper)));
}
{
  // The shipper: kraft, one colour, the symbol big on the side and the
  // phrase along the tape.
  write('shipping-box.svg', svg(760, 640,
    `<rect width="760" height="640" rx="16" fill="${C.kraft}"/>` +
    `<rect x="0" y="300" width="760" height="40" fill="${C.kraftDeep}"/>` +
    `<path d="M0 318 H760" stroke="${C.ink}" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="6 10"/>` +
    `<g transform="translate(64 80) scale(1.6)">${cup(C.ink, 58, 6)}</g>` +
    word(serif(64, 'Say when.'), 300, 190, C.ink) +
    word(sans(18, 'Fresh roast inside. Open it before the kettle boils.', 500), 300, 232, C.ink) +
    word(sans(14, 'kraft shipper · recycled fiber · printed one colour', 500), 64, 600, C.ink)));
}

/* ---------- 7. The campaign ---------------------------------------------- */
console.log('campaign');
const MOMENTS = [
  { line: '6:40, before the house wakes.', ground: C.butter, ink: C.ink, level: 0.72, slug: 'morning' },
  { line: 'The 2 p.m. you will get through.', ground: C.clay, ink: C.ink, level: 0.56, slug: 'afternoon' },
  { line: 'The one you make for someone else.', ground: C.plum, ink: C.paper, level: 0.40, slug: 'evening' },
];
{
  // Outdoor poster, 2:3: one line across a cream field, the moment above it.
  const m = MOMENTS[0];
  const t1 = serif(88, '6:40,'), t2 = serif(88, 'before the'), t3 = serif(88, 'house wakes.');
  const ly = Math.round(1200 * (1 - 0.46));
  write('poster-outdoor.svg', svg(800, 1200,
    `<rect width="800" height="1200" fill="${C.cream}"/>` +
    word(t1, 72, 300, C.ink) + word(t2, 72, 400, C.ink) + word(t3, 72, 500, C.ink) +
    level(72, 728, ly, 10, C.red) +
    word(sans(26, 'Everyone has a when.', 600), 72, 1040, C.ink) +
    wordmark(44, C.ink, C.red, 72, 1120).body));
  void m;
}
MOMENTS.forEach((m) => {
  // Social tiles, square: the product's ground, the moment, the level.
  const words = m.line.split(' ');
  const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 14) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  lines.push(cur.trim());
  let body = `<rect width="540" height="540" fill="${m.ground}"/>`;
  lines.forEach((l, i) => { body += word(serif(56, l), 48, 150 + i * 66, m.ink); });
  // Under the words, and as long as the moment is late: the morning's line
  // is short, the evening's runs the width.
  body += level(48, Math.round(48 + 444 * (1.12 - m.level)), 150 + lines.length * 66 + 30, 8, m.ink);
  body += wordmark(26, m.ink, m.ink, 48, 480).body;
  body += word(sans(14, 'Everyone has a when.', 600), 320, 480, m.ink);
  write(`social-${m.slug}.svg`, svg(540, 540, body));
});

/* ---------- 8. The two raster cards -------------------------------------- */
if (process.argv.includes('--raster')) {
  const { findChrome, loadChromium } = await import('./lib/harness.mjs');
  const chromium = loadChromium('say-when.mjs');
  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage();
  const family = fs.readFileSync(path.join(out, 'family.svg'), 'utf8');
  const html = (w, h, inner) => `<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;background:${C.paper};overflow:hidden;display:grid;place-items:center">${inner}</body></html>`;
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.setContent(html(1672, 941, `<div style="width:1672px;height:941px">${family.replace('width="1960" height="980"', 'width="1672" height="836" style="display:block;margin:52px auto 0"')}</div>`));
  await page.waitForTimeout(200);
  const png1 = await page.screenshot({ type: 'png' });
  const toWebp = async (png, w, h) => page.evaluate(async ([b64, w, h]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.86).split(',')[1];
  }, [png.toString('base64'), w, h]);
  fs.writeFileSync(path.join(out, 'card-home.webp'), Buffer.from(await toWebp(png1, 1672, 941), 'base64'));
  console.log('  card-home.webp');
  const lock = fs.readFileSync(path.join(out, 'logo-primary.svg'), 'utf8');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html(1200, 630, `<div style="position:relative;width:1200px;height:630px">` +
    `<div style="position:absolute;left:72px;top:56px;width:420px">${lock.replace(/width="[\d.]+" height="[\d.]+"/, 'width="420" height="134"')}</div>` +
    `<div style="position:absolute;right:40px;top:196px;width:760px">${family.replace('width="1960" height="980"', 'width="760" height="380"')}</div></div>`));
  await page.waitForTimeout(200);
  const png2 = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(out, 'og-source.webp'), Buffer.from(await toWebp(png2, 1200, 630), 'base64'));
  console.log('  og-source.webp');
  // The homepage tile, 4:5: the three bags staggered down the frame, on the
  // paper, with no caption; the words are the bags' own print.
  const bagSvg = (slug, w) => fs.readFileSync(path.join(out, `bag-${slug}.svg`), 'utf8').replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${Math.round(w * 820 / 560)}"`);
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.setContent(html(800, 1000, `<div style="position:relative;width:800px;height:1000px">` +
    `<div style="position:absolute;left:48px;top:40px">${bagSvg('first-pour', 300)}</div>` +
    `<div style="position:absolute;left:250px;top:280px">${bagSvg('second-pour', 300)}</div>` +
    `<div style="position:absolute;left:452px;top:520px">${bagSvg('last-pour', 300)}</div></div>`));
  await page.waitForTimeout(200);
  const png3 = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(out, 'tile.webp'), Buffer.from(await toWebp(png3, 800, 1000), 'base64'));
  console.log('  tile.webp');
  await browser.close();
}
console.log('done');
