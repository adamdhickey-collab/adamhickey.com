/* The states a reader can reach that a check cannot see.
 *
 * WHAT THIS IS FOR. Every browser check in scripts/ loads a page, waits for it
 * to settle, and measures what is there. That is the whole of what they see,
 * and for twenty-seven of the twenty-eight pages it is the whole of what the
 * page is. The prototype is the exception: `prototype/dispatch-cockpit.html`
 * renders its entire interesting surface from JavaScript in response to a
 * press, so the four checks were measuring its opening screen and calling that
 * the page.
 *
 * Twelve things were never measured once. `.ck-why-form` and its radios, the
 * stored-reason note, the "assigned" tag, the moved-rank arrows, an open row
 * detail, the close-call comparison, the refused button and its caution status
 * line, the compact fleet, the assigned recommendation
 * card -- none of them exist in the DOM when the page finishes loading, so a
 * querySelector run by any of those scripts returned nothing and the scripts
 * said "✓" in good conscience. The page really did pass. It passed on a sixth
 * of itself.
 *
 * WHY A REGISTRY AND NOT A HOOK IN THE PAGE. The alternative is the page
 * exposing its own states -- a `window.__states` the checks call. That ships
 * test scaffolding to every reader to serve a script, and it puts the list of
 * what-gets-measured inside the thing being measured, which is the arrangement
 * where a state quietly stops being covered the same commit it stops working.
 * This file is curated by hand, and deliberately, exactly as the registries in
 * counts.mjs and tokens.mjs are: it is a claim about what the page can do,
 * kept somewhere a change to the page cannot silently edit.
 *
 * WHAT A STATE IS. A name, and the presses that get there from a fresh load.
 * The presses are selectors, clicked in order; the page is reloaded before
 * each state so no state inherits another's leftovers. `el.click()` rather
 * than a real mouse click, because several of these targets sit below the fold
 * of a 1000px viewport and a trusted click would scroll to find them -- which
 * is a thing this page's own behaviour is sensitive to, and not something a
 * colour check should be provoking.
 *
 * KEEP THE PRESSES SHALLOW. Every selector here is a promise that the markup
 * still has that hook. When one goes stale the state silently stops being
 * reached, which is the failure this file exists to prevent -- so `reach`
 * throws on a selector it cannot find rather than pressing on, and the check
 * that called it reports the page as unmeasurable rather than as passing.
 */

export const REACHABLE = {
  'prototype/dispatch-cockpit.html': [
    /* Switching situations at all: the comparison table, and the arrows saying
       which trucks changed rank, which only appear across a genuine switch. */
    { name: 'the close call, compared, with ranks marked as moved',
      press: ['[data-scenario="tie"]'] },

    /* The override question, open: the form, its radios, the "assigned" tag in
       the rank cell and the assigned treatment on the recommendation card. */
    { name: 'the override question, open',
      press: ['[data-scenario="override"]'] },

    /* And its far side: the form replaced by the note saying the reason is
       stored. It also used to reach the first ticked step in the situation's
       checklist, which went with that panel on 2026-09-21; the presses are
       the form's own, so the state still lands where it always did. */
    { name: 'a reason stored',
      press: ['[data-scenario="override"]', '.ck-why-form input[name="reason"]', '.ck-why-form [type="submit"]'] },

    /* A rule refusing an assignment: the only place the caution ground is
       spent, and the only disabled-looking control in the cockpit. */
    { name: 'a rule refusing an assignment',
      press: ['[data-scenario="rule"]', '[data-assign="T-114"]'] },

    /* A row opened to every figure it has. */
    { name: 'a truck opened to every figure',
      press: ['[data-scenario="confident"]', '.ck-table [data-more]'] },

    /* The dense end, which is the one a dispatch floor would actually run. */
    { name: 'the fleet at compact density',
      press: ['[data-density="compact"]'] },

    /* THE FAR SIDE OF THE PRIMARY ACTION. Not one of the six above ever
       presses Assign, so for all the states this file added, the assigned
       button itself -- "Assigned / Undo", the loudest control on the card --
       was still in no DOM any check had seen. It rendered charcoal on the
       sage fill at 2.64:1 and every run said "✓". One state, not three: the
       comparison and the open row carry the same button with the same
       classes, and a filled pill's contrast is answered by its own fill
       rather than by the ground it sits on, so measuring it once on the card
       measures the rule. What the card does not cover is the assigned tag in
       the rank cell and the row's own terse Undo, which this reaches too. */
    { name: 'the recommendation assigned, and the card offering Undo',
      press: ['.ck-card-act [data-assign]'] },
  ],
};

/* The states registered for a page, or an empty list. Separators normalised
   because the callers hand this whatever pages() gave them, which carries the
   platform's -- and a key that silently fails to match is this file quietly
   doing nothing, which is the failure it exists to prevent. */
export const reachableFor = (file) => REACHABLE[String(file).split('\\').join('/')] || [];

/* Drive a settled page into one registered state.
 *
 * Returns nothing and throws on a selector that is not there, because a state
 * that cannot be reached must not read as a state with nothing wrong in it. */
export async function reach(page, state) {
  for (const sel of state.press) {
    const found = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return false;
      el.click();
      return true;
    }, sel);
    /* Tagged, because the caller prints different advice for the two ways this
       throws. A selector that matches nothing is the registry going stale and
       wants a human. Anything else out of page.evaluate -- a closed context, a
       browser that died -- is the run failing, and telling someone to go fix a
       selector over it sends them after a bug that is not there. */
    if (!found) {
      const e = new Error(`reaching "${state.name}": nothing matches ${sel}`);
      e.unreached = true;
      throw e;
    }
    await settle(page);
  }
}

/* Wait out whatever the press started. The same question resting.mjs asks of a
 * whole page after load, asked again after each press: a colour measured on
 * its way to the answer is not the answer, and which one gets recorded would
 * otherwise depend on how fast the machine is. */
export async function settle(page) {
  await page.evaluate(async () => {
    const timing = (a) => (a.effect && a.effect.getTiming ? a.effect.getTiming() : null);
    const endless = (a) => { const t = timing(a); return !t || t.iterations === Infinity; };
    await Promise.race([
      Promise.allSettled(document.getAnimations().filter((a) => !endless(a)).map((a) => a.finished)),
      new Promise((r) => setTimeout(r, 1200)),
    ]);
  });
}
