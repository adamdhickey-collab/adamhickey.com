/* sto-shots.mjs -- the STO approval case study's screens, rebuilt from
 * the deliverable with an invented sender list and plants, and captured
 * here so a restyle is one run rather than a hand capture.
 *
 *   node scripts/sto-shots.mjs              # every picture
 *   node scripts/sto-shots.mjs review       # one, by name
 *
 * What it makes, all under img/sto/, at 2x:
 *
 *   queue.webp         the pending queue, 1440 x 620 of app
 *   review.webp        the review dialog, with 40px of the dimmed screen
 *   approve.webp       the approve confirmation, the same
 *   reject.webp        the reject dialog with its reason menu open, the same
 *   history.webp       approval history, 1440 x 560 of app
 *   legend.webp        how the flags work
 *   requirements.webp  the user requirements the review step answers
 *
 * The markup lives in this file rather than in an .html of its own on
 * purpose: every .html in the tree is a page to the browser checks
 * (scripts/lib/harness.mjs, pages()), and this is a picture's source, not
 * a page. Until 2026-11-13 it lived in a session's scratchpad.
 *
 * One cell inset for the whole app, --cell, on every th and td, so a
 * column's heading starts where its data does. Quantities are numbers:
 * right-aligned, heading and all, in tabular figures. The merge caret
 * hangs in the product column's gutter, so every product code starts on
 * one line and a merged line's parts indent from it, not from the caret.
 *
 * Every capture keeps its frame, so the width and height attributes on
 * the page move only when a dialog's content changes height; the run
 * prints each picture's size to check against them. Bump the page's
 * ?v= on any picture whose bytes change.
 *
 * Needs playwright-core and a Chrome (CHROME=/path/to/chrome if the
 * harness cannot find one). Fonts come from Google Fonts, so it needs
 * the network.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, findChrome } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'img', 'sto');

/* Phosphor 2.1.1, bold and fill weights, as the app's icon set. */
const ph = (d, attrs = '') => `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"${attrs}><path d="${d}"/></svg>`;
const I = {
  arrows: ph('M216.49,184.49l-32,32a12,12,0,0,1-17-17L179,188H48a12,12,0,0,1,0-24H179l-11.52-11.51a12,12,0,0,1,17-17l32,32A12,12,0,0,1,216.49,184.49Zm-145-64a12,12,0,0,0,17-17L77,92H208a12,12,0,0,0,0-24H77L88.49,56.49a12,12,0,0,0-17-17l-32,32a12,12,0,0,0,0,17Z'),
  search: ph('M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z'),
  download: ph('M228,144v64a12,12,0,0,1-12,12H40a12,12,0,0,1-12-12V144a12,12,0,0,1,24,0v52H204V144a12,12,0,0,1,24,0Zm-108.49,8.49a12,12,0,0,0,17,0l40-40a12,12,0,0,0-17-17L140,115V32a12,12,0,0,0-24,0v83L96.49,95.51a12,12,0,0,0-17,17Z'),
  caret: ph('M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z'),
  check: ph('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z'),
  warn: ph('M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z'),
  x: ph('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z'),
};
const HI = `<span class="flag f-hi">${I.check}High confidence</span>`;
const LO = `<span class="flag f-lo">${I.warn}Low confidence</span>`;
const BAD = `<span class="flag f-bad">${I.x}Validation failed</span>`;
const MER = `<span class="flag f-mer">Merged</span>`;

const side = (on) => `<aside class="side"><div class="brand"><div class="mark">${I.arrows}</div><h1>STO Approval</h1><p>Supply chain &middot; Italy</p></div>
<nav class="nav">${['STO approval', 'Approval history', 'Approved senders'].map((n) => `<a${n === on ? ' class="on"' : ''}>${n}</a>`).join('')}</nav></aside>`;

const view = `<td class="act"><span class="btn line">View</span></td>`;
const line = (code, qty, flags, cls = '') =>
  `<tr${cls ? ` class="${cls}"` : ''}><td class="code">${cls === 'parent' ? `<span class="caret">${I.caret}</span>` : ''}${code}</td><td class="num">${qty}</td><td></td><td>B-4471</td><td>2PLA</td><td>1PLB</td><td>11 Jun</td><td class="flags">${flags}</td></tr>`;

const CSS = `
:root{--bg:#1e2521;--side:#18201b;--panel:#121a15;--panel2:#1b231e;--line:#2c3630;--text:#e9ede9;--soft:#a4ada6;--muted:#7f8a82;--lime:#c3e48a;--amber:#f2c94c;--red:#d9363e;--redsoft:#f07a7f;--green:#2f9e57;--orange:#f08a4b;
  --cell:16px;--gutter:22px;--indent:20px;--flag-h:24px}
*{box-sizing:border-box}body{margin:0;font-family:Inter,sans-serif;color:var(--text);background:#0e1110;-webkit-font-smoothing:antialiased}
.screen{width:1440px;height:900px;position:relative;overflow:hidden;background:var(--bg)}
.screen.dim{background:#0e1110}
.app{display:grid;grid-template-columns:288px 1fr;height:100%}
.side{background:var(--side);border-right:1px solid var(--line)}
.brand{padding:34px 24px 24px;border-bottom:1px solid var(--line)}
.mark{width:34px;height:34px;border-radius:9px;background:var(--lime);color:#14200f;display:grid;place-items:center;margin-bottom:18px}
.mark svg{width:20px;height:20px}
.brand h1{font-size:22px;margin:0 0 6px;font-weight:700}
.brand p{margin:0;font-size:12px;color:var(--muted)}
.nav{padding:24px 12px}.nav a{display:block;padding:10px 12px;border-radius:8px;font-size:14px;color:var(--soft);margin-bottom:4px}
.nav a.on{background:#222b25;color:var(--lime);font-weight:600}
.main{padding:30px 32px}
.h{font-family:'Libre Caslon Text',serif;font-weight:400;font-size:36px;color:var(--lime);margin:0 0 14px;letter-spacing:-.5px}
.sub{color:var(--soft);font-size:15px;margin:0 0 26px}
.tools{display:flex;gap:8px;margin-bottom:24px}
.field{height:40px;border:1px solid var(--line);border-radius:6px;background:var(--panel2);display:flex;align-items:center;padding:0 12px;font-size:14px;color:var(--soft);gap:10px}
.field svg,.select svg{width:15px;height:15px;flex:none}
.field.sort{justify-content:space-between}
table{width:100%;border-collapse:collapse;font-size:14px}
.tablewrap{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--panel)}
th,td{padding:0 var(--cell);text-align:left}
th{font-size:13px;font-weight:600;color:var(--muted);height:46px;border-bottom:1px solid var(--line);background:var(--panel2)}
td{height:58px;border-bottom:1px solid var(--line)}
tr:last-child td{border-bottom:0}
th.num,td.num{text-align:right;font-variant-numeric:tabular-nums}
td.act{text-align:right}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;border-radius:999px;padding:3px 10px;border:1px solid #4a554e;color:var(--text);white-space:nowrap}
.pill.review{background:var(--amber);color:#1b1b10;border-color:var(--amber)}
.pill.ok{background:var(--green);border-color:var(--green);color:#fff}
.pill.rej{background:#c4232b;border-color:#c4232b;color:#fff}
.pill.fail{background:var(--orange);border-color:var(--orange);color:#1b120c}
.flag{display:inline-flex;align-items:center;gap:6px;height:var(--flag-h);font-size:12px;line-height:1;font-weight:600;border-radius:999px;padding:0 12px;border:1px solid;white-space:nowrap;vertical-align:top}
.flag svg{width:15px;height:15px;flex:none}
.f-hi{color:var(--lime);border-color:#6f8a4c;background:#18241a}
.f-lo{color:var(--amber);border-color:#a7862f;background:#211d10}
.f-bad{color:var(--redsoft);border-color:#9b3a3f;background:#241415}
.f-mer{color:#9fae9f;border-color:#3f4b43;background:#1b221d}
.btn{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 16px;border-radius:7px;font-weight:700;font-size:15px;border:1px solid transparent}
.btn.line{border-color:var(--lime);color:var(--lime);height:34px;padding:0 12px;font-size:14px}
.btn.pri{background:var(--lime);color:#14200f}
.btn.ghost{border-color:var(--lime);color:var(--lime)}
.btn.danger{background:#c4142a;color:#fff}
.btn.dline{border-color:var(--red);color:#f0545a}
.modal{position:absolute;background:#121b15;border:1px solid #2d3a31;border-radius:16px;padding:28px 24px 24px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.modal h2{margin:0 0 6px;font-size:21px}
.modal .desc{color:var(--soft);font-size:14px;margin:0 0 18px;line-height:1.45}
/* Panels above the table carry the table's 1px edge, transparent, so
   their text starts on the same line as the table's first column. */
.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}
.meta div{background:var(--panel2);border:1px solid transparent;border-radius:6px;padding:12px var(--cell)}
.meta b{display:block;font-size:12px;color:var(--soft);margin-bottom:6px}
.meta span{font-size:14px}
.dl{background:var(--panel2);border:1px solid transparent;border-radius:6px;padding:12px var(--cell);color:var(--lime);font-weight:600;font-size:14px;display:flex;gap:10px;align-items:center;margin-bottom:24px}
.dl svg{width:18px;height:18px;flex:none}
.lineshead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;font-size:14px}
.lineshead span{color:var(--muted)}
/* The line items: every cell's first line is a flag's height, so a code,
   a quantity and the first flag in a row share one centre line. */
.rt td{height:auto;padding-top:16px;padding-bottom:16px;line-height:var(--flag-h);vertical-align:top}
.rt td.flags{line-height:0}
.rt td.flags>.flag{display:flex;width:max-content}.rt td.flags>.flag+.flag{margin-top:6px}
.rt .code{padding-left:calc(var(--cell) + var(--gutter));position:relative}
.rt .caret{position:absolute;left:var(--cell);top:16px;height:var(--flag-h);display:flex;align-items:center;color:var(--soft)}
.rt .caret svg{width:14px;height:14px}
.rt .parent .num{font-weight:700}
.rt .child td{color:#7c877f;padding-top:10px;padding-bottom:10px}
.rt .child .code{padding-left:calc(var(--cell) + var(--gutter) + var(--indent))}
.note{font-size:12px;color:var(--muted);margin:16px 0 20px}
.actions{display:flex;justify-content:flex-end;gap:12px}
.summary{border:1px solid var(--line);background:var(--panel2);border-radius:6px;padding:12px var(--cell);font-size:14px;margin-bottom:20px}
.summary em{display:block;font-style:normal;color:var(--amber);font-weight:700;font-size:13px;margin-top:8px}
label{display:block;font-size:13px;font-weight:700;margin-bottom:8px}
.select{height:40px;border:1px solid var(--lime);border-radius:6px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;color:var(--soft);font-size:14px;margin-bottom:8px}
.select svg{color:var(--text)}
.menu{border:1px solid var(--line);border-radius:6px;background:var(--panel2);padding:6px 0;margin-bottom:20px}
.menu div{padding:10px 12px;font-size:14px}
.menu div:first-child{color:var(--lime);font-weight:700}
.tabs{display:flex;gap:36px;border-bottom:1px solid var(--line);margin-bottom:24px;font-size:14px;font-weight:600;color:var(--muted)}
.tabs span{padding:0 0 12px;margin-bottom:-1px;border-bottom:2px solid transparent}
.tabs .on{color:var(--lime);border-bottom-color:var(--lime)}
.legend{width:1100px;background:#101913;border:1px solid var(--line);border-radius:14px;padding:22px 22px 10px}
.legend h3{margin:0 0 6px;color:var(--lime);font-size:13px;letter-spacing:.06em}
.legend .lead{color:var(--soft);font-size:13px;margin:0 0 16px}
.legend h4{font-size:11px;letter-spacing:.08em;font-weight:600;margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.legend h4 span{color:var(--muted);font-weight:500}
.legend .row{display:grid;grid-template-columns:184px 1fr;align-items:center;font-size:13px;color:#d7ddd8;margin-bottom:10px}
.legend .grp{margin-bottom:16px}
.legend ul{margin:12px 0 0;padding-left:18px;color:#d7ddd8;font-size:14px;line-height:1.6}
.legend li span{color:var(--muted)}
`;

const HTML = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Caslon+Text&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>

<section class="screen" id="queue" style="height:620px"><div class="app">${side('STO approval')}
<div class="main"><h2 class="h">STO approval</h2><p class="sub">Pending requests awaiting your review</p>
<div class="tools"><div class="field sort" style="width:180px">Sort: Newest first ${I.caret}</div><div class="field" style="width:280px">${I.search}Search sender</div></div>
<div class="tablewrap"><table><tr><th style="width:150px">Received</th><th style="width:280px">Sender</th><th style="width:140px">Intake</th><th class="num" style="width:80px">Lines</th><th style="width:40px"></th><th style="width:150px">Status</th><th></th></tr>
${[['10 Jun 09:14', 'Marta Ricci', 'Excel', 42, ''], ['10 Jun 08:52', 'Luca Ferrante', 'Email', 8, ''], ['09 Jun 16:30', 'Giulia Conti', 'Excel', 61, 'review'], ['09 Jun 14:05', 'Paolo Marchetti', 'Email', 15, ''], ['09 Jun 11:20', 'Elena Villa', 'Excel', 30, '']]
  .map(([t, s, i, n, st]) => `<tr><td>${t}</td><td>${s}</td><td>${i}</td><td class="num">${n}</td><td></td><td><span class="pill${st ? ' ' + st : ''}">${st ? 'Under review' : 'Pending'}</span></td>${view}</tr>`).join('\n')}
</table></div></div></div></section>

<section class="screen dim" id="review"><div class="modal" style="left:150px;top:60px;width:1140px">
<h2>STO request &middot; Marta Ricci</h2><p class="desc" style="margin-bottom:16px">Review the extracted order, then approve or reject.</p>
<div class="meta"><div><b>Sender</b><span>marta.ricci@company.com</span></div><div><b>Forwarded</b><span>10 Jun 09:14</span></div><div><b>Intake path</b><span>Excel attachment</span></div><div><b>Subject</b><span>Plant North</span></div></div>
<div class="dl">${I.download}Download original email (and attachment)</div>
<div class="lineshead"><b>Extracted line items</b><span>42 line items &middot; 1 merged &middot; 3 need review</span></div>
<div class="tablewrap"><table class="rt"><tr><th class="code">Product code</th><th class="num" style="width:90px">Qty</th><th style="width:40px"></th><th style="width:130px">Batch</th><th style="width:130px">Source</th><th style="width:130px">Destination</th><th style="width:130px">Delivery</th><th style="width:190px">Flag</th></tr>
${[
  line('1000475', '1,200', HI),
  line('1000482', '3,200', MER + LO, 'parent'),
  line('1000482', '1,200', HI, 'child'),
  line('1000482', '2,000', LO, 'child'),
  line('1000517', '800', LO),
  line('1000540', '5,000', LO),
].join('\n')}
</table></div>
<p class="note">Excel intake shows batch numbers. For email-body intakes this column is hidden (batch comes from MES).</p>
<div class="actions"><span class="btn dline">Reject</span><span class="btn pri">Approve</span></div></div></section>

<section class="screen dim" id="approve"><div class="modal" style="left:500px;top:300px;width:440px">
<h2>Approve STO</h2><p class="desc">This creates the STO in SAP and emails the original sender. Review the flags before you confirm.</p>
<div class="summary">Marta Ricci &middot; 42 line items &middot; 2PLA to 1PLB<em>3 lines need review</em></div>
<div class="actions"><span class="btn ghost">Cancel</span><span class="btn pri">Confirm approval</span></div></div></section>

<section class="screen dim" id="reject"><div class="modal" style="left:500px;top:240px;width:440px">
<h2>Reject STO</h2><p class="desc">Choose a reason. This ends the automation and no STO is created in SAP.</p>
<label>Reason</label><div class="select">Select a reason ${I.caret}</div>
<div class="menu"><div>Field-rep error</div><div>Agent error</div><div>Duplicate</div></div>
<div class="actions"><span class="btn ghost">Cancel</span><span class="btn danger">Confirm rejection</span></div></div></section>

<section class="screen" id="history" style="height:560px"><div class="app">${side('Approval history')}
<div class="main"><h2 class="h">Approval history</h2><p class="sub">Approved, rejected, and SAP-failed requests</p>
<div class="tabs"><span class="on">All</span><span>Approved</span><span>Rejected</span><span>SAP failed</span></div>
<div class="tablewrap"><table><tr><th style="width:150px">Actioned</th><th style="width:190px">Sender</th><th style="width:100px">Intake</th><th style="width:140px">Status</th><th style="width:290px">Outcome</th><th>By</th><th></th></tr>
${[['10 Jun 09:20', 'Marta Ricci', 'Excel', 'ok', 'Approved', 'STO 4500031882', 'M. Ricci'], ['10 Jun 08:58', 'Luca Ferrante', 'Email', 'rej', 'Rejected', 'Duplicate', 'L. Ferrante'], ['09 Jun 16:40', 'Giulia Conti', 'Excel', 'fail', 'SAP failed', 'ME21N: material 1000482 blocked', 'G. Conti'], ['09 Jun 14:12', 'Paolo Marchetti', 'Email', 'ok', 'Approved', 'STO 4500031871', 'P. Marchetti'], ['09 Jun 11:35', 'Elena Villa', 'Excel', 'rej', 'Rejected', 'Field-rep error', 'E. Villa']]
  .map(([t, s, i, c, st, o, by]) => `<tr><td>${t}</td><td>${s}</td><td>${i}</td><td><span class="pill ${c}">${st}</span></td><td>${o}</td><td>${by}</td>${view}</tr>`).join('\n')}
</table></div></div></div></section>

<section id="legend" style="display:inline-block;padding:24px;background:#0e1110"><div class="legend">
<h3>HOW FLAGS WORK</h3><p class="lead">A line can carry more than one flag. Each answers a separate question.</p>
<div class="grp"><h4>CONFIDENCE <span>&middot; EVERY LINE, PARENT OR CHILD</span></h4>
<div class="row"><span>${HI}</span>Agent is confident in the extracted value.</div>
<div class="row"><span>${LO}</span>Agent is unsure. Verify against the source.</div></div>
<div class="grp"><h4>VALIDATION <span>&middot; CHECKED AGAINST SAP MASTER DATA</span></h4>
<div class="row"><span>${BAD}</span>Failed a master-data check (product, plant, or quantity threshold). Blocks approve.</div></div>
<div class="grp"><h4>MODIFIER <span>&middot; SYSTEM-ALTERED LINES ONLY</span></h4>
<div class="row"><span>${MER}</span>System summed duplicate material + batch lines. No &ldquo;original&rdquo; tag needed.</div></div>
</div></section>

<section id="reqs" style="display:inline-block;padding:24px;background:#0e1110"><div class="legend" style="padding-bottom:16px">
<h3 style="letter-spacing:0">User requirements</h3>
<ul>
<li>Approve is a deliberate, confirmed action: a summary of sender, line count, and route is shown before anything is committed.&nbsp; <span>[FR018]</span></li>
<li>Flagged lines are surfaced in the confirm step. Approve is not hard-gated, so a reviewer with context can still proceed.&nbsp; <span>[FR025, FR027]</span></li>
<li>Validation runs at intake, so flags are already present when the request is opened.&nbsp; <span>[FR025]</span></li>
<li>Confirming creates the STO in SAP and emails the original sender with the STO number.&nbsp; <span>[FR029, FR032]</span></li>
</ul></div></section>
</body></html>`;

/* name: [selector, padding of dimmed screen around it, file] */
const SHOTS = {
  queue: ['#queue', 0, 'queue'],
  review: ['#review .modal', 40, 'review'],
  approve: ['#approve .modal', 40, 'approve'],
  reject: ['#reject .modal', 40, 'reject'],
  history: ['#history', 0, 'history'],
  legend: ['#legend', 0, 'legend'],
  reqs: ['#reqs', 0, 'requirements'],
};

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const dump = process.argv.includes('--html');
if (dump) { process.stdout.write(HTML); process.exit(0); }

const chromium = loadChromium('sto-shots.mjs');
const chromePath = findChrome();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
await page.setContent(HTML, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

for (const [name, [sel, pad, file]] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(name) && !only.includes(file)) continue;
  const bb = await page.locator(sel).boundingBox();
  const png = await page.screenshot({ fullPage: true, clip: { x: bb.x - pad, y: bb.y - pad, width: bb.width + 2 * pad, height: bb.height + 2 * pad } });
  /* Chromium's own encoder, as every capture on the site; it is not
     byte-stable across runs, so a retake moves bytes it did not change. */
  const [b64, w, h] = await page.evaluate(async (src) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0);
    return [c.toDataURL('image/webp', 0.9).split(',')[1], img.width, img.height];
  }, png.toString('base64'));
  fs.writeFileSync(path.join(OUT, `${file}.webp`), Buffer.from(b64, 'base64'));
  console.log(`img/sto/${file}.webp ${w}x${h}`);
}
await browser.close();
