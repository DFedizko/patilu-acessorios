"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/components/pack/barcode-scanner";
import { LooseItemForm } from "@/components/pack/loose-item-form";
import { LooseItemChips } from "@/components/pack/loose-item-chips";
import { Button } from "@/components/ui/button";

export const PackingToolbar = () => {
    const [formOpen, setFormOpen] = useState(false);
    return (
        <>
            <div className="flex flex-wrap items-start gap-3">
                <BarcodeScanner />
                <Button
                    variant="ghost"
                    onClick={() => setFormOpen((open) => !open)}
                    className="self-stretch px-5 py-3.5 text-sm"
                >
                    + Item avulso
                </Button>
            </div>
            {formOpen && <LooseItemForm onAdded={() => setFormOpen(false)} />}
            <LooseItemChips />
        </>
    );
};
