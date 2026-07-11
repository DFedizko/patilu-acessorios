"use client";

import { useCatalog } from "@/hooks/query/use-catalog";
import { useZplPrintStore } from "@/stores/use-zpl-print-store";
import { formatCurrency } from "@/utils/format";

export const ZplQuantitiesGrid = () => {
    const { data: categories } = useCatalog();
    const quantities = useZplPrintStore((state) => state.quantities);
    const setQuantity = useZplPrintStore((state) => state.setQuantity);
    return (
        <div>
            <p className="mb-2 text-xs font-semibold text-ink-muted">Quantas etiquetas de cada faixa</p>
            {(categories ?? [])
                .filter((category) => category.tiers.length > 0)
                .map((category) => (
                    <div key={category.id ?? "sem-categoria"} className="mb-4">
                        <p className="mb-1.5 text-sm font-semibold text-ink">{category.name}</p>
                        {category.tiers.map((tier) => (
                            <div key={tier.id} className="flex items-center gap-3 py-1.5">
                                <span className="flex-1 text-sm text-ink">{tier.name}</span>
                                <span className="font-mono text-sm text-ink tabular-nums">
                                    {formatCurrency(tier.costCents / 100)}
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    value={quantities[tier.id] ?? 0}
                                    onChange={(event) =>
                                        setQuantity(tier.id, Math.max(0, Math.floor(Number(event.target.value) || 0)))
                                    }
                                    className="w-20 input-base px-2.5 py-2 text-right text-sm"
                                />
                            </div>
                        ))}
                    </div>
                ))}
        </div>
    );
};
