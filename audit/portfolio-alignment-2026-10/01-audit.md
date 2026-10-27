# Portfolio alignment audit, 2026-10-27

Every public page of adamhickey.com, read as rendered (each page loaded in
Chromium at 1440 with reduced motion, body text dumped and read whole), plus
`llms.txt`, `scripts/resume.mjs` and the two PDFs it renders. Thirty-eight
pages. The positioning the audit reads against: Adam is a senior product
designer with about twenty years across visual design, interactive
development and enterprise product design (thirteen at RBA, eight before that
in Minneapolis studios, the last five at Pixel Farm). Visual craft, enterprise
UX, systems thinking, hands-on building and judgment. AI is part of how he
works and not his identity. He is not a developer and not a consultancy, and
he wants a senior IC product or UX role, remote in the US or hybrid in the
Twin Cities.

Each finding carries a priority, the page, the words as rendered, and what
was done about it in this pass (`02-changes.md` has the edits in full;
`04-consistency.md` has the open questions).

## P1. Correctness: status, names, figures

| # | Page | As rendered | Problem | Done |
| --- | --- | --- | --- | --- |
| 1 | `writing/what-makes-a-good-product-designer-now.html` | "Alex, the designer in the scenario, can" / "She refuses the variant... Then she writes a rule" | #702 took the designer's name out of the Agent Review case study on purpose; the position article still named Alex, and in a different gender from the app's own Adam | Fixed: "the designer" |
| 2 | `writing/what-a-design-system-needs-to-explain-to-an-agent.html` | "Alex, the product designer on billing" / "Alex chooses the second... Her reason" / "Alex keeps hers" | Same | Fixed, three places |
| 3 | Same three articles and `writing/index.html` | "In Agent Review... a simulated job moves billing screens onto the design system"; "Agent Review's simulated run has a small version of the same gap"; "worked through a hand-built cancel link in Agent Review" | The cancel link is told as Agent Review's story. Since 2026-10-26 the case study, the prototype's first screen and the homepage card follow archiving customers in Relay; the billing run is a second, older simulated run and nothing in the articles said so | Fixed: each telling names it as the second simulated run after the archiving cycle |
| 4 | `VOICE.md` section 4 | "Agent Review's first decision is the quiet cancel link (#522, #523)" | The copy spec itself still named the old example as current | Fixed; the story table has both stories with their homes |
| 5 | `lab/agent-review.html` | "The review doubled the operations lead's quarterly cleanup" (stage 4 call, and the Evaluate paragraph); "in 2 of 5 sessions someone archived an active customer" | Simulated findings in the same register as the real experiment's number row. The "simulated" label sits at the top and the foot of the page and not in these sentences, which VOICE.md asks for | Fixed: "In the scenario" / "In the simulated sessions" / "2 of those 5 sessions" |
| 6 | `lab/agent-review.html` head | description: "two Claude Code runs... with twelve design rules and without" | Body says 3 runs ("then planted mistakes in a third"); `llms.txt` says three | Fixed in the meta, Open Graph and JSON-LD descriptions |
| 7 | `writing/what-does-a-product-design-engineer-actually-do.html` | "fourteen components and 284 stories" | Case study says 317. The article never says the scenarios are simulated | Fixed to 317; one sentence added: simulated, nobody has used it |
| 8 | `writing/what-makes-an-interface-feel-finished.html` | "6 durations and one curve"; "one easing curve and six durations" | `--ease-enter` and `--ease-linear` both exist; the this-site write-up and the design system page say two | Fixed: two |
| 9 | `engagement/product-clarity.html` | "25% / roughly, off wrong-vehicle dispatches" | The dispatch case study says "roughly a quarter" and its disclosure says the counts are small; the large figure stated a precision the source disclaims | Fixed: "~25%", the form the USDA figures on the embedded page use |
| 10 | `Adam Hickey Resume.pdf` (reading copy) | "a third less design-to-development time" | Every other copy of the figure says "about a third"; the reading copy is meant to be a cut of the detailed one, never sharper | Fixed |
| 11 | `llms.txt` | "lists all thirty-four pages"; "thirty-four pages of plain HTML" | 38 pages since #456; `counts.mjs` holds only the "eleven checks" sentence in this file | Fixed. `README.md` lines 138 and 668 say thirty-four too; left, it is not public and the file is mostly history |
| 12 | `llms.txt` | "Products designed, built and illustrated alone" | Door County Found's role row: "Identity and editorial with my sister Elizabeth, whose idea it was" | Fixed |
| 13 | `index.html` About | "two products in use, a print studio's production line, client work and a lab" | No page on the site shows independent client work since RBA, and the résumé's independent entry lists none | "client work" removed; open question in `04-consistency.md` |
| 14 | `case-study/while-were-here.html` | "Of the 174 images, 95 are photographs I took and seventeen more are archive or original artwork. Fourteen are generated" | 95 + 17 + 14 = 126; 48 of 174 unaccounted for on the page | Open; cannot be verified from this repository |
| 15 | `case-study/enterprise-consulting.html` | "Unified intranet for 140,000+ global employees" (CBRE) | The one number on the page with no case study or disclosure behind it; a client-size figure rather than a result | Open; flagged |
| 16 | `engagement/design-system-foundation.html` | "More recently, Sprout, a design system for Cargill: its tokens live in the code, and the Figma variables mirror them under a written sync contract" | No page on the site describes Sprout; the page's own framing line ("Every figure is from the case study it sits beside") does not cover it. See the Sprout section below | Open; flagged, kept |
| 17 | `case-study/this-site.html` | "512 commits, 331 pull requests" | No commit named, unlike the sweep figures; the cloud clone is shallow, so it cannot be recounted here | Open |
| 18 | `scripts/resume.mjs` | "Intel" among organizations and clients | Intel appears on the site only as a homepage logo; no page names Intel work | Open; the résumé's own comment allows only Banner Bank and International Trucks beyond the site |

Project maturity, as rendered, was already plain in most places and is now
plain everywhere a project is named:

| Project | Maturity, in the site's words | Where it says so |
| --- | --- | --- |
| SAP, USDA, Innovators Studio, dispatch | Shipped client work, with measured results and a "How I measured this" disclosure per figure | The four case studies |
| Door County Found | Live, public, kept current by its editor | Write-up: "The guide is public and my sister keeps it current" |
| Lucy Learns | In use in one household; the next version not built | Write-up status row: "In use. The next version, a teleprompter, isn't built yet" |
| Faunaform | In progress; nothing printed | Write-up kicker "In progress", status row, every simulation captioned |
| While We're Here | Complete draft, not press-final | Status row |
| This site | Live | Status row |
| Agent Review | Working prototype, simulated scenarios, not tested with users | Homepage card ("a working prototype"), lab index ("Its scenarios are simulated"), case study status line and close, résumé ("one simulated feature"), now the design-engineer article too |
| Dispatch Cockpit | Working prototype on synthetic data, not tested with dispatchers | Its page's kicker and context row, lab index, résumé (now "on synthetic data") |
| Designing motion | Exploration | Lab index tag and kicker |

## P2. Positioning: consultant, packages, agent-as-identity

| # | Page | As rendered | Problem | Done |
| --- | --- | --- | --- | --- |
| 19 | `case-study/sap-product-maturity.html`, `case-study/dispatch-complexity.html` | "My role: Lead UX design consultant" / "Lead product design consultant" | The role row is a fact and stays one; "consultant" is the one word a hiring manager reads as a permanent commitment to consulting (the enterprise-consulting page's own note, 2026-10-23) | "Lead UX designer, through RBA" / "Lead product designer, through RBA". The SAP article's "lead UX design consultant" the same way |
| 20 | Four `engagement/*.html` pages | FAQ: "Is this a role or an engagement? A role, first... I also take select independent engagements"; `index.html` Contact: "or a select independent engagement"; `llms.txt`: "Also available for select independent engagements" and "The same work is also on offer as an independent engagement" | Two identities on one site | Removed everywhere. Recorded as a decision to confirm in `04-consistency.md`, since Adam chose "A role, first" deliberately |
| 21 | Four `engagement/*.html` pages | Fact strip: "What it asks of the team", "What it leaves behind"; FAQ: "What does the team need to give?", "What does the team leave with?" | The shape of a package: what the client supplies, what the vendor leaves behind | "What it takes", "What the team has after", "Who needs to be in it?", "What does the team have at the end?", "What kind of role is this?", in the graph and on the page together. The steps, the "On a team" panel and the closings already spoke as a team member and stayed |
| 22 | `index.html` hero | "I design the system people and coding agents build from, and decide what ships" | The agent is the subject of the identity sentence, bolded | "Twenty years across visual design, interactive development and enterprise product design. I design the systems teams build from, build working versions with coding agents, and decide what ships." The bold is on the judgment |
| 23 | `index.html` at-a-glance strip | "Agent boundaries / what it does alone, what a person decides" beside "Prototypes / working ones, built with coding agents" and "Design systems / that people and agents build from" | Two of six facts named agents; visual craft, the thing the Innovators Studio identity, the Lucy Learns illustration and the Door County Found brand put on the page, was not in the row | Sixth fact is "Visual craft / identity, illustration and type, by hand". The agent's line stays on the lab card and in "decide what ships" |
| 24 | `index.html` How I work | "Four things I've done for twenty years" | "Build to find out... with coding agents" is 2026 work | "Four things I do on a product team" |
| 25 | `index.html` About | "after twenty years of studio design and development, then enterprise consulting" | The machine-quotable sentence named consulting as the second career | "then enterprise product design at RBA" |
| 26 | `index.html` Selected work | SAP, USDA, Innovators Studio, then the lab card; dispatch filed on `other.html` since 2026-10-26 | The task asked for the established work to lead as a set: SAP, dispatch, USDA, Innovators Studio | Four cards two by two on the existing `.case-grid--four`, dispatch second; its row left `other.html`. **This reverses a call Adam made on 2026-10-26** (dispatch "reachable but not easy to reach"); one edit puts it back, see `04-consistency.md` |
| 27 | `writing/what-does-a-product-design-engineer-actually-do.html` | "A design engineer is a designer whose deliverable is the thing itself, in the repository" (title, pull, recap) | A job-title argument in the first person, against the positioning. It is unlisted since 2026-10-08 and reachable only by Next and Related links | Left as it is; the simulated line and the story count were fixed. Recommended: keep unlisted, or retitle toward the product designer who works in the codebase |
| 28 | `writing/index.html` and eight article titles | "AI" or "agent" in eight of fifteen titles; "How I Run Usability Testing with AI" as the test article's `<title>` | The titles are search phrases by design (README, Deployment) and were not changed; worth knowing that the family reads AI-first from a search result | Left; flagged |
| 29 | `index.html` Contact, four engagement closings, `llms.txt` | "remote or hybrid in the Twin Cities" | The target is remote in the US or hybrid in the Twin Cities; "remote" without a country reads as anywhere | "remote in the US or hybrid in the Twin Cities" |

## P3. Repetition and machine-written copy

The whole writing family was read against VOICE.md. The story table in
section 4 says each story is told in full once and called back in two
sentences elsewhere. As rendered:

| # | Story | Told in full on | Also told at length on | Done |
| --- | --- | --- | --- | --- |
| 30 | Lucy hears every command | Lucy Learns write-up | Position article, three paragraphs (not a prototype article); `what-should-a-working-prototype-actually-prove`, four paragraphs | Position article cut to two sentences and the link. The prototype article is within VOICE.md's allowance for prototype articles; left |
| 31 | The quiet cancel link | Agent Review, after the cycle (two paragraphs) | `what-a-design-system-needs-to-explain-to-an-agent`, about twelve paragraphs across three key ideas; position article, four paragraphs; `what-changes-when-ai-agents-join-the-product-team`, two plus one | Every telling now says it is the second run. The explain-to-an-agent article is built on it and would need a rewrite to move it; left for the family's VOICE.md pass |
| 32 | Forty-plus SAP apps | SAP case study | `writing/standardizing-ux-across-40-sap-fiori-apps` is a second full telling, with four sentences verbatim from the case study | Unlisted since 2026-10-20; left |
| 33 | The dispatchers' map | Dispatch case study | `designing-for-the-moment-the-workflow-breaks` (four dispatch callbacks) and the test article, both reusing "they knew every location code by heart" | Left; one is unlisted |
| 34 | The two-runs experiment | Agent Review case study | Four articles draw three different conclusions from the same result | Left; flagged for the family pass |
| 35 | Sentences repeated across pages | | "I started in 2005 as a hybrid designer and developer" (two articles); "An approve button isn't oversight" (two); "A rule written wrong now repeats on every screen" (two, one with a figure); "Disabled is quieter, not lighter" (two); "It looked unchanged..." (three pages) | Left; listed for the family pass |

Machine-written habits, per VOICE.md section 3, read across every article:

- **"It isn't X. It's Y."** is over the once-a-page line on every article, and
  on several it is the h2 itself, which `keys.mjs` locks to the list and the
  eyebrows. Heaviest: `who-decides-when-software-can-act-on-its-own` (six or
  more), `how-should-you-test-a-product-now-that-ai-can-help` (six or more),
  `what-is-a-product-designer-for-when-anyone-can-build` (four).
- **Stage-setting lines** on eight articles ("Here's an illustration.", "The
  lesson is the order.", "The exit is where the judgment shows.").
- **"Imagine" and "Picture" openers**: three on `who-decides...`, two on
  `what-changes...`; the invented failed-order scenario opens three articles.
- **Runs of one-line paragraphs**: four in a row on
  `what-does-a-design-system-need-once-ai-is-in-the-product` key idea 3; the
  test article ends every section on a one-line aphorism.
- **British spelling reaching readers**: "centre" in alt text on two articles.
  Fixed.

None of the rest was rewritten in this pass. The site is being rewritten to
VOICE.md one family at a time, and the position article is the only writing
page rewritten so far; the list above is the brief for the writing family's
turn.

## P4. Clarity and small things

| # | Page | As rendered | Note | Done |
| --- | --- | --- | --- | --- |
| 36 | `lab/agent-review.html` | Role, built-with, size and tests sit at the foot; the hero says only "I designed and built it" | Problem and evidence are up front; the role was not | The status line under the title now names the role |
| 37 | `lab/index.html` | Kicker "Lab · two pieces" over four rows | The source comments say the exploration is deliberately not counted as a piece and the intro article is not one either; a reader sees four | Left, deliberate; worth a plainer kicker |
| 38 | `index.html` lab card | The cycle-card picture is three solid white screens | The markup comment says these are placeholders until the app's new skin lands (agent-review#58 went dark on 2026-10-27) | Image brief, below; no capture from here |
| 39 | `engagement/working-product-prototype.html` | `<title>` "AI Product Prototyping and Validation" | The search phrase, by design; AI-first in a result list | Left |
| 40 | `case-study/hybrid-designer.html` vs résumé | Page: three studios, 2005-2013, "Interactive designer / developer"; résumé: ByDesign "Design Intern" 2004-2006 | The page counts ByDesign as a studio in a designer role from 2005; the résumé has an internship from 2004. Dates were not changed | Open question |

### Image briefs (no images generated or captured in this pass)

- **Homepage Agent Review card** (`img/lab/agent-review-cycle-card.webp`,
  drawn by `scripts/cycle-card.mjs`): the three screens are placeholders.
  Once the prototype's new skin is final, re-run `cycle-card.mjs` on the Mac
  so each screen is the prototype's own archive direction under its one
  label, and bump `?v=`.
- **Dispatch card on the homepage** reuses `img/site/dispatch-hero-01.webp`
  at the cards' 1672x941, the capture `other.html` carried. It is the case
  study's own hero, so nothing is stale; if the four cards want one hand,
  the SAP and USDA captures are the pair to match.

## Sprout: is there a case study in it?

What the site holds about Sprout, in full: one sentence on the design
system page under How I work ("More recently, Sprout, a design system for
Cargill: its tokens live in the code, and the Figma variables mirror them
under a written sync contract"), the line after it ("The whole system is also
a Claude Code skill, so the team's AI tools build from the same source the
people do"), a Cargill wordmark on the homepage strip, Cargill in the
résumé's client list, and one comment in `design-system/ds.css` saying the
site's reference page is organized the way Sprout is.

That is not enough for a case study, and nothing was invented. What a Sprout
case study would need before it could be written to the standard of the four
client ones:

1. **The client, the team and Adam's role**, in words the client has agreed
   can be public: whether this was RBA work or independent, the dates, who
   decided what.
2. **The situation before**: how many products, how many versions of the same
   component, who was building and with what.
3. **The decisions**: what went shared and what stayed local, how the sync
   contract between code and Figma variables is written, who owns a change.
4. **Evidence**: adoption, time saved, defects, anything measured, with how it
   was counted, or an explicit statement that nothing was measured yet.
5. **Pictures the client allows**: components, the token sheet, the Figma
   variables, the skill file, at the sizes the case studies print.
6. **Where it sits**: a fifth client case study, or the "Where it has worked"
   proof on the design system page, which is where its one sentence is now.

Until those exist, the one sentence should stay a sentence, and its page
should stop saying every figure beside it comes from a case study; the
sentence carries no figure, so the line is true as written but reads as a
promise.
