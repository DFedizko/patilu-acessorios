# Subtasks de implementação — Patilu Kits

> **O que é esta pasta:** a [`PRD.md`](../PRD.md) (produto) e a [`TECH_SPEC.md`](../TECH_SPEC.md) (arquitetura) quebradas em **requisitos funcionais (RF)** prontos para serem implementados por **agentes de IA**, um RF por agente. Cada arquivo `RF-XX.md` é **autocontido**: traz o contexto, o escopo fechado, o início (pré-condição), o fim (Definition of Done), os testes que o cobrem e os **trechos exatos da PRD e da TECH_SPEC** que falam daquele RF. Um agente deve conseguir abrir **só o seu `RF-XX.md`** (e os docs que ele referencia) e entregar de ponta a ponta.

## Como um agente usa esta pasta

1. **Antes de começar:** abra [`../progress-claude.txt`](../progress-claude.txt) e confirme que **todas as dependências do seu RF estão `DONE`**. Se alguma estiver `TODO`/`IN_PROGRESS`, **não comece** — pegue outro RF liberado ou aguarde.
2. **Marque início:** mude o status do seu RF para `IN_PROGRESS` em `progress-claude.txt` (com seu identificador e a data).
3. **Leia o `RF-XX.md`** inteiro. Ele referencia as seções exatas da PRD/spec — leia-as. Siga **`CLAUDE.md`** e **`AGENTS.md`** (este projeto usa um Next 16 com breaking changes; **leia os guias em `node_modules/next/dist/docs/` antes de escrever código de framework**).
4. **Implemente** exatamente o escopo do RF — nada do escopo de outro RF.
5. **Feche o RF:** rode `bun run lint` e `bun test` (quando o RF tiver testes). Só marque `DONE` quando o **DoD do RF estiver cumprido e os testes da §14.2 passarem**.
6. **Atualize `progress-claude.txt`:** status `DONE` + uma linha de notas (o que ficou pronto, arquivos-chave criados, qualquer decisão que afete RFs seguintes).

## Definition of Done (regras gerais — valem para todo RF)

- **RF de back-end:** entidades/casos de uso/rotas implementados; **schema Zod + DTO** (TECH_SPEC §6.1/§8) e **OpenAPI** (§15) atualizados; **códigos de erro** (§9) cobertos; **testes da §14.2 passando** (`bun test`). Sem `any`; `bun run lint` limpo.
- **RF de front-end `(front)`:** telas ligadas à API **via service → hook (query/mutation)** (sem seed/Zustand-mock); erros via toast (§13.2); `bun run lint` limpo. Sem suíte automatizada nesta fase (verificação manual + lint + tipo).
- **Testes** existem **apenas** para RFs de back com caso de uso e/ou entidade (§14). RFs `(front)` **não** geram testes automatizados.
- **Convenções inegociáveis:** import alias `@/*`; sem `default export` (salvo exigências do Next); 4 espaços, `printWidth` 120 (Prettier); inglês no código, PT-BR para o usuário; dinheiro sempre em centavos (`Money`).

## Mapa de execução paralela (para o humano coordenar os agentes)

> Este é o guia de **como abrir os terminais**. O `progress-claude.txt` é só **estado** (status dos RFs); a coordenação vive **aqui**. Modelo: **1 terminal/agente por trilha**. Um RF só começa quando **todas as suas deps estão `DONE`** (confira no `progress-claude.txt`).

| Lote | Pré-condição (o que precisa estar `DONE`) | Rode em paralelo                                                                        | Terminais |
| ---- | ----------------------------------------- | --------------------------------------------------------------------------------------- | --------- |
| **1**   | nada                                   | RF-01 (fundação, sozinho)                                                               | 1         |
| **2**   | RF-01                                  | RF-02 ∥ RF-03 (arquivos disjuntos)                                                      | 2         |
| **3**   | RF-02 e RF-03                          | RF-04 · **RF-05→06→07→08** (trilha sequencial) · RF-10 · RF-12                          | até 4     |
| **4**   | conforme as trilhas do Lote 3 fecham   | RF-11 (após 02,04,10) · RF-14 (após 12,05) · RF-16 (após 10,12) · RF-13 (após 02,12)    | até 4     |
| **5**   | —                                      | RF-09 (após 06,07,08,11) · RF-17 ∥ RF-18 (após 14,16) · RF-15 (após 02,07,13,14)        | até 4     |
| **6**   | —                                      | RF-19 (após 17,18)                                                                      | 1         |
| adiados | gatilho externo                        | RF-20 (acesso API BR) · RF-21 (opcional)                                                | —         |

**Detalhe lote a lote** (o que de fato roda junto):

- **Lote 1 — 1 terminal.** Só `RF-01` (base de Prisma/DI/erros; bloqueia tudo).
- **Lote 2 — 2 terminais.** `RF-02` (`src/server/infrastructure/http/*`, `src/lib/http/*`, `error-messages.ts`, `providers.tsx`) e `RF-03` (`src/lib/schemas.ts`, `src/lib/openapi.ts`, rotas de doc) tocam arquivos **disjuntos** e ambos só dependem de RF-01 → rodam juntos sem conflito.
- **Lote 3 — 4 trilhas em paralelo.** No início rodam ao mesmo tempo **RF-04 + RF-05 + RF-10 + RF-12** (o 1º RF de cada trilha). A trilha **Catálogo é sequencial** (RF-05→06→07→08: um por vez, RF-06 só após RF-05 `DONE`, etc.) e ocupa **um** terminal. RF-04/10/12 são RFs únicos: ao fechar, o terminal já pega uma trilha liberada do Lote 4 (não espera o catálogo).
- **Lote 4 — até 4 RFs independentes.** Nenhum depende de outro do mesmo lote; cada um **abre quando suas deps fecham** (liberação escalonada: RF-13 costuma abrir primeiro, RF-14 por último). Separação natural: **back** = RF-16/RF-14 (hotspots de back); **front** = RF-13/RF-11 (`src/di/*` do front). Conflito real é **back × back**.
- **Lote 5 — até 4 RFs.** **RF-17 ∥ RF-18** têm um **acoplamento suave**: ambos usam `IReportPersistenceGateway` — quem pegar primeiro **cria e anota em NOTAS**, o outro **reusa**; fora isso rodam em paralelo (um faz Histórico, outro Dashboard). RF-15 e RF-09 são **front**; RF-09 é o que mais espera (catálogo inteiro + Modal RF-11).
- **Lote 6 — 1 terminal.** `RF-19` (front de relatórios) após RF-17/18.
- **Adiados.** **RF-20** (adapter real do TikTok) só após **acesso confirmado à Partner API BR** (TECH_SPEC §17) — plugado atrás das mesmas portas, sem tocar no resto. **RF-21** (impressão direta QZ Tray) — opcional, depois de RF-08/RF-11.

**Pico de paralelismo ≈ 4 terminais** (Lotes 3 e 4). Front e back paralelizam naturalmente (árvores de arquivos disjuntas); o gargalo é a trilha sequencial do catálogo (RF-05→08).

## Grafo de dependências (resumo)

```
RF-01 ─┬─ RF-02 ── RF-03 ─┬─ RF-06 ── RF-07 ── RF-08 ── RF-09(front)
       │                  │     │        └── RF-15(front)
       │                  ├─ RF-05 (→ RF-06/07)
       │                  ├─ RF-10 ─┬─ RF-16 ─┬─ RF-17 ── RF-19(front)
       │                  │         │         └─ RF-18 ── RF-19(front)
       │                  └─ RF-12 ─┼─ RF-14 ─┴─ (RF-17/18)
       │                            ├─ RF-13(front) ── RF-15(front)
       │                            └─ RF-16
       ├─ RF-04 ── RF-11(front) ── RF-09(front)
       └─ (RF-20 adiado: depende RF-12/16 + acesso BR)   (RF-21 adiado: RF-08/11)
```

## ⚠️ Hotspots de arquivos compartilhados (evite conflitos de merge)

Vários RFs de back-end **acrescentam** a estes arquivos. **Edite-os de forma aditiva** (adicione bindings/linhas, não reescreva) e, dentro de uma mesma onda, prefira **serializar** os toques nestes arquivos ou fazer merges cuidadosos:

- `src/server/di/container.ts` e `src/server/di/symbols.ts` — todo RF de back adiciona bindings/símbolos.
- `src/di/container.ts` e `src/di/symbols.ts` — todo RF de front adiciona services/hooks.
- `src/lib/schemas.ts` — cada endpoint novo adiciona um schema + DTO.
- `src/lib/openapi.ts` — cada endpoint novo registra caminho + erros.
- `src/lib/error-messages.ts` — novos códigos de erro adicionam entradas PT.
- `prisma/schema.prisma` — **só o RF-01** cria; demais RFs **não alteram** (o schema já contempla todos os models).

> Quando dois RFs de uma mesma onda precisam tocar o mesmo hotspot, o segundo agente faz **rebase/merge** das adições do primeiro (que já estará `DONE`). Por isso o `progress-claude.txt` é a fonte da verdade do que já entrou.

## Índice de arquivos

| RF    | Arquivo                  | Tipo                              | Onda   |
| ----- | ------------------------ | --------------------------------- | ------ |
| RF-01 | [`RF-01.md`](./RF-01.md) | back (fundação)                   | 0      |
| RF-02 | [`RF-02.md`](./RF-02.md) | back (infra HTTP)                 | 0      |
| RF-03 | [`RF-03.md`](./RF-03.md) | back (doc/validação)              | 0      |
| RF-04 | [`RF-04.md`](./RF-04.md) | back (auth)                       | 1      |
| RF-05 | [`RF-05.md`](./RF-05.md) | back (domínio catálogo)           | 1      |
| RF-06 | [`RF-06.md`](./RF-06.md) | back (use cases categoria)        | 1      |
| RF-07 | [`RF-07.md`](./RF-07.md) | back (use cases faixa)            | 1      |
| RF-08 | [`RF-08.md`](./RF-08.md) | back (etiqueta SVG)               | 1      |
| RF-09 | [`RF-09.md`](./RF-09.md) | **front** (Categorias)            | 2      |
| RF-10 | [`RF-10.md`](./RF-10.md) | back (config custo fixo)          | 1      |
| RF-11 | [`RF-11.md`](./RF-11.md) | **front** (Modal + Configurações) | 2      |
| RF-12 | [`RF-12.md`](./RF-12.md) | back (TikTok + Pedidos)           | 1      |
| RF-13 | [`RF-13.md`](./RF-13.md) | **front** (Pedidos)               | 3      |
| RF-14 | [`RF-14.md`](./RF-14.md) | back (empacotamento)              | 2      |
| RF-15 | [`RF-15.md`](./RF-15.md) | **front** (empacotamento)         | 3      |
| RF-16 | [`RF-16.md`](./RF-16.md) | back (relatórios-core + ads)      | 2      |
| RF-17 | [`RF-17.md`](./RF-17.md) | back (Histórico)                  | 3      |
| RF-18 | [`RF-18.md`](./RF-18.md) | back (Dashboard)                  | 3      |
| RF-19 | [`RF-19.md`](./RF-19.md) | **front** (relatórios)            | 3      |
| RF-20 | [`RF-20.md`](./RF-20.md) | back (adapter real TikTok)        | adiado |
| RF-21 | [`RF-21.md`](./RF-21.md) | front/infra (QZ Tray)             | adiado |
