import bwipjs from "bwip-js/node";
import type { IBarcodeRenderer } from "@/server/application/gateway/IBarcodeRenderer";

export class BwipBarcodeRenderer implements IBarcodeRenderer {
    toSVG(text: string): string {
        return bwipjs.toSVG({ bcid: "code128", text, includetext: true });
    }
}
