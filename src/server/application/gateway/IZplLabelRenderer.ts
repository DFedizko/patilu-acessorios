export type ZplLayout = {
    columns: number;
    labelWidthCm: number;
    labelHeightCm: number;
    gapCm: number;
    dpi: number;
    printHumanReadable: boolean;
};

export interface IZplLabelRenderer {
    toZpl(input: { barcodes: string[]; layout: ZplLayout }): string;
}
