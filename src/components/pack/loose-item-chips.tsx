"use client";

import { usePackingStore } from "@/stores/use-packing-store";
import { formatCurrency } from "@/utils/format";
import { XIcon } from "@/components/ui/icons/x-icon";

export const LooseItemChips = () => {
    const looseItems = usePackingStore((state) => state.draft.looseItems);
    const removeLooseItem = usePackingStore((state) => state.removeLooseItem);
    if (!looseItems.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {looseItems.map((item, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full py-2 pr-2 pl-3.5 text-sm font-semibold chip"
                >
                    {item.name} · {formatCurrency(item.cost)}
                    <button
                        onClick={() => removeLooseItem(index)}
                        aria-label={`Remover ${item.name}`}
                        className="flex size-5.5 cursor-pointer items-center justify-center rounded-full border-none bg-primary/15 text-inherit transition-colors duration-150 hover:bg-primary/25"
                    >
                        <XIcon className="size-3.5" />
                    </button>
                </span>
            ))}
        </div>
    );
};
