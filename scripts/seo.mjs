#!/usr/bin/env node
/* What a machine is told about this site, held to what the site actually is.
 *
 * WHAT THIS IS FOR. Three things now describe the site to something that is not
 * a person -- a canonical URL per page, an Open Graph card per page, and a
 * JSON-LD graph per page -- and all three are hand-written into fifteen files.
 * Hand-written metadata has one failure mode and it is silent: nothing renders
 * it, nobody reads it, and a page that has drifted looks exactly like a page
 * that has not. A missing canonical does not change a pixel. Neither does a
 * sitemap that lists fourteen of fifteen pages, or an author reference pointing
 * at a Person node somebody deleted from the homepage.
 *
 * That is the same shape as the problem counts.mjs was written for: a claim in
 * prose that stops being true while the sentence around it stays put. This is
 * the machine-readable half of it.
 *
 * THE ONE THAT MOTIVATED IT. The sitemap. It is generated -- `--write` builds
 * it from the tree -- which is exactly what makes it dangerous, because a
 * generated file that nobody regenerates is a stale file with an authoritative
 * air. A page added without a regeneration is a page search engines are never
 * told about, and the site does not look wrong: it looks like a site with
 * fourteen pages. So the sitemap is checked against the tree on every run, and
 * the fix is one flag.
 *
 * THE @id CHECK IS THE INTERESTING ONE. Every case study names its author by
 * reference -- {"@id": "https://adamhickey.com/#adam"} -- rather than repeating
 * the Person. That is correct, and it means fourteen pages depend on a node
 * defined in one place. Delete the homepage's graph and nothing breaks
 * visibly; fourteen pages simply start citing an author who is not defined
 * anywhere, and every one of them still validates as JSON. So references are
 * resolved across the whole site, not per page.
 *
 * WHAT IT DOES NOT DO. It does not judge whether the prose is good, whether a
 * description is the right length, or whether any of this improves a ranking.
 * It asks only whether the site and its metadata still agree.
 *
 * No browser. Exit 0 when everything agrees, 1 with the disagreement when it
 * does not, 2 when it could not find out -- which is not a pass.
 *
 *   node scripts/seo.mjs             check
 *   node scripts/seo.mjs --write     regenerate sitemap.xml from the tree
 *   node scripts/seo.mjs --verbose   also show what holds
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

/* Dates come from git, and the reasoning needs stating because the sitemap
   header used to argue the opposite. A lastmod "would have to be right to be
   worth anything," and a git date moves on a typo fix. Both true. What changed
   is what the date is for: a crawler and an assistant both weigh a page by
   when it last changed, and a site with no dates at all reads as a site
   nobody has touched. So the date is real -- the file's last commit, or today
   while it has uncommitted changes -- and it is written by `--write` into two
   places that have to agree: the sitemap's lastmod and the Article's
   dateModified. The check holds them to each other, and holds both to git
   with a fortnight's grace, because a squash-merge gives the file a new
   commit date without a new stamp. A page edited and not restamped goes red;
   a page merged a week after it was stamped does not. */
const git = (...a) => {
  try { return execSync(['git', ...a].join(' '), { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return null; }
};
const today = () => new Date().toISOString().slice(0, 10);
const SHALLOW = git('rev-parse', '--is-shallow-repository') === 'true';
function gitDate(f) {
  if (git('status', '--porcelain', '--', JSON.stringify(f))) return today();
  return git('log', '-1', '--format=%as', '--', JSON.stringify(f)) || today();
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const GRACE_DAYS = 14;
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

const write = process.argv.includes('--write');
const verbose = process.argv.includes('--verbose');
const say = (s = '') => console.log(s);
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const has = (f) => fs.existsSync(path.join(root, f));

/* The production origin. Every absolute URL the site hands a machine uses it,
   on staging as much as in production: a canonical names the preferred URL for
   the content, which is the production one whichever host is answering. */
const ORIGIN = 'https://adamhickey.com';

/* Same walk as counts.mjs, and deliberately the same exclusions. 404.html is
   what Pages serves for a miss, not a page of the site: it has no canonical
   address, must not be in the sitemap, and is checked separately below. */
function htmlPages(dir = root, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
    if (dir === root && e.name === '404.html') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlPages(p, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(root, p));
  }
  return out.sort();
}
const PAGES = htmlPages();

/* A page's canonical URL is derived, never read from the page -- the whole
   point is to compare what the page says against what it should say. */
const urlFor = (f) => (f === 'index.html' ? `${ORIGIN}/` : `${ORIGIN}/${f}`);

if (PAGES.length < 5) {
  say(`\n  Cannot check: found ${PAGES.length} pages. The scan is wrong, not the site.\n`);
  process.exit(2);
}

/* --------------------------------------------------------------------------
 * The sitemap, generated from the tree.
 * ------------------------------------------------------------------------ */
function sitemapXml() {
  const urls = PAGES.map((f) =>
    `  <url>\n    <loc>${urlFor(f)}</loc>\n    <lastmod>${gitDate(f)}</lastmod>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated. Rebuild it with the write flag on scripts/seo.mjs, and do not
     hand-edit: seo.mjs checks this file against the pages on disk and fails on
     any disagreement.

     lastmod is the file's last commit date, written by the same flag that
     stamps dateModified into each case study's Article, so the two cannot
     disagree. It moves on a typo fix, which is the honest answer to when the
     bytes changed; what it must never do is sit still while the page moves,
     and the check holds it to git for that.

     Note for anyone editing this text: a double hyphen cannot appear inside an
     XML comment. The first draft of this header said the flag in full, which
     made the sitemap fail to parse while every other check on it passed. That
     is why wellFormed() below exists. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

if (write) {
  /* Stamp first, so a page that gets a new dateModified here is dirty by the
     time the sitemap reads its date, and both say today. */
  let stamped = 0;
  for (const f of PAGES) {
    const src = read(f);
    if (!/"dateModified": "/.test(src)) continue;
    const next = src.replace(/"dateModified": "[^"]*"/g, `"dateModified": "${gitDate(f)}"`);
    if (next !== src) { fs.writeFileSync(path.join(root, f), next); stamped++; }
  }
  fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapXml());
  say(`\n  wrote sitemap.xml -- ${PAGES.length} pages, ${stamped} dateModified stamp${stamped === 1 ? '' : 's'} moved\n`);
  process.exit(0);
}

/* --------------------------------------------------------------------------
 * The checks.
 * ------------------------------------------------------------------------ */
const faults = [];
const held = [];
const fault = (where, what) => faults.push({ where, what });
const ok = (what) => held.push(what);

/* --- the sitemap agrees with the tree ------------------------------------ */
if (!has('sitemap.xml')) {
  say('\n  Cannot check: sitemap.xml is missing. `node scripts/seo.mjs --write` builds it.\n');
  process.exit(2);
}
const sitemap = read('sitemap.xml');

/* Well-formedness, before anything is read out of it. There is no XML parser
   in node, and this is not one: it looks for the two ways a generated sitemap
   in this repository has actually broken, both of which leave a file that
   greps perfectly and parses not at all.
   
   The first is a double hyphen inside a comment, which XML forbids outright.
   The header of this very file once explained how to regenerate it by naming
   the command flag, and the flag begins with two hyphens; every other check
   passed on the resulting file because every other check was a regex. A
   sitemap that does not parse is a sitemap no crawler reads, and it looks
   exactly like one that works. */
const comments = [...sitemap.matchAll(/<!--([\s\S]*?)-->/g)];
for (const c of comments)
  if (c[1].includes('--'))
    fault('sitemap.xml', 'a double hyphen inside an XML comment; the file will not parse');

/* The second is unbalanced tags, from a hand-edit or a truncated write. */
/* The open tag may carry attributes (urlset carries the namespace), so it is
   matched up to the delimiter rather than to a closing bracket. */
const openTags = (t) => (sitemap.match(new RegExp(`<${t}[\\s>]`, 'g')) || []).length;
const closeTags = (t) => (sitemap.match(new RegExp(`</${t}>`, 'g')) || []).length;
for (const t of ['urlset', 'url', 'loc'])
  if (openTags(t) !== closeTags(t))
    fault('sitemap.xml', `${openTags(t)} <${t}> against ${closeTags(t)} closing tags`);

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = new Map([...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
const expected = PAGES.map(urlFor);
const missingFromMap = expected.filter((u) => !locs.includes(u));
const strayInMap = locs.filter((u) => !expected.includes(u));
const duped = locs.filter((u, i) => locs.indexOf(u) !== i);

for (const u of missingFromMap) fault('sitemap.xml', `a page on disk it does not list: ${u}`);
for (const u of strayInMap) fault('sitemap.xml', `a URL with no page on disk: ${u}`);
for (const u of [...new Set(duped)]) fault('sitemap.xml', `listed twice: ${u}`);
if (!missingFromMap.length && !strayInMap.length && !duped.length)
  ok(`sitemap.xml lists all ${PAGES.length} pages, once each`);

/* Every entry dates itself, and the date is not older than the file by more
   than the grace. A shallow checkout cannot answer the second question, and
   says so rather than passing it. */
for (const f of PAGES) {
  const lm = lastmods.get(urlFor(f));
  if (!lm) { fault('sitemap.xml', `no lastmod for ${urlFor(f)}; \`node scripts/seo.mjs --write\` adds it`); continue; }
  if (!ISO.test(lm)) { fault('sitemap.xml', `lastmod for ${urlFor(f)} is ${lm}, not a YYYY-MM-DD date`); continue; }
  if (!SHALLOW && daysBetween(lm, gitDate(f)) > GRACE_DAYS)
    fault(f, `last changed ${gitDate(f)} but the sitemap says ${lm}; \`node scripts/seo.mjs --write\` restamps it`);
}
if ([...lastmods.values()].every((d) => ISO.test(d)) && lastmods.size === PAGES.length)
  ok(SHALLOW ? `every sitemap entry carries a lastmod (shallow checkout: not held to git)`
             : `every sitemap entry carries a lastmod within ${GRACE_DAYS} days of its last commit`);

/* --- the 404 page: served for every miss, and not a page ---------------- */
if (!has('404.html')) {
  fault('404.html', 'missing -- Pages serves its own generic page for a miss, with no way back in');
} else {
  const s404 = read('404.html');
  if (!/<meta name="robots" content="noindex/.test(s404)) fault('404.html', 'no noindex; a crawler would index the miss page under every dead URL');
  if (/<link rel="canonical"/.test(s404)) fault('404.html', 'carries a canonical, but it is served at every missing address and has none of its own');
  if (locs.includes(`${ORIGIN}/404.html`)) fault('sitemap.xml', 'lists 404.html, which is not a page');
  if (!/href="\//.test(s404)) fault('404.html', 'no root-absolute links; it is served at any depth, so relative ones break');
  ok('404.html is noindexed, uncanonical, absolute-linked and out of the sitemap');
}

/* --- robots.txt points at it --------------------------------------------- */
if (!has('robots.txt')) {
  fault('robots.txt', 'missing -- nothing tells a crawler where the sitemap is');
} else {
  const robots = read('robots.txt');
  const declared = robots.match(/^Sitemap:\s*(\S+)\s*$/mi);
  if (!declared) fault('robots.txt', 'no Sitemap: line');
  else if (declared[1] !== `${ORIGIN}/sitemap.xml`)
    fault('robots.txt', `names ${declared[1]}, but the sitemap is at ${ORIGIN}/sitemap.xml`);
  else ok('robots.txt names the sitemap');
}

/* --- per page: canonical, Open Graph, JSON-LD ---------------------------- */
const defined = new Set();   /* every @id this site defines */
const referenced = [];       /* every @id it points at, and from where */

const OG_REQUIRED = ['og:title', 'og:description', 'og:type', 'og:image', 'og:url'];

for (const f of PAGES) {
  const src = read(f);
  const want = urlFor(f);

  const canon = [...src.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  if (!canon.length) fault(f, 'no canonical');
  else if (canon.length > 1) fault(f, `${canon.length} canonical links; a page has one preferred URL`);
  else if (canon[0] !== want) fault(f, `canonical says ${canon[0]}, should be ${want}`);

  const prop = (p) => {
    const m = src.match(new RegExp(`<meta property="${p}" content="([^"]*)"`));
    return m && m[1];
  };
  for (const p of OG_REQUIRED) if (!prop(p)) fault(f, `no ${p}`);
  const ogUrl = prop('og:url');
  if (ogUrl && canon.length === 1 && ogUrl !== canon[0])
    fault(f, `og:url (${ogUrl}) and canonical (${canon[0]}) disagree`);
  /* The tab's title and the card's title are one title. Since #32 the
     <title> is written in the words a buyer searches rather than the page's
     own name, and a card that said the name while the tab said the search
     phrase would read as two pages; the h1 is where the name lives. */
  const title = src.match(/<title>([^<]*)<\/title>/);
  if (!title) fault(f, 'no <title>');
  else if (prop('og:title') && prop('og:title') !== title[1])
    fault(f, `og:title (${prop('og:title')}) and <title> (${title[1]}) disagree`);
  if (!/<meta name="twitter:card"/.test(src)) fault(f, 'no twitter:card');

  const blocks = [...src.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) { fault(f, 'no JSON-LD'); continue; }

  for (const [i, raw] of blocks.entries()) {
    let data;
    try { data = JSON.parse(raw); }
    catch (e) { fault(f, `JSON-LD block ${i + 1} is not valid JSON: ${e.message}`); continue; }
    if (data['@context'] !== 'https://schema.org')
      fault(f, `JSON-LD block ${i + 1} has no schema.org @context`);
    const nodes = data['@graph'] || [data];
    if (!nodes.length) fault(f, `JSON-LD block ${i + 1} declares nothing`);
    for (const n of nodes) {
      if (!n['@type']) fault(f, `a JSON-LD node with no @type`);
      if (n['@id']) defined.add(n['@id']);
      /* An Article dates itself, in ISO, in order, and in step with the
         sitemap: the same --write stamps both, so a disagreement means a
         hand edit. */
      if (n['@type'] === 'Article') {
        for (const k of ['datePublished', 'dateModified']) {
          if (!n[k]) fault(f, `Article has no ${k}`);
          else if (!ISO.test(n[k])) fault(f, `Article ${k} is ${n[k]}, not a YYYY-MM-DD date`);
        }
        if (ISO.test(n.datePublished) && ISO.test(n.dateModified) && n.dateModified < n.datePublished)
          fault(f, `Article dateModified ${n.dateModified} is before datePublished ${n.datePublished}`);
        const lm = lastmods.get(want);
        if (lm && ISO.test(n.dateModified) && lm !== n.dateModified)
          fault(f, `Article dateModified ${n.dateModified} and sitemap lastmod ${lm} disagree; \`node scripts/seo.mjs --write\` sets both`);
      }
      /* A FAQPage is a promise that the questions are on the page in words. */
      if (n['@type'] === 'FAQPage') {
        const qs = (n.mainEntity || []);
        if (!qs.length) fault(f, 'FAQPage with no questions');
        for (const q of qs) {
          const text = q.name || '';
          if (!src.replace(/&rsquo;/g, '\u2019').includes(text.replace(/&rsquo;/g, '\u2019')))
            fault(f, `FAQPage asks "${text.slice(0, 50)}" and the page does not`);
        }
      }
    }
    /* Every {"@id": x} appearing as a VALUE is a reference to a node that has
       to exist. A node's own "@id" key is a definition and is collected above;
       this walk only wants the pointers. */
    const walk = (v) => {
      if (Array.isArray(v)) return v.forEach(walk);
      if (!v || typeof v !== 'object') return;
      const keys = Object.keys(v);
      if (keys.length === 1 && keys[0] === '@id') referenced.push({ id: v['@id'], from: f });
      else for (const k of keys) if (k !== '@id') walk(v[k]);
    };
    walk(nodes);
  }
}

/* --- the references resolve, across the whole site ----------------------- */
const dangling = referenced.filter((r) => !defined.has(r.id));
for (const r of dangling) fault(r.from, `points at ${r.id}, which no page defines`);
if (!dangling.length && referenced.length)
  ok(`${referenced.length} JSON-LD references resolve to ${defined.size} defined nodes`);

/* --------------------------------------------------------------------------
 * The verdict.
 * ------------------------------------------------------------------------ */
let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim();
  const dirty = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim();
  if (dirty) commit += ' + uncommitted changes';
} catch { /* not a checkout; the path and page count still say what was read */ }

say('');
say(`  ${root}`);
say(`  ${PAGES.length} pages, at ${commit}`);

if (verbose) { say(''); for (const h of held) say(`    ✓ ${h}`); }

if (!faults.length) {
  say(`\n  ✓ the site and what it tells a machine still agree`);
  say(`    ${PAGES.length} canonicals, ${PAGES.length} Open Graph cards, ` +
      `${defined.size} structured-data nodes, ${locs.length} sitemap entries\n`);
  process.exit(0);
}

say(`\n  ${faults.length} disagreement${faults.length === 1 ? '' : 's'}:\n`);
const byFile = new Map();
for (const { where, what } of faults) {
  if (!byFile.has(where)) byFile.set(where, []);
  byFile.get(where).push(what);
}
for (const [where, whats] of byFile) {
  say(`    ${where}`);
  for (const w of whats) say(`        ${w}`);
}
say('\n  A page nothing points at is a page nothing finds. If the tree changed,');
say('  `node scripts/seo.mjs --write` rebuilds the sitemap; the rest is written');
say('  by hand into each page\'s head and has to be fixed there.\n');
process.exit(1);
