#!/usr/bin/env node
/* NARRATIVE INK: the two checks a Shift illustration needs before it lands.
 *
 *   node scripts/narrative-ink.mjs palette <file-or-dir>... --chapter N
 *   node scripts/narrative-ink.mjs shots <page> [--out dir] [--label name]
 *   node scripts/narrative-ink.mjs manifest [--check]
 *   node scripts/narrative-ink.mjs tone <source.png>... --chapter N
 *   node scripts/narrative-ink.mjs export <source.png> <out.webp> --size WxH [--quality 0.7]
 *   node scripts/narrative-ink.mjs icons <sheet.png> <outDir> --chapter N --names a,b,c,d,e,f
 *   node scripts/narrative-ink.mjs cutout <src.png> <out.webp> --size WxH
 *
 * EXPORT scales a toned source to its slot's size and encodes it in
 * Chromium, the site's one WebP encoder. ICONS cuts a 3 x 2 sheet into six:
 * the paper is cleared to alpha everywhere, inside the object too, so it
 * sits on any light ground with no tile behind it; the object is trimmed and
 * centered at 80% of the square, and each is written twice, a 512 px PNG
 * master and the 256 px WebP the page loads, as chapterN-icon-<name>.
 *
 * TONE rewrites source PNGs in place, before they are cut and encoded. A
 * generator asked for sage returns a green near it, yellower one day and
 * bluer the next, and paper that leans tan. Every pixel whose hue is within
 * 60 degrees of the chapter's accent is turned to exactly that hue, its
 * saturation capped at the accent's own; every other colored pixel, and
 * every very light one (paper leans tan, which sits beside terracotta on
 * the wheel), is pulled back to a near-neutral. Lightness is never touched, so the drawing
 * is the same drawing. PNG only: toning a WebP would encode it twice.
 *
 * MANIFEST rebuilds img/writing/shift/narrative-ink/manifest.json and
 * writing/NARRATIVE_INK_MANIFEST.md from every picture the series uses; the
 * code is in lib/narrative-ink-manifest.mjs, whose header says what it reads.
 *
 * PALETTE decodes each picture in Chromium and sorts every opaque pixel into
 * three bins: neutral (charcoal, warm paper, the greys between), the
 * chapter's accent (within 30 degrees of its hue), and anything else. The
 * spec in writing/NARRATIVE_INK_PANORAMA.md allows one accent per picture,
 * so "anything else" over 0.5% of the opaque pixels fails. It also reports
 * the accent's share, which the spec wants small, and warns above 25%.
 * Nothing here can judge the drawing; it catches the red, the yellow, and
 * the second hue a generator slips in, which a reader notices before a
 * reviewer does.
 *
 * SHOTS loads a page from this tree at 390, 768 and 1440, scrolls it once so
 * every lazy picture decodes, and writes a full-page PNG per width plus a
 * report.json: each picture's file size against the box it renders in at 2x,
 * whether its file's ratio matches its width/height attributes and the box
 * it is actually drawn in (a slot's aspect-ratio can stretch it), its alt, and
 * whether the page scrolls sideways. Run it before and after a swap, with
 * --label before and --label after, and compare the two folders.
 *
 * Exit 0 clean, 1 a finding, 2 could not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';
import { manifest } from './lib/narrative-ink-manifest.mjs';

const ACCENTS = { 1: '#657d60', 2: '#56718c', 3: '#c0714e', 4: '#7a5a78' };
const NAMES = { 1: 'sage', 2: 'slate', 3: 'terracotta', 4: 'plum' };
const WIDTHS = [390, 768, 1440];

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };
const positional = argv.slice(1).filter((a, i, all) => !a.startsWith('--') && !(all[i - 1] || '').startsWith('--'));

function hue(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

async function browser() {
  const chromium = loadChromium('narrative-ink.mjs');
  const executablePath = findChrome();
  return chromium.launch(executablePath ? { executablePath } : {});
}

async function palette() {
  const ch = Number(opt('--chapter'));
  if (!ACCENTS[ch] || !positional.length) {
    console.error('\n  node scripts/narrative-ink.mjs palette <file-or-dir>... --chapter 1|2|3|4\n');
    process.exit(2);
  }
  const files = positional.flatMap((p) => fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).filter((f) => /\.(webp|png|jpe?g)$/i.test(f)).map((f) => path.join(p, f))
    : [p]);
  const root = process.cwd();
  const rel = (f) => path.relative(root, path.resolve(f)).split(path.sep).map(encodeURIComponent).join('/');
  if (files.some((f) => rel(f).startsWith('..'))) { console.error('\n  Pictures must be inside this tree.\n'); process.exit(2); }
  const { server, origin } = await serve(root);
  const b = await browser();
  const page = await b.newPage();
  await page.goto(`${origin}/${rel(files[0])}`);
  console.log(`\n  palette, chapter ${ch} (${NAMES[ch]} ${ACCENTS[ch]}), ${files.length} picture${files.length === 1 ? '' : 's'}\n`);
  let bad = 0;
  for (const f of files) {
    const r = await page.evaluate(async ({ url, accentHue }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let opaque = 0, neutral = 0, accent = 0, off = 0;
      const offHues = new Array(12).fill(0);
      for (let i = 0; i < d.length; i += 16) {             /* every fourth pixel is plenty */
        if (d[i + 3] < 128) continue;
        opaque++;
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), chroma = max - min;
        if (chroma < 0.12) { neutral++; continue; }
        let h = max === r ? ((g - b) / chroma) % 6 : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4;
        h = (h * 60 + 360) % 360;
        const dist = Math.min(Math.abs(h - accentHue), 360 - Math.abs(h - accentHue));
        if (dist <= 30) accent++; else { off++; offHues[Math.floor(h / 30)]++; }
      }
      return { w: c.width, h: c.height, opaque, neutral, accent, off, offHues };
    }, { url: `${origin}/${rel(f)}`, accentHue: hue(ACCENTS[ch]) });
    const pct = (n) => (r.opaque ? (100 * n / r.opaque) : 0).toFixed(1);
    const offPct = r.opaque ? 100 * r.off / r.opaque : 0;
    const accPct = r.opaque ? 100 * r.accent / r.opaque : 0;
    const fail = offPct > 0.5;
    if (fail) bad++;
    const worst = r.offHues.map((n, i) => [n, i * 30]).sort((a, z) => z[0] - a[0])[0];
    console.log(`  ${fail ? '✗' : '✓'} ${path.basename(f)}  ${r.w}x${r.h}  neutral ${pct(r.neutral)}%  accent ${pct(r.accent)}%  other ${pct(r.off)}%`
      + (fail ? `  (mostly hue ${worst[1]}-${worst[1] + 30})` : '')
      + (accPct > 25 ? '  ! accent over 25%' : ''));
  }
  await b.close(); server.close();
  console.log(bad ? `\n  ${bad} picture${bad === 1 ? '' : 's'} carry a hue outside chapter ${ch}.\n` : '\n  every picture is neutral plus one accent.\n');
  process.exit(bad ? 1 : 0);
}

async function shots() {
  const target = positional[0];
  if (!target || !fs.existsSync(target)) {
    console.error('\n  node scripts/narrative-ink.mjs shots <page.html> [--out dir] [--label name]\n');
    process.exit(2);
  }
  const root = process.cwd();
  const label = opt('--label') || 'shots';
  const out = path.resolve(opt('--out') || path.join('img/inbox/narrative-ink', label));
  fs.mkdirSync(out, { recursive: true });
  const { server, origin } = await serve(root);
  const b = await browser();
  const report = { page: target, label, widths: {} };
  let findings = 0;
  console.log(`\n  ${root}\n  ${target}, ${label}\n`);
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const bytes = new Map();
    page.on('response', async (res) => {
      if (res.request().resourceType() === 'image') {
        const len = Number(res.headers()['content-length'] || 0);
        bytes.set(new URL(res.url()).pathname, len);
      }
    });
    await page.goto(`${origin}/${target}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((i) => i.complete ? null : i.decode().catch(() => null)));
    });
    await page.waitForLoadState('networkidle');
    const data = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      images: [...document.querySelectorAll('main img')].map((i) => {
        const box = i.getBoundingClientRect();
        const aw = Number(i.getAttribute('width')), ah = Number(i.getAttribute('height'));
        return {
          src: new URL(i.currentSrc || i.src).pathname,
          alt: i.getAttribute('alt'),
          loaded: i.complete && i.naturalWidth > 0,
          natural: [i.naturalWidth, i.naturalHeight],
          attrs: [aw, ah],
          rendered: [Math.round(box.width), Math.round(box.height)],
          ratioOk: aw && ah ? Math.abs(aw / ah - i.naturalWidth / i.naturalHeight) < 0.01 : false,
          sharpAt2x: i.naturalWidth >= Math.round(box.width) * 2,
          /* The slot can set its own ratio (aspect-ratio with object-fit:
             fill), and then a file that agrees with its attributes is still
             drawn stretched. Compare the box the reader sees with the file. */
          stretch: box.height && i.naturalHeight
            ? (box.width / box.height) / (i.naturalWidth / i.naturalHeight) - 1 : 0,
          fit: getComputedStyle(i).objectFit,
        };
      }),
    }));
    for (const im of data.images) im.kb = Math.round((bytes.get(im.src) || 0) / 1024);
    await page.screenshot({ path: path.join(out, `${label}-${w}.png`), fullPage: true });
    report.widths[w] = data;
    const flag = [];
    if (data.overflow > 0) flag.push(`scrolls sideways by ${data.overflow}px`);
    for (const im of data.images) {
      const n = path.basename(im.src);
      if (!im.loaded) flag.push(`${n} did not load`);
      if (im.alt === null) flag.push(`${n} has no alt attribute`);
      if (!im.ratioOk) flag.push(`${n} file is ${im.natural.join('x')}, attributes say ${im.attrs.join('x')}`);
      if (im.loaded && im.fit === 'fill' && Math.abs(im.stretch) > 0.01) flag.push(`${n} is drawn ${im.stretch > 0 ? 'wider' : 'taller'} than the file by ${Math.abs(Math.round(im.stretch * 100))}%: the slot's ratio is not the picture's`);
      if (im.loaded && !im.sharpAt2x && im.rendered[0] > 0) flag.push(`${n} renders ${im.rendered[0]}px wide, file ${im.natural[0]}px: soft at 2x`);
    }
    findings += flag.length;
    const kb = data.images.reduce((s, i) => s + i.kb, 0);
    console.log(`  ${flag.length ? '✗' : '✓'} ${w}px  ${data.images.length} pictures, ${kb} KB  -> ${path.relative(root, path.join(out, `${label}-${w}.png`))}`);
    for (const f of flag) console.log(`      ${f}`);
    await ctx.close();
  }
  fs.writeFileSync(path.join(out, `${label}-report.json`), JSON.stringify(report, null, 1));
  await b.close(); server.close();
  console.log(findings ? `\n  ${findings} finding${findings === 1 ? '' : 's'}.\n` : '\n  clean at all three widths.\n');
  process.exit(findings ? 1 : 0);
}

async function tone() {
  const ch = Number(opt('--chapter'));
  if (!ACCENTS[ch] || !positional.length || positional.some((f) => !/\.png$/i.test(f))) {
    console.error('\n  node scripts/narrative-ink.mjs tone <source.png>... --chapter 1|2|3|4\n');
    process.exit(2);
  }
  const b = await browser();
  const page = await b.newPage();
  const hex = ACCENTS[ch];
  const [ar, ag, ab] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const amax = Math.max(ar, ag, ab), amin = Math.min(ar, ag, ab);
  const accent = { h: hue(hex), s: (amax - amin) / (1 - Math.abs(amax + amin - 1)) };
  console.log(`\n  tone, chapter ${ch} (${NAMES[ch]} ${hex})\n`);
  for (const f of positional) {
    const out = await page.evaluate(async ({ data, accent }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const id = g.getImageData(0, 0, c.width, c.height), d = id.data;
      const hsl2rgb = (h, s, l) => { const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0), f(8), f(4)]; };
      let turned = 0, calmed = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
        const max = Math.max(r, gg, b), min = Math.min(r, gg, b), chroma = max - min;
        if (chroma < 0.05) continue;
        const l = (max + min) / 2, s = chroma / (1 - Math.abs(2 * l - 1) || 1);
        let h = max === r ? ((gg - b) / chroma) % 6 : max === gg ? (b - r) / chroma + 2 : (r - gg) / chroma + 4;
        h = (h * 60 + 360) % 360;
        const dist = Math.min(Math.abs(h - accent.h), 360 - Math.abs(h - accent.h));
        let rgb;
        if (dist <= 60 && chroma >= 0.08 && l <= 0.84) { rgb = hsl2rgb(accent.h, Math.min(s, accent.s * 1.1), l); turned++; }
        else if (chroma > 0.06) { rgb = hsl2rgb(h, s * 0.06 / chroma, l); calmed++; }
        else continue;
        d[i] = Math.round(rgb[0] * 255); d[i + 1] = Math.round(rgb[1] * 255); d[i + 2] = Math.round(rgb[2] * 255);
      }
      g.putImageData(id, 0, 0);
      return { url: c.toDataURL('image/png'), turned, calmed, n: d.length / 4 };
    }, { data: fs.readFileSync(f).toString('base64'), accent });
    fs.writeFileSync(f, Buffer.from(out.url.split(',')[1], 'base64'));
    console.log(`  ${path.basename(f)}  ${(100 * out.turned / out.n).toFixed(1)}% turned to the accent, ${(100 * out.calmed / out.n).toFixed(1)}% calmed`);
  }
  await b.close();
  console.log('');
}

async function exportOne() {
  const [src, out] = positional;
  const size = /^(\d+)x(\d+)$/.exec(opt('--size') || '');
  if (!src || !out || !size) {
    console.error('\n  node scripts/narrative-ink.mjs export <source.png> <out.webp> --size WxH [--quality 0.7]\n');
    process.exit(2);
  }
  const b = await browser();
  const page = await b.newPage();
  const r = await page.evaluate(async ({ data, w, h, q }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, w, h);
    return { url: c.toDataURL('image/webp', q), from: [img.naturalWidth, img.naturalHeight] };
  }, { data: fs.readFileSync(src).toString('base64'), w: +size[1], h: +size[2], q: Number(opt('--quality') || 0.7) });
  const drift = Math.abs(r.from[0] / r.from[1] - size[1] / size[2]);
  if (drift > 0.01) { console.error(`\n  ${src} is ${r.from.join('x')}; ${size[0]} is a different shape. Crop the source first.\n`); await b.close(); process.exit(1); }
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(r.url.split(',')[1], 'base64'));
  console.log(`  ${out}  ${size[0]}  ${Math.round(fs.statSync(out).size / 1024)} KB`);
  await b.close();
}

/* Paper to alpha, shared by ICONS and CUTOUT. Runs in the page: takes a
   canvas context and its size, clears the paper, and returns the box the
   ink fills. */
const UNMIX = `(g, cw, ch) => {
      const id = g.getImageData(0, 0, cw, ch), d = id.data;
      /* The paper is the median of the cell's outer ring, not its corner
         pixel: a generated sheet's paper is grainy and a little uneven. */
      const ring = [[], [], []], m = Math.max(4, Math.round(cw * 0.03));
      for (let y = 0; y < ch; y += 2) for (let x = 0; x < cw; x += 2) {
        if (x >= m && x < cw - m && y >= m && y < ch - m) continue;
        for (let k2 = 0; k2 < 3; k2++) ring[k2].push(d[(y * cw + x) * 4 + k2]);
      }
      const bg = ring.map((v) => v.sort((a, b2) => a - b2)[v.length >> 1]);
      /* Paper becomes alpha everywhere, not only where it touches the cell
         edge: the gap inside a handle or a loop is ground too, and a flood
         from the border never reaches it. A neutral pixel is read as
         charcoal ink over paper and un-mixed, so hatching and soft edges
         carry no paper tone onto another ground; a colored pixel is the
         accent and stays solid. */
      const INK = 37, lum = (r, gg, bb) => 0.299 * r + 0.587 * gg + 0.114 * bb, bl = lum(bg[0], bg[1], bg[2]);
      let x0 = cw, y0 = ch, x1 = 0, y1 = 0;
      const cols = new Uint32Array(cw), rows = new Uint32Array(ch);
      for (let q = 0; q < cw * ch; q++) {
        const r = d[q * 4], gg = d[q * 4 + 1], bb = d[q * 4 + 2];
        const dist = Math.abs(r - bg[0]) + Math.abs(gg - bg[1]) + Math.abs(bb - bg[2]);
        const chroma = Math.max(r, gg, bb) - Math.min(r, gg, bb) - (Math.max(...bg) - Math.min(...bg));
        let al;
        if (chroma > 10) al = Math.max(0, Math.min(1, (dist - 30) / 50));
        else {
          al = Math.max(0, Math.min(1, (bl - lum(r, gg, bb)) / (bl - INK)));
          if (al < 0.14) al = 0;
          d[q * 4] = d[q * 4 + 1] = d[q * 4 + 2] = INK;
        }
        d[q * 4 + 3] = Math.round(al * 255);
        if (al > 0.5) { cols[q % cw]++; rows[(q / cw) | 0]++; }
      }
      /* The object's box is where the ink is dense: a stray speck of paper
         grain is a pixel or two in its row and must not stretch the box. */
      for (let x = 0; x < cw; x++) if (cols[x] >= 4) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
      for (let y = 0; y < ch; y++) if (rows[y] >= 4) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
      g.putImageData(id, 0, 0);
      return { x0, y0, x1, y1 };
}`;

async function icons() {
  const [sheet, outDir] = positional;
  const ch = Number(opt('--chapter'));
  const names = (opt('--names') || '').split(',').filter(Boolean);
  if (!sheet || !outDir || !ACCENTS[ch] || names.length !== 6) {
    console.error('\n  node scripts/narrative-ink.mjs icons <sheet.png> <outDir> --chapter N --names a,b,c,d,e,f\n');
    process.exit(2);
  }
  const b = await browser();
  const page = await b.newPage();
  const res = await page.evaluate(async ({ data, UNMIX }) => {
    const unmix = (0, eval)(UNMIX);
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const cw = Math.floor(img.naturalWidth / 3), ch = Math.floor(img.naturalHeight / 2), out = [];
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const g = c.getContext('2d'); g.drawImage(img, -(k % 3) * cw, -Math.floor(k / 3) * ch);
      const { x0, y0, x1, y1 } = unmix(g, cw, ch);
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      const make = (S) => {
        const o = document.createElement('canvas'); o.width = o.height = S;
        const og = o.getContext('2d'); og.imageSmoothingQuality = 'high';
        const s = S * 0.8 / Math.max(w, h);
        og.drawImage(c, x0, y0, w, h, (S - w * s) / 2, (S - h * s) / 2, w * s, h * s);
        return o;
      };
      out.push({ png: make(512).toDataURL('image/png'), webp: make(256).toDataURL('image/webp', 0.9),
                 touches: x0 === 0 || y0 === 0 || x1 === cw - 1 || y1 === ch - 1 });
    }
    return out;
  }, { data: fs.readFileSync(sheet).toString('base64'), UNMIX });
  fs.mkdirSync(outDir, { recursive: true });
  let bad = 0;
  res.forEach((r, i) => {
    const base = path.join(outDir, `chapter${ch}-icon-${names[i]}`);
    fs.writeFileSync(`${base}@512.png`, Buffer.from(r.png.split(',')[1], 'base64'));
    fs.writeFileSync(`${base}.webp`, Buffer.from(r.webp.split(',')[1], 'base64'));
    if (r.touches) bad++;
    console.log(`  ${r.touches ? '✗' : '✓'} ${path.basename(base)}.webp${r.touches ? '  the object reaches its cell edge: it crossed into a neighbor, or the sheet is not an even 3 x 2' : ''}`);
  });
  await b.close();
  process.exit(bad ? 1 : 0);
}

/* CUTOUT is ICONS for one picture: the paper goes to alpha, the object is
   trimmed, and it is set at 94% of a WxH frame. For a single object that
   sits straight on a page's own ground, with no plate behind it. */
async function cutout() {
  const [src, out] = positional;
  const size = (opt('--size') || '').split('x').map(Number);
  if (!src || !out || size.length !== 2 || !size[0] || !size[1]) {
    console.error('\n  node scripts/narrative-ink.mjs cutout <src.png> <out.webp> --size WxH\n');
    process.exit(2);
  }
  const b = await browser();
  const page = await b.newPage();
  const url = await page.evaluate(async ({ data, UNMIX, W, H }) => {
    const unmix = (0, eval)(UNMIX);
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const cw = img.naturalWidth, ch = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const { x0, y0, x1, y1 } = unmix(g, cw, ch);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement('canvas'); o.width = W; o.height = H;
    const og = o.getContext('2d'); og.imageSmoothingQuality = 'high';
    const s = Math.min(W * 0.94 / w, H * 0.94 / h);
    og.drawImage(c, x0, y0, w, h, (W - w * s) / 2, (H - h * s) / 2, w * s, h * s);
    return o.toDataURL('image/webp', 0.85);
  }, { data: fs.readFileSync(src).toString('base64'), UNMIX, W: size[0], H: size[1] });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`  ${out}  ${size.join('x')}  ${Math.round(fs.statSync(out).size / 1024)} KB`);
  await b.close();
}

if (cmd === 'palette') await palette();
else if (cmd === 'shots') await shots();
else if (cmd === 'manifest') manifest(argv);
else if (cmd === 'tone') await tone();
else if (cmd === 'export') await exportOne();
else if (cmd === 'icons') await icons();
else if (cmd === 'cutout') await cutout();
else {
  console.error('\n  node scripts/narrative-ink.mjs palette <file-or-dir>... --chapter N');
  console.error('  node scripts/narrative-ink.mjs shots <page.html> [--out dir] [--label name]');
  console.error('  node scripts/narrative-ink.mjs manifest [--check]');
  console.error('  node scripts/narrative-ink.mjs tone <source.png>... --chapter N');
  console.error('  node scripts/narrative-ink.mjs export <source.png> <out.webp> --size WxH [--quality 0.7]');
  console.error('  node scripts/narrative-ink.mjs icons <sheet.png> <outDir> --chapter N --names a,b,c,d,e,f\n');
  process.exit(2);
}
