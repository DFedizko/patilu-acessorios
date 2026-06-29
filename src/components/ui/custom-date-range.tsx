"use client";

import { Field } from "@/components/ui/field";

interface CustomDateRangeProps {
    start: string;
    end: string;
    onStart: (value: string) => void;
    onEnd: (value: string) => void;
}

export const CustomDateRange = ({ start, end, onStart, onEnd }: CustomDateRangeProps) => (
    <div className="flex items-end gap-3 panel-sm p-3.5">
        <Field label="De">
            <input
                type="date"
                value={start}
                onChange={(event) => onStart(event.target.value)}
                className="input-base px-3 py-2.5 text-sm scheme-light"
            />
        </Field>
        <Field label="Até">
            <input
                type="date"
                value={end}
                onChange={(event) => onEnd(event.target.value)}
                className="input-base px-3 py-2.5 text-sm scheme-light"
            />
        </Field>
    </div>
);
