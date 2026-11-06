/* wren.js -- the After Send prototype: one virtual payment, followed from
   a buyer's payments list to the supplier's notice and back to the same
   record, at a desktop's width. Loaded by lab/after-send.html and nothing
   else, where it runs under the hero.

   EVERYTHING HERE IS SIMULATED, and the page says so before anyone presses.
   Wren Payments is a made-up product, Fieldstone Foods a made-up buyer,
   Larkspur Packaging a made-up supplier, and every reference below is
   synthetic. No card number, no account, no network, no file, no sign-in.
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

   TWO SCENARIOS, ONE RESET. The demo controls outside the product switch
   between the default path and the same payment expired unprocessed, and
   Start over puts everything back. Both are deterministic: the clock is a
   fixed demo date, and every timestamp is written below.

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
  var BUYER = { name: 'Fieldstone Foods', team: 'Accounts payable' };

  /* The one payment the walkthrough follows, and four more so the list can
     be searched and filtered. Amounts in cents, so nothing is rounded. */
  var BASE = [
    { id: 'larkspur-20483', ref: 'VP-7Q2M-11', supplier: 'Larkspur Packaging', invoice: 'INV-20483', amount: 486000, sent: 'Oct 28', validThrough: 'Nov 27',
      events: [
        { at: 'Oct 28, 9:14 am', kind: 'issued', what: 'Payment issued for INV-20483', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 28, 9:15 am', kind: 'notice', what: 'Payment notice sent to Larkspur Packaging', by: PRODUCT },
        { at: 'Oct 28, 9:16 am', kind: 'delivered', what: 'Notice delivered to Larkspur’s accounts receivable inbox', by: PRODUCT }
      ] },
    { id: 'cedar-11920', ref: 'VP-3H8K-02', supplier: 'Cedar Ridge Produce', invoice: 'INV-11920', amount: 221550, sent: 'Oct 22', validThrough: 'Nov 21',
      events: [
        { at: 'Oct 22, 10:02 am', kind: 'issued', what: 'Payment issued for INV-11920', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 22, 10:03 am', kind: 'notice', what: 'Payment notice sent to Cedar Ridge Produce', by: PRODUCT },
        { at: 'Oct 24, 8:40 am', kind: 'processed', what: 'Processed by Cedar Ridge Produce', by: 'Cedar Ridge Produce' },
        { at: 'Oct 24, 1:15 pm', kind: 'matched', what: 'Matched to INV-11920', by: BUYER.name + ' accounts payable' }
      ] },
    { id: 'bright-30077', ref: 'VP-9C4D-07', supplier: 'Bright Harbor Logistics', invoice: 'INV-30077', amount: 1240000, sent: 'Oct 30', validThrough: 'Nov 29',
      events: [
        { at: 'Oct 30, 3:48 pm', kind: 'issued', what: 'Payment issued for INV-30077', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 30, 3:49 pm', kind: 'notice', what: 'Payment notice sent to Bright Harbor Logistics', by: PRODUCT },
        { at: 'Nov 3, 11:20 am', kind: 'processed', what: 'Processed by Bright Harbor Logistics', by: 'Bright Harbor Logistics' }
      ] },
    { id: 'tamsin-0921', ref: 'VP-5N1R-04', supplier: 'Tamsin Office Supply', invoice: 'INV-0921', amount: 31875, sent: 'Sep 30', validThrough: 'Oct 30',
      events: [
        { at: 'Sep 30, 2:05 pm', kind: 'issued', what: 'Payment issued for INV-0921', by: BUYER.name + ' accounts payable' },
        { at: 'Sep 30, 2:06 pm', kind: 'notice', what: 'Payment notice sent to Tamsin Office Supply', by: PRODUCT },
        { at: 'Oct 31, 12:00 am', kind: 'expired', what: 'Validity date passed. The payment expired without being processed.', by: PRODUCT }
      ] },
    { id: 'larkspur-20391', ref: 'VP-2W6T-09', supplier: 'Larkspur Packaging', invoice: 'INV-20391', amount: 114000, sent: 'Oct 9', validThrough: 'Nov 8',
      events: [
        { at: 'Oct 9, 9:30 am', kind: 'issued', what: 'Payment issued for INV-20391', by: BUYER.name + ' accounts payable' },
        { at: 'Oct 9, 9:31 am', kind: 'notice', what: 'Payment notice sent to Larkspur Packaging', by: PRODUCT },
        { at: 'Oct 12, 4:12 pm', kind: 'processed', what: 'Processed by Larkspur Packaging', by: 'Larkspur Packaging' },
        { at: 'Oct 13, 9:05 am', kind: 'matched', what: 'Matched to INV-20391', by: BUYER.name + ' accounts payable' }
      ] }
  ];
  var FOLLOWED = 'larkspur-20483';

  /* The exception: the same payment, its validity date a day before the
     demo's today, and no processing event ever arrived. */
  var EXPIRED = {
    validThrough: 'Nov 4',
    event: { at: 'Nov 5, 12:00 am', kind: 'expired', what: 'Validity date passed. The payment expired without being processed.', by: PRODUCT }
  };

  /* What the two presses in this demo add. Fixed, so a run is a run. */
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
      processed: {},                     /* id -> true once the supplier pressed Process */
      matched: {},                       /* id -> true once the buyer confirmed the match */
      reviewing: false,                  /* the match panel is open */
      replacing: false,                  /* the replacement panel is open */
      declined: false                    /* "Not this invoice" was pressed, so the record says nothing changed */
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
    if (state.processed[p.id]) ev.push({ at: PROCESSED_AT, kind: 'processed', what: 'Processed by ' + p.supplier, by: p.supplier, demo: true });
    if (state.matched[p.id]) ev.push({ at: MATCHED_AT, kind: 'matched', what: 'Matched to ' + p.invoice + ' in this demo', by: BUYER.name + ' accounts payable', demo: true });
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

  /* One line for the list, in plain words, from the two facts. */
  function listStatus(p) {
    var pr = processing(p), m = matching(p);
    if (pr === 'expired') return { key: 'expired', text: 'Expired, not processed', icon: 'alert' };
    if (pr === 'sent') return { key: 'waiting', text: 'Sent, waiting for supplier', icon: 'clock' };
    if (m === 'matched') return { key: 'matched', text: 'Processed and matched', icon: 'done' };
    return { key: 'ready', text: 'Processed, ready to match', icon: 'check' };
  }

  var FILTERS = [
    { id: 'all', label: 'All payments' },
    { id: 'waiting', label: 'Waiting for supplier' },
    { id: 'ready', label: 'Ready to match' },
    { id: 'matched', label: 'Matched' },
    { id: 'expired', label: 'Expired' }
  ];
  function filterLabel(id) { for (var i = 0; i < FILTERS.length; i++) if (FILTERS[i].id === id) return FILTERS[i].label; return ''; }

  function shown() {
    var q = state.q.trim().toLowerCase();
    return BASE.filter(function (p) {
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

  /* A status is a word and a shape, never a color alone. The shapes are
     one each: a clock for waiting, a check for processed, a double check
     for matched, a triangle for expired. */
  var ICONS = {
    clock: '<svg class="wr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg class="wr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    done: '<svg class="wr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 13 4 4L15 7"/><path d="m11 17 10-10"/></svg>',
    alert: '<svg class="wr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5"/><path d="M12 17.5v.01"/></svg>'
  };
  function badge(st) { return '<span class="wr-status" data-status="' + st.key + '">' + ICONS[st.icon] + st.text + '</span>'; }

  /* ---------- the screens ---------- */

  var screens = {};

  /* 1. The list: search, a status filter, and the rows. The toolbar is
     drawn once; the rows are redrawn as the reader types (redrawTable),
     so the box keeps its focus and its caret. */
  screens.list = function () {
    return '<header class="wr-head"><h3 class="wr-title" tabindex="-1">Payments</h3>' +
      '<p class="wr-dek">Virtual payments sent to suppliers in the last 60 days, in this demo.</p></header>' +
      '<form class="wr-tools" role="search" aria-label="Find a payment">' +
        '<div class="wr-field wr-field--grow"><label for="wr-q">Search by supplier or invoice reference</label>' +
          '<input id="wr-q" type="search" data-search autocomplete="off" spellcheck="false" value="' + esc(state.q) + '"></div>' +
        '<div class="wr-field"><label for="wr-filter">Status</label><select id="wr-filter" data-filter>' +
          FILTERS.map(function (f) { return '<option value="' + f.id + '"' + (state.filter === f.id ? ' selected' : '') + '>' + f.label + '</option>'; }).join('') +
        '</select></div>' +
      '</form>' +
      '<div data-wren-table>' + table() + '</div>';
  };

  function table() {
    var rows = shown();
    var s = '<p class="wr-count" data-count>' + count(rows.length, 'payment', 'payments') +
      (state.filter !== 'all' ? ', ' + filterLabel(state.filter).toLowerCase() : '') +
      (state.q.trim() ? ', matching “' + esc(state.q.trim()) + '”' : '') + '</p>';
    if (!rows.length) {
      return s + '<p class="wr-empty">No payments match. Check the invoice reference, or <button type="button" class="wr-link" data-clear>clear the search and filter</button>.</p>';
    }
    s += '<div class="wr-table-wrap"><table class="wr-table"><caption class="visually-hidden">Payments, with each one’s status in plain words</caption>' +
      '<thead><tr><th scope="col">Supplier</th><th scope="col">Invoice</th><th scope="col" class="wr-num">Amount</th><th scope="col">Status</th><th scope="col">Sent</th><th scope="col"><span class="visually-hidden">Open</span></th></tr></thead><tbody>';
    rows.forEach(function (p) {
      var st = listStatus(p);
      s += '<tr data-row="' + p.id + '">' +
        '<th scope="row"><span class="wr-td-label" aria-hidden="true">Supplier</span>' + esc(p.supplier) + '</th>' +
        '<td><span class="wr-td-label" aria-hidden="true">Invoice</span><span class="wr-ref">' + p.invoice + '</span></td>' +
        '<td class="wr-num"><span class="wr-td-label" aria-hidden="true">Amount</span>' + money(p.amount) + '</td>' +
        '<td><span class="wr-td-label" aria-hidden="true">Status</span>' + badge(st) + '</td>' +
        '<td><span class="wr-td-label" aria-hidden="true">Sent</span>' + p.sent + '</td>' +
        '<td class="wr-cell-act"><button type="button" class="wr-link wr-open" data-open="' + p.id + '">Open<span class="visually-hidden"> ' + p.invoice + ', ' + esc(p.supplier) + '</span></button></td>' +
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
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>Payments</button></p>' +
      '<header class="wr-head wr-head--record">' +
        '<p class="wr-eyebrow">Payment <span class="wr-ref">' + p.ref + '</span></p>' +
        '<h3 class="wr-title" tabindex="-1">' + esc(p.supplier) + ' · ' + p.invoice + ' · ' + money(p.amount) + '</h3>' +
      '</header>';

    /* The two facts, side by side, each a status with its date. */
    s += '<dl class="wr-facts" data-processing="' + pr + '" data-matching="' + m + '">' +
      '<div class="wr-fact"><dt>Supplier processing</dt><dd>' + processingFact(p, pr, ev) + '</dd></div>' +
      '<div class="wr-fact"><dt>Invoice matching</dt><dd>' + matchingFact(p, pr, m, ev) + '</dd></div>' +
    '</dl>';

    /* Who acts next, and the one thing to do. */
    s += nextAction(p, pr, m);

    /* What a specialist needs to act, in one row. */
    s += '<dl class="wr-grid">' +
      '<div><dt>Invoice reference</dt><dd><span class="wr-ref">' + p.invoice + '</span></dd></div>' +
      '<div><dt>Amount</dt><dd>' + money(p.amount) + '</dd></div>' +
      '<div><dt>Valid through</dt><dd>' + validThrough(p) + (pr === 'expired' ? ' <span class="wr-muted">(passed)</span>' : '') + '</dd></div>' +
      '<div><dt>Last confirmed event</dt><dd>' + esc(lastEv.what) + '<span class="wr-when">' + lastEv.at + '</span></dd></div>' +
    '</dl>';

    /* The activity, folded under the facts it was once above. */
    s += '<details class="wr-activity"><summary class="disclosure-row wr-activity-row"><svg class="disclosure-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg><span data-activity>Activity, ' + count(ev.length, 'event', 'events') + '</span></summary>' +
      '<ol class="wr-events">' + ev.map(function (e) {
        return '<li><span class="wr-event-at">' + e.at + '</span><span class="wr-event-what">' + esc(e.what) + '</span><span class="wr-event-by">' + esc(e.by) + '</span></li>';
      }).join('') + '</ol></details>';
    return s;
  }

  function processingFact(p, pr, ev) {
    if (pr === 'sent') {
      return '<span class="wr-fact-head">' + ICONS.clock + 'Sent to supplier</span>' +
        '<span class="wr-fact-line">Waiting for ' + esc(p.supplier) + ' to process it. Notice delivered ' + dateOf(find(ev, 'delivered') ? find(ev, 'delivered').at : find(ev, 'notice').at) + '.</span>';
    }
    if (pr === 'processed') {
      var e = find(ev, 'processed');
      return '<span class="wr-fact-head">' + ICONS.check + 'Processed by supplier</span>' +
        '<span class="wr-fact-line">' + esc(p.supplier) + ' processed it ' + e.at + (e.demo ? ', in this demo' : '') + '.</span>';
    }
    /* The date that passed is the validity date, not the moment the system
       noticed: "Expired Nov 4" names what ran out. */
    return '<span class="wr-fact-head">' + ICONS.alert + 'Expired ' + validThrough(p) + ', not processed</span>' +
      '<span class="wr-fact-line">The validity date passed with no processing event from ' + esc(p.supplier) + '. Nothing was charged.</span>';
  }

  function matchingFact(p, pr, m, ev) {
    if (m === 'matched') {
      var e = find(ev, 'matched');
      return '<span class="wr-fact-head">' + ICONS.done + 'Matched to ' + p.invoice + '</span>' +
        '<span class="wr-fact-line">' + (e.demo ? 'Matched in this demo, ' + e.at : 'Matched ' + e.at) + '. The invoice is closed' + (e.demo ? ' here' : '') + '.</span>';
    }
    if (pr === 'processed') {
      return '<span class="wr-fact-head">' + ICONS.check + 'Ready to match to invoice</span>' +
        '<span class="wr-fact-line">Processed, and not yet matched to ' + p.invoice + '. ' + (state.declined && p.id === state.open ? 'Nothing changed when you declined; the match is still open.' : 'Review the match to close the invoice.') + '</span>';
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
      line = 'Nothing for you to do yet. ' + esc(p.supplier) + ' has until ' + validThrough(p) + ' to process it, and the notice reached them ' + dateOf(find(eventsOf(p), 'notice').at) + '. If it’s still waiting a week before that date, follow up with them.';
    } else if (pr === 'processed' && m === 'unmatched') {
      who = 'You';
      line = esc(p.supplier) + ' processed it. Match it to ' + p.invoice + ' so the invoice closes in your books.';
      act = '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-review aria-expanded="' + state.reviewing + '" aria-controls="wr-match">Review match</button></p>';
    } else if (m === 'matched') {
      who = 'No one';
      line = 'This payment is processed and matched' + (state.matched[p.id] ? ' in this demo' : '') + '. There is nothing left to do on it.';
    } else {
      who = 'You';
      line = 'The payment can’t be processed now. A replacement would be a new payment for ' + p.invoice + ' with a new validity date.';
      act = '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-replace aria-expanded="' + state.replacing + '" aria-controls="wr-replace">Review replacement options</button></p>';
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
    return '<div class="wr-panel" id="wr-match"><h5 class="wr-panel-h" tabindex="-1">Proposed match</h5>' +
      '<div class="wr-pair">' +
        '<dl class="wr-pair-col"><dt>Invoice</dt><dd><span class="wr-ref">' + p.invoice + '</span></dd><dt>From</dt><dd>' + esc(p.supplier) + '</dd><dt>Amount</dt><dd>' + money(p.amount) + '</dd></dl>' +
        '<dl class="wr-pair-col"><dt>Payment</dt><dd><span class="wr-ref">' + p.ref + '</span></dd><dt>Processed by</dt><dd>' + esc(p.supplier) + ', ' + e.at + '</dd><dt>Amount</dt><dd>' + money(p.amount) + '</dd></dl>' +
      '</div>' +
      '<p class="wr-panel-line">' + ICONS.check + 'Supplier and amount agree. Confirming records the match here and changes nothing about the processing.</p>' +
      '<p class="wr-row"><button type="button" class="btn btn-primary wr-btn" data-confirm-match>Confirm match</button>' +
      '<button type="button" class="wr-chip wr-chip--quiet" data-decline-match>Not this invoice</button></p></div>';
  }

  /* The exception's next step, informational: what a replacement is and
     what it would need. Nothing here issues one. */
  function replacePanel(p) {
    return '<div class="wr-panel" id="wr-replace"><h5 class="wr-panel-h" tabindex="-1">Replacement options</h5>' +
      '<ol class="wr-steps">' +
        '<li><strong>Check with ' + esc(p.supplier) + '</strong> that the notice reached the right person. The validity date, not the invoice, is what ran out.</li>' +
        '<li><strong>A replacement payment</strong> would be a new payment for ' + p.invoice + ', ' + money(p.amount) + ', with a new validity date. Issuing one needs your approver, and it is outside this demo.</li>' +
        '<li><strong>Don’t pay twice.</strong> This payment expired unprocessed, so nothing was charged. A replacement replaces it; it doesn’t add to it.</li>' +
      '</ol>' +
      '<p class="wr-row"><button type="button" class="wr-chip" data-close-replace>Close</button></p></div>';
  }

  /* 3. The supplier's notice, read-only, with only what the buyer shared. */
  screens.notice = function () {
    var p = byId(state.open) || byId(FOLLOWED);
    var pr = processing(p), ev = eventsOf(p);
    var s = '<header class="wr-head wr-head--record">' +
      '<p class="wr-eyebrow">Payment notice from ' + BUYER.name + '</p>' +
      '<h3 class="wr-title" tabindex="-1">' + money(p.amount) + ' for invoice ' + p.invoice + '</h3>' +
      '</header>' +
      '<dl class="wr-grid wr-grid--notice">' +
        '<div><dt>From</dt><dd>' + BUYER.name + '</dd></div>' +
        '<div><dt>Invoice reference</dt><dd><span class="wr-ref">' + p.invoice + '</span></dd></div>' +
        '<div><dt>Amount</dt><dd>' + money(p.amount) + '</dd></div>' +
        '<div><dt>Valid through</dt><dd>' + validThrough(p) + '</dd></div>' +
        '<div><dt>Payment reference</dt><dd><span class="wr-ref">' + p.ref + '</span></dd></div>' +
        '<div><dt>Sent</dt><dd>' + find(ev, 'notice').at + '</dd></div>' +
      '</dl>';
    if (pr === 'sent') {
      s += '<section class="wr-next" aria-labelledby="wr-sup-h"><h4 id="wr-sup-h" class="wr-next-h">Process this payment</h4>' +
        '<p class="wr-next-line">Processing charges the payment for the amount above and tells ' + BUYER.name + ' it is done. In this demo it adds one event and charges nothing.</p>' +
        '<p class="wr-act"><button type="button" class="btn btn-primary wr-btn" data-process>Process this payment</button></p></section>';
    } else if (pr === 'processed') {
      var e = find(ev, 'processed');
      s += '<section class="wr-next" aria-labelledby="wr-sup-h"><h4 id="wr-sup-h" class="wr-next-h">Processed</h4>' +
        '<p class="wr-next-line">' + ICONS.check + 'Processed ' + e.at + (e.demo ? ', in this demo' : '') + '. ' + BUYER.name + ' can see this now. There is nothing more to do here.</p></section>';
    } else {
      s += '<section class="wr-next" aria-labelledby="wr-sup-h"><h4 id="wr-sup-h" class="wr-next-h">Expired</h4>' +
        '<p class="wr-next-line">' + ICONS.alert + 'This payment expired ' + validThrough(p) + ' and can no longer be processed. ' + BUYER.name + ' would need to send a replacement.</p></section>';
    }
    s += '<p class="wr-fine">Read-only preview of the supplier’s notice. It shows only what the buyer shared: no approver, no account coding, no internal notes.</p>';
    return s;
  };

  /* ---------- the walkthrough's steps, outside the product ---------- */

  var STEPS = [
    { n: 1, name: 'Find it', hint: 'Search INV-20483, or filter to Waiting for supplier, and open the row.' },
    { n: 2, name: 'Interpret it', hint: 'Two facts and who acts next, before any history. Then switch to the Supplier preview to follow the handoff.' },
    { n: 3, name: 'Follow the handoff', hint: 'Larkspur’s side, read-only. Press Process this payment, then come back as the Buyer.' },
    { n: 4, name: 'Close the loop', hint: 'Processed, and ready to match, as two facts. Review the match and confirm it.' },
    { n: 5, name: 'The exception', hint: 'The same payment, expired unprocessed: what expired, what happened, and who acts next.' }
  ];
  function stepNow() {
    if (state.scenario === 'expired') return 5;
    if (state.screen === 'notice') return 3;
    if (state.screen === 'detail') {
      var p = byId(state.open);
      return p && processing(p) === 'processed' ? 4 : 2;
    }
    return 1;
  }

  /* ---------- rendering ---------- */

  var stage = root.querySelector('[data-wren-stage]');
  var status = root.querySelector('[data-wren-status]');
  var chrome = root.querySelector('[data-wren-chrome]');
  var steps = root.querySelectorAll('[data-wren-step]');
  var hint = root.querySelector('[data-wren-hint]');
  var scenarios = root.querySelectorAll('[data-scenario]');
  var roles = root.querySelectorAll('[data-role]');

  function announce(msg) {
    if (!status) return;
    status.textContent = '';
    setTimeout(function () { status.textContent = msg; }, 30);
  }

  function render(opts) {
    opts = opts || {};
    var screen = state.role === 'supplier' ? 'notice' : state.screen;
    state.screen = screen;
    var scrolled = stage.scrollTop;
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
        ? '<span class="wr-org">' + esc(byId(state.open || FOLLOWED).supplier) + '</span><span class="wr-role">Accounts receivable · Supplier preview, read-only</span>'
        : '<span class="wr-org">' + BUYER.name + '</span><span class="wr-role">' + BUYER.team + '</span>';
    }
    var now = stepNow();
    Array.prototype.forEach.call(steps, function (el) {
      var n = Number(el.getAttribute('data-wren-step'));
      if (n === now) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    if (hint) hint.textContent = STEPS[now - 1].hint;
    Array.prototype.forEach.call(scenarios, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-scenario') === state.scenario)); });
    Array.prototype.forEach.call(roles, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-role') === state.role)); });
    if (opts.announce) announce(opts.announce);
    if (opts.focus) {
      var el = stage.querySelector(opts.focus);
      if (el) {
        el.focus({ preventScroll: !!opts.still });
        if (opts.still) reveal(el.closest('.wr-panel') || el);
      }
    }
  }

  /* Brings what a press opened into the stage's view, moving the stage and
     not the page. A panel taller than the stage shows from its top. */
  function reveal(el) {
    var view = stage.getBoundingClientRect();
    var box = el.getBoundingClientRect();
    var foot = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
    var below = box.bottom + foot - view.bottom;
    if (below > 0) stage.scrollTop += Math.min(below, box.top - view.top);
    else if (box.top < view.top) stage.scrollTop -= view.top - box.top;
  }

  /* The rows alone, as the reader types or filters. */
  function redrawTable() {
    var box = stage.querySelector('[data-wren-table]');
    if (!box) return;
    box.innerHTML = table();
    var c = box.querySelector('[data-count]');
    announce(c ? c.textContent : '');
  }

  /* ---------- the presses ---------- */

  function openRecord(id, from) {
    state.open = id;
    state.reviewing = false;
    state.replacing = false;
    state.declined = false;
    state.returnTo = from || null;
    state.screen = 'detail';
    var p = byId(id);
    render({ focus: '.wr-title', announce: 'Payment record: ' + p.supplier + ', ' + p.invoice + '. ' + listStatus(p).text + '.' });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t || !root.contains(t)) return;

    /* The demo controls, outside the product. */
    if (t.hasAttribute('data-reset')) {
      state = fresh();
      render({ focus: '.wr-title', announce: 'Started over. The payments list, as the buyer.' });
      return;
    }
    if (t.hasAttribute('data-scenario')) {
      var sc = t.getAttribute('data-scenario');
      if (sc === state.scenario) return;
      state = fresh(sc);
      if (sc === 'expired') {
        state.open = FOLLOWED;
        state.screen = 'detail';
        render({ focus: '.wr-title', announce: 'Expired scenario. The same payment to Larkspur Packaging, expired Nov 4 without being processed.' });
      } else {
        render({ focus: '.wr-title', announce: 'Default path. The payments list, as the buyer.' });
      }
      return;
    }
    if (t.hasAttribute('data-role')) {
      var r = t.getAttribute('data-role');
      if (r === state.role) return;
      state.role = r;
      if (r === 'supplier') {
        if (!state.open) state.open = FOLLOWED;
        state.screen = 'notice';
        render({ focus: '.wr-title', announce: 'Supplier preview: the payment notice as ' + byId(state.open).supplier + ' sees it. Read-only.' });
      } else {
        state.screen = 'detail';
        render({ focus: '.wr-title', announce: 'Back to the buyer’s record. ' + listStatus(byId(state.open)).text + '.' });
      }
      return;
    }

    /* The product. */
    if (t.hasAttribute('data-open')) { openRecord(t.getAttribute('data-open'), '[data-open="' + t.getAttribute('data-open') + '"]'); return; }
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
      render({ focus: '.wr-facts', still: true, announce: 'Matched in this demo: ' + pm.ref + ' to ' + pm.invoice + ', ' + MATCHED_AT + '. The processing event is unchanged.' });
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
    if (t.hasAttribute('data-process')) {
      var ps = byId(state.open || FOLLOWED);
      if (!ps || processing(ps) !== 'sent') return;
      state.processed[ps.id] = true;
      render({ focus: '.wr-title', still: true, announce: 'Processed ' + PROCESSED_AT + ', in this demo. ' + BUYER.name + ' can see it now.' });
      return;
    }
  });

  /* The search and the filter redraw the rows in place. */
  root.addEventListener('input', function (e) {
    if (e.target.hasAttribute('data-search')) { state.q = e.target.value; redrawTable(); }
  });
  root.addEventListener('change', function (e) {
    if (e.target.hasAttribute('data-filter')) { state.filter = e.target.value; redrawTable(); }
  });
  root.addEventListener('submit', function (e) {
    if (e.target.classList.contains('wr-tools')) e.preventDefault();
  });
  /* Escape closes an open panel and puts focus back on its button. */
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.reviewing) { state.reviewing = false; render({ focus: '[data-review]', still: true, announce: 'Proposed match hidden.' }); }
    else if (state.replacing) { state.replacing = false; render({ focus: '[data-replace]', still: true, announce: 'Replacement options hidden.' }); }
  });

  /* The focus ring the stage draws is the site's; a title focused by
     script shows none, as a landed heading. */
  Array.prototype.forEach.call(stage.querySelectorAll('.wr-title'), function (h) { h.setAttribute('tabindex', '-1'); });

  render();
})();
