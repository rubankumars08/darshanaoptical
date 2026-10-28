"use client";

import { Car, Monitor, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const ZONES = [
  { id: 0, icon: Car, title: "Far", desc: "Driving, TV, outdoors", zoneClass: "top-0 h-1/3" },
  { id: 1, icon: Monitor, title: "Arm's length", desc: "Computer, vehicle meter", zoneClass: "top-1/3 h-1/3" },
  { id: 2, icon: BookOpen, title: "Near", desc: "Reading, Mobile", zoneClass: "top-2/3 h-1/3" },
];

export default function ProgressiveLens() {
  const [activeZone, setActiveZone] = useState<number | null>(null);

  return (
    <section id="progressive" className="bg-white py-10 sm:py-14">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: EASE_STANDARD }}
          className="overflow-hidden rounded-3xl bg-[#1a1b1f] text-white p-8 sm:p-12 lg:p-14 shadow-2xl border border-neutral-800"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-4">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[11px] font-bold uppercase tracking-wider text-brand-orange"
              >
                ONE PAIR FOR EVERYTHING
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight text-balance">
                See near and far with one pair
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-md">
                Read your phone, use a computer and see far away without changing your glasses.
              </p>
              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/progressive"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-orange/25 hover:bg-brand-orange-hover transition-colors"
                  >
                    <span>Know about progressives</span>
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Right: Progressive Lens Visual & 3 Zone Markers */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-6 lg:gap-8 justify-center">
              {/* Lens Silhouette Image with Dynamic Zone Highlight */}
              <div className="relative w-full max-w-sm aspect-16/10 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700/80 shadow-2xl flex items-center justify-center group">
                <Image
                  src="/images/lens-progressive.jpg"
                  alt="Progressive Multi-Zone Lens"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={90}
                  className="object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />

                {/* Interactive Glowing Zone Overlay */}
                {activeZone !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-x-0 ${ZONES[activeZone].zoneClass} bg-linear-to-b from-brand-orange/50 via-brand-orange/20 to-transparent pointer-events-none border-y border-brand-orange/60 shadow-[0_0_24px_rgba(252,90,6,0.6)]`}
                  />
                )}

                {/* Subtle Zone lines indication */}
                <div className="absolute inset-x-6 top-1/3 border-b border-dashed border-white/30 pointer-events-none" />
                <div className="absolute inset-x-6 top-2/3 border-b border-dashed border-white/30 pointer-events-none" />
              </div>

              {/* 3 Zone Labels with Interactive Highlight */}
              <div className="flex flex-col gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
                {ZONES.map((z) => {
                  const Icon = z.icon;
                  const isHovered = activeZone === z.id;
                  return (
                    <motion.div
                      key={z.title}
                      onMouseEnter={() => setActiveZone(z.id)}
                      onMouseLeave={() => setActiveZone(null)}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-neutral-800/90 border-brand-orange shadow-md shadow-brand-orange/10"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors shrink-0 ${
                          isHovered
                            ? "bg-brand-orange text-white"
                            : "bg-neutral-800 text-brand-orange"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {z.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {z.desc}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
