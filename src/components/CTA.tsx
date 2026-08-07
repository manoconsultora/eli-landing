"use client"

import Image from "next/image"
import { useState } from "react"
import { ctaDetails } from "@/data/cta"
import {
    ChevronDown,
    Mail,
    Paperclip,
    Send,
    Sparkles,
} from "lucide-react"

import AppStoreButton from "./AppStoreButton"
import PlayStoreButton from "./PlayStoreButton"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CTA: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [emailValue, setEmailValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
    const [submitMessage, setSubmitMessage] = useState("");
    const [categoryError, setCategoryError] = useState(false);
    const [emailError, setEmailError] = useState("");

    const hasValidEmail = EMAIL_REGEX.test(emailValue.trim());
    const showCategoryError =
        categoryError || (!activeCategory && (inputValue.trim().length > 0 || emailValue.trim().length > 0));
    const canSubmit =
        Boolean(activeCategory) &&
        Boolean(inputValue.trim()) &&
        hasValidEmail &&
        !isSubmitting;

    const handlePromptSubmit = async (prompt: string) => {
        const cleanedPrompt = prompt.trim();
        if (!cleanedPrompt) return;

        if (!activeCategory) {
            setCategoryError(true);
            setSubmitState("error");
            setSubmitMessage("Seleccioná si sos Administrador, Vecino o Inversor.");
            return;
        }

        if (!EMAIL_REGEX.test(emailValue.trim())) {
            setEmailError("Necesitamos un email válido para enviarte la confirmación.");
            setSubmitState("error");
            setSubmitMessage("Completá tu email para recibir la confirmación.");
            return;
        }

        setIsSubmitting(true);
        setSubmitState("idle");
        setSubmitMessage("");
        setCategoryError(false);
        setEmailError("");

        try {
            const response = await fetch("/api/eli-intake", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    prompt: cleanedPrompt,
                    category: activeCategory,
                    email: emailValue.trim(),
                    source: "landing-cta",
                }),
            });

            const result = (await response.json()) as {
                ok?: boolean;
                message?: string;
            };

            if (!response.ok || !result.ok) {
                throw new Error(result.message || "No pudimos enviar la consulta.");
            }

            setInputValue("");
            setEmailValue("");
            setActiveCategory("");
            setSubmitState("success");
            setSubmitMessage(result.message || "Consulta enviada correctamente.");
        } catch (error) {
            setSubmitState("error");
            setSubmitMessage(
                error instanceof Error
                    ? error.message
                    : "No pudimos enviar la consulta a la automatización."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            id="cta"
            className="relative isolate left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#f8f9fc] py-12 text-primary sm:py-16 lg:py-20"
        >
            <div className="hero-grid absolute inset-0 -z-10 opacity-80" />
            <div className="relative z-10 mx-auto h-full w-full max-w-6xl px-5">
                <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-[#54eded]/10 blur-3xl" />

                <div className="relative mx-auto max-w-5xl">
                    <div className="relative min-h-[270px] overflow-hidden rounded-[34px] border border-primary/8 bg-white px-7 pb-8 pt-10 shadow-[0_24px_70px_-42px_rgba(50,49,89,0.18)] sm:min-h-[320px] sm:px-10 lg:min-h-[360px] lg:px-14">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />

                        <div className="flex h-full items-end">
                            <div className="max-w-2xl text-left">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/8 bg-[#f6fbff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#54eded]">
                                    <Sparkles className="h-4 w-4" />
                                    ELI bot · GPT
                                </div>

                                <h2 className="mt-6 text-3xl leading-[0.96] text-primary sm:text-4xl md:text-5xl lg:text-[4rem]">
                                    <span className="font-extralight">Tu próxima incorporación </span>
                                    <span className="font-extrabold">no </span>
                                    <span className="font-extralight">es una </span>
                                    <span className="font-extrabold">persona.</span>
                                    <span className="mt-2 block font-extrabold text-[#54eded]">Es Eli.</span>
                                </h2>
                            </div>
                        </div>

                        <div className="absolute bottom-[8px] right-4 w-[180px] sm:right-8 sm:w-[220px] lg:bottom-0 lg:right-10 lg:w-[280px]">
                            <Image
                                src="/images/footer-ctanew.webp"
                                alt="ELI asomándose sobre la interfaz"
                                width={560}
                                height={560}
                                quality={100}
                                className="h-auto w-full drop-shadow-[0_22px_42px_rgba(50,49,89,0.18)]"
                            />
                        </div>
                    </div>

                    <div className="relative z-10 -mt-4 overflow-hidden rounded-[34px] border border-primary/8 bg-white px-4 py-4 shadow-[0_24px_60px_-40px_rgba(50,49,89,0.18)] sm:px-6 sm:py-5 lg:-mt-6 lg:px-7">
                        <div className="rounded-[28px] border border-primary/8 bg-white px-5 py-5 shadow-[0_16px_40px_-32px_rgba(50,49,89,0.15)]">
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handlePromptSubmit(inputValue);
                                }}
                            >
                                <label htmlFor="eli-prompt" className="sr-only">
                                    Escribile a Eli
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="eli-caret h-8 w-[2px] rounded-full bg-[#7ebdff]"></span>
                                    <input
                                        id="eli-prompt"
                                        value={inputValue}
                                        onChange={(event) => setInputValue(event.target.value)}
                                        placeholder="Dejanos tu consulta..."
                                        className="w-full border-0 bg-transparent text-lg text-primary outline-none placeholder:text-sm placeholder:text-primary/28 sm:text-2xl sm:placeholder:text-base"
                                    />
                                </div>

                                <div className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                                    emailError
                                        ? "border-[#d07a7a] bg-[#fff7f7]"
                                        : "border-primary/8 bg-white"
                                }`}>
                                    <Mail className="h-4 w-4 shrink-0 text-primary/55" />
                                    <input
                                        id="eli-email"
                                        type="email"
                                        value={emailValue}
                                        onChange={(event) => {
                                            setEmailValue(event.target.value);
                                            if (emailError) setEmailError("");
                                        }}
                                        placeholder="Tu email para responderte..."
                                        className="w-full border-0 bg-transparent text-sm text-primary outline-none placeholder:text-primary/34 sm:text-base"
                                    />
                                </div>

                                {emailError ? (
                                    <p className="mt-2 text-sm text-[#c05b5b]">
                                        {emailError}
                                    </p>
                                ) : null}

                                <div className="mt-6 sm:hidden">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center text-primary transition-colors hover:text-primary/75"
                                            onClick={() => setInputValue("")}
                                            aria-label="Usar ejemplo de consulta"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </button>

                                        <div className="relative min-w-0 flex-1">
                                            <select
                                                value={activeCategory}
                                                onChange={(event) => {
                                                    setActiveCategory(event.target.value);
                                                    if (event.target.value) setCategoryError(false);
                                                }}
                                                className={`h-14 w-full appearance-none rounded-full bg-white px-6 pr-14 text-base font-semibold text-primary outline-none transition-colors ${
                                                    showCategoryError
                                                        ? "border border-[#d07a7a] bg-[#fff7f7]"
                                                        : "border border-primary/10 focus:border-primary/30"
                                                }`}
                                                aria-label="Seleccioná una opción"
                                            >
                                                <option value="">
                                                    Seleccioná una opción
                                                </option>
                                                {ctaDetails.categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/52" />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#54eded] px-4 py-3 text-sm font-semibold text-primary shadow-[0_10px_22px_rgba(84,237,237,0.28)] transition-all hover:scale-[1.02] hover:bg-[#47d7d7] disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label="Enviar mensaje a Eli"
                                        >
                                            <Send className="h-4 w-4" />
                                            <span>{isSubmitting ? "ENVIANDO" : "SEND"}</span>
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-primary/78">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Powered by </span>
                                        <span className="font-extrabold">MANOBOT AI</span>
                                    </div>

                                    {showCategoryError ? (
                                        <p className="mt-2 text-center text-sm text-[#c05b5b]">
                                            Seleccioná si sos Administrador, Vecino o Inversor.
                                        </p>
                                    ) : null}
                                </div>

                                <div className="mt-6 hidden flex-nowrap items-center gap-3 sm:flex">
                                    <button
                                        type="button"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center text-primary transition-colors hover:text-primary/75"
                                        onClick={() => setInputValue("")}
                                        aria-label="Usar ejemplo de consulta"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>

                                    <div className="min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex">
                                        {ctaDetails.categories.map((category) => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => {
                                                    setActiveCategory(category);
                                                    setCategoryError(false);
                                                }}
                                                className={`shrink-0 rounded-full px-5 py-3 text-sm transition-colors ${
                                                    activeCategory === category
                                                        ? "bg-[#dff1ff] font-semibold text-[#3779c9]"
                                                        : showCategoryError
                                                            ? "border border-[#d07a7a] bg-[#fff7f7] font-medium text-primary/78"
                                                            : "border border-primary/10 font-medium text-primary/78 hover:bg-primary/5"
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="ml-auto flex shrink-0 items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-primary/78">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Powered by </span>
                                        <span className="font-extrabold">MANOBOT AI</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#54eded] px-4 py-3 text-sm font-semibold text-primary shadow-[0_10px_22px_rgba(84,237,237,0.28)] transition-all hover:scale-[1.02] hover:bg-[#47d7d7] disabled:cursor-not-allowed disabled:opacity-60"
                                        aria-label="Enviar mensaje a Eli"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>{isSubmitting ? "ENVIANDO" : "SEND"}</span>
                                    </button>
                                </div>

                                {showCategoryError ? (
                                    <p className="mt-3 hidden text-sm text-[#c05b5b] sm:block">
                                        Seleccioná si sos Administrador, Vecino o Inversor antes de enviar.
                                    </p>
                                ) : null}

                                {submitMessage ? (
                                    <p
                                        className={`mt-4 text-sm ${
                                            submitState === "success"
                                                ? "text-[#2f8f68]"
                                                : "text-[#c05b5b]"
                                        }`}
                                    >
                                        {submitMessage}
                                    </p>
                                ) : null}
                            </form>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h3 className="text-xl text-primary sm:text-2xl">
                            <span className="font-extralight">¿Ya estás </span>
                            <span className="font-extrabold">decidido/a?</span>
                        </h3>

                        <div className="mt-5 flex flex-col items-center justify-center sm:flex-row sm:gap-4">
                            <AppStoreButton />
                            <PlayStoreButton />
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-primary/58">
                        <p className="font-semibold text-primary">ELI Desk ™ 2026</p>
                        <p className="mt-1">Administración Inteligente de Consorcios</p>
                        <p className="mt-1">Powered by MANOBOTS™ | Todos los derechos reservados.</p>
                        <p className="mt-1">
                            Un producto de{" "}
                            <a
                                href="https://ma-no.work/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                            >
                                MANO DIGITAL CONSULTING
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTA
