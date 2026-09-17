/* ==========================================================================
   read-aloud.js -- "Listen to this page."

   Pressing the button hands the page's prose to the browser's own speech
   synthesiser and marks the words as they are spoken, scrolling to keep the
   live sentence in view all the way to the bottom. Styling is in
   read-aloud.css; this file decides what gets read, in what order, and what
   is lit while it is being said.

   WHY THE BUTTON IS BUILT HERE rather than written into twenty-four
   pages. Two reasons, and the second is the one that decides it.
   Twenty-four copies of a control is how the two headers drifted apart
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
  /* The hook is read as a list of words rather than a whole value, because
     one element can want two of them: the prototype's row of actions is both
     where the control goes and a thing not to read out. */
  const SKIP = 'nav, .site-nav, .case-toc, .skip-link, [aria-hidden="true"],' +
               '[hidden], [data-read-aloud~="skip"]';

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
  /* A sideways track -- the five screens above the cockpit are a scroll-snap
     list with all five in the document, side by side -- holds prose that the
     page's own vertical scroll can never bring into view. The slide is a
     child of the track, so the same arithmetic the slideshow's own controls
     use puts it on the track's starting edge: the distance between two
     children's offsets is the scroll between them.

     Nothing here knows about the cockpit. It is the general case of text that
     is laid out and off screen, and a track that is already showing the slide
     is left alone rather than nudged to the pixel. */
  const trackOf = (el) => {
    for (let n = el.parentElement; n && n !== main.parentElement; n = n.parentElement) {
      if (n.scrollWidth - n.clientWidth > 8 &&
          /auto|scroll/.test(getComputedStyle(n).overflowX)) return n;
    }
    return null;
  };

  const followAcross = (seg) => {
    const track = trackOf(seg.el);
    if (!track || !track.firstElementChild) return;
    let slide = seg.el;
    while (slide && slide.parentElement !== track) slide = slide.parentElement;
    if (!slide) return;
    const to = slide.offsetLeft - track.firstElementChild.offsetLeft;
    if (Math.abs(track.scrollLeft - to) < 8) return;
    track.scrollTo({ left: to, behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  let handScrolledAt = 0;
  const follow = (seg) => {
    if (Date.now() - handScrolledAt < 4000) return;
    followAcross(seg);
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
     The voice.

     Three things decide it, in this order: what the reader chose here last
     time, then the preference list below -- the platform's best-sounding
     English voices first -- then the browser's own default. The reader's
     choice outranks everything, including a premium voice they have already
     rejected once.

     getVoices() is empty on the first call in most browsers and fills in
     asynchronously, so this is run again from the voiceschanged listener
     further down, where the player can be updated with it.

     The list is also what the picker offers, which is why the novelty
     voices are filtered here rather than at the control: the voice this
     file reaches for on its own and the voices it will show a reader should
     not be two different sets. ---------------------------------------- */
  let voice = null;
  const WANTED = [/premium/i, /enhanced/i, /natural/i,
                  /google (us|uk) english/i, /samantha/i, /\bava\b/i, /daniel/i];

  /* Apple ships these alongside the real voices, and they are jokes and
     sound effects rather than anything that can read four thousand words:
     Zarvox, Trinoids, a church organ, a sheep. Albert, Fred, Junior, Kathy
     and Ralph are the 1990s MacinTalk set, kept for compatibility and no
     more listenable. Left in, a picker offers twenty of these above Zoe;
     the default system voice on the machine this was written on was Albert.

     A denylist and not a heuristic, because there is no signal to read: the
     good voices and the joke voices are both bare first names. If it ever
     strips a list down to nothing -- another platform, another set of names
     -- everything is offered instead, below. */
  const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|fred|good news|jester|junior|kathy|organ|pipe organ|ralph|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|princess|bruce)\b/i;

  const VOICE_KEY = 'adamhickey:read-aloud-voice';
  const stored = (() => {
    /* A private window, cleared site data, or a browser set to refuse
       storage: all of these throw rather than return nothing. */
    try { return localStorage.getItem(VOICE_KEY); } catch (e) { return null; }
  })();
  const remember = (name) => {
    try { localStorage.setItem(VOICE_KEY, name); } catch (e) { /* not worth a word to the reader */ }
  };

  /* English voices worth offering, best first: the ones the preference list
     names, in its order, then everything else alphabetically. */
  const usable = () => {
    const en = synth.getVoices().filter((v) => /^en(-|$)/i.test(v.lang));
    let list = en.filter((v) => !NOVELTY.test(v.name));
    if (list.length < 2) list = en;                 /* not a Mac; offer it all */
    const rank = (v) => {
      const i = WANTED.findIndex((w) => w.test(v.name));
      return i < 0 ? WANTED.length : i;
    };
    return list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  };

  /* "Eddy (English (United States))" is the platform's label, not a label
     for a control eleven rems wide. */
  const label = (v) => v.name
    .replace(/\(English \(United States\)\)/i, '(US)')
    .replace(/\(English \(United Kingdom\)\)/i, '(UK)')
    .replace(/\s+/g, ' ').trim();

  const pickVoice = () => {
    const list = usable();
    if (!list.length) return;
    /* What the reader chose last time wins over anything this file prefers. */
    const kept = stored && list.find((v) => v.name === stored);
    if (kept) { voice = kept; return; }
    for (const want of WANTED) {
      const hit = list.find((v) => want.test(v.name));
      if (hit) { voice = hit; return; }
    }
    voice = list.find((v) => v.default) || list[0];
  };
  pickVoice();

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
     families, and the paragraph after the h1 is the dek where there is one.

     A page whose hero does not end on its dek says where to go instead, with
     data-read-aloud="after" on the element to sit under. The prototype is the
     one that needs it: its hero closes on a row of actions, and the default
     place would put a control between a sentence and the button it argues
     for. The attribute is markup rather than a fourth guess in here, because
     what follows the dek is a fact about the page and the page is where it
     can be seen.

     Such a row is usually also a row of BUTTONS, and a button label is not
     prose: read out, the prototype's hero said "See the five scenarios. See
     the design decisions" between its dek and its first heading. Everywhere
     else the site puts its actions in a div.cta-row, which is not a block
     this file reads, so the prototype was the only page whose voice read its
     own navigation. It says "skip after" -- both words -- and that is the
     whole fix. */
  const h1 = main.querySelector('h1');
  if (!h1) return;
  let anchor = main.querySelector('[data-read-aloud~="after"]');
  if (!anchor) {
    anchor = h1;
    if (anchor.nextElementSibling && anchor.nextElementSibling.tagName === 'P') {
      anchor = anchor.nextElementSibling;
    }
  }
  anchor.insertAdjacentElement('afterend', bar);

  const player = document.createElement('div');
  player.className = 'ra-player';
  player.setAttribute('role', 'group');
  player.setAttribute('aria-label', 'Read aloud controls');
  player.innerHTML =
    /* Transport first and together, then the two settings, then where we
       are. Voice went in between pause and stop at first, which put two
       dropdowns through the middle of the transport and, on a phone where
       the bar wraps, left Stop stranded on the second row away from Pause. */
    '<button type="button" class="ra-btn ra-toggle">' + PAUSE + '<span class="ra-btn-label">Pause</span></button>' +
    '<button type="button" class="ra-btn ra-stop">' + STOP + '<span class="ra-btn-label">Stop</span></button>' +
    '<button type="button" class="ra-btn ra-rate" aria-label="Reading speed">1&times;</button>' +
    '<select class="ra-voice" aria-label="Voice"></select>' +
    '<span class="ra-count"></span>';
  document.body.appendChild(player);

  const toggle = player.querySelector('.ra-toggle');
  const rateBtn = player.querySelector('.ra-rate');
  const voiceSel = player.querySelector('.ra-voice');
  const stopBtn = player.querySelector('.ra-stop');
  const count = player.querySelector('.ra-count');

  /* The select carries exactly one option until someone reaches for it: the
     voice currently being used, so the control reads correctly without
     holding a list. Filling it on first touch is what keeps the page's
     element count the same on a machine with forty voices and on one with
     none -- see the note in read-aloud.css. */
  let filled = false;
  const showCurrent = () => {
    voiceSel.innerHTML = '';
    const o = document.createElement('option');
    o.value = voice ? voice.name : '';
    o.textContent = voice ? label(voice) : 'System voice';
    voiceSel.appendChild(o);
    voiceSel.disabled = !voice;
  };
  const fill = () => {
    const list = usable();
    if (filled || !list.length) return;
    filled = true;
    voiceSel.innerHTML = '';
    for (const v of list) {
      const o = document.createElement('option');
      o.value = v.name;
      o.textContent = label(v);
      if (voice && v.name === voice.name) o.selected = true;
      voiceSel.appendChild(o);
    }
  };
  showCurrent();
  /* pointerdown fires before the platform opens the menu, and keydown covers
     a reader who arrives by tab and presses a key rather than clicking. */
  voiceSel.addEventListener('pointerdown', fill);
  voiceSel.addEventListener('keydown', fill);
  voiceSel.addEventListener('focus', fill);

  voiceSel.addEventListener('change', () => {
    const chosen = usable().find((v) => v.name === voiceSel.value);
    if (!chosen) return;
    voice = chosen;
    remember(chosen.name);
    if (!playing) return;
    /* Re-speak the piece being read, so the change can be heard against the
       sentence that prompted it rather than at the start of the next one. */
    const resume = at;
    run++;
    clearGap();
    synth.cancel();
    paused = false;
    resumeAt = null;
    setPaused(false);
    speakAt(resume);
  });

  /* getVoices() is empty on the first call in most browsers and fills in
     asynchronously; on a machine that has just downloaded a voice it fills
     again. Re-pick only while nothing is being read, or the voice would
     change under a reader mid-sentence. */
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => {
      if (playing) return;
      filled = false;
      pickVoice();
      showCurrent();
    });
  }

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
