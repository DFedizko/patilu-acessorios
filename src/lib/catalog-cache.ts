import type { QueryClient } from "@tanstack/react-query";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

export type CatalogSnapshot = [readonly unknown[], ApiCategory[] | undefined][];

export const cancelCatalog = (queryClient: QueryClient): Promise<void> =>
    queryClient.cancelQueries({ queryKey: CATALOG_KEY });

export const snapshotCatalog = (queryClient: QueryClient): CatalogSnapshot =>
    queryClient.getQueriesData<ApiCategory[]>({ queryKey: CATALOG_KEY });

export const restoreCatalog = (queryClient: QueryClient, snapshot: CatalogSnapshot): void => {
    snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
};

export const updateCatalog = (
    queryClient: QueryClient,
    updater: (categories: ApiCategory[]) => ApiCategory[],
): void => {
    queryClient.setQueriesData<ApiCategory[]>({ queryKey: CATALOG_KEY }, (categories) => updater(categories ?? []));
};
