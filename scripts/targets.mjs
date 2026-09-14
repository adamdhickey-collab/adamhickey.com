#!/usr/bin/env node
/* How big is everything you can press?
 *
 *   node scripts/targets.mjs                 every page, both widths
 *   node scripts/targets.mjs engagement      just the pages whose path matches
 *   node scripts/targets.mjs --strict        exit 1 if anything fails 2.5.8
 *   node scripts/targets.mjs --enhanced      also report the AAA 44px bar
 *   node scripts/targets.mjs --list          every target measured, largest first
 *
 * WHY THIS EXISTS, AND THE MISTAKE THAT PUT IT HERE. A comment in
 * dispatch-cockpit.js claimed the compact fleet was the exception and that
 * comfortable "carries the 44px the rest of this site holds itself to".
 * Checking it by reading getBoundingClientRect said nothing in the cockpit
 * reached 44 and the nav links were 27px, so the claim looked wrong about the
 * site as well as about the component, and it was corrected on that basis --
 * wrongly. The rect is the words. The target is the words plus the ::after
 * this site puts behind them, and .site-nav a is 38x27 of text inside 39x45 of
 * target. The site does hold a 44px floor on its link patterns, deliberately,
 * and style.css says so at four call sites.
 *
 * What was true is narrower: several of the COCKPIT's own controls do not
 * reach 44, and the cockpit is the one component that builds its targets from
 * padding rather than from that ::after. So this script hit-tests, and exists
 * so the next person to write a number down measures the thing the finger
 * lands on rather than the thing the text sits in.
 *
 * THE TWO BARS ARE NOT THE SAME CRITERION, and conflating them is how the
 * claim got written:
 *
 *   2.5.8 Target Size (Minimum)   AA,  WCAG 2.2   24 x 24 CSS px
 *   2.5.5 Target Size (Enhanced)  AAA, WCAG 2.1   44 x 44 CSS px
 *
 * The site conforms to AA. 44 is the AAA bar and was never the site's rule.
 * So 2.5.8 is what --strict fails on; 44 is reported for information under
 * --enhanced and fails nothing.
 *
 * THE EXCEPTIONS ARE MOST OF THE WORK, and a check that skips them is worse
 * than no check: it reports a conforming site as broken and gets switched off.
 *
 *   Inline. A link in a sentence is exempt from both, because its size is
 *   set by the line it sits in and enlarging it would break the paragraph.
 *   Detected structurally -- computed display is inline AND the parent holds
 *   real text of its own besides this link -- rather than by tag, because
 *   the same <a> is inline in a paragraph and a block in a nav.
 *
 *   Spacing. An undersized target passes anyway if a 24px circle on its
 *   centre reaches no other target. That is the actual wording of 2.5.8 and
 *   it is why a row of small icons with air around them conforms while the
 *   same icons shoulder to shoulder do not. Implemented as written: circle
 *   against other targets' boxes, and against other undersized targets'
 *   circles.
 *
 *   Essential, and user-agent controlled. Cannot be decided from a rect.
 *   Anything failing on those grounds has to be argued in prose, not here.
 *
 * MEASURED AT 375 AND 1440. The criterion is about pointers, not breakpoints,
 * so it applies at every width -- but the layout that decides a target's size
 * changes between them, and a phone is where a thumb actually lands.
 *
 * Exit 0 when every target clears 2.5.8 or an exception, 1 with the list when
 * one does not, 2 when it could not find out -- which is not a pass.
 */
import { findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';
import { reach, reachableFor } from './lib/reachable.mjs';

const strict = process.argv.includes('--strict');
const enhanced = process.argv.includes('--enhanced');
const listOnly = process.argv.includes('--list');
const only = pageFilters();
const root = resolveRoot('targets.mjs');
const say = (s = '') => console.log(s);

const MIN = 24;   /* 2.5.8 AA  */
const BIG = 44;   /* 2.5.5 AAA */
const WIDTHS = [375, 1440];

const chromium = loadChromium('targets.mjs');

/* ---------------------------------------------------------------------------
 * Everything below this line runs inside the page.
 * ------------------------------------------------------------------------- */
const IN_PAGE = String.raw`
(() => {
  const SEL = [
    'a[href]', 'button', 'input', 'select', 'textarea', 'summary',
    '[tabindex]', '[role="button"]', '[role="link"]', '[role="tab"]',
    '[role="checkbox"]', '[role="radio"]', '[role="menuitem"]', '[role="switch"]',
  ].join(',');

  /* THE TARGET IS THE AREA A POINTER CAN LAND ON, AND getBoundingClientRect
     DOES NOT KNOW IT.

     This site enlarges its link targets with an absolutely-positioned ::after
     -- "left:0; right:0; top:50%; height:44px; transform:translateY(-50%)" --
     and style.css explains why at four separate call sites: padding cannot do
     the job, because the hover border sits on the padded edge and would drift
     away from the text as the box grew. A pseudo-element is not an element,
     so it has no rect of its own and does not enlarge its originator's. Read
     the rect and .site-nav a measures 38x27; press it and you are pressing
     39x45. The first version of this script read rects, reported the site at
     45% of the 44px bar, and was measuring the words rather than the targets.

     So the size comes from hit-testing. elementFromPoint is the browser
     answering the only question that matters -- if a finger lands here, what
     gets it -- and it counts the pseudo, because a pseudo hands back the
     element it belongs to. Binary search out from the centre in each
     direction, which is about two dozen probes per target rather than the
     hundreds a linear walk would take.

     elementFromPoint only sees the viewport, so each target is scrolled into
     view before it is probed, and everything is stored in page coordinates so
     the spacing test below can compare targets that were never on screen at
     the same time. */
  const MAXOUT = 48;

  /* SMOOTH SCROLLING MAKES EVERY PROBE A LIE, AND A QUIET ONE.

     style.css sets 'scroll-behavior: smooth' on html, so scrollIntoView
     ANIMATES -- and the rect read on the next line, and every elementFromPoint
     after it, describe a page still in flight. The point lands on whatever was
     passing, owns() says no, and the code below falls back to the bounding
     rect: a number that looks like a measurement and is the thing this script
     exists not to report. It put .glance-more at 21px tall when a real pointer
     gets 44, which is the same mistake in kind as reading the rect in the
     first place. Turn it off before touching anything. */
  document.documentElement.style.scrollBehavior = 'auto';

  const raw = [];
  for (const el of document.querySelectorAll(SEL)) {
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.disabled) continue;
    if (el.getAttribute('tabindex') === '-1' && !el.matches('a[href],button,input,select,textarea,summary')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    if (el.type === 'hidden') continue;
    if (!el.getBoundingClientRect().width || !el.getBoundingClientRect().height) continue;
    raw.push(el);
  }

  const out = [];
  for (const el of raw) {
    const cs = getComputedStyle(el);
    el.scrollIntoView({ block: 'center', inline: 'center' });
    let r = el.getBoundingClientRect();

    /* A labelled control is pressed by its label too, so the label is part of
       the target. Kept as a rect union rather than hit-tested, because the
       label's own area belongs to the control whether or not it overlaps. */
    if (el.matches('input,select,textarea')) {
      let lab = el.closest('label');
      if (!lab && el.id) { try { lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); } catch (x) {} }
      if (lab) {
        const b = lab.getBoundingClientRect();
        if (b.width && b.height) {
          const x = Math.min(r.x, b.x), y = Math.min(r.y, b.y);
          r = { x, y, width:  Math.max(r.x + r.width,  b.x + b.width)  - x,
                      height: Math.max(r.y + r.height, b.y + b.height) - y };
        }
      }
    }

    /* PROBE THE LARGEST LINE BOX, NOT THE MIDDLE OF THE PARAGRAPH.

       An inline link that wraps has one rect per line, and getBoundingClientRect
       returns their union -- a box whose centre can sit in the leading between
       two lines, or out past the ragged edge, where the link is not. The probe
       then finds nothing, and before the fix above that silently became "the
       size is the box". Sixty-four of these showed up as unmeasurable, every
       one a wrapped link in a paragraph. getClientRects gives the lines
       themselves; the biggest one is the most representative place to stand. */
    let probeRect = r;
    const rects = el.getClientRects();
    if (rects.length > 1) {
      let best = null;
      for (const b of rects) if (!best || b.width * b.height > best.width * best.height) best = b;
      if (best) probeRect = best;
    }
    const cx = Math.round(probeRect.x + probeRect.width / 2), cy = Math.round(probeRect.y + probeRect.height / 2);
    const owns = (x, y) => {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
      const h = document.elementFromPoint(x, y);
      if (!h) return false;
      if (h === el || el.contains(h)) return true;
      const lab = el.matches('input,select,textarea') ? el.closest('label') : null;
      return !!lab && (h === lab || lab.contains(h));
    };

    let w = r.width, h = r.height, hitTested = false;
    if (owns(cx, cy)) {
      /* How far the hit region runs in one direction: the largest n up to
         MAXOUT for which the point n away is still this target. */
      const reach = (dx, dy) => {
        if (!owns(cx + dx, cy + dy)) return 0;
        let lo = 1, hi = MAXOUT;
        while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (owns(cx + dx * mid, cy + dy * mid)) lo = mid; else hi = mid - 1; }
        return lo;
      };
      /* THE PROBE ONLY EVER ADDS. MAXOUT caps how far the search walks, so a
         245px-wide label comes back as 97 -- 48 each way plus the centre --
         which is the cap reported as if it were a measurement. Every number
         in the first run of this was exactly 97 wide, which is what gave it
         away. The rect is a floor the ::after can only extend, so take the
         larger of the two in each axis: the probe answers "how much bigger
         than the box", never "how big". */
      w = Math.max(r.width, reach(-1, 0) + reach(1, 0) + 1);
      h = Math.max(r.height, reach(0, -1) + reach(0, 1) + 1);
      hitTested = true;
    }

    /* The inline exception, decided by structure: the element flows in a line
       AND its parent carries text of its own, so it is a word in a sentence
       rather than a box whose size someone chose. */
    let parentText = '';
    if (el.parentElement) for (const n of el.parentElement.childNodes) if (n.nodeType === 3) parentText += n.data;
    const inSentence = cs.display === 'inline' && parentText.trim().length > 0;

    out.push({
      x: r.x + scrollX, y: r.y + scrollY, w, h,
      cx: r.x + scrollX + r.width / 2, cy: r.y + scrollY + r.height / 2,
      boxW: Math.round(r.width), boxH: Math.round(r.height), hitTested, inSentence,
      display: cs.display,
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').split(' ').filter(Boolean).slice(0, 2).join('.'),
      label: (el.getAttribute('aria-label') || el.textContent || el.value || el.type || '').trim().replace(/\s+/g, ' ').slice(0, 34),
    });
  }

  /* 2.5.8's spacing exception, as written: a 24px circle on the target's
     centre reaches no other target's box, and no other undersized target's
     circle. Radius 12, in page coordinates. */
  const R = 12;
  const small = out.filter(t => t.w < 24 || t.h < 24);
  const hitsBox = (c, t) => {
    const nx = Math.max(t.x, Math.min(c.cx, t.x + t.w));
    const ny = Math.max(t.y, Math.min(c.cy, t.y + t.h));
    return Math.hypot(c.cx - nx, c.cy - ny) < R;
  };
  for (const t of out) {
    if (t.w >= 24 && t.h >= 24) { t.ok = true; t.why = 'size'; continue; }
    if (t.inSentence) { t.ok = true; t.why = 'inline'; continue; }
    const clearOfBoxes = !out.some(o => o !== t && hitsBox(t, o));
    const clearOfCircles = !small.some(o => o !== t && Math.hypot(t.cx - o.cx, t.cy - o.cy) < R * 2);
    t.ok = clearOfBoxes && clearOfCircles;
    t.why = t.ok ? 'spacing' : 'FAILS';
  }
  return out;
})()`;

const { server, origin } = await serve(root);
const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route(/^https?:/, r =>
  new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await ctx.newPage();

const chosen = pages(root).filter(f => !only.length || only.some(o => f.includes(o)));
if (!chosen.length) {
  console.error(`\n  No page matches ${only.join(', ')}.\n`);
  server.close(); await browser.close();
  process.exit(2);
}

const fails = [];
const all = [];
const byReason = { size: 0, inline: 0, spacing: 0 };
let measured = 0, reachedCount = 0;

async function sweep(rel, w, state) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.goto(`${origin}/${rel}`, { waitUntil: 'load' });
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]));
  if (state) await reach(page, state);
  const rows = await page.evaluate(IN_PAGE);
  const where = state ? `${rel} (${state.name})` : rel;
  for (const t of rows) {
    measured += 1;
    all.push({ ...t, page: where, width: w });
    if (t.ok) byReason[t.why] += 1;
    else fails.push({ ...t, page: where, width: w });
  }
}

for (const rel of chosen) {
  for (const w of WIDTHS) {
    await sweep(rel, w, null);
    for (const state of reachableFor(rel)) {
      try { await sweep(rel, w, state); reachedCount += 1; }
      catch (e) {
        say(`\n  ✗ cannot measure ${rel}\n`);
        say(`      ${e.message}`);
        if (e.unreached) {
          say(`\n    A state in scripts/lib/reachable.mjs no longer reaches anything.`);
          say(`    Fix the selector or retire the state; do not leave it unreached.\n`);
        } else say('');
        server.close(); await browser.close();
        process.exit(2);
      }
    }
  }
}

server.close();
await browser.close();

const key = (t) => `${t.page}|${t.width}|${t.tag}.${t.cls}|${t.label}`;
const dedupe = (rows) => {
  const m = new Map();
  for (const r of rows) if (!m.has(key(r))) m.set(key(r), r);
  return [...m.values()];
};

if (listOnly) {
  const rows = dedupe(all).sort((a, b) => (a.h * a.w) - (b.h * b.w));
  say(`\n  ${rows.length} distinct targets, smallest first:\n`);
  for (const r of rows) {
    say(`    ${String(Math.round(r.w)).padStart(5)} x ${String(Math.round(r.h)).padEnd(4)} ` +
        `${r.why.padEnd(8)} ${r.tag}${r.cls ? '.' + r.cls : ''}  "${r.label}"`);
    say(`          ${r.page} @ ${r.width}px`);
  }
  say('');
  process.exit(0);
}

/* A target whose centre the browser would not claim was never hit-tested, and
   the size recorded for it is its bounding rect -- the words, not the target.
   That is the exact error this script was written after, so it is counted and
   said out loud rather than folded into the pass. */
const untested = dedupe(all).filter(t => !t.hitTested);
if (untested.length) {
  /* Grouped by what they are, because the list is long and the shapes in it
     want different answers: a skip link is invisible until focused and cannot
     be probed by a pointer at all, which is correct behaviour, while anything
     else here has something sitting over its centre. */
  const groups = new Map();
  for (const t of untested) {
    const k = `${t.tag}${t.cls ? '.' + t.cls : ''}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  }
  say(`\n  ~ ${untested.length} target${untested.length === 1 ? '' : 's'} could not be hit-tested — the size recorded is the box, not the target:\n`);
  for (const [k, rows] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
    say(`      ${String(rows.length).padStart(4)} x  ${k}   e.g. "${rows[0].label}" — ${rows[0].page} @ ${rows[0].width}px`);
  }
  say('');
  say('    A skip link is hidden until focused, so a pointer never reaches it');
  say('    and no probe can: that one is correct and stays on the list rather');
  say('    than being quietly exempted. Anything else here has something over');
  say('    its centre, and an overlay that blocks a probe blocks a finger too.');
}

say('');
if (!fails.length) {
  say('  ✓ every target clears 2.5.8 Target Size (Minimum), 24x24');
  say(`    ${measured} measured across ${chosen.length} page${chosen.length === 1 ? '' : 's'} ` +
      `at ${WIDTHS.join(', ')}px${reachedCount ? `, plus ${reachedCount} reachable-state sweeps` : ''}`);
  say(`    ${byReason.size} by size, ${byReason.inline} inline in a sentence, ${byReason.spacing} by spacing`);
} else {
  const rows = dedupe(fails);
  say(`  ✗ ${rows.length} distinct target${rows.length === 1 ? '' : 's'} below 24x24 with no exception:\n`);
  for (const r of rows) {
    say(`      ${Math.round(r.w)} x ${Math.round(r.h)}  ${r.tag}${r.cls ? '.' + r.cls : ''}  "${r.label}"`);
    say(`        ${r.page} @ ${r.width}px  (display: ${r.display})`);
    say('');
  }
  say('    Either the target reaches 24x24, or it gets 24px of clear space');
  say('    around its centre, or it is inline in a sentence. 2.5.8 takes all');
  say('    three. Anything else is an argument to make in prose.');
}

/* A pass that depends on the air around it. These are undersized targets that
   conform only because nothing is near them, so they are one tightened margin
   from failing and the margin is usually changed for an unrelated reason.
   Same idea as resting.mjs naming the colors that clear their floor by under
   0.1: the verdict is a pass and the headroom is the finding. */
const spacingOnly = dedupe(all).filter(t => t.ok && t.why === 'spacing');
if (spacingOnly.length) {
  say(`\n  ! ${spacingOnly.length} undersized target${spacingOnly.length === 1 ? '' : 's'} conform only because nothing is near ${spacingOnly.length === 1 ? 'it' : 'them'}:\n`);
  for (const r of spacingOnly.slice(0, 20)) {
    say(`      ${Math.round(r.w)} x ${Math.round(r.h)}  ${r.tag}${r.cls ? '.' + r.cls : ''}  "${r.label}"`);
    say(`        ${r.page} @ ${r.width}px`);
  }
  if (spacingOnly.length > 20) say(`      +${spacingOnly.length - 20} more`);
  say('');
  say('    Conforming, and worth knowing: tightening the space around any of');
  say('    these breaks 2.5.8 without touching the target itself.');
}

/* The AAA bar, reported and never failed on. It is here because a number
   nobody measures is a number that gets asserted, which is the whole reason
   this script exists. */
if (enhanced) {
  const rows = dedupe(all).filter(t => !t.inSentence);
  const under = rows.filter(t => t.w < BIG || t.h < BIG);
  say(`\n  ● 2.5.5 Target Size (Enhanced), ${BIG}x${BIG} — AAA, reported only:\n`);
  say(`      ${rows.length - under.length} of ${rows.length} non-inline targets reach ${BIG}x${BIG}` +
      ` (${Math.round(100 * (rows.length - under.length) / rows.length)}%)`);
  const worst = under.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, 12);
  say('');
  for (const r of worst) {
    say(`      ${Math.round(r.w)} x ${Math.round(r.h)}  ${r.tag}${r.cls ? '.' + r.cls : ''}  "${r.label}"  —  ${r.page} @ ${r.width}px`);
  }
  say('');
  say('    This is AAA and the site does not claim it. Reported so the claim');
  say('    stays measured rather than remembered.');
}
say('');
process.exit(strict && fails.length ? 1 : 0);
