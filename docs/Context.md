# Contexto do projeto — Patilu Kits

> **Para que serve este documento:** reunir tudo que já foi discutido e decidido sobre o projeto, para iniciar uma nova sessão de conversa (Claude Cowork) sem perder contexto. O próximo passo é, a partir daqui, elaborar uma **tech spec**. Leia tudo antes de propor a spec; ao final há uma lista do que está decidido e do que ainda está em aberto.

---

## 1. O que é o produto

**Patilu Kits** é a ferramenta interna da **Patilu Acessórios**, uma loja de papelaria que vende ao vivo em lives do TikTok. O objetivo único do sistema: **saber o custo e a margem de cada kit no momento de empacotar.**

Não é ERP nem sistema de estoque tradicional. É uma ferramenta enxuta de custo/margem para um negócio cujo sortimento muda toda semana.

## 2. A dor que resolve

A loja vende a maioria dos produtos como **kits personalizados**: o cliente entra numa call durante a live e monta o próprio kit (ex.: 3 canetas + 1 caderno ou estojo). O diferencial é a novidade constante — os produtos mudam toda semana e a composição dos kits também muda de estratégia com frequência.

Problema: como os itens nunca são os mesmos, a loja **não sabe quanto custou cada kit**. Não dá pra cravar "caneta X custa Y", porque a caneta é diferente a cada compra. Resultado: vendem sem enxergar a margem.

## 3. A ideia central (modelo de domínio)

A virada de chave: **não rastrear qual item, e sim a faixa de custo do item.** Em vez de cadastrar SKU, agrupa-se tudo por preço de compra; na hora de empacotar só se conta quantos itens de cada faixa entraram na caixa.

- **Faixa de custo (tier):** rótulo que representa um preço de compra (ex.: "Caneta R$1", "Caneta R$3", "Caderno R$8"). Tem nome, categoria e custo. Marca/cor/personagem **não importam**, só o que foi pago. Criadas/editadas/excluídas livremente.
- **Categoria:** agrupamento livre das faixas (ex.: Canetas, Cadernos, Estojos, Outros), só para organizar a tela. 100% sob demanda. Ao excluir categoria com faixas dentro, as faixas vão para "Sem categoria" (não bloquear).
- **Item avulso:** item pontual com nome + custo digitados na hora, para o que não cabe em faixa (ex.: pelúcia de R$28). Princípio: item **barato, repetitivo e variável** → faixa/contagem; item **caro, raro e variável** → registro individual.
- **Kit / caixa:** sessão de empacotamento = preço de venda + frete (opcional) + contagem por faixa + avulsos → custo, taxa e margem.
- **Taxa da plataforma:** % descontado pela plataforma (TikTok) sobre a venda. Configurável, entra no cálculo da margem.

## 4. Quem usa e volume

- 1 a 2 funcionários empacotando caixas, em ritmo rápido, durante e depois da live.
- Uso principal em **celular/tablet** → tela de empacotar mobile-first, áreas de toque grandes.
- ~30 kits por live em média; pico raro acima de 100.
- Em dias cheios, **dois operadores empacotam ao mesmo tempo, em aparelhos diferentes**, e precisam ver o mesmo histórico em tempo real.

## 5. Funcionalidades

1. **Empacotar (tela principal).** Campos: pedido/@cliente, preço de venda, frete (opcional). Faixas agrupadas por categoria com botões − e + grandes. Item avulso. Painel fixo de destaque: custo dos itens, taxa, **margem em R$ e %** com cor por saúde (verde boa / amarelo atenção / vermelho baixa). Botão "Fechar caixa".
2. **Entrada por código de barras (opcional).** O leitor funciona como teclado e digita no campo; o código representa o **id da faixa**, não o item. Bipar e tocar convivem; o toque nunca deixa de funcionar.
3. **Histórico do dia.** Resumo (nº de kits, receita, custo, lucro, margem média) + lista das caixas + **exportar para Excel/CSV**.
4. **Dashboard.** Seletor de período (hoje / semana / mês / personalizado). Receita, custo, lucro, margem média, nº de kits. Gráfico de margem ao longo do tempo e custo por categoria.
5. **Categorias e faixas (ajustes).** CRUD de categorias e faixas. Geração de etiqueta de código de barras por faixa. Configuração da taxa % da plataforma.

**Ordem de construção sugerida:** categorias + montador de kit + export Excel primeiro (entrega a margem, que é o objetivo nº 1); dashboard depois de algumas semanas de dados; código de barras por último (mais barato de acoplar e menos essencial).

## 6. Escopo — o que NÃO é

- **Não** emite nota fiscal, **não** gera etiqueta dos Correios, **não** controla SKU individual. Isso é melhor feito por ferramentas de prateleira (Bling/Tiny) ou manualmente.
- O que justifica software próprio é **apenas** a lógica de custo por faixa para kits variáveis.

## 7. Decisão sobre código de barras (contexto da discussão)

A ideia inicial era imprimir e colar código de barras por item. Concluímos que **contar é melhor que bipar** para este caso, porque: etiquetar centenas de itens por compra não escala; superfícies curvas/brilhantes leem mal; sem SKU estável (novidade constante) o código não se reaproveita; e bipar um "cartão por faixa" na bancada é igual a apertar +/− com passos a mais. Código de barras só compensa com código de fábrica em item estável — não é o caso.

Por isso o código de barras entra como **opção**, nunca obrigatório. Detalhes técnicos: o leitor é um "keyboard wedge" (digita o código + Enter, sem driver/SDK/API); gerar etiquetas Code128 é grátis com biblioteca aberta; leitor de entrada custa ~R$100–200. Dá pra testar de graça com a câmera do celular antes de comprar.

## 8. Direção visual

Ferramenta de trabalho de uma papelaria fofa, mas organizada e legível — nada infantil a ponto de atrapalhar. O **número da margem é o elemento de destaque** (grande, vivo, mudando de cor). Paleta: base clara levemente lilás, tinta violeta escura, violeta como cor principal, rosa como acento; verde/amarelo/vermelho reservados só para a saúde da margem. Tipografia: display arredondada com moderação (ex.: Baloo 2) + sans limpa para corpo/números (ex.: Inter, números tabulares). Já existe um protótipo visual feito no Claude Design.

## 9. Infraestrutura e stack

**Objetivo:** melhor performance possível sendo **100% gratuito**, com usuários no Brasil (São Paulo). Princípio que rege a performance: manter **usuário + backend + banco todos perto de São Paulo** (cada salto Brasil↔EUA custa ~120 ms; várias queries por request acumulam segundos).

**Framework:** Next.js fullstack (front + back no mesmo projeto). É a recomendação, pela popularidade, suporte e integração com o Clerk. Ressalva: no Cloudflare exige o adaptador OpenNext (atrito operacional, hoje com a lacuna de compatibilidade praticamente fechada — cobre Next 16 e versões recentes da 14/15). Alternativas de menor atrito no Cloudflare seriam SvelteKit ou Remix/React Router, mas Next fica como padrão.

**Vercel está descartado:** o plano grátis (Hobby) é **não-comercial**, e isto é ferramenta de um negócio que gera receita → violaria os termos. Pro custa US$20/mês.

**Dois caminhos grátis viáveis:**

- **A — melhor performance:** **Cloudflare Pages/Workers** (roda na borda perto de SP, 100 mil req/dia no grátis, sem cobrança de banda, uso comercial permitido) + **Neon Postgres em São Paulo** (sa-east-1; free tier inclui essa região; 0,5 GB, 100 CU-hours/mês, scale-to-zero; uso comercial OK; sem cartão) + **Hyperdrive** (grátis no Workers; mantém conexões Postgres já abertas e cacheia queries, eliminando o custo de round-trip; funciona com o Neon sem mudar código) + **Clerk** (auth; grátis até 50 mil usuários ativos/mês). CI/CD nativo via GitHub (push na `main` → deploy). Tradeoffs do grátis: adaptador OpenNext (operação) e limite de 10 ms de CPU por invocação + 100 mil req/dia (folgado para uso interno de 1–2 pessoas).
- **B — mais simples:** **Netlify** grátis (uso comercial OK, adaptador Next oficial, zero-config) + **Neon em Ohio (us-east-2)** — porque o Netlify grátis **trava a função em Ohio** (escolher região é só no Pro), então co-loca-se banco e função em Ohio. Tradeoff: ~120 ms de salto Brasil↔EUA por request (página um pouco mais lenta; queries internas rápidas). Usável para ferramenta interna.

**Auth:** Clerk (preferência do dono; free tier de 50 mil MAU cobre de sobra 1–2 usuários).

**Banco:** Neon (Postgres padrão, funciona com Prisma/Drizzle, branching, scale-to-zero). Único "atraso" do grátis é o cold start (~0,5–2 s na primeira query após ociosidade) — mitigar mantendo o banco acordado em horário de live.

**O que NÃO usar agora:** Redis/Upstash. Para 1–2 usuários é otimização prematura e nem resolve o cold start do Neon. Existe free tier (256 MB, 500 mil comandos/mês) se um dia precisar.

**CI/CD:** integração nativa Git do host (push na `main` → deploy automático), de graça. GitHub Actions (minutos grátis) só se quiser rodar testes antes do deploy.

## 10. Princípios de desenvolvimento

- **Dados num banco de verdade, com backup.** Nunca storage do navegador: dado de venda não pode sumir ao limpar cache, e dois operadores em aparelhos diferentes precisam ver o mesmo histórico em tempo real.
- Tela de empacotar é o coração: **velocidade e simplicidade** acima de tudo; margem é o destaque.
- Código de barras é opção de entrada, nunca obrigatório.
- Tudo em PT-BR, valores em Real (R$).

## 11. Fluxo de trabalho do projeto

Protótipo visual feito no Claude Design → próximo passo é **handoff para o Claude Code** construir. Divisão de papéis: usar o Claude (chat/Cowork) para **arquitetura, tech spec e revisão**; usar o Claude Code para **construir** (escreve arquivos, roda, testa, faz deploy no repositório). O projeto/repositório já foi criado.

---

## 12. Status das decisões

**Decidido:**
- Produto, dor, modelo de domínio (faixas, item avulso, categorias sob demanda) e funcionalidades.
- Código de barras como opção, não obrigatório.
- Next.js fullstack como framework.
- Clerk para auth; Neon (Postgres) para banco.
- Persistência em banco + multi-dispositivo (sem storage de navegador).
- Vercel descartado por ser não-comercial no grátis.
- Direção visual (protótipo no Claude Design).

**Em aberto (para a tech spec resolver):**
- Caminho de host: **A (Cloudflare, melhor performance)** vs **B (Netlify, mais simples)**.
- ORM (Prisma vs Drizzle) e modelagem das tabelas (faixas, categorias, kits, itens do kit, avulsos, config de taxa).
- Como tratar o cold start do Neon em horário de live (warm-up agendado?).
- Formato do export (CSV simples vs .xlsx formatado).
- Esquema de multi-usuário/permissões (são 1–2 operadores; precisa de papéis?).