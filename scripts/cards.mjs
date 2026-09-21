#!/usr/bin/env node
/* Does a card on a ground have an edge a reader can see?
 *
 * WHAT THIS IS ABOUT. The cockpit's stale-hours note is a white card raised on
 * the close call's muted-light, and it shipped with `border: 1px solid
 * var(--rule-hairline)` and a comment in the stylesheet explaining that the
 * hairline is the card-edge token. There was no edge on the screen. The note
 * read as a white shape with no boundary at all, in a capture on a case study,
 * live, for nine days.
 *
 * WHY. `--rule-hairline` is charcoal at 10%, and a border composites against
 * the element's OWN background before it composites against anything else --
 * `background-clip` is `border-box`, so the card's opaque white is painted
 * under the border area. A charcoal tint over white is #e9e9e9 and stays
 * #e9e9e9 whatever the card is sitting on. On the white page that is a
 * hairline. On --color-muted-light it is 1.04:1: a border in the stylesheet,
 * a border in the computed style, and nothing a reader can see.
 *
 * That is why this is rendered rather than grepped. Every one of these cases
 * looks correct in the CSS -- the token is a rule token, the width is 1px, the
 * declaration is right there. The defect is only visible once you know the
 * card's fill AND the ground behind it, which is three elements apart in the
 * markup and a composite operation away from either.
 *
 * THE OTHER MECHANISM, AND WHY THE CHECK DOES NOT NAME ONE. #255 took the
 * opaque borders off the cockpit's cards and gave them `--shadow-card`, whose
 * first layer is a 1px ring of the same charcoal-at-10%. A ring is painted
 * outside the border box, so unlike a border it composites over the GROUND
 * rather than over the card's own fill -- a different operation, a different
 * number, and on --color-warm it lands at 1.11:1 where the border landed at
 * 1.09. Both are under the floor. So this check asks what is drawn and what it
 * measures, never which property drew it: a keyline, a border, a ring or an
 * outline all answer, and a fill that separates on its own answers by needing
 * none. It takes no position on which of those the site should use.
 *
 * WHAT IT SAYS TODAY. It named 13 surfaces on the cockpit when it was merged;
 * making --shadow-card's ring opaque took that to 5, because every card that
 * carries an elevation got its edge from the token. The 4 that are left carry
 * no elevation at all -- .ck-lead and .ck-status, tinted zones rather than
 * cards, with nothing drawing an outline -- and a zone should not take a
 * card's drop shadow to earn one. (It was 5 until the cockpit's checklist
 * panel came out; a surface that stops existing is the one other way this
 * number goes down.) That is still open, which is why this is
 * still not a step in checks.yml: a workflow with a known-red leg tells you
 * nothing about the commit that turned it red. Run it by hand, and wire it in
 * the day it passes.
 *
 * WHAT IT ASKS, per surface: this element is opaque, rounded and painted a
 * different color from the ground behind it, so it is a card on a ground.
 * Does anything draw its outline, and does that outline read? The edge is
 * measured where it is actually painted -- over the card's own fill -- against
 * the ground it has to separate from. The floor is 1.2:1, which is not a WCAG
 * number and does not pretend to be: a card edge is decorative and answers to
 * no success criterion. It is the level below which the site's own quiet
 * hairline, --color-tag-border on white at 1.22:1, stops being a line.
 *
 * WHAT IT DOES NOT ASK. A fill clearing 3:1 against its ground is its own
 * boundary and needs no edge -- a charcoal device mockup on warm is 12.24:1,
 * and a grey hairline down the side of a drawn phone is a line on a picture of
 * an object. Those are skipped rather than passed, and counted separately, so
 * the number says how much of the page was exempt rather than hiding it.
 *
 * States are driven, not just measured at rest, for the reason lib/reachable
 * exists: the note this check was written for is in no DOM until a scenario
 * button is pressed, so a resting scan would have said "✓" about the page
 * that carried the defect.
 *
 * Exit 0 when every card on a ground has an edge that reads, 1 with the list
 * when one does not, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/cards.mjs            every page
 *   node scripts/cards.mjs <page>     just the ones matching
 *   node scripts/cards.mjs --exempt   also list the fills that need no edge
 */
import { findChrome, loadChromium, pageFilters, pages, resolveRoot, serve } from './lib/harness.mjs';
import { reach, reachableFor } from './lib/reachable.mjs';

const root = resolveRoot('cards.mjs');
const only = pageFilters();
const showExempt = process.argv.includes('--exempt');
const say = (s = '') => console.log(s);

const chromium = loadChromium('cards.mjs');
const { server, origin } = await serve(root);
const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route(/^https?:/, r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await ctx.newPage();

/* THE FLOOR, and the two thresholds around it.
 *
 *   EDGE_FLOOR   1.2   below this an edge is not a line. --color-tag-border on
 *                      white is 1.22 and is the quietest the site draws.
 *   FILL_EXEMPT  3.0   at or above this the fill separates itself and the card
 *                      needs no outline at all.
 *
 * Between them is the whole population this check has an opinion about. */
const EDGE_FLOOR = 1.2;
const FILL_EXEMPT = 3;

/* THE FOUR SURFACES THAT ARE NOT CARDS, curated by hand and deliberately
 * outside the pages, exactly as the registries in counts.mjs, tokens.mjs and
 * lib/reachable.mjs are. A class the page could add to opt itself out is a
 * check the page gets to switch off.
 *
 * Every entry is a shape the rule genuinely does not reach, not a failure
 * being waved through. Three of them are on the design system page, and they
 * are the reason this list exists at all: that page's job is to SHOW the
 * grounds, and an edge drawn round a swatch is the page reporting a color the
 * palette does not have. The fourth is a thumbnail's backing color, which no
 * reader ever sees uncovered.
 *
 * Keep it short. The next entry is much more likely to be a card someone did
 * not want to fix than a fifth genuine exception. */
const NOT_CARDS = [
  { sel: 'li.ds-surface',
    why: 'a ground swatch: its whole job is to be that ground, undrawn' },
  { sel: 'div.ds-demo.is-warm',
    why: 'the stage a component specimen stands on, painted to show the ground under it' },
  { sel: 'div.ds-rv',
    why: 'three abstract tiles demonstrating the stagger; the motion is the specimen' },
  { sel: 'div.case-thumb',
    why: 'the color behind a 16:9 thumbnail that covers it; visible only mid-load' },
];
const notACard = (sel) => NOT_CARDS.find((n) => n.sel === sel);

/* Small, image-backed or barely-rounded boxes are not cards. The size floor is
 * the one judgement call here and it is deliberately generous: a 120x40 box is
 * already bigger than any chip, tag or pill on the site, and every real card is
 * far over it. The radius floor of 8px is under the smallest the site uses on a
 * card (10px, .build-era-art) and over the largest it uses on a control. */
const IN_PAGE = String.raw`
(() => {
  const parse = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
  };
  /* Where a color is actually painted: over whatever is under it. */
  const over = (fg, bg) => fg.rgb.map((v, i) => Math.round(fg.a * v + (1 - fg.a) * bg[i]));
  const lum = (c) => {
    const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
  };
  const same = (a, b, tol) => a.every((v, i) => Math.abs(v - b[i]) <= tol);

  /* Controls answer to their own rules -- a button's boundary is a 3:1
     question under WCAG 1.4.11, not a card-edge question. */
  const SKIP = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG', 'SVG', 'LABEL', 'SUMMARY', 'IFRAME']);

  const out = [];
  let surfaces = 0, exempt = [];
  for (const el of document.querySelectorAll('body *')) {
    if (SKIP.has(el.tagName) || el.closest('svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.backgroundImage !== 'none') continue;

    const fill = parse(cs.backgroundColor);
    if (!fill || fill.a < 0.9) continue;                 // not an opaque surface
    const radius = Math.max(...['borderTopLeftRadius', 'borderTopRightRadius',
      'borderBottomLeftRadius', 'borderBottomRightRadius'].map((k) => parseFloat(cs[k]) || 0));
    if (radius < 8 || radius > 400) continue;            // not rounded, or a pill

    const rect = el.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 40) continue;  // not a card

    /* The ground is the nearest ancestor that actually paints. */
    let ground = null;
    for (let n = el.parentElement; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.9) { ground = c.rgb; break; }
    }
    if (!ground || same(fill.rgb, ground, 2)) continue;  // same ground: not raised

    const sel = el.tagName.toLowerCase() +
      (typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');

    surfaces += 1;
    const fillReads = ratio(fill.rgb, ground);
    if (fillReads >= ${FILL_EXEMPT}) { exempt.push({ sel, fillReads }); continue; }

    /* A border on all four sides, or an inset/outset 1px ring. Either draws
       the outline; a partial border is curves.mjs's question, not this one. */
    let edge = null, kind = null, declared = null;
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map((s) => parseFloat(cs['border' + s + 'Width']) || 0);
    if (bw.every((w) => w > 0)) {
      const c = parse(cs.borderTopColor);
      if (c && c.a > 0) { edge = over(c, fill.rgb); kind = 'border ' + bw[0] + 'px'; declared = cs.borderTopColor; }
    }
    if (!edge) {
      const m = cs.boxShadow.replace(/\s+/g, ' ').match(/(rgba?\([^)]*\)) 0px 0px 0px (\d+(?:\.\d+)?)px/);
      if (m) {
        const c = parse(m[1]);
        if (c && c.a > 0) { edge = over(c, fill.rgb); kind = 'ring ' + m[2] + 'px'; declared = m[1]; }
      }
    }

    const reads = edge ? ratio(edge, ground) : 0;
    if (edge && reads >= ${EDGE_FLOOR}) continue;

    out.push({
      sel, radius,
      fill: fill.rgb.join(','), ground: ground.join(','), fillReads,
      kind: kind || 'none', declared: declared || '', painted: edge ? edge.join(',') : '', reads,
    });
  }
  return { out, surfaces, exempt };
})()`;

const chosen = pages(root).filter((f) => !only.length || only.some((o) => f.includes(o)));
if (!chosen.length) {
  console.error(`\n  No page matches ${only.join(', ')}.\n`);
  server.close(); await browser.close(); process.exit(2);
}

const found = new Map();
const exemptSeen = new Map();
/* Every entry starts unreached and is struck off when the sweep meets it. One
   still standing at the end of an UNSCOPED run is a registry line about a
   surface that no longer exists, which is the quiet way an exemption list
   turns into a list of things nobody checks. Same reasoning as reach()
   throwing on a dead selector.
   Only unscoped, because a run aimed at one page is expected to miss most of
   them, and a guard that fires on every scoped run is a guard people learn
   to pass a flag around. */
const unreached = new Set(NOT_CARDS.map((n) => n.sel));
let scanned = 0, surfaces = 0, reached = 0;

async function scan(rel, state) {
  await page.goto(`${origin}/${rel}`, { waitUntil: 'load' });
  if (state) await reach(page, state);
  const r = await page.evaluate(IN_PAGE);
  surfaces += r.surfaces;
  const where = state ? `${rel} (${state.name})` : rel;
  for (const row of r.out) {
    const exception = notACard(row.sel);
    if (exception) { unreached.delete(exception.sel); continue; }
    const key = `${row.sel}|${row.fill}|${row.ground}`;
    if (!found.has(key)) found.set(key, { ...row, pages: new Set() });
    found.get(key).pages.add(where);
  }
  for (const e of r.exempt) {
    if (!exemptSeen.has(e.sel)) exemptSeen.set(e.sel, e);
  }
}

for (const rel of chosen) {
  await scan(rel, null);
  scanned += 1;
  for (const state of reachableFor(rel)) {
    try { await scan(rel, state); reached += 1; }
    catch (e) {
      say(`\n  ✗ cannot measure ${rel}\n`);
      say(`      ${e.message}`);
      if (e.unreached) {
        say(`\n    A state in scripts/lib/reachable.mjs no longer reaches anything.`);
        say(`    Fix the selector or retire the state; do not leave it unreached.\n`);
      } else say('');
      server.close(); await browser.close(); process.exit(2);
    }
  }
}
server.close();
await browser.close();

const tail = () => {
  say(`    ${surfaces} raised surfaces across ${scanned} pages${reached ? ` and ${reached} reachable states` : ''}`);
  if (showExempt && exemptSeen.size) {
    say(`\n  ${exemptSeen.size} fills separate themselves and take no edge:\n`);
    for (const [, e] of exemptSeen) say(`    ${e.sel}  ${e.fillReads}:1 against its ground`);
  }
  say('');
};

if (unreached.size && !only.length) {
  say(`\n  ✗ ${unreached.size} entries in NOT_CARDS matched nothing on any page:\n`);
  for (const sel of unreached) say(`    ${sel}`);
  say(`\n  Delete the entry, or fix the selector. An exemption for a surface`);
  say(`  that no longer exists is a line nobody reads and a rule nobody applies.\n`);
  process.exit(2);
}

if (!found.size) {
  say(`\n  ✓ every card on a ground has an edge that reads`);
  if (!only.length) say(`    ${NOT_CARDS.length} registered surfaces are not cards, and are listed in the script`);
  tail();
  process.exit(0);
}

say(`\n  ✗ ${found.size} ${found.size === 1 ? 'card sits' : 'cards sit'} on a ground with no edge that reads:\n`);
for (const [, r] of found) {
  say(`    ${r.sel}`);
  say(`        fill rgb(${r.fill}) on rgb(${r.ground}), ${r.fillReads}:1 — the fill does not separate it`);
  if (r.kind === 'none') say(`        nothing draws its outline`);
  else say(`        ${r.kind} ${r.declared} paints rgb(${r.painted}) over the fill — ${r.reads}:1 against the ground`);
  say(`        ${[...r.pages].slice(0, 4).join(', ')}${r.pages.size > 4 ? ` +${r.pages.size - 4} more` : ''}`);
}
tail();
say('  A card on a ground takes 1px solid var(--rule-card). COLOR.md, Lines.');
say('');
say('  If one of these already declares a border, read the color it PAINTS above,');
say('  not the one it declares: --rule-hairline and --rule-strong are charcoal');
say('  tints at 10% and 16%, so they composite over the card’s own fill and come');
say('  out #e9e9e9 whatever the card is sitting on. They are internal lines —');
say('  table rules, a divider between rows, a card edge on the white page.');
say('');
say('  An outer edge does not have to be OPAQUE, which is what this advice used');
say('  to say. It has to be a tint thick enough to survive the composite:');
say('  --rule-card is the same charcoal at 24%, which paints rgb(203,203,203)');
say('  over a white card and reads 1.48:1 on warm, 1.37 on tea-light and 1.28');
say('  on muted-light. Over a TINTED card it paints darker still, which an');
say('  opaque swatch cannot do.');
say('');
process.exit(1);
