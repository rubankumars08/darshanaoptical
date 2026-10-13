"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export default function PageLoadProgress() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <motion.div
      key={pathname}
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{
        scaleX: [0, 0.4, 0.8, 1],
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        duration: 0.65,
        times: [0, 0.3, 0.7, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ originX: 0 }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-100 bg-linear-to-r from-brand-orange via-orange-400 to-amber-400 shadow-[0_0_12px_rgba(252,90,6,0.85)] pointer-events-none"
    />
  );
}
