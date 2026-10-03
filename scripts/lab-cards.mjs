#!/usr/bin/env node
/* The lab index's three cards, at 1280x720 (the 640x360 card the writing
   index uses, at 2x), written as WebP through Chrome, which is the only
   WebP encoder this tree uses (README, "Images").

   Two are recomposed from captures that already exist under img/console/
   and img/cockpit/, cropped to 16:9 from the top of the frame, where each
   prototype's card and table sit. The third is a fresh capture of Agent
   Review's change screen for run 1, the accepted run, at 720px wide, which
   is the product's own tablet layout: one column, the title, the five checks,
   the components touched and the first finding with its rule. (Since
   2026-10-03 the decision buttons are not in it: below 64rem the product puts
   them in a bar fixed to the bottom of the screen, so the capture's viewport is
   taller than the card, 480 to its 405, and the card is the top 405 of it,
   which keeps the first finding whole and leaves the bar below the frame. Taken
   at the card's own height the bar covers the finding's row. The decision
   buttons are in the write-up's hero.) It was the full desktop review at 1440, the
   overflow finding open with the preview at 768 and the element outlined,
   and at the size this card prints (about 600px on the home page, 456 at
   1024) that was a miniature nobody could read; 720 wide, printed at 1280,
   is type that survives being shrunk to a laptop. It is taken from the
   product's own dev server, so run `npm run dev` in ../agent-review first,
   or pass --from <url> for the deployed address.

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/lab-cards.mjs                 # all three
     node scripts/lab-cards.mjs agent-review    # one

   Quality 0.86, the figure the artwork set uses. Chrome's WebP output is
   not byte-stable between runs, so a re-run that changes nothing visible
   still changes the bytes; scope a re-run to the card that moved. */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'img/lab');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const from = (() => { const i = process.argv.indexOf('--from'); return i > -1 ? process.argv[i + 1] : 'http://localhost:5173/agent-review/'; })();
const only = process.argv.slice(2).filter((a) => !a.startsWith('--') && a !== from);

const CARDS = {
  'deploy-console': { image: 'img/console/slide-failing.webp' },
  'dispatch-cockpit': { image: 'img/cockpit/slide-close-call.webp' },
  /* A url card is captured at its own CSS size and scaled by the device
     pixel ratio to exactly 1280x720, so there is no resample step: 720 x
     405 at 1280 / 720 = 1.778. */
  'agent-review': { url: `${from}#/changes/rv-2041`, width: 720, height: 405, viewportHeight: 480 },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const [slug, card] of Object.entries(CARDS)) {
    if (only.length && !only.includes(slug)) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: card.width ? 1280 / card.width : 1 });
    if (card.image) {
      /* Crop from the top: a 1360x1020 capture at 1280 wide is 960 tall,
         and the first 720 of it is the part with the card in it. */
      const data = fs.readFileSync(path.join(ROOT, card.image)).toString('base64');
      await page.setContent(`<style>html,body{margin:0;background:#fff}img{display:block;width:1280px;height:auto}</style><img src="data:image/webp;base64,${data}">`);
      await page.waitForLoadState('load');
    } else {
      await page.setViewportSize({ width: card.width, height: card.viewportHeight ?? card.height });
      await page.goto(card.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
    }
    const file = path.join(OUT, `${slug}-card.webp`);
    const buf = await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: card.width ?? 1280, height: card.height ?? 720 } });
    fs.writeFileSync(file, buf);
    console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await page.close();
  }
} finally {
  await browser.close();
}
