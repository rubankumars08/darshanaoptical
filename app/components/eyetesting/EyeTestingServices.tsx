"use client";

import { motion } from "framer-motion";
import { Eye, Glasses, Focus, ShieldCheck, User } from "lucide-react";

const SERVICES = [
  {
    icon: Eye,
    title: "Comprehensive Eye Testing",
    description: "Complete evaluation of your vision and eye health for accurate results.",
  },
  {
    icon: Glasses,
    title: "Refraction & Prescription",
    description: "Precise refraction to determine the exact power for your glasses.",
  },
  {
    icon: Focus,
    title: "Vision Analysis",
    description: "In-depth analysis of your vision to detect issues early and accurately.",
  },
  {
    icon: ShieldCheck,
    title: "Digital Eye Health Check",
    description: "Advanced screening for eye health using modern diagnostic tools.",
  },
  {
    icon: User,
    title: "Expert Consultation",
    description: "Personalised advice and guidance from experienced eye care professionals.",
  },
];

export default function EyeTestingServices() {
  return (
    <section className="bg-surface-warm py-16 sm:py-24 border-b border-neutral-200/80">
      <div className="container-brand space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Our Eye Testing Services
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            Complete eye care solutions for you and your family.
          </p>
        </div>

        {/* 5 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative flex flex-col items-center text-center overflow-hidden rounded-2xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-orange/40"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition-colors duration-300 group-hover:bg-brand-orange-soft group-hover:text-brand-orange border border-neutral-200 group-hover:border-brand-orange/30 shadow-sm">
                  <Icon size={24} strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-bold text-neutral-950 leading-snug">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
