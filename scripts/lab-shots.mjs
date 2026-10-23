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
   the layout holds, and the picture's text is that much larger. (The
   seven-step tour, taken at 1.25 in a 1600px window with a 48px margin,
   came off the case study on 2026-10-21, and its recipes with it.) The
   hero is 1.25 in a 1440 window, the scope and
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
     node scripts/lab-shots.mjs tradeoff directions decision   # the three moments
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
   record is a completed change opened. From 2026-10-06 to 2026-10-21 the
   tour was scenes of the delegated work (tour-start and the rest), which
   replaced the one
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
/* The desktop captures are 2x; the figures print well under half their file
   at that. (A --scale 3 set was the tour's alone, and went with it.) */
const scale = 2;
const only = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--from' && all[i - 1] !== '--theme');
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
  /* THE SIGNATURE IMAGE, since 2026-10-09: the first moment's figure is the
     trade-off itself. Until Preview Studio it was the decision card, the
     agent's read over the two directions; since agent-review#30 it is the
     workspace's left half, the problem in place. Since agent-review#35
     (2026-10-21) that is billing settings, "Cancel subscription" built by
     hand among the system's buttons, marked as the decision, "Change plan"
     marked as its twin, a caption under each, and under them the agent's
     read, what it recommends and what it can't determine. (Until then: the
     billing activity beside the payment history, two reds.) Desktop at 1200,
     the narrowest window where the two screens sit side by side, cut at the
     column's own edges, 8px of ground round it. On a phone the read alone,
     as before: the two screens stack there, to a picture too tall for the
     hero. */
  tradeoff: {
    file: 'agent-review-tradeoff',
    app: '#/runs/billing',
    desktop: { size: { width: 1440, height: 1000 }, zoom: 1.25, clip: tradeoffClip },
    phone: { size: { width: 375, height: 720 }, clip: tradeoffClip },
    open: async (page) => {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  /* The decision record, as a figure: Dana's decision, whole, in the main
     column. On a phone, the record from its top. */
  decision: {
    file: 'agent-review-decision',
    app: '#/runs/billing',
    desktop: { size: { width: 1440, height: 760 }, zoom: 1.125, clip: recordClip },
    open: async (page) => {
      await decideOwnChange(page);
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      const record = page.locator('.decided').first();
      await record.waitFor();
      const phone = (page.viewportSize()?.width ?? 0) < 500;
      await record.evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await page.evaluate((by) => window.scrollBy(0, by), phone ? -8 : -12);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  /* One completed change, open: the agent's own choice between two tokens
     that share a red, with what each check established, what no check
     could, its history and the revert. */
  record: {
    file: 'agent-review-delegation-record',
    app: '#/runs/billing',
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
    app: '#/runs/billing',
    desktop: { clip: mainColumn },
    open: async (page) => {
      await page.getByRole('button', { name: /^Select and preview\s+Make it a Button in its own change$/ }).click();
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
    app: '#/runs/billing',
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
  /* THE FIRST MINUTE, since 2026-10-12 (a hiring-manager review): focused
     crops of the states the case study's three moments and its evidence
     point at, each cut at its own part's edges so it prints large in a half
     column, from the same production build as everything else here.

     directions: the decision in the inspector, from the panel's head to the
     second direction's button: the question, each direction's main risk in
     view, and the two buttons. */
  directions: {
    file: 'agent-review-directions',
    app: '#/runs/billing',
    desktop: { size: { width: 1440, height: 1000 }, zoom: 1.25, clip: (page) => partClip(page, '.studio__inspector', '.studio__inspector .ask__choice:last-of-type', '.studio__inspector') },
    phone: { clip: (page) => partClip(page, '.studio__inspector', '.studio__inspector .ask__choice:last-of-type', '.studio__inspector', 8) },
    open: async (page) => {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  /* proposed: "Make it a Button in its own change" selected and not
     applied: the preview says so in its bar, and that it draws the change
     the direction opens, and "Cancel subscription" is the system's button
     beside the others. On a phone, the preview's bar down to the first
     caption. (Until 2026-10-21, "Keep the red for now".) */
  proposed: {
    file: 'agent-review-proposed',
    app: '#/runs/billing',
    desktop: { size: { width: 1440, height: 1000 }, zoom: 1.25, clip: (page) => partClip(page, '.studio-preview', '.studio-preview', '.studio-preview') },
    phone: { clip: (page) => partClip(page, '.studio-preview', '.studio-preview .sketch__caption', '.studio-preview', 8) },
    open: async (page) => {
      await page.getByRole('button', { name: /^Select and preview\s+Make it a Button in its own change$/ }).click();
      await page.mouse.move(0, 0);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
  },
  /* rule: the rule a decision can become, as the person sees it before
     applying: the box checked, the rule in words, what it doesn't cover,
     what it settles now, what happens next time, and that revoking it
     doesn't undo what it did; then Cancel and Apply. */
  'rule-scope': {
    file: 'agent-review-rule-scope',
    app: '#/runs/billing',
    desktop: { size: { width: 1440, height: 1000 }, zoom: 1.25, clip: (page) => partClip(page, '.studio__inspector .ask__rule', '.studio__inspector .ask__bar', '.studio__inspector') },
    phone: { clip: (page) => partClip(page, '.studio__inspector .ask__rule', '.studio__inspector .ask__bar', '.studio__inspector', 8) },
    open: async (page) => {
      await decideOwnChange(page);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  /* THE EARLIER APPROACH AND THE CURRENT ONE, at the same window: the
     review queue, the first iteration's front door and still in the
     prototype under "Reviews", and the delegated work it was redesigned
     into. Each is the first screen a person meets at an 1100px window,
     uncut, so it prints at about its own size across the case study's
     column. */
  'before-queue': {
    file: 'agent-review-before-queue',
    app: '#/queue',
    desktop: { size: { width: 1100, height: 640 }, zoom: 1 },
    open: async (page) => {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    },
  },
  'after-account': {
    file: 'agent-review-after-account',
    app: '#/runs/billing',
    desktop: { size: { width: 1100, height: 640 }, zoom: 1 },
    open: async (page) => {
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

/* The reason Dana gives for her decision, in her own words: the one thing
   no file in the repository holds, why cancel is quiet, which is the
   agent's "What I can't determine", in front of the agent's draft. It is
   the simulated person's, as the prototype's DANAS_REASON has it
   (agent-review src/data/billing.ts), and claims no real retention test.
   Until 2026-10-21 the reason was for keeping the red. */
const REASON =
  'The gray link is from a retention test last year that ended without a decision, and nobody turned it off. How easy it is to cancel is a product decision, so it gets its own change. A quiet Button would let any agent make any action this hard to find.';
async function decideOwnChange(page) {
  await page.getByRole('button', { name: /^Select and preview\s+Make it a Button in its own change$/ }).click();
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
/* A part of the page, cut at its own edges: from the top of `from` to the
   foot of `to`, as wide as `col`, with `pad` of ground round it. The window
   is made tall enough to hold it, so nothing scrolls inside the cut. */
async function partClip(page, from, to, col, pad = 12) {
  /* Measured in a window taller than the page, so a sticky part (the
     confirmation's Cancel and Apply bar) sits where it is in the flow and
     not over the words above it. */
  await page.setViewportSize({ width: page.viewportSize().width, height: 4000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const box = await page.evaluate(([from, to, col]) => {
    const f = document.querySelector(from).getBoundingClientRect();
    const all = document.querySelectorAll(to);
    const t = all[all.length - 1].getBoundingClientRect();
    const c = document.querySelector(col).getBoundingClientRect();
    return { x: c.left, y: f.top + scrollY, width: c.width, bottom: t.bottom + scrollY };
  }, [from, to, col]);
  const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + 2 * pad, height: box.bottom - box.y + 2 * pad };
  await page.setViewportSize({ width: page.viewportSize().width, height: Math.ceil(clip.y + clip.height) + 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  return { x: Math.round(clip.x), y: Math.round(clip.y), width: Math.round(Math.min(clip.width, page.viewportSize().width - clip.x)), height: Math.round(clip.height) };
}
/* Every decision made, the first with a rule that the third widens: the
   quiet screen. */
async function answerAll(page) {
  const apply = () => page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByRole('button', { name: /^Select and preview\s+Make it a Button in its own change$/ }).click();
  await page.getByText('Use this decision for similar cases').click();
  await apply();
  await page.getByRole('button', { name: 'Add --radius-full, this once' }).click();
  await apply();
  await page.getByRole('button', { name: /^Select and preview\s+Make it a Button in its own change$/ }).click();
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
   Preview Studio, 1.0625 and 1.125 since), and the hero is taken wider
   than the first step. These are pictures of its layout at its own size,
   so every context holds the app at 1. The step is held, --zoom, rather
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
      await write(shot.file, kind === 'phone' ? '-phone' : '', page, spec?.clip ? await spec.clip(page) : undefined, kind === 'phone' ? 1 : (spec?.zoom ?? 1), Boolean(shot.light));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
