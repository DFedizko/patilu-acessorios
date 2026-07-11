import { create } from "zustand";
import type { RenderLabelsZplDTO } from "@/lib/schemas";

export type ZplOptions = RenderLabelsZplDTO["options"];

export const DEFAULT_ZPL_OPTIONS: ZplOptions = {
    heightDots: 100,
    moduleWidthDots: 2,
    originXDots: 30,
    originYDots: 30,
    printHumanReadable: true,
};

interface ZplPrintState {
    quantities: Record<string, number>;
    setQuantity: (tierId: string, quantity: number) => void;
}

export const useZplPrintStore = create<ZplPrintState>((set) => ({
    quantities: {},
    setQuantity: (tierId, quantity) => set((state) => ({ quantities: { ...state.quantities, [tierId]: quantity } })),
}));
