/* PRODUCT SYSTEMS: the one registry. Every Narrative Ink picture The Shift
 * used, and the Product Systems file that replaced it, exactly once each.
 * scripts/product-systems.mjs builds from this list and checks the pages
 * against it; nothing else names the files.
 */
export const BASE = 'img/writing/shift/product-systems';
const NI = 'img/writing/shift/narrative-ink';

/* Lesson heroes: the Narrative Ink hero each one replaces, and its alt. */
export const HERO_ALT = {
  1: 'Diagram: cards for Fleet, Hours, and Orders feed an Assign load card that lists its evidence, with Approve and Change buttons; the final call stays with the dispatcher.',
  2: 'Diagram: Plan, Build, Test, and Ship each pass a technical check, while User task completion below them is still marked Needs validation.',
  3: 'Diagram: a questionable pair of primary buttons in the design system becomes a written rule, then an automated check; the definition of done still keeps a designer review.',
  4: 'Diagram: Model, Retrieval, Connections, and Skills feed an agent loop of Plan, Act, and Check; at the boundary the run pauses for a person to approve or stop it.',
  5: 'Diagram: an agent reports an invoice as Paid; checked against records, it was Issued, but not yet Charged or Matched.',
  6: 'Diagram: context and constraints feed an agent, whose work passes Draft, Review, Repair, and Approve, with judgment at Review and Approve.',
  7: 'Diagram: the product problem and success measure feed an evaluation plan of typical, edge, and refusal cases, agreed before prompting.',
  8: 'Diagram: a five-day sprint with an autonomy boundary, where the AI may draft and suggest and people send and commit, and a Friday test with one answer wrong on purpose.',
  9: 'Diagram: a grid of answers stops at a line marked Stop gathering, then synthesis narrows them to three findings and one decision.',
  10: 'Diagram: past interviews with known answers on one side of an evidence boundary, and sessions observing people today, with one new behavior, on the other.',
  11: 'Diagram: three answers, budget, time, and equipment, shape a first meal plan that is ready right away.',
  12: 'Diagram: a crowded CRM narrows in three steps, cut, rethink, and refine, to one follow-up with a Send button; polish comes last.',
};
export const HEROES = [
  [1, 1, `${NI}/chapter-1/chapter1-lesson1-hero.webp`],
  [2, 1, `${NI}/chapter-1/chapter1-lesson2-hero.webp`],
  [3, 1, `${NI}/chapter-1/chapter1-lesson3-hero.webp`],
  [4, 2, `${NI}/chapter-2/chapter2-lesson4-hero.webp`],
  [5, 2, `${NI}/chapter-2/chapter2-lesson5-hero.webp`],
  [6, 2, `${NI}/chapter-2/chapter2-lesson6-hero.webp`],
  [7, 3, `${NI}/chapter-3/chapter3-lesson7-hero.webp`],
  [8, 3, `${NI}/chapter-3/chapter3-lesson8-hero.webp`],
  [9, 3, `${NI}/chapter-3/chapter3-lesson9-hero.webp`],
  [10, 4, `${NI}/chapter-4/chapter4-lesson10-hero.webp`],
  [11, 4, `${NI}/chapter-4/chapter4-lesson11-hero.webp`],
  [12, 4, `${NI}/chapter-4/chapter4-lesson12-hero.webp`],
].map(([n, ch, old]) => ({ kind: 'hero', id: n, chapter: ch, old, svg: `${BASE}/heroes/lesson-${String(n).padStart(2, '0')}.svg`, file: `${BASE}/heroes/lesson-${String(n).padStart(2, '0')}.png`, size: [1600, 900] }));

export const CHAPTER_ALT = {
  1: 'Three cards in a row: Context leads to Task, and Task to Decision.',
  2: 'Four cards in a row: Know, Act, Check, and Stop.',
  3: 'A card listing typical cases, edge cases, and must refuse leads to a card marked Evaluate and ship, each line checked.',
  4: 'Three cards in a row: Research, Onboarding, and Redesign.',
};
export const CHAPTERS = [1, 2, 3, 4].map((ch) => ({ kind: 'chapter', id: ch, chapter: ch, old: `${NI}/emblems/chapter${ch}-emblem.webp`, svg: `${BASE}/chapters/chapter-${ch}.svg`, file: `${BASE}/chapters/chapter-${ch}.png`, size: [1600, 900] }));

/* Share pictures: og.mjs sets one beside each card's title. */
export const SOCIAL = [1, 2, 3, 4].map((ch) => ({ kind: 'social', id: ch, chapter: ch, old: `img/writing/shift/chapter-${ch}-wide.webp`, svg: `${BASE}/social/chapter-${ch}.svg`, file: `${BASE}/social/chapter-${ch}.webp`, size: [840, 840] }));

export const PAIR_ALT = {
  'lesson-07-form': 'A requirements card with nine identical fields, every one asked for at once.',
  'lesson-07-menu': 'A requirements card with three sections, the evaluation plan marked as the one this risk calls for.',
  'lesson-09-gathering': 'Answer cards scattered and overlapping, with one more arriving.',
  'lesson-09-sense': 'The same answer cards in three straight columns, joined into one finding.',
};
export const PAIRS = [
  ['lesson-07-form', 3, `${NI}/chapter-3/chapter3-lesson7-pair-form.webp`],
  ['lesson-07-menu', 3, `${NI}/chapter-3/chapter3-lesson7-pair-menu.webp`],
  ['lesson-09-gathering', 3, `${NI}/chapter-3/chapter3-lesson9-pair-tangle.webp`],
  ['lesson-09-sense', 3, `${NI}/chapter-3/chapter3-lesson9-pair-knot.webp`],
].map(([id, ch, old]) => ({ kind: 'pair', id, chapter: ch, old, svg: `${BASE}/pairs/${id}.svg`, file: `${BASE}/pairs/${id}.png`, size: [1200, 800] }));

/* Icons: old name -> [new name, glyph]. The new name says what the row is,
   where the old one said what the engraving drew. */
const ICON_MAP = {
  1: { map: ['plan', 'plan'], pencil: ['design', 'layout'], wrench: ['build', 'code'], magnifier: ['test', 'searchCheck'], handtruck: ['deploy', 'upload'], oilcan: ['maintain', 'pulse'],
       rulebook: ['system', 'layers'], clipboard: ['checks', 'listChecks'], flag: ['done', 'flag'], frame: ['contrast', 'contrast'], model: ['prototype', 'cursorFrame'], blueprint: ['specs', 'braces'] },
  2: { brain: ['model', 'chip'], books: ['retrieval', 'book'], plug: ['connections', 'plug'], toolbox: ['skills', 'workflow'], loop: ['agent', 'loop'],
       envelope: ['issued', 'send'], cardreader: ['charged', 'card'], 'clipped-pages': ['matched', 'link'],
       lever: ['control', 'toggle'], spike: ['proof', 'fileSearch'], cardfile: ['memory', 'database'], valve: ['stopping', 'power'] },
  3: { discovery: ['discovery', 'target'], 'design-doc': ['design', 'docLayout'], develop: ['develop', 'terminal'], ship: ['deploy', 'external'],
       problem: ['problem', 'question'], data: ['data', 'table'], role: ['role', 'boundary'], decisions: ['decisions', 'branch'], patterns: ['patterns', 'grid'], trust: ['trust', 'shield'], metrics: ['metrics', 'bars'], feedback: ['feedback', 'message'],
       gather: ['gather', 'inbox'], stop: ['stop', 'pause'], 'lay-out': ['lay-out', 'columns'], decide: ['decide', 'checkCircle'] },
  4: { deadline: ['deadline', 'calendar'], demo: ['demo', 'monitorPlay'], budget: ['budget', 'wallet'], check: ['check', 'scan'],
       scale: ['body-stats', 'ruler'], gauge: ['pace', 'gauge'], coins: ['food-budget', 'receipt'], timer: ['cooking-time', 'timer'], skillet: ['kitchen-tools', 'utensils'], mealplan: ['the-plan', 'calendarCheck'],
       cut: ['cut', 'listMinus'], patterns: ['rethink', 'shapes'], refresh: ['refresh', 'pen'], undo: ['undo', 'undo'], confirm: ['confirm', 'dialog'], review: ['review', 'reviewList'] },
};
export const ICONS = Object.entries(ICON_MAP).flatMap(([ch, m]) => Object.entries(m).map(([old, [name, glyph]]) => ({
  kind: 'icon', id: `ch${ch}-${name}`, chapter: Number(ch), glyph,
  old: `${NI}/chapter-${ch}/chapter${ch}-icon-${old}.webp`,
  svg: `${BASE}/icons/ch${ch}-${name}.svg`, file: `${BASE}/icons/ch${ch}-${name}.svg`, size: [64, 64],
})));

export const ALL = [...HEROES, ...CHAPTERS, ...ICONS, ...PAIRS, ...SOCIAL];

/* ------------------------------------------------------------ the site
   The same grammar outside The Shift, in the site's sage (kit('site')),
   under img/product-systems/<page>/. Each replaces one older diagram on a
   case study or a method page. Rail tiles carry no words, so they are served
   as SVG on a transparent ground (the rail's own card is the canvas); the two
   figures with words are rasterized like the heroes. The Shift's manifest
   does not read these pages; scripts/product-systems.mjs builds them all. */
export const SITE_BASE = 'img/product-systems';
const site = (id, page, old, ext, size) => ({ kind: 'site', id, chapter: 'site', page, old,
  svg: `${SITE_BASE}/${id}.svg`, file: `${SITE_BASE}/${id}.${ext}`, size });
export const SITE = [
  ...[1, 2, 3, 4].map((n) => site(`how-i-work/loop-${n}`, 'how-i-work.html', `img/writing/what-makes-a-good-product-designer-now-loop-${n}.webp`, 'svg', [360, 240])),
  ...['guide', 'system', 'code', 'sync'].map((s, i) => site(`sto/lineage-${i + 1}-${s}`, 'case-study/agentic-sto-approval.html', `img/sto/lineage-${i + 1}-${s}.webp`, 'svg', [360, 240])),
  { ...site('agent-review/hero-lesson', 'lab/agent-review.html', 'img/product-systems/agent-review/hero-decision.svg', 'png', [1600, 900]), crop: true },
  ...['say', 'tell', 'weigh'].map((s) => site(`agent-review/next-${s}`, 'lab/agent-review.html', `img/lab/agent-review-next-${s}.webp`, 'svg', [360, 240])),
  ...['problem', 'solution', 'part'].map((s) => site(`sap/overview-${s}`, 'case-study/sap-product-maturity.html', `img/site/sap-overview-${s}.webp`, 'svg', [480, 480])),
  ...['foundation', 'feedback', 'routine', 'ownership'].map((s) => site(`sap/move-${s}`, 'case-study/sap-product-maturity.html', `img/site/sap-move-${s}.webp`, 'svg', [384, 384])),
  ...['problem', 'solution', 'part'].map((s) => site(`usda/overview-${s}`, 'case-study/usda-operational-overhead.html', `img/site/usda-overview-${s}.webp`, 'svg', [420, 480])),
  site('agent-review/card', 'lab/inspiration-to-aisle.html', 'img/lab/agent-review-drawing.webp', 'png', [1600, 900]),
];
