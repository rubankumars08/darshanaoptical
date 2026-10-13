import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Frames for Your Face",
  description:
    "Answer a few easy questions to find spectacle frames that suit your face, daily use, style and budget at Darshana Optical in Harur.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals frame finder",
    "Darshana Opticals Harur",
    "frame finder Harur",
    "glasses selector",
  ],
  alternates: {
    canonical: "/frame-finder",
  },
  openGraph: {
    title: "Find Your Perfect Frame | Darshana Optical",
    description:
      "Try our interactive Smart Frame Finder to discover the best spectacle frames tailored to your face shape, lifestyle, and preferences in Harur.",
    url: "https://darshanaoptical.com/frame-finder",
  },
};

export default function FrameFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
