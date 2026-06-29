"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsModal } from "@/components/settings/settings-modal";

const NAV_ITEMS: [string, string][] = [
    ["/pedidos", "Pedidos"],
    ["/history", "Histórico"],
    ["/dashboard", "Dashboard"],
    ["/categories", "Categorias"],
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <aside className="sticky top-0 h-screen w-65.5 flex-none self-start p-4 print:hidden">
                <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-4.5 shadow-[0_0.75rem_2.125rem_rgba(123,63,228,0.1)]">
                    <div className="flex items-center gap-2.75 px-1.5 pt-1.5 pb-4.5">
                        <div className="flex size-9 items-center justify-center rounded-xl font-head text-[1.1875rem] font-bold text-white brand-mark">
                            P
                        </div>
                        <span className="font-head text-base font-bold text-ink">Patilu Acessórios</span>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {NAV_ITEMS.map(([href, label]) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2.5 rounded-[0.875rem] px-3.25 py-2.75 text-sm font-semibold transition-all ${
                                        active ? "bg-primary text-white" : "text-muted hover:bg-hover"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto border-t border-line pt-3">
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="flex w-full items-center gap-2.5 rounded-[0.875rem] px-3.25 py-2.75 text-sm font-semibold text-muted transition-all hover:bg-hover hover:text-ink"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                                className="shrink-0"
                            >
                                <path
                                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Configurações
                        </button>
                    </div>
                </div>
            </aside>
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    );
};
