export const FRONT_SYMBOLS = {
    HttpClient: Symbol.for("FrontHttpClient"),
    ConfigService: Symbol.for("FrontConfigService"),
    OrderService: Symbol.for("FrontOrderService"),
    CategoryService: Symbol.for("FrontCategoryService"),
    TierService: Symbol.for("FrontTierService"),
    PackingService: Symbol.for("FrontPackingService"),
    ReportService: Symbol.for("FrontReportService"),
    AdSpendService: Symbol.for("FrontAdSpendService"),
} as const;
