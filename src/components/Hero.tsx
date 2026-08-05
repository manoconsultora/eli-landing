import React from 'react';
import Image from 'next/image';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';

import { heroDetails } from '@/data/hero';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="hero-surface relative flex items-center justify-center overflow-x-clip px-5 pb-0 pt-32 text-foreground md:pt-40"
        >
            <div className="absolute left-0 top-0 bottom-0 -z-10 w-full">
                <div className="hero-grid absolute inset-0 h-full w-full">
                    <div className="hero-top-glow absolute inset-x-0 top-0 h-72" />
                    <div className="absolute right-12 top-24 h-36 w-36 rounded-full border border-primary/12" />
                    <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
                </div>
            </div>

            <div className="hero-bottom-fade absolute bottom-0 left-0 right-0 h-40 backdrop-blur-[2px]" />

            <div className="w-full text-center">
                <h1 className="mx-auto max-w-lg text-4xl font-bold text-foreground md:max-w-2xl md:text-6xl md:leading-tight">{heroDetails.heading}</h1>
                <p className="mx-auto mt-4 max-w-lg text-foreground/78">{heroDetails.subheading}</p>
                <div className="relative z-20 mx-auto -mt-3 flex w-full max-w-[320px] flex-col items-center sm:mt-6 sm:w-fit sm:max-w-none sm:flex-row sm:gap-4">
                    <AppStoreButton dark />
                    <PlayStoreButton dark />
                </div>
                <div className="pointer-events-none relative z-10 mx-auto -mb-16 -mt-12 w-[min(92vw,620px)] max-w-none sm:-mb-[clamp(30px,5vw,74px)] sm:mt-[clamp(8px,1.8vw,18px)]">
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
