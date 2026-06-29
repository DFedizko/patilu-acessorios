"use client";

import { isServer, MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveMessage } from "@/lib/error-messages";

const STALE_TIME_MS = 60 * 1000;

const makeQueryClient = () =>
    new QueryClient({
        queryCache: new QueryCache({
            onError: (error) => {
                toast.error(resolveMessage(error));
            },
        }),
        mutationCache: new MutationCache({
            onError: (error) => {
                toast.error(resolveMessage(error));
            },
        }),
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME_MS,
            },
        },
    });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
    const queryClient = getQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
