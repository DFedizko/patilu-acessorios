export interface BarcodeBar {
    width: number;
    filled: boolean;
}

const BAR_LENGTH = 28;

export const generateBarcodeBars = (code: string): BarcodeBar[] => {
    const sequence = (code + code + code).slice(0, BAR_LENGTH);
    return [...sequence].flatMap((char) => {
        const digit = parseInt(char, 10);
        const barWidth = ((Number.isNaN(digit) ? 2 : digit) % 4) + 1.5;
        const gapWidth = ((Number.isNaN(digit) ? 1 : 9 - digit) % 3) + 1.5;
        return [
            { width: barWidth, filled: true },
            { width: gapWidth, filled: false },
        ];
    });
};
