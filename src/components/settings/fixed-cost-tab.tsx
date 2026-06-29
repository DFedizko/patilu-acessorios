"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { useFixedCost } from "@/hooks/query/use-fixed-cost";
import { useSetFixedCost } from "@/hooks/mutation/use-set-fixed-cost";
import { parseNumber } from "@/utils/format";

const schema = z.object({
    amount: z
        .string()
        .min(1, "Informe o valor")
        .refine((val) => parseNumber(val) >= 0, "Custo fixo não pode ser negativo"),
});

type FormValues = z.infer<typeof schema>;

const centsToDisplay = (cents: number): string => (cents / 100).toFixed(2).replace(".", ",");

export const FixedCostTab = () => {
    const { data } = useFixedCost();
    const mutation = useSetFixedCost();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { amount: "" },
    });

    useEffect(() => {
        if (data) {
            form.reset({ amount: centsToDisplay(data.fixedCostPerOrderCents) });
        }
    }, [data, form]);

    const onSubmit = (values: FormValues) => {
        mutation.mutate({ amountReais: parseNumber(values.amount) });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <p className="text-sm/relaxed text-muted">
                O custo fixo por pedido é descontado do lucro bruto em cada venda. Alterar este valor passa a valer
                imediatamente para os cálculos de Histórico e Dashboard.
            </p>
            <Field label="Custo fixo por pedido">
                <Controller
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <MoneyInput value={field.value} onChange={field.onChange} placeholder="0,00" />
                    )}
                />
                {form.formState.errors.amount && (
                    <span className="text-xs text-danger">{form.formState.errors.amount.message}</span>
                )}
            </Field>
            <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
                className="self-end px-7 py-2.5 text-sm"
            >
                {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
        </form>
    );
};
