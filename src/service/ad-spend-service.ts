import type { HttpClient } from "@/lib/http/http-client";
import type { SetManualAdSpendDTO } from "@/lib/schemas";
import type { Period } from "@/utils/types";

export type AdSpendParams = {
    period: Period;
    from?: string;
    to?: string;
};

export type AdSpendResponse = {
    totalCents: number;
    available: boolean;
    source: "TIKTOK" | "MANUAL";
};

export type AdSpendService = {
    getAdSpend: (params: AdSpendParams) => Promise<AdSpendResponse>;
    setManual: (input: SetManualAdSpendDTO) => Promise<void>;
};

export const createAdSpendService = (http: HttpClient): AdSpendService => ({
    getAdSpend: (params) => http.get<AdSpendResponse>("/ad-spend", { params }),
    setManual: (input) => http.put<void, SetManualAdSpendDTO>("/ad-spend/manual", input),
});
