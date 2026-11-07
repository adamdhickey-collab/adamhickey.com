/* wren.js -- the After Send prototype: one virtual payment, followed from
   a buyer's payments list to the supplier's notice and back to the same
   record, at a desktop's width. Loaded by lab/after-send.html and nothing
   else, where it runs under the hero.

   EVERYTHING HERE IS SIMULATED, and the page says so before anyone presses.
   Wren Payments is a made-up product, Maple Street Bakery a made-up buyer,
   Hillside Packaging a made-up supplier, and every reference below is
   synthetic. A bakery and the people who sell it
   boxes, flour, and butter, since 2026-11-07: the nouns stay plain so a reader
   spends their attention on the record rather than the scenario. No card number, no account, no network, no file, no sign-in.
   "Process this payment" charges nothing; it adds an event to a list in
   this file. The public sources the page cites establish the domain
   (buyer-to-supplier virtual payments, remittance, reconciliation); the
   screen sequence, the event vocabulary, who may see what, and how a match
   behaves are design assumptions, not any bank's procedure.

   ONE FIXTURE, TWO FACTS. The design problem is that "paid" hides three
   different facts: the buyer sent a payment, the supplier processed it,
   and the buyer matched it to an invoice. So a payment here carries them
   as separate fields derived from one list of events: processing(), read
   from the supplier's side, and matching(), read from the buyer's. Both
   views, the buyer's record and the supplier's notice, are rendered from
   the same events, so neither can claim something the other has not seen.
   The supplier's notice shows only what a buyer would share: the buyer's
   name, the invoice reference, the amount, and the validity date.

   REPEATED ACTIONS ARE SAFE. "Process this payment" is drawn only while the
   payment is still waiting, "Confirm match" only while it is processed and
   unmatched. Pressing either again is impossible rather than ignored, and
   confirming a match never touches the processing event.

   ONE STORY, ONE BUTTON, since 2026-11-07 (Adam: one simple flow that tells
   a story, and no highlights saying where to click). A reader keeps pressing
   the button over the window, from the supplier's call to the invoice closed,
   then the same payment expired unprocessed, then Start over. The sides and
   the exception are chapters of it rather than switches: only that button
   changes role or scenario. Everything is deterministic: the clock is a
   fixed demo date, and every timestamp is written below.

   ONE PAYMENT THAT CAN'T BE MATCHED. Bright Harbor processed less than the
   invoice says, so its proposed match disagrees and offers no Confirm. It
   is there so the side-by-side check is a check, not a formality.

   THE LIST STARTS WHOLE, AND A ROW IS ONE TARGET, since 2026-11-07 (Adam: a
   clearer starting point). It opens on all five payments with an empty box,
   so the first press of the story is the specialist's own: searching for the
   reference the supplier just gave. Until then the box arrived holding it,
   and a reader never saw a list. The whole row opens the
   record, and the supplier's name is the real button inside it, so the
   keyboard and a screen reader get what the pointer gets. Dragging across a
   reference to copy it doesn't count as a press.

   THERE IS ALWAYS A NEXT PRESS. walk() names it and says what is happening,
   and the guide over the window offers it as a button that presses the real
   control. Nothing in the window is marked: the controls in it still work,
   for anyone who wants to try them, and the button is the way through. Its
   press keeps focus on the button, so a keyboard walks the story the same
   way, and the live region reads the story's line.

   WHAT THE CHECKS SEE. Every screen after the list is drawn on a press, so
   scripts/lib/reachable.mjs registers each with the presses that reach it,
   and scripts/wren-test.mjs walks the handoff and asserts what each screen
   says. Every press is a data-* hook, kept stable for that reason. State is
   carried on attributes (aria-pressed, aria-current, hidden, data-*), not
   on .is-* classes, because states.mjs reads an .is-* class as a state. */
(function () {
  'use strict';

  var root = document.querySelector('[data-wren]');
  if (!root) return;

  /* ---------- the fixture ---------- */

  var TODAY = 'Nov 5';               /* the demo's clock, fixed */
  var PRODUCT = 'Wren Payments';
  var BUYER = { name: 'Maple Street Bakery', team: 'Accounts payable' };

  /* The one payment the walkthrough follows, and four more so the list can
     be searched and filtered. Amounts in cents, so nothing is rounded. `item`
     is what the invoice is for, in the supplier's words, shown under the
     reference on the record and the notice. */
  var BASE = [
    { id: 'hillside-20483', ref: 'VP-7Q2M-11', supplier: 'Hillside Packaging', invoice: 'INV-20483', item: '8,000 bakery boxes', amount: 486000, sent: 'Oct 28', validThrough: 'Nov 27', followUp: 'Nov 20', noticeTo: 'ar@hillsidepackaging.example',
      events: [
        { at: 'Oct 28, 9:14 am', kind: 'issued', what: 'Payment issued for INV-20483', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 28, 9:15 am', kind: 'notice', what: 'Payment notice sent to Hillside Packaging', by: PRODUCT },
        { at: 'Oct 28, 9:16 am', kind: 'delivered', what: 'Notice delivered to Hillside’s accounts receivable inbox', by: PRODUCT }
      ] },
    { id: 'valleyflour-11920', ref: 'VP-3H8K-02', supplier: 'Valley Flour Co.', invoice: 'INV-11920', item: '1,500 lb bread flour', amount: 221550, sent: 'Oct 22', validThrough: 'Nov 21',
      events: [
        { at: 'Oct 22, 10:02 am', kind: 'issued', what: 'Payment issued for INV-11920', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 22, 10:03 am', kind: 'notice', what: 'Payment notice sent to Valley Flour Co.', by: PRODUCT },
        { at: 'Oct 24, 8:40 am', kind: 'processed', what: 'Processed by Valley Flour Co.', by: 'Valley Flour Co.' },
        { at: 'Oct 24, 1:15 pm', kind: 'matched', what: 'Matched to INV-11920', by: BUYER.name + ' accounts payable' }
      ] },
    { id: 'northshore-30077', ref: 'VP-9C4D-07', supplier: 'Northshore Freight Lines', invoice: 'INV-30077', item: 'Delivery routes, October', amount: 1240000, processedAmount: 1204000, sent: 'Oct 30', validThrough: 'Nov 29',
      events: [
        { at: 'Oct 30, 3:48 pm', kind: 'issued', what: 'Payment issued for INV-30077', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 30, 3:49 pm', kind: 'notice', what: 'Payment notice sent to Northshore Freight Lines', by: PRODUCT },
        { at: 'Nov 3, 11:20 am', kind: 'processed', what: 'Processed by Northshore Freight Lines', by: 'Northshore Freight Lines' }
      ] },
    { id: 'sunrise-0921', ref: 'VP-5N1R-04', supplier: 'Sunrise Dairy Supply', invoice: 'INV-0921', item: '25 cases of butter', amount: 31875, sent: 'Sep 30', validThrough: 'Oct 30',
      events: [
        { at: 'Sep 30, 2:05 pm', kind: 'issued', what: 'Payment issued for INV-0921', by: BUYER.name + ' accounts payable' },
        { at: 'Sep 30, 2:06 pm', kind: 'notice', what: 'Payment notice sent to Sunrise Dairy Supply', by: PRODUCT },
        { at: 'Oct 31, 12:00 am', kind: 'expired', what: 'Validity date passed. The payment expired without being processed.', by: PRODUCT }
      ] },
    { id: 'hillside-20391', ref: 'VP-2W6T-09', supplier: 'Hillside Packaging', invoice: 'INV-20391', item: '3,000 cake boxes', amount: 114000, sent: 'Oct 9', validThrough: 'Nov 8',
      events: [
        { at: 'Oct 9, 9:30 am', kind: 'issued', what: 'Payment issued for INV-20391', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 9, 9:31 am', kind: 'notice', what: 'Payment notice sent to Hillside Packaging', by: PRODUCT },
        { at: 'Oct 12, 4:12 pm', kind: 'processed', what: 'Processed by Hillside Packaging', by: 'Hillside Packaging' },
        { at: 'Oct 13, 9:05 am', kind: 'matched', what: 'Matched to INV-20391', by: BUYER.name + ' accounts payable' }
      ] }
  ];
  var FOLLOWED = 'hillside-20483';
  var SEARCHED = 'INV-20483';        /* what the supplier on the phone gave */
  var HINT_START = 'Hillside Packaging, the supplier, calls: “Our records show INV-20483 as unpaid. Can you check it?” Your screen says paid.';

  /* The exception: the same payment, its validity date a day before the
     demo's today, and no processing event ever arrived. */
  var EXPIRED = {
    validThrough: 'Nov 4',
    event: { at: 'Nov 5, 12:00 am', kind: 'expired', what: 'Validity date passed. The payment expired without being processed.', by: PRODUCT }
  };

  /* What the two presses in this demo add. Fixed, so a run is a run. */
  var CHECKED_AT = 'Nov 5, 2:05 pm'; /* when the record last read the events */
  var RESENT_AT = 'Nov 5, 2:06 pm';
  var PROCESSED_AT = 'Nov 5, 2:10 pm';
  var MATCHED_AT = 'Nov 5, 2:12 pm';

  /* ---------- state ---------- */

  function fresh(scenario) {
    return {
      scenario: scenario || 'default',   /* 'default' | 'expired' */
      role: 'buyer',                     /* 'buyer' | 'supplier' */
      screen: 'list',                    /* 'list' | 'detail' | 'notice' */
      open: null,                        /* the payment id the record shows */
      q: '',                             /* the search box */
      filter: 'all',                     /* the status filter */
      resent: {},                        /* id -> true once the buyer sent the notice again */
      processed: {},                     /* id -> true once the supplier pressed Process */
      matched: {},                       /* id -> true once the buyer confirmed the match */
      reviewing: false,                  /* the match panel is open */
      replacing: false,                  /* the replacement panel is open */
      declined: false,                   /* the match was declined, so the record says nothing changed */
      activity: false                    /* the reader unfolded the activity, kept across presses */
    };
  }
  var state = fresh();

  /* ---------- derivations: both views read these ---------- */

  function byId(id) {
    for (var i = 0; i < BASE.length; i++) if (BASE[i].id === id) return BASE[i];
    return null;
  }
  function validThrough(p) { return state.scenario === 'expired' && p.id === FOLLOWED ? EXPIRED.validThrough : p.validThrough; }
  function eventsOf(p) {
    var ev = p.events.slice();
    if (state.scenario === 'expired' && p.id === FOLLOWED) ev.push(EXPIRED.event);
    if (state.resent[p.id]) ev.push({ at: RESENT_AT, kind: 'resent', what: 'Notice sent again to ' + p.noticeTo, by: BUYER.name + ' accounts payable' });
    if (state.processed[p.id]) ev.push({ at: PROCESSED_AT, kind: 'processed', what: 'Processed by ' + p.supplier, by: p.supplier });
    if (state.matched[p.id]) ev.push({ at: MATCHED_AT, kind: 'matched', what: 'Matched to ' + p.invoice, by: BUYER.name + ' accounts payable' });
    return ev;
  }
  function has(ev, kind) { return ev.some(function (e) { return e.kind === kind; }); }
  function find(ev, kind) { for (var i = 0; i < ev.length; i++) if (ev[i].kind === kind) return ev[i]; return null; }
  /* The supplier's fact. */
  function processing(p) {
    var ev = eventsOf(p);
    if (has(ev, 'expired')) return 'expired';
    if (has(ev, 'processed')) return 'processed';
    return 'sent';
  }
  /* The buyer's fact. */
  function matching(p) { return has(eventsOf(p), 'matched') ? 'matched' : 'unmatched'; }
  function last(p) { var ev = eventsOf(p); return ev[ev.length - 1]; }
  function processedFor(p) { return p.processedAmount || p.amount; }

  /* One line for the list, in plain words, from the two facts. */
  function listStatus(p) {
    var pr = processing(p), m = matching(p);
    if (pr === 'expired') return { key: 'expired', text: 'Expired, not processed', icon: 'alert' };
    if (pr === 'sent') return { key: 'waiting', text: 'Not processed yet', icon: 'clock' };
    if (m === 'matched') return { key: 'matched', text: 'Processed and matched', icon: 'done' };
    return { key: 'ready', text: 'Processed, ready to match', icon: 'open' };
  }

  var FILTERS = [
    { id: 'all', label: 'All payments' },
    { id: 'waiting', label: 'Not processed yet' },
    { id: 'ready', label: 'Ready to match' },
    { id: 'matched', label: 'Matched' },
    { id: 'expired', label: 'Expired' }
  ];
  function filterLabel(id) { for (var i = 0; i < FILTERS.length; i++) if (FILTERS[i].id === id) return FILTERS[i].label; return ''; }

  /* The rows that need the reader come first: the list answers "what's
     mine?" before it answers anything else. Array.sort is stable, so the
     fixture's order holds inside each group. */
  var RANK = { expired: 0, ready: 1, waiting: 2, matched: 3 };
  function needsYou(p) { var k = listStatus(p).key; return k === 'expired' || k === 'ready'; }

  function shown() {
    var q = state.q.trim().toLowerCase();
    return BASE.slice().sort(function (a, b) { return RANK[listStatus(a).key] - RANK[listStatus(b).key]; }).filter(function (p) {
      if (state.filter !== 'all' && listStatus(p).key !== state.filter) return false;
      if (!q) return true;
      return (p.supplier + ' ' + p.invoice + ' ' + p.ref).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------- small helpers ---------- */

  function money(cents) {
    var d = Math.floor(cents / 100), c = cents % 100;
    return '$' + String(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + (c < 10 ? '0' : '') + c;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function dateOf(at) { return at.split(',')[0]; }
  function count(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* Every icon in the window is Phosphor's (phosphoricons.com, MIT), on its
     256 grid in its regular weight, with its own paths: a filled outline
     that takes the ink it sits in, not a stroke. Wren's own mark is the one
     drawing that isn't, because it's a logo. */
  function ph(d, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  }

  var CARET_DOWN = 'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z';
  var CARET_RIGHT = 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z';
  var CROSS = 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z';

  /* A status is a word and a shape, never a color alone. The shapes are
     one each: a clock for waiting, a check for processed, a double check
     for matched, a dashed circle for ready, a triangle for expired. Ready
     is open on purpose: the fact is not done yet, so it can't wear a
     check beside the one that is. */
  var ICONS = {
    clock: ph('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z', 'wr-icon'),
    check: ph('M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z', 'wr-icon'),
    open: ph('M96.26,37.05A8,8,0,0,1,102,27.29a104.11,104.11,0,0,1,52,0,8,8,0,0,1-2,15.75,8.15,8.15,0,0,1-2-.26,88.09,88.09,0,0,0-44,0A8,8,0,0,1,96.26,37.05ZM53.79,55.14a104.05,104.05,0,0,0-26,45,8,8,0,0,0,15.42,4.27,88,88,0,0,1,22-38.09A8,8,0,0,0,53.79,55.14ZM43.21,151.55a8,8,0,1,0-15.42,4.28,104.12,104.12,0,0,0,26,45,8,8,0,0,0,11.41-11.22A88.14,88.14,0,0,1,43.21,151.55ZM150,213.22a88,88,0,0,1-44,0,8,8,0,1,0-4,15.49,104.11,104.11,0,0,0,52,0,8,8,0,0,0-4-15.49ZM222.65,146a8,8,0,0,0-9.85,5.58,87.91,87.91,0,0,1-22,38.08,8,8,0,1,0,11.42,11.21,104,104,0,0,0,26-45A8,8,0,0,0,222.65,146Zm-9.86-41.54a8,8,0,0,0,15.42-4.28,104,104,0,0,0-26-45,8,8,0,1,0-11.41,11.22A88,88,0,0,1,212.79,104.45Z', 'wr-icon'),
    done: ph('M149.61,85.71l-89.6,88a8,8,0,0,1-11.22,0L10.39,136a8,8,0,1,1,11.22-11.41L54.4,156.79l84-82.5a8,8,0,1,1,11.22,11.42Zm96.1-11.32a8,8,0,0,0-11.32-.1l-84,82.5-18.83-18.5a8,8,0,0,0-11.21,11.42l24.43,24a8,8,0,0,0,11.22,0l89.6-88A8,8,0,0,0,245.71,74.39Z', 'wr-icon'),
    alert: ph('M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z', 'wr-icon')
  };
  function badge(st) { return '<span class="wr-status" data-status="' + st.key + '">' + ICONS[st.icon] + st.text + '</span>'; }

  /* ---------- the screens ---------- */

  var screens = {};

  /* 1. The list: search, a status filter, and the rows. The toolbar is
     drawn once; the rows are redrawn as the reader types (redrawTable),
     so the box keeps its focus and its caret. */
  screens.list = function () {
    return '<header class="wr-head"><h3 class="wr-title" tabindex="-1">Payments</h3>' +
      '<p class="wr-dek">Virtual payments sent to suppliers in the last 60 days.</p></header>' +
      '<form class="wr-tools" role="search" aria-label="Find a payment">' +
        '<div class="wr-field wr-field--grow"><label for="wr-q">Search by supplier or invoice reference</label>' +
          '<span class="wr-search"><input id="wr-q" type="search" data-search autocomplete="off" spellcheck="false" value="' + esc(state.q) + '">' +
          '<button type="button" class="wr-clear" data-clear-search' + (state.q ? '' : ' hidden') + '>' + ph(CROSS) + 'Clear search</button></span></div>' +
        '<div class="wr-field"><label for="wr-filter">Status</label><span class="wr-select"><select id="wr-filter" data-filter>' +
          FILTERS.map(function (f) { return '<option value="' + f.id + '"' + (state.filter === f.id ? ' selected' : '') + '>' + f.label + '</option>'; }).join('') +
        '</select>' + ph(CARET_DOWN) + '</span></div>' +
      '</form>' +
      '<div data-wren-table>' + table() + '</div>';
  };

  function table() {
    var rows = shown();
    var s = '<p class="wr-count" data-count>' + count(rows.length, 'payment', 'payments') +
      (state.filter !== 'all' ? ', ' + filterLabel(state.filter).toLowerCase() : '') +
      (state.q.trim() ? ', matching “' + esc(state.q.trim()) + '”' : '') +
      (state.filter === 'all' && !state.q.trim() && rows.some(needsYou) ? ', ' + rows.filter(needsYou).length + ' need you' : '') + '</p>';
    if (!rows.length) {
      return s + '<p class="wr-empty">No payments match. Check the invoice reference, or <button type="button" class="wr-link" data-clear>clear the search and filter</button>.</p>';
    }
    s += '<div class="wr-table-wrap"><table class="wr-table"><caption class="visually-hidden">Payments, with each one’s status in plain words</caption>' +
      '<thead><tr><th scope="col">Supplier</th><th scope="col">Invoice</th><th scope="col" class="wr-num">Amount</th><th scope="col">Status</th><th scope="col">Valid through</th><th scope="col"><span class="visually-hidden">Open</span></th></tr></thead><tbody>';
    rows.forEach(function (p) {
      var st = listStatus(p);
      s += '<tr data-row="' + p.id + '">' +
        '<th scope="row"><span class="wr-td-label" aria-hidden="true">Supplier</span><button type="button" class="wr-link wr-name" data-open="' + p.id + '">' + esc(p.supplier) + '<span class="visually-hidden">, ' + p.invoice + '</span></button></th>' +
        '<td><span class="wr-td-label" aria-hidden="true">Invoice</span><span class="wr-ref">' + p.invoice + '</span></td>' +
        '<td class="wr-num"><span class="wr-td-label" aria-hidden="true">Amount</span>' + money(p.amount) + '</td>' +
        '<td><span class="wr-td-label" aria-hidden="true">Status</span>' + badge(st) + '</td>' +
        '<td><span class="wr-td-label" aria-hidden="true">Valid through</span>' + validThrough(p) + '</td>' +
        '<td class="wr-cell-act">' + ph(CARET_RIGHT, 'wr-row-caret') + '</td>' +
      '</tr>';
    });
    return s + '</tbody></table></div>';
  }

  /* 2 and 4. The record: the two facts first, then who acts next and the
     one thing they need, then the activity, folded. */
  screens.detail = function () {
    var p = byId(state.open);
    if (!p) return screens.list();
    var pr = processing(p), m = matching(p), ev = eventsOf(p), lastEv = last(p);
    var s = '<p class="wr-crumbs"><button type="button" class="wr-back" data-back>' +
      ph('M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z') + 'Payments</button></p>' +
      '<header class="wr-head wr-head--record">' +
        '<p class="wr-eyebrow">Payment <span class="wr-ref">' + p.ref + '</span></p>' +
        '<h3 class="wr-title" tabindex="-1">' + esc(p.supplier) + ' · ' + p.invoice + ' · ' + money(p.amount) + '</h3>' +
      '</header>';

    /* The two facts, side by side, each a status with its date. */
    s += '<dl class="wr-facts" tabindex="-1" data-processing="' + pr + '" data-matching="' + m + '">' +
      '<div class="wr-fact"><dt>Supplier processing</dt><dd>' + processingFact(p, pr, ev) + '</dd></div>' +
      '<div class="wr-fact"><dt>Invoice matching</dt><dd>' + matchingFact(p, pr, m, ev) + '</dd></div>' +
    '</dl>';

    /* Who acts next, and the one thing to do. */
    s += nextAction(p, pr, m);

    /* What a specialist needs to act, in one row. The proposed match carries
       the same reference and amount, so the row steps aside while it is open
       and the buttons stay inside the window. */
    if (!(state.reviewing && pr === 'processed' && m === 'unmatched')) s += '<dl class="wr-grid">' +
      '<div><dt>Invoice reference</dt><dd><span class="wr-ref">' + p.invoice + '</span><span class="wr-when">' + esc(p.item) + '</span></dd></div>' +
      '<div><dt>Amount</dt><dd>' + money(p.amount) + '</dd></div>' +
      '<div><dt>Valid through</dt><dd>' + validThrough(p) + (pr === 'expired' ? ' <span class="wr-muted">(passed)</span>' : '') + '</dd></div>' +
      '<div><dt>Last confirmed event</dt><dd>' + esc(lastEv.what) + '<span class="wr-when">' + lastEv.at + '</span></dd></div>' +
    '</dl>';

    /* The activity, folded under the facts it was once above. */
    s += '<details class="wr-activity"' + (state.activity ? ' open' : '') + '><summary class="disclosure-row wr-activity-row">' + ph(CARET_DOWN, 'disclosure-chev') + '<span data-activity>Activity, ' + count(ev.length, 'event', 'events') + '</span></summary>' +
      '<ol class="wr-events">' + ev.map(function (e) {
        return '<li><span class="wr-event-at">' + e.at + '</span><span class="wr-event-what">' + esc(e.what) + '</span><span class="wr-event-by">' + esc(e.by) + '</span></li>';
      }).join('') + '</ol></details>';
    return s;
  }

  function processingFact(p, pr, ev) {
    /* A "no" is dated: it is the record's last read of the events, not a
       fact about the card. Since 2026-11-07 the line says so in words. */
    if (pr === 'sent') {
      return '<span class="wr-fact-head">' + ICONS.clock + 'Not processed yet</span>' +
        '<span class="wr-fact-line">Card issued and notice delivered ' + dateOf(find(ev, 'delivered') ? find(ev, 'delivered').at : find(ev, 'notice').at) + '. No charge posted as of ' + CHECKED_AT + ', the last read of the events.</span>';
    }
    if (pr === 'processed') {
      var e = find(ev, 'processed');
      return '<span class="wr-fact-head">' + ICONS.check + 'Processed by supplier</span>' +
        '<span class="wr-fact-line">' + esc(p.supplier) + ' processed it ' + e.at + (processedFor(p) !== p.amount ? ' for ' + money(processedFor(p)) : '') + '.</span>';
    }
    /* The date that passed is the validity date, not the moment the system
       noticed: "Expired Nov 4" names what ran out. Since 2026-11-07 the line
       stops short of "nothing was charged": the read is a day old at most,
       and a late charge can still post, so it asks for one more check. */
    return '<span class="wr-fact-head">' + ICONS.alert + 'Expired ' + validThrough(p) + ', not processed</span>' +
      '<span class="wr-fact-line">The card’s date passed with no charge posted as of ' + CHECKED_AT + '. A late charge can still post for a day, so check again before replacing it.</span>';
  }

  function matchingFact(p, pr, m, ev) {
    if (m === 'matched') {
      var e = find(ev, 'matched');
      return '<span class="wr-fact-head">' + ICONS.done + '<span>Matched to <span class="wr-nb">' + p.invoice + '</span></span></span>' +
        '<span class="wr-fact-line">' + 'Matched ' + e.at + '. The invoice is closed.</span>';
    }
    if (pr === 'processed') {
      return '<span class="wr-fact-head">' + ICONS.open + 'Ready to match to invoice</span>' +
        '<span class="wr-fact-line">Processed, and not yet matched to ' + p.invoice + '. ' + (state.declined && p.id === state.open ? 'Nothing changed when you declined. Check it with ' + esc(p.supplier) + ', then review the match again.' : 'Review the match to close the invoice.') + '</span>';
    }
    if (pr === 'expired') {
      return '<span class="wr-fact-head">Nothing to match</span>' +
        '<span class="wr-fact-line">No payment was processed, so ' + p.invoice + ' is still open and unpaid.</span>';
    }
    return '<span class="wr-fact-head">Not yet</span>' +
      '<span class="wr-fact-line">Matching waits for processing. ' + p.invoice + ' stays open until then.</span>';
  }

  function nextAction(p, pr, m) {
    var who, line, act = '';
    if (pr === 'sent') {
      who = p.supplier;
      line = esc(p.supplier) + ' hasn’t charged the card. It’s good through ' + validThrough(p) + '.';
      /* The scene is this supplier on the phone, so the record answers the
         call before it schedules anything: what to tell them, who got the
         notice, and the one thing to do now. The follow-up is a second,
         smaller line, with where its date comes from. Since 2026-11-07; until
         then the follow-up led and the call's answer came after it. */
      var sent = dateOf(find(eventsOf(p), 'notice').at);
      act = '<div class="wr-tell"' + (state.resent[p.id] ? ' tabindex="-1" data-resent' : '') + '><h5 class="wr-tell-h">What to tell ' + esc(p.supplier) + '</h5>' +
        '<p class="wr-tell-line">The card hasn’t been charged, so the invoice is open on both sides. The notice went to ' + p.noticeTo + ' on ' + sent +
        (state.resent[p.id]
          ? ', and again ' + RESENT_AT + '.</p>'
          : '. Confirm that’s the right inbox, and send it again if it isn’t.</p>' +
            '<p class="wr-act"><button type="button" class="btn btn-ghost-light wr-btn" data-resend>Send the notice again</button></p>') +
        '</div>' +
        '<p class="wr-next-later"><strong>Later:</strong> follow up ' + p.followUp + ' if it’s still unprocessed, a week before the card expires ' + validThrough(p) + '.</p>';
    } else if (pr === 'processed' && m === 'unmatched') {
      who = 'You';
      line = esc(p.supplier) + ' processed it. Match it to ' + p.invoice + ' so the invoice closes in your books.';
      /* The panel's own button takes over while it is open: one primary. */
      if (!state.reviewing) act = '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-review aria-expanded="false" aria-controls="wr-match">Review match</button></p>';
    } else if (m === 'matched') {
      who = 'No one';
      line = 'This payment is processed and matched. There is nothing left to do on it.';
    } else {
      who = 'You';
      line = 'The card can’t be charged now. Check for a late charge first; then a replacement would be a new payment for ' + p.invoice + ' with a new validity date.';
      if (!state.replacing) act = '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-replace aria-expanded="false" aria-controls="wr-replace">Review replacement options</button></p>';
    }
    var s = '<section class="wr-next" aria-labelledby="wr-next-h"><h4 id="wr-next-h" class="wr-next-h">Who acts next</h4>' +
      '<p class="wr-next-who">' + esc(who) + '</p><p class="wr-next-line">' + line + '</p>' + act;
    if (pr === 'processed' && m === 'unmatched' && state.reviewing) s += matchPanel(p);
    if (pr === 'expired' && state.replacing) s += replacePanel(p);
    return s + '</section>';
  }

  /* The match, proposed and confirmed. Two columns of the same three
     facts, so a specialist checks them against each other, not against
     memory. */
  function matchPanel(p) {
    var e = find(eventsOf(p), 'processed');
    var agree = processedFor(p) === p.amount;
    var charged = money(processedFor(p));
    var verdict = agree
      ? '<p class="wr-panel-line">' + ICONS.check + 'Supplier and amount agree. Confirming records the match and changes nothing about the processing.</p>'
      : '<p class="wr-panel-line" data-differs>' + ICONS.alert + 'The amounts differ by ' + money(p.amount - processedFor(p)) + ', so this can’t be confirmed. Check it with ' + esc(p.supplier) + ' before the invoice closes.</p>';
    var buttons = agree
      ? '<button type="button" class="btn btn-primary wr-btn" data-confirm-match>Confirm match</button>' +
        '<button type="button" class="btn btn-ghost-light wr-btn" data-decline-match>Not this invoice</button>'
      : '<button type="button" class="btn btn-ghost-light wr-btn" data-decline-match>Leave it open</button>';
    return '<div class="wr-panel" id="wr-match"><h5 class="wr-panel-h" tabindex="-1">Proposed match</h5>' +
      '<div class="wr-pair">' +
        '<dl class="wr-pair-col"><dt>Invoice</dt><dd><span class="wr-ref">' + p.invoice + '</span></dd><dt>From</dt><dd>' + esc(p.supplier) + '</dd><dt>Amount</dt><dd>' + money(p.amount) + '</dd></dl>' +
        '<dl class="wr-pair-col"><dt>Payment</dt><dd><span class="wr-ref">' + p.ref + '</span></dd><dt>Processed by</dt><dd>' + esc(p.supplier) + ', ' + e.at + '</dd><dt>Amount</dt><dd' + (agree ? '' : ' data-differs') + '>' + charged + '</dd></dl>' +
      '</div>' + verdict +
      '<p class="wr-row">' + buttons + '</p></div>';
  }

  /* The exception's next step, informational: what a replacement is and
     what it would need. Nothing here issues one. */
  function replacePanel(p) {
    return '<div class="wr-panel" id="wr-replace"><h5 class="wr-panel-h" tabindex="-1">Replacement options</h5>' +
      '<ol class="wr-steps">' +
        '<li><strong>Check for a late charge first.</strong> A charge can post up to a day after the date. One from ' + esc(p.supplier) + ' would put this payment back to ready to match, and there would be nothing to replace.</li>' +
        '<li><strong>Check with ' + esc(p.supplier) + '</strong> that the notice reached the right person. The validity date, not the invoice, is what ran out.</li>' +
        '<li><strong>A replacement payment</strong> would be a new payment for ' + p.invoice + ', ' + money(p.amount) + ', with a new validity date. Issuing one needs your approver, and it is outside this demo.</li>' +
        '<li><strong>Don’t pay twice.</strong> No charge has posted on this card. A replacement replaces it; it doesn’t add to it.</li>' +
      '</ol>' +
      '<p class="wr-row"><button type="button" class="btn btn-ghost-light wr-btn" data-close-replace>Close</button></p></div>';
  }

  /* 3. The supplier's notice, with only what the buyer shared. */
  screens.notice = function () {
    var p = byId(state.open) || byId(FOLLOWED);
    var pr = processing(p), ev = eventsOf(p);
    var s = '<header class="wr-head wr-head--record">' +
      '<p class="wr-eyebrow">Payment notice from ' + BUYER.name + '</p>' +
      '<h3 class="wr-title" tabindex="-1">' + money(p.amount) + ' for invoice ' + p.invoice + '</h3>' +
      '</header>' +
      '<dl class="wr-grid wr-grid--notice">' +
        '<div><dt>From</dt><dd>' + BUYER.name + '</dd></div>' +
        '<div><dt>Invoice reference</dt><dd><span class="wr-ref">' + p.invoice + '</span><span class="wr-when">' + esc(p.item) + '</span></dd></div>' +
        '<div><dt>Amount</dt><dd>' + money(p.amount) + '</dd></div>' +
        '<div><dt>Valid through</dt><dd>' + validThrough(p) + '</dd></div>' +
        '<div><dt>Payment reference</dt><dd><span class="wr-ref">' + p.ref + '</span></dd></div>' +
        '<div><dt>Sent</dt><dd>' + find(ev, 'notice').at + '</dd></div>' +
      '</dl>';
    if (pr === 'sent') {
      s += '<section class="wr-next" aria-labelledby="wr-sup-h"><h4 id="wr-sup-h" class="wr-next-h">Process this payment</h4>' +
        '<p class="wr-next-line">Processing charges the payment for the amount above and tells ' + BUYER.name + ' it is done.</p>' +
        '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-process>Process this payment</button></p></section>';
    } else {
      var e = find(ev, 'processed');
      s += '<section class="wr-next" aria-labelledby="wr-sup-h"><h4 id="wr-sup-h" class="wr-next-h">Processed</h4>' +
        '<p class="wr-next-line wr-next-line--marked">' + ICONS.check + '<span>Processed ' + e.at + (processedFor(p) !== p.amount ? ' for ' + money(processedFor(p)) : '') + '. ' + BUYER.name + ' can see this now. There is nothing more to do here.</span></p></section>';
    }
    s += '<p class="wr-fine">The supplier’s notice shows only what the buyer shared: no approver, no account coding, no internal notes.</p>';
    return s;
  };

  /* ---------- the walkthrough's steps, outside the product ---------- */

  /* Where the story stands is read from the followed payment, so the rail
     can't go backwards and a line can't ask for a press that is gone. A
     payment other than the followed one says so rather than borrowing the
     story's words. Returns the current step, how many before it are done, the
     line to show, and the next press: `press` when it is a control in the
     window, `attr` when the button itself does the work. Keep each line to
     two lines at the guide's measure: that is the room it reserves, so the
     button holds its place from press to press. */
  var TO_OPEN = { label: 'Open ' + SEARCHED, press: '[data-open="' + FOLLOWED + '"]' };
  var TO_PROCESS = { label: 'Process this payment', press: '[data-process]' };
  var TO_REVIEW = { label: 'Review match', press: '[data-review]' };
  var TO_CONFIRM = { label: 'Confirm match', press: '[data-confirm-match]' };
  var TO_REPLACE = { label: 'Review replacement options', press: '[data-replace]' };
  var TO_SUPPLIER = { label: 'View the supplier’s notice', attr: 'data-role="supplier"' };
  var TO_BUYER = { label: 'Back to the buyer’s record', attr: 'data-role="buyer"' };
  var TO_EXPIRED = { label: 'See an expired payment', attr: 'data-scenario="expired"' };
  var TO_START = { label: 'Start over', attr: 'data-reset' };
  var TO_FOLLOWED = { label: 'Back to ' + SEARCHED, attr: 'data-follow' };
  var TO_SEARCH = { label: 'Search ' + SEARCHED, attr: 'data-search-followed' };
  function walk() {
    var f = byId(FOLLOWED), pr = processing(f), m = matching(f);
    var other = state.screen !== 'list' && state.open && state.open !== FOLLOWED;
    var otherLine = 'Another payment on the list. The story follows ' + SEARCHED + '.';
    var otherNext = TO_FOLLOWED;
    if (other && state.open === 'northshore-30077') {
      otherLine = state.reviewing
        ? 'The two amounts don’t agree, so there’s no Confirm match. The story follows ' + SEARCHED + '.'
        : 'Processed for less than the invoice. Review the match to see the check hold.';
      if (!state.reviewing) otherNext = TO_REVIEW;
    }
    /* The expired payment is an alternate ending, not the next event, and
       its line says so, with the one date that changes to show it. */
    if (state.scenario === 'expired') {
      return { now: 5, done: 4, next: other ? otherNext : (state.screen === 'list' || state.replacing) ? TO_START : TO_REPLACE, hint: other ? otherLine :
        state.screen === 'list' ? 'Expired payments sort to the top, because they need you.' :
        state.replacing ? 'A replacement would be a new payment, and nothing is issued here. That’s the whole story.' :
        'An alternate ending, not what came next: the same card, expiring Nov 4 instead of Nov 27, never charged. Your move.' };
    }
    if (m === 'matched') {
      return { now: 5, done: 4, next: other ? otherNext : TO_EXPIRED, hint: other ? otherLine : SEARCHED + ' is closed, and each fact has its own date. Last, a different ending: what if Hillside never charges the card?' };
    }
    /* On the list, the search comes first: the row is offered once it is the
       one row showing, and searched for if it is among others or gone. */
    var rows = shown();
    var onList = rows.length === 1 && rows[0].id === FOLLOWED ? TO_OPEN : TO_SEARCH;
    if (pr === 'processed') {
      if (other) return { now: 4, done: 3, next: otherNext, hint: otherLine };
      if (state.screen === 'notice') return { now: 3, done: 2, next: TO_BUYER, hint: 'Processed: the card is charged. That’s all Hillside has to do, so back to the buyer’s record of the same payment.' };
      if (state.screen === 'list') return { now: 4, done: 3, next: onList, hint: 'Find ' + SEARCHED + ' again to close the loop.' };
      return { now: 4, done: 3, next: state.reviewing ? TO_CONFIRM : TO_REVIEW, hint: state.reviewing ? 'The invoice and the payment, side by side. The supplier and the amount agree.' : 'You’re Maple Street again. Hillside charged the card, so the record reads processed and ready to match. Close the invoice.' };
    }
    if (other) return { now: 1, done: 0, next: otherNext, hint: otherLine };
    if (state.screen === 'notice') return { now: 3, done: 2, next: TO_PROCESS, hint: 'Now you’re Hillside, the supplier. The notice shows only what Maple Street shared, and one thing to do: charge the card.' };
    if (state.screen === 'detail') return { now: 2, done: 1, next: TO_SUPPLIER, hint: 'Issued, not charged. The record says what to tell Hillside now, what to do later, and that Hillside acts next.' };
    return { now: 1, done: 0, next: onList, hint: onList === TO_OPEN
      ? 'One payment, and the list says it isn’t processed yet. Open it to see where it stands.'
      : HINT_START };
  }

  /* ---------- rendering ---------- */

  var stage = root.querySelector('[data-wren-stage]');
  var status = root.querySelector('[data-wren-status]');
  var chrome = root.querySelector('[data-wren-chrome]');
  var steps = root.querySelectorAll('[data-wren-step]');
  var hint = root.querySelector('[data-wren-hint]');
  var view = root.querySelector('[data-wren-view]');
  var scenario = root.querySelector('[data-wren-scenario]');
  var guide = root.querySelector('[data-wren-guide]');
  var nextSlot = root.querySelector('[data-wren-next]');

  function announce(msg) {
    if (!status) return;
    status.textContent = '';
    setTimeout(function () { status.textContent = msg; }, 30);
  }

  var lastKey = null;
  var guidePress = false;
  var STEP_DONE = ph('M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z');

  function render(opts) {
    opts = opts || {};
    var screen = state.role === 'supplier' ? 'notice' : state.screen;
    state.screen = screen;
    var scrolled = stage.scrollTop;
    /* A new screen arrives; a press that stays on the screen doesn't replay
       the arrival over everything already there. */
    var key = screen + '|' + state.open + '|' + state.scenario;
    if (key !== lastKey) stage.setAttribute('data-arrive', ''); else stage.removeAttribute('data-arrive');
    lastKey = key;
    stage.innerHTML = screens[screen]();
    /* The window is one fixed size from 48rem and the stage scrolls inside
       it: a new screen starts at its top, and a press that stays on the
       screen leaves the reader where they were. */
    stage.scrollTop = opts.still ? scrolled : 0;
    stage.setAttribute('data-screen', screen);
    root.setAttribute('data-role', state.role);
    root.setAttribute('data-scenario', state.scenario);
    if (chrome) {
      chrome.innerHTML = state.role === 'supplier'
        ? '<span class="wr-org">' + esc(byId(state.open || FOLLOWED).supplier) + '</span><span class="wr-role">Accounts receivable</span>'
        : '<span class="wr-org">' + BUYER.name + '</span><span class="wr-role">' + BUYER.team + '</span>';
    }
    /* Whose screen is in the window, said outside it, since 2026-11-07: the
       chrome inside is the product's own sign-in line, and a reader who has
       never seen the product can't read a role change from it. */
    if (view) {
      view.textContent = state.role === 'supplier'
        ? 'Demo view: ' + byId(state.open || FOLLOWED).supplier + ', the supplier'
        : 'Demo view: ' + BUYER.name + ', the buyer';
    }
    drawGuide();
    if (opts.announce) announce(guidePress ? opts.announce + ' ' + walk().hint : opts.announce);
    if (opts.focus) {
      var el = stage.querySelector(opts.focus);
      if (el) {
        el.focus({ preventScroll: true });
        if (opts.still) reveal(el.closest('.wr-panel') || el);
        else windowIntoView();
      }
    }
    /* The button's press stays on the button, wherever the screen's own focus
       went: the next press is the same key, and the live region has the line. */
    if (guidePress) {
      guidePress = false;
      var again = nextSlot && nextSlot.querySelector('button');
      if (again) again.focus({ preventScroll: true });
    }
  }

  /* The rail, the line, and the next press. Drawn from walk() after anything
     that can change them, the rows too. */
  function drawGuide() {
    var w = walk();
    Array.prototype.forEach.call(steps, function (el) {
      var n = Number(el.getAttribute('data-wren-step'));
      if (n === w.now) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      var done = n <= w.done;
      if (done) el.setAttribute('data-done', ''); else el.removeAttribute('data-done');
      el.querySelector('.as-step-n').innerHTML = done ? STEP_DONE : String(n);
      var said = el.querySelector('[data-step-said]');
      if (said) said.textContent = done ? ', done' : '';
    });
    /* The label over the line: which story is running and where it stands,
       so the alternate ending never reads as the next step of the first. */
    if (scenario) {
      scenario.textContent = 'Step ' + w.now + ' of 5 · ' +
        (state.scenario === 'expired' ? 'Alternate ending: an expired payment' : 'The supplier’s call');
    }
    /* The reference never breaks at its hyphen. */
    if (hint) hint.innerHTML = esc(w.hint).replace(SEARCHED, '<span class="as-ref">' + SEARCHED + '</span>');
    if (nextSlot) {
      var how = w.next.attr ? w.next.attr : 'data-next="' + esc(w.next.press) + '"';
      nextSlot.innerHTML = '<button type="button" class="btn btn-primary as-next" ' + how + '>' + w.next.label + '<span aria-hidden="true"> →</span></button>';
    }
  }

  /* A new screen starts at its top, so the top of the window comes down
     from under the sticky guide if the page had scrolled past it. */
  function windowIntoView() {
    var frame = root.querySelector('.wr-frame');
    if (!frame || !guide) return;
    var over = guide.getBoundingClientRect().bottom - frame.getBoundingClientRect().top;
    if (over > 0) window.scrollBy(0, -over);
  }

  /* Brings what a press opened or changed into view. From 48rem that moves
     the stage and not the page; a phone has no inner scroll, so there it
     moves the page, below the fixed nav and the guide. A thing taller than the view shows
     from its top. */
  function reveal(el) {
    var box = el.getBoundingClientRect();
    var foot = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
    if (getComputedStyle(stage).overflowY === 'visible') {
      var nav = document.querySelector('.site-nav');
      var top = (nav ? nav.getBoundingClientRect().bottom : 0) + (guide ? guide.offsetHeight : 0) + foot;
      if (box.top < top || box.bottom + foot > window.innerHeight) window.scrollBy(0, box.top - top);
      return;
    }
    var view = stage.getBoundingClientRect();
    var below = box.bottom + foot - view.bottom;
    if (below > 0) stage.scrollTop += Math.min(below, box.top - view.top);
    else if (box.top < view.top) stage.scrollTop -= view.top - box.top;
    /* The window can be taller than a laptop's view, so the page may have
       scrolled past what changed. It comes back down under the guide. */
    var over = (guide ? guide.getBoundingClientRect().bottom : 0) + foot - el.getBoundingClientRect().top;
    if (over > 0) window.scrollBy(0, -over);
  }

  /* The rows alone, as the reader types or filters. */
  function redrawTable() {
    var box = stage.querySelector('[data-wren-table]');
    if (!box) return;
    box.innerHTML = table();
    var c = box.querySelector('[data-count]');
    announce(c ? c.textContent : '');
    var clear = stage.querySelector('[data-clear-search]');
    if (clear) clear.hidden = !state.q;
    drawGuide();
  }

  /* ---------- the presses ---------- */

  function openRecord(id, from) {
    state.open = id;
    state.reviewing = false;
    state.replacing = false;
    state.declined = false;
    state.activity = false;
    state.returnTo = from || null;
    state.screen = 'detail';
    var p = byId(id);
    render({ focus: '.wr-title', announce: 'Payment record: ' + p.supplier + ', ' + p.invoice + '. ' + listStatus(p).text + '.' });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');

    /* Anywhere on a row opens it, unless the press was a drag across its
       words to copy a reference. */
    var row = !t && e.target.closest('tr[data-row]');
    if (row && !String(window.getSelection())) {
      var rowId = row.getAttribute('data-row');
      openRecord(rowId, '[data-open="' + rowId + '"]');
      return;
    }

    if (!t || !root.contains(t)) return;
    if (nextSlot && nextSlot.contains(t)) guidePress = true;

    /* The guide's offer is the control itself, pressed: one path for both. */
    if (t.hasAttribute('data-next')) {
      var control = root.querySelector(t.getAttribute('data-next'));
      if (control) control.click();
      guidePress = false;
      return;
    }

    /* The guide's offers with no control on the screen behind them. */
    if (t.hasAttribute('data-follow')) { state.role = 'buyer'; openRecord(FOLLOWED); return; }
    if (t.hasAttribute('data-search-followed')) {
      state.q = SEARCHED;
      state.filter = 'all';
      render({ focus: '[data-open="' + FOLLOWED + '"]', still: true, announce: '1 payment, matching ' + SEARCHED + '.' });
      return;
    }

    /* The story's turns, which only the guide's button offers. */
    if (t.hasAttribute('data-reset')) {
      state = fresh();
      render({ focus: '.wr-title', announce: 'Started over. The payments list, as the buyer.' });
      return;
    }
    if (t.hasAttribute('data-scenario')) {
      state = fresh('expired');
      state.open = FOLLOWED;
      state.screen = 'detail';
      render({ focus: '.wr-title', announce: 'An alternate ending. The same payment to Hillside Packaging, its card expired Nov 4 with no charge.' });
      return;
    }
    if (t.hasAttribute('data-role')) {
      var r = t.getAttribute('data-role');
      state.role = r;
      if (r === 'supplier') {
        state.screen = 'notice';
        render({ focus: '.wr-title', announce: 'Supplier role: the payment notice as ' + byId(state.open).supplier + ' sees it.' });
      } else {
        state.screen = 'detail';
        render({ focus: '.wr-title', announce: 'Back to the buyer’s record. ' + listStatus(byId(state.open)).text + '.' });
      }
      return;
    }

    /* The product. */
    if (t.hasAttribute('data-open')) { openRecord(t.getAttribute('data-open'), '[data-open="' + t.getAttribute('data-open') + '"]'); return; }
    if (t.hasAttribute('data-clear-search')) {
      state.q = '';
      render({ focus: '[data-search]', still: true, announce: 'Search cleared. ' + count(shown().length, 'payment', 'payments') + '.' });
      return;
    }
    if (t.hasAttribute('data-clear')) {
      state.q = '';
      state.filter = 'all';
      render({ focus: '[data-search]', still: true, announce: 'Search and filter cleared. ' + count(BASE.length, 'payment', 'payments') + '.' });
      return;
    }
    if (t.hasAttribute('data-back')) {
      var back = state.returnTo;
      state.screen = 'list';
      render({ focus: back || '.wr-title', still: !!back, announce: 'Payments list.' });
      return;
    }
    if (t.hasAttribute('data-review')) {
      state.reviewing = !state.reviewing;
      state.declined = false;
      render({ focus: state.reviewing ? '#wr-match .wr-panel-h' : '[data-review]', still: true, announce: state.reviewing ? 'Proposed match shown.' : 'Proposed match hidden.' });
      return;
    }
    if (t.hasAttribute('data-decline-match')) {
      state.reviewing = false;
      state.declined = true;
      render({ focus: '[data-review]', still: true, announce: 'Nothing changed. The match is still open.' });
      return;
    }
    if (t.hasAttribute('data-confirm-match')) {
      var pm = byId(state.open);
      if (!pm || processing(pm) !== 'processed' || matching(pm) === 'matched') return;
      state.matched[pm.id] = true;
      state.reviewing = false;
      render({ focus: '.wr-facts', still: true, announce: 'Matched: ' + pm.ref + ' to ' + pm.invoice + ', ' + MATCHED_AT + '. The processing event is unchanged.' });
      return;
    }
    if (t.hasAttribute('data-replace')) {
      state.replacing = !state.replacing;
      render({ focus: state.replacing ? '#wr-replace .wr-panel-h' : '[data-replace]', still: true, announce: state.replacing ? 'Replacement options shown. Nothing is issued here.' : 'Replacement options hidden.' });
      return;
    }
    if (t.hasAttribute('data-close-replace')) {
      state.replacing = false;
      render({ focus: '[data-replace]', still: true, announce: 'Replacement options hidden.' });
      return;
    }
    if (t.hasAttribute('data-resend')) {
      var pn = byId(state.open);
      if (!pn || state.resent[pn.id]) return;
      state.resent[pn.id] = true;
      render({ focus: '[data-resent]', still: true, announce: 'Notice sent again to ' + pn.noticeTo + ', ' + RESENT_AT + '.' });
      return;
    }
    if (t.hasAttribute('data-process')) {
      var ps = byId(state.open || FOLLOWED);
      if (!ps || processing(ps) !== 'sent') return;
      state.processed[ps.id] = true;
      render({ focus: '.wr-title', still: true, announce: 'Processed ' + PROCESSED_AT + '. ' + BUYER.name + ' can see it now.' });
      return;
    }
  });

  /* Unfolding the activity survives the next press. toggle doesn't bubble. */
  root.addEventListener('toggle', function (e) {
    if (e.target.classList && e.target.classList.contains('wr-activity')) state.activity = e.target.open;
  }, true);

  /* The search and the filter redraw the rows in place. */
  root.addEventListener('input', function (e) {
    if (e.target.hasAttribute('data-search')) { state.q = e.target.value; redrawTable(); }
  });
  root.addEventListener('change', function (e) {
    if (e.target.hasAttribute('data-filter')) { state.filter = e.target.value; redrawTable(); }
  });
  root.addEventListener('submit', function (e) {
    if (!e.target.classList.contains('wr-tools')) return;
    e.preventDefault();
    /* Enter in the search, when the search has found the one. */
    var found = shown();
    if (found.length === 1) openRecord(found[0].id, '[data-open="' + found[0].id + '"]');
  });
  /* Escape closes an open panel and puts focus back on its button. */
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.reviewing) { state.reviewing = false; render({ focus: '[data-review]', still: true, announce: 'Proposed match hidden.' }); }
    else if (state.replacing) { state.replacing = false; render({ focus: '[data-replace]', still: true, announce: 'Replacement options hidden.' }); }
  });

  render();
})();
