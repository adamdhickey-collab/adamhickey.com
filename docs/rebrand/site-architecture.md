# Site architecture

Six sections, one page each in the header, and every page of the library
reachable from one of them. Written 2026-10-26; `site-audit.md` has the
page-by-page decisions and `content-decisions.md` the ones made while
repositioning the library.

| Section | Where | What it holds |
| --- | --- | --- |
| **Work** | `index.html#work`, then `other.html` for the full list | The visually distinctive case studies first: Innovators Studio, Say When (self-initiated concept), Door County Found, Lucy Learns, the studio years, Faunaform, While We're Here; the enterprise work (SAP, USDA, dispatch) as depth under them |
| **Approach** | `index.html#approach` | What I bring: the four abilities, each tied to the evidence. Replaces the four "How I work" engagement pages, whose addresses redirect here |
| **About** | `index.html#about` | The career told honestly: graphic design and interactive work first, enterprise consulting as what expanded it, the independent projects, the hands-on maker now |
| **Writing** | `writing/index.html` | The articles, regrouped around craft and judgment, designing in working software, and an earlier focus on agents and governance. Every address kept |
| **Experiments** | `lab/index.html` | Prototypes and technical explorations, AI included: Agent Review, the dispatch cockpit, the motion exploration |
| **Contact** | `index.html#contact` | An invitation to creative teams and hiring managers; the résumé |

## The homepage, in order

1. A confident headline and positioning.
2. A large visual introduction to selected work.
3. The coffee flagship, once it merits the spot (until then it sits second
   and Innovators Studio leads).
4. Innovators Studio as professional proof.
5. Other creative and interface projects.
6. What I bring, in four parts.
7. A short career introduction stressing the studio years, visual craft
   and digital execution.
8. A clear contact invitation.

## Addresses

Every existing address keeps working. Pages that left the site are
redirect stubs (a `meta refresh` to where the content went, `noindex`, no
canonical), which the checks treat as not-pages: `engagement/*.html` go to
`index.html#approach`. New addresses: `case-study/say-when.html` and the
storefront under `say-when/`.

## What stays as it was

The static architecture (plain HTML, CSS and JavaScript, no framework, no
build step beyond the one committed Tailwind file), the three token files,
the five specs, the eleven checks, the deploy from `main`, and the
accessibility foundations: semantic markup, keyboard support, visible
focus, contrast floors, reduced motion, optimized images.
