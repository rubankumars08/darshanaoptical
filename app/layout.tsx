import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/motion/SmoothScroll";
import PageLoadProgress from "./components/motion/PageLoadProgress";
import { BookingProvider } from "./components/booking/BookingContext";
import BookingModal from "./components/booking/BookingModal";
import { GoogleAnalytics } from "@next/third-parties/google";
import LocalBusinessSchema from "./components/seo/LocalBusinessSchema";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const BASE_URL = "https://darshanaoptical.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Optical Shop in Harur | Darshana Optical",
    template: "%s | Darshana Optical",
  },
  description:
    "Eye tests, prescription glasses, frames, progressive lenses and sunglasses at Darshana Optical, Salem Bypass Road, Harur. Call +91 88705 71536.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Optical Harur",
    "Darshana Opticals Harur",
    "Darshana Opticals Harur Tamil Nadu",
    "Darshana Opticals eye testing",
    "Darshana Opticals spectacle frames",
    "optical shop Harur",
    "opticals in Harur",
    "eyewear Harur",
    "eye testing Harur",
    "spectacles Harur",
    "frames Harur Tamil Nadu",
    "lenses Harur",
    "progressive lenses Harur",
    "optician Harur",
    "best optical shop Dharmapuri",
    "eye care Tamil Nadu",
    "prescription glasses Harur",
  ],
  authors: [{ name: "Darshana Optical", url: BASE_URL }],
  creator: "Darshana Optical",
  publisher: "Darshana Optical",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Optical Shop in Harur | Darshana Optical",
    description:
      "Visit Darshana Optical in Harur for eye tests, prescription glasses, frames, progressive lenses and sunglasses.",
    url: BASE_URL,
    siteName: "Darshana Optical",
    images: [
      {
        url: "/images/og-darshana-optical.jpg",
        width: 1200,
        height: 630,
        alt: "Darshana Optical Store in Harur",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optical Shop in Harur | Darshana Optical",
    description:
      "Visit Darshana Optical in Harur for eye tests, prescription glasses, frames, progressive lenses and sunglasses.",
    images: ["/images/og-darshana-optical.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <head>
        <LocalBusinessSchema />
      </head>
      <body className="min-h-full flex flex-col">
        <PageLoadProgress />
        <SmoothScroll />
        <BookingProvider>
          {children}
          <BookingModal />
        </BookingProvider>
      </body>
      <GoogleAnalytics gaId="G-10ZFZ1TVTY" />
    </html>
  );
}
