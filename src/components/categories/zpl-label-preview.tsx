"use client";

import Image from "next/image";
import { useCatalog } from "@/hooks/query/use-catalog";
import { useZplPrintStore } from "@/stores/use-zpl-print-store";

const PLACEHOLDER_FONT_SIZE = "0.625rem";

export const ZplLabelPreview = () => {
    const { data: categories } = useCatalog();
    const layout = useZplPrintStore((state) => state.layout);
    const sampleTier = (categories ?? []).flatMap((category) => category.tiers)[0];
    const textParam = layout.printHumanReadable ? "" : "?text=0";
    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">Prévia do rolo (aproximada)</span>
            <div className="flex max-w-full overflow-auto" style={{ gap: `${layout.gapCm}cm` }}>
                {Array.from({ length: layout.columns }).map((_, index) => (
                    <div
                        key={index}
                        className="flex shrink-0 items-center justify-center overflow-hidden bg-white"
                        style={{ width: `${layout.labelWidthCm}cm`, height: `${layout.labelHeightCm}cm` }}
                    >
                        {sampleTier ? (
                            <Image
                                src={`/api/tiers/${sampleTier.id}/label${textParam}`}
                                alt={`Prévia ${sampleTier.name}`}
                                width={400}
                                height={160}
                                unoptimized
                                style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }}
                            />
                        ) : (
                            <span className="text-ink-muted" style={{ fontSize: PLACEHOLDER_FONT_SIZE }}>
                                Cadastre uma faixa
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
