"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Sparkles, MessageCircle, Info, ShieldCheck, CheckCircle2, ArrowRight, Gift, Percent, Calendar } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

const OFFERS = [
  {
    id: "complete-package",
    title: "Complete Eyewear Package Offer",
    desc: "Selected premium frame + Anti-Reflective lens combinations available at special in-store package pricing.",
    tag: "Best Value",
    cta: "View Details",
    img: "/images/offer-glasses.jpg",
    icon: Gift
  },
  {
    id: "lens-upgrade",
    title: "Lens Upgrade Offer",
    desc: "Receive complimentary anti-reflective coating upgrade on selected progressive and blue-filter digital lenses.",
    tag: "Popular Choice",
    cta: "Ask About Offer",
    img: "/images/frame-1.jpg",
    icon: Percent
  },
  {
    id: "seasonal-promo",
    title: "Seasonal Family Package",
    desc: "Limited-period promotional discounts when purchasing multiple frames or family eye test packages together.",
    tag: "Limited Time",
    cta: "Enquire Now",
    img: "/images/frame-3.jpg",
    icon: Tag
  },
];

const TERMS = [
  "Offer validity: Valid until active campaign end date or stock availability in store.",
  "Applicable products: Valid on selected frame brands, single vision, and progressive lens packages.",
  "Promotional combination: Cannot be combined with other ongoing store discounts unless specified.",
  "In-store availability: Available exclusively at Darshana Optical, Harur main store location.",
];

export default function OffersPage() {
  const { openBooking } = useBooking();

  const handleWhatsAppOffer = (title: string) => {
    const msg = encodeURIComponent(`Hello Darshana Optical, I am inquiring about the current in-store offer: "${title}". Can you share full details?`);
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[#faf8f5] py-12 sm:py-16 lg:py-20 border-b border-neutral-200/60">
          <div className="container-brand grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-extrabold uppercase tracking-wider">
                <Tag size={14} /> In-Store Specials
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-none">
                Great Eyewear. <br />
                <span className="text-brand-orange">More Value.</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                Discover current in-store promotions, frame & lens package bundles, and seasonal offers at Darshana Optical.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openBooking}
                  className="btn-primary gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Eye Test</span>
                </button>
                <button
                  onClick={() => handleWhatsAppOffer("All In-Store Offers")}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Ask Available Deals</span>
                </button>
              </div>
            </div>

            {/* Hero Right Image */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                <img
                  src="/images/offer-glasses.jpg"
                  alt="Special Offer Glasses"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Exclusive Harur Deals</span>
                    <h3 className="text-lg font-bold">Premium Quality Eyewear Bundles</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE OFFERS GRID */}
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">Active Offers</h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Visit our Harur store to redeem these exclusive in-store value packages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {OFFERS.map((offer) => {
                const IconComp = offer.icon;
                return (
                  <div
                    key={offer.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-xs transition-all duration-300 hover:border-brand-orange hover:shadow-xl"
                  >
                    <div>
                      <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-neutral-100 mb-5">
                        <img
                          src={offer.img}
                          alt={offer.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 right-3 rounded-full bg-brand-orange text-white px-3 py-1 text-[10px] font-extrabold uppercase shadow-xs">
                          {offer.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand-orange">
                        <IconComp size={16} />
                        <span>Special In-Store Bundle</span>
                      </div>

                      <h3 className="text-lg font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                        {offer.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-600 font-medium">
                        {offer.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100">
                      <button
                        onClick={() => handleWhatsAppOffer(offer.title)}
                        className="w-full btn-primary justify-center text-xs font-bold gap-2 cursor-pointer shadow-xs"
                      >
                        <MessageCircle size={16} /> {offer.cta}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* OFFER TERMS */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200/80">
          <div className="container-brand max-w-4xl space-y-8">
            <div className="flex items-center gap-2 text-neutral-950 text-xl font-bold border-b border-neutral-200 pb-4">
              <Info size={20} className="text-brand-orange" />
              <span>Offer Terms & Conditions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TERMS.map((term, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-white p-4 border border-neutral-200/70 text-xs font-medium text-neutral-700 shadow-2xs">
                  <CheckCircle2 size={16} className="shrink-0 text-brand-orange mt-0.5" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 bg-[#18191c] text-white text-center">
          <div className="container-brand max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Want to Know What&apos;s Available Today?
            </h2>
            <p className="text-base text-neutral-300 font-medium">
              Send us a message on WhatsApp for today&apos;s active inventory deals and package pricing.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleWhatsAppOffer("Today's Available Offers")}
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
              >
                <MessageCircle size={20} /> WhatsApp Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
