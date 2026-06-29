export const parseNumber = (value: string | number | null | undefined): number => {
    if (value == null) return 0;
    const parsed = parseFloat(String(value).replace(/\s/g, "").replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (value: number): string =>
    Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatPercent = (value: number): string => `${(Math.round(value * 10) / 10).toLocaleString("pt-BR")}%`;
