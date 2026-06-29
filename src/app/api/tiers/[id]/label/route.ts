import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IRenderTierLabelUseCase } from "@/server/application/use-case/contracts/IRenderTierLabelUseCase";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { id } = await context.params;
        const useCase = container.get<IRenderTierLabelUseCase>(SYMBOLS.RenderTierLabelUseCase);
        const { svg } = await useCase.execute({ id });
        return new NextResponse(svg, {
            status: 200,
            headers: { "Content-Type": "image/svg+xml" },
        });
    } catch (error) {
        return toHttpResponse(error);
    }
}
