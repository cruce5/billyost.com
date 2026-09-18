# billyost.com

Bill Yost's landing page. One hand-written HTML file, self-hosted IBM Plex, no framework, served as static assets from a Cloudflare Worker.

## Layout

- `public/index.html` is the whole page: inline CSS, inline SVG glyphs.
- `public/theme.js` sets the stored theme before first paint and wires the toggle. It is external so the CSP can stay `script-src 'self'` with no hashes to maintain.
- `public/_headers` carries the CSP, HSTS and cache rules.
- `scripts/og-image.mjs` renders `public/og.png` with resvg.

## Commands

    npm run og        # re-render the share card
    npm run dev       # wrangler dev
    npm run deploy    # og + wrangler deploy

## Adding an exhibit

Copy a `<li class="row">` block in `public/index.html`, bump the exhibit letter, and update the "N on file" count in the section header.

## House rules

Dark mode is the primary target. Every color token lives in all three theme blocks. Text wears ink tokens only. No em dashes.
