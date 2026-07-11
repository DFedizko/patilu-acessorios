"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { RenderLabelsZplDTO } from "@/lib/schemas";

const DEBOUNCE_MS = 400;

export const useRenderZpl = (payload: RenderLabelsZplDTO | null) => {
    const service = frontContainer.getLabelService();
    const payloadKey = payload && payload.items.length > 0 ? JSON.stringify(payload) : null;
    const [debouncedKey, setDebouncedKey] = useState<string | null>(payloadKey);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKey(payloadKey), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [payloadKey]);
    return useQuery({
        queryKey: ["labels", "zpl", debouncedKey],
        queryFn: () => service.renderZpl(JSON.parse(debouncedKey as string) as RenderLabelsZplDTO),
        enabled: debouncedKey !== null,
    });
};
