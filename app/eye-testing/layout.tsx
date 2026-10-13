import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Computerised Eye Test in Harur",
  description:
    "Book a computerised eye test at Darshana Optical in Harur. Get your eye power checked carefully with simple guidance. Call +91 88705 71536.",
  keywords: [
    "Darshana Opticals eye test",
    "Darshana Optical eye testing",
    "eye testing Harur",
    "eye test Harur",
    "opticals in Harur",
    "computerised eye test Harur",
    "optometrist Harur",
    "eye examination Tamil Nadu",
    "vision test Harur",
    "eye checkup Dharmapuri",
  ],
  alternates: { canonical: "/eye-testing" },
  openGraph: {
    title: "Eye Testing in Harur | Darshana Optical",
    description:
      "Professional 6-step computerized eye testing in Harur with advanced autorefractometer, phoropter, and precision vision care at Darshana Optical.",
    url: "https://darshanaoptical.com/eye-testing",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function EyeTestingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
