"use client";

import { useCatalog } from "@/hooks/query/use-catalog";
import { TierCounterCard } from "@/components/pack/tier-counter-card";

export const TierCatalog = () => {
    const { data: categories, isLoading } = useCatalog();
    if (isLoading) return <p className="text-sm text-muted">Carregando faixas...</p>;
    if (!categories?.length) return <p className="text-sm text-muted">Nenhuma faixa cadastrada.</p>;
    return (
        <>
            {categories.map((category) => (
                <section key={category.id ?? "sem-categoria"} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <h3 className="m-0 font-head text-lg font-bold text-ink">{category.name}</h3>
                        <div className="h-px flex-1 bg-line" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(12.375rem,1fr))] gap-3">
                        {category.tiers.map((tier) => (
                            <TierCounterCard key={tier.id} tier={tier} />
                        ))}
                    </div>
                </section>
            ))}
        </>
    );
};
