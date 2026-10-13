import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description:
    "Visit Darshana Optical at TVK Nagar, Salem Bypass Road, opposite Vasanth & Co, Harur - 636903. Call 088705 71536 or WhatsApp us. Open all 7 days.",
  keywords: [
    "Darshana Optical contact",
    "Darshana Opticals contact",
    "Darshana Opticals Harur",
    "optical shop near me Harur",
    "opticals in Harur",
    "Darshana Optical address",
    "Harur optical store",
    "spectacles shop Harur phone",
    "eye care Harur location",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Darshana Optical | Harur",
    description:
      "Visit Darshana Optical at TVK Nagar, Salem Bypass Road, opposite Vasanth & Co, Harur. Call 088705 71536. Open Mon–Sat 9:30 AM–8:30 PM, Sun 10 AM–2 PM.",
    url: "https://darshanaoptical.com/contact",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
