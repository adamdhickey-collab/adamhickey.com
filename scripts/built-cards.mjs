#!/usr/bin/env node
/* The pictures on the homepage's Built end to end cards, at
 * img/products/<slug>-card.webp. Since 2026-10-21 the section is a three-up
 * grid of the same .case-card the enterprise accounts above it use, so each
 * product needs a 16:9 picture at the accounts' own 1672x941. Door County
 * Found's is a screen of the site itself, so scripts/dcf.mjs captures it
 * from the sibling checkout (`node scripts/dcf.mjs card`). Lucy Learns had
 * only phone screens and Faunaform only square prints, so this lays them out
 * on a ground:
 *
 *   lucy-learns   the splash, today's session and the end of a session,
 *                 the three screens the old homepage card showed, in order,
 *                 each in the phone the write-up frames its screens in
 *   faunaform     the wordmark over the seven prints, four over three, in
 *                 the day's order
 *
 * Every picture in them is already on the site; nothing here is drawn but
 * Lucy Learns's painted ground, kept beside the card it sits under. The
 * wordmark is a copy of the studio's (faunaform/output/brand/wordmark/
 * faunaform-wordmark.svg) with its viewBox trimmed to the letters, as the
 * shop's header trims it, so this runs without the sibling. The
 * grounds, corners and shadows are the site's tokens, read from color.css and
 * shell.css in the page, and the phone is style.css's own .build-phone, so a
 * token change is a re-run rather than a redraw.
 *
 *   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     node scripts/built-cards.mjs            # writes both
 *   node scripts/built-cards.mjs faunaform    # writes one
 *
 * WebP at 0.86, the artwork setting, from Chromium, the only encoder on the
 * Mac; its output is not byte-stable run to run, so commit a re-render only
 * when the picture changed. */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1672, H = 941;

const CARDS = {
  'lucy-learns': {
    ground: '--color-muted-light',
    /* A painted entryway under the phones since 2026-10-27: the door the
       app trains for at the left, the dog bed it sends her to at the right,
       open wall between. Drawn in ChatGPT at the card's own 1672x941, so it
       sits at 1:1 with nothing cropped; the token ground stays under it.
       The committed card keeps the session and done screens as 57bbe9f had
       them, which its alt text describes; a re-run takes today's captures,
       so recheck that alt before committing one. */
    image: 'img/products/lucy-learns-ground.webp',
    /* Each screen in the write-up's own phone since 2026-10-22: the
       .build-phone rule from style.css, at the 314px its hero row prints it,
       then zoomed until the phone stands 0.82 of the picture's height.
       Zooming the whole object rather than sizing the screen keeps the
       bezel as thin against the screen as it is on the write-up; the same
       8px round a phone this tall would read as a thicker frame. */
    sheets: ['style.css'],
    body: `<div class="row">${['lucy-learns-splash', 'lucy-learns', 'lucy-learns-3']
      .map((f) => `<div class="build-phone"><img src="/img/products/${f}.webp" alt=""></div>`).join('')}</div>`,
    css: `.row { display: flex; align-items: flex-start; gap: var(--space-3xl); }
          .build-phone { width: 314px; }`,
    fit: (h) => {
      const phones = document.querySelectorAll('.build-phone');
      const zoom = (h * 0.82) / phones[0].offsetHeight;
      phones.forEach((p) => { p.style.zoom = zoom; });
    },
  },
  faunaform: {
    ground: '--color-warm',
    body: '<img class="mark" src="/img/faunaform/faunaform-wordmark.svg" alt="">' +
      ['owl crane moose loon', 'bear fox rabbit'].map((row) =>
      `<div class="row">${row.split(' ').map((a) => `<img class="print" src="/img/faunaform/print-${a}.webp" alt="">`).join('')}</div>`).join(''),
    /* The wordmark over the prints, as the shop's header sets it over its
       day: 52 of the picture's 941 is about 18px as the card prints it on
       a desktop, where any smaller stops reading as a name. The prints gave
       up a little to make the room, 0.37 of the height to 0.35. */
    css: `body { flex-direction: column; gap: var(--space-2xl); }
          .mark { height: 52px; width: auto; margin-bottom: var(--space-xl); }
          .row { display: flex; gap: var(--space-2xl); }
          .print { width: ${Math.round(H * 0.35)}px; height: auto; box-shadow: var(--shadow-card-raised); }`,
  },
};

const only = process.argv[2];
const { server, origin } = await serve(ROOT);
const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const [slug, card] of Object.entries(CARDS)) {
    if (only && only !== slug) continue;
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.goto(`${origin}/404.html`);
    await page.setContent(`<!doctype html><html><head>
      <link rel="stylesheet" href="${origin}/color.css"><link rel="stylesheet" href="${origin}/shell.css">
      ${(card.sheets || []).map((s) => `<link rel="stylesheet" href="${origin}/${s}">`).join('')}
      <style>html, body { margin: 0; width: ${W}px; height: ${H}px; }
        body { display: flex; align-items: center; justify-content: center; background: ${card.image ? `url("${origin}/${card.image}") center / cover, ` : ''}var(${card.ground}); }
        ${card.css}</style></head><body>${card.body.replaceAll('src="/', `src="${origin}/`)}</body></html>`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
    if (card.fit) await page.evaluate(card.fit, H);
    const out = path.join(ROOT, 'img/products', `${slug}-card.webp`);
    fs.writeFileSync(out, await page.screenshot({ type: 'webp', quality: 86 }));
    console.log(`  wrote ${path.relative(ROOT, out)}  (${W}x${H})`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
