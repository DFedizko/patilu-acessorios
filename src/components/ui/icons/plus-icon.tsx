import { Icon, type IconProps } from "@/components/ui/icon";

export const PlusIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </Icon>
);
