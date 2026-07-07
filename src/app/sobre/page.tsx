import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Patilu Acessórios — Papelaria e acessórios em lives no TikTok",
    description:
        "A Patilu Acessórios é uma loja de papelaria e acessórios que vende ao vivo em lives no TikTok, montando kits personalizados para cada cliente.",
};

export default function Page() {
    return (
        <div className="flex flex-1 flex-col items-center bg-background px-6 py-16 text-ink">
            <div className="flex w-full max-w-2xl flex-col gap-12">
                <header className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-xl text-3xl font-bold text-white brand-mark">
                        P
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Patilu Acessórios</h1>
                    <p className="max-w-md text-base text-ink-muted">
                        Loja de papelaria e acessórios que vende ao vivo em lives no TikTok, montando kits
                        personalizados para cada cliente.
                    </p>
                </header>
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-8 shadow-xs">
                    <h2 className="text-lg font-semibold tracking-tight">Sobre a loja</h2>
                    <p className="text-sm/relaxed text-ink-muted">
                        A Patilu Acessórios comercializa papelaria, canetas, cadernos e acessórios diversos. Durante as
                        transmissões ao vivo no TikTok, cada cliente participa da montagem do seu próprio kit,
                        escolhendo os itens que deseja. A cada semana o sortimento muda, sempre com novidades.
                    </p>
                    <p className="text-sm/relaxed text-ink-muted">
                        Nossa operação integra os pedidos e o investimento em anúncios diretamente com o TikTok Shop e o
                        TikTok for Business, garantindo agilidade no empacotamento e transparência de custos em cada
                        venda.
                    </p>
                </section>
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-8 shadow-xs">
                    <h2 className="text-lg font-semibold tracking-tight">Contato</h2>
                    <dl className="flex flex-col gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                            <dt className="text-ink-muted">E-mail</dt>
                            <dd>
                                <a
                                    href="mailto:contato@patilu.com.br"
                                    className="text-primary transition-colors hover:text-primary-hover"
                                >
                                    contato@patilu.com.br
                                </a>
                            </dd>
                        </div>
                    </dl>
                </section>
                <footer className="text-center text-xs text-ink-muted">
                    © 2026 Patilu Acessórios. Todos os direitos reservados.
                </footer>
            </div>
        </div>
    );
}
