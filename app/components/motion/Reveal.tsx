"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, fadeIn, clipReveal, focusReveal, viewportOnce } from "../../lib/motion";

type RevealVariant = "up" | "clip" | "focus" | "fade";

const VARIANTS = { up: fadeUp, clip: clipReveal, focus: focusReveal, fade: fadeIn };

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
};

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const chosen = prefersReduced ? fadeIn : VARIANTS[variant];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={chosen}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
