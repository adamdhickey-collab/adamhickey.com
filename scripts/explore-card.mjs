#!/usr/bin/env node
/* Agent Review's homepage card as a loop: the prototype's Explore scene
   (agent-review src/review/SceneScreen, #/scenes/explore) building itself
   one option at a time. Since 2026-10-27 the card is that scene exactly
   (Adam: "literally be the card"), and since the same day it moves (Adam:
   "each of the selections build on each other ... one option at a time").

   The scene is the app's own DOM, loaded from the app's address, so the
   loop cannot drift from the screen it shows. This script splits the
   headline into words and drives a timeline over the scene's own elements
   with the Web Animations API, paused, stepping currentTime one frame at a
   time and capturing each frame, so the clip is the same every run and no
   frame depends on how fast the machine is.

   The clip, 8.5 seconds at 30fps, plays once on the page (it looped for
   its first hour), so it ends on the frame it began with. It ran 12
   seconds until 2026-10-27 (Adam: "takes too long ... a little more
   zippy"); every beat is about half what it was, and the build a reader
   sees went from 10.5s to 5.3s. It ran 15 seconds from 2026-10-28, for a
   slow pick, until 2026-10-29, when the pick took the build's tempo:
     0.0  the finished screen, which is also the poster (so the switch from
          poster to clip is invisible, and a reduced-motion reader sees the
          same picture the clip opens and closes on)
     0.3  the screen clears under the bar
     0.75 Explore's dot pulses, and the headline rises word by word
     1.3  Archive now, undo after: the rows, the press, four rows go, the
          bar slides up with Undo
     2.5  Confirm first, naming who: the rows ticked, the question, its
          line, the Archive button pulses
     3.7  Review batch, then archive: the panel slides in, each row is
          ticked, and the button counts with them
     5.2  "Tried all three"
     5.6  each way is picked out in turn (Adam, 2026-10-28: "highlight in
          a very obvious way ... to emphasize a designer decides what
          ships"): the tile takes the app's sage ground and a sage ring,
          holds, and lets go just as the next is taken. It was slow and
          even against the build, 2.6s a way, until 2026-10-29; it is the
          build's own curve and about its pace now, 0.7s a way (Adam:
          "much faster similar to how the build for the animation is
          before this ... all be quick")
     7.95 the third has let go, and the finished screen holds to the end
          with nothing picked

   The page starts the clip at 0.7s, not 0 (Adam: the card was there,
   then disappeared and rebuilt): a reader who allows motion sees the
   start poster, the cleared screen, until the card is on screen, then
   the screen builds once and stays. The first 0.7s are only for a seek,
   and START below is the page's START.

   The encode is WebCodecs in Chrome (no ffmpeg on the Mac), H.264 muxed
   with mp4-muxer, moov first, in a second tab on the app's own https
   origin, because VideoEncoder only exists in a secure context.

     img/lab/agent-review-explore-card.mp4    1600 x 900, the loop
     img/lab/agent-review-explore-card.webp   1600 x 900, its poster
     img/lab/agent-review-explore-card-start.webp   1600 x 900, the cleared screen

     export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
     node scripts/explore-card.mjs              # --app http://localhost:4173/agent-review/ */

import fs from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const i = process.argv.indexOf('--app');
const app = (i > -1 ? process.argv[i + 1] : 'https://adamdhickey-collab.github.io/agent-review/').replace(/\/?$/, '/');
const OUT = 'img/lab/agent-review-explore-card';
const W = 800, H = 450, SCALE = 2, FPS = 30, T = 8500, START = 700;
const BITRATE = 1_500_000;

const browser = await chromium.launch({ executablePath: CHROME });
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE, colorScheme: 'dark' });
  await ctx.addInitScript(() => localStorage.setItem('agent-review:theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(`${app}#/scenes/explore`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('.stage-scene__trio');
  await page.waitForTimeout(400);

  /* The timeline. Every element gets one animation the length of the loop,
     paused, whose keyframes are: its finished state until the screen
     clears (RESET), its start state from then, and each of its steps at its
     own time, back to the finished state by the end. */
  await page.evaluate(({ T }) => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const OUT_AT = 300, CLEAR = 600, RESET = 650, BACK = 700;
    const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    const spring = 'cubic-bezier(0.34, 1.45, 0.64, 1)';
    const o = (ms) => ms / T;

    /* track(el, start, steps, final): steps are [at, dur, props, easing] */
    const track = (el, start, steps, final = steps[steps.length - 1][2]) => {
      const kf = [{ offset: 0, ...final }, { offset: o(CLEAR), ...final }, { offset: o(RESET), ...start }];
      let prev = start;
      for (const [at, dur, props, e = ease] of steps) {
        kf.push({ offset: o(at), ...prev, easing: e });
        prev = { ...prev, ...props };
        kf.push({ offset: o(at + dur), ...prev });
      }
      kf.push({ offset: 1, ...final });
      el.animate(kf, { duration: T, fill: 'both' }).pause();
    };
    const rise = (el, at, { y = 10, blur = 0, scale = 1, dur = 450, e = ease } = {}) =>
      track(el, { opacity: 0, transform: `translateY(${y}px) scale(${scale})`, filter: `blur(${blur}px)` },
        [[at, dur, { opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' }, e]]);

    const body = $('.stage-scene__body');
    body.animate([
      { offset: 0, opacity: 1, transform: 'translateY(0px)' },
      { offset: o(OUT_AT), opacity: 1, transform: 'translateY(0px)', easing: 'ease-in' },
      { offset: o(CLEAR), opacity: 0, transform: 'translateY(-6px)' },
      { offset: o(RESET), opacity: 0, transform: 'translateY(0px)' },
      { offset: o(BACK), opacity: 1, transform: 'translateY(0px)' },
      { offset: 1, opacity: 1, transform: 'translateY(0px)' },
    ], { duration: T, fill: 'both' }).pause();

    /* Explore's dot: a ring that swells out and settles back. */
    const dot = $('[data-state="now"] .stage-scene__dot');
    const ring = getComputedStyle(dot).boxShadow;
    const ringColor = ring.match(/rgba?\([^)]*\)/)[0];
    track(dot, { boxShadow: `${ringColor} 0px 0px 0px 0px` },
      [[750, 250, { boxShadow: `${ringColor} 0px 0px 0px 7px` }], [1000, 300, { boxShadow: ring }]], { boxShadow: ring });

    /* The headline, word by word. */
    const h1 = $('.stage-scene__title');
    h1.innerHTML = h1.textContent.split(' ').map((w) => `<span style="display:inline-block">${w}</span>`).join(' ');
    $$('span', h1).forEach((w, n) => rise(w, 800 + n * 45, { y: 14, blur: 6, dur: 500 }));

    const ways = $$('.stage-scene__way');
    const card = (li, c) => {
      rise(li, c, { y: 18, scale: 0.98 });
      $$('.mini__rows > .mini__row', li).forEach((r, n) =>
        track(r, { opacity: 0, transform: 'translateX(-6px)' }, [[c + 120 + n * 35, 220, { opacity: 1, transform: 'translateX(0px)' }]]));
      rise($('.stage-scene__way-name', li), c + 700, { y: 8, blur: 4 });
      rise($('.stage-scene__why', li), c + 780, { y: 8, blur: 4 });
    };

    /* 1. Archive now, undo after: the press, then four rows go and the bar
       slides up. The rows' gone state is redrawn as a fade, so the finished
       frame is the app's own. */
    {
      const li = ways[0], c = 1300;
      card(li, c);
      $$('.mini__row[data-gone]', li).forEach((r, n) => {
        const gone = getComputedStyle(r).backgroundColor;
        r.removeAttribute('data-gone');
        r.style.backgroundColor = 'transparent';
        track(r, { backgroundColor: 'rgba(0, 0, 0, 0)' }, [[c + 450 + n * 50, 220, { backgroundColor: gone }]]);
        [...r.children].forEach((k) => track(k, { opacity: 1 }, [[c + 420 + n * 50, 180, { opacity: 0 }]]));
      });
      track($('.mini__toast', li), { opacity: 0, transform: 'translateY(140%)' },
        [[c + 650, 400, { opacity: 1, transform: 'translateY(0%)' }, spring]]);
    }

    /* 2. Confirm first, naming who: every row ticked, then the question. */
    {
      const li = ways[1], c = 2500;
      card(li, c);
      $$('.mini__rows .mini__box', li).forEach((b, n) =>
        track(b, { transform: 'scale(0)' }, [[c + 280 + n * 40, 200, { transform: 'scale(1)' }, spring]]));
      track($('.mini__dialog', li), { opacity: 0, transform: 'translateY(8px) scale(0.92)' },
        [[c + 520, 380, { opacity: 1, transform: 'translateY(0px) scale(1)' }, spring]]);
      rise($('.mini__dialog-title', li), c + 620, { y: 4, dur: 300 });
      rise($('.mini__dialog-says', li), c + 700, { y: 4, dur: 300 });
      rise($('.mini__buttons', li), c + 760, { y: 4, dur: 300 });
      const act = $('.mini__btn[data-act]', li);
      const warn = getComputedStyle(act).borderColor;
      const glow = (px, a) => warn.replace(/rgba?\(([^,]+),([^,]+),([^,)]+).*\)/, `rgba($1,$2,$3, ${a}) 0px 0px 0px ${px}px`);
      track(act, { boxShadow: glow(0, 0.5) },
        [[c + 950, 250, { boxShadow: glow(5, 0.35) }], [c + 1200, 350, { boxShadow: glow(9, 0) }]], { boxShadow: glow(9, 0) });
    }

    /* 3. Review batch, then archive: the panel slides in, each row in it is
       ticked, and the button counts the ticks. */
    {
      const li = ways[2], c = 3700;
      card(li, c);
      track($('.mini__panel', li), { transform: 'translateX(100%)' }, [[c + 380, 400, { transform: 'translateX(0%)' }]]);
      rise($('.mini__panel-title', li), c + 520, { y: 4, dur: 300 });
      const on = $$('.mini__panel-row .mini__box[data-on]', li);
      const ticks = on.map((b, n) => {
        const cs = getComputedStyle(b);
        const at = c + 680 + n * 110;
        track(b, { backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: getComputedStyle($('.mini__panel-row .mini__box:not([data-on])', li)).borderColor, transform: 'scale(1)' },
          [[at, 80, { transform: 'scale(0.7)' }], [at + 80, 220, { backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, transform: 'scale(1)' }, spring]]);
        return at + 80;
      });
      const btn = $('.mini__panel .mini__btn', li);
      rise(btn, c + 560, { y: 4, scale: 0.9, dur: 300, e: spring });
      const word = btn.textContent.replace(/\d+/, '').trim();
      window.__tick = (t) => {
        const n = t < RESET ? on.length : ticks.filter((at) => t >= at).length;
        btn.textContent = `${word} ${n}`;
      };
    }

    rise($('.stage-scene__note > *'), 5200, { y: 10, blur: 4 });

    /* The pick: each way in turn takes the app's own sage, its success
       ground and a ring of its primary, holds while it is read, and lets go
       just as the next is taken, on the build's own curve and at about its
       pace. Colors only, because the tile's rise owns its transform. */
    {
      const tok = (n) => { const p = document.createElement('i'); p.style.color = `var(${n})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
      const sage = tok('--color-primary'), ground = tok('--color-success-subtle');
      ways.forEach((li, n) => {
        const cs = getComputedStyle(li);
        const base = { backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, boxShadow: `${sage.replace('rgb(', 'rgba(').replace(/\)$/, ', 0)')} 0px 0px 0px 0px` };
        const on = 5600 + n * 700;
        track(li, base, [
          [on, 250, { backgroundColor: ground, borderColor: sage, boxShadow: `${sage} 0px 0px 0px 2px` }],
          [on + 700, 250, base],
        ], base);
      });
    }
  }, { T });

  const frameAt = async (t) => {
    await page.evaluate((t) => {
      window.__tick(t);
      for (const a of document.getAnimations()) a.currentTime = t;
    }, t);
    return page.screenshot({ type: 'png' });
  };

  /* --peek 2000,3800 writes those moments as PNGs to --peek-dir and stops:
     the way to look at the timeline without encoding it. */
  const pk = process.argv.indexOf('--peek');
  if (pk > -1) {
    const dir = process.argv[process.argv.indexOf('--peek-dir') + 1] || '.';
    for (const t of process.argv[pk + 1].split(',').map(Number)) fs.writeFileSync(`${dir}/peek-${t}.png`, await frameAt(t));
    process.exit(0);
  }

  /* The poster is the first frame, which is the last. The start poster is
     the cleared screen at START, where the page starts the clip. */
  await frameAt(0);
  fs.writeFileSync(`${OUT}.webp`, await page.screenshot({ type: 'webp', quality: 88 }));
  await frameAt(START);
  fs.writeFileSync(`${OUT}-start.webp`, await page.screenshot({ type: 'webp', quality: 88 }));

  const enc = await ctx.newPage();
  await enc.goto(`${app}#/scenes/explore`, { waitUntil: 'networkidle' });
  await enc.evaluate(async ({ w, h, fps, bitrate }) => {
    const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.mjs');
    const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: w, height: h, frameRate: fps }, fastStart: 'in-memory' });
    const encoder = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => { throw e; } });
    encoder.configure({ codec: 'avc1.640028', width: w, height: h, bitrate, framerate: fps, bitrateMode: 'variable', latencyMode: 'quality', avc: { format: 'avc' } });
    window.__enc = { muxer, encoder, n: 0 };
  }, { w: W * SCALE, h: H * SCALE, fps: FPS, bitrate: BITRATE });

  const frames = Math.round((T / 1000) * FPS);
  for (let n = 0; n < frames; n++) {
    const png = await frameAt((n * 1000) / FPS);
    await enc.evaluate(async ({ b64, fps }) => {
      const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const { encoder } = window.__enc;
      const n = window.__enc.n++;
      const frame = new VideoFrame(bmp, { timestamp: Math.round((n * 1e6) / fps), duration: Math.round(1e6 / fps) });
      encoder.encode(frame, { keyFrame: n % (fps * 2) === 0 });
      frame.close();
      bmp.close();
      if (encoder.encodeQueueSize > 8) await new Promise((r) => encoder.addEventListener('dequeue', r, { once: true }));
    }, { b64: png.toString('base64'), fps: FPS });
    if (n % 60 === 0) process.stdout.write(`frame ${n}/${frames}\n`);
  }
  const b64 = await enc.evaluate(async () => {
    const { muxer, encoder } = window.__enc;
    await encoder.flush();
    muxer.finalize();
    const bytes = new Uint8Array(muxer.target.buffer);
    let s = '';
    for (let k = 0; k < bytes.length; k += 0x8000) s += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
    return btoa(s);
  });
  fs.writeFileSync(`${OUT}.mp4`, Buffer.from(b64, 'base64'));
  for (const f of [`${OUT}.mp4`, `${OUT}.webp`, `${OUT}-start.webp`]) console.log(`${f}  ${(fs.statSync(f).size / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
}
