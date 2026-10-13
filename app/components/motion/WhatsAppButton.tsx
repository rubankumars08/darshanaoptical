"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const tipShown = useRef(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.4 && !tipShown.current) {
      tipShown.current = true;
      setShowTip(true);
      setTimeout(() => setShowTip(false), 3500);
    }
  });

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-2 sm:right-8 sm:bottom-8">
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
          >
            Need help choosing a frame?
            <button
              aria-label="Dismiss"
              onClick={() => setShowTip(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href="https://wa.me/918870571536"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl hover:bg-emerald-500 transition-colors"
      >
        <FaWhatsapp size={28} />
      </motion.a>
    </div>
  );
}
