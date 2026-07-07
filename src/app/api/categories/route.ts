import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { createCategorySchema, listCatalogQuerySchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICreateCategoryUseCase } from "@/server/application/use-case/contracts/ICreateCategoryUseCase";
import type { IListCatalogUseCase } from "@/server/application/use-case/contracts/IListCatalogUseCase";

export async function GET(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const { searchParams } = new URL(request.url);
        const parsed = listCatalogQuerySchema.safeParse({ search: searchParams.get("search") ?? undefined });
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
        const useCase = container.get<IListCatalogUseCase>(SYMBOLS.ListCatalogUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const body = await request.json();
        const parsed = createCategorySchema.safeParse(body);
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
        const useCase = container.get<ICreateCategoryUseCase>(SYMBOLS.CreateCategoryUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return toHttpResponse(error);
    }
}
