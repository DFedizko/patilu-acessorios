import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { periodQuerySchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IGetAdSpendUseCase } from "@/server/application/use-case/contracts/IGetAdSpendUseCase";

export async function GET(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { searchParams } = new URL(request.url);
        const parsed = periodQuerySchema.safeParse({
            period: searchParams.get("period"),
            from: searchParams.get("from") ?? undefined,
            to: searchParams.get("to") ?? undefined,
        });
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
        const useCase = container.get<IGetAdSpendUseCase>(SYMBOLS.GetAdSpendUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}
