export type SheetSize = {
    widthMm: number;
    heightMm: number;
};

export type SheetFormat = SheetSize & {
    key: string;
    label: string;
};

export const SHEET_FORMATS: SheetFormat[] = [
    { key: "a4", label: "A4 (210×297mm)", widthMm: 210, heightMm: 297 },
    { key: "carta", label: "Carta (216×279mm)", widthMm: 216, heightMm: 279 },
    { key: "oficio", label: "Ofício (216×356mm)", widthMm: 216, heightMm: 356 },
];

export type LabelSheetGeometry = {
    cellWidthMm: number;
    cellHeightMm: number;
    gapMm: number;
    marginTopMm: number;
    marginLeftMm: number;
};

export type LabelSheetPreset = {
    key: string;
    label: string;
    geometry: LabelSheetGeometry;
};

export type SheetLabel = {
    id: string;
    name: string;
    cost: string;
    imageUrl: string;
};

export type LabelSheetCell = { kind: "blank" } | { kind: "label"; label: SheetLabel };

export type LabelSheetLayout = {
    rows: number;
    columns: number;
    perPage: number;
};

type BuildLabelSheetHtmlInput = {
    pages: LabelSheetCell[][];
    geometry: LabelSheetGeometry;
    sheetSize: SheetSize;
};

export const LABEL_SHEET_PRESETS: LabelSheetPreset[] = [
    {
        key: "grande",
        label: "Grande — 50×18mm",
        geometry: { cellWidthMm: 50, cellHeightMm: 18, gapMm: 2, marginTopMm: 6, marginLeftMm: 5 },
    },
    {
        key: "media",
        label: "Média — 34×14mm",
        geometry: { cellWidthMm: 34, cellHeightMm: 14, gapMm: 1.5, marginTopMm: 5, marginLeftMm: 4 },
    },
    {
        key: "pequena",
        label: "Pequena — 25×9mm",
        geometry: { cellWidthMm: 25, cellHeightMm: 9, gapMm: 1, marginTopMm: 4, marginLeftMm: 4 },
    },
];

const countFit = (usableMm: number, cellMm: number, gapMm: number): number =>
    Math.max(1, Math.floor((usableMm + gapMm) / (cellMm + gapMm)));

export const computeLabelSheetLayout = (geometry: LabelSheetGeometry, sheetSize: SheetSize): LabelSheetLayout => {
    const usableWidthMm = sheetSize.widthMm - geometry.marginLeftMm * 2;
    const usableHeightMm = sheetSize.heightMm - geometry.marginTopMm * 2;
    const columns = countFit(usableWidthMm, geometry.cellWidthMm, geometry.gapMm);
    const rows = countFit(usableHeightMm, geometry.cellHeightMm, geometry.gapMm);
    return { rows, columns, perPage: rows * columns };
};

export const buildLabelSheetPages = (
    labels: SheetLabel[],
    geometry: LabelSheetGeometry,
    sheetSize: SheetSize,
    startAt: number,
): LabelSheetCell[][] => {
    const { perPage } = computeLabelSheetLayout(geometry, sheetSize);
    const startOffset = Math.max(0, startAt);
    const cells: LabelSheetCell[] = [
        ...Array.from({ length: startOffset }, (): LabelSheetCell => ({ kind: "blank" })),
        ...labels.map((label): LabelSheetCell => ({ kind: "label", label })),
    ];
    const pageCount = Math.max(1, Math.ceil(cells.length / perPage));
    return Array.from({ length: pageCount }, (_, pageIndex) =>
        cells.slice(pageIndex * perPage, (pageIndex + 1) * perPage),
    );
};

const escapeHtml = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderCell = (cell: LabelSheetCell): string => {
    if (cell.kind === "blank") return `<div class="cell blank"></div>`;
    const { name, cost, imageUrl } = cell.label;
    return `<div class="cell"><img src="${escapeHtml(imageUrl)}" alt="" /><div class="cap">${escapeHtml(name)} · ${escapeHtml(cost)}</div></div>`;
};

const renderPage = (cells: LabelSheetCell[]): string => `<div class="sheet">${cells.map(renderCell).join("")}</div>`;

const renderStyles = (geometry: LabelSheetGeometry, sheetSize: SheetSize): string => {
    const { columns } = computeLabelSheetLayout(geometry, sheetSize);
    return `* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${sheetSize.widthMm}mm ${sheetSize.heightMm}mm; margin: 0; }
body { font-family: system-ui, -apple-system, sans-serif; }
.sheet { width: ${sheetSize.widthMm}mm; height: ${sheetSize.heightMm}mm; overflow: hidden; padding: ${geometry.marginTopMm}mm ${geometry.marginLeftMm}mm; display: grid; grid-template-columns: repeat(${columns}, ${geometry.cellWidthMm}mm); grid-auto-rows: ${geometry.cellHeightMm}mm; column-gap: ${geometry.gapMm}mm; row-gap: ${geometry.gapMm}mm; align-content: start; justify-content: center; break-after: page; }
.sheet:last-of-type { break-after: auto; }
.cell { width: ${geometry.cellWidthMm}mm; height: ${geometry.cellHeightMm}mm; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 0.5mm; break-inside: avoid; }
.cell.blank { visibility: hidden; }
.cell img { max-width: 100%; max-height: 80%; object-fit: contain; }
.cap { margin-top: 0.3mm; font-size: 2.4mm; font-weight: 700; line-height: 1; text-align: center; color: #000; }`;
};

export const buildLabelSheetHtml = ({ pages, geometry, sheetSize }: BuildLabelSheetHtmlInput): string => {
    const pagesHtml = pages.map(renderPage).join("");
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" /><title>Cartelas de código de barras</title><style>${renderStyles(geometry, sheetSize)}</style></head><body onload="window.print()" onafterprint="window.close()">${pagesHtml}</body></html>`;
};
