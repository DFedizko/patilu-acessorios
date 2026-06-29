"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";

export const CATALOG_KEY = ["catalog"] as const;

export const useCatalog = () => {
    const service = frontContainer.getCategoryService();
    return useQuery({
        queryKey: CATALOG_KEY,
        queryFn: () => service.list(),
    });
};
