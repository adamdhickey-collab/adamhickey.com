# Typography

The site uses two typefaces. Pick the font by the **role** the text plays,
not by its HTML tag. An `<h3>` is serif when it is a section header and sans
when it is a card title, so decide by what the text is doing, not what tag it
happens to use.

## The two families

| Token | Family | Voice | Defined in |
|-------|--------|-------|------------|
| `--font-serif` | **Crimson Text** | "The voice." Things a reader reads as prose or a headline. | style.css `:root`; case-study `<html>` |
| `--font-sans` | **Montserrat** | "The interface." Things that label, organize, or sit inside a component. | same |

Both are referenced everywhere through these variables and, in the case
studies, through the Tailwind `font-serif` / `font-sans` utilities (which map
to the same variables). Never hardcode a family name or a bracketed Tailwind
font (`font-['Montserrat']`); use the token or the utility.

## When to use which

**Serif (Crimson Text)**
- Page titles (`h1`)
- Section titles (`h2`)
- Large editorial / feature headers, including the numbered "approach step"
  titles
- Pull quotes and display numerals (`.story-num`, `.cap-rail-num`)

**Sans (Montserrat)**
- Body copy
- Eyebrows, kickers, tags, metadata, captions
- Card titles and sub-headings (`h4`, `h5`, `h6`)
- Table headers and cells, buttons, navigation

## Weights

Only these cuts are loaded. Do not introduce others without adding them to the
font `<link>` first, or the browser will synthesize a fake one.

| Family | Weights | Notes |
|--------|---------|-------|
| Crimson Text | **400** only, upright | Never bold, never italic. All headings sit at 400. |
| Montserrat | **400 / 500 / 600 / 700** | 400 body, 500 nav and quiet labels, 600 titles and most labels, 700 strong emphasis and overview kickers. No 300 (light). |

Tailwind weight utilities map straight onto these: `font-normal` 400,
`font-medium` 500, `font-semibold` 600, `font-bold` 700.

## Scale (de facto)

Sizes today, kept here so new work matches rather than inventing a new step.

**Homepage (style.css)**
- `h1` / `.hero-title`: serif 400, fluid display
- `h2` section heads: serif 400
- `.hero-card-title`: sans 600, ~1.06rem
- `h6`: sans 600, 1.125rem
- body `p`: 1rem / 1.6 line-height

**Case studies (inline base)**
- `h1`: serif 400 (hero overrides to a fluid 48 to 68px)
- `h2`: serif 400, 3rem
- `h3`: serif 400, 2.125rem (when a section header; card-title `h3`s carry
  `font-sans` + a weight utility)
- `h4`: sans 600, 1.5rem
- `h5`: sans 600, 1.25rem
- `h6`: sans 600, 1.125rem
- body: sans 400, 1rem / 1.6

## Rules of thumb

1. Decide serif vs sans by role (see above), never by tag.
2. Use `var(--font-sans)` / `var(--font-serif)` in CSS and `font-sans` /
   `font-serif` in case-study markup. Nothing else.
3. Stay within the loaded weights. Adding a weight means editing the font
   `<link>` in every page first.
4. Numerals that need to align in a column use `font-variant-numeric:
   tabular-nums` (Montserrat) rather than a separate font.
