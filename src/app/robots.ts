import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/library", "/train", "/review", "/profile", "/lesson/", "/auth/", "/forgot-password", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
