"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    mass: 0.3,
  });

  return (
    <div
      aria-hidden
      className="absolute right-0 bottom-0 left-0 h-[3px] overflow-hidden bg-neutral-100/40"
    >
      {/* Left Glass Rim Icon */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center">
        <span className="h-2 w-2 rounded-full border border-brand-orange bg-white shadow-xs" />
      </div>

      {/* Progress Fill Bar */}
      <motion.div
        className="h-full origin-left bg-linear-to-r from-brand-orange via-brand-orange-hover to-amber-500 shadow-[0_0_8px_rgba(252,90,6,0.6)]"
        style={{ scaleX: progress }}
      />

      {/* Right Glass Rim Icon */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center">
        <span className="h-2 w-2 rounded-full border border-brand-orange bg-white shadow-xs" />
      </div>
    </div>
  );
}
