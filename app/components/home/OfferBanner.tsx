"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Laptop, ShieldCheck, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

export default function OfferBanner() {
  return (
    <section id="offer-banner" className="bg-white py-8 sm:py-12">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_STANDARD }}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#ff4500] via-[#fc5a06] to-[#ff6a1a] shadow-xl text-white group"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 p-8 sm:p-12 lg:p-14 space-y-4">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white backdrop-blur-xs shadow-xs"
              >
                <Tag size={13} />
                <span>STORE OFFER</span>
              </motion.span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight [text-wrap:balance]">
                Computer Glasses <br />
                Starting From <span className="tabular-nums">₹1,499*</span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-white/95 pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <Laptop size={15} /> Frame included
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <ShieldCheck size={15} /> Screen-use lenses
                </span>
              </div>

              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/offers"
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-neutral-900 transition-colors"
                  >
                    <span>View offer</span>
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Right Product Image */}
            <div className="md:col-span-5 relative h-64 md:h-full min-h-65 overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-full h-full min-h-55 overflow-hidden rounded-2xl md:rounded-l-2xl md:rounded-r-none">
                <Image
                  src="/images/offer-glasses.jpg"
                  alt="Computer Glasses Special Offer"
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  quality={85}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
