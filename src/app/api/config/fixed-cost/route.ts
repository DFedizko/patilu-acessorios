import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { setFixedCostSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IGetFixedCostUseCase } from "@/server/application/use-case/contracts/IGetFixedCostUseCase";
import type { ISetFixedCostUseCase } from "@/server/application/use-case/contracts/ISetFixedCostUseCase";

export async function GET() {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const useCase = container.get<IGetFixedCostUseCase>(SYMBOLS.GetFixedCostUseCase);
        const result = await useCase.execute();
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}

export async function PUT(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const body = await request.json();
        const parsed = setFixedCostSchema.safeParse(body);
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
        const useCase = container.get<ISetFixedCostUseCase>(SYMBOLS.SetFixedCostUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}
