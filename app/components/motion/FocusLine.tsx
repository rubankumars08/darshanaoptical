"use client";

import { motion } from "framer-motion";
import { viewportOnce, EASE_STANDARD } from "../../lib/motion";

interface FocusLineProps {
  className?: string;
}

export default function FocusLine({ className = "" }: FocusLineProps) {
  return (
    <motion.span
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: 40, opacity: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 0.55, ease: EASE_STANDARD }}
      className={`inline-block h-[3px] rounded-pill bg-brand-orange align-middle ${className}`}
    />
  );
}
