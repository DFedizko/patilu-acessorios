"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useLabelStore } from "@/stores/use-label-store";
import { useRenderZpl } from "@/hooks/query/useRenderZpl";
import { useZplPrintStore } from "@/stores/use-zpl-print-store";
import { formatCurrency } from "@/utils/format";
import { Modal } from "@/components/ui/modal/Modal";
import { ModalHeader } from "@/components/ui/modal/ModalHeader";
import { ModalFooter } from "@/components/ui/modal/ModalFooter";
import { Button } from "@/components/ui/button";

export const LabelModal = () => {
    const tier = useLabelStore((state) => state.tier);
    const close = useLabelStore((state) => state.close);
    const layout = useZplPrintStore((state) => state.layout);
    const payload = tier ? { items: [{ tierId: tier.id, quantity: 1 }], layout: { ...layout, columns: 1 } } : null;
    const { data, isFetching } = useRenderZpl(payload);
    const zpl = data?.zpl ?? "";
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(zpl);
            toast.success("ZPL copiado");
        } catch {
            toast.error("Não foi possível copiar. Copie manualmente.");
        }
    };
    return (
        <Modal
            open={tier !== null}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            {tier && (
                <>
                    <ModalHeader onClose={close}>
                        {tier.name} · {formatCurrency(tier.costCents / 100)}
                    </ModalHeader>
                    <div className="flex items-center justify-center p-6">
                        <Image
                            src={`/api/tiers/${tier.id}/label`}
                            alt={`Etiqueta ${tier.name}`}
                            width={400}
                            height={80}
                            unoptimized
                            style={{ width: "100%", height: "auto" }}
                        />
                    </div>
                    <ModalFooter>
                        <Button variant="ghost" onClick={close} className="px-5 py-3 text-sm">
                            Fechar
                        </Button>
                        <Button
                            onClick={() => void copy()}
                            disabled={isFetching || zpl.length === 0}
                            className="px-5 py-3 text-sm"
                        >
                            Copiar ZPL
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    );
};
