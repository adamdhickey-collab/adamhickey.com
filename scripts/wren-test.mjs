/* wren-test.mjs -- the After Send prototype's handoff, walked in a real
 * browser and asserted screen by screen.
 *
 *   node scripts/wren-test.mjs
 *
 * WHY IT EXISTS. The browser checks measure what each reachable state
 * looks like; they do not read what it says. The record and the supplier's
 * notice are both drawn from one list of events, and the failure worth
 * guarding against is one view claiming something the other has not seen:
 * a record that says processed before the supplier pressed anything, a
 * match that moves the processing time, a second press that adds a second
 * event, a Back that drops focus on the page. Each case below presses its
 * way through the prototype in lab/after-send.html from a fresh load and
 * reads the screen's text, the live region, and the active element.
 *
 * It is not in checks.yml. It is the prototype's own test, run after a
 * change to lab/wren.js, in about ten seconds. The cases run at 1280,
 * where the list is a table, unless they say a phone's 375, where each
 * row is a card.
 *
 * Needs playwright-core and a Chromium (npm install --no-save
 * playwright-core; CHROME=/path/to/chrome if the harness cannot find one).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome, serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'lab/after-send.html';

const chromium = loadChromium('wren-test.mjs');
const chromePath = findChrome();
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

const results = [];

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
      const el = await page.$(`[data-wren] ${sel}`);
      if (!el) throw new Error(`nothing matches ${sel} on "${await t.screen()}"`);
      await el.click();
      await page.waitForTimeout(60);
    },
    type: async (sel, text) => { await page.fill(`[data-wren] ${sel}`, text); await page.waitForTimeout(60); },
    select: async (sel, value) => { await page.selectOption(`[data-wren] ${sel}`, value); await page.waitForTimeout(60); },
    screen: () => page.$eval('[data-wren-stage]', (s) => s.getAttribute('data-screen')),
    text: () => page.$eval('[data-wren-stage]', (s) => s.innerText.replace(/\s+/g, ' ')),
    status: () => page.$eval('[data-wren-status]', (s) => s.textContent),
    step: () => page.$eval('[data-wren-step][aria-current="step"]', (s) => s.getAttribute('data-wren-step')),
    rows: () => page.$$eval('[data-wren] tbody tr', (rs) => rs.length),
    active: () => page.evaluate(() => { const a = document.activeElement; return a ? (a.className + '|' + (a.getAttribute('data-open') || a.getAttribute('data-review') || a.getAttribute('data-replace') || a.id || '')) : ''; }),
    has: async (sel) => !!(await page.$(`[data-wren] ${sel}`)),
    ok: (cond, what) => { if (!cond) failures.push(what); },
    includes: async (needle, what) => { const x = await t.text(); if (!x.includes(needle)) failures.push(`${what || 'screen'} should say "${needle}"; it says: ${x.slice(0, 500)}`); },
    excludes: async (needle, what) => { const x = await t.text(); if (x.includes(needle)) failures.push(`${what || 'screen'} should not say "${needle}"`); },
    on: async (screen) => { const s = await t.screen(); if (s !== screen) failures.push(`expected screen ${screen}, on ${s}`); },
    events: () => page.$$eval('[data-wren] .wr-events li', (ls) => ls.map((l) => l.textContent.replace(/\s+/g, ' '))),
  };
  try {
    await body(t);
    const last = await t.text();
    if (/\bundefined\b|\bnull\b|\bNaN\b/.test(last)) failures.push(`a value leaked into the text: ${last.slice(0, 200)}`);
  } catch (e) {
    failures.push(String(e.message || e));
  }
  if (errors.length) failures.push(`page errors: ${errors.join('; ')}`);
  results.push({ name, failures });
  await context.close();
}

/* ---------- the cases ---------- */

await run('a fresh load is the buyer’s list, five payments, step 1', async (t) => {
  await t.on('list');
  t.ok((await t.rows()) === 5, `five rows on load, saw ${await t.rows()}`);
  t.ok((await t.step()) === '1', 'step 1 is current');
  await t.includes('Not processed yet');
  await t.includes('Processed, ready to match');
  await t.includes('Processed and matched');
  await t.includes('Expired, not processed');
  t.ok(await t.has('[data-scenario="default"][aria-pressed="true"]'), 'default scenario pressed');
  t.ok(await t.has('[data-role="buyer"][aria-pressed="true"]'), 'buyer role pressed');
});

await run('search by invoice reference finds one row; by supplier, two; nonsense, none, with a way back', async (t) => {
  await t.type('[data-search]', 'INV-20483');
  t.ok((await t.rows()) === 1, `one row for the reference, saw ${await t.rows()}`);
  t.ok((await t.status()).includes('1 payment'), `the count is announced: "${await t.status()}"`);
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-search')), 'typing keeps focus in the search box');
  await t.type('[data-search]', 'larkspur');
  t.ok((await t.rows()) === 2, `two rows for the supplier, saw ${await t.rows()}`);
  await t.type('[data-search]', 'zzz');
  t.ok((await t.rows()) === 0, 'no rows for nonsense');
  await t.includes('No payments match');
  await t.press('[data-clear]');
  t.ok((await t.rows()) === 5, 'clearing brings all five back');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-search')), 'focus goes to the search box after clearing');
});

await run('the status filter narrows to the waiting payment, and combines with search', async (t) => {
  await t.select('[data-filter]', 'waiting');
  t.ok((await t.rows()) === 1, `one waiting payment, saw ${await t.rows()}`);
  await t.includes('Larkspur Packaging');
  await t.excludes('Cedar Ridge');
  await t.select('[data-filter]', 'expired');
  t.ok((await t.rows()) === 1, 'one expired payment in the default scenario');
  await t.includes('Tamsin Office Supply');
  await t.select('[data-filter]', 'matched');
  t.ok((await t.rows()) === 2, 'two matched');
  await t.type('[data-search]', 'cedar');
  t.ok((await t.rows()) === 1, 'filter and search together');
});

await run('the default handoff: find, interpret, process as the supplier, close the loop as the buyer', async (t) => {
  await t.type('[data-search]', 'INV-20483');
  await t.press('[data-open="larkspur-20483"]');
  await t.on('detail');
  t.ok((await t.step()) === '2', 'step 2 on the record');
  t.ok((await t.active()).startsWith('wr-title'), 'a new screen moves focus to its title');
  t.ok((await t.status()).includes('Payment record'), 'the record is announced');
  await t.includes('Not processed yet');
  await t.includes('Sent and delivered Oct 28');
  await t.includes('Not yet');
  await t.includes('Matching waits for processing');
  await t.includes('Who acts next Larkspur Packaging');
  await t.includes('Larkspur Packaging has until Nov 27');
  await t.includes('Valid through Nov 27');
  await t.includes('Last confirmed event Notice delivered');
  t.ok(!(await t.has('[data-review]')), 'no Review match while waiting');
  /* The record's order: facts, then who acts next, then the details, then the activity. */
  const order = await t.page.$eval('[data-wren-stage]', (s) => [...s.children].map((c) => c.className.split(' ')[0]).join(','));
  t.ok(order === 'wr-crumbs,wr-head,wr-facts,wr-next,wr-grid,wr-activity', `the record reads facts, next, details, activity: ${order}`);
  t.ok(!(await t.page.$eval('[data-wren] .wr-activity', (d) => d.open)), 'the activity is folded');
  await t.includes('Activity, 3 events');

  /* The supplier's side. */
  await t.press('[data-role="supplier"]');
  await t.on('notice');
  t.ok((await t.step()) === '3', 'step 3 on the notice');
  t.ok((await t.active()).startsWith('wr-title'), 'the notice takes focus');
  await t.includes('Payment notice from Fieldstone Foods');
  await t.includes('$4,860.00 for invoice INV-20483');
  await t.includes('Valid through Nov 27');
  await t.excludes('Who acts next', 'the supplier does not see the buyer’s next-action block');
  await t.excludes('Activity', 'the supplier does not see the buyer’s activity');
  await t.excludes('accounts payable', 'the supplier does not see the buyer’s team');
  t.ok(await t.has('[data-process]'), 'Process this payment is offered');
  await t.press('[data-process]');
  t.ok((await t.status()).includes('Processed Nov 5, 2:10 pm'), `processing is announced: "${await t.status()}"`);
  await t.includes('Processed Nov 5, 2:10 pm.');
  t.ok(!(await t.has('[data-process]')), 'Process cannot be pressed twice');

  /* Back to the buyer: the same record, two facts. */
  await t.press('[data-role="buyer"]');
  await t.on('detail');
  t.ok((await t.step()) === '4', 'step 4 once processed');
  await t.includes('Processed by supplier');
  await t.includes('Larkspur Packaging processed it Nov 5, 2:10 pm.');
  await t.includes('Ready to match to invoice');
  await t.includes('Who acts next You');
  await t.includes('Activity, 4 events');
  await t.press('[data-review]');
  t.ok((await t.active()).startsWith('wr-panel-h'), 'the match panel takes focus');
  await t.includes('Proposed match');
  await t.includes('Supplier and amount agree');
  await t.press('[data-decline-match]');
  await t.includes('Nothing changed when you declined');
  t.ok((await t.active()).includes('data-review') || (await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-review'))), 'declining returns focus to Review match');
  await t.press('[data-review]');
  await t.press('[data-confirm-match]');
  t.ok((await t.status()).includes('Matched:'), 'the match is announced');
  await t.includes('Matched to INV-20483');
  await t.includes('Matched Nov 5, 2:12 pm');
  await t.includes('Processed by supplier');
  await t.includes('processed it Nov 5, 2:10 pm', 'the processing time is unchanged by the match');
  await t.includes('Who acts next No one');
  t.ok(!(await t.has('[data-confirm-match]')) && !(await t.has('[data-review]')), 'Confirm cannot be pressed twice');
  const events = await t.events();
  t.ok(events.length === 5, `five events after processing and matching, saw ${events.length}`);
  t.ok(events.filter((e) => e.includes('Processed by')).length === 1, 'one processing event');
  t.ok(events.filter((e) => e.includes('Matched to')).length === 1, 'one matching event');

  /* The list agrees with the record. */
  await t.press('[data-back]');
  await t.on('list');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-open') === 'larkspur-20483'), 'Back returns focus to the row that was opened');
  await t.type('[data-search]', 'INV-20483');
  await t.includes('Processed and matched');
});

await run('the supplier before any record is open shows the followed payment', async (t) => {
  await t.press('[data-role="supplier"]');
  await t.on('notice');
  await t.includes('INV-20483');
  await t.press('[data-role="buyer"]');
  await t.on('detail');
  await t.includes('Larkspur Packaging · INV-20483');
});

await run('Escape closes the match panel and returns focus to its button', async (t) => {
  await t.press('[data-open="bright-30077"]');
  await t.includes('Ready to match to invoice');
  await t.press('[data-review]');
  await t.includes('Proposed match');
  await t.page.keyboard.press('Escape');
  await t.page.waitForTimeout(60);
  await t.excludes('Proposed match');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-review')), 'focus is back on Review match');
  t.ok(await t.has('[data-review][aria-expanded="false"]'), 'the button says it is closed');
});

await run('the expired scenario: what expired, what happened, who acts next, and nothing issued', async (t) => {
  await t.press('[data-scenario="expired"]');
  await t.on('detail');
  t.ok((await t.step()) === '5', 'step 5 in the expired scenario');
  await t.includes('Expired Nov 4, not processed');
  await t.includes('The validity date passed with no processing event from Larkspur Packaging. Nothing was charged.');
  await t.includes('Nothing to match');
  await t.includes('Who acts next You');
  await t.includes('Valid through Nov 4 (passed)');
  await t.includes('Activity, 4 events');
  t.ok(!(await t.has('[data-review]')), 'no match review on an expired payment');
  await t.press('[data-replace]');
  t.ok((await t.active()).startsWith('wr-panel-h'), 'the replacement panel takes focus');
  await t.includes('Replacement options');
  await t.includes('outside this demo');
  await t.includes('Don’t pay twice');
  t.ok(!(await t.has('[data-issue]')) && !(await t.has('[data-approve]')), 'nothing issues or approves a replacement');
  await t.press('[data-close-replace]');
  await t.excludes('Replacement options');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-replace')), 'closing returns focus to its button');
  /* The supplier's notice agrees. */
  await t.press('[data-role="supplier"]');
  await t.includes('This payment expired Nov 4 and can no longer be processed');
  t.ok(!(await t.has('[data-process]')), 'an expired payment cannot be processed');
  /* The list agrees too. */
  await t.press('[data-role="buyer"]');
  await t.press('[data-back]');
  await t.select('[data-filter]', 'expired');
  t.ok((await t.rows()) === 2, `two expired payments in this scenario, saw ${await t.rows()}`);
});

await run('Start over puts everything back, after processing and matching', async (t) => {
  await t.press('[data-open="larkspur-20483"]');
  await t.press('[data-role="supplier"]');
  await t.press('[data-process]');
  await t.press('[data-role="buyer"]');
  await t.press('[data-review]');
  await t.press('[data-confirm-match]');
  await t.press('[data-reset]');
  await t.on('list');
  t.ok((await t.step()) === '1', 'step 1 after reset');
  t.ok(await t.has('[data-role="buyer"][aria-pressed="true"]'), 'buyer role after reset');
  await t.type('[data-search]', 'INV-20483');
  await t.includes('Not processed yet');
  await t.press('[data-open="larkspur-20483"]');
  await t.includes('Activity, 3 events');
});

await run('switching scenario mid-run starts that scenario fresh', async (t) => {
  await t.press('[data-open="larkspur-20483"]');
  await t.press('[data-role="supplier"]');
  await t.press('[data-process]');
  await t.press('[data-scenario="expired"]');
  await t.includes('Expired Nov 4, not processed');
  await t.excludes('Processed by supplier');
  await t.press('[data-scenario="default"]');
  await t.on('list');
  await t.press('[data-open="larkspur-20483"]');
  await t.includes('Not processed yet');
});

/* What the walkthrough says, and that it never asks for a press that is gone. */
const hint = (t) => t.page.$eval('[data-wren-hint]', (h) => h.textContent);
const done = (t) => t.page.$$eval('[data-wren-step][data-done]', (l) => l.length);
const closeLoop = async (t) => {
  await t.press('[data-open="larkspur-20483"]');
  await t.press('[data-role="supplier"]');
  await t.press('[data-process]');
  await t.press('[data-role="buyer"]');
  await t.press('[data-review]');
  await t.press('[data-confirm-match]');
};

await run('the walkthrough’s hint follows the state, and it ends', async (t) => {
  await t.press('[data-open="larkspur-20483"]');
  await t.press('[data-role="supplier"]');
  t.ok((await hint(t)).includes('Press Process this payment'), 'the notice asks for the press');
  await t.press('[data-process]');
  t.ok(!(await hint(t)).includes('Press Process'), `no hint for a press that is gone: ${await hint(t)}`);
  await t.press('[data-next]');
  await t.on('detail');
  t.ok((await t.step()) === '4', 'the guide’s offer goes back to the buyer');
  await t.press('[data-role="supplier"]');
  t.ok((await t.step()) === '3', 'still step 3 on the notice');
  await t.press('[data-role="buyer"]');
  await t.press('[data-review]');
  await t.press('[data-confirm-match]');
  t.ok((await t.page.textContent('[data-wren-next]')).includes('Expired payment'), 'the end offers the exception');
  t.ok(!(await hint(t)).includes('confirm it'), 'no hint to confirm what is confirmed');
  t.ok((await done(t)) === 4, 'four steps done');
  t.ok((await t.step()) === '5', 'the exception is next');
  await t.press('[data-role="supplier"]');
  t.ok((await t.step()) === '5' && (await done(t)) === 4, 'the rail does not go backwards');
  await t.press('[data-role="buyer"]');
  await t.press('[data-scenario="expired"]');
  t.ok((await done(t)) === 4, 'the walked steps stay done in the exception');
  await t.press('[data-reset]');
  t.ok((await done(t)) === 0 && (await t.step()) === '1', 'Start over clears the rail');
});

await run('a payment the walkthrough doesn’t follow says so', async (t) => {
  await t.press('[data-open="cedar-11920"]');
  t.ok((await hint(t)).includes('Another payment'), `opened another payment: ${await hint(t)}`);
  await t.press('[data-role="supplier"]');
  t.ok(!(await hint(t)).includes('Larkspur'), `no Larkspur on Cedar Ridge’s notice: ${await hint(t)}`);
});

await run('Confirm match lands on the facts, not on the page', async (t) => {
  await closeLoop(t);
  t.ok((await t.active()).startsWith('wr-facts'), `focus is on the facts: ${await t.active()}`);
  t.ok(await t.page.$eval('[data-wren] .wr-facts', (f) => { const r = f.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }), 'the facts are on screen');
});

await run('on a phone the result of Confirm match is on screen, below the nav', async (t) => {
  await closeLoop(t);
  t.ok((await t.active()).startsWith('wr-facts'), `focus is on the facts: ${await t.active()}`);
  const box = await t.page.$eval('[data-wren] .wr-facts', (f) => { const r = f.getBoundingClientRect(); return { top: r.top, nav: document.querySelector('.site-nav').getBoundingClientRect().bottom }; });
  t.ok(box.top >= box.nav && box.top < 800, `the facts are visible: top ${box.top}, nav ${box.nav}`);
}, { viewport: { width: 375, height: 800 } });

await run('on a phone the match panel opens where it can be seen', async (t) => {
  await t.press('[data-open="bright-30077"]');
  await t.press('[data-review]');
  const box = await t.page.$eval('[data-wren] #wr-match', (f) => f.getBoundingClientRect().top);
  t.ok(box >= 0 && box < 800, `the panel’s top is on screen: ${box}`);
}, { viewport: { width: 375, height: 800 } });

await run('one primary at a time while a panel is open', async (t) => {
  await t.press('[data-open="bright-30077"]');
  await t.press('[data-review]');
  t.ok(!(await t.has('[data-review]')), 'Review match gives way to the panel');
  await t.press('[data-decline-match]');
  t.ok(await t.has('[data-review]'), 'Review match is back');
  await t.press('[data-scenario="expired"]');
  await t.press('[data-replace]');
  t.ok(!(await t.has('[data-replace]')), 'Review replacement options gives way to the panel');
});

await run('a match that disagrees can’t be confirmed, and leaving it says what’s next', async (t) => {
  await t.press('[data-open="bright-30077"]');
  await t.includes('for $12,040.00');
  await t.press('[data-review]');
  await t.includes('$12,400.00');
  await t.includes('$12,040.00');
  await t.includes('The amounts differ by $360.00');
  t.ok(!(await t.has('[data-confirm-match]')), 'no Confirm match');
  await t.press('[data-decline-match]');
  await t.includes('Check it with Bright Harbor Logistics');
  await t.includes('Who acts next You');
});

await run('a supplier on the phone: when to follow up, who got the notice, and sending it again', async (t) => {
  await t.press('[data-open="larkspur-20483"]');
  await t.includes('No processing event as of Nov 5, 2:05 pm');
  await t.includes('Follow up if it’s still waiting on Nov 20');
  await t.includes('What to tell them: the notice went to ar@larkspur.example on Oct 28');
  await t.press('[data-resend]');
  await t.includes('and again Nov 5, 2:06 pm');
  await t.includes('Activity, 4 events');
  t.ok(!(await t.has('[data-resend]')), 'it can’t be pressed twice');
  t.ok(await t.page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-resent')), 'focus lands on what changed');
  await t.press('[data-role="supplier"]');
  await t.press('[data-process]');
  await t.press('[data-role="buyer"]');
  const ev = await t.events();
  t.ok(ev.length === 5 && ev[3].includes('sent again') && ev[4].includes('Processed'), `the events stay in order: ${ev.join(' / ')}`);
});

await run('the list puts what needs you first, and states validity', async (t) => {
  const first = await t.page.$$eval('[data-wren] tbody tr', (r) => r.map((x) => x.getAttribute('data-row')));
  t.ok(first[0] === 'tamsin-0921' && first[1] === 'bright-30077', `expired, then ready: ${first.join(', ')}`);
  await t.includes('5 payments, 2 need you');
  await t.includes('Valid through');
  await t.includes('Nov 27');
});

await run('the facts don’t wear one check while one is open; an unfolded activity stays open', async (t) => {
  await t.press('[data-open="bright-30077"]');
  const paths = await t.page.$$eval('[data-wren] .wr-fact-head svg', (s) => s.map((x) => x.innerHTML));
  t.ok(paths.length === 2 && paths[0] !== paths[1], 'processed and ready are different marks');
  await t.press('.wr-activity summary');
  await t.press('[data-review]');
  t.ok(await t.page.$eval('[data-wren] .wr-activity', (d) => d.open), 'the activity stays open across a press');
});

await run('at a phone’s width the rows are cards with their column names, and the handoff still runs', async (t) => {
  t.ok(await t.page.$eval('[data-wren] .wr-table thead', (th) => getComputedStyle(th).position === 'absolute'), 'the table head is visually hidden');
  t.ok(await t.page.$eval('[data-wren] .wr-td-label', (l) => getComputedStyle(l).display === 'block'), 'the column names show in the cells');
  t.ok(await t.page.$eval('[data-wren] .wr-frame', (f) => f.scrollWidth <= f.clientWidth + 1), 'the window does not scroll sideways');
  await t.press('[data-open="larkspur-20483"]');
  await t.on('detail');
  await t.press('[data-role="supplier"]');
  await t.press('[data-process]');
  await t.press('[data-role="buyer"]');
  await t.includes('Ready to match to invoice');
  t.ok(await t.page.$eval('[data-wren] .wr-frame', (f) => f.scrollWidth <= f.clientWidth + 1), 'the record does not scroll sideways');
}, { viewport: { width: 375, height: 800 } });

server.close();
await browser.close();
const failed = results.filter((r) => r.failures.length);
console.log(failed.length ? `✗ wren-test: ${failed.length} of ${results.length} cases failed` : `✓ wren-test: ${results.length} cases pass`);
for (const r of results) {
  console.log(`  ${r.failures.length ? '✗' : '✓'} ${r.name}`);
  for (const f of r.failures) console.log(`      ${f}`);
}
process.exit(failed.length ? 1 : 0);
