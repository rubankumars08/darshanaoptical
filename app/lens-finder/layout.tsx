import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find the Right Lens for Your Glasses",
  description:
    "Use our simple lens finder to choose lenses for reading, distance, computer work, driving or all distances. Visit Darshana Optical in Harur.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals lens finder",
    "Darshana Opticals Harur",
    "lens selector Harur",
  ],
  alternates: {
    canonical: "/lens-finder",
  },
  openGraph: {
    title: "Find the Right Lens | Darshana Optical",
    description:
      "Interactive Smart Lens Finder to help you choose the ideal lens type, coatings, and protection suited for your vision and daily work routine.",
    url: "https://darshanaoptical.com/lens-finder",
  },
};

export default function LensFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
