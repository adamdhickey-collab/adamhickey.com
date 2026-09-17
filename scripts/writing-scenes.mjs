/**
 * The second drawing for each article, in the body: the same object as the
 * feature, seen again, carrying the argument's second half. draw.mjs reads
 * this to queue the jobs for a browser to draw, and to file what comes back.
 *
 * Until this pass these were painterly rooms in the engagement set's style,
 * with four or five people in each. That is the mode a magazine keeps for
 * its long features and never puts in a web article's body: on the leads
 * sampled for writing-features.mjs, fifteen of seventeen articles carried
 * one image, and the magazine features that carried more repeated the
 * lead's palette and artist, each in-body drawing performing one further
 * metaphor on the same terms. So these do that. Same hand, same reference,
 * same object family as the feature above it, and one more device: the
 * stamp comes down, the key jams, the pencil and its shadow swap.
 *
 * STYLE, REF and the colour line are the feature registry's, imported, so
 * the two sets cannot drift apart: a scene in a queue of its own still
 * opens on the same preamble and the same binoculars. Every scene carries
 * its group, and draw.mjs appends the colour line for any job that has one.
 * The feature at the top of the page and the scene in its body share an
 * accent by construction, because the accent is the section's.
 */

export { STYLE, REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

export const SCENES = [
  /* ---- AI in the workflow -------------------------------------------- */
  {
    id: 'what-microsofts-hax-framework-gets-right-about-enterprise-ai',
    group: 'ai',
    device: 'the same stamp, after',
    caption: 'Disagreement made cheap: one card taken, one left as it was, and nothing in between asked her whether she was sure.',
    alt: 'The sage stamp lying on its side on the ground, and two plain cards in front of it: the left one carries a single sage square, the right one is still blank.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large sage green rubber stamp as before, now lying on its side on the ground, drawn huge and cropped by the left edge, its black shadow-silhouette a solid shape beneath it. In front of it, two plain cream cards outlined in black, side by side with a clear gap between them. The left card carries one single sage green square in its centre, the stamp's mark. The right card is completely blank. No hands, no ink pad, no third card. Nothing else in the picture.`,
  },
  {
    id: 'enterprise-ai-should-help-people-decide-not-just-answer',
    group: 'ai',
    device: 'the same lens, over the stack',
    caption: 'The answer on top, and under it the records it is about, one of which does not agree.',
    alt: 'The sage magnifying glass lying flat over the edge of a tall stack of cream documents; inside the lens the stack’s edges show one dusty-rose sheet buried in the middle.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large sage green magnifying glass as before, now lying flat, its handle running off the left edge, its lens resting over the side of a tall neat stack of cream documents seen edge-on, the stack cropped by the bottom of the frame. The lens is the reveal: inside the circle, the stacked sheets are drawn as thin horizontal cream bands with black outlines, and exactly one sheet, buried in the middle of the stack, is filled dusty rose. Outside the lens the stack is plain cream. A black shadow-silhouette of the glass lies on the ground. Nothing else.`,
  },
  {
    id: 'is-your-design-system-ready-for-ai-agents',
    group: 'ai',
    device: 'the same key, jammed',
    caption: 'Give an agent a real task and watch: the output is a list of what the system never made legible.',
    alt: 'On a sage field, one black keyhole drawn very large, and the cream key stuck halfway into it, its bit visibly the wrong shape for the hole.',
    prompt: `Same style, same hand as the reference. The ground is the full sage green, edge to edge, instead of cream. One keyhole, drawn as a single solid black shape very large in the centre of the frame, cropped by the bottom edge. The same cream key as before, black outline, is pushed halfway into the keyhole from the left and has stopped: the part of the key inside the black shape is drawn in cream, and its bit is clearly a different shape from the hole, so it cannot go further. The key's bow is cropped by the left edge. No lock, no door, no other keys. Nothing else in the picture.`,
  },

  /* ---- Systems and teams --------------------------------------------- */
  {
    id: 'why-enterprise-ux-problems-are-organizational-problems',
    group: 'systems',
    device: 'the same cord, frayed three ways',
    caption: 'The decision nobody is placed to make: the line goes to three places and ends at none of them.',
    alt: 'The slate handset lying on the ground, its black cord running right and splitting into three thin black lines that head off the frame in three directions, each ending in nothing.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large dusty slate blue telephone handset as before, now lying on the ground in the lower left, cropped by the left edge. Its cord is one solid black ribbon that runs to the right across the middle of the picture and then, at a single point, splits into three thin black lines that fan out and run off the frame in three different directions, up-right, right and down-right, each one ending in nothing. No phone base, no desk, no other objects. Nothing else in the picture.`,
  },
  {
    id: 'standardizing-ux-across-40-sap-fiori-apps',
    group: 'systems',
    device: 'the same blind, mid-pull',
    caption: 'The checks in the release process, not in the wiki: one cord, and the last three slats still coming into line.',
    alt: 'The cream venetian blind on a slate field, every slat tilted the same way except the bottom three, which still tilt the other way, and the black pull cord drawn taut mid-pull.',
    prompt: `Same style, same hand as the reference. The ground is the full dusty slate blue, edge to edge, instead of cream. The same large cream venetian blind as before fills the frame side to side and is cropped by the top and bottom: many identical horizontal slats, evenly spaced, all tilted at the same angle, except the bottom three, which are still tilted the opposite way. The one pull cord, a single solid black line down the right-hand third, is drawn pulled taut at a slight angle rather than hanging straight. No window, no wall, no room. Nothing else.`,
  },
  {
    id: 'where-does-design-end-and-development-begin-now',
    group: 'systems',
    device: 'the same pair, swapped',
    caption: 'Leverage, not rescue: the cursor casts the pencil now, and it is the same object either way.',
    alt: 'A tall slate text cursor standing upright, cropped by the top of the frame, and its black shadow lying along the ground is a pencil.',
    prompt: `Same style, same hand as the reference. Cream ground. One tall thin dusty slate blue rectangle, a text cursor, standing upright in the centre of the picture, drawn so big it is cropped by the top of the frame, with a black outline. Its shadow on the ground is one solid black shape, and the shadow is not a rectangle: it is a pencil, lying diagonally toward the lower right, sharpened point outward, its far end running off the frame. One object, one shadow, and they are the two objects from before with their places swapped. Nothing else.`,
  },

  /* ---- Getting to a release ------------------------------------------ */
  {
    id: 'designing-for-the-moment-the-workflow-breaks',
    group: 'release',
    device: 'the same plank, in the river',
    caption: 'Sent, received, accepted: three different facts, and the thing that fell between the second and third.',
    alt: 'The terracotta footbridge from below its missing plank, and on the black river beneath it the one cream plank, drifting away to the right.',
    prompt: `Same style, same hand as the reference. Cream ground. The same warm terracotta plank footbridge as before, now seen from lower down so that only its underside and handrails show, running edge to edge across the top third of the picture and cropped by the top, with its one missing plank leaving a clean gap. Beneath it the river, one solid black ribbon curving from the left edge to the right edge across the lower half. On the black river, one single cream plank with a black outline, the missing one, drifts at a slight angle toward the right edge. No people, no water lines, no bank. Nothing else.`,
  },
  {
    id: 'how-i-move-a-complex-workflow-from-ambiguity-to-release',
    group: 'release',
    device: 'the same string, wound',
    caption: 'The problem in one sentence everyone recognizes, before anyone draws anything: the tangle, wound onto one reel.',
    alt: 'A large terracotta hand reel cropped by the bottom of the frame, the black string wound neatly around it, and one straight black line rising from it off the top edge.',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta kite reel, a simple flat hand-held winder, drawn huge in the lower middle and cropped by the bottom of the frame. The black string from before is wound neatly around it in even parallel turns, drawn as solid black bands. From the top of the reel one single straight taut black line rises and runs off the top edge of the picture toward a kite that is out of frame. No kite, no knot, no hands. Nothing else in the picture.`,
  },
  {
    id: 'what-should-a-working-prototype-actually-prove',
    group: 'release',
    device: 'the same boot, gone',
    caption: 'A real Tuesday: the prototype in the hands of the person who would use it, and what the paper looked like afterward.',
    alt: 'On a terracotta field, one cream sheet of paper with two creases, cropped by the top edge, carrying a single black boot-print across it; the boot has walked off.',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. One single cream sheet of paper with a black outline, drawn very large and cropped by the top edge, lying slightly askew with two simple fold creases drawn as thin black lines. Across the sheet, one solid black shape: the print of a work boot's sole, tread and heel, heading toward the right. The boot itself is gone. No form fields, no writing, no other objects. Nothing else in the picture.`,
  },
];
