import type { HttpClient } from "@/lib/http/http-client";
import type { AddFixedCostDTO, FixedCostEntryDTO } from "@/lib/schemas";

export type FixedCostsResponse = { costs: FixedCostEntryDTO[] };

export type ConfigService = {
    getFixedCosts: () => Promise<FixedCostsResponse>;
    addFixedCost: (input: AddFixedCostDTO) => Promise<FixedCostsResponse>;
    removeFixedCost: (name: string) => Promise<FixedCostsResponse>;
};

export const createConfigService = (http: HttpClient): ConfigService => ({
    getFixedCosts: () => http.get<FixedCostsResponse>("/fixed-cost"),
    addFixedCost: (input) => http.post<FixedCostsResponse, AddFixedCostDTO>("/fixed-cost", input),
    removeFixedCost: (name) => http.delete<FixedCostsResponse>("/fixed-cost", { params: { name } }),
});
