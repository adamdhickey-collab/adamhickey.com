/*
 * The Agent Review write-up as a story you scroll (since 2026-10-25). Three
 * small jobs, each a no-op where it has nothing to do:
 *
 * 1. THE STAGE RAIL marks the chapter in the middle of the window, so the six
 *    stages say where the reader is. Links to the chapters work without it.
 *
 * 2. THE PINNED EXPLORE. On a wide screen with motion allowed, the three
 *    directions' screens are held still beside the steps (.ar-pin.is-pinned),
 *    and the screen shown is the step in the middle of the window. The links
 *    under the stage go to each step, and show its screen at once. Narrow, or
 *    with reduced motion, nothing is pinned: each step keeps its own picture,
 *    stacked, which is also what the page is without this file.
 *
 * 3. THE WIPE in the decision: the range input sets how much of the second
 *    screen covers the first. Without this file the two sit half and half.
 *
 * Nothing here scrolls the page for the reader, and nothing animates that the
 * site's reduced-motion rule doesn't already stop (MOTION.md, section 5).
 */
(function () {
  const canWatch = 'IntersectionObserver' in window;
  const middle = { rootMargin: '-45% 0px -50% 0px' };

  const rail = document.querySelector('.ar-stages');
  if (rail && canWatch) {
    const links = [...rail.querySelectorAll('a[href^="#"]')];
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        byId.get(e.target.id)?.setAttribute('aria-current', 'step');
      });
    }, middle);
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  const pin = document.querySelector('[data-pin]');
  if (pin) {
    const steps = [...pin.querySelectorAll('[data-pin-step]')];
    const shots = [...pin.querySelectorAll('[data-pin-shot]')];
    const gos = [...pin.querySelectorAll('[data-pin-go]')];
    const wide = window.matchMedia('(min-width: 64rem)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const show = (i) => {
      if (i < 0) return;
      shots.forEach((s, k) => s.toggleAttribute('data-on', k === i));
      gos.forEach((g, k) => (k === i ? g.setAttribute('aria-current', 'step') : g.removeAttribute('aria-current')));
    };
    const fit = () => pin.classList.toggle('is-pinned', wide.matches && !still.matches);
    fit();
    wide.addEventListener('change', fit);
    still.addEventListener('change', fit);
    show(0);
    if (canWatch) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) show(steps.indexOf(e.target));
        });
      }, middle);
      steps.forEach((s) => io.observe(s));
    }
    gos.forEach((g, i) => g.addEventListener('click', () => show(i)));
  }

  document.querySelectorAll('[data-wipe]').forEach((fig) => {
    const range = fig.querySelector('input[type="range"]');
    const frame = fig.querySelector('.ar-wipe-frame');
    if (!range || !frame) return;
    const set = () => frame.style.setProperty('--wipe', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  });
})();
