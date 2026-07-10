"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { FIXED_COSTS_KEY } from "@/hooks/query/use-fixed-costs";
import type { AddFixedCostDTO } from "@/lib/schemas";

export const useAddFixedCost = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getConfigService();

    return useMutation({
        mutationFn: (input: AddFixedCostDTO) => service.addFixedCost(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FIXED_COSTS_KEY });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });
};
