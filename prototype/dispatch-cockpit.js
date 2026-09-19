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
 *   and over all four, what the situation IS -> renderSituation(), plus the
 *   one line of blurb the tab sets
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
      /* THE CLOCK, AND WHY THE SCREEN NEEDS ONE. Every factor on the card
         answers a question about the truck. The question a dispatcher is
         actually holding is about the LOAD -- can this truck still make the
         pickup window -- and until now the screen made them do that
         arithmetic in their head, from a distance in one column and a window
         in a sentence two cards above it.

         These three numbers are what turns "38 mi" into "2:25 pm, 34 minutes
         of room". They are stated on the screen rather than assumed, because
         a derived figure whose inputs are hidden is a figure nobody can
         argue with -- which is the failure this whole prototype is about.

         Minutes from midnight, so the arithmetic is addition. */
      nowMin: 13 * 60 + 42,        /* 1:42 pm, and the load card says so */
      windowOpen: 13 * 60,         /* 1:00 pm */
      windowClose: 15 * 60,        /* 3:00 pm */
      mph: 52,                     /* the average the estimate assumes */
      /* Under this many minutes of room, the arrival is called tight. Not a
         rule and not a score: a reading the dispatcher may want to act on,
         which is exactly the kind of thing the ranking does not hold. */
      tightMin: 15,
      /* WHEN A FIGURE WAS LAST TRUE. Every truck below carries `seen`: how
         many minutes ago its position (GPS) and its driver's hours (the ELD,
         the electronic logbook) last reported. A figure older than this is
         marked stale wherever it is shown, and in the close call the card
         says so in words. Not a rule and not a score: the ranking weighs the
         figure as it stands, because the figure is all it has. What the mark
         says is that the number may no longer be the number, and that is
         the dispatcher's to check. Thirty minutes because the outcome record
         on the first situation holds a load that sat overnight on an hours
         figure forty minutes stale. */
      staleMin: 30,
    },

    /* The fleet as the confident situation sees it. Each situation below
       patches a few of these values; the rest stay.
         dist     miles from the truck's current position to the pickup
         hos      hours of service remaining for the driver, today
         equip    what the truck is; 'reefer' can carry a dry-van load at the
                  cost of a wash-out, so it is a factor, not a rule
         onTime   [delivered on time, loads run] for THIS customer; [0, 0]
                  means no history, which is neutral, not bad
         deadhead empty miles the truck has run since its last delivery
         seen     minutes since the GPS last placed the truck, and since the
                  ELD last reported the driver's hours; see load.staleMin */
    fleet: [
      { id: 'T-118', driver: 'Marisol Vega',  at: 'Owatonna, MN',  dist: 38, hos: 8.4,  equip: 'dry van', onTime: [11, 12], deadhead: 12, seen: { gps: 2, eld: 6 } },
      { id: 'T-207', driver: 'Dana Okafor',   at: 'Mankato, MN',   dist: 71, hos: 9.1,  equip: 'dry van', onTime: [9, 10],  deadhead: 40, seen: { gps: 4, eld: 9 } },
      { id: 'T-142', driver: 'Luis Herrera',  at: 'Rochester, MN', dist: 24, hos: 7.2,  equip: 'reefer',  onTime: [4, 5],   deadhead: 9,  seen: { gps: 1, eld: 12 } },
      { id: 'T-131', driver: 'Priya Nair',    at: 'Austin, MN',    dist: 43, hos: 6.0,  equip: 'dry van', onTime: [8, 8],   deadhead: 22, seen: { gps: 3, eld: 8 } },
      { id: 'T-114', driver: 'Sam Bergstrom', at: 'Winona, MN',    dist: 64, hos: 10.5, equip: 'dry van', onTime: [14, 14], deadhead: 48, seen: { gps: 5, eld: 4 } },
      { id: 'T-166', driver: 'Chen Wei',      at: 'Red Wing, MN',  dist: 58, hos: 6.3,  equip: 'dry van', onTime: [6, 9],   deadhead: 30, seen: { gps: 2, eld: 11 } },
      { id: 'T-175', driver: 'Tom Lindqvist', at: 'Faribault, MN', dist: 52, hos: 6.8,  equip: 'dry van', onTime: [0, 0],   deadhead: 35, seen: { gps: 6, eld: 7 } },
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
        tab: 'Clear pick',
        blurb: 'One truck is the obvious answer, and the system ranks it first. A dispatcher should be able to confirm that in seconds, without re-ranking seven trucks by hand.',
        steps: [
          { text: 'Open the two late deliveries and read what differed.', done: (s) => s.did.has('open:misses') },
          { text: 'Open any truck\u2019s row in the fleet to see the same five factors for it.', done: (s) => [...s.did].some((d) => d.startsWith('open:row:')) },
          { text: 'Assign T\u2011118.', done: (s) => s.assigned === 'T-118' },
        ],
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
        tab: 'Close call',
        blurb: 'Two trucks are close enough that the system cannot honestly separate them, so it does not try. It names the tradeoff, flags the one figure it cannot vouch for, and leaves the call to the dispatcher.',
        steps: [
          { text: 'Assign the side of the tradeoff that matters for this load. Neither is an override, so no question follows.', done: (s) => s.assigned !== null },
          /* The stale figure is said in words on the card; this asks the
             reader to find it where a dispatcher working from the table
             would meet it, which is what "in reach" has to mean. */
          { text: 'Open T\u2011131\u2019s row: the stale hours figure is marked there too.', done: (s) => s.did.has('open:row:T-131') },
          /* "By any column" rather than "by hours left", because under 48rem
             the hours column is one of the seven the fleet drops and a step
             nobody can reach is worse than no step. It also asks the better
             question: whatever you order the fleet by, the two stay level. */
          { text: 'Sort the fleet by any column: the two stay next to each other.', done: (s) => sortedAny(s) },
        ],
        /* T-131's hours are 42 minutes old, against 18 minutes of margin over
           what the run needs: the one case in the four where a figure's age
           changes what the dispatcher should do before pressing Assign. The
           ranking does not move for it, which is the point. */
        patch: { 'T-131': { dist: 16, hos: 5.8, deadhead: 10, seen: { gps: 3, eld: 42 } }, 'T-118': { dist: 41 } },
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
        tab: 'Dispatcher overrides',
        blurb: 'The dispatcher has already overridden the recommendation and assigned the third-ranked truck. Nothing stopped them and nothing argues back; this is what the screen does next.',
        steps: [
          { text: 'Save a reason, or skip. Both leave the assignment standing.', done: (s) => s.did.has('answered') || s.did.has('skipped') },
          { text: 'Undo, assign T\u2011118, and notice that no question follows.', done: (s) => s.did.has('undo') && s.assigned === 'T-118' },
        ],
        patch: {},
        /* Same record as the confident situation: same lane, same data. */
        record: null,
        /* What the situation does after it loads: assign the third-ranked
           truck, which is what opens the prompt. */
        then: (api) => api.assign(api.ranked()[2].id),
      },
      {
        id: 'rule',
        tab: 'Blocked by a rule',
        blurb: 'The truck that wins on every other measure cannot legally take this load, because its driver is short on hours. That is a hard rule rather than a low score, and it has to look like one.',
        steps: [
          { text: 'Try to assign T\u2011114 from the data table.', done: (s) => s.did.has('refused:T-114') },
          { text: 'Sort the fleet by any column: T\u2011114 keeps its row and its reason.', done: (s) => sortedAny(s) },
          { text: 'Open T\u2011114\u2019s row: it still wins on everything the ranking weighs.', done: (s) => s.did.has('open:row:T-114') },
        ],
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
    whatHappens: 'Saved with the load, for anyone to read. The ranking does not change. The same reason three times in a month for one customer goes to a person for review. Skipping changes nothing.',
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

  /* WHERE EACH FIGURE CAME FROM, AND HOW LONG AGO. Three of the five get a
     line: the two that can go stale between one screen and the next, and the
     record, whose meaning depends on the span it covers. Equipment does not
     age and deadhead is a running total, so neither gets one; a line under
     every figure would be a line under none. */
  const AGE = {
    dist:   (t) => ({ text: `GPS ${t.seen.gps} min ago`, stale: t.seen.gps >= DATA.load.staleMin }),
    hos:    (t) => ({ text: `ELD ${t.seen.eld} min ago`, stale: t.seen.eld >= DATA.load.staleMin }),
    onTime: (t) => (t.onTime[1] ? { text: 'last 90 days', stale: false } : null),
  };
  const staleHos = (t) => t.seen.eld >= DATA.load.staleMin;

  /* =========================================================================
     THE WINDOW -- the one reading on the screen that is DERIVED rather than
     weighed, and the reason it is worth the room.

     Every factor above is a property of the truck. The question the
     dispatcher is holding is a property of the LOAD: this pickup window
     shuts at three, so which of these trucks can still be there. The screen
     had every number needed to answer that -- miles in one column, a window
     in a sentence two cards up -- and left the arithmetic to the person,
     forty times an hour, while the phone rings. That is precisely the
     "attention, not information" problem the page argues about, being
     committed by the page's own prototype.

     IT IS NOT A SIXTH FACTOR, AND THE SCREEN SAYS SO. The ranking weighs
     distance; this converts distance into the thing distance MEANS for this
     load. Making it a factor would be double-counting, and hiding the
     conversion would make it a number nobody can check. So it is a derived
     column, with the assumption printed beside it and `now` on the load
     card, and it moves no ranking.

     WHY IT DOES NOT BLOCK. A truck that misses the window is a judgment --
     the dock may wait, the customer may be called -- and the hours-of-service
     rule is a law. Keeping them in different channels is what lets the rule
     keep its own colour and its own card: one removes a truck from ranking,
     the other is a reading that a dispatcher weighs. ========================= */
  const WINDOW = {
    /* Minutes from midnight at which this truck reaches the pickup. */
    at: (t) => DATA.load.nowMin + Math.round((t.dist / DATA.load.mph) * 60),
    /* Minutes of room against the close of the window; negative is late. */
    room: (t) => DATA.load.windowClose - WINDOW.at(t),
    /* misses | tight | clear, and each is also a word on the screen. */
    state: (t) => {
      const room = WINDOW.room(t);
      if (room < 0) return 'misses';
      return room < DATA.load.tightMin ? 'tight' : 'clear';
    },
  };
  const WINDOW_WORD = { misses: 'after the window', tight: 'tight', clear: 'in the window' };
  /* The same three states in the fleet, where the column is 90px wide and
     the head already says the window shuts at three. "in the window" on the
     ordinary row is seven repetitions of a fact the clock time next to it
     already carries, and it cost the table two lines a row and enough width
     to push Assign off the end of its wrapper. Only the two states worth
     interrupting for get a word here. */
  const TABLE_WORD = { misses: 'too late', tight: 'tight', clear: '' };

  /* 1:42 pm, never 13:42: the screen is American freight and the load card
     says the same. Minutes from midnight in, a clock face out. */
  const clock = (min) => {
    const m = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm} ${h < 12 ? 'am' : 'pm'}`;
  };

  /* =========================================================================
     MECHANISM
     ========================================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]);

  /* Inline icons in the site header's idiom: 24 box, 2px stroke, currentColor.
     Every one is aria-hidden and sits beside a word, never instead of one. */
  const ICON_PATHS = {
    up:       '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    down:     '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    check:    '<path d="M20 6 9 17l-5-5"/>',
    dash:     '<path d="M5 12h14"/>',
    ban:      '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    /* the situations */
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    help:     '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    undo:     '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    /* the load's facts */
    pin:      '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    box:      '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    /* the status line. listChecks, history and list are defined and used
       nowhere: they were put on the three card heads as region landmarks and
       taken off again, because a 20px glyph beside a short heading competes
       with it rather than locating it -- the heading is already the landmark,
       and the glyph was a second mark saying the same thing louder. Kept
       rather than deleted, because the next idea for them is likelier to be
       somewhere a heading ISN'T. */
    listChecks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    history:  '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    list:     '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    info:     '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    chevron:  '<path d="m6 9 6 6 6-6"/>',
    /* THE SORT GLYPHS, WHICH FOR THREE RELEASES DID NOT EXIST. renderTable
       has always asked icon() for 'sort', 'sortUp' or 'sortDown' and the
       registry has never held any of the three, so every head emitted an
       <svg> containing the string "undefined" -- valid markup, no console
       error, and nothing drawn. The stylesheet's whole "a sort indicator is
       earned" paragraph describes a chevron that has never been on screen,
       and on a touch device, where there is no hover to reveal it, the fact
       that a column head sorts at all was unsignposted. A missing key in a
       lookup is the one kind of icon bug that cannot announce itself: the
       template literal interpolates `undefined` and the browser draws an
       empty box. */
    sort:     '<path d="m8 9 4-4 4 4"/><path d="m16 15-4 4-4-4"/>',
    sortUp:   '<path d="m8 14 4-4 4 4"/>',
    sortDown: '<path d="m8 10 4 4 4-4"/>',
    /* The row disclosure in the fleet, and the density switch beside it. */
    expand:   '<path d="m6 9 6 6 6-6"/>',
    rows:     '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
    clockAlert: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l3.5 1.75"/>',
    pointer:  '<path d="M9 9l5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>',
  };
  const TAB_ICON = { confident: 'checkCircle', tie: 'help', override: 'undo', rule: 'ban' };
  const icon = (name, cls = 'ck-icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
  const DIR_ICON = { helps: 'up', hurts: 'down', meets: 'check', neutral: 'dash', 'stands in': 'dash' };
  /* The age line under a factor's name. Stale takes the caution ink and the
     clock glyph; the words are the same either way, because "42 min ago" is
     the fact and the colour is the reading of it. */
  const ageLine = (t, f) => {
    const a = AGE[f.key] && AGE[f.key](t);
    if (!a) return '';
    return `<span class="ck-factor-age" data-age="${a.stale ? 'stale' : 'fresh'}">${a.stale ? icon('clockAlert') : ''}${esc(a.text)}</span>`;
  };

  const state = {
    scenario: DATA.scenarios[0],
    fleet: [],
    sort: { key: 'rank', dir: 'asc' },
    assigned: null,       /* truck id */
    why: null,            /* { truck, rank } while the prompt is open */
    answered: null,       /* the reason given, once given */

    /* WHAT THE READER HAS DONE, which four things now read.
       The checklist ticks off against it, so the nudge under each situation
       confirms rather than only instructs; the row disclosures remember what
       is open across a sort; and the situation switch can say what moved.

       A Set of strings rather than a flag each, because the steps are
       written per situation and a step should be able to ask about anything
       without this object growing a field for it. */
    did: new Set(),
    open: new Set(),      /* truck ids whose fleet row is expanded */
    moved: new Map(),     /* truck id -> places moved on the last switch */
    movedFrom: null,      /* the situation they moved from, for the sentence */
    density: 'comfortable',
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
       are measured against, and its two ends, which is what the bar draws
       between. Both come out of the same walk over the same eligible trucks,
       so the word and the picture are reading one fleet. */
    const mid = {}, range = {};
    for (const f of FACTORS) {
      const v = eligible.map((t) => t.norm[f.key]).sort((a, b) => a - b);
      mid[f.key] = v[Math.floor(v.length / 2)];
      range[f.key] = { lo: v[0], hi: v[v.length - 1] };
    }
    return { mid, range };
  }

  function rank() {
    for (const t of state.fleet) t.blocked = ruleFor(t);
    const shape = normalize(state.fleet);
    state.mid = shape.mid;
    state.range = shape.range;
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
  /* How far from the fleet's middle still counts as level. It is used twice
     -- once to choose the word and once to draw the band the bar puts around
     the middle -- and those two must never disagree, because a mark sitting
     visibly clear of a band under the word "neutral" is the interface
     contradicting itself. One constant, both readers. */
  const LEVEL = 0.08;

  function direction(t, f) {
    if (f.key === 'equip') return t.equip === DATA.load.equipment ? 'meets' : 'stands in';
    if (f.key === 'onTime' && !t.onTime[1]) return 'neutral';
    const d = t.norm[f.key] - state.mid[f.key];
    return d > LEVEL ? 'helps' : d < -LEVEL ? 'hurts' : 'neutral';
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
      return `<button type="button" role="tab" id="ck-tab-${s.id}" class="ck-tab" aria-selected="${on}" aria-controls="ck-panel" tabindex="${on ? 0 : -1}" data-scenario="${s.id}">${icon(TAB_ICON[s.id])}${esc(s.tab)}</button>`;
    }).join('');
    $('#ck-panel', root).setAttribute('aria-labelledby', `ck-tab-${state.scenario.id}`);
    $('.ck-blurb', root).textContent = state.scenario.blurb;
    renderSituation();
  }

  /* WHAT TO TRY, AND WHETHER YOU HAVE. Until now this was one sentence of
     instruction that never changed: a nudge that told the reader to open the
     late deliveries and had no idea whether they ever did.

     A demonstration whose whole argument is that an interface should show its
     work ought to show the reader their own. Each situation now carries two
     or three steps, each with a predicate over `state`, and the list ticks
     itself off as the reader does them. That is worth more than instruction
     for a reason specific to this page: a visitor is not a dispatcher and
     does not know when they have seen the thing they were sent to see. The
     tick is what says "that was it".

     NOTHING HERE IS A CONTROL. The steps are not buttons and not checkboxes
     -- there is nothing to press, and pressing the interface is the point.
     So it is an ordered list with a mark per item, and the mark is a shape
     and a hidden word before it is a colour.

     THE COUNT IS NOT A SECOND LIVE REGION. .ck-status is this cockpit's one
     announcement channel and two of them talking over each other is worse
     than either. render() notices when the number goes up and appends a
     clause to the status instead, so a screen reader hears the step land in
     the same breath as the action that landed it. */
  function stepsOf(sc) { return sc.steps || []; }
  /* Any column but the one the fleet already opens on. */
  const sortedAny = (s) => [...s.did].some((d) => d.startsWith('sort:') && d !== 'sort:rank');
  function stepsDone(sc) { return stepsOf(sc).filter((st) => st.done(state)).length; }

  function renderSituation() {
    const sc = state.scenario;
    const steps = stepsOf(sc);
    const box = $('.ck-try', root);
    if (!steps.length) { box.innerHTML = ''; return; }
    const done = stepsDone(sc);
    const all = done === steps.length;
    box.innerHTML = `
      <p class="ck-try-h">${icon('pointer')}<span class="ck-label">Try it</span>
        <span class="ck-try-count">${done} of ${steps.length} done</span></p>
      <ol class="ck-try-list">
        ${steps.map((st) => {
          const on = st.done(state);
          return `<li class="ck-try-step${on ? ' is-done' : ''}">
            ${on ? icon('checkCircle', 'ck-icon ck-try-mark') : '<span class="ck-try-mark ck-try-mark-open" aria-hidden="true"></span>'}
            <span class="ck-try-text">${esc(st.text)}<span class="ck-visually-hidden">. ${on ? 'Done' : 'Not done yet'}.</span></span>
          </li>`;
        }).join('')}
      </ol>
      ${all ? `<p class="ck-try-end">That is everything this scenario has to show. The other three are above.</p>` : ''}`;
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
      </dl>
      <!-- The clock the "at pickup" column is figured from. It is on the load
           and not in a footnote because it is the one input to that column a
           reader cannot see anywhere else, and a derived figure with a hidden
           input is the thing this prototype exists to argue against. -->
      <p class="ck-load-now">${icon('clock')}<span><span class="ck-label">Now</span> ${clock(l.nowMin)}
        <span class="ck-sep" aria-hidden="true">&middot;</span> the window shuts at ${clock(l.windowClose)},
        in ${l.windowClose - l.nowMin} minutes</span></p>`;
  }

  /* WHERE THE TRUCK STANDS, DRAWN. The card has always claimed to show where
     a truck sits against the fleet available for this load, and has always
     said it in words five times over, leaving the reader to hold five numbers
     and infer a fleet from them.

     WHAT THE BAR MEASURES, AND WHY IT IS NOT RAW. It would be easier to plot
     the miles and the hours, and it would be a different quantity from the
     one that produced the ranking: hos is floored at what the run legally
     needs, so a truck's raw hours and its ranked hours part company. The bar
     plots t.norm, which IS what the ranking weighed.

     BUT NOT t.norm STRAIGHT. Those five numbers do not share a meaning -- on
     this fleet dist spans 0 to 0.66, hos 0.10 to 1.00, equip is a binary and
     onTime is a raw success ratio -- and five bars stacked in a column read
     as one scale whether or not they are one. Each is rescaled to its own
     factor's spread across the eligible trucks, so every row means the one
     thing: worst of the fleet on the left, best on the right.

     WHAT GETS NO BAR. Equipment, because it is not a comparison -- the load
     asks for a type and a truck either is it or is standing in for it, which
     is why direction() answers it in its own words. A truck with no history
     with this customer, because "no history" is not a place on a scale. And
     any factor where the whole eligible fleet is level, where a bar would
     draw a difference that is not there. */
  function factorBar(t, f) {
    if (f.key === 'equip') return '';
    if (f.key === 'onTime' && !t.onTime[1]) return '';
    const r = state.range[f.key];
    if (!r) return '';
    const span = r.hi - r.lo;
    if (!(span > 0)) return '';
    const at = (v) => Math.max(0, Math.min(100, ((v - r.lo) / span) * 100));
    const pos = at(t.norm[f.key]);
    const med = at(state.mid[f.key]);
    const lo = at(state.mid[f.key] - LEVEL);
    const hi = at(state.mid[f.key] + LEVEL);
    /* aria-hidden because the value and the word beside it already say this
       in text, and a third announcement per row is fifteen per card. */
    return `<span class="ck-factor-bar" aria-hidden="true" style="--pos:${pos.toFixed(1)}%;--med:${med.toFixed(1)}%;--band-l:${lo.toFixed(1)}%;--band-w:${(hi - lo).toFixed(1)}%"><span class="ck-factor-mark"></span></span>`;
  }

  function factorRows(t, opts = {}) {
    const withNote = opts.note !== false;
    return `<ul class="ck-factors">${FACTORS.map((f) => {
      const d = direction(t, f);
      return `<li class="ck-factor">
        <span class="ck-factor-name">${esc(f.label)}${ageLine(t, f)}</span>
        <span class="ck-factor-value">${esc(f.unit(t))}</span>
        <span class="ck-factor-dir" data-dir="${esc(d)}">${icon(DIR_ICON[d])}${d}</span>
        ${factorBar(t, f)}
      </li>`;
    }).join('')}</ul>
    ${!withNote ? '' : `<!-- THE KEY, WHERE THE BARS ARE, AND NOT ONLY INSIDE THE DISCLOSURE
         UNDER THEM. A first-time reader met a fill, a heavy tick and two
         hairlines, and the only text explaining any of it was folded away in
         "More about these comparisons" -- which is the right place for the
         argument and the wrong place for the legend. A chart whose key is
         one click away is a chart that gets read as decoration.

         The sample is the real .ck-factor-bar with fixed numbers rather than
         a drawing of one, so the key cannot drift from the thing it explains;
         only its grid placement is overridden. -->
    <p class="ck-factor-key">
      <span class="ck-factor-bar ck-key-sample" aria-hidden="true" style="--pos:62%;--med:50%;--band-l:42%;--band-w:16%"><span class="ck-factor-mark"></span></span>
      <span>Worst to best across the trucks that can take this load, with the fleet&rsquo;s middle marked and the zone that still counts as level either side of it.</span>
    </p>
    <p class="ck-factor-note">Where a truck stands, not how much a factor moved the ranking.</p>
    <details class="ck-note">
      <summary><span class="ck-note-label">More about these comparisons</span>${icon('chevron', 'ck-icon ck-misses-chev')}</summary>
      <div class="ck-note-body">
        <p>Each bar places this truck between the worst and the best of the trucks that can take this load, with the fleet&rsquo;s middle marked and the zone that still counts as level around it.</p>
        <p>Equipment has no bar: the load asks for a type, and a truck either is it or is standing in for it. There is no composite score either, because none would tell you which of these to check.</p>
      </div>
    </details>`}`;
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
        <summary><span class="ck-misses-label">${r.misses.length === late ? `The ${n} late deliveries, and what differed` : `${r.misses.length === 2 ? 'Two' : r.misses.length} of the ${late} late deliveries, most recently`}</span>${icon('chevron', 'ck-icon ck-misses-chev')}</summary>
        <ol class="ck-miss-list">${r.misses.map((m) => `<li>
          <p class="ck-miss-what"><span class="ck-miss-load">${esc(m.load)}</span> ${esc(m.what)}</p>
          <p class="ck-miss-tell"><span class="ck-label">What to watch for:</span> ${esc(m.tell)}</p>
        </li>`).join('')}</ol>
      </details>
    </div>`;
  }

  /* THE QUIET OUTLINE HAS TO REPLACE THE LOUD FILL, NOT BE ADDED TO IT.
     Three of the four callers hand in `ck-btn ck-btn-primary`, and both
     branches below used to append `ck-btn-quiet` to whatever they were given.
     Appending does not demote a button; it half-demotes it. `.ck .ck-btn-quiet`
     is declared after `.ck .ck-btn-primary` at the same specificity, so it took
     `color` and `border-color` and left `background` exactly where it was: the
     assigned button on the recommendation card, in the comparison and in an
     open row rendered as the sage fill with charcoal ink on it. That is 2.64:1,
     which is the figure color.css writes in its own row for --color-accent-text
     under "never on charcoal", against a 4.5 floor. The hover said the same
     thing louder -- `.ck-btn-quiet:hover` beat the primary's too, so the green
     vanished under a 6% wash at the moment the pointer arrived, which is a
     button changing away from filled as you go to press it.

     Assigned is the filled sage the row's own `assigned` tag already is
     (.ck-tag-lead: the same ground, the same warm ink at 5.32, the same check),
     so on a primary it keeps the fill and simply stops having its ink
     overwritten. Refused is quiet wherever it lands: "Can't assign" is not a
     primary action, and the disabled rule paints muted-gray ink, which on sage
     would be the same collision one token over. */
  const demote = (c) => `${c.split(' ').filter((x) => x !== 'ck-btn-primary').join(' ')} ck-btn-quiet`;

  /* `terse` is the fleet. The word "Assigned" moves out of the button and
     into the rank cell as a tag there, beside "pick" and "option A", which
     is where this row's other states already live -- so the state is still a
     word, and the button is left saying the one thing it DOES. It is worth
     43px: "Assigned / Undo" is the widest control in the table and it was
     pushing the override situation 107px past the wrapper's edge. */
  function assignButton(t, cls = 'ck-btn', terse = false) {
    if (t.blocked) return `<button type="button" class="${demote(cls)}" aria-disabled="true" data-assign="${t.id}" data-focus="assign:${t.id}">Can&rsquo;t assign</button>`;
    if (state.assigned === t.id) return terse
      ? `<button type="button" class="${demote(cls)}" data-undo="${t.id}" data-focus="assign:${t.id}">Undo<span class="ck-btn-id"> the assignment of ${esc(t.id)}</span></button>`
      : `<button type="button" class="${cls.includes('ck-btn-primary') ? cls : demote(cls)}" data-undo="${t.id}" data-focus="assign:${t.id}">Assigned ${icon('check')} Undo</button>`;
    /* WHY THE ID IS WRAPPED RATHER THAN WRITTEN IN. In the fleet the span
       takes the visually-hidden treatment, so the button reads "Assign" and
       is still ANNOUNCED as "Assign T-118". Two reasons, and the second is
       the one that decides it. The id is already the second cell of the row
       the button sits in, so printing it again at the end of that row is the
       same fact twice; and "Assign T-118" made the action column 141px of a
       table that has 1118 to spend and now wants 1181, which is how adding
       one genuinely useful column pushed the whole argument -- seven trucks
       and every figure, in reach without scrolling -- off its own edge.

       The recommendation card and the close-call comparison keep the id in
       ink: there the button is the primary action, there is room, and no row
       of context is naming the truck beside it. */
    return `<button type="button" class="${cls}" data-assign="${t.id}" data-focus="assign:${t.id}">Assign <span class="ck-btn-id">${esc(t.id)}</span></button>`;
  }

  /* The window reading, as a line. Three states, each a word before it is a
     ground, and the arithmetic spelled out rather than asserted: the clock
     time, then the room against the close of the window. */
  function windowLine(t, cls = 'ck-window') {
    const st = WINDOW.state(t);
    const room = WINDOW.room(t);
    const tail = st === 'misses'
      ? `${Math.abs(room)} min after it shuts`
      : `${room} min of room`;
    return `<p class="${cls}" data-window="${st}">${icon(st === 'clear' ? 'clock' : 'clockAlert')}<span><span class="ck-label">At pickup by</span> ${clock(WINDOW.at(t))}
      <span class="ck-sep" aria-hidden="true">&middot;</span> ${WINDOW_WORD[st]}, ${tail}</span></p>`;
  }

  /* THE CARD NO LONGER REPEATS THE HEADLINE. It used to open "T-118 /
     Marisol Vega, Owatonna, MN" six pixels under a zone headline already
     reading "T-118 &middot; Marisol Vega", so the truck and the driver were on
     screen twice before a single factor was. The driver goes -- it is in the
     headline and in the fleet -- the id stays, because cockpit-shots.mjs
     clips this card on its own for the page above and a capture with no
     subject in it is a worse picture, and the place stays because it is the
     only fact here that was not said anywhere else.

     What takes the freed line is the window reading, which is the most
     useful sentence the card can carry. */
  function truckCard(t, heading, note) {
    return `<div class="ck-card${state.assigned === t.id ? ' is-assigned' : ''}">
      <p class="ck-card-head">${heading}</p>
      <p class="ck-card-truck">${esc(t.id)} <span class="ck-card-driver">now at ${esc(t.at)}</span></p>
      ${windowLine(t)}
      ${note ? `<p class="ck-card-note">${note}</p>` : ''}
      ${factorRows(t)}
      <p class="ck-card-act">${assignButton(t, 'ck-btn ck-btn-primary')}</p>
    </div>`;
  }

  /* =========================================================================
     THE CLOSE CALL, AS ONE COMPARISON RATHER THAN TWO CARDS.

     WHAT WAS WRONG WITH THE PAIR. Option A and Option B were two instances of
     the recommendation card, side by side, each listing the same five factors
     in the same order. Everything needed was on the screen and none of the
     comparing was done: to answer "which has more hours" a reader had to find
     the fourth row of the left card, hold 5.8, find the fourth row of the
     right card, and subtract. Five times. On a phone the two cards stack, so
     the two halves of every comparison ended up about nine hundred pixels
     apart -- which is not a comparison, it is two readings and a memory test.

     A comparison of two things across five measures is a table, and saying so
     in markup is most of the fix: <th scope="col"> on each option and <th
     scope="row"> on each factor means a screen reader announces "Hours of
     service left, Option B, 8.4 h" from one cell, which is the sentence the
     pair of cards could not produce at all.

     THE DECISIVE ROWS COME FIRST. tradeoff() already knew which factor each
     truck wins on; that was spent on a sentence in the headline and then
     thrown away, leaving the rows in weighting order with the two that matter
     buried among the three that do not. They now sort to the top and carry the
     word "the tradeoff", so the row order is the argument.

     NO BARS ARE LOST. Each cell keeps the fleet bar the card had, and now the
     two bars for one factor sit on the same line, which is the one arrangement
     that makes them worth drawing.
     ========================================================================= */
  function compareHead(a, b) {
    const tr = tradeoff(a, b);
    if (!tr.a || !tr.b) return `${a.id} and ${b.id} are level. Nothing separates them.`;
    return `${a.id} and ${b.id} are level. The tradeoff is ${tr.a.wins} against ${tr.b.wins}.`;
  }

  function compareCell(t, f) {
    const d = direction(t, f);
    return `<td class="ck-vs-cell">
      <span class="ck-vs-value">${esc(f.unit(t))}</span>
      <span class="ck-factor-dir ck-vs-dir" data-dir="${esc(d)}">${icon(DIR_ICON[d])}${d}</span>
      ${ageLine(t, f)}
      ${factorBar(t, f)}
    </td>`;
  }

  function compareTable(a, b) {
    const tr = tradeoff(a, b);
    const decisive = new Set([tr.a && tr.a.key, tr.b && tr.b.key].filter(Boolean));
    /* The two that separate them, then the three that do not. */
    const rows = [...FACTORS].sort((x, y) => (decisive.has(y.key) ? 1 : 0) - (decisive.has(x.key) ? 1 : 0));
    const optHead = (t, label) => `<th scope="col" class="ck-vs-opt${state.assigned === t.id ? ' is-assigned' : ''}">
      <span class="ck-vs-opt-label ck-label">${label}</span>
      <span class="ck-vs-opt-id">${esc(t.id)}</span>
      <span class="ck-vs-opt-who">${esc(t.driver)} <span class="ck-sep" aria-hidden="true">&middot;</span> ${esc(t.at)}</span>
    </th>`;
    const winFor = (t) => {
      const st = WINDOW.state(t);
      return `<td class="ck-vs-cell ck-vs-win" data-window="${st}">
        <span class="ck-vs-value">${clock(WINDOW.at(t))}</span>
        <span class="ck-factor-dir ck-vs-dir" data-window="${st}">${WINDOW_WORD[st]}</span>
      </td>`;
    };
    return `<table class="ck-vs">
      <caption class="ck-visually-hidden">${esc(a.id)} and ${esc(b.id)} compared on each factor the ranking weighed, the two that separate them first, then the reading for the pickup window.</caption>
      <thead><tr>
        <td class="ck-vs-corner"></td>
        ${optHead(a, 'Option A')}
        ${optHead(b, 'Option B')}
      </tr></thead>
      <tbody>
        ${rows.map((f) => `<tr class="ck-vs-row${decisive.has(f.key) ? ' is-decisive' : ''}">
          <th scope="row" class="ck-vs-factor">
            <span class="ck-vs-factor-name">${esc(f.label)}</span>
            ${decisive.has(f.key) ? '<span class="ck-vs-tag">the tradeoff</span>' : ''}
          </th>
          ${compareCell(a, f)}
          ${compareCell(b, f)}
        </tr>`).join('')}
        <tr class="ck-vs-row ck-vs-derived">
          <th scope="row" class="ck-vs-factor">
            <span class="ck-vs-factor-name">At pickup by</span>
            <span class="ck-vs-note">derived, not ranked</span>
          </th>
          ${winFor(a)}
          ${winFor(b)}
        </tr>
      </tbody>
      <tfoot><tr>
        <td class="ck-vs-corner"></td>
        <td class="ck-vs-act">${assignButton(a, 'ck-btn ck-btn-primary')}</td>
        <td class="ck-vs-act">${assignButton(b, 'ck-btn ck-btn-primary')}</td>
      </tr></tfoot>
    </table>
    <p class="ck-factor-key">
      <span class="ck-factor-bar ck-key-sample" aria-hidden="true" style="--pos:62%;--med:50%;--band-l:42%;--band-w:16%"><span class="ck-factor-mark"></span></span>
      <span>Worst to best across the trucks that can take this load, with the fleet&rsquo;s middle marked and the zone that still counts as level either side of it.</span>
    </p>`;
  }

  /* THE FIGURE THE SYSTEM WILL NOT VOUCH FOR. In a close call the card
     already declines to pick; this is the second reason it should, said in
     words under the first. The arithmetic is spelled out rather than
     asserted -- the hours, the run, the margin, the age -- because a warning
     whose inputs are hidden is the thing this prototype exists to argue
     against. It is a reading and not a rule: the row keeps its Assign, and
     what the sentence asks for is a check, not a refusal. */
  function staleNote(trucks) {
    return trucks.filter(staleHos).map((t) => {
      const margin = Math.round((t.hos - DATA.load.driveHours) * 60);
      const older = t.seen.eld > margin ? ' The figure is older than the margin.' : '';
      return `<p class="ck-fresh" data-age="stale">${icon('clockAlert')}<span><strong>${esc(t.id)}&rsquo;s hours are ${t.seen.eld} minutes old.</strong> ${t.hos.toFixed(1)} h against a ${DATA.load.driveHours} h run leaves ${margin} minutes of margin.${older} If this is the side you take, check the logbook first.</span></p>`;
    }).join('');
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
      html += `<div class="ck-lead" data-tone="close">
        <p class="ck-lead-kicker ck-label">Close call: no pick</p>
        <h3 class="ck-reco-h">${esc(compareHead(first, second))}</h3>
        <p class="ck-reco-dek">The system is not ranking one over the other. Pick the side of the tradeoff that matters for this load.</p>
        ${staleNote([first, second])}
        ${compareTable(first, second)}
        ${renderConfidence()}
      </div>`;
    } else {
      const overridden = state.assigned && state.assigned !== first.id;
      html += `<div class="ck-lead">
        <p class="ck-lead-kicker ck-label">${overridden ? 'The system&rsquo;s pick, not yours' : 'Recommended'}</p>
        <h3 class="ck-reco-h">${esc(first.id)} <span class="ck-sep" aria-hidden="true">&middot;</span> ${esc(first.driver)}</h3>
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

  /* FOUR TONES, AND ONLY ONE OF THEM IS CAUTION. There were three, and the
     default among them put a check-in-a-circle on every line the cockpit
     opened with -- including "Blocked by a rule: T-114 is over hours and
     cannot be assigned", which is a sentence where nothing has been done and
     a truck has been refused, under the glyph that elsewhere means an
     assignment went through.

     pick     an assignment landed            check, muted ground
     note     here is the situation           info,  muted ground
     close    the system declines to lead     help,  muted ground
     refused  a rule will not allow it        ban,   caution ground

     Caution is spent on the last one alone, which is the only one where
     something cannot be done. */
  const TONE_ICON = { pick: 'checkCircle', note: 'info', close: 'help', refused: 'ban' };
  function renderStatus(message, tone = 'pick') {
    const s = $('.ck-status', root);
    if (message === undefined) return;
    s.setAttribute('data-tone', tone);
    s.innerHTML = `${icon(TONE_ICON[tone] || 'checkCircle')}<span>${esc(message)}</span>`;
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
        <p class="ck-why-head" id="ck-why-head" tabindex="-1">You assigned ${esc(id)}, ranked ${ordinal(r)}. Why? <span class="ck-why-opt">Optional.</span></p>
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

  /* A head is a label and, where the number needs one, a unit on its own
     line under it, so no head wraps where the browser decides and every
     label sits on the same line across the row. */
  const COLUMNS = [
    { key: 'rank',     label: 'Rank',       sortable: true },
    { key: 'id',       label: 'Truck',      sortable: true },
    { key: 'driver',   label: 'Driver',     sortable: true },
    { key: 'at',       label: 'Now at',     sortable: true },
    { key: 'dist',     label: 'To pickup',  sortable: true, num: true, unit: 'miles' },
    /* The derived one. It sits beside the miles it is figured from rather
       than at the end of the row, because the pair is the point: the miles
       are what the ranking weighed and the clock time is what they mean. */
    { key: 'arrive',   label: 'At pickup',  sortable: true, num: true, unit: () => `by ${clock(DATA.load.windowClose)}`.replace(' pm', ''), win: true },
    { key: 'hos',      label: 'Hours left', sortable: true, num: true, unit: () => `${DATA.load.driveHours} needed` },
    { key: 'equip',    label: 'Equipment',  sortable: true },
    { key: 'onTime',   label: 'On time',    sortable: true, num: true, unit: 'this customer' },
    { key: 'deadhead', label: 'Deadhead',   sortable: true, num: true, unit: 'miles' },
    { key: 'act',      label: 'Assign',     sortable: false, act: true },
  ];

  function sortValue(t, key) {
    if (key === 'rank') return t.rank === null ? 999 : t.rank;
    if (key === 'onTime') return t.onTime[1] ? t.onTime[0] / t.onTime[1] : -1;
    if (key === 'arrive') return WINDOW.at(t);
    return t[key];
  }

  /* ---------------------------------------------------------------------
     A ROW THAT CAN EXPLAIN ITSELF.

     "Also considered" explained why second and third lost, and stopped
     there: the other four trucks kept their figures and never got a reason.
     A page whose fourth design decision is "keep the whole fleet in reach"
     ought to mean the reasoning too, not only the numbers.

     It also answers the phone. At 390px the fleet is 1,104px of table in a
     292px wrapper -- three columns visible, seven columns and the Assign
     button off to the right behind a scroll with no bar on it, which is how
     the blocked situation could tell a phone reader to assign T-114 from a
     table that had no reachable button. Under 48rem the stylesheet drops the
     columns this detail carries, and the row is where they go: nothing is
     lost, and what is left fits.

     Not a second pattern, either: it is the same open-in-place disclosure as
     the misses list and the comparisons note, which is the page's one idiom
     for "there is more here". ------------------------------------------- */
  function rowDetail(t) {
    const leader = state.ranked[0];
    const why = t.blocked
      ? `<span class="ck-why-rank-rule">${icon('ban')} ${esc(t.blocked.text)}</span>`
      : (leader && t.id === leader.id && !state.tie)
        ? 'Ranked first: no other truck is ahead of it once the five factors are weighed together.'
        : (leader ? `Ranked ${ordinal(t.rank)}. Lost on ${esc(whyLost(t, leader))}` : '');
    return `<div class="ck-detail">
      <p class="ck-detail-who"><span class="ck-label">Driver</span> ${esc(t.driver)}
        <span class="ck-sep" aria-hidden="true">&middot;</span> <span class="ck-label">now at</span> ${esc(t.at)}</p>
      ${windowLine(t, 'ck-window ck-detail-window')}
      ${factorRows(t, { note: false })}
      <p class="ck-detail-why">${why}</p>
      <p class="ck-detail-act">${assignButton(t, 'ck-btn ck-btn-primary')}</p>
    </div>`;
  }

  function renderTable() {
    const { key, dir } = state.sort;
    const rows = [...state.fleet].sort((a, b) => {
      const x = sortValue(a, key), y = sortValue(b, key);
      const c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
      return dir === 'asc' ? c : -c;
    });
    const head = COLUMNS.map((c) => {
      const cls = [c.num ? 'ck-num' : '', c.act ? 'ck-cell-act' : ''].filter(Boolean).join(' ');
      const unit = typeof c.unit === 'function' ? c.unit() : c.unit;
      const label = `<span class="ck-th-text"><span class="ck-th-label">${esc(c.label)}</span>${unit ? `<span class="ck-th-unit">${esc(unit)}</span>` : ''}</span>`;
      if (!c.sortable) return `<th scope="col"${cls ? ` class="${cls}"` : ''}><span class="ck-th">${label}</span></th>`;
      const on = key === c.key;
      const sorted = on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none';
      const glyph = icon(on ? (dir === 'asc' ? 'sortUp' : 'sortDown') : 'sort', 'ck-icon ck-sort-icon');
      return `<th scope="col" aria-sort="${sorted}"${cls ? ` class="${cls}"` : ''}>
        <button type="button" class="ck-th ck-sort" data-sort="${c.key}" data-focus="sort:${c.key}">${label}${glyph}</button>
      </th>`;
    }).join('');
    const body = rows.map((t) => {
      const cls = ['ck-row'];
      if (t.rank === 1 && !state.tie) cls.push('is-lead');
      if (state.tie && t.rank <= 2) cls.push('is-lead');
      if (t.blocked) cls.push('is-blocked');
      if (state.assigned === t.id) cls.push('is-assigned');
      /* THE RANK CELL STACKS: the ordinal on one line, every mark on the
         next. Laid out inline it was the widest column in the table -- "1st"
         and a pick tag and a moved marker all abreast wanted 105px -- and
         the marks are exactly what a row may or may not have, so the column
         was sized by its busiest row in every situation. Stacked, the column
         is the width of the widest MARK rather than the width of an ordinal
         plus all of them, which is what buys the room for the At pickup
         column without anything leaving the table. */
      const rankMain = t.blocked
        ? `<span class="ck-rank-rule">${icon('ban')}<span>${esc(t.blocked.rule)}</span></span>`
        : ordinal(t.rank);
      const marks = [
        t.rank === 1 && !state.tie ? `<span class="ck-rank-tag ck-tag-lead">${icon('checkCircle')}pick</span>` : '',
        state.tie && t.rank <= 2 ? `<span class="ck-rank-tag">option ${t.rank === 1 ? 'A' : 'B'}</span>` : '',
        /* No glyph on this one. "pick" earns a mark because it is the
           system speaking; "assigned" is the reader's own action and the row
           is already on the assigned ground with its type in semibold, so
           the check was a third telling -- and 15px of a table that was two
           pixels wider than its wrapper. */
        state.assigned === t.id ? `<span class="ck-rank-tag ck-tag-assigned">assigned</span>` : '',
      ].filter(Boolean).join('');
      const open = state.open.has(t.id);
      const win = WINDOW.state(t);
      /* WHERE THE ROW CAME FROM. Switching situations re-ranks the fleet
         silently: seven rows change order and nothing says which moved,
         which is the one thing a reader flicking between four situations
         wants to know. The marker is a direction and a number of places,
         with the words in the row, and it is cleared by the reader's next
         action rather than by a timer -- a mark that vanishes on its own is
         a mark that vanishes while you are reading it. */
      const move = state.moved.get(t.id);
      const moveMark = move
        ? `<span class="ck-rank-moved">${icon(move < 0 ? 'up' : 'down')}<span aria-hidden="true">${Math.abs(move)}</span><span class="ck-visually-hidden">moved ${move < 0 ? 'up' : 'down'} ${Math.abs(move)} ${Math.abs(move) === 1 ? 'place' : 'places'}</span></span>`
        : '';
      return `<tr class="${cls.join(' ')}">
        <th scope="row" class="ck-cell-rank"><span class="ck-rank-n">${rankMain}</span>${marks || moveMark ? `<span class="ck-rank-marks">${marks}${moveMark}</span>` : ''}</th>
        <td class="ck-cell-truck"><button type="button" class="ck-row-more" data-more="${esc(t.id)}" data-focus="more:${esc(t.id)}" aria-expanded="${open}" aria-controls="ck-detail-${esc(t.id)}">${esc(t.id)}<span class="ck-visually-hidden">, ${open ? 'hide' : 'show'} every figure</span>${icon('expand', 'ck-icon ck-row-chev')}</button></td>
        <td class="ck-cell-text">${esc(t.driver)}</td>
        <td class="ck-cell-text">${esc(t.at)}</td>
        <td class="ck-num">${t.dist}</td>
        <td class="ck-num ck-cell-win" data-window="${win}">${clock(WINDOW.at(t))}${TABLE_WORD[win] ? `<span class="ck-cell-note">${TABLE_WORD[win]}</span>` : ''}</td>
        <td class="ck-num">${t.hos.toFixed(1)}${t.blocked ? ` <span class="ck-cell-note">needs ${DATA.load.driveHours}</span>` : ''}${staleHos(t) ? `<span class="ck-cell-note" data-age="stale">${t.seen.eld} min old</span>` : ''}</td>
        <td>${esc(t.equip)}</td>
        <td class="ck-num">${t.onTime[1] ? `${t.onTime[0]} of ${t.onTime[1]}` : '<span class="ck-cell-note">none yet</span>'}</td>
        <td class="ck-num">${t.deadhead}</td>
        <td class="ck-cell-act">${assignButton(t, 'ck-btn', true)}</td>
      </tr>
      <tr class="ck-row-detail${open ? ' is-open' : ''}" id="ck-detail-${esc(t.id)}"${open ? '' : ' hidden'}>
        <td colspan="${COLUMNS.length}">${open ? rowDetail(t) : ''}</td>
      </tr>`;
    }).join('');
    $('.ck-table', root).innerHTML = `<caption class="ck-visually-hidden">Every truck in the fleet, with the columns the recommendation weighed and the time each would reach the pickup. Sort any column; open any truck for the rest of its figures; assign any truck the rule allows.</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
    renderDensity();
  }

  /* The density switch. A dispatch floor runs denser than a portfolio page,
     and a demo that only ever shows the comfortable end is quietly arguing
     for a screen nobody would ship. Two buttons, aria-pressed, and both ends
     keep every target over the 24px of 2.5.8 Target Size (Minimum), which
     `node scripts/targets.mjs --strict` holds the whole site to.

     MEASURE THE TARGET, NOT THE TEXT BOX. This comment has now been wrong
     twice in opposite directions, and both times because of the same thing.
     It first claimed comfortable "carries the 44px the rest of this site holds
     itself to". That was corrected to say nothing here reaches 44 and neither
     does the site -- "the nav links on this very page are 27px" -- and the
     correction was worse, because 27px is the size of the WORDS. This site
     puts an absolutely-positioned ::after behind its link patterns to carry
     the target to 44 without moving the underline, and style.css argues for it
     at four call sites. A pseudo-element has no rect, so getBoundingClientRect
     never saw it. Hit-tested with elementFromPoint, .site-nav a is 38x27 of
     text inside 39x45 of target, and the footer, .work-cta, .product-link and
     .glance-more all land on 44 or 45 the same way. The original claim about
     the site was right. The tool used to check it was not.

     What is true of the COCKPIT, hit-tested at 1440: the row Assign buttons
     reach 44 and the slideshow arrows 45, and the rest fall short -- the
     situation tabs at 39, the primary Assign at 38, the sortable column heads
     at 42, this density pair at 26. That is because this component builds its
     targets out of padding rather than out of that ::after, which is the right
     trade in a data table of seven trucks and ten columns and the wrong one to
     describe as meeting a bar it does not meet.

     44px is 2.5.5 Target Size (Enhanced), which is AAA and which the site does
     not claim: across 28 pages, 933 of 1514 non-inline targets reach it. The
     criterion this component is held to is the AA one above, and both
     densities pass it. If you want to move a number in this paragraph, move it
     with targets.mjs and not with a rect. */
  function renderDensity() {
    const wrap = $('.ck-fleet', root);
    if (!wrap) return;
    wrap.classList.toggle('is-compact', state.density === 'compact');
    for (const b of wrap.querySelectorAll('[data-density]')) {
      b.setAttribute('aria-pressed', String(b.dataset.density === state.density));
    }
  }

  /* PUT THE KEYBOARD SOMEWHERE WITHOUT THROWING THE PAGE AT IT.

     Every re-render here replaces the node the reader was standing on, so
     focus has to be placed again, and a bare `el.focus()` is what made this
     cockpit lurch. focus() scrolls its target into view by whatever rule the
     browser likes, `html` carries `scroll-behavior: smooth`, and the cockpit
     is 2029px tall inside a 900px viewport -- so a press could animate the
     page several hundred pixels for an element that was already on screen.

     preventScroll and then `block: 'nearest'` is the whole fix: nothing moves
     if the target is already in view, and if it is not, the page travels the
     shortest distance that puts it there rather than centring it. The
     stylesheet's scroll-margin on these controls is what keeps the landing
     clear of the sticky situation strip. */
  function keep(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest' });
  }

  /* Re-render everything under the tabs, keeping focus where it was.

     The checklist is rendered here rather than only on a tab change, because
     what ticks a step off is any action at all. And when a step lands, the
     count goes on the END of the status message rather than into a live
     region of its own: one announcement channel, and the step is heard in
     the same breath as the thing that completed it. */
  let lastDone = 0;
  function render(status, tone) {
    const focusKey = document.activeElement && document.activeElement.dataset.focus;
    renderReco();
    renderWhy();
    renderTable();
    renderSituation();
    const total = stepsOf(state.scenario).length;
    const done = stepsDone(state.scenario);
    if (status !== undefined) {
      let msg = status;
      if (total && done > lastDone) {
        msg += done === total
          ? ` That is all ${total} of the things to try in this scenario.`
          : ` ${done} of ${total} things to try, done.`;
      }
      renderStatus(msg, tone);
    }
    lastDone = done;
    if (focusKey) keep(root.querySelector(`[data-focus="${focusKey}"]`));
  }

  /* ----- actions --------------------------------------------------------- */

  function load(scenario) {
    const wasRanks = state.prevRanks;
    const wasScenario = state.scenario;
    state.scenario = scenario;
    state.fleet = buildFleet(scenario);
    state.sort = { key: 'rank', dir: 'asc' };
    state.assigned = null; state.why = null; state.answered = null;
    state.did = new Set(); state.open = new Set();
    rank();

    /* What moved, and from where. Only across a genuine switch: reloading
       the same situation re-ranks the same fleet and has nothing to report. */
    state.moved = new Map();
    if (wasRanks && wasScenario && wasScenario.id !== scenario.id) {
      for (const t of state.fleet) {
        const before = wasRanks.get(t.id);
        if (before != null && t.rank != null && before !== t.rank) state.moved.set(t.id, t.rank - before);
      }
    }
    state.prevRanks = new Map(state.fleet.map((t) => [t.id, t.rank]));

    renderTabs();
    const first = state.ranked[0], second = state.ranked[1];
    const blocked = state.fleet.filter((t) => t.blocked).map((t) => t.id);
    const moved = state.moved.size
      ? ` ${state.moved.size} ${state.moved.size === 1 ? 'truck' : 'trucks'} changed rank, marked in the data table.`
      : '';
    let status;
    const stale = [first, second].filter(staleHos).map((t) => ` ${t.id}\u2019s hours figure is ${t.seen.eld} minutes old.`).join('');
    if (state.tie) status = `Close call: ${first.id} and ${second.id} are within a hair of each other. The tradeoff is the first row of the comparison.${stale}${moved}`;
    else status = `${scenario.tab}: the system recommends ${first.id}, ${first.driver}.${blocked.length ? ` ${blocked.join(', ')} is over hours and cannot be assigned.` : ''}${moved}`;
    /* THE SITUATION SUMMARY IS A NOTE, NOT A DONE. Every one of these lines
       arrived under a check-in-a-circle, including "Blocked by a rule: T-114
       is over hours and cannot be assigned" -- the glyph the same line uses
       to confirm an assignment, sitting on a sentence where nothing has been
       assigned and one truck is refused. The check now belongs to the one
       event that earns it. */
    lastDone = stepsDone(scenario);
    render(status, state.tie ? 'close' : 'note');
    if (scenario.then) scenario.then(api);
  }

  /* `staged` is an assignment the PAGE made, not the reader: the override
     situation opens with the dispatcher's choice already taken, so the reader
     arrives at the consequence rather than having to produce it. It reaches
     the same code because it is the same event -- but the reader did not
     press anything, and moving their keyboard and their scroll position for
     something they did not do is how pressing a tab came to throw the page
     850px. A staged assignment renders; it does not reach for the reader. */
  function assign(id, staged = false) {
    const t = truck(id);
    if (!t || t.blocked) {
      state.did.add(`refused:${id}`);
      render(`${id} can’t be assigned: ${t ? t.blocked.text : 'not in the fleet'}`, 'refused');
      return;
    }
    state.assigned = id;
    state.answered = null;
    const first = state.ranked[0];
    const isOverride = state.tie ? t.rank > 2 : id !== first.id;
    state.why = isOverride ? { truck: id, rank: t.rank } : null;
    /* WHAT THE ASSIGNMENT MEANS, in the same breath as the fact of it. Three
       figures the screen already holds, read out for the truck that was just
       chosen: when it reaches the pickup, how that sits against the window,
       and what the driver has left once the run is done. All derived, none
       new, and the third one is where a stale hours figure stops being
       abstract -- 0.3 h left after the run is a number worth a phone call. */
    const room = WINDOW.room(t);
    const after = (t.hos - DATA.load.driveHours).toFixed(1);
    const consequence = ` At pickup by ${clock(WINDOW.at(t))}, ${room < 0 ? `${-room} min after the window shuts` : `${room} min inside the window`}; ${after} h of driver hours left after the run.`;
    const line = `${DATA.load.id} assigned to ${id}, ${t.driver}.${consequence}` +
      /* The second clause is a promise about the keyboard, so it is only true
         of an assignment the reader made. A staged one says what happened and
         stops -- and does not replace it with a sentence about where to look,
         which is the layout problem the block below was written to end. */
      (isOverride ? ` That is the truck ranked ${ordinal(t.rank)}, so there is an optional question about why.${staged ? '' : ' It is open, and focus has moved to it.'}` : '');
    render(line);
    /* THE QUESTION USED TO OPEN WHERE THE READER WAS NOT. Assign sits at the
       end of every fleet row, and the prompt renders above the table -- so
       overriding from the last row put the question about nine hundred pixels
       off the top of the screen, and the status line covered for it with the
       words "above the data table". Copy that tells a reader where to scroll
       is a layout problem wearing a sentence.

       Focus goes to the prompt instead, which is also what says the override
       went through for anyone not watching the status line. The row keeps its
       Undo, so the way back is still where the choice was made.

       IT USED TO CENTRE THE PROMPT, WHICH IS A DIFFERENT PROMISE. `block:
       'center'` does not ask whether the prompt needs bringing in; it puts it
       halfway down the viewport whatever the case. Overriding from a row with
       the data table at the top of a 1440x900 screen scrolled 299px to move a
       prompt that had rendered at y=180 and was already entirely readable.

       `keep` asks first. Measured from that same state it now moves 54px --
       the distance that clears the sticky strip, and no more. The case this
       block was written for, an override from the bottom row, still travels:
       850px before, 605px now, landing the prompt at y=234. What went is the
       travel that was never needed, not the rescue. */
    if (isOverride && !staged) keep(root.querySelector('#ck-why-head'));
  }

  function undo() {
    const was = state.assigned;
    state.assigned = null; state.why = null; state.answered = null;
    state.did.add('undo');
    render(`Assignment of ${was} undone. No reason was submitted.`, 'note');
  }

  /* The two ways out of the question both re-render it away from under the
     keyboard, so each says where focus goes next: the note that the answer
     was stored, or the row's Undo, which is where the assignment lives. */
  function answer(reason) {
    state.answered = reason;
    state.did.add('answered');
    render(`Reason saved with ${state.why.truck}: “${reason}”`);
    keep(root.querySelector('[data-focus="why:done"]'));
  }

  /* SKIP IS ALSO WHERE AN EMPTY SAVE LANDS, AND IT USED TO SAY SO WRONGLY.
     Nothing in the question is required, so pressing "Save the reason" with no
     radio chosen and no words typed has nothing to store and falls through to
     here -- where the reader, who had just pressed Save, was told "Skipped."
     The two exits do the same thing to the assignment, and should: what was
     wrong was one of them describing the other one's press. `via` is which
     button the reader actually touched. */
  function skip(via = 'skip') {
    state.did.add('skipped');
    state.why = null;
    render(via === 'save'
      ? 'Nothing to save: no reason was chosen and nothing was typed. The assignment stands.'
      : 'Skipped. The assignment stands and no reason was submitted.', 'note');
    keep(root.querySelector('[data-undo]'));
  }

  /* Everything a situation's own `then` does is staged by definition: it is
     the page setting a scene, and the reader has pressed a tab at most. */
  const api = { assign: (id) => assign(id, true), ranked: () => state.ranked };

  /* ----- events ---------------------------------------------------------- */

  root.addEventListener('click', (e) => {
    /* THE TAB THAT IS FOCUSED IS NOT THE TAB THAT WAS PRESSED. load() runs
       renderTabs(), which rewrites the strip's innerHTML -- so by the time
       this handler reached `tab.focus()`, `tab` was a detached node and the
       call did nothing at all. Focus fell to <body>: the reader clicked a
       situation and, without being told, lost their place in a 13,000px
       document. Tab from there restarts at the skip link, and the arrow keys
       below go dead, because their handler needs a [role="tab"] under focus.

       Re-query after the render, which is exactly what the keydown handler at
       the bottom of this file has always done. The two paths now agree. */
    const tab = e.target.closest('[data-scenario]');
    if (tab) {
      const id = tab.dataset.scenario;
      load(DATA.scenarios.find((s) => s.id === id));
      keep(root.querySelector(`[data-scenario="${id}"]`));
      return;
    }

    /* Anything the reader does clears the "moved" marks. Not a timer: a mark
       that disappears by itself disappears while it is being read. */
    const hadMarks = state.moved.size > 0;
    if (hadMarks) state.moved.clear();

    /* CLEARING THE MAP IS NOT CLEARING THE MARKS. Every branch below ends in a
       render that repaints the data table, except this one: renderDensity only
       toggles a class and the pressed state of two buttons. So the density
       switch emptied state.moved and left its four arrows on the screen, and
       they went on the action after -- which made the rule above true of four
       of the five controls and quietly false of the fifth. renderTable ends by
       calling renderDensity, so this covers both jobs in the one pass. */
    const density = e.target.closest('[data-density]');
    if (density) {
      state.density = density.dataset.density;
      if (hadMarks) renderTable(); else renderDensity();
      return;
    }

    const more = e.target.closest('[data-more]');
    if (more) {
      const id = more.dataset.more;
      if (state.open.has(id)) state.open.delete(id);
      else { state.open.add(id); state.did.add(`open:row:${id}`); }
      render(); return;
    }

    const sort = e.target.closest('[data-sort]');
    if (sort) {
      const k = sort.dataset.sort;
      state.sort = state.sort.key === k ? { key: k, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' };
      state.did.add(`sort:${k}`);
      render(); return;
    }
    const a = e.target.closest('[data-assign]');
    if (a) { assign(a.dataset.assign); return; }
    const u = e.target.closest('[data-undo]');
    if (u) { undo(); return; }
    if (e.target.closest('[data-skip]')) { skip(); }
  });

  /* <details> fires toggle and does not bubble it, so this listens on the way
     down. It is how the checklist knows the late deliveries were opened. */
  root.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.open || d.tagName !== 'DETAILS') return;
    if (d.classList.contains('ck-misses')) { state.did.add('open:misses'); renderSituation(); }
    if (d.classList.contains('ck-note')) { state.did.add('open:note'); renderSituation(); }
  }, true);

  root.addEventListener('submit', (e) => {
    const form = e.target.closest('.ck-why-form');
    if (!form) return;
    e.preventDefault();
    const picked = form.querySelector('input[name="reason"]:checked');
    const more = form.querySelector('textarea[name="more"]').value.trim();
    let reason = picked ? picked.value : '';
    if (reason === '__other') reason = more || 'Something else';
    else if (more) reason = reason ? `${reason}: ${more}` : more;
    if (!reason) { skip('save'); return; }
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
    const id = next.dataset.scenario;
    load(DATA.scenarios.find((s) => s.id === id));
    keep(root.querySelector(`[data-scenario="${id}"]`));
  });

  renderLoad();
  load(DATA.scenarios[0]);

})();
