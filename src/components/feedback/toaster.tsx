"use client";

import { Toaster as SonnerToaster } from "sonner";

const TOAST_CLASS =
    "flex w-full items-center gap-2 rounded-full px-5.5 py-3.5 text-sm font-semibold text-white shadow-pop";

export const Toaster = () => (
    <SonnerToaster
        position="bottom-right"
        toastOptions={{
            unstyled: true,
            classNames: {
                toast: TOAST_CLASS,
                default: "bg-ink",
                success: "bg-positive",
                error: "bg-negative",
                warning: "bg-warning",
                info: "bg-ink",
                actionButton:
                    "ml-2 shrink-0 cursor-pointer rounded-full border-none bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-white/30",
            },
        }}
    />
);
