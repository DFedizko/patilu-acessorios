"use client";

import Link from "next/link";
import { useCatalog } from "@/hooks/query/use-catalog";
import { TierCounterCard } from "@/components/pack/tier-counter-card";
import { TierCatalogSkeleton } from "@/components/pack/skeletons/tier-catalog-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TagsIcon } from "@/components/ui/icons/tags-icon";
import { Button } from "@/components/ui/button";

export const TierCatalog = () => {
    const { data: categories, isLoading } = useCatalog();
    if (isLoading) return <TierCatalogSkeleton />;
    if (!categories?.length) {
        return (
            <EmptyState
                icon={<TagsIcon className="size-6" />}
                title="Nenhuma faixa cadastrada"
                description="Cadastre as faixas de custo (ex.: Caneta R$1, Caderno R$8) para contar os itens do kit e ver a margem."
                action={
                    <Link href="/categorias">
                        <Button variant="ghost" className="px-4 py-2 text-sm">
                            Cadastrar faixas
                        </Button>
                    </Link>
                }
            />
        );
    }
    return (
        <>
            {categories.map((category) => (
                <section key={category.id ?? "sem-categoria"} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <h3 className="m-0 text-base font-semibold text-ink">{category.name}</h3>
                        <div className="h-px flex-1 bg-border" />
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
