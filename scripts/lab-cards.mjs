#!/usr/bin/env node
/* The lab index's cards, at 1280x720 (the 640x360 card the writing
   index uses, at 2x), written as WebP through Chrome, which is the only
   WebP encoder this tree uses (README, "Images").

   The cockpit's is recomposed from a capture that already exists under
   img/cockpit/, cropped to 16:9 from the top of the frame, where the
   prototype's card and table sit. The lab's exploration is a held frame of
   its own page. Agent Review's one card left is agent-review-og, the
   picture og.mjs sets on the lab's share card, captured from the app, by
   default its dev server, so run `npm run dev` in ../agent-review first,
   or pass --from <url> for the deployed address.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/lab-cards.mjs                    # every card
     node scripts/lab-cards.mjs dispatch-cockpit   # one
     node scripts/lab-cards.mjs agent-review-og    # the lab's share card picture, the app itself

   Quality 0.86, the figure the artwork set uses. Chrome's WebP output is
   not byte-stable between runs, so a re-run that changes nothing visible
   still changes the bytes; scope a re-run to the card that moved. */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './lib/harness.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'img/lab');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const from = (() => { const i = process.argv.indexOf('--from'); return i > -1 ? process.argv[i + 1] : 'http://localhost:5173/agent-review/'; })();
/* The app's theme: light by default since 2026-10-24, when the app began
   following the system and the site's pictures went light (dark from
   agent-review#32 on 2026-10-11 until then); --theme dark writes the same
   app cards with -dark at the end of the name. Chosen the way the app's control chooses,
   in localStorage before the page loads, so a card never depends on the
   app's default. The page and image cards have one version. */
const theme = (() => { const i = process.argv.indexOf('--theme'); return i > -1 ? process.argv[i + 1] : 'light'; })();
if (theme !== 'light' && theme !== 'dark') throw new Error(`--theme is light or dark, not ${theme}`);
const only = process.argv.slice(2).filter((a) => !a.startsWith('--') && a !== from && a !== theme);

const CARDS = {
  /* The lab's exploration, since 2026-10-21: the scroll story the homepage
     carried until #539, on its last step, the pruned tree in fruit beside
     "The judgment didn't go away." Reduced motion, as every page card here,
     which the story answers by holding each step's finished state, so the
     card is a held frame rather than a moment in a scrub. 1280x800 and
     clipped under the 80px header to 720. */
  'designing-motion': {
    page: 'lab/designing-motion.html', width: 1280, viewportHeight: 800,
    before: (page) => page.evaluate(() => {
      const s = document.getElementById('how-i-think');
      const runway = s.querySelector('.story-steps');
      window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY + runway.offsetHeight * 0.6);
    }),
    region: () => ({ x: 0, y: 80, width: 1280, height: 720 }),
  },
  'dispatch-cockpit': { image: 'img/cockpit/slide-close-call.webp' },
  /* Agent Review's cards, its phone card, the homepage's ask card, the
     share square, the write-up's hero, and the light/dark themes figure
     were recipes here until 2026-11-16, when their pictures had long left
     every page and the slugs went with the files. The share card's picture
     below is the one Agent Review card anything still reads. */
  /* The case study's share card picture since later on 2026-10-09 (Adam:
     "update the og card to the app capture too", after the LinkedIn
     Featured thumbnail became the app): the product itself, desktop
     layout, light (dark until 2026-10-11), so a post unfurls with the
     screen the case study is about. The share card's frame is a 420 square, so it is a square of
     the run's main column (its box plus 10px each side, the tour's own
     rule) from 16px above the account's lead: the lead, the three counts
     as tiles, the bar, and the first decision with its two reds. Measured
     from the page, not fixed, so it follows the layout. At 2x it is about
     1592 square. It replaced agent-review-feature (the homepage's
     composition) for og.mjs agent-review, and the phone-layout square,
     agent-review-share, for og.mjs lab, later the same day.
     Since Preview Studio (agent-review#30, 2026-10-11) the square is the
     case study's hero, in a square: the workspace's left column at 1200,
     from 8px over the preview, the two reds in place over the agent's read,
     at the column's edges plus 8px. */
  'agent-review-og': {
    url: `${from}#/runs/billing`, width: 1200, viewportHeight: 1300, dpr: 2, out: 'agent-review-og.webp',
    region: async (page) => {
      const col = await page.locator('.studio__stage').first().boundingBox();
      const preview = await page.locator('.studio-preview').first().boundingBox();
      const side = Math.round(col.width + 16);
      return { x: Math.round(col.x - 8), y: Math.round(preview.y - 8), width: side, height: side };
    },
  },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
/* A page card is served from this tree, like og.mjs's cards, only when one
   is asked for. */
let site;
try {
  for (const [slug, card] of Object.entries(CARDS)) {
    if (only.length && !only.includes(slug)) continue;
    if (theme === 'dark' && !card.url) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: card.dpr ?? (card.width ? 1280 / card.width : 1) });
    /* The app draws itself larger from a 1296px window (agent-review#27,
       app/scale.css). A picture of the app holds it at 1 so its
       layout is the one the capture asked for: the step, --zoom, is held,
       and a card drawn at anything else is refused. */
    await page.addInitScript((theme) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(':root { --zoom: 1 !important; }');
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      try {
        localStorage.setItem('agent-review:theme', theme);
      } catch {}
    }, theme);
    let buf;
    if (card.page) {
      site ??= await serve(ROOT);
      await page.setViewportSize({ width: card.width, height: card.viewportHeight ?? 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${site.origin}/${card.page}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      /* A card can scroll somewhere first and clip a region of the window,
         rather than shoot one element (designing-motion, above). */
      if (card.before) {
        await card.before(page);
        await page.waitForTimeout(1200);
        buf = await page.screenshot({ type: 'webp', quality: 86, clip: card.region() });
      } else {
        const el = page.locator(card.element);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        buf = await el.screenshot({ type: 'webp', quality: 86 });
      }
    } else if (card.image) {
      /* Crop from the top: a 1360x1020 capture at 1280 wide is 960 tall,
         and the first 720 of it is the part with the card in it. */
      const data = fs.readFileSync(path.join(ROOT, card.image)).toString('base64');
      await page.setContent(`<style>html,body{margin:0;background:#fff}img{display:block;width:1280px;height:auto}</style><img src="data:image/webp;base64,${data}">`);
      await page.waitForLoadState('load');
    } else {
      await page.setViewportSize({ width: card.width, height: card.viewportHeight ?? card.height });
      await page.goto(card.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      /* A strip of the preview's canvas above its panels, for the picture
         only (agent-review-ask, above): the app itself has none. */
      if (card.strip) await page.addStyleTag({ content: `.studio-preview__canvas { padding-top: ${card.strip}px !important; }` });
      if (card.scrollTo) {
        await page.evaluate(([sel, off]) => {
          const el = document.querySelector(sel);
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
        }, [card.scrollTo, card.offset ?? 0]);
      }
      await page.waitForTimeout(400);
      if (card.region) buf = await page.screenshot({ type: 'webp', quality: 86, clip: await card.region(page) });
    }
    const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
    if (zoom !== '1') throw new Error(`${slug}: the page is drawn at ${zoom}, not 1 (${page.url()})`);
    if (card.url) {
      const drawn = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
      if (drawn !== theme) throw new Error(`${slug}: the app is drawn ${drawn}, not ${theme} (${page.url()})`);
    }
    const name = card.out ?? `${slug}-card.webp`;
    const file = path.join(OUT, theme === 'dark' ? name.replace(/\.webp$/, '-dark.webp') : name);
    buf ??= await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: card.width ?? 1280, height: card.height ?? 720 } });
    fs.writeFileSync(file, buf);
    console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await page.close();
  }
} finally {
  await browser.close();
  site?.server.close();
}
