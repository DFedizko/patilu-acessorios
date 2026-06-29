import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { setManualAdSpendSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { ISetManualAdSpendUseCase } from "@/server/application/use-case/contracts/ISetManualAdSpendUseCase";

export async function PUT(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const body = await request.json();
        const parsed = setManualAdSpendSchema.safeParse(body);
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
        const useCase = container.get<ISetManualAdSpendUseCase>(SYMBOLS.SetManualAdSpendUseCase);
        await useCase.execute(parsed.data);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toHttpResponse(error);
    }
}
