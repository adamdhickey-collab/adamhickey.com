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
  /* ---- AI as the material -------------------------------------------- */
  {
    id: 'what-does-a-person-need-to-supervise-an-ai-agent',
    group: 'ai',
    device: 'the same arm, down, and the one thing waiting at it',
    caption: 'The agent has stopped at the line it was given, and what it wants to do next is on the card, waiting for someone to read it.',
    alt: 'The sage boom barrier from the side with its arm lowered level across the picture, a black road band along the bottom of the frame under it, one small cream card on the road directly under the arm, and a small yellow lamp on the post.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large sage green boom barrier as before, in the same strict flat side elevation: one flat plane seen exactly from the side, no vanishing point, no foreshortening, no ellipses, no depth of any kind. The same post near the left edge, the same round pivot on its face. The arm is now lowered level: one thick straight bar of even width running horizontally from the pivot across the middle of the picture and off the right edge, barring the way, and its short tail with the solid black counterweight block now sticks out level to the left of the post. The road is one solid black flat band running horizontally along the whole bottom edge of the frame, the road surface seen from the side, and the post stands on its top edge. On the road band, directly under the middle of the arm, one small plain cream card outlined in black, a small upright rectangle, waiting. The reveal: on the post, above the pivot, one small round lamp filled butter yellow. No people, no cars, no stripes on the arm. Nothing else in the picture.`,
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
    id: 'what-should-a-working-prototype-actually-prove',
    group: 'ai',
    device: 'the same boot, gone',
    caption: 'A real Tuesday: the prototype in the hands of the person who would use it, and what the paper looked like afterward.',
    alt: 'On a sage field, one cream sheet of paper with two creases, cropped by the top edge, carrying a single black boot-print across it; the boot has walked off.',
    prompt: `Same style, same hand as the reference. The ground is the full sage green, edge to edge, instead of cream. One single cream sheet of paper with a black outline, drawn very large and cropped by the top edge, lying slightly askew with two simple fold creases drawn as thin black lines. Across the sheet, one solid black shape: the print of a work boot's sole, tread and heel, heading toward the right. The boot itself is gone. No form fields, no writing, no other objects. Nothing else in the picture.`,
  },

  /* ---- Craft and code --------------------------------------------- */
  {
    id: 'what-does-a-product-design-engineer-actually-do',
    group: 'systems',
    device: 'the same stamp, lifted; its instances',
    caption: 'Instances: one stamp, the same mark every time, and the one that is different is different on purpose.',
    alt: 'The slate stamp lifted clear at the top of the frame, and below it a straight row of four identical black impressions across the cream, the third of them filled dusty rose.',
    prompt: `Same style, same hand as the reference. Cream ground. The same dusty slate blue rubber stamp from before, lifted clear and cropped by the top of the frame, face down. Below it, in one straight evenly spaced horizontal row across the middle of the picture, four identical impressions of its face, simple rounded rectangles: three of them solid black, and the third from the left filled dusty rose instead. Nothing else in the picture.`,
  },
  {
    id: 'what-makes-an-interface-feel-finished',
    group: 'systems',
    device: 'the plane set aside; what it left',
    caption: 'What is left when the work is done: the same stroke every time, and the one that is different is different on purpose.',
    alt: 'The slate hand plane set aside and cropped by the top of the frame, and below it three curls of shaving lying on the cream, two solid black and the middle one dusty rose.',
    prompt: `Same style, same hand as the reference. Cream ground. The same dusty slate blue hand plane from before, set aside at the top of the picture and cropped by the top edge so only its lower half shows. Below it, lying on the cream in one loose evenly spaced row across the middle of the picture, three curls of wood shaving, each a simple spiral: the left and right ones solid black, the middle one filled dusty rose instead. Nothing else in the picture.`,
  },
  {
    id: 'what-does-a-developer-need-from-an-interface-on-a-bad-day',
    group: 'systems',
    device: 'the same panel, the one switch found',
    caption: 'The tripped breaker, found: the whole panel said nothing, and the one switch out of line was the answer.',
    alt: 'The dusty slate breaker panel with every switch flipped up and in line, and beside the one that had been down, a single small round lamp filled butter yellow.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large dusty slate blue breaker panel as before, seen straight on and cropped by all four edges, its two columns of twelve identical rocker switches now all flipped up and in line, none down, each slate with a black outline. Beside the switch near the middle of the left column, the one that had been down, one small round indicator lamp filled butter yellow, the only light on the panel and the reveal. No wires, no labels, no door. Nothing else in the picture.`,
  },

  /* ---- Enterprise and operational software ------------------------------------------ */
  {
    id: 'designing-for-the-moment-the-workflow-breaks',
    group: 'release',
    device: 'the same plank, in the river',
    caption: 'Sent, received, accepted: three different facts, and the thing that fell between the second and third.',
    alt: 'The terracotta footbridge from below its missing plank, and on the black river beneath it the one cream plank, drifting away to the right.',
    prompt: `Same style, same hand as the reference. Cream ground. The same warm terracotta plank footbridge as before, now seen from lower down so that only its underside and handrails show, running edge to edge across the top third of the picture and cropped by the top, with its one missing plank leaving a clean gap. Beneath it the river, one solid black ribbon curving from the left edge to the right edge across the lower half. On the black river, one single cream plank with a black outline, the missing one, drifts at a slight angle toward the right edge. No people, no water lines, no bank. Nothing else.`,
  },
  {
    id: 'what-does-a-design-system-need-once-ai-is-in-the-product',
    group: 'release',
    device: 'the same row, full, and the tag no hook was made for',
    caption: 'Six components, six states, and the one thing the system was never given a hook for, hanging from the board itself.',
    alt: 'The terracotta pegboard with its row of six black hooks each holding a small cream tag, the fourth tag filled dusty rose, and a seventh cream tag hanging from a hole in the board to the right of the row where there is no hook.',
    prompt: `Same style, same hand as the reference. Cream ground. The same large warm terracotta pegboard as before, cropped by all four edges, with the same straight row of six solid black hooks across its middle. Now every hook holds one small plain tag, a rectangle with a black outline and a black string loop, six identical cream tags, except that the tag on the fourth hook is filled dusty rose instead of cream. To the right of the row, one more cream tag hangs by its string loop straight from a hole in the board itself, where there is no hook. No tools, no labels, no shelf. Nothing else on the board.`,
  },
  {
    id: 'standardizing-ux-across-40-sap-fiori-apps',
    group: 'release',
    device: 'the same blind, mid-pull',
    caption: 'The checks in the release process, not in the wiki: one cord, and the last three slats still coming into line.',
    alt: 'The cream venetian blind on a terracotta field, every slat tilted the same way except the bottom three, which still tilt the other way, and the black pull cord drawn taut mid-pull.',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. The same large cream venetian blind as before fills the frame side to side and is cropped by the top and bottom: many identical horizontal slats, evenly spaced, all tilted at the same angle, except the bottom three, which are still tilted the opposite way. The one pull cord, a single solid black line down the right-hand third, is drawn pulled taut at a slight angle rather than hanging straight. No window, no wall, no room. Nothing else.`,
  },
  /* ---- The four that lead, 2026-10-20 ------------------------------- */
  {
    id: 'what-makes-a-good-product-designer-now',
    group: 'release',
    device: 'the same trellis, one shoot cut back',
    caption: 'The line where a person decides: the system carries what grows along it, and someone still chooses what is cut back.',
    alt: 'The terracotta trellis again, closer, its black vine following the lattice, and one shoot that grew off the lattice into empty ground cut cleanly, the cut piece lying below it with a dusty-rose cut face.',
    prompt: `Same style, same hand as the reference. Cream ground. The same warm terracotta garden trellis as before, seen exactly straight on, now closer, so the diamond lattice is cropped by the top, left and bottom edges and ends a little right of the middle, with cream ground to its right. The same solid black vine with simple solid black leaves climbs along the slats. Halfway up, one shoot grew off the edge of the lattice into the empty cream to the right, and it has been cut: the stub ends cleanly at the trellis edge, and the cut piece, a short solid black length of shoot with two leaves, lies on the bottom edge of the frame below it. The reveal: the two cut ends are each a small oval filled dusty rose. No shears, no hands, no ground line. Nothing else in the picture.`,
  },
  {
    id: 'what-changes-when-ai-agents-join-the-product-team',
    group: 'systems',
    device: 'the same road, a draft stretch marked as one',
    caption: 'A draft named as a draft: the stretch nobody has signed for yet is drawn in outline, and it says so before anyone builds on it.',
    alt: 'The dusty slate road from above again, its black dashed centre line running up to a stretch drawn only in black dashed outline with no paving, and one small dusty-rose traffic cone standing where the paving ends.',
    prompt: `Same style, same hand as the reference. Cream ground. The same wide dusty slate blue road as before, in the same strict top-down plan view, flat, running from the bottom edge of the frame up through the middle third, with the same line of solid black centre dashes. A little above the middle of the picture the paving stops in a straight edge. Beyond it, continuing to the top edge, the road goes on only as an outline: two thin black dashed lines where its sides will be, with cream ground between them and no fill. Standing exactly on the line where the paving ends, one small traffic cone seen from above as a circle within a circle, the reveal, filled dusty rose with a black outline. No cars, no signs, no workers. Nothing else in the picture.`,
  },
  {
    id: 'what-is-a-product-designer-for-when-anyone-can-build',
    group: 'ai',
    device: 'the same level, the bubble found',
    caption: 'Good enough, found by building: one shim under the beam, and the bubble between the marks.',
    alt: 'The sage spirit level again on its black beam, one small black wedge driven under the beam’s right end, and the butter-yellow bubble now resting exactly between the two centre marks.',
    prompt: `Same style, same hand as the reference. Cream ground. The same long sage green spirit level as before, in the same strict flat side elevation, cropped by the left edge of the frame, lying on the same solid black beam. This time the beam's right end is visible, inside the frame, and under it, one small wedge, a solid black triangle, has been driven in to shim it up. In the middle of the level, the same window with its two thin black centre marks, and inside it the reveal: the butter yellow bubble now rests exactly between the two marks. No hammer, no tools, no hands. Nothing else in the picture.`,
  },
  {
    id: 'who-decides-when-software-can-act-on-its-own',
    group: 'release',
    device: 'the same seesaw, tipped by what was put on it',
    caption: 'Reliance that matches the evidence: the decision tips by what has been put on it to check, not by how sure the system sounds.',
    alt: 'The cream seesaw on its terracotta field again, its plank now tipped down to the left on the black pivot, a small stack of three cream cards at the low end, and one card in the middle of the stack dusty rose.',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. The same long cream seesaw as before, in the same strict flat side elevation, on the same solid black triangular pivot standing on the bottom edge, still cropped by the left and right edges of the frame. The plank is now tipped down on the left side at a gentle angle, the left end low and the right end high. On the plank near the low left end sits one small neat stack of three plain cards, flat cream rectangles with black outlines, and the reveal: the middle card of the stack is filled dusty rose. Nothing on the high end. No people, no shadow. Nothing else in the picture.`,
  },
];
