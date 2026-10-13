"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const CATEGORIES = [
  {
    label: "Men",
    image: "/images/cat-men.jpg",
  },
  {
    label: "Women",
    image: "/images/cat-women.jpg",
  },
  {
    label: "Kids",
    image: "/images/cat-kids.jpg",
  },
  {
    label: "Premium",
    image: "/images/cat-premium.jpg",
  },
  {
    label: "Computer Use",
    image: "/images/cat-office.jpg",
  },
  {
    label: "Sunglasses",
    image: "/images/cat-sunglasses.jpg",
  },
];

export default function ShopByCategory() {
  return (
    <section id="categories" className="bg-white py-12 sm:py-16">
      <div className="container-brand space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight [text-wrap:balance]">
            Find glasses for everyone
          </h2>
          <Link
            href="/frames"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-orange hover:underline"
          >
            <span>See all frames</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Categories Grid with Staggered Entrance */}
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
          className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: EASE_STANDARD },
                },
              }}
            >
              <Link
                href="/frames"
                className="group relative block overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-2xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-orange/40"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    quality={85}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-4 w-full z-10">
                  <p className="text-sm sm:text-base font-bold text-white leading-tight">
                    {cat.label}
                  </p>
                  <span className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white/90">
                    <span>View frames</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform duration-200 group-hover:translate-x-1 text-brand-orange"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
