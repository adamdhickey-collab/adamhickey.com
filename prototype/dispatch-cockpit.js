/* dispatch-cockpit.js -- the cockpit prototype, and nothing else.
 *
 * WHAT THIS IS. A self-directed prototype on synthetic data: one load, seven
 * trucks, four situations. Every truck, driver, town and figure below is
 * invented. Nothing here is client data, and nothing here shipped.
 *
 * HOW IT IS LAID OUT. DATA at the top is the whole scenario -- the load, the
 * fleet, the four situations, the failure records the confidence line can
 * open, the reasons the override prompt offers -- and it is meant to be tuned
 * without reading past it. Everything under DATA is mechanism: a scoring pass
 * that ranks the fleet, a hard-rule pass that runs BEFORE the scoring and
 * removes a truck from ranking rather than lowering its score, a margin test
 * that decides whether the system leads or declines to, and the rendering.
 *
 * THE FOUR THINGS IT HAS TO SHOW, each in one place:
 *   1. what went into the call        -> renderReco(), the factor list
 *   2. confidence as a record of outcomes -> renderConfidence(), held/of + the
 *                                        late loads and what differed
 *   3. an override that is cheap      -> assign() and renderWhy()
 *   4. the manual path, always whole  -> renderTable(), never collapsed
 *   and, beside all four, what to look for in this situation -> renderRail(),
 *   whose numbers applyCallouts() hangs on the cockpit after every render
 *
 * No dependencies, no build step, no animation. States are is-* classes so
 * scripts/states.mjs forces and measures the ones the page does not load in.
 */
(() => {
  'use strict';

  /* =========================================================================
     DATA -- tune the scenario here.
     ========================================================================= */
  const DATA = {
    /* The load that has to go on a truck. driveHours is the hard rule's
       number: a driver with fewer hours left than this cannot legally take
       it, whatever else is true about the truck. */
    load: {
      id: 'L-4821',
      customer: 'Northfield Foods',
      from: 'Rochester, MN',
      to: 'Milwaukee, WI',
      equipment: 'dry van',
      weight: '41,800 lb',
      window: 'pickup 1:00 to 3:00 pm today',
      due: 'deliver by 8:00 am tomorrow',
      driveHours: 5.5,
    },

    /* The fleet as the confident situation sees it. Each situation below
       patches a few of these values; the rest stay.
         dist     miles from the truck's current position to the pickup
         hos      hours of service remaining for the driver, today
         equip    what the truck is; 'reefer' can carry a dry-van load at the
                  cost of a wash-out, so it is a factor, not a rule
         onTime   [delivered on time, loads run] for THIS customer; [0, 0]
                  means no history, which is neutral, not bad
         deadhead empty miles the truck has run since its last delivery */
    fleet: [
      { id: 'T-118', driver: 'Marisol Vega',  at: 'Owatonna, MN',  dist: 38, hos: 8.4,  equip: 'dry van', onTime: [11, 12], deadhead: 12 },
      { id: 'T-207', driver: 'Dana Okafor',   at: 'Mankato, MN',   dist: 71, hos: 9.1,  equip: 'dry van', onTime: [9, 10],  deadhead: 40 },
      { id: 'T-142', driver: 'Luis Herrera',  at: 'Rochester, MN', dist: 24, hos: 7.2,  equip: 'reefer',  onTime: [4, 5],   deadhead: 9 },
      { id: 'T-131', driver: 'Priya Nair',    at: 'Austin, MN',    dist: 43, hos: 6.0,  equip: 'dry van', onTime: [8, 8],   deadhead: 22 },
      { id: 'T-114', driver: 'Sam Bergstrom', at: 'Winona, MN',    dist: 64, hos: 10.5, equip: 'dry van', onTime: [14, 14], deadhead: 48 },
      { id: 'T-166', driver: 'Chen Wei',      at: 'Red Wing, MN',  dist: 58, hos: 6.3,  equip: 'dry van', onTime: [6, 9],   deadhead: 30 },
      { id: 'T-175', driver: 'Tom Lindqvist', at: 'Faribault, MN', dist: 52, hos: 6.8,  equip: 'dry van', onTime: [0, 0],   deadhead: 35 },
    ],

    /* How the five factors are weighed. They sum to 1. The weights are never
       shown as a number on screen -- the factors are shown with their values
       and their direction -- but they are here so the ranking can be tuned. */
    weights: { dist: 0.30, hos: 0.20, equip: 0.15, onTime: 0.20, deadhead: 0.15 },

    /* Two trucks closer than this, on a 0 to 1 score, are a tie: the system
       names the tradeoff instead of picking. */
    tieMargin: 0.04,

    /* The four situations. Each patches the fleet and carries the record the
       confidence line reads. `held` and `of` are how often the top-ranked
       truck delivered on time on loads like this one; `misses` are the
       loads where it did not, kept inspectable because the pattern in the
       misses is what lets a dispatcher predict the next one. */
    scenarios: [
      {
        id: 'confident',
        tab: 'Confident',
        blurb: 'A clear leader, and every reason it leads is on the screen. The point: a recommendation you can check in ten seconds, because the reasons are beside it.',
        callouts: [
          { target: '.ck-card',       head: 'What went into the call', body: 'Five factors, each with its value and which way it cuts. No composite score, because a number would not tell you which of these to check.' },
          { target: '.ck-confidence', head: 'Confidence as a record', body: 'Not a percentage: 38 of the last 40 on time, and the two that were late are one click away, with what to watch for.' },
          { target: '.ck-fleet',      head: 'The whole fleet, always', body: 'Sort any column, assign any truck. The manual path is never behind the recommendation.' },
        ],
        try: 'Open the two late deliveries and read what differed. Then assign T-118.',
        patch: {},
        record: {
          held: 38, of: 40,
          like: 'Same lane type, a van load, a same-day pickup window.',
          misses: [
            { load: 'L-4410', what: 'The hours figure was forty minutes stale. The driver ran out twenty miles short and the load sat overnight.',
              tell: 'When the hours left are within an hour of what the run needs, the figure is worth checking against the logbook before assigning.' },
            { load: 'L-4577', what: 'The customer closed the dock early. No truck in the fleet would have made the window.',
              tell: 'Not a ranking miss. The window in the system was wrong, and the ranking cannot see that.' },
          ],
        },
      },
      {
        id: 'tie',
        tab: 'Low confidence',
        blurb: 'Two trucks within a hair of each other. The point: when the system cannot tell, it says so and names the tradeoff, instead of hiding a coin flip behind a rank.',
        callouts: [
          { target: '.ck-reco-h',     head: 'The tradeoff, in words', body: 'Distance against hours. The headline says what the choice is rather than pretending there is none.' },
          { target: '.ck-pair',       head: 'Both options, side by side', body: 'Each with the one thing it has over the other, and its full factor list underneath.' },
          { target: '.ck-confidence', head: 'The record for close calls', body: 'When the top two were this close, first place was right 19 of 31 times. Near a coin flip, so it does not pick.' },
        ],
        try: 'Pick the side of the tradeoff that matters for this load and assign it. Neither is an override, so no question follows.',
        patch: { 'T-131': { dist: 16, hos: 5.8, deadhead: 10 }, 'T-118': { dist: 41 } },
        record: {
          held: 19, of: 31,
          like: 'Loads where the top two trucks were this close on the factors.',
          misses: [
            { load: 'L-4633', what: 'Ranked first on distance; the driver ran out of hours at the receiver and the delivery slipped to morning.',
              tell: 'When the margin is distance against hours, the hours have decided it more often than not.' },
            { load: 'L-4702', what: 'Ranked first on hours; the closer truck would have made an earlier dock slot and the customer asked why it did not.',
              tell: 'The same tradeoff the other way. Which way it goes depends on this customer’s dock, which the ranking does not know.' },
          ],
        },
      },
      {
        id: 'override',
        tab: 'Override in flight',
        blurb: 'The dispatcher has just assigned the truck ranked third. The point: disagreeing with the system is cheap, and what the system does with the disagreement is said out loud.',
        callouts: [
          { target: '.ck-reco-dek', head: 'The recommendation stays', body: 'Still visible, so the difference stays visible. Nothing is undone and nothing argues.' },
          { target: '.ck-why',      head: 'One optional question, afterwards', body: 'Asked after the assignment, not before it. Skip weighs the same as Save, and a sentence says what happens with the answer.' },
          { target: '.ck-status',   head: 'What just happened', body: 'The status line says what changed and where the question is. A screen reader hears the same sentence.' },
        ],
        try: 'Save a reason, or skip. Then undo, assign T-118, and notice that no question follows.',
        patch: {},
        /* Same record as the confident situation: same lane, same data. */
        record: null,
        /* What the situation does after it loads: assign the third-ranked
           truck, which is what opens the prompt. */
        then: (api) => api.assign(api.ranked()[2].id),
      },
      {
        id: 'rule',
        tab: 'Constraint conflict',
        blurb: 'The best truck by every other measure would put its driver over hours. The point: a rule is a rule, not a low score, and it looks like one.',
        callouts: [
          { target: '.ck-rule',  head: 'The rule comes first', body: 'The darkest edge on the screen, above the recommendation rather than inside it, so it cannot be read as a bad score.' },
          { target: '.ck-card',  head: 'The best truck that can legally go', body: 'The recommendation is the leader among the trucks the rule allows, and it shows its work like any other.' },
          { target: '.ck-fleet', head: 'T-114 keeps its row', body: 'Its Assign is disabled in words, with the hours it needs beside the hours it has. Nothing disappears.' },
        ],
        try: 'Try to assign T-114 from the data table. Then sort by hours left to see the line it fell under.',
        patch: { 'T-114': { dist: 9, deadhead: 4, hos: 3.2 } },
        record: null,
      },
    ],

    /* The override prompt. Two or three likely reasons, then free text; and
       the sentence saying what the system does with the answer, because a
       prompt that does not say is a prompt people learn to skip. */
    reasons: [
      'The driver knows this customer',
      'The recommended truck is needed for another load',
      'The hours or the location shown are wrong',
    ],
    whatHappens: 'Your reason is stored with the assignment, where anyone opening the load can read it. Nothing about the ranking changes on its own. If the same reason comes up three times in a month for one customer, that customer’s factors go to a person for review. Skipping submits no reason and does not change the assignment.',
  };

  /* =========================================================================
     FACTORS -- what is weighed, how it is shown, and which way is better.
     ========================================================================= */
  const FACTORS = [
    { key: 'dist',     label: 'Distance to pickup',          unit: (t) => `${t.dist} mi`,     better: 'lower',  wins: 'faster pickup' },
    { key: 'hos',      label: 'Hours of service left',        unit: (t) => `${t.hos.toFixed(1)} h`, better: 'higher', wins: 'more driver hours' },
    { key: 'equip',    label: 'Equipment',                    unit: (t) => t.equip,            better: 'exact',  wins: 'the exact equipment' },
    { key: 'onTime',   label: `On time with ${DATA.load.customer}`, unit: (t) => t.onTime[1] ? `${t.onTime[0]} of ${t.onTime[1]}` : 'no history', better: 'higher', wins: 'a better record with this customer' },
    { key: 'deadhead', label: 'Deadhead right now',           unit: (t) => `${t.deadhead} mi`, better: 'lower',  wins: 'less deadhead' },
  ];

  /* =========================================================================
     MECHANISM
     ========================================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]);

  /* Inline icons in the site header's idiom: 24 box, 2px stroke, currentColor.
     Every one is aria-hidden and sits beside a word, never instead of one. */
  const ICON_PATHS = {
    up:    '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    down:  '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    dash:  '<path d="M5 12h14"/>',
    ban:   '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  };
  const icon = (name, cls = 'ck-icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
  const DIR_ICON = { helps: 'up', hurts: 'down', meets: 'check', neutral: 'dash', 'stands in': 'dash' };

  const state = {
    scenario: DATA.scenarios[0],
    fleet: [],
    sort: { key: 'rank', dir: 'asc' },
    assigned: null,       /* truck id */
    why: null,            /* { truck, rank } while the prompt is open */
    answered: null,       /* the reason given, once given */
  };

  const root = $('#cockpit');
  if (!root) return;

  /* The fleet as this situation sees it. */
  function buildFleet(scenario) {
    return DATA.fleet.map((t) => ({ ...t, ...(scenario.patch[t.id] || {}) }));
  }

  /* The hard rule runs first and is not a factor. A truck it removes has no
     rank, no score and no Assign; it keeps its row. */
  function ruleFor(t) {
    if (t.hos < DATA.load.driveHours) {
      return { rule: 'Over hours', text: `Needs ${DATA.load.driveHours} h, has ${t.hos.toFixed(1)} h left. The hours-of-service limit, not a score.` };
    }
    return null;
  }

  /* Normalized 0 to 1 per factor, against the eligible fleet. */
  function normalize(fleet) {
    const eligible = fleet.filter((t) => !t.blocked);
    const max = (k) => Math.max(...eligible.map((t) => t[k]));
    const maxDist = max('dist'), maxHos = max('hos'), maxDh = max('deadhead');
    const need = DATA.load.driveHours;
    for (const t of fleet) {
      t.norm = {
        dist: 1 - t.dist / maxDist,
        hos: maxHos > need ? Math.max(0, (t.hos - need) / (maxHos - need)) : 0,
        equip: t.equip === DATA.load.equipment ? 1 : 0.5,
        onTime: t.onTime[1] ? t.onTime[0] / t.onTime[1] : 0.5,
        deadhead: 1 - t.deadhead / maxDh,
      };
      t.score = t.blocked ? null
        : FACTORS.reduce((s, f) => s + DATA.weights[f.key] * t.norm[f.key], 0);
    }
    /* The fleet's middle on each factor, which is what "helps" and "hurts"
       are measured against. */
    const mid = {};
    for (const f of FACTORS) {
      const v = eligible.map((t) => t.norm[f.key]).sort((a, b) => a - b);
      mid[f.key] = v[Math.floor(v.length / 2)];
    }
    return mid;
  }

  function rank() {
    for (const t of state.fleet) t.blocked = ruleFor(t);
    state.mid = normalize(state.fleet);
    const ordered = state.fleet.filter((t) => !t.blocked).sort((a, b) => b.score - a.score);
    ordered.forEach((t, i) => { t.rank = i + 1; });
    for (const t of state.fleet) if (t.blocked) t.rank = null;
    state.ranked = ordered;
    state.tie = ordered.length > 1 && (ordered[0].score - ordered[1].score) < DATA.tieMargin;
  }

  /* Direction of a factor for one truck: where it stands against the middle
     of the fleet available for this load. Shown as a word and a glyph, never
     as a color. Equipment is not a comparison -- the load asks for a type and
     a truck either is it or is standing in for it -- so it answers in its own
     words rather than borrowing helps and hurts. */
  function direction(t, f) {
    if (f.key === 'equip') return t.equip === DATA.load.equipment ? 'meets' : 'stands in';
    if (f.key === 'onTime' && !t.onTime[1]) return 'neutral';
    const d = t.norm[f.key] - state.mid[f.key];
    return d > 0.08 ? 'helps' : d < -0.08 ? 'hurts' : 'neutral';
  }

  /* The one line for a truck that lost: the factor where it trails the
     leader by the most. */
  function whyLost(t, leader) {
    let worst = null, gap = 0;
    for (const f of FACTORS) {
      const g = (leader.norm[f.key] - t.norm[f.key]) * DATA.weights[f.key];
      if (g > gap) { gap = g; worst = f; }
    }
    if (!worst) return 'Close on every factor.';
    if (worst.key === 'equip') return `${t.equip}; the load is a ${DATA.load.equipment}, so it costs a wash-out.`;
    if (worst.key === 'onTime' && !t.onTime[1]) return `No history with ${DATA.load.customer} yet.`;
    const val = worst.unit(t), lead = worst.unit(leader);
    return `${worst.label.charAt(0).toLowerCase() + worst.label.slice(1)}: ${val} against ${lead}.`;
  }

  /* For a tie: what each of the two has over the other. */
  function tradeoff(a, b) {
    const edge = (x, y) => {
      let best = null, gap = 0;
      for (const f of FACTORS) {
        const g = (x.norm[f.key] - y.norm[f.key]) * DATA.weights[f.key];
        if (g > gap) { gap = g; best = f; }
      }
      return best;
    };
    return { a: edge(a, b), b: edge(b, a) };
  }

  const truck = (id) => state.fleet.find((t) => t.id === id);
  const record = () => state.scenario.record || DATA.scenarios[0].record;

  /* ----- rendering ------------------------------------------------------- */

  function renderTabs() {
    const list = $('.ck-tabs', root);
    list.innerHTML = DATA.scenarios.map((s) => {
      const on = s.id === state.scenario.id;
      return `<button type="button" role="tab" id="ck-tab-${s.id}" class="ck-tab" aria-selected="${on}" aria-controls="ck-panel" tabindex="${on ? 0 : -1}" data-scenario="${s.id}">${esc(s.tab)}</button>`;
    }).join('');
    $('#ck-panel', root).setAttribute('aria-labelledby', `ck-tab-${state.scenario.id}`);
    $('.ck-blurb', root).textContent = state.scenario.blurb;
    renderRail();
  }

  /* The rail: the situation's point, its numbered callouts, one thing to
     try. The numbers here and the badges on the cockpit are one object. */
  function renderRail() {
    const sc = state.scenario;
    $('.ck-callouts', root).innerHTML = (sc.callouts || []).map((c, i) => `<li class="ck-callout">
      <span class="ck-badge" aria-hidden="true">${i + 1}</span>
      <div><p class="ck-callout-head">${esc(c.head)}</p><p class="ck-callout-body">${esc(c.body)}</p></div>
    </li>`).join('');
    $('.ck-rail-try', root).innerHTML = sc.try ? `<span class="ck-label">Try:</span> ${esc(sc.try)}` : '';
  }

  /* Hang each callout's number off its target, after every render, because
     the render replaced the target. A target that is not on screen in this
     state simply has no badge; the rail still numbers it. */
  function applyCallouts() {
    root.querySelectorAll('[data-callout]').forEach((el) => el.removeAttribute('data-callout'));
    const stage = $('#ck-panel', root);
    (state.scenario.callouts || []).forEach((c, i) => {
      const el = stage.querySelector(`.ck-panel ${c.target}`);
      if (el && !el.hidden) el.setAttribute('data-callout', String(i + 1));
    });
  }

  function renderLoad() {
    const l = DATA.load;
    $('.ck-load', root).innerHTML = `
      <p class="ck-load-id"><span class="ck-label">Load</span> ${esc(l.id)} <span class="ck-sep" aria-hidden="true">&middot;</span> ${esc(l.customer)}</p>
      <dl class="ck-load-facts">
        <div><dt>Lane</dt><dd>${esc(l.from)} to ${esc(l.to)}, ${l.driveHours} h drive</dd></div>
        <div><dt>Needs</dt><dd>${esc(l.equipment)}, ${esc(l.weight)}</dd></div>
        <div><dt>Window</dt><dd>${esc(l.window)}</dd></div>
        <div><dt>Due</dt><dd>${esc(l.due)}</dd></div>
      </dl>`;
  }

  function factorRows(t) {
    return `<ul class="ck-factors">${FACTORS.map((f) => {
      const d = direction(t, f);
      return `<li class="ck-factor">
        <span class="ck-factor-name">${esc(f.label)}</span>
        <span class="ck-factor-value">${esc(f.unit(t))}</span>
        <span class="ck-factor-dir" data-dir="${esc(d)}">${icon(DIR_ICON[d])}${d}</span>
      </li>`;
    }).join('')}</ul>
    <p class="ck-factor-note">Helps and hurts compare this truck with the middle of the fleet available for this load: where it stands on a factor, not how much the factor moved the ranking. Equipment is met or stood in for. No composite score, because none would tell you which of these to check.</p>`;
  }

  function renderConfidence() {
    const r = record();
    const tie = state.tie;
    const lead = tie
      ? `When the top two were this close, the one ranked first delivered on time <strong>${r.held} of ${r.of}</strong> times. Near a coin flip, so it is not picking.`
      : `The top-ranked truck delivered on time on <strong>${r.held} of the last ${r.of}</strong> loads like this one.`;
    const late = r.of - r.held;
    const n = r.misses.length === 2 ? 'two' : r.misses.length;
    return `<div class="ck-confidence">
      <h4 class="ck-h">Outcomes on similar loads</h4>
      <p class="ck-conf-line">${lead}</p>
      <p class="ck-conf-like"><span class="ck-label">Like this one:</span> ${esc(r.like)}</p>
      <p class="ck-conf-like"><span class="ck-label">Illustrative history:</span> synthetic, like everything else here. On time is an outcome, not a verdict on the ranking: another truck may have delivered on time too, and a late one may have been late for something the ranking could not see.</p>
      <details class="ck-misses">
        <summary>${r.misses.length === late ? `The ${n} late deliveries, and what differed` : `${r.misses.length === 2 ? 'Two' : r.misses.length} of the ${late} late deliveries, most recently`}</summary>
        <ol class="ck-miss-list">${r.misses.map((m) => `<li>
          <p class="ck-miss-what"><span class="ck-miss-load">${esc(m.load)}</span> ${esc(m.what)}</p>
          <p class="ck-miss-tell"><span class="ck-label">What to watch for:</span> ${esc(m.tell)}</p>
        </li>`).join('')}</ol>
      </details>
    </div>`;
  }

  function assignButton(t, cls = 'ck-btn') {
    if (t.blocked) return `<button type="button" class="${cls} ck-btn-quiet" aria-disabled="true" data-assign="${t.id}" data-focus="assign:${t.id}">Can&rsquo;t assign</button>`;
    if (state.assigned === t.id) return `<button type="button" class="${cls} ck-btn-quiet" data-undo="${t.id}" data-focus="assign:${t.id}">Assigned ${icon('check')} Undo</button>`;
    return `<button type="button" class="${cls}" data-assign="${t.id}" data-focus="assign:${t.id}">Assign ${esc(t.id)}</button>`;
  }

  function truckCard(t, heading, note) {
    return `<div class="ck-card${state.assigned === t.id ? ' is-assigned' : ''}">
      <p class="ck-card-head">${heading}</p>
      <p class="ck-card-truck">${esc(t.id)} <span class="ck-card-driver">${esc(t.driver)}, ${esc(t.at)}</span></p>
      ${note ? `<p class="ck-card-note">${note}</p>` : ''}
      ${factorRows(t)}
      <p class="ck-card-act">${assignButton(t, 'ck-btn ck-btn-primary')}</p>
    </div>`;
  }

  function renderReco() {
    const box = $('.ck-reco', root);
    const [first, second, third] = state.ranked;
    const blocked = state.fleet.filter((t) => t.blocked);
    let html = '';

    /* The rule, first and as a rule, when it removed a truck that would
       otherwise have led. */
    for (const b of blocked) {
      /* Would it have led, had the rule not removed it? Scored as if the
         hours were fine, against the trucks that are ranked. Said only when
         true, because the point of the card is that the rule beats the
         score, and that is only worth saying when the score was winning. */
      const asIf = FACTORS.reduce((s, f) => s + DATA.weights[f.key] * (f.key === 'hos' ? 1 : b.norm[f.key]), 0);
      const wouldLead = first && asIf > first.score;
      const otherwise = wouldLead
        ? ` Otherwise it would rank first: ${b.dist} mi to pickup, ${b.onTime[1] ? `${b.onTime[0]} of ${b.onTime[1]}` : 'no history'} on time with ${esc(DATA.load.customer)}, ${b.deadhead} mi of deadhead. None of that changes the rule.`
        : '';
      html += `<div class="ck-rule">
        <p class="ck-rule-head">${icon('ban', 'ck-rule-glyph')}${esc(b.id)}, ${esc(b.driver)}, can&rsquo;t take this load</p>
        <p class="ck-rule-text">${esc(b.blocked.text)}${otherwise}</p>
      </div>`;
    }

    if (state.tie) {
      const tr = tradeoff(first, second);
      const line = (x, f) => f ? `${f.wins}: ${esc(f.unit(x))}` : 'close on everything';
      html += `<div class="ck-lead">
        <p class="ck-lead-kicker ck-label">Two options, no pick</p>
        <h3 class="ck-reco-h">Two trucks are close. The tradeoff is ${esc(tr.a ? tr.a.wins : 'small')} against ${esc(tr.b ? tr.b.wins : 'small')}.</h3>
        <p class="ck-reco-dek">The system is not ranking one over the other. Pick the side of the tradeoff that matters for this load.</p>
        <div class="ck-pair">
          ${truckCard(first, 'Option A', `Has ${line(first, tr.a)}`)}
          ${truckCard(second, 'Option B', `Has ${line(second, tr.b)}`)}
        </div>
        ${renderConfidence()}
      </div>`;
    } else {
      const overridden = state.assigned && state.assigned !== first.id;
      html += `<div class="ck-lead">
        <p class="ck-lead-kicker ck-label">${overridden ? 'The system&rsquo;s pick, not yours' : 'Recommendation'}</p>
        <h3 class="ck-reco-h">Recommended: ${esc(first.id)}, ${esc(first.driver)}</h3>
        ${overridden ? `<p class="ck-reco-dek">Still the system&rsquo;s pick. You assigned ${esc(state.assigned)} instead, which is fine; the recommendation stays visible so the difference stays visible.</p>` : ''}
        <div class="ck-pair">
          ${truckCard(first, 'What went into the call')}
          <div>
            ${renderConfidence()}
            <div class="ck-also">
              <h4 class="ck-h">Also considered</h4>
              <ol class="ck-also-list">
                ${[second, third].filter(Boolean).map((t) => `<li>
                  <span class="ck-also-rank">${ordinal(t.rank)}</span>
                  <span class="ck-also-body"><strong>${esc(t.id)}</strong>, ${esc(t.driver)}. Lost on ${esc(whyLost(t, first))}</span>
                </li>`).join('')}
              </ol>
            </div>
          </div>
        </div>
      </div>`;
    }
    box.innerHTML = html;
  }

  function renderStatus(message) {
    const s = $('.ck-status', root);
    if (message !== undefined) s.textContent = message;
  }

  function renderWhy() {
    const box = $('.ck-why', root);
    if (!state.why) { box.hidden = true; box.innerHTML = ''; return; }
    const { truck: id, rank: r } = state.why;
    if (state.answered) {
      box.hidden = false;
      box.innerHTML = `<p class="ck-why-done" tabindex="-1" data-focus="why:done"><span class="ck-label">Noted.</span> &ldquo;${esc(state.answered)}&rdquo; is stored with ${esc(id)} on ${esc(DATA.load.id)}. Nothing about today&rsquo;s ranking changes.</p>`;
      return;
    }
    box.hidden = false;
    box.innerHTML = `
      <form class="ck-why-form" novalidate>
        <p class="ck-why-head" id="ck-why-head">You assigned ${esc(id)}, ranked ${ordinal(r)}. Why? <span class="ck-why-opt">Optional.</span></p>
        <fieldset class="ck-why-set" aria-labelledby="ck-why-head">
          <legend class="ck-visually-hidden">Reason for overriding the recommendation</legend>
          ${DATA.reasons.map((reason, i) => `<label class="ck-radio"><input type="radio" name="reason" value="${esc(reason)}" ${i === 0 ? 'data-focus="why:first"' : ''}> <span>${esc(reason)}</span></label>`).join('')}
          <label class="ck-radio"><input type="radio" name="reason" value="__other"> <span>Something else</span></label>
          <label class="ck-why-text"><span class="ck-visually-hidden">Say more, in your words</span><textarea name="more" rows="2" placeholder="In your words, if you like"></textarea></label>
        </fieldset>
        <p class="ck-why-what"><span class="ck-label">What happens with this:</span> ${esc(DATA.whatHappens)}</p>
        <p class="ck-why-act">
          <button type="submit" class="ck-btn ck-btn-primary">Save the reason</button>
          <button type="button" class="ck-btn ck-btn-quiet" data-skip>Skip</button>
        </p>
      </form>`;
  }

  const COLUMNS = [
    { key: 'rank',     label: 'Rank',            sortable: true },
    { key: 'id',       label: 'Truck',           sortable: true },
    { key: 'driver',   label: 'Driver',          sortable: true },
    { key: 'at',       label: 'Now at',          sortable: true },
    { key: 'dist',     label: 'To pickup, mi',   sortable: true, num: true },
    { key: 'hos',      label: 'Hours left',      sortable: true, num: true },
    { key: 'equip',    label: 'Equipment',       sortable: true },
    { key: 'onTime',   label: 'On time, this customer', sortable: true, num: true },
    { key: 'deadhead', label: 'Deadhead, mi',    sortable: true, num: true },
    { key: 'act',      label: 'Assign',          sortable: false },
  ];

  function sortValue(t, key) {
    if (key === 'rank') return t.rank === null ? 999 : t.rank;
    if (key === 'onTime') return t.onTime[1] ? t.onTime[0] / t.onTime[1] : -1;
    return t[key];
  }

  function renderTable() {
    const { key, dir } = state.sort;
    const rows = [...state.fleet].sort((a, b) => {
      const x = sortValue(a, key), y = sortValue(b, key);
      const c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
      return dir === 'asc' ? c : -c;
    });
    const head = COLUMNS.map((c) => {
      if (!c.sortable) return `<th scope="col">${esc(c.label)}</th>`;
      const on = key === c.key;
      const sorted = on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none';
      const glyph = on ? (dir === 'asc' ? '&#9650;' : '&#9660;') : '&#8597;';
      return `<th scope="col" aria-sort="${sorted}"${c.num ? ' class="ck-num"' : ''}>
        <button type="button" class="ck-sort" data-sort="${c.key}" data-focus="sort:${c.key}">${esc(c.label)} <span class="ck-sort-glyph" aria-hidden="true">${glyph}</span></button>
      </th>`;
    }).join('');
    const body = rows.map((t) => {
      const cls = ['ck-row'];
      if (t.rank === 1 && !state.tie) cls.push('is-lead');
      if (state.tie && t.rank <= 2) cls.push('is-lead');
      if (t.blocked) cls.push('is-blocked');
      if (state.assigned === t.id) cls.push('is-assigned');
      const rankCell = t.blocked
        ? `<span class="ck-rank-rule">${icon('ban')} ${esc(t.blocked.rule)}</span>`
        : `${ordinal(t.rank)}${t.rank === 1 && !state.tie ? ' <span class="ck-rank-tag">recommended</span>' : ''}${state.tie && t.rank <= 2 ? ` <span class="ck-rank-tag">option ${t.rank === 1 ? 'A' : 'B'}</span>` : ''}`;
      return `<tr class="${cls.join(' ')}">
        <th scope="row" class="ck-cell-rank">${rankCell}${state.assigned === t.id ? ' <span class="ck-rank-tag">assigned</span>' : ''}</th>
        <td>${esc(t.id)}</td>
        <td>${esc(t.driver)}</td>
        <td>${esc(t.at)}</td>
        <td class="ck-num">${t.dist}</td>
        <td class="ck-num">${t.hos.toFixed(1)}${t.blocked ? ` <span class="ck-cell-note">needs ${DATA.load.driveHours}</span>` : ''}</td>
        <td>${esc(t.equip)}</td>
        <td class="ck-num">${t.onTime[1] ? `${t.onTime[0]} of ${t.onTime[1]}` : '<span class="ck-cell-note">none yet</span>'}</td>
        <td class="ck-num">${t.deadhead}</td>
        <td class="ck-cell-act">${assignButton(t)}</td>
      </tr>`;
    }).join('');
    $('.ck-table', root).innerHTML = `<caption class="ck-visually-hidden">Every truck in the fleet, with the columns the recommendation weighed. Sort any column; assign any truck.</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
  }

  /* Re-render everything under the tabs, keeping focus where it was. */
  function render(status) {
    const focusKey = document.activeElement && document.activeElement.dataset.focus;
    renderReco();
    renderWhy();
    renderTable();
    applyCallouts();
    if (status !== undefined) renderStatus(status);
    if (focusKey) {
      const again = root.querySelector(`[data-focus="${focusKey}"]`);
      if (again) again.focus();
    }
  }

  /* ----- actions --------------------------------------------------------- */

  function load(scenario) {
    state.scenario = scenario;
    state.fleet = buildFleet(scenario);
    state.sort = { key: 'rank', dir: 'asc' };
    state.assigned = null; state.why = null; state.answered = null;
    rank();
    renderTabs();
    const first = state.ranked[0], second = state.ranked[1];
    const blocked = state.fleet.filter((t) => t.blocked).map((t) => t.id);
    let status;
    if (state.tie) status = `${scenario.tab}: two trucks are close, ${first.id} and ${second.id}. The tradeoff is named above the data table.`;
    else status = `${scenario.tab}: the system recommends ${first.id}, ${first.driver}.${blocked.length ? ` ${blocked.join(', ')} is over hours and cannot be assigned.` : ''}`;
    render(status);
    if (scenario.then) scenario.then(api);
  }

  function assign(id) {
    const t = truck(id);
    if (!t || t.blocked) { render(`${id} can’t be assigned: ${t ? t.blocked.text : 'not in the fleet'}`); return; }
    state.assigned = id;
    state.answered = null;
    const first = state.ranked[0];
    const isOverride = state.tie ? t.rank > 2 : id !== first.id;
    state.why = isOverride ? { truck: id, rank: t.rank } : null;
    const line = `${DATA.load.id} assigned to ${id}, ${t.driver}.` +
      (isOverride ? ` That is the truck ranked ${ordinal(t.rank)}; there is an optional question about why, above the data table.` : '');
    render(line);
  }

  function undo() {
    const was = state.assigned;
    state.assigned = null; state.why = null; state.answered = null;
    render(`Assignment of ${was} undone. No reason was submitted.`);
  }

  /* The two ways out of the question both re-render it away from under the
     keyboard, so each says where focus goes next: the note that the answer
     was stored, or the row's Undo, which is where the assignment lives. */
  function answer(reason) {
    state.answered = reason;
    render(`Reason saved with ${state.why.truck}: “${reason}”`);
    const done = root.querySelector('[data-focus="why:done"]');
    if (done) done.focus();
  }

  function skip() {
    state.why = null;
    render('Skipped. The assignment stands and no reason was submitted.');
    const undo = root.querySelector('[data-undo]');
    if (undo) undo.focus();
  }

  const api = { assign, ranked: () => state.ranked };

  /* ----- events ---------------------------------------------------------- */

  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-scenario]');
    if (tab) { load(DATA.scenarios.find((s) => s.id === tab.dataset.scenario)); tab.focus(); return; }
    const sort = e.target.closest('[data-sort]');
    if (sort) {
      const k = sort.dataset.sort;
      state.sort = state.sort.key === k ? { key: k, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' };
      render(); return;
    }
    const a = e.target.closest('[data-assign]');
    if (a) { assign(a.dataset.assign); return; }
    const u = e.target.closest('[data-undo]');
    if (u) { undo(); return; }
    if (e.target.closest('[data-skip]')) { skip(); }
  });

  root.addEventListener('submit', (e) => {
    const form = e.target.closest('.ck-why-form');
    if (!form) return;
    e.preventDefault();
    const picked = form.querySelector('input[name="reason"]:checked');
    const more = form.querySelector('textarea[name="more"]').value.trim();
    let reason = picked ? picked.value : '';
    if (reason === '__other') reason = more || 'Something else';
    else if (more) reason = reason ? `${reason}: ${more}` : more;
    if (!reason) { skip(); return; }
    answer(reason);
  });

  /* Tabs: arrow keys move and select, Home and End jump. */
  root.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(tab);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    load(DATA.scenarios.find((s) => s.id === next.dataset.scenario));
    root.querySelector(`[data-scenario="${next.dataset.scenario}"]`).focus();
  });

  renderLoad();
  load(DATA.scenarios[0]);

})();
