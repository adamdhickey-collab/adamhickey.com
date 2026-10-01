/**
 * The one drawing on the homepage's lab card, at img/lab/lab-feature.webp.
 * `draw.mjs --set lab` reads this to queue the job, and to file what comes
 * back. (scripts/lab-cards.mjs is the other thing with "lab" in its name:
 * the three capture-built cards on the lab INDEX. This is the drawn one.)
 *
 * The card replaced the two prototype cards under Selected work on
 * 2026-10-01, and the drawing takes the place the prototypes' tablet
 * captures had: beside the title and the feature list, in the same hand
 * as every drawing on the site since the writing pass. STYLE, REF and the
 * colour line are the feature registry's, imported, so this cannot drift
 * from the articles two bands below it.
 *
 * The object: a stencil. A design system is the plate a human or an agent
 * draws through, and the mark that comes out is on spec because the plate
 * is, whoever held the brush. One cutout rather than a row of them,
 * because the row-with-one-different geometry is already the breaker
 * panel's and the stamp's. The reveal is one small butter-yellow
 * registration mark on the plate's corner: the sign that someone checked
 * it was lined up before the paint went on, which is the review.
 *
 * Group 'ai' because the lab is the AI-as-material lead, so the plate is
 * sage; `draw.mjs take` measures the hue and says if it is not.
 */

export { STYLE, REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

export const LAB = [
  {
    id: 'lab-feature',
    group: 'ai',
    out: 'img/lab/lab-feature.webp',
    device: 'the plate and the one mark drawn through it',
    alt: 'A large sage stencil plate cropped by the top and both sides of the frame, one rounded-rectangle window cut out of its middle, and through the window one solid black mark that fills the cutout exactly; a small butter-yellow registration dot on the plate’s lower corner.',
    prompt: `Same style, same hand as the reference. Cream ground. One large stencil plate in sage green with a thin black outline, a flat rectangle with rounded corners, seen exactly straight on and drawn so big that it is cropped by the top edge and both side edges of the frame, with a band of cream ground showing beneath its bottom edge. Cut out of the plate, in the middle third of the picture, one single window: a simple rounded rectangle, wider than it is tall. Through that window, one solid black shape has been painted: a rounded rectangle that fills the cutout exactly, edge to edge, the one mark the stencil was made to give. Near the plate's lower-right corner, one small round registration dot filled butter yellow, the only other colour. No brush, no roller, no paint spatter, no hands, no other cutouts. Nothing else in the picture.`,
  },
];
