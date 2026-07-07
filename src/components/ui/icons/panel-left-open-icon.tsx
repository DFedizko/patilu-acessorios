import { Icon, type IconProps } from "@/components/ui/icon";

export const PanelLeftOpenIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m14 9 3 3-3 3" />
    </Icon>
);
