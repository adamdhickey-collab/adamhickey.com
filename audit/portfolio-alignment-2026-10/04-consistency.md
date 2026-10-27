# Canonical facts and open questions, 2026-10-27

The facts every surface should agree on, where each is held, and the
questions this pass could not settle from the repository alone. "Held by"
names the check that fails if the fact drifts; "by hand" means nothing does.

## Canonical facts

| Fact | Canonical wording | Lives on | Held by |
| --- | --- | --- | --- |
| Title | Senior Product Designer | Hero eyebrow, footer, About's first sentence, JSON-LD Person, both résumés | `seo.mjs` (Person), the rest by hand |
| The line | Software that fits the job and the person doing it. | Hero h1, share card, `llms.txt`, both résumés | `og.mjs` registry by hand |
| The three eras | Visual design, interactive development, enterprise product design; craft 2005, systems 2013, agents 2026 | Hero dek, About beats, position article's rail, résumé summaries | By hand |
| Years | Twenty years (2005–2026); eight across three studios, the last five at Pixel Farm; thirteen at RBA (2013–2026) | About, the two career pages, résumé | By hand |
| Employers and dates | ByDesign 2004–2006 (intern), LEVEL Jan 2006–Jan 2008, Pixel Farm Jan 2008–Apr 2013, RBA 2013–2026, independent 2026– | `scripts/resume.mjs` | By hand; the résumé is the source of truth |
| What he wants | A senior product design role, in-house, remote in the US or hybrid in the Twin Cities, with a team that can hire in Minnesota | Contact, four How I work closings and FAQs, `llms.txt`, résumé contact line ("Remote or hybrid") | `seo.mjs` holds each FAQ answer to its page |
| Featured work order | SAP, dispatch, USDA, Innovators Studio, then Agent Review | Homepage Selected work, `llms.txt`, LinkedIn draft | By hand |
| Agent Review | A working prototype in React and Storybook; simulated scenarios; not tested with users; the story is archiving customers in Relay through six stages; the quiet cancel link is a second, older simulated run on the billing screens | Case study, lab index, homepage card, `VOICE.md` section 4, résumé, the three design-system articles | `counts.mjs` for the experiment's figures; the rest by hand |
| Agent Review's designer | "the designer"; never Alex; Adam is the in-app name only | Case study (#702), articles | By hand |
| Dispatch Cockpit | A working prototype on synthetic data, informed by the dispatch cockpit led at RBA, not a reproduction, not tested with dispatchers | Its page, lab index, résumé, the decision-support articles | By hand |
| The independent products | Door County Found (live, kept current by Elizabeth, whose idea it was; identity and editorial with her); Lucy Learns (in use in one household; teleprompter not built); Faunaform (in progress, nothing printed); While We're Here (complete draft, not press-final); this site (live) | Each write-up's status row, homepage Built end to end, `llms.txt` | By hand |
| SAP figures | 40+ apps, two fiscal years, about a third less design-to-development time, production UI defects roughly halved quarter over quarter, training time cut in half (the training team's figure), NPS up roughly 20 points | SAP case study with its disclosure | `counts.mjs` where quoted in the specs; by hand elsewhere |
| USDA figures | Eight months; 45–55 hours to just over 10; validation time roughly halved; grantees nearly doubled without adding analysts; 135+ grantees, 200+ grants, 200,000+ page requests a week, 450,000+ metrics a year | USDA case study with its disclosure | By hand |
| Dispatch figures | 450+ vehicles, 50 drivers per dispatcher; board-clearing roughly 30%; wrong-vehicle dispatches roughly a quarter fewer (small counts: direction over size) | Dispatch case study with its disclosure | By hand |
| Innovators Studio figures | Four fiscal years; campaign production time roughly halved (small sample) | Its case study with its disclosure | By hand |
| Site size | 38 pages, 3 token files, 4 specs, 34 scripts, 11 checks (5 static, 6 browser), 27 read times, 81 graph nodes | this-site write-up, `llms.txt`, README | `counts.mjs`, `seo.mjs`, `readtime.mjs` |
| Motion | Six durations, two curves (`--ease-enter`, `--ease-linear`) | this-site write-up, design system page, interface article | `tokens.mjs` for the names; the count by hand |
| Hedges on figures | "about a third", "roughly half", "roughly 30%", "roughly a quarter" / "~25%"; never the bare number | Everywhere a figure is called back | By hand |

## Open questions, for Adam

1. **Dispatch on the homepage.** This pass put the dispatch case study back
   as the second of four Selected work cards, because the task asked for the
   established work to lead as SAP, dispatch, USDA, Innovators Studio. On
   2026-10-26 you asked for it filed on `other.html`, reachable but not easy
   to reach. If that call stands, the revert is: delete the dispatch `<a
   class="case-card">` from `index.html`, set the grid back to
   `case-grid--three`, restore the `.other-feature` block and the dek on
   `other.html` from the commit before this branch, and fix the two lines in
   `llms.txt`.
2. **Independent engagements.** "I also take select independent engagements"
   came off the four How I work FAQs, Contact and `llms.txt`, for one
   identity. You wrote "A role, first" deliberately. If you want the door
   kept open, the shortest honest line is one sentence in Contact only.
3. **"Client work" since RBA.** Removed from About because no page shows it.
   If Sprout for Cargill is independent work, that is the sentence to put
   back, and the Sprout page in `01-audit.md` is what it would take.
4. **Sprout and Cargill.** Was it RBA work or independent, and what may be
   public? Until there is a page, the one sentence on the design system page
   stays a sentence.
5. **ByDesign: 2004 intern, or 2005 studio?** The résumé has "Design Intern,
   2004 – 2006"; the hybrid-designer page counts "three Minneapolis studios"
   from 2005 under "Interactive designer / developer". Both left as they
   were. One of them should give.
6. **Intel.** On the homepage strip and in the résumé's client list; no page
   names the work. A line on the enterprise-consulting page, or off the list.
7. **While We're Here's 174 pictures.** 95 photographs, 17 archive or original
   artwork, 14 generated: 48 are not accounted for on the page. Diagrams?
   Type-only spreads? The page should say.
8. **CBRE's 140,000+ employees.** The one unsourced number on the
   enterprise-consulting page. A public figure, probably; worth a word on
   where it comes from, or cut.
9. **"512 commits, 331 pull requests"** on the this-site write-up has no
   commit named and cannot be recounted from a shallow clone. Date it the
   way the sweep figures are dated, or register it in `counts.mjs`.
10. **The design-engineer article.** Unlisted, and the one page on the site
    that argues a job title against the positioning. Keep it unlisted, or
    retitle and reframe it as the product designer who works in the
    codebase.
11. **Eight of fifteen article titles name AI or agents**, by design, as
    search phrases. The family reads AI-first from a result list. Worth a
    look at Search Console before changing any of them.
12. **The lab kicker** says "two pieces" over four rows, deliberately. A
    kicker that counts what the reader sees would be plainer.
13. **The writing family's VOICE.md pass** has a brief now (`01-audit.md`,
    P3): the repeated stories, the "It isn't X. It's Y." count per page, the
    stage-setting lines, the three "Imagine" openers on one page, the
    one-line runs, and the two full retellings on unlisted pages.
14. **The homepage lab card picture** is placeholder white screens until the
    prototype's new skin is final; `scripts/cycle-card.mjs` on the Mac.
