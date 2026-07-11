const pad = (value: number): string => String(value).padStart(2, "0");

export const dateWithOffset = (offset = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const SAO_PAULO = "America/Sao_Paulo";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: SAO_PAULO, hour: "2-digit", minute: "2-digit" });

export const spansMultipleDays = (isoTimestamps: string[]): boolean =>
    new Set(isoTimestamps.map((iso) => dayKeyFormatter.format(new Date(iso)))).size > 1;

export const formatOrderedAt = (iso: string, multiDay: boolean): string => {
    const date = new Date(iso);
    const time = timeFormatter.format(date);
    return multiDay ? `${dateFormatter.format(date)} ${time}` : time;
};

export const currentTime = (): string => {
    const date = new Date();
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const periodReferenceDay = (from?: string): string => from ?? dateWithOffset(0);
