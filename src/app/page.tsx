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
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SignupWizard from "@/components/SignupWizard/SignupWizard";

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const authCallbackError = ["error", "error_code", "error_description"].some(
    (key) => typeof params[key] === "string" && params[key]!.length > 0,
  );
  if ((typeof params.code === "string" && params.code.length > 0) || authCallbackError) {
    return (
      <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-[#E9EEFF]">Preparando ELI…</div>}>
        <SignupWizard />
      </Suspense>
    );
  }

  return (
    <>
      <Header />
      <main>
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
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
import { Suspense } from "react";
