/* What both contrast checks need to look at this site in a browser.
 *
 * There are two of them and they ask different questions. states.mjs forces
 * every hover, focus and script-applied state and measures what a reader can
 * REACH. resting.mjs measures every piece of text a reader can SEE without
 * touching anything. Between them they cover the site; separately, neither
 * does.
 *
 * They shared nothing until this file existed, and the resting audit was the
 * one that lived in a session scratchpad rather than the repository. That is
 * the reason to extract rather than copy: two implementations of "what colour
 * is behind this text" would agree on the day they were written and quietly
 * stop agreeing later, and the one nobody could run is the one that would
 * drift. The compositing below is subtle enough that having two of it is a
 * liability -- it was wrong twice before it was right.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

/* playwright-core is not a dependency of this repository -- there is no
 * package.json and these scripts are the only things that would want one.
 * Find it if the environment has it, and say plainly what to do if not. */
export function loadChromium(scriptName) {
  const require = createRequire(import.meta.url);
  for (const spec of ['playwright-core', 'playwright', process.env.PLAYWRIGHT_CORE || '']) {
    if (!spec) continue;
    try { return require(spec).chromium; } catch { /* keep looking */ }
  }
  console.error('\n  This needs Playwright and a Chromium build.\n');
  console.error('    npm i playwright-core          (or set PLAYWRIGHT_CORE to a path)');
  console.error(`    CHROME=/path/to/chrome node scripts/${scriptName}\n`);
  process.exit(2);
}

/* Chromium is where the environment says it is. PLAYWRIGHT_BROWSERS_PATH is
 * the convention Playwright itself uses. */
export function findChrome() {
  /* CHROME is taken only if it EXISTS. Taking it on trust means a hardcoded
     path the runner image later moves surfaces as a launch failure deep in a
     run rather than as "no browser" before one starts. typescale.mjs learned
     that separately and the copy in this file never did; merging them is what
     brought it here. */
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;

  /* Whatever the image ships, first. checks.yml states the preference and it
     costs nothing: a browser already on disk beats one that has to be fetched. */
  const candidates = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
                      '/usr/bin/chromium-browser', '/usr/bin/chromium'];

  /* Then whatever Playwright installed. PLAYWRIGHT_BROWSERS_PATH is its own
     convention; /opt/pw-browsers is where this repository's workflow puts it. */
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).filter((n) => n.startsWith('chromium'))) {
      for (const rel of ['chrome-linux/chrome',
                         'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
                         'chrome']) {
        const p = path.join(base, d, rel);
        if (fs.existsSync(p)) candidates.push(p);
      }
      const direct = path.join(base, d);
      try { if (fs.statSync(direct).isFile()) candidates.push(direct); } catch { /* not a file */ }
    }
    const bare = path.join(base, 'chromium');
    if (fs.existsSync(bare)) candidates.push(bare);
  }
  return candidates.find((c) => fs.existsSync(c));
}


/* Every page of the site. independent-practice/ is a separate application with
 * its own stylesheet and is not governed by COLOR.md. */
/* WHAT AM I MEASURING? Until now the four browser checks answered that two
   different ways and neither said so out loud. resting.mjs and states.mjs
   resolved the root from their own file location, so they measured this
   repository whatever directory you ran them from; typescale.mjs and
   curves.mjs used process.cwd(), so they measured wherever you stood.
   Undocumented, and silent either way.

   That surfaced by aiming them at the live site. typescale and curves
   correctly reported 11 pages; resting, run by the same command in the same
   directory, reported "3374 measurements across 19 pages" -- this repository's
   numbers, wearing the other site's label. A confident answer about the wrong
   tree is the exact failure these checks exist to catch, and it was in the
   checks.

   So: one answer, cwd by default and --root to aim it, and every check prints
   the path it measured. The fix that matters is the printing. A wrong target
   you can see is a mistake; a wrong target you cannot is a false result. */
/* The page filter, with --root's VALUE removed. Splitting these two apart is
   what the first version of --root got wrong: every check reads its bare
   arguments as "only measure pages matching this", so the path handed to
   --root was picked up as a page name and matched nothing. It announced the
   right tree and then measured none of it. */
export function pageFilters(argv = process.argv) {
  const out = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root') { i++; continue; }
    if (argv[i].startsWith('-')) continue;
    out.push(argv[i]);
  }
  return out;
}

export function resolveRoot(scriptName, argv = process.argv) {
  const i = argv.indexOf('--root');
  if (i !== -1 && !argv[i + 1]) {
    console.error(`\n  --root needs a path.\n\n    node scripts/${scriptName} --root /path/to/site\n`);
    process.exit(2);
  }
  const root = i !== -1 ? path.resolve(argv[i + 1]) : process.cwd();

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`\n  Not a directory: ${root}\n`);
    process.exit(2);
  }
  /* An empty answer must not read as a clean one. Running from a subdirectory
     used to silently narrow the scope for two of these and not the other two. */
  if (!pages(root).length) {
    console.error(`\n  No HTML pages under ${root}, so there is nothing to measure.`);
    console.error('  Run this from the site root, or pass --root.\n');
    process.exit(2);
  }
  /* Announced here rather than left to each caller, so a check added later
     cannot forget. One line, always, pass or fail. */
  const n = pages(root).length;
  console.log(`\n  ${root}`);
  console.log(`  ${n} page${n === 1 ? '' : 's'}`);
  const rev = revision(root);
  if (rev) console.log(`  ${rev}`);
  return root;
}

/* WHICH tree, as well as where. The path and the page count say what was
   measured; they do not say which version of it, and a count compared across
   two versions reads as drift when it is content. That happened: a run on
   main before #73 landed put engagement/product-clarity.html at 79, a branch
   cut after it measured 75, and the four that "vanished" were the proof
   pair's captions, which #73 had deleted. The branch's own change moved
   nothing. The lazy images beside the captions were the suspect, and the
   two commits were compared last, because nothing on screen said they
   differed.

   So: the commit, and whether the tree is clean. Absent when the root is not
   a checkout -- an archive of one, say -- rather than fatal, because the
   checks measure any directory of pages and git is not a requirement. */
export function revision(root) {
  const git = (...args) => execFileSync('git', ['-C', root, ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    /* The checkout whose root this IS, not one it merely sits inside: an
       archive unpacked under a checkout is not that checkout's commit. */
    if (fs.realpathSync(git('rev-parse', '--show-toplevel')) !== fs.realpathSync(root)) return null;
    const short = git('rev-parse', '--short', 'HEAD');
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const dirty = git('status', '--porcelain', '--untracked-files=no').length > 0;
    return `${short}${branch === 'HEAD' ? '' : ' on ' + branch}${dirty ? ', with uncommitted changes' : ''}`;
  } catch {
    return null;
  }
}

export function pages(root, dir = root, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'independent-practice') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(root, p, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(root, p));
  }
  return out.sort();
}

/* Served over HTTP rather than opened as file://, and not for realism alone:
 * Chromium treats every file:// stylesheet as a separate opaque origin, so
 * sheet.cssRules throws SecurityError and the whole cascade is invisible.
 * Reading the site's own rules is the entire method in states.mjs, so it has
 * to be same-origin. resting.mjs does not read rules, but it shares the server
 * so that both checks load the site the same way -- a difference in how the
 * page is fetched is a difference the numbers would carry. */
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
                '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
                '.webp': 'image/webp', '.pdf': 'application/pdf', '.json': 'application/json',
                '.mp4': 'video/mp4', '.webm': 'video/webm' };

export async function serve(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end(); return;
    }
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    const size = fs.statSync(file).size;

    /* Byte ranges, because the hero is a video and a video that cannot be
       seeked cannot be sampled. Without Accept-Ranges a browser treats the
       resource as unseekable however much of it is already buffered: setting
       currentTime silently clamps back to 0, every frame you ask for is frame
       zero, and a check that steps through the clip measures the same picture
       eight times and calls it eight samples.
       GitHub Pages serves ranges, so this is also the more faithful of the
       two behaviours -- the old one was a difference between how the check
       fetched the page and how a reader does. */
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range) {
      const start = range[1] ? parseInt(range[1], 10) : 0;
      const end = range[2] ? parseInt(range[2], 10) : size - 1;
      if (start >= size || end >= size || start > end) {
        res.writeHead(416, { 'content-range': `bytes */${size}` }).end(); return;
      }
      res.writeHead(206, {
        'content-type': type,
        'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${size}`,
        'content-length': end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

/* ---------------------------------------------------------------------------
 * Everything below this line is source text that runs INSIDE the page. It is a
 * string, not code this file executes, so it is written in the same idiom as
 * the rest of the repository but cannot import anything.
 *
 * No backticks and no ${'$'}{ } in here. Both scripts nest this inside a template
 * literal of their own, and a stray one of either ends the string in the wrong
 * place -- which is how this text broke twice while it still lived in
 * states.mjs.
 * ------------------------------------------------------------------------- */
export const COLOUR_TOOLKIT = String.raw`
  const rel = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ({ r, g, b }) => 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const parse = (c) => {
    const v = (c.match(/[\d.]+/g) || []).map(Number);
    return v.length ? { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 } : { r: 0, g: 0, b: 0, a: 0 };
  };

  /* The ground under an element, compositing every translucent layer over what
     is behind it. Returns a reason instead of a colour when an ancestor paints
     an image or a gradient, because then computed style cannot answer. */
  function ground(el) {
    const layers = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        return { unmeasurable: cs.backgroundImage.slice(0, 34).includes('gradient')
          ? 'sits on a gradient' : 'sits on an image' };
      }
      const bg = parse(cs.backgroundColor);
      if (bg.a > 0) layers.push(bg);
      if (bg.a === 1) return { colour: composite(layers) };
    }
    return { colour: composite(layers) };
  }
  function composite(layers) {
    let out = { r: 255, g: 255, b: 255 };
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      out = { r: l.r * l.a + out.r * (1 - l.a),
              g: l.g * l.a + out.g * (1 - l.a),
              b: l.b * l.a + out.b * (1 - l.a) };
    }
    return out;
  }

  /* Screen-reader-only text is not on screen, so it has no contrast to fail. */
  function visuallyHidden(el) {
    const cs = getComputedStyle(el);
    if (cs.clipPath === 'inset(50%)' || cs.clip === 'rect(0px, 0px, 0px, 0px)') return true;
    const r = el.getBoundingClientRect();
    return r.width <= 1 && r.height <= 1;
  }
  function ownText(el) {
    const c = el.cloneNode(true);
    for (const n of c.querySelectorAll('*')) {
      if (n.className && String(n.className).includes('visually-hidden')) n.remove();
    }
    return (c.textContent || '').trim();
  }

  /* Every element at or under this one that directly holds visible text.
     "Directly" matters: a wrapper's textContent is its children's, and the
     colour that applies is the one on the node the glyphs are in. */
  function textNodesIn(root) {
    const out = [];
    const consider = (n) => {
      if (visuallyHidden(n)) return;
      const direct = [...n.childNodes].some(k => k.nodeType === 3 && k.textContent.trim());
      if (direct) out.push(n);
    };
    consider(root);
    for (const n of root.querySelectorAll('*')) consider(n);
    return out.slice(0, 24);
  }

  /* The floor is set by the SMALLEST visible type the colour lands on, not by
     the element carrying the rule. .icon-link is 16px and holds an 11px label
     that inherits its colour; judging the container would apply the wrong
     threshold to the only text a reader actually squints at. */
  function smallestText(el) {
    let px = parseFloat(getComputedStyle(el).fontSize);
    let weight = parseInt(getComputedStyle(el).fontWeight, 10) || 400;
    for (const n of el.querySelectorAll('*')) {
      const direct = [...n.childNodes].some(k => k.nodeType === 3 && k.textContent.trim());
      if (!direct || visuallyHidden(n)) continue;
      const cs = getComputedStyle(n);
      const p = parseFloat(cs.fontSize);
      if (p < px) { px = p; weight = parseInt(cs.fontWeight, 10) || 400; }
    }
    return { px, weight };
  }
`;
