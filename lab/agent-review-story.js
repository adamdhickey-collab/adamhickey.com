/*
 * The Agent Review write-up. One small job, a no-op where it has nothing
 * to do. The page's head throws a switch before first paint (.ship-live)
 * and takes it back at DOMContentLoaded if this file never ran, which it
 * says by setting window.arcStory.
 *
 * THE QUESTION in the opener, "Which fix would you ship?" A press marks the
 * answer pressed (aria-pressed) and the figure answered (data-picked), and
 * the stylesheet changes the screen to match, then shows that answer's
 * consequence and what happened (agent-review.css, "Which fix would
 * you ship?"). Another press moves the mark and swaps the consequence. Still
 * or without this file, everything is already there.
 *
 * EVALUATE, A STEP AT A TIME, since 2026-11-02 (agent-review.css,
 * "Evaluate"). Six numbered steps and one Relay screen: Back, Next or a
 * step itself sets which screen shows and at what step, and the screen
 * follows. A press anywhere on the screen is Next, since 2026-11-02, so a
 * reader can press through the prototype itself. The screens are
 * relay-screen.js's, which the personal essay loads too; a press inside
 * one is stopped before it reaches that file, and its keys stay out of
 * the tab order, because Next already is the press for a keyboard.
 *
 * THE PAGE ARRIVING, since 2026-10-27 (agent-review.css, "Motion"). The
 * blocks below the opener settle into place as they come up, on
 * reveal.css's contract: marked only while still below the fold, so
 * none is ever at rest anywhere but its finished place. The rule's rail
 * draws its line the same way, armed only below the fold. And the stage crossing the middle of the
 * window is marked current, which is position rather than motion, so it
 * runs for a still reader too.
 *
 * THE STORIES, since 2026-11-07 (agent-review.css, "The story"). The step
 * crossing the window's middle marks its screen current, which is all the
 * script does; the stylesheet decides whether that holds a sticky screen or
 * changes nothing. The last step's two buttons change the batch on its screen.
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

  document.querySelectorAll('.ars-try').forEach((group) => {
    const screen = group.closest('.ars-step').nextElementSibling;
    const buttons = [...group.querySelectorAll('[data-batch]')];
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        screen.dataset.batchShown = button.dataset.batch;
      });
    });
  });

  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll('[data-story]').forEach((story) => {
    const steps = [...story.querySelectorAll(':scope > .ars-step')];
    /* The sticky cell spans every step's row (agent-review.css). */
    story.style.setProperty('--ars-rows', String(steps.length));
    /* A step with no screen after it keeps the screen before it. */
    const figFor = (step) => {
      const next = step.nextElementSibling;
      if (next && next.classList.contains('ars-fig')) return next;
      const i = steps.indexOf(step);
      return i > 0 ? figFor(steps[i - 1]) : null;
    };
    const show = (step) => {
      const current = figFor(step);
      if (!current) return;
      story.querySelectorAll(':scope > .ars-fig').forEach((fig) => {
        fig.classList.toggle('is-current', fig === current);
      });
    };
    /* One top line for every screen (agent-review.css, "The story"): the
       tallest screen sets it, and a screen with a label over it starts
       that much higher, so the screens' own tops agree. Measured on
       screens that are not current, whose rows have not folded. */
    const figs = [...story.querySelectorAll(':scope > .ars-fig')];
    const place = () => {
      let tallest = 0;
      figs.forEach((fig) => {
        const screen = fig.lastElementChild;
        const first = fig.firstElementChild;
        if (!screen || !first) return;
        const lead = screen.getBoundingClientRect().top - first.getBoundingClientRect().top;
        fig.style.setProperty('--ars-lead', `${Math.round(lead)}px`);
        if (!fig.classList.contains('is-current')) {
          tallest = Math.max(tallest, screen.getBoundingClientRect().height);
        }
      });
      if (tallest) story.style.setProperty('--ars-screen-h', `${Math.round(tallest)}px`);
      stop();
    };
    /* Where the last screen stops, since 2026-11-24 (agent-review.css, "The
       story"). The cell lets go when its foot, plus this margin, meets the
       story's end; the margin puts the screen's middle, its label and all,
       on the middle of the last step's text at that moment. Both distances
       are inside one box each, so where the page is scrolled does not
       matter. Measured on the screen the step opens with, and kept while
       the other batch shows, so that taller screen grows downward from
       the same top. */
    const last = steps[steps.length - 1];
    const lastFig = last && figFor(last);
    const opens = lastFig && lastFig.dataset.batchShown;
    const stop = () => {
      if (!lastFig || !lastFig.firstElementChild) return;
      if (lastFig.dataset.batchShown !== opens) return;
      const text = [...last.children].filter((el) => getComputedStyle(el).display !== 'none');
      if (!text.length) return;
      const textMid = (text[0].getBoundingClientRect().top + text[text.length - 1].getBoundingClientRect().bottom) / 2;
      const s = getComputedStyle(story);
      const end = story.getBoundingClientRect().bottom - parseFloat(s.paddingBottom) - parseFloat(s.borderBottomWidth);
      const box = lastFig.getBoundingClientRect();
      const mid = (lastFig.firstElementChild.getBoundingClientRect().top + lastFig.lastElementChild.getBoundingClientRect().bottom) / 2;
      const margin = Math.max(0, (end - textMid) - (box.bottom - mid));
      lastFig.style.setProperty('--ars-stop', `${Math.round(margin)}px`);
    };
    place();
    let placing = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(placing);
      placing = requestAnimationFrame(place);
    });
    /* The text's height waits on the web fonts (Inter and Crimson Text). */
    if (document.fonts) document.fonts.ready.then(place);
    /* The first screen is current at load, since 2026-11-23 (Adam: on
       arrival the card seemed to animate and then collapse). From
       2026-11-22 nothing was current until the first step reached the
       middle, so the column stood empty, and then the screen faded in and
       folded three rows in the same quarter second, before anyone had
       seen them. Now the story opens on the moment before the press,
       three of five selected, there as the card scrolls in like any
       block; the rows fold only when the next step, "The list gets
       shorter", reaches the middle, after the two screens have crossed
       (agent-review.css, "The story"). */
    show(steps[0]);
    const middle = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) show(e.target); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    steps.forEach((step) => middle.observe(step));

    /* THE PRESS, since 2026-11-23 (agent-review.css, "The press"). The
       first screen's pointer crosses to Archive as the second step comes
       up to the window's middle: its place is how far that step has come,
       so it moves at the reader's speed and scrolling back rewinds it.
       The key is under the pointer from most of the way there and held
       down for the last fifth; at the middle the step marks the archived
       screen current, which is the release. Only where the screens share
       the sticky cell; elsewhere the screen is a still picture. */
    const press = story.querySelector(':scope > .ars-fig--press');
    const pressed = story.querySelector(':scope > .ars-fig--pressed');
    const key = press && press.querySelector('.ev-key--archive');
    if (key && pressed && steps[1]) {
      const live = window.matchMedia('(min-width: 64rem) and (min-height: 44rem) and (prefers-reduced-motion: no-preference)');
      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - ((2 - 2 * t) ** 2) / 2);
      let queued = false;
      const update = () => {
        queued = false;
        const on = live.matches && story.closest('.ars-live');
        const mid = window.innerHeight / 2;
        const run = window.innerHeight * 0.45;
        const p = on ? Math.min(1, Math.max(0, (mid + run - steps[1].getBoundingClientRect().top) / run)) : 0;
        const travel = Math.min(1, p / 0.6);
        press.style.setProperty('--ars-travel', ease(travel).toFixed(3));
        key.classList.toggle('is-hover', travel > 0.9);
        key.classList.toggle('is-down', p >= 0.8);
        /* Where the key was, for the pointer the archived screen keeps. */
        const from = press.querySelector('.ev-screen').getBoundingClientRect();
        const at = key.getBoundingClientRect();
        pressed.style.setProperty('--ars-cx', `${Math.round(at.left + at.width / 2 - from.left)}px`);
        pressed.style.setProperty('--ars-cy', `${Math.round(at.top + at.height * 0.7 - from.top)}px`);
      };
      const queue = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      };
      update();
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
    }
  });

  /* THE PROGRESS LINE, since 2026-11-22 (agent-review.css, "The progress
     line"). Each question's chapter runs from its anchor to the next one's,
     the last to How it's built; the reader is at the window's middle line,
     the same line the story reads. A chapter behind the line is past, the
     one the line is in is current and fills by how far through it the line
     is, and the rest are ahead. Before the first chapter, Problem is
     current at nothing filled, which is what is coming. The bar slides out
     from under the nav once the first chapter reaches the bar. Position,
     not motion, so it runs for a still reader too. */
  const bar = document.querySelector('.arc-progress');
  if (bar) {
    const items = [...bar.querySelectorAll('li')];
    const starts = items.map((li) => document.querySelector(li.querySelector('a').hash));
    const end = document.getElementById('the-build');
    if (starts.every(Boolean) && end) {
      bar.setAttribute('data-hidden', '');
      let queued = false;
      const update = () => {
        queued = false;
        const line = window.innerHeight / 2;
        const tops = starts.map((el) => el.getBoundingClientRect().top);
        tops.push(end.getBoundingClientRect().top);
        let any = false;
        items.forEach((li, i) => {
          const span = tops[i + 1] - tops[i];
          const p = span > 0 ? Math.min(1, Math.max(0, (line - tops[i]) / span)) : 0;
          const state = p >= 1 ? 'past' : p > 0 ? 'current' : 'next';
          if (state !== 'next') any = true;
          li.style.setProperty('--p', p.toFixed(3));
          li.dataset.state = state;
          const a = li.querySelector('a');
          if (state === 'current') a.setAttribute('aria-current', 'step');
          else a.removeAttribute('aria-current');
        });
        if (!any) {
          items[0].dataset.state = 'current';
          items[0].querySelector('a').setAttribute('aria-current', 'step');
        }
        const shown = tops[0] <= bar.getBoundingClientRect().bottom;
        bar.toggleAttribute('data-hidden', !shown);
      };
      const queue = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      };
      update();
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
    }
  }

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const below = (el) => el.getBoundingClientRect().top > window.innerHeight;

  if (!still) {
    /* Arrivals: fired 4% of a window early, as reveal.js does, so the rise
       has started before the block can be seen. */
    const RISE = '.arc-head, .ar-rail,' +
      ' .ar-cycle-text, .ar-scene, div.arc-after, .arc-measure,' +
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
    document.querySelectorAll('.ar-rail').forEach((el) => {
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
