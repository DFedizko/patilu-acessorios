import { Icon, type IconProps } from "@/components/ui/icon";

export const MinusIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M5 12h14" />
    </Icon>
);
