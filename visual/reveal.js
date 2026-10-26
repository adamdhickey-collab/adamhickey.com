/* ==========================================================================
   reveal.js — the build write-ups arrive as they are read.

   Four pages tell the story of something that was built: the two product
   write-ups, this site's own, and the dispatch prototype. The cockpit on the
   last of them arrives a surface at a time; the eleven thousand pixels of
   argument around it did not move at all, which is the gap this closes.

   IT DECORATES RATHER THAN BEING MARKED UP, which is case-motion.js's
   pattern on the six Tailwind case studies and the right one here for the
   same reason: four pages with four sets of idioms, and a class signature
   they do share. Nothing in the markup changes, so nothing in the markup can
   drift out of step with it.

   Every block it finds is a flow-level element inside a .build-chapter, with
   any block that sits inside another dropped — a figcaption does not arrive
   separately from its figure, and a paragraph inside a disclosure does not
   arrive separately from the disclosure.

   The reduced-motion check and the observer check both return before a single
   attribute is set, and reveal.css styles nothing without them, so a reader
   who asked for no motion and a reader whose JavaScript never ran see the
   same finished page. See that file for why this is not style.css's .reveal.
   ========================================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var BLOCKS = 'h2, h3, p, figure, details, ul, ol, blockquote,' +
    '.glance, .build-phone, .build-shot, .build-laptop, .build-flow, .build-list';

  var found = [];
  var chapters = document.querySelectorAll('.build-chapter');
  for (var c = 0; c < chapters.length; c++) {
    var hits = chapters[c].querySelectorAll(BLOCKS);
    for (var i = 0; i < hits.length; i++) {
      /* The cockpit runs its own arrivals, per surface, and its shell is two
         thousand pixels tall: a page rise on it would be a lift nobody can
         see the top and bottom of at once. */
      if (hits[i].closest('.ck')) continue;
      found.push(hits[i]);
    }
  }

  /* Outermost only. Without this a figure arrives, and then its caption
     arrives again inside it a moment later on its own trigger, which reads as
     the page being assembled rather than as the page arriving. */
  var inside = [];
  for (var a = 0; a < found.length; a++) {
    var nested = false;
    for (var p = found[a].parentElement; p && !nested; p = p.parentElement) {
      if (found.indexOf(p) !== -1) nested = true;
    }
    if (!nested) inside.push(found[a]);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var e = 0; e < entries.length; e++) {
      if (!entries[e].isIntersecting) continue;
      io.unobserve(entries[e].target);
      entries[e].target.setAttribute('data-shown', '');
    }
  /* Positive, so the arrival always begins while the block is still out of
     sight. The sign is the whole thing; reveal.css has the measurement that
     made it obvious. */
  }, { rootMargin: '0px 0px 4% 0px' });

  for (var k = 0; k < inside.length; k++) {
    inside[k].setAttribute('data-rise', '');
    io.observe(inside[k]);
  }
})();
