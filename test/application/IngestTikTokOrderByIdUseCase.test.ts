import "reflect-metadata";
import { Container } from "inversify";
import { beforeEach, describe, expect, it } from "bun:test";
import { IngestTikTokOrderByIdUseCase } from "@/server/application/use-case/IngestTikTokOrderByIdUseCase";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { TikTokOrderTranslator } from "@/server/domain/acl/TikTokOrderTranslator";
import { SYMBOLS } from "@/server/di/symbols";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import { StubOrdersGateway } from "../stubs/StubOrdersGateway";
import type { IIngestTikTokOrderByIdUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderByIdUseCase";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { ITikTokOrdersGateway, TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";

const makeDto = (overrides: Partial<TikTokOrderDTO> = {}): TikTokOrderDTO => ({
    tiktokOrderId: "TT-WEBHOOK-001",
    orderNumber: "576901234500001",
    recipientName: "Maria S.",
    totalAmountCents: 4500,
    shippingFeeCents: 1500,
    createTime: new Date().toISOString(),
    orderStatus: "AWAITING_SHIPMENT",
    ...overrides,
});

describe("IngestTikTokOrderByIdUseCase", () => {
    let useCase: IIngestTikTokOrderByIdUseCase;
    let gateway: StubOrdersGateway;

    beforeEach(async () => {
        await truncateAll();
        gateway = new StubOrdersGateway(makeDto());
        const container = new Container();
        container.bind(SYMBOLS.PrismaClient).toConstantValue(testPrisma);
        container.bind<IOrderRepository>(SYMBOLS.OrderRepository).to(OrderPrismaRepository);
        container.bind<ITikTokOrdersGateway>(SYMBOLS.TikTokOrdersGateway).toConstantValue(gateway);
        container
            .bind<TikTokOrderTranslator>(SYMBOLS.TikTokOrderTranslator)
            .toConstantValue(new TikTokOrderTranslator());
        container
            .bind<IIngestTikTokOrderByIdUseCase>(SYMBOLS.IngestTikTokOrderByIdUseCase)
            .to(IngestTikTokOrderByIdUseCase);
        useCase = container.get<IIngestTikTokOrderByIdUseCase>(SYMBOLS.IngestTikTokOrderByIdUseCase);
    });

    it("fetches the order by id and materializes the mirrored order", async () => {
        // Arrange
        gateway.setOrder(makeDto({ orderStatus: "AWAITING_SHIPMENT" }));

        // Act
        const order = await useCase.execute({ tiktokOrderId: "TT-WEBHOOK-001" });

        // Assert
        expect(order.getTiktokOrderId()).toBe("TT-WEBHOOK-001");
        expect(order.getShipmentStatus()).toBe("PENDING");
        expect(order.getSale().toCents()).toBe(4500);
    });

    it("updates the shipment status on a later webhook without duplicating the order", async () => {
        // Arrange
        await useCase.execute({ tiktokOrderId: "TT-WEBHOOK-001" });
        gateway.setOrder(makeDto({ orderStatus: "IN_TRANSIT" }));

        // Act
        const updated = await useCase.execute({ tiktokOrderId: "TT-WEBHOOK-001" });

        // Assert
        expect(updated.getShipmentStatus()).toBe("SHIPPED");
        const rows = await testPrisma.order.findMany({ where: { tiktokOrderId: "TT-WEBHOOK-001" } });
        expect(rows).toHaveLength(1);
    });
});
