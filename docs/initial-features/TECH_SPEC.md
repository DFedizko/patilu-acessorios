# Tech Spec — Patilu Kits

> **Como ler:** este documento traduz o [`PRD.md`](./PRD.md) em arquitetura e contratos de implementação. Cobre back-end (OO + SOLID + Inversify com decorators), front-end (funcional + hooks + Inversify funcional), banco (Prisma/Postgres), integrações (TikTok, código de barras), auth (Clerk) e testes (Bun). Decisões de produto vivem no PRD; aqui ficam as decisões **técnicas**.
>
> **Fonte da verdade de regras de negócio:** PRD §5 (RN-x.y). Sempre que esta spec cita uma RN, ela está no PRD.

---

## 0. Sumário

1. Decisões técnicas (consolidado)
2. Convenções globais (runtime, dinheiro, IDs, tempo, idioma)
3. Arquitetura geral
4. Modelo de dados (Prisma)
5. Domínio (entidades ricas, VOs, domain services, ACL)
6. Camada de aplicação (casos de uso)
7. Repositórios e gateways (convenções + lista)
8. Contratos de API (endpoints, schemas Zod, respostas)
9. Modelo de erros (taxonomia, códigos, mapeamento HTTP)
10. Integração TikTok (Pedidos + Ads, ACL, webhook, espelho, adapter real adiado)
11. Código de barras (gerar, renderizar, bipar, imprimir)
12. Autenticação (Clerk)
13. Front-end (estrutura, Modal, animações, tratamento de erros, telas)
14. Testes (escopo: casos de uso + entidades; AAA; critérios de aceite; Bun)
15. Documentação de API (zod-openapi + Scalar)
16. Ordem de construção (milestones)
17. Riscos e pendências
18. Requisitos funcionais (RF) — quebra para subtasks de múltiplos agentes
19. Mudanças no `CLAUDE.md`

---

## 1. Decisões técnicas (consolidado)

| #    | Decisão                                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS1  | **Runtime Node padrão, host-agnóstico.** Prisma normal (sem restrições de edge). Host (Cloudflare/Netlify/etc.) decidido no deploy. Dev contra Postgres local (docker, porta 32774). |
| TS2  | **Dinheiro = inteiro em centavos**, encapsulado num Value Object `Money`. Formatação para R$ só na borda/UI.                                           |
| TS3  | **IDs = cuid2** para todas as entidades.                                                                                                               |
| TS4  | **Testes de integração batem num banco de teste dedicado** (`patilu_test`), via variável **`TEST_DATABASE_URL`** (separada do `DATABASE_URL` da app; sem `.env.test`), migrado pelo Prisma, com **truncate antes de cada teste**. Preload valida o sufixo `_test` e roteia; setup embutido em `bun run db:migrate`. |
| TS5  | **Repository por agregado** (interface em `domain/repository/`); **PersistenceGateway** para leituras/dados que não mapeiam um agregado (interface em `application/gateway/`). Impl sempre em infraestrutura. |
| TS6  | **ACL** para integrações externas: classe no domínio com `toDomain()` e `toDTO()`. Mapeamento DB↔entidade via métodos privados `mapToEntity`/`mapToPersistence` no fim do repositório. |
| TS7  | **Erros:** Validação(Zod)=400, Regra de negócio=422, NotFound=404, Não autenticado=401, API externa=502, Interno=500. Código próprio `UPPER_SNAKE_CASE` na resposta. |
| TS8  | **Cálculos de período** (CPA, somatórios, margem líquida) em **Domain Service**; margem ao vivo na entidade `Packing`.                                 |
| TS9  | **TikTok atrás de interface (ACL) + espelho no nosso banco.** Tudo é construído com um **Fake adapter**; o **adapter real do TikTok + webhook é o único item adiado** até confirmar acesso à API BR. |
| TS10 | Sincronização de pedidos: **webhook `ORDER_STATUS_UPDATE` + backfill via `orders/search`**, espelhado no nosso banco. O resto do app só lê do nosso banco. |
| TS11 | Identificação do pedido: **número do pedido (TikTok) + nome do destinatário** (sem máscara se a API permitir; com máscara se for o que vier).          |
| TS12 | **Clerk:** Google como **único** método (sem senha); acesso por **convites + criação manual de usuários** no painel do Clerk (cadastro fechado). `proxy.ts` (Next 16). UI custom via hooks. |
| TS13 | **Código de barras:** símbolo **Code128**, código único via **nanoid** (+ `@unique` no banco com retry), render **SVG no servidor com bwip-js**. Scanner **keyboard-wedge** via hook custom. Impressão MVP `window.print()`+`@page`; **QZ Tray** depois. |
| TS14 | **Front-end:** `Modal` reutilizável em `components/ui` com composition pattern + **15+ animações** (CSS modules) selecionáveis por prop `animation` (com `"random"`) e prop `direction` (8 origens; ignorada por animações centradas). |
| TS15 | **Erros no front:** dicionário central `ERROR_CODE→mensagem PT` + handler global do React Query → toast (sonner). 500 → "Erro interno no servidor".     |
| TS16 | **Ad spend** guardado por **dia** (`source: TIKTOK | MANUAL`); período = soma dos dias. Fallback manual é por dia.                                     |
| TS17 | **Custo fixo por pedido:** valor único atual (tabela de config). Aplicado ao período no cálculo (não congelado por pedido nesta fase — ver §17).        |

---

## 2. Convenções globais

- **Idioma do código:** inglês. **Idioma do usuário:** PT-BR; valores em R$.
- **Fuso:** todos os timestamps gravados em **UTC**; limites de período calculados em **America/Sao_Paulo** (usar `date-fns-tz`). Datas de pedido vêm do `create_time` do TikTok (unix).
- **Dinheiro:** sempre `Money` (centavos). Nunca `number` solto para valor monetário; nunca `float`.
- **IDs:** `cuid2` (`@default(cuid())` no Prisma 7 / lib `@paralleldrive/cuid2` no domínio quando preciso gerar fora do banco).
- **Import alias:** `@/*`. **Sem default export** (exceto exigências do Next: `page.tsx`, `layout.tsx`, `route.ts` handlers, `proxy.ts`).
- **Period query scheme** (reutilizado em todos os endpoints de leitura por período): `?period=today|week|month|custom` e, para `custom`, `&from=YYYY-MM-DD&to=YYYY-MM-DD`.

```ts
// @/lib/period.ts  — schema compartilhado
export const periodQuerySchema = z
    .object({
        period: z.enum(["today", "week", "month", "custom"]),
        from: z.iso.date().optional(),
        to: z.iso.date().optional(),
    })
    .refine((v) => v.period !== "custom" || (v.from && v.to), {
        message: "Período personalizado exige 'from' e 'to'",
        path: ["from"],
    });
```

---

## 3. Arquitetura geral

```
FRONT (funcional)                              BACK (OO + Inversify decorators)
component (Server/Client)                      app/api/<dominio>/route.ts  (borda HTTP: Zod + Clerk + mapeia erros)
  └─ hook query/mutation (TanStack)                └─ UseCase (application)  ── depende de interfaces
       └─ service (HttpClient)                          ├─ Domain (entidades ricas, VOs, domain services, ACL)
            └─ HttpClient (fetch)                        ├─ Repository (domain/repository/*)   → impl infra (Prisma)
                                                         ├─ PersistenceGateway (application/gateway/*) → impl infra (Prisma, leitura)
                                                         └─ External Gateway (application/gateway/*)   → impl infra (TikTok, Barcode)
```

**Camadas do back (`src/server/`):**

```
src/server/
├── domain/
│   ├── entity/            # Category, Tier, Order, Packing, PackingItem, LooseItem
│   ├── value-object/      # Money, Barcode, Period
│   ├── service/           # PeriodReportCalculator, MarginCalculator, BarcodeCodeGenerator
│   ├── repository/         # I<Aggregate>Repository.ts (contratos)
│   ├── acl/               # TikTokOrderTranslator (toDomain/toDTO), TikTokAdsTranslator
│   └── error/             # DomainError + subclasses
├── application/
│   ├── use-case/
│   │   ├── contracts/     # IUseCase.ts + I<Ação>UseCase.ts (um contrato por caso de uso)
│   │   └── <Ação>UseCase.ts   # uma classe por caso de uso (implementa o contrato)
│   ├── gateway/           # I<Nome>PersistenceGateway.ts + I<Externo>Gateway.ts (contratos)
│   └── error/             # ApplicationError (NotFound etc. quando aplicável à orquestração)
├── infrastructure/
│   ├── repository/        # <Aggregate>PrismaRepository.ts (implementa domain/repository)
│   ├── gateway/           # <Nome>PrismaPersistenceGateway.ts, TikTok*Gateway.ts, Bwip*Renderer.ts
│   └── http/              # clients http p/ integrações
└── di/
    ├── container.ts
    └── symbols.ts
```

---

## 4. Modelo de dados (Prisma)

`prisma/schema.prisma` (provider `postgresql`, client gerado em `src/generated/prisma`). Valores monetários como `Int` (centavos).

```prisma
model Category {
    id        String   @id @default(cuid())
    name      String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    tiers     Tier[]

    @@map("categories")
}

model Tier {
    id         String    @id @default(cuid())
    name       String
    costCents  Int
    barcode    String    @unique
    categoryId String?                       // null = "Sem categoria"
    category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
    createdAt  DateTime  @default(now())
    updatedAt  DateTime  @updatedAt

    @@index([categoryId])
    @@map("tiers")
}

enum ShipmentStatus {
    PENDING      // não enviado (AWAITING_SHIPMENT/AWAITING_COLLECTION/UNPAID no TikTok)
    SHIPPED      // IN_TRANSIT/DELIVERED/COMPLETED
    CANCELLED
}

enum PackingStatus {
    NOT_PACKED
    PACKED
}

model Order {
    id             String         @id @default(cuid())
    tiktokOrderId  String         @unique
    orderNumber    String
    recipientName  String?
    saleCents      Int
    shippingCents  Int            @default(0)
    orderedAt      DateTime
    shipmentStatus ShipmentStatus @default(PENDING)
    packingStatus  PackingStatus  @default(NOT_PACKED)  // campo interno nosso
    packing        Packing?
    createdAt      DateTime       @default(now())
    updatedAt      DateTime       @updatedAt

    @@index([orderedAt])
    @@index([shipmentStatus, packingStatus])
    @@map("orders")
}

model Packing {
    id         String        @id @default(cuid())
    orderId    String        @unique
    order      Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
    operatorId String                                    // Clerk userId
    packedAt   DateTime      @default(now())
    items      PackingItem[]
    looseItems LooseItem[]
    updatedAt  DateTime      @updatedAt

    @@map("packings")
}

// Snapshot congelado da faixa no momento do empacotamento (PRD RN-2.8 / RN-3.5)
model PackingItem {
    id           String  @id @default(cuid())
    packingId    String
    packing      Packing @relation(fields: [packingId], references: [id], onDelete: Cascade)
    tierId       String?                                 // referência fraca (faixa pode ser excluída depois)
    tierName     String                                  // congelado
    categoryName String                                  // congelado (para "custo por categoria")
    unitCostCents Int                                    // congelado
    quantity     Int

    @@index([packingId])
    @@map("packing_items")
}

model LooseItem {
    id        String  @id @default(cuid())
    packingId String
    packing   Packing @relation(fields: [packingId], references: [id], onDelete: Cascade)
    name      String
    costCents Int

    @@index([packingId])
    @@map("loose_items")
}

enum AdSpendSource {
    TIKTOK
    MANUAL
}

// Gasto com anúncios por dia (PRD F5). Período = soma dos dias. (TS16)
model AdSpendDay {
    day        DateTime      @id @db.Date            // YYYY-MM-DD (00:00 SP)
    amountCents Int
    source     AdSpendSource
    updatedAt  DateTime      @updatedAt

    @@map("ad_spend_days")
}

// Config singleton (custo fixo por pedido etc.). Sempre 1 linha (id = "singleton"). (TS17)
model AppConfig {
    id                 String   @id @default("singleton")
    fixedCostPerOrderCents Int  @default(300)         // R$3,00
    updatedAt          DateTime @updatedAt

    @@map("app_config")
}
```

> **"Sem categoria"** não é uma linha: é `Tier.categoryId = null`. Ao excluir uma categoria, `onDelete: SetNull` joga as faixas para `null` automaticamente (PRD RN-1.1).

---

## 5. Domínio

Entidades **ricas** (CLAUDE.md): propriedades privadas, sem setters; métodos com intenção de domínio; validações lançam erros de domínio. Cada entidade tem `create()` (nova, valida invariantes) e `restore()` (reconstituição a partir do banco).

### 5.1 Value Objects

**`Money`** (`domain/value-object/Money.ts`)

```ts
export class Money {
    private constructor(private readonly cents: number) {}
    static fromCents(cents: number): Money { /* valida inteiro */ }
    static fromReais(reais: number): Money { /* arredonda p/ centavos */ }
    static zero(): Money { return Money.fromCents(0); }
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiplyByQuantity(quantity: number): Money;     // custo de N itens da faixa
    dividedByCount(count: number): Money;             // CPA: ads / nº pedidos (count 0 → zero)
    percentageOf(total: Money): number;               // margem %: this/total*100
    toCents(): number;
    isPositive(): boolean;
}
```

> **Sem `MarginHealth`.** Não há conceito de "saúde da margem" (boa/atenção/baixa, cores ou limiares). A margem é apenas **R$ e %**; nenhuma classificação é calculada ou exibida.

**`Barcode`** — string validada (prefixo `T` + nanoid). **`Period`** — `{ start: Date; end: Date }` resolvido em SP.

### 5.2 Entidades (agregados)

**`Category`** — `create(name)`, `rename(name)` (nome obrigatório → `CategoryNameRequiredError`).

**`Tier`** — `create({ name, cost: Money, barcode, categoryId })`; `rename(name)`; `changeCost(Money)` (>0 → `TierCostMustBePositiveError`); `assignToCategory(id)` / `moveToUncategorized()`. Getters: `getBarcode()`, `getCost()`, `getCategoryId()`.

**`Order`** (espelho do TikTok) — `restore({...})` a partir do espelho. Comportamentos internos: `markPacked()`, `markNotPacked()`, `applyShipmentStatus(status)`. Regra: `canBePacked()` (PRD: empacota pendentes; um pedido `CANCELLED` não empacota → `OrderCannotBePackedError`). Getters de venda/frete como `Money`.

**`Packing`** (agregado raiz do empacotamento) — contém `PackingItem[]` e `LooseItem[]`.

```ts
export class Packing {
    // create: novo empacotamento de um pedido
    static create(orderId: string, operatorId: string): Packing;
    static restore(props): Packing;

    // intenções de domínio
    addTier(tier: Tier): void;                 // +1 (toque/bipe) — congela nome/categoria/custo
    incrementTier(tierId: string): void;
    decrementTier(tierId: string): void;       // remove o item se chegar a 0
    addLooseItem(name: string, cost: Money): void;
    removeLooseItem(looseItemId: string): void;

    computeItemsCost(): Money;                  // Σ(qtd × custo) + Σ avulsos  (PRD RN-2.6)
    computeLiveMargin(sale: Money, shipping: Money): {
        marginValue: Money; marginPct: number;   // (PRD RN-2.5) — só R$ e %
    };
    ensureCanConclude(): void;                  // ≥1 item, senão PackingRequiresItemError (RN-2.7)
}
```

> A margem **ao vivo** (RN-2.5) **não** inclui CPA/custo fixo — esses são de período (Domain Service, §5.3).

### 5.3 Domain Services

**`PeriodReportCalculator`** (`domain/service/PeriodReportCalculator.ts`) — núcleo dos números de período (PRD F3/F4), 100% puro e testável em unidade.

```ts
type OrderInPeriod = {
    orderId: string; sale: Money; shipping: Money;
    itemsCost: Money | null;                    // null = ainda não empacotado
    items: { categoryName: string; cost: Money }[];
};
export class PeriodReportCalculator {
    // CPA = total ads ÷ nº de pedidos do período (count 0 → Money.zero)  (RN-3.1)
    computeCpa(totalAds: Money, orderCount: number): Money;
    // margem líquida por pedido = venda − itemsCost − frete − CPA − custoFixo  (RN-3.2)
    computeNetMarginPerOrder(order, cpa: Money, fixedCost: Money): { value: Money; pct: number };
    // lucro do período = receita − Σcusto − Σfrete − totalAds − (custoFixo × nºpedidos)  (RN-3.3)
    computePeriodProfit(orders, totalAds: Money, fixedCost: Money): { revenue; cost; profit: Money; avgMarginPct: number };
    // custo por categoria (RN-4.2)
    computeCostByCategory(orders): { categoryName: string; cost: Money }[];
    // série de margem ao longo do tempo (RN-4.1) — por hora (dia) / por dia (períodos maiores)
    computeMarginSeries(orders, granularity: "hour" | "day"): { label: string; marginPct: number }[];
}
```

**`BarcodeCodeGenerator`** — `generate(): string` (nanoid, alfabeto sem ambíguos, prefixo `T`). Unicidade garantida pelo `@unique` + retry no caso de uso (§11).

### 5.4 ACL (Anti-Corruption Layer)

Para cada integração externa, uma classe no **domínio** com exatamente `toDomain()` e `toDTO()`:

```ts
// domain/acl/TikTokOrderTranslator.ts
export class TikTokOrderTranslator {
    toDomain(dto: TikTokOrderDTO): Order;        // mapeia status TikTok → ShipmentStatus, payment → Money
    toDTO(order: Order): TikTokOrderDTO;
}
```

---

## 6. Camada de aplicação (casos de uso)

### 6.1 Padrão de use case (vai também para o `CLAUDE.md`)

- **Arquivo e classe terminam em `*UseCase`** (ex.: `CreateTierUseCase.ts`, classe `CreateTierUseCase`), em `src/server/application/use-case/`.
- A classe **implementa um contrato `I<Ação>UseCase`** que **estende o genérico `IUseCase<Input, Output>`**. O genérico **força um único método público `execute(input): Promise<Output>`**.
- Contratos ficam em `src/server/application/use-case/contracts/` (note o traço em `use-case`): `IUseCase.ts` + um `I<Ação>UseCase.ts` por caso de uso. **Cada contrato exporta seus próprios `Input` e `Output`.**
- Dependências (repos/gateways) injetadas por Inversify (`@injectable`/`@inject(SYMBOL)`), sempre por **interface**.
- **Reuso do schema Zod:** quando o `Input` do caso de uso é **exatamente** o que o schema Zod do endpoint valida, o `Input` **é a inferência de tipo desse schema**. Onde o schema é definido (`src/lib/schemas.ts`) exporta-se um DTO via `z.input` e o contrato o reutiliza — assim validação e tipagem do caso de uso nunca divergem.

```ts
// application/use-case/contracts/IUseCase.ts
export interface IUseCase<TInput, TOutput> {
    execute(input: TInput): Promise<TOutput>;
}
```

```ts
// application/use-case/contracts/ICreateTierUseCase.ts
import type { IUseCase } from "./IUseCase";
import type { CreateTierDTO } from "@/lib/schemas"; // = z.input<typeof createTierSchema>

export type Input = CreateTierDTO; // mesmo contrato tipado do schema Zod do endpoint
export type Output = { id: string; name: string; costCents: number; barcode: string; categoryId: string | null };

export interface ICreateTierUseCase extends IUseCase<Input, Output> {}
```

```ts
// application/use-case/CreateTierUseCase.ts
import type { ICreateTierUseCase, Input, Output } from "./contracts/ICreateTierUseCase";

@injectable()
export class CreateTierUseCase implements ICreateTierUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository) private readonly tierRepository: ITierRepository,
        @inject(SYMBOLS.BarcodeCodeGenerator) private readonly barcodeGenerator: BarcodeCodeGenerator,
    ) {}

    async execute(input: Input): Promise<Output> {
        // gera barcode (retry no @unique), cria a entidade Tier, persiste, retorna Output
    }
}
```

> Quando o caso de uso precisa de dados que **não** vêm do corpo validado (ex.: `id` da rota, `operatorId` do Clerk), o `Input` é o DTO do schema **acrescido** desses campos (ex.: `Input = SavePackingDTO & { orderId: string; operatorId: string }`); o schema do endpoint valida apenas o que vem do cliente.

### 6.2 Inventário

Cada caso de uso tem **1 teste de integração** (`*.test`) batendo no banco de teste com fakes para externos (§14). **(DTO)** = `Input` reusa a inferência (`z.input`) do schema Zod do endpoint (§8); **(DTO+)** = DTO acrescido de `id` da rota e/ou `operatorId` do Clerk.

| Use case (`*UseCase`)       | Entrada → Saída                                                                | Erros possíveis                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `CreateCategoryUseCase` (DTO)   | `{ name }` → Category                                                      | `CATEGORY_NAME_REQUIRED`                                                               |
| `RenameCategoryUseCase` (DTO)   | `{ id, name }` → Category                                                  | `CATEGORY_NOT_FOUND`, `CATEGORY_NAME_REQUIRED`                                         |
| `DeleteCategoryUseCase`         | `{ id }` → void (faixas → null)                                            | `CATEGORY_NOT_FOUND`                                                                   |
| `ListCatalogUseCase`            | — → categorias + faixas (read gateway)                                     | —                                                                                     |
| `CreateTierUseCase` (DTO)       | `{ categoryId?, name, costReais }` → Tier (gera barcode, retry)            | `TIER_COST_MUST_BE_POSITIVE`, `CATEGORY_NOT_FOUND`                                     |
| `UpdateTierUseCase` (DTO)       | `{ id, name?, costReais?, categoryId? }` → Tier                            | `TIER_NOT_FOUND`, `TIER_COST_MUST_BE_POSITIVE`                                         |
| `DeleteTierUseCase`             | `{ id }` → void                                                            | `TIER_NOT_FOUND`                                                                       |
| `FindTierByBarcodeUseCase`      | `{ barcode }` → Tier (resolve bipe)                                        | `TIER_NOT_FOUND`                                                                       |
| `RenderTierLabelUseCase`        | `{ id }` → SVG string                                                      | `TIER_NOT_FOUND`                                                                       |
| `IngestTikTokOrderUseCase`      | `{ tiktokOrderDTO }` → Order (espelha/atualiza; webhook + backfill)        | —                                                                                     |
| `ListOrdersUseCase` (DTO)       | period+status → pedidos (pendentes no topo, read gateway)                  | (validação de período)                                                                |
| `GetOrderForPackingUseCase`     | `{ orderId }` → order(read-only) + packing atual (se houver)               | `ORDER_NOT_FOUND`                                                                     |
| `SavePackingUseCase` (DTO+)     | `{ orderId, operatorId, items[], looseItems[] }` → Packing (cria/edita snapshot, marca PACKED) | `ORDER_NOT_FOUND`, `ORDER_CANNOT_BE_PACKED`, `PACKING_REQUIRES_ITEM`, `TIER_NOT_FOUND` |
| `DeletePackingUseCase`          | `{ orderId }` → void (pedido volta a NOT_PACKED)                           | `PACKING_NOT_FOUND`                                                                   |
| `GetHistoryUseCase` (DTO)       | period → linhas (com CPA, custo fixo, margem líquida) + resumo             | (validação de período)                                                                |
| `ExportHistoryUseCase` (DTO)    | period → CSV                                                               | (validação de período)                                                                |
| `GetDashboardUseCase` (DTO)     | period → indicadores + série de margem + custo por categoria               | (validação de período)                                                                |
| `GetAdSpendUseCase` (DTO)       | period → `{ totalCents, available, source }`                               | —                                                                                     |
| `SetManualAdSpendUseCase` (DTO) | `{ day, amountReais }` → void                                              | `VALIDATION_ERROR`                                                                     |
| `GetFixedCostUseCase`           | — → `{ fixedCostPerOrderCents }`                                           | —                                                                                     |
| `SetFixedCostUseCase` (DTO)     | `{ amountReais }` → config                                                 | `VALIDATION_ERROR`                                                                     |

---

## 7. Repositórios e gateways (convenções)

> Estas convenções vão também para o `CLAUDE.md`.

- **`PrismaClient` injetado, nunca singleton.** `src/lib/prisma.ts` exporta só `createPrismaClient(connectionString?)`. O container liga `SYMBOLS.PrismaClient` a um client criado do `DATABASE_URL`; todo repositório/gateway Prisma recebe via `constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient)` e usa `this.prisma`. É isso que permite os testes injetarem outro client (o de teste) sem nenhum override de env.
- **Repository** = serviço de domínio sobre um **agregado**. Contrato em `domain/repository/I<Aggregate>Repository.ts`. Implementação em `infrastructure/repository/<Aggregate>PrismaRepository.ts`. Persiste o **agregado inteiro**; tem `mapToEntity` (e `mapToPersistence` se preciso) **privados, no fim da classe**.
- **PersistenceGateway** = dados que **não** mapeiam um agregado (ex.: dados de leitura para popular uma página, ou um valor de config). Contrato em `application/gateway/I<Nome>PersistenceGateway.ts`. Implementação em `infrastructure/gateway/<Nome>PrismaPersistenceGateway.ts`.
- **Regra de bom senso:** prefira agregados + repositories (persistir entidades inteiras). Use PersistenceGateway quando carregar a entidade inteira for desnecessário (telas de leitura, agregações SQL, config simples).
- **External Gateway (HttpGateway)** = integração externa por HTTP. Contrato em `application/gateway/`; implementação em `infrastructure/gateway/` com sufixo **`HttpGateway`** (ex.: `TikTokHttpGateway`); **depende da abstração `HttpClient`** (nunca de `axios`/`fetch` direto) e usa **ACL** (domínio) para traduzir. Detalhe do `HttpClient` em §7.3.

**Inventário:**

| Tipo                | Contrato (camada)                                       | Implementação (infra)                                          |
| ------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| Repository          | `domain/repository/ICategoryRepository`                 | `infrastructure/repository/CategoryPrismaRepository`           |
| Repository          | `domain/repository/ITierRepository`                     | `infrastructure/repository/TierPrismaRepository`               |
| Repository          | `domain/repository/IOrderRepository`                    | `infrastructure/repository/OrderPrismaRepository`              |
| Repository          | `domain/repository/IPackingRepository`                  | `infrastructure/repository/PackingPrismaRepository`            |
| PersistenceGateway  | `application/gateway/ICatalogReadPersistenceGateway`    | `infrastructure/gateway/CatalogReadPrismaPersistenceGateway`   |
| PersistenceGateway  | `application/gateway/IOrderListPersistenceGateway`      | `infrastructure/gateway/OrderListPrismaPersistenceGateway`     |
| PersistenceGateway  | `application/gateway/IReportPersistenceGateway`         | `infrastructure/gateway/ReportPrismaPersistenceGateway`        |
| PersistenceGateway  | `application/gateway/IAdSpendPersistenceGateway`        | `infrastructure/gateway/AdSpendPrismaPersistenceGateway`       |
| PersistenceGateway  | `application/gateway/IConfigPersistenceGateway`         | `infrastructure/gateway/ConfigPrismaPersistenceGateway`        |
| External Gateway    | `application/gateway/ITikTokOrdersGateway`              | `infrastructure/gateway/TikTokOrdersHttpGateway` (fake: `test/fakes/FakeTikTokOrdersGateway`) |
| External Gateway    | `application/gateway/ITikTokAdsGateway`                 | `infrastructure/gateway/TikTokAdsHttpGateway` (fake: `test/fakes/FakeTikTokAdsGateway`) |
| External Gateway    | `application/gateway/IBarcodeRenderer`                  | `infrastructure/gateway/BwipBarcodeRenderer`                   |

> **Nomeação TikTok:** os dois HttpGateways (Pedidos via Shop API e Ads via Business API — hosts/auth distintos) estendem uma base comum **`TikTokHttpGateway`** que concentra `HttpClient` + assinatura/headers; `TikTokOrdersHttpGateway` e `TikTokAdsHttpGateway` herdam dela. Assim respeitamos a convenção `<Integração>HttpGateway` e o ISP das portas.

### 7.3 `HttpClient` (back-end) — classe abstrata genérica

Toda integração HTTP do back depende da abstração **`HttpClient`** (DIP), **nunca** de `axios`/`fetch` direto. É uma **classe abstrata**, fortemente tipada com **generics** para a **resposta (`Response`)**, o **corpo (`Body`)**, os **headers (`Headers`)** e os **query params (`Params`)** — assim cada `HttpGateway` declara a forma exata do que envia no body e nos headers (credenciais/tokens). Os generics de header/param têm uma **base serializável** (`Record<string, string>` / `Record<string, string|number|boolean|undefined>`), porque header e query string sempre viram texto na rede. Inclui o verbo **`query`** — o método HTTP novo **QUERY** ([IETF `draft-ietf-httpbis-safe-method-w-body`, draft-14](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/)), que é **safe + idempotente e aceita body** (busca cujo payload não cabe na URL).

```ts
// src/server/infrastructure/http/HttpClient.ts
export type HttpHeaders = Record<string, string>;
export type HttpParams = Record<string, string | number | boolean | undefined>;

export type HttpRequestConfig<THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams> = {
    headers?: THeaders;
    params?: TParams;
};

export abstract class HttpClient {
    abstract get<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract query<Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    // post/put/patch: mesma assinatura do query (Response + Body + Headers + Params genéricos)
    abstract post<Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract put<Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract patch<Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract delete<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract setHeaders<THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders): void; // credenciais/tokens (defaults do client)
}
```

> Na prática o chamador só anota `<Response>` (e `Body` quando há corpo); `Headers`/`Params` são **inferidos** do objeto `config` passado. Definir um tipo de header próprio dá checagem total das chaves/valores enviados.

**Implementação `AxiosHttpClient` (back)** — herda a classe abstrata:

```ts
// src/server/infrastructure/http/AxiosHttpClient.ts
@injectable()
export class AxiosHttpClient extends HttpClient {
    private readonly instance: AxiosInstance;
    constructor() {
        super();
        this.instance = axios.create();
    }
    setHeaders<THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders): void {
        Object.assign(this.instance.defaults.headers.common, headers);
    }
    async get<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        const { data } = await this.instance.get<Response>(url, this.toAxios(config));
        return data;
    }
    async query<Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        const { data } = await this.instance.request<Response>({ method: "QUERY", url, data: body, ...this.toAxios(config) });
        return data;
    }
    // post/put/patch análogos (this.instance.post<Response>(url, body, ...)); delete análogo ao get
    private toAxios<THeaders extends HttpHeaders, TParams extends HttpParams>(config?: HttpRequestConfig<THeaders, TParams>) {
        return { headers: config?.headers, params: config?.params };
    }
}
```

**Exemplo de uso tipado (HttpGateway do back):** body e headers próprios da integração, ambos checados pelo compilador.

```ts
type TikTokAuthHeaders = { "x-tts-access-token": string; "x-tts-sign": string };
type SearchOrdersBody = { create_time_ge: number; create_time_lt: number; page_size: number };

const data = await this.http.query<TikTokOrdersResponse, SearchOrdersBody, TikTokAuthHeaders>(
    "/order/202309/orders/search",
    { create_time_ge, create_time_lt, page_size: 100 },
    { headers: { "x-tts-access-token": token, "x-tts-sign": sign } },
);
```

- `axios.request({ method: "QUERY" })` aceita métodos customizados; usar QUERY só onde a integração suportar (caso contrário, `post`). Suporte a QUERY ainda é emergente — ver §17.
- DI: `HttpClient` é um símbolo no container do back; `TikTokHttpGateway` recebe `@inject(SYMBOLS.HttpClient)`.
- `bun add axios`.

### 7.4 `HttpClient` (front-end) — factory function genérica

No front (paradigma funcional) a **mesma lógica** vira **factory function** que inverte a dependência: um factory genérico `createHttpClient` constrói os 6 métodos a partir de uma função de envio de baixo nível, e `axiosHttpClient` fornece a implementação axios a esse factory. Os **services dependem do `HttpClient` por parâmetro** (injeção), nunca de `axios`/`fetch`.

```ts
// src/lib/http/http-client.ts
export type HttpHeaders = Record<string, string>;
export type HttpParams = Record<string, string | number | boolean | undefined>;

export type HttpRequestConfig<THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams> = {
    headers?: THeaders;
    params?: TParams;
};

// mesmos generics do back (Response + Body + Headers + Params), para os services tiparem forte o que enviam
export type HttpClient = {
    get: <Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    query: <Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    post: <Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    put: <Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    patch: <Response, Body = unknown, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    delete: <Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    setHeaders: <THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders) => void;
};

type SendRequest = <Response>(input: {
    method: "GET" | "QUERY" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    body?: unknown;
    config?: HttpRequestConfig;
}) => Promise<Response>;

// factory genérico: recebe o "como enviar" e devolve o HttpClient completo (mesma forma do back)
export const createHttpClient = (send: SendRequest): HttpClient => {
    let defaultHeaders: Record<string, string> = {};
    const withDefaults = (config?: HttpRequestConfig): HttpRequestConfig => ({
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
    });
    return {
        get: (url, config) => send({ method: "GET", url, config: withDefaults(config) }),
        query: (url, body, config) => send({ method: "QUERY", url, body, config: withDefaults(config) }),
        post: (url, body, config) => send({ method: "POST", url, body, config: withDefaults(config) }),
        put: (url, body, config) => send({ method: "PUT", url, body, config: withDefaults(config) }),
        patch: (url, body, config) => send({ method: "PATCH", url, body, config: withDefaults(config) }),
        delete: (url, config) => send({ method: "DELETE", url, config: withDefaults(config) }),
        setHeaders: (headers) => {
            defaultHeaders = { ...defaultHeaders, ...headers };
        },
    };
};
```

```ts
// src/lib/http/axios-http-client.ts  — usa o factory genérico para "ter axios no front"
export const axiosHttpClient = (baseURL = "/api"): HttpClient => {
    const instance = axios.create({ baseURL });
    return createHttpClient(async ({ method, url, body, config }) => {
        const { data } = await instance.request({
            method,
            url,
            data: body,
            headers: config?.headers,
            params: config?.params,
        });
        return data;
    });
};
```

- O container do front (`src/di/container.ts`) liga o símbolo `HttpClient` a `axiosHttpClient()`. Cada **service** é uma factory que recebe o `HttpClient` (interface) e expõe seus métodos — `query`/`mutation` hooks recebem o service (já é a regra do CLAUDE.md).
- Tipagem forte (body + params): o service anota `Response` e o `Body`/`Params` é checado pelo compilador — ex.:

```ts
// src/service/tier-service.ts
export const createTierService = (http: HttpClient) => ({
    create: (input: CreateTierDTO) => http.post<TierResponse, CreateTierDTO>("/tiers", input),
    listByPeriodOrders: (params: ListOrdersParams) =>
        http.get<OrderListItem[], HttpHeaders, ListOrdersParams>("/orders", { params }),
});
```

(No front, headers raramente são usados — auth do Clerk vai por cookie; o generic de `Params` tipa a query string das telas por período.)
- O `axiosHttpClient` é também onde o **interceptor de erro** transforma `{ error: { code, fields } }` em `ApiError` tipado (§13.2).
- `bun add axios`.

Todas as rotas exigem auth (Clerk, §12). Todas as **entradas** validadas por **Zod** (`src/lib/schemas.ts`), que também alimentam o OpenAPI (§15). Respostas de erro: §9.

**Convenção de resposta de sucesso:** `200`/`201` com o recurso ou lista; valores monetários retornados em **centavos** (`*Cents`) — a UI formata.

| Método | Caminho                              | O que faz                                                       | Body / Query (Zod)                              | Resposta                                  |
| ------ | ------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| GET    | `/api/categories`                    | Lista categorias com suas faixas (+ "Sem categoria")            | —                                               | `CategoryWithTiers[]`                     |
| POST   | `/api/categories`                    | Cria categoria                                                  | `{ name }`                                      | `Category` (201)                          |
| PATCH  | `/api/categories/:id`                | Renomeia                                                        | `{ name }`                                      | `Category`                                |
| DELETE | `/api/categories/:id`                | Exclui (faixas → Sem categoria)                                 | —                                               | `204`                                     |
| POST   | `/api/categories/:id/tiers`          | Cria faixa na categoria (gera código)                           | `{ name, costReais }`                           | `Tier` (201)                              |
| POST   | `/api/tiers`                         | Cria faixa em "Sem categoria"                                   | `{ name, costReais }`                           | `Tier` (201)                              |
| PATCH  | `/api/tiers/:id`                     | Edita faixa                                                     | `{ name?, costReais?, categoryId? }`            | `Tier`                                    |
| DELETE | `/api/tiers/:id`                     | Exclui faixa                                                    | —                                               | `204`                                     |
| GET    | `/api/tiers/by-barcode/:code`        | Resolve bipe → faixa                                            | —                                               | `Tier`                                    |
| GET    | `/api/tiers/:id/label`               | Etiqueta SVG (Code128)                                          | —                                               | `image/svg+xml`                           |
| GET    | `/api/orders`                        | Lista pedidos do período (pendentes no topo)                    | `periodQuery + status?`                         | `OrderListItem[]`                         |
| GET    | `/api/orders/:id/packing`            | Pedido (read-only) + empacotamento atual                        | —                                               | `{ order, packing? }`                     |
| PUT    | `/api/orders/:id/packing`            | Cria/edita empacotamento; marca PACKED                          | `SavePackingInput`                              | `Packing`                                 |
| DELETE | `/api/orders/:id/packing`            | Remove empacotamento; pedido volta a pendente                   | —                                               | `204`                                     |
| POST   | `/api/webhooks/tiktok/orders`        | Recebe `ORDER_STATUS_UPDATE` (sem Clerk; HMAC do TikTok)        | payload TikTok                                  | `200`                                     |
| GET    | `/api/history`                       | Linhas + resumo do período (com CPA e custo fixo)               | `periodQuery`                                   | `{ rows: HistoryRow[], summary }`         |
| GET    | `/api/history/export`                | CSV do período                                                  | `periodQuery`                                   | `text/csv`                                |
| GET    | `/api/dashboard`                     | Indicadores + série de margem + custo por categoria             | `periodQuery`                                   | `DashboardData`                           |
| GET    | `/api/ad-spend`                      | Total de ads do período + disponibilidade                       | `periodQuery`                                   | `{ totalCents, available, source }`       |
| PUT    | `/api/ad-spend/manual`               | Define ads manual de um dia (fallback)                          | `{ day, amountReais }`                          | `204`                                     |
| GET    | `/api/config/fixed-cost`             | Lê custo fixo por pedido                                        | —                                               | `{ fixedCostPerOrderCents }`              |
| PUT    | `/api/config/fixed-cost`             | Define custo fixo por pedido                                    | `{ amountReais }`                               | `{ fixedCostPerOrderCents }`              |

**Schemas Zod centrais** (`src/lib/schemas.ts`), exemplos. **Convenção:** todo schema de entrada de endpoint **exporta também um DTO** via `z.input<typeof schema>`, consumido pelo contrato do caso de uso correspondente (§6.1). Assim o `Input` do use case e a validação do endpoint são a mesma coisa.

```ts
export const createTierSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da faixa"),
    costReais: z.number().positive("Informe um custo válido"),
    categoryId: z.string().cuid2().optional(),
});
export type CreateTierDTO = z.input<typeof createTierSchema>; // → contracts/ICreateTierUseCase Input

export const savePackingSchema = z
    .object({
        items: z.array(z.object({ tierId: z.string().cuid2(), quantity: z.number().int().positive() })),
        looseItems: z.array(z.object({ name: z.string().trim().min(1), costReais: z.number().positive() })),
    })
    .refine((v) => v.items.length + v.looseItems.length > 0, { message: "Inclua ao menos um item" });
export type SavePackingDTO = z.input<typeof savePackingSchema>;
// SavePackingUseCase Input = SavePackingDTO & { orderId: string; operatorId: string }  (DTO+, §6.1)

// idem para os demais endpoints com entrada validada: createCategorySchema → CreateCategoryDTO,
// renameCategorySchema → RenameCategoryDTO, updateTierSchema → UpdateTierDTO,
// setManualAdSpendSchema → SetManualAdSpendDTO, setFixedCostSchema → SetFixedCostDTO,
// e periodQuerySchema (+status) → ListOrdersDTO / o Input dos use cases de relatório.
```

**DTOs de leitura (read models)** — não são entidades; vêm de PersistenceGateways:

```ts
type OrderListItem = {
    orderId: string; orderNumber: string; recipientName: string | null;
    saleCents: number; shippingCents: number; orderedAt: string;
    shipmentStatus: "PENDING" | "SHIPPED" | "CANCELLED";
    packingStatus: "NOT_PACKED" | "PACKED";
};
type HistoryRow = {
    orderId: string; orderNumber: string; recipientName: string | null; orderedAt: string;
    saleCents: number; itemsCostCents: number | null; cpaCents: number; fixedCostCents: number;
    netMarginCents: number | null; netMarginPct: number | null;
};
type DashboardData = {
    revenueCents: number; costCents: number; adsCents: number; fixedTotalCents: number;
    profitCents: number; avgMarginPct: number; orderCount: number;
    marginSeries: { label: string; marginPct: number }[];
    costByCategory: { categoryName: string; costCents: number }[];
    adsAvailable: boolean;
};
```

---

## 9. Modelo de erros

**Resposta de erro (única forma):**

```jsonc
{
    "error": {
        "code": "TIER_COST_MUST_BE_POSITIVE",     // UPPER_SNAKE_CASE, nosso
        "message": "Mensagem técnica em inglês (log/dev)",
        "fields": { "costReais": ["Informe um custo válido"] }   // só em VALIDATION_ERROR
    }
}
```

**Onde cada erro nasce (CLAUDE.md também):**

- **Validação (Zod)** — na **rota** (borda HTTP). `safeParse` falhou → `400` `VALIDATION_ERROR` com `fields` (campos errados/faltando, exatamente).
- **Regra de negócio** — na **entidade/domain service** (`DomainError`). A rota mapeia para `422`.
- **NotFound** — lançado **direto no repositório/gateway** (ao não achar por id/código), **nunca no caso de uso**. É um **`NotFoundError`** próprio (`src/server/infrastructure/errors/NotFoundError.ts`) que **`extends Error`** (não é `DomainError`): `httpStatus` é **sempre `404`** (não é parâmetro), com **mensagem e code padrão (`NOT_FOUND`)**, mas ambos **podem vir por parâmetro** — passe um `code` específico (`CATEGORY_NOT_FOUND`/`TIER_NOT_FOUND`/`ORDER_NOT_FOUND`/`PACKING_NOT_FOUND`) e uma mensagem com template literal dizendo qual agregado/registro/id não foi achado. O `findById`/`findByX` que **precisa** resolver um registro **lança** `NotFoundError` em vez de retornar `null`.
- **API externa** — lançado **direto no gateway HTTP** da integração. Mapeia para `502`.
- **Não autenticado** — Clerk no `proxy.ts`/handler. `401`.
- **Interno** — qualquer não tratado → `500` `INTERNAL_ERROR` (no front vira "Erro interno no servidor").

**Catálogo inicial de códigos:**

| Código                         | HTTP | Origem            |
| ------------------------------ | ---- | ----------------- |
| `VALIDATION_ERROR`             | 400  | rota (Zod)        |
| `UNAUTHENTICATED`              | 401  | Clerk             |
| `CATEGORY_NOT_FOUND`           | 404  | repo              |
| `TIER_NOT_FOUND`               | 404  | repo              |
| `ORDER_NOT_FOUND`              | 404  | repo              |
| `PACKING_NOT_FOUND`            | 404  | repo              |
| `CATEGORY_NAME_REQUIRED`       | 422  | domínio           |
| `TIER_COST_MUST_BE_POSITIVE`   | 422  | domínio           |
| `PACKING_REQUIRES_ITEM`        | 422  | domínio           |
| `ORDER_CANNOT_BE_PACKED`       | 422  | domínio           |
| `DUPLICATE_BARCODE`            | 422  | repo (unique)     |
| `TIKTOK_NOT_CONFIGURED`        | 502  | gateway externo   |
| `TIKTOK_API_ERROR`            | 502  | gateway externo   |
| `INTERNAL_ERROR`               | 500  | fallback          |

> Na tabela acima, os `*_NOT_FOUND` (origem **repo**) são lançados como `NotFoundError` (com o `code` específico); os `422` de **domínio** são `DomainError`; `DUPLICATE_BARCODE` é `DomainError` lançado no repo ao violar o `@unique`.

**Mapeamento central na rota:** um helper `toHttpResponse(error)` (em `src/lib/http-error.ts`) recebe a exceção, identifica o tipo (`DomainError` **ou** `NotFoundError` — ambos carregam `.code` e `.httpStatus`), e devolve `NextResponse.json(...)`. Cada `route.ts` faz `try/catch` chamando esse helper.

```ts
// regra de negócio (422) → entidade/domain service
export class DomainError extends Error {
    constructor(readonly code: string, readonly httpStatus: number, message: string) { super(message); }
}
export class TierCostMustBePositiveError extends DomainError {
    constructor() { super("TIER_COST_MUST_BE_POSITIVE", 422, "Tier cost must be positive"); }
}

// not found (404 fixo) → lançado no repositório/gateway, NÃO é DomainError
export class NotFoundError extends Error {
    readonly httpStatus = 404;
    readonly code: string;
    constructor(message = "Resource not found", code = "NOT_FOUND") {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
}
// uso no repo: throw new NotFoundError(`Category not found: ${id}`, "CATEGORY_NOT_FOUND");
```

---

## 10. Integração TikTok (Pedidos + Ads)

> **TS9/TS10:** tudo construído atrás de interfaces (ACL). O **adapter real + webhook** é o único item **adiado** até confirmar acesso à Partner API BR. Em dev/homologação usamos **Fake adapters**.

### 10.1 Portas (interfaces)

```ts
// application/gateway/ITikTokOrdersGateway.ts
export interface ITikTokOrdersGateway {
    searchOrders(period: Period): Promise<TikTokOrderDTO[]>;   // backfill
    getOrder(tiktokOrderId: string): Promise<TikTokOrderDTO>;  // detalhe (se preciso)
}
// application/gateway/ITikTokAdsGateway.ts
export interface ITikTokAdsGateway {
    getSpend(period: Period): Promise<{ amountCents: number } | { unavailable: true }>;
}
```

**Implementações (HttpGateway):** `TikTokOrdersHttpGateway` e `TikTokAdsHttpGateway` estendem a base **`TikTokHttpGateway`** e dependem da abstração **`HttpClient`** (§7.3) — nunca de `axios` direto. A base concentra o que é comum à integração (injeção do `HttpClient`, montagem de headers via `setHeaders`, assinatura HMAC dos requests do Shop, base URLs). A tradução resposta↔domínio é feita pela **ACL** (`TikTokOrderTranslator` / `TikTokAdsTranslator`). Os **Fakes** (`FakeTikTokOrdersGateway`/`FakeTikTokAdsGateway`) implementam as mesmas portas sem `HttpClient` (dados em memória).

### 10.2 Endpoints reais (pesquisa) — para o adapter real

**Pedidos — TikTok Shop Partner API** (host `https://open-api.tiktokglobalshop.com`, versão `202309`):

| Passo | Método | Caminho | Notas |
| ----- | ------ | ------- | ----- |
| Token | GET | `auth.tiktok-shops.com/api/v2/token/get` | `app_key`, `app_secret`, `auth_code`; usa expiry absoluto retornado |
| Refresh | GET | `auth.tiktok-shops.com/api/v2/token/refresh` | `refresh_token` |
| Shops | GET | `/authorization/202309/shops` | obtém `shop_cipher` (necessário nas chamadas) |
| Buscar pedidos | **POST** | `/order/202309/orders/search` | filtros de tempo (`create_time_ge/lt`), `page_size≤100`, `page_token`; status |
| Detalhe | GET | `/order/202309/orders?ids=...` | só se faltar campo no summary |

- **Auth por request:** header `x-tts-access-token`, `shop_cipher` na query, `app_key`+`timestamp`, e **assinatura HMAC-SHA256** (`sign`).
- **Campos:** `payment.total_amount` (venda), `payment.shipping_fee` (frete), `create_time` (data), `order_status`. **Sem @username** → usar `recipient_address` (nome, possivelmente mascarado) + número do pedido (TS11).
- **Status → nosso `ShipmentStatus`:** `UNPAID|AWAITING_SHIPMENT|AWAITING_COLLECTION|PARTIALLY_SHIPPING` → `PENDING`; `IN_TRANSIT|DELIVERED|COMPLETED` → `SHIPPED`; `CANCELLED` → `CANCELLED`.
- **Webhook:** `POST /api/webhooks/tiktok/orders` recebe `type=1 ORDER_STATUS_UPDATE`; verificar HMAC-SHA256 de `app_key + rawBody` no header `Authorization`; chamar `IngestTikTokOrderUseCase`.

**Ads — TikTok Business/Marketing API** (host `https://business-api.tiktok.com/open_api`, `v1.3`):

| Passo | Método | Caminho | Notas |
| ----- | ------ | ------- | ----- |
| Token | POST | `/v1.3/oauth2/access_token/` | `{app_id, secret, auth_code}` — **token não expira** |
| Advertiser | GET | `/v1.3/oauth2/advertiser/get/` | obtém `advertiser_id` |
| Gasto | GET | `/v1.3/report/integrated/get/` | `report_type=BASIC`, `data_level=AUCTION_ADVERTISER`, `dimensions=["advertiser_id"]`, `metrics=["spend"]`, `start_date`, `end_date` |

- **Total do período:** sem dimensão de tempo, vem 1 linha agregada `data.list[0].metrics.spend`. Janela máx ~30 dias/request (paginar/fatiar).
- **Sandbox Ads:** host `https://sandbox-ads.tiktok.com/open_api` (baixo risco). **Sandbox de Pedidos:** só UK/Indonésia (não há BR) — risco §17.

### 10.3 Espelho + sincronização

- `IngestTikTokOrderUseCase` usa `TikTokOrderTranslator.toDomain()` → `OrderRepository.upsert()`. O webhook e o backfill (busca por período no primeiro carregamento / agendado) alimentam o espelho.
- Ads: um job (ou no `GetAdSpendUseCase`) busca via `ITikTokAdsGateway`, grava `AdSpendDay(source=TIKTOK)`. Se `unavailable`, o front usa o valor `MANUAL` do dia (se houver) e marca `available:false`.

### 10.4 Fake adapter (dev/testes)

`FakeTikTokOrdersGateway` e `FakeTikTokAdsGateway` retornam dados realistas (derivados do seed atual do front). É o que liga o produto fim-a-fim sem a API real, e o que os testes de integração de casos de uso usam.

---

## 11. Código de barras

- **Geração do código (dado):** `BarcodeCodeGenerator` (nanoid, alfabeto sem `0/O/1/I/L`, 10 chars, prefixo `T`). `CreateTierUseCase` gera, tenta persistir; em violação de `@unique`, regenera (retry curto) → garante unicidade. Erro final improvável → `DUPLICATE_BARCODE`.
- **Render da etiqueta (imagem):** `IBarcodeRenderer` → `BwipBarcodeRenderer` usa **bwip-js** `toSVG({ bcid: "code128", text, includetext: true })` no servidor. Endpoint `GET /api/tiers/:id/label` devolve `image/svg+xml`. A página de etiqueta é Server Component; só o botão de imprimir é client.
- **Bipe (scanner keyboard-wedge):** hook client `useBarcodeScanner(onScan)` (`@/hooks/use-barcode-scanner.ts`) escuta `keydown` no `window`, acumula caracteres rápidos e dispara `onScan(code)` no Enter, descartando digitação humana (intervalo > ~50ms) e bursts < 4 chars. Na tela de empacotamento, `onScan` resolve via `GET /api/tiers/by-barcode/:code` e faz `incrementTier` no rascunho (toque continua funcionando — RN-2.9).
- **Impressão:** **MVP** = `window.print()` + CSS `@media print` com `@page { size: 50mm 30mm; margin: 0 }`. **Depois (QZ Tray)** = impressão silenciosa ZPL/ESC-POS via agente desktop (config de impressora moraria no modal de Configurações). Ver risco §17.
- **Libs:** `bun add bwip-js nanoid`.

---

## 12. Autenticação (Clerk)

- **Pacote:** `@clerk/nextjs`. Env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- **Next 16:** middleware é **`src/proxy.ts`** (não `middleware.ts`). `clerkMiddleware` protege **todas** as páginas e rotas de API; públicas só `/(sign-in|sso-callback)`. `await auth.protect()`.
- **Provider:** `<ClerkProvider>` no `src/app/layout.tsx` (continua Server Component).
- **Google-only, sem senha:** no painel do Clerk, habilitar Google SSO e desabilitar e-mail/senha e demais métodos. (Config de dashboard, não código.)
- **Acesso restrito (TS12):** cadastro **fechado** — usuários entram só por **convite** e/ou **criação manual no painel do Clerk**. Sem allowlist paga, sem self-service.
- **Proteção das rotas de API:** além do `proxy.ts`, cada `route.ts` confirma com `const { isAuthenticated, userId } = await auth()`; sem auth → `401 UNAUTHENTICATED`. `operatorId` do `Packing` = `userId` do Clerk.
- **Ler usuário:** servidor `currentUser()` (`fullName`, `primaryEmailAddress.emailAddress`, `imageUrl`); client `useUser()`.
- **UI custom (não usar componentes prontos):** sign-in com `useSignIn().sso({ strategy: "oauth_google", ... })` + página `/sso-callback`. **Modal de Configurações** lê `useUser()` (nome/email/foto) e sai com `useClerk().signOut()`. Estilizar com nossos primitivos (Tailwind), sobrepondo o `appearance` quando algum componente do Clerk for usado.
- Erros de auth → toast amigável PT (nunca texto cru do Clerk).

---

## 13. Front-end

### 13.1 Estrutura por camada (já definida no CLAUDE.md)

`component → hook (query|mutation) → service → HttpClient → API`. DI funcional via Inversify (`src/di/container.ts` + `symbols.ts`): services (factory functions) recebem o **`HttpClient`** (factory `axiosHttpClient`, §7.4) por injeção; hooks pedem a interface do service. Resolver pelo container dentro da factory. Nenhum service chama `axios`/`fetch` direto — sempre via `HttpClient`.

> **Localização das camadas no front:** a camada de **service fica em `src/service/`** (diretamente sob `src/`, **não** dentro de `src/hooks/`). `src/hooks/query/` e `src/hooks/mutation/` ficam separados e dependem da interface do service. Ou seja, `src/service/` e `src/hooks/` são irmãos.

### 13.2 Tratamento de erros (TS15)

- `@/lib/error-messages.ts`: mapa `ERROR_CODE → string PT amigável`. Fallback genérico; `INTERNAL_ERROR`/500 → "Erro interno no servidor".
- `HttpClient` lê o corpo `{ error: { code, fields } }` e lança um `ApiError` tipado (`code`, `fields`, `httpStatus`).
- `QueryClient` com `onError` global (queries e mutations) → `resolveMessage(error)` → `toast.error(...)` (sonner). Hooks específicos podem sobrescrever quando precisarem de UX diferente.

### 13.3 Componente `Modal` (composition + animações) — TS14

`src/components/ui/modal/` :

```
modal/
├── Modal.tsx            # container (overlay + foco + ESC + animação); props: { open, onOpenChange, animation, direction, children }
├── ModalHeader.tsx      # título/!-fechar
├── ModalContent.tsx     # corpo (children: ReactNode)
├── ModalFooter.tsx      # ações
├── animations.module.css  # 15+ keyframes (CSS modules)
└── use-modal-animation.ts # resolve a classe da animação a partir de (animation, direction); suporta "random"
```

```tsx
type ModalAnimation =
    | "fade" | "zoom" | "slide" | "slide-corner" | "flip-x" | "flip-y"
    | "rotate-in" | "bounce" | "swing" | "pop" | "blur-in" | "elastic"
    | "fold" | "glitch" | "drop" | "reveal" | "random";

// 8 direções de origem da animação (de onde o modal entra)
type ModalDirection =
    | "top-left" | "top" | "top-right" | "right"
    | "bottom-right" | "bottom" | "bottom-left" | "left";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animation?: ModalAnimation;   // default: "fade"
    direction?: ModalDirection;   // default: "bottom" (só aplicada a animações direcionais)
    children: React.ReactNode;
};

// uso (composition):
<Modal open={open} onOpenChange={setOpen} animation="slide" direction="top-right">
    <ModalHeader>Configurações</ModalHeader>
    <ModalContent>{/* abas: Custos fixos, Perfil */}</ModalContent>
    <ModalFooter>{/* ações */}</ModalFooter>
</Modal>
```

- **`direction` (8 valores):** define **de onde** a animação entra — `top-left`, `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`.
- **Animações direcionais vs centradas:** animações que têm origem espacial (ex.: `slide`, `slide-corner`, `fold`, `drop`, `reveal`) **usam** a `direction` para escolher o keyframe/transform de entrada. Animações que vêm do **centro da tela** (ex.: `fade`, `zoom`, `flip-x`, `flip-y`, `rotate-in`, `pop`, `blur-in`, `glitch`) **ignoram** a `direction`.
- `use-modal-animation.ts` resolve a classe final combinando `animation` + (quando direcional) `direction` — ex.: `slide` + `top-right` → classe `slideTopRight` do `animations.module.css`. Para `"random"`, sorteia uma animação e, se ela for direcional e nenhuma `direction` foi passada, sorteia também a direção (sorteio variado por contador/efeito, **não** `Math.random` em SSR).
- Estado de abertura: **local** (`useState`) no consumidor (ex.: botão do rodapé da sidebar). Zustand só se precisar abrir o mesmo modal de lugares distantes.

### 13.4 Telas afetadas (ajustes no front existente)

- **Renomear "Empacotar" → "Pedidos"** (`src/app/pedidos/`): lista por período (reusa seletor do Dashboard); pendentes no topo; botão "Empacotar" → navega para `/pedidos/[orderId]/empacotar` (rota dinâmica). **Componentizar a tabela** hoje no Histórico em `components/ui` e reusar.
- **Tela de empacotamento** (`src/app/pedidos/[orderId]/empacotar/`): cabeçalho **read-only** (cliente/venda/frete do pedido); contagem de faixas + avulsos; bipe; painel de margem ao vivo; "Concluir empacotamento" (`PUT /api/orders/:id/packing`).
- **Histórico:** coluna **CPA** e **Custo fixo**; margem líquida; resumo do período.
- **Dashboard:** lucro com ads + custo fixo; custo por categoria; série de margem.
- **Modal de Configurações** no rodapé da sidebar: aba **"Custos fixos"** (custo fixo por pedido) + **Perfil** (nome/email/foto do Clerk, sair).
- **Sem stores de seed:** trocar Zustand-seed por hooks de query/mutation reais (o catálogo/pedidos/ads passam a vir da API). Zustand fica só para estado de UI genuinamente compartilhado (ex.: rascunho do empacotamento, modal de etiqueta).
- **Remover a "saúde da margem" do front existente:** apagar `marginHealth`, `MARGIN_GOOD` e `MARGIN_WARN` de `src/utils/margin.ts` (e o tipo `MarginHealth` em `src/utils/types.ts`); o painel e as telas passam a exibir apenas **margem em R$ e %**, sem cor/badge por saúde. Remover também os tokens de cor (verde/amarelo/vermelho) e classes reservados a essa indicação em `globals.css`/componentes.

---

## 14. Testes

> Vai também para o `CLAUDE.md` (seção de Testes).

### 14.1 Escopo e estrutura

- **Só testamos dois alvos:** **(1) casos de uso** (integração) e **(2) entidades + domain services** (unidade).
- **NÃO escrevemos testes para:** fake adapters, mocks/stubs, e **implementações de infraestrutura** (repositórios/gateways Prisma, HttpClient, renderers). Esses entram apenas como **apoio** dos testes de caso de uso (os repos Prisma reais são exercitados **indiretamente** pelos testes de caso de uso no banco de teste; os fakes substituem APIs externas).
- **Runner:** `bun test`.
- **Pasta `test/` na raiz:**

```
test/
├── domain/            # *.spec  (unidade: entidades, VOs, domain services) — ALVO de teste
├── application/       # *.test  (integração: casos de uso no banco de teste + fakes) — ALVO de teste
├── fakes/             # apoio: FakeTikTokOrdersGateway, FakeTikTokAdsGateway, FakeBarcodeRenderer (NÃO testados)
├── stubs/             # apoio: respostas fixas quando preciso (NÃO testados)
└── helpers/           # apoio: setup do banco de teste, truncate, fábrica do container, builders (givenOrder/givenTier)
```

- **Convenção de nome:** `*.test.ts` = **integração** (banco de teste `patilu_test`); `*.spec.ts` = **unidade** (puro, sem I/O).
- **Banco de teste (TS4):** database dedicado, migrado pelo Prisma; helper faz **truncate** de todas as tabelas **antes de cada teste** (`beforeEach`). A conexão vem de uma variável **`TEST_DATABASE_URL`** separada (a app usa `DATABASE_URL`); ambas convivem no mesmo ambiente (`.env` local ou CI) — **sem `.env.test`**. **Sem override de env:** `test/helpers/prisma.ts` cria o `testPrisma` a partir do `TEST_DATABASE_URL`, e os testes **injetam** esse client nos repositórios/gateways (constroem com `testPrisma`, ou ligam `SYMBOLS.PrismaClient` ao `testPrisma` num container de teste local) — o `PrismaClient` é injetado por DI, nunca importado como singleton (ver §7). Um **preload** (`test/helpers/guard-test-db.ts`, via `bunfig.toml` `preload`) só **valida**: lê `TEST_DATABASE_URL` e aborta (exit 1) se faltar ou se o nome do banco não terminar em `_test`. O setup do banco de teste está embutido em `bun run db:migrate` (`scripts/setup-test-db.ts` → `prisma migrate deploy` no `TEST_DATABASE_URL`, que cria o banco se não existir).
- **Integração de caso de uso:** instanciar os **repositórios/gateways Prisma reais** (banco de teste) e **fakes** para externos (TikTok/Barcode). **1 teste de integração por caso de uso**, cobrindo o caminho crítico + os principais erros de regra.
- **Unidade:** entidades ricas, value objects e domain services (puros).
- **Padrão AAA** (Arrange, Act, Assert) em **todos** os testes — blocos visivelmente separados.
- **Filosofia:** testar **só o que importa**, com **assertions de alta qualidade** (verificar o resultado de negócio, não detalhes incidentais). **Não** perseguir cobertura.

### 14.2 Critérios de aceite dos testes

Cada item abaixo descreve **o que o teste deve garantir**. É a definição de "feito" da suíte.

**Casos de uso (integração — `test/application/*.test.ts`):**

| Caso de uso              | O teste deve garantir que…                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateCategoryUseCase`  | cria e persiste a categoria com o nome dado; **rejeita** nome vazio com `CATEGORY_NAME_REQUIRED`.                                                          |
| `RenameCategoryUseCase`  | renomeia a categoria existente; **erro** `CATEGORY_NOT_FOUND` se o id não existe; rejeita nome vazio.                                                       |
| `DeleteCategoryUseCase`  | remove a categoria e **as faixas dela passam a `categoryId = null`** (vão para "Sem categoria"), **não** são apagadas (PRD RN-1.1).                         |
| `CreateTierUseCase`      | cria a faixa com **código de barras único gerado**; persiste custo>0; **rejeita** custo ≤ 0 com `TIER_COST_MUST_BE_POSITIVE`; em colisão de código, **regenera** e ainda persiste único. |
| `UpdateTierUseCase`      | altera nome/custo/categoria; **erro** `TIER_NOT_FOUND` se não existe; **não** altera empacotamentos já feitos (snapshot intacto).                          |
| `DeleteTierUseCase`      | exclui a faixa; **empacotamentos passados continuam íntegros** com o snapshot da época (histórico não quebra — PRD RN-3.5).                                 |
| `FindTierByBarcodeUseCase` | resolve o código para a faixa correta; **erro** `TIER_NOT_FOUND` para código inexistente.                                                                |
| `IngestTikTokOrderUseCase` | **cria** o pedido espelhado quando novo e **atualiza status/dados** quando já existe (upsert idempotente pelo `tiktokOrderId`).                          |
| `ListOrdersUseCase`      | retorna os pedidos do período (limites em fuso SP), com **pendentes no topo** e ordenados por data do pedido (mais antigo primeiro).                        |
| `GetOrderForPackingUseCase` | retorna o pedido (read-only) + o empacotamento atual se houver; **erro** `ORDER_NOT_FOUND`.                                                              |
| `SavePackingUseCase`     | **congela** custo/nome de faixa/categoria dos itens; calcula o custo total certo; marca o pedido **`PACKED`** e registra `operatorId`; **exige ≥1 item** (`PACKING_REQUIRES_ITEM`); pedido `CANCELLED` **não** empacota (`ORDER_CANNOT_BE_PACKED`); re-salvar **regrava** o snapshot. |
| `DeletePackingUseCase`   | remove o empacotamento e o pedido **volta a `NOT_PACKED`**; **erro** `PACKING_NOT_FOUND` se não havia.                                                      |
| `GetHistoryUseCase`      | por período: **CPA = ads ÷ nº de pedidos** (e CPA=0 quando 0 pedidos); **margem líquida por pedido = venda − custo − frete − CPA − custo fixo**; resumo (receita/custo/lucro/margem média) coerente; usa os valores **congelados**. |
| `GetDashboardUseCase`    | **lucro = receita − custo − frete − ads − (custo fixo × nº pedidos)**; **custo por categoria** agrupado pela categoria **congelada** dos itens; série de margem por hora (dia) / dia (períodos maiores). |
| `GetAdSpendUseCase`      | total do período = **soma dos dias**; usa valor do **TikTok** quando disponível (fake) e cai no **manual** quando indisponível, refletindo `available`/`source`. |
| `SetManualAdSpendUseCase`| grava o ad spend manual do dia (`source = MANUAL`) e **sobrescreve** o valor anterior daquele dia.                                                          |
| `Get/SetFixedCostUseCase`| lê e grava o **custo fixo por pedido** (config singleton); valor inválido → `VALIDATION_ERROR`.                                                            |
| `ExportHistoryUseCase`   | gera CSV do período com as colunas certas (Data, Cliente, Hora, Venda, Custo, CPA, Custo fixo, Margem R$, Margem %).                                        |

**Entidades / domain services (unidade — `test/domain/*.spec.ts`):**

| Alvo                      | O teste deve garantir que…                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Money`                   | soma/subtração/multiplicação por quantidade em centavos sem erro de ponto flutuante; `dividedByCount(0)` → zero; `percentageOf` correto. |
| `Category`                | `rename` valida nome (erro de domínio em nome vazio).                                                                                  |
| `Tier`                    | `changeCost` rejeita ≤ 0; `rename` valida; `moveToUncategorized`/`assignToCategory` mudam a categoria.                                  |
| `Order`                   | `canBePacked()` é falso para `CANCELLED`; `markPacked`/`markNotPacked` alternam o estado; mapeamento de status do TikTok correto.       |
| `Packing`                 | `computeItemsCost` = Σ(qtd × custo) + avulsos; `incrementTier`/`decrementTier` (some o item ao zerar); `computeLiveMargin` = venda − custo − frete (R$ e %, **sem** CPA/custo fixo); `ensureCanConclude` exige ≥1 item. |
| `PeriodReportCalculator`  | CPA com 0 pedidos → 0; margem líquida por pedido; **Σ CPA reconcilia com o total de ads**; lucro do período; custo por categoria; série de margem (granularidade hora/dia). |

**Exemplo (integração, AAA):**

```ts
// test/application/save-packing.test.ts
test("SavePackingUseCase congela custo dos itens e marca o pedido como empacotado", async () => {
    // Arrange
    const { savePacking, orderRepo } = makeSut(); // repos Prisma reais (banco de teste) + fakes externos
    const order = await givenOrder({ saleReais: 90, shippingReais: 8 });
    const tier = await givenTier({ name: "Caderno R$8", costReais: 8 });
    // Act
    const packing = await savePacking.execute({
        orderId: order.id,
        operatorId: "user_123",
        items: [{ tierId: tier.id, quantity: 1 }],
        looseItems: [],
    });
    // Assert
    expect(packing.computeItemsCost().toCents()).toBe(800);
    expect((await orderRepo.findById(order.id)).isPacked()).toBe(true);
});
```

---

## 15. Documentação de API (zod-openapi + Scalar)

- **Zod é a fonte da verdade** de validação **e** de doc. Schemas em `src/lib/schemas.ts`; documento em `src/lib/openapi.ts` (`zod-openapi`), servido por `GET /api/openapi.json`; UI Scalar em `/api/reference`.
- Ao criar/alterar endpoint: atualizar schema + registrar caminho/erros no `openapi.ts`. Documentar também as **respostas de erro** (códigos da §9).

---

## 16. Ordem de construção (milestones)

1. **Fundações:** Prisma schema + migração; `Money`/VOs; container DI (back e front); `DomainError` + `toHttpResponse`; **`HttpClient` do back (classe abstrata) + `AxiosHttpClient`**; **`HttpClient` do front (`createHttpClient` + `axiosHttpClient`)** + `ApiError` + dicionário de erros; `bun add axios`; banco de teste + helpers.
2. **Auth (Clerk):** `proxy.ts`, provider, Google-only, proteção de rotas, sign-in custom + `/sso-callback`.
3. **Catálogo:** Category/Tier (entidades, repos, casos de uso, rotas, Zod/OpenAPI) + geração de código de barras + etiqueta SVG. Front: Categorias real + Modal/Configurações (custo fixo) + impressão.
4. **TikTok atrás da interface + Fake:** portas, ACL, espelho, `IngestTikTokOrderUseCase`, `ListOrdersUseCase`. Front: página **Pedidos** + rota de empacotamento + tabela componentizada.
5. **Empacotamento:** `SavePackingUseCase`/`DeletePackingUseCase`/`GetOrderForPackingUseCase` + bipe. Front: tela de empacotamento (read-only + contagem + margem ao vivo).
6. **Relatórios:** `PeriodReportCalculator`, `GetHistoryUseCase`/`ExportHistoryUseCase`/`GetDashboardUseCase`, ad spend (mirror + manual). Front: Histórico (CPA/custo fixo) + Dashboard.
7. **Adapter real do TikTok + webhook:** **adiado** até confirmar acesso à Partner API BR (plugar atrás das mesmas interfaces, sem tocar no resto).
8. **Impressão direta (QZ Tray):** opcional, depois.

---

## 17. Riscos e pendências

- **🔴 Acesso à API de Pedidos do TikTok no Brasil não confirmado** e **sem sandbox BR** (só UK/Indonésia). Mitigação: tudo atrás da interface + Fake (TS9); validar acesso no Partner Center antes do milestone 7. **Bloqueia só o adapter real**, não o produto.
- **Identificação do cliente:** TikTok não dá @username; usamos número do pedido + nome do destinatário (possivelmente mascarado). Confirmar na resposta real se o nome vem completo.
- **Custo fixo por pedido (TS17):** decidido aplicar o **valor atual** ao período (não congelar por pedido). Se no futuro o valor mudar com frequência, reavaliar congelamento por empacotamento (snapshot), como já fazemos com o custo dos itens.
- **Semântica de período com pedidos não empacotados:** receita/CPA/custo fixo consideram **todos os pedidos vendidos** no período; o **custo dos itens** só existe para pedidos empacotados (linhas pendentes mostram custo "—"). Converge quando tudo é empacotado. Documentado para evitar leitura errada do lucro durante a live.
- **Impressão direta** numa térmica a partir do navegador é limitada; MVP usa o diálogo do navegador. QZ Tray exige agente desktop + certificado.
- **Tokens TikTok:** lifetimes do Shop (access ~7d / refresh ~1a) **não confirmados** em página oficial legível — validar no portal. Ads token não expira (confirmado).
- **Cold start do Neon / sincronização entre aparelhos:** mecanismo de refresh (polling do React Query vs realtime) e warm-up ficam para a fase de deploy (TS1).

---

## 18. Requisitos funcionais (RF) — quebra para subtasks

Esta seção quebra a spec em **requisitos funcionais independentes e bem delimitados**, pensados para virar **subtasks de múltiplos agentes de IA**. Cada RF tem **escopo**, **dependências**, **início** (pré-condição: o que já precisa existir), **fim** (Definition of Done) e os **testes que o cobrem de ponta a ponta** (referenciando os critérios da §14.2). Um RF só é "feito" quando seus testes passam.

**Regras gerais (valem para todo RF):**

- **DoD de RF de back-end:** entidades/casos de uso/rotas implementados; **schema Zod + DTO** (§6.1/§8) e **OpenAPI** (§15) atualizados; **códigos de erro** (§9) cobertos; **testes da §14.2 passando** (`bun test`). Sem `any`; `bun run lint` limpo.
- **DoD de RF de front-end:** telas ligadas à API **via service → hook (query/mutation)** (sem seed/Zustand-mock); estados de erro via toast (§13.2); `bun run lint` limpo. (Front não tem suíte automatizada nesta fase — ver §14; a verificação é manual + lint/tipo.)
- **Testes** existem **apenas** para RFs de back-end com caso de uso e/ou entidade (§14). RFs marcados **(front)** não geram testes automatizados.

### 18.1 Ondas de execução (paralelização)

- **Onda 0 (sequencial, base):** RF-01 → RF-02 → RF-03. Bloqueiam quase tudo.
- **Onda 1 (paralelizável após onda 0):** RF-04 (auth), RF-05→RF-08 (catálogo back), RF-10 (config back), RF-12 (TikTok+pedidos back).
- **Onda 2:** RF-14 (empacotamento back, depende de RF-12), RF-16 (relatórios-core, depende de RF-12/RF-10), RF-11/RF-09 (front catálogo/modal).
- **Onda 3:** RF-17, RF-18 (relatórios back, dependem de RF-16), RF-13/RF-15 (front pedidos/empacotamento), RF-19 (front relatórios).
- **Adiado:** RF-20 (adapter real TikTok), RF-21 (impressão direta QZ Tray).

### 18.2 Catálogo de RFs

| RF | Escopo (o que entrega) | Depende de | Início (pré-condição) | Fim (DoD) + testes que o cobrem |
| -- | ---------------------- | ---------- | --------------------- | ------------------------------- |
| **RF-01** | Fundação back: `prisma/schema.prisma` (todos os models §4) + migração; VOs `Money`/`Barcode`/`Period`; `DomainError` + subclasses + `toHttpResponse` (§9); container DI back + `symbols`; **banco de teste** + helpers (truncate, builders `givenOrder`/`givenTier`). | — | repo atual (Prisma/Bun já configurados) | `bun run db:migrate` cria todas as tabelas; container resolve símbolos; helper de teste limpa o banco. **Testes:** unidade de `Money` (§14.2 — `Money`). |
| **RF-02** | HttpClient back (classe abstrata + `AxiosHttpClient`, §7.3) e front (`createHttpClient` + `axiosHttpClient`, §7.4) com generics body/headers/params; `ApiError` + dicionário `ERROR_CODE→PT` (§13.2); `QueryClient` com `onError` global; `bun add axios`. | RF-01 | `DomainError`/erros prontos | clients tipados compilam; toast dispara por código; container liga `HttpClient`. **Testes:** não (infra/HTTP não é alvo, §14). |
| **RF-03** | Base de documentação/validação: `src/lib/schemas.ts` (com `periodQuerySchema` + convenção de DTO `z.input`), `src/lib/openapi.ts`, rotas `/api/openapi.json` e `/api/reference` (Scalar). | RF-01 | — | `/api/reference` abre documento válido (vazio); `periodQuerySchema` exportado. **Testes:** não. |
| **RF-04** | Auth Clerk: `proxy.ts` (Next 16), `ClerkProvider`, Google-only, proteção de páginas+API, sign-in custom + `/sso-callback`, helper `requireAuth()` nas rotas (401 `UNAUTHENTICATED`). | RF-01, RF-02 | — | sem login nenhuma página/rota abre; rota protegida devolve 401 sem sessão. **Testes:** não (depende de Clerk/infra). |
| **RF-05** | Domínio catálogo: entidades `Category` e `Tier` + contratos `ICategoryRepository`/`ITierRepository` + impls Prisma. | RF-01 | schema migrado | repos persistem/recuperam agregados (mapToEntity). **Testes:** unidade `Category` e `Tier` (§14.2). |
| **RF-06** | Casos de uso de categoria: `CreateCategoryUseCase`, `RenameCategoryUseCase`, `DeleteCategoryUseCase` (faixas→null), `ListCatalogUseCase` (read gateway) + rotas + Zod/OpenAPI. | RF-03, RF-05 | repos de catálogo prontos | endpoints `/api/categories*` funcionando e documentados. **Testes:** integração dos 3 casos de uso de categoria (§14.2). |
| **RF-07** | Faixas: `BarcodeCodeGenerator` (nanoid) + `CreateTierUseCase` (código único + retry), `UpdateTierUseCase`, `DeleteTierUseCase`, `FindTierByBarcodeUseCase` + rotas + Zod/OpenAPI. | RF-05, RF-06 | repos de catálogo prontos | endpoints de faixa funcionando; código único garantido. **Testes:** integração dos 4 casos de uso de faixa (§14.2). |
| **RF-08** | Etiqueta: `IBarcodeRenderer` + `BwipBarcodeRenderer` (SVG) + `RenderTierLabelUseCase` + rota `GET /api/tiers/:id/label`. | RF-07 | faixa com código | rota devolve `image/svg+xml` Code128. **Testes:** integração `RenderTierLabelUseCase` (faixa existe → SVG; inexistente → `TIER_NOT_FOUND`). |
| **RF-09 (front)** | Página **Categorias** real (CRUD via services/hooks) + impressão de etiqueta (`window.print` + `@page`). Remover seed do catálogo. | RF-02, RF-06, RF-07, RF-08, RF-11 | endpoints de catálogo + Modal | CRUD e impressão funcionando contra a API. **Testes:** não (front). |
| **RF-10** | Config custo fixo: `IConfigPersistenceGateway` + `GetFixedCostUseCase`/`SetFixedCostUseCase` + rotas + Zod/OpenAPI. | RF-03 | schema migrado | endpoints `/api/config/fixed-cost` funcionando. **Testes:** integração `Get/SetFixedCostUseCase` (§14.2). |
| **RF-11 (front)** | Componente `Modal` reutilizável (composition + 15+ animações + `animation`/`direction`, §13.3) + **modal de Configurações** (aba Custos fixos + Perfil do Clerk). | RF-02, RF-04, RF-10 | endpoint de custo fixo + Clerk | modal abre da sidebar; salva custo fixo; mostra perfil. **Testes:** não (front). |
| **RF-12** | TikTok + Pedidos (atrás de interface): portas `ITikTokOrdersGateway`/`ITikTokAdsGateway` + ACL translators + **Fakes** + entidade/repo `Order` + `IngestTikTokOrderUseCase` + `ListOrdersUseCase` (+ read gateway) + rota `GET /api/orders` + stub do webhook (usa o use case). | RF-01, RF-03 | schema migrado | lista de pedidos vinda do Fake, pendentes no topo; ingestão idempotente. **Testes:** integração `IngestTikTokOrderUseCase` e `ListOrdersUseCase` + unidade `Order` (§14.2). |
| **RF-13 (front)** | Página **Pedidos**: lista por período (lógica do Dashboard), pendentes no topo, **tabela componentizada** (reusada no Histórico), botão "Empacotar" → rota `/pedidos/[orderId]/empacotar`. | RF-02, RF-12 | endpoint `/api/orders` | lista renderiza da API; navegação para empacotar. **Testes:** não (front). |
| **RF-14** | Empacotamento: entidade/repo `Packing` + `GetOrderForPackingUseCase`, `SavePackingUseCase` (snapshot + PACKED + operador + regras), `DeletePackingUseCase` + rotas `/api/orders/:id/packing` + Zod/OpenAPI. | RF-12 | `Order` + repos | endpoints de empacotamento funcionando; snapshot congelado. **Testes:** integração dos 3 casos de uso + unidade `Packing` (§14.2). |
| **RF-15 (front)** | Tela de **empacotamento** (`/pedidos/[orderId]/empacotar`): cabeçalho read-only (cliente/venda/frete), contagem de faixas + avulsos, **bipe** (`useBarcodeScanner` → `FindTierByBarcode`), painel de **margem ao vivo** (R$ e %), "Concluir empacotamento". Remover seed. | RF-02, RF-07, RF-13, RF-14 | endpoints de packing + faixa | empacotar fim-a-fim contra a API; bipe soma faixa. **Testes:** não (front). |
| **RF-16** | Núcleo de relatórios + ads: `PeriodReportCalculator` (domain service) + `IAdSpendPersistenceGateway` + `GetAdSpendUseCase` (soma diária, TikTok/manual) + `SetManualAdSpendUseCase` + rotas `/api/ad-spend*`. | RF-10, RF-12 | config + pedidos espelhados | CPA/margem líquida/lucro corretos; ad spend por período. **Testes:** unidade `PeriodReportCalculator` + integração `GetAdSpendUseCase`/`SetManualAdSpendUseCase` (§14.2). |
| **RF-17** | Histórico: `IReportPersistenceGateway` (read) + `GetHistoryUseCase` (linhas + CPA + custo fixo + margem líquida + resumo) + `ExportHistoryUseCase` (CSV) + rotas. | RF-14, RF-16 | empacotamentos + calculator | endpoints `/api/history*` corretos. **Testes:** integração `GetHistoryUseCase` e `ExportHistoryUseCase` (§14.2). |
| **RF-18** | Dashboard: `GetDashboardUseCase` (indicadores + custo por categoria + série de margem) + rota `/api/dashboard`. | RF-14, RF-16 | empacotamentos + calculator | endpoint `/api/dashboard` correto. **Testes:** integração `GetDashboardUseCase` (§14.2). |
| **RF-19 (front)** | Front de relatórios: **Histórico** (coluna CPA + custo fixo + margem líquida + export) e **Dashboard** (gráficos margem/custo por categoria). Remover seed e a "saúde da margem" do front (§13.4). | RF-02, RF-17, RF-18 | endpoints de relatório | telas renderizam da API; sem margin-health. **Testes:** não (front). |
| **RF-20** | **Adapter real TikTok** (adiado): `TikTokOrdersHttpGateway` + `TikTokAdsHttpGateway` (base `TikTokHttpGateway`), OAuth, assinatura HMAC, webhook real, sync/backfill. Substitui os Fakes atrás das mesmas portas. | RF-12, RF-16 | **acesso à API BR confirmado** | pedidos/ads reais entram pelas mesmas interfaces. **Testes:** integração dos use cases continua com Fake; o adapter real valida-se manualmente no sandbox/portal. |
| **RF-21** | **Impressão direta** (opcional): QZ Tray (ZPL/ESC-POS) como alternativa ao diálogo do navegador, config de impressora no modal. | RF-08, RF-11 | etiqueta + modal | impressão silenciosa funcionando. **Testes:** não. |

> Cada RF de back-end é uma fatia vertical fechada (domínio→aplicação→rota→doc→teste) **ou** um bloco coeso (ex.: fundação). Um agente consegue pegar um RF, ler suas dependências já prontas no repo (o "início") e entregar até o "fim" (testes da §14.2 passando) sem precisar de outro RF em andamento.

---

## 19. Mudanças no `CLAUDE.md`

Esta spec adiciona ao `CLAUDE.md` (feito em conjunto): convenções de **Repository vs PersistenceGateway** (§7), **ACL + mapToEntity/mapToPersistence** (§5.4/§7), **padrão de use case** (`*UseCase` + `IUseCase<Input,Output>` + reuso do DTO Zod, §6.1), **modelo de erros** (§9) e **estratégia de testes** (§14: escopo só de casos de uso + entidades, AAA, `bun test`, banco de teste local, `test/`, `*.test`/`*.spec`).
