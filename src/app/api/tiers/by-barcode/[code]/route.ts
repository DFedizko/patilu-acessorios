import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IFindTierByBarcodeUseCase } from "@/server/application/use-case/contracts/IFindTierByBarcodeUseCase";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { code } = await context.params;
        const useCase = container.get<IFindTierByBarcodeUseCase>(SYMBOLS.FindTierByBarcodeUseCase);
        const result = await useCase.execute({ barcode: code });
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}
