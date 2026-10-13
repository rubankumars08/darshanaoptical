import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://darshanaoptical.com";

  const routes = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/eye-testing", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/frames", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/lenses", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/progressive-lenses", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/book-eye-test", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/frame-finder", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/lens-finder", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/offers", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/gallery", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${base}${url}`,
    changeFrequency,
    priority,
  }));
}
