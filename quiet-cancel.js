/* quiet-cancel.js -- the connector in "Every action is a button. Except
 * cancel."
 *
 * The figure (quiet-cancel.css; the homepage's lab card since 2026-10-26,
 * the Agent Review case study's opener before that) is complete without
 * this file: the label, the two actions in
 * their own looks, what each is and the takeaway are all text. This draws
 * the one line that ties them: a stem from under the word "action" that
 * divides into two branches, one to each action.
 *
 * It is same-red.js, which drew the red figure that opened the case study
 * until 2026-10-21, with three changes since. The stem leaves from under
 * the whole label, which is two centred lines now, not from under one word
 * in a three-column grid. A branch lands on the disc on top of its screen.
 * And the line is three paths, not one: the stem and the branch to the
 * system's button in sage, the branch to the hand-built link in caution,
 * each a single run with pathLength="1", so the build can draw it.
 *
 * It also starts the build (lab/agent-review.css, "The build"), once, the
 * first time the figure is in view. The page's head arms it, before first
 * paint, only when the reader has not asked for stillness and the browser
 * can say when the figure is in view; this file used to, and being
 * deferred it could run after the finished figure had already painted.
 * It sets window.quietCancelBuild once it is watching, and the head takes
 * the arming back at DOMContentLoaded if it is not, so a script that never
 * loads leaves the figure simply there rather than empty.
 *
 * WHY A SCRIPT. The stem starts under a word of live type and the branches
 * end on actions whose places depend on the figure's width, the type step
 * its container query chose and the fonts that loaded. So each figure is
 * measured in its own layout and its path written into its own SVG, again
 * when the fonts arrive and whenever the figure's box changes size.
 *
 * Two layouts, read from the layout itself rather than from a breakpoint
 * kept in step with the stylesheet: if the second action's top is below the
 * first one's bottom, the cases are stacked.
 *
 * - Side by side: the stem drops from the label to a level halfway from
 *   the label to the discs, and from there each branch runs out along that
 *   level and turns down to the top of its disc.
 * - Stacked: the stem drops a little way, the first branch carries on
 *   straight down to the first disc, and the second turns left to the
 *   figure's gutter, runs down beside the first case and turns in to the
 *   second screen's side at its middle.
 *
 * Every bend is a quarter circle of R, and every coordinate is rounded to a
 * half pixel so a 1.5px stroke sits on the pixel grid. Places are taken
 * from layout offsets against the figure, which the SVG fills, so no
 * transform moves them: not the page's reveal on an ancestor, and not the
 * build's own scale on a case while it plays.
 */
(function () {
  'use strict';
  var R = 8;
  var figures = [].slice.call(document.querySelectorAll('[data-quiet-cancel]'));
  if (!figures.length) return;

  function half(n) { return Math.round(n * 2) / 2; }

  /* How far outside its box an element's ring reaches: the spread of its
     box-shadow, which is how the discs and the screens draw their edge. A
     branch has to stop there, or it runs through the ring into the disc. */
  function ring(el) {
    var lengths = (getComputedStyle(el).boxShadow.match(/-?[\d.]+px/g) || []).map(parseFloat);
    return lengths.length >= 4 ? Math.max(0, lengths[3]) : 0;
  }

  function draw(fig) {
    var svg = fig.querySelector('.quiet-cancel-leads');
    var stem = svg && svg.querySelector('.quiet-cancel-lead--stem');
    var toA = svg && svg.querySelector('.quiet-cancel-lead--system');
    var toB = svg && svg.querySelector('.quiet-cancel-lead--hand');
    var label = fig.querySelector('.quiet-cancel-label');
    var marks = fig.querySelectorAll('.quiet-cancel-mark');
    var screens = fig.querySelectorAll('.quiet-cancel-screen');
    if (!stem || !toA || !toB || !label || marks.length < 2 || screens.length < 2) return;
    var box = svg.getBoundingClientRect();
    if (!box.width) return;
    /* Where an element is laid out, not where it is drawn this frame: its
       offsets summed up to the figure, whose padding box the SVG fills. The
       build scales each case from 0.96 and the figure is on screen at load,
       so a rect taken while it plays finds the disc a few pixels low, and
       the branch drawn to it ran into the ring once the case landed. The
       disc is an svg, which has no offsets, so it is placed from its screen
       by its own resolved left and top, plus its centring translate. */
    var at = function (el) {
      var x = 0, y = 0, n = el, w, h;
      if (el instanceof SVGElement) {
        var cs = getComputedStyle(el), p = at(el.parentElement);
        var own = new DOMMatrix(cs.transform === 'none' ? '' : cs.transform);
        w = parseFloat(cs.width); h = parseFloat(cs.height);
        x = p.l + el.parentElement.clientLeft + parseFloat(cs.left) + own.e;
        y = p.t + el.parentElement.clientTop + parseFloat(cs.top) + own.f;
        return { l: x, t: y, r: x + w, b: y + h };
      }
      while (n && n !== fig) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { l: x, t: y, r: x + el.offsetWidth, b: y + el.offsetHeight };
    };
    var l = at(label), a = at(marks[0]), b = at(marks[1]), bs = at(screens[1]), as = at(screens[0]);
    /* A branch ends clear of what it lands on: outside its ring, and back
       by the round cap's half-width, which reaches past the path's end. */
    var cap = (parseFloat(getComputedStyle(toA).strokeWidth) || 0) / 2;
    a.t -= ring(marks[0]) + cap;
    b.t -= ring(marks[1]) + cap;
    var bEdge = bs.l - ring(screens[1]) - cap;
    var ox = half(box.width / 2);
    var oy = half(l.b + 8);
    if (bs.t > as.b) {
      /* The gutter: just left of the second screen, two bends' room clear
         of it, and never nearer the panel's edge than one bend. */
      var gx = half(Math.max(R + 2, bs.l - 3 * R)), split = half(oy + 2 * R), by = half((bs.t + bs.b) / 2);
      stem.setAttribute('d', 'M' + ox + ' ' + oy + 'V' + split);
      toA.setAttribute('d', 'M' + ox + ' ' + split + 'V' + half(a.t));
      toB.setAttribute('d', 'M' + ox + ' ' + split + 'H' + (gx + R) + 'Q' + gx + ' ' + split + ' ' + gx + ' ' + (split + R) +
          'V' + (by - R) + 'Q' + gx + ' ' + by + ' ' + (gx + R) + ' ' + by + 'H' + half(bEdge));
    } else {
      var lx = half((a.l + a.r) / 2), rx = half((b.l + b.r) / 2);
      var top = Math.min(a.t, b.t), bar = half(oy + (top - oy) / 2);
      var r = Math.min(R, (top - bar) / 2, (bar - oy) / 2);
      var down = function (x, end) {
        var s = x < ox ? 1 : -1;
        return 'M' + ox + ' ' + bar + 'H' + (x + s * r) + 'Q' + x + ' ' + bar + ' ' + x + ' ' + (bar + r) + 'V' + half(end);
      };
      stem.setAttribute('d', 'M' + ox + ' ' + oy + 'V' + bar);
      toA.setAttribute('d', down(lx, a.t));
      toB.setAttribute('d', down(rx, b.t));
    }
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
  }

  function all() { figures.forEach(draw); }
  /* The figure's own box is what the paths depend on, so a window resize
     that changes it is already seen here; listening to both drew twice. */
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(all);
    figures.forEach(function (f) { ro.observe(f); });
  } else {
    window.addEventListener('resize', all);
  }
  window.addEventListener('load', all);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  all();

  /* The build, once, the first time a fifth of the figure is on screen,
     on a page whose head armed it. */
  if (!document.documentElement.classList.contains('quiet-cancel-armed')) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.setAttribute('data-play', '');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  figures.forEach(function (f) { io.observe(f); });
  window.quietCancelBuild = true;
})();
