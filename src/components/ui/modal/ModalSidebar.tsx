"use client";

import type { ReactNode } from "react";

export interface ModalTab {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface ModalSidebarProps {
    tabs: ModalTab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const ModalSidebar = ({ tabs, activeTab, onTabChange }: ModalSidebarProps) => (
    <div className="flex w-44 flex-none flex-col gap-0.5 border-r border-line bg-tint p-3">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 rounded-[0.875rem] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                        ? "bg-white text-primary shadow-[0_0.125rem_0.5rem_rgba(123,63,228,0.1)]"
                        : "text-muted hover:bg-white/60 hover:text-ink"
                }`}
            >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                {tab.label}
            </button>
        ))}
    </div>
);
