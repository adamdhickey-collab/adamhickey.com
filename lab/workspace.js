/* lab/workspace.js -- the workspace shell on the lab index.
 *
 * Every word on the page is in lab/index.html. This file chooses which of the
 * three pieces is showing, switches the panes on a phone, and answers the
 * assistant's composer from what the page already says. It runs no model,
 * and the panel tells the reader so before they type.
 */
(function () {
  var root = document.querySelector('.ws');
  if (!root) return;

  var pieces = root.querySelectorAll('.ws-piece');
  var files = root.querySelectorAll('.ws-file');
  var folders = root.querySelectorAll('.ws-folder');
  var dock = root.querySelectorAll('.ws-dock [data-pane]');
  var windowEl = root.querySelector('.ws-window');
  var thread = root.querySelector('.ws-thread');
  var form = root.querySelector('.ws-composer');
  var input = root.querySelector('.ws-composer textarea');
  var phone = window.matchMedia('(max-width: 56.1875rem)');
  var current = null;

  function setPane(name) {
    root.classList.remove('is-explorer', 'is-editor', 'is-agent');
    root.classList.add('is-' + name);
    dock.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-pane') === name ? 'true' : 'false');
    });
  }

  function pieceById(id) {
    return root.querySelector('#piece-' + id);
  }

  /* "Second Look: an AI recommendation..." is the heading; Second Look is
     the name. */
  function title(piece) {
    return piece.querySelector('h2').textContent.split(':')[0];
  }

  /* A prototype's frame is made the first time its piece is opened, so the
     page does not load two prototypes it may never show. */
  function ensureFrame(piece) {
    var slot = piece.querySelector('[data-embed]');
    if (!slot || slot.firstChild) return;
    var frame = document.createElement('iframe');
    frame.src = slot.getAttribute('data-embed');
    frame.title = slot.getAttribute('data-title');
    slot.appendChild(frame);
  }

  function open(id, options) {
    var piece = pieceById(id);
    if (!piece) return false;
    current = id;
    pieces.forEach(function (p) { p.hidden = p !== piece; });
    files.forEach(function (link) {
      var on = link.getAttribute('data-piece') === id;
      link.classList.toggle('is-current', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    windowEl.classList.add('is-filled');
    ensureFrame(piece);
    if (!options || options.record !== false) {
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* a file: page */ }
    }
    if (phone.matches && (!options || options.pane !== false)) setPane('editor');
    return true;
  }

  dock.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPane(btn.getAttribute('data-pane'));
    });
  });

  folders.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
    });
  });

  files.forEach(function (link) {
    link.addEventListener('click', function (event) {
      /* A new tab or window is the reader asking for the page itself. */
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (open(link.getAttribute('data-piece'))) event.preventDefault();
    });
  });

  function say(who, text) {
    var p = document.createElement('p');
    var label = document.createElement('strong');
    p.className = 'ws-msg';
    label.textContent = who;
    p.appendChild(label);
    p.appendChild(document.createTextNode(text));
    thread.appendChild(p);
    thread.scrollTop = thread.scrollHeight;
  }

  /* The word list is each piece's own data-words. The piece with the most
     words in the question wins; a tie goes to the one already open. */
  function match(question) {
    var said = ' ' + question.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
    var best = null;
    var bestScore = 0;
    pieces.forEach(function (piece) {
      var score = 0;
      piece.getAttribute('data-words').split(' ').forEach(function (word) {
        if (word && said.indexOf(' ' + word + ' ') !== -1) score += 1;
      });
      var id = piece.id.replace('piece-', '');
      if (score > bestScore || (score && score === bestScore && id === current)) {
        best = id;
        bestScore = score;
      }
    });
    return best;
  }

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      say('You', text);
      input.value = '';
      var id = match(text);
      if (id) {
        open(id, { pane: false });
        say('Assistant', 'Opened ' + title(pieceById(id)) + '. The page it links to has the whole account.');
      } else if (current) {
        say('Assistant', 'I have no answer to that. ' + title(pieceById(current)) + ' is open; its page has the whole account, and the three pieces are listed under Files.');
      } else {
        say('Assistant', 'I have no answer to that. The three pieces are listed under Files, and adam@adamhickey.com reaches the person.');
      }
    });

    /* Enter sends, Shift+Enter breaks the line, as in the tools this imitates. */
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  }

  setPane('editor');
  var fromHash = location.hash.replace('#', '');
  if (fromHash) open(fromHash, { pane: false, record: false });
})();
