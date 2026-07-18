/* ==========================================================================
   case-motion.js — scroll-driven motion for the case study pages.

   The six case pages are captured markup (Tailwind utility classes), so
   instead of editing each page this script decorates shared class
   signatures at runtime: it adds a .cm effect class (see case-motion.css)
   and drives one custom property, --cmp, per element from scroll position.

   Scrub model (matches the home page): animations have no clock — the
   scrollbar is the playhead. Scrolling down plays each element in;
   scrolling up rewinds it. "in" elements ramp 0→1 over a slice of
   viewport travel after they enter; the hero uses page scroll directly.

   Never runs for reduced-motion users; without JS no classes are added
   and the page renders fully resolved.
   ========================================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var items = [];

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function outCubic(p) { return 1 - Math.pow(1 - p, 3); }
  function outBack(p) { /* overshoots ~5% around p≈0.8, settles to 1 */
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  }
  function linear(p) { return p; }
  function hasCls(el, s) {
    return typeof el.className === 'string' && el.className.indexOf(s) !== -1;
  }
  /* True when el sits inside an element that already animates as a unit. */
  function guarded(el) {
    return !!(el.parentElement && el.parentElement.closest('.cm'));
  }
  function reg(el, cls, opt) {
    if (!el || el.__cm) return;
    el.__cm = true;
    opt = opt || {};
    el.classList.add('cm', cls);
    items.push({
      el: el,
      mode: opt.mode || 'in',
      span: opt.span || 0.3,
      lead: opt.lead || 0,
      ease: opt.ease || outCubic,
      last: -1
    });
  }

  /* ---- hero image: parallax driven by raw page scroll ---- */
  reg(document.querySelector('img.vt-case-hero'), 'cm-hero', { mode: 'page', ease: linear });

  /* ---- page-load choreography: read time → title → meta row ---- */
  var h1 = document.querySelector('main h1');
  var rt = document.querySelector('.case-readtime');
  if (rt) rt.classList.add('cm', 'cm-load');
  if (h1) {
    h1.classList.add('cm', 'cm-load', 'cm-load-2');
    /* The client/role/timeline row sits right after the title wrapper on
       most pages — but on some pages that sibling is the whole content
       body, so only accept a small block with no sections or hero in it. */
    var meta = h1.parentElement && h1.parentElement.nextElementSibling;
    if (meta && !meta.querySelector('h2') && !meta.querySelector('.vt-case-hero')) {
      meta.classList.add('cm', 'cm-load', 'cm-load-3');
    }
  }

  /* ---- impact table rows: position in the page staggers them naturally ---- */
  $$('[class*="grid-cols-[130px_1fr]"]').forEach(function (row) {
    reg(row, 'cm-rise', { span: 0.26 });
  });

  /* ---- approach circles (parent column of each round illustration) ---- */
  $$('img.rounded-full.mb-5').forEach(function (img, i) {
    var wrap = img.parentElement;
    if (wrap && !guarded(wrap)) reg(wrap, 'cm-rise', { span: 0.3, lead: (i % 3) * 0.07 });
  });

  /* ---- numbered step circles: pop with overshoot ---- */
  $$('div.w-10.h-10.rounded-full').forEach(function (c) {
    reg(c, 'cm-pop', { span: 0.24, lead: 0.06, ease: outBack });
  });

  /* ---- content cards ----
     Any sage/warm rounded block. Register only the DEEPEST candidates so
     big band containers stay static while the cards inside them move, and
     skip blocks that already contain finer-grained motion (impact rows). */
  var cards = $$('div').filter(function (d) {
    if (!hasCls(d, 'rounded-[20px]')) return false;
    return hasCls(d, 'bg-[#F5F5F0]') || hasCls(d, 'bg-warm') || hasCls(d, 'bg-[#6D8768]');
  });
  var siblings = []; /* per-parent counters for same-row stagger */
  cards.forEach(function (d) {
    var isContainer = cards.some(function (o) { return o !== d && d.contains(o); });
    if (isContainer || d.querySelector('.cm') || guarded(d)) return;
    var entry = null;
    for (var s = 0; s < siblings.length; s++) {
      if (siblings[s].parent === d.parentElement) { entry = siblings[s]; break; }
    }
    if (!entry) { entry = { parent: d.parentElement, n: 0 }; siblings.push(entry); }
    reg(d, 'cm-card', { span: 0.45, lead: Math.min(entry.n * 0.06, 0.18) });
    entry.n++;
  });

  /* ---- section accent bars + headings + prose ---- */
  $$('div.w-16.h-1').forEach(function (b) { reg(b, 'cm-bar', { span: 0.38 }); });
  $$('main h2[id]').forEach(function (h) { reg(h, 'cm-rise-lg', { span: 0.38, lead: 0.05 }); });
  $$('main h3').forEach(function (h) { if (!guarded(h)) reg(h, 'cm-rise', { span: 0.32 }); });
  $$('main p').forEach(function (p) { if (!guarded(p)) reg(p, 'cm-rise-sm', { span: 0.22 }); });

  /* ---- role list entries: read down the two columns ---- */
  $$('.case-role-grid li').forEach(function (li, i) {
    if (!guarded(li)) reg(li, 'cm-rise-sm', { span: 0.22, lead: (i % 2) * 0.04 + Math.floor(i / 2) * 0.02 });
  });

  /* ---- closing next-case link ---- */
  reg(document.querySelector('.case-closing-next'), 'cm-rise', { span: 0.3 });

  /* ---- the scrub loop: read all rects, then write all progress values ---- */
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var sy = window.scrollY || window.pageYOffset;
    var i, it, r, p;
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (it.mode !== 'page') {
        r = it.el.getBoundingClientRect();
        it.top = r.top;
        it.h = r.height;
      }
    }
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (it.mode === 'page') {
        p = clamp01(sy / (vh * 0.9));
      } else if (it.mode === 'through') {
        p = clamp01((vh - it.top) / (vh + it.h));
      } else {
        p = clamp01(((vh - it.top) / vh - it.lead) / it.span);
      }
      p = it.ease(p);
      if (Math.abs(p - it.last) < 0.002) continue;
      it.last = p;
      it.el.style.setProperty('--cmp', p.toFixed(4));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  /* Late image loads shift layout without a scroll event. */
  if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(document.body);
  update();
})();
