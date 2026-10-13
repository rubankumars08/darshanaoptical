"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Wrench,
  UserCheck,
  Calendar,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  X,
  Check,
  Glasses,
  User,
  Briefcase,
  Tag
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

// Detailed Product Interface
interface FrameProduct {
  id: string;
  brand: string;
  name: string;
  category: "Men" | "Women" | "Kids" | "Unisex";
  type: "Full Rim" | "Half Rim" | "Rimless" | "Aviator" | "Wayfarer" | "Round" | "Square" | "Cat-Eye" | "Geometric";
  material: "Acetate" | "Metal" | "Titanium" | "TR90" | "Wood" | "Mixed Material";
  color: "Black" | "Tortoise" | "Silver" | "Gunmetal" | "Rose Gold" | "Blue" | "Clear" | "Green" | "Brown" | "Gold";
  colorHex: string;
  price: number;
  specs: string;
  image: string;
  isNewArrival?: boolean;
}

const PRODUCTS_DATA: FrameProduct[] = [
  { id: "DO-101", brand: "Titan Signature", name: "Titan Signature Full Rim Acetate", category: "Men", type: "Full Rim", material: "Acetate", color: "Black", colorHex: "#1a1a1a", price: 1499, specs: "Full Rim | Black", image: "/images/frame-1.jpg" },
  { id: "DO-205", brand: "Ray-Ban", name: "Ray-Ban Aviator Gunmetal Classic", category: "Men", type: "Aviator", material: "Metal", color: "Gunmetal", colorHex: "#4a4a4a", price: 1899, specs: "Aviator | Gunmetal", image: "/images/frame-2.jpg" },
  { id: "DO-301", brand: "Tommy Hilfiger", name: "Tommy Hilfiger Amber Tortoise Square", category: "Women", type: "Square", material: "Acetate", color: "Tortoise", colorHex: "#6e4726", price: 2199, specs: "Square | Tortoise", image: "/images/frame-3.jpg" },
  { id: "DO-404", brand: "Oakley", name: "Oakley Titanium Round Silver", category: "Unisex", type: "Round", material: "Metal", color: "Silver", colorHex: "#c0c0c0", price: 1699, specs: "Round | Silver", image: "/images/frame-4.jpg" },
  { id: "DO-505", brand: "Fastrack", name: "Fastrack Urban Wayfarer Espresso", category: "Men", type: "Wayfarer", material: "TR90", color: "Brown", colorHex: "#78350f", price: 1799, specs: "Wayfarer | Brown", image: "/images/frame-5.jpg" },
  { id: "DO-601", brand: "Vogue Eyewear", name: "Vogue Eyewear Cat-Eye Rose Gold", category: "Women", type: "Cat-Eye", material: "Metal", color: "Rose Gold", colorHex: "#b76e79", price: 2399, specs: "Cat-Eye | Rose Gold", image: "/images/frame-6.jpg" },
  { id: "DO-606", brand: "Darshana Signature", name: "Darshana Crystal Clear Acetate", category: "Unisex", type: "Full Rim", material: "Acetate", color: "Clear", colorHex: "#e2e8f0", price: 1299, specs: "Transparent | Clear", image: "/images/frame-6.jpg" },
  { id: "DO-302", brand: "Carrera", name: "Carrera Sport Square Matte Blue", category: "Men", type: "Square", material: "TR90", color: "Blue", colorHex: "#1e3a8a", price: 1599, specs: "Square | Blue", image: "/images/frame-4.jpg" },
  { id: "DO-707", brand: "Vogue Eyewear", name: "Vogue Round Forest Emerald", category: "Women", type: "Round", material: "Acetate", color: "Green", colorHex: "#14532d", price: 1699, specs: "Round | Green", image: "/images/frame-1.jpg" },
  { id: "DO-808", brand: "Titan Air", name: "Titan Air Half-Rim Titanium", category: "Men", type: "Half Rim", material: "Titanium", color: "Black", colorHex: "#262626", price: 1499, specs: "Half Rim | Black", image: "/images/frame-2.jpg" },
  { id: "DO-909", brand: "Police", name: "Police Heritage Rectangle Timber", category: "Men", type: "Full Rim", material: "Wood", color: "Brown", colorHex: "#78350f", price: 1399, specs: "Rectangle | Brown", image: "/images/frame-5.jpg" },
  { id: "DO-910", brand: "Ray-Ban", name: "Ray-Ban Polarized Wayfarer", category: "Unisex", type: "Wayfarer", material: "Acetate", color: "Black", colorHex: "#000000", price: 1999, specs: "Sunglasses | Black", image: "/images/cat-sunglasses.jpg" },
  { id: "DO-111", brand: "Fastrack", name: "Fastrack Hexagon Geometric Blue", category: "Women", type: "Geometric", material: "Metal", color: "Blue", colorHex: "#2563eb", price: 2299, specs: "Geometric | Blue", image: "/images/frame-4.jpg" },
  { id: "DO-212", brand: "Silhouette", name: "Silhouette Style Rimless Silver", category: "Unisex", type: "Rimless", material: "Titanium", color: "Silver", colorHex: "#d1d5db", price: 1699, specs: "Rimless | Silver", image: "/images/frame-2.jpg" },
  { id: "DO-313", brand: "Oakley", name: "Oakley Round Woodcraft Walnut", category: "Men", type: "Round", material: "Wood", color: "Brown", colorHex: "#92400e", price: 2499, specs: "Round | Wood", image: "/images/frame-3.jpg" },
  { id: "DO-520", brand: "Prada Eyewear", name: "Prada Gradient Cat-Eye Tortoise", category: "Women", type: "Cat-Eye", material: "Acetate", color: "Brown", colorHex: "#b45309", price: 2199, specs: "Sunglasses | Brown", image: "/images/cat-premium.jpg" }
];

const NEW_ARRIVALS: FrameProduct[] = [
  { id: "DO-120", brand: "Ray-Ban", name: "Ray-Ban Titanium Stealth Black", category: "Men", type: "Full Rim", material: "Titanium", color: "Black", colorHex: "#111", price: 1599, specs: "Full Rim | Black", image: "/images/frame-1.jpg" },
  { id: "DO-221", brand: "Carrera", name: "Carrera Aviator Mirror Silver", category: "Men", type: "Aviator", material: "Metal", color: "Silver", colorHex: "#c0c0c0", price: 1899, specs: "Aviator | Silver", image: "/images/frame-2.jpg" },
  { id: "DO-320", brand: "Tommy Hilfiger", name: "Tommy Hilfiger Amber Tortoise", category: "Women", type: "Square", material: "Acetate", color: "Tortoise", colorHex: "#6e4726", price: 2199, specs: "Square | Tortoise", image: "/images/frame-3.jpg" },
  { id: "DO-421", brand: "Vogue Eyewear", name: "Vogue Minimalist Round Gold", category: "Women", type: "Round", material: "Metal", color: "Gold", colorHex: "#eab308", price: 1699, specs: "Round | Gold", image: "/images/frame-6.jpg" },
  { id: "DO-522", brand: "Fastrack", name: "Fastrack Casual Wayfarer Brown", category: "Men", type: "Wayfarer", material: "TR90", color: "Brown", colorHex: "#78350f", price: 1799, specs: "Wayfarer | Brown", image: "/images/frame-5.jpg" },
  { id: "DO-620", brand: "Titan", name: "Titan Smoked Translucent Grey", category: "Unisex", type: "Full Rim", material: "Acetate", color: "Clear", colorHex: "#94a3b8", price: 1299, specs: "Transparent | Grey", image: "/images/frame-4.jpg" }
];

const BRAND_SPOTLIGHT = [
  "ZEISS Eyewear",
  "Essilor® Frames",
  "Crizal® Optical",
  "Varilux® XR Series™",
  "Blue Cut Digital",
  "Kodak® Lenses",
  "Swiss Lens®",
  "Ray-Ban",
  "Oakley",
  "Titan",
  "Fastrack",
  "Vogue Eyewear",
  "Carrera",
  "Tommy Hilfiger",
  "Darshana Signature"
];

const CATEGORIES_NAV = [
  { title: "Men", img: "/images/model-man-glasses.jpg" },
  { title: "Women", img: "/images/avatar-priya.jpg" },
  { title: "Kids", img: "/images/cat-kids.jpg" },
  { title: "Premium", img: "/images/model-glasses-display.jpg" },
  { title: "Office & Computer", img: "/images/frame-4.jpg" },
  { title: "Sunglasses", img: "/images/cat-sunglasses.jpg" }
];

const FACE_SHAPES_DATA = [
  { name: "Round Face", tip: "Angular frames add definition", avatar: "/images/avatar-1.jpg" },
  { name: "Oval Face", tip: "Most frame shapes suit you", avatar: "/images/avatar-priya.jpg" },
  { name: "Square Face", tip: "Round or oval frames balance angles", avatar: "/images/avatar-3.jpg" },
  { name: "Heart Face", tip: "Light frames suit your features", avatar: "/images/avatar-4.jpg" },
  { name: "Diamond Face", tip: "Oval or rimless look great", avatar: "/images/avatar-5.jpg" }
];

export default function FramesPage() {
  const { openBooking } = useBooking();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(7999);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Accordion Expand States
  const [openGender, setOpenGender] = useState(true);
  const [openType, setOpenType] = useState(true);
  const [openMaterial, setOpenMaterial] = useState(true);
  const [openColor, setOpenColor] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  // New Arrivals Carousel Index
  const [carouselIdx, setCarouselIdx] = useState(0);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]));
  };

  const toggleMaterial = (m: string) => {
    setSelectedMaterials((prev) => (prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]));
  };

  const toggleColor = (c: string) => {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]));
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedTypes([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setPriceLimit(7999);
  };

  // Filter Logic
  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory && selectedCategory !== "Unisex") {
      if (selectedCategory === "Office & Computer" && p.type !== "Full Rim") return false;
      if (selectedCategory === "Sunglasses" && !p.name.includes("Sunglasses")) return false;
      if (selectedCategory === "Premium" && p.price < 2000) return false;
      if (selectedCategory === "Men" && p.category !== "Men" && p.category !== "Unisex") return false;
      if (selectedCategory === "Women" && p.category !== "Women" && p.category !== "Unisex") return false;
      if (selectedCategory === "Kids" && p.category !== "Kids") return false;
    }
    if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) return false;
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material)) return false;
    if (selectedColors.length > 0 && !selectedColors.includes(p.color)) return false;
    if (p.price > priceLimit) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    return 0;
  });

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* HERO SECTION WITH GENERATED MODEL DISPLAY */}
        <section className="relative overflow-hidden bg-[#faf8f5] py-12 sm:py-16 lg:py-20 border-b border-neutral-200/60">
          <div className="container-brand grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">
                EXPLORE OUR
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-none">
                Frames <span className="text-brand-orange">Collection</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                Discover frames that match your personality and lifestyle. Premium quality, modern designs and perfect comfort — made for you.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openBooking}
                  className="btn-primary gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Eye Test</span>
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 transition-all shadow-2xs"
                >
                  <span>Try Frames in Store</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Hero Right Visual: Generated Model Glasses Display */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-white group">
                <img
                  src="/images/model-glasses-display.jpg"
                  alt="Luxury Handcrafted Eyewear on Pedestal"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Precision Handcrafted Series</span>
                    <h3 className="text-lg font-bold">Designer Acetate & Titanium Collections</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 TOP CATEGORY CARDS STRIP */}
        <section className="py-8 bg-white border-b border-neutral-100">
          <div className="container-brand">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {CATEGORIES_NAV.map((cat) => (
                <button
                  key={cat.title}
                  onClick={() => setSelectedCategory(selectedCategory === cat.title ? "All" : cat.title)}
                  className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-neutral-50 p-3 sm:p-4 border transition-all cursor-pointer ${
                    selectedCategory === cat.title
                      ? "border-brand-orange bg-brand-orange-soft/30 ring-2 ring-brand-orange/30 shadow-sm"
                      : "border-neutral-200/80 hover:border-brand-orange/50 hover:bg-neutral-100/80"
                  }`}
                >
                  <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-white shadow-sm mb-2">
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-brand-orange transition-colors">
                    {cat.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* BRAND SPOTLIGHT MARQUEE STRIP */}
        <section className="py-4 bg-neutral-900 text-white overflow-hidden border-y border-neutral-800">
          <div className="container-brand flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-orange shrink-0">
              Authorized Eyewear Brands:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-neutral-300">
              {BRAND_SPOTLIGHT.map((b, i) => (
                <span key={b} className="flex items-center gap-2">
                  <span className="hover:text-white transition-colors cursor-pointer">{b}</span>
                  {i < BRAND_SPOTLIGHT.length - 1 && <span className="text-neutral-700">•</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN LISTING LAYOUT (FILTER SIDEBAR + PRODUCT GRID) */}
        <section className="py-10 bg-white">
          <div className="container-brand">
            {/* Top Control Bar */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950">Filter Frames</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="text-xs sm:text-sm text-neutral-500 font-medium">
                Showing 1–{sortedProducts.length} of 1200+ Frames
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-900 focus:border-brand-orange focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                </div>

                <div className="flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-brand-orange text-white" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "list" ? "bg-brand-orange text-white" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* SIDEBAR FILTERS */}
              <aside className="lg:col-span-3 space-y-6">
                {/* Gender */}
                <div className="border-b border-neutral-200/80 pb-4">
                  <button
                    onClick={() => setOpenGender(!openGender)}
                    className="flex w-full items-center justify-between py-1 text-sm font-extrabold text-neutral-950"
                  >
                    <span>Gender</span>
                    {openGender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openGender && (
                    <div className="mt-3 space-y-2 text-xs font-medium text-neutral-700">
                      {["Men", "Women", "Kids", "Unisex"].map((g) => (
                        <label key={g} className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-950">
                          <input
                            type="checkbox"
                            checked={selectedCategory === g}
                            onChange={() => setSelectedCategory(selectedCategory === g ? "All" : g)}
                            className="rounded border-neutral-300 text-brand-orange focus:ring-brand-orange"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Frame Type */}
                <div className="border-b border-neutral-200/80 pb-4">
                  <button
                    onClick={() => setOpenType(!openType)}
                    className="flex w-full items-center justify-between py-1 text-sm font-extrabold text-neutral-950"
                  >
                    <span>Frame Type</span>
                    {openType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openType && (
                    <div className="mt-3 space-y-2 text-xs font-medium text-neutral-700 max-h-48 overflow-y-auto pr-1">
                      {["Full Rim", "Half Rim", "Rimless", "Aviator", "Wayfarer", "Round", "Square", "Cat-Eye", "Geometric"].map((t) => (
                        <label key={t} className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-950">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(t)}
                            onChange={() => toggleType(t)}
                            className="rounded border-neutral-300 text-brand-orange focus:ring-brand-orange"
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Material */}
                <div className="border-b border-neutral-200/80 pb-4">
                  <button
                    onClick={() => setOpenMaterial(!openMaterial)}
                    className="flex w-full items-center justify-between py-1 text-sm font-extrabold text-neutral-950"
                  >
                    <span>Material</span>
                    {openMaterial ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openMaterial && (
                    <div className="mt-3 space-y-2 text-xs font-medium text-neutral-700">
                      {["Acetate", "Metal", "Titanium", "TR90", "Wood", "Mixed Material"].map((m) => (
                        <label key={m} className="flex items-center gap-2.5 cursor-pointer hover:text-neutral-950">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(m)}
                            onChange={() => toggleMaterial(m)}
                            className="rounded border-neutral-300 text-brand-orange focus:ring-brand-orange"
                          />
                          <span>{m}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color Swatches */}
                <div className="border-b border-neutral-200/80 pb-4">
                  <button
                    onClick={() => setOpenColor(!openColor)}
                    className="flex w-full items-center justify-between py-1 text-sm font-extrabold text-neutral-950"
                  >
                    <span>Color</span>
                    {openColor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openColor && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { name: "Black", color: "#111" },
                        { name: "Tortoise", color: "#78350f" },
                        { name: "Silver", color: "#cbd5e1" },
                        { name: "Gunmetal", color: "#475569" },
                        { name: "Rose Gold", color: "#fda4af" },
                        { name: "Blue", color: "#1e40af" },
                        { name: "Green", color: "#15803d" },
                        { name: "Brown", color: "#92400e" }
                      ].map((c) => (
                        <button
                          key={c.name}
                          onClick={() => toggleColor(c.name)}
                          title={c.name}
                          className={`h-6 w-6 rounded-full border border-neutral-300 transition-transform ${
                            selectedColors.includes(c.name) ? "ring-2 ring-brand-orange ring-offset-2 scale-110" : ""
                          }`}
                          style={{ backgroundColor: c.color }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="pb-4">
                  <button
                    onClick={() => setOpenPrice(!openPrice)}
                    className="flex w-full items-center justify-between py-1 text-sm font-extrabold text-neutral-950"
                  >
                    <span>Price Range</span>
                    {openPrice ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openPrice && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                        <span>₹499</span>
                        <span className="text-brand-orange font-bold">₹{priceLimit.toLocaleString()}+</span>
                      </div>
                      <input
                        type="range"
                        min="499"
                        max="7999"
                        step="100"
                        value={priceLimit}
                        onChange={(e) => setPriceLimit(Number(e.target.value))}
                        className="w-full accent-brand-orange cursor-pointer"
                      />
                      <button
                        onClick={() => {}}
                        className="w-full rounded-xl bg-brand-orange py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-orange-hover transition-colors cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  )}
                </div>
              </aside>

              {/* PRODUCT GRID */}
              <div className="lg:col-span-9">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedProducts.map((product) => {
                    const isLiked = wishlist.includes(product.id);
                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className={`group relative overflow-hidden rounded-2xl bg-white p-4 border border-neutral-200/80 shadow-xs transition-all duration-300 hover:border-brand-orange hover:shadow-lg ${
                          viewMode === "list" ? "flex items-center gap-6" : ""
                        }`}
                      >
                        {/* Wishlist Icon */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-400 border border-neutral-100 hover:text-brand-orange shadow-2xs transition-colors"
                        >
                          <Heart
                            size={16}
                            className={isLiked ? "fill-brand-orange text-brand-orange" : ""}
                          />
                        </button>

                        {/* Image Container with REAL optical photo */}
                        <div
                          className={`relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-50 flex items-center justify-center p-2 ${
                            viewMode === "list" ? "w-48 shrink-0 mb-0" : "mb-3"
                          }`}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold uppercase tracking-wider text-brand-orange">
                              {product.brand}
                            </span>
                            <span className="font-semibold text-neutral-400">{product.id}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-950 line-clamp-1 group-hover:text-brand-orange transition-colors">
                            {product.name}
                          </h4>
                          <div className="text-[11px] text-neutral-500 font-medium">{product.specs}</div>
                          <div className="text-sm sm:text-base font-extrabold text-neutral-950 pt-1">
                            ₹{product.price.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SMART FRAME FINDER BANNER (Middle dark section) */}
        <section className="py-12 bg-white">
          <div className="container-brand">
            <div className="relative overflow-hidden rounded-3xl bg-[#18191c] p-8 sm:p-12 text-white shadow-2xl border border-neutral-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-brand-orange">
                    FIND YOUR PERFECT MATCH
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Smart Frame Finder
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
                    Answer a few quick questions and we&apos;ll recommend the best frames for you.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/frame-finder"
                      className="btn-primary inline-flex gap-2 text-xs sm:text-sm font-bold"
                    >
                      <span>Start Frame Finder</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* 4 Feature Circles */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                  {[
                    { title: "Face Shape", icon: User },
                    { title: "Style Preference", icon: Glasses },
                    { title: "Daily Use", icon: Briefcase },
                    { title: "Budget", icon: Tag }
                  ].map((step) => {
                    const IconComp = step.icon;
                    return (
                      <div
                        key={step.title}
                        className="flex flex-col items-center justify-center rounded-2xl bg-neutral-900/90 p-4 border border-neutral-800 text-center"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange-soft/40 text-brand-orange mb-2">
                          <IconComp size={20} />
                        </div>
                        <span className="text-xs font-bold text-neutral-200">{step.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Frame Graphic */}
                <div className="lg:col-span-3 flex justify-center">
                  <div className="relative w-44 aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-white/20">
                    <img
                      src="/images/model-glasses-display.jpg"
                      alt="Smart Frame Finder & Designer Eyewear Showcase"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS CAROUSEL */}
        <section className="py-12 bg-surface-warm border-y border-neutral-200/80">
          <div className="container-brand space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-neutral-950">New Arrivals</h3>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/frames"
                  className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
                >
                  <span>View All Frames</span>
                  <ArrowRight size={14} />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCarouselIdx((prev) => Math.max(0, prev - 1))}
                    disabled={carouselIdx === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCarouselIdx((prev) => Math.min(NEW_ARRIVALS.length - 4, prev + 1))}
                    disabled={carouselIdx >= NEW_ARRIVALS.length - 4}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {NEW_ARRIVALS.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl bg-white p-3 sm:p-3.5 border border-neutral-200/80 shadow-2xs hover:border-brand-orange hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 mb-2.5 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange">
                    {product.brand}
                  </div>
                  <div className="text-xs font-bold text-neutral-950 line-clamp-1 mt-0.5">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">{product.specs}</div>
                  <div className="text-xs sm:text-sm font-extrabold text-neutral-950 pt-1">
                    ₹{product.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FIND FRAMES THAT SUIT YOUR FACE */}
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="container-brand space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                  Find Frames That Suit Your Face
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                  The right frame enhances your features and boosts your confidence.
                </p>
              </div>
              <Link
                href="/frame-finder"
                className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
              >
                <span>Explore Guide</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {FACE_SHAPES_DATA.map((shape) => (
                <div
                  key={shape.name}
                  className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 text-center space-y-3"
                >
                  <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-sm">
                    <img
                      src={shape.avatar}
                      alt={shape.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="font-bold text-neutral-950 text-sm">{shape.name}</div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">{shape.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST BADGES STRIP */}
        <section className="py-8 bg-neutral-50 border-b border-neutral-200/80">
          <div className="container-brand">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-2xs">
              {[
                { title: "100% Authentic Premium Brands", icon: <ShieldCheck size={20} className="text-brand-orange" /> },
                { title: "1 Year Warranty On All Frames", icon: <Check size={20} className="text-brand-orange" /> },
                { title: "7 Days Easy Exchange", icon: <RotateCcw size={20} className="text-brand-orange" /> },
                { title: "Free Adjustments & Cleaning", icon: <Wrench size={20} className="text-brand-orange" /> },
                { title: "Expert Styling Assistance", icon: <UserCheck size={20} className="text-brand-orange" /> }
              ].map((badge) => (
                <div key={badge.title} className="flex items-center gap-3">
                  <div className="shrink-0">{badge.icon}</div>
                  <span className="text-xs font-bold text-neutral-800 leading-tight">{badge.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHATSAPP SUPPORT STRIP */}
        <section className="py-10 bg-white">
          <div className="container-brand">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-emerald-50/80 p-6 sm:p-8 border border-emerald-200/80">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-950">
                    Need Help Choosing the Right Frame?
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium">
                    Chat with our experts on WhatsApp for quick support.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/918870571536"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs shrink-0"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
