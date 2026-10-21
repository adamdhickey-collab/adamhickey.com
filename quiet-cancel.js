/* quiet-cancel.js -- the connector in "Every action is a button. Except
 * cancel."
 *
 * The figure (lab/agent-review.css, "Every action is a button. Except
 * cancel.") is complete without this file: the label, the two actions in
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
 * It also arms the build (lab/agent-review.css, "The build"), as loop.js
 * does for the loop: only when the reader has not asked for stillness and
 * the browser can say when the figure is in view, and then once.
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
 * half pixel so a 1.5px stroke sits on the pixel grid. Places are taken as
 * differences of bounding rects against the SVG's own rect, so a transform
 * on an ancestor (the page's reveal) moves everything together and changes
 * nothing.
 */
(function () {
  'use strict';
  var R = 8;
  var figures = [].slice.call(document.querySelectorAll('[data-quiet-cancel]'));
  if (!figures.length) return;

  function half(n) { return Math.round(n * 2) / 2; }

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
    var at = function (el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top };
    };
    var l = at(label), a = at(marks[0]), b = at(marks[1]), bs = at(screens[1]), as = at(screens[0]);
    var ox = half(box.width / 2);
    var oy = half(l.b + 8);
    if (bs.t > as.b) {
      /* The gutter: just left of the second screen, two bends' room clear
         of it, and never nearer the panel's edge than one bend. */
      var gx = half(Math.max(R + 2, bs.l - 3 * R)), split = half(oy + 2 * R), by = half((bs.t + bs.b) / 2);
      stem.setAttribute('d', 'M' + ox + ' ' + oy + 'V' + split);
      toA.setAttribute('d', 'M' + ox + ' ' + split + 'V' + half(a.t));
      toB.setAttribute('d', 'M' + ox + ' ' + split + 'H' + (gx + R) + 'Q' + gx + ' ' + split + ' ' + gx + ' ' + (split + R) +
          'V' + (by - R) + 'Q' + gx + ' ' + by + ' ' + (gx + R) + ' ' + by + 'H' + half(bs.l));
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
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(all);
    figures.forEach(function (f) { ro.observe(f); });
  }
  window.addEventListener('resize', all);
  window.addEventListener('load', all);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  all();

  /* The build, once, the first time a fifth of the figure is on screen. */
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.setAttribute('data-play', '');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  figures.forEach(function (f) {
    f.classList.add('quiet-cancel--armed');
    io.observe(f);
  });
})();
