import { Icon, type IconProps } from "@/components/ui/icon";

export const CheckIcon = ({ className, strokeWidth }: IconProps) => (
    <Icon className={className} strokeWidth={strokeWidth}>
        <path d="M20 6 9 17l-5-5" />
    </Icon>
);
