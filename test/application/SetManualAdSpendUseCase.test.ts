import "reflect-metadata";
import { beforeEach, describe, expect, it } from "bun:test";
import { SetManualAdSpendUseCase } from "@/server/application/use-case/SetManualAdSpendUseCase";
import { AdSpendPrismaPersistenceGateway } from "@/server/infrastructure/gateway/AdSpendPrismaPersistenceGateway";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";

describe("SetManualAdSpendUseCase", () => {
    let useCase: SetManualAdSpendUseCase;

    beforeEach(async () => {
        await truncateAll();
        useCase = new SetManualAdSpendUseCase(new AdSpendPrismaPersistenceGateway(testPrisma));
    });

    it("saves a MANUAL ad spend entry for the given day", async () => {
        // Arrange
        const day = "2024-01-15";

        // Act
        await useCase.execute({ day, amountReais: 100 });

        // Assert
        const record = await testPrisma.adSpendDay.findUnique({ where: { day: new Date(day) } });
        expect(record).toBeDefined();
        expect(record!.amountCents).toBe(10000);
        expect(record!.source).toBe("MANUAL");
    });

    it("overwrites the previous entry when the same day is set again", async () => {
        // Arrange
        const day = "2024-01-15";
        await useCase.execute({ day, amountReais: 100 });

        // Act
        await useCase.execute({ day, amountReais: 200 });

        // Assert
        const records = await testPrisma.adSpendDay.findMany({ where: { day: new Date(day) } });
        expect(records).toHaveLength(1);
        expect(records[0]!.amountCents).toBe(20000);
    });
});
