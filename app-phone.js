/* app-phone.js -- "Open the app", opened here, in a phone.
 *
 * A link marked data-app-phone keeps its href, its target and its new-tab
 * label, so without this script, or on a viewport under 768px, it does what
 * it says and opens the app in a new tab. At 768px and up the script takes
 * the click and opens the same address in an iframe inside the phone frame
 * the write-up's screens use, as tall as the viewport allows. The overlay is
 * built on first open, so a reader who never presses the link never loads
 * the app. Same shape as the lightbox at the bottom of index.html. */
(function () {
  'use strict';
  var links = document.querySelectorAll('a[data-app-phone]');
  if (!links.length) return;
  var WIDE = '(min-width: 768px)';
  var wide = function () { return window.matchMedia(WIDE).matches; };

  /* At a width where the script will take the click, the link no longer
     opens a new tab, so the marker and the hidden note that say so come off
     and the link says it opens a dialog instead. */
  if (wide()) {
    Array.prototype.forEach.call(links, function (link) {
      Array.prototype.forEach.call(link.querySelectorAll('.product-link-ext, .visually-hidden'), function (n) { n.remove(); });
      link.setAttribute('aria-haspopup', 'dialog');
    });
  }

  var box, frame, iframe, sentinel, closeBtn, opener;

  function build() {
    box = document.createElement('div');
    box.className = 'app-phone';
    /* Dark overlay: the custom cursor flips warm, as over the lightbox. */
    box.setAttribute('data-cursor', 'light');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    sentinel = document.createElement('span');
    sentinel.className = 'app-phone-sentinel';
    sentinel.tabIndex = 0;
    sentinel.addEventListener('focus', function () { closeBtn.focus(); });

    frame = document.createElement('div');
    frame.className = 'app-phone-frame build-phone';
    iframe = document.createElement('iframe');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    frame.appendChild(iframe);

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ah-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close the app');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';

    box.appendChild(sentinel);
    box.appendChild(frame);
    box.appendChild(closeBtn);
    document.body.appendChild(box);

    closeBtn.addEventListener('click', function () { close(); });
    /* The scrim closes; the phone does not. */
    box.addEventListener('click', function (e) {
      if (!frame.contains(e.target)) close();
    });
  }

  function open(link) {
    if (!box) build();
    opener = link;
    var label = link.getAttribute('data-app-phone') || link.textContent.trim();
    box.setAttribute('aria-label', label);
    iframe.title = label;
    /* Set once: a second open finds the app where it was left. */
    if (iframe.src !== link.href) iframe.src = link.href;

    /* Pad by the width of the scrollbar about to be removed. */
    var gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
    document.documentElement.classList.add('app-phone-open');

    /* One frame between insertion and the class, or the fade has nothing to
       run from on the first open. */
    requestAnimationFrame(function () {
      box.classList.add('is-open');
      closeBtn.focus();
    });
    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!box || !box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    document.documentElement.classList.remove('app-phone-open');
    document.body.style.paddingRight = '';
    document.removeEventListener('keydown', onKey);
    if (opener) { opener.focus(); opener = null; }
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    /* Two places to be: the app and the close button. Tab from the button
       goes into the app; Shift+Tab out of the app lands on the sentinel,
       which hands focus back to the button. Keys pressed inside the app
       never reach this document, so the app keeps its own keyboard. */
    if (e.key === 'Tab' && document.activeElement === closeBtn) {
      e.preventDefault();
      iframe.focus();
    }
  }

  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      /* Modified clicks and narrow viewports keep the link's own behaviour:
         the app in a new tab, which on a phone is the better place for it. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (!wide()) return;
      e.preventDefault();
      open(link);
    });
  });
})();
