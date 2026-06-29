import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { ConfigPrismaPersistenceGateway } from "@/server/infrastructure/gateway/ConfigPrismaPersistenceGateway";
import { GetFixedCostUseCase } from "@/server/application/use-case/GetFixedCostUseCase";
import { SetFixedCostUseCase } from "@/server/application/use-case/SetFixedCostUseCase";
import { DomainError } from "@/server/domain/error/DomainError";

describe("SetFixedCostUseCase", () => {
    let getFixedCostUseCase: GetFixedCostUseCase;
    let setFixedCostUseCase: SetFixedCostUseCase;

    beforeEach(async () => {
        await truncateAll();
        const gateway = new ConfigPrismaPersistenceGateway(testPrisma);
        getFixedCostUseCase = new GetFixedCostUseCase(gateway);
        setFixedCostUseCase = new SetFixedCostUseCase(gateway);
    });

    it("persists the fixed cost and returns it in cents", async () => {
        // Arrange — set to R$5,00

        // Act
        const result = await setFixedCostUseCase.execute({ amountReais: 5 });

        // Assert
        expect(result.fixedCostPerOrderCents).toBe(500);
        const verified = await getFixedCostUseCase.execute();
        expect(verified.fixedCostPerOrderCents).toBe(500);
    });

    it("updates the singleton when called twice", async () => {
        // Arrange
        await setFixedCostUseCase.execute({ amountReais: 3 });

        // Act
        await setFixedCostUseCase.execute({ amountReais: 10 });
        const result = await getFixedCostUseCase.execute();

        // Assert
        expect(result.fixedCostPerOrderCents).toBe(1000);
    });

    it("allows setting fixed cost to zero", async () => {
        // Arrange

        // Act
        const result = await setFixedCostUseCase.execute({ amountReais: 0 });

        // Assert
        expect(result.fixedCostPerOrderCents).toBe(0);
    });

    it("throws VALIDATION_ERROR when amountReais is negative", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await setFixedCostUseCase.execute({ amountReais: -1 });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(DomainError);
        expect((thrown as DomainError).code).toBe("VALIDATION_ERROR");
        expect((thrown as DomainError).httpStatus).toBe(400);
    });
});
