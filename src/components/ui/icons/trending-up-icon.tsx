import { Icon, type IconProps } from "@/components/ui/icon";

export const TrendingUpIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M16 7h6v6" />
        <path d="m22 7-8.5 8.5-5-5L2 17" />
    </Icon>
);
