"use client";

import { CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
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
        cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número de tarjeta" },
        expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
        securityCode: { id: "form-checkout__securityCode", placeholder: "CVV" },
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
    <div className="mt-5 rounded-[24px] border border-[#323159]/10 bg-white p-5 sm:p-6">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="mb-5 flex items-start gap-3 rounded-[18px] bg-[#F1F4FF] p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2346DD]" aria-hidden="true" />
        <div>
          <p className="font-semibold">Pago seguro</p>
          <p className="mt-1 text-sm leading-relaxed text-[#323159]/65">
            El pago es procesado de forma segura por Mercado Pago. ELI no almacena los datos de tu tarjeta.
          </p>
        </div>
      </div>

      <div data-mp-subscription-cta="with-plan">
      {publicKey ? (
        <form id="eli-mp-subscription-form" className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Número de tarjeta</span><div id="form-checkout__cardNumber" data-mp-secure-field="cardNumber" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4 py-4" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Vencimiento</span><div id="form-checkout__expirationDate" data-mp-secure-field="expirationDate" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4 py-4" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Código de seguridad (CVV)</span><div id="form-checkout__securityCode" data-mp-secure-field="securityCode" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4 py-4" /></label>
          <input id="form-checkout__cardholderName" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4 sm:col-span-2" />
          <select id="form-checkout__issuer" data-mp-sdk-required-field="issuer" className="hidden" aria-hidden="true" />
          <select id="form-checkout__installments" data-mp-sdk-required-field="installments" className="hidden" aria-hidden="true" />
          <select id="form-checkout__identificationType" data-mp-sdk-required-field="identificationType" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4" />
          <input id="form-checkout__identificationNumber" className="min-h-14 rounded-[18px] border border-[#323159]/10 bg-[#F7F8FC] px-4" />
          <input id="form-checkout__cardholderEmail" type="email" defaultValue={email} className="hidden" readOnly />
          <button
            type="submit"
            disabled={!formReady || submitting || disabled}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[18px] bg-[#2346DD] px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55 sm:col-span-2"
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
      <p className="mt-3 min-h-5 text-sm text-red-600" aria-live="polite">{error}</p>
    </div>
  );
}
