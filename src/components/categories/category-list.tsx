"use client";

import { useCatalog } from "@/hooks/query/use-catalog";
import { CategoryCard } from "@/components/categories/category-card";

export const CategoryList = () => {
    const { data: categories, isLoading } = useCatalog();
    if (isLoading) return <p className="text-sm text-muted">Carregando...</p>;
    if (!categories) return null;
    return (
        <>
            {categories.map((category) => (
                <CategoryCard key={category.id ?? "sem-categoria"} category={category} />
            ))}
        </>
    );
};
