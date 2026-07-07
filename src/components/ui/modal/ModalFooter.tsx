import type { ReactNode } from "react";

interface ModalFooterProps {
    children: ReactNode;
}

export const ModalFooter = ({ children }: ModalFooterProps) => (
    <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 pt-4 pb-6">{children}</div>
);
