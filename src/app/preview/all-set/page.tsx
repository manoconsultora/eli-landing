import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const steps = [
  "Empecemos",
  "Verificar email",
  "Primer consorcio",
  "Checkout",
  "Procesando pago",
  "Confirmación",
];

const bubbles = [
  { position: "left-[3%] top-[60%]", color: "bg-[#CFF5E8]/90 text-[#28765E]", rotate: "-rotate-12" },
  { position: "left-[18%] top-[45%]", color: "bg-[#D9E9FF]/90 text-[#315DA0]", rotate: "rotate-6" },
  { position: "left-[56%] top-[46%]", color: "bg-[#E9DFFF]/90 text-[#6B4EA0]", rotate: "-rotate-6" },
  { position: "left-[78%] top-[64%]", color: "bg-[#FFF0C9]/90 text-[#927022]", rotate: "rotate-12" },
  { position: "left-[67%] top-[73%]", color: "bg-[#FFE0DB]/90 text-[#A84E45]", rotate: "-rotate-12" },
];

export default function AllSetPreviewPage() {
  if (process.env.VERCEL_ENV !== "preview") notFound();

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-white px-5 pb-8 pt-5 text-[#323159] sm:px-10 sm:pt-8 lg:px-[8.5%]">
      <nav aria-label="Progreso del registro" className="relative z-10 mx-auto w-full max-w-[1240px]">
        <ol className="grid grid-cols-6 items-start">
          {steps.map((label, index) => {
            const complete = index < steps.length - 1;
            const current = index === steps.length - 1;

            return (
              <li key={label} className="relative flex flex-col items-center text-center">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-1/2 top-5 h-px w-full ${complete ? "bg-[#2346DD]" : "bg-[#E4E5EC]"}`}
                  />
                )}
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm ${
                    complete
                      ? "bg-[#2346DD] text-white"
                      : current
                        ? "border border-[#2346DD] text-[#2346DD] ring-4 ring-[#2346DD]/10"
                        : "bg-[#F2F3F7] text-[#8E8FA5]"
                  }`}
                >
                  {complete ? <Check className="h-5 w-5" /> : index + 1}
                </span>
                <span className="mt-2 hidden text-xs font-medium sm:block sm:text-sm">{label}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="relative z-10 mx-auto mt-12 w-full max-w-[1240px] sm:mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2346DD]">REGISTRO ELI</p>
        <h1 className="mt-5 whitespace-nowrap text-[clamp(4rem,13vw,9rem)] leading-[0.88] tracking-[-0.08em] text-[#2346DD]">
          <span className="font-extrabold">All</span>
          <span className="font-thin"> Set!</span>
        </h1>
      </section>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <span
            key={bubble.position}
            className={`absolute z-10 inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold tracking-wide shadow-[0_8px_20px_rgba(50,49,89,0.12)] ${bubble.position} ${bubble.rotate} ${bubble.color}`}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
            OK
          </span>
        ))}
        <Image
          src="/images/eli_arm.webp"
          alt=""
          width={1312}
          height={1199}
          priority
          className="absolute bottom-0 left-0 h-[58vh] w-auto max-w-[72vw] object-contain object-bottom-left sm:h-[70vh]"
        />
      </div>
    </main>
  );
}
