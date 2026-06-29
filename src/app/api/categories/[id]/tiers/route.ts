import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { createTierSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICreateTierUseCase } from "@/server/application/use-case/contracts/ICreateTierUseCase";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id: categoryId } = await context.params;
        const body = await request.json();
        const parsed = createTierSchema.omit({ categoryId: true }).safeParse(body);
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
        const useCase = container.get<ICreateTierUseCase>(SYMBOLS.CreateTierUseCase);
        const result = await useCase.execute({ ...parsed.data, categoryId });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return toHttpResponse(error);
    }
}
