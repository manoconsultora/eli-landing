"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { CirclePlay } from "lucide-react";
import VideoModal from "./VideoModal";

const PlayStoreButton = ({ dark }: { dark?: boolean }) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <>
        <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className={clsx(
                "flex h-12 min-w-0 w-full items-center justify-center rounded-full px-3 transition-all duration-300 hover:scale-105 sm:mt-3 sm:h-14 sm:min-w-[205px] sm:w-fit sm:px-6",
                {
                    "border border-[#2346DD]/20 bg-white text-[#2346DD] shadow-lg shadow-primary/12 hover:bg-white/95": dark,
                    "border border-primary/12 bg-white text-primary shadow-lg shadow-primary/10 hover:bg-surface/45": !dark,
                }
            )}
        >
                <div className="mr-2 sm:mr-3">
                    <CirclePlay className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>

                <div>
                    <div className="text-[10px] leading-tight sm:text-xs">
                        Mirá ELI en acción
                    </div>
                    <div className="-mt-0.5 font-sans text-sm font-semibold leading-tight sm:-mt-1 sm:text-xl">
                        Video
                    </div>
                </div>
            </button>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
            />
        </>
    );
};

export default PlayStoreButton;
