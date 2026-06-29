import { NextResponse, type NextRequest } from "next/server";
import { toHttpResponse } from "@/lib/http-error";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IIngestTikTokOrderUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderUseCase";
import type { TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const tiktokOrderDTO = (await request.json()) as TikTokOrderDTO;
        const useCase = container.get<IIngestTikTokOrderUseCase>(SYMBOLS.IngestTikTokOrderUseCase);
        await useCase.execute({ tiktokOrderDTO });
        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return toHttpResponse(error);
    }
};
