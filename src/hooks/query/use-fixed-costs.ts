"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";

export const FIXED_COSTS_KEY = ["config", "fixed-costs"] as const;

export const useFixedCosts = () => {
    const service = frontContainer.getConfigService();
    return useQuery({
        queryKey: FIXED_COSTS_KEY,
        queryFn: () => service.getFixedCosts(),
    });
};
