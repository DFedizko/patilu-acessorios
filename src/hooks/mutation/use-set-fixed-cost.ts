"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { FIXED_COST_KEY } from "@/hooks/query/use-fixed-cost";
import type { SetFixedCostDTO } from "@/lib/schemas";

export const useSetFixedCost = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getConfigService();

    return useMutation({
        mutationFn: (input: SetFixedCostDTO) => service.setFixedCost(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FIXED_COST_KEY });
        },
    });
};
