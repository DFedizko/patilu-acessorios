import "reflect-metadata";
import { Container } from "inversify";
import { beforeEach, describe, expect, it } from "bun:test";
import { ListOrdersUseCase } from "@/server/application/use-case/ListOrdersUseCase";
import { OrderListPrismaPersistenceGateway } from "@/server/infrastructure/gateway/OrderListPrismaPersistenceGateway";
import { SYMBOLS } from "@/server/di/symbols";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import { givenOrder } from "../helpers/builders";
import type { IListOrdersUseCase } from "@/server/application/use-case/contracts/IListOrdersUseCase";
import type { IOrderListPersistenceGateway } from "@/server/application/gateway/IOrderListPersistenceGateway";

const daysAgo = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

describe("ListOrdersUseCase", () => {
    let useCase: IListOrdersUseCase;

    beforeEach(async () => {
        await truncateAll();
        const container = new Container();
        container.bind(SYMBOLS.PrismaClient).toConstantValue(testPrisma);
        container
            .bind<IOrderListPersistenceGateway>(SYMBOLS.OrderListPersistenceGateway)
            .to(OrderListPrismaPersistenceGateway);
        container.bind<IListOrdersUseCase>(SYMBOLS.ListOrdersUseCase).to(ListOrdersUseCase);
        useCase = container.get<IListOrdersUseCase>(SYMBOLS.ListOrdersUseCase);
    });

    it("returns PENDING orders first, then ordered by orderedAt ascending within each group", async () => {
        // Arrange
        await givenOrder({ tiktokOrderId: "TT-SHIPPED-1", orderedAt: daysAgo(3), shipmentStatus: "SHIPPED" });
        await givenOrder({ tiktokOrderId: "TT-PENDING-OLD", orderedAt: daysAgo(2), shipmentStatus: "PENDING" });
        await givenOrder({ tiktokOrderId: "TT-PENDING-NEW", orderedAt: daysAgo(1), shipmentStatus: "PENDING" });

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].shipmentStatus).toBe("PENDING");
        expect(result[1].shipmentStatus).toBe("PENDING");
        expect(new Date(result[0].orderedAt).getTime()).toBeLessThan(new Date(result[1].orderedAt).getTime());
        expect(result[2].shipmentStatus).toBe("SHIPPED");
    });

    it("excludes orders outside the requested period", async () => {
        // Arrange
        await givenOrder({ tiktokOrderId: "TT-RECENT", orderedAt: daysAgo(1) });
        await givenOrder({ tiktokOrderId: "TT-OLD", orderedAt: daysAgo(35) });

        // Act
        const result = await useCase.execute({ period: "month" });

        // Assert — 35 days ago is outside the 30-day "month" window
        expect(result).toHaveLength(1);
        expect(result[0].orderId).toBeDefined();
    });

    it("returns the correct OrderListItem shape", async () => {
        // Arrange
        await givenOrder({
            tiktokOrderId: "TT-SHAPE-001",
            orderNumber: "576900000001",
            saleCents: 4500,
            shippingCents: 1500,
            orderedAt: daysAgo(3),
            shipmentStatus: "PENDING",
            packingStatus: "NOT_PACKED",
        });

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result).toHaveLength(1);
        const item = result[0];
        expect(item.orderNumber).toBe("576900000001");
        expect(item.saleCents).toBe(4500);
        expect(item.shippingCents).toBe(1500);
        expect(item.shipmentStatus).toBe("PENDING");
        expect(item.packingStatus).toBe("NOT_PACKED");
        expect(typeof item.orderedAt).toBe("string");
    });
});
