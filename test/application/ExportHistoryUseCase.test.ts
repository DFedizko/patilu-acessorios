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
import { ExportHistoryUseCase } from "@/server/application/use-case/ExportHistoryUseCase";
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

const buildDependencies = () => {
    const reportGateway = new ReportPrismaPersistenceGateway(testPrisma);
    const configGateway = new ConfigPrismaPersistenceGateway(testPrisma);
    const getFixedCost = new GetFixedCostUseCase(configGateway);
    const calculator = new PeriodReportCalculator();
    const orderRepo = new OrderPrismaRepository(testPrisma);
    const packingRepo = new PackingPrismaRepository(testPrisma);
    const tierRepo = new TierPrismaRepository(testPrisma);
    const categoryRepo = new CategoryPrismaRepository(testPrisma);
    const savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
    return { reportGateway, getFixedCost, calculator, savePacking };
};

describe("ExportHistoryUseCase", () => {
    let exportHistory: ExportHistoryUseCase;
    let savePacking: SavePackingUseCase;

    beforeEach(async () => {
        await truncateAll();
        const deps = buildDependencies();
        savePacking = deps.savePacking;
        const getHistory = new GetHistoryUseCase(
            deps.reportGateway,
            makeGetAdSpend(0),
            deps.getFixedCost,
            deps.calculator,
        );
        exportHistory = new ExportHistoryUseCase(getHistory);
    });

    it("generates CSV with the 9 required columns in the header", async () => {
        // Arrange — empty database

        // Act
        const csv = await exportHistory.execute({ period: "week" });

        // Assert
        const header = csv.split("\n")[0]!;
        const columns = header.split(",");
        expect(columns).toHaveLength(9);
        expect(header).toBe("Data,Cliente,Hora,Venda,Custo,CPA,Custo fixo,Margem R$,Margem %");
    });

    it("generates one data row per order with correct column values", async () => {
        // Arrange — 1 packed order, 1000 cents ads
        // sale=5000, shipping=500, tier 300×2=600, CPA=1000, fixedCost=300, netMargin=2600
        const order = await givenOrder({
            saleCents: 5000,
            shippingCents: 500,
            orderedAt: daysAgo(1),
            recipientName: "Maria",
        });
        const tier = await givenTier({ costCents: 300 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "op-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });
        const deps = buildDependencies();
        const getHistory = new GetHistoryUseCase(
            deps.reportGateway,
            makeGetAdSpend(1000),
            deps.getFixedCost,
            deps.calculator,
        );
        const useCase = new ExportHistoryUseCase(getHistory);

        // Act
        const csv = await useCase.execute({ period: "week" });

        // Assert — header + 1 data row
        const lines = csv.split("\n");
        expect(lines).toHaveLength(2);
        const cells = lines[1]!.split(",");
        expect(cells[1]).toBe("Maria"); // Cliente
        expect(cells[3]).toBe("50.00"); // Venda (5000 cents = R$50.00)
        expect(cells[4]).toBe("6.00"); // Custo (600 cents = R$6.00)
        expect(cells[5]).toBe("10.00"); // CPA (1000 cents = R$10.00)
        expect(cells[6]).toBe("3.00"); // Custo fixo (300 cents default = R$3.00)
        expect(cells[7]).toBe("26.00"); // Margem R$ (2600 cents = R$26.00)
    });

    it("leaves cost and margin cells empty for non-packed orders", async () => {
        // Arrange — order without packing
        await givenOrder({ saleCents: 2000, shippingCents: 0, orderedAt: daysAgo(1) });

        // Act
        const csv = await exportHistory.execute({ period: "week" });

        // Assert
        const lines = csv.split("\n");
        expect(lines).toHaveLength(2);
        const cells = lines[1]!.split(",");
        expect(cells[4]).toBe(""); // Custo — empty for non-packed
        expect(cells[7]).toBe(""); // Margem R$ — empty for non-packed
        expect(cells[8]).toBe(""); // Margem % — empty for non-packed
    });
});
