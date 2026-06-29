import type { IBarcodeRenderer } from "@/server/application/gateway/IBarcodeRenderer";

const CODE128_PATTERNS = [
    "212222",
    "222122",
    "222221",
    "121223",
    "121322",
    "131222",
    "122213",
    "122312",
    "132212",
    "221213",
    "221312",
    "231212",
    "112232",
    "122132",
    "122231",
    "113222",
    "123122",
    "123221",
    "223211",
    "221132",
    "221231",
    "213212",
    "223112",
    "312131",
    "311222",
    "321122",
    "321221",
    "312212",
    "322112",
    "322211",
    "212123",
    "212321",
    "232121",
    "111323",
    "131123",
    "131321",
    "112313",
    "132113",
    "132311",
    "211313",
    "231113",
    "231311",
    "112133",
    "112331",
    "132131",
    "113123",
    "113321",
    "133121",
    "313121",
    "211331",
    "231131",
    "213113",
    "213311",
    "213131",
    "311123",
    "311321",
    "331121",
    "312113",
    "312311",
    "332111",
    "314111",
    "221411",
    "431111",
    "111224",
    "111422",
    "121124",
    "121421",
    "141122",
    "141221",
    "112214",
    "112412",
    "122114",
    "122411",
    "142112",
    "142211",
    "241211",
    "221114",
    "413111",
    "241112",
    "134111",
    "111242",
    "121142",
    "121241",
    "114212",
    "124112",
    "124211",
    "411212",
    "421112",
    "421211",
    "212141",
    "214121",
    "412121",
    "111143",
    "111341",
    "131141",
    "114113",
    "114311",
    "411113",
    "411311",
    "113141",
    "114131",
    "311141",
    "411131",
    "211412",
    "211214",
    "211232",
    "2331112",
];
const START_CODE_B = 104;
const STOP_CODE = 106;
const SHIFT_TO_SET_A = 98;
const FNC4_SET_B = 100;
const HIGH_BYTE_OFFSET = 128;
const SET_B_OFFSET = 32;
const SET_A_CONTROL_OFFSET = 64;
const CHECKSUM_MODULO = 103;
const MODULE_WIDTH = 2;
const BAR_HEIGHT = 60;
const QUIET_MODULES = 10;
const TEXT_HEIGHT = 20;

export class Code128BarcodeRenderer implements IBarcodeRenderer {
    toSVG(text: string): string {
        const codes = this.encode(text);
        const modules = codes.map((code) => CODE128_PATTERNS[code]).join("");
        const totalModules = QUIET_MODULES * 2 + this.countModules(modules);
        const width = totalModules * MODULE_WIDTH;
        const height = BAR_HEIGHT + TEXT_HEIGHT;
        const bars = this.buildBars(modules);
        return this.wrapSvg(bars, width, height, text);
    }

    private encode(text: string): number[] {
        const bytes = Array.from(new TextEncoder().encode(text));
        const codes: number[] = [START_CODE_B];
        bytes.forEach((byte) => this.pushByte(codes, byte));
        codes.push(this.checksum(codes), STOP_CODE);
        return codes;
    }

    private pushByte(codes: number[], byte: number): void {
        const isHighByte = byte >= HIGH_BYTE_OFFSET;
        if (isHighByte) codes.push(FNC4_SET_B);
        const value = isHighByte ? byte - HIGH_BYTE_OFFSET : byte;
        if (value < SET_B_OFFSET) {
            codes.push(SHIFT_TO_SET_A, value + SET_A_CONTROL_OFFSET);
            return;
        }
        codes.push(value - SET_B_OFFSET);
    }

    private checksum(codes: number[]): number {
        const sum = codes.reduce((acc, code, index) => acc + code * Math.max(index, 1), 0);
        return sum % CHECKSUM_MODULO;
    }

    private countModules(modules: string): number {
        return Array.from(modules).reduce((sum, digit) => sum + Number(digit), 0);
    }

    private buildBars(modules: string): string {
        let position = QUIET_MODULES;
        let isBar = true;
        const rects: string[] = [];
        Array.from(modules).forEach((digit) => {
            const moduleCount = Number(digit);
            if (isBar) {
                const x = position * MODULE_WIDTH;
                const barWidth = moduleCount * MODULE_WIDTH;
                rects.push(`<rect x="${x}" y="0" width="${barWidth}" height="${BAR_HEIGHT}"/>`);
            }
            position += moduleCount;
            isBar = !isBar;
        });
        return rects.join("");
    }

    private wrapSvg(bars: string, width: number, height: number, text: string): string {
        const label = this.escape(text);
        const textY = BAR_HEIGHT + TEXT_HEIGHT - 5;
        return (
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
            `<rect width="${width}" height="${height}" fill="#ffffff"/>` +
            `<g fill="#000000">${bars}</g>` +
            `<text x="${width / 2}" y="${textY}" font-family="monospace" font-size="16" text-anchor="middle" fill="#000000">${label}</text>` +
            `</svg>`
        );
    }

    private escape(text: string): string {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
