"use client";

import { DebouncedInput } from "@/components/ui/debounced-input";
import { useCatalogSearchStore } from "@/stores/use-catalog-search-store";

export const CategorySearch = () => {
    const setSearch = useCatalogSearchStore((state) => state.setSearch);
    return (
        <DebouncedInput
            onDebounce={setSearch}
            debounceMs={250}
            placeholder="Busque por categoria ou faixa (ex.: Caneta, Premium, Diamante)…"
            aria-label="Buscar categorias ou faixas"
        />
    );
};
