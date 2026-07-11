import type { IZplLabelRenderer, ZplLabelOptions } from "@/server/application/gateway/IZplLabelRenderer";

const ORIENTATION_NORMAL = "N";
const CODE128_AUTOMATIC_MODE = "A";
const INTERPRETATION_LINE_ABOVE = "N";
const UCC_CHECK_DIGIT = "N";
const PRINT_QUANTITY_TRAILING = "0,0,N";

export class ZplLabelRenderer implements IZplLabelRenderer {
    toZpl(input: { barcode: string; quantity: number; options: ZplLabelOptions }): string {
        const humanReadable = input.options.printHumanReadable ? "Y" : "N";
        return [
            "^XA",
            `^FO${input.options.originXDots},${input.options.originYDots}`,
            `^BY${input.options.moduleWidthDots}`,
            `^BC${ORIENTATION_NORMAL},${input.options.heightDots},${humanReadable},${INTERPRETATION_LINE_ABOVE},${UCC_CHECK_DIGIT},${CODE128_AUTOMATIC_MODE}`,
            `^FD${input.barcode}^FS`,
            `^PQ${input.quantity},${PRINT_QUANTITY_TRAILING}`,
            "^XZ",
        ].join("\n");
    }
}
