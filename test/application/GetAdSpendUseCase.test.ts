import "reflect-metadata";
import { beforeEach, describe, expect, it } from "bun:test";
import { GetAdSpendUseCase } from "@/server/application/use-case/GetAdSpendUseCase";
import { AdSpendResolver } from "@/server/application/service/AdSpendResolver";
import { AdSpendPrismaPersistenceGateway } from "@/server/infrastructure/gateway/AdSpendPrismaPersistenceGateway";
import type { IAdSpendPersistenceGateway } from "@/server/application/gateway/IAdSpendPersistenceGateway";
import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { Period } from "@/server/domain/value-object/Period";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";

const makeTikTokAdsGateway = (result: { amountCents: number } | { unavailable: true }): ITikTokAdsGateway => ({
    getSpend: async (_period: Period) => result,
});

describe("GetAdSpendUseCase", () => {
    let adSpendGateway: IAdSpendPersistenceGateway;

    beforeEach(async () => {
        await truncateAll();
        adSpendGateway = new AdSpendPrismaPersistenceGateway(testPrisma);
    });

    it("returns TikTok total when TikTok is available", async () => {
        // Arrange
        const useCase = new GetAdSpendUseCase(
            new AdSpendResolver(adSpendGateway, makeTikTokAdsGateway({ amountCents: 50000 })),
        );

        // Act
        const result = await useCase.execute({ period: "today" });

        // Assert
        expect(result.totalCents).toBe(50000);
        expect(result.available).toBe(true);
        expect(result.source).toBe("TIKTOK");
    });

    it("returns sum of manual days when TikTok is unavailable", async () => {
        // Arrange — insert a record mid-week (5 days ago) so it's safely inside the 7-day period
        const midWeek = new Date();
        midWeek.setDate(midWeek.getDate() - 5);
        await adSpendGateway.upsertDay(midWeek, 20000, "MANUAL");
        const useCase = new GetAdSpendUseCase(
            new AdSpendResolver(adSpendGateway, makeTikTokAdsGateway({ unavailable: true })),
        );

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result.totalCents).toBe(20000);
        expect(result.available).toBe(false);
        expect(result.source).toBe("MANUAL");
    });

    it("returns zero when TikTok unavailable and no manual data exists", async () => {
        // Arrange — empty DB, TikTok unavailable
        const useCase = new GetAdSpendUseCase(
            new AdSpendResolver(adSpendGateway, makeTikTokAdsGateway({ unavailable: true })),
        );

        // Act
        const result = await useCase.execute({ period: "week" });

        // Assert
        expect(result.totalCents).toBe(0);
        expect(result.available).toBe(false);
        expect(result.source).toBe("MANUAL");
    });
});
