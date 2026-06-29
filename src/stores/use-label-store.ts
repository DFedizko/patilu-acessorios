import { create } from "zustand";

type LabelTier = {
    id: string;
    name: string;
    costCents: number;
};

interface LabelState {
    tier: LabelTier | null;
    open: (tier: LabelTier) => void;
    close: () => void;
}

export const useLabelStore = create<LabelState>((set) => ({
    tier: null,
    open: (tier) => set({ tier }),
    close: () => set({ tier: null }),
}));
