import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { periodQuerySchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IExportHistoryUseCase } from "@/server/application/use-case/contracts/IExportHistoryUseCase";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { searchParams } = request.nextUrl;
        const query = {
            period: searchParams.get("period"),
            from: searchParams.get("from") ?? undefined,
            to: searchParams.get("to") ?? undefined,
        };
        const parsed = periodQuerySchema.safeParse(query);
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
        const useCase = container.get<IExportHistoryUseCase>(SYMBOLS.ExportHistoryUseCase);
        const csv = await useCase.execute(parsed.data);
        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="historico.csv"',
            },
        });
    } catch (error) {
        return toHttpResponse(error);
    }
};
