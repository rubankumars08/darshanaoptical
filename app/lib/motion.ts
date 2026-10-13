import type { Variants, Transition } from "framer-motion";

// Motion tokens — Darshana Optical "focus -> clarity -> reveal" system.
export const EASE_STANDARD: Transition["ease"] = [0.22, 1, 0.36, 1];

export const DURATION = {
  fast: 0.18,
  default: 0.28,
  reveal: 0.55,
  large: 0.75,
  story: 0.9,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_STANDARD },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: DURATION.reveal, ease: EASE_STANDARD },
  },
};

export const focusReveal: Variants = {
  hidden: { opacity: 0, scale: 1.06, filter: "blur(10px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: DURATION.large, ease: EASE_STANDARD },
  },
};

export const clipReveal: Variants = {
  hidden: { clipPath: "inset(8% 8% 8% 8% round 24px)", opacity: 0.4 },
  show: {
    clipPath: "inset(0% 0% 0% 0% round 24px)",
    opacity: 1,
    transition: { duration: DURATION.large, ease: EASE_STANDARD },
  },
};

export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_STANDARD },
  },
};

export const viewportOnce = { once: true, amount: 0.2 };
export const viewportBidirectional = { once: false, amount: 0.2 };
