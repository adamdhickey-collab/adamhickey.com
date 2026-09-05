# Motion

The rules for movement on adamhickey.com: six durations, three curves, one
rise, one lift, one stagger, and a reduced-motion contract that already
holds. Nothing on the site should use a duration, an easing or a transform
distance that is not on this page.

This document is normative. Where it parts company with the stylesheet, either
side may be the stale one — and this is the youngest of the four specs, so it is
the least tested against the code it describes. Check before correcting. The
audit in §7 says which is which today.

Motion is the fourth axis to be written down, and it starts from a different
place than the other three. Type had five ordering bugs, colour had two
contrast failures, spacing had no tokens at all. **Motion's hard part is
already right**: nothing animates for a reader who asks it not to, on any of
the fifteen pages, and both JavaScript motion files check before they run.
What is wrong here is vocabulary — 26 durations, eight curves and 23 delays
doing the work of a much smaller set.

---

## 1. What motion is for here

This is a portfolio read by people deciding whether to start a conversation.
Motion has three jobs and no others:

1. **Confirm.** Something the reader did had an effect. A link takes the
   accent, a card lifts, a button presses.
2. **Direct.** Something arrived and is worth looking at. A section reveals
   as it enters the viewport; a figure draws itself.
3. **Set a place.** The story section drifts through four grounds as the
   reader scrolls. Nobody is meant to watch this happen.

Anything that is not one of those three is decoration, and decoration on a
portfolio reads as a lack of confidence in the work. The test for a new
animation is whether a reader who missed it would have lost anything.

---

## 2. Duration

Six steps. The name is the job, not the number, because the number is only
right in service of the job.

| Token | ms | The job |
|---|---|---|
| `--motion-response` | 80 | The interface tracking the reader in real time: the scroll-progress bar, a pointer follow. Anything slower reads as lag rather than motion. |
| `--motion-state` | 200 | A property changing under the pointer or the keyboard: colour, opacity, background, border. The most common motion on the site. |
| `--motion-move` | 300 | Something shifting a short distance or lifting: a card on hover, a shadow deepening, the nav gaining its edge. |
| `--motion-enter` | 500 | An element arriving: a reveal, a thumbnail settling, a step becoming active. |
| `--motion-draw` | 900 | A line describing itself. SVG stroke animations only — a drawing takes the time a drawing takes. |
| `--motion-ambient` | 1000 | The environment changing behind the content: the story's ground drifting between beats. Not meant to be watched. |

**Why six and not four.** The gaps are perceptual, not tidy. 80 to 200 is
the difference between tracking and responding. 200 to 300 is the difference
between a colour change and a thing that moves — a moving object needs
longer to be read as having travelled rather than teleported. 500 to 900 is
the difference between arriving and being drawn. Halving that set would put
two different jobs on one number and the site would look like it had one
speed.

**Loops are exempt.** The leaf sway on the story illustration runs 5.5s and
is not on this scale, for the same reason a phone bezel is not on the
spacing scale: it is artwork with its own internal time. See §6.

---

## 3. Easing

Three, and the third is not a token.

| | Curve | Where |
|---|---|---|
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | **The default.** Everything that is not entering. State changes, hovers, lifts, the nav, the lightbox. Symmetrical-ish: it leaves and arrives with intent. |
| `--ease-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | **Arrivals only.** Reveals, characters landing in the hero, a figure settling. Decelerates hard, so the element appears to be caught rather than stopped. |
| `linear` | — | **Progress and cross-fades only.** The scroll bar, an opacity swap with nothing to accelerate. A written keyword, not a token, because reaching for it should be a decision. |

**`--ease-enter` replaces two curves that were doing the same job.**
`cubic-bezier(0.22, 1, 0.36, 1)` (17 uses) and
`cubic-bezier(0.16, 1, 0.3, 1)` (2 uses) are both hard decelerations from
the same family, and no reader could tell them apart on a 500ms reveal.

**Never write a curve as a literal.** `--ease` is currently restated as
`cubic-bezier(0.4, 0, 0.2, 1)` in seven files — the view-transition rule on
every case study plus `style.css`. They agree today. They are seven places
to forget.

---

## 4. The vocabulary of movement

Motion is a duration, a curve, and a distance. The first two are above; the
distances are here, and they are the part with the most drift.

**Rise — how far a revealing element travels.** One value: **20px**. It sits
on the spacing grid, it is far enough to read as arrival, and it is close
enough that a reader who scrolls fast does not see the element chasing them.
Four different rises are in use today: 8, 14, 20 and 24px.

A fifth value, 29.6px, was counted here in the first draft of this audit and
should not have been: `.hero-copy` carries `translateY(1.85rem)`, but nothing
animates it. The transform is doing layout — it nudges the copy below true
centre without disturbing the grid's centring — so the distance answers to
SPACING.md, not to this document. It has since been put on the spacing grid.
The lesson is worth keeping: a transform is not evidence of motion. Look for
a transition or an animation before counting a distance as a rise.

**Lift — how much a hoverable thing grows.** One value: **1.03**. Three are
in use: 1.03, 1.04 and 1.045, which differ by half a percent and are not
distinguishable on a 300px card.

**Press — how much a pressed thing shrinks.** One value: **0.985**. The
other value in use, 0.97, is a 3% shrink, which on a large surface reads as
a flinch.

**Stagger — the delay between siblings in a sequence.** One value:
**60ms**, multiplied by index. Twenty-one distinct delays currently serve
thirty uses, which means the stagger is hand-written nearly every time it
appears.

**Write durations in one notation.** Milliseconds under a second, no
trailing zero. Today 80ms is written both `80ms` and `0.08s`, 150ms as both
`150ms` and `0.15s`, and 500ms as both `0.5s` and `0.50s`.

---

## 5. Reduced motion

**The contract: a reader who asks for reduced motion sees no motion, and
loses no content.** Both halves matter. An animation that reveals content is
not allowed to leave that content hidden when the animation is suppressed.

This already holds, and it is the one axis that arrived in good shape.
Verified in Chromium under `prefers-reduced-motion: reduce`: **nothing
animates on any of the fifteen pages.** Both JavaScript motion files —
`cursor.js` and `case-study/case-motion.js` — check the query and return
before doing anything.

It is held up by two mechanisms, and the split between them is the rule:

**The blanket rule does the work.** One block in `style.css` sets
`animation-duration`, `animation-iteration-count` and `transition-duration`
on `*`. Every CSS animation and transition on the site is neutered by it
without being named.

**Named rules only where the blanket is not enough.** A handful of elements
need more than a shortened animation — they need a different resting state,
because their un-animated position is not their final one. `transform: none`
on the connector rail is the example: its base state is `scaleX(0)` and only
the animation makes it visible.

So: **do not add a named reduced-motion rule for a new animation.** The
blanket already covers it. Add one only when the element's un-animated state
is wrong, and say in a comment why.

**One deliberate exception, and it is right.** The lightbox keeps a 150ms
linear fade under reduced motion rather than snapping. An overlay that
appears between one frame and the next is more disorienting than one that
takes an eighth of a second. Reduced motion means no *motion* — a cross-fade
with nothing travelling is not motion, and the guideline it comes from is
about vestibular triggers, not about forbidding change.

---

## 6. Artwork is not interface

The same carve-out COLOR.md makes for illustration and SPACING.md makes for
device frames. Three things on this site are drawings that happen to move,
and they are not on the scale:

- **The leaf sway** on the story illustration: a 5.5s ease-in-out loop with
  per-leaf offsets, which is what makes it read as air rather than as a
  animation.
- **The design-to-build scene**, scrubbed against scroll by anime.js. Its
  timing is the reader's scroll position, not a duration.
- **The hero logo reveal**, a one-shot clip that fades out over the mark it
  has just drawn.

They are exempt because their timing carries meaning that a shared scale
would flatten. They are still bound by §5: all three stop for reduced
motion.

---

## 7. What the code does today

Measured across every stylesheet and every page — including
`case-study/case-motion.css` and the CSS the email popover builds as
JavaScript strings, both of which the first pass at this audit missed.

| | Count |
|---|---|
| Duration values | **26 distinct**, 211 uses |
| Easing values | **8 distinct**, 205 uses |
| Delay values | **23 distinct**, 32 uses |
| `@keyframes` | 8 |
| Transform calls | 20 distinct |
| Motion tokens defined | **1** (`--ease`) |

### Durations, by the job they actually do

| Job | Values in use | Uses |
|---|---|---|
| Tracking | 80 | 6 |
| State change | 200, 240, 250, 280, 300 | **58** |
| Movement, entrance | 380, 450, 500, 550, 600 | 36 |
| Drawing | 700, 850, 900 | 9 |
| Ambient | 1000, 1200 | 11 |
| Loop | 5500 | 1 |

Five values for the state change. 200 and 250 alone are 44 of the 58, and
nothing distinguishes them: `.nav-links a` fades its colour in 200ms and
`.case-card h3` fades its colour in 250ms, on the same page, for the same
reason.

### The easing spread

| Value | Uses | Verdict |
|---|---|---|
| `var(--ease)` | 63 | The token, and already dominant. |
| `ease` | 21 | The browser default, reached for by omission. Should be `--ease`. |
| `cubic-bezier(0.22, 1, 0.36, 1)` | 17 | The entrance curve. Becomes `--ease-enter`. |
| `linear` | 12 | Correct where it is: progress bars and cross-fades. |
| `ease-out` | 4 | Draw animations. Becomes `--ease-enter`. |
| `cubic-bezier(0.16, 1, 0.3, 1)` | 2 | A near-duplicate of the entrance curve. |
| `cubic-bezier(0.4, 0, 0.2, 1)` | 7 | `--ease` written out by hand. See below. |
| `ease-in-out` | 1 | The leaf loop. Artwork; stays. |

**`--ease` is restated as a literal seven times** — once in `style.css` and
once in each of the six case studies, all in the `::view-transition-group`
rule. This is the same fault as the connector rail's `-2.5rem`: a value that
agrees with its token by coincidence, in seven places rather than one.

### Reduced motion

Complete. Nothing animates under `reduce` on any page; both JS motion files
bail before running. This section of the audit has no findings, which is not
true of any other axis's audit and is worth saying plainly.

---

## 8. Applying this

**All six steps are applied.** Each was measured across the fifteen pages
before and after.

| Step | What it did | Result |
|---|---|---|
| 1 | Tokens into `shell.css` | Provably inert: 0 of 5,789 declared-motion signatures changed |
| 2 | Seven `--ease` literals retired | Zero computed change; the only curve literal left defines the token |
| 3 | Eight curves become three | 138 slots to `--ease`, 27 to `--ease-enter`; `ease-in-out` and `linear` held |
| 4 | 26 durations become 6 | 7 computed values remain: the six steps plus the 5.5s artwork loop |
| 5 | One rise, lift, press, stagger | 16 substitutions; all four tokens verified resolving |
| 6 | The reference page runs | Six speeds racing, two curves racing, a live reduced-motion readout |

Three things the application taught that the spec had not anticipated.

**One declaration gets one duration.** Mapping each property independently
split `transition: opacity .16s, transform .16s, visibility .16s` into
200/300/200ms — three properties synchronised on purpose, with the transform
now lagging. 51 declarations on the site synchronise several properties on
one duration. The token is chosen by what the declaration as a whole does.

**Not every delay sequence is a stagger.** `--motion-stagger` is for
siblings arriving together. A narrative sequence — the glance strip drawing
its four stages over 1.5s, each meant to register before the next — is a
different thing, and at 60ms it would finish in 180ms and stop reading as a
sequence. Per-unit sequences are finer still and are artwork: 26ms a
character in the hero title, 42ms a word, 12 and 30ms a stroke.

**The audit missed three files.** It read `style.css`, `site-nav.css`,
`ds.css` and the six case studies, leaving out `index.html`, the engagement
pages, the reference page, and `case-study/case-motion.css` — a whole
stylesheet with its own keyframe, its own copy of the entrance curve and
three more durations. §7 now reports the true baseline.

## 9. Rules of thumb

- **Motion confirms, directs, or sets a place.** If a new animation does
  none of those three, it is decoration; cut it.
- **The name is the job.** `--motion-state` is 200ms because a colour change
  is 200ms, not the other way round. If a value needs a different number, it
  probably needs a different job.
- **Never write a curve as a literal.** Seven copies of `--ease` are seven
  places to forget.
- **One rise, one lift, one press.** A half-percent difference in a hover
  scale is not a design decision, it is an unmade one.
- **Milliseconds, no trailing zero.** `200ms`, not `0.2s` and not `0.20s`.
- **Do not add a named reduced-motion rule.** The blanket covers new
  animations. Add one only when the un-animated resting state is wrong, and
  say why in a comment.
- **An animation that reveals content must never be the only thing that
  reveals it.** Suppressed motion must leave the content visible, not
  hidden.
- **Artwork keeps its own time.** A loop, a scrubbed scene and a logo clip
  are drawings. They are exempt from the scale and bound by the
  reduced-motion contract like everything else.
