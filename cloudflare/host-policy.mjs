export const canonicalHost = "keyphotomiyakojima.com";
const redirectHosts = new Set([
  "www.keyphotomiyakojima.com",
  "space-inada.com",
  "www.space-inada.com",
]);

export function redirectDestination(requestUrl) {
  const url = new URL(requestUrl);
  if (!redirectHosts.has(url.hostname)) return null;
  url.protocol = "https:";
  url.host = canonicalHost;
  url.port = "";
  return url.href;
}

export function isTemporaryHost(requestUrl) {
  return new URL(requestUrl).hostname.endsWith(".workers.dev");
}
