@AGENTS.md

# Patilu Kits

Patilu Kits is the internal tool of **Patilu Acessórios**, a stationery store that sells live on TikTok streams. During a live, a customer joins a call and assembles a custom kit (e.g., 3 pens + 1 notebook), and the assortment changes every week — there's always something new.

**The problem it solves:** because the items are never the same, the store doesn't know how much each kit costs, and sells without seeing its margin. The solution is **not to track which item, but its cost tier** (e.g., "Pen R$1", "Notebook R$8"). At packing time, you count how many items of each tier went into the box, enter the selling price, and the system computes the margin on the spot.

## Stack

- **Next.js 16** (App Router) fullstack + **React 19** with the **React Compiler**
- **Bun** as package manager and script runner
- **TypeScript** (strict)
- **Tailwind CSS v4** for styling
- **TanStack Query** (React Query) for client-side API communication
- **Zustand** for state shared across components
- **React Hook Form** + **Zod** for forms and validation
- **Prisma 7** (ORM) + **PostgreSQL** as the database
- **Inversify 8** + **reflect-metadata** for dependency injection (decorators on the back-end, functional DI on the front-end)
- **zod-openapi** + **Scalar** (Swagger) for automatic API documentation
- **ESLint** + **Prettier** for linting and formatting

## Design system

**Before any UI work, read `docs/DESIGN.md`** (design tokens, app shell, motion, behavioral standards, anti-pattern bans) **and `docs/TYPOGRAPHY.md`** (Geist Sans/Mono type system). They are the canonical law for every current and future page. Hard rules: never `px` (CSS tokens → Tailwind utilities → `rem`), colors only via theme tokens (`themes/`), money values in Geist Mono with conditional semantic colors (a loss is never green/purple).

## Deployment

Deployed to **Cloudflare Workers** (via `@opennextjs/cloudflare`) with **Neon** Postgres in São Paulo, free tier, CI/CD on push to `main` (`.github/workflows/ci.yml`). Neon queries run over HTTP (`neonConfig.poolQueryViaFetch = true` in `src/lib/prisma.ts`) to avoid WebSocket cold-start failures on Workers.

### Pending: Hyperdrive

`neonConfig.poolQueryViaFetch = true` only covers **non-transactional** queries. **Interactive transactions** (`$transaction`) still use a WebSocket and can fail on a cold Cloudflare isolate (first request 500s, retry succeeds). Today this only affects `PackingPrismaRepository` (save/delete packing). **TODO:** if the packing write path flakes on cold start, migrate the DB connection to **Cloudflare Hyperdrive** (native connection pooling, no WebSocket) — or add a retry around the transaction as a stopgap. Hyperdrive requires reading the connection string from `getCloudflareContext().env.HYPERDRIVE` instead of `process.env.DATABASE_URL`, which means reworking the Prisma client construction in `src/server/di/container.ts` (currently built at module load).

## Commands

```bash
bun install              # install dependencies
bun run dev              # development server
bun run build            # production build
bun run lint             # eslint over src
bun run format           # prettier --write over src
bun run format:check     # check formatting without changing files
bun run db:up            # start postgres (docker compose)
bun run db:down          # stop postgres
bun run db:migrate       # prisma migrate dev
bun run db:generate      # prisma generate
bun run db:studio        # prisma studio
```

Before finishing any task, run `bun run lint` and make sure typing is correct.

## Structure

```
.
|-- prisma/
|   `-- schema.prisma                  # database schema (postgresql provider)
`-- src/
    |-- app/                           # App Router: pages, layouts and route handlers
    |   |-- api/<domain>/route.ts      # REST API routes (HTTP edge, NextResponse)
    |   |-- openapi.json/              # generated OpenAPI document
    |   `-- reference/                 # docs UI (Scalar/Swagger)
    |-- server/                        # back-end (OO + SOLID + Inversify w/ decorators)
    |   |-- domain/                    # domain entities (classes with behavior)
    |   |   `-- <EntityName>.ts
    |   |-- application/
    |   |   |-- use-case/              # one <Action>UseCase.ts per use case (orchestration)
    |   |   |   `-- contracts/         # IUseCase.ts + I<Action>UseCase.ts (one contract per use case)
    |   |   `-- gateway/               # I<Name>PersistenceGateway.ts + external gateway contracts
    |   |-- infrastructure/
    |   |   `-- gateway/               # persistence (Prisma), external APIs, integrations
    |   `-- di/
    |       |-- container.ts           # all back-end bindings
    |       `-- symbols.ts             # back-end injection symbols
    |-- service/                       # services: talk to the backend via HttpClient
    |-- hooks/                         # other hooks (e.g., store access)
    |   |-- query/                     # read hooks (queries) with TanStack Query
    |   `-- mutation/                  # write hooks (mutations) with TanStack Query
    |-- di/
    |   |-- container.ts               # front-end dependency injection (functional)
    |   `-- symbols.ts                 # front-end injection symbols
    |-- lib/                           # prisma client, zod schemas, http client, openapi
    |-- stores/                        # zustand stores
    |-- providers/                     # context providers (e.g., store providers)
    `-- generated/prisma/              # GENERATED Prisma client — never edit by hand
```

- **Import alias:** always `@/*` (mapped to `src/*`), never relative paths.
- **`src/generated/`** is generated by Prisma — never edit it, regenerate with `bun run db:generate`.
- **Migrations:** **never hand-write migration SQL.** Change `schema.prisma`, then let Prisma author the migration via `prisma migrate dev` (or `bun run db:migrate`). Prisma generates the SQL automatically; do not create or edit files under `prisma/migrations/` by hand.
- **Local database:** postgres via docker-compose on port `32774` (see `.env.example`).
- **Env vars:** read them via `process.env.X` (never a `requireEnv`-style helper). Every new environment variable **must** be typed in `env.d.ts` at the repo root (`declare global` → `NodeJS.ProcessEnv`) so `process.env.X` is a typed `string`, and added to `.env.example`. When a class depends on env vars, **encapsulate them as fields at the top of the class** (e.g. `private ACCESS_TOKEN = process.env.TIKTOK_ADS_ACCESS_TOKEN` in `TikTokAdsHttpGateway`) — never read `process.env` inline inside methods.
- **Naming — `UPPER_SNAKE_CASE`:** use it for **environment-variable-backed fields/constants** and **magic-number constants** (e.g. `MAX_WINDOW_DAYS`, `ACCESS_TOKEN`). This is the deliberate exception to the camelCase-for-variables rule in Coding standards.
- **API + docs:** when creating/changing an endpoint in `src/app/api/`, update the schemas in `src/lib/schemas.ts` and the document in `src/lib/openapi.ts`. Zod schemas are the source of truth for both validation and OpenAPI.

## Front-end architecture

**Functional** paradigm (no classes) following **SOLID**, with **dependency inversion** across all layers: each layer depends on an **interface (type)**, never on a concrete implementation. Dependencies are injected via **factory functions** (arrow functions that receive their dependencies and return an object of methods).

**Data flow:**

```
component → hook (query | mutation) → service → HttpClient → backend (route handler)
```

Each layer only knows the **interface** of the layer below it:

- **`src/lib/` — HttpClient:** an `HttpClient` interface (e.g., `get`/`post`/`put`/`delete`) with a concrete implementation (`fetch`-based). It is the only layer that actually knows about HTTP.
- **`src/service/` — Services:** hold **all** methods that talk to the backend. Each service **asks for the `HttpClient` interface** via injection and exposes its own interface (type) of methods. No component or hook calls `fetch` directly — always through a service.
- **`src/hooks/query/` — Read:** **query** hooks with TanStack Query (`useQuery`). They **ask for the service interface** via injection. Always use consistent **cache tags** (`queryKey`). When they need to reflect a result into global state, they use **only the setters** of the Zustand store — they never read or derive state inside a query hook.
- **`src/hooks/mutation/` — Write:** **mutation** hooks with TanStack Query (`useMutation`). They **ask for the service interface**. After writing, they invalidate the matching **cache tags** to keep queries in sync.

**Dependency injection (front):** the front-end uses Inversify in a **functional way, without decorators** (the paradigm here is functional). Bindings live in `src/di/container.ts` and symbols in `src/di/symbols.ts`. To inject, **import the container** inside the factory function and resolve the dependency by its symbol. This way services receive the `HttpClient` and hooks receive the service, always by interface (type), never by concrete implementation.

**Architecture rules:**

- Always invert dependencies: services depend on the `HttpClient` interface; query/mutation hooks depend on the service interface. Never instantiate the concrete implementation inside the consumer — resolve it via the container (`src/di/`).
- Query hooks are **read-only**: they may call store **setters**, never produce other side effects.
- Mutation hooks are **writes**: they invalidate cache tags on success.
- All API communication goes through a service; components never call `HttpClient`/`fetch` directly.
- Components consume only the hooks (`query`/`mutation`), never services directly.
- `queryKey` is the source of truth for cache tags — keep them consistent between query (usage) and mutation (invalidation).
- **Forms always use React Hook Form + Zod** (via `@hookform/resolvers/zod`): the Zod schema validates the form; reuse the schemas from `src/lib/schemas.ts` when the form payload matches the API's.

## Optimistic UI

Write mutations (create, rename, edit, delete) are **optimistic**: the cache is updated **before** the backend responds, so the UI reflects the change instantly. The pattern, built on TanStack Query mutation lifecycle:

- **Apply before the request (`onMutate`):** cancel in-flight reads for the affected cache tags, take a **snapshot** of the current cache, apply the change optimistically, and return the snapshot as mutation context. Because a resource can live in more than one cached query (e.g. an unfiltered list and a filtered/searched view), the optimistic write, snapshot, and rollback must cover **every** query under the relevant tag prefix, not just one key.
- **On error:** **revert** to the snapshot. The error toast is already emitted centrally by the `QueryClient`'s global `onError` (see Error handling) — mutation hooks must **not** toast the error again (no double toast); they only roll back.
- **On success:** show a **success toast** and otherwise **do nothing to the state** — the optimistic value already reflects reality, so **do not refetch/invalidate** (avoids a flicker). The one exception is reconciling **server-generated fields** the client could not know optimistically (ids, generated codes, timestamps): surgically replace the optimistic placeholder with the server response in place, which is visually seamless.
- **Deferred/undoable actions** (an action offered with an "undo" window) must fire the real request from a **stable owner** — the shared `QueryClient` and the service singleton — **never** from the component-scoped `useMutation`, because the row that triggered the action often unmounts on the optimistic change and would tear down its mutation observer before the deferred request runs.
- Keep optimistic ordering consistent with the backend's ordering so the optimistic position matches what a refetch would return.

## Back-end architecture

**Object-oriented** paradigm (classes), following **SOLID** and **always inverting dependencies through interfaces**. The implementation lives in `src/server/`. Routes (`src/app/api/`) are only the HTTP edge: they receive the request, delegate to a **use case**, and return the response.

**Layers (outside in):**

```
route handler (src/app/api) → use case (application) → gateway (infrastructure) → database / external API
                                      ↓
                                domain (entities)
```

- **`src/app/api/<domain>/route.ts` — Routes:** exposed with `NextResponse`. They only adapt HTTP: validate input (Zod), resolve the use case via the container, and map the result/errors to the response. **Every route is documented** with zod-openapi + Scalar (Swagger) — update `src/lib/openapi.ts` when creating/changing endpoints.
- **`src/server/application/use-case/` — Use cases:** isolated use cases that **orchestrate** the flow (entities + gateways). They depend on gateway **interfaces**, never on implementations. They follow the **use case pattern** below.
- **`src/server/infrastructure/gateway/` — Gateways:** implement the interfaces the use cases ask for — persistence/database (via Prisma), plus external APIs, integrations, etc. (`PersistenceGateway` and the like). It is the only layer that knows infrastructure details.
- **`src/server/domain/<EntityName>.ts` — Domain:** entities as **classes with behavior**, reflecting the business. The domain layer **knows nothing external** (no gateways, no Inversify, no framework).

**Repositories vs PersistenceGateways (always invert with an interface/contract):**

- **Repository = a domain service over an aggregate.** Its contract is an interface created in the **domain** layer at `src/server/domain/repository/I<Aggregate>Repository.ts`. The implementation lives in **infrastructure** at `src/server/infrastructure/repository/<Aggregate>PrismaRepository.ts`. A repository **persists the whole aggregate**.
- **PersistenceGateway = data that does NOT map to a domain aggregate** — when you need to persist/read specific information without instantiating or interacting with an aggregate (e.g. read models to populate a page, simple config values, SQL aggregations). Its contract is an interface created in the **application** layer at `src/server/application/gateway/I<Name>PersistenceGateway.ts`. The implementation lives in **infrastructure** at `src/server/infrastructure/gateway/<Name>PrismaPersistenceGateway.ts`.
- **Rule of thumb:** prefer giving meaning to the domain via aggregates and persisting them whole through repositories. Reach for a PersistenceGateway when loading the whole entity is unnecessary (read-heavy page data, reports). Both — repository or gateway — **always respect the Dependency Inversion Principle** (depend on the interface, never the concrete class).
- **External gateways** (TikTok, barcode, etc.) follow the PersistenceGateway placement (contract in `application/gateway/`, impl in `infrastructure/gateway/`).

**Mapping (entity ↔ persistence ↔ external):**

- **ACL (Anti-Corruption Layer)** for external integrations (e.g. TikTok HTTP): a class in the **domain** layer with exactly two methods — `toDomain(): Entity` and `toDTO(): DtoForTheIntegration`.
- Inside a **repository**, conversion from the Postgres rows to the entity is done by a **private** method `mapToEntity` (and `mapToPersistence` if needed) declared **at the end of the class**. The same applies to PersistenceGateways when needed.

**Use case pattern:**

- **File and class end with `*UseCase`** (e.g. `CreateTierUseCase.ts`, class `CreateTierUseCase`), in `src/server/application/use-case/`.
- Every use case **implements a contract `I<Action>UseCase`** that **extends the generic `IUseCase<Input, Output>`**. The generic forces a **single public method `execute(input): Promise<Output>`**.
- Contracts live in `src/server/application/use-case/contracts/` (note the dash in `use-case`): `IUseCase.ts` + one `I<Action>UseCase.ts` per use case. **Each contract exports its own `Input` and `Output` types.**
- Dependencies (repositories/gateways) are injected via Inversify (`@injectable`/`@inject(SYMBOL)`), always by **interface**.
- **Reuse the Zod schema for typing:** when a use case's `Input` is **exactly** what the endpoint's Zod schema validates, the `Input` **is the schema's inferred type**. Where the schema is defined (`src/lib/schemas.ts`), export a DTO with `export type <Action>DTO = z.input<typeof <action>Schema>;` and the contract does `export type Input = <Action>DTO;`. Validation (Zod) and the use case's typing must never diverge. (When the use case also needs data not in the validated body — e.g. an `id` from the route or `operatorId` from Clerk — the `Input` is that DTO **plus** those fields.)

```ts
// application/use-case/contracts/IUseCase.ts
export interface IUseCase<TInput, TOutput> {
    execute(input: TInput): Promise<TOutput>;
}
```

```ts
// application/use-case/contracts/ICreateTierUseCase.ts
import type { IUseCase } from "./IUseCase";
import type { CreateTierDTO } from "@/lib/schemas"; // z.input<typeof createTierSchema>

export type Input = CreateTierDTO;
export type Output = { id: string; name: string; costCents: number; barcode: string; categoryId: string | null };

export interface ICreateTierUseCase extends IUseCase<Input, Output> {}
```

```ts
// application/use-case/CreateTierUseCase.ts
import type { ICreateTierUseCase, Input, Output } from "./contracts/ICreateTierUseCase";

@injectable()
export class CreateTierUseCase implements ICreateTierUseCase {
    constructor(/* dependencies via Inversify */) {}

    async execute(input: Input): Promise<Output> {
        // executes the use case
    }
}
```

**Domain entity rules (avoid anemic models):**

- Entities **always have behavior** — never classes with only getters/setters that say nothing about the domain.
- By default, when creating an entity: **all properties private** and **no setters**.
- Before adding a setter, ask: _"why should I add a setter to this entity?"_ — the answer is the **behavior** to express. The method must be named after a **domain intention** (not `setX`) and contain the **validations with domain errors** and business rules.
- The same question applies to getters: expose only what the domain needs, with an appropriate name.

## Dependency injection (back)

- Inversify with **decorators** + `reflect-metadata`. Bindings in `src/server/di/container.ts` and symbols in `src/server/di/symbols.ts`.
- Use cases and gateways use Inversify decorators referencing the **symbols**; each class depends on the **interface** of the layer below, never on the concrete implementation.
- **The `PrismaClient` is injected, never imported as a singleton.** `src/lib/prisma.ts` exports only `createPrismaClient(connectionString?)`. The container binds `SYMBOLS.PrismaClient` to one client built from `DATABASE_URL`; every Prisma repository/gateway receives it via `constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient)` and uses `this.prisma`. This is what lets tests pass a different client (the test DB) without any env override — they just construct the repo with `testPrisma` (or bind `SYMBOLS.PrismaClient` to `testPrisma` in a local test container).
- **Exception:** the **domain layer does not use Inversify** and knows no external implementations.
- `reflect-metadata` must be imported exactly once at the container entrypoint; `experimentalDecorators` and `emitDecoratorMetadata` are already enabled in `tsconfig.json`.

## Error handling

**Every error in the project carries our own code in `UPPER_SNAKE_CASE`** in the response, so the front-end can react by code (never by parsing messages).

**Response shape (single form):**

```jsonc
{
    "error": {
        "code": "TIER_COST_MUST_BE_POSITIVE", // our code, UPPER_SNAKE_CASE
        "message": "technical message (logs/dev)",
        "fields": { "costReais": ["Informe um custo válido"] }, // only on VALIDATION_ERROR
    },
}
```

**Where each error is born and its HTTP status:**

- **Validation (Zod)** — at the **route** (HTTP edge). On `safeParse` failure → `400` `VALIDATION_ERROR`, with `fields` listing **exactly** the fields that are wrong or missing.
- **Business rule** — in the **entity / domain service**, as a `DomainError` subclass carrying `code` + `httpStatus`. The route maps it to **422**.
- **Not found** — thrown **directly in the repository/gateway** (when a lookup by id/name/code finds nothing), **never in a use case**. It is a dedicated **`NotFoundError`** in `src/server/infrastructure/errors/NotFoundError.ts` (it `extends Error`, **not** `DomainError`). Its `httpStatus` is **always `404`** (never a constructor parameter); it has a **default message and a default code (`NOT_FOUND`)**, but both **may be overridden** via constructor args — pass a specific `code` (e.g. `CATEGORY_NOT_FOUND`, `TIER_NOT_FOUND`, `ORDER_NOT_FOUND`) and a template-literal message identifying which aggregate/record/id was not found (e.g. `new NotFoundError(\`Category not found: ${id}\`, "CATEGORY_NOT_FOUND")`). The repository's `findById`/`findByX`that must resolve a record **throws**`NotFoundError`instead of returning`null`. `toHttpResponse`handles`NotFoundError`alongside`DomainError`.
- **External API errors** — thrown **directly in the HTTP gateway** of the integration → **502**.
- **Unauthenticated** — Clerk (`proxy.ts` / handler `auth()`), `401` `UNAUTHENTICATED`.
- **Internal/unhandled** → `500` `INTERNAL_ERROR`.

Routes wrap the use case in `try/catch` and use a central helper (`src/lib/http-error.ts` → `toHttpResponse(error)`) that reads the error's `code`/`httpStatus` and returns the `NextResponse`.

**Front-end:** a central dictionary `ERROR_CODE → friendly PT message` (`src/lib/error-messages.ts`). The `HttpClient` parses `{ error }` into a typed `ApiError`. The `QueryClient` has a **global `onError`** (queries and mutations) that resolves the message by code and shows a **toast (sonner)** — always friendly, in Portuguese. A `500`/`INTERNAL_ERROR` shows "Erro interno no servidor". Hooks may override when a specific UX is needed. **Never** surface raw/technical text to the user.

## Testing

- **Runner: `bun test`** (Bun is already the project's package manager and runner).
- **We test only two targets: (1) use cases (integration) and (2) entities + domain services (unit).** We do **NOT** write tests for fake adapters, stubs/mocks, or infrastructure implementations (Prisma repositories/gateways, HttpClient, renderers) — those are only **support** for the use case tests (the real Prisma repos are exercised **indirectly** through the use case tests against the test database; fakes stand in for external APIs).
- **`test/` folder at the repository root:** `test/domain` (`*.spec`, unit — the test target), `test/application` (`*.test`, integration — the test target), plus support-only folders. **Test doubles go in dedicated folders by kind:** create **mocks** in `test/mocks`, **stubs** in `test/stubs`, and **fakes** in `test/fakes` (one export per file, file named after the class, e.g. `test/stubs/StubOrdersGateway.ts`). `test/helpers` holds setup/truncate/container factory and builders like `givenOrder`/`givenTier`.
- **Naming:** `*.test.ts` = **integration** tests; `*.spec.ts` = **unit** tests. **One file per use case** in `test/application/`, named `<UseCaseName>.test.ts` (e.g. `CreateTierUseCase.test.ts`). Never consolidate multiple use cases in a single file.
- **Integration tests really hit the local database.** Use a **dedicated test database** (e.g. `patilu_test`), migrated by Prisma, and **truncate all tables before each test** (`beforeEach`, via a helper). Instantiate the **real Prisma repositories/gateways** in the test; for **external integrations (HTTP/APIs) use fake adapters** (in `test/fakes`) — never hit the real integration.
- **Two separate env vars: `DATABASE_URL` (the app) and `TEST_DATABASE_URL` (the tests).** Both live in the same environment (local `.env` or CI/prod) — there is **no `.env.test`**. This lets a CI/prod pipeline run the suite against its own test DB using the same env scheme.
- **How tests reach the test DB:** there is **no env override**. `test/helpers/prisma.ts` builds `testPrisma` from `TEST_DATABASE_URL`, and the integration tests inject it into the repos/gateways (construct them with `testPrisma`, or bind `SYMBOLS.PrismaClient` to `testPrisma` in a local test container). The app's `DATABASE_URL` is never used by the tests. A **preload** (`test/helpers/guard-test-db.ts`, wired via `bunfig.toml` `preload`) runs before any test and only **validates**: it reads `TEST_DATABASE_URL` and aborts with exit 1 if it is missing or its **database name does not end in `_test`** — so the suite can never truncate a non-test DB. **Never** name the dev/prod database with a `_test` suffix.
- **Setup is folded into `bun run db:migrate`:** it migrates the dev DB (`prisma migrate dev`) and then creates + migrates the test DB (`scripts/setup-test-db.ts` → `prisma migrate deploy` against `TEST_DATABASE_URL`, which creates it if missing). No separate test-DB command to run.
- **One integration test per use case** (covering the critical path + main business-rule errors). **Unit tests** cover entity behavior, value objects, and domain services.
- **AAA pattern (Arrange, Act, Assert)** in **every** test — the three blocks visibly separated.
- **Tests must be well-defined with acceptance criteria:** for each use case and entity/domain service, state explicitly _what behavior the test guarantees_ (the expected business outcome), so the suite proves the software works as intended.
- **Test only what matters:** the most critical system behaviors and the entities' units. Aim for **high-quality assertions** (assert the business outcome, not incidental details). **Coverage metrics are not a goal.**

## Coding standards

- All source code must be written in English.
- camelCase for methods, functions and variables; PascalCase for classes and interfaces; kebab-case for files and directories (exception: React hook files use camelCase — see the React section).
- Avoid abbreviations, but also avoid long names (over 30 characters).
- Declare constants to represent magic numbers readably.
- Methods and functions perform one clear, well-defined action, reflected in the name, which must start with a verb, never a noun.
- Always use import aliases instead of relative paths.
- Avoid passing more than 3 parameters; prefer objects when needed.
- Avoid side effects: a method either mutates or queries, never let a query have side effects.
- Never nest two if/else; prefer early returns.
- Never use flag params to switch behavior; extract into specific methods/functions.
- Avoid long methods (over 50 lines).
- Avoid long classes (over 300 lines).
- Always invert dependencies on external resources (Dependency Inversion Principle) in both use cases and interface adapters.
- Avoid blank lines inside methods and functions.
- Avoid comments whenever possible.
- Never declare more than one variable on the same line.
- Declare variables as close as possible to where they are used.
- Prefer composition over inheritance.
- At most one export per file, and the file name must be the name of the function/class/component/page.

### TypeScript

- All code must be written in TypeScript.
- Use bun to manage dependencies and run scripts.
- Install library types when needed.
- Before validating a task, always check that typing is correct.
- Use `const` instead of `let` whenever possible.
- Class properties always `private` or `readonly`, avoiding `public`; prefer declaring them in the constructor.
- Order within a class: constructor at the top (with properties declared outside the constructor right above it), then public methods, then private ones.
- Prefer `find`, `filter`, `map` and `reduce` over `for`/`while`.
- Always use async/await for promises; avoid callbacks.
- Never use generator functions (`yield`).
- Never use `any`; reuse existing types, create your own types, or use the library's types.
- Never use `require`/`module.exports`; always `import`/`export` at the top of the file.
- Always named exports, never default.
- Avoid circular dependencies.
- Always use arrow functions (named and anonymous), never `function`.
- In files that contain a class, never declare non-exported functions at the module level. Logic used only by that class belongs as a **private method** of the class (placed below the public methods).

### React / Next.js

- Always functional components, never classes; always `.tsx`.
- Pass props explicitly; avoid spread (`<Component {...props} />`).
- Never use `"use client"` in pages; prefer SSR/SSG/ISR/PPR. When you need browser interaction or state, extract a component and put `"use client"` on it.
- **Pages are Server Components.** Write the page markup directly in `page.tsx` and extract Client Components only for the parts that genuinely need state/interactivity. Never create a single root `"use client"` component (e.g. a `*-screen.tsx`) that holds the whole page — that is equivalent to making the page itself a Client Component (anti-pattern). When a piece of local state must be shared across an interactive section, keep the static, server-rendered chrome (titles, descriptions) in `page.tsx` and pass it into the client island via props/`children`.
- Avoid components over 300 lines.
- Keep simple, local UI state in the component itself with `useState` (always use relative state). Use Zustand **only** for state that is genuinely shared across components, to avoid prop drilling — never for local state.
- **Prefer Zustand over React Context** for shared client state — global module-level stores (`create`) in `src/stores/`, no custom context providers.
- **Prefer semantic HTML tags** (`header`, `main`, `nav`, `aside`, `section`, `footer`, `h1`…); use `div` only for genuinely generic containers.
- Avoid more than 5 props per component, except UI actions (`onClick`, `onDragEnd`, etc.); manage state with Zustand to avoid "prop-calypse".
- **Maximize reusability.** Before writing UI, look for an existing primitive in the project to reuse (buttons in `components/ui/button.tsx`, plus forms, inputs, labels, etc.). If a suitable primitive does not exist, create it under `components/ui/` and use it everywhere — always built with Tailwind utilities and CSS tokens. Standardize buttons through the `Button` primitive and its variants; never style one-off `<button>` elements.
- Use Tailwind for styling; never styled-components.
- Never use hex colors directly on elements; always Tailwind utilities (backed by CSS tokens).
- **Always use relative measures — never `px` in classes.** Prefer, in order: (1) CSS tokens, (2) Tailwind utilities, (3) `rem` as the last resort. In Tailwind v4 the spacing scale is dynamic, so an arbitrary `rem` almost always has a canonical utility (e.g. `py-[0.8125rem]` → `py-3.25`, since the unit is `0.25rem`). `bun run lint` runs **eslint-plugin-better-tailwindcss**, which enforces canonical class names (`enforce-canonical-classes`), consistent class order, shorthands, and flags unregistered classes — resolve these (run `eslint src --fix` to auto-apply). Custom classes live in `globals.css` as v4 `@utility` so the linter recognizes them.
- **User-facing messages and errors must always be friendly and clear** (in Portuguese, the language of the store's users). Surface them through the toast system (`sonner`), never raw/technical text.
- Repeated styles become CSS tokens/utilities in `globals.css` (colors, fonts, sizes) — keep visual consistency.
- Always use React Query to talk to the API.
- Never memoize manually (`useMemo`/`useCallback`/`React.memo`) — the React Compiler memoizes at build time.
- Name hooks with `use` (e.g., `useAuth`, `useLocalStorage`).
- **Hook files use camelCase** matching the exported hook name (e.g. `useRenderZpl.ts`), not kebab-case — the one exception to the kebab-case file rule. (Some older hooks still use kebab-case; new hooks follow camelCase.)
- When a component grows with many props (`shouldShowIcon`, `iconLeft`, `buttonLabel`...), apply the composition pattern: break it into smaller pieces, manage their state with a single Zustand store, one file per piece, exporting each in its own file.

> **Framework exception to the export rule:** Next.js requires `export default` in `page.tsx`, `layout.tsx`, `template.tsx`, `error.tsx`, etc., and requires named route handlers (`GET`, `POST`, ...) in `route.ts`. Follow Next's convention in those cases — the "always named, never default" rule applies to the rest of the code.
