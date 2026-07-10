import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { FixedCostsPrismaGateway } from "@/server/infrastructure/gateway/FixedCostsPrismaGateway";
import { GetFixedCostsUseCase } from "@/server/application/use-case/GetFixedCostsUseCase";
import { AddFixedCostUseCase } from "@/server/application/use-case/AddFixedCostUseCase";
import { RemoveFixedCostUseCase } from "@/server/application/use-case/RemoveFixedCostUseCase";

describe("RemoveFixedCostUseCase", () => {
    let getFixedCosts: GetFixedCostsUseCase;
    let addFixedCost: AddFixedCostUseCase;
    let removeFixedCost: RemoveFixedCostUseCase;

    beforeEach(async () => {
        await truncateAll();
        const gateway = new FixedCostsPrismaGateway(testPrisma);
        getFixedCosts = new GetFixedCostsUseCase(gateway);
        addFixedCost = new AddFixedCostUseCase(gateway);
        removeFixedCost = new RemoveFixedCostUseCase(gateway);
    });

    it("removes the named fixed cost from the list", async () => {
        // Arrange
        await addFixedCost.execute({ name: "Sacola", amountCents: 120, scope: "PER_ORDER" });

        // Act
        const result = await removeFixedCost.execute({ name: "Sacola" });

        // Assert
        expect(result.costs.some((cost) => cost.name === "Sacola")).toBe(false);
        const persisted = await getFixedCosts.execute();
        expect(persisted.costs.some((cost) => cost.name === "Sacola")).toBe(false);
    });
});
