/*
 * The lightbox: an a[data-zoom] link opens its target image in an overlay
 * rather than navigating away. The overlay is built on first open, so nobody
 * downloads a full-size picture they never asked to see, and the href keeps
 * the picture reachable without JS. Styles are .ah-lightbox in style.css.
 *
 * Until 2026-10-06 this was an inline script at the foot of index.html, for
 * the About photographs. It moved here when the Agent Review write-up's
 * screens took it too, so the two pages run one lightbox rather than two
 * copies of it.
 *
 * What it shows under the picture:
 *   - data-zoom-caption, if the link carries one (HTML; the homepage's short
 *     photo labels, set in the lightbox's uppercase caption);
 *   - otherwise the figcaption of the figure the link sits in, as text, set
 *     in sentence case (.ah-lightbox-note), because a figcaption is a
 *     sentence and an uppercase sentence does not read.
 * The picture's alt is data-zoom-alt, or else the alt of the image inside
 * the link.
 */
(function () {
  var links = document.querySelectorAll('a[data-zoom]');
  if (!links.length) return;

  var box = null, fig = null, img = null, cap = null, hint = null,
      closeBtn = null, opener = null;

  /* ---- Pan and zoom, phones only ----------------------------------
     A landscape picture on a portrait screen fits in about a third of
     it, which is fine for a photograph and useless for the event card,
     where the whole point is the words. Below the two-column
     breakpoint the picture becomes tap-to-zoom and drag-to-pan.
     Above it there is nothing to fix: the image already renders near
     its natural size. */
  var zoom = 1, tx = 0, ty = 0;
  var dragging = false, moved = false, startX = 0, startY = 0, baseX = 0, baseY = 0;

  function canZoom() {
    return window.matchMedia('(max-width: 767.98px)').matches;
  }

  /* Zoom enough to be worth the tap, capped so a small source is not
     blown up past its own resolution. */
  function zoomFactor() {
    var w = img.getBoundingClientRect().width;
    if (!w || !img.naturalWidth) return 2.5;
    return Math.max(2, Math.min(3.5, img.naturalWidth / w));
  }

  /* Keep the picture over the viewport: you can reach every edge and
     no further, so a drag never flings it away into the dark. */
  function clamp() {
    var r = img.getBoundingClientRect();
    var w = r.width / zoom, h = r.height / zoom;
    var maxX = Math.max(0, (w * zoom - window.innerWidth) / 2 + 12);
    var maxY = Math.max(0, (h * zoom - window.innerHeight) / 2 + 12);
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }

  function applyZoom() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + zoom + ')';
    img.style.touchAction = zoom > 1 ? 'none' : '';
    img.classList.toggle('is-zoomed', zoom > 1);
    if (hint) hint.textContent = zoom > 1 ? 'Drag to move, tap to fit' : 'Tap the picture to zoom';
  }

  function resetZoom() {
    zoom = 1; tx = 0; ty = 0;
    applyZoom();
  }

  function build() {
    box = document.createElement('div');
    box.className = 'ah-lightbox';
    /* The overlay is dark and covers whatever section you opened it
       from, so the custom cursor has to flip warm the way it does over
       the site's other dark surfaces. */
    box.setAttribute('data-cursor', 'light');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Picture');

    fig = document.createElement('figure');
    fig.className = 'ah-lightbox-figure';
    img = document.createElement('img');
    img.setAttribute('alt', '');
    /* An <img> is natively draggable, and that drag hijacks the
       gesture: the browser fires pointercancel as soon as it starts,
       so a pan died after its first move. */
    img.draggable = false;
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    cap = document.createElement('figcaption');
    hint = document.createElement('p');
    hint.className = 'ah-lightbox-hint';
    fig.appendChild(img);
    fig.appendChild(cap);
    fig.appendChild(hint);

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ah-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close the picture');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';

    box.appendChild(fig);
    box.appendChild(closeBtn);
    document.body.appendChild(box);

    closeBtn.addEventListener('click', function () { close(); });
    /* Anywhere off the picture closes, which is what the scrim looks
       like it should do. A drag that happens to end on the scrim is
       not a tap, so panning never closes the overlay by accident. */
    box.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      if (!fig.contains(e.target)) close();
    });

    img.addEventListener('click', function (e) {
      if (!canZoom() || moved) return;
      e.stopPropagation();
      if (zoom > 1) { resetZoom(); return; }
      zoom = zoomFactor();
      tx = 0; ty = 0;
      clamp();
      applyZoom();
    });

    /* Pointer events rather than touch events: the same handlers cover
       a finger and a trackpad drag, and setPointerCapture keeps the
       gesture alive when the finger leaves the picture. */
    img.addEventListener('pointerdown', function (e) {
      if (zoom === 1) return;
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      baseX = tx; baseY = ty;
      img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      tx = baseX + dx; ty = baseY + dy;
      clamp();
      applyZoom();
    });
    var endDrag = function (e) {
      if (!dragging) return;
      dragging = false;
      if (img.hasPointerCapture && img.hasPointerCapture(e.pointerId)) {
        img.releasePointerCapture(e.pointerId);
      }
    };
    img.addEventListener('pointerup', endDrag);
    img.addEventListener('pointercancel', endDrag);

    /* Rotating the phone changes what "fits", so the zoom state stops
       meaning anything: go back to fit rather than leave the picture
       parked somewhere arbitrary. */
    window.addEventListener('resize', function () {
      if (zoom > 1) resetZoom();
    });
  }

  function open(link) {
    if (!box) build();
    opener = link;

    var own = link.getAttribute('data-zoom-caption');
    var figure = link.closest('figure');
    var figcap = figure && figure.querySelector('figcaption');
    var label = '';
    if (own) {
      cap.innerHTML = own;
      label = own.replace(/&middot;/g, '-');
    } else {
      label = figcap ? figcap.textContent.trim() : '';
      cap.textContent = label;
    }
    cap.className = own ? '' : 'ah-lightbox-note';
    cap.hidden = !(own || label);

    var inner = link.querySelector('img');
    img.setAttribute('alt', link.getAttribute('data-zoom-alt') ||
      (inner && inner.getAttribute('alt')) || '');
    img.src = link.getAttribute('href');
    box.setAttribute('aria-label', label || 'Picture');
    /* Every open starts fitted, so the second picture never inherits
       the first one's zoom and offset. */
    resetZoom();
    hint.hidden = !canZoom();

    /* Pad by the width of the scrollbar we are about to remove. */
    var gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
    document.documentElement.classList.add('ah-lightbox-open');

    /* One frame between insertion and the class, or the fade has nothing
       to run from on the first open. Focus can follow in the same frame:
       the stylesheet switches visibility with no duration on the way in,
       so the button is focusable the moment the class lands. */
    requestAnimationFrame(function () {
      box.classList.add('is-open');
      closeBtn.focus();
    });

    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!box || !box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    document.documentElement.classList.remove('ah-lightbox-open');
    document.body.style.paddingRight = '';
    document.removeEventListener('keydown', onKey);
    if (opener) { opener.focus(); opener = null; }
  }

  function onKey(e) {
    /* Escape backs out one step at a time: zoomed out first, then
       shut, so a zoomed picture is not yanked off the screen. */
    if (e.key === 'Escape') {
      e.preventDefault();
      if (zoom > 1) { resetZoom(); return; }
      close();
      return;
    }
    /* The dialog holds one focusable control, so Tab loops back to it
       rather than walking off into the page behind the scrim. */
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  }

  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      /* Leave modified clicks alone: opening the file in a new tab is a
         reasonable thing to want. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      open(link);
    });
  });
})();
