import type { IUseCase } from "./IUseCase";
import type { ListOrdersDTO, OrderListItem } from "@/lib/schemas";

export type Input = ListOrdersDTO;
export type Output = OrderListItem[];

export type IListOrdersUseCase = IUseCase<Input, Output>;
