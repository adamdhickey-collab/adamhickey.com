#!/usr/bin/env node
/* NARRATIVE INK: the two checks a Shift illustration needs before it lands.
 *
 *   node scripts/narrative-ink.mjs palette <file-or-dir>... --chapter N
 *   node scripts/narrative-ink.mjs shots <page> [--out dir] [--label name]
 *   node scripts/narrative-ink.mjs manifest [--check]
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

if (cmd === 'palette') await palette();
else if (cmd === 'shots') await shots();
else if (cmd === 'manifest') manifest(argv);
else {
  console.error('\n  node scripts/narrative-ink.mjs palette <file-or-dir>... --chapter N');
  console.error('  node scripts/narrative-ink.mjs shots <page.html> [--out dir] [--label name]');
  console.error('  node scripts/narrative-ink.mjs manifest [--check]\n');
  process.exit(2);
}
