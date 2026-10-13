"use client";

import { motion } from "framer-motion";
import { Users, Settings, User, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Experienced Optometrists",
    desc: "Trained professionals with years of expertise in eye care.",
  },
  {
    icon: Settings,
    title: "State-of-the-Art Equipment",
    desc: "Latest technology for precise diagnosis and better outcomes.",
  },
  {
    icon: User,
    title: "Personalised Care",
    desc: "Tailored solutions for your unique eye care needs.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent & Honest",
    desc: "Clear advice and pricing with complete transparency.",
  },
];

export default function WhyDarshana() {
  return (
    <section className="py-16 sm:py-24 bg-surface-warm border-y border-neutral-200/80">
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (Content) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 space-y-4"
          >
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange">
              WHY DARSHANA OPTICAL?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Trusted Eye Care For Every Generation
            </h2>
            <p className="text-base text-neutral-600 font-medium leading-relaxed pt-2">
              At Darshana Optical, we combine expertise, technology and compassion to deliver exceptional eye care experiences.
            </p>
          </motion.div>

          {/* Right Column (Grid) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="flex gap-4 p-2"
                >
                  <div className="flex shrink-0 items-start pt-1 text-neutral-700">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
