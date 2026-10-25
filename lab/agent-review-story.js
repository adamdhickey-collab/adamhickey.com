/*
 * The Agent Review write-up, Direction C: the product tells the story
 * (since 2026-10-25). Three small jobs, each a no-op where it has nothing to
 * do:
 *
 * 1. THE SCENES. Every [data-scene] (the opener and the six chapters) is a
 *    stage and a few steps. On a screen 64rem wide or more, with motion
 *    allowed, the page is live (.arc-live on the root): each stage is held
 *    still beside its steps, and the step in the middle of the window sets
 *    the stage's data-at. The page's head throws that switch before first
 *    paint, so the opener never grows under the reader; this file keeps it
 *    in step with the window, and marks itself run (window.arcStory) so the
 *    head can take the switch back if it never does. A part marked data-from="n" is on from step n, and
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
  window.arcStory = true;
  const root = document.documentElement;
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
        if (!root.classList.contains('arc-live')) return;
        entries.forEach((e) => {
          if (e.isIntersecting) set(steps.indexOf(e.target) + 1);
        });
      }, middle);
      steps.forEach((s) => io.observe(s));
    }
    return { scene, stage, set };
  });

  // Each stage's height, for its last step's (agent-review.css, "THE LAST
  // STEP IS AS TALL AS ITS STAGE NEEDS"). Read when the stage resizes, never
  // on scroll.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((entries) => {
      entries.forEach((e) => {
        const box = e.borderBoxSize && e.borderBoxSize[0];
        const h = box ? box.blockSize : e.target.getBoundingClientRect().height;
        e.target.closest('[data-scene]').style.setProperty('--arc-stage-h', `${Math.round(h)}px`);
      });
    });
    scenes.forEach(({ scene, stage }) => {
      if (stage && scene.classList.contains('arc-scene')) ro.observe(stage);
    });
  }

  const fit = () => {
    const on = live();
    root.classList.toggle('arc-live', on);
    scenes.forEach(({ scene, set }) => {
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
    const set = () => frame.style.setProperty('--wipe', `${range.value}%`);
    range.addEventListener('input', () => {
      if (track) track.setAttribute('data-held', '');
      set();
    });
    set();
  });
})();
