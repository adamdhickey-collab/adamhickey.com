/*
 * The Agent Review write-up as a magazine feature (since 2026-10-25,
 * direction B). Four small jobs, each a no-op where it has nothing to do:
 *
 * 1. THE REVEALS. Anything marked data-reveal, and the wall, gets .is-in the
 *    first time it is in view, which is what the stylesheet's armed rules
 *    wait for (agent-review.css, "Motion"). The page's head arms them only
 *    when motion is allowed, and takes the arming back if this file never
 *    ran, which is what window.agentReviewStory is for.
 *
 * 2. THE STAGE RAIL marks the spread in the middle of the window, and fills
 *    its line with how far through the six the reader is. Links to the
 *    spreads work without it.
 *
 * 3. THE PULL QUOTE is split into a span per word, so its words arrive one
 *    after another, each delayed by --motion-stagger. Only when armed: still,
 *    the quote is the plain line it is in the markup.
 *
 * 4. THE WIPE in Evaluate: the range input sets how much of the second
 *    screen covers the first. Armed, it sweeps once, from mostly undo to the
 *    middle, the first time it is in view, over --motion-ambient; touching
 *    the range ends the sweep where it is.
 *
 * Nothing here scrolls the page for the reader.
 */
(function () {
  const root = document.documentElement;
  const canWatch = 'IntersectionObserver' in window;
  const armed = () => root.classList.contains('mag-armed');
  window.agentReviewStory = true;

  /* 1. The reveals. */
  if (canWatch) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        reveal.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('[data-reveal], [data-pull]').forEach((el) => reveal.observe(el));

    const wall = document.querySelector('[data-wall]');
    if (wall) {
      const settle = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          wall.classList.add('is-in');
          settle.disconnect();
        });
      }, { rootMargin: '0px 0px -35% 0px' });
      settle.observe(wall);
    }
  }

  /* The loop's rail draws itself once, as it scrolls in. */
  const strips = document.querySelectorAll('.ar-rail');
  if (strips.length && canWatch) {
    const drawn = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-drawn'); drawn.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    strips.forEach((strip) => { strip.classList.add('is-armed'); drawn.observe(strip); });
  }

  /* 2. The stage rail. */
  const rail = document.querySelector('.mag-nav');
  if (rail) {
    const links = [...rail.querySelectorAll('a[href^="#"]')];
    const spreads = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const fill = rail.querySelector('.mag-nav-fill');
    if (canWatch) {
      const mark = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.removeAttribute('aria-current'));
          links[spreads.indexOf(e.target)]?.setAttribute('aria-current', 'step');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      spreads.forEach((s) => mark.observe(s));
    }
    if (fill && spreads.length) {
      let ticking = false;
      const paint = () => {
        ticking = false;
        const first = spreads[0].getBoundingClientRect();
        const last = spreads[spreads.length - 1].getBoundingClientRect();
        const span = last.bottom - first.top;
        const t = span > 0 ? (window.innerHeight / 2 - first.top) / span : 0;
        fill.style.transform = `scaleY(${Math.min(1, Math.max(0, t))})`;
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
      paint();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }
  }

  /* 3. The pull quote, a word at a time. */
  if (armed()) {
    document.querySelectorAll('[data-pull] p').forEach((p) => {
      const words = p.textContent.trim().split(/\s+/);
      p.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'mag-word';
        span.textContent = w;
        span.style.transitionDelay = `calc(var(--motion-stagger) * ${i})`;
        p.append(span, i < words.length - 1 ? ' ' : '');
      });
    });
  }

  /* 4. The wipe. */
  document.querySelectorAll('[data-wipe]').forEach((fig) => {
    const range = fig.querySelector('input[type="range"]');
    const frame = fig.querySelector('.ar-wipe-frame');
    if (!range || !frame) return;
    const set = () => frame.style.setProperty('--wipe', `${range.value}%`);
    range.addEventListener('input', set);
    set();
    if (!armed() || !canWatch) return;
    let touched = false;
    const stop = () => { touched = true; };
    range.addEventListener('pointerdown', stop);
    range.addEventListener('keydown', stop);
    const ms = parseFloat(getComputedStyle(root).getPropertyValue('--motion-ambient')) || 1000;
    const sweep = () => {
      const from = 85, to = 50, start = performance.now();
      const step = (now) => {
        if (touched) return;
        const k = Math.min(1, (now - start) / ms);
        const eased = 1 - Math.pow(1 - k, 3);
        range.value = String(Math.round(from + (to - from) * eased));
        set();
        if (k < 1) requestAnimationFrame(step);
      };
      range.value = String(from);
      set();
      requestAnimationFrame(step);
    };
    const watch = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        watch.disconnect();
        sweep();
      });
    }, { threshold: 0.6 });
    watch.observe(frame);
  });
})();
