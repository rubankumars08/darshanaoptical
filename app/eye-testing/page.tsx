"use client";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

import EyeTestingHero from "../components/eyetesting/EyeTestingHero";
import EyeTestingStats from "../components/eyetesting/EyeTestingStats";
import EyeTestingServices from "../components/eyetesting/EyeTestingServices";
import VisitTimeline from "../components/eyetesting/VisitTimeline";
import WhyDarshana from "../components/eyetesting/WhyDarshana";
import EquipmentShowcase from "../components/eyetesting/EquipmentShowcase";
import EyeTestingCTA from "../components/eyetesting/EyeTestingCTA";
import Testimonials from "../components/home/Testimonials";
import VisitUsStrip from "../components/layout/VisitUsStrip";

export default function EyeTestingPage() {
  const { openBooking } = useBooking();

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1">
        <EyeTestingHero onBookClick={openBooking} />
        <EyeTestingStats />
        <EyeTestingServices />
        <VisitTimeline />
        <WhyDarshana />
        <EquipmentShowcase />
        <EyeTestingCTA onBookClick={openBooking} />
        <Testimonials />
        <VisitUsStrip />
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
