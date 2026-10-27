#!/usr/bin/env node
/* Renders the two résumés from the HTML below: "Adam Hickey Resume.pdf",
 * the reading copy a person downloads from the site, and "Adam Hickey Resume
 * (detailed).pdf", the one-column copy written to be parsed, which llms.txt
 * points an assistant at and every tailored variant is cut from.
 *
 * The résumé used to exist only as a PDF: the HTML that produced it lived in
 * a session scratchpad and was gone once the session was. Every edit since
 * meant rebuilding the page from the PDF by eye. This file is the source. Edit
 * the markup, run the script, commit both.
 *
 *   node scripts/resume.mjs                 # writes ../Adam Hickey Resume.pdf
 *   node scripts/resume.mjs --full          # writes ../Adam Hickey Resume (detailed).pdf
 *   node scripts/resume.mjs --out x.pdf     # writes somewhere else
 *   node scripts/resume.mjs --png x.png     # a full-page screenshot, for eyeballing
 *   node scripts/resume.mjs --variant P     # renders a tailored copy from P
 *
 * Render both and commit both whenever a fact changes: they are one set of
 * facts at two lengths, and the reading copy must never say what the
 * detailed one does not.
 *
 * THE DEFAULT IS THE ONE THAT SHIPS. "Adam Hickey Resume.pdf" is linked
 * twice from index.html and is what an inbound reader downloads; it is general
 * on purpose and is never tailored to a posting. Until 2026-10-12 that was the
 * detailed copy, which reads well to a filter and like a form to a person.
 *
 * A VARIANT is a small JSON file naming a target and a list of {from, to}
 * edits applied to the detailed copy's markup, below. Each `from` must match exactly once or
 * the render refuses -- a tailored résumé that silently edited the wrong
 * sentence is worse than one that did not render. The variants live in the
 * private practice-hq repository, in resumes/, because a file naming twelve
 * companies has no business in a tree that deploys to a public URL. So does
 * the output: a tailored PDF written into this repository's root would be
 * published at adamhickey.com, which is why the script refuses to put one
 * there.
 *
 * The one-page contract applies to variants too, and the detailed copy
 * already renders at 1056px of 1056. A variant that adds a line has to take
 * one back.
 *
 * Deliberately a .mjs holding a template string rather than a .html file:
 * every check in this repository enumerates *.html under the root as a page
 * of the site, and counts.mjs asserts the page count. A résumé source with an
 * .html extension would deploy as a nineteenth page and fail the count.
 *
 * Needs playwright-core (npm i playwright-core) and a Chromium. findChrome()
 * looks for Linux paths and Playwright's own download, so on a Mac point it
 * at the installed browser:
 *
 *   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     node scripts/resume.mjs
 *
 * The fonts are Google Fonts and load over the network at render time: the
 * site's own pair, Crimson Text for the name and Montserrat for everything
 * else. Rewritten on 2026-10-26 to the balanced positioning, then the same
 * evening to the homepage as it stands: "software that fits the job and the
 * person doing it" (for part of 2026-10-27 "and earns the trust of the
 * person doing it", then the shorter line again), the system people and
 * coding agents build from, and the hero's facts (design systems, prototypes, usability testing, accessibility,
 * complex workflows) in place of the four strengths, which read as a run of
 * adjectives. Aligned again on 2026-10-27 (the portfolio alignment pass):
 * the tagline and both summaries name the three eras in the order they
 * happened (visual design, interactive development, enterprise product
 * design), building with coding agents is the method and "decide what
 * ships" the job, the two prototypes say they run on simulated scenarios
 * and synthetic data, the reading copy keeps "about a third" like every
 * other copy of that figure. The reading copy's Selected work stays at
 * three: a fourth line put it 65px over the page. The title stays Senior Product Designer; employers, titles,
 * dates and figures are unchanged. It was Lora and Figtree until 2026-09-05 -- a document nobody had
 * reconciled with TYPOGRAPHY.md, and the only one of the practice's artifacts
 * that actually reaches people.
 *
 * Letter, one page. The script exits 1 if the render spills to a second page,
 * because a two-page résumé is a different document and should be a decision.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, loadChromium } from './lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const varFlag = argv.indexOf('--variant');
const variantPath = varFlag >= 0 ? path.resolve(argv[varFlag + 1]) : null;
/* A variant is always cut from the detailed copy: that is the one written to
   be parsed, and the one every variant's {from} was written against. */
const full = argv.includes('--full') || Boolean(variantPath);
const outFlag = argv.indexOf('--out');
const out = outFlag >= 0
  ? path.resolve(argv[outFlag + 1])
  : path.join(here, '..', full ? 'Adam Hickey Resume (detailed).pdf' : 'Adam Hickey Resume.pdf');
const pngFlag = argv.indexOf('--png');
const png = pngFlag >= 0 ? path.resolve(argv[pngFlag + 1]) : null;

const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Adam Hickey Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  /* No custom properties on purpose: tokens.mjs reads a "--name:" in any
     stylesheet as a declaration, and this document is not part of the site.
     The values are the site's all the same -- TYPOGRAPHY.md's two families and
     COLOR.md's ink ladder (charcoal #252525 primary, muted-gray #5c5f5c
     secondary, rule #d0d0c8 for the hairline under a heading). The separator
     middots take the secondary ink rather than the rule: they sit in a run of
     text beside the tagline's literal ones, and a lighter dot next to an
     identical darker dot reads as a fault, not as a quieter separator.
     written out because this file cannot reference the tokens that name them.
     Montserrat sets wider than Figtree did, so the body size came down with
     the swap; the page is still the contract the script enforces below. */
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 8.5in;
    min-height: 11in;
    padding: 0.5in 0.7in 0.35in;
    font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
    font-size: 8.0pt;
    line-height: 1.32;
    color: #252525;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1 {
    /* Crimson Text is loaded at 400 only and is never bolded -- TYPOGRAPHY.md,
       "hierarchy comes from size." Lora carried this line at 600; the size
       goes up rather than the weight. */
    font-family: "Crimson Text", Georgia, serif;
    font-weight: 400;
    font-size: 27pt;
    line-height: 1.1;
    margin: 0 0 4pt;
    letter-spacing: -0.01em;
  }
  .tagline {
    font-size: 8.0pt;
    letter-spacing: 0.04em;
    color: #5c5f5c;
    margin: 0 0 4pt;
  }
  .contact {
    font-size: 8.2pt;
    color: #252525;
    margin: 0 0 10pt;
  }
  .contact span + span::before { content: "\00a0\00a0\00b7\00a0\00a0"; color: #5c5f5c; }
  h2 {
    font-size: 7.8pt;
    font-weight: 600;
    letter-spacing: 0.01em;
    margin: 6.5pt 0 3pt;
    padding-bottom: 2.5pt;
    border-bottom: 0.6pt solid #d0d0c8;
  }
  section:first-of-type h2 { margin-top: 0; }
  p { margin: 0; }
  .job { display: flex; justify-content: space-between; align-items: baseline; margin-top: 5pt; }
  .job:first-of-type { margin-top: 0; }
  .job b { font-weight: 600; }
  .job .dates { font-size: 8.0pt; color: #5c5f5c; white-space: nowrap; }
  ul { margin: 1pt 0 0; padding-left: 11pt; }
  li { margin: 0 0 1pt; padding-left: 2pt; }
  li::marker { color: #5c5f5c; }
  .inline { line-height: 1.5; }
  /* An item never breaks inside itself: "Data- / Dense" and "React & /
     TypeScript" were two lines of one term. Each item is an inline-block,
     which keeps its words together and still lets the run wrap between
     items, and the separator rides on the END of an item rather than the
     start of the next, so a wrapped line ends on a dot instead of opening
     with one. */
  .inline span { display: inline-block; }
  .inline span:not(:last-child)::after { content: "\00a0\00a0\00b7\00a0\00a0"; color: #5c5f5c; }
  .inline b { font-weight: 600; }
  li b { font-weight: 600; }
  /* The studio years sit in Experience since 2026-10-23, after RBA, rather
     than under "Prior professional experience" at the foot: the building
     is the fact the rest of the page leans on, and filing it as "prior"
     hid it. They keep their paragraph form. */
  .job + p { margin-top: 1pt; }
</style>
</head>
<body>
<header>
  <h1>Adam Hickey</h1>
  <p class="tagline">Senior Product Designer · Enterprise UX · Design Systems · Visual Design · Prototyping in Code</p>
  <p class="contact"><span>Minneapolis, MN</span><span>Remote or hybrid</span><span>adam@adamhickey.com</span><span>adamhickey.com</span><span>linkedin.com/in/adamdhickey</span></p>
</header>

<section>
  <h2>Professional summary</h2>
  <p>Senior product designer with 20 years across visual design, interactive development and enterprise product design, for organizations including Cargill, Intel, CBRE and Toro. I design software that fits the job and the person doing it. I began as a hybrid interactive designer and developer, building what I designed in HTML, CSS and jQuery; spent thirteen years leading enterprise product design and design systems at scale; and now design the systems teams build from, build working versions with coding agents, and decide what ships.</p>
</section>

<section>
  <h2>Experience</h2>
  <div class="job"><span><b>Selected Independent Work</b> — Product design, visual systems, prototyping</span><span class="dates">2026 – Present</span></div>
  <ul>
    <li><b>Agent Review</b> — Designed and built, with Claude Code, a React and TypeScript prototype where agents build the screens and a designer decides what ships: a component system with written design rules and automated visual and accessibility checks, following one simulated feature from a support ticket to what ships.</li>
    <li><b>Dispatch Cockpit</b> — Designed and built a working decision-support prototype for AI-assisted load assignment, on synthetic data: the evidence behind a pick, close calls, overrides and the manual path, for expert dispatchers.</li>
    <li><b>Door County Found</b> and <b>Lucy Learns</b> — two products in use, designed and built end to end: an editorial travel guide (identity, art direction, a site its editor keeps current) and an illustrated, offline-first dog-training app.</li>
  </ul>
  <div class="job"><span><b>RBA Inc</b> — Lead UX Product Designer</span><span class="dates">2013 – 2026</span></div>
  <ul>
    <li>Led UX and visual design for complex digital products, enterprise applications and design systems for clients in logistics, manufacturing, healthcare, financial services and the public sector, including compliance-sensitive work for a federal agency, a regional bank and healthcare providers.</li>
    <li>Sat with people through their workday and fixed what slowed them: usability testing on real tasks, information architecture, interaction design and visual hierarchy across large sets of screens, with developers in the room from the first sketch.</li>
    <li>Built and governed design systems across SAP, Microsoft, Umbraco, and Sitecore platforms: tokens, component libraries, contribution rules and release checkpoints; designed and built Connect, the firm&rsquo;s own design-system site. Led the accessibility (WCAG 2.1 AA), DesignOps and governance practices.</li>
    <li>Tied design decisions to the numbers teams already track: efficiency, adoption, quality, ROI.</li>
  </ul>
  <div class="job"><span><b>Pixel Farm</b> — Interactive Designer / Developer</span><span class="dates">Jan 2008 – Apr 2013</span></div>
  <p>Designed and built brand-led websites, campaigns and interactive pieces for Lund Boats, Fulton Beer, Hazelden and others, including Lund&rsquo;s boat configurator; shipped two native iOS apps and an iPad app; led rebrands and identity systems. Front ends in HTML, CSS and jQuery.</p>
  <div class="job"><span><b>LEVEL</b> — Interactive Designer</span><span class="dates">Jan 2006 – Jan 2008</span></div>
  <p>Designed and built websites and interactive pieces in HTML, CSS and Flash, beside writers, creative leads and developers.</p>
  <div class="job"><span><b>ByDesign</b> — Design Intern</span><span class="dates">2004 – 2006</span></div>
</section>

<section>
  <h2>Selected projects</h2>
  <ul>
    <li>Making 40+ SAP applications feel like one product: one visual language, one design system and one accessibility standard, about a third less time from design to development, and UI defects in production cut roughly in half.</li>
    <li>An identity, illustration and badge system, templates and a community platform for a global corporation&rsquo;s innovation network, over four fiscal years; campaign production time roughly halved.</li>
    <li>Replacing spreadsheets with one USDA grant-management portal, cutting data-analysis requests from 45–55 hours to just over 10.</li>
    <li>A real-time cockpit for a 450+ truck fleet, built for the speed of expert dispatchers; board-clearing time down roughly 30%.</li>
  </ul>
</section>

<section>
  <h2>Core capabilities</h2>
  <p class="inline"><span>UX &amp; Interface Design</span><span>Visual Design &amp; Typography</span><span>Complex Workflows</span><span>Information Architecture</span><span>Interaction Design</span><span>Design Systems &amp; Governance</span><span>Accessibility (WCAG 2.1 AA)</span><span>Brand Identity &amp; Illustration</span><span>Prototyping in Code</span><span>Usability Testing</span><span>Human&ndash;AI Interaction</span><span>Developer Collaboration</span></p>
</section>

<section>
  <h2>Tools &amp; platforms</h2>
  <p class="inline"><b>Design:</b> <span>Figma/FigJam (variables, Dev Mode, component libraries)</span><span>Adobe Creative Cloud (Illustrator, Photoshop, InDesign)</span><span>CSS custom properties (tokens)</span><span>ChatGPT &amp; Gemini</span></p>
  <p class="inline"><b>Front end, by hand (2005–2013) and with coding agents now:</b> <span>HTML</span><span>CSS</span><span>JavaScript/jQuery</span><span>React</span><span>TypeScript</span><span>Storybook</span><span>Playwright</span><span>Vitest &amp; axe</span><span>Git/GitHub</span><span>Claude Code (skills, plugins, MCP)</span></p>
  <p class="inline"><b>Platforms:</b> <span>SAP Fiori</span><span>Sitecore</span><span>Umbraco</span><span>WordPress</span><span>Joomla!</span><span>WCAG 2.1 AA</span></p>
</section>

<section>
  <h2>Education</h2>
  <p><b>Bachelor of Science in Graphic Design</b>, University of Minnesota–Twin Cities (2005)</p>
</section>

</body>
</html>`;

/* THE READING COPY. The document above is written to be parsed: every
   keyword a screener's filter or an assistant might look for, in one column,
   in the order an applicant tracking system expects. This one is written to
   be looked at, by a person who clicked "résumé" on the site and wants the
   shape of twenty years in the time it takes to scroll a PDF. Same facts,
   about half the words, two columns: the story on the left, the reference
   material (contact, school, skills, tools, clients) on the right, where an
   eye looks for it.

   It is what the site links. It is a cut of the detailed copy, never a
   rewrite with new claims: nothing here says what that document or the site
   does not (the two client names it adds, Banner Bank and International
   Trucks, are the enterprise consulting case study's), so a fact changing
   there is a fact to change here.

   Same rules as above: the site's two families, Crimson Text at 400 only,
   no italic in the sans, and the ink ladder written out as values. Sage
   (#556b51, COLOR.md's --color-accent-text, 5.82:1 on white) carries the
   role titles and nothing else, the one place a reader's eye should land
   after the name. */
/* The wordmark is read from the site's own file at render time rather than
   pasted in, so a redrawn logo reaches the résumé on its next render instead
   of the two quietly drifting. It goes in as an <img> so the SVG's own
   class names (.st0 to .st4) cannot meet this page's styles. */
const logo = 'data:image/svg+xml;base64,' +
  fs.readFileSync(path.join(here, '..', 'img', 'site', 'adam-logo.svg')).toString('base64');

const reading = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Adam Hickey Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 8.5in;
    height: 11in;
    padding: 0.62in 0.7in 0.5in;
    font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
    color: #252525;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  a { color: inherit; text-decoration: none; }
  p { margin: 0; }
  ul { list-style: none; margin: 0; padding: 0; }
  .page {
    display: grid;
    grid-template-columns: 1fr 2.3in;
    column-gap: 0.45in;
  }
  /* The wordmark says the name, so the name is not set again beside it
     (the practice's documents follow the same rule). It is still text,
     laid over the wordmark in transparent ink, so a reader can search the
     PDF for it or copy it out. The usual visually-hidden clip does not do
     that here: Chrome drops clipped text from the PDF's text layer, and the
     file then had no "Adam Hickey" in it anywhere but the email address. */
  .wordmark { display: block; height: 0.62in; width: auto; margin-left: -2pt; }
  h1 { position: relative; margin: 0; }
  .name-text {
    position: absolute; left: 0; top: 0.12in;
    font-size: 24pt; line-height: 1; white-space: nowrap;
    color: transparent;
  }
  .title {
    font-size: 12pt;
    font-weight: 600;
    color: #556b51;
    margin: 5pt 0 0;
  }
  .intro {
    font-size: 10.5pt;
    line-height: 1.5;
    margin: 18pt 0 0;
  }
  h2 {
    font-size: 11pt;
    font-weight: 600;
    line-height: 1.3;
    margin: 0 0 5pt;
  }
  main section { margin-top: 24pt; }
  aside section + section { margin-top: 22pt; }
  /* The reference this was drawn from hangs each role on a dot, with a
     hairline running down beside what was done there. It is the one
     ornament on the page, and it earns its place by making a role and its
     paragraph read as one thing. */
  .role {
    position: relative;
    padding-left: 15pt;
  }
  .role + .role { margin-top: 9pt; }
  .role::before {
    content: "";
    position: absolute;
    left: 1.5pt;
    top: 5pt;
    width: 4pt;
    height: 4pt;
    border-radius: 50%;
    background: #5c5f5c;
  }
  .role:has(.did)::after {
    content: "";
    position: absolute;
    left: 3.2pt;
    top: 13pt;
    bottom: 2pt;
    width: 0.6pt;
    background: #d0d0c8;
  }
  .role h3 {
    font-size: 10pt;
    font-weight: 600;
    color: #556b51;
    margin: 0;
  }
  .dates { color: #5c5f5c; }
  .role .dates { margin: 1pt 0 3pt; }
  .work li + li { margin-top: 6pt; }
  .work b, aside b { font-weight: 600; }
  aside { padding-top: 4pt; }
  aside p + p { margin-top: 0; }
  aside .dates { margin: 1pt 0 2pt; }
  .as { color: #556b51; font-weight: 500; }
  .earlier .dates + p { margin-top: 6pt; }
</style>
</head>
<body>
<div class="page">
<main>
  <header>
    <h1><span class="name-text">Adam Hickey</span><img class="wordmark" src="${logo}" alt=""></h1>
    <p class="title">Senior Product Designer</p>
  </header>
  <p class="intro">Twenty years across visual design, interactive development and enterprise product design. I design software that fits the job and the person doing it, build working versions with coding agents, and decide what ships.</p>

  <section>
    <h2>Independent</h2>
    <div class="role">
      <h3>Product design, visual systems, prototyping</h3>
      <p class="dates">2026 – Present</p>
      <p class="did">Two products in use, designed and built end to end: Door County Found, an editorial travel guide, and Lucy Learns, an illustrated dog-training app. Also Agent Review and Dispatch Cockpit, two working prototypes on simulated scenarios, built with coding agents.</p>
    </div>
  </section>

  <section>
    <h2>RBA Inc</h2>
    <div class="role">
      <h3>Lead UX Product Designer</h3>
      <p class="dates">2013 – 2026</p>
      <p class="did">Led UX and visual design for complex digital products, enterprise applications and design systems across logistics, manufacturing, healthcare, finance and the public sector. Built and governed design systems on SAP, Microsoft, Umbraco and Sitecore, led the accessibility practice, and designed and built Connect, the firm&rsquo;s own design-system site.</p>
    </div>
  </section>

  <section class="work">
    <h2>Selected work</h2>
    <ul>
      <li><b>40+ SAP applications</b> made to feel like one product: one design system and accessibility standard; about a third less design-to-development time, production UI defects roughly halved.</li>
      <li><b>An identity and community platform</b> for a global corporation&rsquo;s innovation network: mark, illustration, badges, templates and a portal.</li>
      <li><b>A USDA grant-management portal</b> in place of spreadsheets, taking data-analysis requests from 45–55 hours to just over 10.</li>
    </ul>
  </section>

  <section>
    <h2>Pixel Farm</h2>
    <div class="role">
      <h3>Interactive Designer / Developer</h3>
      <p class="dates">2008 – 2013</p>
      <p class="did">Designed and built brand-led sites, campaigns and apps for Lund Boats, Fulton Beer, Hazelden and others, in HTML, CSS and jQuery.</p>
    </div>
  </section>
</main>

<aside>
  <section>
    <h2>Contact</h2>
    <p>Minneapolis, MN</p>
    <p>Remote or hybrid</p>
    <p><a href="mailto:adam@adamhickey.com">adam@adamhickey.com</a></p>
    <p><a href="https://adamhickey.com">adamhickey.com</a></p>
    <p><a href="https://www.linkedin.com/in/adamdhickey">linkedin.com/in/adamdhickey</a></p>
  </section>

  <section>
    <h2>Expertise</h2>
    <ul>
      <li>Design systems</li>
      <li>Prototyping in code</li>
      <li>Usability testing</li>
      <li>Accessibility</li>
      <li>Complex workflows</li>
      <li>Visual design and typography</li>
      <li>Brand identity and illustration</li>
    </ul>
  </section>

  <section>
    <h2>Tools</h2>
    <p><b>Design:</b> Figma, Illustrator, Photoshop, InDesign</p>
    <p><b>Front end:</b> HTML, CSS, JavaScript, React, TypeScript, Storybook</p>
    <p><b>With coding agents:</b> Claude Code, Playwright, Git</p>
  </section>

  <section>
    <h2>Clients</h2>
    <p>Cargill, Intel, CBRE, Toro, Banner Bank, International Trucks</p>
  </section>

  <section class="earlier">
    <h2>Earlier</h2>
    <p>LEVEL</p>
    <p class="as">Interactive Designer</p>
    <p class="dates">2006 – 2008</p>
    <p>ByDesign</p>
    <p class="as">Design Intern</p>
    <p class="dates">2004 – 2006</p>
  </section>

  <section>
    <h2>University of Minnesota</h2>
    <p class="dates">2005</p>
    <p>BS in Graphic Design</p>
  </section>
</aside>
</div>
</body>
</html>`;

/* Variants are applied to the authored markup, not to a rendered file, so a
   tailored copy is the same document with a few sentences swapped rather than
   a second résumé drifting away from the first. */
let doc = full ? html : reading;
let variant = null;
if (variantPath) {
  variant = JSON.parse(fs.readFileSync(variantPath, 'utf8'));
  const edits = variant.edits || [];
  if (!edits.length) {
    console.error(`✗ variant ${variant.name || variantPath} has no edits`);
    process.exit(1);
  }
  edits.forEach((e, i) => {
    const hits = doc.split(e.from).length - 1;
    if (hits !== 1) {
      console.error(`✗ variant ${variant.name}: edit ${i + 1} of ${edits.length} matches ${hits} times, expected 1`);
      console.error(`  from: ${String(e.from).slice(0, 100)}`);
      console.error('  The base résumé has changed under this variant. Fix the variant, not the base.');
      process.exit(1);
    }
    doc = doc.replace(e.from, e.to);
  });
}

/* A tailored copy must never land where Pages would upload it. */
const root = path.resolve(path.join(here, '..'));
const outDir = variant
  ? (outFlag >= 0 ? path.dirname(out) : path.join(path.dirname(variantPath), 'out'))
  : null;
if (variant && path.resolve(outDir) === root) {
  console.error('✗ a tailored résumé cannot be written to the repository root — Pages would publish it');
  process.exit(1);
}
const target = variant
  ? (outFlag >= 0 ? out : path.join(outDir, `Adam Hickey Resume — ${variant.name}.pdf`))
  : out;
if (variant && outFlag < 0) fs.mkdirSync(outDir, { recursive: true });

const chromium = await loadChromium();
const browser = await chromium.launch({ executablePath: findChrome() });
try {
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  await page.setContent(doc, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  /* One page is the contract. Measure before printing so the failure names
     the overflow in points rather than handing back a two-page file. */
  const height = await page.evaluate(() => document.body.scrollHeight);
  const limit = 11 * 96;
  if (png) await page.screenshot({ path: png, fullPage: true });
  if (height > limit) {
    console.error(`✗ résumé runs ${height}px tall against a ${limit}px page; trim before rendering`);
    process.exit(1);
  }
  await page.pdf({ path: target, format: 'Letter', printBackground: true, preferCSSPageSize: true });
  if (variant) console.log(`  variant ${variant.name}${variant.target ? ` → ${variant.target}` : ''}, ${(variant.edits || []).length} edits`);
  console.log(`  wrote ${path.relative(process.cwd(), target)}  (${fs.statSync(target).size} bytes, ${height}px of ${limit})`);
} finally {
  await browser.close();
}
