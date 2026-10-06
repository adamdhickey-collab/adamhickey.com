#!/usr/bin/env node
/* Renders "Adam Hickey Resume.pdf" from the HTML below.
 *
 * The résumé used to exist only as a PDF: the HTML that produced it lived in
 * a session scratchpad and was gone once the session was. Every edit since
 * meant rebuilding the page from the PDF by eye. This file is the source. Edit
 * the markup, run the script, commit both.
 *
 *   node scripts/resume.mjs                 # writes ../Adam Hickey Resume.pdf
 *   node scripts/resume.mjs --out x.pdf     # writes somewhere else
 *   node scripts/resume.mjs --png x.png     # a full-page screenshot, for eyeballing
 *   node scripts/resume.mjs --variant P     # renders a tailored copy from P
 *
 * THE DEFAULT IS THE ONE THAT SHIPS. The PDF at the repository root is linked
 * twice from index.html and is what an inbound reader downloads; it is general
 * on purpose and is never tailored to a posting.
 *
 * A VARIANT is a small JSON file naming a target and a list of {from, to}
 * edits applied to the markup below. Each `from` must match exactly once or
 * the render refuses -- a tailored résumé that silently edited the wrong
 * sentence is worse than one that did not render. The variants live in the
 * private practice-hq repository, in resumes/, because a file naming twelve
 * companies has no business in a tree that deploys to a public URL. So does
 * the output: a tailored PDF written into this repository's root would be
 * published at adamhickey.com, which is why the script refuses to put one
 * there.
 *
 * The one-page contract applies to variants too, and the base already renders
 * at 1056px of 1056. A variant that adds a line has to take one back.
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
 * else. It was Lora and Figtree until 2026-09-05 -- a document nobody had
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
const outFlag = argv.indexOf('--out');
const out = outFlag >= 0 ? path.resolve(argv[outFlag + 1]) : path.join(here, '..', 'Adam Hickey Resume.pdf');
const pngFlag = argv.indexOf('--png');
const png = pngFlag >= 0 ? path.resolve(argv[pngFlag + 1]) : null;
const varFlag = argv.indexOf('--variant');
const variantPath = varFlag >= 0 ? path.resolve(argv[varFlag + 1]) : null;

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
  .prior .job { margin-top: 5pt; }
  .prior p { margin-top: 1pt; }
</style>
</head>
<body>
<header>
  <h1>Adam Hickey</h1>
  <p class="tagline">Senior Product Designer · Complex Systems · Design Systems · Agentic Workflows · Prototyping in Code</p>
  <p class="contact"><span>adam@adamhickey.com</span><span>adamhickey.com</span><span>linkedin.com/in/adamdhickey</span></p>
</header>

<section>
  <h2>Professional summary</h2>
  <p>Senior product designer with 20 years designing complicated enterprise software and systems for organizations including Cargill, Intel, CBRE and Toro. My work has moved from interface craft, to design systems and governance at scale, to designing and building working products with coding agents. I&rsquo;m now focused on the product-design problems created when AI can act: how autonomy is bounded, how design systems become executable guidance, what can be verified automatically, and where human judgment still belongs. I bring enterprise systems experience, interaction design and hands-on prototyping in code to teams figuring out how the next generation of software gets made.</p>
</section>

<section>
  <h2>Experience</h2>
  <div class="job"><span><b>Selected Independent Work</b> — Product design, systems, prototyping</span><span class="dates">2026 – Present</span></div>
  <ul>
    <li><b>Agent Review</b> — Designed and built a React and TypeScript prototype for delegating UI work to coding agents. Defined the agent&rsquo;s boundaries, twelve written design rules, and automated visual and accessibility checks; ran the same feature with and without the rules to find where automation ends and human judgment begins.</li>
    <li><b>Dispatch Cockpit</b> — Designed a decision-support prototype for AI-assisted load assignment, making evidence, confidence, overrides and the manual path visible to expert dispatchers.</li>
    <li><b>Lucy Learns</b> and <b>Door County Found</b> — two products in use, defined, designed and built end to end: an offline-first training app and a regional travel guide built on structured data.</li>
  </ul>
  <div class="job"><span><b>RBA Inc</b> — Lead UX Product Designer</span><span class="dates">2013 – 2026</span></div>
  <ul>
    <li>Led enterprise product design and UX strategy for clients in manufacturing, healthcare, financial services, and the public sector, including compliance-sensitive work for a federal agency, a regional bank and healthcare providers.</li>
    <li>Tied design decisions to the numbers product, engineering and business teams already track: efficiency, adoption, quality, ROI.</li>
    <li>Built and governed design systems across SAP, Microsoft, Umbraco, and Sitecore platforms: tokens, component libraries, contribution rules and release checkpoints. Led accessibility, DesignOps and governance practices.</li>
    <li>Used AI to scale the design system: drafting documentation, auditing for drift, checking design against code, and pulling research together. Human judgment on every decision.</li>
  </ul>
</section>

<section>
  <h2>Selected projects</h2>
  <ul>
    <li>Scaling enterprise product design across 40+ SAP applications: one design system and accessibility standard, about a third less time from design to development, and UI defects in production cut roughly in half.</li>
    <li>Sprout, a design system for Cargill: tokens in the code, mirrored as Figma variables under a written sync contract, and packaged as a Claude Code skill.</li>
    <li>Cutting operational overhead 80% with a USDA grant-management portal (research, workflows, accessibility).</li>
    <li>Orchestrating real-time logistics for a 450+ truck fleet: cockpit UI, fleet visibility and the decision surface itself, for a dispatcher who is short on attention rather than short on data.</li>
  </ul>
</section>

<section>
  <h2>Core capabilities</h2>
  <p class="inline"><span>Product Strategy</span><span>UX &amp; Interaction Design</span><span>Information Architecture</span><span>Research &amp; Usability</span><span>Complex Workflows</span><span>Design Systems &amp; Governance</span><span>Accessibility</span><span>Decision-Support Interfaces</span><span>Human&ndash;AI Interaction</span><span>Agentic Workflows</span><span>AI Autonomy &amp; Escalation</span><span>Design-to-Code Systems</span></p>
</section>

<section>
  <h2>Tools &amp; platforms</h2>
  <p class="inline"><b>Prototyping &amp; build:</b> <span>React</span><span>TypeScript</span><span>HTML/CSS/JavaScript</span><span>Storybook</span><span>Playwright</span><span>Vitest &amp; axe</span><span>Git/GitHub</span><span>Claude Code (skills, plugins, MCP)</span></p>
  <p class="inline"><b>Design &amp; platforms:</b> <span>Figma/FigJam (variables, Dev Mode, component libraries)</span><span>CSS custom properties (tokens)</span><span>ChatGPT &amp; Gemini</span><span>SAP Fiori</span><span>Sitecore</span><span>Umbraco</span><span>WCAG 2.1 AA</span></p>
</section>

<section>
  <h2>Education</h2>
  <p><b>Bachelor of Science in Graphic Design</b>, University of Minnesota–Twin Cities (2005)</p>
</section>

<section class="prior">
  <h2>Prior professional experience</h2>
  <div class="job"><span><b>Pixel Farm</b> — Interactive Designer / Developer</span><span class="dates">Jan 2008 – Apr 2013</span></div>
  <p>Shipped two native iOS apps and an iPad app, plus configurator and store-locator builds for Lund Boats and Fulton Beer. Built front-end experiences in HTML, CSS and jQuery across Joomla! and WordPress; led rebrands and visual identity systems.</p>
  <div class="job"><span><b>LEVEL</b> — Interactive Designer</span><span class="dates">Jan 2006 – Jan 2008</span></div>
  <p>Designed and built front-end websites in HTML, CSS, and Flash with project managers, creative leads, writers, and developers.</p>
  <div class="job"><span><b>ByDesign</b> — Graphic Designer</span><span class="dates">Jan 2005 – Jan 2006</span></div>
</section>
</body>
</html>`;

/* Variants are applied to the authored markup, not to a rendered file, so a
   tailored copy is the same document with a few sentences swapped rather than
   a second résumé drifting away from the first. */
let doc = html;
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
