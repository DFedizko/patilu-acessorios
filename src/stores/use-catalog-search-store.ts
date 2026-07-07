import { create } from "zustand";

interface CatalogSearchStore {
    search: string;
    setSearch: (search: string) => void;
}

export const useCatalogSearchStore = create<CatalogSearchStore>((set) => ({
    search: "",
    setSearch: (search) => set({ search }),
}));
