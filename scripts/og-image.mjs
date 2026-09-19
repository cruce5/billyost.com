// Render public/og.png (1200x630), the social-share card for billyost.com.
// Pure SVG -> PNG via resvg; no browser. Type is the site's own IBM Plex, decompressed from the
// woff2 files in public/fonts (resvg reads TTF, not woff2). The flag is drawn, because resvg
// cannot render color emoji. The tagline is read from index.html so the
// card cannot drift from the page.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import wawoff2 from "wawoff2";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200, H = 630;
const COND = "IBM Plex Sans Condensed", SANS = "IBM Plex Sans", MONO = "IBM Plex Mono Medium"; // the family names inside the subset files

// resvg-js ignores in-memory fontBuffers on Node, so the TTFs go to a temp dir as fontFiles.
// These Plex files are variable fonts, and resvg mismatches families when several are loaded
// at once, so each face's text renders as its own transparent layer with only that font loaded.
const fontDir = mkdtempSync(join(tmpdir(), "billyost-og-"));
const ttf = async (n) => {
  const p = join(fontDir, n + ".ttf");
  writeFileSync(p, Buffer.from(await wawoff2.decompress(readFileSync(join(ROOT, "public/fonts", n + ".woff2")))));
  return p;
};
const FONT_FILE = { [COND]: await ttf("plex-cond-700-latin"), [SANS]: await ttf("plex-sans-400-latin"), [MONO]: await ttf("plex-mono-500-latin") };
const layer = (family, body) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { fontFiles: [FONT_FILE[family]], loadSystemFonts: false, defaultFontFamily: family } }).render().asPng();
  return `<image href="data:image/png;base64,${png.toString("base64")}" x="0" y="0" width="${W}" height="${H}"/>`;
};

// Copy comes from the page, so a copy edit updates the card on the next deploy.
const html = readFileSync(join(ROOT, "public/index.html"), "utf8");
const lede = html.match(/<p class="lede">([^<]*)<\/p>/)[1];
// One sentence per line (the lede is written as short beats), wrapping any sentence longer
// than the room left of the portrait: about 38 characters at 29px Plex Sans.
const wrap = (text, max) => text.split(" ").reduce((lines, w) => {
  const last = lines[lines.length - 1];
  if (last !== undefined && (last + " " + w).length <= max) lines[lines.length - 1] = last + " " + w;
  else lines.push(w);
  return lines;
}, []);
const taglineLines = [];
for (const sentence of lede.match(/[^.!?]+[.!?]+/g).map((x) => x.trim())) {
  const lines = wrap(sentence, 38);
  if (taglineLines.length + lines.length > 3) break;
  taglineLines.push(...lines);
}
const tagline = taglineLines.join(" ");
const TAG_Y = 478, TAG_STEP = 38;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;");

// The same 440px portrait the page uses, embedded so resvg needs no file resolver.
const portrait = "data:image/jpeg;base64," + readFileSync(join(ROOT, "public/img/bill-yost.jpg")).toString("base64");
const PX = 935, PY = 368, PR = 190; // portrait centre and radius: big enough to read as a face at thumbnail size

// A drawn pirate flag, 104x72, top-left at (x, y).
const flag = (x, y) => `<g transform="translate(${x} ${y})">
    <rect width="104" height="72" rx="7" fill="#000" stroke="#5c5c57" stroke-width="2"/>
    <g stroke="#f4f4f0" stroke-width="6" stroke-linecap="round">
      <line x1="30" y1="46" x2="74" y2="62"/><line x1="74" y1="46" x2="30" y2="62"/>
    </g>
    <g fill="#f4f4f0">
      <circle cx="28" cy="45" r="4.5"/><circle cx="76" cy="45" r="4.5"/><circle cx="28" cy="63" r="4.5"/><circle cx="76" cy="63" r="4.5"/>
      <circle cx="52" cy="28" r="16"/><rect x="43" y="36" width="18" height="12" rx="3"/>
    </g>
    <g fill="#000"><circle cx="46" cy="27" r="4.2"/><circle cx="58" cy="27" r="4.2"/><rect x="50.5" y="34" width="3" height="5" rx="1"/></g>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0d0d0d"/>
  ${layer(MONO, `
  <text x="80" y="88" font-family="${MONO}" font-size="22" letter-spacing="5" fill="#ffffff">MEMORANDUM</text>
  <text x="1120" y="88" text-anchor="end" font-family="${MONO}" font-size="22" letter-spacing="5" fill="#918f88">BILLYOST.COM</text>
  <text x="80" y="${TAG_Y + taglineLines.length * TAG_STEP + 22}" font-family="${MONO}" font-size="24" letter-spacing="4" fill="#5a9ff0">SIDE PROJECTS, A PODCAST, COOKIES</text>`)}
  <rect x="80" y="106" width="1040" height="3" fill="#ffffff"/>
  ${flag(80, 198)}
  ${layer(COND, `<text x="74" y="420" font-family="${COND}" font-weight="700" font-size="168" letter-spacing="-2" fill="#ffffff">Bill Yost</text>`)}
  ${layer(SANS, taglineLines.map((l, i) => `<text x="80" y="${TAG_Y + i * TAG_STEP}" font-family="${SANS}" font-size="29" fill="#c3c2b7">${esc(l)}</text>`).join(""))}
  <defs><clipPath id="face"><circle cx="${PX}" cy="${PY}" r="${PR}"/></clipPath></defs>
  <circle cx="${PX}" cy="${PY}" r="${PR + 12}" fill="#1a1a19"/>
  <image href="${portrait}" x="${PX - PR}" y="${PY - PR}" width="${PR * 2}" height="${PR * 2}" clip-path="url(#face)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="${PX}" cy="${PY}" r="${PR}" fill="none" stroke="#4d4d49" stroke-width="2"/>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: { loadSystemFonts: false },
}).render().asPng();
writeFileSync(join(ROOT, "public/og.png"), png);
console.log(`public/og.png: ${(png.length / 1024).toFixed(0)} KB (${W}x${H}), tagline "${tagline}"`);
