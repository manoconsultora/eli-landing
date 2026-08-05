import Image from "next/image"
import { ctaDetails } from "@/data/cta"

import AppStoreButton from "./AppStoreButton"
import PlayStoreButton from "./PlayStoreButton"

const CTA: React.FC = () => {
    return (
        <section id="cta" className="mt-10 mb-5 lg:my-20">
            <div className="relative z-10 mx-auto h-full w-full max-w-6xl py-12 sm:py-20">
                <div className="h-full w-full">
                    <div className="cta-surface absolute inset-0 -z-10 h-full w-full rounded-3xl">
                        <div className="cta-grid absolute inset-0 rounded-3xl"></div>
                        <div className="absolute left-10 top-8 h-16 w-16 rounded-full border border-secondary/30"></div>
                        <div className="absolute right-12 bottom-10 h-24 w-24 rounded-full bg-primary/6 blur-2xl"></div>
                    </div>

                    <div className="flex h-full flex-col items-center justify-center px-5 text-center text-foreground">
                        <h2 className="mb-4 max-w-2xl text-2xl font-black sm:text-3xl md:text-5xl md:leading-tight">
                            Tu próxima incorporación no es una persona.
                            <br />
                            <span className="mt-1 block text-5xl text-[#54eded] sm:text-6xl md:text-7xl">Es Eli.</span>
                        </h2>

                        <Image
                            src="/images/footer-ctanew.webp"
                            alt="ELI acompañando el proceso de onboarding"
                            width={720}
                            height={540}
                            quality={100}
                            className="mb-6 h-auto w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]"
                        />

                        <p className="mx-auto max-w-xl text-foreground-accent md:px-5">{ctaDetails.subheading}</p>

                        <div className="mt-4 flex flex-col sm:flex-row items-center sm:gap-4">
                        <AppStoreButton />
                        <PlayStoreButton />
                        </div>

                        <p className="mt-6 text-sm text-foreground-accent">
                            © 2026 ELI Consorcios. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTA
