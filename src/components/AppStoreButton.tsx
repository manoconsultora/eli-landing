import React from 'react'
import clsx from 'clsx'
import { Rocket } from "lucide-react";

import { ctaDetails } from '@/data/cta'

const AppStoreButton = ({ dark }: { dark?: boolean }) => {
    void dark;
    return (
        <a
            href={ctaDetails.appStoreUrl}
            className={clsx(
                "flex h-12 min-w-0 w-full items-center justify-center rounded-full bg-[#2346DD] px-3 text-white shadow-lg shadow-primary/12 transition-all duration-300 hover:bg-[#1f3fc7] sm:mt-3 sm:h-14 sm:min-w-[205px] sm:w-fit sm:px-6 sm:text-white"
            )}
        >
            <div className="mr-2 sm:mr-3">
                <Rocket className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>

            <div>
                <div className="text-[10px] leading-tight text-white sm:text-xs">
                    Iniciar onboarding
                </div>
                <div className="-mt-0.5 font-sans text-sm font-semibold leading-tight sm:-mt-1 sm:text-xl">
                    Comenzar
                </div>
            </div>
        </a>
    )
}

export default AppStoreButton
