"use client";

import { ShieldCheck, Sun, Car, Feather, Glasses, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const LENSES = [
  {
    icon: ShieldCheck,
    title: "Screen-use Lenses",
    desc: "More comfort for long hours on mobile and computer",
    tag: "For screen use",
    image: "/images/lens-blue-protect.jpg",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Sun,
    title: "Sun-changing Lenses",
    desc: "Clear indoors and turns dark when you go outside",
    tag: "Changes in sunlight",
    image: "/images/lens-photochromic.jpg",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Car,
    title: "Night Driving Lenses",
    desc: "Helps reduce glare from bright vehicle headlights",
    tag: "Less glare",
    image: "/images/lens-night-drive.jpg",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Feather,
    title: "Thin & Light Lenses",
    desc: "Lighter, better-looking lenses for higher eye power",
    tag: "For high power",
    image: "/images/lens-thin-light.jpg",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Glasses,
    title: "Progressive Lenses",
    desc: "One pair for distance, computer, mobile and reading",
    tag: "One pair for all",
    image: "/images/lens-progressive-macro.jpg",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export default function LensSolutions() {
  return (
    <section id="lenses" className="bg-white py-12 sm:py-16 border-t border-neutral-100">
      <div className="container-brand space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight text-balance">
            Choose lenses for your daily needs
          </h2>
          <Link
            href="/lenses"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-orange hover:underline"
          >
            <span>See all lenses</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* 5 Lens Solution Cards with Real Product Images */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {LENSES.map((lens) => {
            const Icon = lens.icon;
            return (
              <motion.div
                key={lens.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: EASE_STANDARD },
                  },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link
                  href="/lenses"
                  className="flex flex-col h-full overflow-hidden rounded-2xl bg-neutral-50/70 p-3.5 border border-neutral-200/80 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 hover:bg-white transition-all group cursor-pointer"
                >
                  {/* Lens Visual with Tag */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-neutral-100 mb-3">
                    <Image
                      src={lens.image}
                      alt={lens.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      quality={85}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-108"
                    />
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-neutral-800 shadow-2xs">
                        {lens.tag}
                      </span>
                    </div>
                  </div>

                  {/* Header with mini icon */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md ${lens.bg} ${lens.color} shrink-0`}
                    >
                      <Icon size={14} strokeWidth={2.2} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-950 leading-tight group-hover:text-brand-orange transition-colors">
                      {lens.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-neutral-500 font-normal grow">
                    {lens.desc}
                  </p>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-brand-orange">
                    <span>Know more</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
