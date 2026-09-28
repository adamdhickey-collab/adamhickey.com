/* deploy-console.js -- the deploy console prototype, and nothing else.
 *
 * WHAT THIS IS. A self-directed prototype on synthetic data: one project, six
 * services, four situations. Every service, commit, author, figure and log
 * line below is invented. Nothing here is a real platform's data, and nothing
 * here shipped.
 *
 * HOW IT IS LAID OUT. DATA at the top is the whole scenario -- the project,
 * the services with their deploy histories, the four situations and what each
 * one changes -- and it is meant to be tuned without reading past it.
 * Everything under DATA is mechanism: a pass that reads each service's
 * history into what is LIVE and what is NEWEST (which are not the same
 * thing, and the whole screen turns on keeping them apart), the rollback
 * plan that names what would change and what would not, and the rendering.
 *
 * THE FIVE THINGS IT HAS TO ANSWER, in the order developers ask them, and
 * each in one place:
 *   1. what is live right now          -> renderProject() and the table
 *   2. what failed                     -> renderAnswer(), the card's first row
 *   3. what changed since it worked    -> the card's second row
 *   4. what depends on it              -> the card's third row
 *   5. can I put it back safely        -> the card's last row, and the plan
 *   and over all five, what the situation IS -> renderSituation()
 *
 * No dependencies, no build step. States are is-* classes so
 * scripts/states.mjs forces and measures the ones the page does not load in.
 * The mechanics -- keep(), flash(), flipRows(), watchEnter() -- are the
 * dispatch cockpit's, carried over rather than reinvented, because the two
 * prototypes are the same kind of object: a screen somebody presses.
 */
(() => {
  'use strict';

  /* =========================================================================
     DATA -- tune the scenario here.
     ========================================================================= */
  const DATA = {
    /* The project the console is showing. `nowMin` is the clock every
       relative time on the screen is figured from, minutes from midnight. */
    project: {
      name: 'Northlake',
      env: 'production',
      region: 'Oregon',
      nowMin: 11 * 60 + 42,   /* 11:42 am, and the project card says so */
    },

    /* The services, as the "All live" situation sees them. Each situation
       below patches a few of these; the rest stay.
         type      what the platform calls it
         runtime   what it runs, for the row detail
         health    the path the platform probes, or null for a datastore
         needs     the services this one calls; the dependency strip reads
                   both directions from this one list
         deploys   newest first. `ago` is minutes before now. `status` is
                   live | superseded | failed | building. A datastore has no
                   deploys: it is provisioned, and the row says so.
         since     minutes since the LIVE deploy went live; derived below
         metrics   the figures the reading card and the health cell show */
    services: [
      { id: 'web',      type: 'static site',       kind: 'service', runtime: 'Vite build, served from the CDN', health: '/', needs: ['api'], at: [0, 0],
        metrics: { errors: 0.1, errorsWas: 0.1 },
        deploys: [
          { commit: '7c04e2a', msg: 'Pricing page copy',               by: 'Dana Okafor', ago: 2 * 1440 + 3 * 60, status: 'live' },
          { commit: '51b7d3f', msg: 'Move the docs link to the footer', by: 'Dana Okafor', ago: 5 * 1440,          status: 'superseded' },
          { commit: 'e02a9d7', msg: 'Sign-up form: field order',        by: 'Priya Nair',  ago: 9 * 1440,          status: 'superseded' },
        ] },
      { id: 'api',      type: 'web service',       kind: 'service', runtime: 'Node 22, 2 instances', health: '/healthz', needs: ['postgres', 'redis'], at: [0.5, 1],
        metrics: { errors: 0.2, errorsWas: 0.2, p95: 340, p95Was: 340 },
        deploys: [
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'live' },
          { commit: '2b9f0a1', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440,          status: 'superseded' },
          /* A failure in the history, so the list has one to show: a
             history with only successes in it is a history nobody learns
             from, and "failed" has to look like something before the
             situation that needs it arrives. */
          { commit: '88e1c40', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440 + 20,     status: 'failed',
            fail: { stage: 'build', step: 3, of: 4, cmd: 'npm run build', line: 'src/billing/pdf.ts(12,3): error TS2304: Cannot find name ‘PageSize’.' } },
          { commit: 'c4d81e6', msg: 'Rate limit per account',           by: 'Priya Nair',  ago: 14 * 1440,         status: 'superseded' },
        ] },
      { id: 'worker',   type: 'background worker', kind: 'service', runtime: 'Node 22, 1 instance', health: null, needs: ['api', 'redis', 'postgres'], at: [1, 0],
        metrics: { failedJobs: 0, failedJobsWas: 0 },
        deploys: [
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'live' },
          { commit: 'c4d81e6', msg: 'Rate limit per account',           by: 'Priya Nair',  ago: 14 * 1440,         status: 'superseded' },
        ] },
      /* THE EMPTY STATE, ON PURPOSE. A cron job that has never deployed is
         not a problem and not nothing: it is a service with a schedule and
         no history, and the row has to say which of those it is. */
      { id: 'nightly-report', type: 'cron job',   kind: 'job', runtime: 'Node 22, runs at 3:00 am daily', health: null, needs: ['postgres'], at: [2, 0],
        deploys: [],
        /* WHAT A FIRST DEPLOY NEEDS, and where each thing came from. Three of
           the four are read from the repository; the schedule was set when
           the job was created. The one thing a platform cannot read is what
           the first run will do, which is why "Run now" is offered after. */
        first: {
          commit: '9f3e1a2', msg: 'First report job', by: 'Priya Nair',
          build: 'npm run build', start: 'node report.js', schedule: '3:00 am daily',
          steps: ['Cloning northlake-app at 9f3e1a2', 'Installing dependencies', 'Building', 'Scheduling for 3:00 am daily'],
        } },
      { id: 'postgres', type: 'database',         kind: 'datastore', runtime: 'Postgres 16, 4 months old, backed up nightly at 2:00 am', health: null, needs: [], at: [1.5, 2],
        deploys: null },
      { id: 'redis',    type: 'key value',        kind: 'datastore', runtime: 'Redis 7, 4 months old', health: null, needs: [], at: [0.5, 2],
        deploys: null },
    ],

    /* THE FOUR SITUATIONS. Each patches the services above and carries what
       the answer zone says. `focus` is the service the situation is about
       and the row the table lifts onto the feature ground. `then` is what the
       situation does after it loads, staged rather than pressed. */
    scenarios: [
      {
        id: 'live',
        tab: 'All live',
        blurb: 'Nothing is wrong. Six services: three serving, two provisioned, one that has never deployed. The screen still has to answer the first question, what is live right now, without being asked, because this is the screen a developer opens before they know whether anything is wrong.',
        focus: null,
        patch: {},
      },
      {
        id: 'first',
        tab: 'First deploy',
        blurb: 'A cron job was created and has never deployed. Nothing is wrong; nothing has happened yet. The screen says what a first deploy needs, where each thing came from, and what the first run will do, then does it in order.',
        focus: 'nightly-report',
        patch: {},
      },
      {
        id: 'failed',
        tab: 'A build failed',
        blurb: 'A push to api failed to build. Nothing is down: the deploy that was live is still live and still serving. The screen has to say that first, then what failed, on which line, what changed, and the one thing to do.',
        focus: 'api',
        patch: {
          api: {
            /* The newest deploy failed at the build. The live one is the
               same 7e1b2c9 as before, untouched, and that is the point: a
               failed build changes nothing in production. */
            deploys: [
              { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 14, status: 'failed',
                fail: {
                  stage: 'build', step: 3, of: 4, cmd: 'npm run build',
                  line: 'src/billing/invoice.ts(41,18): error TS2339: Property ‘taxRate’ does not exist on type ‘Invoice’.',
                  /* The last lines of the build log, as the disclosure shows
                     them. The failing line is marked; the rest is context. */
                  log: [
                    '==> Cloning northlake-app at a3f9c1e',
                    '==> Step 1 of 4: Installing dependencies (npm ci)',
                    '    added 412 packages in 9s',
                    '==> Step 2 of 4: Generating the API client',
                    '    wrote src/generated/client.ts',
                    '==> Step 3 of 4: Building (npm run build)',
                    '    src/billing/invoice.ts(41,18): error TS2339: Property ‘taxRate’ does not exist on type ‘Invoice’.',
                    '    Found 1 error in src/billing/invoice.ts:41',
                    '==> Build failed at step 3 of 4. The live deploy (7e1b2c9) is unchanged.',
                  ],
                },
                /* What changed since the last deploy that built: the commits
                   between 7e1b2c9 and this one. `touches` is the file the
                   error names, when a commit touched it -- which is the one
                   fact that turns a list of commits into a suspect. */
                changes: [
                  { sha: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair',  ago: 18, touches: 'src/billing/invoice.ts' },
                  { sha: '9c2d0b4', msg: 'Bump Node to 22 in the Dockerfile',       by: 'Dana Okafor', ago: 24, touches: null },
                ] },
              { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'live' },
              { commit: '2b9f0a1', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440,          status: 'superseded' },
              { commit: '88e1c40', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440 + 20,     status: 'failed',
                fail: { stage: 'build', step: 3, of: 4, cmd: 'npm run build', line: 'src/billing/pdf.ts(12,3): error TS2304: Cannot find name ‘PageSize’.' } },
            ],
          },
          /* THE SECOND KIND OF FAILURE, on the same push. worker built, started,
             and exited before it did any work: a failed deploy that is not a
             build error, told apart in the table, the events and the row. */
          worker: {
            deploys: [
              { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 13, status: 'failed',
                fail: { stage: 'start', step: 4, of: 4, cmd: 'node worker.js', line: 'Error: TAX_SERVICE_URL is not set. Exited with code 1 after 20 s; the live deploy keeps running.' } },
              { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'live' },
              { commit: 'c4d81e6', msg: 'Rate limit per account',           by: 'Priya Nair',  ago: 14 * 1440,         status: 'superseded' },
            ],
          },
        },
        events: [
          { ago: 18, svc: 'api', kind: 'note', text: 'push by Priya Nair, 2 commits' },
        ],
      },
      {
        id: 'degraded',
        tab: 'Live, but failing',
        blurb: 'The deploy succeeded and is serving, and the errors started when it did. This is not a refusal; the platform has nothing to refuse. It is a reading: the figures since the deploy, beside the figures before it, and the one action that would put them back.',
        focus: 'api',
        patch: DEGRADED_PATCH(),
        events: DEGRADED_EVENTS(),
      },
      {
        id: 'rolled',
        tab: 'Rolled back',
        blurb: 'The developer has already rolled api and worker back to the deploy that was healthy. This is what the screen owes them next: the record of who decided, on which figures, and the way to undo it.',
        focus: 'api',
        patch: DEGRADED_PATCH(),
        events: DEGRADED_EVENTS(),
        then: (api) => api.rollback(['api', 'worker']),
      },
    ],

    /* What the plan panel says the rollback does with the answer. */
    whatHappens: 'Each service redeploys the older commit from the build it already has, in dependency order: api first, then worker. About forty seconds each. The newer commit stays in the history and can be deployed again. The rollback is recorded with who pressed it and the figures on this screen.',
  };

  /* What the figures did, as events: the two lines a metric writes into the
     feed when it crosses a line. The deploys write their own. */
  function DEGRADED_EVENTS() {
    return [
      { ago: 9, svc: 'api',    kind: 'alert', text: 'error rate crossed 5% (now 14%)' },
      { ago: 8, svc: 'worker', kind: 'alert', text: '10 jobs failed in 3 min (now 41)' },
    ];
  }

  /* STAGING. The same project in its other environment, where the commit
     that is failing on production has served for two hours with the figures
     production had before. The difference is what production calls that
     staging does not, and the zone says so: it is the one clue on the
     screen that points past the deploy. In the situations where nothing
     has moved on production, staging mirrors it. */
  function STAGING_PATCH() {
    return {
      api: {
        metrics: { errors: 0.3, errorsWas: 0.3, p95: 360, p95Was: 360 },
        deploys: [
          { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 2 * 60 + 5, status: 'live' },
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 5 * 60, status: 'superseded' },
        ],
      },
      worker: {
        metrics: { failedJobs: 0, failedJobsWas: 0 },
        deploys: [
          { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 2 * 60 + 4, status: 'live' },
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 5 * 60, status: 'superseded' },
        ],
      },
    };
  }

  /* The "live, but failing" services, used by two situations. A function
     rather than an object so each situation gets its own copy and the
     rollback in one cannot leak into the other. */
  function DEGRADED_PATCH() {
    return {
      api: {
        metrics: { errors: 14, errorsWas: 0.2, p95: 2800, p95Was: 340 },
        deploys: [
          { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 12, status: 'live',
            changes: [
              { sha: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 18, touches: 'src/billing/invoice.ts' },
            ],
            log: [
              '11:31:04  GET /invoices/8841  500  2,912 ms  upstream tax-service: timeout after 2,500 ms',
              '11:31:04  GET /invoices/8842  500  2,904 ms  upstream tax-service: timeout after 2,500 ms',
              '11:31:05  GET /accounts/me    200     41 ms',
              '11:31:06  GET /invoices/8843  500  2,911 ms  upstream tax-service: timeout after 2,500 ms',
              '11:31:06  POST /jobs/invoice  500  2,933 ms  upstream tax-service: timeout after 2,500 ms',
            ] },
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'superseded', healthy: '0.2% errors over 6 days' },
          { commit: '2b9f0a1', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440,          status: 'superseded' },
          { commit: '88e1c40', msg: 'Invoice PDF: page size',           by: 'Dana Okafor', ago: 9 * 1440 + 20,     status: 'failed',
            fail: { stage: 'build', step: 3, of: 4, cmd: 'npm run build', line: 'src/billing/pdf.ts(12,3): error TS2304: Cannot find name ‘PageSize’.' } },
        ],
      },
      worker: {
        metrics: { failedJobs: 41, failedJobsWas: 0 },
        deploys: [
          { commit: 'a3f9c1e', msg: 'Move invoice totals to the tax service', by: 'Priya Nair', ago: 11, status: 'live' },
          { commit: '7e1b2c9', msg: 'Retry on a redis timeout',         by: 'Priya Nair',  ago: 6 * 1440 + 4 * 60, status: 'superseded' },
          { commit: 'c4d81e6', msg: 'Rate limit per account',           by: 'Priya Nair',  ago: 14 * 1440,         status: 'superseded' },
        ],
      },
    };
  }

  /* =========================================================================
     MECHANISM
     ========================================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Inline icons in the site header's idiom: 24 box, 2px stroke, currentColor.
     Every one is aria-hidden and sits beside a word, never instead of one. */
  const ICON_PATHS = {
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    check:    '<path d="M20 6 9 17l-5-5"/>',
    ban:      '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    alert:    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    undo:     '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    info:     '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin:      '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    boxes:    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    commit:   '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
    chevron:  '<path d="m6 9 6 6 6-6"/>',
    expand:   '<path d="m6 9 6 6 6-6"/>',
    sort:     '<path d="m8 9 4-4 4 4"/><path d="m16 15-4 4-4-4"/>',
    sortUp:   '<path d="m8 14 4-4 4 4"/>',
    arrow:    '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    dash:     '<path d="M5 12h14"/>',
    down:     '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    play:     '<path d="m6 3 14 9-14 9V3z"/>',
    circle:   '<circle cx="12" cy="12" r="9"/>',
    /* The chrome's: the header's crumbs and the sidebar's rows. */
    globe:    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    layers:   '<path d="m12 2 9 4.5-9 4.5-9-4.5L12 2z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    lock:     '<rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    dashed:   '<path d="M10.1 2.2a10 10 0 0 1 3.8 0"/><path d="M17.6 4.4a10 10 0 0 1 2.7 2.7"/><path d="M21.8 10.1a10 10 0 0 1 0 3.8"/><path d="M19.6 17.6a10 10 0 0 1-2.7 2.7"/><path d="M13.9 21.8a10 10 0 0 1-3.8 0"/><path d="M6.4 19.6a10 10 0 0 1-2.7-2.7"/><path d="M2.2 13.9a10 10 0 0 1 0-3.8"/><path d="M4.4 6.4a10 10 0 0 1 2.7-2.7"/>',
    list:     '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    home:     '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    logs:     '<path d="M3 6h12"/><path d="M3 12h8"/><path d="M3 18h6"/><circle cx="17" cy="16" r="3.5"/><path d="m19.5 18.5 2.5 2.5"/>',
    chart:    '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 6-7"/>',
    gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    sliders:  '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>',
    disk:     '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    scale:    '<path d="m21 3-6 6"/><path d="M21 9V3h-6"/><path d="m3 21 6-6"/><path d="M3 15v6h6"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    back:     '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  };
  const TAB_ICON = { live: 'checkCircle', first: 'play', failed: 'ban', degraded: 'alert', rolled: 'undo' };
  const icon = (name, cls = 'dc-icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;

  /* Times, all relative to the project's clock. A developer reading a deploy
     list wants "12 min ago" and never a timestamp they have to subtract
     from; the clock itself is on the project card for the one place an
     absolute time matters, which is the record. */
  const ago = (min) => {
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    if (min < 1440) { const h = Math.floor(min / 60), m = min % 60; return m ? `${h} h ${m} min ago` : `${h} h ago`; }
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60);
    return h ? `${d} d ${h} h ago` : `${d} d ago`;
  };
  const span = (min) => ago(min).replace(' ago', '');
  const clock = (min) => {
    const m = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm} ${h < 12 ? 'am' : 'pm'}`;
  };
  const pct = (n) => `${n}%`;
  const msec = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${n} ms`);

  /* Milliseconds after a rollback during which the Undo that replaced it is
     inert. See the click handler. */
  const UNDO_ARMS_AFTER = 500;

  const state = {
    scenario: DATA.scenarios[0],
    services: [],
    sort: { key: 'id', dir: 'asc' },
    plan: null,           /* { ids } while the rollback preview is open */
    rolling: null,        /* { ids, from, to, on, at: index of the service redeploying } while one is in flight */
    rolled: null,         /* { ids, from, to, at, on } once a rollback is made */
    first: null,          /* { step, done, ran } while and after the first deploy */
    env: 'production',    /* production | staging */
    kind: 'all',          /* all | service | datastore | job: the table's and the feed's filter */
    retried: false,       /* the failed build's retry was pressed */
    armed: 0,             /* when the reader last pressed Roll back */
    open: new Set(),      /* service ids whose row is expanded */
    density: 'comfortable',
    envMenu: false,       /* the header's environment menu is open */
  };

  const root = $('#console');
  if (!root) return;

  /* The services as this situation sees them: the base list, each patched,
     each deploy history copied so a rollback can be written into it. */
  function buildServices(scenario) {
    const staging = STAGING_PATCH();
    const moved = ['failed', 'degraded', 'rolled'].includes(scenario.id);
    return DATA.services.map((s) => {
      const p = state.env === 'staging' && moved ? (staging[s.id] || {}) : (scenario.patch[s.id] || {});
      const deploys = (p.deploys || s.deploys);
      return {
        ...s,
        ...p,
        metrics: { ...(s.metrics || {}), ...(p.metrics || {}) },
        deploys: deploys ? deploys.map((d) => ({ ...d })) : null,
      };
    });
  }

  /* WHAT IS LIVE, AND WHAT IS NEWEST. The two questions the screen exists to
     keep apart. The live deploy is the one serving traffic; the newest is
     the last one attempted, which may be the same deploy, or a failed one,
     or one still building. Every row and the answer card read both. */
  const live = (s) => (s.deploys || []).find((d) => d.status === 'live') || null;
  const newest = (s) => (s.deploys && s.deploys[0]) || null;
  /* The deploy a rollback would go back to: the most recent one that served
     traffic before the live one. */
  const previous = (s) => {
    const ds = s.deploys || [];
    const i = ds.findIndex((d) => d.status === 'live');
    return ds.slice(i + 1).find((d) => d.status === 'superseded') || null;
  };
  const service = (id) => state.services.find((s) => s.id === id);
  const dependents = (id) => state.services.filter((s) => s.needs.includes(id));

  /* HEALTH, AS A WORD FIRST. ok | failing | recovering | none, and each is
     also written in the cell. A datastore and a job that has never run are
     "none": nothing to probe, and the word says why in the detail. */
  function health(s) {
    if (!s.deploys) return { state: 'none', word: 'provisioned' };
    if (!s.deploys.length) return { state: 'none', word: 'never deployed' };
    const n = newest(s);
    if (n && n.first && n.status === 'live') {
      return state.first && state.first.ran
        ? { state: 'ok', word: 'ok', fig: 'ran just now, 4 s' }
        : { state: 'ok', word: 'scheduled', fig: 'first run at 3:00 am' };
    }
    if (n && n.status === 'building') return { state: 'building', word: 'redeploying', fig: `${n.commit}, about 40 s` };
    const m = s.metrics || {};
    /* A service whose live deploy is a rollback is recovering, whether the
       whole sequence has landed yet or not: api is back on the good commit
       while worker is still redeploying, and its word says so. */
    if (n && n.rollback && n.status === 'live') {
      return { state: 'recovering', word: 'recovering', fig: m.errors != null ? `${pct(m.errors)} errors, falling` : `${m.failedJobs} failed jobs, stopped` };
    }
    if (m.errors != null && m.errors > 1) return { state: 'failing', word: 'failing', fig: `${pct(m.errors)} of requests` };
    if (m.failedJobs) return { state: 'failing', word: 'failing', fig: `${m.failedJobs} jobs in ${span(newest(s).ago)}` };
    return { state: 'ok', word: 'ok', fig: m.errors != null ? `${pct(m.errors)} errors` : '' };
  }

  /* ----- rendering ------------------------------------------------------- */

  function renderTabs() {
    const list = $('.dc-tabs', root);
    list.innerHTML = DATA.scenarios.map((s) => {
      const on = s.id === state.scenario.id;
      return `<button type="button" role="tab" id="dc-tab-${s.id}" class="dc-tab" aria-selected="${on}" aria-controls="dc-panel" tabindex="${on ? 0 : -1}" data-scenario="${s.id}">${icon(TAB_ICON[s.id])}${esc(s.tab)}</button>`;
    }).join('');
    $('#dc-panel', root).setAttribute('aria-labelledby', `dc-tab-${state.scenario.id}`);
    renderSituation();
  }

  function renderSituation() {
    $('.dc-rail-h', root).textContent = `Showing: ${state.scenario.tab}`;
    $('.dc-blurb', root).textContent = state.scenario.blurb;
  }

  /* THE CHROME: WHERE YOU ARE, AND WHAT IS CLOSEST. The header is a
     breadcrumb -- the project, the environment, the service the situation
     is about -- and the environment crumb is the switch, opened as a menu.
     The sidebar is the menu for that service: the two things a developer
     reaches for on a bad day at the top, then what there is to look at,
     then what there is to manage. Overview, Events, Logs and Metrics go to
     the parts of this screen that answer them; Environment opens the
     switch; the rest are the product's and not this prototype's, and say
     so rather than pretending. Rendered on every render, like the rest. */
  const NAV_MORE = [['gear', 'Settings'], ['scale', 'Scaling'], ['disk', 'Disks'], ['terminal', 'Shell']];
  function renderChrome() {
    const top = $('.dc-top', root), side = $('.dc-side', root);
    if (!top || !side) return;
    const p = DATA.project;
    const focus = state.scenario.focus ? service(state.scenario.focus) : null;
    const envs = [['production', 'Production', 'lock'], ['staging', 'Staging', 'dashed']];
    const cur = envs.find((e) => e[0] === state.env);
    const open = !!state.envMenu;
    const hasLog = !!(focus && newest(focus) && (newest(focus).log || (newest(focus).fail && newest(focus).fail.log)));
    top.innerHTML = `
      <ol class="dc-crumbs" aria-label="Where you are">
        <li class="dc-crumb">${icon('layers')}<span>${esc(p.name)}</span></li>
        <li class="dc-crumb dc-crumb--env">
          <button type="button" class="dc-crumb-btn" aria-haspopup="menu" aria-expanded="${open}" data-envmenu data-focus="envmenu">${icon(cur[2])}<span>${cur[1]}</span>${icon('chevron', 'dc-icon dc-crumb-chev')}</button>
          <div class="dc-menu" role="menu" aria-label="Switch environment"${open ? '' : ' hidden'}>
            <p class="dc-menu-h dc-label">Switch environment</p>
            ${envs.map(([id, name, glyph]) => `<button type="button" role="menuitemradio" class="dc-menu-item" aria-checked="${state.env === id}" data-env="${id}" data-focus="env:${id}">${icon(glyph)}<span>${name}</span></button>`).join('')}
          </div>
        </li>
        <li class="dc-crumb">${icon('globe')}<span>${focus ? esc(focus.id) : 'all services'}</span></li>
      </ol>
      <p class="dc-top-clock">${icon('clock')}<span>${clock(p.nowMin)}</span></p>`;
    const item = (glyph, label, attrs) => `<li><a class="dc-nav-item" ${attrs}>${icon(glyph)}<span>${label}</span></a></li>`;
    const off = (glyph, label) => `<li><span class="dc-nav-item" aria-disabled="true" title="In the product, not in this prototype">${icon(glyph)}<span>${label}</span></span></li>`;
    side.innerHTML = `
      <p class="dc-side-back">${icon('back')}<span>${cur[1]}</span></p>
      <p class="dc-side-id">${icon(focus ? 'globe' : 'layers')}<span>${focus ? esc(focus.id) : esc(p.name)}</span></p>
      <ul class="dc-nav">
        ${item('home', 'Overview', 'href="#dc-overview" aria-current="page" data-nav="overview"')}
        ${item('list', 'Events', 'href="#dc-events" data-nav="events"')}
      </ul>
      <p class="dc-nav-h dc-label">Monitor</p>
      <ul class="dc-nav">
        ${hasLog ? item('logs', 'Logs', 'href="#dc-overview" data-nav="logs"') : off('logs', 'Logs')}
        ${item('chart', 'Metrics', 'href="#dc-services" data-nav="metrics"')}
      </ul>
      <p class="dc-nav-h dc-label">Manage</p>
      <ul class="dc-nav">
        ${item('sliders', 'Environment', 'href="#dc-overview" data-nav="env"')}
        ${NAV_MORE.map(([g, l]) => off(g, l)).join('')}
      </ul>`;
  }

  /* THE PROJECT, AND THE FIRST QUESTION ANSWERED BEFORE IT IS ASKED. How
     many services, how many are serving, when the last deploy landed and on
     what, and the clock every "ago" on the screen counts from. */
  function renderProject() {
    const p = DATA.project;
    const serving = state.services.filter((s) => live(s)).length;
    const never = state.services.filter((s) => s.deploys && !s.deploys.length).length;
    const stores = state.services.filter((s) => !s.deploys).length;
    const last = state.services
      .map((s) => ({ s, d: newest(s) }))
      .filter((x) => x.d)
      .sort((a, b) => a.d.ago - b.d.ago)[0];
    const lastWord = last ? `${last.s.id}, ${ago(last.d.ago)}${last.d.status === 'failed' ? ', failed' : last.d.status === 'building' ? ', building' : ''}` : 'none';
    $('.dc-project', root).innerHTML = `
      <dl class="dc-project-facts">
        <div><dt>${icon('boxes')}Services</dt><dd>${serving} of ${state.services.length} serving, ${stores} datastores${never ? `, ${never} never deployed` : ''}</dd></div>
        <div><dt>${icon('commit')}Last deploy</dt><dd>${esc(lastWord)}</dd></div>
        <div><dt>${icon('pin')}Region</dt><dd>${esc(p.region)}</dd></div>
        <div><dt>${icon('clock')}Now</dt><dd>${clock(p.nowMin)}</dd></div>
      </dl>
      ${renderMap()}`;
    drawMap();
  }

  /* THE PROJECT AS A MAP. Six services in three rows, each a button that
     opens the service's row, with its health word beside its name, and the
     lines between them drawn from `needs`: a caller above the thing it
     calls, the line running down. This is the project-level view -- how
     the services connect, at a glance -- and the words on the chips, the
     row and the card stay the service-level view; the two answer different
     questions. Positions are authored on the data, because six nodes want
     a hand-placed drawing and not a layout algorithm. The lines are drawn
     after layout from the nodes' own boxes, so a resize redraws them. */
  function renderMap() {
    const nodes = state.services.map((s) => {
      const h = health(s);
      return `<button type="button" class="dc-node" data-more="${esc(s.id)}" data-focus="map:${esc(s.id)}" data-health="${h.state}" style="--x:${s.at[0]};--y:${s.at[1]}" aria-label="${esc(s.id)}, ${esc(h.word)}; open its history">${esc(s.id)}<span class="dc-node-h">${esc(h.word)}</span></button>`;
    }).join('');
    return `<div class="dc-project-map">
      <h4 class="dc-h">How the services connect</h4>
      <div class="dc-map"><svg class="dc-map-lines" aria-hidden="true" focusable="false"></svg>${nodes}</div>
    </div>`;
  }
  function drawMap() {
    const map = $('.dc-map', root);
    if (!map) return;
    const svg = map.querySelector('.dc-map-lines');
    const box = map.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const rect = (id) => { const el = map.querySelector(`[data-more="${id}"]`); const r = el.getBoundingClientRect(); return { x: r.x - box.x, y: r.y - box.y, w: r.width, h: r.height }; };
    let d = '';
    for (const s of state.services) {
      const a = rect(s.id);
      for (const id of s.needs) {
        const b = rect(id);
        const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y;
        const my = (y1 + y2) / 2;
        /* The line into a failing service takes the caution ink: it is the
           line a caller's own trouble runs along. A line out of a failing
           service would paint the datastores it calls as suspects. */
        const failing = health(service(id)).state === 'failing';
        d += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} C${x1.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"${failing ? ' class="is-failing"' : ''}/>`;
      }
    }
    svg.innerHTML = d;
  }
  window.addEventListener('resize', drawMap);

  /* A figure: the value large, the label under it, and what it was before
     the change beside it where there is a before. The count is charcoal and
     never the accent, so it reads as measured rather than judged. */
  const figure = (value, label, was) =>
    `<div class="dc-figure"><span class="dc-figure-v">${value}</span><span class="dc-figure-l">${esc(label)}</span>${was ? `<span class="dc-figure-was">was ${was}</span>` : ''}</div>`;

  /* THE DEPENDENCY STRIP. Not a diagram: the services that call this one
     and the ones it calls, each with its own health beside its name, so the
     question "what does this touch" is a row of words rather than a picture
     to decode. The lesson from the fleet's map, carried over -- a developer
     probably does not need a drawing of their system as much as they need
     the one thing wrong in it. */
  function depsStrip(s) {
    const up = dependents(s.id);
    const down = s.needs.map(service).filter(Boolean);
    const chip = (x) => { const h = health(x); return `<li class="dc-dep" data-health="${h.state}">${esc(x.id)}<span class="dc-dep-h">${esc(h.word)}</span></li>`; };
    return `<div class="dc-deps">
      ${up.length ? `<p class="dc-deps-l">Depended on by</p><ul class="dc-dep-list">${up.map(chip).join('')}</ul>` : `<p class="dc-deps-l">Nothing depends on it</p>`}
      ${down.length ? `<p class="dc-deps-l">Calls</p><ul class="dc-dep-list">${down.map(chip).join('')}</ul>` : ''}
    </div>`;
  }

  /* One commit in a "what changed" list: the hash, the message, who and
     when, and the file the error names when this commit touched it. */
  const changeRow = (c, suspectFile) => `<li class="dc-change${suspectFile && c.touches === suspectFile ? ' is-suspect' : ''}">
    <span class="dc-sha">${esc(c.sha)}</span>
    <span class="dc-change-body"><span class="dc-change-msg">${esc(c.msg)}</span>
      <span class="dc-change-who">${esc(c.by)}, ${ago(c.ago)}${c.touches ? `, touches <span class="dc-file">${esc(c.touches)}</span>` : ''}</span></span>
  </li>`;

  /* WHICH SERVICES A ROLLBACK TAKES TOGETHER, decided once. Rolling api
     back takes worker with it when the two are on the same commit and
     worker has somewhere to go back to, because they moved in one push and
     worker calls api. The button, the plan and the status line all read
     this, so the press and the promise cannot disagree. */
  function planIds(id) {
    const s = service(id);
    if (!s || !previous(s)) return [];
    const ids = [id];
    if (id === 'api') {
      const w = service('worker');
      if (w && live(w) && live(w).commit === live(s).commit && previous(w)) ids.push('worker');
    }
    return ids;
  }

  /* The rollback control, wherever it appears: on the card, in a row, in an
     open detail. `terse` is the table, where the word is the column head and
     the button names one row; the card's button names everything the plan
     will take. */
  function rollbackButton(s, cls = 'dc-btn', terse = false) {
    if (!s.deploys || !s.deploys.length) return '';
    /* IN FLIGHT: the control admits the press was taken and refuses a second
       one. Not disabled in the DOM, so it stays in the tab order and reads;
       aria-disabled says what it is. */
    if (state.rolling && state.rolling.ids.includes(s.id)) {
      return `<button type="button" class="${cls.includes('dc-btn-primary') ? cls.replace('dc-btn-primary', 'dc-btn-quiet') : cls + ' dc-btn-quiet'}" aria-disabled="true" data-focus="roll:${esc(s.id)}">Rolling back&hellip;</button>`;
    }
    if (state.rolled && state.rolled.ids.includes(s.id)) {
      return terse
        ? `<button type="button" class="${cls} dc-btn-quiet" data-undo="${esc(s.id)}" data-focus="roll:${esc(s.id)}">Undo<span class="dc-btn-id dc-btn-id--quiet"> the rollback of ${esc(s.id)}</span></button>`
        : `<button type="button" class="${cls}" data-undo="${esc(s.id)}" data-focus="roll:${esc(s.id)}">Rolled back ${icon('check')} Undo</button>`;
    }
    const prev = previous(s);
    if (!prev) return terse ? '<span class="dc-cell-note">nothing to roll back to</span>' : '';
    const names = terse ? s.id : planIds(s.id).join(' and ');
    return `<button type="button" class="${cls}" data-plan="${esc(s.id)}" data-focus="roll:${esc(s.id)}">Roll back<span class="dc-btn-id${terse ? ' dc-btn-id--quiet' : ''}"> ${esc(names)}</span></button>`;
  }

  /* The log, folded. It is one step down from the line that names the
     error, because the line is what most readers need and the log is what
     the rest need to believe it. The failing line is marked in the log too,
     so a reader who opens it lands on the same sentence. */
  function logDisclosure(lines, mark, label) {
    return `<details class="dc-log-fold">
      <summary class="disclosure-row">${icon('chevron', 'disclosure-chev')}<span class="dc-log-label">${esc(label)}</span></summary>
      <ol class="dc-log">${lines.map((l) => `<li${mark && l.includes(mark) ? ' class="is-marked"' : ''}>${esc(l)}</li>`).join('')}</ol>
    </details>`;
  }

  /* THE ANSWER ZONE. What the situation is, and under it the card that
     answers the five questions for the service it is about, with the panel
     beside it holding the thing to compare against: the deploy that is still
     serving, or the one that was healthy. */
  function renderAnswer() {
    const box = $('.dc-answer', root);
    const sc = state.scenario;
    const s = sc.focus ? service(sc.focus) : null;
    let html = '';

    if (state.env === 'staging') {
      const api = service('api'), worker = service('worker');
      const moved = ['failed', 'degraded', 'rolled'].includes(sc.id);
      html = `<div class="dc-lead" data-tone="ok">
        <p class="dc-lead-kicker dc-label">Staging</p>
        <h3 class="dc-answer-h">${moved ? `Every service on staging is serving ${esc(live(api).commit)}, and has been for ${span(live(api).ago)}.` : 'Staging is serving the same commits as production.'}</h3>
        <p class="dc-answer-dek">${moved ? `The commit that is ${sc.id === 'failed' ? 'failing to build' : 'failing'} on production built here and has served at ${pct(api.metrics.errors)} errors. What differs is not the code.` : 'Nothing has moved on production since staging last matched it.'}</p>
        <div class="dc-pair">
          <div class="dc-card" data-enter="card:staging">
            <p class="dc-card-head">On staging</p>
            <div class="dc-figures">
              ${figure(pct(api.metrics.errors), 'of api requests erroring')}
              ${figure(msec(api.metrics.p95), 'api p95 response')}
              ${figure(String(worker.metrics.failedJobs), 'worker jobs failed')}
            </div>
          </div>
          <div class="dc-aside" data-enter="aside:staging">
            <h4 class="dc-h">What is different on production</h4>
            <p class="dc-aside-p">${moved ? 'The tax service. Staging calls a stub that answers in 40 ms; production calls the real one, which is timing out. Same commit, different thing on the other end of the call.' : 'Nothing that shows here. The two environments share their commits until a push moves one.'}</p>
          </div>
        </div>
      </div>`;
      box.innerHTML = html;
      return;
    }

    if (!s) {
      /* ALL LIVE. The zone still earns its place: the first question answered
         in one sentence, the last change named, the figures at rest, and the
         one row that is not like the others said in words. */
      const web = service('web'), cron = service('nightly-report'), api = service('api'), worker = service('worker');
      html = `<div class="dc-lead" data-tone="ok">
        <p class="dc-lead-kicker dc-label">All live</p>
        <h3 class="dc-answer-h">Every service that has a deploy is serving it. Nothing needs you.</h3>
        <p class="dc-answer-dek">The last change was ${esc(web.id)}, ${ago(live(web).ago)}. ${esc(api.id)} and ${esc(worker.id)} have been on ${esc(live(api).commit)} for ${span(live(api).ago)} with ${pct(api.metrics.errors)} errors.</p>
        <div class="dc-pair">
          <div class="dc-card" data-enter="card:live">
            <p class="dc-card-head">Since the last deploy</p>
            <div class="dc-figures">
              ${figure(pct(api.metrics.errors), 'of api requests erroring')}
              ${figure(msec(api.metrics.p95), 'api p95 response')}
              ${figure(String(worker.metrics.failedJobs), 'worker jobs failed')}
            </div>
            <p class="dc-card-note">What the figures were before anything changed.</p>
          </div>
          <div class="dc-aside" data-enter="aside:live">
            <h4 class="dc-h">The one row that is different</h4>
            <p class="dc-aside-p"><strong>${esc(cron.id)}</strong> has never deployed. Nothing is wrong; nothing has happened yet. It has a schedule and no history.</p>
          </div>
        </div>
      </div>`;
      box.innerHTML = html;
      return;
    }

    const n = newest(s), l = live(s);

    if (sc.id === 'first') {
      /* THE EMPTY STATE THAT LEADS SOMEWHERE. The row says never deployed;
         this says what a first deploy needs, where each of those came from,
         and what the first run will do, and then does it in order when the
         button is pressed. Three of the four are read from the repository
         and say so; the schedule was set by hand and says so. */
      const f = s.first, fs = state.first;
      const done = fs && fs.done;
      const stepAt = fs ? fs.step : -1;
      html = `<div class="dc-lead" data-tone="${done ? 'ok' : 'first'}">
        <p class="dc-lead-kicker dc-label">First deploy</p>
        <h3 class="dc-answer-h">${done
          ? (fs.ran ? `${esc(s.id)} ran once and wrote its report. It runs at 3:00 am from now on.` : `${esc(s.id)} is live at its first deploy.`)
          : fs ? `Deploying ${esc(s.id)} for the first time.` : `${esc(s.id)} was created and has never deployed.`}</h3>
        <p class="dc-answer-dek">${done
          ? (fs.ran ? `Exit 0 in 4 seconds, one report written to ${esc('postgres')}. Nothing more to set up.` : `Built from ${esc(f.commit)} and scheduled. The first run is at 3:00 am; run it now to see one succeed before then.`)
          : fs ? `Four steps, in order. The build and start commands come from the repository; the schedule was set when the job was created.` : `Nothing is wrong; nothing has happened yet. Three of the four things it needs were read from the repository, and one was set by hand.`}</p>
        <div class="dc-pair">
          <div class="dc-card" data-enter="first:${esc(s.id)}">
            <p class="dc-card-head">${done ? 'The first deploy' : 'Before the first deploy'}</p>
            <dl class="dc-answers">
              <div><dt>Build command</dt><dd><span class="dc-cmd">${esc(f.build)}</span> <span class="dc-answers-fine">read from package.json</span></dd></div>
              <div><dt>Start command</dt><dd><span class="dc-cmd">${esc(f.start)}</span> <span class="dc-answers-fine">read from package.json</span></dd></div>
              <div><dt>Schedule</dt><dd>${esc(f.schedule)} <span class="dc-answers-fine">set when the job was created</span></dd></div>
              <div><dt>Needs</dt><dd>${esc('postgres')}, which is provisioned; its address is already in the environment.</dd></div>
            </dl>
            ${fs ? `<ol class="dc-steps" aria-label="The deploy, step by step">${f.steps.map((t, i) => `<li data-step="${i < stepAt ? 'done' : i === stepAt ? 'now' : 'next'}">${icon(i < stepAt ? 'checkCircle' : i === stepAt ? 'clock' : 'circle')}<span>${esc(t)}</span></li>`).join('')}</ol>` : ''}
            <p class="dc-card-act">${done
              ? (fs.ran ? `<button type="button" class="dc-btn dc-btn-quiet" aria-disabled="true">Ran ${icon('check')} exit 0</button>` : `<button type="button" class="dc-btn dc-btn-primary" data-run="${esc(s.id)}" data-focus="deploy">Run it now</button>`)
              : fs ? `<button type="button" class="dc-btn dc-btn-quiet" aria-disabled="true" data-focus="deploy">Deploying&hellip;</button>`
              : `<button type="button" class="dc-btn dc-btn-primary" data-deploy="${esc(s.id)}" data-focus="deploy">Deploy ${esc(s.id)}</button>`}</p>
          </div>
          <div class="dc-aside" data-enter="aside:${esc(s.id)}">
            <h4 class="dc-h">What a first deploy cannot read</h4>
            <p class="dc-aside-p">Whether the job does what its name says. The platform can build it and schedule it; only a run says whether the report is right. That is why the first run is offered now rather than left for 3:00 am.</p>
            <h4 class="dc-h dc-aside-h2">What depends on it</h4>
            ${depsStrip(s)}
          </div>
        </div>
      </div>`;
      box.innerHTML = html;
      return;
    }

    if (n && n.status === 'failed') {
      /* A BUILD FAILED. The refusal: the platform would not promote this
         deploy, and the card takes the caution ground and the caution edge
         to say so. The first sentence is that nothing is down. */
      const f = n.fail;
      const deps = dependents(s.id);
      html = `<div class="dc-lead" data-tone="failed">
        <p class="dc-lead-kicker dc-label">A build failed</p>
        <h3 class="dc-answer-h">${esc(s.id)}&rsquo;s newest deploy failed to build. The live one is still serving.</h3>
        <p class="dc-answer-dek">Nothing is down. ${esc(l.commit)} has been live for ${span(l.ago)} and is unchanged. The push ${ago(n.ago)} never reached it. worker&rsquo;s deploy from the same push started and then exited, so it failed too; its live deploy is still running.</p>
        <div class="dc-pair">
          <div class="dc-fail" data-enter="fail:${esc(s.id)}">
            <p class="dc-fail-head">${icon('ban', 'dc-fail-glyph')}${esc(n.commit)} failed at the ${esc(f.stage)}, step ${f.step} of ${f.of}</p>
            <dl class="dc-answers">
              <div><dt>What failed</dt><dd><span class="dc-cmd">${esc(f.cmd)}</span> stopped on one error: <span class="dc-line">${esc(f.line)}</span></dd></div>
              <div><dt>What changed since it last built</dt><dd>
                <ol class="dc-changes">${n.changes.map((c) => changeRow(c, 'src/billing/invoice.ts')).join('')}</ol>
                <span class="dc-answers-fine">One of the two touches the file the error names. That is a suspect, not a verdict.</span>
              </dd></div>
              <div><dt>What depends on it</dt><dd>${deps.map((d) => esc(d.id)).join(' and ')}, both still on the live deploy. worker&rsquo;s own deploy of this push failed on start, a different failure from this one; its row and the feed carry the line.</dd></div>
              <div><dt>What to do</dt><dd>Fix the build and push. The live deploy keeps serving until a new one succeeds; there is nothing to roll back, because nothing moved.${state.retried ? ' <strong>Retried once, at ' + clock(DATA.project.nowMin) + ': the same error on the same line.</strong>' : ''}</dd></div>
            </dl>
            ${logDisclosure(f.log, 'error TS2339', 'The last nine lines of the build log')}
            <p class="dc-card-act"><button type="button" class="dc-btn dc-btn-quiet" data-retry="${esc(s.id)}" data-focus="retry">Retry the build</button></p>
          </div>
          <div class="dc-aside" data-enter="aside:${esc(s.id)}">
            <h4 class="dc-h">Live and serving</h4>
            <div class="dc-figures dc-figures--stack">
              ${figure(esc(l.commit), `${l.msg}, ${l.by}`)}
              ${figure(span(l.ago), 'live, without a failed health check')}
              ${figure(pct(s.metrics.errors), 'of requests erroring')}
            </div>
            <h4 class="dc-h dc-aside-h2">What depends on it</h4>
            ${depsStrip(s)}
          </div>
        </div>
      </div>`;
      box.innerHTML = html;
      return;
    }

    /* LIVE, BUT FAILING, and its far side, ROLLED BACK. A reading, not a
       refusal: the deploy succeeded and the platform has nothing to say
       against it.

       IT IS A COMPARISON, THE COCKPIT'S CLOSE CALL CARRIED OVER. It was a
       white card of three figures with their befores in small type under
       them, and then paragraphs, and the one thing the reader has to do --
       set the deploy beside the one before it -- was left to the reader. Now
       the two deploys are the two columns of a table: the last good one on
       the left, the failing one on the right, a row for each figure with the
       value, a word for which way it went and a bar drawn against the larger
       of the two, and all three rows raised on white because all three are
       the change. The action sits in the footer under the deploy it returns
       to, so the choice is spatial: the column you want is the column with
       the button. A raised note over the table says the one thing the system
       cannot vouch for; what changed and what depends on it follow, side by
       side, and the log folds under them.

       The columns hold still across the rollback, so the table reads the
       same way before and after: left is 7e1b2c9, right is a3f9c1e. Only
       their labels move -- "The last good deploy" becomes "Live again", and
       "Since the deploy" becomes "Rolled back" -- and Undo stands under the
       right-hand column, because that is the deploy it would put back. */
    const rolled = state.rolled && state.rolled.ids.includes(s.id);
    const rolling = state.rolling && state.rolling.ids.includes(s.id);
    const worker = service('worker');
    const bad = rolled ? s.deploys.find((d) => d.commit === state.rolled.from) : n;
    const good = rolled ? live(s) : previous(s);
    const m = s.metrics;
    const changes = (bad && bad.changes) || [];
    const D = DEGRADED_PATCH();
    /* The figures each column shows. The failing deploy's are the ones it
       wrote while it served; the good one's are its record before, or, once
       it is live again, what it is doing now. */
    const A = { errors: rolled ? m.errors : m.errorsWas, p95: rolled ? m.p95 : m.p95Was, jobs: 0 };
    const B = { errors: D.api.metrics.errors, p95: D.api.metrics.p95, jobs: D.worker.metrics.failedJobs };
    const now = rolling ? state.rolling.ids[state.rolling.at] : null;
    const ROWS = [
      { label: `${s.id} errors`, unit: 'share of requests', a: A.errors, b: B.errors, fmt: pct },
      { label: `${s.id} response`, unit: '95th percentile', a: A.p95, b: B.p95, fmt: msec },
      { label: `${worker.id} failed jobs`, unit: `in ${span(12)}`, a: A.jobs, b: B.jobs, fmt: String },
    ];
    /* A bar is the value against the larger of the pair, so the two bars
       in a row are one drawing; a zero keeps a sliver so the track reads as
       a measurement and not a missing one. */
    const bar = (v, max, side) => `<span class="dc-bar" data-side="${side}" aria-hidden="true"><span class="dc-bar-mark" style="--w:${max > 0 ? Math.max(2, (v / max) * 100).toFixed(1) : 2}%"></span></span>`;
    const dir = (side) => side === 'a'
      ? `<span class="dc-dir" data-dir="${rolled ? 'recovering' : 'healthy'}">${icon(rolled ? 'undo' : 'checkCircle')}${rolled ? 'recovering' : 'healthy'}</span>`
      : `<span class="dc-dir" data-dir="worse">${icon('down')}worse</span>`;
    const head = (label, d, when) => `<th scope="col" class="dc-vs-opt">
        <span class="dc-vs-opt-label dc-label">${label}</span>
        <span class="dc-vs-opt-id">${esc(d.commit)}</span>
        <span class="dc-vs-opt-who">${esc(d.msg)} <span class="dc-sep" aria-hidden="true">&middot;</span> ${when}</span>
      </th>`;
    const button = rollbackButton(s, 'dc-btn dc-btn-primary');
    const note = rolled
      ? `<p class="dc-note">${icon('checkCircle')}<span><strong>Recorded at ${clock(state.rolled.at)}.</strong> You rolled ${esc(s.id)} and ${esc(worker.id)} back from ${esc(state.rolled.from)} to ${esc(state.rolled.to)}, on ${esc(state.rolled.on)}. Written with the deploy, for anyone to read.</span></p>`
      : rolling
        ? `<p class="dc-note">${icon('clock')}<span><strong>${esc(now)} is redeploying ${esc(state.rolling.to)}.</strong> ${now === s.id ? `${esc(worker.id)} goes when ${esc(s.id)} is serving again.` : `${esc(s.id)} is serving ${esc(state.rolling.to)} again.`} The right-hand column is still the failing deploy&rsquo;s until both have landed.</span></p>`
        : `<p class="dc-note" data-tone="read">${icon('alert')}<span><strong>The errors started when ${esc(n.commit)} went live.</strong> It sends invoice totals to a tax service outside this project, and that service is timing out. The deploy may not be what broke.</span></p>`;
    html = `<div class="dc-lead" data-tone="${rolled ? 'ok' : 'read'}">
      <p class="dc-lead-kicker dc-label">${rolled ? 'Rolled back' : rolling ? 'Rolling back' : 'Live, but failing'}</p>
      <h3 class="dc-answer-h">${rolled
        ? `${esc(s.id)} and ${esc(worker.id)} are back on ${esc(good.commit)}. The errors are falling.`
        : rolling
          ? `Rolling ${esc(s.id)} and ${esc(worker.id)} back to ${esc(state.rolling.to)}, ${esc(s.id)} first.`
          : `${esc(s.id)} is live, and failing since the deploy ${ago(n.ago)}.`}</h3>
      <p class="dc-answer-dek">${rolled
        ? `${esc(state.rolled.from)} stays in the history and can be deployed again once the tax service answers.`
        : rolling
          ? `Each service redeploys from the build it already has, in dependency order.`
          : `${esc(n.commit)} passed its health check and is serving every request. The deploy before it was healthy for ${span(good.ago)}.`}</p>
      <div class="dc-read${rolled ? ' is-rolled' : ''}" data-enter="read:${esc(s.id)}">
        ${note}
        <table class="dc-vs">
          <caption class="dc-visually-hidden">${esc(good.commit)} and ${esc(bad.commit)} compared on the three figures that moved, then the action for each.</caption>
          <thead><tr>
            <td class="dc-vs-corner"></td>
            ${head(rolled ? 'Live again' : 'The last good deploy', good, rolled ? `live ${ago(DATA.project.nowMin - state.rolled.at)}` : `live ${span(good.ago)} before`)}
            ${head(rolled ? 'Rolled back' : 'Since the deploy', bad, rolled ? `served ${span(12)}` : `live ${span(bad.ago)}`)}
          </tr></thead>
          <tbody>
            ${ROWS.map((r, i) => { const max = Math.max(r.a, r.b); return `<tr class="dc-vs-row" style="--i:${i}">
              <th scope="row" class="dc-vs-factor"><span class="dc-vs-factor-name">${esc(r.label)}</span><span class="dc-vs-note">${esc(r.unit)}</span></th>
              <td class="dc-vs-cell"><span class="dc-vs-value">${r.fmt(r.a)}</span>${dir('a')}${bar(r.a, max, 'a')}</td>
              <td class="dc-vs-cell"><span class="dc-vs-value">${r.fmt(r.b)}</span>${dir('b')}${bar(r.b, max, 'b')}</td>
            </tr>`; }).join('')}
          </tbody>
        </table>
        <!-- The actions, under the columns they belong to: a row outside the
             table, on the table's own column widths, so it can stack on a
             phone where a table footer cannot. -->
        <div class="dc-vs-foot">
          <div class="dc-vs-act">${rolled ? `<span class="dc-vs-act-note">Serving every request again.</span>` : `${button}<span class="dc-vs-act-note">${esc(worker.id)} goes back with it. Already built; about forty seconds.</span>`}</div>
          <div class="dc-vs-act">${rolled ? `${button}<span class="dc-vs-act-note">Still built. Undo redeploys it.</span>` : `<span class="dc-vs-act-note">Keep serving it, and look at the tax service first.</span>`}</div>
        </div>
        <div class="dc-read-more">
          <div>
            <h4 class="dc-h">What changed</h4>
            <ol class="dc-changes">${changes.map((c) => changeRow(c, null)).join('')}</ol>
            <p class="dc-aside-fine">One commit, deployed to ${esc(s.id)} and ${esc(worker.id)} in the same push.</p>
          </div>
          <div>
            <h4 class="dc-h">What depends on it</h4>
            ${depsStrip(s)}
          </div>
        </div>
        ${logDisclosure((bad && bad.log) || [], 'timeout', `The last five lines of ${s.id}’s log`)}
      </div>
    </div>`;
    box.innerHTML = html;
  }

  /* FOUR TONES, AND ONLY ONE OF THEM IS CAUTION GROUND.
       ok       something landed, or nothing is wrong   check, muted ground
       note     here is the situation                    info,  muted ground
       read     a figure the system will not vouch for   alert, muted ground, caution ink on the glyph
       refused  the platform would not promote it        ban,   caution ground
     Caution ground is spent on the last one alone. */
  const TONE_ICON = { ok: 'checkCircle', note: 'info', read: 'alert', refused: 'ban' };
  function renderStatus(message, tone = 'ok') {
    const s = $('.dc-status', root);
    if (message === undefined) return;
    s.setAttribute('data-tone', tone);
    s.innerHTML = `${icon(TONE_ICON[tone] || 'checkCircle')}<span>${esc(message)}</span>`;
  }

  /* THE PLAN: a rollback as a coordinated act, previewed. Every service in
     the project is a row, whether it changes or not, because "what stays"
     is half of what makes a rollback feel safe. */
  function renderPlan() {
    const box = $('.dc-plan', root);
    if (!state.plan) { closePlan(box); return; }
    planGen++;
    box.removeAttribute('data-leaving');
    box.hidden = false;
    const ids = state.plan.ids;
    const names = ids.join(' and ');
    /* The two that change first, then what stays, in project order: the
       thing being decided leads, the way the cockpit's comparison puts the
       decisive rows at the top. */
    const ordered = [...state.services].sort((a, b) => (ids.includes(b.id) ? 1 : 0) - (ids.includes(a.id) ? 1 : 0));
    const rows = ordered.map((s) => {
      if (ids.includes(s.id)) {
        const from = live(s), to = previous(s);
        return `<li class="dc-plan-row" data-change="yes">
          <span class="dc-plan-svc">${esc(s.id)}</span>
          <span class="dc-plan-body"><span class="dc-sha">${esc(from.commit)}</span> ${icon('arrow')} <span class="dc-sha">${esc(to.commit)}</span>
            <span class="dc-plan-why">${esc(to.msg)}, ${esc(to.by)}. ${to.healthy ? esc(to.healthy) : `Live for ${span(to.ago - from.ago)} before this.`}</span></span>
        </li>`;
      }
      const why = !s.deploys ? 'a datastore does not roll back with a deploy; nothing here touches its data'
        : !s.deploys.length ? 'never deployed; there is nothing to go back to'
        : `its live deploy is from before the change`;
      return `<li class="dc-plan-row" data-change="no">
        <span class="dc-plan-svc">${esc(s.id)}</span>
        <span class="dc-plan-body">unchanged<span class="dc-plan-why">${esc(why)}</span></span>
      </li>`;
    }).join('');
    box.innerHTML = `
      <form class="dc-plan-form" novalidate>
        <p class="dc-plan-head" id="dc-plan-head" tabindex="-1">Roll ${esc(names)} back to the deploy that was healthy?</p>
        <ol class="dc-plan-list">${rows}</ol>
        <p class="dc-plan-what"><span class="dc-label">What happens:</span> ${esc(DATA.whatHappens)}</p>
        <p class="dc-plan-cmd"><span class="dc-label">The same, from a terminal:</span> <span class="dc-cmd">deploy rollback ${esc(ids.join(' '))} --to ${esc(previous(service(ids[0])).commit)}</span></p>
        <p class="dc-plan-act">
          <button type="submit" class="dc-btn dc-btn-primary">Roll back ${esc(names)}</button>
          <button type="button" class="dc-btn dc-btn-quiet" data-plan-close>Not now</button>
        </p>
      </form>`;
  }

  /* A head is a label and, where it helps, a unit on its own line under it,
     so no head wraps where the browser decides. */
  const COLUMNS = [
    { key: 'id',      label: 'Service',      sortable: true },
    { key: 'type',    label: 'Type',         sortable: true },
    { key: 'since',   label: 'Live',         sortable: true, unit: 'serving traffic' },
    { key: 'newest',  label: 'Newest deploy', sortable: true, unit: 'may not be the live one' },
    { key: 'health',  label: 'Health',       sortable: true },
    { key: 'deps',    label: 'Depends on',   sortable: false },
    { key: 'act',     label: 'Roll back',    sortable: false, act: true },
  ];

  const HEALTH_ORDER = { failing: 0, recovering: 1, ok: 2, none: 3 };
  function sortValue(s, key) {
    if (key === 'since') { const l = live(s); return l ? l.ago : 1e9; }
    if (key === 'newest') { const n = newest(s); return n ? n.ago : 1e9; }
    if (key === 'health') return HEALTH_ORDER[health(s).state];
    return s[key];
  }

  /* The newest deploy's state, as a word and a tag: live, failed, building,
     or, for the empty history, "never". The tag carries the one state worth
     interrupting for. */
  function newestCell(s) {
    const n = newest(s);
    if (!s.deploys) return `<span class="dc-cell-note">provisioned, not deployed</span>`;
    if (!n) return `<span class="dc-cell-note">never</span>`;
    const l = live(s);
    const same = l && l.commit === n.commit && n.status === 'live';
    const tag = n.status === 'failed' ? `<span class="dc-tag dc-tag-failed">${icon('ban')}failed</span>`
      : n.status === 'building' ? `<span class="dc-tag">building</span>`
      : n.rollback ? `<span class="dc-tag dc-tag-rolled">rolled back</span>`
      : same ? '' : `<span class="dc-tag">live</span>`;
    return `<span class="dc-sha">${esc(n.commit)}</span> ${tag}<span class="dc-cell-note">${ago(n.ago)}${same ? ', the live one' : ''}</span>`;
  }

  /* A ROW THAT CAN EXPLAIN ITSELF: the deploy history, newest first, with
     every failure kept in it, what it runs and what it touches. It is also
     where the columns a phone cannot show go. */
  function rowDetail(s) {
    const h = health(s);
    let history;
    if (!s.deploys) history = `<p class="dc-detail-p">${esc(s.runtime)}. Not deployed and never will be: it is provisioned once and kept. A rollback of any service leaves its data exactly where it is.</p>`;
    else if (!s.deploys.length) history = `<p class="dc-detail-p">${esc(s.runtime)}. <strong>Never deployed.</strong> Nothing is wrong; nothing has happened yet. Its first deploy will appear here, and it runs on its schedule from then on.</p>`;
    else history = `<p class="dc-detail-p">${esc(s.runtime)}${s.health ? `, health check on <span class="dc-file">${esc(s.health)}</span>` : ''}.</p>
      <h5 class="dc-h dc-detail-h">Deploys, newest first</h5>
      <ol class="dc-history">${s.deploys.map((d) => `<li class="dc-history-row" data-status="${esc(d.status)}">
        <span class="dc-history-tag">${d.status === 'failed' ? icon('ban') : d.status === 'live' ? icon('checkCircle') : ''}${esc(d.status)}</span>
        <span class="dc-history-body"><span class="dc-sha">${esc(d.commit)}</span> ${esc(d.msg)}<span class="dc-history-who">${esc(d.by)}, ${ago(d.ago)}${d.rollback ? ', a rollback' : ''}</span>${d.fail ? `<span class="dc-history-fail">${esc(d.fail.line)}</span>` : ''}</span>
      </li>`).join('')}</ol>`;
    return `<div class="dc-detail">
      ${history}
      ${s.needs.length || dependents(s.id).length ? depsStrip(s) : ''}
      ${h.fig ? `<p class="dc-deps-l dc-detail-l">Health</p><p class="dc-detail-p dc-detail-p--tight">${esc(h.word)}, ${esc(h.fig)}</p>` : ''}
      ${s.deploys && s.deploys.length ? `<p class="dc-detail-act">${rollbackButton(s, 'dc-btn dc-btn-primary')}</p>` : ''}
    </div>`;
  }

  function renderTable() {
    const { key, dir } = state.sort;
    const rows = [...state.services].sort((a, b) => {
      const x = sortValue(a, key), y = sortValue(b, key);
      const c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
      return dir === 'asc' ? c : -c;
    });
    const head = COLUMNS.map((c) => {
      const cls = [c.num ? 'dc-num' : '', c.act ? 'dc-cell-act' : ''].filter(Boolean).join(' ');
      const label = `<span class="dc-th-text"><span class="dc-th-label">${esc(c.label)}</span>${c.unit ? `<span class="dc-th-unit">${esc(c.unit)}</span>` : ''}</span>`;
      if (!c.sortable) return `<th scope="col"${cls ? ` class="${cls}"` : ''}><span class="dc-th">${label}</span></th>`;
      const on = key === c.key;
      const sorted = on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none';
      const glyph = icon(on ? 'sortUp' : 'sort', 'dc-icon dc-sort-icon');
      return `<th scope="col" aria-sort="${sorted}"${cls ? ` class="${cls}"` : ''}>
        <button type="button" class="dc-th dc-sort" data-sort="${c.key}" data-focus="sort:${c.key}">${label}${glyph}</button>
      </th>`;
    }).join('');
    const body = rows.filter((s) => state.kind === 'all' || s.kind === state.kind).map((s, i) => {
      const cls = ['dc-row'];
      const n = newest(s), l = live(s), h = health(s);
      if (state.scenario.focus === s.id) cls.push('is-focus');
      if (n && n.status === 'failed') cls.push('is-failed');
      if (state.rolled && state.rolled.ids.includes(s.id)) cls.push('is-rolled');
      const open = state.open.has(s.id);
      /* THE PHONE HIDES THE NEWEST-DEPLOY COLUMN, and the one thing in it a
         phone reader must not lose is the state tag: failed, rolled back.
         So the tag is rendered again under the service name, and the
         stylesheet shows exactly one of the two at any width. aria-hidden on
         the copy, so a screen reader hears the state once. */
      const phoneTag = n && n.status === 'failed' ? `<span class="dc-tag dc-tag-failed dc-tag--phone" aria-hidden="true">${icon('ban')}failed</span>`
        : n && n.rollback ? `<span class="dc-tag dc-tag-rolled dc-tag--phone" aria-hidden="true">rolled back</span>` : '';
      return `<tr class="${cls.join(' ')}" data-service="${esc(s.id)}" style="--i:${i}">
        <th scope="row" class="dc-cell-svc"><button type="button" class="dc-row-more" data-more="${esc(s.id)}" data-focus="more:${esc(s.id)}" aria-expanded="${open}" aria-controls="dc-detail-${esc(s.id)}">${esc(s.id)}<span class="dc-visually-hidden">, ${open ? 'hide' : 'show'} its history</span>${icon('expand', 'dc-icon dc-row-chev')}</button>${phoneTag}</th>
        <td class="dc-cell-type">${esc(s.type)}</td>
        <td class="dc-cell-live">${l ? `<span class="dc-sha">${esc(l.commit)}</span><span class="dc-cell-note">for ${span(l.ago)}</span>` : `<span class="dc-cell-note">${s.deploys ? 'nothing yet' : 'n/a'}</span>`}</td>
        <td class="dc-cell-newest">${newestCell(s)}</td>
        <td class="dc-cell-health" data-health="${h.state}"><span class="dc-health-word">${h.state === 'failing' ? icon('alert') : h.state === 'ok' ? icon('checkCircle') : h.state === 'recovering' ? icon('undo') : ''}${esc(h.word)}</span>${h.fig ? `<span class="dc-cell-note">${esc(h.fig)}</span>` : ''}</td>
        <td class="dc-cell-deps">${s.needs.length ? s.needs.map(esc).join(', ') : '<span class="dc-cell-note">nothing</span>'}</td>
        <td class="dc-cell-act">${rollbackButton(s, 'dc-btn', true)}</td>
      </tr>
      <tr class="dc-row-detail${open ? ' is-open' : ''}" id="dc-detail-${esc(s.id)}"${open ? '' : ' hidden'}>
        <td colspan="${COLUMNS.length}">${open ? rowDetail(s) : ''}</td>
      </tr>`;
    }).join('');
    $('.dc-table', root).innerHTML = `<caption class="dc-visually-hidden">Every service in the project: what is live, when it went live, the newest deploy whether or not it is the live one, its health and what it depends on. Sort any column; open any service for its deploy history; roll back any service that has a deploy to go back to.</caption><thead><tr>${head}</tr></thead><tbody data-enter="services">${body}</tbody>`;
    renderDensity();
  }

  function renderDensity() {
    const wrap = $('.dc-services', root);
    if (!wrap) return;
    wrap.classList.toggle('is-compact', state.density === 'compact');
    for (const b of wrap.querySelectorAll('[data-density]')) {
      b.setAttribute('aria-pressed', String(b.dataset.density === state.density));
    }
    for (const b of root.querySelectorAll('[data-kind]')) {
      b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind));
    }
  }

  /* WHAT HAPPENED, NEWEST FIRST, ACROSS THE PROJECT. Every deploy writes its
     own event -- went live, failed, rolled back, first deploy -- and a
     situation adds the lines a metric writes when it crosses a line. One
     feed for the project rather than a tab per service, filtered by the
     same resource control as the table, which is the observability the
     five questions ask for in one place: what changed, in order. */
  function events() {
    const out = [];
    for (const s of state.services) {
      if (state.kind !== 'all' && s.kind !== state.kind) continue;
      for (const d of s.deploys || []) {
        if (d.status === 'building') out.push({ ago: d.ago, svc: s.id, kind: 'building', text: `${d.commit} redeploying` });
        else if (d.rollback) out.push({ ago: d.ago, svc: s.id, kind: 'undo', text: `rolled back to ${d.commit} by you` });
        else if (d.first) out.push({ ago: d.ago, svc: s.id, kind: 'play', text: `${d.commit} built and scheduled, the first deploy` });
        else if (d.status === 'failed') out.push({ ago: d.ago, svc: s.id, kind: 'ban', text: `${d.commit} failed at the ${d.fail.stage}` });
        else out.push({ ago: d.ago, svc: s.id, kind: 'checkCircle', text: `${d.commit} went live` });
      }
      if (s.first && state.first && state.first.ran) out.push({ ago: 0, svc: s.id, kind: 'checkCircle', text: 'ran once: exit 0 in 4 s' });
    }
    for (const e of state.scenario.events || []) {
      if (state.env === 'staging') continue;
      const s = service(e.svc);
      if (state.kind !== 'all' && s && s.kind !== state.kind) continue;
      out.push({ ago: e.ago, svc: e.svc, kind: e.kind === 'alert' ? 'alert' : 'info', text: e.text });
    }
    return out.sort((a, b) => a.ago - b.ago).slice(0, 8);
  }
  function renderEvents() {
    const box = $('.dc-events', root);
    if (!box) return;
    const list = events();
    /* An empty feed says why it is empty. Datastores are provisioned, not
       deployed, so a feed filtered to them has nothing to show, and a blank
       list there would be the thing this page argues against. */
    const EMPTY = { datastore: 'Nothing here: datastores are provisioned rather than deployed, and write no events.', job: 'Nothing yet: the job has never deployed.', service: 'Nothing has happened to the services yet.', all: 'Nothing has happened yet.' };
    if (!list.length) { box.innerHTML = `<h4 class="dc-h dc-events-h">What happened, newest first</h4><p class="dc-events-empty">${EMPTY[state.kind]}</p>`; return; }
    box.innerHTML = `<h4 class="dc-h dc-events-h">What happened, newest first</h4>
      <ol class="dc-event-list">${list.map((e) => `<li class="dc-event" data-kind="${e.kind}">
        <span class="dc-event-when">${e.ago < 1 ? 'just now' : ago(e.ago)}</span>
        <span class="dc-event-svc">${esc(e.svc)}</span>
        <span class="dc-event-what">${icon(e.kind === 'building' ? 'clock' : e.kind)}${esc(e.text)}</span>
      </li>`).join('')}</ol>`;
  }

  /* Put the keyboard somewhere without throwing the page at it: nothing moves
     if the target is already in view, and otherwise the page travels the
     shortest distance that puts it there. */
  function keep(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest' });
  }

  /* ----- motion ----------------------------------------------------------
   * render() replaces the nodes, so a change reads as a change rather than a
   * substitution only if the script tells the replacement what the thing it
   * replaced looked like. Every function here is gated on the media query
   * and does nothing under it; the page is correct without any of it. */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => REDUCED.matches;
  const tok = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (name) => parseFloat(tok(name)) || 0;

  function flash(el, attr, val = '') {
    if (!el) return;
    el.setAttribute(attr, val);
    const anims = el.getAnimations ? el.getAnimations({ subtree: true }) : [];
    if (!anims.length) { el.removeAttribute(attr); return; }
    Promise.allSettled(anims.map((a) => a.finished)).then(() => el.removeAttribute(attr));
  }

  /* What changed hands: the rows rolled back fill onto the rolled ground,
     the rows undone drain out of it, and the buttons cross-fade wherever
     they appear. */
  function markChange(ids, direction) {
    if (reduced()) return;
    for (const id of ids) {
      flash(root.querySelector(`.dc-table tbody tr[data-service="${id}"]`), 'data-ground', direction);
      for (const b of root.querySelectorAll(`[data-plan="${id}"], [data-undo="${id}"]`)) flash(b, 'data-swap');
      /* THE WORDS THAT CHANGE WITH THE PRESS, NOT ONLY THE BUTTON. The health
         word goes from failing to recovering and the figures from 14% to
         1.1%, and both were cut while the button beside them swapped; a
         state change that is the whole point of the press should read as
         a change wherever it shows. The same swap, on the same clock. */
      flash(root.querySelector(`.dc-table tbody tr[data-service="${id}"] .dc-health-word`), 'data-swap');
    }
    for (const el of root.querySelectorAll('.dc-answer .dc-figure-v, .dc-answer .dc-figure-was, .dc-answer .dc-record, .dc-answer .dc-answer-h, .dc-answer .dc-lead-kicker')) flash(el, 'data-swap');
  }

  let planGen = 0;
  function closePlan(box) {
    const clear = () => { box.hidden = true; box.innerHTML = ''; box.removeAttribute('data-leaving'); };
    if (box.hidden) { box.innerHTML = ''; return; }
    if (reduced()) { clear(); return; }
    if (box.hasAttribute('data-leaving')) return;
    const gen = ++planGen;
    box.setAttribute('data-leaving', '');
    const done = () => { if (gen === planGen) clear(); };
    box.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 600);
  }

  /* Each surface arrives once, when it is on screen; a later render marks it
     shown without replaying. Cleared on a scenario change, because a new
     situation is a new screen. */
  const played = new Set();
  let enterIO = null;
  function watchEnter() {
    if (reduced() || !('IntersectionObserver' in window)) return;
    if (!enterIO) {
      enterIO = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          enterIO.unobserve(e.target);
          played.add(e.target.dataset.enter);
          e.target.setAttribute('data-shown', '');
        }
      }, { rootMargin: '0px 0px 4% 0px' });
    }
    /* A SURFACE ARRIVES ONCE. A key that has played gets NOTHING on its new
       node: an element without data-shown sits at its finished state, which
       is the contract every keyframe here keeps, and setting the attribute
       again on a node that did not exist a frame ago replayed the arrival
       -- every row rising and the card re-arriving on every press, so that
       opening a drawer redrew the table around it. Only a key that has not
       played is watched. */
    for (const el of root.querySelectorAll('[data-enter]')) {
      if (!played.has(el.dataset.enter)) enterIO.observe(el);
    }
  }

  /* A ROW OPENS LIKE A DRAWER, NOT LIKE A CUT. The detail used to appear at
     its full height in one frame while the rows under it were flipped down
     to make room -- two motions for one event, and the panel itself arrived
     rather than opened, which read as a jump. Now the panel's height is the
     animation: from nothing to its measured height on the way in, back to
     nothing on the way out, with the rows beneath following its edge because
     the table lays them out under it on every frame. --motion-move, because
     a drawer travels a short distance, and --ease, because nothing here is
     entering. The contents fade in over the same span rather than rising: a
     rise inside a growing box is a second travel for one event.

     The rows below are NOT flipped for this press: the drawer's growth is
     what moves them, and a flip on top of it would move them twice. Under
     reduced motion the panel is simply there, or gone. */
  function drawer(id, opening) {
    const detail = () => root.querySelector(`#dc-detail-${CSS.escape(id)} .dc-detail`);
    if (reduced() || !document.body.animate) {
      if (opening) state.open.add(id); else state.open.delete(id);
      render();
      return;
    }
    const duration = ms('--motion-move');
    const easing = tok('--ease');
    if (opening) {
      state.open.add(id);
      render();
      const el = detail();
      if (!el) return;
      const h = el.getBoundingClientRect().height;
      el.setAttribute('data-drawer', 'open');
      const a = el.animate([{ height: '0px', paddingTop: '0px', paddingBottom: '0px' }, { height: `${h}px` }], { duration, easing });
      a.finished.then(() => el.removeAttribute('data-drawer'), () => {});
    } else {
      const el = detail();
      if (!el) { state.open.delete(id); render(); return; }
      const h = el.getBoundingClientRect().height;
      el.setAttribute('data-drawer', 'close');
      const a = el.animate([{ height: `${h}px` }, { height: '0px', paddingTop: '0px', paddingBottom: '0px' }], { duration, easing, fill: 'forwards' });
      const done = () => { state.open.delete(id); render(); };
      a.finished.then(done, done);
    }
  }

  /* The table reorders instead of cutting: first, last, invert, play. */
  function flipRows(run) {
    if (reduced() || !document.body.animate) { run(); return; }
    const rows = () => root.querySelectorAll('.dc-table tbody tr[data-service]');
    const before = new Map();
    for (const tr of rows()) before.set(tr.dataset.service, tr.getBoundingClientRect().top);
    run();
    if (!before.size) return;
    const duration = ms('--motion-move');
    const easing = tok('--ease');
    for (const tr of rows()) {
      const from = before.get(tr.dataset.service);
      if (from == null) continue;
      const dy = Math.round(from - tr.getBoundingClientRect().top);
      if (!dy) continue;
      tr.animate([{ translate: `0 ${dy}px` }, { translate: 'none' }], { duration, easing });
    }
  }

  function render(status, tone) {
    const focusKey = document.activeElement && document.activeElement.dataset.focus;
    renderChrome();
    renderProject();
    renderAnswer();
    renderPlan();
    renderTable();
    renderEvents();
    renderSituation();
    if (status !== undefined) renderStatus(status, tone);
    if (focusKey) keep(root.querySelector(`[data-focus="${focusKey}"]`));
    watchEnter();
  }

  /* ----- actions --------------------------------------------------------- */

  function load(scenario) {
    state.scenario = scenario;
    state.services = buildServices(scenario);
    state.sort = { key: 'id', dir: 'asc' };
    state.plan = null; state.rolled = null; state.rolling = null; state.retried = false; state.first = null;
    state.env = 'production'; state.kind = 'all';
    rollGen++; deployGen++;
    state.open = new Set();
    played.clear();
    renderTabs();
    const s = scenario.focus ? service(scenario.focus) : null;
    const n = s && newest(s);
    let status, tone;
    if (!s) { status = 'All live: three services serving their live deploy, two datastores provisioned, nightly-report never deployed. Nothing needs you.'; tone = 'ok'; }
    else if (scenario.id === 'first') { status = `First deploy: ${s.id} has never deployed. Three of the four things it needs were read from the repository.`; tone = 'note'; }
    else if (n.status === 'failed') { status = `A build failed: ${s.id}’s push ${ago(n.ago)} failed at step ${n.fail.step} of ${n.fail.of}. The live deploy is unchanged and serving.`; tone = 'refused'; }
    else { status = `Live, but failing: ${s.id} has been erroring since ${n.commit} went live ${ago(n.ago)}.`; tone = 'read'; }
    render(status, tone);
    if (scenario.then) scenario.then(api);
  }

  /* Open the plan: the preview of what a rollback would change and what it
     would leave. Rolling api back takes worker with it, because the two
     moved in one push and worker calls api; the rule is written here, once,
     and the plan says it in words. */
  function plan(id) {
    const ids = planIds(id);
    if (!ids.length) return;
    state.plan = { ids };
    render(`Previewed above the table. Nothing has moved yet.`, 'note');
    keep(root.querySelector('#dc-plan-head'));
  }

  /* THE ROLLBACK, WRITTEN INTO THE HISTORY. Each service in the plan gets a
     new deploy at the top: the older commit, live again, marked as a
     rollback; the one that was live becomes superseded. The metrics take
     their recovering values, and the record is kept with who, when, from,
     to, and the figures it was decided on. `staged` is a situation setting
     its scene: it renders and does not reach for the reader. */
  /* THE ROLLBACK IS A SEQUENCE, AND THE SCREEN SHOWS IT. The plan promises
     an order and a duration -- api first, then worker, about forty seconds
     each -- and until this the press landed on the finished state in one
     frame, which is a screen breaking its own promise. Now each service in
     turn takes a `building` deploy at the top of its history, its health
     reads "redeploying", and when it lands the rolled ground wipes across
     its row and the next one begins. The figures on the card stay what they
     were until both have landed, because nothing has recovered yet, and the
     record is written and Undo armed only at the end.

     The timescale is compressed and the status line says so: one step is
     two of the site's --motion-enter, about a second, against forty in the
     product. Under reduced motion, or when a situation stages the rollback,
     it jumps to the end state, which is what those readers asked for and
     what the checks measure. `rollGen` is what stops a sequence from landing
     on a screen that has since changed situation. */
  let rollGen = 0;
  function rollback(ids, staged = false) {
    const first = service(ids[0]);
    const from = live(first).commit, to = previous(first).commit;
    const on = `${pct(first.metrics.errors)} of requests erroring over ${span(newest(first).ago)}, p95 ${msec(first.metrics.p95)}, ${service('worker').metrics.failedJobs} failed jobs`;
    state.plan = null;
    if (staged || reduced()) {
      for (const id of ids) land(id);
      finish(ids, from, to, on, staged);
      return;
    }
    const gen = ++rollGen;
    state.rolling = { ids, from, to, on, at: 0 };
    begin(ids[0], to);
    render(`Rolling back ${ids.join(', then ')}. Shown at about forty times speed.`, 'note');
    keep(root.querySelector(`[data-focus="roll:${ids[0]}"]`));
    const step = ms('--motion-enter') * 2;
    const next = (i) => {
      if (gen !== rollGen) return;
      const id = ids[i];
      land(id);
      markChange([id], 'fill');
      if (i + 1 < ids.length) {
        state.rolling.at = i + 1;
        begin(ids[i + 1], to);
        render(`${id} is back on ${to} and serving. Rolling back ${ids[i + 1]}.`, 'note');
        setTimeout(() => next(i + 1), step);
      } else {
        state.rolling = null;
        finish(ids, from, to, on, false);
      }
    };
    setTimeout(() => next(0), step);
  }

  /* One service starts redeploying: a building deploy at the top of its
     history, the live one untouched under it. */
  function begin(id, to) {
    const s = service(id);
    const back = previous(s);
    s.deploys.unshift({ commit: back.commit, msg: back.msg, by: 'you', ago: 0, status: 'building', rollback: true, from: live(s).commit });
  }

  /* It lands: the building deploy is live, the one that was live is
     superseded, and the figures take their recovering values. A service
     that never began (a staged or reduced-motion rollback) begins here. */
  function land(id) {
    const s = service(id);
    const n = newest(s);
    if (!n || n.status !== 'building') begin(id, previous(s).commit);
    const building = s.deploys[0];
    const wasLive = live(s);
    wasLive.status = 'superseded';
    building.status = 'live';
    if (s.metrics.errors != null) s.metrics.errors = 1.1;
    if (s.metrics.p95 != null) s.metrics.p95 = 410;
  }

  function finish(ids, from, to, on, staged) {
    state.rolled = { ids, from, to, at: DATA.project.nowMin + 1, on };
    if (!staged) state.armed = performance.now();
    render(`Rolled back ${ids.join(' and ')} to ${to}, ${ids[0]} first. Recorded at ${clock(state.rolled.at)} with the figures on screen. Undo redeploys ${from}.`, 'ok');
    markChange(ids, 'fill');
    if (!staged) keep(root.querySelector(`[data-focus="roll:${ids[0]}"]`));
  }

  /* THE FIRST DEPLOY, IN ORDER. Four steps, each a beat, then the job is
     live and scheduled; "Run it now" then runs it once. Staged and
     reduced-motion readers land on the deployed state at once. */
  let deployGen = 0;
  function firstDeploy(id) {
    const s = service(id);
    if (!s || !s.first || state.first) return;
    const f = s.first;
    const finish = () => {
      s.deploys.unshift({ commit: f.commit, msg: f.msg, by: f.by, ago: 0, status: 'live', first: true });
      state.first = { step: f.steps.length, done: true, ran: false };
      render(`${id} is live at ${f.commit}, its first deploy. First run at 3:00 am, or run it now.`, 'ok');
      markChange([id], 'fill');
      keep(root.querySelector('[data-focus="deploy"]'));
    };
    if (reduced()) { finish(); return; }
    const gen = ++deployGen;
    state.first = { step: 0, done: false, ran: false };
    render(`Deploying ${id}. Shown at about forty times speed.`, 'note');
    keep(root.querySelector('[data-focus="deploy"]'));
    const beat = ms('--motion-enter');
    const next = () => {
      if (gen !== deployGen) return;
      state.first.step += 1;
      if (state.first.step < f.steps.length) { render(); setTimeout(next, beat); }
      else finish();
    };
    setTimeout(next, beat);
  }
  function runNow(id) {
    if (!state.first || !state.first.done || state.first.ran) return;
    state.first.ran = true;
    render(`${id} ran: exit 0 in 4 s, one report written.`, 'ok');
    markChange([id], 'fill');
    keep(root.querySelector('[data-focus="deploy"]'));
  }

  function undo() {
    const { ids, from } = state.rolled;
    for (const id of ids) {
      const s = service(id);
      s.deploys.shift();
      const back = s.deploys.find((d) => d.commit === from);
      if (back) back.status = 'live';
      const base = DEGRADED_PATCH()[id];
      if (base && base.metrics) s.metrics = { ...base.metrics };
    }
    state.rolled = null;
    render(`Rollback undone: ${ids.join(' and ')} are on ${from} again.`, 'note');
    markChange(ids, 'drain');
  }

  const api = { rollback: (ids) => rollback(ids, true) };

  /* ----- events ---------------------------------------------------------- */

  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-scenario]');
    if (tab) {
      const id = tab.dataset.scenario;
      load(DATA.scenarios.find((s) => s.id === id));
      keep(root.querySelector(`[data-scenario="${id}"]`));
      return;
    }
    if (e.target.closest('[aria-disabled="true"]')) return;
    const menu = e.target.closest('[data-envmenu]');
    if (menu) {
      state.envMenu = !state.envMenu;
      renderChrome();
      const el = root.querySelector(state.envMenu ? '.dc-menu-item[aria-checked="true"]' : '[data-envmenu]');
      if (el) el.focus({ preventScroll: true });
      return;
    }
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      if (nav.dataset.nav === 'env') { state.envMenu = true; renderChrome(); const b = root.querySelector('.dc-menu-item[aria-checked="true"]'); if (b) b.focus({ preventScroll: true }); return; }
      if (nav.dataset.nav === 'logs') { const d = root.querySelector('.dc-log-fold details'); if (d) { d.open = true; keep(d); return; } }
      keep(root.querySelector(nav.getAttribute('href')));
      return;
    }
    const env = e.target.closest('[data-env]');
    if (env) {
      if (env.dataset.env === state.env) { state.envMenu = false; renderChrome(); const b = root.querySelector('[data-envmenu]'); if (b) b.focus({ preventScroll: true }); return; }
      state.env = env.dataset.env;
      state.envMenu = false;
      state.services = buildServices(state.scenario);
      state.plan = null; state.rolled = null; state.rolling = null; state.first = null;
      rollGen++; deployGen++;
      const api = service('api');
      render(state.env === 'staging'
        ? `Staging: every service is serving ${live(api).commit}, ${span(live(api).ago)}, at ${pct(api.metrics.errors)} errors.`
        : 'Production.', 'note');
      const b = root.querySelector('[data-envmenu]'); if (b) b.focus({ preventScroll: true });
      return;
    }
    const kind = e.target.closest('[data-kind]');
    if (kind) {
      state.kind = kind.dataset.kind;
      flipRows(() => { renderTable(); renderEvents(); });
      keep(root.querySelector(`[data-kind="${state.kind}"]`));
      return;
    }
    const density = e.target.closest('[data-density]');
    if (density) {
      state.density = density.dataset.density;
      flipRows(() => renderDensity());
      return;
    }
    const more = e.target.closest('[data-more]');
    if (more) {
      const id = more.dataset.more;
      const fromMap = more.classList.contains('dc-node');
      const opening = fromMap ? true : !state.open.has(id);
      if (fromMap && state.open.has(id)) { keep(root.querySelector(`.dc-table [data-more="${id}"]`)); return; }
      flash(root.querySelector(`.dc-table [data-more="${id}"] .dc-row-chev`), 'data-turn', opening ? 'open' : 'close');
      drawer(id, opening);
      /* From the map, the row is the destination: open it and go there. */
      if (fromMap) keep(root.querySelector(`.dc-table [data-more="${id}"]`));
      return;
    }
    const dep = e.target.closest('[data-deploy]');
    if (dep) { firstDeploy(dep.dataset.deploy); return; }
    const run = e.target.closest('[data-run]');
    if (run) { runNow(run.dataset.run); return; }
    const sort = e.target.closest('[data-sort]');
    if (sort) {
      const k = sort.dataset.sort;
      const flipped = state.sort.key === k;
      state.sort = flipped ? { key: k, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' };
      flipRows(() => render());
      if (flipped) flash(root.querySelector(`[data-sort="${k}"] .dc-sort-icon`), 'data-turn', state.sort.dir);
      return;
    }
    if (e.target.closest('[aria-disabled="true"]')) return;
    const p = e.target.closest('[data-plan]');
    if (p) { plan(p.dataset.plan); return; }
    if (e.target.closest('[data-plan-close]')) {
      state.plan = null;
      render('Nothing moved.', 'note');
      keep(root.querySelector('[data-plan]'));
      return;
    }
    const u = e.target.closest('[data-undo]');
    /* Undo takes the rollback's place under the pointer, so a double press
       would undo what it just did: inert for half a second after the press. */
    if (u) { if (performance.now() - state.armed < UNDO_ARMS_AFTER) return; undo(); return; }
    const r = e.target.closest('[data-retry]');
    if (r) {
      state.retried = true;
      render('A retry builds the same commit and fails on the same line. What has to change is the commit, not the attempt.', 'note');
      /* The press changed one line on the card; the line arrives rather
         than being there, and the button admits it was pressed. */
      if (!reduced()) for (const el of root.querySelectorAll('[data-retry], .dc-fail .dc-answers > div:last-child dd')) flash(el, 'data-swap');
    }
  });

  root.addEventListener('submit', (e) => {
    const form = e.target.closest('.dc-plan-form');
    if (!form) return;
    e.preventDefault();
    if (state.plan) rollback(state.plan.ids);
  });

  /* Tabs: arrow keys move and select, Home and End jump. */
  /* The menu closes on Escape and on a press anywhere outside it. */
  document.addEventListener('click', (e) => {
    if (state.envMenu && !e.target.closest('.dc-crumb--env')) { state.envMenu = false; renderChrome(); }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.envMenu) {
      state.envMenu = false; renderChrome();
      const b = root.querySelector('[data-envmenu]'); if (b) b.focus({ preventScroll: true });
      return;
    }
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

  load(DATA.scenarios[0]);
})();
