"use client";

import type { ApiTier } from "@/service/category-service";
import { formatCurrency } from "@/utils/format";
import { usePackingStore } from "@/stores/use-packing-store";
import { Button } from "@/components/ui/button";

interface TierCounterCardProps {
    tier: ApiTier;
}

export const TierCounterCard = ({ tier }: TierCounterCardProps) => {
    const count = usePackingStore((s) => s.draft.counts[tier.id] ?? 0);
    const increment = usePackingStore((s) => s.increment);
    const decrement = usePackingStore((s) => s.decrement);
    const active = count > 0;
    const accentClass = active ? "text-primary" : "text-muted";
    const tierCostReais = tier.costCents / 100;
    return (
        <div className={`flex flex-col gap-3.25 p-3.75 ${active ? "card-active" : "card-base"}`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-[0.9375rem] font-semibold text-ink">{tier.name}</div>
                    <div className="mt-0.75 text-xs text-muted">
                        {formatCurrency(tierCostReais)} · {tier.barcode}
                    </div>
                </div>
                <div className={`font-head text-xl font-bold tabular-nums ${accentClass}`}>{count}</div>
            </div>
            <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <Button
                        variant="counterMinus"
                        onClick={() => decrement(tier.id)}
                        ariaLabel={`Remover um ${tier.name}`}
                    >
                        −
                    </Button>
                    <Button
                        variant="counterPlus"
                        onClick={() => increment(tier.id)}
                        ariaLabel={`Adicionar um ${tier.name}`}
                    >
                        +
                    </Button>
                </div>
                <div className={`text-[0.8125rem] font-bold tabular-nums ${accentClass}`}>
                    {formatCurrency(count * tierCostReais)}
                </div>
            </div>
        </div>
    );
};
