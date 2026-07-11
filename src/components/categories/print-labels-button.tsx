"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PrinterIcon } from "@/components/ui/icons/printer-icon";
import { useCatalog } from "@/hooks/query/use-catalog";
import { useRenderZpl } from "@/hooks/query/useRenderZpl";
import { useZplPrintStore, type ZplLayout } from "@/stores/use-zpl-print-store";
import type { ApiCategory } from "@/service/category-service";
import type { RenderLabelsZplDTO } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal/Modal";
import { ModalHeader } from "@/components/ui/modal/ModalHeader";
import { ModalFooter } from "@/components/ui/modal/ModalFooter";
import { Button } from "@/components/ui/button";
import { ZplLabelPreview } from "@/components/categories/zpl-label-preview";
import { ZplQuantitiesGrid } from "@/components/categories/zpl-quantities-grid";
import { ZplOptionsForm } from "@/components/categories/zpl-options-form";
import { ZplOutput } from "@/components/categories/zpl-output";

const buildZplPayload = (
    categories: ApiCategory[] | undefined,
    quantities: Record<string, number>,
    layout: ZplLayout,
): RenderLabelsZplDTO | null => {
    const items = (categories ?? [])
        .flatMap((category) => category.tiers)
        .map((tier) => ({ tierId: tier.id, quantity: quantities[tier.id] ?? 0 }))
        .filter((item) => item.quantity > 0);
    if (items.length === 0) return null;
    return { items, layout };
};

const countLabels = (quantities: Record<string, number>): number =>
    Object.values(quantities).reduce((total, quantity) => total + Math.max(0, quantity), 0);

export const PrintLabelsButton = () => {
    const { data: categories } = useCatalog();
    const [open, setOpen] = useState(false);
    const quantities = useZplPrintStore((state) => state.quantities);
    const layout = useZplPrintStore((state) => state.layout);
    const saveLayout = useZplPrintStore((state) => state.saveLayout);
    const payload = buildZplPayload(categories, quantities, layout);
    const { data, isFetching } = useRenderZpl(payload);
    const zpl = data?.zpl ?? "";
    const total = countLabels(quantities);
    const handleSave = () => {
        saveLayout();
        toast.success("Tamanho salvo");
    };
    return (
        <>
            <Button variant="ghost" onClick={() => setOpen(true)} className="h-8 px-3 text-xs">
                <PrinterIcon className="size-4" />
                Imprimir etiquetas
            </Button>
            <Modal open={open} onOpenChange={setOpen} size="xxl">
                <ModalHeader onClose={() => setOpen(false)}>Imprimir etiquetas de código de barras</ModalHeader>
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="border-b border-border bg-surface-2 px-6 py-4">
                        <ZplLabelPreview />
                    </div>
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-1/2 overflow-y-auto px-6 py-4">
                            <ZplQuantitiesGrid />
                        </div>
                        <div className="flex w-1/2 flex-col gap-4 overflow-y-auto border-l border-border bg-surface-2 px-6 py-4">
                            <ZplOptionsForm />
                            <ZplOutput zpl={zpl} loading={isFetching} />
                        </div>
                    </div>
                </div>
                <ModalFooter>
                    <span className="mr-auto text-xs text-ink-muted">{total} etiqueta(s)</span>
                    <Button variant="ghost" onClick={handleSave} className="px-5 py-3 text-sm">
                        Salvar tamanho
                    </Button>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="px-5 py-3 text-sm">
                        Fechar
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
