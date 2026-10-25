/*
 * The Agent Review write-up, Direction C: the product tells the story
 * (since 2026-10-25). Three small jobs, each a no-op where it has nothing to
 * do:
 *
 * 1. THE SCENES. Every [data-scene] (the opener and the six chapters) is a
 *    stage and a few steps. On a screen 64rem wide or more, with motion
 *    allowed, a scene goes live ([data-live]): the stage is held still
 *    beside the steps, and the step in the middle of the window sets the
 *    stage's data-at. A part marked data-from="n" is on from step n, and
 *    one marked data-only="n" on step n alone (data-on). Narrow, still or
 *    without this file, nothing is live and the stage shows every part at
 *    once, which is also what the checks measure.
 *
 * 2. THE STAGE NAV down the left marks the chapter in the middle of the
 *    window and fills its line to it. Its links work without this file.
 *
 * 3. THE WIPE in Evaluate: the range sets the line between the two screens.
 *    Where the line is scrubbed by scroll (agent-review.css, a scroll-driven
 *    animation, inside @supports), the first touch of the range hands it to
 *    the reader for good.
 *
 * Nothing here scrolls the page for the reader, and nothing takes the
 * scroll over.
 */
(function () {
  const canWatch = 'IntersectionObserver' in window;
  const middle = { rootMargin: '-45% 0px -50% 0px' };
  const wide = window.matchMedia('(min-width: 64rem)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const live = () => canWatch && wide.matches && !still.matches;

  const scenes = [...document.querySelectorAll('[data-scene]')].map((scene) => {
    const stage = scene.querySelector('[data-stage]');
    const steps = [...scene.querySelectorAll('[data-step]')];
    const parts = [...scene.querySelectorAll('[data-from], [data-only]')];
    const set = (at) => {
      scene.dataset.at = String(at);
      if (stage) stage.dataset.at = String(at);
      steps.forEach((s, i) => s.toggleAttribute('data-current', i + 1 === at));
      parts.forEach((p) => {
        const from = Number(p.dataset.from || 0);
        const only = Number(p.dataset.only || 0);
        p.toggleAttribute('data-on', from ? at >= from : at === only);
      });
    };
    if (canWatch) {
      const io = new IntersectionObserver((entries) => {
        if (!scene.hasAttribute('data-live')) return;
        entries.forEach((e) => {
          if (e.isIntersecting) set(steps.indexOf(e.target) + 1);
        });
      }, middle);
      steps.forEach((s) => io.observe(s));
    }
    return { scene, set };
  });

  const fit = () => {
    const on = live();
    scenes.forEach(({ scene, set }) => {
      scene.toggleAttribute('data-live', on);
      if (on) { if (!scene.dataset.at) set(1); }
      else {
        delete scene.dataset.at;
        scene.querySelectorAll('[data-at]').forEach((el) => delete el.dataset.at);
        scene.querySelectorAll('[data-on], [data-current]').forEach((el) => {
          el.removeAttribute('data-on');
          el.removeAttribute('data-current');
        });
      }
    });
  };
  fit();
  wide.addEventListener('change', fit);
  still.addEventListener('change', fit);

  const nav = document.querySelector('.arc-stages');
  if (nav && canWatch) {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const box = nav.querySelector('.arc-stages-box');
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const a = byId.get(e.target.id);
        links.forEach((l) => l.removeAttribute('aria-current'));
        a?.setAttribute('aria-current', 'step');
        if (box) box.style.setProperty('--p', String((links.indexOf(a) + 1) / links.length));
      });
    }, middle);
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  document.querySelectorAll('[data-wipe]').forEach((fig) => {
    const range = fig.querySelector('input[type="range"]');
    const frame = fig.querySelector('.arc-wipe-frame');
    if (!range || !frame) return;
    const track = fig.closest('.arc-scrub');
    const say = () => range.setAttribute('aria-valuetext', `Undo ${range.value}%, review ${100 - range.value}%`);
    const set = () => { frame.style.setProperty('--wipe', `${range.value}%`); say(); };
    /* While scroll scrubs the line, the thumb is still where it was left,
       so a key would jump the line back there. Focus and the first key
       pick the thumb up where the line is, and the key moves it on. */
    const follow = () => {
      if (!track || track.hasAttribute('data-held')) return;
      const at = parseFloat(getComputedStyle(frame).getPropertyValue('--wipe'));
      if (Number.isFinite(at)) { range.value = String(Math.round(at)); say(); }
    };
    range.addEventListener('focus', follow);
    range.addEventListener('keydown', follow);
    range.addEventListener('input', () => {
      if (track) track.setAttribute('data-held', '');
      set();
    });
    set();
  });
})();
