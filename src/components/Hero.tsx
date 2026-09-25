import React from 'react';
import Image from 'next/image';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';

import { heroDetails } from '@/data/hero';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="hero-surface relative flex items-center justify-center overflow-x-clip px-5 pb-0 pt-40 text-foreground md:pt-40"
        >
            <div className="absolute inset-0 z-0 w-full">

                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
                    style={{ backgroundImage: "url('/images/3dbuildings.webp')" }}
                />
                <div className="hero-grid absolute inset-0 h-full w-full opacity-40">
                    <div className="hero-top-glow absolute inset-x-0 top-0 h-72" />
                    <div className="absolute right-12 top-24 h-36 w-36 rounded-full border border-primary/12" />
                    <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-one absolute left-[16%] bottom-[12%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-01.webp"
                        alt=""
                        width={120}
                        height={120}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-two absolute left-[72%] bottom-[8%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-02.webp"
                        alt=""
                        width={120}
                        height={120}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-three absolute left-[34%] bottom-[4%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-03.webp"
                        alt=""
                        width={120}
                        height={120}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-four absolute left-[84%] bottom-[16%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-04.webp"
                        alt=""
                        width={120}
                        height={120}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-five absolute left-[7%] bottom-[2%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-05.webp"
                        alt=""
                        width={140}
                        height={140}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-six absolute left-[48%] bottom-[6%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-06.webp"
                        alt=""
                        width={140}
                        height={140}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-seven absolute left-[61%] bottom-[1%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-07.webp"
                        alt=""
                        width={140}
                        height={140}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div
                aria-hidden="true"
                className="mini-eli mini-eli-eight absolute left-[91%] bottom-[10%] z-[5] pointer-events-none"
            >
                <div className="relative">
                    <Image
                        src="/images/hero/e-08.webp"
                        alt=""
                        width={140}
                        height={140}
                        className="relative z-10 h-auto w-full"
                    />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-nine absolute left-[3%] bottom-[5%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-01.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-ten absolute left-[22%] bottom-[1%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-02.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-eleven absolute left-[39%] bottom-[8%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-03.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-twelve absolute left-[55%] bottom-[3%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-04.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-thirteen absolute left-[69%] bottom-[6%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-05.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-fourteen absolute left-[80%] bottom-[2%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-06.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-fifteen absolute left-[92%] bottom-[10%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-07.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div aria-hidden="true" className="mini-eli mini-eli-sixteen absolute left-[31%] bottom-[12%] z-[5] pointer-events-none">
                <div className="relative">
                    <Image src="/images/hero/e-08.webp" alt="" width={120} height={120} className="relative z-10 h-auto w-full" />
                    <span className="eli-thruster eli-thruster-left" />
                    <span className="eli-thruster eli-thruster-right" />
                    <span className="eli-smoke" />
                </div>
            </div>

            <div className="relative z-20 w-full text-center">
                <h1 className="mx-auto max-w-lg text-4xl leading-tight text-foreground md:max-w-2xl md:text-6xl">
                    <span className="font-[100]">Dejá el </span>
                    <span className="font-[800]">caos</span>
                    <span className="font-[100]"> atrás,</span>
                    <br />
                    <span className="font-[800]">Administrá </span>
                    <span className="font-[100]">consorcios</span>
                </h1>
                <p className="mx-auto mt-7 max-w-lg text-foreground/78">{heroDetails.subheading}</p>
                <div className="relative z-20 mx-auto mt-8 grid w-full max-w-[300px] grid-cols-2 gap-3 sm:mt-6 sm:flex sm:w-fit sm:max-w-none sm:items-center sm:justify-center sm:gap-3">
                    <AppStoreButton dark />
                    <PlayStoreButton dark />
                </div>
                <div className="hero-bubble-float relative z-20 mx-auto mt-12 -mb-12 flex w-fit flex-col items-center sm:mt-6 sm:-mb-8">
                    <div className="relative rounded-[2rem] bg-white px-6 py-4 text-center text-base font-semibold leading-tight text-primary shadow-xl shadow-primary/12 sm:px-5 sm:py-3 sm:text-sm">
                        Hola! Soy Eli,
                        <br />
                        Arrancamos?
                    </div>
                    <div className="-mt-1.5 h-5 w-5 rounded-full bg-white shadow-md sm:h-4 sm:w-4" />
                    <div className="mt-1 h-3 w-3 rounded-full bg-white shadow-sm sm:h-2.5 sm:w-2.5" />
                </div>
                <div className="hero-main-eli pointer-events-none relative z-10 mx-auto -mb-16 mt-0 w-[min(92vw,620px)] max-w-none -translate-y-[120px] sm:-mb-[clamp(30px,5vw,74px)] sm:mt-[clamp(8px,1.8vw,18px)]">
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-[10%] top-[14%] z-0 h-[52%] rounded-full bg-primary/18 blur-[72px] sm:inset-x-[12%] sm:top-[18%] sm:h-[48%] sm:blur-[96px]"
                    />
                    <Image
                        src={heroDetails.centerImageSrc}
                        width={620}
                        height={550}
                        quality={100}
                        sizes="(max-width: 768px) 92vw, 620px"
                        priority={true}
                        unoptimized={true}
                        alt="app mockup"
                        className="hero-device-shadow relative z-10 mx-auto h-auto w-full"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
