"use client";

import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "dangerOutline" | "ghostDanger" | "counterPlus" | "counterMinus";

interface ButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    type?: "button" | "submit";
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
}

const BASE =
    "inline-flex cursor-pointer items-center justify-center border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
    primary: "rounded-full bg-primary font-bold text-white shadow-[0_0.5rem_1.125rem_rgba(123,63,228,0.28)]",
    ghost: "rounded-full bg-ghost font-semibold text-primary-strong",
    dangerOutline: "rounded-[0.875rem] border-danger-line bg-transparent font-semibold text-danger",
    ghostDanger: "bg-transparent text-danger",
    counterPlus:
        "h-11.5 w-11.5 rounded-[0.875rem] bg-primary text-2xl leading-none font-bold text-white shadow-[0_0.375rem_0.875rem_rgba(123,63,228,0.3)]",
    counterMinus: "h-11.5 w-11.5 rounded-[0.875rem] bg-ghost text-2xl leading-none font-bold text-primary",
};

export const Button = ({
    children,
    variant = "primary",
    type = "button",
    onClick,
    className = "",
    disabled = false,
    ariaLabel,
}: ButtonProps) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
        {children}
    </button>
);
