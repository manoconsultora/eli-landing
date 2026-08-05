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
                "mt-3 flex h-14 min-w-[205px] w-full items-center justify-center rounded-full bg-[#54eded] px-6 text-white shadow-lg shadow-primary/12 transition-all duration-300 hover:bg-[#47d7d7] sm:w-fit sm:text-primary"
            )}
        >
            <div className="mr-3">
                <Rocket size={28} />
            </div>

            <div>
                <div className="text-xs">
                    Iniciar onboarding
                </div>
                <div className="-mt-1 font-sans text-xl font-semibold">
                    Comenzar ahora
                </div>
            </div>
        </a>
    )
}

export default AppStoreButton
