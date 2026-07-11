"use client";

import Image from "next/image";
import { useCatalog } from "@/hooks/query/use-catalog";
import { useZplPrintStore } from "@/stores/use-zpl-print-store";

const PLACEHOLDER_FONT_SIZE = "0.625rem";
const CM_PER_INCH = 2.54;
const CODE128_MODULES_PER_CHAR = 11;
const CODE128_FIXED_MODULES = 35;
const MIN_MODULE_DOTS = 1;
const MAX_MODULE_DOTS = 10;
const BARCODE_HEIGHT_RATIO = 0.5;

const printedBarcodeWidthCm = (barcode: string, labelWidthCm: number, dpi: number): number => {
    const dotsPerCm = dpi / CM_PER_INCH;
    const totalModules = CODE128_MODULES_PER_CHAR * barcode.length + CODE128_FIXED_MODULES;
    const labelWidthDots = Math.round(labelWidthCm * dotsPerCm);
    const fitted = Math.floor(labelWidthDots / totalModules);
    const moduleDots = Math.min(MAX_MODULE_DOTS, Math.max(MIN_MODULE_DOTS, fitted));
    return (moduleDots * totalModules) / dotsPerCm;
};

export const ZplLabelPreview = () => {
    const { data: categories } = useCatalog();
    const layout = useZplPrintStore((state) => state.layout);
    const sampleTier = (categories ?? []).flatMap((category) => category.tiers)[0];
    const textParam = layout.printHumanReadable ? "" : "?text=0";
    const barcodeWidthCm = sampleTier ? printedBarcodeWidthCm(sampleTier.barcode, layout.labelWidthCm, layout.dpi) : 0;
    const barcodeHeightCm = layout.labelHeightCm * BARCODE_HEIGHT_RATIO;
    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">
                Prévia do rolo — barcode {barcodeWidthCm.toFixed(2)}cm em etiqueta {layout.labelWidthCm}cm
            </span>
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
                                style={{ width: `${barcodeWidthCm}cm`, height: `${barcodeHeightCm}cm` }}
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
