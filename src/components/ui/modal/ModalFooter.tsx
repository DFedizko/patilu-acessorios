import type { ReactNode } from "react";

interface ModalFooterProps {
    children: ReactNode;
}

export const ModalFooter = ({ children }: ModalFooterProps) => (
    <div className="flex items-center justify-end gap-2.5 px-6 pt-2 pb-6">{children}</div>
);
