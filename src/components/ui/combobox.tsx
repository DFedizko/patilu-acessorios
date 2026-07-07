"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons/chevron-down-icon";
import { ComboboxOptionList } from "@/components/ui/combobox-option-list";

export interface ComboboxOption {
    label: string;
    value: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
}

export const Combobox = ({
    options,
    value,
    onChange,
    placeholder = "Selecione…",
    emptyMessage = "Nenhuma opção",
    disabled = false,
    className = "",
}: ComboboxProps) => {
    const [open, setOpen] = useState(false);
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
                <ul
                    role="listbox"
                    className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto card-base p-1 shadow-pop"
                >
                    <ComboboxOptionList options={options} value={value} emptyMessage={emptyMessage} onSelect={select} />
                </ul>
            )}
        </div>
    );
};
