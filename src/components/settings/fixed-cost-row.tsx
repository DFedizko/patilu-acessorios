"use client";

import { useState } from "react";
import type { FixedCostEntryDTO, FixedCostScopeDTO } from "@/lib/schemas";
import { parseNumber } from "@/utils/format";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { FixedCostScopeToggle } from "@/components/ui/fixed-cost-scope-toggle";
import { TrashIcon } from "@/components/ui/icons/trash-icon";

interface FixedCostRowProps {
    cost: FixedCostEntryDTO;
    onSave: (entry: FixedCostEntryDTO) => void;
    onRemove: (name: string) => void;
    disabled: boolean;
}

const centsToDisplay = (cents: number): string => (cents / 100).toFixed(2).replace(".", ",");

export const FixedCostRow = ({ cost, onSave, onRemove, disabled }: FixedCostRowProps) => {
    const [amount, setAmount] = useState(centsToDisplay(cost.amountCents));
    const [scope, setScope] = useState<FixedCostScopeDTO>(cost.scope);
    const amountCents = Math.round(parseNumber(amount) * 100);
    const isDirty = amountCents !== cost.amountCents || scope !== cost.scope;
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
            <span className="min-w-32 flex-1 text-sm font-semibold text-ink">{cost.name}</span>
            <div className="w-36">
                <MoneyInput value={amount} onChange={setAmount} placeholder="0,00" />
            </div>
            <FixedCostScopeToggle value={scope} onChange={setScope} />
            <Button
                variant="ghost"
                disabled={disabled || !isDirty}
                onClick={() => onSave({ name: cost.name, amountCents, scope })}
                className="px-4 py-2 text-xs"
            >
                Salvar
            </Button>
            <Button
                variant="ghostDanger"
                disabled={disabled}
                ariaLabel={`Remover ${cost.name}`}
                onClick={() => onRemove(cost.name)}
                className="px-2.5 py-2"
            >
                <TrashIcon className="size-4" />
            </Button>
        </div>
    );
};
