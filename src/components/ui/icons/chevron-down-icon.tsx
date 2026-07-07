import { Icon, type IconProps } from "@/components/ui/icon";

export const ChevronDownIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="m6 9 6 6 6-6" />
    </Icon>
);
