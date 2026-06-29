import type { HttpClient } from "@/lib/http/http-client";
import type { SetFixedCostDTO } from "@/lib/schemas";

export type FixedCostResponse = { fixedCostPerOrderCents: number };

export type ConfigService = {
    getFixedCost: () => Promise<FixedCostResponse>;
    setFixedCost: (input: SetFixedCostDTO) => Promise<FixedCostResponse>;
};

export const createConfigService = (http: HttpClient): ConfigService => ({
    getFixedCost: () => http.get<FixedCostResponse>("/config/fixed-cost"),
    setFixedCost: (input) => http.put<FixedCostResponse, SetFixedCostDTO>("/config/fixed-cost", input),
});
