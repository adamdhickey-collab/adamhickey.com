# Site audit

Every page of the site as it stood at the archived commit (8e15228,
2026-10-26), with one decision each: **rebuild**, **rewrite**, **retain**
with minor changes, **demote**, or **redirect** out of active navigation.
The reasoning behind the decisions is `positioning.md`; what was done on
each page is `content-decisions.md`.

## The homepage and the shell

| Page | Was | Decision |
| --- | --- | --- |
| `index.html` | Product design for complicated software; six proof facts; three enterprise accounts, then an AI-agent card; four "How I work" cards; four built products; About told as craft, systems, agents | **Rebuild.** New flow: headline, a large introduction to the work, the flagship, Innovators Studio, the other projects, What I bring, a short career intro, contact |
| The header, all pages | Work, How I Work, Writing, Lab, About, Contact | **Rewrite.** Work, Approach, About, Writing, Experiments, Contact; the wordmark and its reveal kept as they are |
| The footer, all pages | "Senior Product Designer · Strategy, UX, Systems, Prototyping, Build" | **Rewrite** to the new role and the three words of the work |

## Case studies

| Page | Was | Decision |
| --- | --- | --- |
| `case-study/innovators-studio-visual-identity.html` | A global innovation network on one brand and platform; on Tailwind; reached from the shelf on `other.html` and nowhere on the homepage | **Rebuild** as the key credibility piece, on the storytelling system; prominent on the homepage and in Work |
| `case-study/door-county-found.html` | A technical build write-up: structured data, Astro, Pages CMS | **Rewrite** as an editorial travel brand; the technology summarized near the end |
| `case-study/lucy-learns.html` | Three tries at a session screen, with the AI tooling and feature history prominent | **Rewrite** around visual communication with attention on the dog; the same facts, a new hierarchy |
| `case-study/hybrid-designer.html` | Eight years as a hybrid designer and developer, a list of eight projects on Tailwind | **Rebuild** as the studio years, work shown large, on the storytelling system |
| `case-study/enterprise-consulting.html` | Thirteen years of enterprise software | **Retain** with the framing moved to visual coherence and a shared design language |
| `case-study/sap-product-maturity.html` | 40+ apps on one design system | **Retain**; reframed as coherence, hierarchy and consistency at scale; the numbers and caveats kept |
| `case-study/usda-operational-overhead.html` | Grant tools unified into one platform | **Retain**; reframed as clarity and communicating complex information; depth rather than the first impression |
| `case-study/dispatch-complexity.html` | One real-time view of a 450+ truck fleet | **Retain**; the same |
| `case-study/faunaform.html` | A print studio built with an image model and tooling | **Rewrite** the emphasis: visual experimentation, art direction, composition and physical craft lead; status and AI involvement disclosed as before |
| `case-study/while-were-here.html` | A book produced from HTML and CSS | **Rewrite** the emphasis: editorial design and storytelling; the build is optional detail |
| `case-study/this-site.html` | How this site is built | **Retain** with the positioning sentences updated; every counted sentence kept |
| `case-study/say-when.html` | Did not exist | **New.** The flagship: a self-initiated, fictional coffee brand, labeled so throughout |

## How I work, the lab, the prototypes

| Page | Was | Decision |
| --- | --- | --- |
| `engagement/product-clarity.html` | Turn ambiguity into a decision | **Redirect** to `index.html#approach` |
| `engagement/design-system-foundation.html` | Build the system everyone builds from | **Redirect** to `index.html#approach` |
| `engagement/embedded-senior-product-design.html` | Own the design inside the team | **Redirect** to `index.html#approach` |
| `engagement/working-product-prototype.html` | Build to find out | **Redirect** to `index.html#approach` |
| `lab/index.html` | The lab: design systems for humans and agents | **Rewrite** as Experiments |
| `lab/agent-review.html` | Where design judgment goes when coding agents join the team | **Demote** to Experiments; kept whole; a line says it comes from an earlier focus |
| `lab/designing-motion.html` | Designing motion with Claude Code | **Retain** under Experiments |
| `prototype/dispatch-cockpit.html` | The dispatch cockpit prototype | **Retain** under Experiments |
| `say-when/*` | Did not exist | **New.** The storefront prototype: home, collection, three products, the finder, a simulated checkout |

## Writing

| Page | Was | Decision |
| --- | --- | --- |
| `writing/index.html` | Ten articles in three collections: the system, the build, the judgment | **Rewrite** the index around craft and judgment, designing in working software, and an earlier focus on agents and governance |
| The sixteen articles | Essays on product design, design systems and AI agents | **Retain**, historically accurate, every address kept; closing links that pointed at the engagement pages re-pointed |

## Reference and the rest

| Page | Was | Decision |
| --- | --- | --- |
| `other.html` | The book and the identity shelf | **Rebuild** as the full work index |
| `design-system/index.html` | The site's design system reference, unlisted | **Retain**; it reads its values live from the stylesheets, so the new pair and accent show without an edit; its prose about the old faces is historical |
| `404.html` | The miss page, linking the four engagements | **Retain** with the links moved to Approach |
| `Adam Hickey Resume.pdf`, `(detailed).pdf`, `scripts/resume.mjs` | Senior product designer, enterprise-led | **Rewrite** for senior digital, visual and interactive roles; titles, employers, dates and accomplishments unchanged |
| `llms.txt`, the share cards (`scripts/og.mjs`), JSON-LD on every page | Product design for complicated software | **Rewrite** to the new positioning |

## Contradictions removed

The old positioning lived in the footer line, the résumé summary, the
Person's `jobTitle` and `knowsAbout`, the articles' closing lines, the
engagement pages' CTAs, the lab card on the homepage and `llms.txt`. Each
is in the tables above with where it went.
