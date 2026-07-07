"use client";

import { useCatalog } from "@/hooks/query/use-catalog";
import { useCatalogSearchStore } from "@/stores/use-catalog-search-store";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryListSkeleton } from "@/components/categories/skeletons/category-list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TagsIcon } from "@/components/ui/icons/tags-icon";
import { SearchIcon } from "@/components/ui/icons/search-icon";

export const CategoryList = () => {
    const search = useCatalogSearchStore((state) => state.search);
    const { data: categories, isLoading } = useCatalog(search);
    if (isLoading) return <CategoryListSkeleton />;
    if (!categories) return null;
    if (categories.length === 0) {
        if (search.trim()) {
            return (
                <EmptyState
                    icon={<SearchIcon className="size-6" />}
                    title="Nenhum resultado"
                    description={`Nenhuma categoria ou faixa encontrada para "${search.trim()}". Tente outro termo.`}
                />
            );
        }
        return (
            <EmptyState
                icon={<TagsIcon className="size-6" />}
                title="Comece criando uma categoria"
                description="Agrupe suas faixas de custo por categoria (ex.: Canetas, Cadernos). Crie a primeira no campo acima."
            />
        );
    }
    return (
        <>
            {categories.map((category) => (
                <CategoryCard key={category.id ?? "sem-categoria"} category={category} />
            ))}
        </>
    );
};
