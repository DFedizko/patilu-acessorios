import { Icon, type IconProps } from "@/components/ui/icon";

export const XIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </Icon>
);
