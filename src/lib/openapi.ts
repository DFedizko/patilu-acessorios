import { z } from "zod";
import { createDocument } from "zod-openapi";
import {
    setFixedCostSchema,
    createCategorySchema,
    renameCategorySchema,
    createTierSchema,
    updateTierSchema,
    savePackingSchema,
    setManualAdSpendSchema,
} from "@/lib/schemas";

const fixedCostResponseSchema = z.object({ fixedCostPerOrderCents: z.number().int() });

const orderListItemSchema = z.object({
    orderId: z.string(),
    orderNumber: z.string(),
    recipientName: z.string().nullable(),
    saleCents: z.number().int(),
    shippingCents: z.number().int(),
    orderedAt: z.string(),
    shipmentStatus: z.enum(["PENDING", "SHIPPED", "CANCELLED"]),
    packingStatus: z.enum(["NOT_PACKED", "PACKED"]),
});

const tierReadModelSchema = z.object({
    id: z.string(),
    name: z.string(),
    costCents: z.number().int(),
    barcode: z.string(),
    categoryId: z.string().nullable(),
});

const categoryWithTiersSchema = z.object({
    id: z.string().nullable(),
    name: z.string(),
    tiers: z.array(tierReadModelSchema),
});

const categoryResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
});

const notFoundErrorSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
});

const unprocessableErrorSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
});

const validationErrorSchema = z.object({
    error: z.object({
        code: z.literal("VALIDATION_ERROR"),
        message: z.string(),
        fields: z.record(z.string(), z.array(z.string())).optional(),
    }),
});

export function getOpenApiDocument() {
    return createDocument({
        openapi: "3.1.0",
        info: {
            title: "Patilu Kits API",
            version: "1.0.0",
            description: "API documentation for Patilu Kits",
        },
        servers: [{ url: "/" }],
        paths: {
            "/api/categories": {
                get: {
                    operationId: "listCatalog",
                    summary: "Lista categorias com suas faixas (+ Sem categoria)",
                    description:
                        "Categorias e faixas são ordenadas pela data de criação (mais antigas primeiro). O parâmetro `search` faz busca aproximada (case-insensitive, por trecho) que dá match em nome de categoria OU de faixa.",
                    tags: ["Categories"],
                    parameters: [
                        {
                            name: "search",
                            in: "query",
                            required: false,
                            description:
                                "Termo de busca aproximada por nome de categoria ou faixa. Retorna categorias cujo nome contém o termo (com todas as faixas) e categorias que possuem faixas correspondentes (apenas as faixas que deram match).",
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Catálogo de categorias com faixas",
                            content: { "application/json": { schema: z.array(categoryWithTiersSchema) } },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                    },
                },
                post: {
                    operationId: "createCategory",
                    summary: "Cria uma categoria",
                    tags: ["Categories"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: createCategorySchema } },
                    },
                    responses: {
                        "201": {
                            description: "Categoria criada",
                            content: { "application/json": { schema: categoryResponseSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "422": {
                            description: "Nome da categoria obrigatório",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
            },
            "/api/categories/{id}": {
                patch: {
                    operationId: "renameCategory",
                    summary: "Renomeia uma categoria",
                    tags: ["Categories"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: renameCategorySchema } },
                    },
                    responses: {
                        "200": {
                            description: "Categoria renomeada",
                            content: { "application/json": { schema: categoryResponseSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "404": {
                            description: "Categoria não encontrada",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "422": {
                            description: "Nome da categoria obrigatório",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
                delete: {
                    operationId: "deleteCategory",
                    summary: "Exclui uma categoria (faixas vão para Sem categoria)",
                    tags: ["Categories"],
                    responses: {
                        "204": {
                            description: "Categoria excluída",
                        },
                        "404": {
                            description: "Categoria não encontrada",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/tiers": {
                post: {
                    operationId: "createTierUncategorized",
                    summary: "Cria faixa em Sem categoria",
                    tags: ["Tiers"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: createTierSchema } },
                    },
                    responses: {
                        "201": {
                            description: "Faixa criada",
                            content: { "application/json": { schema: tierReadModelSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "422": {
                            description: "Custo inválido ou código duplicado",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
            },
            "/api/tiers/{id}": {
                patch: {
                    operationId: "updateTier",
                    summary: "Edita faixa",
                    tags: ["Tiers"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: updateTierSchema } },
                    },
                    responses: {
                        "200": {
                            description: "Faixa atualizada",
                            content: { "application/json": { schema: tierReadModelSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "404": {
                            description: "Faixa não encontrada",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "422": {
                            description: "Custo inválido",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
                delete: {
                    operationId: "deleteTier",
                    summary: "Exclui faixa",
                    tags: ["Tiers"],
                    responses: {
                        "204": {
                            description: "Faixa excluída",
                        },
                        "404": {
                            description: "Faixa não encontrada",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/categories/{id}/tiers": {
                post: {
                    operationId: "createTierInCategory",
                    summary: "Cria faixa na categoria (gera código)",
                    tags: ["Tiers"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": { schema: createTierSchema.omit({ categoryId: true }) },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Faixa criada",
                            content: { "application/json": { schema: tierReadModelSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "404": {
                            description: "Categoria não encontrada",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "422": {
                            description: "Custo inválido ou código duplicado",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
            },
            "/api/tiers/by-barcode/{code}": {
                get: {
                    operationId: "findTierByBarcode",
                    summary: "Resolve bipe → faixa",
                    tags: ["Tiers"],
                    responses: {
                        "200": {
                            description: "Faixa encontrada",
                            content: { "application/json": { schema: tierReadModelSchema } },
                        },
                        "404": {
                            description: "Código não encontrado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/orders": {
                get: {
                    operationId: "listOrders",
                    summary: "Lista pedidos do período (pendentes no topo)",
                    tags: ["Orders"],
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            required: true,
                            schema: { type: "string", enum: ["today", "week", "month", "custom"] },
                        },
                        { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
                        {
                            name: "status",
                            in: "query",
                            required: false,
                            schema: { type: "string", enum: ["PENDING", "SHIPPED", "CANCELLED"] },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Lista de pedidos do período",
                            content: { "application/json": { schema: z.array(orderListItemSchema) } },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/orders/{id}/packing": {
                get: {
                    operationId: "getOrderForPacking",
                    summary: "Retorna pedido com empacotamento (ou null se ainda não empacotado)",
                    tags: ["Packing"],
                    responses: {
                        "200": {
                            description: "Pedido com empacotamento",
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        order: z.object({
                                            id: z.string(),
                                            orderNumber: z.string(),
                                            recipientName: z.string().nullable(),
                                            saleCents: z.number().int(),
                                            shippingCents: z.number().int(),
                                            shipmentStatus: z.enum(["PENDING", "SHIPPED", "CANCELLED"]),
                                            packingStatus: z.enum(["NOT_PACKED", "PACKED"]),
                                        }),
                                        packing: z
                                            .object({
                                                id: z.string(),
                                                orderId: z.string(),
                                                operatorId: z.string(),
                                                packedAt: z.string(),
                                                items: z.array(
                                                    z.object({
                                                        id: z.string(),
                                                        tierId: z.string().nullable(),
                                                        tierName: z.string(),
                                                        categoryName: z.string(),
                                                        unitCostCents: z.number().int(),
                                                        quantity: z.number().int(),
                                                    }),
                                                ),
                                                looseItems: z.array(
                                                    z.object({
                                                        id: z.string(),
                                                        name: z.string(),
                                                        costCents: z.number().int(),
                                                    }),
                                                ),
                                            })
                                            .nullable(),
                                    }),
                                },
                            },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "404": {
                            description: "Pedido não encontrado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
                put: {
                    operationId: "savePacking",
                    summary: "Cria ou substitui o empacotamento de um pedido",
                    tags: ["Packing"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: savePackingSchema } },
                    },
                    responses: {
                        "200": {
                            description: "Empacotamento salvo",
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        id: z.string(),
                                        orderId: z.string(),
                                        operatorId: z.string(),
                                        packedAt: z.string(),
                                        items: z.array(
                                            z.object({
                                                id: z.string(),
                                                tierId: z.string().nullable(),
                                                tierName: z.string(),
                                                categoryName: z.string(),
                                                unitCostCents: z.number().int(),
                                                quantity: z.number().int(),
                                            }),
                                        ),
                                        looseItems: z.array(
                                            z.object({
                                                id: z.string(),
                                                name: z.string(),
                                                costCents: z.number().int(),
                                            }),
                                        ),
                                    }),
                                },
                            },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "404": {
                            description: "Pedido não encontrado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "422": {
                            description: "Pedido não pode ser empacotado ou empacotamento sem itens",
                            content: { "application/json": { schema: unprocessableErrorSchema } },
                        },
                    },
                },
                delete: {
                    operationId: "deletePacking",
                    summary: "Remove o empacotamento de um pedido e o marca como não empacotado",
                    tags: ["Packing"],
                    responses: {
                        "204": { description: "Empacotamento removido" },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                        "404": {
                            description: "Empacotamento não encontrado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/webhooks/tiktok/orders": {
                post: {
                    operationId: "tiktokOrderWebhook",
                    summary: "Recebe atualização de status de pedido do TikTok (stub — HMAC em RF-20)",
                    tags: ["Webhooks"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: z.object({
                                    tiktokOrderId: z.string().describe("ID único do pedido no TikTok"),
                                    orderNumber: z.string().describe("Número do pedido exibido ao cliente"),
                                    recipientName: z.string().nullable().describe("@handle do cliente"),
                                    totalAmountCents: z.number().int().describe("Valor total da venda em centavos"),
                                    shippingFeeCents: z.number().int().describe("Frete em centavos"),
                                    createTime: z.string().describe("ISO 8601 — data/hora do pedido"),
                                    orderStatus: z
                                        .enum([
                                            "UNPAID",
                                            "AWAITING_SHIPMENT",
                                            "AWAITING_COLLECTION",
                                            "PARTIALLY_SHIPPING",
                                            "IN_TRANSIT",
                                            "DELIVERED",
                                            "COMPLETED",
                                            "CANCELLED",
                                        ])
                                        .describe("Status do pedido no TikTok"),
                                }),
                            },
                        },
                    },
                    responses: {
                        "200": { description: "Evento processado" },
                    },
                },
            },
            "/api/ad-spend": {
                get: {
                    operationId: "getAdSpend",
                    summary: "Total de ads do período + disponibilidade",
                    tags: ["AdSpend"],
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            required: true,
                            schema: { type: "string", enum: ["today", "week", "month", "custom"] },
                        },
                        { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
                    ],
                    responses: {
                        "200": {
                            description: "Total de ads do período",
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        totalCents: z.number().int(),
                                        available: z.boolean(),
                                        source: z.enum(["TIKTOK", "MANUAL"]),
                                    }),
                                },
                            },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/ad-spend/manual": {
                put: {
                    operationId: "setManualAdSpend",
                    summary: "Define ads manual de um dia (fallback quando TikTok indisponível)",
                    tags: ["AdSpend"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: setManualAdSpendSchema } },
                    },
                    responses: {
                        "204": { description: "Ad spend manual salvo" },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/history": {
                get: {
                    operationId: "getHistory",
                    summary: "Linhas do histórico com CPA, custo fixo e margem líquida + resumo do período",
                    tags: ["History"],
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            required: true,
                            schema: { type: "string", enum: ["today", "week", "month", "custom"] },
                        },
                        { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
                    ],
                    responses: {
                        "200": {
                            description: "Linhas do histórico e resumo do período",
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        rows: z.array(
                                            z.object({
                                                orderId: z.string(),
                                                orderNumber: z.string(),
                                                recipientName: z.string().nullable(),
                                                orderedAt: z.string(),
                                                saleCents: z.number().int(),
                                                itemsCostCents: z.number().int().nullable(),
                                                cpaCents: z.number().int(),
                                                taxCents: z.number().int(),
                                                fixedCostCents: z.number().int(),
                                                netMarginCents: z.number().int().nullable(),
                                                netMarginPct: z.number().nullable(),
                                            }),
                                        ),
                                        summary: z.object({
                                            orderCount: z.number().int(),
                                            revenueCents: z.number().int(),
                                            costCents: z.number().int(),
                                            taxCents: z.number().int(),
                                            totalAdsCents: z.number().int(),
                                            profitCents: z.number().int(),
                                            avgMarginPct: z.number(),
                                        }),
                                    }),
                                },
                            },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/history/export": {
                get: {
                    operationId: "exportHistory",
                    summary:
                        "Exporta os pedidos do período em CSV (Data, Cliente, Hora, Venda, Custo, CPA, Impostos, Custo fixo, Margem R$, Margem %)",
                    tags: ["History"],
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            required: true,
                            schema: { type: "string", enum: ["today", "week", "month", "custom"] },
                        },
                        { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
                    ],
                    responses: {
                        "200": {
                            description: "Arquivo CSV para download",
                            content: { "text/csv": { schema: z.string() } },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/dashboard": {
                get: {
                    operationId: "getDashboard",
                    summary: "Indicadores do período + série de margem + custo por categoria",
                    tags: ["Dashboard"],
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            required: true,
                            schema: { type: "string", enum: ["today", "week", "month", "custom"] },
                        },
                        { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
                    ],
                    responses: {
                        "200": {
                            description: "Dados do dashboard para o período",
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        revenueCents: z.number().int(),
                                        costCents: z.number().int(),
                                        adsCents: z.number().int(),
                                        fixedTotalCents: z.number().int(),
                                        profitCents: z.number().int(),
                                        avgMarginPct: z.number(),
                                        orderCount: z.number().int(),
                                        marginSeries: z.array(z.object({ label: z.string(), marginPct: z.number() })),
                                        costByCategory: z.array(
                                            z.object({
                                                categoryName: z.string(),
                                                costCents: z.number().int(),
                                            }),
                                        ),
                                        adsAvailable: z.boolean(),
                                    }),
                                },
                            },
                        },
                        "400": {
                            description: "Parâmetros inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                        "401": {
                            description: "Não autenticado",
                            content: { "application/json": { schema: notFoundErrorSchema } },
                        },
                    },
                },
            },
            "/api/config/fixed-cost": {
                get: {
                    operationId: "getFixedCost",
                    summary: "Lê o custo fixo por pedido",
                    tags: ["Config"],
                    responses: {
                        "200": {
                            description: "Custo fixo por pedido em centavos",
                            content: { "application/json": { schema: fixedCostResponseSchema } },
                        },
                    },
                },
                put: {
                    operationId: "setFixedCost",
                    summary: "Define o custo fixo por pedido",
                    tags: ["Config"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: setFixedCostSchema } },
                    },
                    responses: {
                        "200": {
                            description: "Novo custo fixo por pedido em centavos",
                            content: { "application/json": { schema: fixedCostResponseSchema } },
                        },
                        "400": {
                            description: "Dados inválidos",
                            content: { "application/json": { schema: validationErrorSchema } },
                        },
                    },
                },
            },
        },
    });
}
