import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main id="main-content">
      <Navbar />
      <HeroSection />
      <div className="section-divider" role="separator" aria-hidden="true" />
      <AboutSection />
      <div className="section-divider" role="separator" aria-hidden="true" />
      <ServicesSection />
      <div className="section-divider" role="separator" aria-hidden="true" />
      <TestimonialsSection />
      <div className="section-divider" role="separator" aria-hidden="true" />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
