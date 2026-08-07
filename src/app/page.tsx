import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing/Pricing";
import FAQ from "@/components/FAQ";
import Logos from "@/components/Logos";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Logos />
      <Container>
        <Benefits />

        <Section
          id="pricing"
          title="Planes"
          description="Desde un edificio hasta múltiples consorcios, ELI crece con vos."
        >
          <Pricing />
        </Section>

        <Section
          id="testimonials"
          title="Nosotros nos encargamos de todo."
          description="Incorporamos reglamentos, documentación y datos del consorcio para que puedas concentrarte en administrar el consorcio, no en configurar tecnología."
        >
          <Testimonials />
        </Section>

        <FAQ />

        <Stats />
        
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
