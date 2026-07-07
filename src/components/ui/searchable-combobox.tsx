"use client";

import { useEffect, useRef, useState } from "react";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { ChevronDownIcon } from "@/components/ui/icons/chevron-down-icon";
import { ComboboxOptionList } from "@/components/ui/combobox-option-list";
import type { ComboboxOption } from "@/components/ui/combobox";

interface SearchableComboboxProps {
    options: ComboboxOption[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    onSearch?: (term: string) => void;
    debounceMs?: number;
}

export const SearchableCombobox = ({
    options,
    value,
    onChange,
    placeholder = "Selecione…",
    searchPlaceholder = "Buscar…",
    emptyMessage = "Nenhuma opção",
    disabled = false,
    className = "",
    onSearch,
    debounceMs,
}: SearchableComboboxProps) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const handlePointer = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);
    const selected = options.find((option) => option.value === value);
    const visible = onSearch
        ? options
        : options.filter((option) => option.label.toLowerCase().includes(filter.toLowerCase()));
    const handleDebounce = (term: string) => {
        setFilter(term);
        if (onSearch) onSearch(term);
    };
    const select = (optionValue: string) => {
        onChange(optionValue);
        setOpen(false);
    };
    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 input-base px-3 py-2.5 text-sm disabled:opacity-50"
            >
                <span className={selected ? "text-ink" : "text-ink-muted"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className="size-4 shrink-0 text-ink-muted" />
            </button>
            {open && (
                <div className="absolute z-20 mt-1.5 flex w-full flex-col gap-1 card-base p-1 shadow-pop">
                    <DebouncedInput
                        onDebounce={handleDebounce}
                        debounceMs={debounceMs}
                        placeholder={searchPlaceholder}
                        autoFocus
                    />
                    <ul role="listbox" className="max-h-60 overflow-auto">
                        <ComboboxOptionList
                            options={visible}
                            value={value}
                            emptyMessage={emptyMessage}
                            onSelect={select}
                        />
                    </ul>
                </div>
            )}
        </div>
    );
};
