#!/usr/bin/env node
/* Does every color still clear its floor once the pointer, the keyboard or a
 * script changes it?
 *
 *   node scripts/states.mjs                  report on every page
 *   node scripts/states.mjs design-system    only pages whose path matches
 *   node scripts/states.mjs --strict         exit 1 if anything fails a floor
 *   node scripts/states.mjs --list           show the states it found, and stop
 *
 * WHY. A contrast audit that reads the page as loaded is measuring about half
 * the site. Three real failures got past exactly that kind of check:
 *
 *   - The case-study table-of-contents link. Its active state was a sage that
 *     read 4.51:1 where its siblings read 15.33:1. `is-active` is applied by
 *     the scroll handler, so it is not in the loaded DOM and nothing saw it.
 *   - `.case-card:hover h3`. Hover exists only under a pointer.
 *   - The reference page's engagement eyebrow, 12px accent-deep at 4.51:1 —
 *     that one WAS static, and passed by a hundredth, which is its own lesson:
 *     a pass with no headroom is a finding waiting for a ground change.
 *
 * All three were found by hand, by grepping for a token and measuring what
 * turned up. This is that search, done properly and repeatably.
 *
 * HOW IT DECIDES WHAT TO FORCE. It does not carry a list of states. A list
 * goes stale the first time someone adds a hover. Instead it reads the site's
 * own stylesheets through the CSSOM, keeps every rule whose selector carries a
 * state AND whose body sets a color, and forces exactly those. Add a
 * `:focus-visible` rule tomorrow and this finds it without being told.
 *
 * A state is forced by rewriting the rule rather than by driving the mouse:
 * `a:hover` is re-inserted as `a.__force-hover` in a stylesheet appended last.
 * Specificity is unchanged — a pseudo-class and a class both count (0,1,0) —
 * so the copy wins on order, and one class on one element turns the state on
 * with no pointer and no scrolling. That is what makes checking a few hundred
 * elements per page affordable.
 *
 * IT WAITS FOR THE TRANSITION. Reading straight after applying a class gives
 * you the color on its way to the answer, not the answer. That mistake made
 * the TOC link look like it PASSED at 6.47:1 when it settles at 4.51:1. Every
 * measurement here waits out the element's own transition-duration and delay.
 *
 * WHAT IT REFUSES TO GUESS. Text on a photograph or a gradient cannot be
 * measured from computed style: a gradient is a background-image, so
 * backgroundColor reports transparent, the walk up the tree finds the page
 * ground, and you get a confident, wrong number — the hero caption audits as
 * white-on-white, 1:1, and is in fact fine. Those are reported as UNMEASURABLE
 * with the reason, never as a ratio. Check them by sampling pixels instead.
 *
 * THE FLOORS are WCAG 1.4.3 and 1.4.11, and COLOR.md section 5 is normative:
 * 4.5:1 for text under 24px (under 18.66px when bold), 3:1 at or above that
 * and for the boundary of a control.
 */
import path from 'node:path';
import { COLOR_TOOLKIT, findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';

const strict = process.argv.includes('--strict');
const listOnly = process.argv.includes('--list');
/* Any non-flag argument narrows the run to pages whose path contains it, so
   `node scripts/states.mjs design-system` checks one page in seconds rather
   than eighteen in minutes. Whoever just edited a page is the reader most
   likely to want this. */
const only = pageFilters();
const root = resolveRoot('states.mjs');

const chromium = loadChromium('states.mjs');

const say = (s = '') => console.log(s);

/* ---------------------------------------------------------------------------
 * Everything below this line runs inside the page.
 * ------------------------------------------------------------------------- */
const IN_PAGE = String.raw`
(() => {
  const PSEUDO = ['hover', 'focus-visible', 'focus', 'active'];
  const COLOR = ['color', 'background-color', 'border-color', 'border-top-color',
                  'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color'];

  /* The longhands above are not enough, and the gap widens as the code
     improves. A shorthand holding a var() cannot be decomposed in the CSSOM.
     Written with a hex, outline:2px solid #657D60 fills outline-color; written
     with a token, outline:2px solid var(--color-accent-deep) leaves it EMPTY
     while the shorthand keeps the text. Reading longhands alone therefore goes
     blind to exactly the rules that have been tokenized properly -- tokenizing
     the email popover dropped this script from 416 rules to 398 without
     changing a single rendered color.

     So the shorthands are read too, and any value carrying a var() or a color
     literal counts. Over-including is free: a rule with no color in it simply
     measures the resting color and passes. */
  const SHORTHAND = ['outline', 'background', 'border', 'border-top', 'border-right',
                     'border-bottom', 'border-left', 'box-shadow', 'text-decoration'];
  const CARRIES_COLOR = /var\(|#[0-9a-f]{3}|rgb|hsl|currentcolor|transparent/i;

  /* A state class is one a script toggles, matched on shape rather than from a
     list so a new one is found without being added here.

     is- and has- only. NOT the site's ah- prefix: that is a component
     namespace, so matching it pulled in .ah-emailpop-title and every other
     part of the email popover as though each were a state. A prefix that
     names a component is not a prefix that names a state. The bare words are
     the handful of state classes the site sets without a prefix. */
  const STATE_CLASS = /\.((?:is|has)-[a-z0-9-]+|revealed|is-inview|logo-reveal)\b/;

${COLOR_TOOLKIT}

  /* Read every rule the page loaded, and keep the ones that put a color behind
     a state. Cross-origin sheets throw on .cssRules; the site's are all local. */
  function stateRules() {
    const found = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      walk(rules, found);
    }
    return found;
  }
  /* Descend on LENGTH, never on the property. A CSSStyleRule carries a
     cssRules property too -- an empty list, which is an object, which is
     truthy. Testing the property alone therefore treats every ordinary rule as
     a group and skips it: this walker saw 0 of 540 rules until it counted. */
  function walk(rules, found) {
    for (const rule of rules) {
      if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules, found);
      if (!rule.selectorText || !rule.style) continue;
      const sets = COLOR.some(p => rule.style.getPropertyValue(p))
        || SHORTHAND.some(p => CARRIES_COLOR.test(rule.style.getPropertyValue(p)));
      if (!sets) continue;
      for (const sel of rule.selectorText.split(',').map(s => s.trim())) {
        const pseudo = PSEUDO.find(p => sel.includes(':' + p));
        const cls = sel.match(STATE_CLASS);
        if (pseudo) found.push({ sel, kind: 'pseudo', state: pseudo });
        else if (cls) found.push({ sel, kind: 'class', state: cls[1] });
      }
    }
    return found;
  }

  /* Force a state by re-inserting the rule with the pseudo swapped for a class.
     Specificity is unchanged — :hover and .x both count (0,1,0) — so the copy
     wins on order alone. */
  function forceSheet(rules) {
    const css = [];
    for (const { sel, kind, state } of rules) {
      if (kind !== 'pseudo') continue;
      css.push(sel.split(':' + state).join('.__force-' + state));
    }
    return css;
  }

  return { PSEUDO, stateRules, forceSheet, ground, ratio, visuallyHidden, ownText, smallestText, textNodesIn };
})()
`;

/* ------------------------------------------------------------------------- */

const { server, origin } = await serve(root);

const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

/* Nothing off this machine. Webfonts do not change a color, and font-size is
 * set by CSS whichever family resolves, so the size that picks the floor is the
 * same either way. Blocking them makes the run hermetic and fast — and stops
 * `document.fonts.ready` hanging forever behind a request that cannot complete,
 * which is what it does on a machine with no route to Google Fonts. */
await ctx.route(/^https?:/, r => {
  const u = new URL(r.request().url());
  return u.hostname === '127.0.0.1' ? r.continue() : r.abort();
});

const page = await ctx.newPage();

const failures = [];
const unmeasurable = [];
const thin = [];          // passes by less than 0.1 — a ground change away from failing
let checked = 0, statesFound = 0;
const list = [];

const chosen = pages(root).filter(f => !only.length || only.some(o => f.includes(o)));
if (!chosen.length) {
  console.error(`\n  No page matches ${only.join(', ')}. Known pages:\n`);
  for (const p of pages()) console.error('    ' + p);
  console.error('');
  server.close(); await browser.close();
  process.exit(2);
}
for (const file of chosen) {
  await page.goto(origin + '/' + file.split(path.sep).join('/'), { waitUntil: 'load' });
  /* Raced, not awaited outright: a blocked font request can leave fonts.ready
     pending forever, and a layout with fallback metrics still reports the right
     font-size. */
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]));

  const found = await page.evaluate(`(${IN_PAGE}).stateRules()`);
  statesFound += found.length;
  if (listOnly) { for (const f of found) list.push(`${file}  ${f.state.padEnd(14)} ${f.sel}`); continue; }
  if (!found.length) continue;

  /* Install the forcing stylesheet once per page. */
  await page.evaluate(([src, rules]) => {
    const api = eval(src);
    const css = api.forceSheet(rules);
    if (!css.length) return;
    const s = document.createElement('style');
    s.id = '__force';
    s.textContent = css.map(sel => sel + '{}').join('\n');
    document.head.appendChild(s);
    /* Re-declare each forced rule with the ORIGINAL declarations, so the copy
       actually carries the colors rather than an empty body. */
    const out = [];
    for (const sheet of document.styleSheets) {
      let rs; try { rs = sheet.cssRules; } catch { continue; }
      const stack = [...rs];
      while (stack.length) {
        const r = stack.shift();
        if (r.cssRules && r.cssRules.length) stack.push(...r.cssRules);
        if (!r.selectorText || !r.style) continue;
        for (const p of ['hover', 'focus-visible', 'focus', 'active']) {
          if (r.selectorText.includes(':' + p)) {
            out.push(r.selectorText.split(':' + p).join('.__force-' + p) + '{' + r.style.cssText + '}');
          }
        }
      }
    }
    s.textContent = out.join('\n');
  }, [IN_PAGE, found]);

  const results = await page.evaluate(async ([src, rules]) => {
    const api = eval(src);
    const out = [];
    const settle = (el) => {
      const cs = getComputedStyle(el);
      const ms = (v) => Math.max(0, ...String(v).split(',').map(x => parseFloat(x) * (x.includes('ms') ? 1 : 1000) || 0));
      return Math.min(1200, ms(cs.transitionDuration) + ms(cs.transitionDelay) + 60);
    };
    const wait = (t) => new Promise(r => setTimeout(r, t));

    for (const { sel, kind, state } of rules) {
      /* A class in the markup is a VARIANT; a class a script adds is a STATE.
         Telling them apart matters, and the shape of the name does not do it:
         .ds-demo.is-dark and .case-toc-inner a.is-active look identical and are
         nothing alike. is-dark is authored on the demos that want a charcoal
         ground; forcing it onto the ones that do not paints a dark ground
         behind light-ground ink and invents a state no reader can reach. That
         produced 29 confident failures on the reference page, every one of them
         a half-applied state of this script's own making.

         So: if any element on the page already carries the class, it is a
         variant -- measure the elements that HAVE it, exactly as they are. Only
         a class nobody carries gets forced onto the ones that match the rest of
         the selector. Pseudo-classes are always forced; no markup can hold one. */
      const authored = kind === 'class' && document.querySelector('.' + CSS.escape(state));
      const base = kind === 'pseudo'
        ? sel.split(':' + state).join('')
        : sel.replace(new RegExp('\\.' + state.replace(/[-]/g, '\\-') + '\\b'), '');
      let els;
      try { els = [...document.querySelectorAll(authored ? sel : (base || '*'))].slice(0, 12); } catch { continue; }

      for (const el of els) {
        /* Already in the state, so nothing to add and nothing to undo. */
        const marker = authored ? null : (kind === 'pseudo' ? '__force-' + state : state);
        if (marker) { el.classList.add(marker); await wait(settle(el)); }

        /* Measure the nodes that actually hold text, not the element the rule
           names. A card that inverts on hover sets a dark ground on ITSELF and
           light ink on its CHILDREN: read the container and you compare its
           unchanged charcoal against its new dark background and report a
           1.43:1 failure that no reader could ever see. Ten of those was this
           script's first result. */
        for (const node of api.textNodesIn(el)) {
          const text = api.ownText(node);
          if (!text || text.length < 2) continue;
          const cs = getComputedStyle(node);
          const g = api.ground(node);
          const { px, weight } = api.smallestText(node);
          const large = px >= 24 || (px >= 18.66 && weight >= 700);
          const floor = large ? 3 : 4.5;
          const rec = { sel, state, text: text.replace(/\s+/g, ' ').slice(0, 40),
                        color: cs.color, size: px + 'px', weight: String(weight), floor };
          if (g.unmeasurable) out.push({ ...rec, unmeasurable: g.unmeasurable });
          else {
            const fg = (c => { const v = c.match(/[\d.]+/g).map(Number); return { r: v[0], g: v[1], b: v[2] }; })(cs.color);
            out.push({ ...rec, ratio: +api.ratio(fg, g.color).toFixed(2) });
          }
        }
        if (marker) el.classList.remove(marker);
      }
    }
    return out;
  }, [IN_PAGE, found]);

  for (const r of results) {
    checked += 1;
    if (r.unmeasurable) unmeasurable.push({ file, ...r });
    else if (r.ratio < r.floor) failures.push({ file, ...r });
    else if (r.ratio - r.floor < 0.1) thin.push({ file, ...r });
  }
}

await browser.close();
server.close();

if (listOnly) {
  say(`\n  ${list.length} state rules that set a color:\n`);
  for (const l of list) say('    ' + l);
  say('');
  process.exit(0);
}

say('');
if (!failures.length) {
  say(`  ✓ every forced state clears its floor`);
  say(`    ${checked} measurements across ${statesFound} state rules` +
      `, ${chosen.length} page${chosen.length === 1 ? '' : 's'}${only.length ? ' matching ' + only.join(', ') : ''}`);
} else {
  say(`  ✗ ${failures.length} state(s) below the floor:\n`);
  for (const f of failures) {
    say(`      ${f.file}`);
    say(`        ${f.sel}  [:${f.state}]`);
    say(`        ${f.ratio}:1 against ${f.floor} — ${f.color} at ${f.size}/${f.weight}`);
    say(`        "${f.text}"`);
    say('');
  }
}
if (thin.length) {
  say(`\n  ! ${thin.length} pass with under 0.1 to spare — a ground change away from failing:\n`);
  for (const t of thin) say(`      ${t.file}  ${t.sel} [:${t.state}]  ${t.ratio}:1 against ${t.floor}`);
}
if (unmeasurable.length) {
  say(`\n  ~ ${unmeasurable.length} cannot be measured from computed style:\n`);
  for (const u of unmeasurable) say(`      ${u.file}  ${u.sel} [:${u.state}]  ${u.unmeasurable}`);
  say(`\n    A gradient or image is a background-image, so backgroundColor reads`);
  say(`    transparent and any composited number would be fiction. Sample pixels:`);
  say(`    render the page, hide the glyphs, screenshot the box they occupied and`);
  say(`    take the ratio against the lightest pixel in it.`);
}
say('');
process.exit(strict && failures.length ? 1 : 0);
