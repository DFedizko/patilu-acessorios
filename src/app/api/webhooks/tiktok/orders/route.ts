import { NextResponse, type NextRequest } from "next/server";
import { toHttpResponse } from "@/lib/http-error";
import { container } from "@/server/di/container";
import { SYMBOLS } from "@/server/di/symbols";
import { tiktokWebhookEventSchema, TIKTOK_WEBHOOK_EVENT } from "@/lib/schemas";
import type { IIngestTikTokOrderByIdUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderByIdUseCase";
import { TikTokWebhookVerifier } from "@/server/infrastructure/gateway/TikTokWebhookVerifier";

const UNAUTHENTICATED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;

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
        const parsed = tiktokWebhookEventSchema.safeParse(JSON.parse(rawBody));
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Payload de webhook inválido",
                        fields: parsed.error.flatten().fieldErrors,
                    },
                },
                { status: BAD_REQUEST_STATUS },
            );
        }
        const event = parsed.data;
        if (event.type === TIKTOK_WEBHOOK_EVENT.ORDER_STATUS_UPDATE) {
            const orderId = event.data.order_id;
            if (typeof orderId === "string") {
                const useCase = container.get<IIngestTikTokOrderByIdUseCase>(SYMBOLS.IngestTikTokOrderByIdUseCase);
                await useCase.execute({ tiktokOrderId: orderId });
            }
        }
        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return toHttpResponse(error);
    }
};
