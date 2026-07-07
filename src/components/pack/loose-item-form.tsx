"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { looseItemSchema, type LooseItemInput } from "@/lib/schemas";
import { parseNumber } from "@/utils/format";
import { usePackingStore } from "@/stores/use-packing-store";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";

interface LooseItemFormProps {
    onAdded: () => void;
}

export const LooseItemForm = ({ onAdded }: LooseItemFormProps) => {
    const addLooseItem = usePackingStore((state) => state.addLooseItem);
    const { handleSubmit, control, reset } = useForm<LooseItemInput>({
        resolver: zodResolver(looseItemSchema),
        defaultValues: { name: "", cost: "" },
    });
    const submit = handleSubmit((data) => {
        addLooseItem({ name: data.name.trim(), cost: parseNumber(data.cost) });
        reset();
        onAdded();
    });
    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2.5 panel-sm p-4">
            <Field label="Nome do item" className="min-w-45 flex-1">
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <input
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Ex.: Pelúcia especial"
                            className="input-base px-3.5 py-3 text-sm"
                        />
                    )}
                />
            </Field>
            <Field label="Custo" className="w-35">
                <Controller
                    control={control}
                    name="cost"
                    render={({ field }) => <MoneyInput value={field.value} onChange={field.onChange} />}
                />
            </Field>
            <Button type="submit" className="px-5 py-3.25 text-sm">
                Adicionar
            </Button>
        </form>
    );
};
