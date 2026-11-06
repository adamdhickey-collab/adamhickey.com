/*
 * The After Send write-up's two small jobs. wren.js is the prototype; this is
 * the page around it. The head throws .as-live before first paint and takes it
 * back if this file never ran, which it says by setting window.asStory.
 *
 * THE TWO RECORDS' ANSWERS wait for a press, because the section asks the
 * reader to try answering first. Still or without this file they are there.
 *
 * "PAID" COMING APART: the lines draw once, armed only below the fold and only
 * for a reader who hasn't asked for stillness. The words never wait on them.
 */
(function () {
  window.asStory = true;

  document.querySelectorAll('[data-show-answers]').forEach((button) => {
    button.addEventListener('click', () => {
      button.parentElement.setAttribute('data-shown', '');
    });
  });

  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const paid = document.querySelector('.as-paid');
  if (!paid || paid.getBoundingClientRect().top <= window.innerHeight) return;
  paid.classList.add('is-armed');
  const draw = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      draw.unobserve(e.target);
      e.target.classList.add('is-drawn');
    });
  }, { threshold: 0.4 });
  draw.observe(paid);
})();
