"use client";

import { useState } from "react";
import type { Period } from "@/utils/types";

const VALID_PERIODS: Period[] = ["today", "week", "month", "custom"];

const readStoredPeriod = (storageKey: string, fallback: Period): Period => {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(storageKey);
    return VALID_PERIODS.includes(stored as Period) ? (stored as Period) : fallback;
};

export const usePersistedPeriod = (storageKey: string, fallback: Period) => {
    const [period, setPeriod] = useState<Period>(() => readStoredPeriod(storageKey, fallback));
    const updatePeriod = (next: Period) => {
        setPeriod(next);
        window.localStorage.setItem(storageKey, next);
    };
    return [period, updatePeriod] as const;
};
