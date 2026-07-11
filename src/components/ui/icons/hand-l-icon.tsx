import { Icon, type IconProps } from "@/components/ui/icon";

export const HandLIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M8.5 5a1.25 1.25 0 0 1 2.5 0V11h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3H4.5a1.25 1.25 0 0 1 0-2.5H7V6.2a1.4 1.4 0 0 1 1.5-1.2Z" />
        <path d="M13 11.5v2" />
        <path d="M16 11.5v2" />
    </Icon>
);
