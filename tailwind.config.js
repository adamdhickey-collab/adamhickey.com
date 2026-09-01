/** Tailwind configuration for the six case studies.
 *
 * This was an inline `tailwind.config = {...}` block, byte-identical in all six
 * pages, fed to the browser-side compiler at cdn.tailwindcss.com. That compiler
 * is not for production: it rebuilds the stylesheet on every page load, on the
 * critical path, from a third-party script. The CSS is built once from here
 * into case-study/case-tailwind.css instead.
 *
 * THE THEME BELOW IS THE INLINE BLOCK, UNCHANGED. Not the richer config the
 * staging repository uses -- that one maps Tailwind keys onto CSS tokens, which
 * is the better arrangement and also a different change. These pages still
 * carry arbitrary bracket values that a token-mapped config would silently
 * re-resolve. The only thing being changed here is WHERE the CSS comes from,
 * so the theme has to stay exactly what the CDN was compiling.
 *
 * `dark` and `charcoal` are both #252525 -- the same value under two names.
 * Left as-is for the same reason: retiring one is a markup change, not a
 * build change.
 *
 * No typography plugin. The CDN URL asked for `?plugins=typography` and no page
 * carries a `prose` class -- checked, zero occurrences across all six.
 *
 * To rebuild after adding or removing a class:
 *
 *   npm install --no-save tailwindcss@3.4.19
 *   printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/tw-input.css
 *   npx tailwindcss -c tailwind.config.js -i /tmp/tw-input.css \
 *     -o case-study/case-tailwind.css --minify
 *
 * A caution the extractor earns: it scans each page as text, not as markup, so
 * a class name written in an English sentence becomes a real rule. That is also
 * what the CDN did, and the point of this change is that nothing renders
 * differently -- so those rules stay.
 */
module.exports = {
  content: ['./case-study/*.html'],
  theme: {
    extend: {
      colors: {
        'warm':        '#f5f5f0',
        'tea-light':   '#e8ede5',
        'muted-light': '#e5e5dd',
        'muted-gray':  '#5c5f5c',
        'charcoal':    '#252525',
        'dark':        '#252525',
        'border-light':'#E5E5E0',
      },
      /* Tailwind's own text-3xl and text-4xl are 30px and 36px, and neither is
         on the fourteen-step scale (…24 28 34 40…). Every other default in the
         range already lands on it. Mapping just these two keeps the utility and
         the scale from disagreeing -- md:text-3xl was the last off-scale size
         on the site that was not the hero. */
      fontSize: {
        '3xl': '1.75rem',    /* 28px, was 30 */
        '4xl': '2.125rem',   /* 34px, was 36 */
      },
      fontFamily: {
        'sans':   ['var(--font-sans)'],
        'serif':  ['var(--font-serif)'],
      },
      borderRadius: {
        '4xl': '20px',
      },
    }
  }
}
