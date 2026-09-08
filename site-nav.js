/* site-nav.js — the section menu on narrow screens, shared by every page
   that carries the four section links.

   Below 900px site-nav.css hides .nav-links, and until this file existed
   nothing replaced them: a phone reader could leave a page only by the logo
   or the two icon links. The button in .nav-actions opens the list as a
   panel under the bar. Everything visual is in site-nav.css under
   .is-menu-open; this file only sets the class and keeps aria-expanded true
   to it. Above 900px the button is display:none and the list is inline, so
   the class is cleared the moment the viewport crosses that line, or a
   panel opened on a phone would survive a rotation into a state nothing
   can close.

   Deferred, and it returns at once on any page without the button, so the
   design system page can load it or not without a difference. */
(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.nav-links');
  if (!toggle || !links) return;

  const isOpen = () => nav.classList.contains('is-menu-open');
  const set = (open) => {
    nav.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close the site sections menu' : 'Open the site sections menu');
  };

  toggle.addEventListener('click', () => set(!isOpen()));
  // A section link navigates away or scrolls the same page; either way the
  // panel has done its job.
  links.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { set(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => { if (isOpen() && !nav.contains(e.target)) set(false); });

  const wide = window.matchMedia('(min-width: 900px)');
  wide.addEventListener('change', (e) => { if (e.matches) set(false); });
})();
