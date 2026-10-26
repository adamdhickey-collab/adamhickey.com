# The site's visual system

What the repositioned site looks like, which directions were weighed, and
why this one. The normative specs stay where they were (`COLOR.md`,
`TYPOGRAPHY.md`, `SPACING.md`, `MOTION.md`); this records the decision
they now carry.

## What has to be true

A mature digital designer with real taste: excellent typography, strong
composition, generous but intentional spacing, confident hierarchy, large
and beautifully presented work, purposeful motion, a recognizable personal
language, editorial pacing, and a distinct treatment for each case study
inside one coherent whole. Not a SaaS template, not a dashboard, not an
agency's gimmicks (oversize type for its own sake, chaotic animation,
inaccessible navigation).

Kept from the previous site, because they were right: the 14-step type
scale and its four ramps, the 4px spacing scale and section ramps, the
six motion durations and two curves, the five grounds, the contrast floors
(4.5:1 text, 3:1 controls), the focus rings, the reduced-motion contract,
and the eleven checks that hold a rendered page to all of it.

## Three directions

**A. Paper and ink.** Keep the warm paper and charcoal ink, change the
voice: a soft old-style serif with an optical-size axis for display, a
plain grotesk for everything else, one cool accent so the work's own
colors (which run warm on nearly every project) lead the page. Work shown
large and edge to edge; chapters on rotating light grounds; a dark band
only to close.

**B. Gallery white.** Pure white, near-black, one hot accent, a single
grotesk at large sizes, pictures in a strict grid. Reads as a photography
portfolio or an agency site. Rejected: it is the most common look among
the sites the audience sees every day, and it makes a warm, illustrated
body of work (Door County Found, Lucy Learns, Innovators Studio) look like
it is in the wrong house.

**C. Ink-first.** A dark site with light type and the work as bright
panels. Rejected on the site's own standing decision: the palette is light
only, every contrast ratio is a fixed number against one ground, and a
dark default doubles the whole table for a mood that fights long reading.

**A** won. It is the direction the work already lives in, and the two
changes it asks for are both one value each.

## What moved

| | Was | Now |
| --- | --- | --- |
| Display and prose serif | Crimson Text 400 | Fraunces 400, optical size 9 to 144 left to the browser |
| Sans | Montserrat 400 to 700 | Instrument Sans 400 to 700 |
| Accent on light | Sage `#556b51` (5.82 / 5.32 / 4.90 / 4.60 on the four light grounds) | Petrol teal `#276468` (6.75 / 6.18 / 5.69 / 5.33) |
| Accent hover | `#445a41` | `#1f4f52` |
| Accent on charcoal | `#9dbe95` (7.47) | `#8fc9c6` (8.28) |

Token names did not move, so the 84 rules and 37 Tailwind utilities that
write the accent are unchanged. The wordmark and its reveal clip stay
exactly as they were, at Adam's request; the mark's sage sits beside the
teal in the header, and if that pairing should ever read as a clash the
accent is one value in `color.css`.

## The personal identity

Small and careful: the existing wordmark and its reveal, the Fraunces
headline voice, the warm paper, the teal rule and eyebrow, and the way
work is presented (large, edge to edge, with a project's own color kept
off the text and used only for bands, rules and discs). Nothing on the
site competes with the work for personality.

## The storytelling system

`work.css` is the case-study vocabulary: a hero with the four facts a
creative director asks first, a cover, counted chapters, prose on the
measure with figures on the whole container, grids and strips, a before
and after pair, an annotated detail, palette and type specimens, an aside
for the rationale, a pull, a number row, and a closing pair of what I did
and what the page does not claim. Each project sets `--work-accent` and
`--work-band` from its own palette, so no two case studies look identical
and all of them look like this site.
