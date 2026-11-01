/* inspiration-to-aisle.js -- the service map's presses, and nothing
   else. One page loads it, lab/inspiration-to-aisle.html.

   THE VIEW. The map has a Today lane and a Connected lane. Without this
   script both show and the switch stays hidden; with it the switch
   appears, the figure carries .is-today or .is-connected, and the CSS
   shows one lane. Today is where it starts, because the seam is the
   page's argument.

   STEPPING THROUGH, FROM 64rem. Since 2026-11-01 "Step through the trip"
   opens one moment at a time: its column widens on the tea-light ground
   and the other five fold to strips that keep their drawing, their disc,
   the confidence dots and the thread line, so the trip keeps its shape
   while one moment is read at full size (inspiration-to-aisle.css,
   "Stepping through"). A bar stuck to the foot of the window steps it.
   The arrow keys step and Escape closes while it is open, and a moment's
   name or a folded drawing opens that moment. The script writes the
   track list, with the open moment's share of the width in it, and the
   storyboard row's height, so the open drawing keeps its 3:2.

   FOLLOWING A MOMENT, UNDER 64rem. Each moment's name becomes a button;
   pressed under 64rem, its card takes the tea-light ground, and pressing
   it again lets it go. One moment at a time. From 64rem the same button
   opens the moment instead.

   Following changes no words, only which card is lit. Stepping hides a
   folded strip's words from a screen reader as well as from the eye,
   because a strip is a place in the trip and not a cell to read; the
   moment's name stays, as a button that opens it, and the bar announces
   each moment it opens. */
(function () {
  var map = document.querySelector('.ia-map');
  if (!map) return;
  var matrix = map.querySelector('.ia-matrix');
  var wide = window.matchMedia('(min-width: 64rem)');

  var view = map.querySelector('.ia-view');
  var buttons = view ? view.querySelectorAll('[data-view]') : [];
  function show(which) {
    map.classList.toggle('is-today', which === 'today');
    map.classList.toggle('is-connected', which === 'connected');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-view') === which));
    }
  }
  if (view) {
    view.hidden = false;
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () { show(this.getAttribute('data-view')); });
    }
    show('today');
  }

  var moments = [].slice.call(map.querySelectorAll('.ia-moment'));
  var n = moments.length;
  var picks = moments.map(function (moment, m) {
    var name = moment.querySelector('.ia-moment-name');
    var pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'ia-moment-pick';
    pick.setAttribute('data-moment', String(m + 1));
    pick.setAttribute('aria-pressed', 'false');
    while (name.firstChild) pick.appendChild(name.firstChild);
    name.appendChild(pick);
    return pick;
  });
  function press(lit) {
    picks.forEach(function (p, j) { p.setAttribute('aria-pressed', String(j === lit)); });
  }

  /* Following, under 64rem. */
  var followed = -1;
  function follow(i) {
    followed = followed === i ? -1 : i;
    moments.forEach(function (moment, j) { moment.classList.toggle('is-followed', j === followed); });
    press(followed);
  }

  /* Stepping, from 64rem: the way in, beside the view switch, and the bar
     under the grid. */
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
  var back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>';
  var cross = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';

  var toolbar = document.createElement('div');
  toolbar.className = 'ia-toolbar';
  if (view) {
    view.parentNode.insertBefore(toolbar, view);
    toolbar.appendChild(view);
  } else {
    matrix.parentNode.insertBefore(toolbar, map.querySelector('.ia-phases') || matrix);
  }
  var start = document.createElement('button');
  start.type = 'button';
  start.className = 'ia-step-start';
  start.innerHTML = 'Step through the trip' + arrow;
  toolbar.appendChild(start);

  var bar = document.createElement('div');
  bar.className = 'ia-stepper';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Step through the trip');
  bar.innerHTML =
    '<button type="button" class="ia-step-btn ia-step-prev" aria-label="Previous moment">' + back + '</button>' +
    '<p class="ia-step-count" aria-live="polite"><span class="ia-step-of"></span><span class="ia-step-name"></span></p>' +
    '<button type="button" class="ia-step-btn ia-step-next"><span class="ia-step-next-label">Next</span>' + arrow + '</button>' +
    '<button type="button" class="ia-step-btn ia-step-close" aria-label="Show the whole map">' + cross + '</button>';
  matrix.parentNode.insertBefore(bar, matrix.nextSibling);
  var prev = bar.querySelector('.ia-step-prev');
  var next = bar.querySelector('.ia-step-next');
  var nextLabel = bar.querySelector('.ia-step-next-label');
  var close = bar.querySelector('.ia-step-close');
  var of = bar.querySelector('.ia-step-of');
  var said = bar.querySelector('.ia-step-name');

  var open = -1;
  function share() { return parseFloat(getComputedStyle(map).getPropertyValue('--ia-open')) || 1; }
  function tracks() {
    var w = share();
    return 'var(--ia-names) ' + moments.map(function (moment, j) {
      return 'minmax(0, ' + (j === open ? w : 1) + 'fr)';
    }).join(' ');
  }
  /* The storyboard row: two thirds of the width the open column will
     have once it has opened, not the width it has now, mid-glide. */
  function stage() {
    var cs = getComputedStyle(matrix);
    var gap = parseFloat(cs.columnGap) || 0;
    var names = parseFloat(cs.gridTemplateColumns) || 0;
    var free = matrix.clientWidth - names - n * gap;
    var w = free * share() / (share() + n - 1);
    map.style.setProperty('--ia-stage-h', Math.round(w * 2 / 3) + 'px');
  }

  /* The confidence curve is one SVG drawn for six equal columns. While
     the columns glide, its points follow the dots, which sit in their own
     cells and so are always where their moment is. */
  var curve = map.querySelector('.ia-curve');
  var lines = curve ? [].slice.call(curve.querySelectorAll('polyline')) : [];
  var drawn = lines.map(function (l) { return l.getAttribute('points'); });
  var heights = drawn.map(function (p) {
    return p.trim().split(/\s+/).map(function (pt) { return pt.split(',')[1]; });
  });
  var feels = moments.map(function (moment) { return moment.querySelector('.ia-lane--feel dd'); });
  var VIEWBOX = curve ? curve.viewBox.baseVal.width : 0;
  function redraw() {
    if (!curve) return;
    var gap = parseFloat(getComputedStyle(matrix).columnGap) || 0;
    var first = feels[0].getBoundingClientRect();
    var last = feels[n - 1].getBoundingClientRect();
    var left = first.left - gap / 2;
    var width = last.right + gap / 2 - left;
    if (!width) return;
    curve.style.width = width + 'px';
    var xs = feels.map(function (dd) {
      var r = dd.getBoundingClientRect();
      return ((r.left + r.width / 2 - left) / width * VIEWBOX).toFixed(1);
    });
    lines.forEach(function (l, i) {
      l.setAttribute('points', xs.map(function (x, j) { return x + ',' + heights[i][j]; }).join(' '));
    });
  }
  function settle() {
    curve.style.width = '';
    lines.forEach(function (l, i) { l.setAttribute('points', drawn[i]); });
  }
  /* For as long as the glide runs, read off the grid itself. */
  var gliding = 0;
  function glide() {
    if (!curve) return;
    var token = ++gliding;
    var until = performance.now() + (parseFloat(getComputedStyle(matrix).transitionDuration) || 0) * 1000 + 100;
    (function frame() {
      if (token !== gliding) return;
      redraw();
      if (performance.now() < until) requestAnimationFrame(frame);
      else if (open < 0) settle();
    })();
  }

  function paint() {
    map.style.setProperty('--ia-cols', tracks());
    map.style.setProperty('--ia-at', String(Math.max(open, 0)));
    map.classList.toggle('is-stepping', open >= 0);
    moments.forEach(function (moment, j) { moment.classList.toggle('is-open', j === open); });
    press(open);
    if (open >= 0) {
      of.textContent = pad(open) + ' / ' + pad(n - 1);
      said.textContent = picks[open].textContent.replace(/^\s*\d+\s*/, '');
      prev.setAttribute('aria-disabled', String(open === 0));
      nextLabel.textContent = open === n - 1 ? 'See it all' : 'Next';
      if (open === 0 && document.activeElement === prev) next.focus();
    }
    glide();
  }
  function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }
  function step(i) {
    if (!wide.matches) return;
    var was = open;
    open = Math.max(0, Math.min(n - 1, i));
    stage();
    paint();
    if (was < 0) {
      document.addEventListener('keydown', keys);
      if (document.activeElement === start) next.focus();
    }
  }
  function stop() {
    if (open < 0) return;
    var inside = bar.contains(document.activeElement);
    open = -1;
    paint();
    document.removeEventListener('keydown', keys);
    if (inside) start.focus();
  }
  function keys(e) {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight' && open < n - 1) { e.preventDefault(); step(open + 1); }
    else if (e.key === 'ArrowLeft' && open > 0) { e.preventDefault(); step(open - 1); }
    else if (e.key === 'Escape') stop();
  }

  start.addEventListener('click', function () { step(0); });
  prev.addEventListener('click', function () { if (open > 0) step(open - 1); });
  next.addEventListener('click', function () { if (open < 0) return; if (open === n - 1) stop(); else step(open + 1); });
  close.addEventListener('click', stop);
  picks.forEach(function (pick, i) {
    pick.addEventListener('click', function () { if (wide.matches) step(i); else follow(i); });
  });
  moments.forEach(function (moment, i) {
    var scenes = moment.querySelectorAll('.ia-scene');
    for (var s = 0; s < scenes.length; s++) {
      scenes[s].addEventListener('click', function () { if (open >= 0 && open !== i) step(i); });
    }
  });

  /* Crossing 64rem either way lets go of what the other width had. */
  wide.addEventListener('change', function () {
    if (wide.matches && followed >= 0) follow(followed);
    else if (!wide.matches) stop();
  });
  window.addEventListener('resize', function () { if (open >= 0) { stage(); redraw(); } });

  map.style.setProperty('--ia-cols', tracks());
  map.classList.add('can-step');
})();
