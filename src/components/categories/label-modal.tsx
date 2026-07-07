"use client";

import Image from "next/image";
import { useLabelStore } from "@/stores/use-label-store";
import { formatCurrency } from "@/utils/format";
import { Modal } from "@/components/ui/modal/Modal";
import { ModalHeader } from "@/components/ui/modal/ModalHeader";
import { ModalFooter } from "@/components/ui/modal/ModalFooter";
import { Button } from "@/components/ui/button";

export const LabelModal = () => {
    const tier = useLabelStore((state) => state.tier);
    const close = useLabelStore((state) => state.close);
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
                        <Button onClick={() => window.print()} className="px-5 py-3 text-sm">
                            Imprimir
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    );
};
