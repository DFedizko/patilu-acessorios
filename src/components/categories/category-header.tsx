"use client";

import { useState } from "react";
import type { ApiCategory } from "@/service/category-service";
import { useRenameCategory } from "@/hooks/mutation/use-rename-category";
import { useDeleteCategory } from "@/hooks/mutation/use-delete-category";
import { Button } from "@/components/ui/button";

interface CategoryHeaderProps {
    category: ApiCategory;
}

export const CategoryHeader = ({ category }: CategoryHeaderProps) => {
    const renameCategory = useRenameCategory();
    const deleteCategory = useDeleteCategory();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const categoryId = category.id;
    const save = () => {
        if (!categoryId) return;
        renameCategory.mutate(
            { id: categoryId, name: name.trim() || category.name },
            { onSuccess: () => setEditing(false) },
        );
    };
    if (editing) {
        return (
            <div className="flex items-center gap-2.5 bg-tint px-4.5 py-3.5">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="flex-1 input-base px-3 py-2.25 text-base font-bold"
                />
                <Button onClick={save} disabled={renameCategory.isPending} className="px-4 py-2.25 text-[0.8125rem]">
                    Salvar
                </Button>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2.5 bg-tint px-4.5 py-3.5">
            <h3 className="m-0 flex-1 font-head text-lg font-bold text-ink">{category.name}</h3>
            {categoryId && (
                <>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setName(category.name);
                            setEditing(true);
                        }}
                        className="px-3.5 py-2 text-[0.8125rem]"
                    >
                        Renomear
                    </Button>
                    <Button
                        variant="dangerOutline"
                        onClick={() => deleteCategory.mutate(categoryId)}
                        disabled={deleteCategory.isPending}
                        className="px-3.5 py-2 text-[0.8125rem]"
                    >
                        Excluir
                    </Button>
                </>
            )}
        </div>
    );
};
