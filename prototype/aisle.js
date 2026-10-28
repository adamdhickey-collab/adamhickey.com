/* aisle.js -- The Shortlist prototype: one shopping trip,
   from a photo at a friend's home to a store aisle, as seven screens at a
   phone's width. Loaded by prototype/aisle.html and nothing else.

   EVERYTHING HERE IS SAMPLE DATA, and it says so on every screen. The lamps,
   the store, the shelf counts and the employee are made up; no retailer's
   inventory, no image search and no model is connected. "Find lamps like
   this" does not look at a photo: it shows the four results written below,
   in the order written. What the prototype is for is the transition the
   write-up (lab/inspiration-to-aisle.html) argues about: what a person
   carries from home into the store, what the app says when it is not sure,
   and when a person is more useful than the app.

   SHAPE. A state object (which screen, what is saved, what is hidden), a
   render per screen built from the data at the top, and one place that
   swaps screens, moves focus and announces the change. The lamp pictures
   are product shots drawn in ChatGPT, one sheet cut into four.

   WHAT THE CHECKS SEE. The screens after the first exist only after a press,
   so scripts/lib/reachable.mjs registers each of them, with the presses that
   reach it from a fresh load. Every press is a [data-go], [data-save],
   [data-why] or [data-reject] hook, kept stable for that reason. State is
   carried on attributes (aria-pressed, aria-current, hidden), not on .is-*
   classes, because states.mjs reads an .is-* class as a state to force. */
(function () {
  'use strict';

  var root = document.querySelector('[data-aisle]');
  if (!root) return;

  /* ---------- the sample data ---------- */

  var PHOTO = {
    where: 'Your friend’s living room',
    when: 'Saturday, 7:12 pm',
    seen: 'A tall tripod lamp with a linen drum shade and wooden legs, standing by the sofa.'
  };

  var STORE = {
    name: 'Marigold Home',
    branch: 'Roseville',
    distance: '4.1 miles',
    hours: 'Open until 9 tonight',
    other: { branch: 'Woodbury', distance: '12 miles', count: 4, counted: 'today' }
  };

  /* Each lamp carries what the shopper can compare, where it stands in the
     store, the shelf count with its age, and how it matched the photo: a
     level in plain words and the reasons behind it. */
  var LAMPS = [
    { id: 'hollis', name: 'Hollis tripod floor lamp', price: 139, height: 62, shade: 'Linen drum, 18 in', legs: 'Walnut', dimmable: 'Yes', bulb: 'Included',
      aisle: 'Aisle 14, bay 3',
      stock: { count: 3, counted: 'counted this morning at 9:40', stale: false },
      level: 'Close match', tone: 'close',
      line: 'Same shade shape and leg finish. About 2 inches shorter than the one in your photo looks.',
      why: ['The shade is a linen drum, like the one in the photo.', 'The legs are walnut, like the ones in the photo.', 'Height is a guess from one photo. The sofa beside it suggests about 64 inches; this one is 62.'],
      art: 'aisle-lamp-hollis.webp' },
    { id: 'bexley', name: 'Bexley tripod floor lamp', price: 89, height: 60, shade: 'Linen drum, 17 in', legs: 'Black metal', dimmable: 'No', bulb: 'Not included',
      aisle: 'Aisle 14, bay 5',
      stock: { count: 1, counted: 'last counted 2 days ago', stale: true },
      level: 'Similar shape, different finish', tone: 'near',
      line: 'Same linen drum shade. The legs are black metal, not wood, and it costs $50 less.',
      why: ['The shade matches: a linen drum about the same width.', 'The legs are black metal. The photo shows wood, so this is a different look up close.', 'It does not dim, and the bulb is sold separately.'],
      art: 'aisle-lamp-bexley.webp' },
    { id: 'rowan', name: 'Rowan arc floor lamp', price: 179, height: 72, shade: 'Cream dome, 14 in', legs: 'Brass arc', dimmable: 'Yes', bulb: 'Included',
      aisle: 'Aisle 15, bay 1',
      stock: { count: 6, counted: 'counted this morning at 9:40', stale: false },
      level: 'A stretch', tone: 'far',
      line: 'The same warm room feel, in a different shape: one brass arc instead of three legs.',
      why: ['The shade is warm and fabric, which is most of what reads from across a room.', 'The shape is different: an arc over a seat, not a tripod beside one.', 'A foot taller than the photo suggests.'],
      art: 'aisle-lamp-rowan.webp' },
    { id: 'linden', name: 'Linden tripod table lamp', price: 59, height: 18, shade: 'Linen drum, 10 in', legs: 'Walnut', dimmable: 'No', bulb: 'Included',
      aisle: 'Aisle 12, bay 2',
      stock: { count: 8, counted: 'counted this morning at 9:40', stale: false },
      level: 'Same look, table size', tone: 'far',
      line: 'The same shade and legs at a third of the height. Probably not what you saw.',
      why: ['The shade and legs match the photo closely.', 'It is 18 inches tall. Your photo shows the lamp standing on the floor.', 'Listed because the look matches, in case the size was the point.'],
      art: 'aisle-lamp-linden.webp' }
  ];

  var byId = {};
  LAMPS.forEach(function (l) { byId[l.id] = l; });

  /* The one the store turns out not to have on the shelf. Chosen rather than
     random, so the story is the same for every reader and every check. */
  var MISSING = 'bexley';

  /* ---------- state ---------- */

  var state = { screen: 'home', saved: [], hidden: [], lastHidden: null, compare: false };

  /* The two halves of the trip. The progress line over the screens names
     them, and marks the one the reader is in. */
  var HALF = { home: 'home', results: 'home', plan: 'home', store: 'store', missing: 'store', help: 'store', done: 'store' };

  /* ---------- the lamps' pictures ----------
     Product shots drawn in ChatGPT as one 2 x 2 sheet, so the four share a
     light and a hand, and cut to 4:5 with each lamp at the same height in
     its frame. Every picture is alt=""; the name beside it is the text. */
  function lamp(art) {
    return '<img class="ai-art" src="../img/lab/' + art + '?v=1" width="240" height="300" decoding="async" alt="">';
  }

  /* ---------- the title's badge ----------
     A small drawing in a circle beside the title on the two screens that
     are a place: the friend's house and the store. Drawn in ChatGPT as one
     sheet and cut by scripts/aisle-badges.mjs; alt="", the title is the text. */
  function titled(kind, title) {
    return '<div class="ai-head-row"><img class="ai-badge" src="../img/lab/aisle-badge-' + kind + '.webp?v=1" width="192" height="192" decoding="async" alt="">' +
      '<h3 class="ai-title" tabindex="-1">' + title + '</h3></div>';
  }

  /* ---------- small helpers ---------- */

  function dollars(n) { return '$' + n; }
  function isSaved(id) { return state.saved.indexOf(id) !== -1; }
  function isHidden(id) { return state.hidden.indexOf(id) !== -1; }
  function savedLamps() { return state.saved.map(function (id) { return byId[id]; }); }

  function stockLine(l) {
    var n = l.stock.count === 1 ? '1 on the shelf' : l.stock.count + ' on the shelf';
    return '<span class="ai-stock' + (l.stock.stale ? ' ai-stock--stale' : '') + '">' + n + ', ' + l.stock.counted + '</span>';
  }

  function back(to, label) {
    return '<button type="button" class="ai-back" data-go="' + to + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>' +
      label + '</button>';
  }

  /* ---------- the screens ---------- */

  var screens = {};

  screens.home = function () {
    return '<header class="ai-head">' + titled('house', 'At your friend’s house') +
      '<p class="ai-dek">You like her lamp. Take a picture before you forget it.</p></header>' +
      '<figure class="ai-photo">' +
        '<div class="ai-photo-frame"><img class="ai-photo-img" src="../img/lab/aisle-maya-photo.webp?v=1" width="1200" height="900" decoding="async" alt="The lamp in your friend’s living room, lit, between a side table and the sofa."></div>' +
        '<figcaption class="ai-photo-cap"><span class="ai-photo-when">' + PHOTO.when + ' · ' + PHOTO.where + '</span>' + PHOTO.seen + '</figcaption>' +
      '</figure>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="results">Find lamps like this</button></p>' +
      '<p class="ai-fine">Aisle is a made-up shopping companion for a made-up store. Every lamp, count and person here is sample data, and nothing looks at a real photo.</p>';
  };

  screens.results = function () {
    var shown = LAMPS.filter(function (l) { return !isHidden(l.id); });
    var n = state.saved.length;
    var s = back('home', 'Photo') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Lamps like this one</h3>' +
      '<p class="ai-dek">' + shown.length + ' of 4 from your photo. Save one or two to compare in the store.</p></header>';
    if (state.lastHidden && isHidden(state.lastHidden)) {
      s += '<p class="ai-undo" role="status">Hidden: ' + byId[state.lastHidden].name + '. <button type="button" class="ai-link" data-unhide="' + state.lastHidden + '">Undo</button></p>';
    }
    s += '<ul class="ai-results">';
    shown.forEach(function (l) {
      var saved = isSaved(l.id);
      s += '<li class="ai-card" data-lamp="' + l.id + '"' + (saved ? ' data-saved' : '') + '>' +
        '<div class="ai-card-art">' + lamp(l.art) + '</div>' +
        '<div class="ai-card-body">' +
          '<p class="ai-card-name">' + l.name + ' <span class="ai-card-price">' + dollars(l.price) + '</span></p>' +
          '<p class="ai-level ai-level--' + l.tone + '">' + l.level + '</p>' +
          '<p class="ai-card-line">' + l.line + '</p>' +
          '<details class="ai-why"><summary class="disclosure-row ai-why-row"><svg class="disclosure-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg><span data-why="' + l.id + '">Why this one</span></summary>' +
            '<ul class="ai-why-list">' + l.why.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></details>' +
          '<p class="ai-card-acts">' +
            '<button type="button" class="ai-chip" data-save="' + l.id + '" aria-pressed="' + saved + '">' + (saved ? 'Saved' : 'Save') + '</button>' +
            '<button type="button" class="ai-chip ai-chip--quiet" data-reject="' + l.id + '">Not it</button>' +
          '</p>' +
        '</div></li>';
    });
    s += '</ul>';
    if (shown.length === 0) {
      s += '<p class="ai-empty">You hid all four. Undo one, or <button type="button" class="ai-link" data-reset-hidden>bring them all back</button>.</p>';
    }
    s += '<p class="ai-note">Matches come from the shape and color in the photo. A photo does not say how tall a lamp is, so every height here is a guess, and the list says so where it matters.</p>';
    if (n > 0) {
      s += '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="plan">Plan a store trip<span class="ai-btn-count">' + n + ' saved</span></button></p>';
    } else {
      s += '<p class="ai-fine">Save a lamp and the trip can be planned from here.</p>';
    }
    return s;
  };

  screens.plan = function () {
    var s = back('results', 'Results') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Before you go</h3>' +
      '<p class="ai-dek">What you saved travels with you. So do the counts, with their age.</p></header>' +
      '<div class="ai-store"><p class="ai-store-name">' + STORE.name + ' · ' + STORE.branch + '</p><p class="ai-store-meta">' + STORE.distance + ' · ' + STORE.hours + '</p></div>' +
      '<ul class="ai-saved">';
    savedLamps().forEach(function (l) {
      s += '<li class="ai-saved-item"><div class="ai-saved-art">' + lamp(l.art) + '</div><div><p class="ai-saved-name">' + l.name + ' <span class="ai-card-price">' + dollars(l.price) + '</span></p>' +
        '<p class="ai-saved-where">' + l.aisle + '</p><p class="ai-saved-stock">' + stockLine(l) + '</p></div></li>';
    });
    s += '</ul>' +
      '<p class="ai-note">Shelf counts come from the store’s system and can lag what is on the shelf. A count from two days ago is marked, and the app checks again when you arrive.</p>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="store">I’m at the store</button></p>' +
      '<p class="ai-fine">This button stands in for arriving. A real app would ask to use your location, and would work without it.</p>';
    return s;
  };

  screens.store = function () {
    var saved = savedLamps();
    var s = back('plan', 'Before you go') +
      '<header class="ai-head">' + titled('store', 'In the store') +
      '<p class="ai-dek">Your photo and your list came in with you. The lamps are in Aisle 14, near the back wall.</p></header>' +
      '<ul class="ai-saved">';
    saved.forEach(function (l) {
      s += '<li class="ai-saved-item"><div class="ai-saved-art">' + lamp(l.art) + '</div><div><p class="ai-saved-name">' + l.name + ' <span class="ai-card-price">' + dollars(l.price) + '</span></p>' +
        '<p class="ai-saved-where">' + l.aisle + '</p><p class="ai-saved-stock">' + stockLine(l) + '</p></div></li>';
    });
    s += '</ul>';
    if (saved.length > 1) {
      s += '<p class="ai-row"><button type="button" class="ai-chip" data-go="compare" aria-pressed="' + state.compare + '" aria-controls="ai-compare">' + (state.compare ? 'Hide the comparison' : 'Compare side by side') + '</button></p>';
      s += '<div id="ai-compare"' + (state.compare ? '' : ' hidden') + '>' + compareTable(saved) + '</div>';
    }
    s += '<p class="ai-row">' +
      (byId[MISSING] && isSaved(MISSING) ? '<button type="button" class="ai-chip" data-go="missing">I don’t see the ' + byId[MISSING].name.split(' ')[0] + '</button>' : '<button type="button" class="ai-chip" data-go="missing">One of these isn’t on the shelf</button>') +
      '<button type="button" class="ai-chip" data-go="help">Ask someone in Home</button></p>' +
      '<p class="ai-note">Nothing here decides for you. The app carries what you found at home and says how sure it is about the shelf; the choice, and who to ask, stays with you.</p>';
    return s;
  };

  function compareTable(lamps) {
    var rows = [
      ['Height', function (l) { return l.height + ' in'; }],
      ['Shade', function (l) { return l.shade; }],
      ['Legs', function (l) { return l.legs; }],
      ['Dims', function (l) { return l.dimmable; }],
      ['Bulb', function (l) { return l.bulb; }],
      ['Price', function (l) { return dollars(l.price); }],
      ['Where', function (l) { return l.aisle; }]
    ];
    var s = '<table class="ai-table"><caption class="visually-hidden">Your saved lamps, compared</caption><thead><tr><th scope="col"><span class="visually-hidden">Feature</span></th>';
    lamps.forEach(function (l) { s += '<th scope="col">' + l.name.split(' ')[0] + '</th>'; });
    s += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      s += '<tr><th scope="row">' + r[0] + '</th>';
      lamps.forEach(function (l) { s += '<td>' + r[1](l) + '</td>'; });
      s += '</tr>';
    });
    return s + '</tbody></table>';
  }

  screens.missing = function () {
    var m = byId[MISSING];
    var kept = savedLamps().filter(function (l) { return l.id !== MISSING; });
    var alt = byId.rowan;
    var s = back('store', 'In the store') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">The ' + m.name.split(' ')[0] + ' isn’t on the shelf</h3>' +
      '<p class="ai-dek">The count said 1, two days ago. A count that old is a guess about today, and the shelf is the truth.</p></header>' +
      '<ul class="ai-alts">';
    if (kept.length) {
      var k = kept[0];
      s += '<li class="ai-alt"><p class="ai-alt-name">Take the ' + k.name.split(' ')[0] + ', ' + k.aisle.toLowerCase() + '</p><p class="ai-alt-line">' + (k.id === 'hollis' ? 'It is the closer match to your photo anyway: walnut legs, and it dims. $50 more.' : k.line) + '</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-go="done">Choose it</button></p></li>';
    }
    s += '<li class="ai-alt"><p class="ai-alt-name">Order the ' + m.name.split(' ')[0] + ' to your door</p><p class="ai-alt-line">Arrives Thursday. The price is the same as on the shelf.</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-go="done">Order it</button></p></li>' +
      '<li class="ai-alt"><p class="ai-alt-name">See the ' + alt.name.split(' ')[0] + ', ' + alt.aisle.toLowerCase() + '</p><p class="ai-alt-line">Same linen shade, a different shape: one brass arc instead of three legs. ' + alt.stock.count + ' on the shelf, ' + alt.stock.counted + '.</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-go="done">Walk over</button></p></li>' +
      '<li class="ai-alt"><p class="ai-alt-name">Try ' + STORE.name + ', ' + STORE.other.branch + '</p><p class="ai-alt-line">' + STORE.other.distance + ' away. It shows ' + STORE.other.count + ' on the shelf, counted ' + STORE.other.counted + '.</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-go="done">Save for later</button></p></li>' +
      '</ul>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="help">Ask someone in Home</button></p>' +
      '<p class="ai-note">Four ways forward, each saying how it differs from what you came for. None is picked for you, and the person is one press away when the list is not enough.</p>';
    return s;
  };

  screens.help = function () {
    var m = byId[MISSING];
    var s = back('store', 'In the store') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Dana is on the way</h3>' +
      '<p class="ai-dek">Dana works in Home and is coming to Aisle 14. About 3 minutes.</p></header>' +
      '<div class="ai-person"><p class="ai-person-label">What Dana sees</p><ul class="ai-person-list">' +
        '<li>Your photo, and the lamp you are after</li>' +
        '<li>The ' + savedLamps().map(function (l) { return l.name.split(' ')[0]; }).join(' and ') + ', and what you compared</li>' +
        '<li>That the ' + m.name.split(' ')[0] + ' wasn’t on the shelf</li>' +
      '</ul><p class="ai-person-note">Nothing else: not your name, not your account, not what you have bought before. Dana can check the back room, which the app cannot.</p></div>' +
      '<p class="ai-row"><button type="button" class="ai-chip" data-go="store">Keep browsing instead</button><button type="button" class="ai-chip" data-go="done">Done</button></p>' +
      '<p class="ai-note">The app stepped back here on purpose. A shelf, a back room and a judgment call about a near match are things a person settles faster than a screen does.</p>';
    return s;
  };

  screens.done = function () {
    return '<header class="ai-head"><h3 class="ai-title" tabindex="-1">That’s the trip</h3>' +
      '<p class="ai-dek">A photo at a friend’s, four matches with their reasons, two saved, one missing from the shelf, and a person when the list ran out.</p></header>' +
      '<ul class="ai-person-list ai-done-list">' +
        '<li>Your context traveled: the photo, the list and the comparison were in the aisle with you.</li>' +
        '<li>Every match said why, and how sure it was.</li>' +
        '<li>Saying no was one press, and undoable.</li>' +
        '<li>A person joined when a person was more useful.</li>' +
      '</ul>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-reset>Start over</button></p>' +
      '<p class="ai-fine">Sample data throughout. The write-up says what would be tested first, and what would prove this wrong.</p>';
  };

  /* ---------- rendering ---------- */

  var stage = root.querySelector('[data-aisle-stage]');
  var status = root.querySelector('[data-aisle-status]');
  var steps = root.querySelectorAll('[data-aisle-half]');
  var TITLES = { home: 'At your friend’s house', results: 'Lamps like this one', plan: 'Before you go', store: 'In the store', missing: 'A lamp not on the shelf', help: 'A person joins', done: 'The trip, done' };

  function render(opts) {
    opts = opts || {};
    stage.innerHTML = screens[state.screen]();
    stage.setAttribute('data-screen', state.screen);
    /* A new screen arrives; a re-render in place (a save, a hide) does not. */
    stage.classList.toggle('ai-arrive', !!opts.arrive);
    var half = HALF[state.screen];
    Array.prototype.forEach.call(steps, function (el) {
      if (el.getAttribute('data-aisle-half') === half) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    if (opts.announce !== false) {
      status.textContent = 'Showing: ' + TITLES[state.screen];
    }
    if (opts.focus !== false) {
      var h = stage.querySelector('.ai-title');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function go(screen) {
    if (!screens[screen]) return;
    state.screen = screen;
    render({ arrive: true });
  }

  /* ---------- presses ---------- */

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-why]');
    if (!t || !root.contains(t)) return;

    if (t.hasAttribute('data-go')) {
      var to = t.getAttribute('data-go');
      if (to === 'compare') {
        state.compare = !state.compare;
        render({ focus: false, announce: false });
        var btn = stage.querySelector('[data-go="compare"]');
        if (btn) btn.focus();
        status.textContent = state.compare ? 'Comparison shown' : 'Comparison hidden';
        return;
      }
      go(to);
      return;
    }
    if (t.hasAttribute('data-save')) {
      var id = t.getAttribute('data-save');
      if (isSaved(id)) state.saved.splice(state.saved.indexOf(id), 1);
      else state.saved.push(id);
      render({ focus: false, announce: false });
      var again = stage.querySelector('[data-save="' + id + '"]');
      if (again) again.focus();
      status.textContent = (isSaved(id) ? 'Saved ' : 'Removed ') + byId[id].name + '. ' + state.saved.length + ' saved.';
      return;
    }
    if (t.hasAttribute('data-reject')) {
      var rid = t.getAttribute('data-reject');
      if (!isHidden(rid)) state.hidden.push(rid);
      if (isSaved(rid)) state.saved.splice(state.saved.indexOf(rid), 1);
      state.lastHidden = rid;
      render({ focus: false, announce: false });
      var undo = stage.querySelector('[data-unhide]');
      if (undo) undo.focus();
      return;
    }
    if (t.hasAttribute('data-unhide')) {
      var uid = t.getAttribute('data-unhide');
      state.hidden = state.hidden.filter(function (x) { return x !== uid; });
      state.lastHidden = null;
      render({ focus: false, announce: false });
      var card = stage.querySelector('[data-lamp="' + uid + '"] [data-save]');
      if (card) card.focus();
      status.textContent = 'Brought back ' + byId[uid].name + '.';
      return;
    }
    if (t.hasAttribute('data-reset-hidden')) {
      state.hidden = [];
      state.lastHidden = null;
      render({ focus: false, announce: false });
      status.textContent = 'All four lamps are back.';
      return;
    }
    if (t.hasAttribute('data-reset')) {
      state = { screen: 'home', saved: [], hidden: [], lastHidden: null, compare: false };
      render({ arrive: true });
      return;
    }
  });

  /* The first screen is drawn by the script, so a page without it keeps the
     noscript note in the markup instead of an empty phone. No focus and no
     announcement on load: nothing has changed yet. */
  render({ focus: false, announce: false });
})();
