"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./animations.css";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ModalAnimation =
    | "fade"
    | "zoom"
    | "slide"
    | "slide-corner"
    | "flip-x"
    | "flip-y"
    | "rotate-in"
    | "bounce"
    | "swing"
    | "pop"
    | "blur-in"
    | "elastic"
    | "fold"
    | "glitch"
    | "drop"
    | "reveal"
    | "random";

export type ModalDirection =
    "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";

const SIZE_CLASSES: Record<ModalSize, string> = {
    xs: "w-80 h-64",
    sm: "w-96 h-80",
    md: "w-[34rem] h-[26rem]",
    lg: "w-[44rem] h-[34rem]",
    xl: "w-[58rem] h-[42rem]",
};

const ANIMATION_POOL: ModalAnimation[] = [
    "fade",
    "zoom",
    "slide",
    "slide-corner",
    "flip-x",
    "flip-y",
    "rotate-in",
    "bounce",
    "swing",
    "pop",
    "blur-in",
    "elastic",
    "fold",
    "glitch",
    "drop",
    "reveal",
];

const DIRECTION_POOL: ModalDirection[] = [
    "top-left",
    "top",
    "top-right",
    "right",
    "bottom-right",
    "bottom",
    "bottom-left",
    "left",
];

let randomCounter = 0;

const resolveRandom = (): { animation: ModalAnimation; direction: ModalDirection } => {
    const index = randomCounter;
    randomCounter += 1;
    return {
        animation: ANIMATION_POOL[index % ANIMATION_POOL.length],
        direction: DIRECTION_POOL[(index * 3 + 7) % DIRECTION_POOL.length],
    };
};

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animation?: ModalAnimation;
    direction?: ModalDirection;
    size?: ModalSize;
    children: ReactNode;
}

export const Modal = ({ open, onOpenChange, animation = "fade", direction = "bottom", size, children }: ModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [resolved] = useState(() => (animation === "random" ? resolveRandom() : { animation, direction }));

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
        document.body.style.overflow = open ? "hidden" : "";
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
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
            onClick={() => onOpenChange(false)}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                data-modal-animation={resolved.animation}
                data-modal-direction={resolved.direction}
                className={`rounded-xl bg-surface shadow-pop outline-none ${shapeClass}`}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};
