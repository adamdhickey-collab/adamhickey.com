/* The progress line on an article. A 4px sage rule under the nav that scales
   from the left as the reader moves through the essay -- and only the essay:
   the run is measured from the top of the body section to the bottom of the
   recap, so the line says how much of the argument is left rather than how
   much of the page, and the footer under the recap does not count.

   The width is written as a transform on the element, not as a class, which
   is why states.mjs has nothing to force here; the transition and its
   duration are the stylesheet's. Reduced motion needs no rule of its own:
   the blanket in shell.css already zeros every transition, and a bar that
   jumps to its position is still a progress bar. */
(function () {
  var bar = document.querySelector('.writing-progress');
  var body = document.querySelector('.case-overview');
  var end = document.querySelector('.writing-measure');
  if (!bar || !body || !end) return;
  var nav = 0;
  var ticking = false;
  var measure = function () {
    var root = getComputedStyle(document.documentElement);
    nav = parseFloat(root.getPropertyValue('--nav-height')) || 0;
  };
  var paint = function () {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var start = body.getBoundingClientRect().top + y - nav;
    var stop = end.getBoundingClientRect().bottom + y - window.innerHeight;
    var t = stop > start ? (y - start) / (stop - start) : 1;
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    bar.style.transform = 'scaleX(' + t + ')';
  };
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  };
  measure();
  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });
})();
