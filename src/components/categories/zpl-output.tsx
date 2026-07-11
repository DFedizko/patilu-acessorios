"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ZplOutputProps {
    zpl: string;
    loading: boolean;
}

const downloadZpl = (zpl: string) => {
    const blob = new Blob([zpl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "etiquetas.zpl";
    anchor.click();
    URL.revokeObjectURL(url);
};

export const ZplOutput = ({ zpl, loading }: ZplOutputProps) => {
    const isEmpty = zpl.length === 0;
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(zpl);
            toast.success("ZPL copiado");
        } catch {
            toast.error("Não foi possível copiar. Copie manualmente.");
        }
    };
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-ink-muted">ZPL gerado</span>
            <textarea
                readOnly
                value={loading ? "Gerando ZPL…" : zpl}
                placeholder="Defina as quantidades para gerar o ZPL"
                className="h-64 w-full resize-none input-base px-3 py-2.5 font-mono text-xs"
            />
            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => void copy()} disabled={isEmpty} className="px-4 py-2 text-sm">
                    Copiar ZPL
                </Button>
                <Button
                    variant="quiet"
                    onClick={() => downloadZpl(zpl)}
                    disabled={isEmpty}
                    className="px-4 py-2 text-sm"
                >
                    Baixar .zpl
                </Button>
            </div>
        </div>
    );
};
