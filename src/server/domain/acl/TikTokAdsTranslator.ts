export class TikTokAdsTranslator {
    toAmountCents(rawSpend: string): number {
        return Math.round(parseFloat(rawSpend) * 100);
    }

    toUnavailable(): { unavailable: true } {
        return { unavailable: true };
    }
}
