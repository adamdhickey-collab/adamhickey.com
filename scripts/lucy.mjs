/* The Lucy Learns pictures, grabbed from the product itself.
 *
 *   node scripts/lucy.mjs screens                 the phone screens, from a live run of the app
 *   node scripts/lucy.mjs eras                    one scene per art era, from the app's history
 *
 * Both take --app <path> to the lucy-learns checkout; the default is the
 * sibling folder. Every output lands at the path a page already points to,
 * so a re-run after the app changes is the whole swap, and the cache-buster
 * on the tag is the only thing left to bump by hand.
 *
 * Why a script. The screens were captured by hand three times in a fortnight,
 * once per restyle, and each time the set drifted a little: a different
 * activity in the session, a different day in the seeded history, one
 * capture at a different width. The write-up shows the screens as one flow,
 * and a flow captured on three different days does not read as one. The
 * app's own study mode seeds the same twelve days every time, so the only
 * thing that changes between runs is the product.
 *
 * Why 780 wide, saved at 620. The phone frames on the site are drawn for
 * 620x1342, which is 390x844 at 1.59 -- not a real device ratio. Capturing at
 * a real phone (390x844 at 2x) and downscaling once gives the frame the pixels
 * it wants without the app ever laying out at a width no phone has. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const cmd = args.shift();
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const APP = path.resolve(opt('--app', path.join(ROOT, '..', 'lucy-learns')));

const chromium = loadChromium('lucy.mjs');
const chromePath = findChrome();

/* The viewport is a phone; the file is the frame's size. */
const PHONE = { width: 390, height: 844, scale: 2 };
const OUT = { width: 620, height: 1342 };
const QUALITY = 0.82;

/* One entry per screen the site shows. `after` runs inside the page once the
 * route has rendered, for the screens a URL alone cannot reach: the session
 * player is a state machine, and the done screen is the far end of it. Each
 * step clicks a control by the same data-attribute the app's own handlers
 * bind to, so a renamed button fails loudly here rather than capturing the
 * wrong screen. */
const SCREENS = [
  { file: 'img/products/lucy-learns-splash.webp', url: '/index.html?study=demo&splash-hold#/today', hold: 1200 },
  { file: 'img/lucy/welcome.webp', url: '/index.html?study=welcome#/welcome' },
  { file: 'img/products/lucy-learns.webp', url: '/index.html?study=demo#/today' },
  { file: 'img/lucy/tab-activities.webp', url: '/index.html?study=demo#/activities' },
  { file: 'img/lucy/tab-progress.webp', url: '/index.html?study=demo#/progress' },
  { file: 'img/lucy/tab-profile.webp', url: '/index.html?study=demo#/profile' },
  { file: 'img/lucy/avatars-people.webp', url: '/index.html?study=demo#/profile', after: ['[data-person-avatar]'] },
  { file: 'img/lucy/avatars-dogs.webp', url: '/index.html?study=demo#/profile', after: ['[data-avatar]'] },
  { file: 'img/lucy/report.webp', url: '/index.html?study=demo#/report' },
  { file: 'img/lucy/session-ready.webp', url: '/index.html?study=demo#/play/doorbell-means-place' },
  { file: 'img/products/lucy-learns-2.webp', url: '/index.html?study=demo#/play/doorbell-means-place', after: ['[data-start]'] },
  /* A rep is the six steps walked through, then answered on the last one;
     three good reps meet the level, and the finish control stays quiet until
     they do, so a short session cannot reach the done screen by accident.
     The arousal answer is the first target, "calm". */
  { file: 'img/products/lucy-learns-3.webp', url: '/index.html?study=demo#/play/doorbell-means-place',
    after: ['[data-start]', ...Array(3).fill([...Array(5).fill('[data-next]'), '[data-rep="1"]']).flat(),
            '[data-finish-practice]', '[data-arousal-save]'],
    /* The target-met toast outlives the arousal tap; let it go before the shot. */
    settle: 5000 },
];

/* One scene per art era, and the era is the point rather than the scene.
 * The app has been drawn four ways in a month, and the same composition --
 * the handler in a chair, Lucy asleep on her bed beside her -- exists in all
 * four, which makes the styles comparable in a way four different subjects
 * would not. The painted era drew it as `sr-01`; every era since calls it
 * `plan-mat`.
 *
 * Each era is read out of the app's history rather than kept as a copy here,
 * because a copy is a second source of truth and the history already is one.
 * The revision is the last commit that shipped that style: after it, the next
 * restyle had begun. The `lavender` era is the one the write-up had never
 * shown -- the first terminal-drawn set, before the wall changed colour. */
const ERAS = [
  { n: '01', name: 'painted',  rev: '145bd18', file: 'sr-01' },     // 2026-08-08, the eighteen new painted illustrations
  { n: '02', name: 'warm',     rev: '4727a23', file: 'plan-mat' },  // 2026-08-19, the last warm-vector commit
  { n: '03', name: 'lavender', rev: '5476da9', file: 'plan-mat' },  // 2026-08-29, "the restyle is finished"
  { n: '04', name: 'plaster',  rev: null,      file: 'plan-mat' },  // as it ships today
];

/* Large enough to carry a whole illustration at half the 896px case column on
 * a 2x screen, since one picture per era is the whole figure now. */
const ERA_OUT = { width: 1040, height: 780 };

/* Chromium is the only WebP encoder this repository relies on; illustrate.mjs
 * made the same choice, and a second encoder would be a second answer to how
 * a pixel is rounded. */
async function encode(page, bytes, mime, { width, height }, quality = QUALITY) {
  const dataUrl = `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
  const b64 = await page.evaluate(async ({ dataUrl, width, height, quality }) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas'); c.width = width; c.height = height;
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { dataUrl, width, height, quality });
  return Buffer.from(b64, 'base64');
}

function write(rel, buf) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
  console.log(`  ${rel}  ${(buf.length / 1024).toFixed(1)} KB`);
}

async function screens() {
  if (!fs.existsSync(path.join(APP, 'index.html'))) {
    console.error(`  no app at ${APP}; pass --app <path to lucy-learns>`); process.exit(2);
  }
  const { server, origin } = await serve(APP);
  const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
  const ctx = await browser.newContext({
    viewport: { width: PHONE.width, height: PHONE.height },
    deviceScaleFactor: PHONE.scale,
    isMobile: true, hasTouch: true,
    reducedMotion: 'reduce',
  });
  const encoder = await ctx.newPage();
  console.log(`  ${APP}\n`);
  for (const s of SCREENS) {
    /* A fresh page per screen: study mode reseeds on load, and the player
       keeps its session in memory, so the done screen of one capture would
       otherwise be the starting state of the next. */
    const page = await ctx.newPage();
    await page.goto(origin + s.url, { waitUntil: 'load' });
    /* The splash holds for a guaranteed minimum from navigation start; wait
       it out rather than capture the fade. */
    await page.waitForTimeout(s.hold || 2600);
    for (const sel of s.after || []) {
      await page.locator(sel).first().click({ timeout: 5000 });
      await page.waitForTimeout(350);
    }
    await page.waitForTimeout(s.settle || 400);
    const png = await page.screenshot({ type: 'png' });
    write(s.file, await encode(encoder, png, 'image/png', OUT));
    await page.close();
  }
  await browser.close();
  server.close();
}

function sourceBytes({ rev, file }) {
  const rel = `img/${file}.jpg`;
  if (!rev) return fs.readFileSync(path.join(APP, rel));
  return execFileSync('git', ['-C', APP, 'show', `${rev}:${rel}`], { maxBuffer: 1 << 26 });
}

async function eras() {
  const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
  const page = await browser.newPage();
  console.log(`  ${APP}\n`);
  for (const e of ERAS) {
    write(`img/lucy/era-${e.n}-${e.name}.webp`,
          await encode(page, sourceBytes(e), 'image/jpeg', ERA_OUT));
  }
  await browser.close();
}

if (cmd === 'screens') await screens();
else if (cmd === 'eras') await eras();
else { console.error('usage: lucy.mjs screens|eras [--app <path>]'); process.exit(2); }
