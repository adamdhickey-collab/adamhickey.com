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
  'ai':      { name: 'muted sage green',  hex: '#657d60', section: 'AI in the workflow' },
  'systems': { name: 'dusty slate blue',  hex: '#56718c', section: 'Systems and teams' },
  'release': { name: 'warm terracotta',   hex: '#c0714e', section: 'Getting to a release' },
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
  /* ---- AI in the workflow -------------------------------------------- */
  {
    id: 'what-microsofts-hax-framework-gets-right-about-enterprise-ai',
    group: 'ai',
    device: 'one intervention, withheld',
    alt: 'A large sage rubber stamp held an inch above a plain card, its black shadow offset on the ground; the stamp has not come down and the card is unmarked.',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green rubber stamp, the kind with a wooden handle and a rubber base, drawn huge and cropped by the top of the frame, held an inch above the ground, not pressed down. Its shadow-silhouette on the ground is one solid black shape, offset so the gap between stamp and shadow is obvious. Beneath the stamp, one plain cream card outlined in black, empty, no mark on it. The stamp has not come down; the card is still unmarked. Nothing else in the picture.`,
  },
  {
    id: 'enterprise-ai-should-help-people-decide-not-just-answer',
    group: 'ai',
    device: 'reveal',
    alt: 'A large sage magnifying glass, its handle running off the corner, and inside the lens three stacked documents with one small field lit yellow.',
    prompt: `Same style, same hand as the reference. Cream ground. One large sage green magnifying glass, drawn so big that its handle runs off the bottom-right corner and its rim nearly touches the top of the frame. The lens is the reveal: inside the circle, three plain cream documents stacked slightly fanned, outlined in black, each with two or three short black rule-lines, and on the top document one single small field filled butter yellow. Outside the lens the ground is empty cream. A black shadow-silhouette of the handle lies on the ground behind it. Nothing else.`,
  },
  {
    id: 'is-your-design-system-ready-for-ai-agents',
    group: 'ai',
    device: 'multiplied with drift, on an accent field',
    alt: 'A cream key lying across a sage field above a row of five black keyholes, each a slightly different shape; the first fits the key and the last does not.',
    prompt: `Same style, same hand as the reference. The ground is the full sage green, edge to edge, instead of cream. One large old-fashioned key in cream with a black outline, lying horizontally across the upper middle, its bow cropped by the left edge. Below it, a row of five keyholes drawn as solid black shapes on the sage, evenly spaced, and every keyhole a slightly different shape from the one before: the first matches the key's bit exactly, the last does not match it at all. No locks, no doors, no other objects. Nothing else in the picture.`,
  },

  /* ---- Systems and teams --------------------------------------------- */
  {
    id: 'why-enterprise-ux-problems-are-organizational-problems',
    group: 'systems',
    device: 'the black ribbon; the symptom and the cause',
    alt: 'A large slate telephone handset hanging from the top of the frame, its black coiled cord looping through the picture and cleanly cut in the middle.',
    prompt: `Same style, same hand as the reference. Cream ground. One large dusty slate blue desk telephone handset, drawn huge and cropped by the top of the frame, hanging as if just lifted. Its coiled cord is one solid black ribbon that loops down through the middle of the picture and runs off the right edge, and somewhere in the middle of that ribbon the cord is cleanly cut, the two ends an inch apart. Nothing else: no phone base, no desk, no other objects.`,
  },
  {
    id: 'when-does-a-product-need-a-design-system',
    group: 'systems',
    device: 'reveal, inventory',
    alt: 'A large slate drawer pulled open toward the viewer, holding a neat grid of near-identical cream knobs, one of them dusty rose.',
    prompt: `Same style, same hand as the reference. Cream ground. One large dusty slate blue drawer pulled open toward the viewer, drawn so big that the cabinet it belongs to is cropped by the top and both sides of the frame. The open drawer is the reveal: inside it, a neat grid of round drawer knobs, twelve or so, all nearly the same, drawn in cream with black outlines, and one of them, near the middle, filled dusty rose. The drawer's own handle is a solid black shape. Nothing else.`,
  },
  {
    id: 'standardizing-ux-across-40-sap-fiori-apps',
    group: 'systems',
    device: 'repetition as texture, on an accent field',
    alt: 'A cream venetian blind of eight thick slats filling a slate field, every slat tilted the same way, and one black pull cord hanging straight down.',
    /* Thirteen thin slats read as a wall of stripes at the hero's full width;
       eight thick ones read as a blind. The count is in the prompt twice. */
    prompt: `Same style, same hand as the reference. The ground is the full dusty slate blue, edge to edge, instead of cream. One large venetian blind in cream with black outlines fills the frame from side to side and is cropped by the top and bottom: exactly EIGHT identical horizontal slats, no more, each slat thick, about as tall as the gap of slate showing between it and the next, evenly spaced, all tilted at exactly the same angle. Eight slats only, drawn big. One pull cord, a single solid black line, hangs straight down the right-hand third from the top of the frame to the bottom, and is the only thing that is not a slat. No window, no wall, no room. Nothing else.`,
  },
  {
    id: 'where-does-design-end-and-development-begin-now',
    group: 'systems',
    device: 'the black shape says the second thing',
    alt: 'A large slate pencil lying diagonally across the frame, and where its tip meets the ground its shadow is not a pencil but a single black text cursor.',
    prompt: `Same style, same hand as the reference. Cream ground. One large dusty slate blue pencil lying diagonally across the picture, drawn so big that both ends run off the frame, sharpened point toward the lower right. Its shadow on the ground is one solid black shape, and the shadow is not a pencil: it is a single tall thin rectangle, a text cursor, standing upright at the point where the pencil's tip would touch the ground. One object, one shadow, and they are two different things. Nothing else.`,
  },

  /* ---- Getting to a release ------------------------------------------ */
  {
    id: 'designing-for-the-moment-the-workflow-breaks',
    group: 'release',
    device: 'one intervention, missing',
    alt: 'A terracotta plank footbridge running edge to edge with exactly one plank missing, and a black river curving beneath it and showing through the gap.',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta plank footbridge seen from slightly above, running from the left edge to the right edge of the frame, drawn big enough that its two handrails are cropped by the top. Its planks are even and identical except that exactly one plank, just right of centre, is missing, leaving a clean gap. Beneath the bridge one solid black ribbon, the river, curves from the bottom left to the right edge and shows through the gap. No people, no water lines, no bank. Nothing else.`,
  },
  {
    id: 'how-i-move-a-complex-workflow-from-ambiguity-to-release',
    group: 'release',
    device: 'the black ribbon as the whole path',
    alt: 'A terracotta kite in the upper right on one continuous black string that begins as a tight knot in the lower left and straightens as it rises.',
    prompt: `Same style, same hand as the reference. Cream ground. One large warm terracotta kite, a plain diamond with a black outline, in the upper right, cropped by the top edge. Its string is one continuous solid black line: it begins at the bottom left of the frame as a tight tangled knot of that one line looping over itself, then unwinds and straightens as it rises, and reaches the kite as a single clean taut line. It must read as one unbroken string from the knot to the kite. Nothing else in the picture, no clouds, no ground line, no tail.`,
  },
  {
    id: 'what-should-a-working-prototype-actually-prove',
    group: 'release',
    device: 'object on an accent field; tested where it is used',
    alt: 'A cream work boot planted on a terracotta field, cropped by the left edge, with one black splash of mud spreading from under its sole.',
    prompt: `Same style, same hand as the reference. The ground is the full warm terracotta, edge to edge, instead of cream. One large work boot in cream with black outlines, seen from the side, drawn so big it is cropped by the left edge and the top, its sole planted flat. Under the sole, one solid black shape: a wide splash of mud, spreading from beneath the boot toward the right, the only thing on the ground. The boot is plain and worn, laces drawn as simple black lines. Nothing else.`,
  },
];
