import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CompatibilityChart from "@/components/landing/CompatibilityChart";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import EmergencyBanner from "@/components/landing/EmergencyBanner";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <CompatibilityChart />
      <TestimonialsSection />
      <EmergencyBanner />
      <Footer />
    </div>
  );
};

export default Index;
