"use client";

import { useState } from "react";

interface NumberInputProps {
    value: number;
    onValueChange: (value: number) => void;
    integer?: boolean;
    min?: number;
    step?: string;
    className?: string;
}

const stripLeadingZeros = (raw: string): string => raw.replace(/^0+(?=\d)/, "");

export const NumberInput = ({
    value,
    onValueChange,
    integer = false,
    min = 0,
    step,
    className = "",
}: NumberInputProps) => {
    const [draft, setDraft] = useState(String(value));
    const [lastValue, setLastValue] = useState(value);
    if (value !== lastValue) {
        setLastValue(value);
        setDraft(String(value));
    }
    const handleChange = (raw: string) => {
        const cleaned = stripLeadingZeros(raw);
        setDraft(cleaned);
        if (cleaned === "") return;
        const parsed = integer ? Math.floor(Number(cleaned)) : Number(cleaned);
        if (Number.isNaN(parsed)) return;
        onValueChange(Math.max(min, parsed));
    };
    return (
        <input
            type="number"
            min={min}
            step={step}
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            className={className}
        />
    );
};
