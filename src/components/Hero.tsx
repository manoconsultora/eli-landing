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
                <div className="mx-auto mt-6 flex w-full max-w-[320px] flex-col items-center sm:w-fit sm:max-w-none sm:flex-row sm:gap-4">
                    <AppStoreButton dark />
                    <PlayStoreButton dark />
                </div>
                <Image
                    src={heroDetails.centerImageSrc}
                    width={384}
                    height={340}
                    quality={100}
                    sizes="(max-width: 768px) 100vw, 384px"
                    priority={true}
                    unoptimized={true}
                    alt="app mockup"
                    className="hero-device-shadow relative z-10 mx-auto mt-12 h-auto w-full max-w-[384px] md:mt-16"
                />
            </div>
        </section>
    );
};

export default Hero;
