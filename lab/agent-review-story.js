/*
 * The Agent Review write-up. One small job, a no-op where it has nothing
 * to do. The page's head throws a switch before first paint (.ship-live)
 * and takes it back at DOMContentLoaded if this file never ran, which it
 * says by setting window.arcStory.
 *
 * THE QUESTION in the opener, "Would you ship this?" A press marks the
 * answer pressed (aria-pressed) and the figure answered (data-picked), and
 * the stylesheet shows every answer's consequence and what happened
 * (agent-review.css, "Would you ship this?"). Another press moves the
 * mark. Still or without this file, everything is already there.
 *
 * Nothing here scrolls the page for the reader, and nothing takes the
 * scroll over.
 */
(function () {
  window.arcStory = true;

  document.querySelectorAll('[data-ship]').forEach((ship) => {
    const buttons = [...ship.querySelectorAll('.ship-pick button')];
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        ship.dataset.picked = button.closest('[data-pick]').dataset.pick;
      });
    });
  });
})();
