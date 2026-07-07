"use client";

import type { ReactNode } from "react";

export type ButtonVariant =
    "primary" | "ghost" | "quiet" | "dangerOutline" | "ghostDanger" | "counterPlus" | "counterMinus";

interface ButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    type?: "button" | "submit";
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    ariaExpanded?: boolean;
}

const BASE =
    "inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-ring disabled:pointer-events-none disabled:opacity-50";

const PRESS = "active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
    primary: `rounded-md bg-primary font-semibold text-white hover:bg-primary-hover ${PRESS}`,
    ghost: `rounded-md bg-primary-soft font-semibold text-primary hover:bg-primary/15 ${PRESS}`,
    quiet: `rounded-md bg-transparent text-ink-muted hover:bg-hover hover:text-ink ${PRESS}`,
    dangerOutline: `rounded-md border-negative/30 bg-transparent font-semibold text-negative hover:bg-negative-soft ${PRESS}`,
    ghostDanger: `rounded-md bg-transparent text-negative hover:bg-negative-soft ${PRESS}`,
    counterPlus:
        "h-11.5 w-11.5 rounded-lg bg-primary text-2xl leading-none font-semibold text-white hover:bg-primary-hover",
    counterMinus:
        "h-11.5 w-11.5 rounded-lg bg-primary-soft text-2xl leading-none font-semibold text-primary hover:bg-primary/15",
};

export const Button = ({
    children,
    variant = "primary",
    type = "button",
    onClick,
    className = "",
    disabled = false,
    ariaLabel,
    ariaExpanded,
}: ButtonProps) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
        {children}
    </button>
);
