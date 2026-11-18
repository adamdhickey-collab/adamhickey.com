#!/usr/bin/env node
/* PRODUCT SYSTEMS: The Shift's pictures, drawn in code and kept in step.
 *
 *   node scripts/product-systems.mjs build [filter]     write every SVG, export every WebP
 *   node scripts/product-systems.mjs sheet <out.png>    one contact sheet of everything, for review
 *   node scripts/product-systems.mjs manifest [--check] rebuild the manifest from the pages
 *
 * The registry also lists the site's pictures outside The Shift (SITE),
 * under img/product-systems/; build and sheet draw them, manifest does not.
 *
 * BUILD draws each picture from scripts/lib/product-systems-scenes.mjs and
 * writes its editable SVG next to the export. Icons have no words and are
 * served as SVG. Everything with words is rasterized in Chromium, with the
 * site's own Montserrat loaded. Heroes, chapter pictures, and pairs are
 * kept as PNG with a transparent ground, so the page's own ground shows
 * through; share pictures are encoded to WebP there, the site's one WebP
 * encoder: an SVG used as an <img> cannot load a web font, and a
 * fallback face would set every label at a different width.
 *
 * MANIFEST reads every <img> in writing/index.html and the twelve lessons,
 * plus the pictures scripts/og.mjs names, checks each against the registry
 * (scripts/lib/product-systems-registry.mjs), and writes
 * img/writing/shift/product-systems/manifest.json and
 * writing/PRODUCT_SYSTEMS_MANIFEST.md. With --check it writes nothing and
 * exits 1 when either file is stale, when a page still names a Narrative
 * Ink picture, when a registered file is missing or never placed, or when a
 * placement's width and height do not match its file.
 *
 * Exit 0 clean, 1 a finding, 2 could not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadChromium, findChrome } from './lib/harness.mjs';
import { iconSvg } from './lib/product-systems-art.mjs';
import * as S from './lib/product-systems-scenes.mjs';
import { ALL, BASE, SITE } from './lib/product-systems-registry.mjs';
import { manifest } from './lib/product-systems-manifest.mjs';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const cmd = argv[0];

const draw = (a) => a.kind === 'icon' ? iconSvg(a.chapter, a.glyph)
  : a.kind === 'hero' ? S.HEROES[a.id]()
  : a.kind === 'chapter' ? S.CHAPTERS[a.id]()
  : a.kind === 'pair' ? S.PAIRS[a.id]()
  : a.kind === 'site' ? S.SITE[a.id]()
  : S.SOCIAL[a.id]();

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=block';

async function rasterize(page, svg, [w, h], q = 0.88, format = 'webp', crop = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT_LINK}">
<style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style></head>
<body>${svg.replace(/<svg ([^>]*?)width="\d+" height="\d+"/, '<svg $1')}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.load('600 20px Montserrat'); await document.fonts.load('500 20px Montserrat'); await document.fonts.ready; });
  const ok = await page.evaluate(() => document.fonts.check('600 20px Montserrat'));
  if (!ok) throw new Error('Montserrat did not load; the export would set every label in a fallback face');
  /* A transparent picture is kept as PNG, alpha and all: it is the cards
     and their shadow on nothing, and the page's ground shows through. */
  const png = await page.screenshot({ type: 'png', omitBackground: true });
  if (format === 'png' && !crop) return png;
  if (format === 'png') {
    /* A hero is cut to the rows its cards and their shadow fill, plus a
       24px margin, at the full width: the cards keep one scale across the
       twelve, and the caption can sit just under the drawing rather than
       under an empty band of transparent frame (owner, 2026-11-16). */
    const url = await page.evaluate(async (data) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const a = g.getImageData(0, 0, c.width, c.height).data;
      let y0 = c.height, y1 = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (a[(y * c.width + x) * 4 + 3] > 8) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
      y0 = Math.max(0, y0 - 24); y1 = Math.min(c.height - 1, y1 + 24);
      const o = document.createElement('canvas'); o.width = c.width; o.height = y1 - y0 + 1;
      o.getContext('2d').drawImage(c, 0, y0, c.width, o.height, 0, 0, c.width, o.height);
      return o.toDataURL('image/png');
    }, png.toString('base64'));
    return Buffer.from(url.split(',')[1], 'base64');
  }
  const url = await page.evaluate(async ({ data, q }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q);
  }, { data: png.toString('base64'), q });
  return Buffer.from(url.split(',')[1], 'base64');
}

async function build() {
  const only = argv[1];
  const list = [...ALL, ...SITE].filter((a) => !only || a.id.toString().includes(only) || a.kind === only);
  const chromium = await loadChromium();
  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const a of list) {
    const svg = draw(a);
    fs.mkdirSync(path.dirname(path.join(ROOT, a.svg)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, a.svg), svg);
    if (/\.(webp|png)$/.test(a.file)) {
      fs.writeFileSync(path.join(ROOT, a.file), await rasterize(page, svg, a.size, 0.88, a.file.endsWith('.png') ? 'png' : 'webp', a.kind === 'hero' || a.crop === true));
    }
    console.log(`  ${a.file}  ${Math.round(fs.statSync(path.join(ROOT, a.file)).size / 1024)} KB`);
  }
  await browser.close();
  console.log(`\n  ${list.length} pictures under ${BASE}/ and img/product-systems/\n`);
}

async function sheet() {
  const out = argv[1];
  if (!out) { console.error('\n  node scripts/product-systems.mjs sheet <out.png>\n'); process.exit(2); }
  const cells = [...ALL, ...SITE].map((a) => {
    const src = 'data:image/' + (a.file.endsWith('.svg') ? 'svg+xml;base64,' : a.file.endsWith('.png') ? 'png;base64,' : 'webp;base64,') + fs.readFileSync(path.join(ROOT, a.file)).toString('base64');
    const w = a.kind === 'icon' ? 96 : a.kind === 'social' ? 300 : a.file.endsWith('.svg') ? 270 : 560;
    return `<figure style="margin:0;display:inline-block;vertical-align:top;width:${w}px"><img src="${src}" style="width:100%;display:block;border:1px solid #ddd"><figcaption style="font:12px system-ui">${a.id}</figcaption></figure>`;
  }).join('');
  const chromium = await loadChromium();
  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1760, height: 900 } });
  await page.setContent(`<body style="margin:16px;display:flex;flex-wrap:wrap;gap:16px;background:#fff">${cells}</body>`);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(`  ${out}`);
}

try {
  if (cmd === 'build') await build();
  else if (cmd === 'sheet') await sheet();
  else if (cmd === 'manifest') manifest(argv);
  else { console.error('\n  node scripts/product-systems.mjs build|sheet|manifest\n'); process.exit(2); }
} catch (e) { console.error(`  ✗ ${e.message}`); process.exit(2); }
