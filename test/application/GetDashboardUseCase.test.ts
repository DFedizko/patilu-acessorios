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
import { GetDashboardUseCase } from "@/server/application/use-case/GetDashboardUseCase";
import { PeriodReportCalculator } from "@/server/domain/service/PeriodReportCalculator";
import type { PeriodQueryDTO } from "@/lib/schemas";

const daysAgo = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

const makeGetAdSpend = (totalCents: number, available = false) => ({
    execute: async (_input: PeriodQueryDTO) => ({ totalCents, available, source: "MANUAL" as const }),
});

const makeUseCaseWith = (adsCents: number, available = false) => {
    const reportGateway = new ReportPrismaPersistenceGateway(testPrisma);
    const configGateway = new ConfigPrismaPersistenceGateway(testPrisma);
    const getFixedCost = new GetFixedCostUseCase(configGateway);
    const calculator = new PeriodReportCalculator();
    return new GetDashboardUseCase(reportGateway, makeGetAdSpend(adsCents, available), getFixedCost, calculator);
};

describe("GetDashboardUseCase", () => {
    let getDashboard: GetDashboardUseCase;
    let savePacking: SavePackingUseCase;

    beforeEach(async () => {
        await truncateAll();
        const orderRepo = new OrderPrismaRepository(testPrisma);
        const packingRepo = new PackingPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
        getDashboard = makeUseCaseWith(0);
    });

    it("returns zeroed indicators when no orders exist", async () => {
        // Act
        const result = await getDashboard.execute({ period: "week" });

        // Assert
        expect(result.orderCount).toBe(0);
        expect(result.revenueCents).toBe(0);
        expect(result.costCents).toBe(0);
        expect(result.profitCents).toBe(0);
        expect(result.marginSeries).toHaveLength(0);
        expect(result.costByCategory).toHaveLength(0);
    });

    it("computes profit = revenue − itemsCost − shipping − ads − (fixedCost × orderCount) − tax", async () => {
        // Arrange
        const order = await givenOrder({ saleCents: 5000, shippingCents: 500, orderedAt: daysAgo(1) });
        const tier = await givenTier({ costCents: 300 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });
        const useCase = makeUseCaseWith(1000);

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result.orderCount).toBe(1);
        expect(result.revenueCents).toBe(5000);
        expect(result.costCents).toBe(600);
        expect(result.adsCents).toBe(1000);
        expect(result.fixedTotalCents).toBe(300);
        // tax = 4.2% of 5000 = 210; profit = 5000 - 600 - 500 - 1000 - 300 - 210 = 2390
        expect(result.profitCents).toBe(2390);
    });

    it("groups costByCategory by frozen category name, excludes loose items from buckets but counts them in total cost", async () => {
        // Arrange — two distinct named categories, each with its own tier
        const pensCategory = await testPrisma.category.create({ data: { name: "Canetas" } });
        const notebooksCategory = await testPrisma.category.create({ data: { name: "Cadernos" } });
        const penTier = await givenTier({ costCents: 200, categoryId: pensCategory.id });
        const notebookTier = await givenTier({ costCents: 500, categoryId: notebooksCategory.id });
        const order1 = await givenOrder({ saleCents: 3000, shippingCents: 0, orderedAt: daysAgo(1) });
        const order2 = await givenOrder({ saleCents: 4000, shippingCents: 0, orderedAt: daysAgo(1) });
        // order1: 1 pen (200) + a loose item (700)
        await savePacking.execute({
            orderId: order1.id,
            operatorId: "op-1",
            items: [{ tierId: penTier.id, quantity: 1 }],
            looseItems: [{ name: "Brinde avulso", costReais: 7 }],
        });
        // order2: 2 notebooks (500 × 2 = 1000)
        await savePacking.execute({
            orderId: order2.id,
            operatorId: "op-1",
            items: [{ tierId: notebookTier.id, quantity: 2 }],
            looseItems: [],
        });

        // Act
        const result = await getDashboard.execute({ period: "week" });

        // Assert — two category buckets, by frozen names, with exact cents each
        const byName = new Map(result.costByCategory.map((c) => [c.categoryName, c.costCents]));
        expect(result.costByCategory).toHaveLength(2);
        expect(byName.get("Canetas")).toBe(200);
        expect(byName.get("Cadernos")).toBe(1000);
        // Assert — the loose item does NOT create its own bucket
        expect(byName.has("Brinde avulso")).toBe(false);
        // Assert — but the loose item IS included in the period total cost (200 + 1000 + 700)
        expect(result.costCents).toBe(1900);
    });

    it("returns marginSeries with day granularity for non-today periods", async () => {
        // Arrange
        const tier = await givenTier({ costCents: 100 });
        const order = await givenOrder({ saleCents: 2000, shippingCents: 0, orderedAt: daysAgo(1) });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Act
        const result = await getDashboard.execute({ period: "week" });

        // Assert
        expect(result.marginSeries.length).toBeGreaterThan(0);
        const label = result.marginSeries[0]!.label;
        expect(label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns marginSeries with hour granularity for today period", async () => {
        // Arrange
        const spFormatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        const spTodayStr = spFormatter.format(new Date());
        const [y, m, d] = spTodayStr.split("-").map(Number);
        const spTodayNoonUtc = new Date(Date.UTC(y!, m! - 1, d!, 15, 0, 0));
        const tier = await givenTier({ costCents: 100 });
        const order = await givenOrder({ saleCents: 2000, shippingCents: 0, orderedAt: spTodayNoonUtc });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Act
        const result = await getDashboard.execute({ period: "today" });

        // Assert
        expect(result.marginSeries.length).toBeGreaterThan(0);
        const label = result.marginSeries[0]!.label;
        expect(label).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}h$/);
    });

    it("reflects adsAvailable from ad spend use case", async () => {
        // Arrange
        const useCase = makeUseCaseWith(500, true);

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result.adsAvailable).toBe(true);
    });
});
