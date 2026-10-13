import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progressive Lenses in Harur",
  description:
    "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals progressive lenses",
    "Darshana Opticals Harur",
    "progressive lenses Harur",
    "opticals in Harur",
  ],
  alternates: {
    canonical: "/progressive-lenses",
  },
  openGraph: {
    title: "Progressive Lenses in Harur | Darshana Optical",
    description:
      "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical.",
    url: "https://darshanaoptical.com/progressive-lenses",
  },
};

export default function ProgressiveLensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
