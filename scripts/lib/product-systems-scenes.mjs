/* PRODUCT SYSTEMS: the compositions. Each one draws the decision or the
 * mechanism its lesson turns on, in the grammar of product-systems-art.mjs.
 * Heroes and chapter pictures are 1280x720 (16:9), pairs 960x640 (3:2),
 * share pictures 840x840. These are conceptual interface diagrams, not
 * screenshots of a shipped product; the labels are the lesson's own words.
 */
import { kit, tw, N } from './product-systems-art.mjs';

const W = 1280, H = 720;

/* A small input card: tile, title, one skeleton line. */
function inputCard(k, x, y, w, icon, title, barW = 110) {
  k.card(x, y, w, 100);
  k.chip(icon, x + 22, y + 26, 48);
  k.text(x + 86, y + 46, title, { size: 25 });
  k.bars(x + 86, y + 60, [barW], { h: 9 });
}

/* ------------------------------------------------------------------ heroes */
export const HEROES = {
  /* 1. Fleet, hours, and orders feed one decision; the person signs it. */
  1: () => {
    const k = kit(1);
    const rows = [[150, 'truck', 'Fleet'], [310, 'clock', 'Hours'], [470, 'box', 'Orders']];
    rows.forEach(([y, i, t]) => inputCard(k, 72, y, 250, i, t));
    k.card(452, 140, 430, 440);
    k.head(478, 166, 'target', 'Assign load', { size: 28 });
    k.text(480, 262, 'Evidence', { size: 20, weight: 500, fill: N.muted });
    ['Truck nearby', 'Hours remain', 'Pickup window'].forEach((t, i) => {
      const y = 296 + i * 52;
      k.done(492, y, 12);
      k.text(516, y + 8, t, { size: 22, weight: 500 });
      k.bars(712, y - 4, [140 - i * 22], { h: 9 });
    });
    rows.forEach(([y], i) => k.curve(322, y + 50, 452, 296 + i * 52, {}));
    k.raw(`<path d="M478 460H856" stroke="${N.edge}" stroke-width="1.5"/>`);
    const bw = k.button(478, 484, 'Approve', true);
    k.button(478 + bw + 14, 484, 'Change', false);
    k.card(944, 246, 264, 228);
    k.head(968, 270, 'checkCircle', 'Final call', { size: 26 });
    k.text(970, 368, 'The dispatcher', { size: 21, weight: 500, fill: N.muted });
    k.text(970, 396, 'decides', { size: 21, weight: 500, fill: N.muted });
    k.pill(968, 418, 'Keeps authority', 'accent', { size: 17 });
    k.curve(882, 360, 944, 360, { accent: true });
    return k.svg(W, H);
  },

  /* 2. Every build step passes; whether people finish is still open. */
  2: () => {
    const k = kit(1);
    k.text(80, 110, 'Technical checks', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    const steps = [['plan', 'Plan'], ['code', 'Build'], ['searchCheck', 'Test'], ['upload', 'Ship']];
    steps.forEach(([i, t], n) => {
      const x = 80 + n * 284;
      k.card(x, 132, 240, 120);
      k.chip(i, x + 22, x ? 154 : 154, 44);
      k.text(x + 82, 184, t, { size: 25 });
      k.done(x + 204, 178, 13);
      k.bars(x + 24, 214, [150], { h: 9 });
      if (n < 3) k.line(`M${x + 248} 192H${x + 276}`);
    });
    k.text(80, 352, 'Human usefulness', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    k.card(80, 374, 1092, 250, { stroke: k.c.fill, sw: 2 });
    k.head(108, 402, 'person', 'User task completion', { size: 28 });
    k.pill(1144, 406, 'Needs validation', 'neutral', { size: 19, anchor: 'end' });
    ['Finds the task', 'Understands the result', 'Finishes without help'].forEach((t, i) => {
      const y = 498 + i * 40;
      k.pending(122, y, 12);
      k.text(146, y + 8, t, { size: 21, weight: 500 });
      k.bars(520, y - 4, [420 - i * 60], { h: 9 });
    });
    k.vcurve(1052, 260, 1052, 374, { dash: '5 6' });
    return k.svg(W, H);
  },

  /* 3. A questionable treatment becomes a written rule; not all of the bar
        is automated. */
  3: () => {
    const k = kit(1);
    const cols = [[64, 'layers', 'Design system'], [468, 'listChecks', 'Automated checks'], [872, 'flag', 'Definition of done']];
    cols.forEach(([x, i, t]) => { k.card(x, 132, 344, 456); k.head(x + 24, 156, i, t, { size: 24 }); });
    // Design system: the questionable treatment, then the rule it became.
    k.text(90, 254, 'Two primary actions?', { size: 20, weight: 500, fill: N.muted });
    k.raw(`<rect x="86" y="272" width="300" height="96" rx="12" fill="${k.c.soft}" stroke="${k.c.fill}" stroke-width="2" stroke-dasharray="6 5"/>`);
    k.button(104, 296, 'Save', true, { size: 19 });
    k.button(212, 296, 'Publish', true, { size: 19 });
    k.text(90, 412, 'Becomes a rule', { size: 20, weight: 500, fill: N.muted });
    k.card(86, 430, 300, 130, { shadow: false, fill: N.canvas });
    k.text(108, 470, 'One primary', { size: 22 });
    k.text(108, 500, 'action per view', { size: 22 });
    k.bars(108, 524, [180], { h: 8 });
    // Automated checks
    ['Tokens', 'Contrast', 'One primary action'].forEach((t, i) => {
      const y = 272 + i * 64;
      k.done(506, y, 13);
      k.text(532, y + 8, t, { size: 22, weight: 500 });
    });
    k.bars(494, 476, [270, 200], { h: 9 });
    // Definition of done: one line stays a person's call.
    [['Checks pass', 1], ['Rule documented', 1], ['Designer review', 0]].forEach(([t, ok], i) => {
      const y = 272 + i * 64;
      ok ? k.done(910, y, 13) : k.pending(910, y, 13);
      k.text(936, y + 8, t, { size: 22, weight: 500 });
    });
    k.pill(898, 476, 'Human judgment', 'neutral', { size: 18 });
    k.curve(386, 495, 468, 340, { accent: true });
    k.line('M812 360H866');
    return k.svg(W, H);
  },

  /* 4. Four parts feed the loop; the boundary pauses the run. */
  4: () => {
    const k = kit(2);
    const parts = [['chip', 'Model'], ['book', 'Retrieval'], ['plug', 'Connections'], ['workflow', 'Skills']];
    parts.forEach(([i, t], n) => {
      const y = 104 + n * 132;
      k.card(64, y, 264, 100);
      k.chip(i, 86, y + 26, 48);
      k.text(150, y + 58, t, { size: 24 });
      k.curve(328, y + 50, 420, 300 + n * 40);
    });
    k.card(420, 196, 400, 328);
    k.head(446, 222, 'loop', 'Agent loop', { size: 26 });
    // The loop: three steps around a ring.
    const cx = 620, cy = 410, r = 74;
    k.raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${k.c.ground}" stroke-width="3"/>`);
    // Clockwise, one arc between each pair of steps.
    [[-50, -10], [70, 110], [190, 230]].forEach(([a0, a1]) => {
      const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      k.line(`M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`, { accent: true, w: 2.5 });
    });
    [['Plan', -90], ['Act', 30], ['Check', 150]].forEach(([t, a]) => {
      const x = cx + r * Math.cos(a * Math.PI / 180), y = cy + r * Math.sin(a * Math.PI / 180);
      const w = tw(t, 18) + 28;
      k.raw(`<rect x="${x - w / 2}" y="${y - 17}" width="${w}" height="34" rx="17" fill="${N.card}" stroke="${k.c.fill}" stroke-width="1.5"/>`);
      k.text(x, y + 6.5, t, { size: 18, fill: k.c.ink, anchor: 'middle' });
    });
    // The boundary.
    k.raw(`<path d="M884 84V636" stroke="${k.c.ink}" stroke-width="2" stroke-dasharray="8 8"/>`);
    k.pill(884, 92, 'Boundary', 'solid', { size: 17, anchor: 'middle' });
    k.curve(820, 360, 940, 360, { accent: true });
    k.card(940, 236, 276, 248, { stroke: k.c.fill, sw: 2 });
    k.head(964, 260, 'pause', 'Run paused', { size: 24 });
    k.text(966, 350, 'Waiting on a person', { size: 19, weight: 500, fill: N.muted });
    k.bars(966, 372, [200], { h: 8 });
    const bw = k.button(964, 410, 'Approve', true, { size: 18 });
    k.button(964 + bw + 12, 410, 'Stop', false, { size: 18 });
    return k.svg(W, H);
  },

  /* 5. One "Paid" unfolds into three facts, each checked against a record. */
  5: () => {
    const k = kit(2);
    k.text(72, 214, 'Agent report', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    k.card(72, 236, 330, 220);
    k.head(96, 260, 'message', 'Invoice 1042', { size: 24 });
    k.bars(98, 336, [220, 160], { h: 9 });
    k.text(98, 418, 'Status', { size: 20, weight: 500, fill: N.muted });
    k.pill(186, 394, 'Paid', 'accent', { size: 20 });
    k.text(560, 110, 'Checked against records', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    [['send', 'Issued', 'One-time card sent', 1], ['card', 'Charged', 'No charge on record', 0], ['link', 'Matched', 'Not tied to invoice', 0]].forEach(([i, t, note, ok], n) => {
      const y = 132 + n * 176;
      k.card(560, y, 648, 148, ok ? {} : { stroke: N.rule });
      k.chip(i, 584, y + 26, 48);
      k.text(648, y + 60, t, { size: 26 });
      k.text(648, y + 98, note, { size: 20, weight: 500, fill: N.muted });
      if (ok) { k.done(1050, y + 52, 14); k.text(1074, y + 60, 'Done', { size: 21, fill: k.c.ink }); }
      else { k.pending(1050, y + 52, 14); k.text(1074, y + 60, 'Not yet', { size: 21, weight: 500, fill: N.muted }); }
      k.bars(648, y + 116, [ok ? 300 : 200], { h: 8 });
      k.curve(402, 346, 560, y + 74, { accent: n === 0 });
    });
    return k.svg(W, H);
  },

  /* 6. Context and constraints feed the agent; judgment comes in at named
        checkpoints, not at the end. */
  6: () => {
    const k = kit(2);
    inputCard(k, 72, 88, 268, 'docLayout', 'Context');
    inputCard(k, 72, 214, 268, 'sliders', 'Constraints');
    k.card(500, 120, 280, 160);
    k.head(526, 146, 'loop', 'Agent', { size: 26 });
    k.bars(528, 222, [190, 140], { h: 9 });
    k.curve(340, 138, 500, 186);
    k.curve(340, 264, 500, 222);
    k.text(648, 384, 'Checkpoints', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    const steps = [['pen', 'Draft', 0], ['searchCheck', 'Review', 1], ['undo', 'Repair', 0], ['checkCircle', 'Approve', 1]];
    steps.forEach(([i, t, judge], n) => {
      const x = 72 + n * 288;
      k.card(x, 408, 248, 196, judge ? { stroke: k.c.fill, sw: 2 } : {});
      k.chip(i, x + 22, 432, 44);
      k.text(x + 80, 462, t, { size: 24 });
      k.bars(x + 24, 504, [170, 120], { h: 8 });
      judge ? k.pill(x + 22, 548, 'Judgment', 'accent', { size: 17 }) : k.pill(x + 22, 548, 'Agent', 'neutral', { size: 17 });
      if (n < 3) k.line(`M${x + 254} 506H${x + 282}`, { accent: n === 0 || n === 2 });
    });
    k.vcurve(640, 280, 196, 408);
    return k.svg(W, H);
  },

  /* 7. The problem and the measure feed an evaluation plan, agreed first. */
  7: () => {
    const k = kit(3);
    inputCard(k, 56, 176, 340, 'question', 'Product problem', 150);
    inputCard(k, 56, 420, 340, 'bars', 'Success measure', 150);
    k.card(500, 92, 700, 536);
    k.head(528, 118, 'listChecks', 'Evaluation plan', { size: 28 });
    k.pill(1172, 122, 'Agreed before prompting', 'solid', { size: 17, anchor: 'end' });
    [['Typical cases', 'What it should do every day', [260, 200]], ['Edge cases', 'Where it is likely to slip', [220, 170]], ['Refusal cases', 'What it must decline', [240, 150]]].forEach(([t, sub, b], n) => {
      const y = 204 + n * 136;
      k.card(528, y, 644, 116, { shadow: false, fill: n === 2 ? k.c.soft : N.canvas, stroke: n === 2 ? k.c.ground : N.edge });
      k.done(560, y + 38, 13);
      k.text(586, y + 46, t, { size: 23 });
      k.text(586, y + 80, sub, { size: 19, weight: 500, fill: N.muted });
      k.bars(900, y + 34, b, { h: 8 });
    });
    k.curve(396, 226, 500, 300);
    k.curve(396, 470, 500, 420);
    return k.svg(W, H);
  },

  /* 8. Five days, a line where the AI's authority stops, and a Friday test
        with one answer wrong on purpose. */
  8: () => {
    const k = kit(3);
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach((d, n) => {
      const x = 72 + n * 230;
      k.card(x, 72, 206, 124, n === 4 ? { stroke: k.c.fill, sw: 2 } : {});
      k.text(x + 22, 114, d, { size: 24 });
      k.bars(x + 22, 136, [140, 100], { h: 8 });
    });
    // The autonomy boundary under the first four days.
    k.card(72, 240, 896, 176);
    k.text(98, 286, 'Autonomy boundary', { size: 22 });
    k.text(98, 342, 'The AI may', { size: 19, weight: 500, fill: N.muted });
    k.pill(98, 358, 'Draft', 'accent', { size: 17 });
    k.pill(196, 358, 'Suggest', 'accent', { size: 17 });
    k.raw(`<path d="M520 268V396" stroke="${k.c.ink}" stroke-width="2" stroke-dasharray="7 7"/>`);
    k.text(548, 342, 'People decide', { size: 19, weight: 500, fill: N.muted });
    k.pill(548, 358, 'Send', 'solid', { size: 17 });
    k.pill(638, 358, 'Commit', 'solid', { size: 17 });
    // Friday's usability test.
    k.card(72, 460, 1136, 196);
    k.head(98, 484, 'person', 'Friday usability test', { size: 24 });
    [['Answer A', 1, 98, 300], ['Answer B', 0, 424, 432], ['Answer C', 1, 882, 300]].forEach(([t, ok, x, w]) => {
      k.card(x, 560, w, 70, { shadow: false, fill: ok ? N.canvas : k.c.soft, stroke: ok ? N.edge : k.c.fill, dash: ok ? null : '6 5' });
      k.text(x + 22, 603, t, { size: 21, weight: 500 });
      if (!ok) k.pill(x + w - 18, 576, 'Wrong on purpose', 'solid', { size: 16, anchor: 'end' });
      else k.bars(x + 150, 591, [120], { h: 8 });
    });
    k.vcurve(1150, 196, 1150, 460, { accent: true });
    return k.svg(W, H);
  },

  /* 9. Many answers; a stop; synthesis; a few findings; one decision. */
  9: () => {
    const k = kit(3);
    k.text(64, 100, 'Answers', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) {
      const x = 64 + q * 104, y = 116 + r * 104;
      k.card(x, y, 88, 84, { r: 12 });
      k.bars(x + 14, y + 22, [56, 40, 48], { h: 7, gap: 10 });
    }
    // The stop.
    k.raw(`<path d="M400 104V640" stroke="${k.c.ink}" stroke-width="2.5"/>`);
    k.pill(400, 70, 'Stop gathering', 'solid', { size: 17, anchor: 'middle' });
    k.card(472, 280, 220, 136);
    k.head(494, 304, 'columns', 'Synthesis', { size: 22, s: 44 });
    k.bars(496, 374, [160], { h: 8 });
    k.line('M410 348H466');
    k.text(756, 160, 'Findings', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    [0, 1, 2].forEach((n) => {
      const y = 184 + n * 120;
      k.card(756, y, 200, 96);
      k.bars(776, y + 30, [150, 110], { h: 8 });
      k.curve(692, 348, 756, y + 48);
      k.curve(956, y + 48, 1012, 348, { head: n === 1, accent: true });
    });
    k.card(1012, 268, 216, 164, { stroke: k.c.fill, sw: 2.5 });
    k.head(1034, 292, 'checkCircle', 'Decision', { size: 24, s: 44 });
    k.bars(1036, 376, [160, 120], { h: 8 });
    return k.svg(W, H);
  },

  /* 10. What the past can answer, and what only people can show today. */
  10: () => {
    const k = kit(4);
    k.card(64, 128, 520, 520, { fill: N.canvas, shadow: false });
    k.head(90, 152, 'database', 'Past interviews', { size: 25 });
    ['Known answer', 'Known answer', 'Known answer'].forEach((t, n) => {
      const y = 236 + n * 100;
      k.card(90, y, 468, 84);
      k.done(122, y + 42, 12);
      k.text(146, y + 50, t, { size: 21, weight: 500 });
      k.bars(340, y + 37, [180 - n * 30], { h: 8 });
    });
    k.pill(90, 572, 'A twin can repeat these', 'neutral', { size: 17 });
    // The evidence boundary.
    k.raw(`<path d="M640 92V668" stroke="${k.c.ink}" stroke-width="2.5"/>`);
    k.pill(640, 54, 'Evidence boundary', 'solid', { size: 17, anchor: 'middle' });
    k.card(696, 128, 520, 520, { stroke: k.c.fill, sw: 2 });
    k.head(722, 152, 'search', 'Observed today', { size: 25 });
    [['Session with a person', 0], ['New behavior', 1], ['Session with a person', 0]].forEach(([t, neu], n) => {
      const y = 236 + n * 100;
      k.card(722, y, 468, 84, neu ? { fill: k.c.soft, stroke: k.c.fill, shadow: false } : { shadow: false, fill: N.canvas });
      k.text(748, y + 50, t, { size: 21, weight: neu ? 600 : 500, fill: neu ? k.c.ink : N.ink });
      if (!neu) k.bars(1030, y + 37, [130], { h: 8 });
    });
    k.pill(722, 572, 'Only people can show this', 'accent', { size: 17 });
    return k.svg(W, H);
  },

  /* 11. Three real constraints shape a plan the person sees right away. */
  11: () => {
    const k = kit(4);
    k.text(72, 116, 'Three questions', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    [['wallet', 'Budget', 'Under a set amount'], ['timer', 'Time', 'Twenty minutes'], ['utensils', 'Equipment', 'One pan']].forEach(([i, t, v], n) => {
      const y = 140 + n * 160;
      k.card(72, y, 340, 124);
      k.chip(i, 94, y + 24, 48);
      k.text(158, y + 56, t, { size: 25 });
      k.text(158, y + 92, v, { size: 19, weight: 500, fill: N.muted });
      k.curve(412, y + 62, 520, 250 + n * 110);
    });
    k.card(520, 112, 690, 500);
    k.head(546, 138, 'calendarCheck', 'Your first plan', { size: 28 });
    k.pill(1184, 142, 'Ready now', 'solid', { size: 18, anchor: 'end' });
    [['Mon', 'Sheet-pan chicken'], ['Tue', 'Bean tacos'], ['Wed', 'Vegetable fried rice']].forEach(([d, m], n) => {
      const y = 222 + n * 110;
      k.card(546, y, 638, 90, { shadow: false, fill: N.canvas });
      k.text(572, y + 54, d, { size: 21, fill: N.muted });
      k.text(652, y + 54, m, { size: 22 });
      k.pill(1160, y + 26, 'One pan', 'accent', { size: 16, anchor: 'end' });
    });
    k.bars(548, 572, [260], { h: 8 });
    return k.svg(W, H);
  },

  /* 12. A crowded CRM narrows: cut, rethink, and only then refine. */
  12: () => {
    const k = kit(4);
    // The CRM as it is: a sidebar, tabs, and a grid of everything.
    k.card(56, 120, 360, 480);
    k.raw(`<rect x="57" y="121" width="80" height="478" rx="17" fill="${N.canvas}"/>`);
    for (let i = 0; i < 9; i++) k.raw(`<rect x="76" y="${146 + i * 48}" width="42" height="10" rx="5" fill="${N.edge}"/>`);
    for (let i = 0; i < 4; i++) k.raw(`<rect x="${156 + i * 62}" y="142" width="50" height="22" rx="6" fill="${N.edge}"/>`);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 3; q++) k.raw(`<rect x="${156 + q * 82}" y="${190 + r * 48}" width="68" height="30" rx="6" fill="${N.canvas}" stroke="${N.edge}" stroke-width="1.5"/>`);
    k.text(56, 100, 'CRM today', { size: 20, weight: 600, fill: N.muted, spacing: 1 });
    // Cut, rethink, refine: each card smaller than the one before.
    const steps = [[480, 168, 236, 384, 'Cut'], [764, 216, 196, 288, 'Rethink'], [1008, 248, 216, 224, 'Refine']];
    steps.forEach(([x, y, w, h, t], n) => {
      k.text(x, y - 20, `${n + 1}  ${t}`, { size: 21, fill: k.c.ink });
      k.card(x, y, w, h, n === 2 ? { stroke: k.c.fill, sw: 2 } : {});
    });
    // Cut: fewer rows.
    for (let r = 0; r < 5; r++) k.raw(`<rect x="504" y="${196 + r * 66}" width="188" height="40" rx="8" fill="${N.canvas}" stroke="${N.edge}" stroke-width="1.5"/>`);
    // Rethink: one repeated pattern.
    for (let r = 0; r < 3; r++) { k.raw(`<rect x="786" y="${244 + r * 80}" width="152" height="56" rx="10" fill="${N.card}" stroke="${k.c.ground}" stroke-width="2"/>`); k.bars(802, 262 + r * 80, [96, 64], { h: 7, gap: 8 }); }
    // Refine: the follow-up, polished last.
    k.chip('message', 1030, 272, 44);
    k.text(1032, 362, 'Follow up', { size: 23 });
    k.bars(1032, 380, [150], { h: 8 });
    k.button(1032, 410, 'Send', true, { size: 18 });
    k.curve(416, 360, 480, 360);
    k.curve(716, 360, 764, 360);
    k.curve(960, 360, 1008, 360, { accent: true });
    k.text(1008, 512, 'Polish comes last', { size: 18, weight: 500, fill: N.muted });
    return k.svg(W, H);
  },
};

/* ---------------------------------------------------------------- chapters
   The four landing pictures: the chapter's arc as a flow of cards, the same
   grammar as the heroes, so the landing reads as their table of contents.

   DRAWN FOR THE SIZE THEY ARE SEEN AT (2026-11-16). They only ever show
   small: a mosaic tile on the landing and the homepage, and a chapter band
   beside three lessons, about 400px across. At 25-32 units on a 1280 frame
   their words printed near 8px (owner: make the text easier to read). So
   each card's name is set as large as the card allows, up to 46, under its
   chip, and the skeleton lines, which said nothing at that size, are gone.
   Chapter 3 keeps its list, its marks, and its two heads, all larger. */
function flow(ch, steps) {
  const k = kit(ch);
  const n = steps.length, gap = n === 4 ? 52 : 78, w = n === 4 ? 248 : 336, h = 220;
  const total = n * w + (n - 1) * gap, x0 = (W - total) / 2;
  const top = (i) => 250 + (i % 2 ? 44 : -20);
  steps.forEach(([icon, t], i) => {
    const x = x0 + i * (w + gap), y = top(i);
    k.card(x, y, w, h, i === n - 1 ? { stroke: k.c.fill, sw: 2.5 } : {});
    k.chip(icon, x + 26, y + 24, 84);
    // The name as large as the card allows: up to 46, never wider than it.
    let size = 46;
    while (tw(t, size) > w - 52) size--;
    k.text(x + 28, y + h - 40, t, { size });
    // A short straight connector, edge to edge, as the cards step down and up.
    if (i < n - 1) k.line(`M${x + w + 8} ${y + h / 2}L${x + w + gap - 10} ${top(i + 1) + h / 2}`, { accent: i === n - 2, w: 2.5 });
  });
  // The flow fills the frame: the landing shows it as small as a mosaic tile.
  return k.svg(W, H, { zoom: Math.min(1.12, 1200 / total) });
}
export const CHAPTERS = {
  1: () => flow(1, [['docLayout', 'Context'], ['target', 'Task'], ['checkCircle', 'Decision']]),
  2: () => flow(2, [['book', 'Know'], ['plug', 'Act'], ['shield', 'Check'], ['pause', 'Stop']]),
  3: () => {
    /* Two cards of one height on one top line, their heads at one size
       with the flow pictures' 84 tile, so the two read as a pair
       (2026-11-16). The checked lines sit on the rows of the list. */
    const k = kit(3);
    const y = 150, h = 420, w = 520, x1 = 80, x2 = 680, size = 38, rows = [y + 186, y + 262, y + 338];
    k.card(x1, y, w, h);
    k.head(x1 + 28, y + 28, 'listChecks', 'Define the bar', { size, s: 84 });
    ['Typical cases', 'Edge cases', 'Must refuse'].forEach((t, i) => {
      k.raw(`<circle cx="${x1 + 50}" cy="${rows[i]}" r="14" fill="${k.c.soft}" stroke="${k.c.fill}" stroke-width="2.5"/>`);
      k.text(x1 + 84, rows[i] + 12, t, { size: 34, weight: 500 });
    });
    k.curve(x1 + w, y + h / 2, x2, y + h / 2, { accent: true });
    k.card(x2, y, w, h, { stroke: k.c.fill, sw: 2.5 });
    k.head(x2 + 28, y + 28, 'shield', 'Evaluate and ship', { size, s: 84 });
    rows.forEach((ry) => {
      k.bars(x2 + 32, ry - 6, [360], { h: 12 });
      k.done(x2 + w - 50, ry, 18);
    });
    return k.svg(W, H, { zoom: 1.06 });
  },
  4: () => flow(4, [['search', 'Research'], ['sliders', 'Onboarding'], ['grid', 'Redesign']]),
};

/* ------------------------------------------------------------------- pairs */
export const PAIRS = {
  /* Lesson 7: every field at once, against the sections the risk calls for. */
  'lesson-07-form': () => {
    const k = kit(3);
    k.card(160, 40, 640, 640);
    k.head(188, 66, 'docLayout', 'Requirements', { size: 26 });
    for (let i = 0; i < 9; i++) {
      const y = 148 + i * 58;
      k.bars(190, y, [90 + (i * 37) % 70], { h: 8 });
      k.raw(`<rect x="330" y="${y - 12}" width="440" height="34" rx="8" fill="${N.card}" stroke="${N.rule}" stroke-width="1.5"/>`);
    }
    return k.svg(960, 640);
  },
  'lesson-07-menu': () => {
    const k = kit(3);
    k.card(160, 104, 640, 432);
    k.head(188, 130, 'docLayout', 'Requirements', { size: 26 });
    [['Problem', 0], ['Evaluation plan', 1], ['Rollout', 0]].forEach(([t, on], i) => {
      const y = 212 + i * 100;
      k.card(188, y, 584, 80, { shadow: false, fill: on ? k.c.soft : N.canvas, stroke: on ? k.c.fill : N.edge, sw: on ? 2 : 1.5 });
      on ? k.done(224, y + 40, 14) : k.raw(`<circle cx="224" cy="${y + 40}" r="13" fill="${N.card}" stroke="${N.rule}" stroke-width="2"/>`);
      k.text(252, y + 48, t, { size: 24, weight: on ? 600 : 500, fill: on ? k.c.ink : N.ink });
      k.bars(590, y + 36, [150], { h: 8 });
    });
    return k.svg(960, 640);
  },
  /* Lesson 9: answers piling up, against the same answers laid out. */
  'lesson-09-gathering': () => {
    const k = kit(3);
    const spots = [[150, 120], [330, 70], [520, 130], [250, 260], [450, 300], [640, 230], [180, 420], [380, 450], [580, 410]];
    spots.forEach(([x, y]) => { k.card(x, y, 170, 110, { r: 14 }); k.bars(x + 20, y + 30, [120, 90, 106], { h: 8, gap: 12 }); });
    k.card(700, 470, 190, 110, { stroke: k.c.fill, sw: 2, r: 14 });
    k.text(722, 512, 'One more', { size: 20, fill: k.c.ink });
    k.bars(722, 534, [130], { h: 8 });
    return k.svg(960, 640);
  },
  'lesson-09-sense': () => {
    const k = kit(3);
    [0, 1, 2].forEach((q) => [0, 1, 2].forEach((r) => {
      const x = 80 + q * 200, y = 80 + r * 170;
      k.card(x, y, 168, 120, { r: 14 });
      k.bars(x + 20, y + 32, [120, 90, 106], { h: 8, gap: 12 });
    }));
    [0, 1, 2].forEach((r) => k.curve(648, 140 + r * 170, 712, 310, { head: r === 1, accent: true }));
    k.card(712, 236, 196, 148, { stroke: k.c.fill, sw: 2.5, r: 14 });
    k.done(744, 274, 14);
    k.text(734, 330, 'One finding', { size: 21 });
    k.bars(734, 350, [130], { h: 8 });
    return k.svg(960, 640);
  },
};

/* ------------------------------------------------------------------ social
   The share card's picture: the chapter's flow, stacked, in a square. */
function stack(ch, steps) {
  const k = kit(ch);
  const n = steps.length, h = n === 4 ? 136 : 170, gap = n === 4 ? 52 : 70;
  const total = n * h + (n - 1) * gap, y0 = (840 - total) / 2, x = 120, w = 600;
  steps.forEach(([icon, t], i) => {
    const y = y0 + i * (h + gap);
    k.card(x, y, w, h, i === n - 1 ? { stroke: k.c.fill, sw: 3 } : {});
    k.chip(icon, x + 32, y + h / 2 - 36, 72);
    k.text(x + 130, y + h / 2 - 4, t, { size: 42 });
    k.bars(x + 132, y + h / 2 + 26, [300], { h: 12 });
    if (i < n - 1) k.line(`M${x + w / 2} ${y + h + 10}V${y + h + gap - 10}`, { accent: i === n - 2, w: 3 });
  });
  return k.svg(840, 840, { bg: N.canvas });
}
export const SOCIAL = {
  1: () => stack(1, [['docLayout', 'Context'], ['target', 'Task'], ['checkCircle', 'Decision']]),
  2: () => stack(2, [['book', 'Know'], ['plug', 'Act'], ['shield', 'Check'], ['pause', 'Stop']]),
  3: () => stack(3, [['listChecks', 'Define the bar'], ['shield', 'Evaluate'], ['upload', 'Ship']]),
  4: () => stack(4, [['search', 'Research'], ['sliders', 'Onboarding'], ['grid', 'Redesign']]),
};

/* -------------------------------------------------------------- the site
   Outside The Shift: case-study figures and rail tiles in the site's sage
   (kit('site')). The two figures with words are 1280 wide so their labels
   print at about 14px in a case study's narrow column; the rail tiles are
   360x240, wordless, on a transparent ground, because the rail's own warm
   card is their canvas. */

/* An effort meter: three short bars, the first n filled. */
const effort = (k, x, y, n) => [0, 1, 2].forEach((i) =>
  k.raw(`<rect x="${x + i * 22}" y="${y - (i + 1) * 7}" width="14" height="${(i + 1) * 7 + 4}" rx="3" fill="${i < n ? k.c.fill : N.edge}"/>`));

/* A numbered disc: the solid accent with a white digit. */
const disc = (k, cx, cy, n, r = 20) => {
  k.raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${k.c.ink}"/>`);
  k.text(cx, cy + r * 0.4, String(n), { size: r * 1.1, fill: N.card, anchor: 'middle' });
};

/* A small window: a card with three dots in its top bar. */
const win = (k, x, y, w, h, o = {}) => {
  k.card(x, y, w, h, o);
  k.raw(`<path d="M${x} ${y + 36}H${x + w}" stroke="${N.edge}" stroke-width="2"/>`);
  [0, 1, 2].forEach((i) => k.raw(`<circle cx="${x + 22 + i * 18}" cy="${y + 18}" r="5" fill="${i === 2 ? k.c.fill : N.rule}"/>`));
};

/* Rail tiles: the grammar a size up, so a tile printed at 160px tall still
   shows its hairlines, and nothing near the edge, so the shadow fits. */
const TILE = [360, 240];
const tile = () => kit('site');
const tsvg = (k) => k.svg(...TILE);
const row = (k, x, y, w, icon, { bars = [w - 110], key = false } = {}) => {
  k.card(x, y, w, 56, { r: 14, sw: 2, ...(key ? { stroke: k.c.fill, sw: 2.5 } : {}) });
  k.chip(icon, x + 12, y + 10, 36);
  k.bars(x + 60, y + 23, bars, { h: 10 });
};

/* ---- The SAP overview's heap of apps (2026-11-17). Forty small apps, each a
   different layout and a different header, thrown down in no order: sizes
   and tilts vary, and some overlap. The scatter is seeded, so a rebuild draws
   the same heap, and everything is drawn from the same neutrals as the rest.
   Every drawer takes the tile's own size and draws inside 0..w by 0..h. */
const mulberry = (a) => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function heapApps(k) {
  const n = (v) => +v.toFixed(1);
  const R = (x, y, w, h, r, fill, stroke, sw = 1.5) =>
    k.raw(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`);
  const B = (x, y, w, h, fill) => R(x, y, Math.max(w, h), h, h / 2, fill);
  const C = (cx, cy, r, fill, stroke, sw = 1.5) =>
    k.raw(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill || 'none'}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`);
  const topBar = (w, hh, r, fill) => k.raw(`<path d="M0 ${hh}V${r}A${r} ${r} 0 0 1 ${r} 0H${n(w - r)}A${r} ${r} 0 0 1 ${n(w)} ${r}V${hh}Z" fill="${fill}"/>`);
  const rail = (h, sw, r, fill) => k.raw(`<path d="M${r} 0H${sw}V${n(h)}H${r}A${r} ${r} 0 0 1 0 ${n(h - r)}V${r}A${r} ${r} 0 0 1 ${r} 0Z" fill="${fill}"/>`);
  const path = (d, stroke, sw = 1.5) => k.raw(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const lines = (x, y, w, bottom, { bh = 5, gap = 5, fill = N.edge } = {}) => {
    const f = [1, 0.74, 0.9, 0.58, 0.82, 0.66];
    for (let i = 0, yy = y; yy + bh <= bottom; i++, yy += bh + gap) B(x, yy, w * f[i % f.length], bh, fill);
  };
  /* [minW, minH, draw]. A drawer only gets a tile it fits in. */
  const T = {
    titled: [52, 44, (w, h, p, r) => { topBar(w, 15, r, p.hd); B(8, 5, w * 0.34, 5, p.on); C(w - 11, 7.5, 2.8, p.on); lines(8, 23, w - 16, h - 6); }],
    rail: [56, 44, (w, h, p, r) => { const s = Math.round(w * 0.3); rail(h, s, r, p.hd); lines(6, 10, s - 12, h - 8, { fill: p.on, gap: 6 }); B(s + 8, 9, (w - s - 16) * 0.6, 6, N.rule); lines(s + 8, 22, w - s - 16, h - 6); }],
    table: [60, 46, (w, h, p, r) => { topBar(w, 13, r, p.hd); [0.08, 0.4, 0.7].forEach((f) => B(w * f, 4.5, w * 0.16, 4, p.on)); for (let y = 19, i = 0; y + 5 <= h - 5; y += 9, i++) { path(`M0 ${y - 2.5}H${w}`, N.edge, 1); [0.08, 0.4, 0.7].forEach((f, j) => B(w * f, y, w * [0.2, 0.18, 0.14][(i + j) % 3], 4.5, N.rule)); } }],
    form: [56, 50, (w, h, p) => { B(8, 8, w * 0.38, 6, N.rule); const nf = Math.max(1, Math.floor((h - 34) / 21)); for (let i = 0; i < nf; i++) { B(8, 20 + i * 21, w * (i ? 0.2 : 0.28), 4, N.edge); R(8, 27 + i * 21, w - 16, 10, 3, N.card, N.rule, 1.2); } R(w - 8 - w * 0.3, h - 14, w * 0.3, 9, 3, p.solid); }],
    chart: [56, 48, (w, h, p, r, rnd) => { B(8, 7, w * 0.36, 5, N.rule); const base = h - 9, bw = (w - 20) / 6, top = rnd() * 3 | 0; for (let i = 0; i < 6; i++) { const bh = (h - 30) * (0.3 + rnd() * 0.7); R(10 + i * bw + 2, base - bh, bw - 5, bh, 2, i === top + 1 ? p.solid : N.edge); } path(`M8 ${base}H${w - 8}`, N.rule); }],
    cards: [60, 50, (w, h, p, r) => { topBar(w, 11, r, p.hd); const cw = (w - 24) / 2, ch = (h - 29) / 2; [0, 1, 2, 3].forEach((i) => { const x = 8 + (i % 2) * (cw + 8), y = 17 + Math.floor(i / 2) * (ch + 5); R(x, y, cw, ch, 3, N.canvas, N.edge, 1); B(x + 4, y + 4, cw * 0.5, 3.5, i === 0 ? p.solid : N.rule); }); }],
    people: [52, 44, (w, h, p) => { for (let y = 9, i = 0; y + 10 <= h - 4; y += 14, i++) { C(13, y + 5, 5, i % 2 ? N.rule : p.solid); B(24, y + 1, (w - 40) * [0.7, 0.55, 0.8, 0.6][i % 4], 4.5, N.rule); B(24, y + 8, (w - 40) * 0.35, 3.5, N.edge); } }],
    kpi: [60, 48, (w, h, p) => { const bw = (w - 24) / 3; [0, 1, 2].forEach((i) => { R(8 + i * (bw + 4), 8, bw, 16, 3, N.canvas); B(11 + i * (bw + 4), 12, bw * 0.55, 4.5, i === 1 ? p.solid : N.muted); B(11 + i * (bw + 4), 18.5, bw * 0.4, 3, N.rule); }); const y0 = h - 9, hh = h - 40; path(`M8 ${y0}L${n(w * 0.22)} ${n(y0 - hh * 0.4)}L${n(w * 0.4)} ${n(y0 - hh * 0.15)}L${n(w * 0.62)} ${n(y0 - hh * 0.8)}L${n(w * 0.8)} ${n(y0 - hh * 0.5)}L${n(w - 8)} ${n(y0 - hh * 0.95)}`, p.solid, 2); }],
    steps: [56, 44, (w, h, p) => { const y = 14, gap = (w - 28) / 3; path(`M14 ${y}H${n(w - 14)}`, N.rule, 2); [0, 1, 2, 3].forEach((i) => C(14 + i * gap, y, 5, i < 2 ? p.solid : N.card, i < 2 ? null : N.rule, 2)); lines(8, 28, w - 16, h - 6, { gap: 6 }); }],
    tabs: [56, 50, (w, h, p) => { [0, 1, 2].forEach((i) => B(8 + i * (w * 0.26 + 4), 8, w * 0.26, 7, i === 0 ? p.solid : N.edge)); R(8, 22, w - 16, Math.max(10, h - 46), 3, N.canvas); lines(8, h - 16, w - 16, h - 5, { gap: 4 }); }],
    split: [60, 44, (w, h, p, r) => { const s = Math.round(w * 0.36); rail(h, s, r, N.canvas); lines(6, 8, s - 12, h - 6, { fill: N.rule, gap: 6 }); B(6, 8, s - 12, 5, p.solid); R(s + 8, 8, w - s - 16, (h - 16) * 0.5, 3, N.edge); lines(s + 8, 8 + (h - 16) * 0.5 + 6, w - s - 16, h - 6); }],
    calendar: [58, 50, (w, h, p, r, rnd) => { topBar(w, 13, r, p.hd); B(8, 4.5, w * 0.3, 4, p.on); const cols = 5, rows = Math.max(2, Math.floor((h - 22) / 9)), cw = (w - 16) / cols, hot = Math.floor(rnd() * cols * rows); for (let i = 0; i < cols * rows; i++) R(8 + (i % cols) * cw + 1, 19 + Math.floor(i / cols) * 9, cw - 3, 6.5, 1.5, i === hot ? p.solid : N.canvas, i === hot ? null : N.edge, 1); }],
    toggles: [56, 44, (w, h, p) => { for (let y = 10, i = 0; y + 9 <= h - 4; y += 15, i++) { B(8, y + 2, (w - 40) * [0.8, 0.55, 0.7, 0.9][i % 4], 4.5, N.rule); const on = i % 2 === 0; R(w - 28, y, 20, 9, 4.5, on ? p.solid : N.edge); C(on ? w - 13.5 : w - 23.5, y + 4.5, 3, N.card); } }],
    board: [62, 46, (w, h, p) => { const cw = (w - 24) / 3; [0, 1, 2].forEach((i) => { const x = 8 + i * (cw + 4); B(x, 8, cw * 0.7, 4, i === 0 ? p.solid : N.rule); for (let y = 17, j = 0; y + 9 <= h - 5 && j < [3, 2, 3][i]; y += 12, j++) R(x, y, cw, 9, 2.5, N.canvas, N.edge, 1); }); }],
    donut: [76, 54, (w, h, p) => { const r = Math.min(w * 0.2, (h - 16) / 2.3), cx = 8 + r + 5, cy = h / 2, c = 2 * Math.PI * r; k.raw(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${N.edge}" stroke-width="7"/>`); k.raw(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${p.solid}" stroke-width="7" stroke-dasharray="${n(c * 0.62)} ${n(c)}" transform="rotate(-90 ${n(cx)} ${n(cy)})"/>`); const lx = cx + r + 14; [0, 1, 2].forEach((i) => { C(lx + 2, cy - 12 + i * 12, 2.5, i ? N.rule : p.solid); B(lx + 8, cy - 14.5 + i * 12, (w - lx - 16) * [1, 0.7, 0.85][i], 4.5, N.rule); }); }],
    tree: [60, 52, (w, h) => { const cx = w / 2, ys = 18; R(cx - 14, 7, 28, 11, 3, N.muted); path(`M${n(cx)} ${ys}V${ys + 12}M${n(w * 0.2)} ${ys + 12}V${ys + 6}H${n(w * 0.8)}V${ys + 12}`, N.rule); [0.2, 0.5, 0.8].forEach((f) => R(w * f - 11, ys + 12, 22, 11, 3, N.card, N.rule, 1.5)); lines(8, ys + 30, w - 16, h - 5); }],
    inbox: [56, 44, (w, h, p) => { for (let y = 7, i = 0; y + 12 <= h - 4; y += 15, i++) { if (i === 0) R(4, y - 2, w - 8, 15, 3, N.canvas); C(12, y + 5.5, 2.8, i === 0 ? p.solid : N.rule); B(20, y + 1, (w - 52) * [0.8, 0.6, 0.9][i % 3], 4.5, i === 0 ? N.muted : N.rule); B(20, y + 8, (w - 52) * 0.5, 3.5, N.edge); B(w - 24, y + 2, 16, 3.5, N.edge); } }],
    dialog: [56, 48, (w, h, p, r) => { R(1, 1, w - 2, h - 2, r, N.canvas); R(w * 0.16, h * 0.18, w * 0.68, h * 0.64, 4, N.card, N.rule, 1.5); B(w * 0.22, h * 0.28, w * 0.3, 4.5, N.muted); B(w * 0.22, h * 0.28 + 9, w * 0.5, 3.5, N.edge); R(w * 0.6, h * 0.82 - 13, w * 0.18, 8, 2.5, p.solid); }],
    map: [58, 46, (w, h, p, r, rnd) => { R(1, 1, w - 2, h - 2, r, N.canvas); path(`M0 ${n(h * 0.35)}H${w}M0 ${n(h * 0.7)}H${w}M${n(w * 0.3)} 0V${h}M${n(w * 0.68)} 0V${h}`, N.edge, 3); [[0.3, 0.35], [0.68, 0.7], [0.5 + (rnd() - 0.5) * 0.2, 0.18]].forEach(([fx, fy], i) => C(w * fx, h * fy, i ? 3.5 : 5, i ? N.muted : p.solid, N.card, 1.5)); }],
    login: [52, 50, (w, h, p) => { C(w / 2, 12, 6, p.solid); R(w * 0.2, 22, w * 0.6, 7, 3, N.card, N.rule, 1.2); R(w * 0.2, 32, w * 0.6, 7, 3, N.card, N.rule, 1.2); R(w * 0.3, Math.max(41, h - 12), w * 0.4, 7, 3, p.solid); }],
    profile: [64, 50, (w, h, p) => { C(20, 20, 11, p.solid); B(38, 12, (w - 50) * 0.85, 6, N.muted); B(38, 23, (w - 50) * 0.55, 4, N.rule); path(`M8 36H${n(w - 8)}`, N.edge, 1); lines(8, 42, w - 16, h - 5, { gap: 5 }); }],
    gallery: [60, 50, (w, h, p, r, rnd) => { B(8, 7, w * 0.34, 5, N.rule); const cw = (w - 24) / 3, ch = (h - 26) / 2, hot = rnd() * 6 | 0; for (let i = 0; i < 6; i++) R(8 + (i % 3) * (cw + 4), 18 + Math.floor(i / 3) * (ch + 4), cw, ch, 3, i === hot ? p.solid : i % 2 ? N.rule : N.edge); }],
    timeline: [56, 46, (w, h, p) => { path(`M14 8V${h - 8}`, N.rule, 2); for (let y = 10, i = 0; y + 8 <= h - 4; y += 15, i++) { C(14, y + 3, 4, i === 0 ? p.solid : N.card, i === 0 ? null : N.rule, 2); B(26, y, (w - 38) * [0.8, 0.6, 0.9][i % 3], 5, N.rule); B(26, y + 8, (w - 38) * 0.45, 3.5, N.edge); } }],
    search: [60, 46, (w, h, p) => { R(8, 8, w - 16, 12, 6, N.card, N.rule, 1.5); C(17, 14, 3.5, null, N.muted, 1.5); B(26, 12, (w - 50) * 0.5, 4, N.rule); for (let y = 28, i = 0; y + 7 <= h - 4; y += 12, i++) { R(8, y, 7, 7, 2, i ? N.edge : p.solid); B(20, y + 1, (w - 32) * [0.85, 0.6, 0.75][i % 3], 4.5, N.rule); } }],
    heat: [64, 46, (w, h, p, r, rnd) => { const cols = Math.floor((w - 16) / 9), rows = Math.floor((h - 16) / 8); for (let i = 0; i < cols * rows; i++) { const v = rnd(); R(8 + (i % cols) * 9, 8 + Math.floor(i / cols) * 8, 7, 6, 1.5, v > 0.9 ? p.solid : v > 0.6 ? N.rule : v > 0.3 ? N.edge : N.canvas); } }],
    stack: [56, 46, (w, h, p, r, rnd) => { for (let y = 9, i = 0; y + 14 <= h - 4; y += 17, i++) { B(8, y, w * 0.3, 4, N.rule); R(8, y + 7, w - 16, 6, 3, N.edge); R(8, y + 7, (w - 16) * (0.3 + rnd() * 0.65), 6, 3, i === 0 ? p.solid : N.muted); } }],
    invoice: [64, 52, (w, h, p) => { B(8, 8, w * 0.3, 6, N.muted); B(w - 8 - w * 0.2, 8, w * 0.2, 5, N.rule); for (let y = 22, i = 0; y + 5 <= h - 22; y += 9, i++) { B(8, y, (w - 16) * [0.5, 0.4, 0.6][i % 3], 4.5, N.rule); B(w - 24, y, 16, 4.5, N.edge); } path(`M8 ${h - 20}H${n(w - 8)}`, N.edge, 1); R(w - 8 - w * 0.4, h - 15, w * 0.4, 9, 3, p.solid); }],
    banner: [56, 46, (w, h, p) => { R(6, 7, w - 12, 17, 4, N.canvas, N.rule, 1.2); C(15, 15.5, 3.8, p.solid); B(24, 12, (w - 44) * 0.8, 4.5, N.muted); B(24, 18, (w - 44) * 0.5, 3.5, N.rule); lines(8, 31, w - 16, h - 5, { gap: 5 }); }],
  };
  /* The one app the story is about: its score was never taken. */
  const unmeasured = [64, 50, (w, h) => { k.raw(k.glyph('gauge', w * 0.1, h * 0.2, Math.min(h * 0.6, 34), N.muted, 1.8)); k.pending(w * 0.72, h / 2, 11); }];
  return { T, unmeasured, R, n };
}

export const SITE = {
  /* ---- Agent Review opener (.cc-brief-art), 2026-11-18: wordless, 480x480,
     the SAP overview's hand, each a flow: an agent to three options to a
     person; a batch dropping into the archive, the truck among it; one
     batch splitting two ways, undo or stop for a review. The owner chose
     these from three sets (this one, one object each, and painted scenes). */
  'agent-review/hero-what': () => {
    const k = tile();
    k.card(120, 24, 240, 88, { r: 22, sw: 2 });
    k.chip('terminal', 140, 36, 64);
    k.bars(224, 62, [104], { h: 12, fill: N.rule });
    k.line('M240 112V150', { w: 2 });
    [24, 176, 328].forEach((x, i) => {
      k.card(x, 168, 128, 150, { r: 20, sw: 2, stroke: i === 1 ? k.c.fill : N.edge });
      k.raw(k.glyph('layout', x + 34, 188, 60, i === 1 ? k.c.ink : N.muted, 2));
      k.bars(x + 22, 270, [84, 56], { h: 10, gap: 10, fill: N.rule });
    });
    k.line('M240 318V368', { accent: true, w: 2.5 });
    k.card(196, 380, 88, 88, { r: 24, sw: 2 });
    k.raw(k.glyph('person', 214, 398, 52, k.c.ink, 2));
    return k.svg(480, 480);
  },
  'agent-review/hero-problem': () => {
    const k = tile();
    const row = (x, y, rot, g, hi) => {
      k.raw(`<g transform="rotate(${rot} ${x + 70} ${y + 40})">`);
      k.card(x, y, 140, 80, { r: 18, sw: 2, stroke: hi ? k.c.fill : N.edge });
      k.raw(k.glyph(g, x + 16, y + 18, 44, hi ? k.c.ink : N.muted, 2));
      k.bars(x + 72, y + 26, [48, 32], { h: 9, gap: 9, fill: N.rule });
      k.raw('</g>');
    };
    row(28, 64, -9, 'person', false);
    row(312, 72, 8, 'person', false);
    row(170, 28, -3, 'truck', true);
    k.line('M240 120V232', { accent: true, w: 2.5, dash: '2 10' });
    k.card(72, 252, 336, 52, { r: 14, sw: 2 });
    k.card(92, 300, 296, 156, { r: 18, sw: 2 });
    k.raw(`<rect x="200" y="338" width="80" height="14" rx="7" fill="${N.rule}"/>`);
    k.raw(k.glyph('box', 214, 372, 52, N.muted, 2));
    return k.svg(480, 480);
  },
  'agent-review/hero-decision': () => {
    const k = tile();
    k.card(24, 178, 132, 124, { r: 22, sw: 2 });
    k.raw(k.glyph('listChecks', 56, 206, 68, k.c.ink, 2));
    k.curve(156, 222, 304, 104, { w: 2 });
    k.curve(156, 258, 304, 376, { accent: true, w: 2.5 });
    k.card(304, 40, 152, 128, { r: 22, sw: 2 });
    k.chip('undo', 324, 60, 56);
    k.done(412, 88, 18);
    k.bars(324, 136, [100], { h: 10, fill: N.rule });
    k.card(304, 312, 152, 128, { r: 22, sw: 2, stroke: k.c.fill });
    k.chip('pause', 324, 332, 56);
    k.raw(k.glyph('truck', 392, 340, 40, k.c.ink, 2));
    k.bars(324, 408, [100], { h: 10, fill: N.rule });
    return k.svg(480, 480);
  },
  /* USDA: four phases in order, each step with the effort it took (the old
     picture's three circle sizes, as one to three bars). Visual design
     carries the two largest steps and takes the key edge. */
  'usda/design-process': () => {
    const k = kit('site');
    const phases = [
      ['Research', [['Onboarding and analysis', 1], ['Stakeholder and user interviews', 2], ['Persona workshop', 1], ['Journey mapping workshop', 1]]],
      ['Information architecture', [['Sitemap and content strategy', 2], ['User flows', 1]]],
      ['Visual design', [['Design concepts', 2], ['Design concept testing', 1], ['Low-fidelity wireframes', 3], ['High-fidelity wireframes', 3]]],
      ['User interface', [['Clickable prototype', 2], ['Usability testing', 1], ['Digital style guide', 1], ['Component library', 2]]],
    ];
    const W2 = 1280, cw = 576, ch = 356, x0 = 48, gx = 32, y0 = 48, gy = 52;
    phases.forEach(([title, steps], n) => {
      const x = x0 + (n % 2) * (cw + gx), y = y0 + Math.floor(n / 2) * (ch + gy);
      k.card(x, y, cw, ch, n === 2 ? { stroke: k.c.fill, sw: 2.5 } : {});
      disc(k, x + 48, y + 50, n + 1, 22);
      k.text(x + 86, y + 61, title, { size: 30 });
      k.raw(`<path d="M${x + 28} ${y + 98}H${x + cw - 28}" stroke="${N.edge}" stroke-width="1.5"/>`);
      steps.forEach(([s, e], i) => {
        const ry = y + 146 + i * 58;
        k.text(x + 28, ry, s, { size: 25, weight: 500 });
        effort(k, x + cw - 90, ry, e);
      });
    });
    // 1 -> 2 and 3 -> 4 across; 2 -> 3 down and back.
    k.line(`M${x0 + cw + 4} ${y0 + 50}H${x0 + cw + gx - 4}`, { accent: true });
    k.line(`M${x0 + cw + 4} ${y0 + ch + gy + 50}H${x0 + cw + gx - 4}`, { accent: true });
    const xa = x0 + cw + gx + cw / 2, xb = x0 + cw / 2, ya = y0 + ch, yb = y0 + ch + gy;
    k.line(`M${xa} ${ya + 4}V${ya + gy / 2}H${xb}V${yb - 4}`, { accent: true });
    return k.svg(W2, 860);
  },

  /* SAP: who takes part in each step of handling app feedback. A filled
     block is a role at work in that step; the accent blocks are the ones
     the old picture marked in yellow. The UX Lead lane is the key element. */
  'sap/feedback-workflow': () => {
    const k = kit('site');
    const steps = [['Est. feedback', 'strategy'], ['Monitor', 'feedback'], ['Analyze and', 'prioritize'], ['Implement', 'changes'], ['Monitor', 'impact'], ['Communicate', 'with users'], ['Maintain', 'compliance']];
    const roles = [
      ['Product', 'owner', [1, 1, 1, 2, 1, 1, 1]],
      ['Portfolio', 'analyst', [0, 1, 0, 0, 1, 0, 0]],
      ['UX Lead', '(that’s me)', [1, 1, 0, 2, 0, 0, 1], true],
      ['Developer', '', [1, 0, 0, 0, 0, 0, 0]],
      ['Business', 'analyst', [1, 0, 0, 2, 0, 0, 0]],
      ['Project', 'manager', [1, 0, 0, 2, 0, 0, 0]],
    ];
    const X = 280, CW = 136, Y = 150, RH = 96;
    steps.forEach(([a, b], i) => {
      const cx = X + i * CW + CW / 2;
      disc(k, cx, 44, i + 1, 17);
      k.text(cx, 96, a, { size: 20, anchor: 'middle' });
      k.text(cx, 122, b, { size: 20, anchor: 'middle' });
    });
    roles.forEach(([a, b, cells, me], r) => {
      const y = Y + r * RH;
      if (me) k.card(28, y + 6, 1216, RH - 12, { fill: k.c.soft, stroke: k.c.fill, sw: 2.5, shadow: false, r: 16 });
      else if (r) k.raw(`<path d="M40 ${y}H1232" stroke="${N.edge}" stroke-width="1.5"/>`);
      k.chip('person', 48, y + RH / 2 - 24, 48);
      k.text(112, y + RH / 2 + (b ? -4 : 8), a, { size: 22 });
      if (b) k.text(112, y + RH / 2 + 24, b, me ? { size: 20, weight: 500, fill: N.muted } : { size: 22 });
      cells.forEach((v, i) => {
        if (!v) return;
        const x = X + i * CW + 14, w = CW - 28, cy = y + 20;
        k.card(x, cy, w, RH - 40, { r: 12, ...(v === 2 ? { fill: k.c.soft, stroke: k.c.fill, sw: 2 } : {}) });
        k.bars(x + 14, cy + 16, [w - 28, w - 52], { h: 8, gap: 10, fill: v === 2 ? k.c.fill : N.edge });
      });
    });
    return k.svg(1280, 780);
  },

  /* how-i-work rail: the loop in four tiles. */
  /* 1. The system: what each part means, its rules, its checks, one stack. */
  'how-i-work/loop-1': () => {
    const k = tile();
    k.raw(`<path d="M40 52V188" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
    [['layers', 160], ['listChecks', 130], ['braces', 100]].forEach(([g, b], i) => {
      k.raw(`<path d="M40 ${52 + i * 68}H58" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
      row(k, 64, 24 + i * 68, 260, g, { bars: [b] });
    });
    return tsvg(k);
  },
  /* 2. People and agents build from the system, in days. */
  'how-i-work/loop-2': () => {
    const k = tile();
    k.chip('person', 74, 20, 52);
    k.chip('terminal', 214, 20, 52);
    k.line('M100 80V132', { accent: true });
    k.line('M240 80V132', { accent: true });
    k.card(40, 138, 280, 80, { stroke: k.c.fill, sw: 2.5, r: 16 });
    k.chip('layout', 58, 156, 44);
    k.bars(118, 166, [150, 100], { h: 10, gap: 12 });
    return tsvg(k);
  },
  /* 3. The checks: every change passes them, or waits. */
  'how-i-work/loop-3': () => {
    const k = tile();
    k.card(24, 60, 312, 120, { r: 18, sw: 2 });
    k.raw(`<path d="M64 120H296" stroke="${N.rule}" stroke-width="3"/>`);
    [72, 140, 208].forEach((x) => k.done(x, 120, 20));
    k.pending(280, 120, 22);
    return tsvg(k);
  },
  /* 4. A person decides what the checks can't; the system keeps the answer. */
  'how-i-work/loop-4': () => {
    const k = tile();
    k.card(96, 22, 240, 132, { stroke: k.c.fill, sw: 2.5, r: 18 });
    k.chip('person', 114, 40, 44);
    k.bars(172, 52, [130], { h: 10 });
    k.button(114, 100, '', true, { w: 96, size: 14 });
    k.button(220, 100, '', false, { w: 96, size: 14 });
    k.line('M96 100C40 100 30 200 96 204H150', { accent: true });
    k.chip('layers', 156, 180, 44);
    return tsvg(k);
  },

  /* STO rail: where the design system came from, in four tiles. */
  /* 1. A style guide and its patterns: one standard for the apps. */
  'sto/lineage-1-guide': () => {
    const k = tile();
    k.card(24, 28, 188, 184, { r: 18, sw: 2 });
    k.chip('book', 44, 48, 48);
    [k.c.ink, k.c.soft, N.rule].forEach((f, i) => k.raw(`<rect x="${44 + i * 44}" y="${118}" width="34" height="34" rx="8" fill="${f}" stroke="${N.rule}" stroke-width="1.5"/>`));
    k.bars(44, 170, [140, 96], { h: 9, gap: 11 });
    ['layout', 'sliders'].forEach((g, i) => row(k, 228, 40 + i * 92, 112, g, { bars: [36] }));
    return tsvg(k);
  },
  /* 2. A larger design system that work folded into. */
  'sto/lineage-2-system': () => {
    const k = tile();
    k.card(20, 20, 320, 200, { r: 20, sw: 2 });
    const g = ['layout', 'table', 'toggle', 'sliders', 'book', 'dialog'];
    g.forEach((name, i) => {
      const x = 40 + (i % 3) * 98, y = 40 + Math.floor(i / 3) * 90;
      k.card(x, y, 84, 74, { r: 12, shadow: false, fill: i === 4 ? k.c.soft : N.card, stroke: i === 4 ? k.c.fill : N.edge, sw: 2 });
      k.raw(k.glyph(name, x + 24, y + 19, 36));
    });
    return tsvg(k);
  },
  /* 3. Rebuilt in Claude Code: the code, and the components it holds. */
  'sto/lineage-3-code': () => {
    const k = tile();
    win(k, 24, 24, 220, 190, { sw: 2 });
    k.raw(k.glyph('code', 46, 80, 40, k.c.ink, 1.8));
    k.bars(46, 140, [150, 110, 130], { h: 9, gap: 12 });
    k.card(206, 40, 130, 50, { r: 12, sw: 2 });
    k.raw(`<rect x="222" y="55" width="40" height="20" rx="10" fill="${k.c.fill}"/><circle cx="252" cy="65" r="6" fill="${N.card}"/>`);
    k.bars(272, 60, [48], { h: 10 });
    k.card(232, 110, 104, 50, { r: 12, sw: 2 });
    k.raw(`<rect x="248" y="125" width="72" height="20" rx="10" fill="${k.c.soft}" stroke="${k.c.fill}" stroke-width="1.5"/>`);
    k.card(206, 178, 130, 44, { r: 12, sw: 2 });
    k.raw(`<rect x="220" y="190" width="20" height="20" rx="5" fill="${k.c.soft}" stroke="${N.rule}" stroke-width="1.5"/>`);
    k.bars(250, 195, [70], { h: 10 });
    return tsvg(k);
  },
  /* 4. Synced to Figma: the code and the design file kept in step. */
  'sto/lineage-4-sync': () => {
    const k = tile();
    win(k, 16, 36, 128, 170, { sw: 2 });
    k.raw(k.glyph('code', 32, 90, 32, k.c.ink, 1.8));
    k.bars(32, 140, [90, 70, 80], { h: 8, gap: 10 });
    win(k, 216, 36, 128, 170, { sw: 2, stroke: k.c.fill });
    k.raw(`<rect x="232" y="88" width="60" height="18" rx="9" fill="${k.c.fill}"/>`);
    k.raw(`<rect x="232" y="118" width="96" height="22" rx="6" fill="${k.c.soft}" stroke="${N.rule}" stroke-width="1.5"/>`);
    k.bars(232, 156, [80], { h: 8 });
    k.line('M152 104C170 92 190 92 208 104', { accent: true, w: 2.5 });
    k.line('M208 144C190 156 170 156 152 144', { accent: true, w: 2.5 });
    return tsvg(k);
  },

  /* Agent Review rail: what the case study still has to do. */
  /* Say: who did each stage, the designer or the agent. */
  'agent-review/next-say': () => {
    const k = tile();
    k.raw(`<path d="M40 120H320" stroke="${N.rule}" stroke-width="3"/>`);
    [['person', 1], ['terminal', 0], ['person', 1], ['terminal', 0]].forEach(([g, up], i) => {
      const x = 58 + i * 82;
      k.raw(`<circle cx="${x}" cy="120" r="8" fill="${k.c.fill}"/>`);
      const y = up ? 32 : 154;
      k.raw(`<path d="M${x} ${up ? 84 : 128}V${up ? 112 : 154}" stroke="${N.rule}" stroke-width="2"/>`);
      k.chip(g, x - 26, y, 52);
    });
    return tsvg(k);
  },
  /* Tell: the simulated run apart from the working software. */
  'agent-review/next-tell': () => {
    const k = tile();
    k.card(28, 24, 300, 84, { r: 16, sw: 2, dash: '7 6', shadow: false, fill: 'none', stroke: N.muted });
    k.raw(`<rect x="48" y="44" width="44" height="44" rx="12" fill="${N.edge}"/>`);
    k.bars(108, 54, [140, 90], { h: 9, gap: 11 });
    k.pending(296, 66, 16);
    k.card(28, 132, 300, 84, { r: 16, stroke: k.c.fill, sw: 2.5 });
    k.chip('monitorPlay', 48, 152, 44);
    k.bars(108, 162, [140, 90], { h: 9, gap: 11 });
    k.done(296, 174, 16);
    return tsvg(k);
  },
  /* Weigh: three directions side by side, none taken on trust. */
  'agent-review/next-weigh': () => {
    const k = tile();
    k.raw(k.glyph('balance', 132, 6, 96, k.c.ink, 1.4));
    [24, 132, 240].forEach((x, i) => {
      k.card(x, 136, 96, 78, { r: 14, sw: 2 });
      k.raw(`<rect x="${x + 14}" y="152" width="26" height="26" rx="7" fill="${N.edge}"/>`);
      k.bars(x + 14, 190, [66], { h: 9 });
      k.bars(x + 48, 158, [34], { h: 9 });
    });
    return tsvg(k);
  },

  /* ---- Case-study overview tiles (.cc-brief-art): wordless, 480x480 for
     SAP and 420x480 for USDA, each a picture of what its block says. The
     three SAP tiles share one square canvas, one 24px margin, and one scale,
     so the row reads as three pictures of the same weight: a heap, a stack,
     and a hub (2026-11-17). */
  /* SAP problem: forty apps, each laid out its own way, in no order; one of
     them has a gauge nobody ever read. */
  'sap/overview-problem': () => {
    const k = tile();
    const rnd = mulberry(40);
    const { T, unmeasured, n } = heapApps(k);
    k.raw(`<filter id="shs" x="-30%" y="-30%" width="160%" height="175%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="${N.ink}" flood-opacity="0.13"/></filter>`);
    /* Palettes: a header fill, the ink drawn on it, and a solid for marks. */
    const PAL = [
      [0.12, { hd: N.ink, on: N.card, solid: N.ink }],
      [0.3, { hd: N.muted, on: N.card, solid: N.muted }],
      [0.3, { hd: k.c.soft, on: N.muted, solid: N.muted }],
      [0.28, { hd: N.edge, on: N.muted, solid: N.muted }],
    ];
    const pick = () => { let r = rnd(); for (const [wgt, p] of PAL) { if ((r -= wgt) < 0) return p; } return PAL[0][1]; };
    const SIZES = [[68, 52], [60, 48], [56, 56], [80, 52], [52, 64], [66, 46], [74, 58], [60, 44], [52, 54], [68, 56]];
    const names = Object.keys(T);
    /* Forty tiles: twenty-eight layouts, thirty-nine draws of them with a
       few coming round twice, and the gauge tile as the fortieth. */
    const queue = [...names, ...names];
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    /* A layout that comes round twice is mirrored and recolored, so no two
       tiles are the same drawing. */
    const seen = {};
    const tiles = queue.slice(0, 39).map((name) => {
      const [mw, mh] = T[name];
      const fit = SIZES.filter(([w, h]) => w >= mw && h >= mh);
      const [w, h] = (fit.length ? fit : [[Math.max(mw, 76), Math.max(mh, 54)]])[Math.floor(rnd() * (fit.length || 1))];
      let p = pick();
      for (let i = 0; seen[name] && i < 8 && p === seen[name]; i++) p = pick();
      const mirror = !!seen[name];
      seen[name] = seen[name] || p;
      return { w, h, name, draw: T[name][2], p, mirror, r: 5 + Math.floor(rnd() * 8) };
    });
    tiles.push({ w: unmeasured[0] + 12, h: unmeasured[1] + 6, name: 'gauge', draw: unmeasured[2], p: PAL[1][1], r: 10 });
    /* Big ones first, so the small ones find the gaps. Each tile tries a few
       places and keeps the roomiest, which spreads the heap without ever
       lining it up. */
    const M = 18, placed = [];
    tiles.sort((a, b) => (b.name === 'gauge') - (a.name === 'gauge') || b.w * b.h - a.w * a.h).forEach((t) => {
      let best = null;
      for (let c = 0; c < 10; c++) {
        const ex = t.w / 2 + 5, ey = t.h / 2 + 5;
        const x = M + ex + rnd() * (480 - 2 * (M + ex)), y = M + ey + rnd() * (480 - 2 * (M + ey));
        const s = placed.reduce((lo, o) => Math.min(lo, Math.max(Math.abs(x - o.x) / ((t.w + o.w) / 2), Math.abs(y - o.y) / ((t.h + o.h) / 2))), 9);
        if (!best || s > best.s) best = { x, y, s };
      }
      Object.assign(t, { x: best.x, y: best.y, a: (rnd() - 0.5) * 18 });
      placed.push(t);
    });
    for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
    /* The gauge tile is drawn last, on top of the heap. */
    tiles.sort((a, b) => (a.name === 'gauge') - (b.name === 'gauge'));
    tiles.forEach((t) => {
      k.raw(`<g transform="translate(${n(t.x - t.w / 2)} ${n(t.y - t.h / 2)}) rotate(${n(t.a)} ${n(t.w / 2)} ${n(t.h / 2)})">`);
      k.raw(`<rect width="${t.w}" height="${t.h}" rx="${t.r}" fill="${N.card}" stroke="${N.rule}" stroke-width="1.75" filter="url(#shs)"/>`);
      if (t.mirror) k.raw(`<g transform="translate(${t.w} 0) scale(-1 1)">`);
      t.draw(t.w, t.h, t.p, t.r, rnd);
      if (t.mirror) k.raw('</g>');
      k.raw('</g>');
    });
    return k.svg(480, 480);
  },
  /* SAP solution: one system, the same layout in every app, each with its
     score. Drawn to the heap's width and the hub's weight: rows run margin
     to margin and every icon is as large as the hub's. */
  'sap/overview-solution': () => {
    const k = tile();
    k.card(120, 24, 240, 88, { r: 22, stroke: k.c.fill, sw: 2.5 });
    k.chip('layers', 140, 36, 64);
    k.bars(224, 62, [104], { h: 12, fill: N.rule });
    [154, 256, 358].forEach((y) => {
      k.card(24, y, 432, 92, { r: 20, sw: 2 });
      k.raw(k.glyph('layout', 50, y + 18, 56, k.c.ink, 2));
      k.bars(134, y + 27, [170, 118], { h: 12, gap: 14, fill: N.rule });
      k.done(404, y + 46, 22);
    });
    k.line('M240 112V146', { accent: true, w: 3 });
    return k.svg(480, 480);
  },
  /* SAP part: the UX lead at the middle of testing, interviews, audits,
     the style guide, the release checks, and training. Each piece of work is
     a white tile with its icon at 58px, so it reads on the tea ground, where
     a pale chip had looked transparent (owner, 2026-11-17). */
  'sap/overview-part': () => {
    const k = tile();
    const S = 96, xs = [24, 192, 360], ys = [24, 360];
    const hub = { x: 152, y: 172, w: 176, h: 136 };
    const around = [['searchCheck', 0, 0], ['message', 1, 0], ['listChecks', 2, 0], ['book', 0, 1], ['flag', 1, 1], ['person', 2, 1]];
    around.forEach(([, i, j]) => {
      const hx = hub.x + hub.w * (0.5 + (i - 1) * 0.22);
      k.line(`M${xs[i] + S / 2} ${j ? ys[1] : ys[0] + S}L${hx} ${j ? hub.y + hub.h : hub.y}`, { head: false, w: 1.3 });
    });
    k.card(hub.x, hub.y, hub.w, hub.h, { r: 28, stroke: k.c.fill, sw: 2.5 });
    k.chip('person', hub.x + (hub.w - 84) / 2, hub.y + (hub.h - 84) / 2, 84);
    around.forEach(([g, i, j]) => {
      k.card(xs[i], ys[j], S, S, { r: 24, sw: 2 });
      k.raw(k.glyph(g, xs[i] + 19, ys[j] + 19, 58, k.c.ink, 2));
    });
    return k.svg(480, 480);
  },
  /* USDA problem: old software, spreadsheets, and paper that never agree. */
  'usda/overview-problem': () => {
    const k = tile();
    win(k, 24, 28, 220, 136, { sw: 2 });
    k.bars(44, 84, [150, 100, 120], { h: 10, gap: 12 });
    k.card(232, 186, 164, 132, { r: 14, sw: 2 });
    k.raw(k.glyph('table', 266, 204, 96, N.muted, 1.1));
    k.card(40, 304, 140, 152, { r: 10, sw: 2 });
    k.raw(k.glyph('receipt', 58, 328, 104, N.muted, 1.1));
    k.raw(`<path d="M190 172L246 222M226 300L184 338" stroke="${N.muted}" stroke-width="2.5" stroke-dasharray="6 7" stroke-linecap="round"/>`);
    k.pending(214, 196, 18);
    k.pending(304, 400, 24);
    return k.svg(420, 480);
  },
  /* USDA solution: a website, a portal, and reports, one record under all three. */
  'usda/overview-solution': () => {
    const k = tile();
    [['external', 30], ['layout', 160], ['bars', 290]].forEach(([g, x]) => {
      k.card(x, 40, 100, 120, { r: 16, sw: 2 });
      k.chip(g, x + 22, 62, 56);
      k.bars(x + 18, 134, [64], { h: 9 });
      k.line(`M${x + 50} 164V${x === 160 ? 296 : 260}${x === 160 ? '' : `Q${x + 50} 290 ${x < 160 ? x + 90 : x + 10} 300`}`, { accent: true, head: false, w: 2.5 });
    });
    k.card(90, 300, 240, 140, { r: 20, stroke: k.c.fill, sw: 2.5 });
    k.chip('database', 112, 324, 56);
    k.bars(184, 340, [120, 80], { h: 10, gap: 12 });
    [0, 1, 2].forEach((i) => k.done(132 + i * 76, 406, 14));
    return k.svg(420, 480);
  },
  /* USDA part: research, information architecture, visual design, and the
     design system, led in order. */
  'usda/overview-part': () => {
    const k = tile();
    k.raw(`<path d="M44 76V404" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
    [['searchCheck', 120], ['branch', 100], ['layout', 140], ['layers', 110]].forEach(([g, b], i) => {
      const y = 44 + i * 110;
      k.raw(`<circle cx="44" cy="${y + 32}" r="9" fill="${k.c.fill}"/>`);
      k.card(72, y, 320, 72, { r: 16, sw: 2, ...(i === 3 ? { stroke: k.c.fill, sw: 2.5 } : {}) });
      k.chip(g, 88, y + 12, 48);
      k.bars(152, y + 22, [b + 40, b - 20], { h: 10, gap: 10 });
    });
    return k.svg(420, 480);
  },

  /* ---- SAP's four moves (.cc-move-img): 384 square, printed at 8rem, so
     one idea each and every stroke heavy. The step's number disc sits over
     the lower third, so every drawing keeps above y 244. */
  'sap/move-foundation': () => {
    const k = tile();
    [52, 156, 260].forEach((x) => { k.card(x, 24, 72, 92, { r: 14, sw: 3 }); k.bars(x + 14, 46, [44, 28], { h: 10, gap: 12 }); k.line(`M${x + 36} 122V150`, { accent: true, w: 3.5, head: false }); });
    k.card(36, 152, 312, 88, { r: 20, stroke: k.c.fill, sw: 3.5 });
    k.chip('layers', 58, 168, 56);
    k.bars(134, 184, [170, 110], { h: 12, gap: 14 });
    return k.svg(384, 384);
  },
  'sap/move-feedback': () => {
    const k = tile();
    const cy = 134, r = 108;
    k.raw(`<circle cx="192" cy="${cy}" r="${r}" fill="none" stroke="${k.c.ground}" stroke-width="3"/>`);
    k.line(`M192 ${cy - r}A${r} ${r} 0 0 1 ${192 + r} ${cy}`, { accent: true, w: 4 });
    k.line(`M192 ${cy + r}A${r} ${r} 0 0 1 ${192 - r} ${cy}`, { accent: true, w: 4 });
    k.card(112, cy - 52, 160, 104, { r: 20, sw: 3 });
    k.chip('message', 128, cy - 36, 56);
    k.bars(196, cy - 22, [58, 40], { h: 12, gap: 14 });
    k.bars(130, cy + 30, [120], { h: 10 });
    return k.svg(384, 384);
  },
  'sap/move-routine': () => {
    const k = tile();
    k.raw(`<path d="M52 128H332" stroke="${N.rule}" stroke-width="5"/>`);
    [62, 149, 236, 323].forEach((x) => k.done(x, 128, 34));
    return k.svg(384, 384);
  },
  'sap/move-ownership': () => {
    const k = tile();
    [40, 150, 260].forEach((x, i) => {
      k.card(x, 40, 84, 196, { r: 16, sw: 3, ...(i === 1 ? { stroke: k.c.fill, sw: 3.5 } : {}) });
      k.chip('person', x + 13, 58, 58);
      k.bars(x + 16, 140, [52], { h: 10 });
      k.done(x + 42, 190, 22);
    });
    return k.svg(384, 384);
  },

  /* ---- Agent Review on the Inspiration to Aisle trail: what it is, as one
     card, on the trail's charcoal ground. 1280x720, printed about 380 wide,
     so every word is set large. */
  'agent-review/card': () => {
    const k = kit('site');
    k.card(70, 30, 1140, 660, { r: 32, sw: 2 });
    k.chip('reviewList', 120, 76, 92);
    k.text(236, 140, 'Agent Review', { size: 58 });
    k.text(122, 250, 'An agent built three directions', { size: 40, weight: 500, fill: N.muted });
    [['A', 0], ['B', 1], ['C', 0]].forEach(([t, rec], i) => {
      const x = 122 + i * 352;
      k.card(x, 290, 320, 170, { r: 22, shadow: false, fill: N.card, stroke: N.rule, sw: 2.5 });
      k.text(x + 30, 360, `Direction ${t}`, { size: 38 });
      if (rec) k.pill(x + 30, 388, 'Agent pick', 'neutral', { size: 28 });
      else k.bars(x + 30, 404, [200], { h: 14 });
    });
    k.pending(150, 590, 28);
    k.text(198, 604, 'You decide which ships', { size: 42 });
    k.button(860, 556, 'Decide', true, { size: 38, w: 300 });
    return k.svg(1280, 720);
  },
};
