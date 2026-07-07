"use client";

import { Fragment, useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconProps } from "@/components/ui/icon";
import { PackageIcon } from "@/components/ui/icons/package-icon";
import { HistoryIcon } from "@/components/ui/icons/history-icon";
import { LayoutDashboardIcon } from "@/components/ui/icons/layout-dashboard-icon";
import { TagsIcon } from "@/components/ui/icons/tags-icon";
import { SettingsIcon } from "@/components/ui/icons/settings-icon";
import { PanelLeftCloseIcon } from "@/components/ui/icons/panel-left-close-icon";
import { PanelLeftOpenIcon } from "@/components/ui/icons/panel-left-open-icon";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import { useGoToNavigation } from "@/hooks/use-go-to-navigation";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/settings/settings-modal";

const NAV_ITEMS: { href: string; label: string; icon: ComponentType<IconProps> }[] = [
    { href: "/pedidos", label: "Pedidos", icon: PackageIcon },
    { href: "/historico", label: "Histórico", icon: HistoryIcon },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/categorias", label: "Categorias", icon: TagsIcon },
];

const railWrap = (open: boolean, label: string, item: ReactNode) =>
    open ? (
        item
    ) : (
        <Tooltip content={label} side="right">
            {item}
        </Tooltip>
    );

export const Sidebar = () => {
    const pathname = usePathname();
    const open = useSidebarStore((state) => state.open);
    const toggle = useSidebarStore((state) => state.toggle);
    const [settingsOpen, setSettingsOpen] = useState(false);
    useGoToNavigation();
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                useSidebarStore.getState().toggle();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);
    return (
        <>
            <aside
                suppressHydrationWarning
                className={`group/rail sticky top-0 flex h-svh flex-none flex-col gap-1 overflow-hidden p-2 transition-[width] duration-200 ease-out print:hidden ${
                    open ? "w-64" : "w-13"
                }`}
            >
                <div className={`flex h-11 shrink-0 items-center gap-2 ${open ? "px-1.5" : "justify-center"}`}>
                    {open ? (
                        <>
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white brand-mark">
                                P
                            </span>
                            <span className="truncate text-sm font-semibold tracking-tight text-ink">
                                Patilu Acessórios
                            </span>
                            <Button
                                variant="quiet"
                                onClick={toggle}
                                ariaLabel="Fechar barra lateral"
                                ariaExpanded={true}
                                className="ml-auto size-7 shrink-0 p-0"
                            >
                                <PanelLeftCloseIcon />
                            </Button>
                        </>
                    ) : (
                        <Tooltip content="Abrir barra lateral" side="right">
                            <Button
                                variant="quiet"
                                onClick={toggle}
                                ariaLabel="Abrir barra lateral"
                                ariaExpanded={false}
                                className="size-9 p-0"
                            >
                                <span className="flex size-6 items-center justify-center rounded-md text-xs font-bold text-white brand-mark group-hover/rail:hidden">
                                    P
                                </span>
                                <PanelLeftOpenIcon className="hidden size-4.5 group-hover/rail:block" />
                            </Button>
                        </Tooltip>
                    )}
                </div>
                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map(({ href, label, icon: NavIcon }) => {
                        const active = pathname === href || pathname.startsWith(`${href}/`);
                        return (
                            <Fragment key={href}>
                                {railWrap(
                                    open,
                                    label,
                                    <Link
                                        href={href}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex h-9 items-center gap-2 rounded-md text-sm font-medium focus-ring transition-colors duration-150 ${
                                            open ? "px-2.5" : "w-9 justify-center"
                                        } ${active ? "bg-primary text-white" : "text-ink-muted hover:bg-hover hover:text-ink"}`}
                                    >
                                        <NavIcon className="size-4.5 shrink-0" />
                                        <span className={open ? "truncate" : "sr-only"}>{label}</span>
                                    </Link>,
                                )}
                            </Fragment>
                        );
                    })}
                </nav>
                <div className="mt-auto flex flex-col border-t border-border pt-2">
                    {railWrap(
                        open,
                        "Configurações",
                        <Button
                            variant="quiet"
                            onClick={() => setSettingsOpen(true)}
                            className={`h-9 gap-2 text-sm ${open ? "w-full justify-start px-2.5" : "w-9 justify-center self-center p-0"}`}
                        >
                            <SettingsIcon className="size-4.5 shrink-0" />
                            <span className={open ? "truncate" : "sr-only"}>Configurações</span>
                        </Button>,
                    )}
                </div>
            </aside>
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    );
};
