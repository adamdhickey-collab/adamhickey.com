# Changes made in the portfolio alignment pass, 2026-10-27

Every edit is copy or markup in existing patterns. No stylesheet changed, no
image was generated or captured, no figure was invented, and no employer,
title or date on the résumé moved. The numbers refer to `01-audit.md`.

## Correctness first

- **Agent Review's designer is unnamed everywhere** (#1, #2). The position
  article and the explain-to-an-agent article said "Alex" and "she"; both say
  "the designer" now, matching #702's case study. The in-app name, Adam, is
  the app's own and is not on the site.
- **The archiving story is canonical; the billing run is named as the second**
  (#3, #4). The position article ("a second simulated run, after the
  archiving story the prototype opens on"), the explain-to-an-agent article
  ("Agent Review's billing run, a second simulated scenario after the
  archiving cycle the prototype opens on"), the agents-join article ("Agent
  Review's billing run, a second simulated scenario") and the writing index's
  dek ("in Agent Review's billing run"). `VOICE.md` section 4 says the same
  and its story table carries both stories.
- **Simulated stays simulated in the sentence that tells it** (#5, #7). On
  the case study, "In the scenario, the review doubled..." and "In the
  simulated sessions... 2 of those 5 sessions". The design-engineer article
  gained "Its scenarios are simulated, and nobody has used it yet."
- **Figures reconciled** (#6, #7, #8, #9, #10, #11, #12): three runs in the
  case study's descriptions; 317 stories; two easing curves; "~25%" on the
  product clarity page; "about a third" in the reading résumé; thirty-eight
  pages in `llms.txt`; Door County Found made with his sister, in `llms.txt`.
- **One unverifiable claim removed** (#13): "client work" from the About
  beat on independent work since RBA.
- **Project maturity** was already stated in plain words on every project
  page; the résumé's two prototype lines now say "one simulated feature" and
  "on synthetic data", and the dispatch line no longer implies dispatchers
  used it.

## Hiring-manager clarity on the homepage

- **The hero line is untouched**: "Software that fits the job and the person
  doing it."
- **The dek** (#22): "Twenty years across visual design, interactive
  development and enterprise product design. I design the systems teams
  build from, build working versions with coding agents, and **decide what
  ships**." Three eras in order, three jobs, AI as the method of the second.
- **At a glance** (#23): the sixth fact is "Visual craft / identity,
  illustration and type, by hand", with a pencil drawn to the row's glyph
  grammar, where "Agent boundaries" was.
- **Selected work** (#26): four enterprise cards two by two on
  `.case-grid--four`, SAP, dispatch, USDA, Innovators Studio, then the lab
  card for Agent Review. The dispatch card is new on the homepage (its
  picture, title and tags; a one-line description); its row came off
  `other.html` and that page's dek no longer mentions it.
- **How I work** (#24): "Four things I do on a product team, each with a
  page of its own."
- **About** (#25): "then enterprise product design at RBA".
- **Contact** (#20, #29): the independent-engagement clause is gone; "remote
  in the US or hybrid in the Twin Cities".
- The résumé stays where it was: a text link after the two hero buttons, in
  Contact, and in the footer.

## How I work, as a member of a product team

On all four pages, in the FAQPage graph and on the page together (#20, #21,
#29):

| Was | Is |
| --- | --- |
| What it asks of the team | What it takes |
| What it leaves behind | What the team has after |
| What does the team need to give? | Who needs to be in it? |
| What does the team leave with? | What does the team have at the end? |
| Is this a role or an engagement? A role, first: ... I also take select independent engagements. | What kind of role is this? A senior product design role where this is the work: in-house, remote in the US or hybrid in the Twin Cities, with a team that can hire in Minnesota. |

The situations, the proof panels, the four steps with their examples, the
"When it is one of the other three" panel, the "On a team" panel and the
closings were already written from inside a team and stayed as they were.

## Case studies, Writing and Lab

- **Role rows** (#19): "Lead UX designer, through RBA" and "Lead product
  designer, through RBA" on the SAP and dispatch case studies; "the lead UX
  designer for two fiscal years, through RBA" in the SAP article.
- **Agent Review** (#36): the status line under the title names the role.
- **Repetition** (#30): the position article's Lucy Learns passage is two
  sentences and a link.
- **Two positioning lines in the test article**: "the team's own support or
  customer success people" where it said "the client's own team", and "a
  working prototype in days, on the team's real inputs where it has them"
  where it said "on real data".
- **American spelling** in four alt texts ("center").
- The three writing groups are unchanged, as is every heading, so
  `keys.mjs --write` moved nothing.

## Résumé (`scripts/resume.mjs`, both PDFs re-rendered)

- Tagline: "Senior Product Designer · Enterprise UX · Design Systems · Visual
  Design · Prototyping in Code".
- Both summaries: the three eras in order and the three verbs, as the hero
  dek. "Interactive development" and "enterprise product design" where it
  said "interactive experiences" and "enterprise software".
- Agent Review: "following one simulated feature from a support ticket to
  what ships". Dispatch Cockpit: "Designed and built a working
  decision-support prototype for AI-assisted load assignment, on synthetic
  data". Reading copy: "two working prototypes on simulated scenarios".
- Reading copy: "about a third". A fourth Selected work line (the dispatch
  cockpit) was tried and put the page 65px over; it stays at three.
- Employers, titles, dates, clients and every figure are unchanged. Both
  render at 1056px of 1056, with Chromium from this container and the fonts
  from Google Fonts.

## Records

- `llms.txt`: the summary line, the How I work paragraph, the page count
  twice, the Built end to end line, the homepage line (four case studies,
  then Agent Review) and the Other things line.
- `README.md`: one sentence on the homepage's Selected work order.
- `VOICE.md`: the current-examples rule and the story table.
- `sitemap.xml` and the `dateModified` stamps: `seo.mjs --write` moved 23
  stamps, the pages edited here plus pages whose last squash-merge date had
  passed their stamp.
- `readtime.mjs --write`: every label held; 27 read times.
