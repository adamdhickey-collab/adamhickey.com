/* Draw the four built-step drawings as true isometric line drawings.

   These are literal rather than figurative. The homepage already carries
   one figure of speech above this panel -- the isometric wireframe tree in
   the story scene -- and the first set of step drawings stacked three more
   on top of it (a ghost building, a bare room, a plant in a planter). A
   reader who has just watched a tree get pruned should not then be asked
   to read a watering can. So each step now shows the thing itself:

     01  a wireframe, on paper, of the pages that are going to exist
     02  a design-system board: swatches, type, a button, a component
     03  the site in a browser, with its address, and the same on a phone
     04  the guide written for them, open, with the editor printed in it

   One terracotta object each, as before: the pen, one swatch, the address
   bar, the ribbon.

   04 was a laptop too, and the pair read as one picture printed twice --
   a laptop one step after a laptop, at the same size, in the same place.
   The thing this step hands over is the writing, so the writing is what
   it shows now.

   Projection: X = (x - y) * cos30, Y = (x + y) * sin30 - z. +x runs
   down-right, +y down-left, +z up. A screen that faces the reader is a
   rectangle in a plane of constant y; a sheet on the table is a rectangle
   in the plane z = 0.

   usage: CHROME=<chrome binary> node scripts/built-steps.mjs <01|02|03|04|all> <out-dir>

   Each PNG then goes through scripts/recompose.mjs before it goes in
   img/site/, which is where the framing and the pinned ground come from.
   The --fill each of the four was framed at is not the same number:

     node scripts/recompose.mjs step-01.png img/site/built-step-01-shape.webp --fill 0.834
     node scripts/recompose.mjs step-02.png img/site/built-step-02-world.webp --fill 0.837
     node scripts/recompose.mjs step-03.png img/site/built-step-03-open.webp  --fill 0.944
     node scripts/recompose.mjs step-04.png img/site/built-step-04-alive.webp --fill 0.882
*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const C30 = Math.cos(Math.PI / 6);
const U = 44;
const INK = '#252525';
const GROUND = '#e8ede5';
const TERRA = '#c1714f';
const LW = 2.2, LW_THIN = 1.4;

const P = (x, y, z) => [ (x - y) * C30 * U, ((x + y) * 0.5 - z) * U ];
const pts = a => a.map(p => P(...p)).map(([X, Y]) => `${X.toFixed(1)},${Y.toFixed(1)}`).join(' ');
const face = (a, o = {}) =>
  `<polygon points="${pts(a)}" fill="${o.fill || GROUND}" stroke="${o.stroke || INK}" stroke-width="${o.w ?? LW}" stroke-linejoin="round"/>`;
const seg = (a, b, w = LW_THIN, dash = '') => {
  const [x1, y1] = P(...a), [x2, y2] = P(...b);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
};

// a rectangle standing in the plane y = Y, facing the reader (down-left)
const rectXZ = (x0, x1, Y, z0, z1, o) => face([[x0,Y,z0],[x1,Y,z0],[x1,Y,z1],[x0,Y,z1]], o);
// a rectangle lying in the plane z = Z
const rectXY = (x0, x1, y0, y1, Z, o) => face([[x0,y0,Z],[x1,y0,Z],[x1,y1,Z],[x0,y1,Z]], o);

// a thin standing slab (a screen, a card): front face at y, with a visible
// top and right edge so it has thickness like the tree scene's chips
const slab = (x0, x1, y, z0, z1, t = 0.18) => [
  face([[x0,y+t,z1],[x1,y+t,z1],[x1,y,z1],[x0,y,z1]]),          // top
  face([[x1,y,z0],[x1,y+t,z0],[x1,y+t,z1],[x1,y,z1]]),          // right edge
  rectXZ(x0, x1, y, z0, z1),                                     // front
].join('\n');

// a sheet lying flat with a little thickness
const sheet = (x0, x1, y0, y1, t = 0.08) => [
  face([[x0,y1,0],[x1,y1,0],[x1,y1,t],[x0,y1,t]]),
  face([[x1,y0,0],[x1,y1,0],[x1,y1,t],[x1,y0,t]]),
  rectXY(x0, x1, y0, y1, t),
].join('\n');


/* A laptop: a thin base on the table with a keyboard well, and a screen
   standing from its back edge. The site already frames its captures in
   this object (.build-laptop), so a reader has seen it before they get
   here. Returns the svg and the display rectangle the caller draws into. */
const laptop = (x0, x1, yb, depth, sh) => {
  const bt = 0.22, st = 0.16, bez = 0.25;
  const parts = [];
  // screen slab, standing at the back edge, its face toward the reader
  parts.push(face([[x0,yb-st,bt+sh],[x1,yb-st,bt+sh],[x1,yb,bt+sh],[x0,yb,bt+sh]]));      // top edge
  parts.push(face([[x1,yb-st,bt],[x1,yb,bt],[x1,yb,bt+sh],[x1,yb-st,bt+sh]]));          // right edge
  parts.push(rectXZ(x0, x1, yb, bt, bt + sh));                                            // lid face
  parts.push(rectXZ(x0 + bez, x1 - bez, yb, bt + bez, bt + sh - bez, { w: LW_THIN }));  // display
  // base
  parts.push(face([[x1,yb,0],[x1,yb+depth,0],[x1,yb+depth,bt],[x1,yb,bt]]));            // right side
  parts.push(face([[x0,yb+depth,0],[x1,yb+depth,0],[x1,yb+depth,bt],[x0,yb+depth,bt]])); // front side
  parts.push(rectXY(x0, x1, yb, yb + depth, bt));                                          // top
  parts.push(rectXY(x0 + 0.5, x1 - 0.5, yb + 0.35, yb + depth - 0.7, bt, { w: LW_THIN })); // keyboard well
  parts.push(rectXY(x0 + (x1-x0)/2 - 0.9, x0 + (x1-x0)/2 + 0.9, yb + depth - 0.6, yb + depth - 0.15, bt, { w: LW_THIN })); // trackpad
  return { svg: parts.join('\n'), disp: { x0: x0 + bez, x1: x1 - bez, y: yb, z0: bt + bez, z1: bt + sh - bez } };
};

/* A phone standing on its end: a slab with a display inset. */
const phone = (x0, x1, y, h) => {
  const t = 0.14, bez = 0.14;
  return { svg: slab(x0, x1, y, 0, h, t) + '\n' + rectXZ(x0 + bez, x1 - bez, y, bez + 0.1, h - bez - 0.1, { w: LW_THIN }),
           disp: { x0: x0 + bez, x1: x1 - bez, y, z0: bez + 0.1, z1: h - bez - 0.1 } };
};

const scenes = {};

/* 01 -- Start with the shape of it.
   Two sheets on the table: a desktop page wireframe and a phone wireframe
   of the same page, drawn in the blocks a wireframe uses. A terracotta
   pen lies across the corner. Nothing built, everything decided. */
scenes['01'] = () => {
  const s = [];
  // large sheet, landscape
  s.push(sheet(0, 9, 0, 6.2));
  const T = 0.08;
  // browser-ish frame on the sheet
  s.push(rectXY(0.6, 8.4, 0.5, 5.7, T, { w: LW_THIN }));
  s.push(seg([0.6, 1.1, T], [8.4, 1.1, T]));                       // header rule
  s.push(rectXY(0.9, 2.2, 0.65, 0.95, T, { w: LW_THIN }));         // logo block
  s.push(seg([6.2, 0.8, T], [8.1, 0.8, T]));                       // nav
  s.push(rectXY(0.9, 8.1, 1.4, 3.2, T, { w: LW_THIN }));           // hero
  s.push(seg([0.9, 1.4, T], [8.1, 3.2, T], LW_THIN));              // wireframe cross
  s.push(seg([8.1, 1.4, T], [0.9, 3.2, T], LW_THIN));
  for (let i = 0; i < 3; i++) {                                    // three columns
    const x0 = 0.9 + i * 2.45, x1 = x0 + 2.2;
    s.push(rectXY(x0, x1, 3.6, 4.5, T, { w: LW_THIN }));
    s.push(seg([x0, 4.8, T], [x1, 4.8, T]));
    s.push(seg([x0, 5.15, T], [x0 + 1.4, 5.15, T]));
  }
  // small sheet, the phone wireframe, overlapping the corner
  s.push(sheet(8.2, 11.2, 4.4, 8.6, 0.16));
  const T2 = 0.16;
  s.push(rectXY(8.7, 10.7, 4.8, 8.2, T2, { w: LW_THIN }));
  s.push(rectXY(8.9, 10.5, 5.1, 6.2, T2, { w: LW_THIN }));
  s.push(seg([8.9, 5.1, T2], [10.5, 6.2, T2]));
  s.push(seg([10.5, 5.1, T2], [8.9, 6.2, T2]));
  s.push(rectXY(8.9, 10.5, 6.5, 7.1, T2, { w: LW_THIN }));
  s.push(rectXY(8.9, 10.5, 7.3, 7.9, T2, { w: LW_THIN }));
  // the pen, terracotta, lying across the big sheet's near corner
  const px = 1.2, py = 6.9, len = 3.6, r = 0.18, h = 0.3;
  s.push(face([[px,py,0],[px+len,py-1.3,0],[px+len,py-1.3+r*2,0],[px,py+r*2,0]], { w: LW_THIN }));   // shadow-side
  s.push(face([[px,py,h],[px+len,py-1.3,h],[px+len,py-1.3+r*2,h],[px,py+r*2,h]], { fill: TERRA }));
  s.push(face([[px,py,0],[px,py+r*2,0],[px,py+r*2,h],[px,py,h]], { fill: TERRA, w: LW_THIN }));
  s.push(face([[px+len,py-1.3,0],[px+len+0.5,py-1.3+r*0.6,0],[px+len+0.5,py-1.3+r*0.6,h*0.5],[px+len,py-1.3,h]], { w: LW_THIN })); // nib
  return s.join('\n');
};

/* 02 -- Make the world before the pages.
   A design-system board lying on the table: a row of swatches, a type
   specimen in three weights, a button, and a component card. The things
   decided once so the pages can be quick. One swatch is terracotta. */
scenes['02'] = () => {
  const s = [];
  s.push(sheet(0, 10, 0, 7));
  const T = 0.08;
  // swatches, five tiles, the third terracotta, with a little height
  for (let i = 0; i < 5; i++) {
    const x0 = 0.7 + i * 1.75, x1 = x0 + 1.4, y0 = 0.6, y1 = 1.9, h = 0.22;
    const fill = i === 2 ? TERRA : GROUND;
    s.push(face([[x0,y1,T],[x1,y1,T],[x1,y1,T+h],[x0,y1,T+h]], { fill, w: LW_THIN }));
    s.push(face([[x1,y0,T],[x1,y1,T],[x1,y1,T+h],[x1,y0,T+h]], { fill, w: LW_THIN }));
    s.push(rectXY(x0, x1, y0, y1, T + h, { fill, w: LW_THIN }));
  }
  // type specimen: three bars, heavy to light, as a wireframe draws type
  s.push(rectXY(0.7, 6.4, 2.6, 3.25, T, { w: LW_THIN }));
  s.push(seg([0.7, 3.7, T], [5.2, 3.7, T], LW));
  s.push(seg([0.7, 4.15, T], [4.0, 4.15, T], LW_THIN));
  // a button: a pill, wireframed
  const bx0 = 7.0, bx1 = 9.3, by0 = 2.7, by1 = 3.5;
  s.push(rectXY(bx0, bx1, by0, by1, T, { w: LW }));
  s.push(seg([bx0 + 0.55, by0 + 0.4, T], [bx1 - 0.55, by0 + 0.4, T], LW_THIN));
  // a component card: image block, two lines, standing up slightly off the board
  const cx0 = 0.7, cx1 = 4.4, cy0 = 4.8, cy1 = 6.5;
  s.push(rectXY(cx0, cx1, cy0, cy1, T, { w: LW }));
  s.push(rectXY(cx0 + 0.25, cx0 + 1.5, cy0 + 0.25, cy1 - 0.25, T, { w: LW_THIN }));
  s.push(seg([cx0 + 1.8, cy0 + 0.5, T], [cx1 - 0.3, cy0 + 0.5, T], LW));
  s.push(seg([cx0 + 1.8, cy0 + 0.95, T], [cx1 - 0.7, cy0 + 0.95, T]));
  s.push(seg([cx0 + 1.8, cy0 + 1.3, T], [cx1 - 1.2, cy0 + 1.3, T]));
  // an icon grid, 3x2, small squares and circles as one line each
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const x0 = 5.4 + c * 1.05, y0 = 4.9 + r * 0.9;
    s.push(rectXY(x0, x0 + 0.65, y0, y0 + 0.65, T, { w: LW_THIN }));
  }
  return s.join('\n');
};

/* 03 -- Build it whole, in the open.
   A laptop with the site up in a browser, the address bar the one thing in
   terracotta -- the real thing on a real address -- and a phone beside it
   showing the same page narrow. Both screens carry the same layout, so the
   pair reads as one site rather than two pictures. */
scenes['03'] = () => {
  const s = [];
  const L = laptop(0, 11, 0, 5.2, 7.0);
  s.push(L.svg);
  const { x0, x1, y: Y, z0, z1 } = L.disp;
  const w = x1 - x0, h = z1 - z0;
  // browser chrome: tab, then the address pill
  s.push(seg([x0, Y, z1 - 0.95], [x1, Y, z1 - 0.95]));
  s.push(rectXZ(x0 + 0.3, x0 + 2.4, Y, z1 - 0.8, z1 - 0.25, { w: LW_THIN }));
  s.push(rectXZ(x0 + 0.3, x0 + 0.7, Y, z1 - 1.55, z1 - 1.25, { w: LW_THIN }));          // back button
  s.push(rectXZ(x0 + 1.0, x0 + 6.4, Y, z1 - 1.65, z1 - 1.15, { fill: TERRA }));           // the address
  // the page
  const top = z1 - 2.0;
  s.push(seg([x0 + 0.3, Y, top], [x1 - 0.3, Y, top]));
  s.push(rectXZ(x0 + 0.5, x0 + 1.7, Y, top - 0.55, top - 0.2, { w: LW_THIN }));         // logo
  s.push(seg([x1 - 2.6, Y, top - 0.38], [x1 - 0.5, Y, top - 0.38]));                    // nav
  s.push(rectXZ(x0 + 0.5, x1 - 0.5, Y, top - 2.6, top - 0.9, { w: LW_THIN }));           // hero
  s.push(seg([x0 + 0.9, Y, top - 1.45], [x0 + 5.4, Y, top - 1.45], LW));
  s.push(seg([x0 + 0.9, Y, top - 1.9], [x0 + 4.3, Y, top - 1.9]));
  s.push(rectXZ(x0 + 0.9, x0 + 2.7, Y, top - 2.4, top - 2.1, { w: LW_THIN }));          // button
  for (let i = 0; i < 3; i++) {                                                           // three cards
    const cx0 = x0 + 0.5 + i * ((w - 1.0) / 3), cx1 = cx0 + (w - 1.0) / 3 - 0.3;
    s.push(rectXZ(cx0, cx1, Y, z0 + 0.2, top - 2.9, { w: LW_THIN }));
    s.push(seg([cx0 + 0.25, Y, z0 + 0.65], [cx1 - 0.6, Y, z0 + 0.65]));
  }
  // the phone, standing to the right and a little nearer
  const Ph = phone(14.9, 17.3, 2.6, 5.2);
  s.push(Ph.svg);
  const d = Ph.disp;
  s.push(seg([d.x0 + 0.15, d.y, d.z1 - 0.55], [d.x1 - 0.15, d.y, d.z1 - 0.55]));
  s.push(rectXZ(d.x0 + 0.25, d.x1 - 0.25, d.y, d.z1 - 2.4, d.z1 - 0.8, { w: LW_THIN }));
  s.push(seg([d.x0 + 0.45, d.y, d.z1 - 1.35], [d.x1 - 0.45, d.y, d.z1 - 1.35], LW));
  s.push(seg([d.x0 + 0.45, d.y, d.z1 - 1.8], [d.x1 - 0.8, d.y, d.z1 - 1.8]));
  s.push(rectXZ(d.x0 + 0.25, d.x1 - 0.25, d.y, d.z1 - 3.4, d.z1 - 2.65, { w: LW_THIN }));
  s.push(rectXZ(d.x0 + 0.25, d.x1 - 0.25, d.y, d.z0 + 0.25, d.z1 - 3.65, { w: LW_THIN }));
  return s.join('\n');
};

/* A block of leaves: the visible faces of a stack of paper lying on the
   table. Only the +x and +y sides ever face the reader in this projection,
   so those two and the top are all there is to draw. */
const block = (x0, x1, y0, y1, z0, z1) => [
  face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]),        // the foot
  face([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]]),        // the fore-edge
  rectXY(x0, x1, y0, y1, z1, { w: LW_THIN }),                  // the open page
].join('\n');

// individual leaves down those two faces: what says "many pages" rather
// than "a folded card"
const leaves = (x0, x1, y0, y1, z0, z1, n) => {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const z = z0 + (z1 - z0) * i / (n + 1);
    out.push(seg([x0, y1, z], [x1, y1, z]));
    out.push(seg([x1, y0, z], [x1, y1, z]));
  }
  return out.join('\n');
};

/* 04 -- Hand it over alive.
   The guide, open flat on the table: the editor the client will use drawn
   on the left page as a printed screenshot with its caption, the steps for
   doing it themselves numbered down the right, and a terracotta ribbon
   from the spine over the fore-edge.

   Step 03 is a laptop, and so was this one for a day -- the same machine
   one step later, at the same size, in the same place, which read as one
   picture printed twice. What this step actually hands over is the
   writing, so the writing is what it shows.

   It was a tent for a day after that, standing open on its two page
   slopes, and it read as a book bent back the wrong way: the projection
   caps the pitch (a slope's normal is (0, s*zr, d), so the far page only
   faces the reader while d > zr), and a book that can only open past 128
   degrees looks like one whose spine has gone. Flat is the pose a guide
   is actually left in, and it buys the thing the tent could not show --
   the block of leaves under each page, which is what says the guide has
   more in it than the one spread. */
scenes['04'] = () => {
  const s = [];
  const W = 5.0, H = 6.9, G = 0.34;          // half-spread, page height, gutter
  const CT = 0.14, T = 0.92, OV = 0.22;     // cover, block top, cover overhang

  // the case, one slab under the whole spread
  s.push(sheet(-W - OV, W + OV, -OV, H + OV, CT));

  /* One block of leaves for the whole spread, not two. Drawn as two, the
     left page ends in a fore-edge halfway across and the thing reads as a
     pair of paper stacks side by side rather than one bound book. */
  s.push(block(-W, W, 0, H, CT, T));
  s.push(leaves(-W, W, 0, H, CT, T, 3));

  // the gutter, a shallow valley rather than a crease
  s.push(face([[-G,0,T], [-G,H,T], [0,H,T-0.22], [0,0,T-0.22]]));
  s.push(face([[0,0,T-0.22], [0,H,T-0.22], [G,H,T], [G,0,T]]));

  // left page -- the editor, printed as a screenshot, and its caption
  s.push(seg([-4.5, 0.85, T], [-2.7, 0.85, T], LW));                       // the heading
  s.push(rectXY(-4.5, -0.8, 1.45, 4.35, T, { w: LW_THIN }));               // the screenshot
  s.push(seg([-3.65, 1.45, T], [-3.65, 4.35, T]));                         // the rail's edge
  for (let i = 0; i < 4; i++) {                                            // the pages, one open
    const y = 1.85 + i * 0.5;
    s.push(seg([-4.3, y, T], [i === 1 ? -3.78 : -3.9, y, T], i === 1 ? LW : LW_THIN));
  }
  s.push(rectXY(-3.45, -1.0, 1.75, 2.3, T, { w: LW_THIN }));               // title field
  s.push(rectXY(-3.45, -2.15, 2.6, 3.65, T, { w: LW_THIN }));              // image slot
  s.push(seg([-1.95, 2.9, T], [-1.0, 2.9, T]));
  s.push(seg([-1.95, 3.3, T], [-1.25, 3.3, T]));
  s.push(rectXY(-1.8, -1.0, 3.95, 4.2, T, { w: LW_THIN }));                // the button
  s.push(seg([-4.5, 4.95, T], [-2.2, 4.95, T], LW));                       // the caption
  s.push(seg([-4.5, 5.4, T], [-0.9, 5.4, T]));
  s.push(seg([-4.5, 5.85, T], [-0.9, 5.85, T]));
  s.push(seg([-4.5, 6.3, T], [-2.8, 6.3, T]));

  // right page -- the steps, numbered, for doing it without me
  s.push(seg([0.8, 0.85, T], [2.5, 0.85, T], LW));                         // the heading
  for (let i = 0; i < 4; i++) {
    const y = 1.7 + i * 1.05, end = [3.6, 3.1, 3.9, 3.3][i];
    s.push(rectXY(0.8, 1.22, y - 0.21, y + 0.21, T, { w: LW_THIN }));      // the number
    s.push(seg([1.55, y - 0.05, T], [4.5, y - 0.05, T]));
    s.push(seg([1.55, y + 0.42, T], [end, y + 0.42, T]));
  }

  // the ribbon, out of the spine, over the fore-edge and onto the table
  const r0 = 5.95, r1 = 6.37, e = W + OV, Z = 0.02;
  s.push(face([[-0.35,r0,T+Z], [e,r0,T+Z], [e,r1,T+Z], [-0.35,r1,T+Z]], { fill: TERRA, w: LW_THIN }));
  s.push(face([[e,r0,T+Z], [e+0.55,r0,Z], [e+0.55,r1,Z], [e,r1,T+Z]], { fill: TERRA, w: LW_THIN }));
  s.push(face([[e+0.55,r0,Z], [e+2.0,r0,Z], [e+1.55,(r0+r1)/2,Z], [e+2.0,r1,Z], [e+0.55,r1,Z]],
              { fill: TERRA, w: LW_THIN }));
  return s.join('\n');
};

const [which, outDir] = process.argv.slice(2);
if (!which || !outDir) { console.error('usage: built-steps.mjs <01|02|03|04|all> <out-dir>'); process.exit(2); }
mkdirSync(outDir, { recursive: true });
const keys = which === 'all' ? Object.keys(scenes) : [which];

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 2 });
for (const k of keys) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1080" viewBox="-820 -520 1640 1230">
  <rect x="-820" y="-520" width="1640" height="1230" fill="${GROUND}"/>
  ${scenes[k]()}
</svg>`;
  await page.setContent(`<style>html,body{margin:0;background:${GROUND}}</style>${svg}`);
  await page.waitForTimeout(150);
  const out = join(outDir, `step-${k}.png`);
  writeFileSync(out, await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 1080 } }));
  console.log('wrote', out);
}
await browser.close();
