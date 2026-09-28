"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { tiers } from "@/data/pricing";

const steps = [
  "Empecemos",
  "Primer consorcio",
  "Plan y pago",
  "Un último paso",
  "Todo listo",
] as const;

type PlanSlug = "core" | "professional";

type WizardData = {
  administrationName: string;
  responsibleName: string;
  email: string;
  buildingName: string;
  address: string;
  units: string;
  plan: PlanSlug;
};

const initialData: WizardData = {
  administrationName: "",
  responsibleName: "",
  email: "",
  buildingName: "",
  address: "",
  units: "",
  plan: "core",
};

const storageKey = "eli-signup-wizard-ui-01";

export default function SignupWizard() {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const requestedPlan = searchParams.get("plan");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<WizardData>(() => ({
    ...initialData,
    plan: requestedPlan === "professional" ? "professional" : "core",
  }));
  const [attempted, setAttempted] = useState(false);
  const [resent, setResent] = useState(false);
  const [deskNotice, setDeskNotice] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        data?: Partial<WizardData>;
        step?: number;
      };

      setData((current) => ({
        ...current,
        ...parsed.data,
        ...(requestedPlan === "core" || requestedPlan === "professional"
          ? { plan: requestedPlan }
          : {}),
      }));

      if (
        typeof parsed.step === "number" &&
        parsed.step >= 0 &&
        parsed.step < steps.length
      ) {
        setStep(parsed.step);
      }
    } catch {
      window.sessionStorage.removeItem(storageKey);
    } finally {
      setHydrated(true);
    }
  }, [requestedPlan]);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(storageKey, JSON.stringify({ data, step }));
  }, [data, hydrated, step]);

  useEffect(() => {
    if (!hydrated) return;

    const currentState = window.history.state as
      | { eliSignupStep?: number }
      | null;

    if (currentState?.eliSignupStep !== step) {
      window.history.replaceState(
        { ...currentState, eliSignupStep: step },
        "",
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      const nextStep = Number(event.state?.eliSignupStep ?? 0);
      if (nextStep < 0 || nextStep >= steps.length) return;

      setDirection(nextStep < step ? -1 : 1);
      setStep(nextStep);
      setAttempted(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrated, step]);

  const selectedPlan = useMemo(
    () => tiers.find((tier) => tier.slug === data.plan) ?? tiers[0],
    [data.plan],
  );

  const stepValid = [
    Boolean(
      data.administrationName.trim() &&
        data.responsibleName.trim() &&
        isValidEmail(data.email),
    ),
    Boolean(
      data.buildingName.trim() &&
        data.address.trim() &&
        Number(data.units) > 0,
    ),
    true,
    true,
    true,
  ][step];

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function navigate(nextStep: number, nextDirection: 1 | -1) {
    if (nextStep < 0 || nextStep >= steps.length) return;

    setDirection(nextDirection);
    setStep(nextStep);
    setAttempted(false);
    window.history.pushState(
      { ...window.history.state, eliSignupStep: nextStep },
      "",
    );
  }

  function next(event?: FormEvent) {
    event?.preventDefault();
    setAttempted(true);
    if (!stepValid || step >= steps.length - 1) return;
    navigate(step + 1, 1);
  }

  function back() {
    if (step === 0) return;
    window.history.back();
  }

  return (
    <main className="min-h-dvh bg-[#E9EEFF] p-0 text-[#323159] lg:p-4 xl:p-5">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1600px] grid-cols-1 overflow-hidden bg-white lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(320px,39%)_minmax(0,61%)] lg:gap-3 lg:rounded-[36px] lg:bg-[#E9EEFF] xl:min-h-[calc(100dvh-2.5rem)] xl:grid-cols-[minmax(360px,38%)_minmax(0,62%)] xl:gap-4">
        <EditorialPanel step={step} />

        <section className="relative -mt-7 flex min-h-[calc(100dvh-12.5rem)] flex-col overflow-hidden rounded-t-[30px] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7 sm:px-8 lg:mt-0 lg:min-h-0 lg:rounded-[32px] lg:px-10 lg:pb-8 lg:pt-8 xl:px-14 xl:pb-10 xl:pt-10">
          <Progress currentStep={step} />

          <div className="relative mx-auto flex w-full max-w-[760px] flex-1 flex-col pt-8 sm:pt-10 lg:pt-12">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial={reduceMotion ? "reduced" : "enter"}
                animate="center"
                exit={reduceMotion ? "reduced" : "exit"}
                transition={{
                  duration: reduceMotion ? 0.01 : 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-1 flex-col"
              >
                {step === 0 && (
                  <StepShell
                    title="Empecemos"
                    subtitle="Unos datos básicos y seguimos."
                  >
                    <form
                      id="signup-step-form"
                      className="grid gap-5 sm:grid-cols-2"
                      onSubmit={next}
                    >
                      <Field
                        id="administration-name"
                        label="Nombre de la administración"
                        value={data.administrationName}
                        onChange={(value) => update("administrationName", value)}
                        placeholder="Ej. Administración Norte"
                        autoComplete="organization"
                        className="sm:col-span-2"
                        error={
                          attempted && !data.administrationName.trim()
                            ? "Ingresá el nombre de la administración."
                            : undefined
                        }
                      />
                      <Field
                        id="responsible-name"
                        label="Persona responsable"
                        value={data.responsibleName}
                        onChange={(value) => update("responsibleName", value)}
                        placeholder="Nombre y apellido"
                        autoComplete="name"
                        error={
                          attempted && !data.responsibleName.trim()
                            ? "Ingresá un nombre."
                            : undefined
                        }
                      />
                      <Field
                        id="primary-email"
                        label="Email principal"
                        type="email"
                        value={data.email}
                        onChange={(value) => update("email", value)}
                        placeholder="nombre@administracion.com"
                        autoComplete="email"
                        error={
                          attempted && !isValidEmail(data.email)
                            ? "Ingresá un email válido."
                            : undefined
                        }
                      />
                    </form>
                  </StepShell>
                )}

                {step === 1 && (
                  <StepShell
                    title="Primer consorcio"
                    subtitle="Arrancamos por el primero."
                  >
                    <form
                      id="signup-step-form"
                      className="grid gap-5 sm:grid-cols-2"
                      onSubmit={next}
                    >
                      <Field
                        id="building-name"
                        label="Nombre o referencia"
                        value={data.buildingName}
                        onChange={(value) => update("buildingName", value)}
                        placeholder="Ej. Ugarte 2200"
                        className="sm:col-span-2"
                        error={
                          attempted && !data.buildingName.trim()
                            ? "Dale un nombre para reconocerlo."
                            : undefined
                        }
                      />
                      <Field
                        id="building-address"
                        label="Dirección"
                        value={data.address}
                        onChange={(value) => update("address", value)}
                        placeholder="Calle, número y localidad"
                        autoComplete="street-address"
                        error={
                          attempted && !data.address.trim()
                            ? "Ingresá la dirección."
                            : undefined
                        }
                      />
                      <Field
                        id="building-units"
                        label="Cantidad de unidades"
                        type="number"
                        min="1"
                        max="9999"
                        inputMode="numeric"
                        value={data.units}
                        onChange={(value) => update("units", value)}
                        placeholder="Ej. 48"
                        error={
                          attempted && Number(data.units) <= 0
                            ? "Ingresá al menos una unidad."
                            : undefined
                        }
                      />
                    </form>
                  </StepShell>
                )}

                {step === 2 && (
                  <StepShell
                    title="Plan y pago"
                    subtitle="La parte menos divertida. Prometemos hacerla corta."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {tiers
                        .filter((tier) => tier.action === "onboarding")
                        .map((tier) => {
                          const selected = tier.slug === data.plan;
                          return (
                            <button
                              key={tier.slug}
                              type="button"
                              onClick={() =>
                                update("plan", tier.slug as PlanSlug)
                              }
                              className={`rounded-[24px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/20 ${
                                selected
                                  ? "border-[#2346DD] bg-[#F1F4FF] shadow-[0_18px_48px_rgba(35,70,221,0.12)]"
                                  : "border-[#323159]/10 bg-white hover:border-[#2346DD]/35"
                              }`}
                              aria-pressed={selected}
                            >
                              <span className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold">
                                  {tier.slug === "professional"
                                    ? "Profesional"
                                    : tier.name}
                                </span>
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-[#2346DD] bg-[#2346DD] text-white"
                                      : "border-[#323159]/15 text-transparent"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <Check className="h-4 w-4" />
                                </span>
                              </span>
                              <span className="mt-4 block text-2xl font-semibold tracking-[-0.03em]">
                                {tier.price}
                              </span>
                              <span className="mt-1 block text-sm text-[#323159]/55">
                                por mes
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <div className="mt-5 rounded-[24px] bg-[#F7F8FC] p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <CreditCard
                          className="h-5 w-5 text-[#2346DD]"
                          aria-hidden="true"
                        />
                        <p className="font-semibold">
                          Incluido en {selectedPlan.name}
                        </p>
                      </div>
                      <ul className="mt-4 grid gap-2 text-sm text-[#323159]/70 sm:grid-cols-2">
                        {selectedPlan.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#2346DD]"
                              aria-hidden="true"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-[#323159]/50">
                      Demo visual: el pago no se procesa en esta versión.
                    </p>
                  </StepShell>
                )}

                {step === 3 && (
                  <StepShell
                    title="Un último paso"
                    subtitle="Revisá el correo y confirmá el acceso."
                  >
                    <div className="rounded-[28px] bg-[#F3F5FF] p-6 sm:p-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[#2346DD] shadow-sm">
                        <Mail className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="mt-6 text-lg font-semibold">
                        Te escribimos a
                      </p>
                      <p className="mt-1 break-all text-lg text-[#2346DD]">
                        {data.email || "nombre@administracion.com"}
                      </p>
                      <div className="mt-6 flex items-start gap-3 rounded-[20px] bg-white p-4 text-sm leading-relaxed text-[#323159]/65">
                        <Clock3
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#2346DD]"
                          aria-hidden="true"
                        />
                        <p>
                          El enlace dura 24 horas. Si se vence, podés pedir uno
                          nuevo sin empezar de cero.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResent(true)}
                        className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[18px] px-4 text-sm font-semibold text-[#2346DD] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/20"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Reenviar email
                      </button>
                      <p className="mt-2 min-h-5 text-sm text-[#323159]/55" aria-live="polite">
                        {resent
                          ? "Listo. En la demo lo dejamos anotado."
                          : "No enviaremos ningún email real."}
                      </p>
                    </div>
                  </StepShell>
                )}

                {step === 4 && (
                  <StepShell
                    title="Todo listo"
                    subtitle="ELI está listo para arrancar."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        "Administración creada",
                        "Primer consorcio cargado",
                        "Suscripción activa",
                        "Acceso habilitado",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-[22px] border border-[#323159]/8 bg-white p-4 shadow-[0_12px_30px_rgba(50,49,89,0.06)]"
                        >
                          <CheckCircle2
                            className="h-5 w-5 shrink-0 text-[#2346DD]"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-[24px] bg-[#F7F8FC] p-5 text-sm leading-relaxed text-[#323159]/60">
                      Prototipo local: estos estados son visuales y no crean
                      cuentas, suscripciones ni datos reales.
                    </div>
                  </StepShell>
                )}
              </motion.div>
            </AnimatePresence>

            <WizardNavigation
              step={step}
              onBack={back}
              onNext={() => next()}
              onDesk={() => setDeskNotice(true)}
            />

            <p
              className="mt-3 min-h-5 text-center text-xs text-[#323159]/55 lg:text-right"
              aria-live="polite"
            >
              {deskNotice
                ? "La conexión con ELI Desk llega en una próxima wave."
                : step === 4
                  ? "Sin activación ni acceso real en esta demo."
                  : "Tus datos quedan solo en este navegador durante la demo."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function EditorialPanel({ step }: { step: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <aside className="relative flex min-h-[220px] overflow-hidden bg-[#2346DD] px-6 pb-12 pt-6 text-white sm:min-h-[248px] sm:px-9 lg:min-h-0 lg:rounded-[32px] lg:px-10 lg:py-10 xl:px-12 xl:py-12">
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/15" />
      <div className="absolute -right-8 top-12 h-44 w-44 rounded-full border border-white/10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1834B4]/45 to-transparent lg:h-52" />

      {[
        {
          src: "/images/hero/e-01.webp",
          className:
            "left-[72%] w-7 sm:w-10 lg:w-14 xl:w-16",
          imageClassName: "opacity-15 sm:opacity-20 lg:opacity-25",
          restingTop: "24%",
          restingRotation: 12,
          x: [0, -18, -10, 12, 0],
          rotation: [12, 13.5, 11.5, 13, 12],
          duration: 10.8,
          delay: -7.2,
          repeatDelay: 1.4,
        },
        {
          src: "/images/hero/e-06.webp",
          className:
            "left-[12%] w-7 sm:w-9 lg:w-12 xl:w-14",
          imageClassName: "opacity-10 sm:opacity-15 lg:opacity-20",
          restingTop: "70%",
          restingRotation: -10,
          x: [0, 15, 22, 8, 0],
          rotation: [-10, -8.5, -11, -9, -10],
          duration: 13.2,
          delay: -2.8,
          repeatDelay: 2.1,
        },
        {
          src: "/images/hero/e-08.webp",
          className:
            "left-[42%] hidden w-10 sm:block lg:w-14 xl:w-16",
          imageClassName: "opacity-15 sm:opacity-20",
          restingTop: "76%",
          restingRotation: 8,
          x: [0, 20, -16, -8, 0],
          rotation: [8, 6.5, 9, 7, 8],
          duration: 8.6,
          delay: -4.9,
          repeatDelay: 2.8,
        },
      ].map((eli) => (
        <motion.div
          key={eli.src}
          className={`pointer-events-none absolute z-[1] h-auto select-none ${eli.className}`}
          aria-hidden="true"
          initial={{
            x: 0,
            top: reduceMotion ? eli.restingTop : "108%",
            rotate: eli.restingRotation,
          }}
          animate={
            reduceMotion
              ? {
                  x: 0,
                  top: eli.restingTop,
                  rotate: eli.restingRotation,
                }
              : {
                  x: eli.x,
                  top: ["108%", "76%", "40%", "4%", "-18%"],
                  rotate: eli.rotation,
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: eli.duration,
                  delay: eli.delay,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: eli.repeatDelay,
                  repeatType: "loop",
                  times: [0, 0.25, 0.5, 0.78, 1],
                }
          }
        >
          <div className="relative w-full">
            <Image
              src={eli.src}
              alt=""
              width={88}
              height={88}
              className={`relative z-10 h-auto w-full ${eli.imageClassName}`}
            />
            <span className="eli-thruster eli-thruster-left signup-wizard-thruster" />
            <span className="eli-thruster eli-thruster-right signup-wizard-thruster" />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 flex w-full flex-col lg:justify-between">
        <div className="flex items-center justify-between gap-5">
          <Link
            href="/"
            className="inline-flex items-center rounded-[12px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            aria-label="Volver a la página principal de ELI"
          >
            <Image
              src="/images/logo_eli_w.svg"
              alt="ELI"
              width={118}
              height={50}
              className="h-9 w-auto"
            />
          </Link>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            Paso {step + 1} de 5
          </span>
        </div>

        <div className="mt-7 max-w-[560px] lg:mt-0 lg:max-w-[470px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
            ELI para administraciones de Consorcios.
          </p>
          <h1 className="mt-4 max-w-[600px] text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.94] tracking-[-0.06em] lg:mt-6 lg:text-[clamp(3.2rem,5vw,4.8rem)]">
            <span className="font-extrabold">Menos</span>{" "}
            <span className="font-[100]">vueltas.</span>
            <br />
            <span className="font-extrabold">Más</span>{" "}
            <span className="font-[100]">tiempo</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-sm font-light leading-relaxed text-white/75 sm:text-base lg:mt-8 lg:text-lg">
            Con ELI de tu lado, dale importancia a lo que de verdad importa.
            Menos vueltas, menos caos. Más tiempo para administrar.
          </p>
        </div>

        <div className="mt-8 hidden grid-cols-3 gap-3 lg:grid">
          {[
            [Sparkles, "Rápido", "Cinco pasos cortos"],
            [ShieldCheck, "Claro", "Sin letra chica visual"],
            [Building2, "Simple", "Solo lo necesario"],
          ].map(([Icon, title, copy]) => (
            <div
              key={title as string}
              className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 text-white/85" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">{title as string}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">
                {copy as string}
              </p>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}

function Progress({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progreso del registro" className="mx-auto w-full max-w-[760px]">
      <div className="mb-3 flex items-center justify-between sm:hidden">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#323159]/45">
          {steps[currentStep]}
        </span>
        <span className="text-xs text-[#323159]/45">
          {currentStep + 1} / {steps.length}
        </span>
      </div>
      <ol className="flex items-start">
        {steps.map((label, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-start">
              <div className="flex w-full items-start">
                <div className="flex min-w-0 flex-col items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors sm:h-8 sm:w-8 ${
                      completed
                        ? "border-[#2346DD] bg-[#2346DD] text-white"
                        : active
                          ? "border-[#2346DD] bg-white text-[#2346DD] ring-4 ring-[#2346DD]/10"
                          : "border-[#323159]/12 bg-[#F5F6FA] text-[#323159]/38"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                    <span className="sr-only">
                      {completed ? "Completado" : active ? "Actual" : "Pendiente"}
                    </span>
                  </span>
                  <span
                    className={`hidden max-w-[110px] text-center text-[11px] leading-tight sm:block lg:text-xs ${
                      active || completed
                        ? "font-semibold text-[#323159]"
                        : "text-[#323159]/38"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <span
                    className={`mt-3.5 h-px flex-1 sm:mt-4 ${
                      index < currentStep ? "bg-[#2346DD]" : "bg-[#323159]/10"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-7 sm:mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2346DD]">
          Registro ELI
        </p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.045em] text-[#323159]">
          {title}
        </h2>
        <p className="mt-2 max-w-[580px] text-base leading-relaxed text-[#323159]/58 sm:text-lg">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  type = "text",
  ...inputProps
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "email" | "tel" | "url";
  min?: string;
  max?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-14 w-full rounded-[18px] border bg-[#F7F8FC] px-4 text-base text-[#323159] outline-none transition placeholder:text-[#323159]/32 focus:border-[#2346DD] focus:bg-white focus:ring-4 focus:ring-[#2346DD]/10 ${
          error ? "border-red-500" : "border-[#323159]/10"
        }`}
        {...inputProps}
      />
      <p
        id={errorId}
        className="mt-1.5 min-h-5 text-xs text-red-600"
        aria-live="polite"
      >
        {error}
      </p>
    </div>
  );
}

function WizardNavigation({
  step,
  onBack,
  onNext,
  onDesk,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onDesk: () => void;
}) {
  const nextLabels = [
    "Continuar",
    "Continuar",
    "Continuar al pago",
    "Ya confirmé",
  ];

  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-8 flex items-center justify-between gap-3 border-t border-[#323159]/8 bg-white/96 px-5 pb-1 pt-4 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mt-10 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:backdrop-blur-none">
      {step === 0 ? (
        <Link
          href="/"
          className="inline-flex min-h-14 items-center gap-2 rounded-[18px] px-3 text-sm font-semibold text-[#323159]/60 transition hover:bg-[#F5F6FA] hover:text-[#323159] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/20 sm:px-5"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Volver</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-14 items-center gap-2 rounded-[18px] px-3 text-sm font-semibold text-[#323159]/60 transition hover:bg-[#F5F6FA] hover:text-[#323159] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/20 sm:px-5"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Atrás</span>
        </button>
      )}

      {step < steps.length - 1 ? (
        <button
          type={step <= 1 ? "submit" : "button"}
          form={step <= 1 ? "signup-step-form" : undefined}
          onClick={step <= 1 ? undefined : onNext}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[18px] bg-[#2346DD] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(35,70,221,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1D3BC4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/25 motion-reduce:transform-none sm:px-7"
        >
          {nextLabels[step]}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onDesk}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[18px] bg-[#2346DD] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(35,70,221,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1D3BC4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/25 motion-reduce:transform-none sm:px-7"
        >
          Entrar a ELI Desk
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction > 0 ? 72 : -72,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 1 | -1) => ({
    x: direction > 0 ? -72 : 72,
    opacity: 0,
  }),
  reduced: { x: 0, opacity: 0 },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
