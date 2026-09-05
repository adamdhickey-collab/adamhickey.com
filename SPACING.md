# Spacing

The rules for space on adamhickey.com: one 4px unit, nine fixed steps, four
fluid ramps, one gutter, one measure, and four breakpoints. Nothing on the
site should use a margin, padding, or gap value that is not on this page.

This document is normative. If it and the stylesheet say different things, one
of the two has gone stale; find out which before editing either. The audit in §7
says which is which today.

Spacing is the last of the three axes to be written down. Type and colour
already have specs; this one is the biggest of the three by volume — 536
box-spacing declarations against **zero** tokens — and the easiest to get
wrong quietly, because a wrong colour is visible and a wrong margin just
looks like slightly worse taste.

---

## 1. The unit

**Every space on this site is a multiple of 4px.**

That is not an arbitrary import. It is already true of most of the site:
of 511 spacing values written in `rem`, **401 of them (78.5%) already land
on a 4px grid**, and the six most-used values — 24, 16, 8, 32, 40, 12 — are
all multiples of 4 and account for half of all uses. The grid is not being
introduced. It is being finished.

4px is also what the six Tailwind case studies already use: Tailwind's
default spacing scale is `n × 0.25rem`, so `p-6` is 24px whether anyone
intended a grid or not. Both regimes are on the same unit today by accident.
This makes it on purpose.

### Why the other 21% missed

The 110 off-grid uses are not a scattering of random numbers. They are
almost all **round decimals of a rem that are not round numbers of pixels**:

| Written | Computes to | Nearest step | Off by |
|---|---|---|---|
| `0.6rem` | 9.6px | 8px | 1.6px |
| `0.4rem` | 6.4px | 8px | 1.6px |
| `0.9rem` | 14.4px | 16px | 1.6px |
| `1.1rem` | 17.6px | 16px | 1.6px |
| `0.7rem` | 11.2px | 12px | 0.8px |
| `0.85rem` | 13.6px | 12px | 1.6px |

Thirty-three values, and every miss is 0.8px or 1.6px — which is to say
0.05rem or 0.1rem. Someone typed a nice decimal and got an ugly pixel. That
is the whole bug, repeated thirty-three times, and it is why the rule is
stated in pixels and not in rem: **4px is a round number and 0.1rem is not.**

### The words

| Word | Means |
|---|---|
| **inset** | Space *inside* a box, between its border and its content. Padding. |
| **gap** | Space *between* siblings in a row, grid, or stack. |
| **stack** | The vertical gap in a run of prose — heading to paragraph, paragraph to paragraph. |
| **gutter** | The horizontal breathing room between the page edge and the container's content. |
| **section rhythm** | The tall vertical padding that separates one full-width band of the page from the next. |
| **measure** | The width of a column of prose, counted in characters, not pixels. |

---

## 2. The step scale

Nine steps. Fixed — a 16px gap is 16px on every screen.

| Token | px | rem | Tailwind | Job |
|---|---|---|---|---|
| `--space-2xs` | 4 | 0.25 | `1` | Hairline separation. A label off its icon; a tag off its neighbour. |
| `--space-xs` | 8 | 0.5 | `2` | The tightest real gap. Inside a pill, between stacked metadata lines. |
| `--space-sm` | 12 | 0.75 | `3` | A dense inset, a tight row gap. |
| `--space-md` | 16 | 1 | `4` | The default. When no reason says otherwise, this. |
| `--space-lg` | 20 | 1.25 | `5` | A comfortable inset for a small card. |
| `--space-xl` | 24 | 1.5 | `6` | The most-used space on the site. Card padding, grid gap, the standard stack. |
| `--space-2xl` | 32 | 2 | `8` | Between components. A card off the next card. |
| `--space-3xl` | 40 | 2.5 | `10` | A generous inset for a large card or a panel. |
| `--space-4xl` | 48 | 3 | `12` | The largest fixed step. Beyond this, use a ramp. |

Two tiers, and the change of tier is the point:

- **4 → 24 in steps of 4.** Small space needs fine resolution, because at
  8px a 4px error is 50%.
- **24 → 48 in steps of 8.** Large space does not. At 40px a 4px error is
  10%, invisible, and a step nobody can see is a step nobody should have to
  choose between.

That is the same shape as the type scale — arithmetic where the eye is
sharp, coarser where it is not — arrived at from the other end.

**The nine steps are exactly Tailwind's `1 2 3 4 5 6 8 10 12`.** Not by
compromise: the eight most-used numeric spacing utilities across the six
case studies are eight of these nine, in order. The ninth, `12` (48px),
ranks below two utilities that are not steps at all — `20` (80px), which is
section-scale and belongs to §3, and `1.5` (6px), which is the one Tailwind
default that misses the 4px grid and is used 30 times. Both regimes
converged on this scale independently. It is being written down, not
imposed.

### What was dropped, and why

`28px` (18 uses) and `36px` (9 uses) are on the grid and are not steps.
Looking at where they are used settles it: `.hero-cta` takes `margin-top:
1.75rem` on mobile and `2.25rem` on desktop; `.eng3-step` takes `1.75rem
1.5rem` and then `2.25rem 2.5rem`. These are not a distinct job needing a
distinct size. They are 24 and 32 with a thumb on the scale. They fold to
`--space-xl` and `--space-2xl`.

Everything from 56px up is section-scale and belongs to §3.

---

## 3. The section ramps

Fixed steps stop at 48px. Above that, space is fluid, for the same reason
type is: a 96px band that is right on a 1440px monitor is a quarter of the
viewport on a phone.

All four ramps share **one window: 400px → 1280px** — the same window as the
type ramps in `TYPOGRAPHY.md` §3.

| Token | px range | Job |
|---|---|---|
| `--space-section` | 64 → 96 | The vertical padding on a standard full-width band. |
| `--space-section-lg` | 80 → 128 | The same, for a section that carries a full-bleed treatment: the hero, the story. |
| `--space-block` | 48 → 72 | Between major blocks *inside* a section. Row gaps in a product list, the space above a closing CTA. |
| `--gutter` | 24 → 32 | Container padding: the page edge to the content. |

```css
--space-section:    clamp(4rem,   calc(4rem   + 2   * (100vw - 25rem) / 55), 6rem);   /* 64 -> 96  */
--space-section-lg: clamp(5rem,   calc(5rem   + 3   * (100vw - 25rem) / 55), 8rem);   /* 80 -> 128 */
--space-block:      clamp(3rem,   calc(3rem   + 1.5 * (100vw - 25rem) / 55), 4.5rem); /* 48 -> 72  */
--gutter:           clamp(1.5rem, calc(1.5rem + 0.5 * (100vw - 25rem) / 55), 2rem);   /* 24 -> 32  */
```

The shared window buys the same thing it buys for type: at any viewport
width every ramp sits at the same fractional progress between its own
endpoints. An ordering that holds at 400px and at 1280px holds at every
width between — provably, with nothing to test.

**What the shared window does not buy, stated honestly.** Type and space do
not hold a constant *ratio* to each other, because their endpoints do not
share a ratio: `h1` doubles across the window (34 → 68) while
`--space-section` grows by half (64 → 96). Headings therefore gain on their
surrounding space as the viewport widens, and the page reads denser at
1280px than at 400px. That is the right direction — a wide screen can carry
a tighter relationship between a headline and its band — but it is a
consequence to know about, not a property to claim.

### What the ramps replace

Ten sections, ten different padding pairs, each stepping at a breakpoint
instead of flowing:

| Section | Mobile | Desktop |
|---|---|---|
| `.earlier-experience` | 56 / 80 | 72 / 104 |
| `.case-studies` | 60 / 52 | 80 / 72 |
| `.case-section` | 64 | *(no override)* |
| `.problems`, `.shelf` | 72 | 88 |
| `.built`, `.contact` | 72 | 96 |
| `.eng3-how` | 72 / 80 | 88 / 96 |
| `.still-evolving` | 80 | 104 |
| `.story` | 80 / 96 | 112 / 128 |
| `.eng3-hero-inner` | 104 / 64 | 144 / 88 |

Nine of these do the same job. Two ramps replace all ten pairs and delete
the media-query overrides that carry them.

**A section's vertical padding is symmetric.** Seven of the ten pairs above
differ top-to-bottom, and in every case but one the difference is 8 or 16px
— the same thumb-on-the-scale that put 28px and 36px in the size list. One
ramp goes on both edges.

The exception is `.eng3-hero-inner`, and it earns it: the top of a hero has
to clear the fixed 80px nav before the kicker starts, so it takes
`--space-section-lg` on top and `--space-section` on the bottom. A page
*ending* is the other legitimate asymmetry — `.case-footer`'s bottom air is
the end of the document, not a gap to the next thing. Everything else is
symmetric.

---

## 4. The frame

**Container.** `--container-max: 1280px`, already in `shell.css`, and already
agreed by both regimes — every Tailwind case study uses `max-w-7xl`, which
is 1280px.

**Gutter.** `--gutter`, 24 → 32px. Regime A already does this in two steps at
a breakpoint; the ramp makes it continuous. The six Tailwind case studies
use `px-4` (16px) on mobile, which is 8px tighter, and reconciling them is a
real visual change — see §8 step 5.

Those six pages carry **three** gutter mechanisms, and they did not agree
with each other. The sticky table of contents and the closing block are
hand-written CSS at 24 → 32px, matching the rest of the site; the body copy
is Tailwind's `px-4 md:px-8`, which is 16px on mobile. So at 375px the
section links indented 24px while the heading each one points at indented
16px — the contents sat 8px outside its own page. Measured, not inferred.

**Measure.** A column of prose is sized in **characters, not pixels**, and
the comfortable range for continuous reading is 60–75.

The site is outside it. Measured in Chromium at 1440px:

| Column | Width | Size | Characters per line |
|---|---|---|---|
| `.about-beat-text` (index) | 926px | 18px | **104** |
| `.case-narrow` (every case study, every engagement page) | 832px | 18px | **91** |
| `.section-head p` (index) | 672px | 18px | 75 |
| `.eng3-step` prose | 640px | 18px | 69 |

`.case-narrow` is the long-form reading column on nine pages and it runs
about a quarter too wide. `.about-beat-text` has no cap at all — it inherits
the 1280px container and renders at 926px, the widest body text on the site.

The rule: **`--measure: 52ch`** — 70 characters.

**In `ch`, not in `rem`.** A rem value cannot serve prose at more than one
size, and this site sets prose at 12, 14, 16, 18 and 24px. The proof was
already in the stylesheet: figcaptions were capped at the same `40rem` as
the 18px body copy, which is 70 characters at 18px and **115 at 12px**. One
number, two very different lines. `ch` scales with the element's own font
size, so one token is correct at every size.

Measured in Chromium against a real paragraph: one `ch` is 1.349 average
characters in Montserrat and 1.324 in Crimson Text — close enough that a
single token serves both families, and constant across sizes by
construction. So 52ch is 70 characters, whatever the type is doing.

**Put the cap on an element that carries the prose's own `font-size`.** `ch`
resolves against the element it is written on, so a 16px container capping an
18px paragraph measures the wrong glyph and the column comes out too narrow.

The earlier form of this rule said *never on a wrapper*, which was the right
instinct and the wrong rule. A wrapper is fine — better, even — when it sets
the font-size itself. The essays are the case: `.writing-measure` carries both
`font-size: var(--text-lg)` and `max-width: var(--measure)`, so the cap
resolves at exactly the size the paragraphs inherit, and it lands at 620px,
58–69 characters a line. Doing it once on the wrapper also brings the headings
and lists inside the same column, which is what an essay wants and what a case
study does not: a case study caps only its paragraphs, because the figures and
step cards beside them want the whole container.

The test is not whether the cap sits on a wrapper. It is whether the element
holding the cap is set in the type the cap is meant to measure.

**The measure caps prose, not the column that holds it.** `.case-narrow` is
896px and stays there: the figures, fact lists and step cards inside it want
the room, and capping the container would have shrunk every figure on the
build write-ups by 23%. The paragraphs inside take the measure; the column
does not.

The five engagement pages have since left `.case-narrow` for `.case-wide`,
the same column at `--container-max`, the 1280px frame the home page and the
nav already use. Their step cards are two-column objects — number, prose, gap,
figure — and inside the 832px the narrow column gave them, the prose came out
at 370px, about 43 characters, with the illustration held to 280px. At the
full frame the prose reaches 608px beside a 360px illustration. The paragraphs
outside the cards still take `--measure`, so the wide column reads no longer;
only the objects that were cramped read bigger. The `.case-narrow` row in the
table above is the case studies' and essays' column now, not every engagement
page's.

Short display prose may sit deliberately tighter than the measure. `.about-lede`
is 46ch, about 60 characters: large type wants fewer characters per line, so
that is correct as it stands rather than an exception to be folded in.

`.hero-invite` was the other one, at 44ch. It no longer carries a cap — the
promise line now runs the headline's full width so the two read as one
column, and measured at 1440 it lands at 64 characters, inside the 60–75 the
measure aims for. A cap is one way to reach a comfortable line; a column
narrow enough not to need one is another.

### Corners

**A radius is a length, so §1 already governs it: multiples of 4px.** That rule
was never written down for corners, and corners are where it is least observed.

Three tokens name the three jobs a corner does here.

| token | value | what earns it |
|---|---|---|
| `--radius-pill` | 9999px | A shape whose corners are its short side: a tag, a back button, a progress bar |
| `--radius-xl` | 20px | A panel — a card, a thumbnail, a framed figure |
| `--shell-radius` | 18 / 26 / 30px | A device shell, and only that. Per device, because it is a drawing of an object; see below |

A circle is `border-radius: 50%`, and it is **not on this scale**. Eight rules
use it — portraits, the round video wrap — and they are describing a shape, not
choosing a corner. Nothing about the grid applies.

Focus rings are the other exception. `a:focus-visible` uses 4px and the nav's
icon buttons 8px, and both are drawn to sit just outside the thing they ring
rather than to match its corner.

#### What the code does today

Fifty `border-radius` declarations in the authored stylesheets. **Thirteen use a
token.** The other thirty-seven are written by hand, and they are not thirty-
seven considered decisions — they are five spellings of "a rounded panel":

| written | uses | on the 4px grid | note |
|---|---|---|---|
| `50%` | 8 | n/a | a circle, correctly outside this scale |
| `999px` | 6 | n/a | means `--radius-pill`, and is **not the same number** as it |
| `10px` | 4 | **no** | the only off-grid radius on the site |
| `12px` | 3 | yes | `--radius-xl` is 20px; nothing names 12 |
| `0.5rem` | 3 | yes | 8px, written in the other notation |
| `16px` | 2 | yes | |
| `0.75rem` | 2 | yes | 12px, written in the other notation |
| `8px` | 2 | yes | the same 8px as `0.5rem` above |
| `4px`, `2px`, `1px` | 6 | yes | rings and list bullets, not panels |
| `inherit` | 1 | n/a | `.about-media img` taking its frame's corner, which is right |

That is 37, and 37 plus the thirteen tokenised is the 50. The rows are listed so
the arithmetic can be checked rather than trusted.

Two things in that table are bugs rather than variety.

**`999px` is not `--radius-pill`.** The token is `9999px`; six rules write
`999px`. Both exceed half the height of anything they are on, so they render
identically and always will — which is exactly why nobody noticed that the site
has two pill radii differing by a factor of ten.

**Panels are rounded at 8, 10, 12, 16 and 20px** across five spellings, with one
token covering only the 20. That is the shape of the problem COLOR.md §7
describes for shadows: a token exists, most consumers bypass it, and each new
panel picks a plausible neighbour. `10px` is how it ends — a value on no grid,
chosen four times because 8 looked tight and 12 looked loose.

This section states the rule. Applying it is a separate change: every value
above is one somebody can see, so it wants the same before-and-after
measurement the ramps got in §3, not a search and replace.

### Device frames are artwork

A phone mockup's frame is a drawing of a physical object, not space around
content, so it does not answer to the scale — the carve-out COLOR.md section 6
makes for the same artwork's colour. Changing how much room a card gives its
contents must never change how a phone looks.

That exemption is from the *scale*, not from having one value. The three live
mockups had frames of 5, 8 and 10px, one idea written three ways, and if
anything inverted: the 190px-wide mockup carried the 10px frame while the
218px one carried 5px. They now share one `--bezel`, defined in `style.css`
rather than `shell.css` precisely because it is not a system token.

One rule governs the geometry, and it is the reason a frame reads as a frame:
**the screen's corner must be concentric with the shell's** — inner radius =
outer radius − bezel. Three of the four were off by a pixel, so the ring
quietly changed width around every corner. The inner radius is now derived
with `calc()` from each device's own shell radius, so it cannot drift again.

---

## 5. Breakpoints

Four, and they are Tailwind's, because regime B is already using them and
regime A already uses two of them:

| Name | Width | Today |
|---|---|---|
| `sm` | 640px | 6 uses in regime A, 2 in regime B. |
| `md` | **768px** | **43 uses in regime A, 424 in regime B.** The primary breakpoint of the site. |
| `lg` | 1024px | 11 uses in regime B; regime A uses 1000px and 1100px instead. |
| `xl` | 1280px | 6 uses in regime B; the container max. |

Regime A currently carries **twelve** distinct widths: 560, 620, 640, 700,
767.98, 768, 860, 899, 900, 999.98, 1000, 1100. Three of those are pairs
describing one boundary from both sides — `768`/`767.98`, `900`/`899`,
`1000`/`999.98` — which is correct technique, so the number that matters is
the count of boundaries: **nine**.

Two of the nine are already `sm` and `md`. Five of the other seven — 560,
620, 700, 1000, 1100 — were each chosen for one component rather than for
the page, and fold into the four above.

**900 stays, and it is earned.** Both of the rules that live there were
tried at 1024 and both were worse. The story section's two-column pinned
layout works from 900: at 960 the desktop composition reads well and the
mobile stack it would have fallen back to leaves an oversized illustration
filling the viewport. And `.nav-links` is `display: none` below its
breakpoint, so moving it to 1024 hid the site's primary navigation on every
screen from 900 to 1023 — a usability regression, not a styling nuance.
860 folds up to 1024 rather than down, because the figure it puts beside
its text gets a 443px column there instead of a cramped one.

The rule that produced this: **a breakpoint has to be justified by a
component that genuinely breaks, not by a policy that wants fewer numbers.**
Four boundaries with one of them explained beats three with something broken
inside them.

**This was the riskiest part of the whole spec, and it was right to be.**
Moving a 900px breakpoint to 1024px changes what the layout does across a
124px-wide band of viewport widths. Done as a find-and-replace it silently
hid the primary navigation across that entire band. It has to be done one
component at a time, with the layout looked at either side of every move —
which is how the nav was caught.

---

## 6. Choosing

When something needs space, the question is not "how much" but "what kind."

1. **Is it inside a box?** An inset. Take a step from §2. The default is
   `--space-xl` (24) for a card, `--space-md` (16) for something small.
2. **Is it between siblings?** A gap. Take a step from §2. Match the inset of
   the things it separates or go one step down — never up.
3. **Is it between two bands of the page?** Section rhythm.
   `--space-section`, or `--space-section-lg` if the band is full-bleed.
   Never a fixed step.
4. **Is it between blocks inside a band?** `--space-block`.
5. **Is it the page edge?** `--gutter`. There is one, and it is on
   `.container`.

**Space belongs to the parent, not the child.** A gap between two cards is
the grid's `gap`, not a `margin-bottom` on the card — otherwise the last card
carries a margin it does not need and the grid cannot be reused anywhere the
gap should differ. `margin-bottom` on a run of prose is the exception,
because prose has no grid.

**Never space with both.** If a container has `gap`, its children have no
margins. Picking one is what makes the number in the stylesheet the number
on the screen.

---

## 7. What the code does today

Measured across `style.css`, `site-nav.css`, `design-system/ds.css` and the
six Tailwind case studies' inline `<style>` blocks.

### Regime A — 9 pages loading `style.css`

| | Count |
|---|---|
| Box-spacing declarations | 536 |
| Distinct values | 87 |
| Distinct `rem` values | **59** |
| Values on the 4px grid | 25 distinct / 401 uses (78.5%) |
| Values off the grid | 33 distinct / 110 uses |
| **Spacing tokens defined** | **0** |
| **Spacing tokens used** | **0** |

Zero. Not "few" — none. Colour had thirteen tokens before it had a spec and
type had its two families; spacing has never had a single one. Every margin,
every padding and every gap on this site is a literal, and there are 536 of
them.

Distinct `max-width` values for prose columns: **12** (30rem → 64rem).

Distinct breakpoint widths: **12**, describing **9** boundaries.

### Regime B — 6 Tailwind case studies

1097 spacing utilities. Distribution by step:

| Step | px | Uses |
|---|---|---|
| `3` | 12 | 150 |
| `4` | 16 | 139 |
| `6` | 24 | 138 |
| `2` | 8 | 124 |
| `5` | 20 | 102 |
| `8` | 32 | 62 |
| `1` | 4 | 62 |
| `10` | 40 | 39 |
| `12` | 48 | 24 |

Those nine are the whole of §2. Two more outrank `12` in the ranking and
neither is a step: `20` (80px) ×33, which is section-scale and belongs to
the ramps in §3, and `1.5` (6px) ×30, which is the one Tailwind default that
is not a multiple of 4. Below them, 15 uses of `16` (64px) and smaller
counts of `24`, `32` and `14` — all section-scale.

Then **109 arbitrary bracket values**: `[40px]` ×67, `[60px]` ×23, `[30px]`
×5, `[70px]` ×5, `[80px]` ×4, `[-10px]` ×3, `[46px]` ×2. All but the last two
are on the grid, and all of them are a step or a ramp value written as an
escape hatch — `[40px]` is `--space-3xl`, spelled the long way, sixty-seven
times.

### The seam

Regime A and regime B agree on the unit (4px), on the container (1280px), and
on the primary breakpoint (768px). They disagree on the mobile gutter (24px
vs 16px) and on nothing else that matters. After the type and colour work
this is a much narrower seam than it was, and closing it is step 5.

---

## 8. Applying this

**All eight steps are applied.** They ran in order, each one measured before
and after across fifteen pages at 375, 768 and 1440.

| Step | What it did | Cost |
|---|---|---|
| 1 | Tokens into `shell.css`, no consumers | Provably inert |
| 2 | 33 off-grid values snapped, 110 uses | No move over 2.4px |
| 3a | 230 step literals tokenised in `style.css` | Zero computed change |
| 3b | 28, 36 and 52px folded to their steps | 158 values, every one exactly 4px |
| 4 | Ten section pairs became two ramps | Engagement pages +5.7% at 1440 |
| 5 | One gutter across both regimes | Case studies +1.4–2.9% at 375 |
| 6 | The measure, at 52ch | Build write-ups +4–10% at 1440 |
| 7 | The other stylesheets and the Tailwind seam | Case studies −1–3% at mobile |
| 8 | Breakpoints consolidated; reference page documents it | Nav regression caught and reverted |

Three things changed while being applied, and the change was right each time.

**The measure is `52ch`, not `40rem`.** A rem measure can only be correct at
one size and this site sets prose at five; §4 has the argument.

**Sections pad symmetrically.** Seven of the ten pairs differed top to
bottom, almost always by 8 or 16px. §3 has the two exceptions that earned
their asymmetry.

**There are four breakpoints, not three.** §5 has why 900 survived.

What did not change: the unit, the nine steps, the four ramps, and the
principle that fixed space stops at 48px.

**One value was missed and has since been snapped.** Step 2 swept spacing
*declarations* — padding, margin, gap — so it never saw `.hero-copy`, which
carries its offset inside a `transform`. At 29.6px (`1.85rem`) it was the
last distance on the site sitting on no step. It now takes `--space-xl`.

That move is 5.6px, well past step 2's 2.4px ceiling, and it goes to the
further of the two bracketing steps. Measured at eleven widths from 768 to
1920, 24px is the roomiest of the three candidates on both things that can
go wrong: it leaves the most air above the proof text (64–104px, against
56–96 for 32px), and it is the only one that reduces rather than increases
how far the copy hangs below the hero band. Nothing collides either way —
text overlap is zero at every width for all three — so this is a choice
between comfortable and more comfortable.

**Nearest is the default, not the rule.** Where two steps bracket a value,
measure what each does to its neighbours before picking.

And measure against what a reader can see. The first version of this note
argued for 24px from a near-collision at 1023–1024px, which was measured
against the proof block's padded wrapper rather than its text; the wrapper's
top edge sits 80px above the first line it contains, so the "3.4px gap" was
never a gap anyone could see. Box geometry is not the artefact. Compare the
ink.

## 9. Rules of thumb

- **Everything is a multiple of 4.** If a number is not, it is a mistake, not
  a refinement.
- **Nine steps and four ramps.** If none of them fits, the answer is almost
  never a fourteenth value; it is that the thing being spaced is in the
  wrong container.
- **Fixed below 48px, fluid above it.** Small space is a constant; section
  rhythm is a function of the viewport.
- **Sections pad symmetrically.** An 8px difference between a section's top
  and bottom is drift, not intent. The two exceptions are a hero clearing
  the nav and the page-ending footer.
- **Space belongs to the parent.** Gaps live on the container. Margins on
  children are for prose.
- **Never `gap` and `margin` on the same axis.** One or the other, so the
  number in the file is the number on the screen.
- **Prose is measured in characters.** 60–75. A column that reads badly at
  91 characters does not read better because 832px is a round number of
  pixels.
- **One breakpoint does most of the work.** 768px carries 53 of the site's
  93 queries. The set is 640, 768, 900, 1024; reach for one of those before
  inventing a number no other rule uses.
- **A breakpoint is justified by a component, not by a policy.** 900px
  survived consolidation because the story needs it and the nav breaks
  without it. Four boundaries with one explained beats three with something
  broken inside them.
- **Write the pixel, think the step.** `0.6rem` is 9.6px and looks fine in
  the file. The file is not where it has to look fine.
