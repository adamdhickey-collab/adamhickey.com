# Voice

How the words on adamhickey.com sound, how long they run, and what they may
claim. Read it before writing or rewriting copy on any page, the same way
the four visual specs are read before a change to color, type, spacing or
motion.

This document is normative, and it came out of a comparison rather than a
preference. On 2026-10-21 four of the articles were rewritten as spoken
essays, and they read better than the pages they came from while running
about as long. The difference was the voice and not the length: the pages
stated findings, and the essays thought them through. This page is that
difference written down, so a person or an agent rewriting a page gets the
same voice without having heard the essays.

---

## 1. The voice in one sentence

A designer thinking out loud about work he has actually done: a scene, the
question it raised, what he decided, and what he still isn't sure of, in
short paragraphs a stranger can read standing up.

---

## 2. The moves to make

**Open on a scene or a question, not on the answer.** "For most of my
career, design ended at the handoff" pulls a reader in, and "The designer's
leverage moved upstream" asks them to agree first. The article's dek stays
the answer (section 5); the body under it starts with something happening.

**Say "I think" when it's an opinion.** Findings get stated plainly.
Judgments get owned: "I think," "I suspect," "I'm less sure about." Once
or twice a page, not once a paragraph.

**One idea a paragraph, and no paragraph over 40 words.** That is about
three short sentences. A paragraph that needs a fourth sentence is two
ideas, and the second gets its own paragraph or a figure.

**Put the stakes before the fix.** Say what goes wrong, and how far it
travels, before saying what to do about it. "A bad call used to cost one
screen. Now an agent can repeat it on every screen it builds."

**Argue with yourself once.** Every page that makes a case concedes where
the case runs out: "Visual craft still matters," "A working demo isn't
production software." One concession reads as judgment. None reads as a
pitch.

**Tell your own work as a story.** Lucy hearing the commands, the map the
dispatchers didn't need, the quiet cancel link. A story has a moment where
something went wrong or turned out different from the plan; tell that
moment, not the feature list around it.

**Ask the reader real questions.** The essays ask a dozen each; the pages
they came from asked about three. A question a reader could answer about
their own team does more than a sentence telling them the answer.

**End on something worth keeping.** A question, or one line that could be
quoted on its own. Not a summary of what was just read.

---

## 3. The habits to leave out

These read as machine-written to the hiring managers the site is for, and
the essays that prompted this page are full of them.

| Habit | Rule |
| --- | --- |
| "It isn't X. It's Y." and "Not X, but Y." | Once a page at most. Say Y. |
| Stage-setting lines: "This is where it gets interesting," "That distinction matters enormously," "And perhaps..." | Never. Cut the line and the paragraph still works. |
| Three adjectives in a row: "coherent, useful, trustworthy" | Pick the one that's true. |
| One-line paragraphs in a run | Two in a row at most. One is a beat; five is a drumroll. |
| "Imagine..." as the opener | Once a page, and only for a scene that didn't happen to you. A real one is better. |
| "prose," British spellings, sans italics | Never: plain American, and emphasis is bold. |

---

## 4. What a page may claim

The voice gets more personal; the facts do not get looser.

- **Every figure traces to a case study or a build write-up on this site.**
  A scene made vivid with a number that isn't on the site is invented. The
  spoken essay put "ninety-seven percent" on a dispatcher's screen; the
  article says "high confidence," and that is what the page says.
- **Simulated stays simulated.** Agent Review plays simulated runs and has
  not been tested with anyone. Dispatch Cockpit runs on synthetic data. A
  story about them says so in the sentence that tells it.
- **Current examples only.** Agent Review's first decision is the quiet
  cancel link (#522, #523), not the two reds.
- **Someone else's work is cited, not told as yours.** Ryan Brownlow's Korl
  is his story. One outside source a page, told in a sentence and linked,
  and the page's own example comes first.

### Where each story lives

Each story is told in full once, on its own page, and called back in two
sentences anywhere else, with a link.

| Story | Told in full on | Callback elsewhere |
| --- | --- | --- |
| Lucy hears every command as meant for her | Lucy Learns | The prototype articles |
| The map the dispatchers didn't need | Dispatch case study | Product clarity, the embedded page |
| The quiet cancel link | Agent Review | The design system articles |
| Dispatch Cockpit declines a close call | Dispatch Cockpit, the dispatch prototype | The decision-support articles |
| Forty-plus SAP apps, one standard | SAP case study | Design system pages |
| My sister keeps the guide current | Door County Found | Articles on what can't be generated |

---

## 5. What stays as it is

- **Titles and deks are search answers.** The `<title>` is the buyer's
  question, and the dek under an article's h1 answers it in two or three
  sentences that stand alone (README, Deployment). The voice changes the
  body, not those.
- **About's first sentence is the machine's.** "Adam Hickey is a senior
  product designer in Minneapolis..." says who, what and where in the words
  the JSON-LD Person says, so an assistant can quote it. It is the one
  paragraph the 40-word cap doesn't apply to.
- **Each h2 is one key idea, as a sentence.** `node scripts/keys.mjs
  --write` writes the list and the eyebrows from them, so reword a heading
  and run it in the same commit.
- **Lists are for real lists.** Steps, figures and options stay as lists and
  rails. An argument goes in short paragraphs.

---

## 6. How long

The audit of 2026-10-21 measured every word a reader sees: 46,000 across the
31 reading pages, with 329 of 1,060 paragraphs over 40 words and 81 over 60.
The targets are set in **running text** instead, meaning the paragraphs and
the list items between them. Figure labels, captions, the key-ideas list and
the recap don't count, because they're what a skimming reader reads instead
of the paragraphs. An article with five drawn rails carries about 300 words
of them, and cutting those would make the page longer to read.

| Family | Seen at the audit | Target |
| --- | --- | --- |
| Homepage | 1,391 | about 1,000 seen, which takes a section out, not just shorter sentences |
| Articles | 1,350 to 2,640 | about 700 of running text, five key ideas at most |
| Build write-ups | 1,020 to 2,400 | 1,000 of running text at most |
| Enterprise case studies | 330 to 960 | 600 of running text at most |
| How I work | 1,220 to 1,400 | about 600 of running text |
| Lab and indexes | up to 1,551 | 800 of running text at most |

The pilot is the calibration. "What makes a good product designer now?"
went from 1,007 words of running text to 766 and from 1,557 seen to 1,283,
six key ideas to five, with every figure kept. The homepage's copy came down
by about a hundred words. The rest of its length is cards and labels, and
reaching 1,000 means choosing a section to take out.

A cut that takes a page under its target is fine. A cut that takes out the
one moment where something went wrong has cut the wrong thing.
