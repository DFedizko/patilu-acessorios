import { create } from "zustand";

const SIDEBAR_COOKIE = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const readInitialOpen = (): boolean => {
    if (typeof document === "undefined") return true;
    return !document.cookie.split("; ").includes(`${SIDEBAR_COOKIE}=false`);
};

interface SidebarState {
    open: boolean;
    toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
    open: readInitialOpen(),
    toggle: () =>
        set((state) => {
            const next = !state.open;
            document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}`;
            return { open: next };
        }),
}));
