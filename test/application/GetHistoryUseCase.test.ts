import "reflect-metadata";
import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { givenOrder, givenTier } from "../helpers/builders";
import { testPrisma } from "../helpers/prisma";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { PackingPrismaRepository } from "@/server/infrastructure/repository/PackingPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { ConfigPrismaPersistenceGateway } from "@/server/infrastructure/gateway/ConfigPrismaPersistenceGateway";
import { ReportPrismaPersistenceGateway } from "@/server/infrastructure/gateway/ReportPrismaPersistenceGateway";
import { SavePackingUseCase } from "@/server/application/use-case/SavePackingUseCase";
import { GetFixedCostUseCase } from "@/server/application/use-case/GetFixedCostUseCase";
import { GetHistoryUseCase } from "@/server/application/use-case/GetHistoryUseCase";
import { PeriodReportCalculator } from "@/server/domain/service/PeriodReportCalculator";
import type { PeriodQueryDTO } from "@/lib/schemas";

const daysAgo = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

const makeGetAdSpend = (totalCents: number) => ({
    execute: async (_input: PeriodQueryDTO) => ({ totalCents, available: false, source: "MANUAL" as const }),
});

describe("GetHistoryUseCase", () => {
    let getHistory: GetHistoryUseCase;
    let savePacking: SavePackingUseCase;

    beforeEach(async () => {
        await truncateAll();
        const reportGateway = new ReportPrismaPersistenceGateway(testPrisma);
        const configGateway = new ConfigPrismaPersistenceGateway(testPrisma);
        const getFixedCost = new GetFixedCostUseCase(configGateway);
        const calculator = new PeriodReportCalculator();
        const orderRepo = new OrderPrismaRepository(testPrisma);
        const packingRepo = new PackingPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
        getHistory = new GetHistoryUseCase(reportGateway, makeGetAdSpend(0), getFixedCost, calculator);
    });

    it("returns empty rows and zero summary when no orders exist", async () => {
        // Arrange — empty database

        // Act
        const result = await getHistory.execute({ period: "week" });

        // Assert
        expect(result.rows).toHaveLength(0);
        expect(result.summary.orderCount).toBe(0);
        expect(result.summary.revenueCents).toBe(0);
        expect(result.summary.totalAdsCents).toBe(0);
        expect(result.summary.profitCents).toBe(0);
    });

    it("computes CPA = totalAds / orderCount for orders in period", async () => {
        // Arrange — 1 packed order, 1000 cents total ads → CPA = 1000
        const order = await givenOrder({ saleCents: 5000, shippingCents: 500, orderedAt: daysAgo(1) });
        const tier = await givenTier({ costCents: 300 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });
        const useCase = new GetHistoryUseCase(
            new ReportPrismaPersistenceGateway(testPrisma),
            makeGetAdSpend(1000),
            new GetFixedCostUseCase(new ConfigPrismaPersistenceGateway(testPrisma)),
            new PeriodReportCalculator(),
        );

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert — 1 order, 1000 cents total ads → CPA = 1000 per order
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0]!.cpaCents).toBe(1000);
    });

    it("CPA equals zero when total ads is zero", async () => {
        // Arrange
        const order = await givenOrder({ saleCents: 3000, shippingCents: 200, orderedAt: daysAgo(1) });
        const tier = await givenTier({ costCents: 100 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Act — getHistory uses makeGetAdSpend(0) from beforeEach
        const result = await getHistory.execute({ period: "week" });

        // Assert
        expect(result.rows[0]!.cpaCents).toBe(0);
    });

    it("computes net margin per order = sale - itemsCost - shipping - CPA - fixedCost", async () => {
        // Arrange
        // sale=5000, shipping=500, tier cost=300×2=600, ads=1000, fixedCost=300 (default)
        // CPA = 1000 / 1 = 1000
        // netMargin = 5000 - 600 - 500 - 1000 - 300 = 2600
        const order = await givenOrder({ saleCents: 5000, shippingCents: 500, orderedAt: daysAgo(1) });
        const tier = await givenTier({ costCents: 300 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });
        const useCase = new GetHistoryUseCase(
            new ReportPrismaPersistenceGateway(testPrisma),
            makeGetAdSpend(1000),
            new GetFixedCostUseCase(new ConfigPrismaPersistenceGateway(testPrisma)),
            new PeriodReportCalculator(),
        );

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        const row = result.rows[0]!;
        expect(row.saleCents).toBe(5000);
        expect(row.itemsCostCents).toBe(600);
        expect(row.cpaCents).toBe(1000);
        expect(row.fixedCostCents).toBe(300);
        expect(row.netMarginCents).toBe(2600);
        expect(Math.round(row.netMarginPct!)).toBe(Math.round((2600 / 5000) * 100));
    });

    it("uses frozen snapshot values (not current tier cost)", async () => {
        // Arrange — pack with tier at cost 300; then change tier cost (frozen values must prevail)
        const order = await givenOrder({ saleCents: 2000, shippingCents: 0, orderedAt: daysAgo(1) });
        const tier = await givenTier({ costCents: 300 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });
        // Simulate tier cost change after packing
        await testPrisma.tier.update({ where: { id: tier.id }, data: { costCents: 9999 } });

        // Act
        const result = await getHistory.execute({ period: "week" });

        // Assert — cost should still reflect frozen 300, not updated 9999
        expect(result.rows[0]!.itemsCostCents).toBe(300);
    });

    it("returns null netMargin for non-packed orders", async () => {
        // Arrange — order without packing
        await givenOrder({ saleCents: 2000, shippingCents: 300, orderedAt: daysAgo(1) });

        // Act
        const result = await getHistory.execute({ period: "week" });

        // Assert
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0]!.itemsCostCents).toBeNull();
        expect(result.rows[0]!.netMarginCents).toBeNull();
        expect(result.rows[0]!.netMarginPct).toBeNull();
    });

    it("returns coherent summary for the period", async () => {
        // Arrange — 2 packed orders
        // order1: sale=4000, shipping=200, itemsCost=tier1 200×2=400
        // order2: sale=6000, shipping=300, itemsCost=tier2 300×2=600
        // ads=2000, fixedCost=300 (default)
        // CPA = 2000 / 2 = 1000 each
        // revenue=10000, itemsCost=1000, shipping=500, ads=2000, fixedCost=600
        // profit = 10000 - 1000 - 500 - 2000 - 600 = 5900
        const tier1 = await givenTier({ costCents: 200 });
        const tier2 = await givenTier({ costCents: 300 });
        const order1 = await givenOrder({ saleCents: 4000, shippingCents: 200, orderedAt: daysAgo(1) });
        const order2 = await givenOrder({ saleCents: 6000, shippingCents: 300, orderedAt: daysAgo(2) });
        await savePacking.execute({
            orderId: order1.id,
            operatorId: "op-1",
            items: [{ tierId: tier1.id, quantity: 2 }],
            looseItems: [],
        });
        await savePacking.execute({
            orderId: order2.id,
            operatorId: "op-1",
            items: [{ tierId: tier2.id, quantity: 2 }],
            looseItems: [],
        });
        const useCase = new GetHistoryUseCase(
            new ReportPrismaPersistenceGateway(testPrisma),
            makeGetAdSpend(2000),
            new GetFixedCostUseCase(new ConfigPrismaPersistenceGateway(testPrisma)),
            new PeriodReportCalculator(),
        );

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result.summary.orderCount).toBe(2);
        expect(result.summary.revenueCents).toBe(10000);
        expect(result.summary.costCents).toBe(1000);
        expect(result.summary.totalAdsCents).toBe(2000);
        expect(result.summary.profitCents).toBe(5900);
    });
});
