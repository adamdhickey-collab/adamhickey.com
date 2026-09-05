/** Tailwind configuration for the six case studies.
 *
 * This was an inline `tailwind.config = {...}` block, duplicated byte for byte
 * in all six pages and fed to the browser-side compiler at cdn.tailwindcss.com.
 * That compiler is not for production -- it rebuilds the stylesheet on every
 * page load, on the critical path, from a third-party script. The CSS is now
 * built once from this file into case-study/case-tailwind.css.
 *
 * The `content` globs are the six pages themselves: Tailwind emits only the
 * classes they actually use, which is why the built file is a fraction of the
 * framework.
 *
 * No typography plugin. The CDN URL asked for `?plugins=typography` and not one
 * page uses a `prose` class -- the only occurrences of the word are English.
 *
 * To rebuild after adding or removing a class -- the CI check runs exactly this
 * and fails if the committed file differs:
 *
 *   npm install --no-save tailwindcss@3.4.19
 *   printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/tw-input.css
 *   npx tailwindcss -c tailwind.config.js -i /tmp/tw-input.css \
 *     -o case-study/case-tailwind.css --minify
 *
 * A caution the extractor earns: it scans each page as text, not as markup, so
 * a class name written in an English sentence becomes a real rule. The block
 * this file replaced described the pages' own "sticky table of contents" and
 * called [40px] "p-10 spelled the long way", and the CDN duly shipped .sticky,
 * .contents and .p-10 for elements that carry none of them. Removing the prose
 * removed the rules. Several utilities still here -- .visible, .table, .ring,
 * .shadow, .filter -- exist for the same reason and are left alone, because
 * they are what the CDN emitted too and the point of this change is that
 * nothing renders differently.
 */
module.exports = {
  content: ['./case-study/*.html'],
  theme: {
    extend: {
      colors: {
        /* Read from color.css, so a Tailwind utility and a CSS token
           cannot drift apart -- the same arrangement fontSize already has
           with the type scale. These were seven hardcoded hexes copied
           into all six pages, two of them ('charcoal' and 'dark') the same
           value under two names; 'dark' is gone and its 101 uses now say
           what they mean. */
        'white':       'var(--color-white)',
        'warm':        'var(--color-warm)',
        'tea-light':   'var(--color-tea-light)',
        'muted-light': 'var(--color-muted-light)',
        'muted-gray':  'var(--color-muted-gray)',
        'charcoal':    'var(--color-charcoal)',
        'accent':      'var(--color-accent-deep)',
        /* The sage is two steps. accent is the fill; accent-text is the
           darker one small type needs. text-accent-text on the warm ground is
           4.12:1 against a 4.5 floor -- that is why this key exists. */
        'accent-text': 'var(--color-accent-text)',
        'accent-dark': 'var(--color-accent-on-dark)',
        'rule':        'var(--color-rule)',
        'border-light':'var(--color-tag-border)',
      },
      /* Read from shell.css, so a Tailwind utility and a CSS token cannot
         drift apart -- the same arrangement colors and fontSize already
         have.

         The nine numeric keys are Tailwind's own most-used steps and they
         already held these exact values; naming them here changes nothing
         that renders, it just means p-6 and --space-xl are the same 24px
         by construction rather than by coincidence.

         gutter, block, section and section-lg are the fluid ramps. The
         gutter replaced a mobile page inset of 16px, where the rest of
         the site and these pages' own sticky table of contents already
         used 24 -- the body copy had been sitting 8px inside the links
         pointing at it. The ramps are also what the 109 arbitrary bracket
         values became: [40px], sixty-seven times, was p-10 spelled the
         long way, and [70px], [30px], [46px] and [-10px] were not even on
         the 4px grid. */
      spacing: {
        'gutter':     'var(--gutter)',
        'block':      'var(--space-block)',
        'section':    'var(--space-section)',
        'section-lg': 'var(--space-section-lg)',
        '1':  'var(--space-2xs)',
        '2':  'var(--space-xs)',
        '3':  'var(--space-sm)',
        '4':  'var(--space-md)',
        '5':  'var(--space-lg)',
        '6':  'var(--space-xl)',
        '8':  'var(--space-2xl)',
        '10': 'var(--space-3xl)',
        '12': 'var(--space-4xl)',
      },
      /* The same fourteen steps, read from type.css, so a Tailwind
         utility and a CSS token cannot drift apart. xs through 2xl
         already matched Tailwind's defaults exactly; 3xl upward did not,
         and 2xs did not exist. This is what retires the eleven arbitrary
         bracket sizes the pages used to carry. */
      fontSize: {
        '2xs':  'var(--text-2xs)',
        'xs':   'var(--text-xs)',
        'sm':   'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg':   'var(--text-lg)',
        'xl':   'var(--text-xl)',
        '2xl':  'var(--text-2xl)',
        '3xl':  'var(--text-3xl)',
        '4xl':  'var(--text-4xl)',
        '5xl':  'var(--text-5xl)',
        '6xl':  'var(--text-6xl)',
        '7xl':  'var(--text-7xl)',
        '8xl':  'var(--text-8xl)',
        '9xl':  'var(--text-9xl)',
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
