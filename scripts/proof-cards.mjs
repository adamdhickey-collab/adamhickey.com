/**
 * The four pictures in the homepage's "How I work inside a product
 * organization" grid, at img/engagement/0N-*.webp. `draw.mjs --set proof`
 * reads this to queue the jobs, and to file what comes back.
 *
 * These four were drawn to the ENGAGEMENT set's spec -- painterly flat lays,
 * paper grain, a photographed surface per card, sage / blue / clay / plum --
 * and they are the last four pictures on the site still in that hand. Every
 * drawing the writing pass touched moved to the Atlantic grammar in
 * writing-features.mjs, and the homepage grid sits directly above the band
 * that links into those articles, so the old hand now reads as a different
 * site's artwork two scrolls above the new one.
 *
 * The old four were also before/after pictures: a tangle on the left
 * resolving into parallel lines on the right, loose cards becoming a stamped
 * grid. That is precisely the mode the writing pass abandoned -- a DIAGRAM of
 * the argument rather than an assertion -- and the reason it abandoned it is
 * the reason it matters here: these render at about 300 CSS pixels in a
 * four-up grid, which is where a two-part composition stops being legible at
 * all. So each of these performs the CARD'S VERB on the SITUATION'S NOUN,
 * once. One object, one idea, one intervention. No before, no after.
 *
 * STYLE, REF and the colour line are the feature registry's, imported, so
 * these cannot drift from the articles they sit above.
 *
 * `group` here selects the ACCENT, not an index section: the writing palette
 * is three colours and this grid is four cards, so the three rotate and the
 * fourth flips its ground -- a cream object on a full terracotta field, the
 * device three of the ten features already use. That keeps the grid inside
 * the sanctioned palette instead of inventing a fourth accent, and it keeps
 * `draw.mjs take`'s hue measurement meaningful, since each picture still has
 * one dominant accent to bin. The accent is the dominant area in every frame
 * on purpose: an accent that is only a buckle or a clip measures as cream and
 * the check lies.
 *
 * Object collisions were checked against all twenty drawings in
 * writing-features.mjs and writing-scenes.mjs. Taken, and avoided here:
 * stamp, magnifying glass, key and keyholes, telephone handset, drawer and
 * knobs, venetian blind, pencil and cursor, footbridge, kite and knotted
 * string, work boot. Card 01 links to the ambiguity-to-release article, whose
 * own feature IS a knotted string straightening into a kite line, so 01
 * deliberately does not draw a tangle.
 *
 * 02 took three objects to land, and both failures are worth keeping.
 *
 * It was drawn first as six identical slate boards strapped flush. The
 * collision that caught was not an OBJECT but a GEOMETRY: flat horizontal
 * bands of slate with one black bar across them is the venetian blind from
 * standardizing-ux-across-40-sap-fiori-apps, which is the very article this
 * card's case study belongs to. The systems group's vocabulary is close to
 * exhausted on sameness -- the blind is repetition, the knobs are an
 * inventory, the keyholes are drift -- so the card stopped arguing sameness
 * and argued HOLDING instead, which is what "keep them adopted" means.
 * Check new work against the geometry, not just the noun.
 *
 * The second attempt was a keystone in an arch: right idea, unreadable
 * picture. Cream blocks outlined in black on a cream ground have almost no
 * contrast at 230px, so the only thing that read was the solid black arch
 * opening beneath them -- which, on this section's charcoal ground, looked
 * like a hole punched in the card rather than a shape in a drawing. It
 * measured 111.6 mean luminance against the 217.1 of the compass then in 01,
 * a 105-point gap between two cards standing side by side. **A picture for
 * this grid needs two strong values in it**, and cream-on-cream is not one.
 * The cleat that shipped is slate against cream with a black rope across it,
 * and measures 163.4, inside the engagement band it happens to sit in.
 *
 * 03 and 01 were both redrawn after seeing all four together, and the two
 * faults are worth separating because only one of them is about a picture.
 *
 * 03's sage stone on a stack of paper was the same cream-on-cream mistake as
 * the keystone, plus a second one: a smooth oval has no silhouette, so at
 * 230px it was a green blob. Fixing it by making the paper stack black would
 * have worked and was still wrong, because that is 01's geometry -- object
 * above, black horizontal mass below. The hard hat replaced it: a shape that
 * is unmistakable in outline, specific to the dispatch floor the card links
 * to, and carrying its black as a chinstrap falling diagonally.
 *
 * 01's compass was never a bad drawing; it was a bad NEIGHBOUR. Its black arc
 * and the cleat's black rope were both a band straight across the middle, so
 * two of four cards shared a composition, and a drafting compass is in any
 * case the designer's own tool -- a metaphor from this side of the table
 * rather than the reader's. The funnel says the same sentence in an everyday
 * object (many in, one out) and drops its black stream VERTICALLY.
 *
 * **Watch the axis, not just the object.** The four shipped black shapes run
 * vertical (01), horizontal (02), diagonal down-right (03) and diagonal
 * up-right (04). Two cards sharing an axis is what made the row look
 * repetitive long before any single picture looked wrong.
 *
 * Note for anyone re-balancing this: `accent.mjs` bins by HUE over non-grey,
 * non-white pixels, so black and cream do not compete with the accent and the
 * accent does not have to win on area -- it has to be the only chromatic
 * colour in the frame. Even the rejected keystone, a small slate wedge over a
 * large black void, still binned as systems. Hue is not the thing that fails
 * here; legibility is, and nothing in `checks.yml` measures it.
 *
 * These are cut to 1080x720, the grid's 3:2, by `illustrate.mjs step` rather
 * than the writing set's 16:9 `feature`. The drawings come back 16:9, so the
 * step crop takes the sides off -- which is why the preamble's middle-third
 * rule is load-bearing here too. They take `--brightness 1` like the rest of
 * this hand, not the 1.15 the drab engagement batches needed.
 */

export { STYLE, REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

/* The preamble already forbids gradients and shading, and on this set the
   generator ignored it three times running: 01 came back with the ground
   fading to grey through the bottom half, twice, and only a message naming
   the hex, saying "filled edge to edge with the paint bucket" and telling it
   to sample its own four corners produced a flat field. Three of the eight
   images a sitting allows went on that one fault. So the instruction rides
   on every prompt in this set rather than being discovered again per card.
   `resting.mjs` cannot catch this -- a gradient in a drawing is not a
   contrast failure -- and at 300px in the grid a grey fade reads as a drop
   shadow under the card, which is what made it obvious in the first place.
   The hex has to be the picture's OWN ground, which is why 04 takes its own
   version of this line: it is the one card that flips to a full accent
   field, and a flat-ground instruction naming the cream would argue with the
   prompt three sentences above it. */
const flatLine = (hex) => `The background is ONE flat colour, hex ${hex}, filled edge to edge like a silkscreen print: the four corners and the centre must all be exactly that colour. No gradient, no vignette, no fade, no grey, no ambient shading, no soft shadow under the object, no glow, no "lighting". Flat fills only, everywhere in the picture.`;
const FLAT = flatLine('#EDE6DA');
const FLAT_TERRACOTTA = flatLine('#c0714e');

export const PROOF = [
  {
    id: '01-clarity',
    out: 'img/engagement/01-clarity.webp',
    group: 'release',
    device: 'the many, narrowed to one',
    situation: 'The product grew faster than its structure.',
    heading: 'Turn ambiguity into a decision',
    alt: 'A large terracotta funnel cropped by the top and both sides of the frame, with one solid black stream falling straight from its spout and off the bottom edge',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta funnel, the plain kitchen kind, seen straight from the side: its wide mouth across the top of the frame drawn so big that it is cropped by the top edge and by BOTH the left and the right edge, its sides running down and inward to a short narrow spout in the lower middle of the picture. From that spout ONE solid black shape falls: a single straight stream, an even ribbon of solid black, running vertically down and off the bottom edge of the frame. Exactly one stream, and it is the only black shape in the picture. Nothing is in the funnel's mouth and nothing is above it. The terracotta funnel is by far the largest thing in the picture. No table, no jar, no bottle, no drips, no splash, no droplets, no second stream. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '02-system',
    out: 'img/engagement/02-system.webp',
    group: 'systems',
    device: 'the black ribbon, made fast',
    situation: 'Several teams solve the same problem differently.',
    heading: 'Set standards other teams adopt, and keep them adopted',
    alt: 'A large slate cleat with one solid black rope turned tight around it and running away taut off both edges of the frame',
    prompt: `Same style, same hand as the reference. Cream ground. One large dusty slate blue cleat, the simple T-shaped kind a rope is made fast to, drawn huge in the centre of the frame and cropped by the bottom edge, standing upright. One solid black rope is turned tight around the waist of the cleat, crossing over itself once, and runs away from it in both directions, off the left edge and off the right edge of the frame, drawn as one even ribbon of solid black and pulled straight and taut. The slate cleat is the largest thing in the picture. No boat, no dock, no water, no post, no loose rope ends, no second cleat. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '03-embedded',
    out: 'img/engagement/03-embedded.webp',
    group: 'ai',
    device: 'the black strap, and the object that did the job',
    situation: 'An important initiative exists, but no one senior owns it.',
    heading: 'Own the design inside the team, not beside it',
    alt: 'A large sage hard hat cropped by the top and left of the frame, its black chinstrap falling in one curve and running off the bottom right',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green hard hat, the construction kind with a rounded shell and a short brim at the front, seen from the side, drawn huge and cropped by the top edge and the left edge of the frame. Its silhouette, the dome and the brim, must be unmistakable at a glance. Two or three thin black lines on the shell for its ridges, nothing more. Its chinstrap is ONE solid black ribbon that leaves the back of the hat, falls in a single easy curve and runs off the bottom right corner of the frame. The sage hard hat is by far the largest thing in the picture. No head, no face, no people, no hands, no tools, no ground line, no shadow, no second hat. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '04-ai',
    out: 'img/engagement/04-ai.webp',
    group: 'release',
    device: 'object on an accent field; past the launch',
    situation: 'Plenty of ideas and sketches. Nothing anyone can use yet.',
    heading: 'Carry the direction into something that works',
    alt: 'A large cream paper dart climbing across a full terracotta field, with one solid black line behind it curving up from the lower left and off the bottom of the frame',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. One large paper airplane, a simple folded paper dart seen from the side, drawn in cream with thin black outlines, drawn huge in the middle of the frame and cropped by the top edge, its nose in frame and pointed toward the upper right, clearly in flight and climbing. Its folds are drawn as two or three thin black lines, nothing more. Behind it, one solid black line, its flight path, curves up from the lower left of the frame and runs off the bottom edge, drawn as one even ribbon of solid black that ends at the dart's tail. No hands, no sticky notes, no crumpled paper, no pencil, no runway, no clouds, no other planes. Nothing else in the picture.

${FLAT_TERRACOTTA}`,
  },
];
