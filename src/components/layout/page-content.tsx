import type { ReactNode } from "react";

interface PageContentProps {
    children: ReactNode;
}

export const PageContent = ({ children }: PageContentProps) => (
    <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4.5 p-6">{children}</div>
    </main>
);
