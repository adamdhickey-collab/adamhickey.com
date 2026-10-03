/* walkthrough.js -- the guided tour of one screen (see walkthrough.css).
 *
 * The hero of the Agent Review write-up is a laptop with the product's change
 * screen in it. Without this script it is exactly that, with seven numbered
 * pins on it and seven notes under it. With it, at 64rem and up and for a
 * reader who has not asked for reduced motion, the section becomes a tour:
 * the stage sticks, and scrolling through the height this script gives the
 * section moves a camera in on one part of the screen at a time, dims the
 * rest, lands that part's pin, and fades its note in beside the laptop.
 *
 * THE WHOLE THING IS ONE FUNCTION OF ONE NUMBER. t runs from 0 to T and is
 * read off the scroll position, never accumulated, so scrolling back up is
 * the same function run the other way and a reader who jumps lands on the
 * right frame. render(t) writes every moving part; nothing else writes them
 * and nothing keeps a clock. That is why there are no transitions in the
 * stylesheet and no requestAnimationFrame loop here: a frame is drawn when
 * the scroll position changes, and only then.
 *
 * THE TIMELINE, in units of one part:
 *     INTRO   the whole screen, the lead note
 *     part i  the camera moves in for MOVE of the unit, then holds
 *     OUTRO   the camera backs out to the whole screen with seven pins on it
 * A unit is UNIT of the viewport's height, 60%, so the tour is about five
 * screens of scrolling. It opened at 42% with the camera travelling for 40% of
 * that, which put a whole move between two parts inside 150px on a 900px
 * window: a notch and a half of a mouse wheel, and one notch took the zoom from
 * 1.4 to 2. That read as the page lurching, not as a camera the reader was
 * driving. A move is about 245px of scroll there now and the hold after it
 * about 300. UNIT is the one number to change if it should take more or less.
 * The camera interpolates the centre and the log of the zoom, not
 * the transform's own numbers, so a move between two far-apart parts is one
 * smooth glide and not a slide with a late zoom.
 *
 * WHERE THE PARTS ARE is in the markup, in the capture's own pixels
 * (data-rect="x y w h" on each note), because the numbers are a fact about
 * the picture and belong beside it. They were measured on the committed file,
 * img/lab/agent-review-change-run1.webp at 1440 x 1000, not on a screenshot of
 * the page: the first pins ever put on this picture landed on text because
 * they were placed from a pasted image with a different layout.
 *
 * REDUCED MOTION is a media query on this script and not a rule in the
 * stylesheet. The stylesheet's blanket stops CSS animation and transition;
 * a scrubbed scene is neither, so the contract (MOTION.md, section 5) is kept
 * here: when the query stops matching the tour is taken down, every inline
 * style this file wrote is cleared, and what is left is the static layout.
 */
(function () {
  'use strict';
  var root = document.querySelector('.wt');
  if (!root || !window.matchMedia) return;

  var sticky = root.querySelector('.wt-sticky');
  var world = root.querySelector('.wt-world');
  var img = world.querySelector('img');
  var focus = root.querySelector('.wt-focus');
  var pins = [].slice.call(root.querySelectorAll('.wt-pin'));
  var notes = [].slice.call(root.querySelectorAll('.wt-note'));
  var fills = [].slice.call(root.querySelectorAll('.wt-tick i'));
  var intro = root.querySelector('.wt-note--intro');
  var outro = root.querySelector('.wt-note--outro');
  var steps = notes.filter(function (n) { return n.hasAttribute('data-rect'); });
  var N = steps.length;
  if (!N || !sticky || !world || !img || !focus || !intro || !outro) return;

  /* The capture's own pixels. */
  var IW = +img.getAttribute('width');
  var IH = +img.getAttribute('height');
  var ZMAX = 2.1;          /* the capture is 2x, so this is still sharp */
  var UNIT = 0.6;          /* of the viewport's height: the scroll one part takes */
  var UNIT_MIN = 430;      /* px, so a short window does not shorten the scroll with it */
  var INTRO = 0.5;         /* units of scroll */
  var OUTRO = 0.9;
  var MOVE = 0.45;         /* how much of a unit the camera spends travelling */
  var OUT_MOVE = 0.45;
  var T = INTRO + N + OUTRO;

  var home = { rect: { x: 0, y: 0, w: IW, h: IH }, cx: IW / 2, cy: IH / 2, z: 1 };
  var frames = steps.map(function (n) {
    var r = n.getAttribute('data-rect').split(/\s+/).map(Number);
    var rect = { x: r[0], y: r[1], w: r[2], h: r[3] };
    /* Fit the part into 86% of the screen's width and 80% of its height, so
       there is always a margin of the dimmed screen around it. */
    var z = Math.min(ZMAX, 0.86 * IW / rect.w, 0.8 * IH / rect.h);
    return { rect: rect, cx: rect.x + rect.w / 2, cy: rect.y + rect.h / 2, z: Math.max(1, z) };
  });

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* Ease in and out, cubic: the camera starts and stops softly. */
  function ease(v) {
    v = clamp(v, 0, 1);
    return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
  }
  function mix(a, b, e) { return a + (b - a) * e; }

  var rise = 20, navH = 80, W = 0, H = 0, runway = 1;
  var live = false, queued = false;

  function cameraAt(t) {
    var from = home, to = home, e = 0, ring = 0;
    if (t >= INTRO + N) {
      from = frames[N - 1];
      e = ease((t - INTRO - N) / OUT_MOVE);
      ring = 1 - e;
    } else if (t >= INTRO) {
      var i = Math.min(N - 1, Math.floor(t - INTRO));
      from = i ? frames[i - 1] : home;
      to = frames[i];
      e = ease((t - INTRO - i) / MOVE);
      ring = i ? 1 : e;
    }
    return {
      cx: mix(from.cx, to.cx, e),
      cy: mix(from.cy, to.cy, e),
      z: Math.exp(mix(Math.log(from.z), Math.log(to.z), e)),
      x: mix(from.rect.x, to.rect.x, e),
      y: mix(from.rect.y, to.rect.y, e),
      w: mix(from.rect.w, to.rect.w, e),
      h: mix(from.rect.h, to.rect.h, e),
      ring: ring
    };
  }

  /* How present part i is: arriving with the camera, leaving in the last
     quarter of its unit. The same number drives the note and the pin's lift. */
  function presence(t, i) {
    var b = INTRO + i;
    return ease((t - b) / 0.3) * ease((b + 1 - t) / 0.25);
  }

  function place(el, p) {
    el.style.opacity = p;
    el.style.transform = 'translateY(' + ((1 - p) * rise) + 'px)';
  }

  function render(t) {
    var c = cameraAt(t);
    var z = c.z;
    var tx = clamp(W / 2 - z * (c.cx / IW) * W, W - z * W, 0);
    var ty = clamp(H / 2 - z * (c.cy / IH) * H, H - z * H, 0);
    world.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + z + ')';

    /* The spotlight: one rectangle that slides from part to part. Its ring
       and corner are drawn in screen pixels, so the zoom is cancelled. */
    focus.style.left = (c.x / IW * 100) + '%';
    focus.style.top = (c.y / IH * 100) + '%';
    focus.style.width = (c.w / IW * 100) + '%';
    focus.style.height = (c.h / IH * 100) + '%';
    focus.style.opacity = c.ring;
    focus.style.outlineWidth = (2 / z) + 'px';
    focus.style.outlineOffset = (2 / z) + 'px';
    focus.style.borderRadius = (4 / z) + 'px';

    /* Pins land as the camera arrives and stay, so the last frame is a map.
       The current one is a little larger and carries a halo while it lands. */
    var settled = ease((t - INTRO - N) / OUT_MOVE);
    pins.forEach(function (pin, i) {
      var born = ease((t - INTRO - i) / 0.3);
      var here = presence(t, i);
      var grow = 0.5 + 0.5 * born + 0.2 * here;
      /* Behind the part being looked at, a pin recedes to a trace; backing out
         to the whole screen brings all seven to full strength. */
      pin.style.opacity = born * (0.4 + 0.6 * Math.max(here, settled));
      pin.style.transform = 'translate(-50%,-50%) scale(' + (grow / z) + ')';
      pin.style.boxShadow = born < 1
        ? '0 0 0 2px var(--color-white), 0 0 0 ' + (2 + 14 * (1 - born)) + 'px var(--color-accent-ring)'
        : '';
    });

    /* The notes: the lead leaves, each part arrives and leaves, the last one
       arrives once the camera has started backing out. */
    place(intro, ease((INTRO - t) / 0.25));
    steps.forEach(function (n, i) { place(n, presence(t, i)); });
    place(outro, ease((t - INTRO - N - 0.1) / 0.35));
    fills.forEach(function (f, i) { f.style.transform = 'scaleX(' + clamp(t - INTRO - i, 0, 1) + ')'; });
  }

  function update() {
    queued = false;
    if (!live) return;
    var progress = clamp((navH - root.getBoundingClientRect().top) / runway, 0, 1);
    render(progress * T);
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  function measure() {
    var style = getComputedStyle(document.documentElement);
    navH = parseFloat(style.getPropertyValue('--nav-height')) || 80;
    rise = parseFloat(style.getPropertyValue('--motion-rise')) || 20;
    runway = Math.round(T * Math.max(UNIT_MIN, window.innerHeight * UNIT));
    root.style.height = (sticky.offsetHeight + runway) + 'px';
    W = world.offsetWidth;
    H = world.offsetHeight;
  }
  function onResize() { if (live) { measure(); update(); } }

  function enter() {
    if (live) return;
    live = true;
    root.classList.add('is-tour');
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  }
  /* Give back exactly what render() wrote and nothing else: a pin's left and
     top are in the markup and are what the static layout draws it by. */
  function clear(els, props) {
    els.forEach(function (el) { props.forEach(function (p) { el.style.removeProperty(p); }); });
  }
  function leave() {
    if (!live) return;
    live = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    root.classList.remove('is-tour');
    root.style.height = '';
    clear([world], ['transform']);
    clear([focus], ['left', 'top', 'width', 'height', 'opacity', 'outline-width', 'outline-offset', 'border-radius']);
    clear(pins, ['opacity', 'transform', 'box-shadow']);
    clear(notes, ['opacity', 'transform']);
    clear(fills, ['transform']);
  }

  var mq = window.matchMedia('(min-width: 64rem) and (prefers-reduced-motion: no-preference)');
  function sync() {
    if (mq.matches) enter();
    else leave();
  }
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);
  sync();

  /* Fonts and the picture can move the page above the tour after this runs. */
  window.addEventListener('load', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();
