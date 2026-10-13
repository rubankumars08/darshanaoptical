import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import TrustStrip from "./components/home/TrustStrip";
import ShopByCategory from "./components/home/ShopByCategory";
import EyeTestingFeature from "./components/home/EyeTestingFeature";
import LensSolutions from "./components/home/LensSolutions";
import ProgressiveLens from "./components/home/ProgressiveLens";
import NewArrivals from "./components/home/NewArrivals";
import OfferBanner from "./components/home/OfferBanner";
import Testimonials from "./components/home/Testimonials";
import StoreGallery from "./components/home/StoreGallery";
import CTABanner from "./components/home/CTABanner";
import WhatsAppButton from "./components/motion/WhatsAppButton";
import LensCursor from "./components/motion/LensCursor";

export default function Home() {
  return (
    <>
      <LensCursor />
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <ShopByCategory />
        <EyeTestingFeature />
        <LensSolutions />
        <ProgressiveLens />
        <NewArrivals />
        <OfferBanner />
        <Testimonials />
        <StoreGallery />
        <CTABanner />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
