/* say-when.js -- the storefront's behaviour: a cart that lives in the
 * reader's own browser, a drawer that shows it, the finder's three questions,
 * a product page's options, and a checkout that is plainly pretend.
 *
 * Say When is a self-initiated fictional brand concept (case-study/
 * say-when.html). Nothing here talks to a server: the cart is localStorage,
 * "placing an order" clears it and shows a note, and the prices are
 * placeholders. What is real is the behaviour a shop needs: counts that
 * update, a drawer that traps focus and closes on Escape, a result that
 * answers as the questions are answered, and states a keyboard can reach.
 *
 * No framework. Every page carries the same markup for the drawer and the
 * toast; this file finds them by class and does nothing on a page that
 * lacks them.
 */
(function () {
  'use strict';
  var KEY = 'say-when-cart';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The catalogue, once. Prices are placeholders and say so on every page. */
  var CATALOG = {
    'first-pour':  { name: 'First Pour',  when: 'the morning',           price: 17, img: 'bag-first-pour.svg',  url: 'first-pour.html' },
    'second-pour': { name: 'Second Pour', when: 'the middle of the day', price: 17, img: 'bag-second-pour.svg', url: 'second-pour.html' },
    'last-pour':   { name: 'Last Pour',   when: 'the evening',           price: 17, img: 'bag-last-pour.svg',   url: 'last-pour.html' },
    'taster':      { name: 'The Taster',  when: 'all three',             price: 24, img: 'sampler-taster.svg',  url: 'shop.html' },
    'gift':        { name: 'The Gift',    when: 'someone else',          price: 38, img: 'gift-box.svg',        url: 'shop.html' }
  };
  var GRINDS = { whole: 'whole bean', drip: 'ground for drip', press: 'ground for a press', espresso: 'ground for espresso' };
  var IMG = (document.body.getAttribute('data-img') || '../img/say-when/');

  /* ---------- the cart ---------- */
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(items); }
  function add(id, grind, qty) {
    var items = read();
    var hit = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === id && items[i].grind === grind) hit = items[i];
    if (hit) hit.qty += qty; else items.push({ id: id, grind: grind, qty: qty });
    save(items);
    bump();
    toast(CATALOG[id].name + ' is in the cart');
  }
  function remove(index) { var items = read(); items.splice(index, 1); save(items); }
  function money(n) { return '$' + n.toFixed(2); }
  function count(items) { var n = 0; items.forEach(function (it) { n += it.qty; }); return n; }
  function subtotal(items) { var n = 0; items.forEach(function (it) { n += CATALOG[it.id].price * it.qty; }); return n; }

  function lineHtml(it, i) {
    var p = CATALOG[it.id];
    return '<li class="sw-line">' +
      '<img src="' + IMG + p.img + '" alt="" width="56" height="82" />' +
      '<span><strong>' + p.name + '</strong><span class="sw-muted">' + (GRINDS[it.grind] || '') + ' · ' + it.qty + (it.qty === 1 ? ' bag' : ' bags') + '</span></span>' +
      '<span>' + money(p.price * it.qty) + ' <button type="button" class="sw-line-remove" data-remove="' + i + '" aria-label="Remove ' + p.name + ' from the cart">Remove</button></span>' +
      '</li>';
  }
  function render(items) {
    items = items || read();
    var n = count(items);
    document.querySelectorAll('.sw-cart-count').forEach(function (el) { el.textContent = n; });
    document.querySelectorAll('.sw-cart-btn').forEach(function (b) {
      b.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
    });
    document.querySelectorAll('[data-cart-lines]').forEach(function (ul) {
      ul.innerHTML = items.map(lineHtml).join('');
    });
    document.querySelectorAll('[data-cart-empty]').forEach(function (el) { el.hidden = n > 0; });
    document.querySelectorAll('[data-cart-has]').forEach(function (el) { el.hidden = n === 0; });
    var sub = subtotal(items), ship = n > 0 ? (sub >= 40 ? 0 : 6) : 0;
    document.querySelectorAll('[data-cart-subtotal]').forEach(function (el) { el.textContent = money(sub); });
    document.querySelectorAll('[data-cart-shipping]').forEach(function (el) { el.textContent = n > 0 && ship === 0 ? 'Free over $40' : money(ship); });
    document.querySelectorAll('[data-cart-total]').forEach(function (el) { el.textContent = money(sub + ship); });
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-remove]');
    if (r) { remove(Number(r.getAttribute('data-remove'))); var dlg = document.querySelector('.sw-drawer'); if (dlg && dlg.classList.contains('is-open')) { var c = dlg.querySelector('.sw-drawer-close'); if (c) c.focus(); } }
  });

  /* ---------- the drawer ---------- */
  var drawer = document.querySelector('.sw-drawer');
  var scrim = document.querySelector('.sw-scrim');
  var opener = null;
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null; });
  }
  function openDrawer(from) {
    if (!drawer) return;
    opener = from || document.activeElement;
    render();
    drawer.classList.add('is-open'); scrim.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    var first = drawer.querySelector('.sw-drawer-close');
    setTimeout(function () { if (first) first.focus(); }, reduce ? 0 : 60);
    document.addEventListener('keydown', onDrawerKey);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onDrawerKey);
    if (opener && opener.focus) opener.focus();
  }
  function onDrawerKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(drawer);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.querySelectorAll('.sw-cart-btn').forEach(function (b) { b.addEventListener('click', function () { openDrawer(b); }); });
  document.querySelectorAll('.sw-drawer-close').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  if (scrim) scrim.addEventListener('click', closeDrawer);
  if (drawer) drawer.setAttribute('aria-hidden', 'true');

  function bump() {
    document.querySelectorAll('.sw-cart-count').forEach(function (el) {
      if (reduce) return;
      el.setAttribute('data-bump', '');
      setTimeout(function () { el.removeAttribute('data-bump'); }, 300);
    });
  }
  var toastEl = document.querySelector('.sw-toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 2200);
  }

  /* ---------- add to cart, anywhere ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    e.preventDefault();
    var id = b.getAttribute('data-add');
    var form = b.closest('form');
    var grind = 'whole', qty = 1;
    if (form) {
      var g = form.querySelector('input[name="grind"]:checked'); if (g) grind = g.value;
      var q = form.querySelector('[data-qty-value]'); if (q) qty = Number(q.textContent) || 1;
    }
    if (b.hasAttribute('data-grind')) grind = b.getAttribute('data-grind');
    add(id, grind, qty);
  });
  /* The quantity stepper on a product page. */
  document.querySelectorAll('.sw-qty').forEach(function (box) {
    var out = box.querySelector('[data-qty-value]');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !out) return;
      var n = Number(out.textContent) || 1;
      n = b.hasAttribute('data-up') ? Math.min(9, n + 1) : Math.max(1, n - 1);
      out.textContent = n;
    });
  });

  /* ---------- the shop's filter ---------- */
  var chips = document.querySelectorAll('.sw-chip[data-filter]');
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        var want = chip.getAttribute('data-filter');
        document.querySelectorAll('.sw-products > li').forEach(function (li) {
          li.hidden = want !== 'all' && li.getAttribute('data-when') !== want;
        });
        var live = document.querySelector('[data-filter-live]');
        if (live) live.textContent = chip.textContent.trim() + ': ' + document.querySelectorAll('.sw-products > li:not([hidden])').length + ' shown';
      });
    });
  }

  /* ---------- the finder ----------
     Three plain questions, scored against the three bags. The product with
     the most points wins; the words beside it say which answer put it there.
     A tie goes to the time of day, since that is the question the brand asks
     first. */
  var finder = document.querySelector('[data-finder]');
  if (finder) {
    var result = document.querySelector('.sw-result');
    var SCORE = {
      when:   { morning: { 'first-pour': 3 }, midday: { 'second-pour': 3 }, evening: { 'last-pour': 3 } },
      how:    { black: { 'first-pour': 1, 'last-pour': 1 }, milk: { 'second-pour': 2, 'last-pour': 1 }, iced: { 'first-pour': 2, 'second-pour': 1 } },
      strong: { easy: { 'first-pour': 2 }, medium: { 'second-pour': 2 }, bold: { 'last-pour': 2, 'second-pour': 1 } }
    };
    var WHY = {
      when:   { morning: 'you asked for a morning cup', midday: 'you asked for the middle of the day', evening: 'you asked for the evening' },
      how:    { black: 'you take it black, so the bright ones come through', milk: 'milk likes a rounder, sweeter bag', iced: 'over ice the lighter roasts stay lively' },
      strong: { easy: 'easy-going rather than strong', medium: 'somewhere in the middle', bold: 'you want it to stand up' }
    };
    function answer() {
      var picks = {};
      ['when', 'how', 'strong'].forEach(function (q) {
        var el = finder.querySelector('input[name="' + q + '"]:checked');
        if (el) picks[q] = el.value;
      });
      var answered = Object.keys(picks).length;
      if (!answered) { result.setAttribute('data-state', 'empty'); return; }
      var points = { 'first-pour': 0, 'second-pour': 0, 'last-pour': 0 };
      var why = [];
      Object.keys(picks).forEach(function (q) {
        var s = SCORE[q][picks[q]];
        Object.keys(s).forEach(function (id) { points[id] += s[id]; });
        why.push(WHY[q][picks[q]]);
      });
      var best = 'second-pour', bestN = -1;
      ['first-pour', 'second-pour', 'last-pour'].forEach(function (id) { if (points[id] > bestN) { best = id; bestN = points[id]; } });
      if (picks.when) { var w = { morning: 'first-pour', midday: 'second-pour', evening: 'last-pour' }[picks.when]; if (points[w] === bestN) best = w; }
      var p = CATALOG[best];
      result.setAttribute('data-state', 'has');
      result.querySelector('[data-result-img]').src = IMG + p.img;
      result.querySelector('[data-result-img]').alt = p.name + ' bag';
      result.querySelector('[data-result-name]').textContent = p.name;
      result.querySelector('[data-result-tastes]').textContent = finder.getAttribute('data-tastes-' + best) || '';
      result.querySelector('[data-result-why]').innerHTML = '<strong>Because</strong> ' + why.join(', ') + '.';
      result.querySelector('[data-result-link]').href = p.url;
      result.querySelector('[data-result-add]').setAttribute('data-add', best);
      var alt = result.querySelector('[data-result-alt]');
      if (alt) alt.textContent = answered < 3 ? 'Answer the other ' + (3 - answered) + (answered === 2 ? ' question' : ' questions') + ' and the pick may change.' : 'Not it? The other two are a step away in the shop.';
    }
    finder.addEventListener('change', answer);
    finder.addEventListener('reset', function () { setTimeout(answer, 0); });
    answer();
  }

  /* ---------- the checkout, plainly pretend ---------- */
  var checkout = document.querySelector('[data-checkout]');
  if (checkout) {
    checkout.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!read().length) { toast('The cart is empty'); return; }
      var done = document.querySelector('.sw-done');
      var name = checkout.querySelector('#sw-name');
      if (done) {
        var who = done.querySelector('[data-done-name]');
        if (who && name) who.textContent = name.value ? name.value.split(' ')[0] : 'you';
        done.hidden = false;
        checkout.hidden = true;
        done.setAttribute('tabindex', '-1');
        done.focus();
      }
      save([]);
    });
  }

  render();
})();
