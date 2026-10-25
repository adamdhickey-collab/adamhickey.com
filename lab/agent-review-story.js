/*
 * The Agent Review write-up as a run of stages (Direction A, since
 * 2026-10-25). Three small jobs, each a no-op where it has nothing to do:
 *
 * 1. PINNED OR STACKED. The root takes .st-on on a screen 48rem and wider
 *    with motion allowed; the page's head sets it before first paint, and
 *    this keeps it in step if either query changes. Without it every stage
 *    is stacked and static, which is also the page without this file.
 *
 * 2. THE STEP IN THE MIDDLE. Each [data-scrolly] holds a stage and its
 *    cards ([data-step]). The card crossing the middle of the window sets
 *    data-at on the scrolly, and at-0 ... at-n as classes, so the stylesheet
 *    can show a mark from one step on (data-show) and take it away at a
 *    later one (data-hide). Nothing is timed against scroll: a step
 *    arriving starts a transition on the scale, which the site's reduced-
 *    motion rule already stops (MOTION.md, section 5).
 *
 * 3. THE STAGE NAV marks the chapter in the middle of the window, fills its
 *    line with how far through the six chapters the reader is, and shows
 *    only while the story is on screen. Its links work without it.
 *
 * Nothing here scrolls the page for the reader.
 */
(function () {
  const root = document.documentElement;
  const canWatch = 'IntersectionObserver' in window;
  const wide = window.matchMedia('(min-width: 48rem)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fit = () => root.classList.toggle('st-on', canWatch && wide.matches && !still.matches);
  fit();
  wide.addEventListener('change', fit);
  still.addEventListener('change', fit);
  if (!canWatch) return;

  const middle = { rootMargin: '-45% 0px -50% 0px' };

  document.querySelectorAll('[data-scrolly]').forEach((scrolly) => {
    const steps = [...scrolly.querySelectorAll('[data-step]')];
    const go = (n) => {
      if (n < 0 || String(n) === scrolly.dataset.at) return;
      scrolly.dataset.at = n;
      steps.forEach((_, k) => scrolly.classList.toggle(`at-${k}`, k <= n));
    };
    go(0);
    scrolly.classList.add('at-0');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) go(steps.indexOf(e.target)); });
    }, middle);
    steps.forEach((s) => io.observe(s));
  });

  const nav = document.querySelector('.st-nav');
  const story = document.querySelector('.st');
  const chapters = document.querySelector('.st-chapters');
  if (!nav || !story || !chapters) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const mark = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'step');
    });
  }, middle);
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) mark.observe(section);
  });

  /* Shown while the story holds the middle of the window, the opening
     included; the margin keeps it from lingering over the light chapters
     after the six while the story's last pixels are under the site nav. */
  new IntersectionObserver((entries) => {
    entries.forEach((e) => nav.classList.toggle('is-in', e.isIntersecting));
  }, { rootMargin: '-15% 0px -15% 0px' }).observe(story);

  let ticking = false;
  const paint = () => {
    ticking = false;
    const box = chapters.getBoundingClientRect();
    const span = box.height - window.innerHeight;
    const t = span > 0 ? -box.top / span : 0;
    nav.style.setProperty('--st-progress', Math.min(1, Math.max(0, t)).toFixed(3));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
