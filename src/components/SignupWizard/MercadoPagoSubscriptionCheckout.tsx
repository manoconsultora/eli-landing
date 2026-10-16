"use client";

import { CreditCard, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type CardFormData = { token?: string };
type CardForm = {
  getCardFormData: () => CardFormData;
  unmount?: () => void;
};
type MercadoPagoInstance = {
  cardForm: (options: Record<string, unknown>) => CardForm;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options: { locale: string }) => MercadoPagoInstance;
  }
}

export default function MercadoPagoSubscriptionCheckout({
  amount,
  email,
  disabled,
  onToken,
}: {
  amount: string;
  email: string;
  disabled: boolean;
  onToken: (token: string) => Promise<void>;
}) {
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  const stubMode =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_MP_STUB_MODE === "true";
  const [sdkReady, setSdkReady] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [showCardBack, setShowCardBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const cardFormRef = useRef<CardForm | undefined>(undefined);
  const submittingRef = useRef(false);
  const disabledRef = useRef(disabled);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    disabledRef.current = disabled;
    onTokenRef.current = onToken;
  }, [disabled, onToken]);

  useEffect(() => {
    if (!sdkReady || !publicKey || !window.MercadoPago || cardFormRef.current) return;
    const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
    cardFormRef.current = mp.cardForm({
      amount,
      iframe: true,
      form: {
        id: "eli-mp-subscription-form",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número de tarjeta",
          style: {
            color: "#323159",
            fontFamily: "Arial, sans-serif",
            fontSize: "15px",
            fontWeight: "500",
            placeholderColor: "#7D8190",
          },
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
          style: {
            color: "#323159",
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            fontWeight: "500",
            placeholderColor: "#7D8190",
          },
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "CVV",
          style: {
            color: "#323159",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            placeholderColor: "#7D8190",
          },
        },
        cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nombre como figura en la tarjeta" },
        issuer: { id: "form-checkout__issuer" },
        installments: { id: "form-checkout__installments" },
        identificationType: { id: "form-checkout__identificationType" },
        identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Documento" },
        cardholderEmail: { id: "form-checkout__cardholderEmail" },
      },
      callbacks: {
        onFormMounted: (mountError: unknown) => {
          if (mountError) {
            setError("No pudimos cargar el formulario seguro de Mercado Pago.");
            return;
          }
          setFormReady(true);
        },
        onSubmit: async (event: Event) => {
          event.preventDefault();
          if (submittingRef.current || disabledRef.current) return;
          const token = cardFormRef.current?.getCardFormData().token;
          if (!token) {
            setError("Revisá los datos de la tarjeta.");
            return;
          }
          submittingRef.current = true;
          setSubmitting(true);
          setError(undefined);
          try {
            await onTokenRef.current(token);
          } catch (submitError) {
            setError(
              submitError instanceof Error
                ? submitError.message
                : "No pudimos iniciar la suscripción.",
            );
          } finally {
            submittingRef.current = false;
            setSubmitting(false);
          }
        },
      },
    });

    return () => {
      cardFormRef.current?.unmount?.();
      cardFormRef.current = undefined;
    };
  }, [amount, publicKey, sdkReady]);

  async function runLocalStub(status: "approved" | "rejected") {
    setSubmitting(true);
    setError(undefined);
    try {
      await onToken(`stub_${status}_token`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falló la prueba local.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <div className="mt-2 min-w-0">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="mb-5 flex items-start justify-between gap-4 text-sm leading-relaxed text-[#323159]/65">
        <div className="flex min-w-0 items-start gap-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2346DD]" aria-hidden="true" />
        <p><span className="font-semibold text-[#323159]">Pago seguro.</span> Mercado Pago procesa el pago; ELI no almacena los datos de tu tarjeta.</p>
        </div>
        <Image
          src="/images/mercadopago.svg"
          alt="Mercado Pago"
          width={28}
          height={28}
          className="h-6 w-6 shrink-0 text-[#6F7578] opacity-60 grayscale"
        />
      </div>

      <div data-mp-subscription-cta="with-plan">
      {publicKey ? (
        <form id="eli-mp-subscription-form" className="grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-center">
          <div className="mx-auto w-full max-w-[420px] lg:row-span-2 lg:my-auto">
            <div className="[perspective:1200px]">
              <div
                className="relative aspect-[1.586/1] w-full rounded-[22px] shadow-[0_18px_36px_rgba(50,49,89,0.16)] transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none"
                style={{ transform: `rotateY(${showCardBack ? 180 : 0}deg)` }}
                data-payment-card
              >
                <section
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-br from-[#F3F4F2] via-[#D9DCD9] to-[#BFC4C3] p-4 text-[#323159] sm:p-5 [backface-visibility:hidden]"
                  aria-label="Frente de la tarjeta"
                  aria-hidden={showCardBack}
                  inert={showCardBack}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-lg font-bold tracking-[0.18em] text-[#5D6266]">ELI</span>
                    <div className="relative h-8 w-10 overflow-hidden rounded-md border border-[#9AA09F]/70 bg-gradient-to-br from-[#E4E7E4] via-[#BFC5C3] to-[#9FA6A4] shadow-inner sm:h-9 sm:w-12" aria-hidden="true">
                      <span className="absolute inset-y-0 left-1/3 w-px bg-[#7F8784]/50" />
                      <span className="absolute inset-y-0 left-2/3 w-px bg-[#7F8784]/50" />
                      <span className="absolute inset-x-0 top-1/2 h-px bg-[#7F8784]/50" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p id="card-number-label" className="mb-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[#5D6266]/70">Número de tarjeta</p>
                    <div id="form-checkout__cardNumber" role="group" aria-labelledby="card-number-label" data-mp-secure-field="cardNumber" className="flex h-8 max-h-8 items-center overflow-hidden rounded-md border border-[#858C89]/45 bg-white/35 px-2.5 py-1 text-sm text-[#323159] focus-within:border-[#2346DD]/55 focus-within:ring-2 focus-within:ring-[#2346DD]/15 sm:h-9 sm:max-h-9 sm:text-base" />
                    <div className="mt-2.5 grid grid-cols-[1fr_auto] items-end gap-3 sm:mt-3">
                      <label className="min-w-0">
                        <span className="mb-1 block text-[8px] font-medium uppercase tracking-[0.14em] text-[#5D6266]/70">Titular</span>
                        <input id="form-checkout__cardholderName" placeholder="Nombre como figura en la tarjeta" autoComplete="cc-name" className="min-h-7 w-full min-w-0 border-0 border-b border-[#858C89]/45 bg-transparent px-0 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#323159] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#7D8190] focus:border-[#2346DD]/55 sm:text-xs" />
                      </label>
                      <div className="w-[76px]">
                        <p id="card-expiry-label" className="mb-1 text-[8px] font-medium uppercase tracking-[0.14em] text-[#5D6266]/70">Vence</p>
                        <div id="form-checkout__expirationDate" role="group" aria-labelledby="card-expiry-label" data-mp-secure-field="expirationDate" className="flex h-7 max-h-7 items-center overflow-hidden border-b border-[#858C89]/45 px-1 py-1 text-[10px] text-[#323159] sm:text-xs" />
                      </div>
                    </div>
                  </div>
                  <span className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full border border-white/30" aria-hidden="true" />
                </section>

                <section
                  className="absolute inset-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#D9DCD9] to-[#AEB5B2] text-[#323159] [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)" }}
                  aria-label="Reverso de la tarjeta"
                  aria-hidden={!showCardBack}
                  inert={!showCardBack}
                >
                  <div className="mt-7 h-10 bg-[#737A78] shadow-inner sm:mt-8 sm:h-12" aria-hidden="true" />
                  <div className="mx-5 mt-5 grid grid-cols-[1fr_72px] items-center gap-3 sm:mx-7 sm:grid-cols-[1fr_88px]">
                    <div className="h-8 rounded-sm bg-white/35" aria-hidden="true" />
                    <div>
                      <p id="card-cvv-label" className="mb-1 text-[8px] font-medium uppercase tracking-[0.14em] text-[#5D6266]/70">CVV</p>
                      <div id="form-checkout__securityCode" role="group" aria-labelledby="card-cvv-label" data-mp-secure-field="securityCode" className="flex h-8 max-h-8 items-center overflow-hidden rounded-sm border border-[#858C89]/45 bg-white/35 px-2 py-1 text-sm text-[#323159] focus-within:ring-2 focus-within:ring-[#2346DD]/20" />
                    </div>
                  </div>
                  <p className="absolute bottom-4 left-5 text-[9px] tracking-[0.14em] text-[#5D6266]/65 sm:left-7">ELI · PAGO SEGURO</p>
                </section>
              </div>
            </div>

            <button
              type="button"
              aria-pressed={showCardBack}
              onClick={() => setShowCardBack((current) => !current)}
              className="mx-auto mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-[#2346DD] transition hover:bg-[#F1F4FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/20"
              data-card-face-toggle
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {showCardBack ? "Volver al frente" : "Girar para ingresar el CVV"}
            </button>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1 lg:pt-0">
            <label className="text-sm font-medium text-[#323159]">
              <span className="mb-1.5 block">Tipo de documento</span>
              <select id="form-checkout__identificationType" data-mp-sdk-required-field="identificationType" className="min-h-11 w-full rounded-lg border border-[#323159]/12 bg-white px-3 text-sm outline-none focus:border-[#2346DD] focus:ring-2 focus:ring-[#2346DD]/10" />
            </label>
            <label className="text-sm font-medium text-[#323159]">
              <span className="mb-1.5 block">Número de documento</span>
              <input id="form-checkout__identificationNumber" autoComplete="off" className="min-h-11 w-full rounded-lg border border-[#323159]/12 bg-white px-3 text-sm outline-none focus:border-[#2346DD] focus:ring-2 focus:ring-[#2346DD]/10" />
            </label>
          </div>

          <select id="form-checkout__issuer" data-mp-sdk-required-field="issuer" className="hidden" aria-hidden="true" />
          <select id="form-checkout__installments" data-mp-sdk-required-field="installments" className="hidden" aria-hidden="true" />
          <input id="form-checkout__cardholderEmail" type="email" defaultValue={email} className="hidden" readOnly />
          <button
            type="submit"
            disabled={!formReady || submitting || disabled}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[16px] bg-[#2346DD] px-6 font-semibold text-white shadow-[0_12px_28px_rgba(35,70,221,0.2)] transition hover:bg-[#1939c4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2346DD]/25 disabled:cursor-not-allowed disabled:opacity-55"
            data-cardform-submit
          >
            {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
            {submitting ? "Creando suscripción…" : "Crear suscripción"}
          </button>
        </form>
      ) : stubMode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={submitting || disabled} onClick={() => runLocalStub("approved")} className="min-h-14 rounded-[18px] bg-[#2346DD] px-5 font-semibold text-white disabled:opacity-55">
            Simular aprobación local
          </button>
          <button type="button" disabled={submitting || disabled} onClick={() => runLocalStub("rejected")} className="min-h-14 rounded-[18px] border border-[#323159]/15 px-5 font-semibold">
            Simular rechazo local
          </button>
          <p className="text-xs text-[#323159]/55 sm:col-span-2">Modo stub exclusivamente local. No representa un pago Mercado Pago TEST.</p>
        </div>
      ) : (
        <p className="rounded-[18px] bg-amber-50 p-4 text-sm text-amber-900">
          Falta la Public Key TEST de Mercado Pago para cargar el formulario seguro.
        </p>
      )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600" aria-live="polite">{error}</p>}
    </div>
    </>
  );
}
