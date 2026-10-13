"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EASE_STANDARD } from "./lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();
  const pathname = usePathname();

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.36,
        ease: EASE_STANDARD,
      }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
