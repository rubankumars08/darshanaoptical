import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";

export const metadata: Metadata = {
  title: "Terms & Conditions | Darshana Optical",
  description: "Terms and conditions for services and purchases at Darshana Optical in Harur, Tamil Nadu.",
  alternates: {
    canonical: "/terms-conditions",
  },
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use this website.",
  },
  {
    title: "2. Use of This Website",
    body: "This website is provided to help you explore our eyewear collection, lens options, and eye testing services, and to make it easy to get in touch with our store. You agree to use it only for lawful purposes and not to misuse any form, tool, or interactive feature on this site.",
  },
  {
    title: "3. Product & Pricing Information",
    body: "Frame styles, lens options, and prices shown on this website are indicative and provided for general reference. Availability, exact pricing, and final fitting are confirmed in person at our store, as stock and offers may change without prior notice.",
  },
  {
    title: "4. Appointments & Bookings",
    body: "Appointment requests submitted through our Booking form or WhatsApp are requests only, not guaranteed confirmations. Our team will reach out to confirm your preferred date and time, which may be adjusted based on availability.",
  },
  {
    title: "5. Smart Finder Tools",
    body: "The Smart Frame Finder and Smart Lens Finder provide general style and lens suggestions based on the answers you provide. They are meant as a starting point for conversation in-store and do not replace a professional eye test or personalised fitting advice from our optometrist.",
  },
  {
    title: "6. Intellectual Property",
    body: "All content on this website — including text, images, logos, and design — is the property of Darshana Optical unless otherwise stated, and may not be reproduced or used elsewhere without our permission.",
  },
  {
    title: "7. Third-Party Links & Services",
    body: "This website links to third-party services such as WhatsApp, Google Maps, and our social media profiles. We are not responsible for the content, availability, or practices of these external services.",
  },
  {
    title: "8. Limitation of Liability",
    body: "We make reasonable efforts to keep the information on this website accurate and up to date, but we do not guarantee that it is error-free at all times. Darshana Optical is not liable for any indirect loss arising from your use of this website.",
  },
  {
    title: "9. Governing Law",
    body: "These Terms & Conditions are governed by the laws of India, and any disputes will be subject to the jurisdiction of the courts having authority over Harur, Tamil Nadu.",
  },
  {
    title: "10. Changes to These Terms",
    body: "We may revise these Terms & Conditions from time to time. Continued use of this website after changes are posted means you accept the updated terms.",
  },
  {
    title: "11. Contact Us",
    body: "For any questions about these Terms & Conditions, please reach out through our Contact page — we're happy to help.",
  },
];

export default function TermsConditionsPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-white">
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-14 sm:py-20">
          <div className="container-brand text-center max-w-3xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <FileText size={14} /> Please Read Carefully
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-neutral-500 font-medium">Last updated: January 2026</p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="container-brand max-w-3xl mx-auto space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-lg font-bold text-neutral-950">{section.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-600 font-medium">{section.body}</p>
              </div>
            ))}

            <div className="pt-4 border-t border-neutral-100">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-orange hover:underline"
              >
                Have a question? Contact us →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
