import application from "../.open-next/worker.js";
import { isTemporaryHost, redirectDestination } from "./host-policy.mjs";
export * from "../.open-next/worker.js";

const worker = {
  async fetch(request, env, ctx) {
    const destination = redirectDestination(request.url);
    if (destination) return Response.redirect(destination, 308);

    // Keep original-domain redirects effective for assets as well as pages.
    const asset = await env.ASSETS.fetch(request);
    const response = asset.status === 404
      ? await application.fetch(request, env, ctx)
      : asset;
    if (!isTemporaryHost(request.url)) return response;
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
export default worker;
