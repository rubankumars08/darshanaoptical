import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progressive Lenses in Harur",
  description:
    "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical. Expert fitting by optometrists.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals progressive lenses",
    "Darshana Opticals Harur",
    "progressive lenses Harur",
    "no-line bifocal Harur",
    "varifocal lenses Tamil Nadu",
    "progressive glasses Harur",
    "multifocal lenses Harur",
    "progressive lens fitting",
    "opticals in Harur",
  ],
  alternates: { canonical: "/progressive-lenses" },
  openGraph: {
    title: "Progressive Lenses in Harur | Darshana Optical",
    description:
      "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical.",
    url: "https://darshanaoptical.com/progressive",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function ProgressiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
