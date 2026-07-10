"use client";

import { toast } from "sonner";
import type { FixedCostEntryDTO } from "@/lib/schemas";
import { useFixedCosts } from "@/hooks/query/use-fixed-costs";
import { useAddFixedCost } from "@/hooks/mutation/use-add-fixed-cost";
import { useRemoveFixedCost } from "@/hooks/mutation/use-remove-fixed-cost";
import { FixedCostRow } from "@/components/settings/fixed-cost-row";
import { AddFixedCostForm } from "@/components/settings/add-fixed-cost-form";

export const FixedCostTab = () => {
    const { data } = useFixedCosts();
    const addFixedCost = useAddFixedCost();
    const removeFixedCost = useRemoveFixedCost();
    const disabled = addFixedCost.isPending || removeFixedCost.isPending;
    const handleSave = (entry: FixedCostEntryDTO) => {
        addFixedCost.mutate(entry, { onSuccess: () => toast.success("Custo fixo atualizado") });
    };
    const handleRemove = (name: string) => {
        removeFixedCost.mutate(name, { onSuccess: () => toast.success("Custo fixo removido") });
    };
    const costs = data?.costs ?? [];
    return (
        <div className="flex flex-col gap-5">
            <p className="text-sm/relaxed text-ink-muted">
                Custos fixos são descontados do lucro em cada venda. Um custo <strong>por pedido</strong> entra uma vez
                por pedido (ex.: caixa); um custo <strong>por produto</strong> é multiplicado pela quantidade de itens
                empacotados (ex.: etiqueta). Alterações valem imediatamente para Histórico e Dashboard.
            </p>
            <div className="flex flex-col gap-3">
                {costs.map((cost) => (
                    <FixedCostRow
                        key={cost.name}
                        cost={cost}
                        onSave={handleSave}
                        onRemove={handleRemove}
                        disabled={disabled}
                    />
                ))}
            </div>
            <AddFixedCostForm />
        </div>
    );
};
