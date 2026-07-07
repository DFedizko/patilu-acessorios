"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./animations.module.css";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<ModalSize, string> = {
    xs: "w-80 h-64",
    sm: "w-96 h-80",
    md: "w-[34rem] h-[26rem]",
    lg: "w-[44rem] h-[34rem]",
    xl: "w-[58rem] h-[42rem]",
};

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    size?: ModalSize;
    children: ReactNode;
}

export const Modal = ({ open, onOpenChange, size, children }: ModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        dialogRef.current?.focus();
    }, [open]);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") onOpenChange(false);
        };
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onOpenChange]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const sizeClass = size ? SIZE_CLASSES[size] : "";
    const shapeClass = size
        ? `${sizeClass} max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden`
        : "mx-4 w-full max-w-lg";

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center modal-overlay ${styles.overlay}`}
            onClick={() => onOpenChange(false)}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                className={`rounded-xl bg-surface shadow-pop outline-none ${shapeClass} ${styles.content}`}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};
