"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { CirclePlay } from "lucide-react";
import VideoModal from "./VideoModal";

const PlayStoreButton = ({ dark }: { dark?: boolean }) => {
    void dark;
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <>
        <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className={clsx(
                "flex items-center justify-center min-w-[205px] mt-3 px-6 h-14 rounded-full w-full sm:w-fit transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
                {
                    "bg-[#FF0000] text-white hover:bg-[#CC0000]": true,
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