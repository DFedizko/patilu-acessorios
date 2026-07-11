import { fetchHttpClient } from "@/lib/http/fetch-http-client";
import type { HttpClient } from "@/lib/http/http-client";
import { createConfigService, type ConfigService } from "@/service/config-service";
import { createOrderService, type OrderService } from "@/service/order-service";
import { createCategoryService, type CategoryService } from "@/service/category-service";
import { createTierService, type TierService } from "@/service/tier-service";
import { createPackingService, type PackingService } from "@/service/packing-service";
import { createReportService, type ReportService } from "@/service/report-service";
import { createAdSpendService, type AdSpendService } from "@/service/ad-spend-service";
import { createLabelService, type LabelService } from "@/service/label-service";
import { FRONT_SYMBOLS } from "./symbols";

const registry = new Map<symbol, unknown>();

const httpClient = fetchHttpClient();
registry.set(FRONT_SYMBOLS.HttpClient, httpClient);
registry.set(FRONT_SYMBOLS.ConfigService, createConfigService(httpClient));
registry.set(FRONT_SYMBOLS.OrderService, createOrderService(httpClient));
registry.set(FRONT_SYMBOLS.CategoryService, createCategoryService(httpClient));
registry.set(FRONT_SYMBOLS.TierService, createTierService(httpClient));
registry.set(FRONT_SYMBOLS.PackingService, createPackingService(httpClient));
registry.set(FRONT_SYMBOLS.ReportService, createReportService(httpClient));
registry.set(FRONT_SYMBOLS.AdSpendService, createAdSpendService(httpClient));
registry.set(FRONT_SYMBOLS.LabelService, createLabelService(httpClient));

export const resolve = <T>(symbol: symbol): T => {
    const dep = registry.get(symbol);
    if (!dep) throw new Error(`Dependency not found for symbol: ${symbol.toString()}`);
    return dep as T;
};

export const frontContainer = {
    get: <T>(symbol: symbol): T => resolve<T>(symbol),
    getHttpClient: (): HttpClient => resolve<HttpClient>(FRONT_SYMBOLS.HttpClient),
    getConfigService: (): ConfigService => resolve<ConfigService>(FRONT_SYMBOLS.ConfigService),
    getOrderService: (): OrderService => resolve<OrderService>(FRONT_SYMBOLS.OrderService),
    getCategoryService: (): CategoryService => resolve<CategoryService>(FRONT_SYMBOLS.CategoryService),
    getTierService: (): TierService => resolve<TierService>(FRONT_SYMBOLS.TierService),
    getPackingService: (): PackingService => resolve<PackingService>(FRONT_SYMBOLS.PackingService),
    getReportService: (): ReportService => resolve<ReportService>(FRONT_SYMBOLS.ReportService),
    getAdSpendService: (): AdSpendService => resolve<AdSpendService>(FRONT_SYMBOLS.AdSpendService),
    getLabelService: (): LabelService => resolve<LabelService>(FRONT_SYMBOLS.LabelService),
};
