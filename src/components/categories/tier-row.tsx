"use client";

import { useState } from "react";
import type { ApiTier } from "@/service/category-service";
import { formatCurrency, parseNumber } from "@/utils/format";
import { useUpdateTier } from "@/hooks/mutation/use-update-tier";
import { useDeleteTier } from "@/hooks/mutation/use-delete-tier";
import { useLabelStore } from "@/stores/use-label-store";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons/trash-icon";

interface TierRowProps {
    tier: ApiTier;
}

const toCostInput = (costCents: number): string => String(costCents / 100).replace(".", ",");

export const TierRow = ({ tier }: TierRowProps) => {
    const updateTier = useUpdateTier();
    const deleteTier = useDeleteTier();
    const openLabel = useLabelStore((state) => state.open);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(tier.name);
    const [cost, setCost] = useState(toCostInput(tier.costCents));
    const save = () => {
        const costReais = parseNumber(cost);
        updateTier.mutate(
            {
                id: tier.id,
                name: name.trim() || tier.name,
                costReais: costReais > 0 ? costReais : tier.costCents / 100,
            },
            { onSuccess: () => setEditing(false) },
        );
    };
    if (editing) {
        return (
            <div className="flex items-center gap-3 border-t border-border px-4.5 py-3">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="flex-1 input-base px-3 py-2.25 text-sm"
                />
                <div className="flex w-27.5 items-center input-base px-2.5">
                    <span className="text-sm text-ink-muted">R$</span>
                    <input
                        value={cost}
                        onChange={(event) => setCost(event.target.value)}
                        inputMode="decimal"
                        className="w-full border-none bg-transparent px-1.25 py-2.25 text-sm text-ink outline-none"
                    />
                </div>
                <Button onClick={save} disabled={updateTier.isPending} className="px-3.5 py-2.25 text-xs">
                    Salvar
                </Button>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-3 border-t border-border px-4.5 py-3">
            <span className="flex-1 text-sm font-semibold text-ink">{tier.name}</span>
            <span className="w-20 text-right font-mono text-sm font-semibold text-ink tabular-nums">
                {formatCurrency(tier.costCents / 100)}
            </span>
            <span className="w-22.5 text-right font-mono text-xs text-ink-muted tabular-nums">{tier.barcode}</span>
            <Button
                variant="ghost"
                onClick={() => openLabel({ id: tier.id, name: tier.name, costCents: tier.costCents })}
                className="px-3 py-2 text-xs"
            >
                Etiqueta
            </Button>
            <Button
                variant="ghost"
                onClick={() => {
                    setName(tier.name);
                    setCost(toCostInput(tier.costCents));
                    setEditing(true);
                }}
                className="px-3 py-2 text-xs"
            >
                Editar
            </Button>
            <Button
                variant="ghostDanger"
                onClick={() => deleteTier.remove({ id: tier.id, name: tier.name })}
                className="p-2"
                ariaLabel={`Excluir faixa ${tier.name}`}
            >
                <TrashIcon className="size-4" />
            </Button>
        </div>
    );
};
