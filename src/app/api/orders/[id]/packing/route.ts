import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { savePackingSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IGetOrderForPackingUseCase } from "@/server/application/use-case/contracts/IGetOrderForPackingUseCase";
import type { ISavePackingUseCase } from "@/server/application/use-case/contracts/ISavePackingUseCase";
import type { IDeletePackingUseCase } from "@/server/application/use-case/contracts/IDeletePackingUseCase";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = async (_request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const useCase = container.get<IGetOrderForPackingUseCase>(SYMBOLS.GetOrderForPackingUseCase);
        const result = await useCase.execute({ orderId: id });
        return NextResponse.json({
            order: {
                id: result.order.id.value,
                orderNumber: result.order.getOrderNumber(),
                recipientName: result.order.getRecipientName(),
                saleCents: result.order.getSale().toCents(),
                shippingCents: result.order.getShipping().toCents(),
                shipmentStatus: result.order.getShipmentStatus(),
                packingStatus: result.order.getPackingStatus(),
            },
            packing: result.packing
                ? {
                      id: result.packing.id.value,
                      orderId: result.packing.getOrderId(),
                      operatorId: result.packing.getOperatorId(),
                      packedAt: result.packing.getPackedAt(),
                      items: result.packing.getItems().map((item) => ({
                          id: item.id.value,
                          tierId: item.getTierId(),
                          tierName: item.getTierName(),
                          categoryName: item.getCategoryName(),
                          unitCostCents: item.getUnitCost().toCents(),
                          quantity: item.getQuantity(),
                      })),
                      looseItems: result.packing.getLooseItems().map((item) => ({
                          id: item.id.value,
                          name: item.getName(),
                          costCents: item.getCost().toCents(),
                      })),
                  }
                : null,
        });
    } catch (error) {
        return toHttpResponse(error);
    }
};

export const PUT = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const body: unknown = await request.json();
        const parsed = savePackingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Dados inválidos",
                        fields: parsed.error.flatten().fieldErrors,
                    },
                },
                { status: 400 },
            );
        }
        const useCase = container.get<ISavePackingUseCase>(SYMBOLS.SavePackingUseCase);
        const packing = await useCase.execute({ ...parsed.data, orderId: id, operatorId: auth.userId });
        return NextResponse.json({
            id: packing.id.value,
            orderId: packing.getOrderId(),
            operatorId: packing.getOperatorId(),
            packedAt: packing.getPackedAt(),
            items: packing.getItems().map((item) => ({
                id: item.id.value,
                tierId: item.getTierId(),
                tierName: item.getTierName(),
                categoryName: item.getCategoryName(),
                unitCostCents: item.getUnitCost().toCents(),
                quantity: item.getQuantity(),
            })),
            looseItems: packing.getLooseItems().map((item) => ({
                id: item.id.value,
                name: item.getName(),
                costCents: item.getCost().toCents(),
            })),
        });
    } catch (error) {
        return toHttpResponse(error);
    }
};

export const DELETE = async (_request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const useCase = container.get<IDeletePackingUseCase>(SYMBOLS.DeletePackingUseCase);
        await useCase.execute({ orderId: id });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toHttpResponse(error);
    }
};
