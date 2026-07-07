import { create } from "zustand";
import type { LooseItem } from "@/utils/types";

interface PackingDraft {
    counts: Record<string, number>;
    looseItems: LooseItem[];
}

const emptyDraft = (): PackingDraft => ({
    counts: {},
    looseItems: [],
});

interface ScanSignal {
    tierId: string;
    nonce: number;
}

interface PackingState {
    draft: PackingDraft;
    lastScan: ScanSignal | null;
    increment: (tierId: string) => void;
    registerScan: (tierId: string) => void;
    decrement: (tierId: string) => void;
    addLooseItem: (item: LooseItem) => void;
    removeLooseItem: (index: number) => void;
    initFromPacking: (counts: Record<string, number>, looseItems: LooseItem[]) => void;
    reset: () => void;
}

export const usePackingStore = create<PackingState>((set) => ({
    draft: emptyDraft(),
    lastScan: null,
    increment: (tierId) =>
        set((state) => ({
            draft: {
                ...state.draft,
                counts: { ...state.draft.counts, [tierId]: (state.draft.counts[tierId] ?? 0) + 1 },
            },
        })),
    registerScan: (tierId) =>
        set((state) => ({
            draft: {
                ...state.draft,
                counts: { ...state.draft.counts, [tierId]: (state.draft.counts[tierId] ?? 0) + 1 },
            },
            lastScan: { tierId, nonce: (state.lastScan?.nonce ?? 0) + 1 },
        })),
    decrement: (tierId) =>
        set((state) => ({
            draft: {
                ...state.draft,
                counts: {
                    ...state.draft.counts,
                    [tierId]: Math.max(0, (state.draft.counts[tierId] ?? 0) - 1),
                },
            },
        })),
    addLooseItem: (item) =>
        set((state) => ({
            draft: { ...state.draft, looseItems: [...state.draft.looseItems, item] },
        })),
    removeLooseItem: (index) =>
        set((state) => ({
            draft: {
                ...state.draft,
                looseItems: state.draft.looseItems.filter((_, position) => position !== index),
            },
        })),
    initFromPacking: (counts, looseItems) => set({ draft: { counts, looseItems }, lastScan: null }),
    reset: () => set({ draft: emptyDraft(), lastScan: null }),
}));
