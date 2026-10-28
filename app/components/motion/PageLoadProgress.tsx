"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export default function PageLoadProgress() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <div key={pathname} className="route-loader" aria-hidden="true">
      <motion.div
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 0.45, 0.82, 1], opacity: [1, 1, 1, 0] }}
        transition={{ duration: 0.72, times: [0, 0.28, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="route-loader__track"
      />
      <motion.div
        initial={{ x: "-10vw", opacity: 0 }}
        animate={{ x: "102vw", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="route-loader__lens"
      >
        <span />
        <span />
      </motion.div>
    </div>
  );
}
