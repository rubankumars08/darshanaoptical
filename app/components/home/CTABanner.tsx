"use client";

import { CalendarCheck, MessageCircle, CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";
import { useBooking } from "../booking/BookingContext";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

export default function CTABanner() {
  const { openBooking } = useBooking();

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      "Hello Darshana Optical, I would like to know more and book an eye test appointment."
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <section id="book" className="bg-white py-10 sm:py-14">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_STANDARD }}
          className="relative overflow-hidden rounded-3xl bg-[#1a1b20] border border-neutral-800 shadow-2xl text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/15 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-orange border border-brand-orange/25">
                <Sparkles size={13} />
                <span>WE ARE HERE TO HELP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight text-balance">
                Need an eye test or new glasses?
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-lg text-pretty">
                Visit Darshana Optical in Harur. We&apos;ll check your eyes and help you choose comfortable glasses for your needs and budget.
              </p>

              {/* Trust checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brand-orange shrink-0" />
                  <span>Careful computerised eye check</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brand-orange shrink-0" />
                  <span>500+ frames to choose from</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brand-orange shrink-0" />
                  <span>Lenses for screens, reading and distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brand-orange shrink-0" />
                  <span>Comfortable fitting and friendly help</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <motion.button
                  onClick={openBooking}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-orange/25 hover:bg-brand-orange-hover transition-colors cursor-pointer"
                >
                  <CalendarCheck size={16} />
                  <span>Book Eye Test</span>
                </motion.button>
                <motion.button
                  onClick={handleWhatsApp}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Us</span>
                </motion.button>
              </div>
            </div>

            {/* Right Consultation Image */}
            <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-75 overflow-hidden p-4 sm:p-6 lg:p-6 flex items-center justify-center">
              <div className="relative w-full h-full min-h-65 overflow-hidden rounded-2xl border border-neutral-700/80 shadow-xl group">
                <Image
                  src="/images/cta-consultation.jpg"
                  alt="Personal Optometry Consultation at Darshana Optical"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  quality={88}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white z-10">
                  <p className="text-xs font-bold leading-tight">
                    Visit our store in Harur
                  </p>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Salem Bypass Road, Opp. Vasanth & Co, Harur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
