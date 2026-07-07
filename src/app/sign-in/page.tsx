import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function Page() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <section className="flex w-full max-w-sm flex-col items-center gap-8 rounded-xl border border-border bg-surface p-10 shadow-xs">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-lg text-2xl font-bold text-white brand-mark">
                        P
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-ink">Patilu Acessórios</h1>
                    <p className="text-sm text-ink-muted">Acesse com a sua conta Google</p>
                </div>
                <GoogleSignInButton />
            </section>
        </div>
    );
}
