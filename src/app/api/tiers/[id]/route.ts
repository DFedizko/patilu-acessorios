import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { updateTierSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IUpdateTierUseCase } from "@/server/application/use-case/contracts/IUpdateTierUseCase";
import type { IDeleteTierUseCase } from "@/server/application/use-case/contracts/IDeleteTierUseCase";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const body = await request.json();
        const parsed = updateTierSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid input",
                        fields: parsed.error.flatten().fieldErrors,
                    },
                },
                { status: 400 },
            );
        }
        const useCase = container.get<IUpdateTierUseCase>(SYMBOLS.UpdateTierUseCase);
        const result = await useCase.execute({ id, ...parsed.data });
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const useCase = container.get<IDeleteTierUseCase>(SYMBOLS.DeleteTierUseCase);
        await useCase.execute({ id });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toHttpResponse(error);
    }
}
