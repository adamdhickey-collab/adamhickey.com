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
 *     part i  the camera moves in, then holds
 *     OUTRO   the camera backs out to the closing view, on the last scene
 * Each move starts LEAVE before its unit, as the note before it starts to
 * leave, and lands MOVE into it: one eased number, which the camera, the
 * change of scene and the progress bars all share (moveAt, below).
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
 * the picture and belong beside it. They are measured on the screen the
 * capture is taken of, at the capture's size, never on a screenshot of the
 * page: the first pins ever put on the first picture landed on text because
 * they were placed from a pasted image with a different layout. Since
 * 2026-10-03 the picture is the delegated work,
 * img/lab/agent-review-delegation.webp at 1440 x 1000 (lab-shots.mjs
 * delegation); until then it was the first iteration's change screen. Since
 * 2026-10-06 it is three pictures, the scenes below, and the numbers are in
 * their shared pixels.
 *
 * SCENES, since 2026-10-06. The walkthrough is a story now, not a tour of
 * one screen's parts, and the story needs the screen in more than one
 * state: the run as found, then the first question answered with its rule,
 * then nothing left to ask. Each state is a .wt-scene in the world, a full
 * capture of the same page from its top at the same size, so the three
 * share one set of coordinates and a part's data-rect means the same place
 * on any of them. A note (and a pin) names its scene with data-scene; one
 * that names none is on the first. Where the story moves to another scene,
 * the next one dissolves in on top while the camera makes its move, on the
 * same eased number, so the answer cards turn into the rule in place
 * rather than cutting to another picture. A scene later in the document is
 * drawn over an earlier one, and scrolling back runs the same dissolve the
 * other way. Pins belong to a scene and show only as much as it does. The
 * closing note can name a view (data-view="x y w h", the capture's pixels)
 * for the camera to back out to; without one it backs out to the first
 * screen's worth at the top. Without the tour only the first scene is
 * drawn, and the others are never fetched.
 *
 * THE PAGER, since 2026-10-05: a previous and a next button, at the two ends
 * of the progress bars until 2026-10-06 and since then a solid pair in the
 * panel's top right corner, with the bars across the panel under it all. A
 * press scrolls the page to the next stop, the t at which a part is best
 * looked at, and the tour follows because the tour
 * follows the scroll. So the buttons are a second way to move the same
 * number, never a second clock, and a reader can mix the two freely. Since
 * the evening of 2026-10-06 a press moves the scroll at its own steady pace
 * rather than the browser's (THE GLIDE, below), and a count rides the bars'
 * leading edge, "3 of 7", its number turning over as each part begins.
 *
 * THE SETTLE, since 2026-10-07: when the reader stops scrolling partway
 * through a move, the page glides to the nearer of the move's two parts, so
 * the tour comes to rest on a part and never between two (THE SETTLE,
 * below). It is the pager's glide, started by the scroll ending
 * rather than by a press.
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
  var head = root.querySelector('.wt-head');
  var bars = root.querySelector('.wt-pager');
  var stage = root.querySelector('.wt-stage');
  var screen = root.querySelector('.wt-screen');
  var world = root.querySelector('.wt-world');
  var img = world.querySelector('img');
  var focus = root.querySelector('.wt-focus');
  var pins = [].slice.call(root.querySelectorAll('.wt-pin'));
  var notes = [].slice.call(root.querySelectorAll('.wt-note'));
  var fills = [].slice.call(root.querySelectorAll('.wt-tick i'));
  var ticks = [].slice.call(root.querySelectorAll('.wt-tick'));
  var count = root.querySelector('.wt-count');
  var digits = count ? [].slice.call(count.querySelectorAll('.wt-count-n > span')) : [];
  var prev = root.querySelector('.wt-step--prev');
  var next = root.querySelector('.wt-step--next');
  var status = root.querySelector('.wt-status');
  var intro = root.querySelector('.wt-note--intro');
  var outro = root.querySelector('.wt-note--outro');
  var steps = notes.filter(function (n) { return n.hasAttribute('data-rect'); });
  var N = steps.length;
  if (!N || !sticky || !stage || !screen || !world || !img || !focus || !intro || !outro) return;

  /* The scenes, in document order, which is drawing order. A page with one
     picture and no .wt-scene is one scene, the world itself. */
  var scenes = [].slice.call(world.querySelectorAll('.wt-scene'));
  var names = scenes.map(function (el) { return el.getAttribute('data-scene'); });
  function sceneOf(el) { return Math.max(0, names.indexOf(el.getAttribute('data-scene'))); }
  var introScene = sceneOf(intro), outroScene = sceneOf(outro);
  var pinScene = pins.map(sceneOf);
  /* The full-size link follows the scene in view while the tour runs, and is
     given back as it was when the tour stops. */
  var zoom = root.querySelector('.ar-zoom--tour');
  var zoomHref = zoom ? zoom.getAttribute('href') : null;

  /* The capture's own pixels. */
  var IW = +img.getAttribute('width');
  var IH = +img.getAttribute('height');
  /* THE SCREEN IS A WINDOW ONTO THE PAGE, since 2026-10-05. The picture is the
     whole screen the product opens on, 1300 tall, and a frame that shows all
     of it is nearly square: on a laptop its height, not its column, is what
     limits it, so the product was printed smaller than the room it had. While
     the tour runs the frame is FH of the picture tall (data-fold on the
     screen, in the capture's pixels: a window the shape the product is used
     in) and the camera travels the page under it, down to the checks and
     back. The closing map pulls back until the whole page fits the window's
     height, on the frame's own dark ground. Without the tour the frame is
     the whole picture, as it was. */
  var FH = Math.min(IH, +screen.getAttribute('data-fold') || IH);
  var ZMAX = 2.1;          /* the capture is 2x, so this is still sharp */
  var UNIT = 0.6;          /* of the viewport's height: the scroll one part takes */
  var UNIT_MIN = 430;      /* px, so a short window does not shorten the scroll with it */
  var INTRO = 0.5;         /* units of scroll */
  var OUTRO = 0.9;
  var MOVE = 0.45;         /* how far into its unit a move lands */
  var OUT_MOVE = 0.45;
  var LEAVE = 0.25;        /* how far before its unit a move starts: the note before it leaving */
  var LEAD = 40;           /* capture px: the room the camera leaves left of a part, for its pin */
  var T = INTRO + N + OUTRO;

  /* WHERE A PRESS LANDS. The pager's two buttons move the page's scroll
     position, and nothing else: there is still one clock, the scroll, and
     render(t) is still the only thing that draws. A stop is the t a part is
     best looked at, HOLD into its unit: the camera arrived at MOVE (0.45)
     and the note is whole from 0.3 until it starts to leave at 0.75. The
     lead is t = 0 and the closing map is the same HOLD into the outro. */
  var HOLD = 0.6;
  var NEAR = 0.05;         /* units: closer than this to a stop is at it */
  var stops = [0];
  for (var k = 0; k < N; k++) stops.push(INTRO + k + HOLD);
  stops.push(INTRO + N + HOLD);

  var home = { rect: { x: 0, y: 0, w: IW, h: FH }, cx: IW / 2, cy: FH / 2, z: 1 };
  /* WHERE THE CAMERA CAN ACTUALLY LOOK, since the evening of 2026-10-06. A
     centre the window cannot reach at zoom z without showing past the
     picture's edge is held at the nearest one it can, exactly where the
     clamp in render() would hold the view anyway. The camera interpolates
     between these held centres. Aimed at the parts' own centres, a part near
     the picture's foot, the completed work, sat still for the first half of
     a move while its centre travelled inside the clamp, then set off at full
     speed: invisible while a press took 380ms, a lunge once it took a
     second. */
  function held(f) {
    f.cx = clamp(f.cx, IW / (2 * f.z), IW - IW / (2 * f.z));
    f.cy = clamp(f.cy, FH / (2 * f.z), IH - FH / (2 * f.z));
    return f;
  }
  function rectOf(attr) {
    var r = attr.split(/\s+/).map(Number);
    return { x: r[0], y: r[1], w: r[2], h: r[3] };
  }
  var frames = steps.map(function (n) {
    var rect = rectOf(n.getAttribute('data-rect'));
    /* Fit the part into 86% of the screen's width and 80% of its height, so
       there is always a margin of the dimmed screen around it. The pin
       stands outside the part's left edge, so the camera aims LEAD/2 left of
       the part's centre: at 64rem the even margin was 40px and the pin and
       its gap need 38. */
    var z = Math.min(ZMAX, 0.86 * IW / rect.w, 0.8 * FH / rect.h);
    return held({ rect: rect, cx: rect.x + rect.w / 2 - LEAD / 2, cy: rect.y + rect.h / 2, z: Math.max(1, z), scene: sceneOf(n) });
  });
  /* Where the closing note backs out to. Until 2026-10-06 it was the whole
     picture, pulled back until it fitted the window's height, with all the
     pins on it as a map; the last scene is a different state of the screen
     now, which the earlier pins do not point into, so it is the view the
     closing note names, at full size. */
  var outroView = outro.hasAttribute('data-view') ? rectOf(outro.getAttribute('data-view')) : home.rect;
  var map = held({ rect: outroView, cx: outroView.x + outroView.w / 2, cy: outroView.y + outroView.h / 2, z: Math.max(1, Math.min(ZMAX, IW / outroView.w, FH / outroView.h)) });

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* Ease in and out, cubic: the camera starts and stops softly. */
  function ease(v) {
    v = clamp(v, 0, 1);
    return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
  }
  function mix(a, b, e) { return a + (b - a) * e; }

  var rise = 20, navH = 80, pin = 80, W = 0, H = 0, HS = 0, runway = 1;
  var glide = 1000;        /* ms a press takes for one part: two --motion-enter, set in measure() */
  var SWAP = 0.4;          /* of a move: the middle stretch in which the count's number turns over */
  var tickAt = [], countW = 0, barsW = 0;
  var live = false, queued = false;

  /* ONE MOVE, ONE EASED NUMBER, since the evening of 2026-10-06 (Adam: the
     bar "still animating when the content above it has already stopped",
     and then "the same easing effect so they really felt synced up"). Move
     j takes the camera to part j, from the lead's whole screen for j = 0,
     and move N backs it out to the close. It starts LEAVE before part j's
     unit, as the note before it starts to leave, and lands MOVE into it,
     and nothing on the screen moves outside a move. The camera, the change
     of scene and the progress bars all read the same e, so they set off,
     gather speed and settle together; the notes cross inside it, the old
     one going in its first third and the new one arriving after.

     Until then the camera travelled only the last MOVE of that stretch,
     while the old note left before it, and the bars filled with the raw
     scroll position across the whole of every unit, holds included: on a
     press the bar ran for a second around a camera that moved for 450ms.
     x is the move's own linear progress, for the count's number. */
  function moveAt(t) {
    var j = Math.floor(t - INTRO + LEAVE);
    if (j < 0) return { j: -1, x: 0, e: 0 };
    j = Math.min(j, N);
    var x = clamp((t - INTRO - j + LEAVE) / (LEAVE + (j < N ? MOVE : OUT_MOVE)), 0, 1);
    return { j: j, x: x, e: ease(x) };
  }

  function cameraAt(m) {
    var from = home, to = home, e = 0, ring = 0;
    if (m.j >= N) {
      from = frames[N - 1];
      to = map;
      e = m.e;
      ring = 1 - e;
    } else if (m.j >= 0) {
      from = m.j ? frames[m.j - 1] : home;
      to = frames[m.j];
      e = m.e;
      ring = m.j ? 1 : e;
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

  /* Which scene the story is in at t, and how far a change of scene has got:
     the move's own eased number, so the next state dissolves in while the
     camera travels to its part. */
  function sceneAt(m) {
    if (m.j >= N) return { from: frames[N - 1].scene, to: outroScene, e: m.e };
    if (m.j >= 0) return { from: m.j ? frames[m.j - 1].scene : introScene, to: frames[m.j].scene, e: m.e };
    return { from: introScene, to: introScene, e: 1 };
  }
  /* How much of scene k a reader sees: all of a scene the story stays in,
     and the two halves of a dissolve while it moves. */
  function seen(sc, k) {
    if (sc.from === sc.to) return k === sc.to ? 1 : 0;
    return k === sc.to ? sc.e : k === sc.from ? 1 - sc.e : 0;
  }
  var shown = -1;
  function drawScenes(sc) {
    /* The later scene is drawn over the earlier and fades on top of it, so
       the dissolve never shows the ground through two half-faded pictures. */
    var up = sc.to > sc.from;
    scenes.forEach(function (el, k) {
      var o = 0;
      if (k === sc.from) o = up || sc.from === sc.to ? 1 : 1 - sc.e;
      if (k === sc.to) o = up ? sc.e : 1;
      el.style.opacity = o;
    });
    var now = sc.e >= 0.5 ? sc.to : sc.from;
    if (zoom && scenes[now] && now !== shown) {
      shown = now;
      var pic = scenes[now].querySelector('img');
      zoom.setAttribute('href', pic.currentSrc || pic.getAttribute('src'));
      zoom.setAttribute('data-zoom-alt', pic.getAttribute('alt') || '');
    }
  }

  /* How present part i is: arriving with the camera, leaving in the last
     quarter of its unit. The same number drives the note and the pin's lift. */
  function presence(t, i) {
    var b = INTRO + i;
    return ease((t - b) / 0.3) * ease((b + 1 - t) / LEAVE);
  }

  function place(el, p) {
    el.style.opacity = p;
    el.style.transform = 'translateY(' + ((1 - p) * rise) + 'px)';
  }

  function render(t) {
    var m = moveAt(t);
    var c = cameraAt(m);
    var z = c.z;
    /* W x HS is the window, W x H the page under it. Zoomed in, the page is
       held to the window's edges; pulled back past 1 (the map) it is narrower
       than the window and sits in the middle of it. */
    var tx = z >= 1 ? clamp(W / 2 - z * (c.cx / IW) * W, W - z * W, 0) : (W - z * W) / 2;
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

    /* Pins fade in as the camera arrives and stay, so the last frame is a
       map. A pin is one size on the screen from the moment it appears: the
       scale only cancels the zoom, and the gap off the part's edge is divided
       by the zoom for the same reason (walkthrough.css draws the pin). Until
       2026-10-05 a pin grew from half size as it landed, swelled a fifth while
       its part was looked at and carried a halo, and the same number read at
       three sizes in one tour. */
    var settled = m.j >= N ? m.e : 0;
    var sc = sceneAt(m);
    if (scenes.length) drawScenes(sc);
    pins.forEach(function (pin, i) {
      var born = ease((t - INTRO - i) / 0.3);
      /* Behind the part being looked at, a pin recedes to a trace; backing out
         to the whole screen brings all seven to full strength. A pin is only
         as visible as its scene. */
      pin.style.opacity = born * (0.4 + 0.6 * Math.max(presence(t, i), settled)) * (scenes.length ? seen(sc, pinScene[i]) : 1);
      pin.style.transform = 'translate(calc(-100% - var(--space-sm) / ' + z + '), -50%) scale(' + (1 / z) + ')';
    });

    /* The notes: the lead leaves, each part arrives and leaves, the last one
       arrives once the camera has started backing out. */
    place(intro, ease((INTRO - t) / LEAVE));
    steps.forEach(function (n, i) { place(n, presence(t, i)); });
    place(outro, ease((t - INTRO - N - 0.1) / 0.35));
    /* The bars: a whole bar for every part reached, and the one being moved
       to filling on the move's own e, so the fill's edge travels with the
       camera rather than with the scroll. */
    var p = m.j < 0 ? 0 : m.j >= N ? N : m.j + m.e;
    fills.forEach(function (f, i) { f.style.transform = 'scaleX(' + clamp(p - i, 0, 1) + ')'; });
    counted(m, p);
    ends(t);
  }

  /* THE COUNT, since 2026-10-06 (Adam: "a little small type follow as a
     line gets filled", reading 0 of 7 and then 1 of 7, changing as it moves
     along with the bar). It stands over the fill's leading edge, kept to the
     bars' two ends, so it travels with the sage exactly: the same p the
     fills are scaled by, which is the move's own e. Its number turns over in
     the middle of each move, the old one rising out and the new one rising
     in, a quarter of --motion-rise, which is how MOTION.md section 10 lets
     words swap, travelling rather than fading in place. Like everything
     else here it is a function of t, so scrolling back turns it back. */
  function counted(m, p) {
    if (!count || digits.length < 2 || !tickAt.length) return;
    var i = clamp(Math.floor(p), 0, N - 1);
    var tick = tickAt[i];
    var x = tick.left + clamp(p - i, 0, 1) * tick.width;
    count.style.transform = 'translateX(' + clamp(x - countW / 2, 0, Math.max(0, barsW - countW)) + 'px)';
    /* Before the first move it reads 0, after the last part it reads N, and
       during move j it turns from j to j + 1. */
    var k = clamp(m.j, 0, N - 1);
    var s = m.j < 0 ? 0 : m.j >= N ? 1 : ease((m.x - (1 - SWAP) / 2) / SWAP);
    var lift = rise / 4;
    if (digits[0].textContent !== String(k)) digits[0].textContent = k;
    if (digits[1].textContent !== String(k + 1)) digits[1].textContent = k + 1;
    digits[0].style.opacity = 1 - s;
    digits[0].style.transform = 'translateY(' + (-s * lift) + 'px)';
    digits[1].style.opacity = s;
    digits[1].style.transform = 'translateY(' + ((1 - s) * lift) + 'px)';
  }

  /* The pager. A button with nowhere left to go says so, and is written only
     when that changes: render() runs on every frame of a scroll. */
  var atStart = null, atEnd = null;
  function ends(t) {
    var s = t <= stops[0] + NEAR, e = t >= stops[stops.length - 1] - NEAR;
    if (prev && s !== atStart) { atStart = s; prev.setAttribute('aria-disabled', s ? 'true' : 'false'); }
    if (next && e !== atEnd) { atEnd = e; next.setAttribute('aria-disabled', e ? 'true' : 'false'); }
  }
  function now() {
    return clamp((pin - root.getBoundingClientRect().top) / runway, 0, 1) * T;
  }
  /* What a screen reader hears after a press: the part's own kicker, without
     the digit its disc draws. */
  function name(i) {
    var note = i === 0 ? intro : i > N ? outro : steps[i - 1];
    var kicker = note.querySelector('.wt-kicker');
    var num = kicker && kicker.querySelector('.wt-num');
    var words = kicker ? kicker.textContent.replace(num ? num.textContent : '', '').trim() : '';
    return i >= 1 && i <= N ? 'Part ' + i + ' of ' + N + ': ' + words : words;
  }
  /* One press is one stop from where the reader is, or, while a press is
     still gliding to the stop it asked for, from that stop: two quick
     presses are two parts, not one. The stop a press asked for is forgotten
     the moment the page gets there and the moment the reader moves it some
     other way (a wheel, a finger, a key), so a press never starts from a
     place the reader has already left. A button at the end of its travel
     does nothing: it is aria-disabled so that it can keep its focus, which
     means the click still arrives. */
  var aim = null, said = null;
  function hush() { said = null; if (status && status.textContent) status.textContent = ''; }
  function forget() { aim = null; stopGlide(); hush(); }

  /* THE GLIDE, since the evening of 2026-10-06 (Adam: the presses moved
     "too quickly", and should be "smoother, less jarring and easier to see
     what's going on"). A press used to hand the move to the page's own
     smooth scroll, which covers a part's 600px in about 380ms on its own
     curve. The camera travelled in the middle of that distance, where the
     curve is fastest, so it crossed the screen in 50 to 84ms and the notes
     swapped in about 67: a cut, not a move. So a press moves the scroll
     itself, at a steady rate of one unit per two --motion-enter. Steady,
     because the scroll position is the tour's progress and MOTION.md gives
     progress `linear`; what travels eases on the move's own e.

     ONLY THROUGH THE MOVES, since later the same evening (Adam: the bar
     was "still animating when the content above it has already stopped").
     Between two stops a unit's worth of scroll is a move of LEAVE + MOVE,
     0.7 of it, with a stretch either side in which nothing on the screen
     changes. A press crosses those stretches in a single frame and spends
     its time on the move alone, so a part takes 700ms, between the camera's
     old 450 and the bar's old second, and the bar, the camera, the change
     of scene and the count all start on the first frame and settle on the
     last. Scrolling by hand still takes the stretches as they come.

     It is still the page's scroll position that moves, a frame at a time,
     so render(t) is still the only thing that draws, and the moment
     anything else moves the page (a wheel, a finger, a key, a dragged
     scrollbar) the glide lets go. A press during a glide sets off from
     where the page is, at the same pace, and a run of quick presses is held
     to one and a half moves' time. */
  var gliding = null;
  function stopGlide() {
    if (!gliding) return;
    window.cancelAnimationFrame(gliding.raf);
    gliding = null;
  }
  /* The stretches of t between a and b in which a move is under way, in the
     order a press travels them. */
  function movesBetween(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b), out = [];
    for (var j = 0; j <= N; j++) {
      var s = Math.max(lo, INTRO + j - LEAVE), e = Math.min(hi, INTRO + j + (j < N ? MOVE : OUT_MOVE));
      if (e > s) out.push(b >= a ? [s, e] : [e, s]);
    }
    return b >= a ? out : out.reverse();
  }
  function glideTo(target) {
    stopGlide();
    var base = root.getBoundingClientRect().top + window.pageYOffset - pin;
    var spans = movesBetween(now(), target);
    var length = spans.reduce(function (sum, w) { return sum + Math.abs(w[1] - w[0]); }, 0);
    /* t at fraction u of the press: along the moves, with the stretches
       between them taken in no time at all. */
    function at(u) {
      var d = u * length;
      for (var k = 0; k < spans.length; k++) {
        var w = spans[k], len = Math.abs(w[1] - w[0]);
        if (d <= len) return w[0] + (w[1] > w[0] ? d : -d);
        d -= len;
      }
      return target;
    }
    var g = { start: 0, ms: glide * Math.min(length, 1.5 * (LEAVE + MOVE)), raf: 0, set: window.pageYOffset };
    gliding = g;
    function step(stamp) {
      if (gliding !== g) return;
      if (Math.abs(window.pageYOffset - g.set) > 2) { gliding = null; return; }
      if (!g.start) g.start = stamp;
      var u = g.ms ? clamp((stamp - g.start) / g.ms, 0, 1) : 1;
      g.set = Math.round(base + (u < 1 ? at(u) : target) / T * runway);
      window.scrollTo({ top: g.set, behavior: 'instant' });
      lastY = window.pageYOffset;
      update();
      if (u < 1) g.raf = window.requestAnimationFrame(step);
      else gliding = null;
    }
    g.raf = window.requestAnimationFrame(step);
  }
  function go(dir, button) {
    if (!live || button.getAttribute('aria-disabled') === 'true') return;
    var t = aim !== null && gliding ? stops[aim] : now();
    var to = -1, i;
    if (dir > 0) { for (i = 0; i < stops.length; i++) if (stops[i] > t + NEAR) { to = i; break; } }
    else { for (i = stops.length - 1; i >= 0; i--) if (stops[i] < t - NEAR) { to = i; break; } }
    if (to < 0) return;
    refused = null;
    aim = to;
    glideTo(stops[to]);
    if (status) { status.textContent = name(to); said = to; }
  }
  if (prev) prev.addEventListener('click', function () { go(-1, prev); });
  if (next) next.addEventListener('click', function () { go(1, next); });
  window.addEventListener('wheel', forget, { passive: true });
  window.addEventListener('touchstart', forget, { passive: true });
  window.addEventListener('keydown', function (e) { if (e.target !== prev && e.target !== next) forget(); });

  /* THE SETTLE, since 2026-10-07 (Adam: "as a user scrolls through the
     section ... snap to each of the steps"). Scrolling by hand, a reader
     could stop anywhere, and a stop in the middle of a move is a frame no
     one chose: the camera halfway between two parts, two notes half faded.
     So when the scroll comes to rest inside a move, the page glides, at a
     press's pace, to the nearer of the two parts the move runs between:
     on, once the reader is past its middle, and otherwise back to the part
     they were leaving.

     Only inside a move. Between moves nothing on the screen changes, so a
     scroll that ends there already shows a part, and the page is left
     where the reader put it; that is also what lets a reader scroll off
     either end of the tour without being pulled back into it.

     The nearer part, not the next one, since the same day (Adam: it "pulls
     much too eagerly"). It first went on in the direction of travel
     however little of the move had been made, so the smallest nudge past
     a part was a whole part, and an overshoot carried the reader on to a
     part they had not finished reading.

     A SECOND PUSH GOES THROUGH. Sent back from a move, the next scroll
     that ends in the same move the same way carries on to the far part,
     however short. Without that the nearer part is a trap: a part is 81px
     of still page and then a move of 378 on a 900px window, so the first
     notch of a mouse wheel off a part ends a twentieth of the way into the
     move, and three taps of an arrow key a tenth, and a reader taking it a
     notch at a time would be handed back to the same part forever. With it the
     tour has a detent: a nudge is refused, and a second one goes.

     It is not CSS scroll snapping. That snaps the glide's own per-frame
     scrolls, and it carries a part across at the browser's speed, which
     is the 50ms camera THE GLIDE was written to get rid of.

     The scroll's end is the browser's scrollend where it has one, and
     otherwise SETTLE ms without a scroll. The direction is read only from
     scrolls the glide did not make. */
  var SETTLE = 150;
  var dir = 0, lastY = 0, rest = 0, refused = null;
  var ended = 'onscrollend' in window;
  function settle() {
    rest = 0;
    if (!live || gliding) return;
    var raw = (pin - root.getBoundingClientRect().top) / runway;
    if (raw <= 0 || raw >= 1) return;
    var m = moveAt(raw * T);
    if (m.j < 0 || m.x <= 0 || m.x >= 1) return;
    /* Move j runs from stop j to stop j + 1. A page restored mid-move on a
       reload has no direction, and goes to the nearer. */
    var on = m.x >= 0.5 ? 1 : -1;
    if (dir && on !== dir) {
      if (refused && refused.j === m.j && refused.dir === dir) { on = dir; refused = null; }
      else refused = { j: m.j, dir: dir };
    } else refused = null;
    aim = on > 0 ? m.j + 1 : m.j;
    glideTo(stops[aim]);
  }

  function update() {
    queued = false;
    if (!live) return;
    var progress = clamp((pin - root.getBoundingClientRect().top) / runway, 0, 1);
    if (aim !== null && Math.abs(progress * T - stops[aim]) < NEAR) aim = null;
    /* What the status line last said stops being true once the reader is half
       a part away from it by any means, a dragged scrollbar included. */
    if (said !== null && aim === null && Math.abs(progress * T - stops[said]) > 0.5) hush();
    render(progress * T);
  }
  function onScroll() {
    var y = window.pageYOffset;
    if (!gliding && y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    if (!ended) { window.clearTimeout(rest); rest = window.setTimeout(settle, SETTLE); }
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  /* THE SCREEN HAS TO FIT THE WINDOW IT STICKS IN. The stage is as wide as its
     column, and the picture's height follows from that width, so the taller
     the picture the shorter the window it fits. At 1440 x 1000 it fitted down
     to a 650px window; the capture is 1300 tall since 2026-10-05 (the whole
     screen, the checks under the decisions included) and the same arithmetic
     gave a stage 14px taller than an 800px window, whose foot and progress
     bars ran off the bottom. So the stage is held to the width at which its
     height, the lid, the foot and the bars included, is the room the sticky
     box has. Measured, not authored: the chrome is whatever the stage is
     taller than the window, and the ratio is the window's own. A window with
     room to spare is left alone, and the stage never goes under half its
     column, so a very short window gets a small laptop and not a sliver. */
  /* The window's size follows the stage's width, so it is set whenever that
     width is. */
  function frame() {
    W = world.offsetWidth;
    HS = W * FH / IW;
    H = W * IH / IW;
    screen.style.height = HS + 'px';
  }
  function fit() {
    stage.style.maxWidth = '';
    frame();
    var cs = getComputedStyle(sticky);
    /* The window under the nav, not the sticky box: the box is as tall as
       what it holds (walkthrough.css), so it cannot say how much room the
       window has. */
    var room = window.innerHeight - navH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    /* The title over the stage (.wt-head) shares the column, so its height
       and the margin under it come out of the room; a page without one, or
       the static layout, which does not display it, reads 0. */
    if (head && head.offsetHeight) room -= head.offsetHeight + parseFloat(getComputedStyle(head).marginBottom);
    /* So do the progress bars, since 2026-10-06 a row of their own under
       the screen and the notes rather than a row inside the stage. */
    if (bars && bars.offsetHeight) room -= bars.offsetHeight + parseFloat(getComputedStyle(bars).marginTop);
    var over = stage.offsetHeight - room;
    if (over > 0) {
      stage.style.maxWidth = Math.max(stage.offsetWidth / 2, stage.offsetWidth - over * IW / FH) + 'px';
      frame();
    }
  }

  function measure() {
    var style = getComputedStyle(document.documentElement);
    navH = parseFloat(style.getPropertyValue('--nav-height')) || 80;
    rise = parseFloat(style.getPropertyValue('--motion-rise')) || 20;
    glide = 2 * (parseFloat(style.getPropertyValue('--motion-enter')) || 500);
    runway = Math.round(T * Math.max(UNIT_MIN, window.innerHeight * UNIT));
    fit();
    /* THE BOX HUGS WHAT IT HOLDS AND STICKS IN THE MIDDLE OF THE WINDOW.
       Since 2026-10-06 the sticky box is as tall as the title, the stage
       and the panel round them, not as tall as the window: a window-tall
       box on a tall monitor put half its slack between the page above and
       the panel, a gap of a third of a screen on the way in. So its top is
       set here, to centre it under the nav while it is stuck, and the
       clock runs from the moment it sticks there rather than from the nav
       (now(), go(), update()), so the tour still takes the whole runway. */
    pin = navH + Math.max(0, (window.innerHeight - navH - sticky.offsetHeight) / 2);
    sticky.style.top = pin + 'px';
    root.style.height = (sticky.offsetHeight + runway) + 'px';
    /* Where each bar starts and how wide it is, for the count to ride. */
    tickAt = ticks.map(function (el) { return { left: el.offsetLeft, width: el.offsetWidth }; });
    countW = count ? count.offsetWidth : 0;
    barsW = bars ? bars.clientWidth : 0;
  }
  function onResize() { if (live) { measure(); update(); } }

  function enter() {
    if (live) return;
    live = true;
    root.classList.add('is-tour');
    measure();
    update();
    lastY = window.pageYOffset;
    dir = 0;
    window.addEventListener('scroll', onScroll, { passive: true });
    if (ended) window.addEventListener('scrollend', settle);
    window.addEventListener('resize', onResize);
    /* The title's height depends on its typeface, which may still be
       arriving when the tour starts: fit again once it has. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  }
  /* Give back exactly what render() wrote and nothing else: a pin's left and
     top are in the markup and are what the static layout draws it by. */
  function clear(els, props) {
    els.forEach(function (el) { props.forEach(function (p) { el.style.removeProperty(p); }); });
  }
  function leave() {
    if (!live) return;
    live = false;
    stopGlide();
    aim = null;
    window.clearTimeout(rest);
    rest = 0;
    refused = null;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('scrollend', settle);
    window.removeEventListener('resize', onResize);
    root.classList.remove('is-tour');
    root.style.height = '';
    clear([world], ['transform']);
    clear([stage], ['max-width']);
    clear([sticky], ['top']);
    clear([screen], ['height']);
    clear([focus], ['left', 'top', 'width', 'height', 'opacity', 'outline-width', 'outline-offset', 'border-radius']);
    clear(pins, ['opacity', 'transform']);
    clear(notes, ['opacity', 'transform']);
    clear(fills, ['transform']);
    if (count) clear([count], ['transform']);
    clear(digits, ['opacity', 'transform']);
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

  /* Fonts and the picture can move the page above the tour after this runs. */
  window.addEventListener('load', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();
