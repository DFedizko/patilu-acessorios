import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IGetHistoryUseCase } from "./contracts/IGetHistoryUseCase";
import type { IExportHistoryUseCase, Input, Output } from "./contracts/IExportHistoryUseCase";
import type { HistoryRow } from "@/lib/schemas";

const CSV_HEADER = "Data,Cliente,Hora,Venda,Custo,CPA,Custo fixo,Margem R$,Margem %";

const pad = (n: number): string => n.toString().padStart(2, "0");

const formatMoney = (cents: number): string => (cents / 100).toFixed(2);

const escapeCell = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};

const rowToCsvLine = (row: HistoryRow): string => {
    const date = new Date(row.orderedAt);
    const data = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    const hora = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
    const cells = [
        data,
        row.recipientName ?? "",
        hora,
        formatMoney(row.saleCents),
        row.itemsCostCents !== null ? formatMoney(row.itemsCostCents) : "",
        formatMoney(row.cpaCents),
        formatMoney(row.fixedCostCents),
        row.netMarginCents !== null ? formatMoney(row.netMarginCents) : "",
        row.netMarginPct !== null ? row.netMarginPct.toFixed(2) : "",
    ];
    return cells.map(escapeCell).join(",");
};

@injectable()
export class ExportHistoryUseCase implements IExportHistoryUseCase {
    constructor(
        @inject(SYMBOLS.GetHistoryUseCase)
        private readonly getHistory: IGetHistoryUseCase,
    ) {}

    async execute(input: Input): Promise<Output> {
        const { rows } = await this.getHistory.execute(input);
        const lines = rows.map(rowToCsvLine);
        return [CSV_HEADER, ...lines].join("\n");
    }
}
