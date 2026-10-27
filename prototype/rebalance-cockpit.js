/* rebalance-cockpit.js -- the dispatch cockpit's interface on live data.
 *
 * WHAT THIS IS. The same four-part screen as dispatch-cockpit.js -- the
 * reasons behind a pick, a close call that declines to pick, a rule that
 * removes a candidate before scoring, an override that costs one press --
 * pointed at Citi Bike's public station feed instead of an invented fleet.
 * The job is a rebalancing dispatcher's: a station has run out of bikes, and
 * a van has to fetch some from a station nearby that has more than it needs.
 *
 * WHAT IS REAL AND WHAT IS NOT. Every station, count, capacity and report
 * time on screen comes from the feed, read in the reader's own browser.
 * Three things do not, and the page says so wherever they appear: the floor
 * a station keeps for its own riders, the share an empty station should be
 * refilled to, and the weights. They are mine, in DATA below, because the
 * operator's own are not public. There is no model; the ranking is a
 * weighted rule over the three factors on screen.
 *
 * THE FEED. GBFS, the open standard bike-share systems publish in:
 * station_information (where, how big; read once) and station_status (how
 * many, how recently; every minute). Both answer cross-origin, so a static
 * page can read them with no server and no key.
 *
 * THE SNAPSHOT. rebalance-snapshot.js is one saved reading, written by
 * scripts/rebalance-snapshot.mjs. The page plays it when the feed does not
 * answer, when the address carries ?snapshot, and when the browser is driven
 * by automation -- every check in scripts/ -- so the checks measure the same
 * page on every run. The screen says which of the three it is showing.
 *
 * THE SCREEN DOES NOT MOVE UNDER THE READER. A newer reading arrives every
 * minute and waits behind a button until it is asked for, because a ranking
 * that reorders itself while someone is reading it is a ranking nobody can
 * check. The one thing that ticks is the age of the reading on screen.
 *
 * Styled by dispatch-cockpit.css, whose .ck markup this renders verbatim;
 * rebalance-cockpit.css holds only what that screen never needed. No
 * dependencies, no build step. States are is-* classes so
 * scripts/states.mjs can force the ones the page does not load in.
 */
(() => {
  'use strict';

  /* =========================================================================
     DATA -- the source, and the assumptions, in one place.
     ========================================================================= */
  const DATA = {
    system: {
      name: 'Citi Bike',
      city: 'New York',
      tz: 'America/New_York',
      feed: 'https://gbfs.lyft.com/gbfs/2.3/bkn/en/',
    },
    /* Which empty stations get a tab: renting, no bikes, at least this many
       docks, largest first. Size stands in for demand, which the feed does
       not carry; a station built with 60 docks was built for 60 riders. */
    tabs: 4,
    minCapacity: 19,
    /* The candidates for each empty station: the nearest this many stations,
       whatever state they are in, then a little further if those cannot
       supply a real choice (minChoices and reach, below). A van crew does not drive past eight
       stations to reach a ninth, and eight rows is a fleet a person can
       hold in view at once. */
    near: 8,
    /* When fewer than three of those eight can give bikes, the pool reaches
       up to four stations further for ones that can, and stops there. */
    minChoices: 3,
    reach: 4,
    /* THE ASSUMPTIONS. A station keeps a floor for its own riders -- a
       fifth of its docks, never fewer than three -- and a stop has to be
       worth at least three bikes. Together they are the rule: a station
       that cannot spare three without going under its floor is removed
       before scoring, whatever else is true about it. An empty station is
       refilled to 40% of its docks, and a van carries 20. */
    floorShare: 0.2,
    floorMin: 3,
    minMove: 3,
    fillTo: 0.4,
    vanSeats: 20,
    weights: { dist: 0.45, spare: 0.35, docks: 0.2 },
    /* Two leaders closer than this are a close call, and the system does
       not pick between them. */
    tieMargin: 0.05,
    /* A station's count older than this many minutes is marked stale. Most
       report every minute or two; one that has not reported in half an hour
       may be offline, and its count may no longer be its count. */
    staleMin: 30,
    pollSec: 60,
    reasons: [
      'A van is already near that station',
      'That station refills on its own this time of day',
      'Parking or street access is easier there',
    ],
    whatHappens: 'Nothing, in this prototype. A working version would keep it with the move, and three of the same reason at one station in a month would go to whoever sets the floors.',
  };

  /* =========================================================================
     FACTORS -- what is weighed, how it is shown, and which way is better.
     ========================================================================= */
  const FACTORS = [
    { key: 'dist',  label: 'Distance',        unit: (s) => `${s.dist.toFixed(2)} mi`, wins: 'a shorter drive' },
    { key: 'spare', label: 'Bikes to spare',  unit: (s) => plural(Math.max(0, s.spare), 'bike'), wins: 'more bikes to spare' },
    { key: 'docks', label: 'Docks open there', unit: (s) => `${s.docks} of ${s.capacity}`, wins: 'relieving a fuller station' },
  ];
  /* Where a figure came from and how long ago. Only the count ages; the
     distance is geometry. */
  const AGE = {
    spare: (s) => ({ text: `reported ${ago(s.age)}`, stale: s.age >= DATA.staleMin }),
  };
  const stale = (s) => s.age >= DATA.staleMin;

  /* =========================================================================
     MECHANISM
     ========================================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]);
  const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const ago = (min) => (min < 1 ? 'under a minute ago' : `${plural(Math.round(min), 'minute')} ago`);
  /* Clock times in the city the stations are in, whatever the reader's own
     time zone: "4:05 pm", never 16:05. */
  const clockFmt = new Intl.DateTimeFormat('en-US', { timeZone: DATA.system.tz, hour: 'numeric', minute: '2-digit' });
  const clock = (sec) => clockFmt.format(new Date(sec * 1000)).replace(' AM', ' am').replace(' PM', ' pm');
  const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: DATA.system.tz, month: 'long', day: 'numeric' });

  /* Straight-line miles. The table says straight-line, because a van drives
     the grid and the grid is longer. */
  const miles = (a, b) => {
    const r = (x) => (x * Math.PI) / 180;
    const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * 3958.8 * Math.asin(Math.sqrt(h));
  };

  const ICON_PATHS = {
    up:       '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    down:     '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    check:    '<path d="M20 6 9 17l-5-5"/>',
    dash:     '<path d="M5 12h14"/>',
    ban:      '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    help:     '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    info:     '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    chevron:  '<path d="m6 9 6 6 6-6"/>',
    sort:     '<path d="m8 9 4-4 4 4"/><path d="m16 15-4 4-4-4"/>',
    sortUp:   '<path d="m8 14 4-4 4 4"/>',
    expand:   '<path d="m6 9 6 6 6-6"/>',
    clockAlert: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l3.5 1.75"/>',
    refresh:  '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  };
  const icon = (name, cls = 'ck-icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
  const DIR_ICON = { helps: 'up', hurts: 'down', neutral: 'dash' };
  const SHAPE_ICON = { pick: 'checkCircle', close: 'help', rule: 'ban' };
  const ageLine = (s, f) => {
    const a = AGE[f.key] && AGE[f.key](s);
    if (!a) return '';
    return `<span class="ck-factor-age" data-age="${a.stale ? 'stale' : 'fresh'}">${a.stale ? icon('clockAlert') : ''}${esc(a.text)}</span>`;
  };

  const UNDO_ARMS_AFTER = 500;

  const state = {
    mode: 'loading',      /* live | snapshot | fallback */
    reading: null,        /* { updated, stations } on screen */
    next: null,           /* a newer reading, waiting for the reader */
    readAt: 0,            /* when the reading on screen was fetched, ms */
    seen: new Map(),      /* station id -> [{ t, bikes }] since the page opened */
    targets: [],
    target: null,
    pool: [],
    ranked: [],
    tie: false,
    sort: { key: 'rank', dir: 'asc' },
    assigned: null,
    why: null,
    answered: null,
    armed: 0,
    open: new Set(),
    density: 'comfortable',
  };

  const root = $('#cockpit');
  if (!root) return;

  /* ----- reading the feed ----------------------------------------------- */

  const useSnapshot = new URLSearchParams(location.search).has('snapshot') || navigator.webdriver;
  let info = null;

  async function getJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.json();
  }

  async function readLive() {
    if (!info) {
      const d = await getJSON(`${DATA.system.feed}station_information.json`);
      info = new Map(d.data.stations.map((s) => [s.station_id, s]));
    }
    const st = await getJSON(`${DATA.system.feed}station_status.json`);
    const stations = [];
    for (const s of st.data.stations) {
      const i = info.get(s.station_id);
      if (!i || !i.capacity) continue;
      const o = {
        id: s.station_id, name: i.name, lat: i.lat, lon: i.lon, capacity: i.capacity,
        bikes: s.num_bikes_available, ebikes: s.num_ebikes_available || 0,
        disabled: s.num_bikes_disabled || 0, docks: s.num_docks_available,
        renting: !!(s.is_installed && s.is_renting), reported: s.last_reported,
      };
      o.capacity = docksOf(o);
      stations.push(o);
    }
    return { updated: st.last_updated, stations };
  }

  /* THE DOCK COUNT IS THE LARGER OF TWO. station_information's capacity is
     the station as built and is not always current: a station can report
     20 bikes and 12 open docks against a capacity of 18, after docks were
     added or while a valet is holding extras. What is physically there is
     bikes plus broken bikes plus open docks, so the page uses whichever is
     larger, and every share of a station (its floor, how full it is) is a
     share of something real. */
  const docksOf = (s) => Math.max(s.capacity, s.bikes + s.disabled + s.docks);

  /* The saved reading is a deferred script that has already run, so this
     is synchronous, and on a saved reading the cockpit is drawn before
     DOMContentLoaded. */
  function readSnapshot() {
    const d = window.REBALANCE_SNAPSHOT;
    if (!d) throw new Error('rebalance-snapshot.js did not load');
    const stations = d.stations.map((r) => {
      const o = Object.fromEntries(d.fields.map((f, i) => [f, r[i]]));
      o.renting = !!o.renting;
      o.capacity = docksOf(o);
      return o;
    });
    return { updated: d.updated, stations };
  }

  /* "Now", in feed seconds. Live, it is the clock; on a saved reading it is
     the moment the reading was taken, so every age is the age it had then. */
  const now = () => (state.mode === 'live' ? Math.floor(Date.now() / 1000) : state.reading.updated);

  function remember(reading) {
    for (const s of reading.stations) {
      const list = state.seen.get(s.id) || [];
      if (!list.length || list[list.length - 1].t !== reading.updated) list.push({ t: reading.updated, bikes: s.bikes });
      state.seen.set(s.id, list);
    }
  }

  /* ----- ranking ---------------------------------------------------------- */

  const floorOf = (s) => Math.max(DATA.floorMin, Math.round(s.capacity * DATA.floorShare));
  const needOf = (t) => Math.max(DATA.minMove, Math.ceil(t.capacity * DATA.fillTo) - t.bikes);
  const moveOf = (s, t) => Math.max(0, Math.min(s.spare, needOf(t), DATA.vanSeats));

  /* THE RULE runs before the scoring, and removes a station from ranking
     rather than lowering its score. Two causes: the feed says the station is
     not releasing bikes, or taking a stop's worth would put it under its
     floor. The first is the feed's fact; the second is my assumption, and
     the card says so in the sentence that applies it. */
  function ruleFor(s) {
    if (!s.renting) return { rule: 'Not renting', text: 'The feed says this station is not releasing bikes, so a van cannot take any from it. A fact from the feed, not a score.' };
    if (s.spare < DATA.minMove) return { rule: 'At its floor', text: `Has ${plural(s.bikes, 'bike')} and keeps ${s.floor} for its own riders, so it cannot spare the ${DATA.minMove} a stop has to be worth. A rule, not a score; the floor is my assumption.` };
    return null;
  }

  function consider(target, stations) {
    const t = now();
    const byDist = stations
      .filter((s) => s.id !== target.id)
      .map((s) => ({ ...s, dist: miles(target, s) }))
      .sort((a, b) => a.dist - b.dist);
    for (const s of byDist.slice(0, DATA.near + DATA.reach)) {
      s.floor = floorOf(s);
      s.spare = s.bikes - s.floor;
      s.age = Math.max(0, (t - s.reported) / 60);
      s.blocked = ruleFor(s);
    }
    /* The nearest eight, and then further out only as far as it takes to
       find a few that can give: at rush hour a whole block can be at its
       floor, and a crew would keep looking rather than stop at eight. */
    const pool = byDist.slice(0, DATA.near);
    for (const s of byDist.slice(DATA.near, DATA.near + DATA.reach)) {
      if (pool.filter((x) => !x.blocked).length >= DATA.minChoices) break;
      if (!s.blocked) pool.push(s);
    }
    const eligible = pool.filter((s) => !s.blocked);
    const maxDist = Math.max(...pool.map((s) => s.dist));
    const maxSpare = Math.max(1, ...eligible.map((s) => s.spare));
    for (const s of pool) {
      s.norm = {
        dist: 1 - s.dist / maxDist,
        spare: Math.max(0, s.spare) / maxSpare,
        docks: 1 - s.docks / s.capacity,
      };
      s.score = s.blocked ? null : FACTORS.reduce((sum, f) => sum + DATA.weights[f.key] * s.norm[f.key], 0);
    }
    const ranked = eligible.sort((a, b) => b.score - a.score);
    ranked.forEach((s, i) => { s.rank = i + 1; });
    for (const s of pool) if (s.blocked) s.rank = null;
    const tie = ranked.length > 1 && ranked[0].score - ranked[1].score < DATA.tieMargin;
    /* A rule earns a card where it answers the obvious question: why not
       the station right next door? The nearest station the rule removed,
       if it still has bikes and sits closer than the leader, gets one card
       saying so. The synthetic cockpit asked whether the blocked truck
       would have ranked first; here that question has no honest answer,
       because a station at its floor is there for want of the very bikes
       the ranking would credit it with. Distance is the claim that holds. */
    const ruled = pool.filter((s) => s.blocked && s.renting && s.bikes > 0 && ranked[0] && s.dist < ranked[0].dist).slice(0, 1);
    const mid = {}, range = {};
    for (const f of FACTORS) {
      const v = ranked.map((s) => s.norm[f.key]).sort((a, b) => a - b);
      mid[f.key] = v[Math.floor(v.length / 2)];
      range[f.key] = { lo: v[0], hi: v[v.length - 1] };
    }
    return { pool, ranked, tie, ruled, mid, range };
  }

  const shapeOf = (c) => (c.tie ? 'close' : c.ruled.length ? 'rule' : 'pick');

  function pickTargets(stations) {
    const t = now();
    const empty = stations
      .filter((s) => s.renting && s.bikes === 0 && s.capacity >= DATA.minCapacity)
      .sort((a, b) => b.capacity - a.capacity);
    const out = [];
    for (const s of empty) {
      const c = consider(s, stations);
      if (c.ranked.length < 2) continue;
      out.push({ ...s, age: Math.max(0, (t - s.reported) / 60), shape: shapeOf(c) });
      if (out.length === DATA.tabs) break;
    }
    return out;
  }

  const LEVEL = 0.08;
  function direction(s, f) {
    const d = s.norm[f.key] - state.mid[f.key];
    return d > LEVEL ? 'helps' : d < -LEVEL ? 'hurts' : 'neutral';
  }

  function whyLost(s, leader) {
    let worst = null, gap = 0;
    for (const f of FACTORS) {
      const g = (leader.norm[f.key] - s.norm[f.key]) * DATA.weights[f.key];
      if (g > gap) { gap = g; worst = f; }
    }
    if (!worst) return 'close on every factor.';
    return `${worst.label.toLowerCase()}: ${worst.unit(s)} against ${worst.unit(leader)}.`;
  }

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

  const station = (id) => state.pool.find((s) => s.id === id);

  /* ----- rendering -------------------------------------------------------- */

  /* The line over the tabs: where the figures came from and how old they
     are, and the button that brings in a newer reading when there is one. */
  function renderFeed() {
    const box = $('.rb-feed', root);
    if (!box || !state.reading) return;
    const read = clock(state.reading.updated);
    let text;
    if (state.mode === 'live') {
      const secs = Math.max(0, Math.round((Date.now() - state.readAt) / 1000));
      text = `<span class="rb-feed-mode">Live</span> ${esc(DATA.system.name)}&rsquo;s public feed, the ${read} reading, fetched ${secs < 60 ? `${secs} s` : `${Math.round(secs / 60)} min`} ago`;
    } else {
      const day = dayFmt.format(new Date(state.reading.updated * 1000));
      const lead = state.mode === 'fallback' ? 'The live feed did not answer, so this is ' : '';
      text = `<span class="rb-feed-mode">Saved</span> ${lead}${esc(DATA.system.name)}&rsquo;s public feed as read on ${day} at ${read}`;
    }
    const btn = state.next
      ? ` <button type="button" class="ck-btn rb-feed-update" data-update>${icon('refresh')}Show the ${clock(state.next.updated)} reading</button>`
      : '';
    box.setAttribute('data-mode', state.mode);
    box.innerHTML = `<span class="rb-feed-text">${text}</span>${btn}`;
  }

  function renderTabs() {
    const list = $('.ck-tabs', root);
    list.innerHTML = state.targets.map((s) => {
      const on = s.id === state.target.id;
      return `<button type="button" role="tab" id="ck-tab-${esc(s.id)}" class="ck-tab" aria-selected="${on}" aria-controls="ck-panel" tabindex="${on ? 0 : -1}" data-target="${esc(s.id)}" data-shape="${s.shape}">${icon(SHAPE_ICON[s.shape])}${esc(s.name)}</button>`;
    }).join('');
    $('#ck-panel', root).setAttribute('aria-labelledby', `ck-tab-${state.target.id}`);
  }

  function renderSituation() {
    const t = state.target;
    const lead = state.ranked[0];
    $('.ck-rail-h', root).textContent = `Showing: ${t.name}`;
    const shape = [
      state.tie ? 'Two stations are level, so the system will not pick between them.' : `The system has a pick: ${lead.name}.`,
      state.ruled.length ? 'The nearest station with bikes is held back by a rule.' : '',
    ].filter(Boolean).join(' ');
    $('.ck-blurb', root).textContent = `${t.capacity} docks and no bikes. ${shape}`;
  }

  function renderLoad() {
    const t = state.target;
    const need = needOf(t);
    const tAge = Math.max(0, (now() - t.reported) / 60);
    $('.ck-load', root).innerHTML = `
      <p class="ck-load-id"><span class="ck-label">Empty station</span> ${esc(t.name)}</p>
      <dl class="ck-load-facts">
        <div><dt>Docks</dt><dd>${t.capacity}, ${t.docks} open</dd></div>
        <div><dt>Bikes</dt><dd>none to rent${t.disabled ? `, ${t.disabled} out of service` : ''}</dd></div>
        <div><dt>Needs</dt><dd>${plural(need, 'bike')}, to reach ${Math.round(DATA.fillTo * 100)}% of its docks</dd></div>
        <div><dt>Reported</dt><dd${tAge >= DATA.staleMin ? ' data-age="stale"' : ''}>${ago(tAge)}</dd></div>
      </dl>
      <p class="ck-load-now">${icon('clock')}<span><span class="ck-label">Now</span> ${clock(now())} in ${esc(DATA.system.city)}
        <span class="ck-sep" aria-hidden="true">&middot;</span> ${state.pool.length} stations nearby considered, a van carries ${DATA.vanSeats}</span></p>`;
  }

  function factorBar(s, f) {
    const r = state.range[f.key];
    if (!r || !(r.hi - r.lo > 0)) return '';
    const span = r.hi - r.lo;
    const at = (v) => Math.max(0, Math.min(100, ((v - r.lo) / span) * 100));
    const med = at(state.mid[f.key]);
    const recentre = (x) => {
      if (!(med > 0)) return 50 + (x / 100) * 50;
      if (!(med < 100)) return (x / 100) * 50;
      return x <= med ? (x / med) * 50 : 50 + ((x - med) / (100 - med)) * 50;
    };
    const pos = recentre(at(s.norm[f.key]));
    const lo = recentre(at(state.mid[f.key] - LEVEL));
    const hi = recentre(at(state.mid[f.key] + LEVEL));
    const leadL = Math.min(50, pos);
    const leadW = Math.abs(pos - 50);
    const growsRight = leadL >= 49.9;
    return `<span class="ck-factor-bar" data-dir="${direction(s, f)}" aria-hidden="true" style="--pos:${pos.toFixed(1)}%;--band-l:${lo.toFixed(1)}%;--band-w:${(hi - lo).toFixed(1)}%;--lead-l:${leadL.toFixed(1)}%;--lead-w:${leadW.toFixed(1)}%;--draw-l:${growsRight ? 0 : 100}%;--draw-r:${growsRight ? 100 : 0}%"><span class="ck-factor-mark"></span></span>`;
  }

  function factorKey() {
    const ROWS = [
      ['level', '', '--band-l:30%;--band-w:40%', false,
        'Every bar starts at the middle of the stations that can give bikes; inside the block it is level, and gray.'],
      ['ahead', 'helps', '--band-l:30%;--band-w:40%;--lead-l:50%;--lead-w:32%', true,
        'Sage, out to the right: this station is on the better side.'],
      ['behind', 'hurts', '--band-l:30%;--band-w:40%;--lead-l:18%;--lead-w:32%', true,
        'Rust, out to the left: it is on the worse side.'],
    ];
    return `<ul class="ck-factor-key">${ROWS.map(([part, dir, vars, mark, text]) => `
      <li>
        <span class="ck-factor-bar ck-key-sample" data-key="${part}"${dir ? ` data-dir="${dir}"` : ''} aria-hidden="true" style="${vars}">${mark ? '<span class="ck-factor-mark"></span>' : ''}</span>
        <span>${text}</span>
      </li>`).join('')}</ul>`;
  }

  function factorRows(s, opts = {}) {
    const withNote = opts.note !== false;
    return `<ul class="ck-factors">${FACTORS.map((f, i) => {
      const d = direction(s, f);
      return `<li class="ck-factor" style="--i:${i}">
        <span class="ck-factor-name">${esc(f.label)}${ageLine(s, f)}</span>
        <span class="ck-factor-value">${esc(f.unit(s))}</span>
        <span class="ck-factor-dir" data-dir="${esc(d)}">${icon(DIR_ICON[d])}${d}</span>
        ${factorBar(s, f)}
      </li>`;
    }).join('')}</ul>
    ${!withNote ? '' : `${factorKey()}
    <p class="ck-factor-note">Where a station stands, not how much a factor moved the ranking.</p>
    <details class="ck-note">
      <summary class="disclosure-row">${icon('chevron', 'disclosure-chev')}<span class="ck-note-label">More about these comparisons</span></summary>
      <div class="ck-note-body">
        <p>Each bar starts at the middle of the nearby stations that can give bikes and runs out to where this one stands. Every row is stretched so the middle sits at the same place, so a bar is a comparison with its neighbors and not a scale to measure across.</p>
        <p>Distance is straight-line, and a van drives the grid. Bikes to spare is the count over the station&rsquo;s floor, and the floor is my assumption: a fifth of its docks, never fewer than three.</p>
      </div>
    </details>`}`;
  }

  /* THE RECORD THE FEED DOES NOT HAVE. The synthetic cockpit shows outcomes
     on similar loads. A public bike-share feed is only ever the present, so
     there is no record of how past calls turned out, and the card says that
     rather than inventing one. What it can show honestly is what this page
     has itself seen since it opened: one reading a minute. */
  function renderSeen() {
    const t = state.target;
    const list = state.seen.get(t.id) || [];
    const emptyN = list.filter((r) => r.bikes === 0).length;
    const since = list.length ? clock(list[0].t) : clock(now());
    const fine = state.mode === 'live'
      ? (list.length > 1 ? `One reading a minute since ${since}.` : `The page opened at ${since}; it reads the feed once a minute from here.`)
      : 'One saved reading, so there is no trend to show.';
    return `<div class="ck-confidence">
      <h4 class="ck-h">What this page has seen</h4>
      <p class="ck-conf-figure">
        <span class="ck-conf-count">${emptyN} of ${plural(list.length, 'reading')}</span>
        <span class="ck-conf-unit">with ${esc(t.name)} empty</span>
      </p>
      <p class="ck-conf-fine">${fine}</p>
      <p class="ck-conf-fine">The public feed carries no history, so there is no record here of how past calls turned out.</p>
      <div class="ck-conf-watch">
        <p class="ck-conf-watch-h ck-label">What to watch for on this move</p>
        <ol class="ck-conf-watch-list">${tells().map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      </div>
    </div>`;
  }

  /* The tells, written from the figures on screen. At most three, and
     always at least one, so the list never reads as a missing section. */
  function tells() {
    const t = state.target;
    const lead = state.ranked[0];
    const out = [];
    const tAge = (now() - t.reported) / 60;
    if (tAge >= DATA.staleMin) out.push(`${t.name} last reported ${ago(tAge)}. It may have bikes by now, or be offline.`);
    if (lead && stale(lead)) out.push(`${lead.name}'s count is ${Math.round(lead.age)} minutes old. Check it before the van leaves.`);
    if (lead && moveOf(lead, t) < needOf(t)) out.push(`One stop moves ${moveOf(lead, t)} of the ${needOf(t)} bikes needed. A second source will be.`);
    if (lead && lead.disabled) out.push(`${plural(lead.disabled, 'bike')} at ${lead.name} ${lead.disabled === 1 ? 'is' : 'are'} out of service and not counted as spare.`);
    if (t.disabled) out.push(`${plural(t.disabled, 'broken bike')} at the empty station could leave on the same van.`);
    if (!out.length && lead) out.push(`Nothing unusual in the figures. ${lead.name} reported ${ago(lead.age)}.`);
    return out.slice(0, 3);
  }

  const demote = (c) => `${c.split(' ').filter((x) => x !== 'ck-btn-primary').join(' ')} ck-btn-quiet`;
  function assignButton(s, cls = 'ck-btn', terse = false) {
    if (s.blocked) return `<button type="button" class="${demote(cls)}" aria-disabled="true" data-assign="${esc(s.id)}">Can&rsquo;t send</button>`;
    if (state.assigned === s.id) return terse
      ? `<button type="button" class="${demote(cls)}" data-undo="${esc(s.id)}">Undo<span class="ck-btn-id"> sending the van to ${esc(s.name)}</span></button>`
      : `<button type="button" class="${cls.includes('ck-btn-primary') ? cls : demote(cls)}" data-undo="${esc(s.id)}">Sent ${icon('check')} Undo</button>`;
    return `<button type="button" class="${cls}" data-assign="${esc(s.id)}">Send<span class="ck-btn-id"> the van to ${esc(s.name)}</span></button>`;
  }

  /* THE DERIVED LINE: what a stop here would do for the empty station. Not
     a factor -- it converts bikes to spare into the thing they mean for this
     station -- and it moves no ranking. A stop that fills the need is clear;
     one that leaves it short is tight, which asks for a second source. */
  const moveState = (s) => (moveOf(s, state.target) >= needOf(state.target) ? 'clear' : 'tight');
  function moveLine(s, cls = 'ck-window') {
    const m = moveOf(s, state.target), need = needOf(state.target);
    const st = moveState(s);
    return `<p class="${cls}" data-window="${st}">${icon(st === 'clear' ? 'check' : 'clockAlert')}<span><span class="ck-label">One stop moves</span> ${plural(m, 'bike')}
      <span class="ck-sep" aria-hidden="true">&middot;</span> ${st === 'clear' ? `all ${need} the empty station needs` : `${need - m} short of the ${need} it needs`}</span></p>`;
  }

  function stationCard(s, heading) {
    return `<div class="ck-card${state.assigned === s.id ? ' is-assigned' : ''}">
      <p class="ck-card-head">${heading}</p>
      <p class="ck-card-truck">${esc(s.name)} <span class="ck-card-driver">${s.dist.toFixed(2)} mi away, ${plural(s.bikes, 'bike')} now</span></p>
      ${moveLine(s)}
      ${factorRows(s)}
      <p class="ck-card-act">${assignButton(s, 'ck-btn ck-btn-primary')}</p>
    </div>`;
  }

  function compareTable(a, b) {
    const tr = tradeoff(a, b);
    const decisive = new Set([tr.a && tr.a.key, tr.b && tr.b.key].filter(Boolean));
    const rows = [...FACTORS].sort((x, y) => (decisive.has(y.key) ? 1 : 0) - (decisive.has(x.key) ? 1 : 0));
    const optHead = (s, label) => `<th scope="col" class="ck-vs-opt${state.assigned === s.id ? ' is-assigned' : ''}">
      <span class="ck-vs-opt-label ck-label">${label}</span>
      <span class="ck-vs-opt-id">${esc(s.name)}</span>
      <span class="ck-vs-opt-who">${plural(s.bikes, 'bike')} <span class="ck-sep" aria-hidden="true">&middot;</span> ${s.capacity} docks</span>
    </th>`;
    const cell = (s, f) => {
      const d = direction(s, f);
      return `<td class="ck-vs-cell">
        <span class="ck-vs-value">${esc(f.unit(s))}</span>
        <span class="ck-factor-dir ck-vs-dir" data-dir="${esc(d)}">${icon(DIR_ICON[d])}${d}</span>
        ${ageLine(s, f)}
        ${factorBar(s, f)}
      </td>`;
    };
    const moves = (s) => `<td class="ck-vs-cell ck-vs-win" data-window="${moveState(s)}">
      <span class="ck-vs-value">${plural(moveOf(s, state.target), 'bike')}</span>
      <span class="ck-factor-dir ck-vs-dir" data-window="${moveState(s)}">${moveState(s) === 'clear' ? 'fills it' : 'falls short'}</span>
    </td>`;
    return `<table class="ck-vs">
      <caption class="ck-visually-hidden">${esc(a.name)} and ${esc(b.name)} compared on each factor the ranking weighed, the two that separate them first, then what one stop at each would move.</caption>
      <thead><tr>
        <td class="ck-vs-corner"></td>
        ${optHead(a, 'Option A')}
        ${optHead(b, 'Option B')}
      </tr></thead>
      <tbody>
        ${rows.map((f, i) => `<tr class="ck-vs-row${decisive.has(f.key) ? ' is-decisive' : ''}" style="--i:${i}">
          <th scope="row" class="ck-vs-factor">
            <span class="ck-vs-factor-name">${esc(f.label)}</span>
            ${decisive.has(f.key) ? '<span class="ck-vs-tag">the tradeoff</span>' : ''}
          </th>
          ${cell(a, f)}
          ${cell(b, f)}
        </tr>`).join('')}
        <tr class="ck-vs-row ck-vs-derived">
          <th scope="row" class="ck-vs-factor">
            <span class="ck-vs-factor-name">One stop moves</span>
            <span class="ck-vs-note">derived, not ranked</span>
          </th>
          ${moves(a)}
          ${moves(b)}
        </tr>
      </tbody>
      <tfoot><tr>
        <td class="ck-vs-corner"></td>
        <td class="ck-vs-act">${assignButton(a, 'ck-btn ck-btn-primary')}</td>
        <td class="ck-vs-act">${assignButton(b, 'ck-btn ck-btn-primary')}</td>
      </tr></tfoot>
    </table>
    ${factorKey()}`;
  }

  function staleNote(list) {
    return list.filter(stale).map((s) => `<p class="ck-fresh" data-age="stale">${icon('clockAlert')}<span><strong>${esc(s.name)}&rsquo;s count is ${Math.round(s.age)} minutes old.</strong> It showed ${plural(Math.max(0, s.spare), 'bike')} to spare. Check the station before sending the van there.</span></p>`).join('');
  }

  function renderReco() {
    const [first, second, third] = state.ranked;
    let html = '';
    for (const b of state.ruled) {
      html += `<div class="ck-rule">
        <p class="ck-rule-head">${icon('ban', 'ck-rule-glyph')}${esc(b.name)} can&rsquo;t give bikes</p>
        <p class="ck-rule-text">${esc(b.blocked.text)} It is closer than any station that can: ${b.dist.toFixed(2)} mi away, with ${plural(b.bikes, 'bike')}. None of that changes the rule.</p>
      </div>`;
    }
    if (state.tie) {
      const tr = tradeoff(first, second);
      const head = tr.a && tr.b
        ? `${first.name} and ${second.name} are level. The tradeoff is ${tr.a.wins} against ${tr.b.wins}.`
        : `${first.name} and ${second.name} are level. Nothing separates them.`;
      html += `<div class="ck-lead" data-tone="close">
        <p class="ck-lead-kicker ck-label">Close call: no pick</p>
        <h3 class="ck-reco-h">${esc(head)}</h3>
        <p class="ck-reco-dek">The system is not ranking one over the other. Pick the side of the tradeoff that matters for this move.</p>
        ${staleNote([first, second])}
        ${compareTable(first, second)}
        ${renderSeen()}
      </div>`;
    } else {
      const overridden = state.assigned && state.assigned !== first.id;
      html += `<div class="ck-lead">
        <p class="ck-lead-kicker ck-label">${overridden ? 'The system&rsquo;s pick, not yours' : 'Recommended source'}</p>
        <h3 class="ck-reco-h">${esc(first.name)}</h3>
        ${overridden ? `<p class="ck-reco-dek">Still the system&rsquo;s pick. You sent the van to ${esc(station(state.assigned).name)} instead, which is fine; the recommendation stays visible so the difference stays visible.</p>` : ''}
        ${staleNote([first])}
        <div class="ck-pair">
          ${stationCard(first, 'What went into the call')}
          <div>
            ${renderSeen()}
            <div class="ck-also">
              <h4 class="ck-h">Also considered</h4>
              <ol class="ck-also-list">
                ${[second, third].filter(Boolean).map((s) => `<li>
                  <span class="ck-also-rank">${ordinal(s.rank)}</span>
                  <span class="ck-also-body"><strong>${esc(s.name)}</strong>. Lost on ${esc(whyLost(s, first))}</span>
                </li>`).join('')}
              </ol>
            </div>
          </div>
        </div>
      </div>`;
    }
    $('.ck-reco', root).innerHTML = html;
  }

  const TONE_ICON = { pick: 'checkCircle', note: 'info', close: 'help', refused: 'ban' };
  function renderStatus(message, tone = 'note') {
    const s = $('.ck-status', root);
    s.setAttribute('data-tone', tone);
    s.innerHTML = `${icon(TONE_ICON[tone])}<span>${esc(message)}</span>`;
  }

  function renderWhy() {
    const box = $('.ck-why', root);
    if (!state.why) { box.hidden = true; box.innerHTML = ''; return; }
    const s = station(state.why.id);
    box.hidden = false;
    if (state.answered) {
      box.innerHTML = `<p class="ck-why-done" tabindex="-1"><span class="ck-label">Noted.</span> &ldquo;${esc(state.answered)}&rdquo; would be kept with this move. Nothing about the ranking changes.</p>`;
      return;
    }
    box.innerHTML = `
      <form class="ck-why-form" novalidate>
        <p class="ck-why-head" id="ck-why-head" tabindex="-1">You sent the van to ${esc(s.name)}, ranked ${ordinal(state.why.rank)}. Why? <span class="ck-why-opt">Optional.</span></p>
        <fieldset class="ck-why-set" aria-labelledby="ck-why-head">
          <legend class="ck-visually-hidden">Reason for overriding the recommendation</legend>
          ${DATA.reasons.map((r) => `<label class="ck-radio"><input type="radio" name="reason" value="${esc(r)}"> <span>${esc(r)}</span></label>`).join('')}
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

  /* Eleven columns, in the synthetic cockpit's order of kinds, so its
     stylesheet folds this table on a phone the same way: rank, station, the
     derived column and the action stay; the rest go into the open row. */
  const COLUMNS = [
    { key: 'rank',     label: 'Rank',       sortable: true },
    { key: 'name',     label: 'Station',    sortable: true },
    { key: 'dist',     label: 'Distance',   sortable: true, num: true, unit: 'miles' },
    { key: 'bikes',    label: 'Bikes',      sortable: true, num: true, unit: 'now' },
    { key: 'floor',    label: 'Floor',      sortable: true, num: true, unit: 'kept' },
    { key: 'move',     label: 'One stop',   sortable: true, num: true, unit: () => `of ${needOf(state.target)} needed` },
    { key: 'spare',    label: 'To spare',   sortable: true, num: true, unit: 'bikes' },
    { key: 'docks',    label: 'Docks open', sortable: true, num: true, unit: 'of total' },
    { key: 'ebikes',   label: 'E-bikes',    sortable: true, num: true, unit: 'of bikes' },
    { key: 'age',      label: 'Reported',   sortable: true, num: true, unit: 'min ago' },
    { key: 'act',      label: 'Send',       sortable: false, act: true },
  ];
  function sortValue(s, key) {
    if (key === 'rank') return s.rank === null ? 999 : s.rank;
    if (key === 'move') return moveOf(s, state.target);
    return s[key];
  }

  function rowDetail(s) {
    const leader = state.ranked[0];
    const why = s.blocked
      ? `<span class="ck-why-rank-rule">${icon('ban')} ${esc(s.blocked.text)}</span>`
      : (leader && s.id === leader.id && !state.tie)
        ? 'Ranked first: no other station is ahead of it once the three factors are weighed together.'
        : `Ranked ${ordinal(s.rank)}. Lost on ${esc(whyLost(s, leader))}`;
    return `<div class="ck-detail">
      <p class="ck-detail-who"><span class="ck-label">Bikes</span> ${s.bikes}, ${s.ebikes} of them e-bikes${s.disabled ? `, ${s.disabled} out of service` : ''}
        <span class="ck-sep" aria-hidden="true">&middot;</span> <span class="ck-label">reported</span> ${ago(s.age)}</p>
      ${s.blocked ? '' : moveLine(s, 'ck-window ck-detail-window')}
      ${factorRows(s, { note: false })}
      <p class="ck-detail-why">${why}</p>
      <p class="ck-detail-act">${assignButton(s, 'ck-btn ck-btn-primary')}</p>
    </div>`;
  }

  function renderTable() {
    const { key, dir } = state.sort;
    const rows = [...state.pool].sort((a, b) => {
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
      return `<th scope="col" aria-sort="${sorted}"${cls ? ` class="${cls}"` : ''}>
        <button type="button" class="ck-th ck-sort" data-sort="${c.key}">${label}${icon(on ? 'sortUp' : 'sort', 'ck-icon ck-sort-icon')}</button>
      </th>`;
    }).join('');
    const body = rows.map((s, i) => {
      const cls = ['ck-row'];
      if ((s.rank === 1 && !state.tie) || (state.tie && s.rank && s.rank <= 2)) cls.push('is-lead');
      if (s.blocked) cls.push('is-blocked');
      if (state.assigned === s.id) cls.push('is-assigned');
      const rankMain = s.blocked
        ? `<span class="ck-rank-rule">${icon('ban')}<span>${esc(s.blocked.rule)}</span></span>`
        : ordinal(s.rank);
      const marks = [
        s.rank === 1 && !state.tie ? `<span class="ck-rank-tag ck-tag-lead">${icon('checkCircle')}Pick</span>` : '',
        state.tie && s.rank && s.rank <= 2 ? `<span class="ck-rank-tag">Option ${s.rank === 1 ? 'A' : 'B'}</span>` : '',
        state.assigned === s.id ? '<span class="ck-rank-tag ck-tag-assigned">Sent</span>' : '',
      ].filter(Boolean).join('');
      const open = state.open.has(s.id);
      const m = moveOf(s, state.target);
      const mState = moveState(s);
      return `<tr class="${cls.join(' ')}" data-station="${esc(s.id)}" style="--i:${i}">
        <th scope="row" class="ck-cell-rank"><span class="ck-rank-n">${rankMain}</span>${marks ? `<span class="ck-rank-marks">${marks}</span>` : ''}</th>
        <td class="ck-cell-truck"><button type="button" class="ck-row-more" data-more="${esc(s.id)}" aria-expanded="${open}" aria-controls="ck-detail-${esc(s.id)}">${esc(s.name)}<span class="ck-visually-hidden">, ${open ? 'hide' : 'show'} every figure</span>${icon('expand', 'ck-icon ck-row-chev')}</button></td>
        <td class="ck-num">${s.dist.toFixed(2)}</td>
        <td class="ck-num">${s.bikes}${s.disabled ? `<span class="ck-cell-note">${s.disabled} broken</span>` : ''}</td>
        <td class="ck-num">${s.floor}</td>
        <td class="ck-num ck-cell-win" data-window="${s.blocked ? 'clear' : mState}">${s.blocked ? '&ndash;' : m}${!s.blocked && mState === 'tight' ? '<span class="ck-cell-note">short</span>' : ''}</td>
        <td class="ck-num">${Math.max(0, s.spare)}</td>
        <td class="ck-num">${s.docks}<span class="ck-cell-note">of ${s.capacity}</span></td>
        <td class="ck-num">${s.ebikes}</td>
        <td class="ck-num">${Math.round(s.age)}${stale(s) ? '<span class="ck-cell-note" data-age="stale">stale</span>' : ''}</td>
        <td class="ck-cell-act">${assignButton(s, 'ck-btn', true)}</td>
      </tr>
      <tr class="ck-row-detail${open ? ' is-open' : ''}" id="ck-detail-${esc(s.id)}"${open ? '' : ' hidden'}>
        <td colspan="${COLUMNS.length}">${open ? rowDetail(s) : ''}</td>
      </tr>`;
    }).join('');
    $('.ck-table', root).innerHTML = `<caption class="ck-visually-hidden">The ${state.pool.length} stations nearest ${esc(state.target.name)}, with the columns the recommendation weighed and what one stop at each would move. Sort any column; open any station for the rest of its figures; send the van to any station the rule allows.</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
    $('.ck-fleet-h', root).textContent = `The ${state.pool.length} stations considered`;
    const wrap = $('.ck-fleet', root);
    wrap.classList.toggle('is-compact', state.density === 'compact');
    for (const b of wrap.querySelectorAll('[data-density]')) b.setAttribute('aria-pressed', String(b.dataset.density === state.density));
  }

  function render() {
    renderFeed();
    renderTabs();
    renderSituation();
    renderLoad();
    renderReco();
    renderWhy();
    renderTable();
  }

  function keep(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest' });
  }

  /* ----- what a press does ------------------------------------------------ */

  function choose(id, { quiet = false } = {}) {
    const t = state.targets.find((s) => s.id === id) || state.targets[0];
    state.target = t;
    const c = consider(t, state.reading.stations);
    Object.assign(state, { pool: c.pool, ranked: c.ranked, tie: c.tie, ruled: c.ruled, mid: c.mid, range: c.range });
    state.assigned = null;
    state.why = null;
    state.answered = null;
    state.open.clear();
    state.sort = { key: 'rank', dir: 'asc' };
    render();
    if (quiet) return;
    const rule = state.ruled.length ? ` ${state.ruled[0].name}, the nearest with bikes, is held back by a rule.` : '';
    if (state.tie) renderStatus(`Close call at ${t.name}: ${state.ranked[0].name} and ${state.ranked[1].name} are level, so there is no pick.${rule}`, 'close');
    else if (rule) renderStatus(`${t.name} is empty. Recommended source: ${state.ranked[0].name}.${rule}`, 'refused');
    else renderStatus(`${t.name} is empty. Recommended source: ${state.ranked[0].name}.`, 'note');
  }

  function assign(id) {
    const s = station(id);
    if (!s) return;
    if (s.blocked) {
      renderStatus(`${s.name} can't give bikes: ${s.blocked.rule.toLowerCase()}. ${s.blocked.text}`, 'refused');
      return;
    }
    state.assigned = id;
    state.armed = Date.now();
    state.answered = null;
    const overrode = state.tie ? false : s.rank !== 1;
    state.why = overrode ? { id, rank: s.rank } : null;
    render();
    renderStatus(`Van sent to ${s.name}: ${plural(moveOf(s, state.target), 'bike')} for ${state.target.name}. Undo is on the same button.`, 'pick');
    if (overrode) keep($('#ck-why-head', root));
    else keep($(`[data-undo="${CSS.escape(id)}"]`, root));
  }

  function undo() {
    const s = station(state.assigned);
    state.assigned = null;
    state.why = null;
    state.answered = null;
    render();
    renderStatus(`Undone. The van is not going to ${s ? s.name : 'that station'}.`, 'note');
    if (s) keep($(`[data-assign="${CSS.escape(s.id)}"]`, root));
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !root.contains(btn)) return;
    if (btn.dataset.target) { choose(btn.dataset.target); keep($(`#ck-tab-${CSS.escape(btn.dataset.target)}`, root)); return; }
    if (btn.dataset.assign) { assign(btn.dataset.assign); return; }
    if (btn.dataset.undo) {
      /* Inert for half a second after Assign, so a double-click sends once
         rather than sending and taking it back. */
      if (Date.now() - state.armed < UNDO_ARMS_AFTER) return;
      undo();
      return;
    }
    if (btn.hasAttribute('data-skip')) { state.why = null; renderWhy(); renderStatus('Skipped. The assignment stands.', 'pick'); return; }
    if (btn.hasAttribute('data-update')) { apply(state.next); return; }
    if (btn.dataset.sort) {
      const k = btn.dataset.sort;
      state.sort = { key: k, dir: state.sort.key === k && state.sort.dir === 'asc' ? 'desc' : 'asc' };
      renderTable();
      keep($(`[data-sort="${k}"]`, root));
      return;
    }
    if (btn.dataset.more) {
      const id = btn.dataset.more;
      if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
      renderTable();
      keep($(`[data-more="${CSS.escape(id)}"]`, root));
      return;
    }
    if (btn.dataset.density) { state.density = btn.dataset.density; renderTable(); }
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const reason = f.get('reason');
    const more = String(f.get('more') || '').trim();
    state.answered = reason === '__other' || !reason ? (more || 'Something else') : (more ? `${reason}: ${more}` : reason);
    renderWhy();
    renderStatus('Reason saved with the move.', 'pick');
    keep($('.ck-why-done', root));
  });

  /* Arrow keys move between the station tabs, as a tablist should. */
  root.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const ids = state.targets.map((s) => s.id);
    const i = ids.indexOf(tab.dataset.target);
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1
      : (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
    choose(ids[j]);
    keep($(`#ck-tab-${CSS.escape(ids[j])}`, root));
  });

  /* ----- the reading on screen, and the next one -------------------------- */

  /* Put a reading on screen. The tabs are recomputed, but the station the
     reader was looking at stays among them even if it has since got bikes:
     a tab vanishing out from under someone is the screen moving on them. */
  function apply(reading) {
    const current = state.target && state.target.id;
    state.reading = reading;
    state.next = null;
    remember(reading);
    state.readAt = Date.now();
    let targets = pickTargets(reading.stations);
    if (current && !targets.some((s) => s.id === current)) {
      const s = reading.stations.find((x) => x.id === current);
      if (s) targets = [...targets.slice(0, DATA.tabs - 1), { ...s, shape: shapeOf(consider(s, reading.stations)) }];
    }
    state.targets = targets;
    if (!targets.length) {
      renderFeed();
      renderStatus(`No station of ${DATA.minCapacity} docks or more is empty right now, so there is nothing to rebalance. The next reading is a minute away.`, 'note');
      return;
    }
    const keepId = current && targets.some((s) => s.id === current) ? current : targets[0].id;
    const had = state.assigned;
    choose(keepId, { quiet: !!current });
    if (current) renderStatus(`Showing the ${clock(reading.updated)} reading.${had ? ' The van you sent was cleared with the old figures.' : ''}`, 'note');
  }

  async function poll() {
    try {
      const r = await readLive();
      if (!state.reading || r.updated > state.reading.updated) { state.next = r; renderFeed(); }
    } catch (err) {
      /* A missed poll is not news; the reading on screen still says its age. */
    }
  }

  function fallBack() {
    try {
      apply(readSnapshot());
    } catch (err) {
      renderStatus('Neither the live feed nor the saved reading could be loaded, so there is nothing to show. Reloading the page may help.', 'refused');
    }
  }

  if (useSnapshot) {
    state.mode = 'snapshot';
    fallBack();
  } else {
    readLive().then((reading) => {
      state.mode = 'live';
      apply(reading);
      setInterval(poll, DATA.pollSec * 1000);
      setInterval(renderFeed, 15 * 1000);
    }, () => {
      state.mode = 'fallback';
      fallBack();
    });
  }
})();
