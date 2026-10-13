import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyeglass Lenses in Harur",
  description:
    "Find prescription, anti-glare, screen-use, photochromic, thin and progressive lenses at Darshana Optical in Harur, with help choosing the right option.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals Harur",
    "Darshana Opticals lenses",
    "prescription lenses Harur",
    "anti glare lenses Harur",
    "blue cut lenses Harur",
    "progressive lenses Harur",
    "photochromic lenses Tamil Nadu",
    "UV protection lenses",
    "lens replacement Harur",
    "bifocal lenses Harur",
    "opticals in Harur",
  ],
  alternates: { canonical: "/lenses" },
  openGraph: {
    title: "Eyeglass Lenses | Darshana Optical Harur",
    description:
      "Premium anti-glare, blue cut, photochromic & progressive lenses at Darshana Optical Harur. Expert fitting included.",
    url: "https://darshanaoptical.com/lenses",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function LensesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
