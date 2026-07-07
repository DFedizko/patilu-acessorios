"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { ModalHeader } from "@/components/ui/modal/ModalHeader";
import { ModalBody } from "@/components/ui/modal/ModalBody";
import { ModalSidebar, type ModalTab } from "@/components/ui/modal/ModalSidebar";
import { ModalContent } from "@/components/ui/modal/ModalContent";
import { FixedCostTab } from "@/components/settings/fixed-cost-tab";
import { ProfileTab } from "@/components/settings/profile-tab";

type TabId = "fixed-cost" | "profile";

const TABS: ModalTab[] = [
    { id: "fixed-cost", label: "Custos fixos" },
    { id: "profile", label: "Perfil" },
];

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
    const [activeTab, setActiveTab] = useState<TabId>("fixed-cost");

    return (
        <Modal open={open} onOpenChange={onOpenChange} size="lg">
            <ModalHeader onClose={() => onOpenChange(false)}>Configurações</ModalHeader>
            <ModalBody>
                <ModalSidebar tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />
                <ModalContent>
                    {activeTab === "fixed-cost" && <FixedCostTab />}
                    {activeTab === "profile" && <ProfileTab />}
                </ModalContent>
            </ModalBody>
        </Modal>
    );
};
