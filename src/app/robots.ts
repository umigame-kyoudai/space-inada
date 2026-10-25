import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { isPreviewDeployment } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
