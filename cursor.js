/* ==========================================================================
   cursor.js — the site's custom cursor, on every page.

   A dot that tracks the pointer exactly plus a ring that lerps after it at
   0.18, so the ring trails through fast movement and settles a beat later.
   Styling lives in site-nav.css.

   Both parts are placed through the `translate` property, not `transform`.
   The stylesheet sits each box with its center on the viewport origin and
   swells the ring on hover with `scale`, and the individual properties
   apply in a fixed order: translate, then rotate, then scale, then
   `transform`. Writing the position into `transform` put it after the
   scale, so the hover multiplied the ring's position by 60/34 and the ring
   landed well below and to the right of the pointer. Written into
   `translate`, the position is applied first and the scale only swells the
   ring about its own center.

   This replaces the reticle that used to run in the flight section only,
   which meant the cursor changed character halfway down the home page.

   The markup is built here rather than written into all seven pages: the
   nodes are decoration, they carry no content, and duplicating them by hand
   is how the two headers drifted apart before site-nav.css existed.
   ========================================================================== */
(function setupCursor() {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Touch and coarse pointers have no cursor to replace, and anyone asking
     for reduced motion should not get a element that chases them. Both keep
     the native pointer: without .has-custom-cursor nothing sets cursor: none. */
  if (!fine || reduce) return;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add('has-custom-cursor');

  /* Anything that responds to a click gets the swell. Delegated from the
     document rather than bound per element, so markup rendered later still
     picks it up. Deliberately excludes .strength-card: those ten cards link
     nowhere, and a cursor that swells over them promises a click that does
     not exist.

     .case-card was named here until 2026-09-18, and every card was an anchor
     the whole time, so the name did nothing that `a` was not already doing.
     Then the prototype card became a div with two links in it, and the name
     started doing the thing the .strength-card note warns against: swelling
     the cursor over a card whose empty half is not a click. Dropped rather
     than narrowed to a.case-card, which would have been the same redundancy
     written more carefully. The two links inside it are anchors and are
     covered by the first entry in this list. */
  var INTERACTIVE = 'a, button, summary, input, select, textarea, label,' +
                    '[role="button"], [onclick]';
  /* The cursor is charcoal, so it disappears on any dark surface. Listing
     the dark ones by class does not hold: an audit of every element whose
     computed background is under 0.18 luminance found the footer, the
     portrait toggle, both primary buttons, the .mini-phone cards and the
     e-mail popover's copy button -- and that is only the surfaces that
     exist today. The footer was dark on all seven pages and marked on none,
     which is the failure mode of a hand-kept list.

     So measure instead of listing. Walk up from whatever the pointer is
     over to the first element that actually paints a background, and read
     its luminance. Anything genuinely dark lights the cursor, including
     surfaces added later.

     data-cursor="light" stays, checked inside the same walk, because
     measuring cannot see a dark photograph or canvas: those paint no
     background-color, so the walk falls through them to whatever is behind.
     Checking it per level rather than with closest() also fixes the inverse
     case, where a light card inside a marked dark section lit the cursor and
     made it vanish against the card. */
  var DARK = '[data-cursor="light"]';

  function channel(c) {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function onDarkSurface(node) {
    for (var n = node; n && n.nodeType === 1; n = n.parentElement) {
      /* An explicit mark decides at the level it sits on, so a dark
         photograph or canvas -- which paints no background-color for the
         walk to read -- still lights the cursor. */
      if (n.matches(DARK)) return true;
      var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(n).backgroundColor);
      if (!m) continue;
      var p = m[1].split(',');
      /* See-through: it does not decide the color, so keep walking up. */
      if (p.length > 3 && parseFloat(p[3]) < 0.5) continue;
      return 0.2126 * channel(+p[0]) + 0.7152 * channel(+p[1]) + 0.0722 * channel(+p[2]) < 0.18;
    }
    return false;
  }

  var mx = 0, my = 0, rx = 0, ry = 0, raf = null, started = false;

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.translate = rx.toFixed(1) + 'px ' + ry.toFixed(1) + 'px';
    /* Stop the frame loop once the ring has caught up, rather than running
       rAF forever behind a stationary pointer. */
    if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.1) raf = requestAnimationFrame(loop);
    else raf = null;
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.translate = mx + 'px ' + my + 'px';
    if (!started) {
      /* First move: drop the ring straight onto the pointer instead of
         letting it fly in from the top-left corner. */
      started = true; rx = mx; ry = my;
      document.documentElement.classList.add('cursor-ready');
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    ring.classList.toggle('is-hovering', !!t.closest(INTERACTIVE));
    document.documentElement.classList.toggle('cursor-on-dark', onDarkSurface(t));
  }, { passive: true });

  /* Hide both parts when the pointer leaves the window, so neither is left
     stranded at the edge of the viewport. */
  document.addEventListener('mouseleave', function () {
    document.documentElement.classList.add('cursor-out');
  });
  document.addEventListener('mouseenter', function () {
    document.documentElement.classList.remove('cursor-out');
  });
})();
