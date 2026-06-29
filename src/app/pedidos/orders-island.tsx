"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrderListItem } from "@/lib/schemas";
import type { Period } from "@/utils/types";
import { useOrders } from "@/hooks/query/use-orders";
import { dateWithOffset } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";

const GRID_COLS = "grid-cols-[1.5fr_1fr_1fr_0.7fr_1fr_1.2fr]";

const formatOrderTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const resolveStatus = (order: OrderListItem) => {
    if (order.shipmentStatus === "SHIPPED") {
        return { label: "Enviado", className: "bg-emerald-100 text-emerald-700" };
    }
    if (order.packingStatus === "PACKED") {
        return { label: "Empacotado", className: "bg-violet-100 text-violet-700" };
    }
    return { label: "Pendente", className: "bg-amber-100 text-amber-700" };
};

const resolveActionLabel = (order: OrderListItem) => {
    if (order.shipmentStatus === "SHIPPED") return null;
    return order.packingStatus === "PACKED" ? "Editar empacotamento" : "Empacotar";
};

export const OrdersIsland = () => {
    const [period, setPeriod] = useState<Period>("today");
    const [customStart, setCustomStart] = useState(dateWithOffset(-6));
    const [customEnd, setCustomEnd] = useState(dateWithOffset(0));

    const params = period === "custom" ? { period: "custom" as const, from: customStart, to: customEnd } : { period };

    const { data: orders = [], isPending } = useOrders(params);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            {period === "custom" && (
                <CustomDateRange start={customStart} end={customEnd} onStart={setCustomStart} onEnd={setCustomEnd} />
            )}
            <OrdersTable orders={orders} isPending={isPending} />
        </>
    );
};

interface OrdersTableProps {
    orders: OrderListItem[];
    isPending: boolean;
}

const OrdersTable = ({ orders, isPending }: OrdersTableProps) => {
    if (isPending) {
        return <div className="panel px-4.5 py-8 text-center text-sm text-muted">Carregando pedidos…</div>;
    }
    if (orders.length === 0) {
        return (
            <div className="panel px-4.5 py-8 text-center text-sm text-muted">
                Nenhum pedido encontrado para o período selecionado.
            </div>
        );
    }
    return (
        <DataTable>
            <DataTableHeader gridCols={GRID_COLS}>
                <span>Cliente</span>
                <span className="text-right">Valor</span>
                <span className="text-right">Frete</span>
                <span>Hora</span>
                <span>Status</span>
                <span>Ação</span>
            </DataTableHeader>
            {orders.map((order) => {
                const status = resolveStatus(order);
                const actionLabel = resolveActionLabel(order);
                return (
                    <DataTableRow key={order.orderId} gridCols={GRID_COLS}>
                        <span className="text-sm font-semibold text-ink">
                            {order.recipientName ?? order.orderNumber}
                        </span>
                        <span className="text-right text-sm text-ink tabular-nums">
                            {formatCurrency(order.saleCents / 100)}
                        </span>
                        <span className="text-right text-sm text-muted tabular-nums">
                            {formatCurrency(order.shippingCents / 100)}
                        </span>
                        <span className="text-[0.8125rem] text-muted tabular-nums">
                            {formatOrderTime(order.orderedAt)}
                        </span>
                        <span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.className}`}>
                                {status.label}
                            </span>
                        </span>
                        <span>
                            {actionLabel && (
                                <Link
                                    href={`/pedidos/${order.orderId}/empacotar`}
                                    className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                                >
                                    {actionLabel}
                                </Link>
                            )}
                        </span>
                    </DataTableRow>
                );
            })}
        </DataTable>
    );
};
