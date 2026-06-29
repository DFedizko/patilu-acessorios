import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICatalogReadPersistenceGateway } from "@/server/application/gateway/ICatalogReadPersistenceGateway";
import type { IListCatalogUseCase, Output } from "./contracts/IListCatalogUseCase";

@injectable()
export class ListCatalogUseCase implements IListCatalogUseCase {
    constructor(
        @inject(SYMBOLS.CatalogReadPersistenceGateway)
        private readonly catalogGateway: ICatalogReadPersistenceGateway,
    ) {}

    async execute(): Promise<Output> {
        return this.catalogGateway.listCatalog();
    }
}
