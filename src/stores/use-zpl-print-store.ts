import { create } from "zustand";
import type { ZplLayoutDTO } from "@/lib/schemas";

export type ZplLayout = ZplLayoutDTO;

const STORAGE_KEY = "zpl-label-layout:v1";

export const DEFAULT_LABEL_LAYOUT: ZplLayout = {
    columns: 2,
    labelWidthCm: 3.0,
    labelHeightCm: 2.2,
    gapCm: 0.2,
    dpi: 203,
    printHumanReadable: true,
};

const readStoredLayout = (): ZplLayout => {
    try {
        if (typeof window === "undefined") return DEFAULT_LABEL_LAYOUT;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_LABEL_LAYOUT, ...(JSON.parse(raw) as Partial<ZplLayout>) } : DEFAULT_LABEL_LAYOUT;
    } catch {
        return DEFAULT_LABEL_LAYOUT;
    }
};

interface ZplPrintState {
    quantities: Record<string, number>;
    layout: ZplLayout;
    setQuantity: (tierId: string, quantity: number) => void;
    setLayout: <Key extends keyof ZplLayout>(key: Key, value: ZplLayout[Key]) => void;
    resetLayout: () => void;
    saveLayout: () => void;
}

export const useZplPrintStore = create<ZplPrintState>((set, get) => ({
    quantities: {},
    layout: readStoredLayout(),
    setQuantity: (tierId, quantity) => set((state) => ({ quantities: { ...state.quantities, [tierId]: quantity } })),
    setLayout: (key, value) => set((state) => ({ layout: { ...state.layout, [key]: value } })),
    resetLayout: () => set({ layout: DEFAULT_LABEL_LAYOUT }),
    saveLayout: () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(get().layout));
        } catch {
            return;
        }
    },
}));
