"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const OPEN_DELAY_MS = 700;
const WARM_GROUP_WINDOW_MS = 300;
const SIDE_OFFSET_PX = 8;

type TooltipSide = "top" | "right" | "bottom" | "left";

type TooltipPosition = { top: number; left: number };

const SIDE_TRANSFORM: Record<TooltipSide, string> = {
    top: "-translate-x-1/2 -translate-y-full",
    right: "-translate-y-1/2",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
};

let lastClosedAt = 0;

const computePosition = (rect: DOMRect, side: TooltipSide): TooltipPosition => {
    if (side === "right") return { top: rect.top + rect.height / 2, left: rect.right + SIDE_OFFSET_PX };
    if (side === "left") return { top: rect.top + rect.height / 2, left: rect.left - SIDE_OFFSET_PX };
    if (side === "bottom") return { top: rect.bottom + SIDE_OFFSET_PX, left: rect.left + rect.width / 2 };
    return { top: rect.top - SIDE_OFFSET_PX, left: rect.left + rect.width / 2 };
};

interface TooltipProps {
    content: string;
    side?: TooltipSide;
    children: ReactNode;
}

export const Tooltip = ({ content, side = "top", children }: TooltipProps) => {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const timerRef = useRef<number | null>(null);
    const [position, setPosition] = useState<TooltipPosition | null>(null);
    const show = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        const delay = Date.now() - lastClosedAt < WARM_GROUP_WINDOW_MS ? 0 : OPEN_DELAY_MS;
        timerRef.current = window.setTimeout(() => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) setPosition(computePosition(rect, side));
        }, delay);
    };
    const hide = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setPosition((previous) => {
            if (previous) lastClosedAt = Date.now();
            return null;
        });
    };
    useEffect(
        () => () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        },
        [],
    );
    useEffect(() => {
        if (!position) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") hide();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [position]);
    return (
        <span
            ref={triggerRef}
            className="contents"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {position &&
                createPortal(
                    <span
                        role="tooltip"
                        style={{ top: position.top, left: position.left }}
                        className={`pointer-events-none fixed z-50 rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-pop select-none ${SIDE_TRANSFORM[side]}`}
                    >
                        {content}
                    </span>,
                    document.body,
                )}
        </span>
    );
};
