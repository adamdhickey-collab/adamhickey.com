/*
 * The Agent Review write-up. One small job, a no-op where it has nothing
 * to do. The page's head throws a switch before first paint (.ship-live)
 * and takes it back at DOMContentLoaded if this file never ran, which it
 * says by setting window.arcStory.
 *
 * THE QUESTION in the opener, "Would you ship this?" A press marks the
 * answer pressed (aria-pressed) and the figure answered (data-picked), and
 * the stylesheet changes the screen to match, then shows that answer's
 * consequence and what happened (agent-review.css, "Would you ship
 * this?"). Another press moves the mark and swaps the consequence. Still
 * or without this file, everything is already there.
 *
 * EVALUATE, A STEP AT A TIME, since 2026-11-02 (agent-review.css,
 * "Evaluate"). Six numbered steps and one Relay screen: Back, Next or a
 * step itself sets which screen shows and at what step, and the screen
 * follows. The screens are relay-screen.js's, which the personal essay
 * loads too; here they are pictures, so a press inside one is stopped
 * before it reaches that file and its keys are out of the tab order.
 *
 * THE PAGE ARRIVING, since 2026-10-27 (agent-review.css, "Motion"). The
 * blocks below the opener settle into place as they come up, on
 * reveal.css's contract: marked only while still below the fold, so
 * none is ever at rest anywhere but its finished place. The rule's rail
 * draws its line and the three kinds draw their marks the same way,
 * armed only below the fold. And the stage crossing the middle of the
 * window is marked current, which is position rather than motion, so it
 * runs for a still reader too.
 *
 * Nothing here scrolls the page for the reader, and nothing takes the
 * scroll over.
 */
(function () {
  window.arcStory = true;

  document.querySelectorAll('[data-ship]').forEach((ship) => {
    const buttons = [...ship.querySelectorAll('.ship-pick')];
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        ship.dataset.picked = button.dataset.pick;
      });
    });
  });

  /* Each step is a screen and its step, in the list's order. A row is
     selected before the press, folded when archived (all but Monarch,
     which has an open invoice), and back, unselected, when restored. */
  const SCREENS = [['review', 'selected'], ['review', 'reviewing'], ['review', 'archived'],
    ['undo', 'selected'], ['undo', 'archived'], ['undo', 'undone']];
  document.querySelectorAll('[data-ev-walk]').forEach((walk) => {
    const steps = [...walk.querySelectorAll('.ev-walk-step')];
    const back = walk.querySelector('[data-go="back"]');
    const next = walk.querySelector('[data-go="next"]');
    const said = walk.querySelector('[data-walk-said]');
    const stage = walk.querySelector('.ev-walk-stage');
    const figs = [...stage.querySelectorAll('[data-ev]')];
    stage.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
    stage.querySelectorAll('button, input').forEach((el) => {
      el.tabIndex = -1;
      el.setAttribute('aria-disabled', 'true');
    });
    let at = 0;
    const go = (i) => {
      at = (i + steps.length) % steps.length;
      const [ev, step] = SCREENS[at];
      figs.forEach((fig) => { fig.hidden = fig.dataset.ev !== ev; });
      const fig = figs.find((f) => f.dataset.ev === ev);
      fig.dataset.step = step;
      fig.querySelectorAll('.ev-row').forEach((row) => {
        row.toggleAttribute('data-on', step === 'selected' || step === 'reviewing');
        row.toggleAttribute('data-gone', step === 'archived' && row.dataset.id !== 'monarch');
      });
      steps.forEach((s, j) => {
        if (j === at) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
      });
      back.disabled = at === 0;
      walk.toggleAttribute('data-last', at === steps.length - 1);
    };
    walk.addEventListener('click', (e) => {
      const button = e.target.closest('[data-go]');
      if (!button) return;
      const to = button.dataset.go;
      go(to === 'back' ? at - 1 : to === 'next' ? at + 1 : Number(to) - 1);
      if (to === 'back' && at === 0) next.focus();
      said.textContent = `Step ${at + 1} of ${steps.length}: ${steps[at].lastElementChild.textContent}`;
    });
    go(0);
  });

  if (!('IntersectionObserver' in window)) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const below = (el) => el.getBoundingClientRect().top > window.innerHeight;

  if (!still) {
    /* Arrivals: fired 4% of a window early, as reveal.js does, so the rise
       has started before the block can be seen. */
    const RISE = '.arc-head, .ar-kind, .ar-rail, .ar-ticket, .ar-ticket footer,' +
      ' .ar-cycle-text, .ar-scene, .ev-walk, div.arc-after, .arc-measure,' +
      ' .glance, .case-wide > p';
    const rise = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        rise.unobserve(e.target);
        e.target.setAttribute('data-shown', '');
      });
    }, { rootMargin: '0px 0px 4% 0px' });
    document.querySelectorAll('.build-chapter:not(.arc-ship)').forEach((chapter) => {
      chapter.querySelectorAll(RISE).forEach((el) => {
        if (!below(el)) return;
        el.setAttribute('data-rise', '');
        rise.observe(el);
      });
    });

    /* Drawings: armed below the fold, drawn once a good part is in view,
       so the line is seen describing itself. */
    const draw = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        draw.unobserve(e.target);
        e.target.classList.add('is-drawn');
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.ar-rail, .ar-kinds').forEach((el) => {
      if (!below(el)) return;
      el.classList.add('is-armed');
      draw.observe(el);
    });
  }

  /* The current stage: the one crossing the window's middle line. It stays
     current through the gap to the next, and the mark goes when the whole
     cycle has left the window. */
  const cycle = document.querySelector('.ar-cycle');
  if (cycle) {
    let current = null;
    const mark = (li) => {
      if (li === current) return;
      if (current) current.classList.remove('is-current');
      current = li;
      if (li) li.classList.add('is-current');
    };
    const middle = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) mark(e.target); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    [...cycle.children].forEach((li) => middle.observe(li));
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) mark(null); }).observe(cycle);
  }
})();
