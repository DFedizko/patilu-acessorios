import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-3xl border border-line bg-white p-10 shadow-[0_0.75rem_2.125rem_rgba(123,63,228,0.1)]">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-2xl font-head text-2xl font-bold text-white brand-mark">
                        P
                    </div>
                    <h1 className="font-head text-xl font-bold text-ink">Patilu Acessórios</h1>
                    <p className="text-sm text-muted">Acesse com a sua conta Google</p>
                </div>
                <GoogleSignInButton />
            </div>
        </div>
    );
}
