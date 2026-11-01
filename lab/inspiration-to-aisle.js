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
   track list, with the open moment's share of the width in it; the
   storyboard row's height, so the open drawing keeps its 3:2; the open
   column's width, at which every cell is laid out so that no row changes
   height from one moment to the next; and where the tea ground is, so it
   slides from the column it was on to the next one instead of jumping.

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
    /* The disc, and the words in a span of their own, which stepping
       holds to two lines (inspiration-to-aisle.css). */
    var label = document.createElement('span');
    label.className = 'ia-moment-label';
    while (name.firstChild) {
      var node = name.firstChild;
      if (node.nodeType === 1 && node.classList.contains('ia-n')) pick.appendChild(node);
      else label.appendChild(node);
    }
    pick.appendChild(label);
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
    '<p class="ia-step-count" aria-live="polite"><span class="ia-step-of"></span><span class="ia-step-name"><span></span>' +
      picks.map(function (p) { return '<span aria-hidden="true">' + p.querySelector('.ia-moment-label').textContent.trim() + '</span>'; }).join('') + '</span></p>' +
    '<button type="button" class="ia-step-btn ia-step-next"><span class="ia-step-next-label"><span>Next</span><span aria-hidden="true">See it all</span></span>' + arrow + '</button>' +
    '<button type="button" class="ia-step-btn ia-step-close" aria-label="Show the whole map">' + cross + '</button>';
  matrix.parentNode.insertBefore(bar, matrix.nextSibling);
  var prev = bar.querySelector('.ia-step-prev');
  var next = bar.querySelector('.ia-step-next');
  var nextSays = bar.querySelectorAll('.ia-step-next-label > span');
  var close = bar.querySelector('.ia-step-close');
  var of = bar.querySelector('.ia-step-of');
  var said = bar.querySelector('.ia-step-name > span');

  var open = -1;
  var labels = picks.map(function (p) { return p.querySelector('.ia-moment-label').textContent.trim(); });
  function share() { return parseFloat(getComputedStyle(map).getPropertyValue('--ia-open')) || 1; }
  function tracks() {
    var w = share();
    return 'var(--ia-names) ' + moments.map(function (moment, j) {
      return 'minmax(0, ' + (j === open ? w : 1) + 'fr)';
    }).join(' ');
  }
  /* The widths the columns are gliding to, not the ones they have now:
     the open column's sets the storyboard row (two thirds of it, so the
     open drawing keeps its 3:2) and the width every cell is laid out at. */
  var folded = 0, opened = 0;
  function stage() {
    var cs = getComputedStyle(matrix);
    var gap = parseFloat(cs.columnGap) || 0;
    var names = parseFloat(cs.gridTemplateColumns) || 0;
    var free = matrix.clientWidth - names - n * gap;
    opened = free * share() / (share() + n - 1);
    folded = free / (share() + n - 1);
    map.style.setProperty('--ia-stage-h', Math.round(opened * 2 / 3) + 'px');
    map.style.setProperty('--ia-open-w', Math.floor(opened) + 'px');
  }

  /* Each cell's words in a box of their own while stepping, laid out at
     the open width whether shown or not, and put back after. The dots and
     the curve stay where they were, in the cell's own box. */
  function wrap() {
    [].forEach.call(matrix.querySelectorAll('.ia-lane dd'), function (dd) {
      var cell = document.createElement('div');
      cell.className = 'ia-cell';
      [].slice.call(dd.childNodes).forEach(function (node) {
        if (node.nodeType === 1 && (node.classList.contains('ia-dot') || node.classList.contains('ia-curve'))) return;
        cell.appendChild(node);
      });
      dd.appendChild(cell);
    });
  }
  function unwrap() {
    [].forEach.call(matrix.querySelectorAll('.ia-cell'), function (cell) {
      while (cell.firstChild) cell.parentNode.insertBefore(cell.firstChild, cell);
      cell.parentNode.removeChild(cell);
    });
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
    if (!curve) return;
    curve.style.width = '';
    lines.forEach(function (l, i) { l.setAttribute('points', drawn[i]); });
  }

  /* The tea ground. Mid-glide it is between where it was at the press
     and the column it is going to, by how far that column has opened, so
     it slides across with the columns rather than jumping to a strip and
     growing there. From where it was, not from a column: a press in the
     middle of a glide starts from the middle. */
  var heads = moments.map(function (moment) { return moment.querySelector('.ia-moment-name'); });
  var sx = 0, sw = 0, fromX = 0, fromW = 0, startW = 0, sliding = false;
  function column(i) {
    var r = heads[i].getBoundingClientRect();
    return { x: r.left - matrix.getBoundingClientRect().left, w: r.width };
  }
  function spot() {
    if (open < 0) return;
    var to = column(open);
    var x = to.x, w = to.w;
    if (sliding) {
      var p = opened - startW > 1 ? Math.max(0, Math.min(1, (to.w - startW) / (opened - startW))) : 1;
      x = fromX + (to.x - fromX) * p;
      w = fromW + (to.w - fromW) * p;
    }
    sx = x; sw = w;
    matrix.style.setProperty('--ia-spot-x', x.toFixed(1) + 'px');
    matrix.style.setProperty('--ia-spot-w', w.toFixed(1) + 'px');
  }

  /* For as long as the glide runs, read off the grid itself. */
  var gliding = 0;
  function glide() {
    var token = ++gliding;
    var until = performance.now() + (parseFloat(getComputedStyle(matrix).transitionDuration) || 0) * 1000 + 100;
    (function frame() {
      if (token !== gliding) return;
      redraw();
      spot();
      if (performance.now() < until) { requestAnimationFrame(frame); return; }
      if (open < 0) settle();
    })();
  }

  function paint() {
    map.style.setProperty('--ia-cols', tracks());
    map.classList.toggle('is-stepping', open >= 0);
    moments.forEach(function (moment, j) { moment.classList.toggle('is-open', j === open); });
    press(open);
    if (open >= 0) {
      of.textContent = pad(open) + ' / ' + pad(n - 1);
      said.textContent = labels[open];
      prev.setAttribute('aria-disabled', String(open === 0));
      nextSays[0].setAttribute('aria-hidden', String(open === n - 1));
      nextSays[1].setAttribute('aria-hidden', String(open !== n - 1));
      if (open === 0 && document.activeElement === prev) next.focus();
    }
    glide();
  }
  function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }
  function step(i) {
    if (!wide.matches) return;
    var first = open < 0;
    var to = Math.max(0, Math.min(n - 1, i));
    if (first) wrap();
    sliding = !first;
    if (sliding) { fromX = sx; fromW = sw; startW = column(to).w; }
    open = to;
    stage();
    paint();
    if (first) {
      document.addEventListener('keydown', keys);
      if (document.activeElement === start) next.focus();
    }
  }
  /* Leaving cuts straight back to the whole map, with no glide: the map
     at rest wraps every word to its narrow column, and a glide would show
     every one of them rewrapping. */
  function stop() {
    if (open < 0) return;
    var inside = bar.contains(document.activeElement);
    open = -1;
    sliding = false;
    map.classList.add('is-leaving');
    paint();
    unwrap();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { map.classList.remove('is-leaving'); });
    });
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
  window.addEventListener('resize', function () { if (open >= 0) { stage(); redraw(); sliding = false; spot(); } });

  map.style.setProperty('--ia-cols', tracks());
  map.classList.add('can-step');
})();
