"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { fixedCostScopeSchema } from "@/lib/schemas";
import { parseNumber } from "@/utils/format";
import { useAddFixedCost } from "@/hooks/mutation/use-add-fixed-cost";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { FixedCostScopeToggle } from "@/components/ui/fixed-cost-scope-toggle";
import { PlusIcon } from "@/components/ui/icons/plus-icon";

const schema = z.object({
    name: z.string().min(1, "Informe o nome do custo"),
    amount: z.string().refine((value) => parseNumber(value) >= 0, "Custo não pode ser negativo"),
    scope: fixedCostScopeSchema,
});

type FormValues = z.infer<typeof schema>;

export const AddFixedCostForm = () => {
    const addFixedCost = useAddFixedCost();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", amount: "", scope: "PER_ORDER" },
    });
    const submit = form.handleSubmit((values) => {
        addFixedCost.mutate(
            {
                name: values.name.trim(),
                amountCents: Math.round(parseNumber(values.amount) * 100),
                scope: values.scope,
            },
            {
                onSuccess: () => {
                    toast.success("Custo fixo adicionado");
                    form.reset({ name: "", amount: "", scope: "PER_ORDER" });
                },
            },
        );
    });
    return (
        <form
            onSubmit={submit}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4"
        >
            <Field label="Novo custo fixo" className="min-w-40 flex-1">
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <input
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Ex.: Sacola"
                            className="input-base px-3.5 py-3 text-sm"
                        />
                    )}
                />
            </Field>
            <Field label="Valor" className="w-36">
                <Controller
                    control={form.control}
                    name="amount"
                    render={({ field }) => <MoneyInput value={field.value} onChange={field.onChange} />}
                />
            </Field>
            <Field label="Cobrança">
                <Controller
                    control={form.control}
                    name="scope"
                    render={({ field }) => <FixedCostScopeToggle value={field.value} onChange={field.onChange} />}
                />
            </Field>
            <Button type="submit" disabled={addFixedCost.isPending} className="px-5 py-3 text-sm">
                <PlusIcon className="size-4" />
                Adicionar
            </Button>
        </form>
    );
};
