import type { IUseCase } from "./IUseCase";
import type { ListCatalogDTO } from "@/lib/schemas";
import type { CategoryWithTiers } from "@/server/application/gateway/ICatalogReadPersistenceGateway";

export type Input = ListCatalogDTO;
export type Output = CategoryWithTiers[];

export type IListCatalogUseCase = IUseCase<Input, Output>;
