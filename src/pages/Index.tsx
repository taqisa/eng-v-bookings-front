
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CitiesSection from "@/components/CitiesSection";
import ServicesSection from "@/components/ServicesSection";
import ComingSoonSection from "@/components/ComingSoonSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CitiesSection />
      <ServicesSection />
      <ComingSoonSection />
      <Footer />
    </div>
  );
};

export default Index;
