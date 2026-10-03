/**
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
