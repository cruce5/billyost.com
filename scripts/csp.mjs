// Rewrite the Content-Security-Policy in public/_headers so style-src lists the SHA-256 of
// every inline <style> block in public/*.html instead of 'unsafe-inline'.
// Runs before every deploy, so editing the CSS can never leave a stale hash behind.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");

const hashes = new Set();
for (const f of readdirSync(PUB).filter((n) => n.endsWith(".html"))) {
  const html = readFileSync(join(PUB, f), "utf8");
  if (/\sstyle="/.test(html)) throw new Error(`${f}: inline style="" attributes would need 'unsafe-inline'`);
  for (const m of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    hashes.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }
}

// Cloudflare Web Analytics is on for the zone and injects its cookieless beacon into some
// responses; it reports to the same-origin /cdn-cgi/rum, so connect-src needs 'self'.
const csp = [
  "default-src 'none'",
  "script-src 'self' https://static.cloudflareinsights.com",
  `style-src ${[...hashes].join(" ")}`,
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const file = join(PUB, "_headers");
const before = readFileSync(file, "utf8");
const after = before.replace(/Content-Security-Policy: .*/, `Content-Security-Policy: ${csp}`);
if (after === before && !before.includes(csp)) throw new Error("no CSP line found in _headers");
writeFileSync(file, after);
console.log(`_headers: CSP with ${hashes.size} style hash(es)`);
