export interface IConfigPersistenceGateway {
    getFixedCostPerOrderCents(): Promise<number>;
    setFixedCostPerOrderCents(cents: number): Promise<void>;
}
