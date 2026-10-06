import GlowSpotlight from "./components/GlowSpotlight";
import HeroSection from "./components/HeroSection";
import BenefitsSection from "./components/BenefitsSection";
import ServicesSection from "./components/ServicesSection";
import PlanSection from "./components/PlanSection";
import ProcessSection from "./components/ProcessSection";
import CriteriaSection from "./components/CriteriaSection";
import FaqSection from "./components/FaqSection";
import ContactSection from "./components/ContactSection";
import FooterSection from "./components/FooterSection";

export default function Home() {
  return (
    <div className="relative font-sans min-h-screen overflow-x-hidden">
      {/* Subtle Background with Spotlight */}
      <GlowSpotlight />

      {/* Hero Section — Figma "Inicio" frame (node 4:14123) */}
      <HeroSection />

      {/* Beneficios — Figma azul frame (DT 4:14203 · MB 4:14557) */}
      <BenefitsSection />

      {/* Servicios — Figma azul frame (DT 4:14232 · MB 4:14586) */}
      <ServicesSection />

      {/* Plan integral — Figma azul frame (DT 4:14271 · MB 4:14625) */}
      <PlanSection />

      {/* Process Section */}
      <ProcessSection />

      {/* Criterios de calidad — Figma azul frame (DT 4:14351 · MB 4:14704) */}
      <CriteriaSection />

      {/* Preguntas frecuentes — Figma azul frame (DT 4:14380 · MB 4:14733) */}
      <FaqSection />

      {/* Contacto de proyecto — Figma azul frame (DT 4:14419 · MB 4:14772) */}
      <ContactSection />

      {/* Pie de página — Figma azul frame (DT 4:14461 · MB 4:14811) */}
      <FooterSection />
    </div>
  );
}
