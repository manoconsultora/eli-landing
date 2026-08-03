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
                "mt-3 flex h-14 min-w-[205px] w-full items-center justify-center rounded-full px-6 transition-all duration-300 hover:scale-105 sm:w-fit",
                {
                    "border border-primary/18 bg-primary text-secondary shadow-lg shadow-primary/20 hover:bg-primary/92": dark,
                    "border border-primary/12 bg-white text-primary shadow-lg shadow-primary/10 hover:bg-surface/45": !dark,
                }
            )}
        >
                <div className="mr-3">
                    <CirclePlay size={28} />
                </div>

                <div>
                    <div className="text-xs">
                        Mirá ELI en acción
                    </div>
                    <div className="-mt-1 font-sans text-xl font-semibold">
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
