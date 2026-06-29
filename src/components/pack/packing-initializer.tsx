"use client";

import { useEffect, useRef } from "react";
import { useOrderPacking } from "@/hooks/query/use-order-packing";
import { usePackingStore } from "@/stores/use-packing-store";

interface PackingInitializerProps {
    orderId: string;
}

export const PackingInitializer = ({ orderId }: PackingInitializerProps) => {
    const { data } = useOrderPacking(orderId);
    const initFromPacking = usePackingStore((s) => s.initFromPacking);
    const reset = usePackingStore((s) => s.reset);
    const initialized = useRef(false);

    useEffect(() => {
        initialized.current = false;
        reset();
    }, [orderId, reset]);

    useEffect(() => {
        if (initialized.current || !data) return;
        initialized.current = true;
        if (!data.packing) return;
        const counts: Record<string, number> = {};
        data.packing.items.forEach((item) => {
            if (item.tierId) counts[item.tierId] = item.quantity;
        });
        const looseItems = data.packing.looseItems.map((li) => ({
            name: li.name,
            cost: li.costCents / 100,
        }));
        initFromPacking(counts, looseItems);
    }, [data, initFromPacking]);

    return null;
};
