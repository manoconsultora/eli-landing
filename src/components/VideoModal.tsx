"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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

    const modalContent = (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/80 p-4 backdrop-blur-sm"
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
                    className="absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary transition hover:scale-105 hover:bg-secondary/90"
                >
                    <X size={22} />
                </button>

                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-surface-dark shadow-2xl shadow-primary/40">
                    <iframe
                        className="h-full w-full"
                        src="https://www.youtube.com/embed/6nhmtsxWdFo?autoplay=1&rel=0"
                        title="Video de presentación de ELI Consorcios"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
