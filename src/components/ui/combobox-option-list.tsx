"use client";

import { CheckIcon } from "@/components/ui/icons/check-icon";
import type { ComboboxOption } from "@/components/ui/combobox";

interface ComboboxOptionListProps {
    options: ComboboxOption[];
    value: string | null;
    emptyMessage: string;
    onSelect: (value: string) => void;
}

export const ComboboxOptionList = ({ options, value, emptyMessage, onSelect }: ComboboxOptionListProps) => {
    if (options.length === 0) {
        return <li className="px-3 py-2 text-sm text-ink-muted">{emptyMessage}</li>;
    }
    return options.map((option) => (
        <li key={option.value} role="option" aria-selected={option.value === value}>
            <button
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm text-ink hover:bg-hover"
            >
                {option.label}
                {option.value === value && <CheckIcon className="size-4 text-primary" />}
            </button>
        </li>
    ));
};
