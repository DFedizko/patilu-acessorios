"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { SetManualAdSpendDTO } from "@/lib/schemas";

export const useSetManualAdSpend = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getAdSpendService();

    return useMutation({
        mutationFn: (input: SetManualAdSpendDTO) => service.setManual(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ad-spend"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });
};
