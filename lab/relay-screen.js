/*
 * Relay's customer screen, working (relay-screen.css). Two pages load it:
 * the Agent Review write-up, for Evaluate's two screens, and the personal
 * essay, for the undo one in its margin. A no-op where there is no screen.
 * Until 2026-10-31 this was part of agent-review-story.js.
 *
 * Each figure's step is one word on data-step, and the stylesheet shows
 * what that step shows. A row that leaves is marked data-gone; a row still
 * selected, data-on. The words a press changes are said once more in the
 * figure's own status line, for a screen reader.
 *   undo:   selected -> archived (Undo) -> undone (Start over)
 *   review: selected -> reviewing (Cancel, Archive N) -> archived
 * Monarch Dental Group never leaves: it has an open invoice.
 */
(function () {
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
})();
