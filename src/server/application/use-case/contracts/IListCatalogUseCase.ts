import type { IUseCase } from "./IUseCase";
import type { CategoryWithTiers } from "@/server/application/gateway/ICatalogReadPersistenceGateway";

export type Input = void;
export type Output = CategoryWithTiers[];

export type IListCatalogUseCase = IUseCase<Input, Output>;
