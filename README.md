# billyost.com

Bill Yost's landing page. One hand-written HTML file, self-hosted IBM Plex, no framework, served as static assets from a Cloudflare Worker.

## Layout

- `public/index.html` is the whole page: inline CSS, inline SVG glyphs.
- `public/theme.js` sets the stored theme before first paint, wires the three theme swatches (dark, light, rainbow) at the top right, announces the change to screen readers, and pauses animations while the tab is hidden. It is external so the CSP can stay `script-src 'self'`.
- `public/_headers` carries the CSP, HSTS and cache rules. The CSP line is rewritten on every build (see below); do not hand-edit it.
- `src/worker.js` runs in front of the assets and 301s plain http and www.billyost.com to https://billyost.com.
- `scripts/og-image.mjs` renders `public/og.png` with resvg in the site's own Plex (decompressed from the woff2 files). The tagline is read from `index.html`, so the card cannot drift from the page.

## Commands

    npm run check     # every side project labeled, one shared description, no em dashes, https links
    npm run og        # re-render the share card
    npm run csp       # hash every inline <style> into the CSP in _headers
    npm run build     # check + og + csp
    npm run dev       # build + wrangler dev
    npm run deploy    # build + wrangler deploy

After changing the share card, paste https://billyost.com into linkedin.com/post-inspector so LinkedIn drops its cached preview.

## Adding a side project

Copy a `<li class="row">` block in the Side projects list in `public/index.html` and give it a type label (`<span class="ex">Podcast</span>` and so on). `npm run check` fails the deploy if a project is missing its label. The first project runs full width on desktop; the rest sit two-up, so an even number of the others looks best.

## House rules

Dark mode is the primary target. Every color token lives in all four theme blocks (dark, OS light, forced light, rainbow). Text wears ink tokens only. Control edges clear 3:1 against the page. No em dashes. The employer is never named.
