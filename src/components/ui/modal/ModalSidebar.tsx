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
    <div className="flex w-44 flex-none flex-col gap-0.5 border-r border-border bg-surface-2 p-3">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium focus-ring transition-colors duration-150 ${
                    activeTab === tab.id
                        ? "bg-surface text-primary shadow-xs"
                        : "text-ink-muted hover:bg-surface/60 hover:text-ink"
                }`}
            >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                {tab.label}
            </button>
        ))}
    </div>
);
