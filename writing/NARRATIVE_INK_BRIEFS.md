# The Shift: illustration briefs

One brief per replacement, in series order, for the Narrative Ink Panorama
system ([NARRATIVE_INK_PANORAMA.md](NARRATIVE_INK_PANORAMA.md)). Each says
what the lesson argues, what the picture must show to carry that argument,
and where the accent goes. File names follow the spec's pattern; current
paths and sizes are in [NARRATIVE_INK_MANIFEST.md](NARRATIVE_INK_MANIFEST.md).

Three rules hold across every brief:

- **The scene keeps its subject.** Each lesson's caption and alt already
  describe a person and a moment, and the copy leans on them ("The
  dispatcher is the only thing joining the three screens."). The redraw
  changes the hand, not the story, so the words stay true.
- **The hero is the argument at a distance.** It is the one picture with
  room for a whole system, so it shows the lesson's claim as a panorama:
  many small parts, one focal mass, and the accent on the turn.
- **Icons are objects, not ideas.** Each row's icon is the plainest object
  its label names, so it reads at 48 px.

---

## Series landing and share cards

**Chapter emblems** (`chapter{N}-emblem.webp`, 1280 x 720, alpha). Keep the
four objects the landing already uses, since the chapter bands and mosaic
are built around them, redrawn as engraved objects with a small working
world inside or around each:

| Chapter | Object | The world in it | Accent on |
| --- | --- | --- | --- |
| 1, sage | a drafting compass, legs wide, drawing an arc too big for the frame | tiny desks and people along the arc, as if the arc were the path of a working day | the arc |
| 2, slate | an open pocket watch, gears meshed | the gears are rooms: a library, a switchboard, a toolroom, one small figure at the center gear | the one gear the figure stands on |
| 3, terracotta | a clipboard with three ticked boxes and a fourth empty | a small team at a table drawn on the sheet, one hand reaching for the fourth box | the fourth box |
| 4, plum | an open toolbox | its trays hold a kitchen, a café table, a research room in miniature | the hand lifting one tool out |

Replace all four in one change; the mosaic never shows one tile in a
different hand.

**Share cards** (`chapter{N}-share.webp`, 1600 x 900, on paper): the
chapter's emblem object at panorama scale, set to the right third so
`og.mjs`'s title has open paper on the left. Re-run `node scripts/og.mjs`
after.

---

## Chapter 1: The job is changing (sage `#657D60`)

The accent is the thread a person's job runs along.

### Lesson 1. What changes when you design the task instead of the app?

*Argument:* nobody does their job in one app; start from the moment of the
decision, and the tools line up behind the job. **Pilot: these three come
from the bundle, not from these briefs.** They are recorded here so the
pilot can be judged against them.

- **Hero** `chapter1-lesson1-hero`: a panorama of a freight yard and the
  city around it, trucks, depots, clocks, and order sheets scattered across
  the planes, all connected by one sage thread that runs through a single
  small dispatcher's desk at the focal point. Accent: the thread.
- **Scene** `chapter1-lesson1-dispatcher`: the dispatcher at three monitors,
  phone on her shoulder, copying a number from one screen onto a notepad.
  The three screens are hatched blocks (map, hours, orders), not UI. Accent:
  the notepad, the one place the three meet. Keeps the caption true.
- **Concept** `chapter1-lesson1-human-decision`: three separate tools (a
  truck, a clock, a list) lined up behind one decision, a hand resting on a
  single card at the end of the line. Accent: the card.

### Lesson 2. What is UX for when agents build the software?

*Argument:* a factory can build the wrong thing perfectly; deciding what's
worth building and judging what got built still take people.

- **Hero** `chapter1-lesson2-hero`: an enormous, orderly factory floor seen
  from above, conveyor lines carrying identical boxes through six bays, and
  at the head of the first line one small designer standing with a rolled
  map, the only figure looking outward. Accent: the designer's map.
- **Scene** `chapter1-lesson2-dispatch-floor`: a busy dispatch floor where a
  designer with a notebook listens to two dispatchers, a rolled-up map under
  one arm. Accent: the notebook.
- **Concept** `chapter1-lesson2-wrong-thing`: four identical, perfectly made
  boxes on a conveyor moving toward a sign that points back the way they
  came. Accent: the sign.
- **Icons**, the six stages: `chapter1-icon-plan` (a pinned map),
  `-design` (a pencil over a sketch), `-build` (a wrench), `-test` (a
  magnifier), `-deploy` (a box on a hand truck), `-maintain` (an oil can).

### Lesson 3. How do you write design quality down so an agent can use it?

*Argument:* if designers own "ready to ship," quality can't stay a feeling;
every rule came from a failure, and a check only proves what it measures.

- **Hero** `chapter1-lesson3-hero`: a workshop wall of hundreds of small
  index cards in rows, each pinned over a tiny mended object below it (a
  cracked cup, a torn page, a crooked frame), and one designer on a ladder
  pinning the next card. Accent: the card in hand.
- **Scene** `chapter1-lesson3-corkboard`: a designer pinning one more index
  card to a corkboard already covered in neat rows of cards. Accent: the new
  card.
- **Concept** `chapter1-lesson3-done-mark`: a rounded card lying on a ruler,
  its edge exactly on a marked line. Accent: the marked line.
- **Icons**, the stack: `chapter1-icon-system` (a bound rulebook),
  `-checks` (a clipboard of ticks), `-done` (a flag on a pin). The failures
  list: `-caption` (a picture frame with a blank label), `-prototype` (a
  paper model with a bent corner), `-specs` (a rolled blueprint).

---

## Chapter 2: Inside the agent (slate `#56718C`)

The accent is the part of the system that acts, or the point where it stops.

### Lesson 4. What is an AI agent actually made of?

*Argument:* the model is one part of five; what an agent knows changes what
it builds; the loop is where the person comes in.

- **Hero** `chapter2-lesson4-hero`: a cutaway building of five floors seen
  in section, a study (the model), a library, a switchboard room of plugs, a
  toolroom, and a stairwell loop connecting them, with a tiny figure waiting
  at one landing of the loop. Accent: the landing where the loop meets the
  person.
- **Scene** `chapter2-lesson4-kitchen-table`: a person at a kitchen table
  leaning toward a laptop, where one small card with a question mark has
  stopped everything. The card is drawn as a blank card with a hatched
  mark, no glyph. Accent: the card.
- **Icons**, the five blocks: `chapter2-icon-model` (a brain, drawn as an
  anatomical engraving), `-retrieval` (a row of books), `-connections` (a
  plug), `-skills` (a toolbox), `-loop` (a looped cord).

### Lesson 5. What should you never do when building an agent?

*Argument:* a status can be accurate and still not tell you enough; "Paid"
was true of the first step and silent about the other two.

- **Hero** `chapter2-lesson5-hero`: a long counting house in section, rows
  of clerks passing one invoice along three desks, a large stamped check
  mark hung over the first desk while the two after it sit in shadow.
  Accent: the two unlit desks' lamps, the steps nobody can see.
- **Scene** `chapter2-lesson5-bookkeeper`: a bakery bookkeeper on the phone
  holding an invoice, looking uncertainly at a screen showing one large
  check mark. Accent: the invoice.
- **Concept** `chapter2-lesson5-one-stamp`: a rubber stamp beside three
  receipts in a row, only the first one stamped. Accent: the two unstamped
  receipts' edges.
- **Icons**, the three steps: `chapter2-icon-issued` (an envelope),
  `-charged` (a card reader), `-matched` (two ledger pages clipped
  together). The rule groups: `-control` (a lever), `-proof` (a receipt
  spike), `-memory` (a card file), `-stopping` (a stop valve).

### Lesson 6. Why does designing with AI feel slower than it should?

*Argument:* context is the gap I hit most and the cheapest to close; the
explanation is long because it was never written down.

- **Hero** `chapter2-lesson6-hero`: a designer at a small desk on the left
  feeding an endless paper scroll into a great machine on the right; the
  scroll loops through rooms and back out, while on the desk a single
  finished sketch card sits ignored. Accent: the sketch card.
- **Scene** `chapter2-lesson6-printout`: a designer at a laptop, a long
  printout of instructions spilling off the desk onto the floor, beside one
  small sketch on a card. Accent: the sketch.
- **Concept** `chapter2-lesson6-scroll`: a small speech bubble unrolling an
  enormous paper scroll, beside a tiny drawing card. Accent: the drawing
  card.

---

## Chapter 3: Designing the product (terracotta `#C0714E`)

The accent is the boundary, the test, or the thing a team agrees on.

### Lesson 7. What does a requirements doc need once the product is AI?

*Argument:* an AI feature answers differently every time, so done needs a
test; twenty-four sections is a menu, not a form.

- **Hero** `chapter3-lesson7-hero`: a great archive of drawers, each a
  section, with a small team at a table in the foreground who have pulled
  out only four and laid them open. Accent: the four open drawers.
- **Scene** `chapter3-lesson7-meeting`: three colleagues at a meeting table,
  one sliding a single new page onto a short printed document. Accent: the
  new page.
- **Pair** `chapter3-lesson7-pair-form` / `-pair-menu`: a tall form on a
  clipboard with many empty fields, then a short menu card with three items,
  one circled. Accent: the circle, right half only.
- **Icons**, the four stages: `chapter3-icon-discovery` (a lantern),
  `-design-doc` (a folded plan), `-develop` (a vise), `-ship` (a crate).

### Lesson 8. How do you run a design sprint for an AI product?

*Argument:* a classic sprint assumes the software does what it's told; draw
the boundary before anyone sketches, and on Friday test the wrong answer too.

- **Hero** `chapter3-lesson8-hero`: a workshop seen from above, a long wall
  of sticky notes split top to bottom by one strip of tape, five small
  teammates on either side, the notes on the left loose and many, on the
  right few and pinned. Accent: the tape.
- **Scene** `chapter3-lesson8-tape`: a facilitator running a strip of tape
  down a wall of sticky notes while two teammates watch. Accent: the tape.
- **Concept** `chapter3-lesson8-boundary`: a wall of notes split by tape, a
  truck card with a light bulb on one side, a single key on the other.
  Accent: the tape.
- **Icons**, the eight tools: `chapter3-icon-problem` (a knot),
  `-data` (a stack of punch cards), `-role` (a name badge), `-decisions`
  (a fork in a path), `-patterns` (a stencil), `-trust` (a handshake),
  `-metrics` (a gauge), `-feedback` (an ear trumpet).

### Lesson 9. Why didn't more AI answers bring more clarity?

*Argument:* every answer opened another question; two answers that disagree
are a decision, not a gap; name the stage so it can end.

- **Hero** `chapter3-lesson9-hero`: a parent at a small kitchen table in the
  foreground, and rising behind them a towering, branching cloud of paper
  pages and question slips, every branch splitting again, with the table's
  few laid-out pages the only order in the frame. Accent: the pages on the
  table.
- **Scene** `chapter3-lesson9-kitchen-table`: a parent at a kitchen table in
  the evening, laptop pushed aside, laying printed pages out side by side.
  Accent: the pages.
- **Pair** `chapter3-lesson9-pair-tangle` / `-pair-knot`: a tangled ball of
  thread with loose ends, then the same thread laid out in straight lines
  meeting in one knot. Accent: the knot, right half only.
- **Icons**, the four stages: `chapter3-icon-gather` (a basket),
  `-stop` (an hourglass on its side), `-lay-out` (pages fanned on a
  table), `-decide` (a single pin in a card).

---

## Chapter 4: In practice (plum `#7A5A78`)

The accent is the person, or the choice the practice protects.

### Lesson 10. Who sets the rules when research uses digital twins?

*Argument:* a twin repeats what people said, which isn't what they did; draw
the line once, so it isn't argued every week.

- **Hero** `chapter4-lesson10-hero`: a hall of tailor's mannequins standing
  in rows, all facing the same way, and in the foreground one real person
  at a table with a researcher, the only two figures turned toward each
  other. Accent: the participant.
- **Scene** `chapter4-lesson10-research-table`: a researcher across a table
  from a participant showing something on a phone, a tailor's mannequin
  standing unused in the corner. Accent: the participant's phone.
- **Concept** `chapter4-lesson10-mirror`: a standing mirror whose reflection
  shows a stack of seven binders, while the real stack beside it has three.
  Accent: the real stack.
- **Icons**, the four pressures: `chapter4-icon-deadline` (a desk
  calendar), `-demo` (a projector), `-budget` (a coin purse), `-check` (a
  magnifier over a page).

### Lesson 11. What makes onboarding in an AI app feel personal?

*Argument:* five questions about a life, not a profile; every question has to
earn its place; each answer turns a dial the person can watch move.

- **Hero** `chapter4-lesson11-hero`: a cutaway apartment building at
  evening, a dozen small kitchens in rows, each a different life (a pot for
  one, a family table, a hot plate), and in the center kitchen one person
  turning a stove dial. Accent: the dial.
- **Scene** `chapter4-lesson11-weeknight`: a person in a small kitchen on a
  weeknight, phone in hand, beside a two-burner stove with one pan and a jar
  of coins. Accent: the jar.
- **Concept** `chapter4-lesson11-dials`: a stove with five dials, each set
  differently, over one skillet with a simple meal. Accent: the dials.
- **Icons**, the five steps and the plan: `chapter4-icon-scale` (a
  bathroom scale), `-gauge` (a pace gauge), `-coins` (a coin jar), `-timer`
  (a kitchen timer), `-skillet` (a skillet), `-mealplan` (a pinned menu
  card).

### Lesson 12. What should come first when you redesign an AI product?

*Argument:* a CRM for one person starts by cutting; the pattern is where the
agent meets the person; relationships raise the stakes on every pattern.

- **Hero** `chapter4-lesson12-hero`: a café on a busy street seen in
  section, a founder alone at one table, and fanned out around them in the
  far planes the people they know (a client at a window, a friend waving, a
  supplier with a crate), each joined to the table by a thin line. Accent:
  the founder.
- **Scene** `chapter4-lesson12-cafe`: a founder alone at a café table with a
  phone, a notebook, and a friend waving through the window. The phone shows
  hatched blocks, not faces. Accent: the friend.
- **Icons**, the three priorities: `chapter4-icon-cut` (scissors),
  `-patterns` (a puzzle piece), `-refresh` (a brush). The three fixes:
  `-undo` (an eraser), `-confirm` (a seal), `-review` (reading glasses).

---

## Generation order

1. Chapter 1, lessons 2 and 3, once the pilot is accepted: the pilot's hero
   is the style reference attached to the first job.
2. Chapters 2, 3, and 4, one chapter per sitting, heroes first (they set the
   chapter's hand), then scenes, then concepts and pairs, then the icon
   sheets.
3. The four emblems and four share cards together, last.

Counts, from the manifest: 12 heroes, 12 scenes, 8 concepts, 2 pairs (4
halves), 56 icons on 10 sheets, one per lesson that has them, 4 emblems, 4 share cards. At the account's
pace of about eight images a sitting, that is roughly nine sittings after
the pilot.
