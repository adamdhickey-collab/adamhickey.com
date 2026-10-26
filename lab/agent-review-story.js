/*
 * The Agent Review write-up. Two small jobs, each a no-op where it has
 * nothing to do. The page's head throws two switches before first paint
 * (.ship-live and .arc-live) and takes them back at DOMContentLoaded if
 * this file never ran, which it says by setting window.arcStory.
 *
 * 1. THE QUESTION in the opener, "Would you ship this?" A press marks the
 *    answer pressed (aria-pressed) and the figure answered (data-picked),
 *    and the stylesheet shows every answer's consequence and what happened
 *    (agent-review.css, "Would you ship this?"). Another press moves the
 *    mark. Still or without this file, everything is already there.
 *
 * 2. THE WIPE in Evaluate: the range sets the line between the two screens.
 *    Where the line is scrubbed by scroll (agent-review.css, a scroll-driven
 *    animation, inside @supports), the first touch of the range hands it to
 *    the reader for good.
 *
 * Nothing here scrolls the page for the reader, and nothing takes the
 * scroll over. The live switch is kept in step with the window: the wipe
 * is scrubbed only from 64rem with motion allowed.
 */
(function () {
  window.arcStory = true;
  const root = document.documentElement;
  const wide = window.matchMedia('(min-width: 64rem)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fit = () => root.classList.toggle('arc-live', 'IntersectionObserver' in window && wide.matches && !still.matches);
  wide.addEventListener('change', fit);
  still.addEventListener('change', fit);

  document.querySelectorAll('[data-ship]').forEach((ship) => {
    const buttons = [...ship.querySelectorAll('.ship-pick button')];
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        ship.dataset.picked = button.closest('[data-pick]').dataset.pick;
      });
    });
  });

  document.querySelectorAll('[data-wipe]').forEach((fig) => {
    const range = fig.querySelector('input[type="range"]');
    const frame = fig.querySelector('.arc-wipe-frame');
    if (!range || !frame) return;
    const track = fig.closest('.arc-scrub');
    const say = () => range.setAttribute('aria-valuetext', `Undo ${range.value}%, review ${100 - range.value}%`);
    const set = () => { frame.style.setProperty('--wipe', `${range.value}%`); say(); };
    /* While scroll scrubs the line, the thumb is still where it was left,
       so a key would jump the line back there. Focus and the first key
       pick the thumb up where the line is, and the key moves it on. */
    const follow = () => {
      if (!track || track.hasAttribute('data-held')) return;
      const at = parseFloat(getComputedStyle(frame).getPropertyValue('--wipe'));
      if (Number.isFinite(at)) { range.value = String(Math.round(at)); say(); }
    };
    range.addEventListener('focus', follow);
    range.addEventListener('keydown', follow);
    range.addEventListener('input', () => {
      if (track) track.setAttribute('data-held', '');
      set();
    });
    set();
  });
})();
