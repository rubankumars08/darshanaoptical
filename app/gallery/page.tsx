"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Camera, ZoomIn, ArrowRight } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

interface GalleryImage {
  id: string;
  title: string;
  category: "Store" | "Frames" | "Eye Testing" | "Customers" | "Behind the Scenes";
  src: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  { id: "1", title: "Darshana Optical Storefront & Entrance", category: "Store", src: "/images/store-entrance.jpg" },
  { id: "2", title: "ZEISS Progressive & ClearView Showcase", category: "Store", src: "/images/store-zeiss.jpg" },
  { id: "3", title: "Essilor® Official Eyewear Display", category: "Store", src: "/images/store-essilor.jpg" },
  { id: "4", title: "Crizal® Branded Spectacle Showcase", category: "Store", src: "/images/store-crizal.jpg" },
  { id: "5", title: "Varilux® XR Series™ Progressive & Sunglasses", category: "Store", src: "/images/store-varilux.jpg" },
  { id: "6", title: "Blue Cut Digital Screen Eyewear Display", category: "Store", src: "/images/store-bluecut.jpg" },
  { id: "7", title: "Kodak® Lenses & Swiss Lens Showcase", category: "Store", src: "/images/store-kodak-swiss.jpg" },
  { id: "8", title: "AR-810A Digital Auto Refractometer", category: "Eye Testing", src: "/images/store-refractometer.jpg" },
  { id: "9", title: "Two M Examination Chair & Precision Trial Unit", category: "Eye Testing", src: "/images/store-testing-chair.jpg" },
  { id: "10", title: "Designer Eyewear Collection", category: "Frames", src: "/images/frame-1.jpg" },
  { id: "11", title: "Matte Aviator & Metal Frames", category: "Frames", src: "/images/frame-2.jpg" },
  { id: "12", title: "Bold Tortoise Acetate Frames", category: "Frames", src: "/images/frame-3.jpg" },
  { id: "13", title: "TR90 Featherlight Series", category: "Frames", src: "/images/frame-4.jpg" },
  { id: "14", title: "Executive Wayfarer Collection", category: "Frames", src: "/images/frame-5.jpg" },
  { id: "15", title: "Rose Gold Elegance Eyewear", category: "Frames", src: "/images/frame-6.jpg" },
  { id: "16", title: "Men's Styling & Precision Fit", category: "Customers", src: "/images/avatar-1.jpg" },
  { id: "17", title: "Women's Designer Prescription", category: "Customers", src: "/images/avatar-2.jpg" },
  { id: "18", title: "Senior Progressive Lens Fit", category: "Customers", src: "/images/avatar-3.jpg" },
  { id: "19", title: "Computer Glasses Satisfaction", category: "Customers", src: "/images/avatar-4.jpg" },
  { id: "20", title: "Multi-Zone Progressive Optics", category: "Behind the Scenes", src: "/images/lens-progressive.jpg" },
];

const FILTERS = ["All", "Store", "Frames", "Eye Testing", "Customers", "Behind the Scenes"];

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  const filteredImages = GALLERY_IMAGES.filter(
    (img) => selectedFilter === "All" || img.category === selectedFilter
  );

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Camera size={14} /> Photo Showcase
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              A Look Inside Darshana Optical
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Explore our store, premium eyewear collections, state-of-the-art testing equipment, and optical experience.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-8 bg-surface-warm border-y border-neutral-200/80 sticky top-15 z-20 shadow-xs">
          <div className="container-brand">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === f
                      ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                      : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Masonry Grid */}
        <section className="py-16 bg-white">
          <div className="container-brand">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setActiveImage(img)}
                  className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200/80 shadow-sm cursor-pointer"
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-950/70 via-neutral-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6 text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange bg-white/90 px-2.5 py-0.5 rounded-full w-fit mb-2 backdrop-blur-md">
                      {img.category}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight flex items-center justify-between">
                      <span>{img.title}</span>
                      <ZoomIn size={18} className="shrink-0 text-brand-orange" />
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Section */}
        <section className="py-16 bg-surface-warm border-t border-neutral-200/80">
          <div className="container-brand text-center space-y-6 max-w-3xl">
            <a
              href="https://www.instagram.com/darshanaoptical3108/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider bg-brand-orange-soft px-4 py-2 rounded-full hover:bg-brand-orange hover:text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Camera size={16} /> @darshanaoptical3108
            </a>
            <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">See What&apos;s New on Instagram</h2>
            <p className="text-sm text-neutral-600 font-medium max-w-lg mx-auto">
              Follow our official Instagram profile for new frame arrivals, eye care tips, styling guides, and patient stories.
            </p>
            <div className="pt-2">
              <a
                href="https://www.instagram.com/darshanaoptical3108/"
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-xs font-bold"
              >
                <span>Follow @darshanaoptical3108</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Animated Lightbox Modal */}
        <AnimatePresence>
          {activeImage && (
            <div
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl w-full my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl"
              >
                <button
                  onClick={() => setActiveImage(null)}
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md z-10 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="aspect-16/10 overflow-hidden bg-black">
                  <img
                    src={activeImage.src}
                    alt={activeImage.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="p-6 bg-neutral-900 text-white flex items-center justify-between border-t border-neutral-800">
                  <div>
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                      {activeImage.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{activeImage.title}</h3>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
