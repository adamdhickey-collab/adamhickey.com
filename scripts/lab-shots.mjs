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
     layout and its bottom decision bar are what is shown, printed in a
     343-381px column. That is the type the product has, not a miniature of
     the desktop's. The Storybook has no phone layout worth showing, so its
     phone figure is the story itself, rendered on its own.
     It is captured at 3x, 1125 pixels across. Until 2026-10-07 it was 1x,
     375 pixels for a column a 3x iPhone draws with 1029 to 1143, so every
     phone figure was stretched about three times and its type was soft
     enough for a reader to notice. A phone is the one place these files are
     shown, and the screens they are shown on are 3x.

   EVERY APP CAPTURE IS THE DARK THEME. It has been the product's default
   since agent-review#15 (2026-10-05) and a capture context sets no theme, so
   nothing here chooses one. Relay, the product inside the preview frame, is
   light in it, as it always is. The Storybook figure is the exception that
   looks unchanged: its story is Relay's own, in Storybook's own chrome.
   Take them from a PRODUCTION build (the deployed address, or `npm run build`
   served under /agent-review/), not the dev server: until #15 the built
   stylesheet rewrote every light-dark() token on the root and Relay came out
   dark in a build while it was light in dev, and a capture from dev would
   have shown the wrong thing.

   The product is read from its DEPLOYED address by default, and so is the
   Storybook: the dev server has no onboarding checklist or upgrade toast to
   wait out, but the deployed one is what a reader of this page will open, and
   what the page's links go to. Pass --from <url> for the dev server (the
   Storybook is not served there, so --only skips it).

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/lab-shots.mjs                      # every slug
     node scripts/lab-shots.mjs tour-start tour-rule tour-quiet   # the tour's three scenes
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
   hero's tour moved to the delegated work, change is a figure at 1100 and
   record is a completed change opened. Since 2026-10-06 the tour is three
   scenes of the delegated work at 1440, tour-start, tour-rule and
   tour-quiet (their recipes say what each is), which replaced the one
   picture the slug delegation took. Since 2026-10-07, scope is the
   prototype's second run, the shared table, its decision whole. Quality 0.86, the figure
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
  /* THE TOUR'S THREE SCENES, since 2026-10-06: the same screen in three
     states, which the tour dissolves between where the story moves on (the
     walkthrough's header in walkthrough.js). Each is the page from its top
     at 1440 and TOUR_H tall, so all three share one set of coordinates: a
     region measured on one is the same place on the others, and the camera
     glides across a change of scene as it glides across one picture. The
     tour's regions and pins are in these files' own pixels; re-measure all
     seven if the screen's layout moves.

     start: the run as a person finds it, with Dana's request open, because
     the tour's first part is the request. Its phone version is the first
     decision from its top, the one part of the story a phone shows.
     rule: the first question answered with the diff pair and "use this for
     similar cases" checked, so the card has turned into the rule as it will
     read. quiet: every decision made, nothing left to ask. Neither has a
     phone version: the tour shows them only where it runs, from 64rem. */
  'tour-start': {
    file: 'agent-review-tour-start',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 } },
    open: async (page) => {
      await openRequest(page);
      await tourSize(page);
    },
    /* On a phone, the two directions from their question, since the
       trade-off (2026-10-09): the hero's phone figure is the agent's read,
       just above, and the card's top would show it again. */
    phoneScroll: '.ask__options',
  },
  /* THE TRADE-OFF'S SCENES, since 2026-10-09 (agent-review#28): the first
     question became a choice between two defensible directions, and the
     tour's second and third scenes became the decision and what it left.
     decide: the direction the agent did NOT recommend, keep the red for
     now, chosen, with a reason in the person's own words that the agent
     could not have known, and "use this decision for similar cases"
     checked, so the plan, the reason and the rule show under both cards.
     after: the same decision applied (and the new token allowed once
     before it, so the notice is the decision's), the decision record a few
     lines down. Both are the person overruling a reasonable
     recommendation with context, which is the point of the product, and
     both are as real in the app as the recommended path. */
  'tour-decide': {
    file: 'agent-review-tour-decide',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 } },
    phone: false,
    open: async (page) => {
      await openRequest(page);
      await decideKeep(page);
      await tourSize(page);
    },
  },
  'tour-after': {
    file: 'agent-review-tour-after',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 } },
    phone: false,
    open: async (page) => {
      await openRequest(page);
      await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
      await page.getByRole('button', { name: 'Apply' }).click();
      await decideKeep(page);
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.locator('.decided').first().waitFor();
      await tourSize(page);
    },
  },
  /* THE SIGNATURE IMAGE, since 2026-10-09: the case study's hero is the
     trade-off itself, the agent's read (what it recommends, what it can't
     determine) over the two directions side by side, each with how it
     would look and three benefits and three risks. Desktop at 1100, where
     the type prints largest in the hero's half, cut from the card's own
     edges, 8px of ground each side. On a phone the two cards stack to
     1,300px, so the phone figure is the read alone. */
  tradeoff: {
    file: 'agent-review-tradeoff',
    app: '#/',
    desktop: { size: { width: 1100, height: 1000 }, clip: tradeoffClip },
    phone: { size: { width: 375, height: 720 }, clip: tradeoffClip },
    open: async (page) => {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  /* The decision record the tour ends on, as a figure: the same decision,
     whole, in the main column. On a phone, the record from its top. */
  decision: {
    file: 'agent-review-decision',
    app: '#/',
    desktop: { size: { width: 1100, height: 760 }, clip: recordClip },
    open: async (page) => {
      await decideKeep(page);
      await page.getByRole('button', { name: 'Apply' }).click();
      const record = page.locator('.decided').first();
      await record.waitFor();
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      await record.evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await page.evaluate((by) => window.scrollBy(0, by), phone ? -8 : -12);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  'tour-quiet': {
    file: 'agent-review-tour-quiet',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 } },
    phone: false,
    open: async (page) => {
      await openRequest(page);
      await answerAll(page);
      await tourSize(page);
    },
  },
  /* One completed change, open: the agent's own choice between two tokens
     that share a red, with what each check established, what no check
     could, its history and the revert. */
  record: {
    file: 'agent-review-delegation-record',
    app: '#/',
    desktop: { clip: mainColumn },
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
    desktop: { clip: mainColumn },
    open: async (page) => {
      await page.getByRole('button', { name: /^Choose\s+Separate the meanings$/ }).click();
      await page.getByText('Use this decision for similar cases').click();
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
      await answerAll(page);
      await page.mouse.move(0, 0); /* off the record the last press left it over */
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
  },
  /* The second run's decision (agent-review#20, 2026-10-07): a permission
     boundary, the card whole, from its head to its answers, in the main
     column only. 904 tall rather than the figures' 760, because the case it
     makes runs from what was asked to what each answer does, and the card
     is 878 at 1100. On a phone, the card from its top. */
  scope: {
    file: 'agent-review-scope',
    app: '#/runs/shared-table',
    desktop: { size: { width: 1100, height: 904 }, clip: mainColumn },
    open: async (page) => {
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      await page.locator('.ask').first().evaluate((el) => el.scrollIntoView({ block: 'start' }));
      if (!phone) await page.evaluate(() => window.scrollBy(0, -12));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  storybook: {
    file: 'agent-review-storybook',
    desktop: { url: `${from}storybook/?path=/story/${STORY}&addonPanel=storybook/interactions/panel`, size: { width: 1100, height: 720 }, wait: 'storybook' },
    phone: { url: `${from}storybook/iframe.html?id=${STORY}&viewMode=story`, size: { width: 375, height: 480 }, wait: 'story' },
  },
};

/* The rule and the record are the run's main column alone, since
   2026-10-06: scrolled down to the card, the aside beside it is a sentence
   or nothing, and it took a third of the picture. The clip keeps the left
   gutter the screen gives the column and repeats it on the right, so the
   picture is 756 wide at 1100 and the aside's edge stays out of it. The
   quiet screen keeps its aside, which holds the rule it is showing. */
async function mainColumn(page) {
  const box = await page.locator('.delegation__main').first().boundingBox();
  return { x: 0, y: 0, width: Math.round(box.x * 2 + box.width), height: page.viewportSize().height };
}

/* The tour's scenes are TOUR_H tall: the run as found is 2058 at 1440
   (agent-review#22, 2026-10-09, when the account gained a line counting the
   run by mode and the first card folded its checks to one line; 2018 before,
   (agent-review#19, 2026-10-07, when the first card came to ask whether two
   reds that look the same should mean the same thing, and its answers lost
   the token rows under them; 2030 from agent-review#18, when the first
   card's two tiles each came
   to name their part and lost the line over them; 2034 from #17, when each
   answer gained its choice and what each element takes, and 1903 before
   it), and its last part, the completed work, ends at 2014. The answered screen is taller and
   is cut there, below anything the tour points at; the quiet one is shorter
   and the page's ground runs on under it.
   2133 since agent-review#23 (2026-10-09), when the account's three counts
   became tiles and everything under them sat 74px lower: at 2035 the cut
   fell through the middle of the third completed change, and the run as
   found is 2133 tall, so it is shown whole, down to its last row. The rule
   scene is 2224 and is cut below the confirmation the tour points at; the
   quiet scene is 2035 and the ground runs on under it.
   The run as found is 2127 since agent-review#25 (2026-10-09), when the
   first card's checks line lost the 5px of empty line box under it. TOUR_H
   stays 2133, so the pictures, their width and height and the pins'
   percentages keep one size, and the page's ground runs 6px on under the
   last row.
   2529 since agent-review#28 (2026-10-09, later), when the first question
   became a trade-off: the agent's read and two directions with their
   benefits and risks made the card 1,075 tall, and the run as found is
   2529, shown whole. The decide scene is 3168 and is cut below its plan;
   the after scene is 3304 and is cut below its decision record, which
   ends at 2387. */
const TOUR_H = 2529;
async function tourSize(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  if ((page.viewportSize()?.width ?? 0) >= 1440) await page.setViewportSize({ width: 1440, height: TOUR_H });
  await page.waitForTimeout(300);
}
async function openRequest(page) {
  await page.getByText('Dana’s request').click();
}
/* The reason the person gives for keeping the red, in their own words:
   context about the people who use the screen that no file in the
   repository holds, which is the agent's "What I can't determine". It is
   the simulated person's, written for the scene, and claims no research. */
const REASON = 'Billing support scans this feed for red during renewal week. Keep it until we’ve tested a neutral style with them.';
async function decideKeep(page) {
  await page.getByRole('button', { name: /^Choose\s+Keep the red for now$/ }).click();
  await page.getByRole('textbox', { name: 'Your reason' }).fill(REASON);
  await page.getByText('Use this decision for similar cases').click();
}
/* The decision record's cut: the main column, from 12px above the record
   to 12px under it. */
async function recordClip(page) {
  const col = await mainColumn(page);
  const box = await page.locator('.decided').first().boundingBox();
  return { ...col, height: Math.round(box.y + box.height + 12) };
}
/* The hero's cut: on a desktop, from the agent's read to the foot of the two
   directions, at the card's own edges plus 8px; on a phone, the read alone. */
async function tradeoffClip(page) {
  const phone = (page.viewportSize()?.width ?? 0) < 500;
  const box = await page.evaluate((phone) => {
    const ask = document.querySelector('.ask');
    const top = ask.querySelector('.ask__read').getBoundingClientRect().top + scrollY;
    const end = (phone ? ask.querySelector('.ask__read') : ask.querySelector('.ask__choices')).getBoundingClientRect().bottom + scrollY;
    const card = ask.getBoundingClientRect();
    return { x: Math.max(0, card.left - 8), y: top - 12, width: card.width + 16, height: end - top + 12 + 8 };
  }, phone);
  await page.setViewportSize({ width: page.viewportSize().width, height: Math.ceil(box.y + box.height) + 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
}
/* Every decision made, the first with a rule that the third widens: the
   quiet screen. */
async function answerAll(page) {
  const apply = () => page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('button', { name: /^Choose\s+Separate the meanings$/ }).click();
  await page.getByText('Use this decision for similar cases').click();
  await apply();
  await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
  await apply();
  await page.getByRole('button', { name: /^Choose\s+Separate the meanings$/ }).click();
  await page.getByText('Add this case to your rule').click();
  await apply();
  await page.getByText('Nothing needs your attention.').waitFor();
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const { defaultBrowserType: _ignored, ...phoneDevice } = devices['iPhone 13'];

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const missing = await page.getByText(/couldn.t find story/i).count();
  if (missing) throw new Error(`Storybook says it could not find the story: ${page.url()}`);
}

/* The app draws itself larger in a wide desktop window (agent-review#27,
   app/scale.css: 1.125 from 1296px and 1.25 from 1440, as a page zoom), and
   the tour and the hero are taken at 1440. These are pictures of its layout
   at its own size, and the tour's height and pins are measured on them at
   1, so every context holds the app at 1. The step is held, --zoom, rather
   than the zoom property itself, because the app divides the heights it
   takes from the window by the step. A capture that comes out drawn at
   anything else is refused rather than written, which is also what a
   renamed step would do. */
async function holdAtOne(ctx) {
  await ctx.addInitScript(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(':root { --zoom: 1 !important; }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  });
}

async function write(name, suffix, page, clip) {
  const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
  if (zoom !== '1') throw new Error(`${name}${suffix}: the page is drawn at ${zoom}, not 1 (${page.url()})`);
  const file = path.join(OUT, `${name}${suffix}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86, clip }));
  console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

try {
  for (const [slug, shot] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(slug)) continue;
    for (const kind of ['desktop', 'phone']) {
      if (shot[kind] === false) continue;
      const spec = shot[kind];
      const size = spec?.size ?? (kind === 'desktop' ? DESKTOP : PHONE);
      const ctx = await browser.newContext(
        kind === 'phone' ? { ...phoneDevice, viewport: size, deviceScaleFactor: 3 } : { viewport: size, deviceScaleFactor: 2 },
      );
      await holdAtOne(ctx);
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
      await write(shot.file, kind === 'phone' ? '-phone' : '', page, spec?.clip ? await spec.clip(page) : undefined);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
