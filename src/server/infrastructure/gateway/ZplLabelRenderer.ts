import type { IZplLabelRenderer, ZplLayout } from "@/server/application/gateway/IZplLabelRenderer";

const CM_PER_INCH = 2.54;
const LABEL_INSET_CM = 0.2;
const BARCODE_HEIGHT_RATIO = 0.5;
const CODE128_MODULES_PER_CHAR = 11;
const CODE128_FIXED_MODULES = 35;
const MIN_MODULE_DOTS = 1;
const MAX_MODULE_DOTS = 10;
const CODE128_AUTOMATIC_MODE = "A";
const INTERPRETATION_LINE_ABOVE = "N";
const UCC_CHECK_DIGIT = "N";

export class ZplLabelRenderer implements IZplLabelRenderer {
    toZpl(input: { barcodes: string[]; layout: ZplLayout }): string {
        const dotsPerCm = input.layout.dpi / CM_PER_INCH;
        const rows = this.chunkByColumns(input.barcodes, input.layout.columns);
        return rows.map((row) => this.renderRow(row, input.layout, dotsPerCm)).join("\n");
    }

    private renderRow(row: string[], layout: ZplLayout, dotsPerCm: number): string {
        const pitchCm = layout.labelWidthCm + layout.gapCm;
        const rowHeightDots = Math.round(layout.labelHeightCm * dotsPerCm);
        const printWidthDots = Math.round((layout.columns * pitchCm - layout.gapCm) * dotsPerCm);
        const barcodeHeightDots = Math.round(layout.labelHeightCm * dotsPerCm * BARCODE_HEIGHT_RATIO);
        const insetDots = Math.round(LABEL_INSET_CM * dotsPerCm);
        const labelWidthDots = Math.round(layout.labelWidthCm * dotsPerCm);
        const humanReadable = layout.printHumanReadable ? "Y" : "N";
        const fields = row.map((barcode, index) => {
            const moduleDots = this.moduleWidthFor(barcode, labelWidthDots);
            const columnLeftDots = Math.round(index * pitchCm * dotsPerCm);
            const originX = columnLeftDots + this.centeringOffset(barcode, moduleDots, labelWidthDots);
            const barcode128 = `^BCN,${barcodeHeightDots},${humanReadable},${INTERPRETATION_LINE_ABOVE},${UCC_CHECK_DIGIT},${CODE128_AUTOMATIC_MODE}`;
            return `^FO${originX},${insetDots}^BY${moduleDots}${barcode128}^FD${barcode}^FS`;
        });
        return ["^XA", `^PW${printWidthDots}`, `^LL${rowHeightDots}`, ...fields, "^XZ"].join("\n");
    }

    private moduleWidthFor(barcode: string, labelWidthDots: number): number {
        const fitted = Math.floor(labelWidthDots / this.totalModulesFor(barcode));
        return Math.min(MAX_MODULE_DOTS, Math.max(MIN_MODULE_DOTS, fitted));
    }

    private centeringOffset(barcode: string, moduleDots: number, labelWidthDots: number): number {
        const barcodeWidthDots = moduleDots * this.totalModulesFor(barcode);
        return Math.max(0, Math.round((labelWidthDots - barcodeWidthDots) / 2));
    }

    private totalModulesFor(barcode: string): number {
        return CODE128_MODULES_PER_CHAR * barcode.length + CODE128_FIXED_MODULES;
    }

    private chunkByColumns(barcodes: string[], columns: number): string[][] {
        return barcodes.reduce<string[][]>((rows, barcode, index) => {
            const rowIndex = Math.floor(index / columns);
            const current = rows[rowIndex] ?? [];
            current.push(barcode);
            rows[rowIndex] = current;
            return rows;
        }, []);
    }
}
