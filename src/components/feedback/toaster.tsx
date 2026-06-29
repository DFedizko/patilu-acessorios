"use client";

import { Toaster as SonnerToaster } from "sonner";

const TOAST_CLASS =
    "flex w-full items-center gap-2 rounded-full px-5.5 py-3.5 text-sm font-semibold text-white shadow-[0_1rem_2.5rem_rgba(20,12,40,0.4)]";

export const Toaster = () => (
    <SonnerToaster
        position="bottom-center"
        toastOptions={{
            unstyled: true,
            classNames: {
                toast: TOAST_CLASS,
                default: "bg-dark",
                success: "bg-good",
                error: "bg-danger",
                warning: "bg-warn",
                info: "bg-dark",
            },
        }}
    />
);
