"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newCategorySchema, type NewCategoryInput } from "@/lib/schemas";
import { useCreateCategory } from "@/hooks/mutation/use-create-category";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export const NewCategoryForm = () => {
    const createCategory = useCreateCategory();
    const { register, handleSubmit, reset } = useForm<NewCategoryInput>({
        resolver: zodResolver(newCategorySchema),
        defaultValues: { name: "" },
    });
    const submit = handleSubmit((data) => {
        createCategory.mutate(data.name.trim(), { onSuccess: () => reset() });
    });
    return (
        <form onSubmit={submit} className="flex items-end gap-2.5 panel-sm p-4">
            <Field label="Nova categoria" className="flex-1">
                <input
                    {...register("name")}
                    placeholder="Ex.: Adesivos"
                    className="input-base px-3.5 py-3 text-[0.9375rem]"
                />
            </Field>
            <Button type="submit" disabled={createCategory.isPending} className="px-5.5 py-3.25 text-sm">
                + Criar categoria
            </Button>
        </form>
    );
};
