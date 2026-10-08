/* walkthrough.js -- the guided tour of one screen (see walkthrough.css).
 *
 * The hero of the Agent Review write-up is a tablet with the product's screen
 * in it. Without this script it is exactly that, with numbered pins on it and
 * the steps listed under it. With it, at 64rem and up and for a reader who
 * has not asked for reduced motion, the section becomes a tour: the panel
 * sticks, and scrolling through the height this script gives the section
 * opens one step at a time. Each step moves a camera in on one part of the
 * screen, dims the rest, lands that part's pin and opens the step's words in
 * the list beside it.
 *
 * SCROLLING CHOOSES, A MOVE PLAYS, since 2026-10-08. The scroll is divided
 * into one stretch per step, and the stretch the reader is in says which
 * step is open. Crossing into the next stretch starts one move on its own
 * clock, a step arriving (--motion-enter) plus the time the eye needs to
 * follow a picture across a screen (--motion-state), 700ms, the pace a
 * press was given on 2026-10-06. So nothing is ever drawn halfway between
 * two steps, and nothing needs to pull the page onto a step when the reader
 * stops: the page goes exactly where the hand puts it. Until then every
 * moving part was a function of the scroll position (scrubbed), and from
 * #448 the page glided to the nearer step whenever a scroll ended inside a
 * move, which a wheel met as the page jumping 400px on its own a notch
 * after it was turned.
 *
 * One thing still tracks the scroll itself: the fill of the line down the
 * list, which creeps from the open step's disc toward the next one as the
 * reader scrolls and arrives as the next step opens, so the stretch between
 * two steps shows the hand doing something. A step's stretch is UNIT of the
 * window's height, the lead's INTRO of that, so the tour is about three and
 * a half screens of scrolling where it was five.
 *
 * ONE WAY DOWN, since 2026-10-08. The seven steps are in the order their
 * parts sit on the screen, top to bottom, so the camera only ever travels
 * down while the page does, and the line fills down with them. Until then
 * the story's order put the completed work, at the foot of the screen,
 * second, and the camera ran 925px down the picture and back up between
 * two steps.
 *
 * THE BUTTONS AND THE LIST move the scroll and nothing else. A press sets
 * the step it asked for, starts its move, and puts the page at the top of
 * that step's stretch in one jump, which a reader cannot see because the
 * panel is stuck and nothing else is on the screen. So pressing and
 * scrolling are one state, and a reader can mix them freely. A press from
 * above the panel, before it sticks, scrolls the page smoothly to it and
 * lets the scroll open the step on the way.
 *
 * WHERE THE PARTS ARE is in the markup, in the capture's own pixels
 * (data-rect="x y w h" on each step), because the numbers are a fact about
 * the picture and belong beside it. They are measured on the screen the
 * capture is taken of, at the capture's size, never on a screenshot of the
 * page. The pictures are three scenes, full captures of one page in three
 * states (.wt-scene), stacked and sharing their pixels; a step names its
 * scene with data-scene, one that names none is on the first, and where a
 * move changes scene the next one dissolves in during the move.
 *
 * REDUCED MOTION is a media query on this script and not a rule in the
 * stylesheet: when the query stops matching, the tour is taken down, every
 * inline style this file wrote is cleared, and what is left is the static
 * layout (MOTION.md, section 5).
 */
(function () {
  'use strict';
  var root = document.querySelector('.wt');
  if (!root || !window.matchMedia) return;

  var sticky = root.querySelector('.wt-sticky');
  var head = root.querySelector('.wt-head');
  var stage = root.querySelector('.wt-stage');
  var screen = root.querySelector('.wt-screen');
  var world = root.querySelector('.wt-world');
  var img = world && world.querySelector('img');
  var focus = root.querySelector('.wt-focus');
  var pins = [].slice.call(root.querySelectorAll('.wt-pin'));
  var intro = root.querySelector('.wt-note--intro');
  var steps = [].slice.call(root.querySelectorAll('.wt-note[data-rect]'));
  var lines = steps.map(function (n) { return n.querySelector('.wt-line i'); });
  var jumps = steps.map(function (n) { return n.querySelector('.wt-jump'); });
  var prev = root.querySelector('.wt-step--prev');
  var next = root.querySelector('.wt-step--next');
  var status = root.querySelector('.wt-status');
  var side = root.querySelector('.wt-side');
  var nav = root.querySelector('.wt-nav');
  var list = root.querySelector('.wt-steps');
  var N = steps.length;
  if (!N || !sticky || !stage || !side || !nav || !list || !screen || !world || !img || !focus || !intro) return;

  /* The scenes, in document order, which is drawing order. */
  var scenes = [].slice.call(world.querySelectorAll('.wt-scene'));
  var names = scenes.map(function (el) { return el.getAttribute('data-scene'); });
  function sceneOf(el) { return Math.max(0, names.indexOf(el.getAttribute('data-scene'))); }
  /* The full-size link follows the scene in view while the tour runs, and is
     given back as it was when the tour stops. */
  var zoom = root.querySelector('.ar-zoom--tour');
  var zoomHref = zoom ? zoom.getAttribute('href') : null;

  /* The capture's own pixels. The screen is a window onto the picture, FH
     of it tall (data-fold), and the camera travels the picture under it. */
  var IW = +img.getAttribute('width');
  var IH = +img.getAttribute('height');
  var FH = Math.min(IH, +screen.getAttribute('data-fold') || IH);
  var ZMAX = 2.1;          /* the capture is 2x, so this is still sharp */
  var LEAD = 40;           /* capture px: the room the camera leaves left of a part, for its pin */
  var UNIT = 0.45;         /* of the window's height: the scroll one step takes */
  var UNIT_MIN = 360;      /* px, so a short window does not shorten the scroll with it */
  var INTRO = 0.6;         /* units: the lead's stretch, before the first step */
  var GIVE = 0.06;         /* of a stretch: how far past a boundary the scroll goes before the step changes, either way */

  /* A centre the window cannot reach at zoom z without showing past the
     picture's edge is held at the nearest one it can, so a move is aimed
     where the camera will actually be. */
  function held(f) {
    f.cx = clamp(f.cx, IW / (2 * f.z), IW - IW / (2 * f.z));
    f.cy = clamp(f.cy, FH / (2 * f.z), IH - FH / (2 * f.z));
    return f;
  }
  function rectOf(attr) {
    var r = attr.split(/\s+/).map(Number);
    return { x: r[0], y: r[1], w: r[2], h: r[3] };
  }
  /* Each part fills 86% of the screen's width or 80% of its height, so there
     is always a margin of the dimmed screen round it; the camera aims LEAD/2
     left of the part's centre, for the pin standing outside its left edge. */
  var home = { rect: { x: 0, y: 0, w: IW, h: FH }, cx: IW / 2, cy: FH / 2, z: 1, scene: sceneOf(intro) };
  var frames = [home].concat(steps.map(function (n) {
    var rect = rectOf(n.getAttribute('data-rect'));
    var z = Math.min(ZMAX, 0.86 * IW / rect.w, 0.8 * FH / rect.h);
    return held({ rect: rect, cx: rect.x + rect.w / 2 - LEAD / 2, cy: rect.y + rect.h / 2, z: Math.max(1, z), scene: sceneOf(n) });
  }));

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, e) { return a + (b - a) * e; }

  /* THE CURVE IS --ease, read from the root and solved here, because a move
     drawn by a script is still a move and MOTION.md writes no curve twice.
     Until it is read, the same curve's numbers stand in. */
  function bezier(x1, y1, x2, y2) {
    function at(t, a, b) { return ((1 - 3 * b + 3 * a) * t * t * t) + ((3 * b - 6 * a) * t * t) + (3 * a * t); }
    function slope(t, a, b) { return 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i;
      for (i = 0; i < 8; i++) {
        var d = at(t, x1, x2) - x, s = slope(t, x1, x2);
        if (Math.abs(d) < 1e-5 || Math.abs(s) < 1e-6) break;
        t -= d / s;
      }
      if (!(t >= 0 && t <= 1) || Math.abs(at(t, x1, x2) - x) > 1e-4) {
        var lo = 0, hi = 1;
        for (i = 0; i < 24; i++) { t = (lo + hi) / 2; if (at(t, x1, x2) < x) lo = t; else hi = t; }
      }
      return at(t, y1, y2);
    };
  }
  function curve(value) {
    var m = String(value).match(/cubic-bezier\(([^)]+)\)/);
    var n = m ? m[1].split(',').map(Number) : [];
    return n.length === 4 && n.every(isFinite) ? bezier(n[0], n[1], n[2], n[3]) : null;
  }
  function ms(value) {
    var v = String(value).trim();
    var n = parseFloat(v);
    return isFinite(n) ? (/ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n) : 0;
  }
  var ease = bezier(0.4, 0, 0.2, 1);
  var ENTER = 500, MOVE = 700;

  var navH = 80, pin = 80, W = 0, H = 0, HS = 0;
  var stretch = [], starts = [], runway = 1;
  var live = false, queued = false, idx = -1;

  /* ---- the camera ----
     What is drawn is one set of numbers: where the camera looks and how
     close, the spotlight's rectangle and strength, and how much of each
     scene and each pin shows. A step's numbers are its frame; a move eases
     from whatever is drawn now to the step's, so a press in the middle of a
     move sets off from where the camera is rather than jumping back. */
  function frameValues(k) {
    var f = frames[k];
    return {
      cx: f.cx, cy: f.cy, z: f.z,
      x: f.rect.x, y: f.rect.y, w: f.rect.w, h: f.rect.h,
      ring: k ? 1 : 0,
      sc: scenes.map(function (el, i) { return i <= f.scene ? 1 : 0; }),
      pn: pins.map(function (el, i) { return i === k - 1 ? 1 : 0; })
    };
  }
  /* The camera's centre and the log of its zoom travel on the eased number,
     so a move between two far-apart parts is one glide rather than a slide
     with a late zoom. A dissolve between scenes is a cross-fade, linear on
     the move's own time. A pin leaves in the first 40% of a move and its
     successor lands in the last half, as the camera arrives. */
  function between(a, b, u) {
    var e = ease(u);
    return {
      cx: mix(a.cx, b.cx, e), cy: mix(a.cy, b.cy, e),
      z: Math.exp(mix(Math.log(a.z), Math.log(b.z), e)),
      x: mix(a.x, b.x, e), y: mix(a.y, b.y, e), w: mix(a.w, b.w, e), h: mix(a.h, b.h, e),
      ring: mix(a.ring, b.ring, e),
      sc: a.sc.map(function (v, i) { return mix(v, b.sc[i], u); }),
      pn: a.pn.map(function (v, i) {
        return b.pn[i] > v ? mix(v, b.pn[i], clamp((u - 0.5) / 0.5, 0, 1)) : mix(v, b.pn[i], clamp(u / 0.4, 0, 1));
      })
    };
  }

  var drawn = null, move = null, raf = 0, shown = -1;
  function draw(c) {
    drawn = c;
    var z = c.z;
    /* W x HS is the window, W x H the picture under it, held to its edges. */
    var tx = clamp(W / 2 - z * (c.cx / IW) * W, W - z * W, 0);
    var ty = clamp(HS / 2 - z * (c.cy / IH) * H, Math.min(0, HS - z * H), 0);
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
    /* A later scene is drawn over an earlier one, so a scene is shown by
       raising it and every one before it stays under it. */
    scenes.forEach(function (el, i) { el.style.opacity = c.sc[i]; });
    /* A pin is one size on the screen whatever the zoom, and so is its gap
       off the part's edge (walkthrough.css stands it there). */
    pins.forEach(function (el, i) {
      el.style.opacity = c.pn[i];
      el.style.transform = 'translate(calc(-100% - var(--space-sm) / ' + z + '), -50%) scale(' + (1 / z) + ')';
    });
    var top = 0;
    c.sc.forEach(function (v, i) { if (v >= 0.5) top = i; });
    if (zoom && scenes[top] && top !== shown) {
      shown = top;
      var pic = scenes[top].querySelector('img');
      zoom.setAttribute('href', pic.currentSrc || pic.getAttribute('src'));
      zoom.setAttribute('data-zoom-alt', pic.getAttribute('alt') || '');
    }
  }
  function moveTo(k, now) {
    var to = frameValues(k);
    if (now || !drawn) { move = null; draw(to); return; }
    move = { from: drawn, to: to, t0: 0 };
    if (!raf) raf = window.requestAnimationFrame(tick);
  }
  function tick(stamp) {
    raf = 0;
    if (!move || !live) return;
    if (!move.t0) move.t0 = stamp;
    var u = clamp((stamp - move.t0) / MOVE, 0, 1);
    draw(u < 1 ? between(move.from, move.to, u) : move.to);
    if (u < 1) raf = window.requestAnimationFrame(tick);
    else move = null;
  }

  /* ---- the steps ----
     Step 0 is the lead; 1 to N are the parts. Which one is open is written
     once, here, as classes the stylesheet opens and colours by, and the
     camera is sent after it. */
  function open(k, now) {
    idx = k;
    root.setAttribute('data-step', k);
    intro.classList.toggle('is-current', k === 0);
    steps.forEach(function (n, i) {
      n.classList.toggle('is-current', i + 1 === k);
      n.classList.toggle('is-done', i + 1 < k);
      if (!jumps[i]) return;
      if (i + 1 === k) jumps[i].setAttribute('aria-current', 'step');
      else jumps[i].removeAttribute('aria-current');
    });
    if (prev) prev.setAttribute('aria-disabled', k === 0 ? 'true' : 'false');
    if (next) next.setAttribute('aria-disabled', k === N ? 'true' : 'false');
    moveTo(k, now);
  }

  /* ---- the scroll ----
     Stretch k runs from starts[k] for stretch[k] px of scroll past the
     moment the panel sticks. The step changes GIVE into the next stretch
     going down and GIVE back into the last going up, so a scroll that
     comes to rest on a boundary, or a trackpad's last few pixels, cannot
     flick a step open and shut. */
  function scrolled() { return clamp(pin - root.getBoundingClientRect().top, 0, runway); }
  function at(px) {
    for (var k = N; k > 0; k--) if (px >= starts[k]) return k + (px - starts[k]) / stretch[k];
    return px / stretch[0];
  }
  function stepAt(px) {
    var r = at(px), k = idx;
    if (k < 0) return clamp(Math.floor(r), 0, N);
    if (r >= k + 1 + GIVE) k = Math.floor(r - GIVE);
    else if (r < k - GIVE) k = Math.floor(r + GIVE);
    return clamp(k, 0, N);
  }
  /* The line under step i (between disc i + 1 and disc i + 2) fills over
     stretch i + 1, from where a press lands to where the next step opens. */
  var filled = [];
  function fill(px) {
    for (var i = 0; i < N - 1; i++) {
      if (!lines[i]) continue;
      var a = starts[i + 1] + GIVE * stretch[i + 1], b = starts[i + 2];
      var f = Math.round(clamp((px - a) / (b - a), 0, 1) * 1000) / 1000;
      if (f !== filled[i]) { filled[i] = f; lines[i].style.transform = 'scaleY(' + f + ')'; }
    }
  }

  function update() {
    queued = false;
    if (!live) return;
    var px = scrolled();
    fill(px);
    var k = stepAt(px);
    if (k !== idx) {
      if (status && status.textContent) status.textContent = '';
      open(k);
    }
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  /* ---- pressing ----
     A press lands just inside the step's stretch, past GIVE, so the line
     under it starts empty and a small scroll back does not undo it. */
  var settled = 0;
  function land(k) { return k ? starts[k] + GIVE * stretch[k] + 1 : 0; }
  function name(k) {
    var kicker = (k ? steps[k - 1] : intro).querySelector('.wt-kicker');
    var num = kicker && kicker.querySelector('.wt-num');
    var words = kicker ? kicker.textContent.replace(num ? num.textContent : '', '').trim() : '';
    return k ? 'Step ' + k + ' of ' + N + ': ' + words : words;
  }
  function go(k) {
    if (!live) return;
    k = clamp(k, 0, N);
    var r = root.getBoundingClientRect();
    var stuck = r.top <= pin + 1 && r.bottom >= pin + sticky.offsetHeight - 1;
    var y = window.pageYOffset + r.top - pin + land(k);
    if (status) status.textContent = name(k);
    if (!stuck) { window.scrollTo({ top: y, behavior: 'smooth' }); return; }
    if (k === idx) return;
    /* The line takes the step's own time on a press, not the scroll's. */
    root.setAttribute('data-moving', '');
    window.clearTimeout(settled);
    settled = window.setTimeout(function () { root.removeAttribute('data-moving'); }, ENTER);
    open(k);
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  function step(dir, button) {
    if (button.getAttribute('aria-disabled') === 'true') return;
    go((idx < 0 ? 0 : idx) + dir);
  }
  if (prev) prev.addEventListener('click', function () { step(-1, prev); });
  if (next) next.addEventListener('click', function () { step(1, next); });
  jumps.forEach(function (b, i) {
    if (b) b.addEventListener('click', function () { if (live && i + 1 !== idx) go(i + 1); });
  });

  /* ---- fitting ----
     THE SCREEN HAS TO FIT THE WINDOW IT STICKS IN. Its height follows its
     width, so where the window is too short for the column's width the
     stage is held to the width at which it fits, and the column is held
     to the stage, so what that frees goes to the side rather than sitting
     as a gap between the screen and the steps. The title shares the
     column, so it can wrap anew at the narrower width; the fit is taken
     again with the title's new height, to the whole pixel. The stage never goes under
     half its column. */
  function frame() {
    W = world.offsetWidth;
    HS = W * FH / IW;
    H = W * IH / IW;
    screen.style.height = HS + 'px';
  }
  function room() {
    var r = inside();
    if (head && head.offsetHeight) r -= head.offsetHeight + parseFloat(getComputedStyle(head).marginBottom);
    return r;
  }
  function fit() {
    stage.style.maxWidth = '';
    sticky.style.gridTemplateColumns = '';
    frame();
    var full = stage.offsetWidth, w = full;
    for (var pass = 0; pass < 3; pass++) {
      var over = stage.offsetHeight - room();
      if (over <= 0) break;
      w = Math.max(full / 2, Math.floor(w - over * IW / FH));
      stage.style.maxWidth = w + 'px';
      sticky.style.gridTemplateColumns = w + 'px minmax(0, 1fr)';
      frame();
    }
  }

  /* THE SIDE IS AS TALL AS ITS TALLEST STEP. The open step changes the
     side's height, and a panel that grew and shrank with each step would
     move its foot on every one. So the side is held at the most any step
     needs: the way through, every step's name, and the most words any one
     step (or the lead) opens to. Words that are shut are still laid out,
     clipped, so their height can be read without opening them. */
  function opened(note) {
    var inner = note.querySelector('.wt-more-in');
    var a = inner && inner.firstElementChild, b = inner && inner.lastElementChild;
    if (!a) return 0;
    return b.getBoundingClientRect().bottom + parseFloat(getComputedStyle(b).marginBottom) -
      (a.getBoundingClientRect().top - parseFloat(getComputedStyle(a).marginTop));
  }
  function tallest() {
    var gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    var names = steps.reduce(function (sum, n) { return sum + n.querySelector('.wt-kicker').offsetHeight; }, 0) + gap * (N - 1);
    var most = [intro].concat(steps).reduce(function (m, n) { return Math.max(m, opened(n)); }, 0);
    return nav.offsetHeight + parseFloat(getComputedStyle(nav).marginBottom) + names + most;
  }
  /* The room the panel has inside the window, under the nav. */
  function inside() {
    var cs = getComputedStyle(sticky);
    return window.innerHeight - navH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  }
  var fits = true;

  function measure() {
    var style = getComputedStyle(document.documentElement);
    navH = parseFloat(style.getPropertyValue('--nav-height')) || 80;
    ENTER = ms(style.getPropertyValue('--motion-enter')) || 500;
    MOVE = ENTER + (ms(style.getPropertyValue('--motion-state')) || 200);
    ease = curve(style.getPropertyValue('--ease')) || ease;
    var u = Math.max(UNIT_MIN, window.innerHeight * UNIT);
    stretch = [INTRO * u];
    for (var k = 1; k <= N; k++) stretch.push(u);
    starts = [];
    runway = 0;
    stretch.forEach(function (s) { starts.push(runway); runway += s; });
    side.style.minHeight = '';
    fit();
    var need = Math.ceil(tallest());
    fits = need <= inside();
    side.style.minHeight = need + 'px';
    /* The box hugs what it holds and sticks in the middle of the window
       under the nav, and the scroll is counted from the moment it sticks. */
    pin = navH + Math.max(0, (window.innerHeight - navH - sticky.offsetHeight) / 2);
    sticky.style.top = pin + 'px';
    root.style.height = (sticky.offsetHeight + runway) + 'px';
  }
  /* A window the tallest step does not fit is given the static layout, and
     the tour is tried again whenever the window changes size. Taking the
     tour up and down happens inside one task, so nothing between is drawn. */
  function onResize() {
    if (!mq.matches) return;
    if (!live) { enter(); return; }
    measure();
    if (!fits) { leave(); return; }
    if (drawn) draw(drawn);
    filled = [];
    update();
  }

  function enter() {
    if (live) return;
    live = true;
    root.classList.add('is-tour');
    measure();
    if (!fits) { leave(); return; }
    idx = -1;
    var px = scrolled();
    fill(px);
    open(stepAt(px), true);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  /* Give back exactly what this file wrote and nothing else: a pin's left
     and top are in the markup and are what the static layout draws it by. */
  function clear(els, props) {
    els.forEach(function (el) { if (el) props.forEach(function (p) { el.style.removeProperty(p); }); });
  }
  function leave() {
    if (!live) return;
    live = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    move = null;
    drawn = null;
    idx = -1;
    filled = [];
    window.clearTimeout(settled);
    window.removeEventListener('scroll', onScroll);
    root.classList.remove('is-tour');
    root.removeAttribute('data-step');
    root.removeAttribute('data-moving');
    intro.classList.remove('is-current');
    steps.forEach(function (n) { n.classList.remove('is-current', 'is-done'); });
    jumps.forEach(function (b) { if (b) b.removeAttribute('aria-current'); });
    if (status) status.textContent = '';
    clear([root], ['height']);
    clear([world], ['transform']);
    clear([stage], ['max-width']);
    clear([side], ['min-height']);
    clear([sticky], ['top', 'grid-template-columns']);
    clear([screen], ['height']);
    clear([focus], ['left', 'top', 'width', 'height', 'opacity', 'outline-width', 'outline-offset', 'border-radius']);
    clear(pins, ['opacity', 'transform']);
    clear(lines, ['transform']);
    clear(scenes, ['opacity']);
    if (zoom) { zoom.setAttribute('href', zoomHref); zoom.removeAttribute('data-zoom-alt'); }
    shown = -1;
  }

  var mq = window.matchMedia('(min-width: 64rem) and (prefers-reduced-motion: no-preference)');
  function sync() {
    if (mq.matches) enter();
    else leave();
  }
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);
  sync();

  /* Fonts and the picture can move the page above the tour after this runs,
     and the title's and the steps' heights depend on the typefaces, which
     may still be arriving when the tour starts: fit again once they have. */
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();
