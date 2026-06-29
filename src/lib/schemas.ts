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

// Shared period query schema — reused by all read-by-period endpoints (Orders, History, Dashboard, Ads).
// Convention: every endpoint input schema also exports `export type <Action>DTO = z.input<typeof <action>Schema>`
// consumed as the `Input` type of the corresponding use case contract (IUseCase<Input, Output>).
// When the use case needs extra data not in the body (e.g. route params, auth context), the contract Input
// is `<Action>DTO & { extraField: Type }`.
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

export const setFixedCostSchema = z.object({
    amountReais: z.number().min(0, "Custo fixo não pode ser negativo"),
});

export type SetFixedCostDTO = z.input<typeof setFixedCostSchema>;

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

export type HistoryRow = {
    orderId: string;
    orderNumber: string;
    recipientName: string | null;
    orderedAt: string;
    saleCents: number;
    itemsCostCents: number | null;
    cpaCents: number;
    fixedCostCents: number;
    netMarginCents: number | null;
    netMarginPct: number | null;
};

export type HistorySummary = {
    orderCount: number;
    revenueCents: number;
    costCents: number;
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
    marginSeries: { label: string; marginPct: number }[];
    costByCategory: { categoryName: string; costCents: number }[];
    adsAvailable: boolean;
};
