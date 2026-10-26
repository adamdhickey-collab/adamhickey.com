/*
 * The loop builds itself, once. The figure (style.css, "The loop") is armed
 * only when the reader has not asked for stillness and the browser can tell
 * us when it is in view; then, the first time a fifth of it is on screen, it
 * plays its build and stays built. Unarmed, it is simply there, which is
 * what the checks measure, since they run with reduced motion.
 *
 * Until 2026-10-20 this was an inline script in index.html. It moved here
 * when the lab index took the same figure, so the two pages run one build.
 */
(function () {
  const figs = document.querySelectorAll('.loop');
  if (!figs.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.setAttribute('data-play', '');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  figs.forEach(fig => {
    fig.classList.add('loop--armed');
    io.observe(fig);
  });
})();
