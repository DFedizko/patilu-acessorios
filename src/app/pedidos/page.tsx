import { OrdersIsland } from "./orders-island";

export default function PedidosPage() {
    return (
        <div className="flex flex-col gap-4.5">
            <div>
                <h2 className="m-0 font-head text-2xl font-bold text-ink">Pedidos</h2>
                <p className="mt-1 mb-0 text-sm text-muted">Fila de pedidos do TikTok por período</p>
            </div>
            <OrdersIsland />
        </div>
    );
}
