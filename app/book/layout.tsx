import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Eye Test in Harur",
  description:
    "Book a computerised eye test at Darshana Optical in Harur. Choose your preferred date and time or call +91 88705 71536.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals Harur",
    "Darshana Optical eye test",
    "Darshana Opticals appointment",
    "book eye test Harur",
    "eye test appointment Harur",
    "optometrist appointment Harur",
    "schedule eye exam Tamil Nadu",
    "vision checkup Harur",
    "opticals in Harur",
  ],
  alternates: { canonical: "/book-eye-test" },
  openGraph: {
    title: "Book an Eye Test | Darshana Optical Harur",
    description:
      "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/book",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
