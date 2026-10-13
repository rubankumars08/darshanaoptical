"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "10K+", label: "Eye Tests Conducted" },
  { value: "12+", label: "Years of Experience" },
  { value: "6", label: "Advanced Testing Tools" },
  { value: "99%", label: "Accurate Prescriptions" },
  { value: "5000+", label: "Happy Patients" },
];

export default function EyeTestingStats() {
  return (
    <section className="border-y border-neutral-200/80 bg-white py-10">
      <div className="container-brand">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 md:gap-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="text-center group"
            >
              <div className="text-3xl font-extrabold text-brand-orange sm:text-4xl lg:text-[40px] tracking-tight transition-transform duration-300 group-hover:scale-105">
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-800">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
