export type ZplLabelOptions = {
    heightDots: number;
    moduleWidthDots: number;
    originXDots: number;
    originYDots: number;
    printHumanReadable: boolean;
};

export interface IZplLabelRenderer {
    toZpl(input: { barcode: string; quantity: number; options: ZplLabelOptions }): string;
}
