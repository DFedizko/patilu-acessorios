"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";

export const FIXED_COST_KEY = ["config", "fixed-cost"] as const;

export const useFixedCost = () => {
    const service = frontContainer.getConfigService();
    return useQuery({
        queryKey: FIXED_COST_KEY,
        queryFn: () => service.getFixedCost(),
    });
};
