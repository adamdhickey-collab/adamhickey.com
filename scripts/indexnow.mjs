#!/usr/bin/env node
/* Tell Bing, and everyone who reads IndexNow, which pages changed.
 *
 * WHAT INDEXNOW IS. A crawler finds a changed page by coming back to look,
 * and for a site this size it comes back on its own schedule, which can be
 * weeks. IndexNow is the other direction: one POST naming the URLs that
 * changed, and the engines that take part (Bing, Yandex, Naver, Seznam; not
 * Google) fetch those first. Bing also uses what it gets for the grounding
 * behind its AI answers, which is the reason this site bothers.
 *
 * HOW THE KEY WORKS. The site proves it is allowed to submit for itself by
 * hosting a file at the root whose name is the key and whose content is the
 * key. There is exactly one such file in this tree, thirty-two hex
 * characters and a .txt, and this script finds it rather than carrying a
 * copy: a key written in two places is a key that can disagree. The file is
 * public by design -- anyone can read it, and it authorizes nothing but
 * submitting this site's own URLs.
 *
 * WHAT IT SUBMITS. Every <loc> in sitemap.xml, by default, which is every
 * page seo.mjs knows about; or the URLs given on the command line, for a
 * change that touched two pages rather than fifteen. Nothing is sent without
 * --submit. Without it the script prints what it would send and stops, so a
 * run that was meant to look does not become a run that spoke.
 *
 * WHEN TO RUN IT. After the merge has deployed, not before: the engine fetches
 * the URLs it is told about, and told about a page that still serves the old
 * bytes, it indexes the old bytes. Pages caches for ten minutes on top of
 * that. Merge, wait for the deploy, then:
 *
 *   node scripts/indexnow.mjs                       what would be sent
 *   node scripts/indexnow.mjs --submit              send every page in the sitemap
 *   node scripts/indexnow.mjs --submit https://adamhickey.com/engagement/product-clarity.html
 *
 * Exit 0 when the endpoint accepted the list (200 or 202), 1 when it refused
 * it, 2 when the question could not be asked: no key file, no sitemap, or a
 * URL that is not on this site.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const submit = argv.includes('--submit');
const given = argv.filter((a) => !a.startsWith('--'));
const say = (s = '') => console.log(s);

const ORIGIN = 'https://adamhickey.com';
const HOST = 'adamhickey.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/* The key, found rather than configured. */
const keyFiles = fs.readdirSync(root).filter((n) => /^[0-9a-f]{32}\.txt$/.test(n));
if (keyFiles.length !== 1) {
  say(`\n  Cannot submit: found ${keyFiles.length} key files at the root; there should be exactly one, named <key>.txt.\n`);
  process.exit(2);
}
const key = keyFiles[0].slice(0, -4);
const body = fs.readFileSync(path.join(root, keyFiles[0]), 'utf8').trim();
if (body !== key) {
  say(`\n  Cannot submit: ${keyFiles[0]} contains "${body}", which is not its own name.\n`);
  process.exit(2);
}

/* The URLs: the sitemap's, or the ones asked for. */
let urls;
if (given.length) {
  const off = given.filter((u) => !u.startsWith(`${ORIGIN}/`) && u !== `${ORIGIN}/`);
  if (off.length) {
    say(`\n  Cannot submit: not on this site: ${off.join(', ')}\n`);
    process.exit(2);
  }
  urls = [...new Set(given)];
} else {
  const sm = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sm)) {
    say('\n  Cannot submit: sitemap.xml is missing. `node scripts/seo.mjs --write` builds it.\n');
    process.exit(2);
  }
  urls = [...fs.readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

say('');
say(`  ${root}`);
say(`  ${urls.length} URL${urls.length === 1 ? '' : 's'}, key ${key.slice(0, 6)}…, to ${ENDPOINT}`);
say('');
for (const u of urls) say(`    ${u}`);

if (!submit) {
  say('\n  Nothing sent. Add --submit to send it.\n');
  process.exit(0);
}

const payload = { host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: urls };
let res;
try {
  res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
} catch (e) {
  say(`\n  Could not reach ${ENDPOINT}: ${e.message}\n`);
  process.exit(2);
}

/* 200 and 202 both mean "taken"; 202 is the first time a key is seen and the
   endpoint has not yet fetched the key file to check it. Anything else is
   the endpoint's own reason, and the message is worth reading: 403 is a key
   that does not resolve, which is what a run before the deploy looks like. */
const text = (await res.text()).trim();
if (res.status === 200 || res.status === 202) {
  say(`\n  ✓ accepted (${res.status}${res.status === 202 ? ', key not yet verified' : ''})\n`);
  process.exit(0);
}
say(`\n  ✗ refused: ${res.status} ${res.statusText}${text ? `\n    ${text}` : ''}\n`);
process.exit(1);
