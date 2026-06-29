"use client";

import { useState } from "react";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { usePackingStore } from "@/stores/use-packing-store";
import { Button } from "@/components/ui/button";

const SCANNER_BARS = [2, 3, 1.5, 3, 2];

export const BarcodeScanner = () => {
    const [scanValue, setScanValue] = useState("");
    const increment = usePackingStore((s) => s.increment);
    const tierService = frontContainer.getTierService();

    const handleScan = (code: string) => {
        tierService
            .byBarcode(code)
            .then((tier) => {
                increment(tier.id);
                toast.success(`${tier.name} adicionado`);
            })
            .catch(() => {
                toast.error(`Código ${code} não encontrado. Continue pelo toque.`);
            });
    };

    useBarcodeScanner(handleScan);

    const handleInputScan = () => {
        const code = scanValue.trim();
        if (!code) return;
        setScanValue("");
        handleScan(code);
    };

    return (
        <div className="flex min-w-70 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-3 scan-box py-1.75 pr-1.75 pl-4">
                <span className="flex h-5 flex-none items-center gap-0.5">
                    {SCANNER_BARS.map((width, index) => (
                        <i key={index} className="block bg-primary" style={{ width, height: 18 }} />
                    ))}
                </span>
                <input
                    value={scanValue}
                    onChange={(event) => setScanValue(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleInputScan();
                        }
                    }}
                    placeholder="Bipe o leitor ou digite o código…"
                    className="flex-1 border-none bg-transparent py-2.75 text-[0.9375rem] text-ink outline-none"
                />
                <Button onClick={handleInputScan} className="px-4.5 py-2.75 text-sm">
                    Bipar
                </Button>
            </div>
        </div>
    );
};
