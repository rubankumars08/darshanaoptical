import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyewear Offers in Harur",
  description:
    "Check out the latest eyewear packages, frame discounts, and seasonal offers at Darshana Optical in Harur.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals offers",
    "Darshana Opticals Harur",
    "eyewear discounts Harur",
    "spectacle offers Harur",
    "opticals in Harur",
  ],
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    title: "Eyewear Offers | Darshana Optical Harur",
    description:
      "Check out the latest eyewear packages, frame discounts, and seasonal offers at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/offers",
  },
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
