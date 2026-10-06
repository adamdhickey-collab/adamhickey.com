/* The states a reader can reach that a check cannot see.
 *
 * WHAT THIS IS FOR. Every browser check in scripts/ loads a page, waits for it
 * to settle, and measures what is there. That is the whole of what they see,
 * and for twenty-nine of the thirty-two pages it is the whole of what the
 * page is. The two prototypes are the exception: `prototype/dispatch-cockpit.html`
 * and `prototype/deploy-console.html` render their entire interesting surface
 * from JavaScript in response to a press, so the checks would measure an
 * opening screen and call that the page. Since #401 the lab index is a third,
 * a smaller one: its three pieces are in the markup but hidden until pressed.
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
 *
 * A STATE THAT IS A MOMENT SAYS SO. Two of the console's states are a press
 * in flight, a first deploy and a rollback, and the page ends each of them
 * itself a couple of seconds later, whatever is measuring. Reaching one is
 * not the same as measuring it: states.mjs walks every rule the state gained
 * at 60ms or more an element, and by the time it got to the in-flight
 * button's hover rule the button had been replaced by the finished state's,
 * which it then measured under the moment's name. "Rolling back..." was
 * measured in 0 runs of 7. So a state like that names, in `holds`, a
 * selector that matches only while the moment lasts, and every check asks
 * `held` when it has finished measuring the state: does it still match,
 * and is it still the element that matched when the measuring began. If
 * not, the check measured something else, and it reports the page as
 * unmeasurable, exactly as it does for a press `reach` cannot find.
 *
 * HOW A MOMENT IS HELD. From this side, not the page's, for the reason a
 * registry beats a hook. The page ends the moment with setTimeout, one beat
 * per step, so a held state is measured on a page whose clock this file
 * can stop: `stage` gives it a context of its own with Playwright's clock
 * installed before the load, and `reach` stops that clock just before the
 * last press. The press renders the moment; the beat it schedules never
 * comes. A state that lands a few beats later, like the first deploy's far
 * side, is reached by running the stopped clock forward until `holds`
 * matches, and stopping it there. CSS transitions and animations are not on that clock, so the
 * press's own arrivals still finish, and so does anything a check forces.
 * It is the same moment every run, which a race could not promise: the
 * other checks were reaching the first deploy 460 to 580ms after the press,
 * either side of its first 500ms beat, so some runs measured its first step
 * under way and some its second.
 *
 * Two consequences. A held page cannot wait on its own setTimeout, so every
 * wait in here and in states.mjs's measuring pass is timed from Node. And a
 * context of its own, because installing a clock is for the life of a
 * context and pausing one carries into every page it loads after; sharing
 * would leave the next page's clock stopped before it had loaded.
 *
 * resting.mjs measures with reduced motion, and under it the console lands
 * every press at once: there is no flight to hold, and resting.mjs was
 * measuring the landed state under both in-flight names, every run. So the
 * last press of a held state is made with motion allowed, and the page goes
 * back to stillness before anything is measured.
 */

import { setTimeout as sleep } from 'node:timers/promises';

export const REACHABLE = {
  /* THE LAB INDEX, A WORKSPACE. lab/index.html shows one welcome card and
     keeps its three pieces in hidden articles that workspace.js reveals one
     at a time, so a fresh load measures a third of what the page says. A
     piece is a file link in the explorer; pressing it fills the preview, and
     the two prototypes make their frame the first time they are opened. The
     frame is a document of its own that these checks measure as the page it
     is, so what each state adds here is the article around it. */
  'lab/index.html': [
    { name: 'Agent Review open in the preview',
      press: ['.ws-file[data-piece="agent-review"]'] },

    { name: 'the deploy console open in the preview',
      press: ['.ws-file[data-piece="deploy-console"]'] },

    { name: 'the dispatch cockpit open in the preview',
      press: ['.ws-file[data-piece="dispatch-cockpit"]'] },
  ],

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

  /* THE SECOND PROTOTYPE, THE SAME SHAPE. prototype/deploy-console.html
     renders its answer zone, its plan and its table from a press, exactly as
     the cockpit does, so the same seven-state discipline applies: the three
     situations the opening screen is not, the two things inside them a
     press reveals, the far side of the primary action, and the dense end
     of the table. */
  'prototype/deploy-console.html': [
    /* The empty state that leads somewhere: the first-deploy card with its
       four facts, the map with the never-deployed node, the primary Deploy. */
    { name: 'the first deploy, before pressing',
      press: ['[data-scenario="first"]'] },

    /* And in flight: the steps list with the first step under way and
       three next, and the in-flight button, "Deploying...". The page takes
       four 500ms beats to land it, so this is a moment, and it is held:
       the clock stops before the Deploy press, and no beat ever comes. */
    { name: 'the first deploy in flight',
      press: ['[data-scenario="first"]', '[data-deploy]'],
      holds: '.dc-btn[aria-disabled="true"][data-focus="deploy"]' },

    /* THE FAR SIDE OF THE FIRST DEPLOY. The same press, four beats on: the
       card says the job is live at its first deploy, with its two figures,
       the four steps all done, and "Run it now" where Deploy was; the row
       reads live, and nothing to roll back to. Until #407 no state showed
       this on purpose -- resting.mjs measured it by accident, under the
       in-flight name, because reduced motion lands the press at once.
       Held where the Run button first appears: the clock is run forward
       to the landing and stopped there. Nothing on this screen ends by
       itself, so the hold is for the guard: held() still checks that what
       was measured is the screen that landed. */
    { name: 'the first deploy landed, offering a first run',
      press: ['[data-scenario="first"]', '[data-deploy]'],
      holds: '[data-run]' },

    /* The refusal: the failed build on the caution ground, the failed tag in
       the newest-deploy cell, and the caution-grounded status line. */
    { name: 'a build failed, the refusal',
      press: ['[data-scenario="failed"]'] },

    /* The log under it, opened: the mono list with its marked line. */
    { name: 'the build log opened',
      press: ['[data-scenario="failed"]', '.dc-log-fold summary'] },

    /* The reading: the white card with the dark edge on the alternate
       ground, the figures beside their befores in the caution ink, the
       dependency strip with a failing chip, and the failing health cells. */
    { name: 'live, but failing: the reading',
      press: ['[data-scenario="degraded"]'] },

    /* The plan, open: every service a row, two changing and four staying. */
    { name: 'the rollback previewed',
      press: ['[data-scenario="degraded"]', '.dc-read [data-plan]'] },

    /* THE OTHER ENVIRONMENT. Staging on the failing situation: the same
       commit serving at the figures production had before, and the aside
       naming what differs. The switch is a pressed state of its own. */
    { name: 'staging, where the same commit is fine',
      press: ['[data-scenario="degraded"]', '[data-envmenu]', '[data-env="staging"]'] },

    /* THE MENU ITSELF, OPEN. The environment crumb in the header opens a
       menu with the current environment checked; the menu is in no DOM a
       fresh load has, so it is a state of its own. */
    { name: 'the environment menu open',
      press: ['[data-envmenu]'] },

    /* The table and the feed filtered to one kind of resource. */
    { name: 'the services alone, in the table and the feed',
      press: ['[data-kind="service"]'] },

    /* THE PRESS ITSELF, IN FLIGHT. Pressing the plan's button starts a
       sequence: api takes a building deploy and reads "redeploying", lands
       about a second later, then worker does the same, and the in-flight
       buttons become Undo. What is measured is api building and worker
       waiting: the building tag, the redeploying word, the in-flight
       button with aria-disabled and the "Rolling back" zone. This comment
       used to say the moment was long enough to be the same one every run.
       It was long enough to reach and not to measure: states.mjs finished
       measuring this state about six seconds after the press, and in 7
       runs of 7 it had measured "Undo: redeploy a3f9c1e" where the
       in-flight button had been. Held now, like the first deploy above. */
    { name: 'a rollback in flight, the first service redeploying',
      press: ['[data-scenario="degraded"]', '.dc-read [data-plan]', '.dc-plan-form [type="submit"]'],
      holds: '.dc-btn[aria-disabled="true"][data-focus^="roll:"]' },

    /* THE FAR SIDE OF THE PRIMARY ACTION. The rolled-back card with the
       record on it, the recovered note under it (a staged rollback lands
       on the watched state), Undo where Roll back was, the rolled ground
       and tag on two rows, and the health cells read from the figures. */
    { name: 'rolled back, and the card offering Undo',
      press: ['[data-scenario="rolled"]'] },

    /* A row opened to its deploy history, with a failed deploy in it. */
    { name: 'a service opened to its history',
      press: ['.dc-table [data-more="api"]'] },

    /* The dense end, which is the one a team would actually run. */
    { name: 'the services at compact density',
      press: ['[data-density="compact"]'] },
  ],
};

/* The page to measure a state on. Most states are measured on the page the
 * check shares across every load. A state that holds a moment gets a page of
 * its own, in a context of its own made by the check's own recipe, so it
 * measures under the same conditions as the rest, with the clock installed
 * before anything loads. `held` lets it go. */
const clocked = new WeakSet();
const moment = new WeakMap();
const STEP = 100;      /* ms of the page's time per step toward a held state */
const LIMIT = 30000;   /* and how far it may run before the state counts as unreached */
export async function stage(shared, state, context) {
  if (!state || !state.holds) return shared;
  const ctx = await context();
  await ctx.clock.install();
  const page = await ctx.newPage();
  clocked.add(page);
  return page;
}

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
  /* A held state pressed on a page with no clock would pause the clock of
     the context every other page shares (pauseAt installs one if there is
     none), and every page after it would load stopped. */
  if (state.holds && !clocked.has(page)) {
    throw new Error(`reaching "${state.name}": it holds a moment, and only a page from stage() can hold one`);
  }
  const last = state.press.length - 1;
  for (const [i, sel] of state.press.entries()) {
    /* THE CLOCK STOPS BEFORE THE PRESS THAT OPENS THE MOMENT, not after it.
       Stopped after, what is held is wherever the beats had got to by the
       time this returned, which is a different step on a slower machine.
       pauseAt() wants a time that is not in the page's past, and the
       page's clock was installed from this machine's, so a second ahead is
       always ahead: whatever the page already had due in that second
       fires on the way, as it would have during the settle anyway. */
    let still = false;
    if (state.holds && i === last) {
      await page.clock.pauseAt(Date.now() + 1000);
      still = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (still) await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
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
    /* A HELD STATE IS THE FIRST MOMENT, AT OR AFTER THE LAST PRESS, IN WHICH
       `holds` MATCHES. The in-flight states are there the instant the press
       renders, so this runs no time at all for them. The landed first deploy
       is four beats later, so the stopped clock is run forward a step at a
       time until it matches, and stops again there. It is the page's time
       being run, not this machine's: the same step every run, and no real
       second spent waiting. A step is small next to any beat the page
       keeps, so it cannot carry the page past one moment into the next. */
    if (state.holds && i === last) {
      for (let t = 0; !(await page.evaluate((s) => !!document.querySelector(s), state.holds)); t += STEP) {
        if (t >= LIMIT) {
          const e = new Error(`reaching "${state.name}": nothing matches ${state.holds} within ${LIMIT / 1000}s of the page's time after the last press`);
          e.unreached = true;
          throw e;
        }
        await page.clock.runFor(STEP);
      }
    }
    await settle(page);
    if (still) await page.emulateMedia({ reducedMotion: 'reduce' });
  }
  /* What the moment is as the measuring begins: the element itself, not
     the selector, so held() can tell a moment that lasted from one the page
     rebuilt halfway through and that only matches again. */
  if (state.holds) moment.set(page, await page.$(state.holds));
}

/* Is the moment still there now that the measuring is done, and is it the
 * same one? Two ways to lose it, both seen on the console: the page ends it
 * (the rollback's buttons became Undo), or the page rebuilds it, which
 * render() does on every beat, so the element a rule was measuring is
 * detached halfway and its replacement matches the selector as if nothing
 * happened. Asked only of a state that names `holds`, and tagged like
 * reach()'s throw, because the advice differs: an unreached state wants its
 * selector fixed, an ended one wants its moment held. Either way it closes
 * the page stage() opened. */
export async function held(page, state) {
  if (!state || !state.holds) return;
  try {
    const now = await page.evaluate(([was, s]) => ({
      matches: !!document.querySelector(s),
      same: !!was && was.isConnected && was.matches(s),
    }), [moment.get(page) || null, state.holds]);
    if (now.same) return;
    const e = new Error(now.matches
      ? `measuring "${state.name}": the page rebuilt the moment while it was being measured, so ${state.holds} matches an element that was not there when the measuring began`
      : `measuring "${state.name}": the moment ended before the measuring did, and nothing matches ${state.holds}`);
    e.ended = true;
    throw e;
  } finally {
    if (clocked.has(page)) await page.context().close();
  }
}

/* What to tell a person when a state could not be measured, by the way it
 * failed. Six checks print it, so it is said once, here. */
export function advice(e) {
  if (e.unreached) return [
    'A state in scripts/lib/reachable.mjs no longer reaches anything.',
    'Fix the selector or retire the state; do not leave it unreached.',
  ];
  if (e.ended) return [
    'A state in scripts/lib/reachable.mjs is a moment, and it did not hold while',
    'this check measured it, so what got measured was something else. Moments',
    'are held by stopping the page\'s clock (stage() and reach() in that file);',
    'one that still ends is ended by something that clock does not stop.',
  ];
  return [];
}

/* Wait out whatever the press started. The same question resting.mjs asks of a
 * whole page after load, asked again after each press: a colour measured on
 * its way to the answer is not the answer, and which one gets recorded would
 * otherwise depend on how fast the machine is.
 *
 * Capped from here rather than by a timer in the page, because on a held
 * page that timer would never fire, and an animation that never finishes
 * would then hold the run forever. A wait the cap abandons is rejected
 * when the page navigates away; nothing is listening for it by then. */
export async function settle(page) {
  const finished = page.evaluate(async () => {
    const timing = (a) => (a.effect && a.effect.getTiming ? a.effect.getTiming() : null);
    const endless = (a) => { const t = timing(a); return !t || t.iterations === Infinity; };
    await Promise.allSettled(document.getAnimations().filter((a) => !endless(a)).map((a) => a.finished));
  });
  finished.catch(() => {});
  await Promise.race([finished, sleep(1200)]);
}
