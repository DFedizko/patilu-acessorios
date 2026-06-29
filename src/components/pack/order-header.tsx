"use client";

import { formatCurrency } from "@/utils/format";
import { useOrderPacking } from "@/hooks/query/use-order-packing";

interface OrderHeaderProps {
    orderId: string;
}

export const OrderHeader = ({ orderId }: OrderHeaderProps) => {
    const { data, isLoading } = useOrderPacking(orderId);
    if (isLoading) return <div className="panel p-4.5 text-sm text-muted">Carregando pedido...</div>;
    if (!data) return null;
    const { order } = data;
    return (
        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3.5 panel p-4.5">
            <div>
                <div className="text-[0.6875rem] font-semibold text-muted">Pedido / @cliente</div>
                <div className="mt-1 text-[0.9375rem] font-semibold text-ink">
                    {order.recipientName ?? order.orderNumber}
                </div>
            </div>
            <div>
                <div className="text-[0.6875rem] font-semibold text-muted">Preço de venda</div>
                <div className="mt-1 text-[0.9375rem] font-semibold text-ink">
                    {formatCurrency(order.saleCents / 100)}
                </div>
            </div>
            <div>
                <div className="text-[0.6875rem] font-semibold text-muted">Frete</div>
                <div className="mt-1 text-[0.9375rem] font-semibold text-ink">
                    {formatCurrency(order.shippingCents / 100)}
                </div>
            </div>
        </div>
    );
};
