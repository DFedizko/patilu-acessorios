import { Icon, type IconProps } from "@/components/ui/icon";

export const SearchIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </Icon>
);
