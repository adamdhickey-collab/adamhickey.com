#!/usr/bin/env node
/* The lab index's three cards, at 1280x720 (the 640x360 card the writing
   index uses, at 2x), written as WebP through Chrome, which is the only
   WebP encoder this tree uses (README, "Images").

   Two are recomposed from captures that already exist under img/console/
   and img/cockpit/, cropped to 16:9 from the top of the frame, where each
   prototype's card and table sit. The third is a fresh capture of Agent
   Review at a reviewable moment: the change open on the overflow finding,
   with the preview at 768 and the element outlined. It is taken from the
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
  'agent-review': { url: `${from}#/changes/rv-2043/findings/f3-overflow`, width: 1440, height: 810 },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const [slug, card] of Object.entries(CARDS)) {
    if (only.length && !only.includes(slug)) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    if (card.image) {
      /* Crop from the top: a 1360x1020 capture at 1280 wide is 960 tall,
         and the first 720 of it is the part with the card in it. */
      const data = fs.readFileSync(path.join(ROOT, card.image)).toString('base64');
      await page.setContent(`<style>html,body{margin:0;background:#fff}img{display:block;width:1280px;height:auto}</style><img src="data:image/webp;base64,${data}">`);
      await page.waitForLoadState('load');
    } else {
      await page.setViewportSize({ width: card.width, height: card.height });
      await page.goto(card.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
    }
    const file = path.join(OUT, `${slug}-card.webp`);
    const buf = await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: card.width ?? 1280, height: card.height ?? 720 } });
    if (card.width && card.width !== 1280) {
      /* Resample the wider capture to 1280x720 through a canvas, in the
         same browser, so there is one encoder in the chain. */
      const scaled = await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/webp;base64,${b64}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = 1280; c.height = 720;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, 1280, 720);
        return c.toDataURL('image/webp', 0.86).split(',')[1];
      }, buf.toString('base64'));
      fs.writeFileSync(file, Buffer.from(scaled, 'base64'));
    } else {
      fs.writeFileSync(file, buf);
    }
    console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await page.close();
  }
} finally {
  await browser.close();
}
