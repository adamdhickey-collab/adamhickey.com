/* PRODUCT SYSTEMS: every picture in The Shift, drawn in code.
 *
 * One grammar for the whole series: a warm canvas, white rounded cards with
 * a hairline and a soft two-step shadow, charcoal titles in the site's sans,
 * gray skeleton lines where words would only be decoration, thin connectors,
 * and the chapter's color kept to the controls, the state marks, and the one
 * element each picture is about. Nothing here picks a color: every value is
 * read from color.css and writing/shift.css at run time, so a token that
 * moves moves the pictures with it on the next export.
 *
 * Exports ART: { id -> { kind, chapter, w, h, svg() } }. The driver,
 * scripts/product-systems.mjs, writes the SVG sources and the WebP exports.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const vars = (css) => Object.fromEntries([...css.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]));
const C = { ...vars(read('color.css')), ...vars(read('writing/shift.css')) };
const need = (k) => { if (!C[k]) throw new Error(`token ${k} not found`); return C[k]; };

/* The neutrals. */
export const N = {
  canvas: need('--color-warm'),       // the picture's ground
  card: need('--color-white'),
  edge: need('--color-tag-border'),   // card hairline, skeleton lines
  rule: need('--color-rule'),         // connectors, empty states
  ink: need('--color-charcoal'),      // titles
  muted: need('--color-muted-gray'),  // secondary labels
};
/* The chapter's four steps, as shift.css names them. */
const HUE = { 1: 'sage', 2: 'slate', 3: 'terracotta', 4: 'plum' };
/* Outside The Shift a picture takes the site's own sage, the --color-*
   family every page already loads, rather than a chapter's: accent-text for
   the connectors, state marks, and key edge, accent-hover (darker) for glyphs
   and solid pills, tea-light for an icon tile, and the visible rule for its
   edge. White on accent-hover clears 4.5:1 with room. */
export const chapterColors = (ch) => ch === 'site' ? ({
  fill: need('--color-accent-text'),
  ground: need('--color-rule'),
  soft: need('--color-tea-light'),
  ink: need('--color-accent-hover'),
}) : ({
  fill: need(`--shift-${HUE[ch]}-fill`),
  ground: need(`--shift-${HUE[ch]}-ground`),
  soft: need(`--shift-${HUE[ch]}-soft`),
  ink: need(`--shift-${HUE[ch]}-ink`),
});

const FONT = 'Montserrat, system-ui, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Montserrat's advance, measured: about 0.60em at 600 and 0.57em at 500
   for mixed-case words. Used to size cards to their words, never to set
   text on a path, so an estimate a few pixels wide only adds air. */
export const tw = (t, size, weight = 600) => String(t).length * size * (weight >= 600 ? 0.62 : 0.58);

/* ---------------------------------------------------------------- glyphs
   A 24-unit grid, 1.6 stroke, round caps and joins: one outlined form per
   glyph. Drawn for this series; none is traced from an icon set. */
const G = {
  plan: '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="M9 10h6M9 14h6M9 18h3.5"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
  searchCheck: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4M8.5 11l1.8 1.8 3.2-3.2"/>',
  upload: '<path d="M12 15V4M8 8l4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
  listChecks: '<path d="M4 6l1.5 1.5 3-3M4 12.5l1.5 1.5 3-3M4 19l1.5 1.5 3-3M11.5 6H20M11.5 12.5H20M11.5 19H20"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
  cursorFrame: '<rect x="3" y="4" width="16" height="12" rx="2"/><path d="M13 12l7.5 3-3.2 1.1-1.1 3.2z"/>',
  braces: '<path d="M8 4c-2 0-2.5 1-2.5 3v2c0 1.5-1 2.5-2 3 1 .5 2 1.5 2 3v2c0 2 .5 3 2.5 3M16 4c2 0 2.5 1 2.5 3v2c0 1.5 1 2.5 2 3-1 .5-2 1.5-2 3v2c0 2-.5 3-2.5 3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  book: '<path d="M3 5.5c3-1 6-.5 9 1.5 3-2 6-2.5 9-1.5v13c-3-1-6-.5-9 1.5-3-2-6-2.5-9-1.5z"/><path d="M12 7v13"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  workflow: '<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="15" y="14" width="6" height="6" rx="1.5"/><path d="M9 7h3.5A2.5 2.5 0 0 1 15 9.5V14"/>',
  loop: '<path d="M20 11a8 8 0 0 0-14.5-4.5M4 13a8 8 0 0 0 14.5 4.5M5.5 3v3.5H9M18.5 21v-3.5H15"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>',
  toggle: '<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="2.6"/>',
  fileSearch: '<path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><circle cx="11" cy="13.5" r="2.5"/><path d="M13 15.5l2 2"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
  power: '<path d="M12 3v8M7 6.3a7.5 7.5 0 1 0 10 0"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  docLayout: '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="5" rx="1"/><path d="M7 14.5h10M7 17.5h6"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12.5 15H17"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M17 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6"/><circle cx="12" cy="16.8" r=".7" fill="currentColor"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9 9.5V20"/>',
  boundary: '<rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke-dasharray="2.6 2.6"/><rect x="8" y="8" width="8" height="8" rx="1.5"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10v1a4 4 0 0 1-4 4H6.5"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  bars: '<path d="M4 20h16M7 16v-4M12 16V7M17 16V9"/>',
  message: '<path d="M5 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z"/><path d="M8 8.5h8M8 12h5"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
  pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
  columns: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="16" rx="1.5"/><rect x="16" y="4" width="5" height="16" rx="1.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="14" y="14" width="3" height="3" rx=".5"/>',
  monitorPlay: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4M10.5 7.5v5l4-2.5z"/>',
  wallet: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 7V5.2a1 1 0 0 0-1.3-1L5 7M17 13.5h1.5"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8.5 12l2.5 2.5 4.5-5"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M10.5 8v4.5M14 8v3M17.5 8v4.5"/>',
  gauge: '<path d="M4 17a8.5 8.5 0 1 1 16 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.2"/>',
  receipt: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M10 3h4M12 3v3"/>',
  utensils: '<path d="M7 3v6a2 2 0 0 0 4 0V3M9 11v10M17 21V3c-2 1.5-3 4-3 7h3"/>',
  calendarCheck: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  listMinus: '<path d="M4 6h11M4 12h11M4 18h7M15 18h6"/>',
  shapes: '<circle cx="7.5" cy="7.5" r="4"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M17 3l4 7h-8z"/><path d="M4 14l6 6M10 14l-6 6"/>',
  pen: '<path d="M15 4l5 5-11 11H4v-5zM13 6l5 5"/>',
  undo: '<path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  dialog: '<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 9h10"/><rect x="12" y="12.5" width="5.5" height="3.5" rx="1"/>',
  reviewList: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><path d="M6.5 7h8M4 14.5h16M4 19.5h11"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  balance: '<path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/><circle cx="12" cy="5" r="1.2" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
};
export const GLYPHS = Object.keys(G);

/* ------------------------------------------------------------ the parts */
export function kit(ch) {
  const c = chapterColors(ch);
  const out = [];
  const add = (s) => { out.push(s); return s; };

  const glyph = (name, x, y, size, color = c.ink, sw = 1.6) =>
    `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" color="${color}">${G[name]}</g>`;

  const text = (x, y, s, { size = 24, weight = 600, fill = N.ink, anchor = 'start', spacing = 0 } = {}) =>
    add(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${esc(s)}</text>`);

  /* A card outlined in the chapter's color is the one the picture points
     at; its outline is drawn at 1.6x what a scene asks for, never under 4
     (2026-11-16: at 2-2.5 the highlight thinned out at the size the
     pictures show). Neutral edges keep their weight. */
  const card = (x, y, w, h, { fill = N.card, stroke = N.edge, sw = 1.5, r = 18, shadow = true, dash = null } = {}) => {
    const hi = stroke === c.fill || stroke === c.ink;
    const width = hi ? Math.max(sw * 1.6, 4) : sw;
    add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${shadow ? ' filter="url(#sh)"' : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
  };

  /* The icon tile: one glyph on the chapter's soft ground. The glyph fills
     68% of the tile at a 2.1 stroke (56% at 1.6 until 2026-11-16, when the
     owner found the icons too small to read at the size the pictures show). */
  const chip = (name, x, y, s = 48) => {
    add(`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.27}" fill="${c.soft}" stroke="${c.ground}" stroke-width="1.5"/>`);
    add(glyph(name, x + s * 0.16, y + s * 0.16, s * 0.68, c.ink, 2.1));
  };

  /* Skeleton lines: words that would only be decoration. */
  const bars = (x, y, widths, { h = 10, gap = 14, fill = N.edge } = {}) =>
    widths.forEach((w, i) => add(`<rect x="${x}" y="${y + i * (h + gap)}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`));

  /* State marks: done is the chapter's fill with a white tick; pending is
     an open dashed ring, so nothing reads as finished that is not. */
  const done = (cx, cy, r = 12) => {
    add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.fill}"/>`);
    add(`<path d="M${cx - r * 0.42} ${cy + r * 0.02}l${r * 0.3} ${r * 0.3} ${r * 0.55}-${r * 0.6}" fill="none" stroke="${N.card}" stroke-width="${Math.max(2, r * 0.2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  };
  const pending = (cx, cy, r = 12) =>
    add(`<circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="${N.card}" stroke="${N.muted}" stroke-width="2" stroke-dasharray="3.2 3.2"/>`);

  /* A pill: accent (soft ground, chapter ink), solid (chapter ink, white),
     or neutral (canvas, muted). Returns its width. */
  const pill = (x, y, label, kind = 'accent', { size = 20, anchor = 'start' } = {}) => {
    const w = tw(label, size, 600) + 32, h = size + 18;
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    const [bg, fg, st] = kind === 'solid' ? [c.ink, N.card, c.ink]
      : kind === 'neutral' ? [N.canvas, N.muted, N.rule] : [c.soft, c.ink, c.ground];
    add(`<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${st}" stroke-width="1.5"${kind === 'neutral' ? ' stroke-dasharray="4 3"' : ''}/>`);
    text(x0 + w / 2, y + h / 2 + size * 0.36, label, { size, weight: 600, fill: fg, anchor: 'middle' });
    return w;
  };

  const button = (x, y, label, primary = true, { size = 20, w = null } = {}) => {
    const bw = w || tw(label, size, 600) + 44, h = size + 26;
    add(`<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="10" fill="${primary ? c.ink : N.card}" stroke="${primary ? c.ink : N.rule}" stroke-width="1.5"/>`);
    text(x + bw / 2, y + h / 2 + size * 0.36, label, { size, weight: 600, fill: primary ? N.card : N.ink, anchor: 'middle' });
    return bw;
  };

  /* A connector, with its head drawn at the end. */
  /* Every connector is drawn at 2x the width a scene asks for, with a
     head to match (2026-11-16: the arrows, and their tips most of all, were
     too thin to read once a picture is shown a third of its size). */
  const LINE_WEIGHT = 2;
  const line = (d, { accent = false, dash = null, head = true, w = 2 } = {}) => {
    const col = accent ? c.fill : N.muted;
    add(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w * LINE_WEIGHT}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${head ? ` marker-end="url(#${accent ? 'ha' : 'hn'})"` : ''}/>`);
  };
  /* A soft S-curve from (x1,y1) to (x2,y2), horizontal at both ends. */
  const curve = (x1, y1, x2, y2, o = {}) => {
    const m = (x1 + x2) / 2;
    line(`M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2 - 2} ${y2}`, o);
  };
  const vcurve = (x1, y1, x2, y2, o = {}) => {
    const m = (y1 + y2) / 2;
    line(`M${x1} ${y1}C${x1} ${m} ${x2} ${m} ${x2} ${y2 - 2}`, o);
  };

  /* A card's header: tile and title. */
  const head = (x, y, icon, title, { size = 26, s = 48 } = {}) => {
    chip(icon, x, y, s);
    text(x + s + 16, y + s / 2 + size * 0.36, title, { size });
  };

  const raw = add;
  /* No ground by default: a picture is its cards on a transparent canvas, so
     it sits straight on whatever ground the page gives it. A share picture
     passes bg, since a card in a feed has no page behind it. */
  const svg = (w, h, { bg = null, zoom = 1 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="${N.ink}" flood-opacity="0.05"/><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="${N.ink}" flood-opacity="0.06"/></filter>
<marker id="hn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto" overflow="visible"><path d="M1 1L8 5 1 9" fill="none" stroke="${N.muted}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" transform="scale(3) translate(-5.333 -3.333)"/></marker>
<marker id="ha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto" overflow="visible"><path d="M1 1L8 5 1 9" fill="none" stroke="${c.fill}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" transform="scale(3) translate(-5.333 -3.333)"/></marker>
</defs>
${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}
${zoom === 1 ? out.join('\n') : `<g transform="translate(${w / 2} ${h / 2}) scale(${zoom}) translate(${-w / 2} ${-h / 2})">\n${out.join('\n')}\n</g>`}
</svg>
`;
  return { c, text, card, chip, glyph, bars, done, pending, pill, button, line, curve, vcurve, head, raw, svg };
}

/* A square icon: one glyph in a pale rounded tile, the chapter's soft
   ground and ink. Served as SVG; it has no words. */
export function iconSvg(ch, name) {
  const c = chapterColors(ch);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<rect x="1" y="1" width="62" height="62" rx="16" fill="${c.soft}" stroke="${c.ground}" stroke-width="2"/>
<g transform="translate(16 16) scale(1.3333)" fill="none" stroke="${c.ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" color="${c.ink}">${G[name]}</g>
</svg>
`;
}
