/* aisle-test.mjs -- The Shortlist prototype's state, walked branch by
 * branch in a real browser and asserted screen by screen.
 *
 *   node scripts/aisle-test.mjs
 *
 * WHY IT EXISTS. The browser checks measure what each reachable state
 * looks like; they do not read what it says. Every screen after the first
 * is written from the trip so far (which lamps were saved, which aisles
 * those are in, which one was missing, what was shared), so the failure
 * worth guarding against is a screen that claims something the shopper
 * never did: a missing lamp they never saved, an aisle none of their lamps
 * is in, an employee who knows what nobody told her, an ending that lists
 * a comparison nobody opened. Each case below presses its way through
 * the prototype in lab/inspiration-to-aisle.html's hero from a fresh load
 * and reads the screen's text. It had a page of its own,
 * prototype/aisle.html, until 2026-10-29.
 *
 * It is not in checks.yml. It is the prototype's own test, run after a
 * change to lab/aisle.js, in about ten seconds. The cases run at 1280,
 * where the phone holds one height and scrolls inside, unless they say a
 * phone's 375, where it takes each screen's own height.
 *
 * Needs playwright-core and a Chromium (npm install --no-save
 * playwright-core; CHROME=/path/to/chrome if the harness cannot find one).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'lab/inspiration-to-aisle.html';

const chromium = loadChromium('aisle-test.mjs');
const chromePath = findChrome();
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

const results = [];

/* One case: a fresh page, its presses, and the assertions on the way. */
async function run(name, body, opts = {}) {
  const context = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'load' });
  const failures = [];
  const t = {
    page,
    press: async (sel) => {
      const el = await page.$(`[data-aisle] ${sel}`);
      if (!el) throw new Error(`nothing matches ${sel} on "${await t.screen()}"`);
      await el.click();
    },
    screen: () => page.$eval('[data-aisle-stage]', (s) => s.getAttribute('data-screen')),
    text: () => page.$eval('[data-aisle-stage]', (s) => s.innerText.replace(/\s+/g, ' ')),
    status: () => page.$eval('[data-aisle-status]', (s) => s.textContent),
    has: async (sel) => !!(await page.$(`[data-aisle] ${sel}`)),
    ok: (cond, what) => { if (!cond) failures.push(what); },
    includes: async (needle, what) => { const x = await t.text(); if (!x.includes(needle)) failures.push(`${what || 'screen'} should say "${needle}"; it says: ${x.slice(0, 400)}`); },
    excludes: async (needle, what) => { const x = await t.text(); if (x.includes(needle)) failures.push(`${what || 'screen'} should not say "${needle}"`); },
    on: async (screen) => { const s = await t.screen(); if (s !== screen) failures.push(`expected screen ${screen}, on ${s}`); },
  };
  try {
    await body(t);
    /* Nothing undefined, null, or NaN reaches a reader on the last screen. */
    const last = await t.text();
    if (/\bundefined\b|\bnull\b|\bNaN\b/.test(last)) failures.push(`a value leaked into the text: ${last.slice(0, 200)}`);
  } catch (e) {
    failures.push(String(e.message || e));
  }
  if (errors.length) failures.push(`page errors: ${errors.join('; ')}`);
  results.push({ name, failures });
  await context.close();
}

const startTrip = ['[data-go="results"]'];

/* ---------- the cases ---------- */

await run('a fresh load asks what the shopper liked, with nothing picked', async (t) => {
  await t.on('home');
  t.ok((await t.page.$$('[data-aisle] [data-pref]')).length === 4, 'four preference chips');
  t.ok((await t.page.$$('[data-aisle] [data-pref][aria-pressed="true"]')).length === 0, 'no preference pressed on load');
  await t.press('[data-pref="legs"]');
  t.ok(await t.has('[data-pref="legs"][aria-pressed="true"]'), 'legs pressed after a press');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-pref') === 'legs'), 'focus stays on the chip that was pressed');
  await t.press('[data-pref="shade"]');
  t.ok((await t.page.$$('[data-aisle] [data-pref][aria-pressed="true"]')).length === 1, 'one choice at a time');
  await t.press('[data-pref="shade"]');
  t.ok((await t.page.$$('[data-aisle] [data-pref][aria-pressed="true"]')).length === 0, 'pressing the chosen one again takes it back');
});

await run('only the Hollis saved: no Bexley anywhere, and one aisle', async (t) => {
  for (const s of startTrip) await t.press(s);
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.classList.contains('ai-title')), 'a new screen moves focus to its title');
  t.ok((await t.status()).includes('Lamps like this one'), 'the screen change is announced');
  await t.press('[data-save="hollis"]');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-save') === 'hollis'), 'focus stays on Save after a save');
  await t.press('[data-go="plan"]');
  await t.includes('Each of these was counted this morning', 'plan with no stale count');
  await t.press('[data-go="store"]');
  await t.on('store');
  await t.excludes('Bexley', 'store with only the Hollis');
  await t.includes('The Hollis is in Aisle 14, along the back wall.');
  await t.excludes('Aisle 15');
  t.ok(!(await t.has('[data-go="compare"]')), 'no comparison with one lamp');
  await t.press('[data-missing="hollis"]');
  await t.on('missing');
  await t.includes('You can’t find the Hollis');
  await t.excludes('Bexley isn’t');
  await t.includes('probably here');
  await t.press('[data-go="help"]');
  await t.on('help');
  await t.includes('Your shortlist: the Hollis');
  await t.includes('That the Hollis wasn’t where the app said');
  await t.excludes('What you like most', 'help with no preference');
  await t.excludes('compared', 'help when nothing was compared');
  await t.includes('where to find you: Aisle 14');
  await t.press('[data-send]');
  await t.on('sent');
  await t.includes('Dana is coming to Aisle 14');
  await t.includes('in this sample');
  await t.excludes('Bexley');
  await t.press('[data-outcome="helped"]');
  await t.on('done');
  await t.includes('You saved the Hollis.');
  await t.includes('You couldn’t find the Hollis.');
  await t.includes('Dana came over');
  await t.excludes('compared');
  await t.excludes('two saved');
});

await run('legs matter, two saved and compared, the Bexley missing, delivery chosen', async (t) => {
  await t.press('[data-pref="legs"]');
  await t.press('[data-go="results"]');
  await t.includes('each checked on the wood legs');
  t.ok((await t.page.$$('[data-aisle] .ai-fit')).length === 4, 'every match says how it does on the legs');
  t.ok(await t.has('[data-lamp="hollis"] .ai-fit[data-fit="yes"]'), 'the Hollis keeps the legs');
  t.ok(await t.has('[data-lamp="bexley"] .ai-fit[data-fit="no"]'), 'the Bexley does not');
  await t.press('[data-save="hollis"]');
  await t.press('[data-save="bexley"]');
  await t.press('[data-go="plan"]');
  await t.includes('what you liked: the wood legs');
  await t.includes('The Bexley’s is two days old');
  await t.press('[data-go="store"]');
  await t.includes('Both are in Aisle 14, along the back wall.');
  await t.press('[data-go="compare"]');
  const first = await t.page.$eval('[data-aisle] .ai-table tbody tr', (r) => ({ head: r.querySelector('th').textContent, pick: r.hasAttribute('data-pick') }));
  t.ok(first.pick && first.head.startsWith('Legs'), `the legs row comes first and is marked; got ${JSON.stringify(first)}`);
  t.ok((await t.status()) === 'Comparison shown', 'the comparison opening is announced');
  await t.press('[data-missing="bexley"]');
  await t.includes('The Bexley isn’t on the shelf');
  await t.includes('Choose the Hollis');
  await t.includes('It keeps what you liked. Walnut legs, like your photo.');
  await t.includes('$50 more than the Bexley.');
  await t.excludes('Arrives Thursday');
  await t.press('[data-outcome="deliver"]');
  await t.on('done');
  await t.includes('the wood legs mattered most');
  await t.includes('You saved the Hollis and the Bexley.');
  await t.includes('compared them side by side, the wood legs first');
  await t.includes('so you chose delivery. Nothing was ordered');
  await t.excludes('asked for help');
});

await run('two lamps in two aisles: directions from the list', async (t) => {
  await t.press('[data-go="results"]');
  await t.press('[data-save="rowan"]');
  await t.press('[data-save="linden"]');
  await t.press('[data-go="plan"]');
  await t.excludes('two days old');
  await t.press('[data-go="store"]');
  await t.includes('In walking order: Aisle 12, in the middle of Home, then 15, along the back wall.');
  const walk = await t.page.$$eval('[data-aisle] .ai-saved-name', (els) => els.map((e) => e.textContent.split(' ')[0]));
  t.ok(walk.join() === 'Linden,Rowan', `the store list is in walking order; got ${walk}`);
  await t.excludes('Aisle 14');
  await t.press('[data-missing="linden"]');
  /* The Linden is missing with a fresh count: the way forward keeps what
     the shopper saved before it reaches for anything else. */
  await t.includes('Choose the Rowan');
  await t.includes('$120 more than the Linden.');
});

await run('a saved lamp hidden and brought back comes back saved', async (t) => {
  await t.press('[data-go="results"]');
  await t.press('[data-save="bexley"]');
  await t.press('[data-save="hollis"]');
  await t.press('[data-reject="bexley"]');
  await t.includes('Hidden: Bexley tripod floor lamp.');
  await t.includes('1 saved');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-unhide')), 'focus moves to Undo');
  await t.press('[data-unhide="bexley"]');
  t.ok(await t.has('[data-save="bexley"][aria-pressed="true"]'), 'the Bexley is saved again');
  await t.includes('2 saved');
  const order = await t.page.$$eval('[data-aisle] [data-lamp]', (els) => els.map((e) => e.getAttribute('data-lamp')));
  t.ok(order.join() === 'hollis,bexley,rowan,linden', `the results keep their order; got ${order}`);
  await t.press('[data-go="plan"]');
  const list = await t.page.$$eval('[data-aisle] .ai-saved-name', (els) => els.map((e) => e.textContent.split(' ')[0]));
  t.ok(list.join() === 'Bexley,Hollis', `the list keeps the order it was saved in; got ${list}`);
});

await run('hiding all four, and bringing them all back', async (t) => {
  await t.press('[data-go="results"]');
  for (const id of ['hollis', 'bexley', 'rowan', 'linden']) await t.press(`[data-reject="${id}"]`);
  t.ok((await t.page.$$('[data-aisle] .ai-card')).length === 0, 'no cards left');
  await t.includes('You hid all four');
  t.ok(!(await t.has('[data-go="plan"]')), 'no trip to plan with nothing saved');
  await t.press('.ai-empty [data-reset-hidden]');
  t.ok((await t.page.$$('[data-aisle] .ai-card')).length === 4, 'all four back');
  await t.press('[data-reject="rowan"]');
  await t.press('[data-reject="linden"]');
  await t.includes('Bring back all 2');
});

await run('four saved on a phone: the comparison scrolls, the page does not', async (t) => {
  await t.press('[data-go="results"]');
  for (const id of ['hollis', 'bexley', 'rowan', 'linden']) await t.press(`[data-save="${id}"]`);
  await t.press('[data-go="plan"]');
  await t.press('[data-go="store"]');
  await t.includes('In walking order: Aisle 12, in the middle of Home, then 14 and 15, along the back wall.');
  await t.press('[data-go="compare"]');
  await t.includes('Scroll the table sideways for all 4.');
  t.ok((await t.page.$$('[data-aisle] .ai-table thead th')).length === 5, 'four lamps and the feature column');
  const m = await t.page.evaluate(() => {
    const w = document.querySelector('.ai-table-wrap');
    return { page: document.documentElement.scrollWidth, view: window.innerWidth, wrap: w.scrollWidth, wrapView: w.clientWidth, focusable: w.tabIndex === 0 };
  });
  t.ok(m.page <= m.view, `no sideways scroll on the page (${m.page} > ${m.view})`);
  t.ok(m.wrap > m.wrapView, 'the comparison scrolls inside its region');
  t.ok(m.focusable, 'the scrolling region takes keyboard focus');
}, { viewport: { width: 375, height: 812 } });

await run('nobody free: the request stays open, and can be cancelled', async (t) => {
  await t.press('[data-go="results"]');
  await t.press('[data-save="hollis"]');
  await t.press('[data-go="plan"]');
  await t.press('[data-go="store"]');
  await t.press('[data-go="help"]');
  /* Uncheck the photo: what is sent is what is checked. */
  await t.page.click('[data-aisle] input[value="photo"]');
  await t.press('[data-send]');
  await t.excludes('Your photo of the lamp');
  await t.includes('Your shortlist: the Hollis');
  await t.press('[data-staff]');
  await t.on('sent');
  await t.includes('Nobody in Home is free right now');
  await t.includes('The app won’t guess when.');
  await t.excludes('minutes');
  await t.press('[data-go="store"]');
  await t.includes('Your request for help is open');
  t.ok(!(await t.has('[data-go="help"]')), 'no second request while one is open');
  await t.press('[data-cancel-help]');
  await t.excludes('Your request for help is open');
  t.ok(await t.has('[data-go="help"]'), 'asking again is possible after cancelling');
  await t.press('[data-outcome="own"]');
  await t.includes('then carried on alone');
  await t.includes('shared one thing from your trip');
});

await run('done on your own, then start over cleanly', async (t) => {
  await t.press('[data-pref="height"]');
  await t.press('[data-go="results"]');
  await t.press('[data-save="linden"]');
  await t.press('[data-go="plan"]');
  await t.press('[data-go="store"]');
  await t.press('[data-outcome="own"]');
  await t.on('done');
  await t.includes('You finished on your own');
  await t.excludes('wasn’t on the shelf');
  await t.excludes('asked for help');
  await t.press('[data-reset]');
  await t.on('home');
  t.ok((await t.page.$$('[data-aisle] [data-pref][aria-pressed="true"]')).length === 0, 'no preference after starting over');
  await t.press('[data-go="results"]');
  t.ok((await t.page.$$('[data-aisle] [data-save][aria-pressed="true"]')).length === 0, 'nothing saved after starting over');
  t.ok((await t.page.$$('[data-aisle] .ai-fit')).length === 0, 'no preference lines after starting over');
});

await run('back navigation cannot reach a store with an empty list', async (t) => {
  await t.press('[data-go="results"]');
  await t.press('[data-save="rowan"]');
  await t.press('[data-go="plan"]');
  await t.press('[data-go="store"]');
  await t.press('[data-go="plan"]');
  await t.press('[data-go="results"]');
  await t.press('[data-save="rowan"]');
  t.ok(!(await t.has('[data-go="plan"]')), 'no way forward once the list is empty');
  await t.press('[data-go="home"]');
  await t.on('home');
});

await run('the keyboard reaches and presses every control on the results', async (t) => {
  await t.press('[data-go="results"]');
  await t.page.focus('[data-aisle] [data-save="hollis"]');
  await t.page.keyboard.press('Enter');
  t.ok(await t.has('[data-save="hollis"][aria-pressed="true"]'), 'Enter saves');
  await t.page.keyboard.press('Space');
  t.ok(await t.has('[data-save="hollis"][aria-pressed="false"]'), 'Space unsaves');
  await t.page.keyboard.press('Tab');
  t.ok(await t.page.evaluate(() => document.activeElement.getAttribute('data-reject') === 'hollis'), 'Tab moves to Not it');
});

/* Every control on a screen is a finger's target: hit-tested with
   elementFromPoint 21px either side of its center, not read off its box,
   because a pseudo-element can make a short link a tall target and a
   neighbor can cover part of a tall one. */
async function targets(t, where) {
  const small = await t.page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[data-aisle] button, [data-aisle] summary, [data-aisle] label, [data-aisle] a, [data-aisle] [tabindex="0"]')) {
      if (!el.getBoundingClientRect().width) continue;
      el.scrollIntoView({ block: 'center' });
      const q = el.getBoundingClientRect();
      const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      const ok = (x, y) => { const h = document.elementFromPoint(x, y); return h && (h === el || el.contains(h)); };
      if (!(ok(cx, cy - 21) && ok(cx, cy + 21) && ok(cx - 21, cy) && ok(cx + 21, cy))) out.push(`"${el.textContent.trim().slice(0, 30)}" ${Math.round(q.width)}x${Math.round(q.height)}`);
    }
    return out;
  });
  t.ok(!small.length, `${where}: targets under 44px: ${small.join('; ')}`);
}

await run('every control on every screen is at least 44px to press', async (t) => {
  await t.press('[data-pref="shade"]');
  await targets(t, 'home');
  await t.press('[data-go="results"]');
  await t.press('[data-why="hollis"]');
  await t.press('[data-save="hollis"]');
  await t.press('[data-save="bexley"]');
  await t.press('[data-reject="rowan"]');
  await t.press('[data-reject="linden"]');
  await targets(t, 'results, two hidden');
  await t.press('[data-go="plan"]');
  await targets(t, 'plan');
  await t.press('[data-go="store"]');
  await t.press('[data-go="compare"]');
  await targets(t, 'store');
  await t.press('[data-missing="bexley"]');
  await targets(t, 'missing');
  await t.press('[data-go="help"]');
  await targets(t, 'help');
  await t.press('[data-send]');
  await targets(t, 'sent');
  await t.press('[data-staff]');
  await targets(t, 'nobody free');
  await t.press('[data-go="store"]');
  await targets(t, 'store, request open');
  await t.press('[data-outcome="own"]');
  await targets(t, 'done');
}, { viewport: { width: 375, height: 812 } });

await run('a new screen arrives in view, with focus on its title', async (t) => {
  await t.press('[data-go="results"]');
  await t.press('[data-save="linden"]');
  /* "Plan a store trip" is at the foot of a screen several phones tall. */
  await t.press('[data-go="plan"]');
  const r = await t.page.evaluate(() => {
    const a = document.activeElement;
    const b = a.getBoundingClientRect();
    return { title: a.classList.contains('ai-title'), top: b.top, bottom: b.bottom, h: window.innerHeight };
  });
  t.ok(r.title, 'focus is on the new title');
  t.ok(r.top >= 0 && r.bottom <= r.h, `the focused title is on screen (top ${Math.round(r.top)}, bottom ${Math.round(r.bottom)}, viewport ${r.h})`);
  await t.press('[data-go="results"]');
  await t.press('[data-save="hollis"]');
  await t.press('[data-go="plan"]');
  await t.press('[data-go="store"]');
  await t.press('[data-go="compare"]');
  t.ok(!(await t.has('.ai-table-wrap[tabindex]')), 'two lamps fit, so the comparison is not a tab stop');
}, { viewport: { width: 375, height: 812 } });

/* From 64rem the phone holds one height and the screen scrolls inside it
   (inspiration-to-aisle.css), so a new screen has to start at its own top,
   and no press may change how tall the hero is. */
await run('on a wide screen the phone holds one height, and a new screen starts at its top', async (t) => {
  const box = () => t.page.evaluate(() => {
    const f = document.querySelector('[data-aisle]').getBoundingClientRect();
    const s = document.querySelector('[data-aisle-stage]');
    return { frame: Math.round(f.height), scrolls: s.scrollHeight > s.clientHeight, top: s.scrollTop };
  });
  const first = await box();
  await t.press('[data-go="results"]');
  for (const l of ['hollis', 'bexley', 'rowan', 'linden']) await t.press(`[data-save="${l}"]`);
  const results = await box();
  t.ok(results.scrolls, 'the results screen is taller than the phone, so it scrolls inside it');
  t.ok(results.frame === first.frame, `the phone is one height (${first.frame} at rest, ${results.frame} on the results)`);
  /* Four saved, so the plan is taller than the phone too: a shorter screen
     would clamp the scroll to its top whether or not the app reset it, and
     the case would pass without asking anything. A swap keeps the old
     screen's scroll otherwise. */
  await t.page.$eval('[data-aisle-stage]', (s) => { s.scrollTop = s.scrollHeight; });
  await t.press('[data-go="plan"]');
  const plan = await box();
  t.ok(plan.scrolls, 'the plan with four lamps is taller than the phone');
  t.ok(plan.top === 0, `the new screen starts at its top (scrolled ${plan.top})`);
  t.ok(plan.frame === first.frame, `the phone is still one height (${plan.frame})`);
  const r = await t.page.evaluate(() => {
    const a = document.activeElement.getBoundingClientRect();
    const s = document.querySelector('[data-aisle-stage]').getBoundingClientRect();
    return { title: document.activeElement.classList.contains('ai-title'), inStage: a.top >= s.top && a.bottom <= s.bottom, onPage: a.top >= 0 && a.bottom <= innerHeight };
  });
  t.ok(r.title && r.inStage && r.onPage, 'focus is on the new title, in sight inside the phone and on the page');
}, { viewport: { width: 1280, height: 900 } });

/* ---------- the verdict first, then the list ---------- */

server.close();
await browser.close();
const failed = results.filter((r) => r.failures.length);
console.log(failed.length ? `✗ aisle-test: ${failed.length} of ${results.length} cases failed` : `✓ aisle-test: ${results.length} cases pass`);
for (const r of results) {
  console.log(`  ${r.failures.length ? '✗' : '✓'} ${r.name}`);
  for (const f of r.failures) console.log(`      ${f}`);
}
process.exit(failed.length ? 1 : 0);
