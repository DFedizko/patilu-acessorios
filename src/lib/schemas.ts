import { z } from "zod";
import { parseNumber } from "@/utils/format";

const costString = z.string().refine((value) => parseNumber(value) > 0, "Informe um custo válido");

export const looseItemSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome do item"),
    cost: costString,
});

export const newCategorySchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da categoria"),
});

export const tierSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da faixa"),
    cost: costString,
});

export type LooseItemInput = z.infer<typeof looseItemSchema>;
export type NewCategoryInput = z.infer<typeof newCategorySchema>;
export type TierInput = z.infer<typeof tierSchema>;

export const periodQuerySchema = z
    .object({
        period: z.enum(["today", "week", "month", "custom"]),
        from: z.iso.date().optional(),
        to: z.iso.date().optional(),
    })
    .refine((v) => v.period !== "custom" || (v.from !== undefined && v.to !== undefined), {
        message: "Período personalizado exige 'from' e 'to'",
        path: ["from"],
    });

export type PeriodQueryDTO = z.input<typeof periodQuerySchema>;

export const fixedCostScopeSchema = z.enum(["PER_ORDER", "PER_PRODUCT"]);

export const fixedCostEntrySchema = z.object({
    name: z.string().min(1, "Informe o nome do custo"),
    amountCents: z.number().int().min(0, "Custo não pode ser negativo"),
    scope: fixedCostScopeSchema,
});

export const addFixedCostSchema = fixedCostEntrySchema;

export const removeFixedCostSchema = z.object({
    name: z.string().min(1, "Informe o nome do custo"),
});

export type FixedCostScopeDTO = z.infer<typeof fixedCostScopeSchema>;
export type FixedCostEntryDTO = z.infer<typeof fixedCostEntrySchema>;
export type AddFixedCostDTO = z.input<typeof addFixedCostSchema>;
export type RemoveFixedCostDTO = z.input<typeof removeFixedCostSchema>;

export const listCatalogQuerySchema = z.object({
    search: z.string().optional(),
});

export type ListCatalogDTO = z.input<typeof listCatalogQuerySchema>;

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da categoria"),
});

export type CreateCategoryDTO = z.input<typeof createCategorySchema>;

export const renameCategorySchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da categoria"),
});

export type RenameCategoryDTO = z.input<typeof renameCategorySchema>;

export const listOrdersSchema = z
    .object({
        period: z.enum(["today", "week", "month", "custom"]),
        from: z.iso.date().optional(),
        to: z.iso.date().optional(),
        status: z.enum(["PENDING", "SHIPPED", "CANCELLED"]).optional(),
    })
    .refine((v) => v.period !== "custom" || (v.from !== undefined && v.to !== undefined), {
        message: "Período personalizado exige 'from' e 'to'",
        path: ["from"],
    });

export type ListOrdersDTO = z.input<typeof listOrdersSchema>;

export const createTierSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da faixa"),
    costReais: z.number().positive("Informe um custo válido"),
    categoryId: z.string().cuid2().optional(),
});

export type CreateTierDTO = z.input<typeof createTierSchema>;

export const updateTierSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da faixa").optional(),
    costReais: z.number().positive("Informe um custo válido").optional(),
    categoryId: z.string().cuid2().nullable().optional(),
});

export type UpdateTierDTO = z.input<typeof updateTierSchema>;

export const renderLabelsZplSchema = z.object({
    items: z
        .array(
            z.object({
                tierId: z.string().min(1, "Informe a faixa"),
                quantity: z.number().int().min(1, "Quantidade deve ser ao menos 1"),
            }),
        )
        .min(1, "Selecione ao menos uma faixa"),
    options: z.object({
        heightDots: z.number().int().min(10, "Altura inválida").max(600, "Altura inválida"),
        moduleWidthDots: z.number().int().min(1, "Largura de módulo inválida").max(10, "Largura de módulo inválida"),
        originXDots: z.number().int().min(0, "Posição inválida").max(2000, "Posição inválida"),
        originYDots: z.number().int().min(0, "Posição inválida").max(2000, "Posição inválida"),
        printHumanReadable: z.boolean(),
    }),
});

export type RenderLabelsZplDTO = z.input<typeof renderLabelsZplSchema>;

export type OrderListItem = {
    orderId: string;
    orderNumber: string;
    recipientName: string | null;
    saleCents: number;
    shippingCents: number;
    orderedAt: string;
    shipmentStatus: "PENDING" | "SHIPPED" | "CANCELLED";
    packingStatus: "NOT_PACKED" | "PACKED";
};

export const savePackingSchema = z
    .object({
        items: z.array(
            z.object({
                tierId: z.string().min(1, "Informe a faixa"),
                quantity: z.number().int().min(1, "Quantidade deve ser ao menos 1"),
            }),
        ),
        looseItems: z.array(
            z.object({
                name: z.string().trim().min(1, "Informe o nome do item"),
                costReais: z.number().positive("Informe um custo válido"),
            }),
        ),
    })
    .refine((v) => v.items.length + v.looseItems.length > 0, { message: "Inclua ao menos um item" });

export type SavePackingDTO = z.input<typeof savePackingSchema>;

export const setManualAdSpendSchema = z.object({
    day: z.iso.date(),
    amountReais: z.number().min(0, "Valor não pode ser negativo"),
});

export type SetManualAdSpendDTO = z.input<typeof setManualAdSpendSchema>;

export const TIKTOK_WEBHOOK_EVENT = {
    ORDER_STATUS_UPDATE: 1,
    REVERSE_ORDER_STATUS_UPDATE: 2,
    RECIPIENT_ADDRESS_UPDATE: 3,
    PACKAGE_UPDATE: 4,
    PRODUCT_STATUS_UPDATE: 5,
    SELLER_DEAUTHORIZATION: 6,
    UPCOMING_AUTHORIZATION_EXPIRATION: 7,
    RETURN_STATUS_UPDATE: 12,
} as const;

export const tiktokWebhookEventSchema = z.object({
    type: z.number().int(),
    shop_id: z.string().optional(),
    timestamp: z.number().int().optional(),
    data: z.record(z.string(), z.unknown()),
});

export type TikTokWebhookEventDTO = z.infer<typeof tiktokWebhookEventSchema>;

export type HistoryRow = {
    orderId: string;
    orderNumber: string;
    recipientName: string | null;
    orderedAt: string;
    saleCents: number;
    itemsCostCents: number | null;
    cpaCents: number;
    taxCents: number;
    fixedCostCents: number;
    netMarginCents: number | null;
    netMarginPct: number | null;
    saleBrl: string;
    itemsCostBrl: string | null;
    cpaBrl: string;
    taxBrl: string;
    fixedCostBrl: string;
    netMarginBrl: string | null;
};

export type HistorySummary = {
    orderCount: number;
    revenueCents: number;
    costCents: number;
    fixedCostTotalCents: number;
    taxCents: number;
    totalAdsCents: number;
    profitCents: number;
    avgMarginPct: number;
};

export type DashboardData = {
    revenueCents: number;
    costCents: number;
    adsCents: number;
    fixedTotalCents: number;
    profitCents: number;
    avgMarginPct: number;
    orderCount: number;
    salesSeries: { at: string; saleCents: number; costCents: number }[];
    costByCategory: { categoryName: string; costCents: number }[];
    adsAvailable: boolean;
};
