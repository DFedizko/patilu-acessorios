"use client";

import { useEffect, useRef } from "react";
import type { ApiTier } from "@/service/category-service";
import { formatCurrency } from "@/utils/format";
import { usePackingStore } from "@/stores/use-packing-store";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons/plus-icon";
import { MinusIcon } from "@/components/ui/icons/minus-icon";

interface TierCounterCardProps {
    tier: ApiTier;
}

const FLASH_DURATION_MS = 700;

export const TierCounterCard = ({ tier }: TierCounterCardProps) => {
    const count = usePackingStore((s) => s.draft.counts[tier.id] ?? 0);
    const increment = usePackingStore((s) => s.increment);
    const decrement = usePackingStore((s) => s.decrement);
    const lastScan = usePackingStore((s) => s.lastScan);
    const cardRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!lastScan || lastScan.tierId !== tier.id) return;
        const node = cardRef.current;
        if (!node) return;
        node.classList.remove("scan-flash");
        void node.offsetWidth;
        node.classList.add("scan-flash");
        node.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const timer = window.setTimeout(() => node.classList.remove("scan-flash"), FLASH_DURATION_MS);
        return () => window.clearTimeout(timer);
    }, [lastScan, tier.id]);
    const active = count > 0;
    const accentClass = active ? "text-primary" : "text-ink-muted";
    const tierCostReais = tier.costCents / 100;
    return (
        <div ref={cardRef} className={`flex flex-col gap-3.25 p-3.75 ${active ? "card-active" : "card-base"}`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-sm font-semibold text-ink">{tier.name}</div>
                    <div className="mt-0.75 font-mono text-xs text-ink-muted tabular-nums">
                        {formatCurrency(tierCostReais)} · {tier.barcode}
                    </div>
                </div>
                <div className={`font-mono text-xl font-semibold tabular-nums ${accentClass}`}>{count}</div>
            </div>
            <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <Button
                        variant="counterMinus"
                        onClick={() => decrement(tier.id)}
                        ariaLabel={`Remover um ${tier.name}`}
                    >
                        <MinusIcon className="size-5" />
                    </Button>
                    <Button
                        variant="counterPlus"
                        onClick={() => increment(tier.id)}
                        ariaLabel={`Adicionar um ${tier.name}`}
                    >
                        <PlusIcon className="size-5" />
                    </Button>
                </div>
                <div className={`font-mono text-sm font-semibold tabular-nums ${accentClass}`}>
                    {formatCurrency(count * tierCostReais)}
                </div>
            </div>
        </div>
    );
};
