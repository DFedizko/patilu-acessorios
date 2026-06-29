# Spec-Driven Development (SDD) — playbook desta pasta `docs/`

> **Esta pasta aplica Spec-Driven Development.** Aqui a **especificação é a fonte da verdade**, e o código é uma _consequência_ dela — nunca o contrário. Antes de escrever qualquer linha de implementação, o problema passa por três artefatos versionados e revisados nesta ordem: **PRD → Tech Spec → Sub-tasks**. Cada artefato só nasce depois que o anterior está estável. Este `CLAUDE.md` descreve **como produzir cada um** e os padrões que mantemos consistentes entre projetos.

## Por que SDD

- **Contexto antes de código.** O LLM (e o humano) erra menos quando o "o quê", o "porquê" e o "como" estão escritos e fechados. A maior parte das falhas de agente vem de contexto faltando, não de incapacidade.
- **Artefatos como interface.** PRD, Tech Spec e Sub-tasks são contratos: o output de uma fase é o input da próxima. Isso deixa cada fase **revisável isoladamente** e permite **paralelizar a implementação** com vários agentes sem que pisem uns nos outros.
- **Decisões ficam registradas.** Toda escolha de produto (PRD) e técnica (Tech Spec) vira uma linha rastreável (Dxx / TSxx), então ninguém re-litiga o que já foi decidido.

## Princípios de escrita (valem para os 3 artefatos)

Baseado nas boas práticas da Anthropic para arquivos de contexto e em SDD:

1. **Conciso e factual.** Frases curtas, voz ativa, sem enrolação. Um agente lê isto inteiro — cada linha tem que ganhar seu espaço.
2. **Hierárquico e escaneável.** Títulos, tabelas e listas. Numere regras de negócio (RN-x.y), decisões (Dxx / TSxx) e requisitos (RF-xx) para poder referenciá-los.
3. **Uma fonte da verdade por fato.** Não duplique a mesma regra em dois lugares; referencie. Se a regra muda, muda num lugar só.
4. **Separe o "o quê/porquê" do "como".** Produto no PRD; técnica na Tech Spec. Se um documento de produto está falando de tabela de banco, está vazando escopo.
5. **Decisões explícitas, não implícitas.** Toda escolha relevante vira uma linha registrada com um id. Pendências viram uma lista de "em aberto" endereçada à próxima fase.
6. **Faça perguntas antes de escrever.** Não presuma. Entreviste o dono do produto/da arquitetura até ter conhecimento suficiente; só então redija.
7. **Idioma:** documentos e mensagens ao usuário em **PT-BR**; identificadores de código em inglês.

## O fluxo

```
        ┌─────────┐      ┌──────────────┐      ┌────────────────────────────┐
ideia → │  PRD    │  →   │  Tech Spec   │  →   │  Sub-tasks (tasks/RF-xx.md) │ → implementação
        │ produto │      │ arquitetura  │      │  + README + progress + tmpl │   (1 agente por RF)
        └─────────┘      └──────────────┘      └────────────────────────────┘
         o quê/porquê      o como               unidades executáveis e paralelizáveis
```

Cada seta é um **portão**: só avance quando o artefato anterior estiver revisado e estável. Os três são **documentos vivos** — quando uma fase posterior descobre algo, volte e atualize a anterior (e o id da decisão).

---

## Organização de `docs/` — uma pasta por feature

`docs/` guarda **uma pasta por feature**, cada uma **autossuficiente** (sua PRD, sua Tech Spec, sua `tasks/` e seu `progress-claude.txt`). O **único** arquivo solto na raiz de `docs/` é este **`CLAUDE.md`**: ele é **memória de longo prazo** — as instruções de SDD que valem para **todos** os desenvolvimentos, presentes e futuros. Assim podemos ter **múltiplas features evoluindo em paralelo**, cada uma com seus próprios artefatos, sem se misturarem.

```
docs/
├── CLAUDE.md                       ← ESTE arquivo. Memória de longo prazo: regras de SDD
│                                     para TODAS as features. O único arquivo solto na raiz.
└── features/
    ├── <nome-da-feature>/          ← uma pasta por feature (kebab-case), 100% autossuficiente
    │   ├── PRD.md                  ← produto: o quê/porquê (§1)
    │   ├── TECH_SPEC.md            ← arquitetura: o como (§2)
    │   ├── progress-claude.txt     ← rastreador de execução desta feature (§3.2)
    │   └── tasks/                  ← sub-tasks desta feature (§3)
    │       ├── _TEMPLATE.md        ← molde único das sub-tasks (§3.1)
    │       ├── README.md           ← tabela de execução paralela + grafo + hotspots + índice (§3.3)
    │       ├── RF-01.md
    │       ├── RF-02.md
    │       └── ...
    └── <outra-feature>/            ← outra feature, mesmos artefatos, isolada
        ├── PRD.md
        ├── TECH_SPEC.md
        ├── progress-claude.txt
        └── tasks/ ...
```

**Regras desta organização:**

- **`docs/CLAUDE.md` nunca mora dentro de uma feature.** É a long-term memory do SDD, compartilhada — fica sempre na raiz de `docs/`.
- **Cada feature é um silo.** PRD, Tech Spec, `tasks/`, `_TEMPLATE.md`, `README.md` e `progress-claude.txt` de uma feature falam **só** dela. Numerações (RN-x.y, TSxx, RF-xx) e o `progress-claude.txt` são **locais à feature** — RF-01 de uma feature não tem relação com RF-01 de outra.
- **O nome da pasta** descreve a feature em **kebab-case** (ex.: `features/empacotamento-e-pedidos/`, `features/integracao-tiktok/`).
- **Para criar uma feature nova:** crie `docs/features/<nome>/`, e dentro dela rode o fluxo das §1→§2→§3 (PRD → Tech Spec → `tasks/` com template + README + progress). Cada feature recomeça o ciclo do zero, guiada por este mesmo `CLAUDE.md`.
- **Os caminhos citados nas §1–§3** (`PRD.md`, `TECH_SPEC.md`, `tasks/…`, `progress-claude.txt`) são **relativos à pasta da feature** (`docs/features/<nome>/`).

> **Nota sobre o exemplo inaugural:** os artefatos de **Patilu Kits** que já produzimos vivem hoje **diretamente em `docs/`** (`docs/PRD.md`, `docs/TECH_SPEC.md`, `docs/tasks/`, `docs/progress-claude.txt`) — foram a primeira aplicação do padrão, antes desta convenção. Eles podem ser movidos para `docs/features/patilu-kits/` quando for conveniente; **daqui em diante, toda feature nova nasce sob `docs/features/<nome>/`**.

---

## 1. Como criar uma PRD

**O quê:** documento de **produto**. Descreve _o que_ o sistema faz, para quem, as **regras de negócio** e os **critérios de aceite**. **Não** entra em decisão técnica (banco, ORM, DI, hospedagem, libs) — isso é da Tech Spec.

**Como produzir:**

1. **Entreviste primeiro.** Faça rodadas de perguntas de negócio ao dono até entender o problema, o usuário e o valor. Só escreva quando o entendimento estiver completo.
2. **Abra com visão e objetivo único.** Uma frase do problema do negócio + o objetivo nº 1 do produto. Inclua métricas de sucesso de produto.
3. **Modele o domínio em linguagem de produto.** Uma tabela "Conceito | o que é | o que o sistema lembra". Sem schema físico.
4. **Defina escopo:** o que está **dentro** e, explicitamente, o que está **fora** (igualmente importante).
5. **Detalhe cada funcionalidade (F1, F2, …):** história do usuário, requisitos, **regras de negócio numeradas (RN-x.y)** e **critérios de aceite** verificáveis ("fiz X → vi Y").
6. **Registre as decisões (Dxx)** numa tabela ao final, e uma lista de **pendências para a Tech Spec**.

**Estrutura canônica** (ver exemplo real em [`PRD.md`](./PRD.md)): Visão e objetivo · Personas e uso · Modelo de domínio · Escopo (dentro/fora) · Funcionalidades (Fx com RN-x.y + critérios de aceite) · Requisitos não-funcionais · Decisões registradas (Dxx) · Pendências para a Tech Spec · Resumo do estado atual.

**Feito quando:** todo Fx tem RN numeradas e critérios de aceite; escopo fora está explícito; decisões e pendências estão tabuladas; **nenhuma** decisão técnica vazou para o documento.

---

## 2. Como criar uma Tech Spec

**O quê:** documento de **arquitetura**. Traduz a PRD em _como_ construir: camadas, contratos, modelo de dados, integrações, erros, testes. Toda regra de negócio que ela cita **mora na PRD** (referencie a RN, não a reescreva).

**Como produzir:**

1. **Entreviste tecnicamente.** Faça muitas perguntas técnicas ao dono da arquitetura (runtime, padrões, libs, testes, integrações) antes de redigir. Registre cada resposta como uma decisão **TSxx**.
2. **Consolide as decisões técnicas (TSxx)** numa tabela no topo — é o índice de "por que é assim".
3. **Descreva a arquitetura em camadas** com um diagrama ASCII e a árvore de pastas real.
4. **Especifique contratos, não implementações:** assinaturas de entidades/VOs, interfaces de repositórios/gateways, padrão de caso de uso, schemas Zod (fonte de validação **e** doc), modelo de erros (códigos + status HTTP), endpoints.
5. **Integrações atrás de interface.** Toda dependência externa entra por uma porta (interface) + um fake; o adapter real pode ser adiado. Isole o que é incerto.
6. **Defina a estratégia de testes** e os **critérios de aceite dos testes** ("o teste deve garantir que…").
7. **Liste riscos e pendências** abertos.
8. **Termine com a seção de Requisitos Funcionais (RF)** — a ponte para as sub-tasks (ver §3): cada RF com escopo, dependências, início, fim e os testes que o cobrem.

**Estrutura canônica** (ver exemplo real em [`TECH_SPEC.md`](./TECH_SPEC.md)): Decisões técnicas (TSxx) · Convenções globais · Arquitetura geral · Modelo de dados · Domínio · Camada de aplicação (casos de uso) · Repositórios e gateways · Contratos de API · Modelo de erros · Integrações · Auth · Front-end · Testes (escopo + critérios de aceite) · Documentação de API · Ordem de construção · Riscos · **Requisitos funcionais (RF)** · Mudanças no `CLAUDE.md` raiz.

**Feito quando:** cada RN da PRD tem um lar técnico; contratos e modelo de erros estão definidos; existe uma seção de RFs com escopo/início/fim/testes pronta para virar sub-tasks.

---

## 3. Como quebrar em sub-tasks

**O quê:** a seção de RFs da Tech Spec vira uma **pasta `tasks/`** com **um arquivo por RF**, cada um **autocontido** o suficiente para um agente implementar abrindo **só aquele arquivo**. É aqui que o SDD vira execução paralela com vários terminais/agentes.

A pasta `tasks/` precisa de **três coisas**, sempre:

### 3.1 Um template de sub-task — [`tasks/_TEMPLATE.md`](./tasks/_TEMPLATE.md)

Toda sub-task segue o **mesmo template**, para consistência entre agentes. O template usado neste projeto é [`tasks/_TEMPLATE.md`](./tasks/_TEMPLATE.md) e exige, em cada `RF-xx.md`:

- **Tabela de metadados:** Tipo · Onda · **Depende de** · **Habilita** · **Hotspots tocados** (arquivos compartilhados).
- **1. Objetivo** (resultado de negócio + técnico) · **2. Contexto** (por quê) · **3. Início** (pré-condições verificáveis) · **4. Escopo + Fora do escopo** (entregáveis concretos, caminhos reais) · **5. Definition of Done** · **6. Testes que cobrem o RF** · **7. Trecho literal da PRD** · **8. Trecho literal da Tech Spec** · **9. Referências**.

> **Regra de ouro do conteúdo:** nas seções 7 e 8, **cite o texto verbatim** da PRD/Tech Spec (blockquote / bloco de código), não parafraseie. O agente não deve precisar abrir os documentos inteiros — a sub-task carrega o contexto que precisa.

### 3.2 Um rastreador de progresso — [`progress-claude.txt`](./progress-claude.txt)

Crie um `progress-claude.txt` na raiz de `docs/` **no modelo deste projeto** ([`progress-claude.txt`](./progress-claude.txt)). Ele guarda **apenas estado** — é o que os **agentes** leem e marcam, e o que o **humano** consulta para ver o progresso. **Não** coloque aqui o "como coordenar / o que roda em paralelo" — isso é para o humano e vive no `README.md` (§3.3). Deve conter:

- **Cabeçalho "COMO USAR":** o protocolo (confira deps `DONE` → marque `IN_PROGRESS` → implemente → só marque `DONE` com lint limpo e testes verdes → escreva uma linha em NOTAS).
- **Os status possíveis:** `TODO | IN_PROGRESS | BLOCKED | DONE`, e a regra de ouro (um RF só começa com todas as deps `DONE`).
- **Um ponteiro** para o `tasks/README.md` (onde está o mapa de execução paralela), não o mapa em si.
- **A lista de RFs** agrupada por onda, cada linha com status + uma descrição curta + as dependências inline.
- **Um bloco NOTAS append-only:** uma linha por evento, para um agente avisar os próximos sobre decisões que os afetam.

### 3.3 Um README da pasta — [`tasks/README.md`](./tasks/README.md) com a **tabela de execução paralela**

O `tasks/README.md` orquestra tudo. **Obrigatoriamente** ele desenha a **tabela de ordem de execução / paralelismo** — o padrão que projetamos: cada **Lote** é um conjunto de RFs que pode rodar **ao mesmo tempo** (1 terminal/agente por trilha), com a **pré-condição** que o libera e a **quantidade de terminais** do pico. Use exatamente este formato:

| Lote    | Pré-condição (o que precisa estar `DONE`) | Rode em paralelo                                                                     | Terminais |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| **1**   | nada                                      | RF-01 (fundação, sozinho)                                                            | 1         |
| **2**   | RF-01 ✅                                  | RF-02 ∥ RF-03 (arquivos disjuntos)                                                   | 2         |
| **3**   | RF-02 e RF-03 ✅                          | RF-04 · RF-05→06→07→08 (trilha sequencial) · RF-10 · RF-12                           | até 4     |
| **4**   | conforme as trilhas do Lote 3 fecham      | RF-11 (após 02,04,10) · RF-14 (após 12,05) · RF-16 (após 10,12) · RF-13 (após 02,12) | até 4     |
| **5**   | —                                         | RF-09 (após 06,07,08,11) · RF-17 ∥ RF-18 (após 14,16) · RF-15 (após 02,07,13,14)     | até 4     |
| **6**   | —                                         | RF-19 (após 17,18)                                                                   | 1         |
| adiados | gatilho externo                           | RF-20 (acesso API BR) · RF-21 (opcional)                                             | —         |

> A tabela acima é a **deste projeto** (exemplo preenchido). Ao aplicar o padrão em outro lugar, reproduza **as mesmas colunas** — `Lote | Pré-condição | Rode em paralelo | Terminais` — com os RFs daquele projeto.

**Como derivar a tabela** (algoritmo): (1) monte o grafo de dependências entre RFs; (2) o **Lote N** = todo RF cujas dependências caem em lotes ≤ N−1; (3) dentro de um lote, RFs com **arquivos disjuntos** rodam em paralelo (um terminal cada) — uma cadeia de RFs que dependem em sequência ocupa **um** terminal; (4) o nº de **terminais** do lote = quantas trilhas independentes ele tem; (5) marque os **hotspots compartilhados** (arquivos que vários RFs editam, ex.: container/symbols/schemas/openapi de DI) e avise: editar aditivamente, commits curtos, ou serializar só esses arquivos para evitar conflito de merge.

Além da tabela, o README deve trazer: o que é a pasta, como um agente a usa (o protocolo do progress), o Definition of Done geral, o **grafo de dependências**, a lista de **hotspots compartilhados** e o **índice** de `RF-xx.md`. Ver [`tasks/README.md`](./tasks/README.md).

**Feito quando:** existe `_TEMPLATE.md`; todo RF tem seu `RF-xx.md` autocontido seguindo o template; o `progress-claude.txt` lista todos com deps e o mapa paralelo; o `README.md` desenha a tabela de execução (Lote/Pré-condição/Paralelo/Terminais), o grafo e os hotspots.

---

## Resumo (checklist para repetir o padrão)

- [ ] **PRD** — produto, RN numeradas, critérios de aceite, decisões Dxx, pendências. (Sem técnica.)
- [ ] **Tech Spec** — decisões TSxx, contratos, modelo de erros, testes, e a seção de **RFs** (escopo/início/fim/testes).
- [ ] **`tasks/_TEMPLATE.md`** — o molde único das sub-tasks (metadados + 9 seções, trechos verbatim da PRD/spec).
- [ ] **`tasks/RF-xx.md`** — um por RF, autocontido, seguindo o template.
- [ ] **`progress-claude.txt`** — só estado: protocolo + status dos RFs + NOTAS append-only (sem o mapa de execução).
- [ ] **`tasks/README.md`** — a **tabela de execução paralela** (Lote / Pré-condição / Rode em paralelo / Terminais) + grafo de dependências + hotspots + índice.
