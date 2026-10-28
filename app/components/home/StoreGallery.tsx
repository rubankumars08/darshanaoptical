"use client";

import { MapPin, Phone, MessageCircle, ArrowRight, Clock, BadgeCheck, Calendar } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";
import { useBooking } from "../booking/BookingContext";

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
  const { openBooking } = useBooking();

  return (
    <section
      id="gallery"
      className="bg-neutral-50/60 py-12 sm:py-16 border-t border-neutral-200/70"
    >
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Store Photos Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-orange border border-brand-orange/20 mb-2">
                <BadgeCheck size={13} />
                <span>EXPERIENCE IN PERSON</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight text-balance">
                Visit Our Store in Harur
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
                Explore our modern diagnostic clinic, digital lens lab, and 500+ designer frames before you visit.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5"
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
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200/90 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-orange/40 cursor-pointer"
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 250px"
                    quality={85}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-2.5 sm:p-3 z-10 pointer-events-none">
                    <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-sm leading-tight">
                      {img.title}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-medium text-orange-200 mt-0.5 line-clamp-1">
                      {img.subtitle}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Contact & Store Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_STANDARD }}
            className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Open Today • 9:30 AM – 9:00 PM</span>
              </div>
              <h3 className="text-lg font-extrabold text-neutral-950 mt-1">
                Darshana Optical & Clinic
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Authorized Essilor® & ZEISS® Dispensing Clinic
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 divide-y divide-neutral-100">
              <div className="flex items-start gap-3.5 pt-1">
                <MapPin
                  size={19}
                  className="text-brand-orange shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-bold text-neutral-900">Store Address</p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
                    Tvk nagar, Salem Bypass Road,
                    <br />
                    Opposite Vasanth &amp; Co, Harur – 636903
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3.5">
                <Clock
                  size={19}
                  className="text-brand-orange shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-bold text-neutral-900">Working Hours</p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
                    Monday to Sunday: 9:30 AM – 9:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3.5 group">
                <Phone
                  size={19}
                  className="text-brand-orange shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <div>
                  <p className="text-[11px] font-medium text-neutral-400">Direct Call</p>
                  <a
                    href="tel:+918870571536"
                    className="font-bold text-neutral-900 hover:text-brand-orange transition-colors"
                  >
                    +91 88705 71536
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3.5 group">
                <MessageCircle
                  size={19}
                  className="text-emerald-500 shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <div>
                  <p className="text-[11px] font-medium text-neutral-400">Quick Support</p>
                  <a
                    href="https://wa.me/918870571536?text=Hi%20Darshana%20Optical,%20I%20have%20an%20enquiry"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-neutral-900 hover:text-emerald-600 transition-colors"
                  >
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-orange/20 hover:bg-brand-orange-hover transition-all cursor-pointer"
              >
                <span>Get Directions (Google Maps)</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openBooking}
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs sm:text-sm font-bold text-neutral-800 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Calendar size={14} className="text-brand-orange" />
                <span>Book Free Eye Test Slot</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
