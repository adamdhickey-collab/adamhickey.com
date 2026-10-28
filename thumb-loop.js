/* The Agent Review clip, on the homepage's card and the lab index's entry,
   since 2026-10-28 (Adam: "use the animated version ... on the lab as well").
   It was the homepage's inline script until the lab took the same clip.

   The clip plays once, the first time it is on screen, unless the reader
   prefers reduced motion; the poster stands in otherwise. Scrolled away
   mid-clip, it waits and carries on when it comes back. Once it has ended it
   stays on the finished screen. Beside the pause, a replay starts it from the
   top whenever it is pressed (Adam: "a replay button next to the pause"). A
   press is the reader's own choice, so it plays even under reduced motion.
   The clip opens on the finished screen and clears it by START, so the page
   starts it there and, where motion is allowed, shows the cleared screen
   (data-poster-start) as the poster: it builds as it arrives, and never
   shows its finished screen only to take it away.

   Each .thumb-play wrapper holds one video and its controls, so the page
   may carry more than one. */
(function () {
  var START = 0.7;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var each = function (wrap) {
    var v = wrap.querySelector('video');
    var btn = wrap.querySelector('.thumb-toggle');
    if (!v || !btn) return;
    var seen = !('IntersectionObserver' in window);
    var choice = null; /* 'play' or 'pause' once the reader has pressed */
    var done = false;  /* it has played through once */
    var started = false;
    var play = function () {
      if (!started) { started = true; v.currentTime = START; }
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    };
    if (!mq.matches && v.dataset.posterStart) v.poster = v.dataset.posterStart;
    var apply = function () {
      var want = seen && (choice ? choice === 'play' : !mq.matches && !done);
      if (want) { if (v.paused) play(); } else if (!v.paused) v.pause();
    };
    if (!seen) {
      new IntersectionObserver(function (entries) {
        seen = entries[0].isIntersecting;
        apply();
      }, { threshold: 0.35 }).observe(v);
    }
    if (mq.addEventListener) mq.addEventListener('change', apply);
    apply();

    var pauseIcon = btn.querySelector('.thumb-toggle-pause');
    var playIcon = btn.querySelector('.thumb-toggle-play');
    var show = function (el, on) {
      if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    };
    var sync = function () {
      var playing = !v.paused;
      show(pauseIcon, playing);
      show(playIcon, !playing);
      btn.setAttribute('aria-label', playing ? 'Pause the animation' : 'Play the animation');
    };
    btn.addEventListener('click', function () {
      choice = v.paused ? 'play' : 'pause';
      if (choice === 'play') play(); else v.pause();
    });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    v.addEventListener('ended', function () { done = true; choice = null; sync(); });
    var replay = wrap.querySelector('.thumb-replay');
    if (replay) replay.addEventListener('click', function () {
      choice = 'play';
      started = true;
      v.currentTime = START;
      play();
    });
    sync();
  };
  Array.prototype.forEach.call(document.querySelectorAll('.thumb-play'), each);
})();
