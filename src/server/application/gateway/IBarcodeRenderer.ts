export interface IBarcodeRenderer {
    toSVG(text: string, options?: { showText?: boolean }): string;
}
