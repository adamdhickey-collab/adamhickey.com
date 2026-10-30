/* map-rail.js -- the stage rail over a service map read on a phone. Two
   pages load it, each with map-rail.css: case-study/usda-operational-
   overhead.html (.svc-stages) and lab/inspiration-to-aisle.html
   (.ia-matrix).

   Under 64rem a map's stages sit in a row the reader swipes along. This
   puts one disc a stage over the row, each a button that brings its stage
   into view, and fills the discs of the stages in view: more than half of
   a stage inside the row is in view, so a phone fills one disc and a
   tablet two. The page reads the same to a screen reader with or without
   it; the rail only moves the row. From 64rem the CSS does not draw it.

   The row itself is made keyboard-scrollable here, and only while it
   scrolls: from 64rem it is a grid with nothing to scroll, and a tab stop
   there would go nowhere.

   It also starts the marks over each map's claims drawing as the claims
   come into view (map-rail.css, "The claims' marks"), and arms them only
   when it can finish them: not for a reader who asked for no motion. */
(function () {
  var lists = document.querySelectorAll('.svc-stages, .ia-matrix');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  Array.prototype.forEach.call(lists, function (list) {
    var word = list.classList.contains('ia-matrix') ? 'Moment' : 'Stage';
    var cards = list.children;
    var rail = document.createElement('div');
    rail.className = 'map-rail';
    rail.setAttribute('role', 'group');
    rail.setAttribute('aria-label', word + 's');
    list.setAttribute('aria-label', word + 's');

    var buttons = [];
    Array.prototype.forEach.call(cards, function (card, i) {
      var name = card.querySelector('.svc-stage-name, .ia-moment-name');
      var n = name && name.querySelector('.svc-n, .ia-n');
      var number = n ? n.textContent.trim() : String(i + 1);
      var label = name ? name.textContent.replace(number, '').trim() : '';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-rail-btn';
      btn.setAttribute('aria-label', word + ' ' + (i + 1) + (label ? ': ' + label : ''));
      var disc = document.createElement('span');
      disc.className = 'map-rail-n';
      disc.textContent = number;
      btn.appendChild(disc);
      btn.addEventListener('click', function () {
        var start = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
        var left = list.scrollLeft + card.getBoundingClientRect().left - list.getBoundingClientRect().left - start;
        list.scrollTo({ left: left, behavior: still.matches ? 'auto' : 'smooth' });
      });
      rail.appendChild(btn);
      buttons.push(btn);
    });
    list.parentNode.insertBefore(rail, list);

    function mark() {
      var box = list.getBoundingClientRect();
      var first = true;
      buttons.forEach(function (btn, i) {
        var r = cards[i].getBoundingClientRect();
        var seen = Math.min(r.right, box.right) - Math.max(r.left, box.left);
        var on = r.width > 0 && seen / r.width > 0.5;
        btn.classList.toggle('is-current', on);
        if (on && first) { btn.setAttribute('aria-current', 'step'); first = false; }
        else btn.removeAttribute('aria-current');
      });
    }
    function fit() {
      // A row that scrolls, not a wide grid whose curve runs past its edge.
      var scrolls = getComputedStyle(list).overflowX !== 'visible';
      if (scrolls && list.scrollWidth > list.clientWidth + 1) list.tabIndex = 0;
      else list.removeAttribute('tabindex');
      mark();
    }
    function once(fn) {
      var queued = false;
      return function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; fn(); });
      };
    }
    list.addEventListener('scroll', once(mark), { passive: true });
    window.addEventListener('resize', once(fit));
    fit();
  });

  var feet = document.querySelectorAll('.svc-short, .ia-short');
  if (!still.matches && 'IntersectionObserver' in window) {
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        watch.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    Array.prototype.forEach.call(feet, function (foot) {
      foot.classList.add('is-armed');
      watch.observe(foot);
    });
  }
})();
