"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VideoModal({
    isOpen,
    onClose,
}: VideoModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[390px]"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar video"
                    className="absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                >
                    <X size={22} />
                </button>

                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-2xl">
                    <iframe
                        className="h-full w-full"
                        src="https://www.youtube.com/embed/XJJ6BfSuYRA?autoplay=1&rel=0"
                        title="Video de presentación de ELI Consorcios"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}