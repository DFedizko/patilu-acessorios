import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { FixedCostsPrismaGateway } from "@/server/infrastructure/gateway/FixedCostsPrismaGateway";
import { GetFixedCostsUseCase } from "@/server/application/use-case/GetFixedCostsUseCase";
import { AddFixedCostUseCase } from "@/server/application/use-case/AddFixedCostUseCase";

describe("GetFixedCostsUseCase", () => {
    let getFixedCosts: GetFixedCostsUseCase;
    let addFixedCost: AddFixedCostUseCase;

    beforeEach(async () => {
        await truncateAll();
        const gateway = new FixedCostsPrismaGateway(testPrisma);
        getFixedCosts = new GetFixedCostsUseCase(gateway);
        addFixedCost = new AddFixedCostUseCase(gateway);
    });

    it("returns the default fixed costs when never configured", async () => {
        // Arrange — no fixed_costs row in DB

        // Act
        const result = await getFixedCosts.execute();

        // Assert
        expect(result.costs).toEqual([
            { name: "Caixa", amountCents: 300, scope: "PER_ORDER" },
            { name: "Etiqueta", amountCents: 0, scope: "PER_PRODUCT" },
        ]);
    });

    it("returns the persisted costs after Add is called", async () => {
        // Arrange
        await addFixedCost.execute({ name: "Sacola", amountCents: 150, scope: "PER_ORDER" });

        // Act
        const result = await getFixedCosts.execute();

        // Assert
        const sacola = result.costs.find((cost) => cost.name === "Sacola");
        expect(sacola).toEqual({ name: "Sacola", amountCents: 150, scope: "PER_ORDER" });
    });
});
