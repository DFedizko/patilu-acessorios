"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/assets/google-logo";

const AFTER_SIGN_IN_URL = "/pedidos";

export const GoogleSignInButton = () => {
    const { signIn } = useSignIn();

    const handleSignIn = async () => {
        if (!signIn) return;
        await signIn.sso({
            strategy: "oauth_google",
            redirectCallbackUrl: "/sso-callback",
            redirectUrl: AFTER_SIGN_IN_URL,
        });
    };

    return (
        <Button variant="primary" onClick={handleSignIn} disabled={!signIn} className="gap-2.5 px-6 py-3.5 text-sm">
            <GoogleLogo size={18} />
            Entrar com Google
        </Button>
    );
};
