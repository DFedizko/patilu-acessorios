import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { listOrdersSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IListOrdersUseCase } from "@/server/application/use-case/contracts/IListOrdersUseCase";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { searchParams } = request.nextUrl;
        const query = {
            period: searchParams.get("period"),
            from: searchParams.get("from") ?? undefined,
            to: searchParams.get("to") ?? undefined,
            status: searchParams.get("status") ?? undefined,
        };
        const parsed = listOrdersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Parâmetros de consulta inválidos",
                        fields: parsed.error.flatten().fieldErrors,
                    },
                },
                { status: 400 },
            );
        }
        const useCase = container.get<IListOrdersUseCase>(SYMBOLS.ListOrdersUseCase);
        const orders = await useCase.execute(parsed.data);
        return NextResponse.json(orders);
    } catch (error) {
        return toHttpResponse(error);
    }
};
