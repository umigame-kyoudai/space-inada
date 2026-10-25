import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The preview uses no paid storage or image service.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
