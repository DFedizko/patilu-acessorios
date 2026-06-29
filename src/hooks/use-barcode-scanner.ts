"use client";

import { useEffect, useRef } from "react";

const MIN_SCAN_LENGTH = 4;
const MAX_SCAN_INTERVAL_MS = 50;

export const useBarcodeScanner = (onScan: (code: string) => void) => {
    const callbackRef = useRef(onScan);
    useEffect(() => {
        callbackRef.current = onScan;
    });
    const bufferRef = useRef<string[]>([]);
    const lastKeyTimeRef = useRef(0);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

            if (event.key === "Enter") {
                const code = bufferRef.current.join("");
                bufferRef.current = [];
                lastKeyTimeRef.current = 0;
                if (code.length >= MIN_SCAN_LENGTH) {
                    callbackRef.current(code);
                }
                return;
            }

            if (event.key.length !== 1) return;

            const now = performance.now();
            const elapsed = now - lastKeyTimeRef.current;

            if (lastKeyTimeRef.current > 0 && elapsed > MAX_SCAN_INTERVAL_MS) {
                bufferRef.current = [];
            }

            bufferRef.current.push(event.key);
            lastKeyTimeRef.current = now;
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
};
