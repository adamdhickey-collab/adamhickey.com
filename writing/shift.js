/* shift.js -- The Shift's figures are built as they are read.

   Each figure's parts (a stack's rows, a stage, a split's two sides, a
   flow's steps, a diagram's panels, the two questions, a landing chapter's
   lessons) get data-build and an index, --i; when the figure is about to
   come into view they all get data-shown, and shift.css plays them in one
   after another. The highlighted line on a lesson gets the same, and is
   drawn on like a marker.

   The contract is reveal.js's, for reveal.css's reasons: the reduced-motion
   and observer checks return before a single attribute is set, the
   keyframes have a `from` and no `to`, and nothing animates opacity, so the
   resting page is the finished page for a reader who asked for stillness,
   a page whose script never ran, and every check. The observer fires while
   the figure is still just below the fold, so no frame shows it finished
   and then moves it. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var GROUPS = [
    ['.shift-stack', ':scope > li'],
    ['.shift-stages', ':scope > li'],
    ['.writing-split', ':scope > div'],
    ['.writing-flow', ':scope > li'],
    ['.shift-diagram', ':scope > .shift-panel'],
    ['.shift-check', ':scope > .shift-q'],
    ['.shift-terms dl', ':scope > div'],
    ['.shift-cards', ':scope > li'],
    ['.shift-mosaic', ':scope > li']
  ];

  var io = new IntersectionObserver(function (entries) {
    for (var e = 0; e < entries.length; e++) {
      if (!entries[e].isIntersecting) continue;
      io.unobserve(entries[e].target);
      var parts = entries[e].target.__shiftParts || [];
      for (var p = 0; p < parts.length; p++) parts[p].setAttribute('data-shown', '');
    }
  }, { rootMargin: '0px 0px 4% 0px' });

  for (var g = 0; g < GROUPS.length; g++) {
    var hosts = document.querySelectorAll(GROUPS[g][0]);
    for (var h = 0; h < hosts.length; h++) {
      var parts = hosts[h].querySelectorAll(GROUPS[g][1]);
      if (!parts.length) continue;
      for (var i = 0; i < parts.length; i++) {
        parts[i].style.setProperty('--i', i);
        parts[i].setAttribute('data-build', '');
      }
      hosts[h].__shiftParts = parts;
      io.observe(hosts[h]);
    }
  }

  var marks = document.querySelectorAll('.shift-lesson .writing-measure mark');
  for (var m = 0; m < marks.length; m++) {
    marks[m].setAttribute('data-build', '');
    marks[m].__shiftParts = [marks[m]];
    io.observe(marks[m]);
  }
})();
