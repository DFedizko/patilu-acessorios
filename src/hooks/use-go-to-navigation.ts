"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SEQUENCE_WINDOW_MS = 1000;

const ROUTES: Record<string, string> = {
    p: "/pedidos",
    h: "/historico",
    d: "/dashboard",
    c: "/categorias",
};

const isTypingTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
};

export const useGoToNavigation = () => {
    const router = useRouter();
    const armedRef = useRef(false);
    const timerRef = useRef<number | null>(null);
    useEffect(() => {
        const disarm = () => {
            armedRef.current = false;
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
        const handler = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
            const key = event.key.toLowerCase();
            if (armedRef.current) {
                disarm();
                const route = ROUTES[key];
                if (route) {
                    event.preventDefault();
                    router.push(route);
                }
                return;
            }
            if (key === "g") {
                armedRef.current = true;
                timerRef.current = window.setTimeout(disarm, SEQUENCE_WINDOW_MS);
            }
        };
        document.addEventListener("keydown", handler);
        return () => {
            document.removeEventListener("keydown", handler);
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [router]);
};
