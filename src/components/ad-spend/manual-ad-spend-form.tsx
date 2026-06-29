"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { useSetManualAdSpend } from "@/hooks/mutation/use-set-manual-ad-spend";
import { periodReferenceDay } from "@/utils/date";
import { parseNumber } from "@/utils/format";

const schema = z.object({
    amount: z
        .string()
        .min(1, "Informe o valor")
        .refine((val) => parseNumber(val) >= 0, "Valor não pode ser negativo"),
});

type FormValues = z.infer<typeof schema>;

interface ManualAdSpendFormProps {
    from?: string;
}

export const ManualAdSpendForm = ({ from }: ManualAdSpendFormProps) => {
    const mutation = useSetManualAdSpend();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { amount: "" },
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate({ day: periodReferenceDay(from), amountReais: parseNumber(values.amount) });
    };

    return (
        <div className="flex flex-col gap-3.5 panel-sm px-4.5 py-4">
            <div className="flex flex-col gap-0.75">
                <span className="font-head text-base font-bold text-ads">Ads indisponível</span>
                <span className="text-xs/relaxed text-muted">
                    Não foi possível obter o gasto com anúncios do TikTok para este período. Informe um valor manual
                    para o lucro e o CPA serem calculados.
                </span>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
                <Field label="Gasto com ads no período" className="w-44">
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
                <Button type="submit" disabled={mutation.isPending} className="px-6 py-3.25 text-sm">
                    {mutation.isPending ? "Salvando..." : "Salvar ads"}
                </Button>
            </form>
        </div>
    );
};
