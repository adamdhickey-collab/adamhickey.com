/**
 * Two sets for the Agent Review write-up live here. LOOP, at the foot of
 * the file, is on the page since 2026-10-06: the six steps of the loop.
 * TOUR, everything above it, is not:
 *
 * RETIRED FROM THE PAGE 2026-10-05. The tour's notes carry no drawings now:
 * Adam found they did not help, and the product takes their room. The seven
 * files, img/lab/tour-<part>.webp, are out of the tree. This registry stays
 * as the record of the set and the way to draw it again (draw.mjs --set
 * tour), so `draw.mjs --set tour status` will say all seven are owed, which
 * is true and is not a to-do.
 *
 * One small drawing for each part of the Agent Review tour, beside its note.
 * draw.mjs --set tour reads this to queue the jobs for a browser to draw, and
 * to file what comes back; illustrate.mjs cuts each to the `tour` slot, 960x540.
 *
 * The notes are about a screen, and a drawing of that screen is what the page
 * already has, in the laptop. So these do what the writing features do for an
 * article: take the note's most literal noun and perform its verb on it once,
 * in the same hand. One everyday object drawn bigger than the frame, flat
 * vector, one outline weight, putty-cream ground, black as a solid shape, no
 * people and no text (a drawing of an interface with no words in it is a
 * drawing of nothing). The reveal, a small second picture inside the object,
 * is where the two colours beyond the accent are allowed.
 *
 * Since 2026-10-03 the tour is of the product's second iteration, the
 * delegated work, and these are its seven. The first iteration's set (a
 * branch not yet joined, a clipboard, a drop of dye, a sieve, an open watch,
 * a magnifying glass, a signal) went with the first iteration's tour.
 *
 *   job       a key left on its hook: work handed over, the way a key is
 *   results   a jigsaw finished but for two holes: most of it done, and the
 *             two places it needs you. Not a count of pieces: the screen's
 *             seven-and-two is the screen's, and a picture that counts is
 *             read as a chart (the first set's power strip was)
 *   checked   a spirit level with its bubble centred: a check establishes one
 *             fact, that it is level, and nothing about whether it is the
 *             right shelf
 *   bounds    a kite as high as its string allows: free inside a length
 *   pause     a service bell: it rings for you when it needs you, and only then
 *   meaning   a paint-swatch card with two chips of exactly the same red:
 *             one colour, two names, and no check can tell them apart
 *   rule      a thermostat dial, set once: it keeps to the setting without
 *             you, until you turn it
 *
 * Every picture is the AI group's sage, because the write-up is: the colour is
 * the section's, not the artist's (writing-features.mjs, ACCENTS). STYLE, REF
 * and the colour line are that registry's, imported, so this set opens on the
 * same preamble and the same binoculars and cannot drift from the writing set.
 * A prompt that names a ground or a shadow invites perspective, so each states
 * one strict viewpoint (drawing-one-viewpoint) and draws any ground as a band.
 *
 * Drawn small: about 410 CSS pixels wide on the page, so the object is large
 * and there are few parts. The sieve's mesh is the most
 * detail any of them carries.
 */

export { STYLE, REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

const VIEW = 'a strict flat elevation, the way a technical diagram is drawn: one flat plane seen exactly straight on, with no vanishing point, no foreshortening, no ellipses and no depth of any kind';

export const TOUR = [
  {
    id: 'tour-job',
    group: 'ai',
    out: 'img/lab/tour-job.webp',
    device: 'one intervention, held: the key left on its hook for someone',
    alt: 'A large sage key hanging from a black hook by a black ring, with a small yellow tag on the ring beside it.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly straight on. Near the top middle of the picture, one small solid black wall hook, a short bar with an upturned end, fixed to nothing visible. Hanging straight down from the hook by one solid black split ring, one very large muted sage green old-fashioned key: a big round bow at the top with a round hole in it, a long straight shaft, and a simple notched bit at the bottom, all with black outlines, drawn so big that the bit is cropped by the bottom edge of the frame. On the ring beside the key hangs one small round tag, filled butter yellow with a black outline, the only yellow in the picture and the reveal. No wall texture, no door, no lock, no hand. Nothing else.`,
  },
  {
    id: 'tour-results',
    group: 'ai',
    out: 'img/lab/tour-results.webp',
    device: 'reveal: the two holes still open',
    alt: 'A sage jigsaw puzzle seen from above, finished except for two missing pieces whose empty shapes are filled rose.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly from above like a diagram. One very large muted sage green jigsaw puzzle, finished but for two pieces, filling the picture and cropped by the left, right and bottom edges: a flat sheet of large simple interlocking pieces, each with plain rounded tabs and blanks, all the same sage, separated by thin black outlines. Near the middle, two pieces are missing, not next to each other. Their two empty holes, each the exact shape of a piece, are the reveal: filled dusty rose with black outlines, the only rose in the picture. No loose pieces, no box, no picture printed on the puzzle, no table. Nothing else.`,
  },
  {
    id: 'tour-checked',
    group: 'ai',
    out: 'img/lab/tour-checked.webp',
    device: 'reveal: the one fact the tool establishes',
    alt: 'A long sage spirit level resting on a black band, its middle vial showing a yellow bubble centred exactly between two black marks.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly from the side. Across the middle of the picture, one very long muted sage green spirit level, a thick straight horizontal bar with black outlines, so long that it is cropped by the left and right edges. At its centre, one window holding a short horizontal glass vial outlined in black, with two thin black vertical marks on the vial a little apart. Between the two marks, resting exactly centred, one oval bubble filled butter yellow with a black outline: the reveal, the only yellow in the picture. Below the level, one plain flat solid black band runs across the full width of the frame and off the bottom edge, the surface it rests on. No numbers, no scale marks along the bar, no shelf, no wall. Nothing else.`,
  },
  {
    id: 'tour-bounds',
    group: 'ai',
    out: 'img/lab/tour-bounds.webp',
    device: 'one intervention, held: as high as the string allows',
    alt: 'A large sage diamond kite high in the frame with one yellow quarter, its black string running taut down and off the bottom left corner.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly straight on. In the upper middle of the picture, one very large muted sage green diamond kite, a flat four-sided shape with black outlines and two thin black cross spars, drawn so big that its top point is cropped by the top edge of the frame. From its bottom point hangs a short tail of three small black bows on a black line. From the crossing of the spars, one thin solid black string runs down in one long straight diagonal line and off the bottom left corner of the frame, pulled taut: the kite is as high as the string allows. The reveal is inside the kite: its lower left quarter is filled butter yellow, the only yellow in the picture. No clouds, no sky colour, no ground, no hand. Nothing else.`,
  },
  {
    id: 'tour-pause',
    group: 'ai',
    out: 'img/lab/tour-pause.webp',
    device: 'reveal: the one button, rung only when it is needed',
    alt: 'A large sage service bell seen from the side on a black counter, its small push button on top filled yellow.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly from the side. One large muted sage green service bell, the kind on a hotel front desk: a wide smooth half-dome with a black outline, sitting on a flat round base, filling the middle of the picture. From the top of the dome rises one short straight solid black stem to a small round push button. The button is the reveal: filled butter yellow with a black outline, the only yellow in the picture. Under the bell, one plain flat solid black band, the counter, runs off the left, right and bottom edges of the frame. No sound lines, no hand, no text. Nothing else.`,
  },
  {
    id: 'tour-meaning',
    group: 'ai',
    out: 'img/lab/tour-meaning.webp',
    device: 'reveal: one colour, twice',
    alt: 'A tall sage paint-swatch card with four square chips: two cream, and the two in the middle the exact same rose.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly straight on, upright and not tilted. One very large muted sage green paint swatch card, a tall rounded rectangle with a black outline and one small round black hole near its top, drawn so big that it is cropped by the top and bottom edges of the frame. On the card, one vertical column of four large square colour chips, each outlined in black, evenly spaced with sage between them. The top chip and the bottom chip are plain cream. The two middle chips, one directly above the other, are the reveal: both filled with exactly the same dusty rose, identical in every way, the only rose in the picture. No writing, no names, no numbers on the card. Nothing else.`,
  },
  {
    id: 'tour-rule',
    group: 'ai',
    out: 'img/lab/tour-rule.webp',
    device: 'one intervention, held: set once, and it keeps to it',
    alt: 'A large sage thermostat dial on its wall plate, a ring of black ticks round its edge, and its one pointer, filled yellow, set to a single mark.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly straight on. One very large round muted sage green thermostat dial on a square sage wall plate, black outlines, drawn so big that the plate is cropped by the top, bottom and right edges and the round dial fills the middle of the picture. Around the dial's edge, a ring of short evenly spaced black tick marks, with no numbers. On the dial, one raised pointer turned to a single setting about a third of the way round from the bottom left: the pointer is the reveal, filled butter yellow with a black outline, the only yellow in the picture. No screen, no wires, no hand, no text. Nothing else.`,
  },
];

/* ---------- THE LOOP, since 2026-10-06 ----------
   One drawing for each of the six steps of the loop on the same page
   (#the-loop), where each step had a hairline over it. draw.mjs --set loop
   reads these; illustrate.mjs cuts each to the `mark` slot, 352x352 on a
   transparent ground, with the disc found and set at the same size in the
   same place in every file.

   A different brief from the tour's, so its own preamble: the drawings sit
   on the band's white rather than on a ground of their own, so the ground is
   transparent, and they are built on a disc (Adam: "use the circle as the
   foundation of the graphic, but then break the border a bit"), the object
   in front of the disc and out past its edge in one or two places. The
   disc is the site's tea-light, the object the AI group's sage. They are
   read at about 176px, so each is one object with very few parts.

     system    two toy bricks: the parts a product is built from
     agent     a robot arm lowering one more brick
     change    a branch with one new shoot
     checks    a clipboard, three boxes ticked and one empty: a check
               establishes some things and not others
     judgment  a level balance with the same rose card on each pan, the
               page's own "same red, two names": no measurement tells
               them apart, so a person decides
     stronger  picture 1 again, one brick higher: the loop closes on the
               system it started from

   Picture 1 was first drawn as a cylinder and an arch on a block, and read
   as a padlock; it was redrawn as two bricks in the same chat, which is the
   prompt below, and picture 6 follows it. Picture 6 as filed is Adam's own
   redraw, the same day, which centres the yellow brick on the white one;
   the prompt below is the one it replaced, and drew it off to one side.
   They are empty-alt on the page,
   because the step's own words beside each say what it shows. */
export const LOOP_STYLE = "The attached image is the style reference for every picture in this conversation. Match its hand exactly: a flat vector illustration with thin near-black outlines of one even weight on every shape, flat fills, no shading, no hatching, no gradients, no paper texture, no gloss, no 3D, no photographic look, no drop shadows. No people, no hands, no faces. No text, letters, numbers, logos or readable labels anywhere.\n\nThis conversation makes a set of six small spot illustrations, one per message, for the six steps of a loop on a web page. They sit side by side, so they must read as one set.\n\nEvery picture is built on the same foundation: one circle, centred in the image, its diameter about two-thirds of the image width, the same size and place in every picture. The circle is filled flat with pale sage #E8EDE5 and outlined in the same thin near-black line. One everyday object sits on that circle, drawn large, and breaks out past the circle's edge in one or two places, so the circle reads as a stage the object leans out of, not a frame it is trapped in. Where the object crosses the circle, the object is in front and the circle's outline stops behind it.\n\nThe background outside the circle is fully TRANSPARENT: a PNG with an alpha channel, nothing behind the drawing, no ground colour, no white, no cream, no shadow.\n\nColour is held to muted sage green #657D60, white, black as a solid shape (never as a shadow), the circle's pale sage, and, only where I ask for it, one small accent of butter yellow #F0DF7C or dusty rose #D9A3B4. Strict flat front elevation, the way a technical diagram is drawn: no perspective, no vanishing point, no ellipses, no depth.\n\nThese are read at about 140 pixels wide, so: one object, very few parts, bold simple shapes, no fine detail. Simpler than you think is correct.";

export const LOOP = [
  {
    id: 'loop-system',
    out: 'img/lab/loop-system.webp',
    step: 'System',
    device: "two toy bricks, the long one wider than the disc: the parts a product is built from",
    prompt: "Picture 1 of 6, System. Two plain toy building bricks of the snap-together kind, with no logo, seen exactly from the front. A long muted sage green brick lies across the lower middle of the circle, wider than the circle, so both of its ends reach out past the circle's left and right edges. Its row of round studs on top shows as small flat rectangles. A shorter white brick is snapped on top of it, a little left of centre, with its own studs on top. The parts a product is built from. Transparent background.",
  },
  {
    id: 'loop-agent',
    out: 'img/lab/loop-agent.webp',
    step: 'Agent',
    device: "a robot arm reaching in past the disc, lowering one more brick",
    prompt: "Same style, same circle, same size and place. Picture 2 of 6, Agent. A small industrial robot arm, the kind on an assembly line, in muted sage green with solid black joints, reaching in from the upper right, out past the circle's edge, its two-fingered gripper lowering one white toy brick, the same kind as picture 1, towards the middle of the circle. It is building something. Nothing human about it: no face, no eyes. Transparent background.",
  },
  {
    id: 'loop-change',
    out: 'img/lab/loop-change.webp',
    step: 'Change',
    device: "a branch with one new shoot, its leaf the yellow",
    prompt: "Same style, same circle, same size and place. Picture 3 of 6, Change. A single bare tree branch, flat, crossing the circle from lower left to upper right and out past its edge on the right, with three sage leaves along it, and one new forked shoot partway along carrying a single fresh leaf in butter yellow #F0DF7C. A new branch, grown off the old one, waiting to be looked at. Transparent background.",
  },
  {
    id: 'loop-checks',
    out: 'img/lab/loop-checks.webp',
    step: 'Checks',
    device: "a clipboard of four boxes, three ticked and one left empty",
    prompt: "Same style, same circle, same size and place. Picture 4 of 6, Checks. A clipboard in muted sage green with a solid black clip, standing upright in the circle, its clip and the top of its board rising out through the top edge of the circle. On its white sheet, four rows, each a small square box beside a thick black bar: the top three boxes hold bold black check marks and the fourth box is empty. Transparent background.",
  },
  {
    id: 'loop-judgment',
    out: 'img/lab/loop-judgment.webp',
    step: 'Human judgment',
    device: "a level balance with the same rose card on each pan: no measurement tells them apart",
    prompt: "Same style, same circle, same size and place. Picture 5 of 6, Human judgment. An old balance scale, flat front view: a solid black upright post and level beam, and two shallow pans in muted sage green hanging from thin black lines, the two pans reaching out past both the left and right edges of the circle. On each pan sits one small square card of exactly the same dusty rose #D9A3B4, and the beam is perfectly level: no measurement can tell the two apart, so a person has to decide. Transparent background.",
  },
  {
    id: 'loop-stronger',
    out: 'img/lab/loop-stronger.webp',
    step: 'Stronger system',
    device: "picture 1 again, one yellow brick higher",
    prompt: "Same style, same circle, same size and place. Picture 6 of 6, Stronger system. The same two toy bricks as picture 1, the same shapes, colours and place, the long sage brick reaching past both sides of the circle and the white brick on it, with one new brick in butter yellow #F0DF7C snapped on top of the white one, so the stack now rises out through the top edge of the circle. The system one piece stronger, ready for the next build. Transparent background.",
  },
];
