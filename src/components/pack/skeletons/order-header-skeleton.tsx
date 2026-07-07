import { Shimmer } from "@/components/ui/shimmer";

const FIELDS = ["Pedido / @cliente", "Preço de venda", "Frete"];

export const OrderHeaderSkeleton = () => (
    <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3.5 panel p-4.5">
        {FIELDS.map((label) => (
            <div key={label}>
                <div className="text-xs font-medium text-ink-muted">{label}</div>
                <Shimmer className="mt-1.5" width="7rem" height="1rem" />
            </div>
        ))}
    </div>
);
