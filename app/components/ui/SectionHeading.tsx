"use client";

import { motion, useReducedMotion } from "framer-motion";
import Button from "./Button";

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  dark?: boolean;
};

export default function SectionHeading({
  title,
  eyebrow,
  action,
  dark = false,
}: SectionHeadingProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <div>
        {eyebrow && (
          <p
            className={`mb-3 text-xs font-bold tracking-[0.08em] uppercase ${
              dark ? "text-brand-orange" : "text-brand-orange"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: prefersReduced ? 0 : 40 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 block h-[3px] rounded-pill bg-brand-orange"
        />
        <h2
          className={`text-[28px] leading-[36px] font-bold md:text-h3 md:leading-11 ${
            dark ? "text-white" : "text-neutral-950"
          }`}
        >
          {title}
        </h2>
      </div>
      {action && (
        <Button href={action.href} variant="text" className="hidden shrink-0 sm:inline-flex">
          {action.label}
        </Button>
      )}
    </div>
  );
}
