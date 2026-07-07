"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const ProfileTab = () => {
    const { user } = useUser();
    const { signOut } = useClerk();

    if (!user) return null;

    const name = user.fullName ?? user.firstName ?? "Usuário";
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const imageUrl = user.imageUrl;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                {imageUrl ? (
                    <Image src={imageUrl} alt={name} width={56} height={56} className="rounded-lg object-cover" />
                ) : (
                    <div className="flex size-14 items-center justify-center rounded-lg bg-primary-soft text-xl font-semibold text-primary">
                        {name[0]?.toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">{name}</span>
                    <span className="text-sm text-ink-muted">{email}</span>
                </div>
            </div>
            <Button
                variant="dangerOutline"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
                className="self-start px-5 py-2.5 text-sm"
            >
                Sair da conta
            </Button>
        </div>
    );
};
