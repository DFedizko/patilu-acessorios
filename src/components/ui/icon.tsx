import type { ReactNode } from "react";

export interface IconProps {
    className?: string;
    strokeWidth?: number;
}

interface IconBaseProps extends IconProps {
    children: ReactNode;
}

export const Icon = ({ className = "size-4.5", strokeWidth = 1.75, children }: IconBaseProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        {children}
    </svg>
);
