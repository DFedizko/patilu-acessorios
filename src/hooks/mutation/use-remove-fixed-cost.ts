"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { FIXED_COSTS_KEY } from "@/hooks/query/use-fixed-costs";

export const useRemoveFixedCost = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getConfigService();

    return useMutation({
        mutationFn: (name: string) => service.removeFixedCost(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FIXED_COSTS_KEY });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });
};
