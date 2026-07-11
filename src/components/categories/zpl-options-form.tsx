"use client";

import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Combobox } from "@/components/ui/combobox";
import { useZplPrintStore } from "@/stores/use-zpl-print-store";

type NumberKey = "columns" | "gapCm";

const NUMBER_FIELDS: { key: NumberKey; label: string; integer: boolean; step: string }[] = [
    { key: "columns", label: "Colunas", integer: true, step: "1" },
    { key: "gapCm", label: "Espaço entre colunas (cm)", integer: false, step: "0.1" },
];

const SIZE_OPTIONS = [
    { value: "2.3", label: "Pequena — código 1,81cm", heightCm: 1.7 },
    { value: "4.1", label: "Média — código 3,63cm", heightCm: 3 },
    { value: "5.9", label: "Grande — código 5,44cm", heightCm: 4.3 },
];

export const ZplOptionsForm = () => {
    const layout = useZplPrintStore((state) => state.layout);
    const setLayout = useZplPrintStore((state) => state.setLayout);
    const resetLayout = useZplPrintStore((state) => state.resetLayout);
    const selectSize = (value: string) => {
        const option = SIZE_OPTIONS.find((size) => size.value === value)!;
        setLayout("labelWidthCm", Number(option.value));
        setLayout("labelHeightCm", option.heightCm);
    };
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-muted">Tamanho da etiqueta</p>
                <Button variant="quiet" onClick={resetLayout} className="px-2 py-1 text-xs">
                    Restaurar padrão
                </Button>
            </div>
            <Field label="Tamanho">
                <Combobox
                    options={SIZE_OPTIONS}
                    value={String(layout.labelWidthCm)}
                    onChange={selectSize}
                    placeholder="Selecione o tamanho"
                />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                {NUMBER_FIELDS.map((field) => (
                    <Field key={field.key} label={field.label}>
                        <NumberInput
                            value={layout[field.key]}
                            onValueChange={(value) => setLayout(field.key, value)}
                            integer={field.integer}
                            min={field.integer ? 1 : 0}
                            step={field.step}
                            className="w-full input-base px-2.5 py-2 text-sm"
                        />
                    </Field>
                ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
                <input
                    type="checkbox"
                    checked={layout.printHumanReadable}
                    onChange={(event) => setLayout("printHumanReadable", event.target.checked)}
                    className="size-4"
                />
                Mostrar texto legível embaixo do código
            </label>
        </div>
    );
};
