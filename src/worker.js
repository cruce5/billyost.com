// Every request lands here first. Plain http and www.billyost.com get one 301 to
// https://billyost.com with the path and query kept; everything else is a static asset.
const CANONICAL = "billyost.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === "http:" || url.hostname !== CANONICAL) {
      // Only redirect hosts we own; anything else (local dev, workers.dev) serves as-is.
      if (url.hostname === CANONICAL || url.hostname === "www." + CANONICAL) {
        url.protocol = "https:";
        url.hostname = CANONICAL;
        url.port = "";
        return Response.redirect(url.toString(), 301);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
