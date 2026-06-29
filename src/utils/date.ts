const pad = (value: number): string => String(value).padStart(2, "0");

export const dateWithOffset = (offset = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const formatShortDay = (date: string): string => {
    const parts = date.split("-");
    return `${parts[2]}/${parts[1]}`;
};

export const currentTime = (): string => {
    const date = new Date();
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const periodReferenceDay = (from?: string): string => from ?? dateWithOffset(0);
