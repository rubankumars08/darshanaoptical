"use client";

import { Eye, Glasses, Layers, ShieldCheck, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const ITEMS = [
  { icon: Eye, label: "EYE TEST" },
  { icon: Glasses, label: "QUALITY FRAMES" },
  { icon: Layers, label: "ONE PAIR, ALL DISTANCES" },
  { icon: ShieldCheck, label: "SCREEN GLASSES" },
  { icon: Sun, label: "SUNGLASSES" },
];

export default function TrustStrip() {
  return (
    <div className="border-y border-neutral-200/70 bg-white py-3.5 overflow-hidden">
      <div className="container-brand">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
          className="flex flex-wrap items-center justify-center sm:justify-between gap-y-2 gap-x-4 text-xs font-bold tracking-wider text-neutral-800"
        >
          {ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: EASE_STANDARD },
                  },
                }}
                whileHover={{ scale: 1.05, y: -1 }}
                className="flex items-center gap-3 cursor-default"
              >
                <div className="flex items-center gap-2 group">
                  <Icon
                    size={16}
                    className="text-brand-orange shrink-0 transition-transform duration-300 group-hover:scale-125"
                  />
                  <span className="transition-colors group-hover:text-brand-orange">
                    {item.label}
                  </span>
                </div>
                {idx < ITEMS.length - 1 && (
                  <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-brand-orange ml-3" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
