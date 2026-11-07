/*
 * The After Send write-up's small jobs. wren.js is the prototype; this is the
 * page around it. The head throws .as-live before first paint and takes it
 * back if this file never ran, which it says by setting window.asStory.
 *
 * THE TWO RECORDS' ANSWERS wait for a press, because the section asks the
 * reader to try answering first. Still or without this file they are there.
 *
 * THE STORY says which moment is current and nothing else. Each beat is a
 * moment; the one crossing the middle of the window is the current one, going
 * either way. The scroll is never taken or scrubbed. CSS decides whether the
 * held figure or a beat's own copy shows, so a window changing size needs
 * nothing from here. Every copy is built once, each painted at its own moment,
 * which is the whole of the phone, reduced-motion, and short-window story.
 *
 * A "moment" is a beat's number. An element's data-on lists the moments it
 * belongs to, and "7:supplier" is moment 7 with the supplier's view on.
 */
(function () {
  window.asStory = true;

  document.querySelectorAll('[data-show-answers]').forEach((button) => {
    button.addEventListener('click', () => {
      button.parentElement.setAttribute('data-shown', '');
    });
  });

  let view = 'buyer';

  const paint = (stage, moment) => {
    stage.dataset.moment = moment;
    stage.querySelectorAll('[data-on]').forEach((el) => {
      const on = el.dataset.on.split(' ');
      el.classList.toggle('is-on', on.includes(moment) || on.includes(moment + ':' + view));
    });
  };

  document.querySelectorAll('[data-as-story]').forEach((story) => {
    const stage = story.querySelector(':scope > .as-stage');
    const beats = story.querySelectorAll('.as-beat');

    beats.forEach((beat) => {
      const still = stage.cloneNode(true);
      paint(still, beat.dataset.moment);
      beat.appendChild(still);
    });
    paint(stage, stage.dataset.moment);

    if (!('IntersectionObserver' in window)) return;
    const current = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) paint(stage, e.target.dataset.moment);
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    beats.forEach((beat) => current.observe(beat));
  });

  /* The third decision's switch. It sits in the text, and pressing it from
     anywhere brings the held figure to that moment. */
  document.querySelectorAll('[data-as-view]').forEach((button) => {
    button.addEventListener('click', () => {
      view = view === 'buyer' ? 'supplier' : 'buyer';
      button.setAttribute('aria-pressed', String(view === 'supplier'));
      button.textContent = view === 'supplier' ? 'See what the buyer sees' : 'See what the supplier sees';
      const beat = button.closest('.as-beat');
      paint(beat.querySelector(':scope > .as-stage'), beat.dataset.moment);
      paint(beat.closest('[data-as-story]').querySelector(':scope > .as-stage'), beat.dataset.moment);
    });
  });
})();
