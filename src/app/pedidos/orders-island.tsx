"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type { OrderListItem } from "@/lib/schemas";
import { frontContainer } from "@/di/container";
import { useOrders } from "@/hooks/query/use-orders";
import { orderPackingKey } from "@/hooks/query/use-order-packing";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { dateWithOffset, spansMultipleDays, formatOrderedAt } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";
import { OrdersTableSkeleton } from "@/components/orders/skeletons/orders-table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InboxIcon } from "@/components/ui/icons/inbox-icon";

const GRID_COLS = "grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr]";

const resolveStatus = (order: OrderListItem) => {
    if (order.shipmentStatus === "CANCELLED") {
        return { label: "Cancelado", className: "bg-negative-soft text-negative" };
    }
    if (order.shipmentStatus === "SHIPPED") {
        return { label: "Enviado", className: "bg-positive-soft text-positive" };
    }
    if (order.packingStatus === "PACKED") {
        return { label: "Empacotado", className: "bg-primary-soft text-primary" };
    }
    return { label: "Pendente", className: "bg-warning-soft text-warning" };
};

const resolveActionLabel = (order: OrderListItem) => {
    if (order.shipmentStatus === "SHIPPED" || order.shipmentStatus === "CANCELLED") return null;
    return order.packingStatus === "PACKED" ? "Editar empacotamento" : "Empacotar";
};

export const OrdersIsland = () => {
    const [period, setPeriod] = usePersistedPeriod("pedidos:period", "today");
    const [customStart, setCustomStart] = useState(dateWithOffset(-6));
    const [customEnd, setCustomEnd] = useState(dateWithOffset(0));

    const params = period === "custom" ? { period: "custom" as const, from: customStart, to: customEnd } : { period };

    const { data: orders = [], isPending, isPlaceholderData } = useOrders(params);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            {period === "custom" && (
                <CustomDateRange start={customStart} end={customEnd} onStart={setCustomStart} onEnd={setCustomEnd} />
            )}
            <OrdersTable orders={orders} isPending={isPending} dimmed={isPlaceholderData} />
        </>
    );
};

interface OrdersTableProps {
    orders: OrderListItem[];
    isPending: boolean;
    dimmed: boolean;
}

const PREFETCH_STALE_TIME_MS = 60 * 1000;

const OrdersTable = ({ orders, isPending, dimmed }: OrdersTableProps) => {
    const queryClient = useQueryClient();
    const packingService = frontContainer.getPackingService();
    const categoryService = frontContainer.getCategoryService();
    const prefetchPacking = (orderId: string) => {
        queryClient.prefetchQuery({
            queryKey: orderPackingKey(orderId),
            queryFn: () => packingService.getForPacking(orderId),
            staleTime: PREFETCH_STALE_TIME_MS,
        });
        queryClient.prefetchQuery({
            queryKey: CATALOG_KEY,
            queryFn: () => categoryService.list(),
            staleTime: PREFETCH_STALE_TIME_MS,
        });
    };
    if (isPending) {
        return <OrdersTableSkeleton />;
    }
    const multiDay = spansMultipleDays(orders.map((order) => order.orderedAt));
    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<InboxIcon className="size-6" />}
                title="Nenhum pedido no período"
                description="Os pedidos das suas lives no TikTok aparecem aqui automaticamente. Ajuste o período acima para ver outras datas."
            />
        );
    }
    return (
        <div className={`transition-opacity duration-150 ${dimmed ? "opacity-60" : ""}`}>
            <DataTable>
                <DataTableHeader gridCols={GRID_COLS}>
                    <span className="text-center">Data</span>
                    <span className="text-center">Cliente</span>
                    <span className="text-center">Valor</span>
                    <span className="text-center">Frete</span>
                    <span className="text-center">Status</span>
                    <span className="text-center">Ação</span>
                </DataTableHeader>
                {orders.map((order) => {
                    const status = resolveStatus(order);
                    const actionLabel = resolveActionLabel(order);
                    return (
                        <DataTableRow key={order.orderId} gridCols={GRID_COLS}>
                            <span className="text-center font-mono text-xs text-ink-muted tabular-nums">
                                {formatOrderedAt(order.orderedAt, multiDay)}
                            </span>
                            <span className="text-center text-sm font-semibold text-ink">
                                {order.recipientName ?? order.orderNumber}
                            </span>
                            <span className="text-center font-mono text-sm text-ink tabular-nums">
                                {formatCurrency(order.saleCents / 100)}
                            </span>
                            <span className="text-center font-mono text-sm text-ink-muted tabular-nums">
                                {formatCurrency(order.shippingCents / 100)}
                            </span>
                            <span className="text-center">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
                                    {status.label}
                                </span>
                            </span>
                            <span className="text-center">
                                {actionLabel && (
                                    <Link
                                        href={`/pedidos/${order.orderId}/empacotar`}
                                        onMouseEnter={() => prefetchPacking(order.orderId)}
                                        onFocus={() => prefetchPacking(order.orderId)}
                                        className="rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary focus-ring transition-colors duration-150 hover:bg-primary hover:text-white"
                                    >
                                        {actionLabel}
                                    </Link>
                                )}
                            </span>
                        </DataTableRow>
                    );
                })}
            </DataTable>
        </div>
    );
};
