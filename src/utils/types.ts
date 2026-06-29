export interface Tier {
    id: string;
    name: string;
    cost: number;
    code: string;
}

export interface Category {
    id: string;
    name: string;
    tiers: Tier[];
}

export interface Box {
    id: string;
    date: string;
    client: string;
    time: string;
    salePrice: number;
    shipping: number;
    cost: number;
}

export interface LooseItem {
    name: string;
    cost: number;
}

export interface Draft {
    client: string;
    salePrice: string;
    shipping: string;
    scan: string;
    counts: Record<string, number>;
    looseItems: LooseItem[];
}

export type Period = "today" | "week" | "month" | "custom";
