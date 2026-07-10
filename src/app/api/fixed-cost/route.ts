import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { toHttpResponse } from "@/lib/http-error";
import { addFixedCostSchema, removeFixedCostSchema } from "@/lib/schemas";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IGetFixedCostsUseCase } from "@/server/application/use-case/contracts/IGetFixedCostsUseCase";
import type { IAddFixedCostUseCase } from "@/server/application/use-case/contracts/IAddFixedCostUseCase";
import type { IRemoveFixedCostUseCase } from "@/server/application/use-case/contracts/IRemoveFixedCostUseCase";
import type { ZodError } from "zod";

const validationError = (error: ZodError): NextResponse =>
    NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: error.flatten().fieldErrors } },
        { status: 400 },
    );

export async function GET() {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const useCase = container.get<IGetFixedCostsUseCase>(SYMBOLS.GetFixedCostsUseCase);
        const result = await useCase.execute();
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
        const parsed = addFixedCostSchema.safeParse(body);
        if (!parsed.success) {
            return validationError(parsed.error);
        }
        const useCase = container.get<IAddFixedCostUseCase>(SYMBOLS.AddFixedCostUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}

export async function DELETE(request: Request) {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;
    try {
        const name = new URL(request.url).searchParams.get("name");
        const parsed = removeFixedCostSchema.safeParse({ name });
        if (!parsed.success) {
            return validationError(parsed.error);
        }
        const useCase = container.get<IRemoveFixedCostUseCase>(SYMBOLS.RemoveFixedCostUseCase);
        const result = await useCase.execute(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        return toHttpResponse(error);
    }
}
