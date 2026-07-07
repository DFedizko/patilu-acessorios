import { NextResponse, type NextRequest } from "next/server";
import { toHttpResponse } from "@/lib/http-error";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import type { IIngestTikTokOrderUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderUseCase";
import type { TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";
import { TikTokWebhookVerifier } from "@/server/infrastructure/gateway/TikTokWebhookVerifier";

const UNAUTHENTICATED_STATUS = 401;

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const rawBody = await request.text();
        const verifier = container.get<TikTokWebhookVerifier>(SYMBOLS.TikTokWebhookVerifier);
        if (!verifier.verify(rawBody, request.headers.get("Authorization"))) {
            return NextResponse.json(
                { error: { code: "UNAUTHENTICATED", message: "Invalid TikTok webhook signature" } },
                { status: UNAUTHENTICATED_STATUS },
            );
        }
        const tiktokOrderDTO = JSON.parse(rawBody) as TikTokOrderDTO;
        const useCase = container.get<IIngestTikTokOrderUseCase>(SYMBOLS.IngestTikTokOrderUseCase);
        await useCase.execute({ tiktokOrderDTO });
        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return toHttpResponse(error);
    }
};
