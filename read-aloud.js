/* ==========================================================================
   read-aloud.js -- "Listen to this page."

   Pressing the button hands the page's prose to the browser's own speech
   synthesiser and marks the words as they are spoken, scrolling to keep the
   live sentence in view all the way to the bottom. Styling is in
   read-aloud.css; this file decides what gets read, in what order, and what
   is lit while it is being said.

   WHY THE BUTTON IS BUILT HERE rather than written into twenty-three
   pages. Two reasons, and the second is the one that decides it.
   Twenty-three copies of a control is how the two headers drifted apart
   before site-nav.css existed. And a button that cannot work without JavaScript should not be
   in the HTML: speech synthesis IS the feature, so a reader whose browser
   has no speechSynthesis gets no button rather than a button that lies.
   The same test returns early on a page with no <main>.

   IT BREATHES. Sentence, paragraph, heading and the label above a heading
   are each followed by a measured silence, and the reading is pitched a
   shade under the API's default rate. Both are worth more than the choice
   of voice: a synthesiser sounds like a machine mostly because it does not
   stop, and no voice on the reader's machine fixes that. The gaps shorten
   with the speed control, or they swamp a 1.5x reading.

   WHY SENTENCES, NOT THE PAGE. Handing the synthesiser one long string is
   the obvious implementation and it fails twice. Chrome stops speaking a
   single utterance after about fifteen seconds, silently and mid-word; and
   the only position report is `boundary`, which Safari does not fire for
   most voices, so a page-long utterance there gives no way at all to know
   where the voice has got to. One utterance per sentence answers both: the
   sentence is lit by `start` and `end`, which every browser fires, and no
   utterance runs long enough to hit the Chrome ceiling. Sentences over ~180
   characters are further split at clause breaks for the same reason.

   Word-level marking rides on top of `boundary` where it exists and is
   simply absent where it does not. When the first sentence finishes without
   one, .ra-no-words goes on the root and the CSS promotes the sentence band
   to the strong fill -- the granularity degrades, the salience does not.

   WHY THE Highlight API AND NOT SPANS. Wrapping sentences in <span> means
   rewriting the article's DOM, which breaks on every sentence that crosses
   an <a> or an <em> -- and this site's prose is full of both -- and leaves
   the reader copying markup that was not there a moment ago. CSS.highlights
   paints arbitrary Ranges with no DOM change at all, so a sentence spanning
   three inline elements is one Range and one highlight. Where it is missing,
   the fallback marks the whole paragraph with a class.
   ========================================================================== */
(() => {
  'use strict';

  const synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') return;
  const main = document.querySelector('main');
  if (!main) return;

  const HAS_HL = typeof CSS !== 'undefined' && CSS.highlights &&
                 typeof window.Highlight === 'function';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* --------------------------------------------------------------------
     What gets read.

     Every text-bearing block inside <main>, in document order, minus the
     things that are not prose: navigation, anything hidden from the
     accessibility tree, and the control this script adds itself. A block
     that contains another block is a wrapper, and reading it would say its
     children twice. -------------------------------------------------- */
  const BLOCKS = 'h1, h2, h3, h4, p, li, blockquote, figcaption, dt, dd';
  const SKIP = 'nav, .site-nav, .case-toc, .skip-link, [aria-hidden="true"],' +
               '[hidden], [data-read-aloud="skip"]';

  const collect = () => {
    const out = [];
    for (const el of main.querySelectorAll(BLOCKS)) {
      if (el.closest(SKIP)) continue;
      if (el.querySelector(BLOCKS)) continue;
      if (!el.textContent.trim()) continue;
      if (!el.getClientRects().length) continue;   /* a closed panel, a hidden tab */
      out.push(el);
    }
    return out;
  };

  /* A block flattened to one string, plus the text nodes it came from, so a
     character offset in that string can be turned back into a DOM position.
     This is what lets a sentence cross an <a> or a <mark> without anyone
     having to think about it. */
  const textMap = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue && n.parentElement &&
                          !n.parentElement.closest('[aria-hidden="true"]'))
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const runs = [];
    let text = '', n;
    while ((n = walker.nextNode())) {
      runs.push({ node: n, at: text.length });
      text += n.nodeValue;
    }
    return { runs, text };
  };

  const locate = (runs, offset) => {
    for (let i = runs.length - 1; i >= 0; i--) {
      if (offset >= runs[i].at) {
        const node = runs[i].node;
        return { node, offset: Math.min(offset - runs[i].at, node.nodeValue.length) };
      }
    }
    return null;
  };

  const rangeOf = (map, from, to) => {
    const a = locate(map.runs, from), b = locate(map.runs, to);
    if (!a || !b) return null;
    try {
      const r = document.createRange();
      r.setStart(a.node, a.offset);
      r.setEnd(b.node, b.offset);
      return r;
    } catch (e) { return null; }
  };

  /* --------------------------------------------------------------------
     Sentences. Intl.Segmenter knows that "e.g." and "Mr." are not the end
     of anything; the regex fallback does not, and is only reached on a
     browser old enough that the highlight is gone too. ---------------- */
  const sentences = (text) => {
    const out = [];
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      for (const s of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)) {
        out.push([s.index, s.index + s.segment.length]);
      }
    } else {
      const re = /[^.!?]+[.!?]*\s*/g;
      let m;
      while ((m = re.exec(text))) out.push([m.index, m.index + m[0].length]);
    }
    return out;
  };

  /* Chrome's fifteen-second ceiling, in characters. A sentence longer than
     this is spoken in clauses, cut at a comma, a semicolon, a colon or an
     em dash, and at a word if it has none of those. */
  const MAX = 180;

  const clauses = (text, from, to) => {
    if (to - from <= MAX) return [[from, to]];
    const marks = [];
    const re = /[,;:—]\s/g;
    const slice = text.slice(from, to);
    let m;
    while ((m = re.exec(slice))) marks.push(from + m.index + m[0].length);
    const parts = [];
    let at = from;
    while (to - at > MAX) {
      let cut = -1;
      for (const b of marks) {
        if (b <= at) continue;
        if (b - at > MAX) break;
        cut = b;
      }
      if (cut < 0) {
        const space = text.lastIndexOf(' ', at + MAX);
        cut = space > at ? space + 1 : to;
      }
      parts.push([at, cut]);
      at = cut;
    }
    if (at < to) parts.push([at, to]);
    return parts;
  };

  /* --------------------------------------------------------------------
     Pauses.

     The single biggest reason a synthesiser sounds like a machine is that it
     does not breathe: sentence runs into sentence, paragraph into heading,
     at exactly the same interval. A reader does not do that, and the fix is
     not a better voice -- it is silence in the right places.

     These are milliseconds of held silence AFTER a piece of speech, chosen
     by what comes next. They are not motion, so MOTION.md's six durations do
     not govern them; a pause in speech is measured against the ear.

     A label -- "Key idea 2 of 6", "Writing, 4 min read" -- gets the SHORT
     gap rather than the long one, because it belongs to the heading it
     introduces. Running it into that heading, which is what the first
     version did, made the two sound like one sentence. ---------------- */
  const GAP = {
    sentence:  140,   /* within a paragraph: a breath, not a stop */
    paragraph: 340,   /* paragraph to paragraph */
    label:     260,   /* an eyebrow, and then the heading it names */
    heading:   420,   /* a heading, and then the prose under it */
    section:   760    /* the argument turning: into a heading or its label */
  };
  const LABEL = '.writing-eyebrow, .writing-recap-label, .case-kicker,' +
                '.eng3-kicker, .build-next-eyebrow, .glance-kicker';
  const isHead = (el) => /^H[1-4]$/.test(el.tagName);
  const isLabel = (el) => el.matches(LABEL);

  const gapBetween = (a, b) => {
    if (!b) return 0;                       /* the end of the page */
    if (a === b) return GAP.sentence;
    if (isLabel(a)) return GAP.label;
    if (isHead(a)) return GAP.heading;
    if (isHead(b) || isLabel(b)) return GAP.section;
    return GAP.paragraph;
  };

  /* The reading list: one entry per thing that will be spoken, each holding
     the block it lives in, the offsets of its own text within that block,
     and the exact string handed to the synthesiser. The offsets are trimmed
     of leading and trailing whitespace so the mark grips the words rather
     than the gap after them, and so a `boundary` charIndex -- which counts
     from the start of the string given to speak() -- lands on the right
     character without an adjustment. */
  const build = () => {
    const segs = [];
    for (const el of collect()) {
      const map = textMap(el);
      for (const [s, e] of sentences(map.text)) {
        for (let [a, b] of clauses(map.text, s, e)) {
          const raw = map.text.slice(a, b);
          if (!/[a-z0-9]/i.test(raw)) continue;    /* punctuation or whitespace alone */
          a += raw.length - raw.replace(/^\s+/, '').length;
          b -= raw.length - raw.replace(/\s+$/, '').length;
          if (b <= a) continue;
          segs.push({ el, map, from: a, to: b, text: map.text.slice(a, b) });
        }
      }
    }
    for (let i = 0; i < segs.length; i++) {
      segs[i].gap = gapBetween(segs[i].el, segs[i + 1] && segs[i + 1].el);
    }
    return segs;
  };

  /* --------------------------------------------------------------------
     Marking. ---------------------------------------------------------- */
  let segHL = null, wordHL = null;
  if (HAS_HL) {
    segHL = new Highlight();
    wordHL = new Highlight();
    CSS.highlights.set('read-aloud-segment', segHL);
    CSS.highlights.set('read-aloud-word', wordHL);
  }
  let blockMarked = null;

  const unmark = () => {
    if (HAS_HL) { segHL.clear(); wordHL.clear(); }
    if (blockMarked) { blockMarked.classList.remove('is-reading-block'); blockMarked = null; }
  };

  const markSegment = (seg) => {
    unmark();
    if (HAS_HL) {
      const r = rangeOf(seg.map, seg.from, seg.to);
      if (r) segHL.add(r);
    } else {
      seg.el.classList.add('is-reading-block');
      blockMarked = seg.el;
    }
  };

  let sawWords = false;
  const markWord = (seg, ev) => {
    if (!HAS_HL) return;
    const at = ev.charIndex || 0;
    let len = ev.charLength;
    if (!len || len < 1) {
      const m = /^\S+/.exec(seg.text.slice(at));
      len = m ? m[0].length : 0;
    }
    if (!len) return;
    if (!sawWords) { sawWords = true; root.classList.remove('ra-no-words'); }
    wordHL.clear();
    const r = rangeOf(seg.map, seg.from + at, seg.from + at + len);
    if (r) wordHL.add(r);
  };

  /* --------------------------------------------------------------------
     Following. Scroll only when the live sentence has left the comfortable
     band, so an ordinary paragraph is read without the page moving at all,
     and a reader who has scrolled ahead is left alone for a few seconds. */
  let handScrolledAt = 0;
  const follow = (seg) => {
    if (Date.now() - handScrolledAt < 4000) return;
    const r = rangeOf(seg.map, seg.from, seg.to);
    const rect = (r ? r : seg.el).getBoundingClientRect();
    if (!rect.height && !rect.width) return;
    const h = window.innerHeight;
    if (rect.top >= h * 0.15 && rect.bottom <= h * 0.72) return;
    window.scrollTo({
      top: window.scrollY + rect.top - h * 0.32,
      behavior: reduce.matches ? 'auto' : 'smooth'
    });
  };

  /* --------------------------------------------------------------------
     The voice. getVoices() is empty on first call in most browsers and
     fills in asynchronously, so this runs again on voiceschanged. The
     preference order is the platform's best-sounding English voices first
     and the browser's own default last. ------------------------------- */
  let voice = null;
  const WANTED = [/premium/i, /enhanced/i, /natural/i, /\bsiri\b/i,
                  /google (us|uk) english/i, /samantha/i, /\bava\b/i, /daniel/i];
  const pickVoice = () => {
    const all = synth.getVoices().filter((v) => /^en(-|$)/i.test(v.lang));
    if (!all.length) return;
    for (const want of WANTED) {
      const hit = all.find((v) => want.test(v.name));
      if (hit) { voice = hit; return; }
    }
    voice = all.find((v) => v.default) || all[0];
  };
  pickVoice();
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', pickVoice);
  }

  /* --------------------------------------------------------------------
     The controls. -----------------------------------------------------
     A `run` token guards every callback: cancel() makes the synthesiser
     fire end or error on whatever it was holding, and without the guard
     that stale event advances the new reading by one. */
  /* The rate the reader sees, times the pace the prose is read at. 0.95 is
     a shade under the API's default: the synthesiser's 1.0 is pitched at
     hearing a notification, not at following an argument, and the essays are
     long. "1x" on the control means this pace, not the API's. */
  const RATES = [1, 1.25, 1.5, 0.75];
  const BASE_RATE = 0.95;
  let segs = [], at = 0, run = 0, playing = false, rateIx = 0;

  /* Silence between two pieces of speech is real playback, so it has to obey
     pause and stop like speech does. `paused` is this script's own flag
     rather than synth.paused, because during a gap there is nothing speaking
     for the synthesiser to have an opinion about; `resumeAt` is where to
     pick up if the reader pauses mid-silence. */
  let paused = false, gapTimer = null, resumeAt = null;
  const clearGap = () => { clearTimeout(gapTimer); gapTimer = null; };

  const advance = (n, gap, token) => {
    clearGap();
    /* A pause is a length of time in the reading, so it shortens with the
       speed: held at 1x through a 1.5x reading, the silences swamp it. */
    gapTimer = setTimeout(() => {
      gapTimer = null;
      if (token !== run || !playing) return;
      if (paused) { resumeAt = n; return; }
      speakAt(n);
    }, gap / RATES[rateIx]);
  };

  /* Transport glyphs are solid, not stroked. Drawn as outlines at 14px they
     were two hairlines and a hollow square, which read on screen as an empty
     button; the speaker keeps the site's stroked icon style because its arcs
     are lines. */
  const svg = (d, solid) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' +
    (solid ? ' fill="currentColor">'
           : ' fill="none" stroke="currentColor" stroke-width="2"' +
             ' stroke-linecap="round" stroke-linejoin="round">') + d + '</svg>';
  const PLAY = svg('<path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.2-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5z"/>', true);
  const PAUSE = svg('<rect x="6" y="4" width="4.5" height="16" rx="1"/><rect x="13.5" y="4" width="4.5" height="16" rx="1"/>', true);
  const STOP = svg('<rect x="5" y="5" width="14" height="14" rx="2"/>', true);
  const SPEAKER = svg('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>', false);

  const bar = document.createElement('div');
  bar.className = 'ra-bar';
  bar.setAttribute('data-read-aloud', 'skip');
  const listen = document.createElement('button');
  listen.type = 'button';
  listen.className = 'ra-listen';
  listen.innerHTML = SPEAKER + '<span>Listen to this page</span>';
  bar.appendChild(listen);

  /* Under the dek, above the first section: the offer to listen belongs
     next to the sentence that says what the page is, not at the top of the
     chrome. The h1's parent is the hero container in all three page
     families, and the paragraph after the h1 is the dek where there is one. */
  const h1 = main.querySelector('h1');
  if (!h1) return;
  let anchor = h1;
  if (anchor.nextElementSibling && anchor.nextElementSibling.tagName === 'P') {
    anchor = anchor.nextElementSibling;
  }
  anchor.insertAdjacentElement('afterend', bar);

  const player = document.createElement('div');
  player.className = 'ra-player';
  player.setAttribute('role', 'group');
  player.setAttribute('aria-label', 'Read aloud controls');
  player.innerHTML =
    '<button type="button" class="ra-btn ra-toggle">' + PAUSE + '<span class="ra-btn-label">Pause</span></button>' +
    '<button type="button" class="ra-btn ra-rate" aria-label="Reading speed">1&times;</button>' +
    '<button type="button" class="ra-btn ra-stop">' + STOP + '<span class="ra-btn-label">Stop</span></button>' +
    '<span class="ra-count"></span>';
  document.body.appendChild(player);

  const toggle = player.querySelector('.ra-toggle');
  const rateBtn = player.querySelector('.ra-rate');
  const stopBtn = player.querySelector('.ra-stop');
  const count = player.querySelector('.ra-count');

  /* Idle, the player is invisible but still laid out, which is what lets
     states.mjs force .is-reading and measure it. inert and aria-hidden keep
     it out of the tab order and off a screen reader until it is real. */
  const setIdle = (idle) => {
    root.classList.toggle('is-reading', !idle);
    player.inert = idle;
    player.setAttribute('aria-hidden', String(idle));
  };
  setIdle(true);

  const report = () => {
    count.textContent = segs.length ? (at + 1) + ' of ' + segs.length : '';
  };

  const setListen = (on) => {
    listen.innerHTML = SPEAKER + '<span>' +
      (on ? 'Stop reading' : 'Listen to this page') + '</span>';
    listen.setAttribute('aria-pressed', String(on));
  };

  const setPaused = (paused) => {
    toggle.innerHTML = (paused ? PLAY : PAUSE) +
      '<span class="ra-btn-label">' + (paused ? 'Resume' : 'Pause') + '</span>';
  };

  const speakAt = (n) => {
    if (n >= segs.length) { stop(); return; }
    at = n;
    report();
    const mine = run;
    const seg = segs[n];
    const u = new SpeechSynthesisUtterance(seg.text);
    u.rate = RATES[rateIx] * BASE_RATE;
    u.lang = (voice && voice.lang) || 'en-US';
    if (voice) u.voice = voice;
    u.onstart = () => { if (mine === run) { markSegment(seg); follow(seg); } };
    u.onboundary = (e) => { if (mine === run && e.name !== 'sentence') markWord(seg, e); };
    u.onend = () => {
      if (mine !== run || !playing) return;
      /* The verdict on word boundaries is taken once, when the first thing
         spoken has finished without one. Taking it at the start instead
         showed a flash of the strong fill in Chrome, which fires its first
         boundary a few milliseconds in. */
      if (HAS_HL && at === 0 && !sawWords) root.classList.add('ra-no-words');
      advance(at + 1, seg.gap, mine);
    };
    u.onerror = (e) => {
      if (mine !== run || !playing) return;
      /* interrupted and canceled are this script stopping itself. */
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      advance(at + 1, seg.gap, mine);
    };
    synth.speak(u);
  };

  const start = () => {
    run++;
    synth.cancel();
    segs = build();
    if (!segs.length) return;
    sawWords = false;
    root.classList.remove('ra-no-words');
    clearGap();
    paused = false;
    resumeAt = null;
    playing = true;
    setIdle(false);
    setPaused(false);
    setListen(true);
    /* The player is the last thing in the document, so a keyboard reader who
       has just pressed Listen would have to tab the whole article to reach
       Pause. Focus follows the controls the press produced. */
    toggle.focus({ preventScroll: true });
    speakAt(0);
  };

  /* `byHand` is a reader pressing stop, and only then does focus go back to
     the trigger; a reading that simply reached the bottom of the page should
     not yank the focus ring back to the top of it. */
  const stop = (byHand) => {
    run++;
    playing = false;
    clearGap();
    paused = false;
    resumeAt = null;
    synth.cancel();
    unmark();
    /* Focus has to leave the player BEFORE it goes inert, or the browser
       drops it on the body and a keyboard reader is returned to the top of
       the document with no way back to where they were. */
    const held = player.contains(document.activeElement);
    setIdle(true);
    root.classList.remove('ra-no-words');
    setListen(false);
    if (byHand || held) listen.focus({ preventScroll: true });
  };

  setListen(false);
  listen.addEventListener('click', () => { playing ? stop(true) : start(); });
  stopBtn.addEventListener('click', () => stop(true));

  toggle.addEventListener('click', () => {
    if (paused) {
      paused = false;
      setPaused(false);
      /* Paused inside a silence: there is nothing for the synthesiser to
         resume, so the next piece is started here instead. */
      if (resumeAt !== null) { const n = resumeAt; resumeAt = null; speakAt(n); }
      else synth.resume();
    } else {
      paused = true;
      setPaused(true);
      synth.pause();
    }
  });

  /* Rate cannot be changed on an utterance already speaking, so the current
     sentence is re-spoken at the new speed from its beginning. */
  rateBtn.addEventListener('click', () => {
    rateIx = (rateIx + 1) % RATES.length;
    rateBtn.textContent = RATES[rateIx] + '\u00d7';
    if (!playing) return;
    const resume = at;
    run++;                 /* the token stays raised: cancel() fires late */
    clearGap();
    synth.cancel();
    paused = false;
    resumeAt = null;
    setPaused(false);
    speakAt(resume);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playing) stop(true);
  });

  /* A reader who takes the scrollbar wants to be where they put themselves. */
  window.addEventListener('wheel', () => { handScrolledAt = Date.now(); }, { passive: true });
  window.addEventListener('touchmove', () => { handScrolledAt = Date.now(); }, { passive: true });

  /* Speech outlives the document in Chrome and Safari: leave the page
     mid-sentence and the voice carries on over the next one. */
  window.addEventListener('pagehide', () => {
    run++; playing = false; clearGap(); synth.cancel();
  });
})();
