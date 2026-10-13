"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeIn, staggerContainer, staggerItem, viewportOnce } from "../../lib/motion";

export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={prefersReduced ? fadeIn : staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div className={className} variants={prefersReduced ? fadeIn : staggerItem}>
      {children}
    </motion.div>
  );
}
