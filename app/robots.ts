import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/api-docs"],
      },
    ],
    sitemap: "https://darshanaoptical.com/sitemap.xml",
    host: "https://darshanaoptical.com",
  };
}
