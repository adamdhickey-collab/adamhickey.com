# Asset manifest

How each image in the repositioning was made, and what is still owed. Other
sections may be added by the pages that reuse, reframe or regenerate the
site's existing assets; this file opens with the one set made from nothing.

## Say When (a self-initiated fictional brand concept)

Every file in `img/say-when/` is drawn or captured by a script and nothing
in it is a photograph, a print proof or a production run. Regenerate the
set with:

```bash
SW_FONTS=/path/to/fonts node scripts/say-when.mjs --raster
```

where the fonts directory holds Google's own files, fetched and never
committed: `fraunces-var.woff2` (the variable Fraunces, SOFT 100 cut, opsz
and wght axes, from the latin `@font-face` Google serves a modern browser
for `family=Fraunces:opsz,wght,SOFT@9..144,400..900,100`) and
`instrument.woff2` (the variable Instrument Sans, latin). The outliner
`scripts/say-when-outline.py` needs `fontTools` and `brotli`
(`pip install fonttools brotli`).

| File | How it was made |
| --- | --- |
| `direction-a-wordmark.svg` to `direction-d-badge.svg` | Four logo directions, composed in `say-when.mjs` from outlined type and drawn paths. D's ring of text is SVG `<text>` on a path (the one place type is not outlined; it is a rejected sketch) |
| `iteration-1.svg` to `iteration-4.svg` | The chosen direction refined: line placement, the tick, weight, colour |
| `logo-*.svg`, `symbol*.svg`, `pattern-tile*.svg` | The deliverable identity, outlined, in every cut |
| `bag-{first,second,last}-pour-flat.svg` | Flat packaging artwork: one pouch path, the level at the product's height, the vessel drawn as line art, every word outlined |
| `bag-{first,second,last}-pour.svg` | The same with presentation shading: a form gradient, a seal highlight and a drop shadow, all SVG |
| `family.svg` | The three presented bags in a row on the paper |
| `sampler-taster.svg`, `gift-box.svg`, `shipping-box.svg` | Box fronts, drawn flat |
| `poster-outdoor.svg`, `social-{morning,afternoon,evening}.svg` | Campaign pieces, drawn flat at 2:3 and 1:1 |
| `card-home.webp` (1672x941), `og-source.webp` (1200x630), `tile.webp` (800x1000) | Raster cards for the homepage, the share card and the homepage tile, rendered by Chromium from the SVGs (`--raster`) |
| `screen-*.webp` | Captures of the storefront prototype at 1440x900 and 390x844 at 2x, taken by a Playwright script with the cart, the finder and the checkout put into their states first |

Live, not files: the email is composed in HTML on the case study page; the
animated piece is the pour on the storefront's front door, in CSS; the
landing section is the storefront's own "Everyone has a when."

### What a real production would still need

None of this is done, and the site never says it is.

- **Photography.** A shoot per the brief in `coffee-identity-rationale.md`:
  real pours on real tables in morning light, hands and cups, a person about
  to speak. Deliverables: a hero per product, three campaign moments, a
  gift-box lifestyle still. Art direction: no beans, no farms, no latte art,
  no northwoods.
- **Print proof.** The bags are drawn on a generic stand-up pouch
  silhouette. A real run needs the converter's dieline, the gusset and seal
  dimensions, a valve position cleared with the converter, ink-draw-down
  proofs of the butter, clay and plum on the chosen matte paper-touch
  laminate, and a press check.
- **Box dielines.** The Taster tray and lid, the gift box and the shipper
  are drawn as fronts only. Each needs a structural dieline, a sample made
  up, and the shipper's crush test.
- **Pre-press.** The outlined type is production-ready; the drop-shadow and
  gradient layers on the presented bags are presentation only and would
  come off the print files (the `-flat` files are the print artwork).
- **Trademark and domain.** The name has not been searched; see the brief.
- **A real shop.** The storefront is a prototype on localStorage with a
  pretend checkout. A real one needs inventory, payment, tax, shipping
  rates, accounts and email, none of which is designed here beyond the
  shape of the screens.
- **Film.** The thirty-second outdoor piece described on the case study
  (the three moves of the pour with a hand in them) is unshot.
