#!/usr/bin/env node
/* Every piece of text the site shows at rest, measured against its floor.
 *
 * This is the older and more fundamental of the two contrast checks, and until
 * now it was the one that was not in the repository. It lived in a session
 * scratchpad, which meant it disappeared with the container and could only be
 * run by whoever still had the file. A check nobody else can run is not a
 * check the repository has.
 *
 * WHAT IT ASKS, and how that differs from its sibling. states.mjs forces every
 * hover, focus and script-applied state and measures what a reader can REACH.
 * This measures what a reader can SEE without touching anything: every element
 * holding visible text, at rest, on the ground actually behind it. Neither
 * covers the other. A color can be perfect at rest and fail on hover; it can
 * also fail sitting still, which no amount of state-forcing will notice
 * because the resting color is the one state that is never forced.
 *
 * WHAT CHANGED IN THE MOVE. The scratchpad version read backgroundColor and
 * nothing else, so text over a photograph or a gradient was measured against
 * whatever transparent box happened to be nearest -- and it reported the home
 * page hero caption as 1:1, a total failure of a caption that is perfectly
 * legible. A wrong number is worse than no number: it trains you to skim past
 * the list. This one uses the shared ground(), which returns a REASON instead
 * of a color when an ancestor paints an image or a gradient, and those are
 * reported separately as unmeasurable rather than counted as failures.
 *
 * It also no longer stubs cdn.tailwindcss.com. The scratchpad version had to
 * intercept that request and inject a pre-built stylesheet, because six pages
 * compiled their CSS in the browser. They ship a built file now, so the stub
 * is gone and the pages load exactly as a reader gets them.
 *
 * WHAT CHANGED AGAIN. "Unmeasurable" used to be the end of the sentence, and
 * for the two hero captions it was the end of the story: the check named them,
 * passed, and the number anyone relied on lived in COLOR.md, measured by hand
 * against a still portrait. The portrait became a ten-second video and the
 * caption fell to 3.81:1 with nothing to notice. So the unmeasurable ones are
 * now tagged and measured the way COLOR.md S5 always said to -- hide the
 * glyphs, screenshot the box, take the WORST pixel -- at the three widths that
 * section names, seeking through eight points of any video behind them.
 *
 * IT NEEDS A BROWSER WITH H.264 to answer for text over video. Playwright's
 * bundled Chromium has none: it renders the poster instead, which measures
 * 7.04:1 where the clip measures 5.78:1. Rather than report the poster's
 * number, it says so and leaves the text unmeasured. Set CHROME to a full
 * Chrome build -- CI already prefers the image's google-chrome -- or accept
 * that those two lines go unchecked on that run.
 *
 * THE FLOORS are WCAG 1.4.3 and COLOR.md section 5, the same as states.mjs:
 * 4.5:1 for text under 24px (under 18.66px when bold), 3:1 at or above that.
 *
 *   node scripts/resting.mjs                  # every page
 *   node scripts/resting.mjs <page>           # just the ones matching
 *   node scripts/resting.mjs --strict         # exit 1 on any failure
 *   node scripts/resting.mjs --unmeasurable   # also list what it declined
 *   node scripts/resting.mjs --probes        # also list what it measured by pixel
 */
import path from 'node:path';
import { COLOR_TOOLKIT, findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';
import { decodePNG, pixels } from './lib/png.mjs';

const strict = process.argv.includes('--strict');
const showUnmeasurable = process.argv.includes('--unmeasurable');
const showProbes = process.argv.includes('--probes');
const only = pageFilters();
const root = resolveRoot('resting.mjs');
const say = (s = '') => console.log(s);

const chromium = loadChromium('resting.mjs');

/* ---------------------------------------------------------------------------
 * Runs inside the page. The color machinery arrives from lib/harness.mjs so
 * that both checks answer "what is behind this text" the same way.
 * ------------------------------------------------------------------------- */
const IN_PAGE = String.raw`
(() => {
${COLOR_TOOLKIT}

  /* Every element that directly holds visible text. "Directly" is the whole
     point: a wrapper's textContent is its children's, and the color that
     applies is the one on the node the glyphs are actually in. Measuring the
     wrapper reports its inherited color against a ground its children may
     have painted over. */
  function restingText() {
    const out = [];
    let probes = 0;
    for (const el of document.querySelectorAll('*')) {
      const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!direct) continue;
      if (visuallyHidden(el)) continue;

      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;

      const text = ownText(el);
      if (!text || text.length < 2) continue;

      /* The floor comes from the SMALLEST visible type the color lands on,
         not from the element the rule names -- a 32px heading with a 13px
         label inside it inheriting the same color is judged at 13px. */
      const { px, weight } = smallestText(el);
      const large = px >= 24 || (px >= 18.66 && weight >= 700);
      const floor = large ? 3 : 4.5;

      const sel = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/)[0]
        : el.tagName.toLowerCase();
      const rec = { sel, text: text.replace(/\s+/g, ' ').slice(0, 44), color: cs.color,
                    size: px + 'px', weight: String(weight), floor };

      const g = ground(el);
      if (g.unmeasurable) {
        /* Not a dead end any more. Computed style genuinely cannot answer here
           -- a scrim is a background-image, so backgroundColor reports
           transparent and walking up the tree finds the page ground, which is
           fiction. But COLOR.md S5 names the method that CAN answer: render
           it, hide the glyphs, and look at the pixels they were sitting on.
           Tag the element and let the node side go and do that. */
        el.setAttribute('data-resting-probe', String(probes));
        const box = el.getBoundingClientRect();
        const overlaps = (n) => {
          const q = n.getBoundingClientRect();
          return q.right > box.left && q.left < box.right && q.bottom > box.top && q.top < box.bottom;
        };
        const videos = [...document.querySelectorAll('video')].filter(overlaps).length;
        out.push({ ...rec, unmeasurable: g.unmeasurable, probe: probes, videos });
        probes += 1;
        continue;
      }

      /* Translucent ink is composited over the ground it sits on, or a
         half-opacity label reads as its own full-strength color. */
      const ink = parse(cs.color);
      const fg = ink.a < 1
        ? { r: ink.r * ink.a + g.color.r * (1 - ink.a),
            g: ink.g * ink.a + g.color.g * (1 - ink.a),
            b: ink.b * ink.a + g.color.b * (1 - ink.a) }
        : ink;

      out.push({ ...rec, ratio: +ratio(fg, g.color).toFixed(2) });
    }
    return out;
  }

  return { restingText };
})()
`;

/* ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * The pixel pass: what to do about text the computed style cannot reach.
 *
 * COLOR.md S5 has always specified this -- "render the page, hide the glyphs,
 * screenshot the box they occupied, and take the ratio against the lightest
 * pixel in it" -- and until now a person did it by hand, wrote the answer into
 * the document, and the answer went stale. The hero caption is the case in
 * point: S5 recorded 4.47:1, measured against a still portrait, and that
 * sentence is the reason nobody looked again after the portrait became a
 * ten-second video. Re-measured across the loop it was 3.81:1 at 390px.
 *
 * TWO THINGS THIS DOES THAT A HAND MEASUREMENT DID NOT.
 *
 * It samples the video rather than a frame of it. A still has one lightest
 * pixel; a loop has one per frame, and the brightest frame is the one that
 * matters. Eight seeks is not every frame, but it is enough to catch a lit
 * wall passing behind white type, which one screenshot is not.
 *
 * It measures at the three widths S5 names, because the caption box scales
 * with the circle while the type does not: the glyphs reach 44% of the box at
 * 1440 and 47% at 390, so they sit at a different point on the same gradient.
 * The narrow end was the worse one and would have been missed by measuring at
 * the viewport this script otherwise uses.
 *
 * The ratio is the WORST single pixel, not the mean. A mean of 16:1 is what
 * the caption scores while failing, because most of the box is dark hair.
 * ------------------------------------------------------------------------- */
const PROBE_WIDTHS = [390, 768, 1440];   // COLOR.md S5
const PROBE_FRAMES = 8;

const relLum = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lumOf = (p) => 0.2126 * relLum(p.r) + 0.7152 * relLum(p.g) + 0.0722 * relLum(p.b);
const ratioOf = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const parseColor = (c) => {
  const v = (c.match(/[\d.]+/g) || []).map(Number);
  return { r: v[0] || 0, g: v[1] || 0, b: v[2] || 0, a: v.length > 3 ? v[3] : 1 };
};

/* Worst ratio between this ink and any pixel in the shot, with translucent ink
   composited over each pixel the way it actually renders over it. */
function worstAgainst(img, ink) {
  let worst = Infinity, at = null;
  for (const p of pixels(img)) {
    const fg = ink.a < 1
      ? { r: ink.r * ink.a + p.r * (1 - ink.a),
          g: ink.g * ink.a + p.g * (1 - ink.a),
          b: ink.b * ink.a + p.b * (1 - ink.a) }
      : ink;
    const r = ratioOf(fg, p);
    if (r < worst) { worst = r; at = p; }
  }
  return { worst, at };
}

async function seekVideos(page, frac) {
  await page.evaluate(async (f) => {
    const vs = [...document.querySelectorAll('video')];
    await Promise.all(vs.map((v) => new Promise((done) => {
      if (!v.duration || !isFinite(v.duration)) return done();
      const h = () => { v.removeEventListener('seeked', h); done(); };
      v.addEventListener('seeked', h);
      try { v.pause(); v.currentTime = f * v.duration; } catch { done(); }
      setTimeout(done, 700);
    })));
  }, frac);
}

async function measureProbes(page, records) {
  const probes = records.filter((r) => r.probe !== undefined);
  if (!probes.length) return;

  for (const rec of probes) {
    const ink = parseColor(rec.color);
    let worst = Infinity, where = null;

    for (const width of PROBE_WIDTHS) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(250);

      const sel = `[data-resting-probe="${rec.probe}"]`;
      const el = await page.$(sel);
      if (!el) continue;

      /* If a video is behind this text, refuse to answer unless it actually
         decoded. Playwright's bundled Chromium ships without H.264, so it
         renders the poster and nothing else -- and the poster is a still,
         which is the exact thing whose measurement went stale in the first
         place. Measuring it would produce a number that passes: 7.04:1 here
         against the 5.78:1 the real clip gives. A check that measures the
         wrong thing and reports success is worse than one that says it
         cannot look. */
      if (rec.videos > 0) {
        const decoded = await el.evaluate((n) => {
          const box = n.getBoundingClientRect();
          return [...document.querySelectorAll('video')].some((v) => {
            const q = v.getBoundingClientRect();
            const over = q.right > box.left && q.left < box.right && q.bottom > box.top && q.top < box.bottom;
            return over && v.readyState >= 2 && isFinite(v.duration) && v.duration > 0;
          });
        });
        if (!decoded) { rec.codecMissing = true; continue; }
      }
      const size = await el.evaluate((n) => {
        const b = n.getBoundingClientRect();
        const cs = getComputedStyle(n);
        return { w: b.width, h: b.height, shown: cs.display !== 'none' && cs.visibility !== 'hidden' };
      });
      if (!size.shown || size.w < 1 || size.h < 1) continue;

      /* Hide the glyphs, and every glyph inside them, so the shot is the
         ground alone. text-shadow goes too: a shadow is ink by another name
         and would darken the very pixels being sampled. */
      await page.addStyleTag({
        content: `${sel}, ${sel} * { color: transparent !important; text-shadow: none !important; }`,
      });

      const frames = rec.videos > 0 ? PROBE_FRAMES : 1;
      for (let i = 0; i < frames; i++) {
        if (rec.videos > 0) await seekVideos(page, i / frames);
        let shot;
        try { shot = await el.screenshot(); } catch { continue; }
        const { worst: w, at } = worstAgainst(decodePNG(shot), ink);
        if (w < worst) {
          worst = w;
          where = { width, frame: rec.videos > 0 ? i : null, pixel: at };
        }
      }

      await page.evaluate(() => {
        const tags = [...document.querySelectorAll('style')];
        const last = tags[tags.length - 1];
        if (last && last.textContent.includes('data-resting-probe')) last.remove();
      });
    }

    await page.setViewportSize({ width: 1440, height: 1000 });

    if (rec.codecMissing) {
      rec.unmeasurable = 'text over video, and this browser has no codec for it';
      continue;
    }
    if (worst === Infinity) continue;          // never laid out: stays unmeasurable
    delete rec.unmeasurable;
    rec.ratio = +worst.toFixed(2);
    rec.byPixels = where;
  }
}

const { server, origin } = await serve(root);

const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

const failures = [];
const unmeasurable = [];
const thin = [];
const byPixels = [];   // answered by looking at the rendered pixels, not computed style
const moving = [];   // still repainting a color when measured, so sampled mid-flight
let checked = 0;

const page = await ctx.newPage();
const chosen = pages(root).filter((f) => !only.length || only.some((o) => f.includes(o)));

if (!chosen.length) {
  say(`\n  Nothing matches ${only.join(', ')}. The pages are:\n`);
  for (const p of pages(root)) say('    ' + p);
  say('');
  await browser.close(); server.close();
  process.exit(2);
}

for (const file of chosen) {
  /* 'load' rather than 'domcontentloaded': stylesheets are not parsed at
     DOMContentLoaded, and a page measured before its CSS arrives reports the
     browser's defaults as the site's colors. */
  await page.goto(`${origin}/${file}`, { waitUntil: 'load' });

  /* A web font that swaps in after measurement changes the size the floor is
     chosen from, which can move a 4.5 case to a 3 case or back. */
  await page.evaluate(() => document.fonts.ready);

  /* Then wait out the page's own animation, which is the same lesson states.mjs
     learned one element at a time, applied to the whole page. Reading straight
     after load gives the color on its way to the answer, not the answer:
     .story-progress-num carries transition: color 0.5s and reads rgb(89,100,87)
     at load, settling to rgb(85,107,81) about a second later.

     Sampling mid-transition makes every number depend on how fast the machine
     is. This script's first version reported 3317 measurements here and 3320 on
     a CI runner from the same commit, and called one element 4.95:1 that CI saw
     as 4.6:1 -- close enough to the 4.5 floor that a slower runner could have
     failed a color that is fine. A check whose count moves with the hardware
     cannot be watched for drift, which is the one thing this repository asks of
     its checks.

     Endless animations are excluded rather than awaited, because their .finished
     never resolves; the cap catches anything else pathological.

     What is still moving afterward is then filtered by WHAT it animates. The
     home page keeps 27 endless animations running, and every one of them
     animates transform -- they cannot change a color, so reporting them would
     be a warning that fires on every run and means nothing, which is how a
     reader learns to skip the whole section. Only motion that could move a
     measurement is worth a line. */
  const stillMoving = await page.evaluate(async () => {
    const timing = (a) => (a.effect && a.effect.getTiming ? a.effect.getTiming() : null);
    const endless = (a) => { const t = timing(a); return !t || t.iterations === Infinity; };
    await Promise.race([
      Promise.allSettled(document.getAnimations().filter((a) => !endless(a)).map((a) => a.finished)),
      new Promise((r) => setTimeout(r, 2500)),
    ]);

    /* Anything that can repaint an ink or a ground. transform and the like
       move a box around without changing what color it is. */
    const MATTERS = /color|background|opacity|filter|border|box-shadow|text-decoration/i;
    const props = new Set();
    for (const a of document.getAnimations()) {
      if (a.playState !== 'running') continue;
      if (a.transitionProperty) { if (MATTERS.test(a.transitionProperty)) props.add(a.transitionProperty); continue; }
      const kfs = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : [];
      for (const k of kfs) {
        for (const key of Object.keys(k)) {
          if (['offset', 'computedOffset', 'easing', 'composite'].includes(key)) continue;
          if (MATTERS.test(key)) props.add(key);
        }
      }
    }
    return [...props];
  });
  if (stillMoving.length) moving.push({ file, props: stillMoving });

  const results = await page.evaluate(`(${IN_PAGE}).restingText()`);
  await measureProbes(page, results);

  for (const r of results) {
    checked += 1;
    if (r.byPixels) byPixels.push({ file, ...r });
    if (r.unmeasurable) unmeasurable.push({ file, ...r });
    else if (r.ratio < r.floor - 0.005) failures.push({ file, ...r });
    else if (r.ratio - r.floor < 0.1) thin.push({ file, ...r });
  }
}

await browser.close();
server.close();

say('');
if (!failures.length) {
  say('  ✓ every resting color clears its floor');
  say(`    ${checked} measurements across ${chosen.length} ` +
      `page${chosen.length === 1 ? '' : 's'}${only.length ? ' matching ' + only.join(', ') : ''}`);
} else {
  say(`  ✗ ${failures.length} below the floor at rest:\n`);
  for (const f of failures) {
    say(`      ${f.file}`);
    say(`        ${f.sel}`);
    say(`        ${f.ratio}:1 against ${f.floor} — ${f.color} at ${f.size}/${f.weight}`);
    say(`        "${f.text}"`);
    say('');
  }
}

if (thin.length) {
  say(`\n  ! ${thin.length} pass with under 0.1 to spare — a ground change away from failing:\n`);
  for (const t of thin) say(`      ${t.file}  ${t.sel}  ${t.ratio}:1 against ${t.floor}`);
  say('');
}

/* Counted and named, never silently dropped. Text on a gradient or a
   photograph cannot be answered from computed style, and the honest report is
   that the question was declined -- not a number that looks like an answer.
   The scratchpad version guessed here, and its guess was 1:1 on a caption
   anybody can read. */
/* Anything still in motion when it was read is named, because its number is a
   snapshot of a moving thing and the reader deserves to know which ones. */
if (moving.length) {
  say(`  ~ still repainting when measured on ${moving.length} ` +
      `page${moving.length === 1 ? '' : 's'} — those colors are a snapshot:\n`);
  for (const m of moving) say(`      ${m.file}  ${m.props.join(', ')}`);
  say('');
}

/* Said out loud, because these are the numbers no other check can produce and
   the ones a reader is most entitled to be skeptical of. The count belongs in
   the summary for the same reason every other count does: if it drops to zero
   one day, something stopped being looked at. */
if (byPixels.length) {
  say(`  ● ${byPixels.length} measured against the artwork behind it` +
      `${showProbes ? ':' : ' (--probes to list them)'}`);
  if (showProbes) {
    say('');
    for (const b of byPixels) {
      const at = b.byPixels;
      say(`      ${b.file}  ${b.sel}  "${b.text}"`);
      say(`        ${b.ratio}:1 against ${b.floor} — worst pixel rgb(${at.pixel.r}, ${at.pixel.g}, ${at.pixel.b})` +
          ` at ${at.width}px${at.frame === null ? '' : `, frame ${at.frame + 1} of ${PROBE_FRAMES}`}`);
    }
  }
  say('');
}

if (unmeasurable.length) {
  say(`  ~ ${unmeasurable.length} cannot be measured from computed style` +
      `${showUnmeasurable ? ':' : ' (--unmeasurable to list them)'}`);
  if (showUnmeasurable) {
    say('');
    for (const u of unmeasurable) say(`      ${u.file}  ${u.sel}  ${u.unmeasurable}  "${u.text}"`);
  }
  say('');
}

process.exit(strict && failures.length ? 1 : 0);
