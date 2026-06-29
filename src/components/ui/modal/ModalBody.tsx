import type { ReactNode } from "react";

interface ModalBodyProps {
    children: ReactNode;
}

export const ModalBody = ({ children }: ModalBodyProps) => (
    <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>
);
