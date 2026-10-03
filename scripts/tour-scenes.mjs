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
 *   change    a branch cut to fit a trunk and not yet joined: it is a branch,
 *             and "nothing has merged" is the gap
 *   checks    a clipboard of five rows, three ticked and two open
 *   shared    one cable and one switch feeding six sockets: a change to the
 *             shared one reaches every table
 *   findings  a sieve, and the one stone too big to pass
 *   account   a watch with its back open: it shows its works
 *   evidence  a magnifying glass over a row of buttons, and the one it finds:
 *             a stage lamp seen from the front read as no object at all
 *   decision  a signal with its middle lamp lit: return it
 *
 * Every picture is the AI group's sage, because the write-up is: the colour is
 * the section's, not the artist's (writing-features.mjs, ACCENTS). STYLE, REF
 * and the colour line are that registry's, imported, so this set opens on the
 * same preamble and the same binoculars and cannot drift from the writing set.
 * A prompt that names a ground or a shadow invites perspective, so each states
 * one strict viewpoint (drawing-one-viewpoint) and draws any ground as a band.
 *
 * Drawn small: about 410 CSS pixels wide on the page, so the object is large
 * and there are few parts. The six sockets and the sieve's mesh are the most
 * detail any of them carries.
 */

export { STYLE, REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

const VIEW = 'a strict flat elevation, the way a technical diagram is drawn: one flat plane seen exactly straight on, with no vanishing point, no foreshortening, no ellipses and no depth of any kind';

export const TOUR = [
  {
    id: 'tour-change',
    group: 'ai',
    out: 'img/lab/tour-change.webp',
    device: 'one intervention, held: the branch that has not been joined',
    alt: 'A sage tree branch lying level across the picture, cut to fit a notch in a black trunk at the right edge, and stopping just short of it.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly from the side. At the right edge, one thick solid black tree trunk, a tall vertical band running off the top and the bottom of the frame, with one clean V-shaped notch cut into its left side at the middle of the picture. Lying level from the left edge toward the trunk, one large muted sage green branch: a thick straight bar with a black outline, cropped by the left edge, tapering a little, its cut end shaped to fit the notch and stopping a clear gap short of the trunk, so the two do not touch. Five or six simple sage leaf shapes with black outlines stand up from the top of the branch. Nothing joins them yet. No ground, no sky, no other tree, no people. Nothing else in the picture.`,
  },
  {
    id: 'tour-checks',
    group: 'ai',
    out: 'img/lab/tour-checks.webp',
    device: 'reveal: the two rows still open',
    alt: 'A sage clipboard with a cream sheet of five rows: the top three checkboxes ticked in black, and the bottom two empty and filled rose.',
    prompt: `Same style, same hand as the reference. Cream ground. One very large muted sage green clipboard seen straight on in ${VIEW}, drawn so big it is cropped by the left, right and bottom edges, with its solid black metal clip at the top middle. On the board, one cream sheet outlined in black, and on the sheet five evenly spaced rows filling the middle of the picture. Each row is a small square checkbox at the left and one short thick black line to its right, with no writing. In the top three rows the checkbox holds one bold solid black tick. The bottom two rows are the reveal: their checkboxes are empty squares filled dusty rose, with black outlines, and the only rose in the picture. Nothing else.`,
  },
  {
    id: 'tour-shared',
    group: 'ai',
    out: 'img/lab/tour-shared.webp',
    device: 'one multiplied: six sockets on one cable and one switch',
    alt: 'A sage power strip running edge to edge with six identical round sockets in a row, a thick black cable leaving it, and one small lamp at its left end lit yellow.',
    prompt: `Same style, same hand as the reference. Cream ground. One very large muted sage green power strip seen straight on in ${VIEW}: a long thick rounded bar running horizontally across the middle of the picture and cropped by the left and right edges. Along its face, six identical round sockets in one straight evenly spaced row, each a black circle with two short black slot marks cut into it. At its left end, one small rocker switch with a round lamp lit butter yellow, the only yellow in the picture and the reveal. A single thick solid black cable leaves the bottom of the strip and runs off the bottom edge of the frame. Nothing is plugged in. No wall, no plug, no other outlets. Nothing else.`,
  },
  {
    id: 'tour-findings',
    group: 'ai',
    out: 'img/lab/tour-findings.webp',
    device: 'reveal: the one stone too big to pass',
    alt: 'A sage kitchen sieve filled with a regular mesh of small holes, one large rose stone wedged in the middle of it, and three black grains falling below.',
    prompt: `Same style, same hand as the reference. Cream ground. One very large muted sage green kitchen sieve seen straight on from the front in ${VIEW}: a big circle with a thick rim, cropped by the top, left and right edges. Its mesh is a regular grid of about forty large empty holes, each a plain cream circle with a thin black outline, filling the whole disc. Wedged into the middle of the mesh, one single round stone, much bigger than any hole, filled dusty rose with a black outline, pressed into the mesh; it is the reveal and the only rose in the picture. Below the sieve, a short loose vertical column of three small solid black dots, the grains that passed through. Nothing else.`,
  },
  {
    id: 'tour-account',
    group: 'ai',
    out: 'img/lab/tour-account.webp',
    device: 'reveal: the watch that shows its works',
    alt: 'A sage pocket watch with its back open, showing three interlocking cogs, two filled yellow and one rose, and a black chain running off the top.',
    prompt: `Same style, same hand as the reference. Cream ground. One large round muted sage green pocket watch seen straight on in ${VIEW}: a thick circular case cropped by the bottom edge, with its small winding crown and loop at the top and one thick solid black chain rising from the loop and off the top of the frame. The back of the case is open, and the circle is the reveal: inside it, the movement, three plain interlocking cog wheels with black outlines, each a simple ring with a few big square teeth and a black pin at its centre, two filled butter yellow and one filled dusty rose. No hands, no numbers, no dial, no glass glare. Nothing else.`,
  },
  {
    id: 'tour-evidence',
    group: 'ai',
    out: 'img/lab/tour-evidence.webp',
    device: 'reveal: the one button the glass has found',
    alt: 'A sage magnifying glass held over a row of small black buttons; in its lens, one button shown large and filled rose.',
    prompt: `Same style, same hand as the reference. Cream ground. Drawn in ${VIEW}, seen exactly from above like a diagram. Across the middle of the picture, one straight level row of five small identical rounded rectangular buttons, evenly spaced, each filled solid black, running from the left edge to the right edge. Laid over the middle of the row, one very large classic magnifying glass, instantly recognisable: a big perfect circle lens with a thick muted sage green rim and a black outline, filling most of the height of the picture, and one thick straight solid black handle leaving the rim at the lower right and running diagonally off the bottom right corner of the frame. The lens is the reveal: its inside is plain pale cream, and in its centre the one button under the glass is shown magnified, the same rounded rectangle about four times bigger than the others, filled dusty rose with a thick black outline, the only rose in the picture. The middle button of the row is hidden behind the glass, so two small black buttons show to the left of the rim and two to the right. No hand, no glare lines, no text. Nothing else.`,
  },
  {
    id: 'tour-decision',
    group: 'ai',
    out: 'img/lab/tour-decision.webp',
    device: 'reveal: the one lamp that is lit',
    alt: 'A sage traffic signal with three round lamps in a column on a black pole, the middle lamp lit yellow and the other two dark.',
    prompt: `Same style, same hand as the reference. Cream ground. One large muted sage green three-lamp traffic signal seen straight on in ${VIEW}: a tall rounded rectangle housing drawn so big it is cropped by the top edge, standing on one thick solid black pole that runs off the bottom edge. Three equal round lamps in a vertical column, each under a small solid black visor hood. The top and bottom lamps are dark, filled solid black. The middle lamp is the reveal and the only light: filled butter yellow. No red, no green, no other colour. Nothing else.`,
  },
];
