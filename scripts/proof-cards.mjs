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
 * 03's redraw spends part of that. Its strap no longer leaves by the right
 * edge; it hangs in a closed U that leaves by the BOTTOM, which is 01's edge.
 * The row survives it because the two shapes are not the same shape -- 01 is a
 * single straight ribbon falling dead centre out of a spout, 03 is a wide slack
 * loop whose two sides rise back into the object -- and because a strap that
 * leaves by the side is the one thing a chinstrap cannot do and still read as
 * worn, which is what the drawing was asked for. It is a real cost, recorded
 * here rather than argued away: the four axes are now vertical, horizontal,
 * a bottom arc, and diagonal up-right. Anything redrawn next should not take
 * the bottom edge as well.
 *
 * Note for anyone re-balancing this: `accent.mjs` bins by HUE over non-grey,
 * non-white pixels, so black and cream do not compete with the accent and the
 * accent does not have to win on area -- it has to be the only chromatic
 * colour in the frame. Even the rejected keystone, a small slate wedge over a
 * large black void, still binned as systems. Hue is not the thing that fails
 * here; legibility is, and nothing in `checks.yml` measures it.
 *
 * The framing was then eased off by ten to twenty percent at the owner's
 * direction, after #147 put the edge-cropped set back: 01 and 04 get a
 * narrow band of ground above and at each side, 02 keeps its base on the
 * bottom edge and gains ground above and beside the horns, 03 stays anchored
 * in the top-left corner but shows the whole brim and dome, and its strap
 * hangs in a natural U and rises off the right edge instead of trailing
 * down. Side bands are asked for at an eighth of the source's width because
 * `step` takes 8% off each side; a twentieth asked for is nothing kept.
 *
 * These were cut to 1080x720, the grid's 3:2, by `illustrate.mjs step` until
 * #150, and that crop is why the pictures kept reading tight however they
 * were drawn: the drawings come back 16:9, `step` took 8% off EACH SIDE to
 * make 3:2, and the side band is exactly where the ground each object is
 * framed with sits. Card 01 was drawn with 10.5% cream at each side and
 * reached the card with 3%. So the slot moved to the shape the drawings are
 * made in -- `illustrate.mjs card`, 640x360, 16:9, no side crop at all
 * (`crop 0x0x1672x941`) -- and `.engagement-figure` is `aspect-ratio: 16 / 9`
 * to match. The picture loses about 30px of height at the 280px column and
 * the file drops from about 20KB to 9KB.
 *
 * Two consequences for anyone writing a prompt here. The preamble's
 * middle-third rule is no longer load-bearing for the SIDES, because nothing
 * is cropped off them any more; it still matters for `og.mjs`, which
 * centre-crops its own card. And a band asked for as "about an eighth of the
 * picture's width" now arrives at that eighth rather than the 3% that
 * survived the crop, so ask for less, not more, if a picture comes back
 * looking lost in its frame.
 *
 * They take `--brightness 1` like the rest of this hand, not the 1.15 the
 * drab engagement batches needed. **03 is the exception, at 0.97**, and the
 * reason is the one thing a per-picture mean cannot see. A generator run
 * returns its own idea of the cream: 01 and 02 came back at ground (234,228,216)
 * and cut to (242,234,223), and 03's third drawing came back at (245,238,224)
 * and cut to (251,242,229) -- nine levels lighter than the two cards standing
 * beside it, on a row of cream plates against charcoal, where the ground IS
 * most of each plate. `--brightness 0.97` puts its top-left back on
 * (242,234,223) exactly. Solve the GROUND against its neighbours, not the mean
 * against the band: every one of these four is outside the 126-184 band by
 * design, so the warning `illustrate.mjs` prints cannot tell you this and the
 * accent check cannot either. `illustrate.mjs wall --match` is this same
 * argument for the engagement set, and does not apply to `card`.
 *
 * 01 AND 03 WERE FRAMED AGAIN AFTER #150, and the two were fixed by different
 * means, which is the point of writing this down.
 *
 * 01's funnel came back with 21px of cream above its rim on a 941px drawing --
 * 2.2%, against the twentieth the prompt asked for and against the 134px, 14%,
 * that 02 happened to return. Side by side that read as the one card jammed
 * into its frame. Nothing was wrong with the DRAWING, so it was not redrawn:
 * `illustrate.mjs --breathe 0.94` resamples it to 94% of the slot on its own
 * ground, centred and anchored to the bottom edge, which puts the band it was
 * short of at the top (21px of source cream becomes 22px of a 360px card, and
 * the sides go from 10.4% to 12.8%) and leaves the black stream running off
 * the bottom where it was drawn to leave. Sliding the drawing down inside its
 * own frame instead would have kept the funnel at full size and taken the
 * slide out of the stream, which is the part of the picture the card is about.
 *
 * 03 was redrawn, because no framing gets there from where it was: the hat was
 * cropped by the left edge and the strap was a swoop off the right, and the
 * ask was a centred hat with the strap worn where a strap is worn. See its
 * entry for what that cost the row's axes.
 *
 * 03 WAS THEN DRAWN A THIRD TIME, by the owner in the same chat and landed
 * from ~/Downloads rather than through `draw.mjs clip`. The single deep U
 * became a worn harness -- a strap from each side of the shell, one from the
 * brim, a chin buckle where they meet -- and the straps leave by the bottom
 * edge instead of the loop's lowest point being clipped by it. The entry's
 * prompt and alt were rewritten to describe what actually shipped rather than
 * what was asked for, because the registry is the thing a future redraw is
 * regenerated from; a prompt left describing the previous picture is how a set
 * drifts one careless re-run at a time. Its "no buckle" also went: the buckle
 * is the part that makes the harness read as worn at 300px.
 *
 * AND THEN CROPPED CLOSER, again by the owner, who sent back a 640x360 PNG --
 * the card's own slot size. That is the thing to notice rather than the
 * framing: a file at the slot size has already been through this pipeline, so
 * it is an UPSCALE of a shipped card rather than a source, and it measured it.
 * Averaged over the picture, its ink-to-ground edges took 2.70px to cross
 * against 2.03px on the card it was cut from and 1.87px on 01. It would have
 * shipped as the one soft card in a row of crisp ones.
 *
 * So the crop was RECOVERED instead of used: normalised cross-correlation of
 * the returned PNG against the shipped card over scale and offset put it at
 * x=43 y=0 w=550 h=309 in card pixels at 0.83, which is 112,0,1436,808 on the
 * 1672x941 source, and `illustrate.mjs card --crop 112,0,1436,808` cuts that
 * composition from the original at 2.36px. **When a drawing comes back at
 * 640x360, ask what it was cut from before cutting it again.** The recovered
 * rectangle is in this comment so the next pass does not have to search for it.
 *
 * The lift stays 0.97, checked rather than assumed: a tighter crop samples a
 * different part of a ground that is not perfectly flat, and it lands the
 * corners on (242,233,221) and (243,234,222) against 01 and 02's
 * (242,234,223). Measure the ground as a PATCH MEAN, not a corner pixel --
 * at 0.86 quality the encoder moves a single pixel several levels, and a
 * one-pixel probe read 0.975 as greener than 0.97 on the same image.
 */

import { STYLE as FEATURE_STYLE } from './writing-features.mjs';
export { REF, ACCENTS, REVEAL, accentLine } from './writing-features.mjs';

/* The features' preamble says every object is cropped by at least two edges,
   and after the breathing-room pass that is true of two of these four and
   false of the other two. The generator weighs the latest sentence most, but
   a preamble that argues with the prompt is a coin it can still land on, so
   the one framing sentence is replaced with one that defers to each prompt.
   It throws if the features' preamble is reworded, so this cannot silently
   drift into agreeing with the rule it means to override. */
const reframe = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`proof-cards.mjs: the features' preamble no longer says "${from.slice(0, 48)}…"; re-derive STYLE`);
  return text.replace(from, to);
};
export const STYLE = reframe(reframe(FEATURE_STYLE,
  'Every picture is ONE large everyday object, drawn bigger than the frame so it is cropped by at least two edges, with empty ground around what remains.',
  'Every picture is ONE large everyday object, drawn big, cropped by the frame only where the prompt says so and otherwise sitting just inside it, with empty ground around what remains.'),
  /* The second sentence the preamble has to stop saying for this set. It
     describes the crop `illustrate.mjs step` used to take -- 8% off each side
     and the top and bottom eighth -- and #150 moved these four to `card`,
     which is 16:9 to 16:9 and takes nothing off any edge. Left in, it is not
     merely stale: it tells the generator the bottom eighth will be thrown
     away, and 03's prompt asks for the chinstrap to be CUT BY the bottom
     edge. A preamble that promises the crop and a prompt that draws into it
     is a coin, and the preamble is the sentence the generator reads first. */
  'Keep the object and its point inside the middle third of the frame, because the sides will be cropped to a card and the top and bottom eighth to 16:9.',
  'Nothing is cropped off these pictures: the frame you draw is the frame that is kept, on every side. So what you put at an edge is what will be seen there, and an object the prompt does not say is cut by an edge has to sit clear of all four.');

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
    alt: 'A large terracotta funnel filling most of the frame with a narrow band of cream above its rim and at each side, one solid black stream falling straight from its spout and off the bottom edge',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta funnel, the plain kitchen kind, seen straight from the side: its wide mouth across the upper part of the picture, the rim drawn as a shallow ellipse so it reads as a mouth. The funnel is drawn almost as big as the frame but sits just inside it: a narrow band of empty cream, about a twentieth of the picture's height, shows above the rim, and the mouth stops well inside the left and right edges, with a band of empty cream at each side about an eighth of the picture's width. Its sides run down and inward to a short narrow spout in the lower middle of the picture. From that spout ONE solid black shape falls: a single straight stream, an even ribbon of solid black, running vertically down and off the bottom edge of the frame. Exactly one stream, and it is the only black shape in the picture. Nothing is in the funnel's mouth and nothing is above it. The terracotta funnel is by far the largest thing in the picture. No table, no jar, no bottle, no drips, no splash, no droplets, no second stream. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '02-system',
    out: 'img/engagement/02-system.webp',
    group: 'systems',
    device: 'the black ribbon, made fast',
    situation: 'Several teams solve the same problem differently.',
    heading: 'Set standards other teams adopt, and keep them adopted',
    alt: 'A large slate cleat planted on the bottom edge of the frame with cream above and beside its horns, one solid black rope turned tight around it and running away taut off both edges',
    prompt: `Same style, same hand as the reference. Cream ground. One large dusty slate blue cleat, the simple T-shaped kind a rope is made fast to, standing upright in the centre of the frame with its base cut off by the bottom edge, so it reads as planted there, but a little smaller than the frame otherwise: its two horns end inside the frame with a band of empty cream beyond each about an eighth of the picture's width, and a band of empty cream above the horns about a tenth of the picture's height. One solid black rope is turned tight around the waist of the cleat, crossing over itself once, and runs away from it in both directions, off the left edge and off the right edge of the frame, drawn as one even ribbon of solid black and pulled straight and taut. The slate cleat is the largest thing in the picture. No boat, no dock, no water, no post, no loose rope ends, no second cleat. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '03-embedded',
    out: 'img/engagement/03-embedded.webp',
    group: 'ai',
    device: 'the black strap, and the object that did the job',
    situation: 'An important initiative exists, but no one senior owns it.',
    heading: 'Own the design inside the team, not beside it',
    alt: 'A large sage hard hat filling most of the frame with a narrow band of cream above its dome, the tip of its brim running off the right edge, its black chinstrap harness running from both sides of the shell down to a buckle beneath the hat and off the bottom edge',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green hard hat, the construction kind with a rounded shell and a short brim at the front, seen from the side with the brim pointing right, drawn big and cropped only by the right edge, which takes the tip of the brim. It is drawn large enough to fill most of the picture: a narrow band of empty cream, about a twentieth of the picture's height, shows above the dome, the back of the shell sits just inside the left edge, and the tip of the brim runs off the right edge. Its silhouette, the dome and the brim, must be unmistakable at a glance. Two or three thin black lines on the shell for its ridges, nothing more. Its chinstrap is ONE solid black ribbon worn where a chinstrap is actually worn, and it is the only black shape in the picture: both of its ends are fastened to the hat, one at the back of the shell and one under the brim at the front, and between them it hangs well below the hat as a worn harness rather than a single loop: a strap down from each side of the shell, a shorter one down from under the brim, and a small chin buckle where they meet below the hat. The straps are long enough to reach the bottom of the picture and are cut off by the bottom edge of the frame, so they run out of the picture there rather than ending in mid-air. The strap does not touch the left edge or the right edge. The sage hard hat is by far the largest thing in the picture. No head, no face, no people, no chin, no neck, no hands, no tools, no ground line, no shadow, no second hat. Nothing else in the picture.

${FLAT}`,
  },
  {
    id: '04-ai',
    out: 'img/engagement/04-ai.webp',
    group: 'release',
    device: 'object on an accent field; past the launch',
    situation: 'Plenty of ideas and sketches. Nothing anyone can use yet.',
    heading: 'Carry the direction into something that works',
    alt: 'A large cream paper dart climbing across a full terracotta field with a band of field above and beside it, one solid black line behind it curving up from the lower left and off the bottom of the frame',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. One large paper airplane, a simple folded paper dart seen from the side, drawn in cream with thin black outlines, drawn big in the middle of the frame but sitting just inside it: a narrow band of terracotta, about a twentieth of the picture's height, shows above the highest point of the dart, and a band of terracotta about an eighth of the picture's width shows beyond it at each side. Its nose is pointed toward the upper right, clearly in flight and climbing. Its folds are drawn as two or three thin black lines, nothing more. Behind it, one solid black line, its flight path, curves up from the lower left of the frame and runs off the bottom edge, drawn as one even ribbon of solid black that ends at the dart's tail. No hands, no sticky notes, no crumpled paper, no pencil, no runway, no clouds, no other planes. Nothing else in the picture.

${FLAT_TERRACOTTA}`,
  },
];
