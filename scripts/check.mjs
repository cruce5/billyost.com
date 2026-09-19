// Pre-deploy checks for the things that drift on a hand-typed page.
// Fails the deploy (exit 1) on any problem.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(ROOT, "public/index.html"), "utf8");
const problems = [];

// 1. Every side project has a type label ("Podcast", "Data viz"...).
const exhibits = html.slice(html.indexOf('class="rows grid exhibits"'), html.indexOf("</ul>", html.indexOf('class="rows grid exhibits"')));
const rows = (exhibits.match(/<li class="row">/g) || []).length;
const letters = [...exhibits.matchAll(/class="ex">([^<]+)</g)].map((m) => m[1]);
if (!rows) problems.push("no side projects found");
if (letters.length !== rows) problems.push(`${rows} side projects but ${letters.length} type labels`);

// 2. The three share descriptions are one string, and the two titles match.
const meta = (sel) => (html.match(new RegExp(`${sel}" content="([^"]*)"`)) || [])[1];
const descs = [meta('name="description'), meta('property="og:description'), meta('name="twitter:description')];
if (new Set(descs).size !== 1) problems.push("description, og:description and twitter:description differ");
if (meta('property="og:title') !== meta('name="twitter:title')) problems.push("og:title and twitter:title differ");

// 3. No em dashes anywhere we ship or write.
const files = ["public/index.html", "public/404.html", "public/theme.js", "README.md", "src/worker.js",
  ...readdirSync(join(ROOT, "scripts")).map((f) => "scripts/" + f)];
for (const f of files) {
  if (readFileSync(join(ROOT, f), "utf8").includes(String.fromCharCode(0x2014))) problems.push(`em dash in ${f}`);
}

// 4. Every outbound link is https.
for (const m of html.matchAll(/href="(http:[^"]*)"/g)) problems.push(`insecure link ${m[1]}`);

if (problems.length) {
  console.error("check failed:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`check ok: ${rows} side projects (${letters.join(", ")}), descriptions agree, no em dashes, links https`);
