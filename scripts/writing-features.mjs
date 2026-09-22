/**
 * The feature drawing for each article: the one at the top of the page and,
 * cut from the same source, the card beside its entry on the index.
 * `draw.mjs --set features` reads this to queue the jobs, and to file what
 * comes back.
 *
 * These have been drawn four times. The first pass was the engagement set's
 * painterly scenes, with people in them; the second a shaded isometric
 * render; the third, shipped in #115, isometric line art; the fourth, never
 * shipped, the same line art cut down to two or three objects. All four
 * kept the rules a magazine art department would recognise (no text, one
 * accent, few objects) and lost the one that matters: they were DIAGRAMS of
 * the argument. A card with a wireframe and a toggle explains. A torn
 * stamp asserts.
 *
 * This pass borrows The Atlantic's grammar and draws it in one hand. The
 * grammar, read off eighteen of their September 2026 leads: take the
 * essay's most literal noun and perform the essay's verb on it once. One
 * object, one idea, one intervention. The subject in the middle third,
 * because every card and share image is a machine centre-crop of the same
 * 16:9 master, which is exactly what illustrate.mjs and og.mjs do here.
 * Their variety comes from rotating the DEVICE under a held palette -- a
 * reveal inside the object, something torn or missing, one thing
 * multiplied with drift, repetition as texture, the object on a full
 * colour field -- and each of the ten below names which device it uses.
 *
 * The hand is the reference image: a flat vector illustration, thin
 * near-black outlines of one weight on every shape, a putty-cream ground
 * rather than white, ONE everyday object drawn bigger than the frame and
 * cropped by it, and black used as a solid shape (a strap, a cord, a
 * shadow-silhouette) rather than as shading. That last device is the most
 * reusable thing in the picture and six of the ten lean on it.
 *
 * COLOUR IS STILL THE INDEX'S SECTIONS. The object's body is the section's
 * accent, so a reader scrolling the index still sees three groups, and
 * `draw.mjs take` still measures the dominant hue of what comes back
 * (scripts/lib/accent.mjs) and says which group it landed in. Three of the
 * ten flip the ground and the object -- cream object on a full accent field
 * -- which reads even harder as its section. Two colours are new, and are
 * allowed ONLY inside a reveal, never as the object: butter yellow #F0DF7C
 * and dusty rose #D9A3B4, the sunrise in the reference's lenses. Both are
 * saturated enough for accent.mjs to bin, and rose bins as "release", so a
 * reveal has to stay small next to its object or the measurement lies. The
 * README's style spec for artwork is where those two get their sentence.
 *
 * The feature is cut to 1600x900 and the card to 640x360 by
 * `illustrate.mjs feature` and `card` from the one source, so every prompt
 * keeps the object's point inside the middle third.
 */

export const ACCENTS = {
  'ai':      { name: 'muted sage green',  hex: '#657d60', section: 'AI as the material' },
  'systems': { name: 'dusty slate blue',  hex: '#56718c', section: 'Craft and code' },
  'release': { name: 'warm terracotta',   hex: '#c0714e', section: 'Enterprise and operational software' },
  /* The keys predate the 2026-09-17 regrouping and are what accent.mjs bins
     by, so they kept their names when the sections took the three leads'. */
};

/* The two colours a reveal may add. Named here so draw.mjs's per-job colour
   line and the preamble cannot drift apart. */
export const REVEAL = {
  yellow: { name: 'butter yellow', hex: '#F0DF7C' },
  rose:   { name: 'dusty rose',    hex: '#D9A3B4' },
};

/* The style anchor is not one of ours: a pair of sage binoculars on putty
   cream, cropped by three edges, a black strap snaking behind, and a sunrise
   inside each lens. It is tracked at this path by a .gitignore exception,
   like hax-framework.png before it, because a reference that lives only in
   the inbox is a reference the next pass cannot see. */
export const REF = 'img/inbox/reference-binoculars.png';

export const STYLE = `The attached image is the style reference for every picture in this conversation. Match its hand exactly: a flat vector illustration with thin near-black outlines of one even weight on every shape, flat fills, no shading, no hatching, no gradients except one soft one where I ask for it, no paper texture, no gloss, no 3D, no photographic look, no drop shadows, no border or frame. The ground is a warm putty cream, not white. No people, no hands. No text, letters, numbers, logos or readable labels anywhere.

Every picture is ONE large everyday object, drawn bigger than the frame so it is cropped by at least two edges, with empty ground around what remains. Black is used as a solid shape, never as a shadow: a strap, a cord, a shadow-silhouette, one ribbon that runs behind the object and off the frame. Colour is held to the object's one accent colour, which I will name each time in words and hex, plus black and the cream ground; where I ask for a reveal, a small second picture inside the object, it may also use ${REVEAL.yellow.name} ${REVEAL.yellow.hex} and ${REVEAL.rose.name} ${REVEAL.rose.hex}, and nothing else.

These are read at about 300 pixels wide on an index and at full width on the page. Keep the object and its point inside the middle third of the frame, because the sides will be cropped to a card and the top and bottom eighth to 16:9. One object, one idea, one intervention. Landscape, filling the frame edge to edge. Simpler than you think is correct.`;

/* The colour sentence draw.mjs appends to every job. The thread holds the
   style but not which of the three colours this picture takes, and the old
   sentence ("No other colour anywhere") would have argued with the black
   shapes and the reveal the preamble just allowed. */
export const accentLine = (group) => {
  const a = ACCENTS[group];
  return `The object's accent colour in this picture is ${a.name}, ${a.hex}. The only other colours are the putty-cream ground, black, and, inside a reveal only and never on the object, ${REVEAL.yellow.name} ${REVEAL.yellow.hex} and ${REVEAL.rose.name} ${REVEAL.rose.hex}.`;
};

export const FEATURES = [
  /* ---- AI as the material -------------------------------------------- */
  {
    id: 'what-does-a-person-need-to-supervise-an-ai-agent',
    group: 'ai',
    device: 'one intervention, held: the arm that has not come down',
    alt: 'A large sage boom barrier, its post cropped by the left edge, its arm raised partway and running off the top of the frame, and the arm\u2019s black shadow lying across the empty cream ground.',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green boom barrier, the kind at a rail crossing or a garage: a plain thick post at the left, cropped by the left edge and the bottom of the frame, and its long arm raised to about forty-five degrees, running up and off the top-right corner. The arm is sage with a black outline and drawn thick. At the pivot on the post, one solid black counterweight. On the ground, the arm's shadow-silhouette is one solid black diagonal shape. The road under it is empty cream; nothing is passing. No people, no cars, no stripes on the arm. Nothing else in the picture.`,
  },
  {
    id: 'enterprise-ai-should-help-people-decide-not-just-answer',
    group: 'ai',
    device: 'reveal',
    alt: 'A large sage magnifying glass, its handle running off the corner, and inside the lens three stacked documents with one small field lit yellow.',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green magnifying glass, drawn so big that its handle runs off the bottom-right corner and its rim nearly touches the top of the frame. The lens is the reveal: inside the circle, three plain cream documents stacked slightly fanned, outlined in black, each with two or three short black rule-lines, and on the top document one single small field filled butter yellow. Outside the lens the ground is empty cream. A black shadow-silhouette of the handle lies on the ground behind it. Nothing else.`,
  },
  {
    id: 'what-should-a-working-prototype-actually-prove',
    group: 'ai',
    device: 'object on an accent field; tested where it is used',
    alt: 'A cream work boot planted on a sage field, cropped by the left edge, with one black splash of mud spreading from under its sole.',
    prompt: `Same style, same hand as the reference. The ground is the full sage green, edge to edge, instead of cream. One large work boot in cream with black outlines, seen from the side, drawn so big it is cropped by the left edge and the top, its sole planted flat. Under the sole, one solid black shape: a wide splash of mud, spreading from beneath the boot toward the right, the only thing on the ground. The boot is plain and worn, laces drawn as simple black lines. Nothing else.`,
  },

  /* ---- Craft and code --------------------------------------------- */
  {
    id: 'what-does-a-product-design-engineer-actually-do',
    group: 'systems',
    device: 'the stamp and its mark',
    alt: 'A large dusty slate rubber stamp pressed down on cream ground, cropped by the top of the frame, and to its right the impression it has just left, one solid black mark the exact shape of the stamp\u2019s face.',
    prompt: `Same style, same hand as the reference. Cream ground. One large rubber stamp in dusty slate blue with black outlines, its handle cropped by the top of the frame, pressed face down onto the ground in the left half of the picture. To its right, on the cream, the single impression it has just made: one solid black shape, the exact outline of the stamp's face, a simple rounded rectangle. Nothing else in the picture.`,
  },
  {
    id: 'what-makes-an-interface-feel-finished',
    group: 'systems',
    device: 'the plane and its one curl',
    alt: 'A large dusty slate hand plane, its rear handle cropped by the right edge of the frame and its sole flat on the cream ground, and one solid black curl of shaving rising from its mouth and off the top edge.',
    prompt: `Same style, same hand as the reference. Cream ground. One large woodworking hand plane in dusty slate blue with black outlines, drawn from the side and slightly above, so big that its rear handle is cropped by the right edge and its front knob by the top. Its flat sole rests on the ground line across the lower third of the picture. From the mouth in its sole, one single thick curl of wood shaving rises and spirals up and off the top edge of the frame, drawn as a solid black shape. Nothing else in the picture.`,
  },
  {
    id: 'what-does-a-developer-need-from-an-interface-on-a-bad-day',
    group: 'systems',
    device: 'repetition as texture, one out of line',
    alt: 'A large dusty slate breaker panel cropped by the frame, two columns of identical rocker switches all flipped up except one near the middle of the left column, which is flipped down and solid black.',
    prompt: `Same style, same hand as the reference. Cream ground. One large electrical breaker panel in dusty slate blue with black outlines, seen straight on and drawn so big it is cropped by all four edges of the frame. On the panel, two neat vertical columns of identical rocker switches, twelve in all, evenly spaced, each a simple rounded rectangle with a black outline and a thin black line across it for the rocker's edge. Every switch is flipped up, slate like the panel, except exactly one, near the middle of the left column, which is flipped down and is solid black. No wires, no labels, no lights, no door. Nothing else in the picture.`,
  },

  /* ---- Enterprise and operational software ------------------------------------------ */
  {
    id: 'designing-for-the-moment-the-workflow-breaks',
    group: 'release',
    device: 'one intervention, missing',
    alt: 'A terracotta plank footbridge running edge to edge with exactly one plank missing, and a black river curving beneath it and showing through the gap.',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta plank footbridge seen from slightly above, running from the left edge to the right edge of the frame, drawn big enough that its two handrails are cropped by the top. Its planks are even and identical except that exactly one plank, just right of centre, is missing, leaving a clean gap. Beneath the bridge one solid black ribbon, the river, curves from the bottom left to the right edge and shows through the gap. No people, no water lines, no bank. Nothing else.`,
  },
  {
    id: 'what-does-a-design-system-need-once-ai-is-in-the-product',
    group: 'release',
    device: 'repetition as texture, with a reveal on one hook',
    alt: 'A large terracotta pegboard cropped by the frame, a straight row of six black hooks across its middle, five of them empty and the fourth holding one small butter-yellow tag.',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta pegboard, a flat board with a regular grid of small round holes, drawn so big it is cropped by all four edges of the frame. Across the middle of the board, one straight row of six identical hooks, evenly spaced, each one a simple solid black shape. Five of the hooks are empty. From the fourth hook hangs one small plain tag, a rectangle with a black outline and a black string loop, and the tag is the reveal: it is filled butter yellow. No tools, no labels, no shelf. Nothing else on the board.`,
  },
  {
    id: 'standardizing-ux-across-40-sap-fiori-apps',
    group: 'release',
    device: 'repetition as texture, on an accent field',
    alt: 'A cream venetian blind of eight thick slats filling a terracotta field, every slat tilted the same way, and one black pull cord hanging straight down.',
    /* Thirteen thin slats read as a wall of stripes at the hero's full width;
       eight thick ones read as a blind. The count is in the prompt twice. */
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. One large venetian blind in cream with black outlines fills the frame from side to side and is cropped by the top and bottom: exactly EIGHT identical horizontal slats, no more, each slat thick, about as tall as the gap of terracotta showing between it and the next, evenly spaced, all tilted at exactly the same angle. Eight slats only, drawn big. One pull cord, a single solid black line, hangs straight down the right-hand third from the top of the frame to the bottom, and is the only thing that is not a slat. No window, no wall, no room. Nothing else.`,
  },
];
