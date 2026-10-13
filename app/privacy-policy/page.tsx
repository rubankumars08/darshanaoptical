import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";

export const metadata: Metadata = {
  title: "Privacy Policy | Darshana Optical",
  description: "Privacy Policy for Darshana Optical store in Harur, Tamil Nadu.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const SECTIONS = [
  {
    title: "1. Introduction",
    body: "Darshana Optical (\"we\", \"our\", \"us\") respects your privacy. This Privacy Policy explains what information we collect through this website, how we use it, and the choices you have. By using this website, you agree to the practices described here.",
  },
  {
    title: "2. Information We Collect",
    body: "When you use our Contact form, Booking form, or interactive tools (Smart Frame Finder, Smart Lens Finder), we may collect the name, phone number, email address, and message details you choose to provide. We do not require you to create an account, and we do not collect payment information on this website.",
  },
  {
    title: "3. How We Use Your Information",
    body: "We use the details you submit only to respond to your enquiry, confirm an appointment, or share the information you requested (such as frame or lens recommendations) — typically by contacting you back on WhatsApp or by phone. We do not sell or rent your personal information to third parties.",
  },
  {
    title: "4. WhatsApp & Third-Party Communication",
    body: "Several buttons on this site open a pre-filled WhatsApp message to our store number. Messages sent this way are subject to WhatsApp's own privacy policy, and our conversation with you is stored in WhatsApp like any other chat. We use it solely to assist with your enquiry.",
  },
  {
    title: "5. Cookies & Local Storage",
    body: "This website does not use tracking cookies or third-party advertising trackers. Your browser may store minor technical preferences locally (such as scroll position) purely to make your visit smoother; this data never leaves your device.",
  },
  {
    title: "6. Third-Party Links & Embeds",
    body: "Our Contact page embeds a Google Maps location and links to our Instagram, Facebook, and WhatsApp profiles. These third-party services have their own privacy policies, and we encourage you to review them separately.",
  },
  {
    title: "7. Data Security",
    body: "We take reasonable precautions to protect any information you share with us. However, no method of electronic transmission is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "8. Children's Privacy",
    body: "This website is intended for general audiences and is not directed at children under 13. We do not knowingly collect personal information from children without parental involvement.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time to reflect changes to our practices. The \"Last updated\" date below will always indicate the most recent revision.",
  },
  {
    title: "10. Contact Us",
    body: "If you have any questions about this Privacy Policy or how your information is handled, please reach out through our Contact page — we're happy to help.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-white">
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-14 sm:py-20">
          <div className="container-brand text-center max-w-3xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Your Privacy Matters
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight">
              Privacy Policy
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
