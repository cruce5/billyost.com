// Render public/og.png (1200x630), the social-share card for billyost.com.
// Pure SVG -> PNG via resvg; no browser. Uses whatever sans/mono the OS provides.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200, H = 630;
const SANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

const memo = [
  ["TO", "Whoever clicked"],
  ["FROM", "Bill Yost"],
  ["RE", "What all of this is"],
].map(([k, v], i) => {
  const y = 176 + i * 38;
  return `<text x="80" y="${y}" font-family="${MONO}" font-size="22" letter-spacing="3" fill="#918f88">${k}</text>
  <text x="200" y="${y}" font-family="${MONO}" font-size="24" fill="#c3c2b7">${v}</text>`;
}).join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0d0d0d"/>
  <text x="80" y="92" font-family="${MONO}" font-size="22" letter-spacing="5" fill="#ffffff">MEMORANDUM</text>
  <text x="1120" y="92" text-anchor="end" font-family="${MONO}" font-size="22" letter-spacing="5" fill="#918f88">BILLYOST.COM</text>
  <rect x="80" y="112" width="1040" height="3" fill="#ffffff"/>
  ${memo}
  <rect x="80" y="278" width="1040" height="1" fill="#383835"/>
  <text x="74" y="440" font-family="${SANS}" font-size="150" font-weight="800" fill="#ffffff" letter-spacing="-4">Bill Yost</text>
  <text x="80" y="512" font-family="${SANS}" font-size="31" fill="#c3c2b7">People analytics by day. Data things nobody asked for by night.</text>
  <text x="80" y="574" font-family="${MONO}" font-size="22" letter-spacing="4" fill="#5a9ff0">EXHIBITS ENCLOSED</text>
</svg>`;

const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: true } })
  .render()
  .asPng();
writeFileSync(join(ROOT, "public/og.png"), png);
console.log(`public/og.png: ${(png.length / 1024).toFixed(0)} KB (${W}x${H})`);
