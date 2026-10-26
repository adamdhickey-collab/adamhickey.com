# Say When: the identity, and why it is drawn the way it is

Companion to `coffee-creative-brief.md`. Everything described here is in
`img/say-when/`, drawn by `scripts/say-when.mjs` from a few numbers, with
every word outlined through `scripts/say-when-outline.py`. Say When is a
self-initiated, fictional brand concept; nothing here has been printed.

## The idea in one shape

The level line. A horizontal rule that stops in a short upright: the coffee
at the height you asked for, and the hand that said when. It is the mark's
one gesture, the packaging system's one variable, and the campaign's one
device. The decision that mattered most was to let one shape do all three
jobs rather than build a family of marks.

## Four directions

- **A. The wordmark and the line.** "Say When" in the brand's cut, the level
  under "When", stopping in the tick. Chosen. It reads at any size, the name
  says the gesture and the line performs it.
- **B. The cup alone.** A cup in profile with the level inside, over small
  capitals. A good symbol and a weak front door: a cup is every coffee
  brand's first thought, and the capitals talk down to the name.
- **C. The stack.** SAY over WHEN in heavy capitals with a rule between.
  Loud; the rule reads as a divider rather than a level; it shouts a phrase
  meant to be said quietly.
- **D. The badge.** The cup ringed by the name. Credible on a bag, lost on a
  screen, and it borrows a heritage the brand does not have.

## Four iterations of A

1. A thin line under both words. Reads as a hyperlink.
2. Under "When" only. Still a link, shorter.
3. The tick arrives; the line becomes a level. Too thin beside the stems.
4. The weight of the W's stem, in the red. The one coloured thing on the
   mark is the moment you say it.

## What is delivered

| File | What it is |
| --- | --- |
| `logo-primary.svg`, `logo-primary-on-paper.svg` | The primary lockup: symbol, wordmark, red level |
| `logo-stacked.svg`, `logo-stacked-reverse.svg` | The secondary lockup for narrow spaces |
| `logo-mono.svg` | One colour, for a stamp or a one-colour print |
| `logo-reverse.svg` | Paper on plum; the level takes the ink's colour on a dark ground |
| `symbol.svg`, `symbol-reverse.svg`, `symbol-app.svg` | The cup, justified because a level needs a cup to be a level; alone at 24px and up |
| `logo-clearspace.svg` | Clear space (the wordmark's cap height on every side) and minimum size (the lockup is never used under 120px wide) |
| `pattern-tile.svg`, `pattern-tile-reverse.svg` | The three whens as a repeating tile, never behind text |

## Colour

Six colours, all declared on the storefront's own stylesheet as `--sw-*` and
nowhere on the site's palette (COLOR.md section 6). Measured contrast:

| Colour | Hex | Used for | Measured |
| --- | --- | --- | --- |
| Paper | `#f4ecdd` | The ground; reverse text | ink on it 13.0 |
| Cream | `#fbf7ef` | The storefront's page ground | ink on it 14.3 |
| Ink | `#2b2420` | All text on light grounds; espresso, not black | |
| Brown | `#6b4a3a` | Secondary text | 6.7 on paper, 7.4 on cream |
| Butter | `#f0c45b` | First Pour | ink on it 9.3 |
| Clay | `#d4784f` | Second Pour | ink on it 4.8 (the tightest pair; the bag's small words are outlines, not text) |
| Plum | `#3b2d3e` | Last Pour; the cart, the footer | paper on it 11.0 |
| Red | `#b4382e` | The level, links, focus; spent once a surface | 5.1 on paper, 5.5 on cream, 5.9 on white |

A ground never carries text that fails these; the plum carries paper, the
butter and the clay carry ink, and the red is a line before it is a word.

## Type

Fraunces at its soft cut (SOFT 100), weight 700, optical size left to the
browser, for anything the brand says out loud: the wordmark, the product
names, headlines. Instrument Sans for everything it has to explain. The
storefront loads that cut on its own pages; the site's pages never do, and
the site's own Fraunces (400, SOFT 0) is a different voice on purpose. The
bags carry the type as outlines, so no viewer needs the font and no browser
check reads a bag as text.

## Composition rules

- The wordmark goes top left, small, on everything; the product name is
  second, at one size across the family (a long name is not a smaller name).
- The level sits where the product's "when" puts it: low, halfway, high.
- The vessel stands at the right end of the line, straddling it at its own
  fill height.
- Words below the line, in sentence case, never in capitals.
- Clear space the cap height; nothing but paper inside it.

## Shapes and patterns

The line and the tick. The pattern is the three lines at three heights; it
goes on a tissue, a card's inside, the shipper's lining, and never behind
words.

## Illustration and photography direction

Illustration is line only, in the symbol's weight: vessels, never beans,
never farms. Photography does not exist yet. The brief for it: real pours on
real tables, morning light, hands and cups, the stream mid-pour and a person
about to speak; no burlap, no green hills, no latte art. Until it is shot the
brand draws, and every picture on the site says so.

## Tone examples

- "Tastes like toast with marmalade," not "ethically sourced, meticulously
  roasted, crafted for the discerning palate."
- "6:40, before the house wakes," not "fuel your hustle."
- "Dark chocolate, and you will still sleep," not "our decaf retains the full
  sensory profile of the original."

## Motion principles

Three moves, always in this order, on the site's own tokens: the cup fills
from the bottom to the line (`--motion-ambient`, `--ease-enter`); the line
draws itself and stops in the tick (`--motion-draw`); the words arrive with
one rise (`--motion-enter`, `--motion-rise`). A reader who asked for reduced
motion sees the finished cup. Nothing else on the brand's pages animates
except what confirms a press.

## Why not an elaborate system

The brand is three bags and a shop. It needs the wordmark, the cup for
places words will not fit, and the line everywhere. More marks would make
the line less of a signature, not more.
