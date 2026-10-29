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
 * EVALUATE'S TWO SCREENS, since 2026-10-29: the agent's review and the
 * designer's undo, each pressed through a step at a time (below, and
 * agent-review.css, "Evaluate").
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

  /* EVALUATE'S TWO SCREENS, both working. Each figure's step is one word
     on data-step, and the stylesheet shows what that step shows
     (agent-review.css, "Evaluate"). A row that leaves is marked data-gone;
     a row still selected, data-on. The words a press changes are said
     once more in the figure's own status line, for a screen reader.
       undo:   selected -> archived (Undo) -> undone (Start over)
       review: selected -> reviewing (Cancel, Archive N) -> archived
     Monarch Dental Group never leaves: it has an open invoice. */
  const plural = (n) => `${n} customer${n === 1 ? '' : 's'}`;
  document.querySelectorAll('[data-ev]').forEach((fig) => {
    const rows = [...fig.querySelectorAll('.ev-row')];
    const keeps = [...fig.querySelectorAll('[data-keep]')];
    const said = fig.querySelector('[data-said]');
    const going = () => rows.filter((r) => r.dataset.id !== 'monarch' &&
      !keeps.some((k) => k.dataset.keep === r.dataset.id && !k.checked));
    const count = () => {
      const n = going().length;
      fig.querySelectorAll('.ev-going, .ev-gone-count').forEach((el) => { el.textContent = plural(n); });
    };
    const show = (step, focus, words) => {
      fig.dataset.step = step;
      if (words) said.textContent = words;
      const next = fig.querySelector(`[data-press="${focus}"]`);
      if (next) next.focus({ preventScroll: true });
    };
    const reset = () => {
      rows.forEach((r) => { r.setAttribute('data-on', ''); r.removeAttribute('data-gone'); });
      keeps.forEach((k) => { k.checked = true; });
      count();
    };
    const archive = () => {
      const out = going();
      rows.forEach((r) => r.removeAttribute('data-on'));
      out.forEach((r) => r.setAttribute('data-gone', ''));
      return `${plural(out.length)} archived. Monarch Dental Group wasn’t: it has an open invoice.`;
    };
    keeps.forEach((k) => k.addEventListener('change', count));
    fig.addEventListener('click', (e) => {
      const button = e.target.closest('[data-press]');
      if (!button) return;
      const press = button.dataset.press;
      if (press === 'review') show('reviewing', 'archive', 'Review 5 customers before archiving.');
      else if (press === 'cancel') show('selected', 'review', 'Review closed.');
      else if (press === 'archive') {
        const words = archive();
        if (fig.dataset.ev === 'undo') show('archived', 'undo', words);
        else show('archived', 'again', words);
      } else if (press === 'undo') {
        rows.forEach((r) => r.removeAttribute('data-gone'));
        show('undone', 'again', '4 customers back in the table.');
      } else if (press === 'again') {
        reset();
        show('selected', fig.dataset.ev === 'undo' ? 'archive' : 'review', '5 customers selected.');
      }
    });
  });

  if (!('IntersectionObserver' in window)) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const below = (el) => el.getBoundingClientRect().top > window.innerHeight;

  if (!still) {
    /* Arrivals: fired 4% of a window early, as reveal.js does, so the rise
       has started before the block can be seen. */
    const RISE = '.arc-head, .ar-kind, .ar-rail, .ar-ticket, .ar-ticket footer,' +
      ' .ar-cycle-text, .ar-scene, .arc-pair > figure, div.arc-after, .arc-measure,' +
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
