"use client";

import { useEffect } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { ApiCategory } from "@/service/category-service";

export const CATALOG_KEY = ["catalog"] as const;

const CATALOG_STORAGE_KEY = "catalog:v1";

const readStoredCatalog = (): ApiCategory[] | undefined => {
    try {
        const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ApiCategory[]) : undefined;
    } catch {
        return undefined;
    }
};

export const useCatalog = (search?: string) => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    const term = search?.trim() ?? "";
    const query = useQuery({
        queryKey: term ? [...CATALOG_KEY, term] : CATALOG_KEY,
        queryFn: () => service.list(term || undefined),
        placeholderData: keepPreviousData,
    });
    useEffect(() => {
        if (term) return;
        if (queryClient.getQueryData(CATALOG_KEY)) return;
        const stored = readStoredCatalog();
        if (!stored) return;
        queryClient.setQueryData(CATALOG_KEY, stored);
        queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
    }, [queryClient, term]);
    useEffect(() => {
        if (term) return;
        if (!query.data) return;
        try {
            window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(query.data));
        } catch {
            return;
        }
    }, [query.data, term]);
    return query;
};
