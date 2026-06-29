"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrderPacking } from "@/hooks/query/use-order-packing";
import { useCatalog } from "@/hooks/query/use-catalog";
import { usePackingStore } from "@/stores/use-packing-store";
import { useSavePacking } from "@/hooks/mutation/use-save-packing";
import { useDeletePacking } from "@/hooks/mutation/use-delete-packing";
import { formatCurrency, formatPercent } from "@/utils/format";
import { Button } from "@/components/ui/button";

interface PackingSummaryBarProps {
    orderId: string;
}

export const PackingSummaryBar = ({ orderId }: PackingSummaryBarProps) => {
    const router = useRouter();
    const { data: orderPacking } = useOrderPacking(orderId);
    const { data: catalog } = useCatalog();
    const counts = usePackingStore((s) => s.draft.counts);
    const looseItems = usePackingStore((s) => s.draft.looseItems);
    const reset = usePackingStore((s) => s.reset);
    const { mutate: savePacking, isPending: isSaving } = useSavePacking(orderId);
    const { mutate: deletePacking, isPending: isDeleting } = useDeletePacking(orderId);

    const saleCents = orderPacking?.order.saleCents ?? 0;
    const shippingCents = orderPacking?.order.shippingCents ?? 0;
    const tiers = (catalog ?? []).flatMap((c) => c.tiers);
    const tiersCost = tiers.reduce((total, tier) => total + (counts[tier.id] ?? 0) * (tier.costCents / 100), 0);
    const looseCost = looseItems.reduce((total, item) => total + item.cost, 0);
    const itemsCost = tiersCost + looseCost;
    const count = tiers.reduce((total, tier) => total + (counts[tier.id] ?? 0), 0) + looseItems.length;
    const saleReais = saleCents / 100;
    const shippingReais = shippingCents / 100;
    const marginValue = saleReais - itemsCost - shippingReais;
    const marginPct = saleReais > 0 ? (marginValue / saleReais) * 100 : 0;
    const hasPacking = !!orderPacking?.packing;

    const handleSave = () => {
        const items = Object.entries(counts)
            .filter(([, qty]) => qty > 0)
            .map(([tierId, quantity]) => ({ tierId, quantity }));
        const loosePayload = looseItems.map((item) => ({ name: item.name, costReais: item.cost }));
        savePacking(
            { items, looseItems: loosePayload },
            {
                onSuccess: () => {
                    reset();
                    toast.success("Pedido empacotado com sucesso!");
                    router.push("/pedidos");
                },
            },
        );
    };

    const handleDelete = () => {
        deletePacking(undefined, { onSuccess: () => reset() });
    };

    return (
        <div className="sticky bottom-0 z-20 mt-1.5 flex items-center gap-6 floating-bar px-5 py-3.5 print:hidden">
            <div className="flex flex-wrap gap-6">
                <div>
                    <div className="text-[0.6875rem] font-semibold text-muted">Custo dos itens</div>
                    <div className="text-lg font-bold text-ink tabular-nums">{formatCurrency(itemsCost)}</div>
                </div>
                <div>
                    <div className="text-[0.6875rem] font-semibold text-muted">Itens</div>
                    <div className="text-lg font-bold text-ink tabular-nums">{count}</div>
                </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4.5">
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                        <span className="text-xs font-semibold text-muted">Margem</span>
                        <span className="font-head text-[2.875rem] leading-[.9] font-bold text-primary tabular-nums">
                            {formatCurrency(marginValue)}
                        </span>
                    </div>
                    <div className="mt-0.75 text-[0.8125rem] font-semibold text-muted">
                        {formatPercent(marginPct)} de margem
                    </div>
                </div>
                {hasPacking && (
                    <Button
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-4.5 text-sm"
                    >
                        Desfazer
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isSaving} className="px-7 py-4.5 text-base">
                    Concluir empacotamento
                </Button>
            </div>
        </div>
    );
};
