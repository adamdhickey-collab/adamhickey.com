/* cockpit-slides.js -- the controls over the five screens above the cockpit.
 *
 * THE SCROLLER IS THE SLIDESHOW. The five slides are in the document side by
 * side inside an overflow-x list with scroll-snap, and that is what moves
 * between them: a trackpad, a thumb, a shift-wheel and the arrow keys all work
 * before this file loads and would still work if it never did. Everything here
 * is addition -- two arrows, five dots, a counter and a spoken position -- and
 * the markup keeps them hidden until this runs, so a reader with the script off
 * gets a scroller rather than three buttons that do nothing.
 *
 * A CLICK ON THE CUT NEIGHBOUR BRINGS IT IN. The slide showing at the right
 * edge is what says there are more, so it is the thing a reader reaches for;
 * a click on any slide other than the one on show scrolls to it, which is the
 * arrow's move from a nearer target. The classes is-prev and is-next are what
 * the stylesheet hangs the pointer and the hover badge on, and they are set
 * here rather than in markup because which slide is which changes.
 *
 * That is also why nothing here calls preventDefault on a touch or a wheel.
 * The one place it takes a key is the left and right arrow on the list itself,
 * where the native behaviour is a 40px nudge that then snaps: correct, and
 * half a beat slower than the reader expects from a row of slides.
 *
 * WHY THE ARROWS DO NOT GO disabled. Reaching the last slide with the Next
 * button focused would disable the element under the reader's own focus, and
 * the browser drops focus to the body when that happens -- the reader is at
 * the end of the slideshow and at the top of the document at once. aria-disabled
 * says the same thing to a screen reader, keeps the button in the tab order,
 * and the handler simply returns.
 *
 * WHAT IS ANNOUNCED, AND WHEN. The counter is for the eye and is aria-hidden;
 * the live region is written only when a control is used. A swipe moves the
 * scroller continuously and writing the position on every frame of it would
 * put a screen reader into a stutter of five messages per flick. The slides
 * themselves are list items, so their position is already available to anyone
 * reading through them.
 */
(() => {
  'use strict';

  const show = document.querySelector('.ck-show');
  if (!show) return;
  const track = show.querySelector('.ck-slides');
  const bar = show.querySelector('.ck-show-bar');
  const slides = Array.from(show.querySelectorAll('.ck-slide'));
  if (!track || !bar || slides.length < 2) return;

  const dots = Array.from(bar.querySelectorAll('.ck-show-dot'));
  const navs = Array.from(bar.querySelectorAll('.ck-show-nav'));
  const at = bar.querySelector('.ck-show-at');
  const live = bar.querySelector('.ck-show-live');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;

  /* The scroll offset that puts a slide where the first one starts: on the
     container's edge, which is the list's start padding. offsetLeft is
     measured against the list's padding box, which is what scrollLeft is in
     too, so the distance between two slides' offsets is the scroll between
     them, without reading either element's padding. */
  const offsetFor = (el) => el.offsetLeft - slides[0].offsetLeft;

  function go(next, spoken) {
    const i = Math.max(0, Math.min(slides.length - 1, next));
    track.scrollTo({ left: offsetFor(slides[i]), behavior: reduced.matches ? 'auto' : 'smooth' });
    /* Say it from the press rather than waiting for the observer: the scroll
       is animating, and an announcement that lands after it has finished
       reads as a response to the next thing the reader did. */
    if (spoken && live) live.textContent = dots[i] ? dots[i].getAttribute('aria-label') : '';
    mark(i);
  }

  /* The state of the controls, for a move from any source -- a press, a
     swipe, a wheel, a key. */
  function mark(i) {
    if (i === index && dots[i] && dots[i].getAttribute('aria-current') === 'true') return;
    index = i;
    dots.forEach((d, n) => {
      if (n === i) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    navs.forEach((b) => {
      const back = Number(b.dataset.dir) < 0;
      b.setAttribute('aria-disabled', String(back ? i === 0 : i === slides.length - 1));
    });
    slides.forEach((s, n) => {
      s.classList.toggle('is-prev', n < i);
      s.classList.toggle('is-next', n > i);
    });
    if (at) at.textContent = String(i + 1);
  }

  /* Which slide is the one being looked at: the one with the most of itself on
     screen. An observer rather than a scroll listener because the answer only
     changes when a slide crosses a threshold, and because it is right on load
     -- a deep link or a restored scroll position starts somewhere other than
     the first slide, and a listener would not fire until something moved. */
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) seen.set(e.target, e.intersectionRatio);
    let best = slides[0], top = -1;
    for (const s of slides) {
      const r = seen.get(s) || 0;
      if (r > top) { top = r; best = s; }
    }
    mark(slides.indexOf(best));
  }, { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] });
  slides.forEach((s) => io.observe(s));

  navs.forEach((b) => b.addEventListener('click', () => {
    if (b.getAttribute('aria-disabled') === 'true') return;
    go(index + Number(b.dataset.dir), true);
  }));
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.go), true)));
  /* The slide on show is left alone: a click on it is a click on its caption
     or its picture, not a request to move. */
  slides.forEach((s, n) => s.addEventListener('click', () => { if (n !== index) go(n, true); }));

  track.addEventListener('keydown', (e) => {
    if (e.target !== track) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    go(index + (e.key === 'ArrowRight' ? 1 : -1), true);
  });

  bar.hidden = false;
  mark(0);
})();
