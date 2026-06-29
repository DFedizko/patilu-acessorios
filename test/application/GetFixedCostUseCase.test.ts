import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { ConfigPrismaPersistenceGateway } from "@/server/infrastructure/gateway/ConfigPrismaPersistenceGateway";
import { GetFixedCostUseCase } from "@/server/application/use-case/GetFixedCostUseCase";
import { SetFixedCostUseCase } from "@/server/application/use-case/SetFixedCostUseCase";

describe("GetFixedCostUseCase", () => {
    let getFixedCostUseCase: GetFixedCostUseCase;
    let setFixedCostUseCase: SetFixedCostUseCase;

    beforeEach(async () => {
        await truncateAll();
        const gateway = new ConfigPrismaPersistenceGateway(testPrisma);
        getFixedCostUseCase = new GetFixedCostUseCase(gateway);
        setFixedCostUseCase = new SetFixedCostUseCase(gateway);
    });

    it("returns default fixed cost of 300 cents when never configured", async () => {
        // Arrange — no config row in DB

        // Act
        const result = await getFixedCostUseCase.execute();

        // Assert
        expect(result.fixedCostPerOrderCents).toBe(300);
    });

    it("returns the updated value after Set is called", async () => {
        // Arrange
        await setFixedCostUseCase.execute({ amountReais: 5 });

        // Act
        const result = await getFixedCostUseCase.execute();

        // Assert
        expect(result.fixedCostPerOrderCents).toBe(500);
    });
});
