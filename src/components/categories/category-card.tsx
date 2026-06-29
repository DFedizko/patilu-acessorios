"use client";

import type { ApiCategory } from "@/service/category-service";
import { CategoryHeader } from "@/components/categories/category-header";
import { TierRow } from "@/components/categories/tier-row";
import { NewTierForm } from "@/components/categories/new-tier-form";

interface CategoryCardProps {
    category: ApiCategory;
}

export const CategoryCard = ({ category }: CategoryCardProps) => (
    <div className="overflow-hidden panel">
        <CategoryHeader category={category} />
        {category.tiers.map((tier) => (
            <TierRow key={tier.id} tier={tier} />
        ))}
        <NewTierForm categoryId={category.id} />
    </div>
);
