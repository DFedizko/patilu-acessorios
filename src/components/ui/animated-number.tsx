"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 400;

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface AnimatedNumberProps {
    value: number;
    format: (value: number) => string;
}

export const AnimatedNumber = ({ value, format }: AnimatedNumberProps) => {
    const [display, setDisplay] = useState(value);
    const displayRef = useRef(value);
    const frameRef = useRef<number | null>(null);
    const mountedRef = useRef(false);
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        if (prefersReducedMotion() || displayRef.current === value) {
            displayRef.current = value;
            setDisplay(value);
            return;
        }
        const from = displayRef.current;
        const to = value;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / DURATION_MS);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = progress < 1 ? from + (to - from) * eased : to;
            displayRef.current = current;
            setDisplay(current);
            if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value]);
    return <>{format(display)}</>;
};
