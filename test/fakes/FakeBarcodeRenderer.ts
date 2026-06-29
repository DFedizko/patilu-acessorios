import type { IBarcodeRenderer } from "@/server/application/gateway/IBarcodeRenderer";

export class FakeBarcodeRenderer implements IBarcodeRenderer {
    toSVG(text: string): string {
        return `<svg><text>${text}</text></svg>`;
    }
}
