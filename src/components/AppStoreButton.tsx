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
                "mt-3 flex h-14 min-w-[205px] w-full items-center justify-center rounded-full bg-secondary px-6 text-primary shadow-lg shadow-secondary/25 transition-all duration-300 hover:bg-secondary/90 sm:w-fit"
            )}
        >
            <div className="mr-3">
                <Rocket size={28} />
            </div>

            <div>
                <div className="text-xs">
                    Solicitá una demo
                </div>
                <div className="-mt-1 font-sans text-xl font-semibold">
                    Empezar
                </div>
            </div>
        </a>
    )
}

export default AppStoreButton
