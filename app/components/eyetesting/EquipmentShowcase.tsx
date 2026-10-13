"use client";

import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Activity, Eye, ScanLine, Award, Sparkles } from "lucide-react";
import Image from "next/image";

const EQUIPMENT_LIST = [
  {
    name: "Digital Auto Refractometer",
    brand: "AR-810A Auto Refractometer",
    origin: "Computerised Refraction",
    desc: "Digital auto-refractor with real-time target alignment and instant spherical and cylindrical precision.",
    img: "/images/store-refractometer.jpg",
  },
  {
    name: "Ophthalmic Examination Suite",
    brand: "Two M Precision Unit",
    origin: "Motorised Chair & Lenses",
    desc: "Motorised patient chair with comprehensive spherical, cylindrical and prism trial lens set for exact subjective fit.",
    img: "/images/store-testing-chair.jpg",
  },
  {
    name: "Digital Subjective Refractor",
    brand: "Essilor Vision Suite",
    origin: "Authorized Center",
    desc: "Ergonomic multi-zone subjective refraction for strain-free distance, screen, and reading clarity.",
    img: "/images/equip-autorefractometer.jpg",
  },
  {
    name: "Digital Phoropter Refractor",
    brand: "Zeiss / Nidek RT-5100™",
    origin: "Precision HD",
    desc: "Motorized optical lens turret ensuring comfortable, zero-error subject refraction.",
    img: "/images/equip-phoropter.jpg",
  },
  {
    name: "High-Res Fundus Screening",
    brand: "Canon CR-2 Plus™",
    origin: "Digital Retina Care",
    desc: "Digital imaging screening macular health, optic nerve integrity, and diabetic markers.",
    img: "/images/equip-retinal.jpg",
  },
];

const BRAND_PARTNERS = [
  { name: "Essilor® Vision Care", origin: "Authorized Partner" },
  { name: "Crizal® Lenses", origin: "Anti-Reflective Optics" },
  { name: "Varilux® XR Series™", origin: "Progressive Technology" },
  { name: "AR-810A Refractometry", origin: "Digital Diagnostics" },
  { name: "Two M Ophthalmic", origin: "Clinical Suite" },
  { name: "Carl Zeiss Meditec", origin: "Jena, Germany" },
];

export default function EquipmentShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-brand space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-orange border border-brand-orange/20">
            <Sparkles size={13} />
            <span>CLINICAL GRADE OPHTHALMIC TECHNOLOGY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            Advanced Technology for Accurate Eye Testing
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-normal">
            We invest in world-leading diagnostic instruments from Japan, Germany, and Switzerland for zero-error prescriptions.
          </p>
        </div>

        {/* Grid of Equipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {EQUIPMENT_LIST.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 border border-neutral-200/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-brand-orange/40 cursor-pointer overflow-hidden"
            >
              <div>
                {/* Brand & Origin Pill */}
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className="text-[11px] font-extrabold text-brand-orange tracking-tight uppercase">
                    {item.brand}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {item.origin}
                  </span>
                </div>

                {/* Image Container with high-res photo */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-neutral-100 mb-3 flex items-center justify-center">
                  <Image
                    src={item.img}
                    alt={`${item.brand} - ${item.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    quality={90}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-106"
                  />

                  {/* Laser Scan Line on Hover */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-brand-orange to-transparent opacity-0 shadow-[0_0_12px_#fc5a06] transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[scanline_2.5s_linear_infinite]" />
                </div>

                <h3 className="text-sm font-bold text-neutral-950 leading-snug group-hover:text-brand-orange transition-colors">
                  {item.name}
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              {/* Bottom verified clinical tag */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>Certified Accuracy</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Ophthalmic Partner Strip */}
        <div className="rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left pb-4 border-b border-neutral-200/60">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Ophthalmic Technology Standards
              </h4>
              <p className="text-sm font-extrabold text-neutral-900">
                Equipment Certified & Calibrated with Global Diagnostic Leaders
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-brand-orange">
              <Award size={16} />
              <span>Zero-Error Refraction Protocol</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            {BRAND_PARTNERS.map((bp) => (
              <div
                key={bp.name}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-neutral-200/60 shadow-2xs text-center"
              >
                <span className="text-xs font-bold text-neutral-900">{bp.name}</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">{bp.origin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
