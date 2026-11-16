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
   grammar as the heroes, so the landing reads as their table of contents. */
function flow(ch, steps) {
  const k = kit(ch);
  const n = steps.length, gap = n === 4 ? 52 : 78, w = n === 4 ? 248 : 336, h = 220;
  const total = n * w + (n - 1) * gap, x0 = (W - total) / 2;
  const top = (i) => 250 + (i % 2 ? 44 : -20);
  steps.forEach(([icon, t], i) => {
    const x = x0 + i * (w + gap), y = top(i);
    k.card(x, y, w, h, i === n - 1 ? { stroke: k.c.fill, sw: 2.5 } : {});
    k.chip(icon, x + 26, y + 28, 58);
    k.text(x + 100, y + 68, t, { size: n === 4 ? 30 : 32 });
    k.bars(x + 28, y + 134, [w - 80, w - 140], { h: 11, gap: 18 });
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
    const k = kit(3);
    k.card(120, 160, 460, 400);
    k.head(148, 188, 'listChecks', 'Define the bar', { size: 30, s: 52 });
    ['Typical cases', 'Edge cases', 'Must refuse'].forEach((t, i) => {
      const y = 316 + i * 70;
      k.raw(`<circle cx="166" cy="${y}" r="12" fill="${k.c.soft}" stroke="${k.c.fill}" stroke-width="2"/>`);
      k.text(196, y + 9, t, { size: 25, weight: 500 });
    });
    k.curve(580, 360, 700, 360, { accent: true });
    k.card(700, 180, 460, 360, { stroke: k.c.fill, sw: 2 });
    k.head(728, 208, 'shield', 'Evaluate and ship', { size: 30, s: 52 });
    [0, 1, 2].forEach((i) => {
      const y = 330 + i * 64;
      k.bars(730, y - 5, [280], { h: 10 });
      k.done(1110, y, 15);
    });
    return k.svg(W, H, { zoom: 1.13 });
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

export const SITE = {
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

  /* ---- Case-study overview tiles (.cc-brief-art): wordless, 400x480 for
     SAP and 420x480 for USDA, each a picture of what its block says. */
  /* SAP problem: forty apps, each laid out its own way; nobody measured. */
  'sap/overview-problem': () => {
    const k = tile();
    const apps = [[24, 40, 'layout'], [208, 24, 'table'], [40, 176, 'sliders'], [216, 160, 'dialog']];
    apps.forEach(([x, y, g], i) => {
      k.card(x, y, 160, 120, { r: 16, sw: 2 });
      k.raw(k.glyph(g, x + 16, y + 16, 36, N.muted, 1.8));
      k.bars(x + (i % 2 ? 16 : 64), y + (i % 2 ? 72 : 28), i % 2 ? [128, 90] : [80, 60], { h: 10, gap: 12 });
    });
    k.card(96, 330, 208, 120, { r: 18, sw: 2 });
    k.raw(k.glyph('gauge', 122, 352, 56, N.muted, 1.6));
    k.pending(250, 390, 22);
    return k.svg(400, 480);
  },
  /* SAP solution: one system, the same layout in every app, each with its score. */
  'sap/overview-solution': () => {
    const k = tile();
    k.card(100, 24, 200, 84, { r: 18, stroke: k.c.fill, sw: 2.5 });
    k.chip('layers', 118, 42, 48);
    k.bars(180, 58, [100], { h: 10 });
    [148, 260, 372].forEach((y, i) => {
      k.card(40, y, 320, 92, { r: 16, sw: 2 });
      k.chip('layout', 58, y + 22, 48);
      k.bars(124, y + 32, [130, 90], { h: 10, gap: 12 });
      k.done(318, y + 46, 18);
    });
    k.line('M200 108V140', { accent: true, w: 3 });
    return k.svg(400, 480);
  },
  /* SAP part: the UX lead at the middle of testing, interviews, audits,
     the style guide, the release checks, and training. */
  'sap/overview-part': () => {
    const k = tile();
    k.card(130, 176, 140, 128, { r: 20, stroke: k.c.fill, sw: 2.5 });
    k.chip('person', 164, 204, 72);
    const around = [['searchCheck', 40, 40], ['message', 176, 24], ['listChecks', 312, 40], ['book', 40, 384], ['flag', 176, 400], ['person', 312, 384]];
    around.forEach(([g, x, y]) => {
      k.raw(`<path d="M${x + 24} ${y < 200 ? y + 48 : y}L200 ${y < 200 ? 176 : 304}" stroke="${N.rule}" stroke-width="2"/>`);
      k.chip(g, x, y, 48);
    });
    return k.svg(400, 480);
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

  /* Innovators problem: four teams, each in its own look and its own
     words, reaching for each other and never connecting. */
  'innovators/overview-problem': () => {
    const k = tile();
    k.card(24, 32, 176, 112, { r: 22, sw: 2 });
    k.chip('person', 40, 48, 44);
    k.bars(96, 58, [84, 56], { h: 10, gap: 12 });
    k.bars(40, 112, [140], { h: 8 });
    win(k, 232, 60, 164, 120, { r: 8, sw: 2 });
    k.raw(k.glyph('message', 292, 112, 48, N.muted, 1.6));
    k.card(48, 268, 140, 172, { r: 6, sw: 2 });
    k.raw(k.glyph('docLayout', 78, 292, 80, N.muted, 1.2));
    k.bars(70, 392, [96, 64], { h: 8, gap: 10 });
    k.card(248, 300, 148, 116, { r: 30, sw: 2 });
    k.chip('person', 298, 316, 48);
    k.bars(282, 380, [80], { h: 8 });
    k.raw(`<path d="M120 152L136 204M256 192L234 226M196 356L232 358" stroke="${N.muted}" stroke-width="2.5" stroke-dasharray="6 7" stroke-linecap="round"/>`);
    k.pending(144, 224, 18);
    k.pending(224, 246, 16);
    return k.svg(420, 480);
  },
  /* Innovators solution: one design system feeding a set of templates,
     and one platform where the network meets. */
  'innovators/overview-solution': () => {
    const k = tile();
    k.card(110, 24, 200, 84, { r: 18, stroke: k.c.fill, sw: 2.5 });
    k.chip('layers', 128, 42, 48);
    k.bars(190, 58, [96], { h: 10 });
    k.line('M210 108V134', { accent: true, head: false, w: 3 });
    k.line('M70 150V134H350V150', { accent: true, head: false, w: 2.5 });
    [['docLayout', 30], ['card', 160], ['layout', 290]].forEach(([g, x]) => {
      k.card(x, 150, 100, 116, { r: 16, sw: 2 });
      k.chip(g, x + 26, 168, 48);
      k.bars(x + 18, 234, [64], { h: 9 });
      k.line(`M${x + 50} 266V${x === 160 ? 300 : 286}${x === 160 ? '' : `Q${x + 50} 300 ${x < 160 ? x + 90 : x + 10} 300`}`, { accent: true, head: false, w: 2.5 });
    });
    win(k, 70, 300, 280, 156, { r: 18, stroke: k.c.fill, sw: 2.5 });
    [0, 1, 2].forEach((i) => k.chip('person', 110 + i * 76, 362, 48));
    k.raw(`<path d="M158 386H186M234 386H262" stroke="${k.c.fill}" stroke-width="2.5" stroke-linecap="round"/>`);
    [0, 1, 2].forEach((i) => k.done(134 + i * 76, 432, 12));
    return k.svg(420, 480);
  },
  /* Innovators part: the design, led as one piece: the identity and its
     badges, the template library, and the portal's structure. */
  'innovators/overview-part': () => {
    const k = tile();
    k.card(110, 24, 200, 92, { r: 20, stroke: k.c.fill, sw: 2.5 });
    k.chip('pen', 128, 46, 48);
    k.bars(190, 62, [96], { h: 10 });
    k.raw(`<path d="M64 116V396" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
    k.raw(`<path d="M64 116Q64 70 110 70" fill="none" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
    [['shapes', 120], ['docLayout', 100], ['columns', 130]].forEach(([g, b], i) => {
      const y = 152 + i * 104;
      k.raw(`<path d="M64 ${y + 36}H92" stroke="${k.c.fill}" stroke-width="3" stroke-linecap="round"/>`);
      k.card(92, y, 300, 72, { r: 16, sw: 2 });
      k.chip(g, 108, y + 12, 48);
      k.bars(172, y + 22, [b + 40, b - 20], { h: 10, gap: 10 });
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
