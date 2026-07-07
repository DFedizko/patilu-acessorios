"use client";

interface MoneyInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const MoneyInput = ({ value, onChange, placeholder = "0,00" }: MoneyInputProps) => (
    <div className="flex items-center input-base px-3">
        <span className="text-sm font-medium text-ink-muted">R$</span>
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode="decimal"
            placeholder={placeholder}
            className="w-full border-none bg-transparent px-1.5 py-3.25 font-mono text-sm text-ink tabular-nums outline-none"
        />
    </div>
);
