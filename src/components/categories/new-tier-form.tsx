"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tierSchema, type TierInput } from "@/lib/schemas";
import { parseNumber } from "@/utils/format";
import { useCreateTier } from "@/hooks/mutation/use-create-tier";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons/plus-icon";

interface NewTierFormProps {
    categoryId: string | null;
}

export const NewTierForm = ({ categoryId }: NewTierFormProps) => {
    const createTier = useCreateTier();
    const { handleSubmit, control, reset } = useForm<TierInput>({
        resolver: zodResolver(tierSchema),
        defaultValues: { name: "", cost: "" },
    });
    const submit = handleSubmit((data) => {
        createTier.mutate(
            { categoryId, name: data.name.trim(), costReais: parseNumber(data.cost) },
            { onSuccess: () => reset() },
        );
    });
    return (
        <form onSubmit={submit} className="flex items-end gap-2.5 border-t border-border bg-surface-2 px-4.5 py-3.25">
            <Field label="Nova faixa" className="flex-1">
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <input
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Nome (ex.: Premium)"
                            className="input-base px-3 py-2.5 text-sm"
                        />
                    )}
                />
            </Field>
            <Field label="Custo" className="w-30">
                <div className="flex items-center input-base px-2.5">
                    <span className="text-sm text-ink-muted">R$</span>
                    <Controller
                        control={control}
                        name="cost"
                        render={({ field }) => (
                            <input
                                value={field.value}
                                onChange={field.onChange}
                                inputMode="decimal"
                                placeholder="0,00"
                                className="w-full border-none bg-transparent px-1.25 py-2.5 text-sm text-ink outline-none"
                            />
                        )}
                    />
                </div>
            </Field>
            <Button variant="ghost" type="submit" disabled={createTier.isPending} className="px-4.5 py-2.75 text-sm">
                <PlusIcon className="size-4" />
                Faixa
            </Button>
        </form>
    );
};
