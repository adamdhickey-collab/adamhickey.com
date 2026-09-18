#!/usr/bin/env node
/* The share cards: one 1200x630 JPEG per page, rendered from the site's own
 * type and color rather than drawn by hand.
 *
 * WHY. Every page carried the homepage's card, so a case study shared on
 * LinkedIn or pasted into a chat showed the practice's headline instead of
 * its own. A card that names the page and shows its work is the difference
 * between a link and a link somebody opens. Every page gets a card from the
 * registry below, at img/og/<slug>.jpg, and its og:image and Article image
 * point there. The homepage's is index.jpg; until 2026-09-17 it kept a card
 * drawn by hand, img/og-card.jpg, and a card nothing renders is a card
 * nothing keeps in step: it still named the independent practice.
 *
 * HOW. Each card is a small HTML document -- the site's fonts, its warm
 * ground, charcoal serif title, sage eyebrow, the wordmark row at the foot --
 * screenshotted by the same Chrome the checks use. A case study's card frames
 * the page's first screen on the right; an engagement's card sits on the
 * engagement's own hero illustration, which is drawn with an empty wall on
 * the left for exactly this reason. Re-run it when a title or a hero changes,
 * and bump the og:image path's ?v= if the bytes change, because a scraper
 * caches the old card by URL.
 *
 *   node scripts/og.mjs               render every card
 *   node scripts/og.mjs product       render the cards whose slug matches
 */
import fs from 'node:fs';
import path from 'node:path';
import { findChrome, loadChromium, serve } from './lib/harness.mjs';

const root = process.cwd();
const only = process.argv.slice(2);

/* slug -> what the card says and shows. The title is the page's name as its
   h1 says it, not its <title>: since #32 the <title> is written in the words
   a buyer searches ("Enterprise Design System Consultant"), and the card is
   what a person sees in a feed, where the page's own name is the thing to
   recognize. Keep it in step with the h1 by hand. */
const CARDS = {
  /* The homepage. Its card is the hero as the page says it: the eyebrow as
     the kicker, the h1 as the title, the page's own first screen on the
     right. The design system page, which has no card of its own, points at
     this one too. It replaced img/og-card.jpg on 2026-09-17, a card drawn by
     hand for the independent practice that had outlived the practice by a
     week and the level by a day. */
  'index':                             { kicker: 'Senior Product Designer',                title: 'Product design for software that got complicated.',            image: 'img/site/this-site.webp' },
  'dispatch-complexity':               { kicker: 'Case study · Midwest Couriers',        title: 'One real-time view of a 450+ truck fleet',                      image: 'img/site/dispatch-floor.webp' },
  'sap-product-maturity':              { kicker: 'Case study · Enterprise UX',           title: 'Making 40+ enterprise apps feel like one product',              image: 'img/site/sap-hero-02.webp' },
  'usda-operational-overhead':         { kicker: 'Case study · Nutrition Incentive Hub', title: 'Grant tools unified into one trusted platform',                image: 'img/site/hero-img.webp' },
  'innovators-studio-visual-identity': { kicker: 'Case study · Innovators Studio',       title: 'A global innovation network on one brand and platform',         image: 'img/site/group-100008-1.webp' },
  'enterprise-consulting':             { kicker: 'Career · 2013 to 2026',                title: '13 years as an enterprise design consultant',                   image: 'img/site/rba-hero.webp' },
  'hybrid-designer':                   { kicker: 'Career · 2005 to 2013',                title: '8 years as a hybrid designer / developer',                      image: 'img/site/pixel-farm-building.webp' },
  'door-county-found':                 { kicker: 'Built end to end',                          title: 'How I built Door County Found',                                 image: 'img/products/door-county-found.webp' },
  'lucy-learns':                       { kicker: 'Built end to end',                          title: 'How I built Lucy Learns',                                       image: 'img/products/lucy-learns.webp' },
  'while-were-here':                   { kicker: 'Built end to end',                          title: 'How I built While We’re Here',                             image: 'img/products/while-were-here.webp' },
  'this-site':                         { kicker: 'Built end to end',                          title: 'How I built this site',                                        image: 'img/site/this-site.webp' },
  'other':                             { kicker: 'Adam Hickey',                              title: 'Other things I make',                                          image: 'img/products/while-were-here.webp' },
  'dispatch-cockpit':                  { kicker: 'Prototype · synthetic data',              title: 'An AI truck recommendation the dispatcher can check and overrule',                        image: 'img/site/dispatch-cockpit.webp' },  'product-clarity': { kicker: 'How I work', title: 'Turn ambiguity into a decision', sub: 'The product has become complicated', hero: 'img/engagement/clarity-hero.webp' },  'design-system-foundation': { kicker: 'How I work', title: 'Set standards other teams adopt', sub: 'The products need a system', hero: 'img/engagement/system-hero.webp' },  'embedded-senior-product-design': { kicker: 'How I work', title: 'Own the design inside the team, not beside it', sub: 'An initiative with no senior owner', hero: 'img/engagement/embedded-hero.webp' },  'working-product-prototype': { kicker: 'How I work', title: 'Carry the direction into something that works', sub: 'Ideas everywhere, nothing you can use yet', hero: 'img/engagement/ai-hero.webp' },
  /* The writing family. Each article's card carries the article's own
     feature drawing, the same picture that opens the page, so a card in a
     feed already looks like the page it leads to. The index takes the
     plane and its one curl, the first article's drawing since the 2026-09-17
     regrouping. */
  'writing':                                              { kicker: 'Adam Hickey', title: 'Writing', sub: 'Questions people ask about complicated software, answered', image: 'img/writing/what-makes-an-interface-feel-finished.webp' },
  'standardizing-ux-across-40-sap-fiori-apps':            { kicker: 'Writing', title: 'What I learned standardizing UX across 40+ SAP Fiori apps', image: 'img/writing/standardizing-ux-across-40-sap-fiori-apps.webp' },
  'what-does-a-product-design-engineer-actually-do':        { kicker: 'Writing', title: 'What does a product design engineer actually do?', image: 'img/writing/what-does-a-product-design-engineer-actually-do.webp' },
  'what-makes-an-interface-feel-finished':                 { kicker: 'Writing', title: 'What makes an interface feel finished?', image: 'img/writing/what-makes-an-interface-feel-finished.webp' },
  'how-does-a-designer-work-in-developer-tools':            { kicker: 'Writing', title: 'How does a designer work in the developer’s tools?', image: 'img/writing/how-does-a-designer-work-in-developer-tools.webp' },
  'what-should-a-working-prototype-actually-prove':       { kicker: 'Writing', title: 'What should a working prototype actually prove?', image: 'img/writing/what-should-a-working-prototype-actually-prove.webp' },
  'designing-for-the-moment-the-workflow-breaks':          { kicker: 'Writing', title: 'Designing for the moment the workflow breaks',                  image: 'img/writing/designing-for-the-moment-the-workflow-breaks.webp' },
  'enterprise-ai-should-help-people-decide-not-just-answer': { kicker: 'Writing', title: 'Enterprise AI should help people decide, not just answer',    image: 'img/writing/enterprise-ai-should-help-people-decide-not-just-answer.webp' },
  'what-microsofts-hax-framework-gets-right-about-enterprise-ai': { kicker: 'Writing', title: 'What Microsoft’s HAX framework gets right about enterprise AI',    image: 'img/writing/what-microsofts-hax-framework-gets-right-about-enterprise-ai.webp' },
  'how-i-move-a-complex-workflow-from-ambiguity-to-release': { kicker: 'Writing', title: 'How I move a complex workflow from ambiguity to release',     image: 'img/writing/how-i-move-a-complex-workflow-from-ambiguity-to-release.webp' },
};

const css = (c) => c.match(/--color-[a-z-]+:\s*[^;]+/g).reduce((o, l) => { const [k, v] = l.split(/:\s*/); o[k] = v.trim(); return o; }, {});
const C = css(fs.readFileSync(path.join(root, 'color.css'), 'utf8'));
/* The tree is served over HTTP for the render, not opened as file://: a page
   set by setContent has no origin, and Chrome refuses it a file:// image. */
const { server, origin } = await serve(root);
const file = (p) => `${origin}/${p}`;

function html(card) {
  const onHero = Boolean(card.hero);
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;1,400&family=Montserrat:wght@500;600&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { background: ${C['--color-warm']}; color: ${C['--color-charcoal']}; font-family: "Crimson Text", Georgia, serif; position: relative; }
  .hero { position: absolute; inset: 0; background: url("${onHero ? file(card.hero) : ''}") center / cover no-repeat; }
  .card { position: absolute; inset: 0; display: grid; grid-template-columns: ${onHero || !card.image ? '1fr' : '1fr 420px'}; gap: 56px; padding: 72px 84px 64px; box-sizing: border-box; }
  .text { display: flex; flex-direction: column; min-width: 0; ${onHero ? 'max-width: 560px;' : ''} }
  .kicker { font-family: Montserrat, system-ui, sans-serif; font-weight: 600; font-size: 20px; letter-spacing: 0.14em; text-transform: uppercase; color: ${C['--color-accent-text']}; margin: 0 0 28px; }
  h1 { font-weight: 400; font-size: ${card.title.length > 56 ? 48 : card.title.length > 40 ? 58 : 66}px; line-height: 1.08; margin: 0; letter-spacing: -0.01em; }
  .sub { font-size: 28px; line-height: 1.3; color: ${C['--color-accent-text']}; margin: 22px 0 0; }
  .foot { margin-top: auto; padding-top: 24px; border-top: 1px solid ${C['--color-rule']}; display: flex; justify-content: space-between; align-items: baseline; }
  .name { font-size: 28px; }
  .where { font-family: Montserrat, system-ui, sans-serif; font-weight: 500; font-size: 16px; letter-spacing: 0.12em; text-transform: uppercase; color: ${C['--color-muted-gray']}; }
  .frame { align-self: center; width: 420px; height: 420px; border-radius: 18px; overflow: hidden; background: ${C['--color-white']}; box-shadow: 0 1px 0 ${C['--color-rule']}, 0 24px 48px -24px rgba(37,37,37,.35); }
  .frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
</style></head><body>
  ${onHero ? '<div class="hero"></div>' : ''}
  <div class="card">
    <div class="text">
      <p class="kicker">${card.kicker}</p>
      <h1>${card.title}</h1>
      ${card.sub ? `<p class="sub">${card.sub}</p>` : ''}
      <div class="foot"><span class="name">Adam Hickey</span><span class="where">Minneapolis / Remote</span></div>
    </div>
    ${!onHero && card.image ? `<div class="frame"><img src="${file(card.image)}"></div>` : ''}
  </div>
</body></html>`;
}

const chromium = await loadChromium();
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let n = 0;
for (const [slug, card] of Object.entries(CARDS)) {
  if (only.length && !only.some((o) => slug.includes(o))) continue;
  const src = card.hero || card.image;
  if (src && !fs.existsSync(path.join(root, src))) { console.error(`  ✗ ${slug}: ${src} is not in the tree`); process.exitCode = 1; continue; }
  await page.setContent(html(card), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(root, 'img', 'og', `${slug}.jpg`);
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
  console.log(`  ${slug}.jpg  ${Math.round(fs.statSync(out).size / 1024)} KB`);
  n++;
}
await browser.close();
server.close();
console.log(`\n  ${n} card${n === 1 ? '' : 's'} rendered into img/og/\n`);
