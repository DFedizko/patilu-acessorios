import "reflect-metadata";
import { Container } from "inversify";
import { beforeEach, describe, expect, it } from "bun:test";
import { IngestTikTokOrderUseCase } from "@/server/application/use-case/IngestTikTokOrderUseCase";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { TikTokOrderTranslator } from "@/server/domain/acl/TikTokOrderTranslator";
import { SYMBOLS } from "@/server/di/symbols";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import type { IIngestTikTokOrderUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderUseCase";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";

const makeDto = (overrides: Partial<TikTokOrderDTO> = {}): TikTokOrderDTO => ({
    tiktokOrderId: "TT-INGEST-001",
    orderNumber: "576901234500001",
    recipientName: "Maria S.",
    totalAmountCents: 4500,
    shippingFeeCents: 1500,
    createTime: new Date().toISOString(),
    orderStatus: "AWAITING_SHIPMENT",
    ...overrides,
});

describe("IngestTikTokOrderUseCase", () => {
    let useCase: IIngestTikTokOrderUseCase;

    beforeEach(async () => {
        await truncateAll();
        const container = new Container();
        container.bind(SYMBOLS.PrismaClient).toConstantValue(testPrisma);
        container.bind<IOrderRepository>(SYMBOLS.OrderRepository).to(OrderPrismaRepository);
        container
            .bind<TikTokOrderTranslator>(SYMBOLS.TikTokOrderTranslator)
            .toConstantValue(new TikTokOrderTranslator());
        container.bind<IIngestTikTokOrderUseCase>(SYMBOLS.IngestTikTokOrderUseCase).to(IngestTikTokOrderUseCase);
        useCase = container.get<IIngestTikTokOrderUseCase>(SYMBOLS.IngestTikTokOrderUseCase);
    });

    it("creates the mirrored order when it does not exist yet", async () => {
        // Arrange
        const dto = makeDto();

        // Act
        const order = await useCase.execute({ tiktokOrderDTO: dto });

        // Assert
        expect(order.getTiktokOrderId()).toBe("TT-INGEST-001");
        expect(order.getShipmentStatus()).toBe("PENDING");
        expect(order.getPackingStatus()).toBe("NOT_PACKED");
        expect(order.getSale().toCents()).toBe(4500);
        expect(order.getShipping().toCents()).toBe(1500);
    });

    it("updates status/data when the order already exists (idempotent upsert by tiktokOrderId)", async () => {
        // Arrange
        const dto = makeDto({ orderStatus: "AWAITING_SHIPMENT" });
        await useCase.execute({ tiktokOrderDTO: dto });

        const updatedDto = makeDto({ orderStatus: "IN_TRANSIT", totalAmountCents: 4500 });

        // Act
        const updated = await useCase.execute({ tiktokOrderDTO: updatedDto });

        // Assert — same tiktokOrderId, status updated, no duplicate row
        expect(updated.getTiktokOrderId()).toBe("TT-INGEST-001");
        expect(updated.getShipmentStatus()).toBe("SHIPPED");
        const rows = await testPrisma.order.findMany({ where: { tiktokOrderId: "TT-INGEST-001" } });
        expect(rows).toHaveLength(1);
    });
});
