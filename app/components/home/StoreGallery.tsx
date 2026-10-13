"use client";

import { MapPin, Phone, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const STORE_IMAGES = [
  {
    title: "Store Entrance & Clinic",
    subtitle: "Authorized Essilor® Partner",
    src: "/images/store-entrance.jpg",
  },
  {
    title: "ZEISS ClearView & Progressive",
    subtitle: "German Precision Optics",
    src: "/images/store-zeiss.jpg",
  },
  {
    title: "Essilor® Eyewear Showcase",
    subtitle: "Designer Optical Frames",
    src: "/images/store-essilor.jpg",
  },
  {
    title: "Crizal® Showcase",
    subtitle: "500+ Branded Optical Frames",
    src: "/images/store-crizal.jpg",
  },
  {
    title: "Varilux® XR Series™",
    subtitle: "Advanced Progressives & Shades",
    src: "/images/store-varilux.jpg",
  },
  {
    title: "Blue Cut Digital Lenses",
    subtitle: "Anti-Fatigue Computer Eyewear",
    src: "/images/store-bluecut.jpg",
  },
  {
    title: "Kodak & Swiss Lens",
    subtitle: "Superior HD Clarity & Frames",
    src: "/images/store-kodak-swiss.jpg",
  },
  {
    title: "AR-810A Auto Refractometer",
    subtitle: "Digital Computerised Testing",
    src: "/images/store-refractometer.jpg",
  },
];

export default function StoreGallery() {
  return (
    <section
      id="gallery"
      className="bg-white py-12 sm:py-16 border-t border-neutral-100"
    >
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Store Photos */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight [text-wrap:balance]">
                Visit Our Store
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
                See our store before you visit
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >
              {STORE_IMAGES.map((img) => (
                <motion.div
                  key={img.title}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.45, ease: EASE_STANDARD },
                    },
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200 shadow-2xs cursor-pointer"
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 250px"
                    quality={85}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-2 sm:p-2.5 z-10 pointer-events-none">
                    <span className="text-[11px] font-bold text-white drop-shadow-sm leading-tight">
                      {img.title}
                    </span>
                    <span className="text-[9px] font-medium text-orange-200/90 mt-0.5 line-clamp-1">
                      {img.subtitle}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Contact & Store Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_STANDARD }}
            className="lg:col-span-4 bg-neutral-50 p-6 sm:p-7 rounded-2xl border border-neutral-200/80 space-y-6 shadow-xs"
          >
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-3.5">
                <MapPin
                  size={20}
                  className="text-brand-orange shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-bold text-neutral-950">Darshana Optical</p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
                    Tvk nagar, salem bypass road, Vasanth & co opposite,
                    <br />
                    Harur – 636903
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <Phone
                  size={20}
                  className="text-brand-orange shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <a
                  href="tel:+918870571536"
                  className="font-medium text-neutral-800 hover:text-brand-orange transition-colors"
                >
                  +91 88705 71536
                </a>
              </div>

              <div className="flex items-center gap-3.5 group">
                <MessageCircle
                  size={20}
                  className="text-brand-orange shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <a
                  href="https://wa.me/918870571536"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-neutral-800 hover:text-brand-orange transition-colors"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>

            <div className="pt-2">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-orange/40 bg-white py-3 text-xs sm:text-sm font-bold text-brand-orange shadow-xs hover:bg-brand-orange hover:text-white transition-all cursor-pointer"
              >
                <span>Get Directions</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
