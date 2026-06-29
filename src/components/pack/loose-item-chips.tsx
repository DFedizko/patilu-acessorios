"use client";

import { usePackingStore } from "@/stores/use-packing-store";
import { formatCurrency } from "@/utils/format";

export const LooseItemChips = () => {
    const looseItems = usePackingStore((state) => state.draft.looseItems);
    const removeLooseItem = usePackingStore((state) => state.removeLooseItem);
    if (!looseItems.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {looseItems.map((item, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full py-2 pr-2 pl-3.5 text-[0.8125rem] font-semibold chip"
                >
                    {item.name} · {formatCurrency(item.cost)}
                    <button
                        onClick={() => removeLooseItem(index)}
                        aria-label={`Remover ${item.name}`}
                        className="size-5.5 cursor-pointer rounded-full border-none bg-black/10 text-sm leading-none text-inherit"
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    );
};
