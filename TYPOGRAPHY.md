# Typography

The rules for type on adamhickey.com: two families, one size scale, five
fluid ramps, and a fixed heading ladder. Nothing on the site should use a
size, line-height, or tracking value that is not on this page.

This document is normative. A disagreement with the stylesheet is a bug in one
of the two, and reaching for the stylesheet first is how a spec's own errors
survive — nothing re-reads a document that has been declared correct. The
migration table at the end says which is which today.

---

## 1. The two families

Pick the font by the **role** the text plays, not by its HTML tag. An `<h3>`
is serif when it is a section header and sans when it is a card title, so
decide by what the text is doing, not what tag it happens to use.

| Token | Family | Voice |
|-------|--------|-------|
| `--font-serif` | **Crimson Text** | "The voice." Anything a reader reads as prose or as a headline. |
| `--font-sans` | **Montserrat** | "The interface." Anything that labels, organizes, or sits inside a component. |

Both are referenced everywhere through these variables and, in the six
Tailwind case studies, through the `font-serif` / `font-sans` utilities,
which map to the same variables. Never hardcode a family name or a bracketed
Tailwind font (`font-['Montserrat']`).

**Serif (Crimson Text)** — hero titles, page titles, section and subsection
headings, deks and ledes, pull quotes, display numerals.

**Sans (Montserrat)** — body copy, block and card titles, eyebrows, kickers,
tags, metadata, captions, table headers and cells, buttons, navigation, and
every form of label.

### The words

The names in this document are American newsroom terms, and they are
deliberately odd-looking. *Hed*, *dek*, *lede* and *graf* are misspelled on
purpose so that an editor's instruction could never be mistaken for copy to be
typeset. They are the standard American terms, they are what this site's class
names use, and they are worth knowing because they are shorter and more exact
than the plain-English alternatives.

| Word | Means | Where it appears |
|---|---|---|
| **hed** | The headline itself | `h1`, `.hero-title`, `.case-title` |
| **dek** | The short line between the hed and the body | `--type-lede`, `.eng3-dek`, `.build-dek`, `.ds-dek` |
| **lede** | The opening passage of the body | `.ds-lede`, `.about-lede` |
| **kicker** / **eyebrow** | The small tracked label above the hed | `.case-kicker`, `.hero-eyebrow`, `.eng3-kicker` |

**Not "standfirst".** That is the British word for a dek, and the site used
both for the same element until they were reconciled: `.build-standfirst`
became `.build-dek`, and the prose here follows. One element, one word, one
English.

The token `--type-lede` is named for the ramp's job rather than for a single
component: it sets deks, ledes and pull quotes, all of which are prose set
above body size and below a heading.

### Weights

Only these cuts are loaded. Do not introduce others without adding them to
the font `<link>` on every page first, or the browser will synthesize a fake
one.

| Family | Weights | Notes |
|--------|---------|-------|
| Crimson Text | **400** only, upright and italic | Never bold. All serif headings sit at 400; hierarchy comes from size. |
| Montserrat | **400 / 500 / 600 / 700** | 400 body, 500 nav and quiet labels, 600 titles and most labels, 700 strong emphasis. No 300. |

Tokens: `--weight-regular` 400, `--weight-medium` 500, `--weight-semibold`
600, `--weight-bold` 700. Tailwind's `font-normal` / `font-medium` /
`font-semibold` / `font-bold` map onto the same four.

---

## 2. The size scale

`--font-mono` is the third family, and it is deliberately not part of the
reading system: it sets code specimens in the component library and nothing
else. No page of the site renders prose in it. It was added when the components
section gained copy-paste markup, because a stack written inline at the one
place that needed it is exactly the drift the tokens exist to stop.

Fourteen steps, base 16px, spanning 11px to 80px. Every type size on the site
is one of these, with one declared exception: `--type-title-inset` runs between
36 and 64, neither of them a step, for the reason given in §3. It is a token,
not a hand-written size, and it is the only one.

`scripts/typescale.mjs` holds this section to its word. It renders every page
at the widths where the ramps are pinned, reads the computed size off every
element that shows text, and fails on anything that is neither a step nor that
one ramp's two endpoints. Until it existed the claim was honoured by attention,
and attention had already missed three sizes — 13, 15 and 17px, hand-written in
the glance block on the build write-ups, on pages this section covered.

The scale has two tiers, and they are built on different principles on
purpose.

### Text tier — arithmetic

At small sizes the eye reads the absolute difference, not the ratio. A
geometric scale near the bottom produces steps a reader cannot tell apart
(the site currently has 11, 11.2, 11.52, 12, 12.48, 12.8 and 13px all in
use). So the text tier steps by whole pixels and stops.

| Token | rem | px | Tailwind | Job |
|---|---|---|---|---|
| `--text-2xs` | 0.6875 | **11** | `text-[11px]` | Micro caps. Tracked uppercase only, four words or fewer. This is the floor — nothing on the site is smaller. |
| `--text-xs` | 0.75 | **12** | `text-xs` | Kickers, tags, figure captions, footnotes, timestamps. |
| `--text-sm` | 0.875 | **14** | `text-sm` | Dense UI: navigation, footer links, table cells, dt labels, secondary meta. |
| `--text-base` | 1 | **16** | `text-base` | Default body copy, card copy, list items, buttons. |
| `--text-lg` | 1.125 | **18** | `text-lg` | Reading prose in a long-form column; the smallest heading level. |

### Display tier — geometric

| Token | rem | px | Tailwind |
|---|---|---|---|
| `--text-xl` | 1.25 | **20** | `text-xl` |
| `--text-2xl` | 1.5 | **24** | `text-2xl` |
| `--text-3xl` | 1.75 | **28** | `text-[28px]` |
| `--text-4xl` | 2.125 | **34** | `text-[34px]` |
| `--text-5xl` | 2.5 | **40** | `text-[40px]` |
| `--text-6xl` | 3 | **48** | `text-[48px]` |
| `--text-7xl` | 3.5 | **56** | `text-[56px]` |
| `--text-8xl` | 4.25 | **68** | `text-[68px]` |
| `--text-9xl` | 5 | **80** | `text-[80px]` |

**The rule that generates it: every step doubles four steps later.**
20 → 40, 24 → 48, 28 → 56, 34 → 68, 40 → 80. That makes the ratio
2^(1/4) ≈ **1.189**, a hair under a minor third, rounded to whole pixels at
every step. You can extend the scale in either direction without a
calculator: halve or double, then fill the three between.

The two tiers meet cleanly: 18 → 20 is a 1.11 step, tighter than the display
ratio, which is right, because that is where labelling stops and speaking
starts.

### Why these numbers and not others

Of the **587 type-size declarations** across the stylesheets and pages,
**78% already land exactly on one of these fourteen steps, and 95% land
within one pixel.** The scale is not imposed on the site; it is the site's
own centre of gravity with the noise removed. Only 27 declarations move by
more than a pixel, and they are listed in §7.

---

## 3. Fluid ramps

**You never write `clamp()` by hand.** There are five ramps, and they are the
only five type `clamp()` expressions on the site — every other one is gone.
Four of them interpolate between two named steps of the scale and share one
viewport window, **400px → 1280px**. The fifth is deliberately outside both of
those rules and is described under the table.

| Token | Steps | min → max | Use |
|---|---|---|---|
| `--type-title` | `4xl` → `8xl` | 34 → 68 | `h1`, every page title, the homepage hero included. |
| `--type-section` | `3xl` → `6xl` | 28 → 48 | `h2`, a section heading. |
| `--type-subsection` | `2xl` → `4xl` | 24 → 34 | `h3`, a subsection heading. |
| `--type-lede` | `lg` → `2xl` | 18 → 24 | Deks, ledes, pull quotes. |

**The fifth ramp, and why it breaks both rules.** `--type-title-inset` runs
36 → 64 over **768px → 1280px**. Its endpoints are not steps and its window is
not the shared one, because it is sized against the column it lands in rather
than against the page: above 768px the homepage hero shares its row with the
portrait and gets about 47% of the container, and at `--type-title`'s 68px
ceiling the ninth word fell to a third line inside it. Below 768px the row
stacks and the title takes `--type-title` like every other `h1`, so the seam is
the layout's own breakpoint rather than an unreconciled second curve. A ramp is
sized against the column it lands in. That is the argument, and it is the only
place it applies.

Nothing below `h3` is fluid. A 20px label is 20px on every screen; scaling it
buys nothing and costs a token.

Note the shape: the bigger the type, the wider its ramp. Display travels 40px
between phone and desktop, a lede travels 6. That is the whole idea — display
type has to answer to the viewport, text type does not.

### The shared window is the point

Because all four ramps interpolate over the same 400 → 1280 range, at any
viewport width every ramp sits at the same normalized progress `t` between
its own endpoints. Their sizes are `min + t·(max − min)`. If the mins are
strictly ordered and the maxes are strictly ordered — and above they are —
then the sizes are strictly ordered **at every width in between, with no
exceptions and nothing to test.**

This is not a nicety. The site's current headings each carry their own
bespoke `vw` coefficient, twenty different ones, and as a direct result the
ladder inverts: `h2` is larger than `h1` on every viewport under 622px, and
`h3` and `h4` swap places at 982px (§7). A shared window makes that class of
bug unrepresentable.

### The clamp form

```css
--type-section: clamp(1.75rem, calc(1.75rem + 1.25 * (100vw - 25rem) / 55), 3rem);
/*                    ^^ min          ^^ min    ^^ max-min      ^^ 25rem = 400px
                                                                   55rem = the span */
```

Both endpoints read straight off the declaration, and the middle term is
self-checking: the multiplier must equal max − min.

### When a title does not fit

A long title that overflows or wraps badly at its ramp's floor **steps down
to the next ramp.** It does not get a new `clamp()`, a media-query override,
or a nudged `vw` coefficient. A homepage hero that is too big at
`--type-display` takes `--type-title` — which is exactly what happened in
step 3, and it is why there is no display ramp any more (see below). That
single rule is what keeps the count at four ramps instead of back at twenty.

### There is no display ramp, and that is a finding

The first draft of this scale had another ramp, `--type-display`, running
40 → 80 for the homepage hero. Applying it killed it, in the useful way:

- **80px was never rendered anywhere on the site.** The ceiling had been read
  off Regime B's `body h1 { font-size: 5rem }` — but all six of those pages
  override it in the hero with `text-[48px] md:text-[68px]`. The largest type
  the site actually puts on screen is 68px.
- **The homepage hero was never the largest type either.** `.case-title`
  topped out at 68px while `.hero-title` topped out at 61.6px, so a
  case-study title had always been bigger than the homepage headline. The
  "Hero title" tier this document originally put above `h1` was an invention,
  not an observation.
- At 80px the homepage headline — a seven-word sentence — ran to three lines
  and swamped its own block.

So the homepage hero is a page title like any other and takes `--type-title`.
`--text-9xl` stays on the scale as a step, because the doubling rule
generates it and Regime B's base still names it; no ramp reaches it.

---

## 4. The heading ladder

| Level | Size | Family | Weight | Leading | Tracking |
|---|---|---|---|---|---|
| `h1` page title | `--type-title` 34 → 68 | serif | 400 | `--leading-display` | `--tracking-display` |
| `h2` section | `--type-section` 28 → 48 | serif | 400 | `--leading-heading` | `--tracking-title` |
| `h3` subsection | `--type-subsection` 24 → 34 | serif | 400 | `--leading-heading` | `--tracking-heading` |
| `h4` block title | `--text-xl` 20 | sans | 600 | `--leading-tight` | `--tracking-heading` |
| `h5` card title | `--text-lg` 18 | sans | 600 | `--leading-tight` | `--tracking-normal` |
| `h6` label heading | `--text-base` 16 | sans | 600 | `--leading-tight` | `--tracking-normal` |

Phone (400px): 34 · 28 · 24 · 20 · 18 · 16 · body 16
Desktop (1280px): 68 · 48 · 34 · 20 · 18 · 16 · body 16

The homepage hero is an `h1` on this ladder, not a level above it.

Strictly descending at both ends, and therefore at every width between them.

**The seam at h3/h4 is deliberate.** `h3` is the last serif level and `h4`
the first sans one, so the ladder changes voice there. A family change
carries hierarchy on its own, which is why the size may drop 34 → 20 across
that one gap without the ladder reading as broken. Do not try to close it
with an in-between size; there isn't one.

**`h6` is body size.** It is separated from body copy by weight and family,
not by size. That is what the last heading level is for, and adding a size
step below 16px to distinguish it would only push it toward the label sizes.

**Never skip a level to get a size.** If a card title should be 20px, it is
an `h4` in a section whose heading is an `h3`, or it is a `<p class="...">`
that is not a heading at all. Sizes come from the ladder; the ladder comes
from the document outline.

---

## 5. Line height

Line height is a function of **size**, not of component. Six tokens:

| Token | Value | Applies to |
|---|---|---|
| `--leading-display` | 1.05 | 34px and up. Display and page titles. |
| `--leading-heading` | 1.15 | 24 – 28px. Section and subsection headings. |
| `--leading-tight` | 1.35 | 16 – 20px headings, block titles, card titles. |
| `--leading-ui` | 1.45 | 11 – 14px. Labels, captions, nav, table cells. |
| `--leading-body` | 1.6 | 16px paragraphs. The default. |
| `--leading-reading` | 1.7 | Long-form prose columns: build write-ups, essays. |

The principle: **bigger type needs less leading.** At 80px, 1.05 already
leaves more space between lines than 1.6 does at 16px.

**Headings and prose read the table differently, and applying it made that
explicit.** A 24px heading and a 24px paragraph do not want the same leading:
the heading is two or three words and wants to hold together, the paragraph is
a block of text and wants air. So:

- **Headings and labels** take leading by size, straight off the table.
- **Prose** takes it on its own two-step scale: above 18px — deks, ledes and
  pull quotes — `--leading-tight`; at 14–18px, `--leading-body`; in a
  long-form reading column, `--leading-reading`.

**`body` carries `--leading-ui`, not `--leading-body`.** That looks wrong for a
prose document until you check what actually inherits it: `p` sets
`--leading-body` itself and every prose component sets its own, so what is
left falling through to `body` is UI text. Measured across the nine pages,
1150 of the elements taking `body`'s value are table cells, tags, nav links,
buttons, `code`, and `dt` labels. Setting `body` to 1.6 loosened all of them
and grew every page; `--leading-ui` is what they actually want.

**Two `line-height` values are box control, not leading, and stay literal.**
`.icon-link-label` sits at `1` because it is a label under an icon in a
fixed-height header, and any real leading would push the header taller; `sup`
sits at `0` so a raised glyph does not open up the line box of the paragraph
around it. Neither is setting the rhythm of a block of text, which is what the
tokens above are for.

---

## 6. Letter spacing

Tracking is a function of **size and treatment.** Bigger type gets tighter;
labels get looser; running lowercase text gets neither.

| Token | Value | Applies to |
|---|---|---|
| `--tracking-display` | −0.02em | 56px and up |
| `--tracking-title` | −0.015em | 34 – 48px |
| `--tracking-heading` | −0.01em | 20 – 28px |
| `--tracking-normal` | 0 | 16 – 18px, all lowercase text, all body copy |
| `--tracking-label` | 0.08em | 14px uppercase labels |
| `--tracking-caps` | 0.12em | 11 – 13px uppercase kickers, tags, eyebrows |

**A fluid ramp takes the tracking of its ceiling.** A ramp crosses bands as
it scales — `--type-title` runs 34 → 68 and so passes through all three
negative steps — and re-tracking mid-ramp is not worth a token. Track for the
top, where tightness actually shows: large type set loose looks slack, small
type set tight only looks slightly tight. So `h1` takes
`--tracking-display` across its whole range even though its floor sits in the
`--tracking-title` band.

**"Label" is a treatment, not a case.** The first draft of this rule said
uppercase always gets tracking and lowercase never gets a positive value, and
applying it went wrong immediately: `.case-kicker`, `.ds-num`, `.ds-spec`,
`.ds-table th` and the lightbox caption are all set in sentence case and all
carry deliberate label tracking. Reading them as "lowercase" would have
stripped the treatment from five components in the name of tidiness. So the
positive steps go to anything *set as a label* — kicker, eyebrow, tag, table
header, meta line — whether or not it is uppercase, and the size decides
which of the two.

What does not get positive tracking: running text, headings, and **numerals**.
A tracked two-digit numeral is just a gap; `.story-num`, `.eng3-num` and
`.story-progress-num` all had one and now take `--tracking-normal`.

The site used eleven distinct positive tracking values between 0.015em and
0.18em, which is nine more than any reader can perceive as intentional.

### Superscripts, and two things the scale does not govern

`sup` and `sub` take `--text-xs`, not the browser default. The UA default is
`font-size: smaller`, which **compounds**: a superscript inside an 11px label
computes to 9.17px, under this scale's own floor. Set it explicitly.

Two things sit outside the scale on purpose:

- **Text inside an inline SVG diagram.** Its `font-size` is an SVG attribute
  in user units, and it scales with the diagram's `viewBox`, not with the
  page. The labels in the Lucy Learns build diagrams render between 12.5 and
  15px depending on container width, and that is correct — they belong to the
  drawing. Do not tokenise them.
- **`.product-link-ext`**, the external-link arrow, at `0.875em`. It sits
  inside links of several sizes and is meant to track whatever it is set in.
  The only relative font-size on the site.

### Numerals

Numerals that align in a column — table figures, proof rows, step numbers —
take `font-variant-numeric: tabular-nums`, in Montserrat. Never a separate
font, and never a hand-tuned width.

---

## 7. What the code does today

An audit of `style.css`, `site-nav.css`, `design-system/ds.css`, and all
sixteen pages, run before this document was written.

### Three independent type regimes — two of them now agree

Step 6 closed the split. Both regimes read one ladder, out of one file. What
follows describes what they were, because the shape of the split explains why
`type.css` exists.

There was no single base ramp. Which one a page got depended on which
stylesheet it loaded.

| Regime | Pages | Loads |
|---|---|---|
| **A — `style.css`** | Homepage, 3 build write-ups, 4 engagements, this reference (9 pages) | `type.css` + `style.css` + `site-nav.css` |
| **B — Tailwind + inline** | The 6 Tailwind case studies | `type.css` + `site-nav.css` + `case-motion.css` + Tailwind CDN + a per-page inline `<style>` base. **These pages still never load `style.css`** — see below. |
| **C — the practice app** | `independent-practice/app/` | Its own `style.css`, unrelated to either. Not part of the site. |

**`type.css` is what joins A and B.** The six Tailwind pages were never going
to load `style.css` — dropping 2,500 lines of site CSS on them to reach
fourteen custom properties would be a far larger and riskier change than the
one it serves. So the scale moved out of `style.css` into its own file that
every page loads first. One definition, two regimes, and a change to a step
now moves both at once.

Their Tailwind config reads the same file: `theme.extend.fontSize` maps
`2xs`–`9xl` onto `var(--text-*)`, so a utility and a token cannot drift
apart. Tailwind's own defaults for `xs` through `2xl` already matched the
scale exactly, which is a decent sign the scale is not eccentric; `3xl`
upward did not, and `2xs` did not exist.

Regime A and Regime B disagreed on the base ramp. Both columns are now the
ladder in §4 — this is what was there before:

| Tag | A (`style.css`) | B (case studies, inline) | Agree? |
|---|---|---|---|
| `h1` | `clamp(30 → 72px)` serif 400 | `80px` flat, serif 400 | no |
| `h2` | `clamp(36 → 48px)` serif 400 | `48px` flat, serif 400 | at the top only |
| `h3` | `clamp(26 → 34px)` serif 400 | `34px` flat, serif 400 | at the top only |
| `h4` | `clamp(28 → 34px)` **serif 400** | `24px` **sans 600** | **no — different family** |
| `h5` | *no rule at all* | `20px` sans 600 | no |
| `h6` | `18px` sans 600 | `18px` sans 600 | yes |

Regime B's headings did not scale with the viewport at any level: an 80px
`h1` was 80px on a 375px phone unless a utility overrode it, which is why every
case-study hero carried three hand-tuned breakpoint sizes and a hand-set
leading. Those are gone; the hero is `--type-title` like every other page
title, 34px on a phone and 68px at 1280 — the same 68 it already reached, and
14px smaller than the 48 it used to start at.

### Three ordering bugs in Regime A — fixed

All three were real, all three were measured in a browser across twelve
viewport widths, and §8 step 2 closed all three at once. Kept here because
each one names a way a bespoke `clamp()` fails, and the next person reaching
for one should know what it costs.

1. **`h2` was bigger than `h1` on every viewport below 622px.** `h1` floored
   at 30px and `h2` at 36px, and their `vw` coefficients differed (4.5
   against 3.5), so they did not cross until 622px. On a phone the section
   heading outranked the page title. Masked only because every `h1` on the
   site is overridden by `.hero-title`, `.case-title`, `.eng3-hero h1`, or
   `.ds-hero h1` — four more bespoke clamps, which is step 3.

2. **`h3` and `h4` swapped places at 982px.** `h4` was larger below that
   width, `h3` above it. Mismatched floors (26 against 28) and mismatched
   coefficients, so the pair crossed mid-range instead of holding an order.
   `h4` was also serif in Regime A and sans in Regime B, so the two regimes
   disagreed on what an `h4` even is. Regime A's `h4` is now sans, matching B.

3. **`h5` had no rule in Regime A at all.** It fell to the UA default —
   roughly 13px bold — below both `h6` (18px) and body copy. Nothing looked
   broken only because the site's two `h5` elements both live in Regime B
   pages and carry Tailwind sizes.

The ladder now measures 34/28/24/20/18/16 at 400px and 68/48/34/20/18/16 at
1280px, strictly descending at every width tested in between.

**What step 2 actually moved.** Every heading on all nine Regime A pages was
measured before and after, at 400px and at 1280px: 332 elements. Exactly one
font-size changed — bare `h2`, 36px to 28px, on mobile only, across 47
elements. Nothing changed at 1280px, and **no family or weight changed
anywhere**, because the two `h4` elements on Regime A are both already
overridden to sans and there are no bare `h5` or `h6` on any of the nine
pages. The rest of the diff is leading: `h1` tightened 1.1 to 1.05, `h2` and
`h3` loosened 1.1 to 1.15, `h4` loosened 1.1 to 1.35.

### Two bugs step 2 did not touch — fixed in step 3

Both lived in class overrides rather than the base ladder, which is why the
ladder rewrite could not reach them. Both were confirmed present before step 2
by re-measuring against reverted code, so neither was introduced by it.

- **`.hero-title` fell off a cliff at 768px: 89px to 38.4px in one pixel of
  viewport.** Two rules in two media queries — `clamp(2.25rem, 11.6vw,
  5.6rem)` below the breakpoint and `clamp(2.4rem, 4.7vw, 3.85rem)` above —
  met with a 50px discontinuity, so the site's largest headline more than
  halved at the tablet breakpoint. One ramp now spans 320 to 1920 continuously:
  48.18px at 767, 48.22px at 768.
- **`.story-lead`, an `h2`, outranked the hero title between roughly 700 and
  900px.** It sat at 44px while `.hero-title` was at 38.4px. It is an `h2`, so
  it now takes `--type-section` like every other `h2`, and the hero is above
  it at every width.

### One inversion step 3 made visible — fixed in step 4

On the homepage below about 600px, an `h3` at 32px (`.case-card h3`, a
work-card title) outranked the largest `h2` at 30px
(`.section-head.archive-head h2`, the "Earlier experience" shelf head).

**That pair was already inverted before any of this work** — verified by
re-measuring at the commit before step 2. What changed is that the page used
to hide it: `.story-lead` sat at 36px, so the homepage's largest `h2` still
beat its largest `h3`. Step 3 put `.story-lead` on a ramp and the masking went
with it.

The fix was a level, not a size: `.case-card h3` **is** an `h3`, so it takes
`--type-subsection` like every other `h3` — 24px on a phone, 34px at 1280,
under every `h2` at both ends. Two pinned values (32px, and 34px above 768px)
became one ramp.

**A correction to what this section said after step 3.** It claimed "no
arrangement of `h2` and `h3` sizes fixes this," and that was wrong — it was
reasoning only about raising the shelf head, which is indeed a dead end at
28px. Sizing the *card title* down to its own ramp fixes it cleanly, with no
markup change and no change of family. The other half of the claim held up:
the card title was the thing that was wrong.

### Three dead rules, found by finishing

Step 7 was meant to be mechanical: move nine `clamp()` expressions onto ramps.
Three of the nine turned out to be styling nothing.

- **`.hero-invite` had two top-level rules**, a serif one carrying its own
  clamp and a sans one further down. The sans one wins at every width, and it
  overrides every property the serif one sets. The serif block — including the
  comment describing the invitation line as serif — had been dead for as long
  as both existed. The page has always rendered it sans.
- **`.engagement-note` matches no markup on any page.** The class appears
  nowhere in any of the fifteen files.
- **`.case-section h3` never wins.** Measured at 1280px across the seven pages
  that use `.case-section`: 0 of 20 `h3` elements inside one take it, because
  `.case-overview h3` and `.eng3-steps .eng3-step h3` catch every single one.
  And once its clamp became `--type-subsection` it was restating what the base
  ladder already gives an `h3`, so it joined `h4`/`h5`/`h6` as a spacing rule.

None of this was visible from reading the stylesheet — the first needed the
cascade resolved, the third needed the DOM. It only surfaced because each
change was measured rather than assumed.

Two more, found by a sweep afterwards and **not** removed, because they are
not clamps and dead-CSS cleanup is its own pass: `.build-hero-img` and
`.build-mode-note` have zero references in any of the fifteen pages.
`.build-mode-note` has the distinction of being tokenised in step 4, which is
effort spent on rules nothing reaches.

### A regression steps 4 and 5 shipped, and step 6 fixed

Worth writing down because the mechanism will recur.

Step 4 tokenised `site-nav.css` — three declarations on `.icon-link-label`,
the small "Email" / "LinkedIn" text in the fixed header. **Every page loads
`site-nav.css`, but at that point only the nine Regime A pages had the
tokens.** On the six case studies `var(--text-2xs)` resolved to nothing, which
makes the declaration invalid at computed-value time, and the label fell back
to the inherited 16px.

So for two commits the case-study header labels rendered at 16px instead of
11px, and nobody would have seen it in the verification, because the whole
Regime B measurement was skipped: Tailwind loads from a CDN the sandbox
blocks, so those six pages were never rendered at all.

Measured at three points to confirm it: 11px / 12px before step 4, 16px after
it, 11px / 12px again once `type.css` reached those pages in step 6.

**The rule it teaches:** a token is only safe to use in a stylesheet if every
page that loads that stylesheet also loads the tokens. `site-nav.css` is
shared by both regimes and was tokenised while only one of them could resolve
them. `type.css` exists partly so this cannot happen again — and partly
because the alternative, duplicating fourteen custom properties into six
inline `<style>` blocks, is the same trap with more copies.

### Sixty distinct type sizes, now fifty-five

Before step 2, across every stylesheet and page: **40 distinct fixed sizes
and 20 distinct `clamp()` expressions**, no two of the clamps sharing a `vw`
coefficient. Step 2 removed four clamps and step 3 removed seven more. Step 4
then took every remaining fixed size to a token: **across `style.css`,
`site-nav.css`, `ds.css` and the Regime A pages there are now 141 token
references and exactly two numeric font-sizes left**, both deliberate and both
documented above — the 16px root anchor and `.product-link-ext` at `0.875em`.

Step 7 then took the last nine `clamp()` expressions. **There are now zero
bespoke clamps on the site**: the only four that exist are the ramps in
`type.css`, which is what they are for.

Final state, both regimes: every rendered type size on all fifteen pages sits
on one of the fourteen steps, at every width tested. Four literal values
survive in Regime A and six root anchors in Regime B, all of them deliberate
and documented where they sit.

The fixed sizes, in px: 9, 10, 10.88, 11, 11.2, 11.52, 12, 12.48, 12.8, 13,
13.28, 13.6, 14, 14.4, 15, 15.2, 16, 16.8, 17, 18, 19.2, 20, 20.8, 21.6, 22,
24, 25.6, 26, 26.4, 28, 30, 30.4, 32, 34, 36, 38.4, 48, 56, 68, 80.

Seven of those sit between 11 and 13.6px. Six sit between 14 and 17px. Those
are not decisions; they are `rem` arithmetic that never got rounded.

Both are gone as of step 5. The 13 line-heights and 16 letter-spacings are
now the six and six, across every stylesheet and every Regime A page. **Four
literal values survive in total**, all of them deliberate and all documented
where they sit: the 16px root anchor, `.product-link-ext` at `0.875em`, and
the two box-control `line-height`s (§5).

### `:root` had no type tokens

Before step 1, `style.css`'s `:root` defined colour, radius, container,
shadow, and easing tokens, and exactly two typographic ones — the two font
families. Every size, line-height, and tracking value on the site was written
inline at its use site, which is why there were sixty of them. The scale, the
ramps, the leadings, the trackings and the weights are tokens there now, and
the base ladder is the first thing to consume them.

### What snapping actually cost

The headline claim — 78% already exact, 95% within a pixel — was true and
also the least interesting part. The work was in the ties.

**15px and 17px each sit exactly between two steps.** 17 is one pixel from 16
and one from 18; 15 is one from 14 and one from 16. Between them they account
for 33 of the site's declarations, and no amount of arithmetic decides them.
Each one is a question about what the text is *doing*, answered from §2:

- **17px → 18px (`--text-lg`)** where the text is prose being read: the case
  study body column, the story steps, the section deks, the closing CTA line.
  §2 defines `--text-lg` as reading prose, and these were all set above the
  16px default precisely because they are read rather than scanned. Snapping
  them *down* to 16 would have thrown away the intent.
- **17px → 16px (`--text-base`)** where the text is card copy: `.case-desc`.
- **15px → 14px (`--text-sm`)** for dense UI and meta: nav links, `.case-role`,
  `.contact-plain`, `.product-link`, `.build-facts dd`, the diagram panel
  labels, the compact card description (which has to stay under the full one).
- **15px → 16px (`--text-base`)** for copy: `.shelf-desc`, `.build-list li`,
  `.eng3-one-item p`, the engagement bullet lists.

Four values were below the 11px floor and had to move regardless: 9px
(`.build-pilot-tag`) and 10px (`.build-pilot-n`, `.build-mode-note span`,
`.build-pair-label`), all of them uppercase tracked labels, which is the worst
case for small type.

Three overrides turned out to be restating the base ladder one level off it:
`.case-section h4`/`h5`/`h6` ran 18/16/15 against the ladder's 20/18/16. They
are now spacing rules with no type in them at all.

### Documentation drift

The previous version of this file described a "case studies inline base"
ramp with `h4` at sans 600 1.5rem and cited `.hero-card-title` and
`.cap-rail-num`. Neither class exists anywhere in the repository any more,
and Regime A's `h4` is serif, not sans. A specimen written by hand goes stale
the moment the site moves; that is why §2's numbers are read out of the
stylesheet by `design-system/index.html` rather than transcribed.

---

## 8. Applying this

**All seven steps are done.** Kept in order because it is the order to repeat
if the scale ever changes, and because each step's measured cost is the honest
record of what a systematisation like this actually moves.

1. ~~**Add the tokens.**~~ Fourteen sizes, four ramps, six leadings, six
   trackings, four weights. They live in `type.css`, which all fifteen pages
   load first.
2. ~~**Fix the base ladder in Regime A.**~~ Closed three ordering bugs
   (`h2` outranking `h1` below 622px, `h3`/`h4` crossing at 982px, `h5`
   undefined). Cost: bare `h2` 36px to 28px on mobile, 47 elements.
3. ~~**Retire the `h1` overrides, and `.story-lead` with them.**~~ Fixed the
   768px hero cliff and the `.story-lead` inversion. Retired
   `--type-display`, whose premises all turned out to be false (§3).
4. ~~**Snap the fixed sizes.**~~ Every fixed size in Regime A a token. Closed
   the card-title inversion; raised four sub-11px labels off the floor.
5. ~~**Collapse leading and tracking.**~~ 88 declarations; thirteen
   line-heights and sixteen trackings down to six and six. Both rules had to
   be refined before they could be applied (§5, §6).
6. ~~**Bring Regime B onto the ladder.**~~ The scale moved to `type.css`; the
   six case studies' inline base reads §4 from it; their Tailwind config maps
   `fontSize` onto the same tokens. Eleven arbitrary bracket sizes gone. Also
   fixed a regression steps 4 and 5 had shipped (§7).
7. ~~**Delete the bespoke clamps.**~~ The last nine. Three of them were
   styling nothing (§7). **Zero bespoke clamps remain.**

### Where it landed

| | Before | After |
|---|---|---|
| Distinct fixed sizes | 40 | 14, and they are the scale |
| Distinct `clamp()` expressions | 20, no two alike | 4, and they are the ramps |
| Line-height values | 13 | 6 |
| Letter-spacing values | 16 | 6 |
| Type tokens in `:root` | 2 (the families) | 34, in `type.css` |
| Base heading ladders | 2, disagreeing | 1 |
| Ordering bugs | 3 in the base, 2 in overrides | 0 |

Every rendered type size on all fifteen pages now sits on one of the fourteen
steps, at every width tested, in both regimes. What survives as a literal is
deliberate and annotated where it sits: the root anchor on each page (it is
what `rem` resolves against, so it cannot be a `rem` token),
`.product-link-ext` at `0.875em`, and two `line-height`s that are box control
rather than leading.

### What is left, and it is not typography

Found in the same sweeps, untouched:

- **Colour has the drift type used to have.** `text-[#252525]` appears 101
  times across the case studies and `text-[#556B51]` 37 times. Those are
  `--color-charcoal` and `--color-accent-deep`, which already exist and which
  `type.css` now proves can reach those pages.
- **Dead rules.** Three were found by measuring during step 7 and removed.
  `.build-hero-img` and `.build-mode-note` have zero references in any page
  and were left alone, because dead-CSS cleanup is its own pass with its own
  risks. A proper one would check all of `style.css`, not just what a type
  change happened to touch.

### A note on measuring this

Steps 2 and 3 were each verified by measuring every affected element in a
real browser at a spread of widths, before and after, and diffing. That is
how the `h4` family change turned out to touch nothing, how the `.story-lead`
inversion surfaced, and how `--type-display` was caught being wrong.

Two traps worth knowing if you repeat it. **Load the real webfonts.** Line
counts and wrap points are meaningless in Georgia and Arial fallback;
Crimson Text is appreciably narrower. Fetch the Google Fonts CSS with `curl`,
pull the latin `woff2` files, rewrite the `src` URLs to absolute `file://`
paths, and inject it — relative URLs in an injected stylesheet resolve
against the *page*, not the stylesheet, and fail silently as
`FontFace.status === "error"`. Check `document.fonts.check()` before trusting
a single number. **And do not measure Regime B in a sandbox without network:**
the Tailwind CDN never runs, so the utility classes evaporate and the
case-study heroes report their unoverridden 80px base instead of the 68px
they really render.

## 9. Rules of thumb

1. Decide serif vs sans by **role**, never by tag.
2. Every size is a step. If the size you want is not on the scale, you want a
   step on the scale.
3. Never hand-write `clamp()`. Use one of the four ramps.
4. A title that does not fit steps **down a ramp**, never into a media query.
5. Line height follows size, not component.
6. Uppercase gets tracking; lowercase never gets positive tracking.
7. Nothing is smaller than 11px.
8. Headings come from the document outline. Never pick a level to get a size.
9. Stay inside the loaded weights. Adding one means editing the font `<link>`
   on every page first.
10. Update this file in the same commit as the code. A specimen that ships
    later is fiction.
