"use client";

import Image from "next/image";
import { XIcon } from "@/components/ui/icons/x-icon";
import {
    computeLabelSheetLayout,
    type LabelSheetCell,
    type LabelSheetGeometry,
    type SheetSize,
} from "@/lib/printing/build-label-sheet";

const PREVIEW_REM_PER_MM = 0.12;

interface LabelSheetPreviewProps {
    geometry: LabelSheetGeometry;
    sheetSize: SheetSize;
    pages: LabelSheetCell[][];
}

export const LabelSheetPreview = ({ geometry, sheetSize, pages }: LabelSheetPreviewProps) => {
    const { columns } = computeLabelSheetLayout(geometry, sheetSize);
    const pageWidthRem = sheetSize.widthMm * PREVIEW_REM_PER_MM;
    const pageHeightRem = sheetSize.heightMm * PREVIEW_REM_PER_MM;
    const cellWidthRem = geometry.cellWidthMm * PREVIEW_REM_PER_MM;
    const cellHeightRem = geometry.cellHeightMm * PREVIEW_REM_PER_MM;
    const gapRem = geometry.gapMm * PREVIEW_REM_PER_MM;
    const marginTopRem = geometry.marginTopMm * PREVIEW_REM_PER_MM;
    const gridStyle = {
        top: `${marginTopRem}rem`,
        left: "50%",
        transform: "translateX(-50%)",
        gridTemplateColumns: `repeat(${columns}, ${cellWidthRem}rem)`,
        gridAutoRows: `${cellHeightRem}rem`,
        columnGap: `${gapRem}rem`,
        rowGap: `${gapRem}rem`,
    };
    return (
        <div className="flex flex-col gap-4">
            {pages.map((cells, pageIndex) => (
                <div
                    key={pageIndex}
                    className="relative mx-auto shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-xs"
                    style={{ width: `${pageWidthRem}rem`, height: `${pageHeightRem}rem` }}
                >
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-ink/75 px-2 py-0.5 font-mono text-xs text-white">
                        {pageIndex + 1}/{pages.length}
                    </span>
                    <div className="absolute grid" style={gridStyle}>
                        {cells.map((cell, cellIndex) =>
                            cell.kind === "blank" ? (
                                <div
                                    key={cellIndex}
                                    className="flex items-center justify-center rounded-sm border border-dashed border-border bg-surface-2"
                                >
                                    <XIcon className="size-3 text-ink-muted/50" />
                                </div>
                            ) : (
                                <div
                                    key={cell.label.id}
                                    className="flex flex-col items-center justify-center overflow-hidden"
                                >
                                    <div className="relative min-h-0 w-full flex-1">
                                        <Image
                                            src={cell.label.imageUrl}
                                            alt=""
                                            fill
                                            unoptimized
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                    <span className="w-full shrink-0 truncate text-center text-xs/tight text-ink">
                                        {cell.label.name}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
