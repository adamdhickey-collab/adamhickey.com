#!/usr/bin/env node
/* The four product captures on the Agent Review write-up, each in two sizes:
   one for a desktop column and one for a phone. They were hand captures, at
   1440 wide, which is the one way a capture drifts from the product it shows:
   the Linux and macOS edits made by whoever took them last, no record of the
   state each was taken in, and no way to retake one when the product changed.
   They are a script now, and the states are written down.

   Two sizes, because the page is read on both and a capture is only worth
   having if its type can be read where it is printed:

   - Desktop is captured at a 1100px viewport, the narrowest the product's two
     columns hold (it goes to one column at 64rem, 1024px), and printed at
     832px in the essay column, which is 76% of the capture. The 1440px
     captures this replaces were printed at 58%, so the product's 13px type
     was 7px on the page. At 1100 it is 10px, and the screen still shows the
     findings beside the evidence, which is what the figure is for. The hero
     prints at 1200px, so it is the exception and is captured at 1440, where
     the 1280px preview the open finding asks for fits its column whole; at
     1100 that preview is wider than its column and pans, which is right for
     a reader and wrong for a picture of the screen.
   - Phone is captured at 375 on a touch device, so the product's own phone
     layout and its bottom decision bar are what is shown, printed at 1x in a
     343px column. That is the type the product has, not a miniature of the
     desktop's. The Storybook has no phone layout worth showing, so its phone
     figure is the story itself, rendered on its own.

   The product is read from its DEPLOYED address by default, and so is the
   Storybook: the dev server has no onboarding checklist or upgrade toast to
   wait out, but the deployed one is what a reader of this page will open, and
   what the page's links go to. Pass --from <url> for the dev server (the
   Storybook is not served there, so --only skips it).

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/lab-shots.mjs                      # all eight
     node scripts/lab-shots.mjs return               # the return dialog, both sizes
     node scripts/lab-shots.mjs --from http://localhost:5173/agent-review/ change drift return

   Slugs: change (the accepted run, with the new-pattern finding open), drift
   (the seeded branch, the overflow finding, the preview at 768 with the bar
   outlined), return (the dialog over the seeded branch), storybook (the
   ArchiveConfirmation story and its interactions). Since the second
   iteration (2026-10-03), three of the delegated work, the product's front
   door: delegation (the run as a person finds it), rule (the first question
   answered, with "use this for similar cases" checked and the rule shown as
   it will read), and quiet (every decision made, nothing left to ask). The
   delegated run is a simulation played back the same way every time, so
   these three are reproducible to the pixel from the same build. Since the
   hero's tour moved to the delegated work, delegation is the hero at 1440,
   change is a figure at 1100, and record is a completed change opened. Quality 0.86, the figure
   the artwork set uses. Chrome's WebP output is not byte-stable between runs,
   so scope a re-run to the figure that moved. Look at every capture before
   committing it: a wrong story id renders Storybook's "Couldn't find story"
   page, which a capture saves without complaint (#338 shipped exactly that),
   so this script fails when that text is on the page. */

import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright-core';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'img/lab');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const from = arg('--from', 'https://adamdhickey-collab.github.io/agent-review/').replace(/\/?$/, '/');
const only = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--from');
const STORY = 'product-customertable--archive-confirmation';

const DESKTOP = { width: 1100, height: 760 };
const PHONE = { width: 375, height: 720 };

/* Each shot says how to get the product into the state it shows. */
const SHOTS = {
  /* The first iteration's review of run 1, the new-pattern finding open. It
     was the hero at 1440 until the hero's tour moved to the delegated work
     (2026-10-03); it is a figure in "The product" now, at the figures' 1100. */
  change: {
    file: 'agent-review-change-run1',
    app: '#/changes/rv-2041/findings/f1-new-pattern',
  },
  drift: {
    file: 'agent-review-change-drift-768',
    app: '#/changes/rv-2043/findings/f3-overflow',
    /* The phone's first screen is the header; the evidence is the preview, so
       it scrolls the preview's controls to the top. */
    phoneScroll: '.preview__bar',
  },
  return: {
    file: 'agent-review-return',
    app: '#/changes/rv-2043',
    open: async (page) => {
      await page.getByRole('button', { name: 'Return to agent' }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(400);
    },
  },
  /* The hero, and its tour: the delegated work as a person finds it, at 1440
     like the hero before it, because the tour's regions and pins are in this
     file's own pixels. Re-measure all seven if its layout changes. */
  delegation: {
    file: 'agent-review-delegation',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 } },
  },
  /* One completed change, open: the agent's own choice between two tokens
     that share a red, with what each check established, what no check
     could, its history and the revert. */
  record: {
    file: 'agent-review-delegation-record',
    app: '#/',
    open: async (page) => {
      const record = page.locator('.record', { hasText: 'The failed-payment red' });
      await record.locator('summary').click();
      await record.evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await page.evaluate(() => window.scrollBy(0, -12));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  rule: {
    file: 'agent-review-delegation-rule',
    app: '#/',
    open: async (page) => {
      await page.getByRole('button', { name: 'Use the diff pair' }).click();
      await page.getByText('Also use this answer for similar cases').click();
      /* The whole card from its top edge down to Apply: the question, what
         no check can say, the answer chosen, and the rule as it will read.
         Since the glanceable pass (agent-review#7, 2026-10-04) the reason,
         the recommendation and what is waiting are folded under the card,
         so the card fits from its head. On a phone that is taller than the
         screen, so the phone shows the confirmation from its first line. */
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      const from = phone ? page.locator('.ask__confirm').first() : page.locator('.ask').first();
      await from.evaluate((el) => el.scrollIntoView({ block: 'start' }));
      if (!phone) await page.evaluate(() => window.scrollBy(0, -12));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  quiet: {
    file: 'agent-review-delegation-quiet',
    app: '#/',
    open: async (page) => {
      const apply = () => page.getByRole('button', { name: 'Apply' }).click();
      await page.getByRole('button', { name: 'Use the diff pair' }).click();
      await page.getByText('Also use this answer for similar cases').click();
      await apply();
      await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
      await apply();
      await page.getByRole('button', { name: 'Use the diff remove ink' }).click();
      await page.getByText('Add this case to your rule').click();
      await apply();
      await page.getByText('Nothing needs your attention.').waitFor();
      await page.mouse.move(0, 0); /* off the record the last press left it over */
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
  },
  storybook: {
    file: 'agent-review-storybook',
    desktop: { url: `${from}storybook/?path=/story/${STORY}&addonPanel=storybook/interactions/panel`, size: { width: 1100, height: 720 }, wait: 'storybook' },
    phone: { url: `${from}storybook/iframe.html?id=${STORY}&viewMode=story`, size: { width: 375, height: 480 }, wait: 'story' },
  },
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const { defaultBrowserType: _ignored, ...phoneDevice } = devices['iPhone 13'];

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const missing = await page.getByText(/couldn.t find story/i).count();
  if (missing) throw new Error(`Storybook says it could not find the story: ${page.url()}`);
}

async function write(name, suffix, page) {
  const file = path.join(OUT, `${name}${suffix}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86 }));
  console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

try {
  for (const [slug, shot] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(slug)) continue;
    for (const kind of ['desktop', 'phone']) {
      const spec = shot[kind];
      const size = spec?.size ?? (kind === 'desktop' ? DESKTOP : PHONE);
      const ctx = await browser.newContext(
        kind === 'phone' ? { ...phoneDevice, viewport: size, deviceScaleFactor: 1 } : { viewport: size, deviceScaleFactor: 2 },
      );
      const page = await ctx.newPage();
      /* A touch context applies its emulation to the next navigation, so the
         phone starts from a blank page; otherwise it is laid out as a mouse's. */
      if (kind === 'phone') await page.goto('about:blank');
      await page.goto(spec?.url ?? `${from}${shot.app}`, { waitUntil: 'networkidle' });
      if (spec?.wait === 'storybook') {
        /* The interactions panel says PASS when the story's play function has run. */
        await page.getByText(/^pass$/i).first().waitFor({ timeout: 30000 }).catch(() => console.warn(`  ${slug}: the interactions panel never said Pass`));
      }
      await settle(page);
      if (shot.open) await shot.open(page);
      if (kind === 'phone' && shot.phoneScroll) {
        await page.locator(shot.phoneScroll).first().evaluate((el) => el.scrollIntoView({ block: 'start' }));
        await page.waitForTimeout(300);
      }
      await write(shot.file, kind === 'phone' ? '-phone' : '', page);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
