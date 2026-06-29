import type { ReactNode } from "react";

interface ModalContentProps {
    children: ReactNode;
    className?: string;
}

export const ModalContent = ({ children, className = "" }: ModalContentProps) => (
    <div className={`flex-1 overflow-y-auto px-6 py-5 ${className}`}>{children}</div>
);
