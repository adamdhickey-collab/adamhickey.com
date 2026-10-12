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

   PREVIEW STUDIO, since agent-review#30 (2026-10-11, later): the delegated
   work is a workspace, the screen a decision changes rendered large on the
   left with the element marked and what the agent read under it, and the
   decision in an inspector on the right, one at a time. A direction is
   chosen with "Select and preview", which previews it as proposed and not
   applied. Every recipe below that pressed "Choose" presses that, a
   recipe that reached the second decision steps to it with "Next decision",
   and the cuts that were the decision card's are the workspace's own parts.

   EVERY APP CAPTURE CAN BE TAKEN IN EITHER THEME, since agent-review#29
   (2026-10-11). --theme dark (the default, since agent-review#32 made dark
   the review's default later that day) writes the files the page shows;
   --theme light writes the same shots with -light at the end of the name,
   which nothing on the page uses.

   DRAWN LARGER, since the same day (Adam: the screenshots are hard to read;
   bump the text up without changing the layout). A shot can hold the app at
   a zoom step of its own (`zoom` on its desktop spec), the way the app draws
   itself larger in a wide window (app/scale.css): the window is sized so
   the layout holds, and the picture's text is that much larger. The tour is
   taken at 1.25 in a 1600px window, 1280 CSS px of layout, the narrowest
   that keeps the two screens side by side and the workspace two columns;
   and because the tablet fits each step's part to its own width, and the
   inspector keeps its 340px while the stage gives, a step's words come out
   about a fifth larger in the tablet. The tour also holds a 48px margin on
   the root (`pad`), the page's own ground, so a pin has room beside the
   workspace's edge. The hero is 1.25 in a 1440 window, the scope and
   decision figures 1.125. A phone is the product's own layout at 1. The theme is chosen the way the app's toggle chooses it, by the
   remembered choice in localStorage, set before the page loads, light as
   well as dark, so a capture never depends on the app's default. Relay,
   the product inside the preview frame, is light in both, as it always is.
   The Storybook figure has no dark version: its story is Relay's own, in
   Storybook's own chrome. From 2026-10-05 to 2026-10-11 every capture was
   the dark theme, the app's default then.
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
     node scripts/lab-shots.mjs --theme light tradeoff  # the same, in the light theme, as *-light.webp

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
const theme = arg('--theme', 'dark');
if (theme !== 'light' && theme !== 'dark') throw new Error(`--theme is light or dark, not ${theme}`);
/* The desktop captures are 2x. --scale 3 writes the tour's scenes once more
   at 3x, as `-3x` files, for the srcset that serves them to a large monitor
   (lab/agent-review.html, since 2026-10-12); the same page at the same
   size, so every region and pin holds. Only the tour's scenes take it: the
   figures print well under half their file at 2x already. */
const scale = +arg('--scale', '2');
if (scale !== 2 && scale !== 3) throw new Error(`--scale is 2 or 3, not ${scale}`);
const only = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--from' && all[i - 1] !== '--theme' && all[i - 1] !== '--scale');
const STORY = 'product-customertable--archive-confirmation';
/* The tour's width (Preview Studio, 2026-10-11): 1600 of the app at zoom
   1.25 and a 48px margin each side at that zoom; TOUR_H, its height, is
   with its scenes below. */
const TOUR_W = 1720;
const TOUR = { size: { width: TOUR_W, height: 1000 }, zoom: 1.25, pad: 48 };

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
     at TOUR_W and TOUR_H, so all three share one set of coordinates: a
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
    desktop: TOUR,
    open: async (page) => {
      await openRequest(page);
      await tourSize(page);
    },
    /* On a phone, the two directions from their question, since the
       trade-off (2026-10-09): the hero's phone figure is the agent's read,
       just above, and the card's top would show it again. */
    phoneScroll: '.ask__options',
  },
  /* THE TWO DIRECTIONS, weighed, since Preview Studio (agent-review#30):
     the run as found, with the preview where it follows the page to once
     the two directions are at the top of the window (followTo, below), so
     the tour's fourth step shows the interface beside the cards. */
  'tour-weigh': {
    file: 'agent-review-tour-weigh',
    app: '#/',
    desktop: TOUR,
    phone: false,
    open: async (page) => {
      await openRequest(page);
      await tourSize(page);
      await followTo(page, '.studio__inspector .ask__choices');
    },
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
    desktop: TOUR,
    phone: false,
    open: async (page) => {
      await openRequest(page);
      await decideKeep(page);
      await tourSize(page);
      await followTo(page, '.studio__inspector .ask__choice[data-chosen]');
    },
  },
  'tour-after': {
    file: 'agent-review-tour-after',
    app: '#/',
    desktop: TOUR,
    phone: false,
    open: async (page) => {
      await openRequest(page);
      /* The new token is the second decision; the workspace shows one at a
         time, so it steps to it, and after it is allowed the first is back. */
      await page.getByRole('button', { name: 'Next decision' }).click();
      await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
      await page.getByRole('button', { name: 'Apply' }).click();
      await decideKeep(page);
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.locator('.decided').first().waitFor();
      await tourSize(page);
    },
  },
  /* THE SIGNATURE IMAGE, since 2026-10-09: the case study's hero is the
     trade-off itself. Until Preview Studio it was the decision card, the
     agent's read over the two directions; since agent-review#30 it is the
     workspace's left half, the problem in place: the billing activity
     beside the payment history, the replaced plan and "Payment failed" in
     the same red, the first marked as the decision and the second as its
     twin, the key saying what each red means, and under them the agent's
     read, what it recommends and what it can't determine. Desktop at 1200,
     the narrowest window where the two screens sit side by side, cut at the
     column's own edges, 8px of ground round it. On a phone the read alone,
     as before: the two screens stack there, to a picture too tall for the
     hero. */
  tradeoff: {
    file: 'agent-review-tradeoff',
    app: '#/',
    desktop: { size: { width: 1440, height: 1000 }, zoom: 1.25, clip: tradeoffClip },
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
    desktop: { size: { width: 1440, height: 760 }, zoom: 1.125, clip: recordClip },
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
    desktop: TOUR,
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
      await page.getByRole('button', { name: /^Select and preview\s+Separate the meanings$/ }).click();
      await page.getByText('Use this decision for similar cases').click();
      /* The whole card from its top edge down to Apply: the question, what
         no check can say, the answer chosen, and the rule as it will read.
         Since the glanceable pass (agent-review#7, 2026-10-04) the reason,
         the recommendation and what is waiting are folded under the card,
         so the card fits from its head. On a phone that is taller than the
         screen, so the phone shows the confirmation from its first line. */
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      const from = phone ? page.locator('.ask__confirm').first() : page.locator('.studio__inspector').first();
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
     boundary. Since Preview Studio (agent-review#30) the whole workspace at
     1200: the customer list in the preview with the table marked, under it
     every one of the forty screens the shared Table reaches, filled where it
     has a visual baseline, and beside it the inspector, the question, that it
     is a permission decision and whose component it is, and the three
     answers, cut 12px under the inspector. On a phone, the inspector from
     its top. */
  scope: {
    file: 'agent-review-scope',
    app: '#/runs/shared-table',
    desktop: { size: { width: 1300, height: 1000 }, zoom: 1.125, clip: studioClip },
    open: async (page) => {
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      if (phone) await page.locator('.studio__inspector').first().evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  storybook: {
    file: 'agent-review-storybook',
    light: true, /* Relay's own story in Storybook's chrome: one theme */
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
   ends at 2387.
   2671 since agent-review#29 (2026-10-11), Stripe's palette: the bar is
   48px where it was 44, the page has 24px over and under where it had 16,
   the title is 24px bold, the account's counts are tiles with their marks
   on tinted squares, and the decision card is 20px inside its edge where it
   was 16. The run as found is 2671, shown whole; the decide scene is 3310
   and the after scene 3404, each cut there, below anything the tour points
   at (the after scene's record ends at 2470).
   2660, and 1600 wide (TOUR_W, above), since agent-review#30 (2026-10-11,
   later): Preview Studio. The screen is a workspace, the preview and the
   read on the left and the inspector on the right, so the tour's parts are
   no longer one column and the camera moves across as well as down. It is
   taken at 1600, not 1440, because the workspace is 1440 at most and at
   1440 its parts' left edges were 24px from the picture's; the tablet draws
   the picture at about half size, so a pin, a fixed size on the screen,
   needs about 60 of the picture's pixels beside a part, and was cut in two
   at 1520. At 1600 the parts are 104px in. The run as found is 2354 tall and the
   ground runs on under it; the decide scene is 3417 and is cut inside its
   rule's preview, below the reason the tour points at; the after scene is
   3504 and is cut 37px under its decision record, which ends at 2623.
   3350, and 1720 wide, since the same day's end (agent-review#32, dark by
   default; and the shots drawn larger, TOUR above): the app at zoom 1.25
   in 1600px with a 60px margin each side. The run as found is 2940 tall
   and the ground runs on under it; the decide scene is 4267 and is cut
   inside its rule's preview; the after scene is 4427 and is cut 36px under
   its decision record, which ends at 3314. */
const TOUR_H = 3350;
async function tourSize(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  if ((page.viewportSize()?.width ?? 0) >= TOUR_W) await page.setViewportSize({ width: TOUR_W, height: TOUR_H });
  await page.waitForTimeout(300);
}
/* The preview where it is once a person has scrolled down to the plan.
   In the app the workspace's shorter column follows the page while the
   longer one is read (DelegationScreen's useFollow), so the interface stays
   beside the decision about it; a picture of the whole page at its top
   shows it where it started instead, a screen above the plan. The decide
   scene is the page as it looks with the chosen card at the top of the
   window: the left column drawn there, beside the card, where following
   puts it. Only that one column moves, by the distance the window would
   have scrolled; nothing else on the page is touched. */
async function followTo(page, selector) {
  await page.evaluate((selector) => {
    const stage = document.querySelector('.studio__stage');
    const to = document.querySelector(selector);
    const by = to.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    stage.style.transform = `translateY(${Math.round(by)}px)`;
  }, selector);
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
  await page.getByRole('button', { name: /^Select and preview\s+Keep the red for now$/ }).click();
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
/* The hero's cut, since Preview Studio: on a desktop, the workspace's left
   column from the preview's top to the foot of the agent's read, at the
   column's own edges plus 8px; on a phone, the read alone. */
async function tradeoffClip(page) {
  const phone = (page.viewportSize()?.width ?? 0) < 500;
  const box = await page.evaluate((phone) => {
    const read = document.querySelector('.ask--read .ask__read').getBoundingClientRect();
    const from = phone ? read : document.querySelector('.studio-preview').getBoundingClientRect();
    const col = phone ? read : document.querySelector('.studio__stage').getBoundingClientRect();
    const top = from.top + scrollY;
    return { x: Math.max(0, col.left - 8), y: top - (phone ? 12 : 8), width: col.width + 16, height: read.bottom + scrollY - top + (phone ? 12 : 8) + 8 };
  }, phone);
  await page.setViewportSize({ width: page.viewportSize().width, height: Math.ceil(box.y + box.height) + 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
}
/* The whole workspace, from 12px over it to 12px under the inspector, at
   its own edges plus 12px. */
async function studioClip(page) {
  const box = await page.evaluate(() => {
    const st = document.querySelector('.studio').getBoundingClientRect();
    const ins = document.querySelector('.studio__inspector').getBoundingClientRect();
    return { x: st.left - 12, y: st.top + scrollY - 12, width: st.width + 24, height: ins.bottom - st.top + 24 };
  });
  await page.setViewportSize({ width: page.viewportSize().width, height: Math.ceil(box.y + box.height) + 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
}
/* Every decision made, the first with a rule that the third widens: the
   quiet screen. */
async function answerAll(page) {
  const apply = () => page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('button', { name: /^Select and preview\s+Separate the meanings$/ }).click();
  await page.getByText('Use this decision for similar cases').click();
  await apply();
  await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
  await apply();
  await page.getByRole('button', { name: /^Select and preview\s+Separate the meanings$/ }).click();
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
   app/scale.css, as a page zoom: 1.125 from 1296px and 1.25 from 1440 until
   Preview Studio, 1.0625 and 1.125 since), and the tour and the hero are
   taken wider than the first step. These are pictures of its layout
   at its own size, and the tour's height and pins are measured on them at
   1, so every context holds the app at 1. The step is held, --zoom, rather
   than the zoom property itself, because the app divides the heights it
   takes from the window by the step. A capture that comes out drawn at
   anything else is refused rather than written, which is also what a
   renamed step would do. */
async function hold(ctx, zoom = 1, pad = 0) {
  await ctx.addInitScript(({ theme, zoom, pad }) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:root { --zoom: ${zoom} !important; ${pad ? `padding-inline: ${pad}px;` : ''} }`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    /* The theme, as the app's control remembers it (useTheme.ts). Storage can
       throw on a page that is not the app's; nothing here needs it there. */
    try {
      localStorage.setItem('agent-review:theme', theme);
    } catch {}
  }, { theme, zoom, pad });
}

async function write(name, suffix, page, clip, expected = 1, oneTheme = false) {
  const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
  if (zoom !== String(expected)) throw new Error(`${name}${suffix}: the page is drawn at ${zoom}, not ${expected} (${page.url()})`);
  /* A capture in the wrong theme is refused, as one at the wrong size is.
     The scheme is read, not the attribute: dark is the root's own and puts
     nothing on it. */
  if (!oneTheme) {
    const drawn = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    if (drawn !== theme) throw new Error(`${name}${suffix}: the app is drawn ${drawn}, not ${theme} (${page.url()})`);
  }
  if (theme === 'light' && !oneTheme) suffix += '-light';
  const file = path.join(OUT, `${name}${suffix}.webp`);
  fs.writeFileSync(file, await page.screenshot({ type: 'webp', quality: 86, clip }));
  console.log(`${path.relative(ROOT, file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

try {
  for (const [slug, shot] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(slug)) continue;
    if (theme !== 'dark' && shot.light) continue; /* one theme: written under the plain name by the default run only */
    for (const kind of ['desktop', 'phone']) {
      if (shot[kind] === false) continue;
      const spec = shot[kind];
      if (scale !== 2 && (kind === 'phone' || spec !== TOUR)) continue; /* the 3x set is the tour's desktop scenes only */
      const size = spec?.size ?? (kind === 'desktop' ? DESKTOP : PHONE);
      const ctx = await browser.newContext(
        kind === 'phone' ? { ...phoneDevice, viewport: size, deviceScaleFactor: 3 } : { viewport: size, deviceScaleFactor: scale },
      );
      await hold(ctx, kind === 'phone' ? 1 : (spec?.zoom ?? 1), kind === 'phone' ? 0 : (spec?.pad ?? 0));
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
      await write(shot.file, kind === 'phone' ? '-phone' : scale === 2 ? '' : `-${scale}x`, page, spec?.clip ? await spec.clip(page) : undefined, kind === 'phone' ? 1 : (spec?.zoom ?? 1), Boolean(shot.light));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
