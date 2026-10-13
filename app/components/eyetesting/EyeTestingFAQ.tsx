"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "appointment",
    question: "Do I need an appointment for an eye test, or can I walk in?",
    answer: "Walk-ins are always welcome at Darshana Optical! However, booking an appointment online or via phone ensures zero waiting time so our optometrist can give you undivided personal attention.",
  },
  {
    id: "duration",
    question: "How long does a comprehensive eye test take?",
    answer: "A complete computerized eye examination typically takes between 15 to 20 minutes. This includes preliminary check, automated refraction, subjective fine-tuning, and personal lens advice.",
  },
  {
    id: "what-to-bring",
    question: "What should I bring to my eye testing appointment?",
    answer: "Please bring your current pair of eyeglasses or contact lens box (if applicable), any previous prescription cards, and a list of any specific visual symptoms or daily screen hours you experience.",
  },
  {
    id: "prescriptions",
    question: "Can I receive my eye test prescription printout?",
    answer: "Yes! Upon completion of your eye examination, our optometrist will provide you with a clear, accurate, and detailed copy of your optical prescription.",
  },
  {
    id: "family-testing",
    question: "Do you offer eye testing for children and senior family members?",
    answer: "Absolutley. We provide comfortable, age-appropriate vision testing for children (ages 6+), adults, and seniors, including screening for age-related presbyopia and digital eye fatigue.",
  },
  {
    id: "purchase-obligation",
    question: "Am I required to purchase glasses or lenses after completing the eye test?",
    answer: "No, there is absolutely no obligation to buy. Our priority is your eye health and vision clarity. You are completely free to review your test results and decide at your own pace.",
  },
];

export default function EyeTestingFAQ() {
  const [openId, setOpenId] = useState<string | null>("appointment");

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-24 bg-surface-warm border-t border-neutral-200/80">
      <div className="container-brand max-w-4xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3.5 py-1.5 rounded-full">
            <HelpCircle size={14} /> Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Eye Testing FAQ
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            Everything you need to know before visiting Darshana Optical for your vision check.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl bg-white border border-neutral-200/80 shadow-sm transition-all duration-200 hover:border-brand-orange/40"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-neutral-950 pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-brand-orange text-white" : ""
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-6 pt-0 text-sm text-neutral-600 leading-relaxed font-medium border-t border-neutral-100/60 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
