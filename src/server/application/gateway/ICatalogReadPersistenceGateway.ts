export type TierReadModel = {
    id: string;
    name: string;
    costCents: number;
    barcode: string;
    categoryId: string | null;
};

export type CategoryWithTiers = {
    id: string | null;
    name: string;
    tiers: TierReadModel[];
};

export interface ICatalogReadPersistenceGateway {
    listCatalog(): Promise<CategoryWithTiers[]>;
}
