"use client";

import { formatCurrency } from "@/utils/format";
import { useOrderPacking } from "@/hooks/query/use-order-packing";
import { OrderHeaderSkeleton } from "@/components/pack/skeletons/order-header-skeleton";

interface OrderHeaderProps {
    orderId: string;
}

export const OrderHeader = ({ orderId }: OrderHeaderProps) => {
    const { data, isLoading } = useOrderPacking(orderId);
    if (isLoading) return <OrderHeaderSkeleton />;
    if (!data) return null;
    const { order } = data;
    return (
        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3.5 panel p-4.5">
            <div>
                <div className="text-xs font-medium text-ink-muted">Pedido / @cliente</div>
                <div className="mt-1 text-sm font-semibold text-ink">{order.recipientName ?? order.orderNumber}</div>
            </div>
            <div>
                <div className="text-xs font-medium text-ink-muted">Preço de venda</div>
                <div className="mt-1 font-mono text-sm font-semibold text-ink tabular-nums">
                    {formatCurrency(order.saleCents / 100)}
                </div>
            </div>
            <div>
                <div className="text-xs font-medium text-ink-muted">Frete</div>
                <div className="mt-1 font-mono text-sm font-semibold text-ink tabular-nums">
                    {formatCurrency(order.shippingCents / 100)}
                </div>
            </div>
        </div>
    );
};
