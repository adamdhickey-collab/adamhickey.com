/**
 * The second drawing for each article: the argument's second half, drawn,
 * in the engagement set's style. draw.mjs reads this to queue the jobs for a
 * browser to draw, and to file what comes back.
 *
 * The preamble is the one PR #53 sent for the ten features, to the letter,
 * with the same reference image, so the new ten sit in the set. Every scene
 * opens "Same style" and asks for 16:9; the middle band of the frame is what
 * survives illustrate.mjs's crop. One terracotta object per picture, and it
 * is the point of the picture; no text anywhere, because the checks cannot
 * read a label in a bitmap and the spec says so.
 */

export const REF = 'img/engagement/02-system.webp';

export const STYLE = `The attached image is the style reference for everything in this conversation. Flat, matte, painterly vector illustration with fine paper grain over the whole picture. Palette held to: warm cream paper, muted sage green, dusty slate blue, charcoal navy, and exactly ONE terracotta object per picture, which is the point of the picture. Soft, even light; no gradients, no gloss, no photographic realism, no 3D render, no outlines. People, when present, are drawn with real faces and hands, not block figures or dot eyes. No text, letters, numbers, logos or readable labels anywhere: screens and documents are wireframe blocks and lines only. Landscape, the scene filling the frame edge to edge, no border, no rounded corners, no mat. Keep the important subject inside the middle band of the frame, because the top and bottom eighth will be cropped to 16:9.`;

export const SCENES = [
  {
    id: 'why-enterprise-ux-problems-are-organizational-problems',
    caption: 'The decision nobody is placed to make, and the chair it would sit in.',
    alt: 'A conference room from the door. Five people along a long table all face the head of it, where one chair stands empty and terracotta. On the wall behind it, a large wireframe screen with one panel missing.',
    prompt: `Same style, wide 16:9 landscape frame. A conference room seen from the door. A long table with five people seated along its sides, each with a laptop or a paper wireframe in front of them, all of them turned toward the head of the table, where one chair stands empty. The empty chair is terracotta, the only terracotta in the picture. On the wall behind the empty chair, a large wireframe screen with one panel missing, a blank cream rectangle where a block should be. Sage wall, slate chairs, cream floor, a plant in the corner. Nobody is speaking.`,
  },
  {
    id: 'what-microsofts-hax-framework-gets-right-about-enterprise-ai',
    caption: 'Disagreement made cheap: the card she chose goes in, and nothing asks her whether she is sure.',
    alt: 'A dispatcher at a wall board of wireframe cards lifts the card the board placed out of its slot with one hand and slides in her own, terracotta, with the other. No barrier, no warning. A second dispatcher works on without looking up.',
    prompt: `Same style, wide 16:9 landscape frame. A dispatch office. A woman stands at a large wall board of wireframe cards arranged in a grid of rows, a slot in one row already holding a slate card the board has placed there. She is calmly lifting that card out with one hand and sliding in a different card with the other; the card she chose is terracotta. No barrier, no warning panel, no second person in her way. Behind her, a window with early light, a desk with a cold cup of coffee, a second dispatcher working at a monitor and not looking up. Everything on the board and the screens is wireframe blocks and lines only, no text.`,
  },
  {
    id: 'enterprise-ai-should-help-people-decide-not-just-answer',
    caption: 'The recommendation on the desk, and beside it the twelve records it is about.',
    alt: 'A desk from above. One small wireframe card, the recommendation, and beside it an open folder with twelve paper records fanned out, each with the same one field blank. Two hands: one on the card, one lifting a record. The folder tab is terracotta.',
    prompt: `Same style, wide 16:9 landscape frame. A desk seen from above at a slight angle. In the center, one small wireframe card, the recommendation, resting on the desk. Directly beside it lies an open folder spread wide, and out of it fan twelve paper records, each a wireframe document with the same one field left blank as an empty rectangle. A person's two hands are in frame: one hand rests on the card, the other lifts one of the records to look at it. The folder's tab is terracotta, the only terracotta in the picture. A mug, a pen, a plant leaf at the edge; sage desk, cream papers, slate card.`,
  },
  {
    id: 'what-should-a-working-prototype-actually-prove',
    caption: 'A real Tuesday: the prototype in the hands of the person who would use it, where they would use it.',
    alt: 'A loading dock mid-morning. A man in a work jacket between stacks of crates looks at a handheld device showing a wireframe app. On the crate beside him, a clipboard of creased paper forms with one crumpled terracotta sheet clipped on top. A truck at the open dock door, a forklift, another worker.',
    prompt: `Same style, wide 16:9 landscape frame. A loading dock in the middle of a working morning. A man in a work jacket stands between two stacks of crates, holding a handheld device in one hand and looking at it while his other hand rests on a crate; the device screen shows a simple wireframe app. On the crate beside him lies a clipboard of dog-eared, creased paper forms, and one crumpled sheet is clipped to the top of it, terracotta, the only terracotta in the picture. Behind him, the open dock door, a truck backed up to it, a forklift, another worker moving a pallet. Sage crates, slate truck, cream sky.`,
  },
  {
    id: 'designing-for-the-moment-the-workflow-breaks',
    caption: 'Sent, received, accepted: three different facts, and the parcel stalled between the last two.',
    alt: 'Three desks in a row joined by a conveyor. At the first a person drops a parcel into a chute; at the second a parcel has arrived on the counter; at the third a stamp is raised, waiting. The belt between the second and third is broken, and a terracotta parcel sits stalled at the gap.',
    prompt: `Same style, wide 16:9 landscape frame. Three stations in a row across the picture, connected by a conveyor line running left to right. On the left, a sending desk where a person drops a parcel into a chute. In the middle, a receiving desk where a second person has taken a parcel in and set it on the counter. On the right, an acceptance desk with a large ink stamp raised in a third person's hand, waiting. The conveyor between the middle and the right station is broken: a gap in the belt, and one parcel sits stalled at the edge of the gap. That parcel is terracotta, the only terracotta in the picture. Slate conveyor, sage desks, cream wall, no text on any parcel or sign.`,
  },
  {
    id: 'how-i-move-a-complex-workflow-from-ambiguity-to-release',
    caption: 'The problem in one sentence everyone in the room recognizes, before anyone draws anything.',
    alt: 'A meeting room. A wide whiteboard carrying a single long hand-drawn line, standing in for one sentence. Five people face it: a product manager, two engineers with laptops, a support person, and a designer at the board holding a terracotta marker. Abandoned wireframe sketches on the table.',
    prompt: `Same style, wide 16:9 landscape frame. A meeting room seen straight on. A wide whiteboard on the back wall, almost empty except for one long single hand-drawn line across its middle, a wavy stroke standing in for one sentence, no letters. Five people stand and sit facing it: a product manager, two engineers with laptops, a support person, a designer at the board holding the marker. The marker is terracotta, the only terracotta in the picture. On the table in front of them, a scatter of abandoned wireframe sketches and a closed laptop. Sage wall, slate chairs, cream floor. Everyone is looking at the line.`,
  },
  {
    id: 'when-does-a-product-need-a-design-system',
    caption: 'The inventory: every version of every component on one table, the duplicates tagged.',
    alt: 'A long table in a bright workshop, laid with thirty or so printed wireframe components in a row, several of them near-duplicates of their neighbour. A woman walks its length with a clipboard. A terracotta tag lies across two near-identical data tables.',
    prompt: `Same style, wide 16:9 landscape frame. A long table running the full width of the picture in a bright workshop. Laid out along it in a neat row, thirty or so printed wireframe components on cards: buttons, data tables, dialogs, filter bars, some of them obviously near-duplicates of the one beside them. A woman walks the length of the table with a clipboard, looking down at the cards. Where two near-identical data tables lie side by side, a small terracotta tag has been placed across both of them, the only terracotta in the picture. Shelves of binders behind, a plant, cream walls, sage table, slate cards.`,
  },
  {
    id: 'standardizing-ux-across-40-sap-fiori-apps',
    caption: 'The checks in the release process, not in the wiki: three gates on the line and a stamp at the last.',
    alt: 'A calm assembly line carrying framed wireframe app screens past three arched gates, a person at each: one with a ruler, one with a magnifier, one with an ink stamp. The screen passing the last gate carries a fresh terracotta stamp mark. Finished screens stack on a cart beyond.',
    prompt: `Same style, wide 16:9 landscape frame. A calm assembly line running left to right, carrying framed wireframe app screens on a belt. Along the line stand three gates, each a simple arch with a person beside it: the first person holds a ruler to a screen, the second has a magnifier over one, the third holds an ink stamp. The screen passing the third gate has just been stamped, and the stamp mark on it is terracotta, the only terracotta in the picture. Past the last gate, finished screens are stacked neatly on a cart. Slate belt, sage arches, cream floor, no text on any screen or gate.`,
  },
  {
    id: 'is-your-design-system-ready-for-ai-agents',
    caption: 'Give an agent a real task and watch: the output is a list of what the system never made legible.',
    alt: 'A drafting desk. A mechanical pen plotter draws a wireframe app screen from an open rulebook of component diagrams beside it. The drawing is almost right, except one button in the wrong place and shape, terracotta. A man on a stool watches with a notebook, not touching the pen.',
    prompt: `Same style, wide 16:9 landscape frame. A drafting desk in a quiet studio. A mechanical pen plotter, the kind with a moving arm, is drawing a wireframe app screen onto a large sheet, working from a thick rulebook lying open beside it, its pages showing wireframe component diagrams. The drawing is nearly finished and almost correct, except for one button the plotter has drawn in the wrong place and the wrong shape; that button is terracotta, the only terracotta in the picture. A man sits on a stool beside the desk with a notebook on his knee, watching the pen, not touching it. No robot, no face on the machine. Cream walls, sage desk, slate plotter.`,
  },
  {
    id: 'where-does-design-end-and-development-begin-now',
    caption: 'Leverage, not rescue: twenty panels done, and an engineer checking the one that matters.',
    alt: 'Open shelving holding a row of twenty finished wireframe panels. A designer on the left slides the last one into its slot. On the right an engineer at a bench under a lamp examines one panel with a loupe; a terracotta clip holds a small tag to it.',
    prompt: `Same style, wide 16:9 landscape frame. A workshop wall of open shelving holding a row of finished wireframe panels standing upright like framed prints, twenty or so, all done. A designer on the left is sliding the last panel into its slot on the shelf. On the right, an engineer sits at a bench under a lamp with just one panel pulled out and laid flat in front of her, examining it with a loupe; a terracotta clip holds a small tag to that one panel, the only terracotta in the picture. Between them, an ordinary wall clock and a mug. Cream wall, sage shelving, slate bench, no text anywhere.`,
  },
];
