import type { Metadata } from "next";
import { Suspense } from "react";

import SignupWizard from "@/components/SignupWizard/SignupWizard";

export const metadata: Metadata = {
  title: "Empezá con ELI",
  description: "Configurá los datos básicos de tu administración y empezá con ELI.",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<WizardLoading />}>
      <SignupWizard />
    </Suspense>
  );
}

function WizardLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#E9EEFF] px-5 text-[#323159]">
      <div className="rounded-[28px] bg-white px-8 py-6 text-sm font-semibold shadow-[0_24px_80px_rgba(35,70,221,0.12)]">
        Preparando ELI…
      </div>
    </main>
  );
}
