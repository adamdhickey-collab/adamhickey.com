/* The question over the picture: one source, two leaders.

   Since 2026-10-12 the homepage's lab card and the Agent Review case
   study's hero set the decision's own question over a capture of the
   screen it is about, "Separate the two meanings of red, or keep the
   familiar signal?", and point at the two words the question means: the
   replaced plan, "Starter", and "Payment failed", which are the same red.
   The first version drew a straight line from the question to each; since
   later that day there is one source and two ends, the mockup's shape. The
   word "red" carries a short underline, one stem drops from the middle of
   that underline to a level bar in the blank canvas above the panels, and
   the bar's two ends turn down: the left branch runs to the top of the
   capsule round "Starter", the right one down the blank column inside the
   payment history's right edge and in to the right side of the capsule
   round "Payment failed". Rounded bends, rounded caps, no arrowheads, one
   stroke that reads on the dark canvas and on the white panels alike
   (style.css, "The question over the picture", has the colour).

   WHY A SCRIPT. The capsules sit at measured shares of the picture
   (style="left: 41.2%; top: 39%; ..." on each ring, printed by the capture
   recipes in lab-cards.mjs and lab-shots.mjs), and would draw the same in
   CSS alone. The stem cannot: it starts under one word of a line of the
   site's own type, and where that word lands depends on the picture's
   width, the type step the container query chose for it and the fonts
   that loaded. So each figure is measured in its own layout and its paths
   written into its own SVG, again when fonts arrive and whenever the
   figure's box changes size. Everything is read from layout (offsetLeft,
   offsetTop, offsetWidth), never from a bounding rect: the card tilts and
   lifts on hover, and a rect taken mid-tilt would draw the leaders for a
   card that is not there.

   Two figures today, each initialised on its own: the frame on the
   homepage (index.html, inside the card's link) and the frame in the case
   study's hero (lab/agent-review.html). A frame declares two places the
   capsules cannot: data-ask-panels, the share of the picture's height at
   which the white card the panels sit on begins, above which the bar has
   to sit, and data-ask-right, the share of its width at which the right
   branch descends, a column the capture recipes measured blank. Under
   40rem the picture is the compact phone capture and the stylesheet keeps
   the leaders off, since the second red is half the picture away; the
   question, the underline and the capsules stay, and this script draws
   nothing it cannot see. If the words have grown into the room the bar
   needs, or a capsule has moved out from under its branch (a picture
   retaken and the places not), the leaders are left undrawn rather than
   drawn across something. */
(() => {
  const frames = document.querySelectorAll('.lab-ask-frame');
  if (!frames.length) return;
  const n = (v) => Math.round(v * 100) / 100;
  const STROKE = 1.5;

  function draw(frame) {
    const svg = frame.querySelector('.lab-ask-leads');
    const stem = svg && svg.querySelector('.lab-ask-stem');
    const branch = svg && svg.querySelector('.lab-ask-branch');
    const words = frame.querySelector('.lab-ask-words');
    const red = frame.querySelector('.lab-ask-red');
    if (!svg || !stem || !branch || !words || !red) return;
    const clear = () => { stem.removeAttribute('d'); branch.removeAttribute('d'); };
    if (getComputedStyle(svg).display === 'none') return clear();
    const W = frame.offsetWidth;
    const H = frame.offsetHeight;
    if (!W || !H) return;

    /* The capsules: the pair the stylesheet is showing at this width. */
    const ring = (which) => {
      for (const el of frame.querySelectorAll(`.lab-ask-ring[data-ask="${which}"]`)) {
        if (el.offsetWidth) return { left: el.offsetLeft, top: el.offsetTop, right: el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight };
      }
      return null;
    };
    const plan = ring('plan');
    const failed = ring('failed');
    if (!plan || !failed) return clear();

    /* The underline's own centre line: the baseline, from a probe that sits
       on it, plus the offset and half the thickness the stylesheet gives
       the underline. */
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    red.appendChild(probe);
    const baseline = words.offsetTop + probe.offsetTop;
    red.removeChild(probe);
    const style = getComputedStyle(red);
    const size = parseFloat(style.fontSize) || 16;
    const offset = parseFloat(style.textUnderlineOffset);
    const thickness = parseFloat(style.textDecorationThickness);
    const underline = baseline + (Number.isNaN(offset) ? size * 0.14 : offset) + (Number.isNaN(thickness) ? STROKE : thickness) / 2;

    const stemX = words.offsetLeft + red.offsetLeft + red.offsetWidth / 2;
    const leftX = (plan.left + plan.right) / 2;
    const rightY = (failed.top + failed.bottom) / 2;
    const panels = (H * (parseFloat(frame.dataset.askPanels) || 28)) / 100;
    const rightX = (W * (parseFloat(frame.dataset.askRight) || 90)) / 100;
    /* The bar sits a little under the halfway mark between the underline
       and the white card, which keeps it in the canvas and off the words,
       and never closer than 6px to the words' box or to the card: where
       the strip is short, the words win and the bar sits just under them
       (the box's foot is a few pixels under the letters' own); the bends
       are a share of the width, between 6 and 12px. */
    const foot = words.offsetTop + words.offsetHeight;
    const barY = Math.min(Math.max(underline + 0.58 * (panels - underline), foot + 6), panels - 6);
    const r = Math.max(6, Math.min(12, W * 0.014));
    const room =
      barY - underline >= 10 &&
      panels - foot >= 12 &&
      plan.top - barY >= r + 6 &&
      rightY - barY >= r + 6 &&
      stemX > leftX + r &&
      stemX < rightX - r &&
      rightX > failed.right + r;
    svg.setAttribute('viewBox', `0 0 ${n(W)} ${n(H)}`);
    if (!room) return clear();

    stem.setAttribute('d', `M${n(stemX)} ${n(underline)} V${n(barY)}`);
    /* Up from the first capsule's top edge, along the bar, down the blank
       column, in to the second capsule's right edge: the ends land on the
       capsules' own border lines, so cap and ring are one stroke. */
    branch.setAttribute(
      'd',
      `M${n(leftX)} ${n(plan.top + STROKE / 2)} V${n(barY + r)} ` +
        `A${n(r)} ${n(r)} 0 0 1 ${n(leftX + r)} ${n(barY)} H${n(rightX - r)} ` +
        `A${n(r)} ${n(r)} 0 0 1 ${n(rightX)} ${n(barY + r)} V${n(rightY - r)} ` +
        `A${n(r)} ${n(r)} 0 0 1 ${n(rightX - r)} ${n(rightY)} H${n(failed.right - STROKE / 2)}`,
    );
  }

  const all = () => frames.forEach(draw);
  if ('ResizeObserver' in window) {
    const watch = new ResizeObserver(() => all());
    frames.forEach((frame) => watch.observe(frame));
  } else {
    window.addEventListener('resize', all);
  }
  all();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  window.addEventListener('load', all);
})();
