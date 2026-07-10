import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { FixedCostsPrismaGateway } from "@/server/infrastructure/gateway/FixedCostsPrismaGateway";
import { GetFixedCostsUseCase } from "@/server/application/use-case/GetFixedCostsUseCase";
import { AddFixedCostUseCase } from "@/server/application/use-case/AddFixedCostUseCase";

describe("AddFixedCostUseCase", () => {
    let getFixedCosts: GetFixedCostsUseCase;
    let addFixedCost: AddFixedCostUseCase;

    beforeEach(async () => {
        await truncateAll();
        const gateway = new FixedCostsPrismaGateway(testPrisma);
        getFixedCosts = new GetFixedCostsUseCase(gateway);
        addFixedCost = new AddFixedCostUseCase(gateway);
    });

    it("persists a new fixed cost and returns it in the list", async () => {
        // Arrange — default costs only

        // Act
        const result = await addFixedCost.execute({ name: "Nota fiscal", amountCents: 90, scope: "PER_ORDER" });

        // Assert
        expect(result.costs).toContainEqual({ name: "Nota fiscal", amountCents: 90, scope: "PER_ORDER" });
        const persisted = await getFixedCosts.execute();
        expect(persisted.costs).toContainEqual({ name: "Nota fiscal", amountCents: 90, scope: "PER_ORDER" });
    });

    it("overwrites an existing cost with the same name", async () => {
        // Arrange
        await addFixedCost.execute({ name: "Etiqueta", amountCents: 50, scope: "PER_PRODUCT" });

        // Act
        await addFixedCost.execute({ name: "Etiqueta", amountCents: 80, scope: "PER_PRODUCT" });
        const result = await getFixedCosts.execute();

        // Assert
        const etiqueta = result.costs.filter((cost) => cost.name === "Etiqueta");
        expect(etiqueta).toEqual([{ name: "Etiqueta", amountCents: 80, scope: "PER_PRODUCT" }]);
    });
});
