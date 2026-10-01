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
 * The object: a toy building brick, with a black brick clicked onto it. A
 * component system is the brick with the studs; whoever adds the next
 * piece, a person or an agent, it fits because the studs are the same.
 * The black brick is the solid black shape the grammar asks for, and the
 * one intervention. The first drawing here was a stencil plate with one
 * window cut through it, which read as a device with a dark screen at a
 * glance; the owner asked for something better, and steered this one
 * himself in the chat (the black brick flush with the green one).
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
    device: 'the brick and the one clicked onto it',
    alt: 'A large sage toy building brick seen from the front and a little above, cropped by the left and bottom edges of the frame, three pairs of round studs along its top, and a smaller solid black brick clicked flush onto its right end with four black studs of its own.',
    prompt: `New picture, same style, same hand as the reference. Cream ground. One large toy building brick in sage green with thin black outlines, a plain rectangular brick seen from the front and a little above so that its top face and the two rows of round studs on it show, drawn so big that it is cropped by the left edge and the bottom edge of the frame. Clicked onto its top, set toward the right so that it overhangs the sage brick's right end, one smaller brick that is solid black, its own studs showing as solid black bumps, the only black shape in the picture; the two interlock exactly and the black brick sits flush on the sage brick's studs. No other bricks, no baseplate, no logo or lettering on any stud, no shadow.`,
  },
];
