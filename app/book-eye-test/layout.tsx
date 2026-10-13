import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Eye Test in Harur",
  description:
    "Book a computerised eye test at Darshana Optical in Harur. Choose your preferred date and time or call +91 88705 71536.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals Harur",
    "Darshana Opticals eye test",
    "book eye test Harur",
    "opticals in Harur",
  ],
  alternates: {
    canonical: "/book-eye-test",
  },
  openGraph: {
    title: "Book an Eye Test | Darshana Optical",
    description:
      "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/book-eye-test",
  },
};

export default function BookEyeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
