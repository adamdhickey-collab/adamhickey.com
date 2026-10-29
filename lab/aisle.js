/* aisle.js -- The Shortlist prototype: one shopping trip,
   from a photo at a friend's home to a store aisle, at a phone's width.
   Loaded by lab/inspiration-to-aisle.html and nothing else, where it runs
   in the hero; until 2026-10-29 it was prototype/aisle.js, on a page of its
   own.

   EVERYTHING HERE IS SAMPLE DATA, and it says so on every screen. The lamps,
   the store, the shelf counts and the employee are made up; no retailer's
   inventory, no image search and no model is connected. "Find lamps like
   this" does not look at a photo: it shows the four results written below,
   in the order written. What the prototype is for is the transition the
   page around it argues about: what a person
   carries from home into the store, what the app says when it is not sure,
   and when a person is more useful than the app.

   THE NAMES. The Shortlist is the concept, and Shortlist is what the
   feature is called on screen. It lives in the app of a made-up store,
   Marigold Home, because only the store's own app could read its shelf
   counts or ask one of its people to come to an aisle. The file keeps its
   old name, aisle.js, so no address moves.

   ONE THING CARRIES THE WHOLE TRIP: what the shopper liked about the lamp.
   It is asked once, under the photo, and every later screen uses it: the
   matches say how each one does on it, the comparison puts it first, the
   fallback for a missing lamp keeps it, and the employee sees it if the
   shopper shares it. It is optional, and every screen works without it.

   NOTHING IS ASSUMED. Every later screen is written from what the shopper
   did: the lamps they saved, the aisles those are in, the one they said
   was missing, what they agreed to share. The ending lists what happened
   and nothing that did not; no order is placed and nobody is sent.

   SHAPE. A state object, a render per screen built from the data at the
   top, and one place that swaps screens, moves focus and announces the
   change. The lamp pictures are product shots drawn in ChatGPT, one sheet
   cut into four.

   WHAT THE CHECKS SEE. The screens after the first exist only after a press,
   so scripts/lib/reachable.mjs registers each of them, with the presses that
   reach it from a fresh load, and scripts/aisle-test.mjs walks every branch
   and asserts what each screen says. Every press is a data-* hook, kept
   stable for that reason. State is carried on attributes (aria-pressed,
   aria-current, hidden), not on .is-* classes, because states.mjs reads an
   .is-* class as a state to force. */
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

  /* The one thing the shopper liked, asked under the photo. `noun` is how a
     sentence names it; `row` is the comparison's row it moves to the top. */
  var PREFS = [
    { id: 'shade', label: 'The shade', noun: 'the shade', row: 'Shade' },
    { id: 'legs', label: 'The wood legs', noun: 'the wood legs', row: 'Legs' },
    { id: 'shape', label: 'The tripod shape', noun: 'the tripod shape', row: 'Shape' },
    { id: 'height', label: 'The height', noun: 'the height', row: 'Height' }
  ];

  /* The store, its aisles in the order a person walks them from the door,
     and what the store's other branch shows for each lamp. */
  var STORE = {
    name: 'Marigold Home',
    branch: 'Roseville',
    distance: '4.1 miles',
    hours: 'Open until 9 tonight',
    dept: 'Home',
    aisles: { 12: 'in the middle of Home', 14: 'along the back wall', 15: 'along the back wall' },
    walk: [12, 14, 15],
    other: { branch: 'Woodbury', distance: '12 miles' }
  };

  /* The person who can come, in this sample. Whether anyone in Home is free
     is a switch on the request screen, so both cases can be seen. */
  var STAFF = { name: 'Dana', minutes: 3 };

  /* Each lamp carries what the shopper can compare, where it stands in the
     store, the store system's count with the age of the last shelf count,
     how it matched the photo (a level in plain words and the reasons), and
     how it does on each of the four things a shopper might care about. */
  var LAMPS = [
    { id: 'hollis', name: 'Hollis', full: 'Hollis tripod floor lamp', price: 139, height: 62, shape: 'Tripod', shade: 'Linen drum, 18 in', legs: 'Walnut', dimmable: 'Yes', bulb: 'Included',
      aisle: 14, bay: 3,
      stock: { count: 3, counted: 'counted this morning at 9:40', stale: false },
      other: { count: 2, counted: 'counted yesterday' },
      level: 'Close match', tone: 'close',
      line: 'Same shade shape and leg finish. About 2 inches shorter than the one in your photo looks.',
      short: 'The closest match overall, and it dims.',
      why: ['The shade is a linen drum, like the one in the photo.', 'The legs are walnut, like the ones in the photo.', 'Height is a guess from one photo. The sofa beside it suggests about 64 inches; this one is 62.'],
      fit: { shade: [true, 'Linen drum shade, like your photo.'], legs: [true, 'Walnut legs, like your photo.'], shape: [true, 'A tripod, like your photo.'], height: [true, '62 inches, near the 64 your photo suggests.'] },
      art: 'aisle-lamp-hollis.webp' },
    { id: 'bexley', name: 'Bexley', full: 'Bexley tripod floor lamp', price: 89, height: 60, shape: 'Tripod', shade: 'Linen drum, 17 in', legs: 'Black metal', dimmable: 'No', bulb: 'Not included',
      aisle: 14, bay: 5,
      stock: { count: 1, counted: 'last counted 2 days ago', stale: true },
      other: { count: 4, counted: 'counted this morning' },
      level: 'Similar shape, different finish', tone: 'near',
      line: 'Same linen drum shade. The legs are black metal, not wood, and it costs $50 less than the Hollis.',
      short: 'It doesn’t dim, and the bulb is sold separately.',
      why: ['The shade matches: a linen drum about the same width.', 'The legs are black metal. The photo shows wood, so this is a different look up close.', 'It does not dim, and the bulb is sold separately.'],
      fit: { shade: [true, 'Linen drum shade, like your photo.'], legs: [false, 'Black metal legs, not wood.'], shape: [true, 'A tripod, like your photo.'], height: [true, '60 inches, a little under the 64 your photo suggests.'] },
      art: 'aisle-lamp-bexley.webp' },
    { id: 'rowan', name: 'Rowan', full: 'Rowan arc floor lamp', price: 179, height: 72, shape: 'Arc', shade: 'Cream dome, 14 in', legs: 'Brass arc', dimmable: 'Yes', bulb: 'Included',
      aisle: 15, bay: 1,
      stock: { count: 6, counted: 'counted this morning at 9:40', stale: false },
      other: { count: 1, counted: 'last counted 3 days ago' },
      level: 'A stretch', tone: 'far',
      line: 'The same warm room feel, in a different shape: one brass arc instead of three legs.',
      short: 'A different shape: one brass arc instead of three legs.',
      why: ['The shade is warm and fabric, which is most of what reads from across a room.', 'The shape is different: an arc over a seat, not a tripod beside one.', 'A foot taller than the photo suggests.'],
      fit: { shade: [false, 'A cream dome shade, not a drum.'], legs: [false, 'A brass arc, no wood.'], shape: [false, 'An arc, not a tripod.'], height: [false, '72 inches, well over the 64 your photo suggests.'] },
      art: 'aisle-lamp-rowan.webp' },
    { id: 'linden', name: 'Linden', full: 'Linden tripod table lamp', price: 59, height: 18, shape: 'Tripod, table', shade: 'Linen drum, 10 in', legs: 'Walnut', dimmable: 'No', bulb: 'Included',
      aisle: 12, bay: 2,
      stock: { count: 8, counted: 'counted this morning at 9:40', stale: false },
      other: { count: 5, counted: 'counted this morning' },
      level: 'Same look, table size', tone: 'far',
      line: 'The same shade and legs at a third of the height. Probably not what you saw.',
      short: 'A table lamp, a third of the height.',
      why: ['The shade and legs match the photo closely.', 'It is 18 inches tall. Your photo shows the lamp standing on the floor.', 'Listed because the look matches, in case the size was the point.'],
      fit: { shade: [true, 'Linen drum shade, smaller.'], legs: [true, 'Walnut legs, like your photo.'], shape: [true, 'A tripod, at table size.'], height: [false, '18 inches: a table lamp.'] },
      art: 'aisle-lamp-linden.webp' }
  ];

  var byId = {};
  LAMPS.forEach(function (l) { byId[l.id] = l; });
  var prefById = {};
  PREFS.forEach(function (p) { prefById[p.id] = p; });

  /* What the shelf turns out to hold, in this sample, when the shopper says
     a lamp is not there. The Bexley's count was two days old, and its shelf
     is empty. Every other count is from this morning, so if the shopper
     cannot find one of those, it is probably here and somewhere else: the
     app says so, and sends them to a person rather than to a substitute. */
  function shelfEmpty(l) { return l.stock.stale; }

  /* ---------- state ---------- */

  function fresh() {
    return {
      screen: 'home',
      pref: null,
      saved: [],
      hidden: [],
      lastHidden: null,     /* { id, wasSaved, at }: what Undo puts back */
      rejected: {},         /* id -> 'hidden' | 'restored', for the ending */
      compare: false,       /* the comparison is open now */
      compared: false,      /* it was opened at some point */
      missing: null,        /* the lamp the shopper said is not on the shelf */
      outcome: null,        /* { kind, lamp }: what they chose to do about it */
      help: null,           /* { status, shared, at, free } once they ask */
      helpFrom: 'store',
      staffFree: true,
      finished: false
    };
  }
  var state = fresh();

  /* The two halves of the trip. The progress line over the screens names
     them, and marks the one the reader is in. */
  var HALF = { home: 'home', results: 'home', plan: 'home', store: 'store', missing: 'store', help: 'store', sent: 'store', done: 'store' };

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
  function where(l) { return 'Aisle ' + l.aisle + ', bay ' + l.bay; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* "the Hollis", "the Hollis and the Bexley", "the Hollis, the Bexley,
     and the Rowan": the house's serial comma, in the app too. */
  function names(lamps) {
    var n = lamps.map(function (l) { return 'the ' + l.name; });
    return and(n);
  }
  function count(n, one, many) { return n === 1 ? 'one ' + one : (['zero', 'one', 'two', 'three', 'four'][n] || n) + ' ' + many; }

  /* The store system's count, and when the shelf was last counted. The two
     are different facts, and the line keeps them apart: the number is what
     the system recorded, and the age says how far to trust it today. */
  function stockLine(l) {
    if (state.missing === l.id) {
      return '<span class="ai-stock">You looked: not on the shelf</span>';
    }
    return '<span class="ai-stock' + (l.stock.stale ? ' ai-stock--stale' : '') + '">' + l.stock.count + ' in the store’s system, ' + l.stock.counted + '</span>';
  }

  function priceAgainst(a, b) {
    var d = a.price - b.price;
    if (d === 0) return 'The same price as the ' + b.name + '.';
    return dollars(Math.abs(d)) + (d > 0 ? ' more' : ' less') + ' than the ' + b.name + '.';
  }

  /* The aisles the saved lamps are in, in walking order, as one sentence:
     "Both are in Aisle 14, along the back wall." or "In walking order:
     Aisle 12, in the middle of Home, then 14 and 15, along the back wall."
     Written from the list, never from a fixed aisle; the list under it is
     in the same order. */
  function byWalk(lamps) {
    return lamps.slice().sort(function (a, b) {
      return STORE.walk.indexOf(a.aisle) - STORE.walk.indexOf(b.aisle) || a.bay - b.bay;
    });
  }
  function and(xs) { return xs.length < 3 ? xs.join(' and ') : xs.slice(0, -1).join(', ') + ', and ' + xs[xs.length - 1]; }
  function route(lamps) {
    var aisles = STORE.walk.filter(function (a) { return lamps.some(function (l) { return l.aisle === a; }); });
    if (aisles.length === 1) {
      var who = lamps.length === 1 ? 'The ' + lamps[0].name + ' is' : (lamps.length === 2 ? 'Both are' : 'All ' + lamps.length + ' are');
      return who + ' in Aisle ' + aisles[0] + ', ' + STORE.aisles[aisles[0]] + '.';
    }
    /* Neighbouring aisles in the same part of the store share a phrase. */
    var groups = [];
    aisles.forEach(function (a) {
      var g = groups[groups.length - 1];
      if (g && g.where === STORE.aisles[a]) g.aisles.push(a);
      else groups.push({ where: STORE.aisles[a], aisles: [a] });
    });
    return 'In walking order: ' + groups.map(function (g, i) {
      return (i === 0 ? (g.aisles.length > 1 ? 'Aisles ' : 'Aisle ') : '') + and(g.aisles) + ', ' + g.where;
    }).join(', then ') + '.';
  }

  /* Where to send a person: the missing lamp's aisle, or the first saved
     lamp's, or the department if nothing is saved. */
  function meetAt() {
    var l = state.missing ? byId[state.missing] : savedLamps()[0];
    return l ? 'Aisle ' + l.aisle : 'the ' + STORE.dept + ' department';
  }

  /* The way forward when a lamp is missing: the lamp that keeps what the
     shopper said mattered, preferring one they saved, then the closer
     match, and passing over one whose own count is old. Not a
     recommendation engine; four plain preferences in order. */
  function alternativeFor(m) {
    var best = null, bestScore = -1;
    LAMPS.forEach(function (l, i) {
      if (l.id === m.id || isHidden(l.id) || l.id === state.missing) return;
      var score = (state.pref && l.fit[state.pref][0] ? 8 : 0) + (isSaved(l.id) ? 4 : 0) + ({ close: 2, near: 1, far: 0 })[l.tone] - (l.stock.stale ? 1.5 : 0) - i * 0.01;
      if (score > bestScore) { best = l; bestScore = score; }
    });
    return best;
  }

  function back(to, label) {
    return '<button type="button" class="ai-back" data-go="' + to + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>' +
      '<span class="visually-hidden">Back: </span>' + label + '</button>';
  }

  /* ---------- the screens ---------- */

  var screens = {};

  screens.home = function () {
    var s = '<header class="ai-head">' + titled('house', 'At your friend’s house') +
      '<p class="ai-dek">You like her lamp. Take a picture before you forget it.</p></header>' +
      '<figure class="ai-photo">' +
        '<div class="ai-photo-frame"><img class="ai-photo-img" src="../img/lab/aisle-maya-photo.webp?v=1" width="1200" height="900" decoding="async" alt="The lamp in your friend’s living room, lit, between a side table and the sofa."></div>' +
        '<figcaption class="ai-photo-cap"><span class="ai-photo-when">' + PHOTO.when + ' · ' + PHOTO.where + '</span>' + PHOTO.seen + '</figcaption>' +
      '</figure>' +
      /* The one question the photo cannot answer. Optional, one choice,
         and pressing the chosen one again takes it back. */
      '<div class="ai-pref" role="group" aria-labelledby="ai-pref-q">' +
        '<p class="ai-pref-q" id="ai-pref-q">What do you like most about it?</p>' +
        '<p class="ai-row">' + PREFS.map(function (p) {
          return '<button type="button" class="ai-chip" data-pref="' + p.id + '" aria-pressed="' + (state.pref === p.id) + '">' + p.label + '</button>';
        }).join('') + '</p>' +
        '<p class="ai-fine">Optional. The app keeps it for the rest of the trip, and says how each lamp does on it.</p>' +
      '</div>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="results">Find lamps like this</button></p>' +
      '<p class="ai-fine">Shortlist is a made-up feature in the app of a made-up store, ' + STORE.name + '. Every lamp, count, and person here is sample data, and nothing looks at a real photo.</p>';
    return s;
  };

  screens.results = function () {
    var shown = LAMPS.filter(function (l) { return !isHidden(l.id); });
    var n = state.saved.length;
    var pref = state.pref && prefById[state.pref];
    var s = back('home', 'Photo') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Lamps like this one</h3>' +
      '<p class="ai-dek">' + shown.length + ' of 4 from your photo' +
        (pref ? ', each checked on ' + pref.noun + '. ' : '. ') +
        'Save one or two to compare in the store.</p></header>';
    if (state.lastHidden && isHidden(state.lastHidden.id)) {
      var others = state.hidden.length - 1;
      s += '<p class="ai-undo" role="status">Hidden: ' + byId[state.lastHidden.id].full + '. <button type="button" class="ai-link" data-unhide="' + state.lastHidden.id + '">Undo</button>' +
        (others > 0 ? ' · <button type="button" class="ai-link" data-reset-hidden>Bring back all ' + state.hidden.length + '</button>' : '') + '</p>';
    }
    s += '<ul class="ai-results">';
    shown.forEach(function (l) {
      var saved = isSaved(l.id);
      var fit = pref ? l.fit[pref.id] : null;
      s += '<li class="ai-card" data-lamp="' + l.id + '"' + (saved ? ' data-saved' : '') + '>' +
        '<div class="ai-card-art">' + lamp(l.art) + '</div>' +
        '<div class="ai-card-body">' +
          '<p class="ai-card-name">' + l.full + ' <span class="ai-card-price">' + dollars(l.price) + '</span></p>' +
          '<p class="ai-level ai-level--' + l.tone + '">' + l.level + '</p>' +
          (fit ? '<p class="ai-fit" data-fit="' + (fit[0] ? 'yes' : 'no') + '"><span class="ai-fit-k">What you liked:</span> ' + fit[1] + '</p>' : '') +
          '<p class="ai-card-line">' + l.line + '</p>' +
          '<details class="ai-why"><summary class="disclosure-row ai-why-row"><svg class="disclosure-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg><span data-why="' + l.id + '">Why this one</span></summary>' +
            '<ul class="ai-why-list">' + l.why.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></details>' +
          '<p class="ai-card-acts">' +
            '<button type="button" class="ai-chip" data-save="' + l.id + '" aria-pressed="' + saved + '">' + (saved ? 'Saved' : 'Save') + '<span class="visually-hidden"> the ' + l.name + '</span></button>' +
            '<button type="button" class="ai-chip ai-chip--quiet" data-reject="' + l.id + '" aria-label="Not it: hide the ' + l.name + '">Not it</button>' +
          '</p>' +
        '</div></li>';
    });
    s += '</ul>';
    if (shown.length === 0) {
      s += '<p class="ai-empty">You hid all four, which is a real answer: none of these. Undo one, or <button type="button" class="ai-link" data-reset-hidden>bring them all back</button>.</p>';
    }
    s += '<p class="ai-note">Matches come from the shape and color in the photo. A photo does not say how tall a lamp is, so every height here is a guess, and the list says so where it matters.</p>';
    if (n > 0) {
      s += '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="plan">Plan a store trip<span class="ai-btn-count">' + n + ' saved</span></button></p>';
    } else if (shown.length) {
      s += '<p class="ai-fine">Save a lamp and the trip can be planned from here.</p>';
    }
    return s;
  };

  function savedList(lamps, opts) {
    var s = '<ul class="ai-saved">';
    lamps.forEach(function (l) {
      s += '<li class="ai-saved-item"><div class="ai-saved-art">' + lamp(l.art) + '</div><div><p class="ai-saved-name">' + l.full + ' <span class="ai-card-price">' + dollars(l.price) + '</span></p>' +
        '<p class="ai-saved-where">' + where(l) + '</p><p class="ai-saved-stock">' + stockLine(l) + '</p>' +
        (opts && opts.missing && state.missing !== l.id ? '<p class="ai-saved-act"><button type="button" class="ai-link ai-link--tap" data-missing="' + l.id + '">Not on the shelf?<span class="visually-hidden"> The ' + l.name + '</span></button></p>' : '') +
        '</div></li>';
    });
    return s + '</ul>';
  }

  screens.plan = function () {
    var saved = savedLamps();
    var pref = state.pref && prefById[state.pref];
    var stale = saved.filter(function (l) { return l.stock.stale; });
    var s = back('results', 'Results') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Before you go</h3>' +
      '<p class="ai-dek">What you saved travels with you' + (pref ? ', and so does what you liked: ' + pref.noun : '') + '. So do the counts, with their age.</p></header>' +
      '<div class="ai-store"><p class="ai-store-name">' + STORE.name + ' · ' + STORE.branch + '</p><p class="ai-store-meta">' + STORE.distance + ' · ' + STORE.hours + '</p></div>' +
      savedList(saved) +
      '<p class="ai-note">A count is what the store’s system last recorded, not what is on the shelf right now. ' +
        (stale.length ? 'The ' + stale[0].name + '’s is two days old, so it is marked: it may be gone. ' : 'Each of these was counted this morning. ') +
        'The app checks again when you arrive.</p>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="store">I’m at the store</button></p>' +
      '<p class="ai-fine">This button stands in for arriving. A real app would ask to use your location, and would work without it.</p>';
    return s;
  };

  screens.store = function () {
    var saved = savedLamps();
    var stale = saved.filter(function (l) { return l.stock.stale && state.missing !== l.id; });
    var s = back('plan', 'Before you go') +
      '<header class="ai-head">' + titled('store', 'In the store') +
      '<p class="ai-dek">Your photo and your list came in with you. ' + route(saved) + '</p></header>';
    var live = state.help && (state.help.status === 'open' || state.help.status === 'coming');
    if (live) {
      s += '<p class="ai-undo" role="status">' + (state.help.status === 'coming'
        ? STAFF.name + ' is on the way to ' + state.help.at + '. '
        : 'Your request for help is open. The first person free in ' + STORE.dept + ' comes to ' + state.help.at + '. ') +
        '<button type="button" class="ai-link" data-cancel-help>Cancel it</button></p>';
    }
    s += savedList(byWalk(saved), { missing: true }) +
      '<p class="ai-note">Checked again as you came in: no newer counts. ' +
        (stale.length ? 'The ' + stale[0].name + '’s is still two days old, so look before you trust it.' : 'Every count here is from this morning.') + '</p>';
    if (saved.length > 1) {
      s += '<p class="ai-row"><button type="button" class="ai-chip" data-go="compare" aria-pressed="' + state.compare + '" aria-controls="ai-compare">' + (state.compare ? 'Hide the comparison' : 'Compare side by side') + '</button></p>';
      s += '<div id="ai-compare"' + (state.compare ? '' : ' hidden') + '>' + (saved.length > 2 ? '<p class="ai-fine">Scroll the table sideways for all ' + saved.length + '.</p>' : '') + compareTable(byWalk(saved)) + '</div>';
    }
    s += '<p class="ai-row">' +
      (live ? '' : '<button type="button" class="ai-chip" data-go="help">Ask someone in ' + STORE.dept + '</button>') +
      '<button type="button" class="ai-chip ai-chip--quiet" data-outcome="own">I’m done here</button></p>' +
      '<p class="ai-note">Nothing here decides for you. The app carries what you found at home and says how sure it is about the shelf; the choice, and who to ask, stays with you.</p>';
    return s;
  };

  /* The comparison. The row for what the shopper said mattered moves to
     the top and says why it is there; the rest keep their order. Wrapped in
     a region that scrolls sideways, so four lamps on a phone keep readable
     columns instead of crushing into one word a line. */
  function compareTable(lamps) {
    var rows = [
      ['Height', function (l) { return l.height + ' in'; }],
      ['Shape', function (l) { return l.shape; }],
      ['Shade', function (l) { return l.shade; }],
      ['Legs', function (l) { return l.legs; }],
      ['Dims', function (l) { return l.dimmable; }],
      ['Bulb', function (l) { return l.bulb; }],
      ['Price', function (l) { return dollars(l.price); }],
      ['Where', function (l) { return where(l); }]
    ];
    var pref = state.pref && prefById[state.pref];
    if (pref) {
      var at = rows.map(function (r) { return r[0]; }).indexOf(pref.row);
      rows.unshift(rows.splice(at, 1)[0]);
    }
    /* Only a table that scrolls is a region with a tab stop: two lamps fit,
       and a focusable box that does nothing is one more press for nothing. */
    var s = '<div class="ai-table-wrap"' + (lamps.length > 2 ? ' role="region" aria-label="Your saved lamps, compared, scrolls sideways" tabindex="0" data-wide' : '') + '>' +
      '<table class="ai-table"><caption class="visually-hidden">Your saved lamps, compared' + (pref ? ', ' + pref.noun + ' first' : '') + '</caption><thead><tr><th scope="col"><span class="visually-hidden">Feature</span></th>';
    lamps.forEach(function (l) { s += '<th scope="col">' + l.name + '</th>'; });
    s += '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      var picked = pref && i === 0;
      s += '<tr' + (picked ? ' data-pick' : '') + '><th scope="row">' + r[0] + (picked ? '<span class="ai-table-pick">What you liked</span>' : '') + '</th>';
      lamps.forEach(function (l) { s += '<td>' + r[1](l) + '</td>'; });
      s += '</tr>';
    });
    return s + '</tbody></table></div>';
  }

  screens.missing = function () {
    var m = byId[state.missing];
    var empty = shelfEmpty(m);
    var alt = alternativeFor(m);
    var pref = state.pref && prefById[state.pref];
    var s = back('store', 'In the store') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">' + (empty ? 'The ' + m.name + ' isn’t on the shelf' : 'You can’t find the ' + m.name) + '</h3>' +
      (empty
        ? '<p class="ai-dek">The system said ' + m.stock.count + ', ' + m.stock.counted + '. A count that old was a guess about today, and the shelf settles it.</p>'
        : '<p class="ai-dek">The system says ' + m.stock.count + ', ' + m.stock.counted + '. A count that recent means it is probably here, just not in bay ' + m.bay + ': on a display, on a cart, or in the back room. A person can find out; the app can’t.</p>') +
      '</header>';
    if (!empty) {
      s += '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="help">Ask someone to look</button></p>';
    }
    s += '<ul class="ai-alts">';
    if (alt) {
      var fit = pref ? alt.fit[pref.id] : null;
      s += '<li class="ai-alt" data-alt="' + alt.id + '"><p class="ai-alt-name">' + (isSaved(alt.id) ? 'Take the ' : 'Look at the ') + alt.name + ' instead: ' + where(alt) + '</p>' +
        '<p class="ai-alt-line">' + (fit ? (fit[0] ? 'It keeps what you liked. ' : 'It doesn’t keep what you liked, but nothing here does. ') + fit[1] + ' ' : '') + alt.short + ' ' + priceAgainst(alt, m) + ' ' + alt.stock.count + ' in the system, ' + alt.stock.counted + '.</p>' +
        '<p class="ai-alt-act"><button type="button" class="ai-chip" data-outcome="' + (isSaved(alt.id) ? 'instead' : 'look') + '" data-lamp="' + alt.id + '">' + (isSaved(alt.id) ? 'Choose the ' + alt.name : 'Go and see it') + '</button></p></li>';
    }
    s += '<li class="ai-alt"><p class="ai-alt-name">Have the ' + m.name + ' delivered</p><p class="ai-alt-line">Usually 3 to 5 days in this sample, at the shelf price. Nothing is ordered until you check out.</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-outcome="deliver" data-lamp="' + m.id + '">Choose delivery</button></p></li>' +
      '<li class="ai-alt"><p class="ai-alt-name">Try ' + STORE.name + ', ' + STORE.other.branch + '</p><p class="ai-alt-line">' + STORE.other.distance + ' away. Its system shows ' + m.other.count + ', ' + m.other.counted + ', which is a count, not a promise.</p><p class="ai-alt-act"><button type="button" class="ai-chip" data-outcome="later" data-lamp="' + m.id + '">Save it for later</button></p></li>' +
      '</ul>';
    if (empty) {
      s += '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-go="help">Ask someone in ' + STORE.dept + '</button></p>';
    }
    s += '<p class="ai-note">' + (empty ? 'Three ways forward' : 'Or one of these') + ', each saying how it differs from what you came for. None is picked for you' + (empty ? ', and the person is one press away when the list is not enough' : '') + '.</p>';
    return s;
  };

  /* Asking for help: what the person will see, chosen by the shopper. Only
     what this trip made is offered, and each item is a checkbox; nothing
     about the shopper themselves is on the list to begin with. */
  function shareable() {
    var items = [{ key: 'photo', label: 'Your photo of the lamp' }];
    var pref = state.pref && prefById[state.pref];
    var saved = savedLamps();
    if (pref) items.push({ key: 'pref', label: 'What you like most about it: ' + pref.noun });
    if (saved.length) items.push({ key: 'list', label: 'Your shortlist: ' + names(saved) });
    if (state.compared && saved.length > 1) items.push({ key: 'compare', label: 'That you compared them side by side' });
    if (state.missing) items.push({ key: 'missing', label: 'That the ' + byId[state.missing].name + ' wasn’t ' + (shelfEmpty(byId[state.missing]) ? 'on the shelf' : 'where the app said') });
    return items;
  }

  screens.help = function () {
    var items = shareable();
    var s = back(state.helpFrom, state.helpFrom === 'missing' ? 'The ' + byId[state.missing].name : 'In the store') +
      '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Ask someone in ' + STORE.dept + '</h3>' +
      '<p class="ai-dek">Choose what they see. It is only what you made on this trip; your name, your account, and what you have bought before are not on the list.</p></header>' +
      '<fieldset class="ai-share"><legend class="ai-person-label">Share with them</legend>' +
      items.map(function (it) {
        return '<label class="ai-check"><input type="checkbox" name="share" value="' + it.key + '" checked> <span>' + it.label + '</span></label>';
      }).join('') +
      '</fieldset>' +
      '<p class="ai-note">They will also see where to find you: ' + meetAt() + '. That is all a person needs to walk over.</p>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-send>Send the request</button></p>' +
      '<p class="ai-fine">Nobody is paged until you press Send. Sending shares only what is checked.</p>';
    return s;
  };

  screens.sent = function () {
    var h = state.help;
    var s = back('store', 'In the store');
    var seen = h.shared.length
      ? '<ul class="ai-person-list">' + h.shared.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'
      : '<p class="ai-person-note">Nothing from your trip: you unchecked it all. They will ask what you need.</p>';
    if (h.free) {
      s += '<header class="ai-head"><h3 class="ai-title" tabindex="-1">' + STAFF.name + ' is coming to ' + h.at + '</h3>' +
        '<p class="ai-dek">' + STAFF.name + ' works in ' + STORE.dept + ' and took your request. About ' + STAFF.minutes + ' minutes, in this sample; a real app would show the time the store reports.</p></header>' +
        '<div class="ai-person"><p class="ai-person-label">What ' + STAFF.name + ' sees</p>' + seen +
        '<p class="ai-person-note">Nothing else: not your name, not your account, not what you have bought before. ' + STAFF.name + ' can check the back room, and may know what the app doesn’t: a delivery due tomorrow, or a floor model.</p></div>' +
        '<p class="ai-row"><button type="button" class="ai-chip" data-outcome="helped">' + STAFF.name + ' is here</button><button type="button" class="ai-chip ai-chip--quiet" data-cancel-help>Cancel, I’ll keep looking</button></p>' +
        '<p class="ai-fine">This sample has someone free. <button type="button" class="ai-link" data-staff>See it when nobody is</button></p>';
    } else {
      s += '<header class="ai-head"><h3 class="ai-title" tabindex="-1">Nobody in ' + STORE.dept + ' is free right now</h3>' +
        '<p class="ai-dek">Your request is open, and the first person free comes to ' + h.at + '. The app won’t guess when.</p></header>' +
        '<div class="ai-person"><p class="ai-person-label">What they will see</p>' + seen +
        '<p class="ai-person-note">Or ask at the service desk by the entrance, which is staffed now. Show them this screen; nothing is sent there on its own.</p></div>' +
        '<p class="ai-row"><button type="button" class="ai-chip" data-go="store">Keep it open and keep looking</button><button type="button" class="ai-chip ai-chip--quiet" data-cancel-help>Cancel the request</button></p>' +
        '<p class="ai-fine">This is the same request when nobody is free. <button type="button" class="ai-link" data-staff>See it when ' + STAFF.name + ' is</button></p>';
    }
    return s;
  };

  /* The ending, written from what happened. Each line is a thing the
     shopper did, in the past tense, and nothing is claimed that the
     prototype only simulated: no order, no purchase, no one dispatched. */
  function story() {
    var lines = [];
    var pref = state.pref && prefById[state.pref];
    var saved = savedLamps();
    lines.push('You took a photo of the lamp' + (pref ? ' and said ' + pref.noun + ' mattered most.' : '.'));
    var said = Object.keys(state.rejected).map(function (id) {
      return '“Not it” to the ' + byId[id].name + (state.rejected[id] === 'restored' ? ', then brought it back' : '');
    });
    lines.push('You saved ' + (saved.length ? names(saved) : 'nothing in the end') + (said.length ? ', and said ' + said.join('; ') : '') + '.');
    if (state.compared) lines.push('In the aisle you compared them side by side' + (pref ? ', ' + pref.noun + ' first' : '') + '.');
    if (state.missing) {
      var m = byId[state.missing];
      var o = state.outcome;
      var lead = shelfEmpty(m) ? 'The ' + m.name + ' wasn’t on the shelf' : 'You couldn’t find the ' + m.name;
      if (o && o.kind === 'instead') lead += ', so you chose the ' + byId[o.lamp].name + ' instead.';
      else if (o && o.kind === 'look') lead += ', so you went to look at the ' + byId[o.lamp].name + ' in Aisle ' + byId[o.lamp].aisle + '.';
      else if (o && o.kind === 'deliver') lead += ', so you chose delivery. Nothing was ordered: checkout would start here.';
      else if (o && o.kind === 'later') lead += ', so you saved ' + STORE.other.branch + ' for later.';
      else lead += '.';
      lines.push(lead);
    }
    if (state.help) {
      var h = state.help;
      var what = h.shared.length ? count(h.shared.length, 'thing', 'things') + ' from your trip' : 'nothing from your trip';
      if (h.status === 'done') lines.push('You asked for help and shared ' + what + '; ' + STAFF.name + ' came over.');
      else if (h.status === 'cancelled') lines.push('You asked for help, shared ' + what + ', then carried on alone.');
      else lines.push('You asked for help and shared ' + what + '. Nobody was free yet, and the request was still open.');
    }
    if (!state.missing && !state.help) lines.push('You finished on your own, with your list in hand.');
    return lines;
  }

  screens.done = function () {
    return '<header class="ai-head"><h3 class="ai-title" tabindex="-1">That’s the trip</h3>' +
      '<p class="ai-dek">What came with you, and what you decided.</p></header>' +
      '<ul class="ai-person-list ai-done-list">' + story().map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
      '<p class="ai-act"><button type="button" class="btn btn-primary ai-btn" data-reset>Start over</button></p>' +
      '<p class="ai-fine">Nothing was bought, ordered, or sent: this is sample data. Further down the page: what I’d test first, and what would prove it wrong.</p>';
  };

  /* ---------- rendering ---------- */

  var stage = root.querySelector('[data-aisle-stage]');
  var status = root.querySelector('[data-aisle-status]');
  var steps = root.querySelectorAll('[data-aisle-half]');
  var TITLES = { home: 'At your friend’s house', results: 'Lamps like this one', plan: 'Before you go', store: 'In the store', missing: 'A lamp not where it should be', help: 'Ask someone for help', sent: 'Your request for help', done: 'The trip, done' };

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
      /* A press near the foot of a long screen leaves it scrolled there,
         so a new screen would take focus somewhere out of sight. From 64rem
         the screen scrolls inside the phone (inspiration-to-aisle.css), so
         the new one starts at its own top; under that the stage does not
         scroll and this does nothing. Then, if the title is still off the
         page, bring the phone's top into view (the html's scroll-padding
         keeps it under the site's header, and the reduced-motion blanket
         makes it a jump), and focus the title without a second scroll. */
      if (h && opts.arrive) {
        stage.scrollTop = 0;
        var r = h.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) root.scrollIntoView({ block: 'start' });
      }
      if (h) h.focus({ preventScroll: true });
    }
  }

  /* Re-render in place and put focus back on the control that was pressed,
     or the one a selector names, so a keyboard user is never dropped to the
     top of the page by a press that did not change the screen. */
  function redraw(focusSel, message) {
    render({ focus: false, announce: false });
    var el = focusSel && stage.querySelector(focusSel);
    if (el) el.focus();
    if (message) status.textContent = message;
  }

  function go(screen) {
    if (!screens[screen]) return;
    /* A trip needs a list. Back navigation can empty it (unsave them all
       from the results), so the screens that are about the list send the
       shopper back to the results rather than drawing an empty store. */
    if ((screen === 'plan' || screen === 'store') && state.saved.length === 0) screen = 'results';
    if (screen === 'missing' && !state.missing) screen = 'store';
    if (screen === 'sent' && !state.help) screen = 'help';
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
        if (state.compare) state.compared = true;
        redraw('[data-go="compare"]', state.compare ? 'Comparison shown' : 'Comparison hidden');
        return;
      }
      if (to === 'help') state.helpFrom = state.screen === 'missing' ? 'missing' : 'store';
      go(to);
      return;
    }
    if (t.hasAttribute('data-pref')) {
      var p = t.getAttribute('data-pref');
      state.pref = state.pref === p ? null : p;
      redraw('[data-pref="' + p + '"]', state.pref ? cap(prefById[p].noun) + ': kept for the trip.' : 'Nothing picked. The matches will not be checked on one thing.');
      return;
    }
    if (t.hasAttribute('data-save')) {
      var id = t.getAttribute('data-save');
      if (isSaved(id)) state.saved.splice(state.saved.indexOf(id), 1);
      else state.saved.push(id);
      redraw('[data-save="' + id + '"]', (isSaved(id) ? 'Saved the ' : 'Removed the ') + byId[id].name + '. ' + state.saved.length + ' saved.');
      return;
    }
    if (t.hasAttribute('data-reject')) {
      var rid = t.getAttribute('data-reject');
      var at = state.saved.indexOf(rid);
      if (!isHidden(rid)) state.hidden.push(rid);
      if (at !== -1) state.saved.splice(at, 1);
      state.lastHidden = { id: rid, wasSaved: at !== -1, at: at };
      state.rejected[rid] = 'hidden';
      redraw('[data-unhide]', 'Hidden: the ' + byId[rid].name + (at !== -1 ? ', and taken off your list' : '') + '. Undo is next to the message.');
      return;
    }
    if (t.hasAttribute('data-unhide')) {
      var uid = t.getAttribute('data-unhide');
      state.hidden = state.hidden.filter(function (x) { return x !== uid; });
      /* Undo puts back what the press took: a lamp that was saved when it
         was hidden comes back saved, in its old place on the list. */
      var last = state.lastHidden;
      if (last && last.id === uid && last.wasSaved && !isSaved(uid)) state.saved.splice(Math.min(last.at, state.saved.length), 0, uid);
      state.lastHidden = null;
      state.rejected[uid] = 'restored';
      redraw('[data-lamp="' + uid + '"] [data-save]', 'Brought back the ' + byId[uid].name + (isSaved(uid) ? ', still saved.' : '.'));
      return;
    }
    if (t.hasAttribute('data-reset-hidden')) {
      var last2 = state.lastHidden;
      state.hidden.forEach(function (x) { state.rejected[x] = 'restored'; });
      state.hidden = [];
      if (last2 && last2.wasSaved && !isSaved(last2.id)) state.saved.splice(Math.min(last2.at, state.saved.length), 0, last2.id);
      state.lastHidden = null;
      redraw('[data-save]', 'All four lamps are back.');
      return;
    }
    if (t.hasAttribute('data-missing')) {
      state.missing = t.getAttribute('data-missing');
      state.outcome = null;
      go('missing');
      return;
    }
    if (t.hasAttribute('data-send')) {
      var boxes = stage.querySelectorAll('input[name="share"]');
      var items = shareable();
      var shared = [];
      Array.prototype.forEach.call(boxes, function (b, i) { if (b.checked) shared.push(items[i].label); });
      state.help = { status: state.staffFree ? 'coming' : 'open', shared: shared, at: meetAt(), free: state.staffFree };
      go('sent');
      return;
    }
    if (t.hasAttribute('data-staff')) {
      /* The prototype's own switch, labeled as one: the same request, with
         somebody free or with nobody. It changes the sample, not the trip. */
      state.staffFree = !state.staffFree;
      state.help.free = state.staffFree;
      state.help.status = state.staffFree ? 'coming' : 'open';
      render({ arrive: true });
      status.textContent = state.staffFree ? 'Showing the request with someone free.' : 'Showing the request with nobody free.';
      return;
    }
    if (t.hasAttribute('data-cancel-help')) {
      state.help.status = 'cancelled';
      go('store');
      status.textContent = 'Request cancelled. Showing: In the store';
      return;
    }
    if (t.hasAttribute('data-outcome')) {
      var kind = t.getAttribute('data-outcome');
      if (kind === 'helped') state.help.status = 'done';
      else if (kind !== 'own') state.outcome = { kind: kind, lamp: t.getAttribute('data-lamp') };
      state.finished = true;
      go('done');
      return;
    }
    if (t.hasAttribute('data-reset')) {
      state = fresh();
      render({ arrive: true });
      return;
    }
  });

  /* The first screen is drawn by the script, so a page without it keeps the
     noscript note in the markup instead of an empty phone. No focus and no
     announcement on load: nothing has changed yet. */
  render({ focus: false, announce: false });
})();
