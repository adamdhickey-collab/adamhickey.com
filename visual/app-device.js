/* app-device.js -- the live thing, opened here, in the device it was built for.
 *
 * A link marked data-app-phone or data-app-tablet keeps its href, its target
 * and its new-tab label, so without this script, or on a viewport under
 * 768px, it does what it says and goes where it points. At 768px and up the
 * script takes the click and opens the same address in an iframe inside the
 * device frame the site already draws its captures in: .build-phone for an
 * app built for a hand, the tablet for an interface built for a desk. The
 * overlay is built on first open, so a reader who never presses a link never
 * loads anything. Same shape as the lightbox at the bottom of index.html.
 *
 * TWO ATTRIBUTES RATHER THAN ONE WITH A VALUE, because the device is the
 * fact being declared and the value is already the dialog's label. One
 * overlay serves both: the device is an attribute on the box and the frame's
 * class, so a page with a phone link and a tablet link -- which the homepage
 * is -- builds one scrim and swaps what stands in it.
 *
 * data-app-src is the address to LOAD, when that is not the address the link
 * points at. The dispatch cockpit is the case for it: the link goes to the
 * write-up's "Try it yourself" section, which is where a reader without this
 * script should land, and the frame loads the same page in its embed mode,
 * which is the cockpit with the site's chrome off and nothing to navigate
 * back from. A reader who never gets the overlay must never be sent
 * somewhere with no way out.
 *
 * It was app-phone.js until 2026-09-18, when the second device arrived. */
(function () {
  'use strict';
  var links = document.querySelectorAll('a[data-app-phone], a[data-app-tablet]');
  if (!links.length) return;
  var WIDE = '(min-width: 768px)';
  var wide = function () { return window.matchMedia(WIDE).matches; };
  var deviceOf = function (link) { return link.hasAttribute('data-app-tablet') ? 'tablet' : 'phone'; };
  var labelOf = function (link) {
    return link.getAttribute('data-app-' + deviceOf(link)) || link.textContent.trim();
  };

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
    box.className = 'app-device';
    /* Dark overlay: the custom cursor flips warm, as over the lightbox. */
    box.setAttribute('data-cursor', 'light');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    sentinel = document.createElement('span');
    sentinel.className = 'app-device-sentinel';
    sentinel.tabIndex = 0;
    sentinel.addEventListener('focus', function () { closeBtn.focus(); });

    frame = document.createElement('div');
    iframe = document.createElement('iframe');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    frame.appendChild(iframe);

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ah-lightbox-close';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';

    box.appendChild(sentinel);
    box.appendChild(frame);
    box.appendChild(closeBtn);
    document.body.appendChild(box);

    closeBtn.addEventListener('click', function () { close(); });
    /* The scrim closes; the device does not. */
    box.addEventListener('click', function (e) {
      if (!frame.contains(e.target)) close();
    });
  }

  function open(link) {
    if (!box) build();
    opener = link;
    var device = deviceOf(link);
    var label = labelOf(link);
    /* Resolved against the page, because link.href is already absolute and
       data-app-src is written relative like every other address in this tree.
       Comparing the two forms below is what decides whether to reload, and a
       relative string never equals an iframe's own absolute src -- which
       would have thrown away the reader's place in the cockpit every time
       they reopened it. */
    var src = new URL(link.getAttribute('data-app-src') || link.href, location.href).href;

    /* The phone borrows style.css's own frame; the tablet is that object with
       one value changed, and app-device.css draws it. */
    frame.className = 'app-device-frame' + (device === 'phone' ? ' build-phone' : ' app-device-frame--tablet');
    box.setAttribute('data-device', device);
    box.setAttribute('aria-label', label);
    iframe.title = label;
    closeBtn.setAttribute('aria-label', 'Close ' + (device === 'tablet' ? 'the prototype' : 'the app'));
    /* Set once per address: a second open of the same thing finds it where it
       was left, and switching devices reloads because the address differs. */
    if (iframe.src !== src) iframe.src = src;

    /* Pad by the width of the scrollbar about to be removed. */
    var gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
    document.documentElement.classList.add('app-device-open');

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
    document.documentElement.classList.remove('app-device-open');
    document.body.style.paddingRight = '';
    document.removeEventListener('keydown', onKey);
    if (opener) { opener.focus(); opener = null; }
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    /* Two places to be: the thing and the close button. Tab from the button
       goes into the frame; Shift+Tab out of it lands on the sentinel, which
       hands focus back to the button. Keys pressed inside the frame never
       reach this document, so the prototype keeps its own keyboard -- which
       for the cockpit is most of what it has to show. */
    if (e.key === 'Tab' && document.activeElement === closeBtn) {
      e.preventDefault();
      iframe.focus();
    }
  }

  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      /* Modified clicks and narrow viewports keep the link's own behaviour:
         a phone app in a new tab, the cockpit at the section of the write-up
         that holds it. Both are the better place for it on a small screen. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (!wide()) return;
      e.preventDefault();
      open(link);
    });
  });
})();
