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
 * until 2026-10-21, with two changes: the names, and the level bar, which is
 * halfway between the label's bottom and the actions rather than the word's,
 * because the label has a second line ("Except cancel.") in its third
 * column, and a bar halfway from the word would run through it.
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
 * - Side by side: the stem drops from the underline to a level bar halfway
 *   from the label to the actions, and the bar's two ends turn down, each to
 *   the top of its action.
 * - Stacked: the stem drops straight to the first action. The second branch
 *   leaves it just under the word, turns left to the figure's gutter, runs
 *   down beside the first case and turns in to the second action's side at
 *   its middle. The label's second line is in its third column, right of
 *   the stem, so neither branch crosses it.
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
    var path = svg && svg.querySelector('path');
    var word = fig.querySelector('.quiet-cancel-word');
    var rings = fig.querySelectorAll('.quiet-cancel-ui');
    if (!path || !word || rings.length < 2) return;
    var box = svg.getBoundingClientRect();
    if (!box.width) return;
    var at = function (el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top };
    };
    var w = at(word), a = at(rings[0]), b = at(rings[1]);
    var ox = half((w.l + w.r) / 2);
    /* The underline sits about a fifth of an em under the baseline; the
       stem starts just under it, so the two read as one mark. */
    var oy = half(w.b + 2);
    var d;
    if (b.t > a.b) {
      /* The gutter: the figure's own inset, left of every case. */
      var gx = half(Math.max(R + 2, Math.min(14, b.l - 2 * R))), split = half(oy + 2 * R), by = half((b.t + b.b) / 2);
      d = 'M' + ox + ' ' + oy + 'V' + half(a.t) +
          'M' + ox + ' ' + split + 'H' + (gx + R) + 'Q' + gx + ' ' + split + ' ' + gx + ' ' + (split + R) +
          'V' + (by - R) + 'Q' + gx + ' ' + by + ' ' + (gx + R) + ' ' + by + 'H' + half(b.l);
    } else {
      var lx = half((a.l + a.r) / 2), rx = half((b.l + b.r) / 2);
      var lb = at(fig.querySelector('.quiet-cancel-label') || word).b;
      var top = Math.min(a.t, b.t), bar = half(lb + (top - lb) / 2);
      var r = Math.min(R, (top - bar) / 2, (bar - oy) / 2);
      d = 'M' + ox + ' ' + oy + 'V' + bar +
          'M' + (lx + r) + ' ' + bar + 'H' + (rx - r) +
          'M' + (lx + r) + ' ' + bar + 'Q' + lx + ' ' + bar + ' ' + lx + ' ' + (bar + r) + 'V' + half(a.t) +
          'M' + (rx - r) + ' ' + bar + 'Q' + rx + ' ' + bar + ' ' + rx + ' ' + (bar + r) + 'V' + half(b.t);
    }
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    path.setAttribute('d', d);
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
})();
