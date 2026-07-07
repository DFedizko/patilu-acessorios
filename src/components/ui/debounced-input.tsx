"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { SearchIcon } from "@/components/ui/icons/search-icon";

const DEFAULT_DEBOUNCE_MS = 100;

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue">;

interface DebouncedInputProps extends NativeInputProps {
    onDebounce: (value: string) => void;
    debounceMs?: number;
    initialValue?: string;
}

export const DebouncedInput = ({
    onDebounce,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    initialValue = "",
    className = "",
    ...inputProps
}: DebouncedInputProps) => {
    const [value, setValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onDebounceRef = useRef(onDebounce);
    useEffect(() => {
        onDebounceRef.current = onDebounce;
    });
    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        setValue(next);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onDebounceRef.current(next), debounceMs);
    };
    return (
        <div className="flex items-center gap-2 input-base px-3">
            <input
                value={value}
                onChange={handleChange}
                className={`w-full border-none bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted ${className}`}
                {...inputProps}
            />
            <SearchIcon className="size-4 shrink-0 text-ink-muted" />
        </div>
    );
};
