"use client";

import { useState } from "react";
import { PrinterIcon } from "@/components/ui/icons/printer-icon";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";
import { formatCurrency } from "@/utils/format";
import {
    buildLabelSheetHtml,
    buildLabelSheetPages,
    computeLabelSheetLayout,
    LABEL_SHEET_PRESETS,
    SHEET_FORMATS,
    type LabelSheetGeometry,
    type SheetLabel,
    type SheetSize,
} from "@/lib/printing/build-label-sheet";
import { Modal } from "@/components/ui/modal/Modal";
import { ModalHeader } from "@/components/ui/modal/ModalHeader";
import { ModalFooter } from "@/components/ui/modal/ModalFooter";
import { Button } from "@/components/ui/button";
import { LabelSheetPreview } from "@/components/categories/label-sheet-preview";

const GEOMETRY_FIELDS: { key: keyof LabelSheetGeometry; label: string }[] = [
    { key: "cellWidthMm", label: "Largura (mm)" },
    { key: "cellHeightMm", label: "Altura (mm)" },
    { key: "gapMm", label: "Espaço (mm)" },
    { key: "marginTopMm", label: "Margem topo (mm)" },
    { key: "marginLeftMm", label: "Margem esq. (mm)" },
];

const buildSheetLabels = (
    categories: ApiCategory[] | undefined,
    quantities: Record<string, number>,
    origin: string,
): SheetLabel[] =>
    (categories ?? []).flatMap((category) =>
        category.tiers.flatMap((tier) =>
            Array.from({ length: quantities[tier.id] ?? 0 }, (_, index) => ({
                id: `${tier.id}-${index}`,
                name: tier.name,
                cost: formatCurrency(tier.costCents / 100),
                imageUrl: `${origin}/api/tiers/${tier.id}/label`,
            })),
        ),
    );

export const PrintLabelsButton = () => {
    const { data: categories } = useCatalog();
    const [open, setOpen] = useState(false);
    const [geometry, setGeometry] = useState<LabelSheetGeometry>(LABEL_SHEET_PRESETS[0].geometry);
    const [sheetSize, setSheetSize] = useState<SheetSize>(SHEET_FORMATS[0]);
    const [startAt, setStartAt] = useState(0);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const labels = buildSheetLabels(categories, quantities, "");
    const pages = buildLabelSheetPages(labels, geometry, sheetSize, startAt);
    const layout = computeLabelSheetLayout(geometry, sheetSize);
    const applyPreset = (key: string) => {
        const preset = LABEL_SHEET_PRESETS.find((item) => item.key === key);
        if (preset) setGeometry(preset.geometry);
    };
    const applySheetFormat = (key: string) => {
        const format = SHEET_FORMATS.find((item) => item.key === key);
        if (format) setSheetSize({ widthMm: format.widthMm, heightMm: format.heightMm });
    };
    const setGeometryField = (key: keyof LabelSheetGeometry, value: string) => {
        const parsed = Math.max(0, Number(value) || 0);
        setGeometry((previous) => ({ ...previous, [key]: parsed }));
    };
    const setSheetSizeField = (key: keyof SheetSize, value: string) => {
        const parsed = Math.max(0, Number(value) || 0);
        setSheetSize((previous) => ({ ...previous, [key]: parsed }));
    };
    const setQuantity = (tierId: string, value: string) => {
        const parsed = Math.max(0, Math.floor(Number(value) || 0));
        setQuantities((previous) => ({ ...previous, [tierId]: parsed }));
    };
    const handlePrint = () => {
        if (labels.length === 0) {
            toast.warning("Selecione ao menos uma cartela para imprimir");
            return;
        }
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Permita pop-ups para imprimir as cartelas");
            return;
        }
        const printLabels = buildSheetLabels(categories, quantities, window.location.origin);
        const printPages = buildLabelSheetPages(printLabels, geometry, sheetSize, startAt);
        printWindow.document.write(buildLabelSheetHtml({ pages: printPages, geometry, sheetSize }));
        printWindow.document.close();
    };
    return (
        <>
            <Button variant="ghost" onClick={() => setOpen(true)} className="h-8 px-3 text-xs">
                <PrinterIcon className="size-4" />
                Imprimir cartelas
            </Button>
            <Modal open={open} onOpenChange={setOpen} size="xl">
                <ModalHeader onClose={() => setOpen(false)}>Imprimir cartelas de código de barras</ModalHeader>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/2 overflow-y-auto px-6 py-4">
                        <div className="mb-5">
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Tamanho da folha</label>
                            <select
                                onChange={(event) => applySheetFormat(event.target.value)}
                                className="w-full input-base px-3 py-2.5 text-sm"
                            >
                                <option value="">Personalizado</option>
                                {SHEET_FORMATS.map((format) => (
                                    <option key={format.key} value={format.key}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="mb-1 block text-xs text-ink-muted">Largura da folha (mm)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={sheetSize.widthMm}
                                        onChange={(event) => setSheetSizeField("widthMm", event.target.value)}
                                        className="w-full input-base px-2.5 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-ink-muted">Altura da folha (mm)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={sheetSize.heightMm}
                                        onChange={(event) => setSheetSizeField("heightMm", event.target.value)}
                                        className="w-full input-base px-2.5 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <label className="mt-3 mb-1 block text-xs font-semibold text-ink-muted">
                                Tamanho da cartela
                            </label>
                            <select
                                onChange={(event) => applyPreset(event.target.value)}
                                className="w-full input-base px-3 py-2.5 text-sm"
                            >
                                {LABEL_SHEET_PRESETS.map((preset) => (
                                    <option key={preset.key} value={preset.key}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-ink-muted">Tamanho de cada etiqueta na folha</p>
                            <div className="mt-3 grid grid-cols-3 gap-2.5">
                                {GEOMETRY_FIELDS.map((field) => (
                                    <div key={field.key}>
                                        <label className="mb-1 block text-xs text-ink-muted">{field.label}</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={geometry[field.key]}
                                            onChange={(event) => setGeometryField(field.key, event.target.value)}
                                            className="w-full input-base px-2.5 py-2 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2.5 text-xs text-ink-muted">
                                Cabem <span className="font-mono text-ink">{layout.columns}</span> colunas ×{" "}
                                <span className="font-mono text-ink">{layout.rows}</span> linhas por folha ({" "}
                                <span className="font-mono text-ink">{layout.perPage}</span> cartelas)
                            </p>
                            <div className="mt-3">
                                <label className="mb-1 block text-xs text-ink-muted">
                                    Começar da etiqueta nº (folha já usada)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={startAt}
                                    onChange={(event) =>
                                        setStartAt(Math.max(0, Math.floor(Number(event.target.value) || 0)))
                                    }
                                    className="w-32 input-base px-2.5 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="border-t border-border pt-4">
                            <p className="mb-2 text-xs font-semibold text-ink-muted">Quantas cartelas de cada faixa</p>
                            {(categories ?? [])
                                .filter((category) => category.tiers.length > 0)
                                .map((category) => (
                                    <div key={category.id ?? "sem-categoria"} className="mb-4">
                                        <p className="mb-1.5 text-sm font-semibold text-ink">{category.name}</p>
                                        {category.tiers.map((tier) => (
                                            <div key={tier.id} className="flex items-center gap-3 py-1.5">
                                                <span className="flex-1 text-sm text-ink">{tier.name}</span>
                                                <span className="font-mono text-sm text-ink tabular-nums">
                                                    {formatCurrency(tier.costCents / 100)}
                                                </span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={quantities[tier.id] ?? 0}
                                                    onChange={(event) => setQuantity(tier.id, event.target.value)}
                                                    className="w-20 input-base px-2.5 py-2 text-right text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="w-1/2 overflow-y-auto border-l border-border bg-surface-2 p-4">
                        <LabelSheetPreview geometry={geometry} sheetSize={sheetSize} pages={pages} />
                    </div>
                </div>
                <ModalFooter>
                    <span className="mr-auto text-xs text-ink-muted">
                        {labels.length} cartela(s) · {pages.length} folha(s)
                    </span>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="px-5 py-3 text-sm">
                        Fechar
                    </Button>
                    <Button onClick={handlePrint} disabled={labels.length === 0} className="px-5 py-3 text-sm">
                        Imprimir
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
