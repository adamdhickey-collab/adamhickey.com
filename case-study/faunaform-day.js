/* faunaform-day.js -- the Faunaform day's motion: when it is drawn, when it
 * breathes, and the button that stops it. faunaform-day.css is the drawing;
 * without this file the day is simply shown drawn and breathing, and with
 * reduced motion it is drawn and still either way.
 *
 * - The opening plays once, when the figure is first a third in view: on
 *   load the day is armed (undrawn, held), and it draws itself as it comes
 *   on screen, so a reader who scrolls to it sees it happen.
 * - Off screen it holds its breath (.is-still); the opening runs on to its
 *   end first, so it never sits half drawn.
 * - The pause button stops everything (WCAG 2.2.2), and the choice is
 *   remembered on this device. Paused during the opening, the day is shown
 *   drawn at once. Its name stays "Pause the motion" and aria-pressed says
 *   whether it is paused; the icon shows what a press will do.
 */
(function () {
  'use strict';
  var KEY = 'faunaform-day-paused';
  var moving = window.matchMedia('(prefers-reduced-motion: no-preference)');

  function remembered() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember(paused) {
    try {
      if (paused) localStorage.setItem(KEY, '1');
      else localStorage.removeItem(KEY);
    } catch (e) { /* private mode: not remembered */ }
  }

  document.querySelectorAll('[data-ffd]').forEach(function (day) {
    var button = day.querySelector('[data-ffd-pause]');
    var timer = 0;

    function finish() {
      clearTimeout(timer);
      day.classList.remove('is-armed', 'is-drawing');
    }
    function draw() {
      if (!day.classList.contains('is-armed')) return;
      day.classList.remove('is-armed');
      /* --ffd-intro-end is registered as a <time>, so it reads back as one. */
      var end = getComputedStyle(day).getPropertyValue('--ffd-intro-end').trim();
      var ms = /ms$/.test(end) ? parseFloat(end) : parseFloat(end) * 1000;
      timer = setTimeout(finish, ms || 3500);
    }
    function setPaused(paused) {
      day.classList.toggle('is-paused', paused);
      if (paused) finish();
      if (button) button.setAttribute('aria-pressed', String(paused));
    }

    var paused = remembered();
    setPaused(paused);
    if (button) {
      button.hidden = false;
      button.addEventListener('click', function () {
        var next = button.getAttribute('aria-pressed') !== 'true';
        setPaused(next);
        remember(next);
      });
    }

    if (moving.matches && !paused) day.classList.add('is-armed', 'is-drawing');

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        day.classList.toggle('is-still', !entry.isIntersecting);
        var seen = entry.intersectionRatio >= 0.35 ||
          (entry.rootBounds && entry.intersectionRect.height >= entry.rootBounds.height * 0.35);
        if (entry.isIntersecting && seen) draw();
      }, { threshold: [0, 0.35] }).observe(day);
    } else {
      draw();
    }

    /* Asked for stillness mid-way: the stylesheet stops the motion; this
       makes sure nothing is left waiting undrawn. */
    var still = function () { if (!moving.matches) finish(); };
    if (moving.addEventListener) moving.addEventListener('change', still);
    else if (moving.addListener) moving.addListener(still);
  });
})();
