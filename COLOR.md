# Color

The rules for color on adamhickey.com: one palette, five grounds, and a
stated minimum contrast for every combination that is allowed. Nothing on the
site should use a color value that is not on this page.

This document is normative, and it is the companion to TYPOGRAPHY.md. When it
disagrees with the stylesheet, do not assume which is at fault: **this one has
been the wrong one twice.** It described `--color-black` in the present tense in
two places, four hundred lines from the step recording that it was deleted, and
it had `style.css` "loaded by nine pages" when the number was twelve. Measure
first. §7 says which is which today.

---

## 1. The point of view

Warm ground, dark ink, one sage accent. Neutrals do the layout work; sage is
the only hue, and it appears in two steps because one of them has to survive
being put on charcoal. When something needs emphasis it gets size or the
accent, never both.

Everything else with a color in it — the flight-story scene, the engagement
illustrations, the product screenshots — is **artwork, not interface**, and is
governed by §6 rather than by this palette.

### The site is light only, and that is a decision

Every one of the eighteen pages carries `<meta name="color-scheme"
content="light">`, and the stylesheets contain **no `prefers-color-scheme`
rule at all**. That is not an omission anyone needs to correct. One palette
against five known grounds is what makes every ratio in §3 a fixed number
rather than a pair of numbers, and it is why a sage on charcoal can be reasoned
about once and then relied on.

It is written down here because it was not written anywhere. The code decided
and the documents never recorded it, which is the shape of gap that produces a
contributor adding a dark branch in good faith and a reviewer having no rule to
point at. **Adding one is a change to this document first.** Every ratio in §3
and §5 assumes exactly one ground per surface; a second set of grounds doubles
the contrast table and re-opens the two-step sage, because a token chosen to
clear 4.5:1 on warm has no claim on a dark equivalent.

---

## 2. The palette

Eleven tokens. Every interface color on the site is one of these, or one of
the alpha steps in §4.

### Grounds

| Token | Value | Use |
|---|---|---|
| `--color-white` | `#ffffff` | The page ground. Case studies, build write-ups, the default. |
| `--color-warm` | `#f5f5f0` | The warm ground. Selected work, Earlier experience, the footer. Also the primary ink **on** charcoal. |
| `--color-tea-light` | `#e8ede5` | The feature ground. Hero card, pull-outs. |
| `--color-muted-light` | `#e5e5dd` | The alternate ground, for a section that must separate from its neighbor without changing temperature. |
| `--color-charcoal` | `#252525` | The dark band. Also the primary ink on every light ground. |

### Ink

| Token | Value | On white | On warm | On tea | On muted |
|---|---|---|---|---|---|
| `--color-charcoal` | `#252525` | 15.33 | 14.02 | 12.90 | 12.10 |
| `--color-muted-gray` | `#5c5f5c` | 6.47 | 5.91 | 5.44 | 5.11 |
| `--color-accent-text` | `#556b51` | 5.82 | 5.32 | 4.90 | **4.60** |

All measured, all above 4.5:1, so any of the three is legal as body text on
any of the four light grounds. Note how little headroom `--color-accent-text`
has on `--color-muted-light` — 4.60:1 against a 4.5 floor. That pair is the
first thing to re-measure if either value ever moves.

**`--color-accent-deep` is not on this list, and that is the point.** It is
the fill sage, `#657d60`, and it measures 4.51 / 4.12 / 3.80 / 3.56 — it fails
the body floor on three of the four light grounds. See the Accent table
below.

### Accent

| Token | Value | Notes |
|---|---|---|
| `--color-accent-text` | `#556b51` | **Text.** Small type, links, eyebrows, kickers. Clears 4.5:1 on all four light grounds — 4.60 at worst. |
| `--color-accent-deep` | `#657d60` | **Fill.** Button grounds, 2px borders, icons, focus rings, rules. Clears the 3:1 non-text floor everywhere, charcoal included (3.40). |
| `--color-accent-on-dark` | `#9dbe95` | The counterpart on charcoal: 7.47:1, where `accent-text` manages only 2.63:1. Same hue, lightened. |
| `--color-accent-hover` | `#445a41` | The pressed/hover step under `--color-accent-text`. Darker than its resting fill by ΔE 7.0 — it was `#5d7559`, which was *lighter* by ΔE 4.0 and read as no change at all. |

**The sage is two colors, and the split is load-bearing.** One sage cannot do
both jobs: a color dark enough to carry 12px text on the muted ground is
darker than a button fill wants, and a color light enough to read as sage in
a filled button fails 4.5:1 as text on three of the four light grounds.

| | white | warm | tea | muted | charcoal |
|---|---|---|---|---|---|
| `--color-accent-text` `#556b51` | 5.82 | 5.32 | 4.90 | 4.60 | 2.63 — never |
| `--color-accent-deep` `#657d60` | 4.51 | 4.12 | 3.80 | **3.56** | 3.40 |

Put `accent-deep` on small text and it fails: 3.56 on muted-light against a
4.5 floor. **That single substitution is the mistake this section exists to
prevent.**

"Fill" is the job, not an absolute ban on ink. `accent-deep` clears the 3:1
floor everywhere, so it is correct on an icon, a rule, or **large** text —
`.case-card:hover h3` is 34px sage on warm at 4.12:1, comfortably over the 3:1
that applies at that size. The line is the floor that applies, not the
property being set. What it may never be is small text: at 12px on anything
but white it fails, and on white it passes by 0.01.

And the fill/text line is drawn by what sits *on* the fill, not by the fill
itself: a sage ground carrying text has to clear the **text** floor against
that text. `.btn-primary` is the case — it carries `--color-warm`, and warm on
`accent-deep` is 4.12:1, so the button takes `accent-text` as its ground
instead.
| `--color-accent-ring` | `color-mix(in srgb, var(--color-accent-deep) 18%, transparent)` | The soft ring behind a focused input and under the hovering cursor. **Derived, never a hex.** |

`--color-accent-ring` is written as `color-mix()` rather than an equivalent
`rgba()` literal on purpose. The whole reason its predecessor needed fixing is
that a derived color was written out by hand and then drifted from what it
was derived from. Written this way it cannot drift again: move
`--color-accent-deep` and the ring moves with it. `color-mix()` has been
Baseline since 2023 and is more widely supported than `text-wrap: balance`,
which this site already depends on.

There was a `--color-accent-soft` here, documented as the accent at 10%. It
was not — it held the raw sage — and **nothing consumed it**, so it was a dead
token carrying a retired color. Deleted rather than redefined in step 3. A
wash token can come back when something actually needs one.

### Lines

| Token | Value | Use |
|---|---|---|
| `--color-tag-border` | `#e5e5e0` | The quiet hairline: tag outlines, card edges. 1.22:1 — decorative only. |
| `--color-rule` | `#d0d0c8` | The visible rule: fact-block columns, row dividers. 1.55:1 — decorative only. |

**Neither is allowed to be the only thing separating a control from its
ground.** A boundary that carries meaning needs 3:1; see §5.

### Not colors

Black is not a token. It survives only *inside* the eight elevation tokens,
whose definitions are written in literal `rgba(0, 0, 0, …)` — never as text,
never as a ground, never as a border. There was a `--color-black` here,
documented as the base for shadows and scrims. It was deleted in step 6 for
having no consumers, and by then both halves of that description had stopped
being true: the shadows carry their own literal black, and the scrim is
`--color-scrim`.

---

## 3. Ink on ground

The rule is one line: **decide the ink from the ground, and check the number.**

| Ground | Primary ink | Secondary ink | Accent ink |
|---|---|---|---|
| white | `--color-charcoal` | `--color-muted-gray` | `--color-accent-text` |
| warm | `--color-charcoal` | `--color-muted-gray` | `--color-accent-text` |
| tea-light | `--color-charcoal` | `--color-muted-gray` | `--color-accent-text` |
| muted-light | `--color-charcoal` | `--color-muted-gray` | `--color-accent-text` |
| **charcoal** | `--ink-on-dark` | `--ink-on-dark-secondary` | `--color-accent-on-dark` |

The light grounds all take the same three inks, which is the whole reason they
are allowed to exist: four grounds, one ink system, nothing to remember. Only
charcoal flips, and it flips completely — the deep sage manages 2.63:1 there
and must never be used on it.

**Never put `--color-muted-gray` on charcoal.** 2.37:1. It is the most
plausible mistake in the system, because it is the right answer on all four
other grounds.

### A build write-up's grounds rotate — the template

The three "How I built" pages — Door County Found, Lucy Learns, While We're
Here — put one `<section>` around each `h2`, and each of those chapters carries
its own ground. This is the pattern any new build write-up follows.

```html
<section class="case-section case-overview build-chapter ground-white">
  <div class="container case-narrow">
    <h2 id="…">…</h2>
    …
  </div>
</section>
```

The cycle down the page is **white → warm → tea-light**, repeating, with the
final chapter on **charcoal**. Two rules beat the cycle, and where they
conflict the cycle gives way:

1. **No two touching grounds are the same, and the hero and the footer count.**
   `.case-hero` is warm and `.case-footer` is warm, so chapter one is never
   warm and the last chapter is never warm. Where the cycle would collide it
   skips a step. This is why the ground is an explicit class rather than an
   `:nth-child` rule — `nth-child` cannot see the hero or the footer, and would
   set a warm chapter flush against the warm footer on any page with the wrong
   number of `h2`s. That seam does not read as a bug; it reads as the section
   having ended early, which is worse.
2. **Exactly one charcoal chapter, and it is the closing argument** — the
   section saying what the build *proves*, not what it does. It is the same
   move `.eng3-one` makes on the engagement pages, and a second one on the same
   page is worth nothing.

The three pages as they stand:

| | Chapters | Cycle |
|---|---|---|
| Door County Found | 5 | white, warm, tea, white, **charcoal** |
| Lucy Learns | 4 | white, warm, tea, **charcoal** |
| While We're Here | 7 | white, warm, tea, white, warm, tea, **charcoal** |

The rotation is only affordable because of the table above: four light grounds,
one ink system. Nothing inside a light chapter has to know which ground it
landed on. **The charcoal chapter is the whole cost**, and `style.css` pays it
in one block — `h2`/`h3`/`h4`/`p`/`li` to `--ink-on-dark`, captions to
`--ink-on-dark-secondary`, the `h2` rule and the list dash and the numbered
caption spans to `--color-accent-on-dark`. `--color-accent-deep` is *legal*
there at 3.40:1 and still unreadable as a 4px mark on a dark ground, which is
the distinction §5 draws between clearing a floor and being seen.

One thing the dark band costs that is not ink: `--device-chrome` is `#1b1d22`,
**darker than the charcoal it would sit on**, and `--shadow-device` is black,
so a phone or a laptop on that ground loses its edge in both directions at
once. The chrome color is not the fix — it is under the §6 carve-out and it is
the same object on every other page. The edge is, and it is drawn with
`--rule-on-dark-strong` (3.47:1, the control-boundary step).

The modifiers are `ground-*`, not the `is-*` this site uses elsewhere, and
that is measured rather than stylistic: `states.mjs` reads any `.is-*` class as
a script-applied state and forces it, so `is-charcoal` and the fifteen rules
hanging off it counted as **171 state rules that are not states** — nineteen on
each of the nine pages loading `style.css`. It passed, because forcing the
class applies the ground and the ink flip together. But CLAUDE.md keeps that
count as a tripwire for part of the site going quietly unmeasured, and a
tripwire inflated by a third has stopped being one. **A ground is a variant,
not a state.**

---

## 4. Alpha

Alpha is how ink and rules soften. It is not a free parameter: **each step
exists because it clears a stated threshold**, and there are five.

### Ink on dark

| Token | Alpha | Contrast on charcoal | For |
|---|---|---|---|
| `--ink-on-dark` | 1 (`--color-warm`) | 14.02 | Body and headings on a dark band |
| `--ink-on-dark-secondary` | 0.75 | 8.49 | Supporting copy, captions |
| `--ink-on-dark-muted` | 0.55 | 5.24 | The quietest text allowed. Still clears 4.5:1 at any size. |
| `--rule-on-dark` | 0.14 | 1.52 | Dividers and hairlines. Decorative only. |
| `--rule-on-dark-strong` | 0.40 | 3.47 | The boundary of a control. Clears 3:1. |

`--rule-on-dark-strong` is 0.40 rather than the 0.35 that clears 3:1 on
charcoal alone. The one control it exists for — the lightbox close button —
carries its own 6% fill, so the border is adjacent to two grounds and has to
clear 3:1 against **both**. 0.38 is the minimum that does; 0.40 leaves
headroom: 3.79 outside the button, 3.18 inside. A boundary is only a boundary
against what is on each side of it.

Below 0.55 is not text.

### Wash on dark

Ink and rules were not the whole story. Collapsing the alphas turned up three
background values — 0.045, 0.06, 0.075 — that are neither: they are a
**surface tint**, a card or control filled slightly lighter than the band it
sits on. That had no token, so it has one now, in two steps because a hover
has to be visibly different from a rest.

| Token | Alpha | For |
|---|---|---|
| `--wash-on-dark` | 0.06 | Card and control fill on a dark band |
| `--wash-on-dark-hover` | 0.12 | Its hover |
| `--wash-on-light-hover` | `--color-charcoal` at 6% | The same idea on a light ground |

A wash is not a rule and must not borrow a rule's token. Step 2 made exactly
that mistake — it set a hover **background** to `--rule-on-dark` because the
number happened to be right — and step 4 corrected it. The number being right
is not the same as the token being right; the next person to change
`--rule-on-dark` would have moved a background with it.

### Tint on light

| Token | Value | For |
|---|---|---|
| `--rule-hairline` | `--color-charcoal` at 10% | Card edges, table rules |
| `--rule-strong` | `--color-charcoal` at 16% | A divider that has to read as a divider |

### Rings

| Token | Value | For |
|---|---|---|
| `--color-accent-ring` | `--color-accent-deep` at 18% | Focus and hover rings on a light ground |
| `--color-accent-ring-on-dark` | `--color-accent-on-dark` at 22% | The same, on charcoal |

Different percentages on purpose: different base color, different ground, and
the pair is tuned to look equal rather than to share a number.

### Elevation

Named by **what is lifting**, not by how far. Eight tokens, each built on
literal `rgba(0, 0, 0, …)` — black is not a token here (§2).

| Token | For |
|---|---|
| `--shadow-card` | A card at rest, with its keyline |
| `--shadow-resting` | A bar or rail sitting on the page: nav, progress rail, step card |
| `--shadow-media` | A framed image or figure |
| `--shadow-device` | A screen mockup lifted off the page — contact shadow plus soft drop |
| `--shadow-popover` | Floating UI on a light page |
| `--shadow-lightbox` | A photo over the scrim |
| `--shadow-lift` | A work-card thumbnail on hover |
| `--shadow-lift-sm` | The same, on the compact grid |

They live in `color.css`, which is a taxonomy compromise made on purpose: a
shadow is a physical property that happens to be drawn in color, so it
belongs with radius and easing in `style.css` — but `site-nav.css` needs one
and the case studies' inline styles need two, and neither can see
`style.css`. A third token file for eight values is not worth it. **The rule
that decides where a token lives is reach, not taxonomy.** Putting elevation
in `style.css` and then using it from `site-nav.css` is precisely the mistake
the type work shipped, and it would have broken on the same six pages.

**A keyline is not an elevation.** `box-shadow: 0 0 0 1px …` and its `inset`
form draw a border, not a lift, and they take a rule token
(`--rule-hairline`) or a color token — never a `--shadow-*`.

### What this section used to say

That `--shadow-sm` and `--shadow-card` were the only two shadows, and that a
new elevation meant a new token. Neither half held up. There were **19
hand-written `box-shadow` values**, and the two tokens were barely the point:
`--shadow-sm` had **no consumers at all** and `--shadow-card` only three, all
of them on the reference page's own chrome. The site's shadows were, in
practice, entirely hand-written.

Five of them were the same lifted-screen idea written five ways —
`.build-hero-img`, `.build-phone`, `.mini-phone`, `.product-shot` and the case
studies' hero image — drifting a little in offset and alpha each time. And
four different near-blacks were in use as shadow bases (`#000`, `#111111`,
`#1b1d1a`, `#252525`), which differ by less than a shadow at 8% opacity can
show.

---

## 5. Contrast, as a floor

Every combination on this page has been measured, and the numbers are in the
tables rather than in a claim. The floors:

- **4.5:1** for text below 24px, which is nearly all of it.
- **3:1** for text at 24px and above, and for the boundary of any control — a
  button edge, an input outline, a focus ring. That is WCAG 1.4.11, and it is
  the one people forget, because a border looks fine long before it is legible.
- **No floor** for decoration that carries no information: a wash behind a
  card, a hairline between two rows that are already separated by space.

**"Decorative" is a claim about the design, not an excuse.** If removing the
line would lose information, it is not decorative.

### Text over imagery is measured in pixels, not in tokens

A color token tells you nothing about text sitting on a photograph. Neither
does the computed style: a scrim is a `background-image`, so `backgroundColor`
reports `transparent`, an audit that walks up the tree finds the page ground
instead, and the reading it produces is fiction. The hero portrait's caption
audits as white-on-white, 1:1, which is not a failure — it is a measurement of
the wrong thing.

The only honest method is to render the page, hide the glyphs, screenshot the
box they occupied, and take the ratio against the **lightest pixel** in it,
because that is where white type is weakest.

Measured that way against the still illustration, at 390, 768 and 1440px, the
caption's worst single pixel was 4.47:1 and its mean about 16:1. It cleared the
floor by 0.03.

**Then the portrait became a ten-second loop, and 0.03 was not enough margin to
survive it.** A still has one lightest pixel; a loop has one per frame, and the
brightest frame of this clip puts a lit wall behind the desk at 246,235,221
under the name's top edge. Re-measured across ten frames of the loop, the worst
pixel was **4.01:1 at 1440 and 3.81:1 at 390** — a real AA failure that nothing
in the repository could see, because `resting.mjs` reports this caption as
unmeasurable and the number above said it had already been checked.

The scrim's 62% stop has moved from 34% of the box to 50%, which is past the
44-47% the name's glyphs reach, and the 24% stop from 66% to 74% so the fade
does not become a step. Re-measured the same way: **6.13:1 at 1440 and 6.14:1
at 390** for the name, 6.43 and 6.50 for the line under it.

So: **any ink over a photograph needs a scrim, and the scrim needs a
measurement.** A gradient that looks sufficient at one crop is a different
gradient over a different photograph — and a measurement of a still is not a
measurement of a video.

**`resting.mjs` now does this, so the number above is no longer the only copy.**
The method in this section — render, hide the glyphs, screenshot the box, take
the worst pixel — used to be something a person did by hand and then wrote down
here, which is exactly how it went stale: the document was the only record, and
documents do not re-run. The check tags anything computed style cannot reach,
screenshots the box with the glyphs made transparent, and reports the worst
single pixel at the three widths this section names. Where a video is behind the
text it seeks through eight points of the clip, because a still has one lightest
pixel and a loop has one per frame. It lists them separately behind a flag of
their own, since they are the numbers no other check can produce and the ones a
reader is most entitled to be skeptical of.

Two things it will not do, both deliberate. It will not report a ratio for text
over a video it could not decode: Playwright's bundled Chromium has no H.264, so
it renders the poster, and the poster measures 7.04:1 where the clip measures
5.78:1 — a pass, of the wrong thing. It says `no codec for it` instead, and the
run needs a browser that has one to answer at all. And it will not average: the
caption's mean is about 16:1 while its worst pixel fails, because most of the box
is dark hair.

Re-measure when the picture underneath changes, not only when the color on top
does — and now something re-measures for you.

---

## 6. Artwork is not interface

The flight-story scene, the engagement illustrations, the product screenshots
and the book cover carry colors this palette does not name and should not:
terracotta `#c0714e`, slate `#56718c`, the device chrome `#1b1d22`, and the
scene's own accents. That is correct. An illustration is allowed its own
palette, and the README's style spec governs it.

Two rules keep the boundary from blurring:

1. **An artwork color never styles an interface element.** No terracotta
   buttons, no slate links.
2. **An interface color never gets sampled out of an artwork.** If a new UI
   color is needed, it goes in §2 with a measured contrast row, or it does
   not exist.

The one exception already in the code is `--color-caution` `#d98e6a`, the
engagement pages' caution icon. It is semantic, it is interface, and it needs
naming — but it is icon-only line art at 1.2px, so it is held to 3:1, not 4.5.

### A token that was never defined

`site-nav.css` referenced `var(--color-accent, #556B51)` five times. **There
is no `--color-accent`** — the token is `--color-accent-deep` — so all five
had always resolved through the literal fallback. It rendered correctly,
because the fallback is the right color, which is exactly why nobody noticed:
the shared header's accent looked right and was not connected to the palette
at all. Change `--color-accent-deep` and the header would not have followed.

Fixed in step 7, along with the other literal fallbacks in that file. They
were written so the header "holds up without style.css present", which was
true and is now unnecessary: `color.css` is on all fifteen pages, so a color
token always resolves.

**The four non-color fallbacks are gone too**, in step 8. `--nav-height`,
`--ease` and `--container-max` moved to `shell.css` and `--font-sans` to
`type.css`, so `site-nav.css` no longer has a single `var()` fallback: every
token it names is on every page that loads it. They happened to match, so
nothing looked wrong — but change `--nav-height` and the shared header would
have been one height on nine pages and another on six. That is the shape of
the bug the type work shipped, held off by a fallback rather than by an
architecture.

### Two more sets that are outside the palette on purpose

**The story section's four grounds.** `#eaeee2`, `#d7e1c6`, `#c4d5d2`,
`#ded7ca` — a pale green, a light sage, a muted blue-green and a warm greige,
which the section drifts through as you scroll. They are an *environment*, not
chrome: a designed sequence with its own rationale, written in `style.css`
next to the rule that uses them. Snapping them onto the palette would flatten
the effect into one ground, which is the opposite of the point. They stay
literal, scoped to `.story[data-active]`, and they are the reason §2 says
*interface* color rather than *every* color.

**The device chrome.** `#1b1d22`, the shell behind every phone mockup on the
site. It is a rendering of a physical object, so it belongs with the artwork
by the same rule.

It used to be the bezel behind the engagement mockups only, while the other
three frames took `--color-charcoal` — the same idea written two ways, and
this section had already said which way was right. All four now take the
chrome, through a `--device-chrome` named in `style.css` beside `--bezel`
rather than here: naming it in `color.css` would make it palette, which is
precisely what this section says it is not.

The two are 1.10:1 apart, which is why it went unnoticed for so long. That
closeness is not an argument for collapsing them. A shade darker and a few
degrees cooler than the charcoal is what lets a phone shell read as a molded
object next to charcoal type on the same page, and `--color-charcoal` goes
back to meaning ink.

---

## 7. What the code does today

An audit of `style.css`, `site-nav.css`, `ds.css`, `case-motion.css` and all
fifteen pages, run before this document was written.

> **Stale as written; kept for the shape of the problem.** The counts below
> were taken before steps 2-6 and before the case-study stylesheet was
> tokenized, and they also counted the hand-drawn SVG artwork that section 6
> exempts. Measured today, excluding what section 6 says to exclude,
> **2,039 color uses go through a token and 160 do not — 93%, not 21%.** The
> literals that remain are the palette's own definitions in `color.css`, the
> generated Tailwind file, 25 in the design-system specimens, and one
> deliberate `rgba()` in `case-study-base.css` that is explained where it sits.

### Eighty distinct color values against eleven tokens

**26 distinct hex colors and 54 distinct `rgb()`/`rgba()` values.** The
palette names eleven of them.

### The tokens exist and are bypassed

This is the opposite of what the type audit found. Typography had no tokens at
all; color has had them all along and does not use them.

- **867 occurrences** of a value that a token already names, written as a
  literal instead: `#252525` 395 times, `#556b51` 278, `#f5f5f0` 69,
  `#ffffff` 38, `#5c5f5c` 35, `#e5e5e0` 30.
- **224 `var(--color-*)` references** across the same files.

So **21% of color uses go through a token and 79% do not.** A palette change
today means a find-and-replace across fifteen files, which is exactly the
position the type scale was in before `type.css`.

The last of these to be caught was the one that also failed a floor: a chart
caption in the USDA study on Tailwind's own `text-gray-500`, 4.42:1 against
4.5. It now takes `text-muted-gray`, which is `--color-muted-gray` and 5.91:1
on the warm ground. Fifteen uses of `text-gray-700` remain in two case
studies; at 9.42:1 they clear the floor comfortably, so they are a
tokenization debt rather than an accessibility one — a cool gray in a
warm-neutral palette, not an illegible one.

### A retired color that never left — finished in step 3

The reference said a single darker sage replaced a raw-plus-deep pair, and
that two colors left the palette. The raw sage was still here:
`rgba(109, 135, 104, …)` appeared **9 times**, and `--color-accent-soft` — a
token, in the palette — was defined as `rgba(109, 135, 104, 0.10)`. The
retirement had been documented but not finished.

Eight of the nine were one thing wearing two hats: the focus ring behind the
email popover's input, duplicated inline across seven pages, and the hovering
cursor ring in `site-nav.css`. Both now take `--color-accent-ring`.

The ninth was the token itself, and it turned out to have **no consumers at
all** — the last formal trace of the retired color was a dead token. Deleting
it was more honest than redefining it.

The swap darkens both rings slightly, since the deep sage is darker than the
raw one: an RGB distance of 7.8 out of 255 on the composite, about 3%, behind
a solid `#556b51` border in the one case and under a cursor in the other. It
also very marginally *improves* the ring, because darker is more visible on a
light ground.

### Two accessibility failures, both in the lightbox

1. **`.ah-lightbox-hint` fails AA.** 11px text at `rgba(245,245,240,0.42)`,
   which measures **3.58:1** on the lightbox ground where 4.5:1 is required.
   It is the text that tells a phone user the picture can be zoomed and
   panned, so it is the opposite of decorative. Alpha 0.47 would clear it;
   `--ink-on-dark-muted` at 0.55 clears it with room.
2. **`.ah-lightbox-close` fails 1.4.11.** A 42px control whose only boundary
   is a 1px border at `rgba(245,245,240,0.22)` — **1.93:1** against a required
   3:1. `--rule-on-dark-strong` at 0.40 clears it on both sides.

Both fixed in step 2. Fixing the second turned up a third thing: the button's
*hover* border was already 0.4, so raising the resting state to meet the
contrast floor would have silently flattened the hover into no change at all.
It steps up to 0.55 instead, and the state stays visible.

### Fourteen alphas on one color — collapsed in step 4

`--color-warm` was written with fourteen distinct alpha values: 0.045, 0.06,
0.075, 0.12, 0.14, 0.22, 0.4, 0.42, 0.5, 0.66, 0.68, 0.72, 0.75, 0.85. Six
landed under 2:1 doing the same decorative job as each other; five landed
above 4.5:1 doing the same text job.

They are now seven tokens — three ink steps, two rules, two washes — and the
sorting was almost entirely mechanical once each use was read as a role rather
than a number. Text went to `--ink-on-dark-secondary` (0.66, 0.68, 0.72, 0.75,
0.85 all become 0.75) or `--ink-on-dark-muted` (0.5 becomes 0.55); borders to
`--rule-on-dark` (0.12 becomes 0.14); backgrounds to the new wash steps (0.045
becomes 0.06, 0.075 becomes 0.12).

**39 elements changed color**, and every one of them still passes AA:

| Was | Now | On | Elements |
|---|---|---|---|
| 0.68 | 0.75 | 8.49:1 | 23 |
| 0.85 | 0.75 | 8.49:1 | 4 |
| 0.72 | 0.75 | 8.49:1 | 1 |
| 0.5 | 0.55 | 5.26:1 | 1 |
| 0.045 | 0.06 | wash, decorative | 5 |
| 0.12 | 0.14 | rule, decorative | 5 |

Only one moves *down*: the engagement-page dek, from 0.85 to 0.75. It is
supporting copy on a dark band, which is what `--ink-on-dark-secondary` is
for, and it sits at 8.49:1 either way.

The engagement card is worth a line because two things moved at once — its
text went up and its ground went lighter. Net, the text got **better**: 6.60:1
before, 7.40:1 after.

`--color-charcoal`'s six alphas went the same way: borders to `--rule-hairline`
and `--rule-strong`, the one background to `--wash-on-light-hover`. Its
remaining two (0.07, 0.08) are shadows, which is a different axis; see §4.

Pure black's eleven alphas are all shadows, and are step 5's problem.

### Six near-blacks — four of them gone

`#252525`, `#000000`, `#141412`, `#1b1d1a`, `#111111`, `#10110f` were all in
use as base colors. `#1b1d1a`, `#111111` and the shadow uses of `#252525`
were shadow bases and went to `--color-black` in step 5, which is the one
place a pure black belongs. `#141412` and `#10110f` remain: both are scrims —
the lightbox backdrop and the hero caption veil — and they are step 6's.

### Near-duplicates of tokens — snapped in step 6

`#fafafa` was white — the recessed fill on the email popover's input, 1.04:1
from the popover behind it and delimited by its own border anyway. `#cccccc`
was `--color-rule`, doing the same divider job as `#d0d0c8` seventeen times.
`#22241f` was charcoal, and it was the engagement pages' dark hero band.

Two things the first pass got wrong, both from ranking candidates by
**luminance** instead of by actual color distance. `#eaeee2` is not
tea-light: it is one of the story section's four grounds (§6). And `#56718c`
came up as a near-match for the sage `#5d7559` — a slate blue and a green,
identical in lightness and nothing alike. Distance in RGB sorted both
correctly. Luminance answers "how light is it", which is the right question
for contrast and the wrong one for "is this the same color".

### The Tailwind color list is copied six times

Each case study's `tailwind.config` declares the same seven colors inline —
42 hardcoded copies — and two of them, `charcoal` and `dark`, are the same
value under two names. The pages then bypass even that: `text-[#252525]`
appears 101 times and `text-[#556B51]` 37.

### Two tokens that differ only in the second decimal

`--color-tag-border` `#e5e5e0` and `--color-muted-light` `#e5e5dd` are 1.01:1
apart. One is a border and one is a ground, so the names are doing real work —
but nothing would break if they were one value, and the reference's own
"retire, do not accumulate" rule points at pairs exactly like this.

---

## 8. Applying this

In order, and the order matters more than it did for type, because of what
step 6 of that work taught: **a token is only safe to use in a stylesheet if
every page that loads that stylesheet also loads the tokens.** Tokenizing a
shared sheet before the tokens are everywhere shipped a live regression last
time. So the extraction comes first here, not sixth.

1. ~~**Extract `color.css` and complete the palette.**~~ **Done.** The palette
   moved out of `style.css` into its own file alongside `type.css`, and all
   fifteen pages load it — the six case studies included, so the tokens are
   already everywhere before anything consumes them. The tokens §2 and §4 name
   are added. Verified additive: **0 of 34,867 computed color values changed**
   across the fifteen pages.
2. ~~**Fix the two accessibility failures.**~~ **Done.** `.ah-lightbox-hint`
   goes to `--ink-on-dark-muted` (3.62:1 → 5.13:1); `.ah-lightbox-close` to
   `--rule-on-dark-strong` (1.93:1 → 3.79 outside / 3.18 inside), with its
   hover state raised so it stays a state.
3. ~~**Finish retiring the raw sage.**~~ **Done.** The eight live uses take
   `--color-accent-ring`, derived with `color-mix()` so it cannot drift from
   the accent again; the ninth — `--color-accent-soft` — turned out to have no
   consumers and was deleted. **No raw sage remains in any file.**
4. ~~**Collapse the alpha scales.**~~ **Done.** Warm's fourteen alphas and
   charcoal's six are now seven tokens; 39 elements changed and all still pass
   AA. Applying it turned up two things: washes are a role that had no token,
   and this document's claim that two shadows cover the site was wrong (§4).
5. ~~**Build the elevation scale.**~~ **Done.** Eight tokens named by what is
   lifting. 15 distinct rendered shadow values became 9; 49 of the 119
   shadowed elements changed, none of them by more than a degree except the
   engagement phone, which swapped a soft ambient drop for a contact-plus-drop
   and is barely distinguishable at size. `--shadow-sm` was deleted — no
   consumers. Elevation went into `color.css`, for reach rather than taxonomy;
   see §4.
6. ~~**Snap the near-duplicates.**~~ **Done.** `#cccccc` to `--color-rule`,
   `#fafafa` to `--color-white`, `#22241f` to `--color-charcoal`, and the two
   scrim near-blacks to one `--color-scrim`. The three tokens step 1 added and
   never wired — `--color-rule`, `--color-accent-hover`, `--color-caution` —
   have consumers now. `--color-black` was deleted: it had none, and black is
   not a decision a token can usefully hold. **Every off-palette value left in
   live CSS is a documented exception** (§6).
7. ~~**Replace the literals with `var()` in Regime A.**~~ **Done**, and the
   step's own description was wrong: the bulk of the 867 is not in Regime A.
   It is **319 SVG attributes inside `aria-hidden` illustration scenes**,
   which §6 exempts, plus **486 in the Tailwind case studies**, which is step
   8. Regime A had about 30 live CSS literals, and steps 1–6 had already taken
   most of the rest as they went. Zero visual change.
8. ~~**Bring Regime B on.**~~ **Done.** Each `tailwind.config`'s `colors`
   reads `var(--color-*)`, the way `fontSize` already reads the type scale.
   **510 utility replacements, and zero rendered colors changed.** All 138
   `text-[#…]` arbitrary values are gone, along with the `dark`/`charcoal`
   alias — `text-dark` said nothing, and its 263 uses now say `text-charcoal`.
   `site-nav.css` has **no `var()` fallbacks left**, because there is no longer
   a token it cannot reach.

### A note on measuring this

Step 1 should change nothing, and proving that meant reading `color`,
`background-color`, `border-color`, `outline-color`, `fill` and `stroke` off
every element on every page — 34,867 values — before and after.

Four came back different, all on one element. It turned out to be
`.story-progress-num`, which sits inside the story section's scroll-driven
color transition and reports a different value run to run **on identical
code**: three runs gave `rgb(88,101,86)` and one gave `rgb(89,100,88)`. An
element that is mid-animation by design has no stable computed color, and a
before/after diff will always show it. Check stability on unchanged code
before believing a one-element diff.

Step 3 added a second lesson about the same harness. Diffing by element index
only works if the DOM is identical on both sides, and comparing step 3 against
a baseline captured before step 2's *documentation* edits reported **1454
changes** — every one on the reference page, which had gained three table rows
and shifted every index after them. The signature is unmistakable once seen:
colors swapping between two values in near-equal counts, 74 one way and 73
the other. Re-captured against the right baseline, step 3 changed four values,
and they were the animating element again.

Both of the real changes are interaction states — a focus ring and a hover
ring — which a resting-state snapshot cannot see at all. Those were verified
directly instead, by opening the popover, focusing the input, and waiting for
the transition to settle. Reading it too early returns the transition's start
value and looks exactly like a broken rule.

### Where the tokens live

Three files, all loaded by all fifteen pages, and the split is **scope, not
taxonomy**:

| File | Holds |
|---|---|
| `type.css` | The type scale, the four ramps, leading, tracking, weights, and the two families |
| `color.css` | The palette, the alpha steps, the rings, the scrim |
| `shell.css` | The frame: nav height, container width, radii, easing, elevation |

`style.css` holds no shared token at all. It is loaded by nine pages; the
token files are loaded by all fifteen, so anything defined in `style.css` is
invisible to the six Tailwind case studies. That single fact caused three
separate bugs across this work and the type work before it: a regression that
shipped for two commits, an undefined `--color-accent` that had never
resolved, and four fallbacks quietly holding the shared header together. It is
the only architectural rule here that matters.

Elevation sat in `color.css` for two steps because it needed the reach and
there was nowhere better. `shell.css` is that somewhere, so the compromise is
undone rather than left standing.

---

## 9. Rules of thumb

1. Decide the ink from the **ground**, and check the number.
2. Every color is a token. If the color you want is not in §2, you want a
   color that is.
3. Never hand-write `rgba()`. Use an alpha step from §4.
4. `--color-muted-gray` is never used on charcoal. 2.37:1.
5. `--color-accent-text` is never used on charcoal. 2.63:1. And
   `--color-accent-deep` carries small text nowhere: it clears 4.5:1 only on
   white, by a hundredth. Large text is fine — 3:1 is the floor there.
6. A control's boundary needs 3:1, not "looks fine".
7. Decoration is a claim about the design. If removing it loses information,
   it is not decoration.
8. Artwork keeps its own palette and never lends a color to the interface.
9. Two tokens that differ only where a rule forced them apart are one token
   and a bug in the rule.
10. Update this file in the same commit as the code. A palette that ships
    later is fiction.
