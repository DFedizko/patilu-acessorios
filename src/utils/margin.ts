import type { Category, Draft } from "@/utils/types";
import { formatCurrency, formatPercent, parseNumber } from "@/utils/format";

export const computeDraftTotals = (draft: Draft, categories: Category[]) => {
    const tiers = categories.flatMap((category) => category.tiers);
    const tiersCost = tiers.reduce((total, tier) => total + (draft.counts[tier.id] ?? 0) * tier.cost, 0);
    const tiersCount = tiers.reduce((total, tier) => total + (draft.counts[tier.id] ?? 0), 0);
    const looseCost = draft.looseItems.reduce((total, item) => total + item.cost, 0);
    const itemsCost = tiersCost + looseCost;
    const count = tiersCount + draft.looseItems.length;
    const sale = parseNumber(draft.salePrice);
    const shipping = parseNumber(draft.shipping);
    const marginValue = sale - itemsCost - shipping;
    const marginPct = sale > 0 ? (marginValue / sale) * 100 : 0;
    return {
        itemsCost,
        count,
        sale,
        shipping,
        marginValue,
        marginPct,
        itemsCostFormatted: formatCurrency(itemsCost),
        saleFormatted: formatCurrency(sale),
        shippingFormatted: formatCurrency(shipping),
        marginValueFormatted: formatCurrency(marginValue),
        marginPctFormatted: formatPercent(marginPct),
        hasShipping: shipping > 0,
    };
};
