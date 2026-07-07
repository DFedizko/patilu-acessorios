import type { ReactNode } from "react";

interface ModalHeaderProps {
    children: ReactNode;
    onClose?: () => void;
}

export const ModalHeader = ({ children, onClose }: ModalHeaderProps) => (
    <div className="flex items-center justify-between border-b border-border px-6 pt-6 pb-4">
        <h2 className="text-base font-semibold text-ink">{children}</h2>
        {onClose && (
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex size-8 items-center justify-center rounded-md text-ink-muted focus-ring transition-colors duration-150 hover:bg-hover hover:text-ink"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
            </button>
        )}
    </div>
);
