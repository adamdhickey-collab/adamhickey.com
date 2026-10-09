#!/usr/bin/env node
/* The lab index's three cards, at 1280x720 (the 640x360 card the writing
   index uses, at 2x), written as WebP through Chrome, which is the only
   WebP encoder this tree uses (README, "Images").

   Two are recomposed from captures that already exist under img/console/
   and img/cockpit/, cropped to 16:9 from the top of the frame, where each
   prototype's card and table sit. The third is a fresh capture of Agent
   Review's front door, the delegated work, at 720px wide, the product's own
   tablet layout: the simulated label, the title, and the account the screen
   opens on ("7 changes made and checked. 2 decisions need you."); since
   2026-10-06 the first decision on that screen instead (see its entry). Since the
   second iteration (2026-10-03) the card shows that screen, because the
   cards' words describe it; it also feeds og.mjs's agent-review and lab
   cards. Until then it was a capture of Agent
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
     node scripts/lab-cards.mjs agent-review-phone   # its phone version
     node scripts/lab-cards.mjs agent-review-share   # the share cards' square
     node scripts/lab-cards.mjs agent-review-hero    # the write-up's hero, the card extended

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
  /* 832 wide, since 2026-10-05 (it was 784, and 720 before that). The app's
     top bar gained a theme switch in the design refresh and its icons grew
     in the icon family, and at 784 the bar no longer fits on one line:
     "Agent Review", "Delegated work" and "Dana Whitfield" each broke in two,
     which read as broken at the size the card prints. The bar holds from 832
     (measured at 784, 800, 832, 848 and up). A multiple of 16, because
     Chrome rounds a clip to whole CSS pixels and only then is 468 x
     1280/832 exactly 720. Still under 64rem, so still the one-column
     layout. */
  /* ON THE FIRST DECISION, since 2026-10-06, not the top of the screen. The
     write-up's walkthrough became a story about one red with two meanings,
     and the top of the screen (the title and the account) said a product
     existed without saying what it is for. So the card is scrolled to the
     first decision's own edge, just above it, which puts the question, the
     two reds side by side, the checks passing either way, why that makes it
     a person's decision, and the two answers' first lines in the frame: the
     case the product exists for, at a size the card can be read at.
     864 x 486 since agent-review#17 (2026-10-06), when each answer came to
     open on the choice it makes ("Separate the meanings") over its outcome
     ("Only the failure gets louder"). At 832 the frame's foot cut the
     outcome through its middle, and moving the frame down instead brought
     the "Needs you" heading in at its top. 864 is still a multiple of 16
     (486 x 1280/864 is exactly 720), still holds the bar on one line and is
     still under 64rem; the card lays out the same.
     6px above the card, not 10, since agent-review#19 (2026-10-07), when the
     card came to ask "These two reds look the same. Should they mean the
     same thing?" and to say "So this isn't a testing problem. It's a
     meaning decision." over its answers. The frame holds the question, the
     two reds, the checks, that line, "Should these meanings stay
     separate?" and each answer's heading and the sentence under it. At 10
     the foot clipped that sentence's line box; at 6 it lands in the 8px
     between the sentence and the specimens under it, and the "Needs you"
     heading, 12px above the card, stays out. */
  'agent-review': { url: `${from}#/`, width: 864, height: 486, viewportHeight: 530, scrollTo: '.ask', offset: 6 },
  /* The same card for a phone, since 2026-10-06 (Adam: "retake the homepage
     card at phone width too"). Under 40rem the homepage prints its picture
     206 to 300px wide, and the 864 layout at that size set the card's text
     about 4px tall. This is the product's own phone layout, 375 wide, from
     the same edge 10px above the first decision, down to the two reds: the
     question, then the replaced value over the failure. The frame's foot
     lands in the 12px between the tiles and the checks under them. 410
     tall since agent-review#19 (2026-10-07), when the tiles came to be
     headed by their meanings and to end at 404; it was 408 from
     agent-review#18, and 390 before. At 3x it is 1125 x 1230, printed 261
     to 315 wide on a phone, which is a 3x screen: at 2x, until 2026-10-07,
     a 430 iPhone stretched it by a quarter. */
  'agent-review-phone': { url: `${from}#/`, width: 375, height: 410, viewportHeight: 812, dpr: 3, scrollTo: '.ask', offset: 10, out: 'agent-review-card-phone.webp' },
  /* The share cards' picture (og.mjs, agent-review and lab). Their frame is a
     420px square and crops a 16:9 picture to its middle, which on this screen
     cut every line at both ends. So it gets its own square, in the product's
     phone layout. It was 520, which ended between the account's rows, and
     as the screen grew it came to end on the first decision's question, cut
     through its middle: until 2026-10-07 the share cards showed the question
     two versions old ("Is the red in a plan change a failure, or a value
     that was replaced?"), because nobody retook the square when the
     question changed. 620 since agent-review#19 (2026-10-07): the simulated
     label fits on one line there, so the square holds the run's title, the
     account, the question whole on one line ("These two reds look the same.
     Should they mean the same thing?"), the two reds side by side, and
     "Both approaches pass the automated checks.", and ends in the 8px
     between that line and the badges under it. At 2x it is 1240 square,
     printed at 420. Since agent-review#20 (2026-10-07) the strip names the
     two runs and wraps to a second row at 620, 64px taller, so the square
     starts 8px above the strip rather than at the product's bar, which the
     share card's own title stands in for, and ends on the first row of
     check badges under "Both approaches pass the automated checks." */
  'agent-review-share': { url: `${from}#/`, width: 620, height: 620, viewportHeight: 700, dpr: 2, scrollTo: '.delegation__sim', offset: 8, out: 'agent-review-share.webp' },
  /* The write-up's hero, since 2026-10-07 (Adam: "an extended view of what
     we're showing on the homepage card"): the homepage card's frame, at its
     864 and from the same edge 6px above the first decision, carried down
     to the card's foot. Below the two answers the card cut off, it holds
     their specimens, what each makes louder and the buttons that choose
     them, the rule line ("Asks for your judgment"), and the closed evidence.
     The card ended at 708 and the next one started at 720, so 714 landed in
     the 12px between them; printed 442 to 568 wide in the hero's right
     half, inside the tablet's bezel. */
  /* 692 since agent-review#22 (2026-10-09): the card folded its three check
     badges to one line and ends at 686 now; the next card starts at 698, so
     692 lands in the 12px between them, where 714 showed the next card's top
     edge. At 2x it is 1728 x 1384. */
  'agent-review-hero': { url: `${from}#/`, width: 864, height: 692, viewportHeight: 900, dpr: 2, scrollTo: '.ask', offset: 6, out: 'agent-review-hero.webp' },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const [slug, card] of Object.entries(CARDS)) {
    if (only.length && !only.includes(slug)) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: card.dpr ?? (card.width ? 1280 / card.width : 1) });
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
      if (card.scrollTo) {
        await page.evaluate(([sel, off]) => {
          const el = document.querySelector(sel);
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
        }, [card.scrollTo, card.offset ?? 0]);
      }
      await page.waitForTimeout(400);
    }
    const file = path.join(OUT, card.out ?? `${slug}-card.webp`);
    const buf = await page.screenshot({ type: 'webp', quality: 86, clip: { x: 0, y: 0, width: card.width ?? 1280, height: card.height ?? 720 } });
    fs.writeFileSync(file, buf);
    console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await page.close();
  }
} finally {
  await browser.close();
}
