"use client";

import type { FixedCostScopeDTO } from "@/lib/schemas";
import { Button } from "@/components/ui/button";

interface FixedCostScopeToggleProps {
    value: FixedCostScopeDTO;
    onChange: (value: FixedCostScopeDTO) => void;
}

const OPTIONS: { value: FixedCostScopeDTO; label: string }[] = [
    { value: "PER_ORDER", label: "Por pedido" },
    { value: "PER_PRODUCT", label: "Por produto" },
];

export const FixedCostScopeToggle = ({ value, onChange }: FixedCostScopeToggleProps) => (
    <div className="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
        {OPTIONS.map((option) => (
            <Button
                key={option.value}
                variant={value === option.value ? "primary" : "quiet"}
                onClick={() => onChange(option.value)}
                className="px-3 py-1.5 text-xs"
            >
                {option.label}
            </Button>
        ))}
    </div>
);
