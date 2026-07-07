const ROUNDED: Record<NonNullable<ShimmerProps["rounded"]>, string> = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
};

interface ShimmerProps {
    width?: string;
    height?: string;
    rounded?: "sm" | "md" | "lg" | "full";
    className?: string;
}

export const Shimmer = ({ width = "100%", height = "1rem", rounded = "md", className = "" }: ShimmerProps) => (
    <span
        aria-hidden
        className={`block animate-pulse bg-active ${ROUNDED[rounded]} ${className}`}
        style={{ width, height }}
    />
);
