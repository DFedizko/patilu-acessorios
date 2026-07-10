import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidade — Patilu Acessórios",
    description:
        "Como a Patilu Acessórios coleta, usa, protege e retém dados pessoais na sua operação de vendas no TikTok Shop, em conformidade com a LGPD.",
};

const SECTIONS = [
    {
        title: "1. Quem somos",
        body: "A Patilu Acessórios é uma loja de papelaria e acessórios que vende ao vivo em lives no TikTok Shop. Esta política descreve como tratamos os dados pessoais relacionados à nossa operação e à integração interna com as APIs do TikTok Shop.",
    },
    {
        title: "2. Dados que coletamos",
        body: "Coletamos apenas os dados necessários para processar e empacotar os pedidos da própria loja, obtidos automaticamente do TikTok Shop: número do pedido, nome do destinatário, valor da venda, frete, data e status de envio. Também tratamos o total de gasto com anúncios da nossa conta. Não coletamos dados além do necessário para a operação.",
    },
    {
        title: "3. Como usamos os dados",
        body: "Os dados são usados exclusivamente para operar a loja: organizar o empacotamento, calcular o custo de cada pedido, o CPA e a margem de lucro. Não vendemos, alugamos nem compartilhamos dados pessoais com terceiros para fins de marketing.",
    },
    {
        title: "4. Base legal (LGPD)",
        body: "O tratamento é feito com base na execução de contrato e no legítimo interesse da operação comercial, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
    },
    {
        title: "5. Segurança",
        body: "Aplicamos criptografia em trânsito (HTTPS/TLS) e em repouso, acesso restrito por autenticação com múltiplos fatores e privilégio mínimo, e armazenamento de credenciais em ambiente isolado. A infraestrutura roda em provedores gerenciados (Cloudflare e Neon) com proteção de rede e correção de vulnerabilidades.",
    },
    {
        title: "6. Retenção e exclusão",
        body: "Mantemos os dados apenas pelo tempo necessário à operação. Titulares podem solicitar acesso, correção ou exclusão dos seus dados a qualquer momento. Ao encerrar a operação, excluímos definitivamente os dados de clientes em nossa posse, incluindo backups.",
    },
    {
        title: "7. Direitos do titular",
        body: "Você pode solicitar a confirmação do tratamento, o acesso, a correção, a portabilidade e a exclusão dos seus dados, além de revogar consentimento, entrando em contato conosco pelo e-mail abaixo.",
    },
    {
        title: "8. Notificação de incidentes",
        body: "Em caso de violação de dados suspeita ou confirmada, notificamos os titulares afetados e o TikTok Shop pelos canais de contato, com apuração e contenção imediatas.",
    },
];

export default function Page() {
    return (
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto bg-background px-6 py-16 text-ink">
            <div className="flex w-full max-w-2xl flex-col gap-12">
                <header className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-xl text-3xl font-bold text-white brand-mark">
                        P
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Política de Privacidade</h1>
                    <p className="max-w-md text-base text-ink-muted">
                        Como a Patilu Acessórios trata os dados pessoais da sua operação de vendas no TikTok Shop.
                    </p>
                    <p className="text-sm text-ink-muted">Última atualização: 9 de julho de 2026</p>
                </header>
                {SECTIONS.map((section) => (
                    <section
                        key={section.title}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-8 shadow-xs"
                    >
                        <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                        <p className="text-sm/relaxed text-ink-muted">{section.body}</p>
                    </section>
                ))}
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-8 shadow-xs">
                    <h2 className="text-lg font-semibold tracking-tight">9. Contato</h2>
                    <p className="text-sm/relaxed text-ink-muted">
                        Para exercer seus direitos ou tirar dúvidas sobre esta política, fale com o responsável pela
                        proteção de dados:
                    </p>
                    <a
                        href="mailto:contato@patilu.com.br"
                        className="text-sm text-primary transition-colors hover:text-primary-hover"
                    >
                        contato@patilu.com.br
                    </a>
                </section>
                <footer className="text-center text-xs text-ink-muted">
                    © 2026 Patilu Acessórios. Todos os direitos reservados.
                </footer>
            </div>
        </div>
    );
}
