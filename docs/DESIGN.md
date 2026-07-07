# Patilu Kits — Design System

Canonical design reference for **every** UI decision in this project. Any new page, component, or visual change MUST follow this document. It is timeless: it applies to pages that do not exist yet. When a rule here conflicts with older code, this document wins and the old code is migration debt (see the snapshot at the end).

Companion docs:

- **`docs/TYPOGRAPHY.md`** — the canonical type system (families, scale, usage rules). Any typography change MUST be reflected there; agents adding text styles read it first.
- **`PRODUCT.md`** (repo root) — who the users are and what the tool is for.

## 1. Design direction (decided, do not relitigate)

- **Register: product.** The tool must disappear into the task. Earned familiarity (Linear, ChatGPT, Vercel-level conventions), never decoration for its own sake.
- **Theme: "disciplined lilac".** The Patilu purple identity stays, but as a quiet environment: near-neutral purple-tinted surfaces, saturated purple reserved for actions and selection (≤10% of any screen), pink reserved for the brand mark only. Money semantics (green profit / red loss) are sacred and never used decoratively.
- **Fonts: Geist Sans + Geist Mono** (see `docs/TYPOGRAPHY.md`). Baloo 2 and Inter are removed.
- **Sidebar: icon-rail collapse** (ChatGPT-style), spec in §7.
- This is a money tool used in a hurry between TikTok lives. Packing speed beats flourish; numbers must read with total trust.

## 2. Units — NEVER use `px`

**Hard rule: never `px` in classes or component styles. Always relative measures.** Preference order:

1. **CSS tokens** (defined in `themes/*.css` / `globals.css`);
2. **Tailwind utilities** (the v4 spacing scale is dynamic — `py-3.25` exists; run `eslint src --fix` to canonicalize);
3. **`rem` as a last resort** (arbitrary value like `w-[3.25rem]` only when no utility or token fits).

Allowed exceptions (the only ones):

- **Hairline borders** via the `border` utility (1px) — never arbitrary `border-[2px]`-style widths.
- **Shadow offsets/blur inside token definitions** (`--shadow-xs: 0 1px 2px …`) — shadows are paint, not layout.
- **`1px` inside generated chart/SVG internals** where stroke width is intrinsic.

Anything else in `px` is a bug. This extends the existing rule in `CLAUDE.md` and applies to docs too: specify sizes in `rem`/utilities when writing specs.

## 3. Color system

All colors live as tokens in `themes/orchid-theme.css` (default theme, applied via `[data-theme="orchid"]` — the `themes/` folder exists so alternative themes can be added without touching components). **Never a raw hex/oklch value inside a component.** Never Tailwind palette colors (`emerald-100`, `violet-700`, …) — those bypass the theme.

OKLCH only. Neutrals are tinted toward the brand hue (~300) with chroma 0.004–0.02. Values below are the calibrated starting point; adjust lightness/chroma visually, never the structure:

```css
[data-theme="orchid"] {
    /* layered neutrals (Radix-scale roles) */
    --background: oklch(96.5% 0.012 300); /* app shell (replaces the radial gradient) */
    --surface: oklch(99.4% 0.004 300); /* content card, panels, table bg */
    --surface-2: oklch(97.8% 0.008 300); /* table header, wells, inset fields */
    --hover: oklch(95.5% 0.014 300); /* hover bg (one scale step ≈ 3–5% L shift) */
    --active: oklch(93.5% 0.02 300); /* pressed/selected bg */
    --border: oklch(92% 0.015 300); /* the subtle 1px card/table border */
    --border-strong: oklch(87% 0.02 300); /* inputs, focused borders */
    --ink: oklch(25% 0.06 300); /* primary text */
    --ink-muted: oklch(50% 0.035 300); /* secondary text, labels */

    /* brand */
    --primary: oklch(54% 0.21 295); /* actions, selection, links */
    --primary-hover: oklch(50% 0.21 295);
    --primary-soft: oklch(94% 0.04 295); /* selected-item bg, soft badges */
    --brand-pink: oklch(70% 0.17 350); /* brand mark ONLY — never data, never buttons */

    /* money & status — semantic, never decorative */
    --positive: oklch(56% 0.13 160);
    --negative: oklch(55% 0.19 25);
    --warning: oklch(70% 0.14 75);

    /* charts (max 5 series) */
    --chart-1 … --chart-5: mid-chroma OKLCH ramp around hue 295→350;
}
```

Usage laws:

- **One accent.** Purple carries: primary buttons, active nav item, selection, links, focus ring. Nothing else.
- **Money values are conditional, always:** `value >= 0 → ink (or positive when it is a profit metric); value < 0 → negative`. A loss shown in green/purple is a P0 bug.
- **No rainbow KPIs.** Stat values render in `ink`; color lives in the **delta** (▲ `positive` / ▼ `negative` + explicit sign). Arrow + color together, never color alone (color-blindness).
- **Status chips** use semantic tokens (`positive`/`warning`/`primary-soft`), not Tailwind palette classes.
- Muted text must keep ≥ 4.5:1 contrast on `surface` at body sizes.

## 4. Surfaces, borders, radius, elevation

Modern depth = **1px low-contrast border + near-invisible shadow**, not colored drop shadows.

- **Card recipe (the only one):** `bg-surface border border-border rounded-(--radius) shadow-xs`. No purple glows, no `0 12px 34px` shadows, ever.
- **Shadow scale:** `--shadow-xs` (cards, bars) and `--shadow-pop` (popovers/modals/dropdowns, a 2-layer stack ≤ 6% alpha). Nothing else.
- **Radius scale (single source):** `--radius: 0.625rem`; derived: `sm 0.375rem` (inputs' inner elements, chips), `md 0.5rem` (nav items, buttons), `lg 0.625rem` (cards, inputs), `xl 0.875rem` (modals, the content canvas). Pills (`rounded-full`) only for chips/badges/toasts — not buttons.
- **Nesting rule:** inner radius = outer radius − padding between them. Never nest same-radius corners.
- **Nested cards are banned.** A card inside a card means the structure is wrong — use spacing, a divider, or `surface-2`.

## 5. Iconography

- **Own icon set — no icon library.** Icons live in `src/components/ui/icons/` (one component per icon, e.g. `PackageIcon`), all built on the shared `src/components/ui/icon.tsx` base (24×24 viewBox, `currentColor` stroke). Need a new icon? Add a new file there with its SVG paths — never install a dependency for it.
- No inline one-off SVGs in feature components, no text characters as icons (`↓`, `×`, `+` are banned — use `XIcon`, etc.).
- Default size `size-4.5` (1.125rem); `size-4` in dense rows; stroke width 1.75 (the base's default).
- Every nav item, action button, and empty state has an icon. Icon-only buttons require `aria-label` and (on hover) a tooltip.

## 6. Spacing & layout

4-point grid (Tailwind scale). Reference values:

- Page content padding: `p-6` (1.5rem); large screens may go `p-8`.
- Gap between cards/sections: `gap-4` (1rem); between KPI cards: `gap-3` or `gap-4`, one choice per grid, consistent.
- Card internal padding: `p-5` (1.25rem) default, `p-4` dense.
- Table rows: `h-11` (2.75rem) with `hover:bg-hover` transition; no zebra striping. Numeric columns right-aligned.
- Buttons: `h-9` (2.25rem) default, `h-8` compact, `h-11` prominent (packing flow keeps large touch targets ≥ `h-11`).
- Inputs: `h-10` (2.5rem).
- **Page header pattern (every page):** inside the content canvas, a `h-12` header row (`px-6`, aligned with content padding): page title + optional subtitle, actions (period tabs, export…) right-aligned. Titles never float in the content body. The sidebar open/close control lives **only in the sidebar itself** (expanded: close button in its header; collapsed: the logo hover-swap button) — never duplicated in the page header.

## 7. App shell (sidebar + content canvas)

Inverted layering: the sidebar is a **zone**, not a card; the content is the elevated surface ("structure is felt, not seen").

- Shell background: `--background` fills everything; **no radial gradient**.
- Sidebar: transparent over the shell bg, **no border, no card, no shadow**.
- Content: a `bg-surface border border-border rounded-xl shadow-xs` canvas with a `0.5rem` gutter on top/right/bottom (`m-2 ml-0` pattern).

Sidebar spec:

| Property | Value |
| --- | --- |
| Expanded width | `16rem` |
| Collapsed rail | `3.25rem` |
| Nav item | `h-9`, `px-2.5`, `rounded-md`, `text-sm font-medium`, icon `size-4.5` + `gap-2` |
| Active item | `bg-primary text-white` (or `primary-soft` + `text-primary` — pick once, apply everywhere) |
| Collapse animation | `width` 220ms `var(--ease-out)`; content does not fade mid-flight |
| Persistence | cookie `sidebar_state` (7-day max-age), read server-side in `layout.tsx` → renders correct state on first paint, **zero flash** (this is why it is a cookie, not localStorage) |
| Keyboard | `Cmd/Ctrl+B` toggles |
| Collapsed rail items | icon-only `size-9` centered; `Tooltip` (own primitive, `src/components/ui/tooltip.tsx`) on the right, only while collapsed (700ms open delay, 300ms warm-group window) |
| Logo hover swap (ChatGPT behavior) | rail header button `size-9` holds **two stacked icons**: brand "P" (default) and panel-open icon (hidden); `group-hover` on the whole rail swaps them and shows tooltip "Abrir barra lateral" offset `0.5rem` to the right |
| Mobile | sidebar becomes an overlay sheet (`18rem`), never squeezes content |

## 8. Motion

Motion conveys state — never decoration. Tokens:

```css
--duration-fast: 120ms; /* hovers out, icon micro-motion */
--duration-base: 180ms; /* dropdowns, popovers, tabs */
--duration-slow: 240ms; /* modals, sidebar collapse */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* on-screen movement only */
```

Catalog (the complete allowed set):

- **Hover:** instant in, ~150ms ease-out out. Transition only `background-color, color, border-color, opacity, box-shadow` — never `transition-all`.
- **Press:** `active:scale-[0.98]`, 100ms — except high-frequency controls (packing +/− counters): those get **no animation** (actions done 100×/day are never animated).
- **Modal:** overlay fade 150ms; content `opacity 0→1 + scale 0.97→1` 200ms ease-out. **One entrance for every modal.**
- **Dropdown/popover:** 140–180ms, `scale 0.96→1`, `transform-origin` on the trigger side; exit faster or none.
- **Chevrons:** `rotate-180` 200ms on open state.
- **Sidebar:** width 220ms (the one sanctioned layout-property animation: single element, infrequent).
- Everything wrapped in `motion-safe:` / honoring `prefers-reduced-motion` (replace movement with fades, don't delete feedback).

Bans: bounce/elastic/overshoot easings (`cubic-bezier(.34,1.56,…)`), `ease-in`, glitch/flip/fold/random effects, page-load choreography, animating `width/height/padding/margin` (sidebar excepted), count-up on initial paint.

## 9. Component states (non-negotiable)

Every interactive component ships with **all** states: default, hover, focus-visible, active, disabled, loading (+ error for fields).

- **Focus ring (global):** `focus-visible:ring-[0.1875rem] focus-visible:ring-primary/50 focus-visible:border-primary` — visible on every button, link, input, row action. No focus ring = P0.
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none`.
- **Loading buttons:** inline spinner + label, width locked (no jitter); success may morph to a check for ~1.5s then revert.
- **Skeletons, not spinners:** structure-mimicking skeletons (same grid/row heights as the real content, shimmer left→right) for first loads. Never a lone "Carregando…" text, never a skeleton for < 300ms waits.
- **Empty states teach:** icon + short positive title + 1–2 lines (why empty, what to do) + one primary action. Never a bare "Nenhum resultado".
- **Toasts (sonner):** friendly PT-BR, bottom-center; success 2–3s; with an action button (Desfazer) 5–6s.
- **Skeleton conventions:** every skeleton is built from the `Shimmer` primitive (`src/components/ui/shimmer.tsx`) — the ONLY place that knows how placeholders are drawn (swap the implementation there to change all skeletons at once); `width`/`height` props take relative CSS lengths. Skeleton pieces live in a `skeletons/` folder inside each component context (`components/pack/skeletons/`, `components/history/skeletons/`, …), one piece per real component, extremely faithful to its layout. **The parent container of a page's skeletons is the route's Next `loading.tsx`** (with `role="status"`), which composes the pieces; client components reuse the same pieces for their `isLoading` states. Static chrome (page titles, fixed labels, forms, table headers) renders REAL next to shimmers — only async, HTTP-dependent content gets a placeholder.

## 10. Behavioral standards (perceived performance & preferences)

These apply to every current and future page:

- **Filter/period changes never blank the screen:** `placeholderData: keepPreviousData` on every list/report query; dim stale content (`opacity-60`) while refetching.
- **Optimistic writes with rollback** for CRUD mutations (tiers, categories, config): `onMutate` → cancel + snapshot + `setQueryData`; `onError` → restore snapshot; `onSettled` → invalidate.
- **Undo instead of confirm** for reversible deletes: execute immediately (or soft-delete), toast with "Desfazer" for ~5s. Confirm dialogs only for truly irreversible bulk actions.
- **Preferences persist:**
    - cookie → anything the server renders (sidebar state, future theme/density) to avoid hydration flash;
    - localStorage → per-page UI prefs (last selected period per page, collapsed sections);
    - stable query data (tier catalog) → seeded from localStorage inside the query hook (`setQueryData` + `invalidateQueries` for stale-while-revalidate) — in-house, no persistence library.
- **Intent prefetch:** hovering a row/link that leads to a heavier page prefetches its query (e.g. order row hover → prefetch packing + catalog) so navigation feels instant.
- **Numbers:** money/quantities in Geist Mono (see TYPOGRAPHY.md); animated count-up (e.g. NumberFlow) only on **changes**, 300–500ms, reduced-motion aware.
- **Domain feedback:** barcode scan flashes/pulses the matched tier card and scrolls it into view (spatial confirmation for the packing bench); negative margin turns the packing summary red immediately.
- **Keyboard:** `Esc` closes topmost layer; `Cmd+B` sidebar; `G` then `P/H/D/C` navigation sequences (Linear-style) as the app grows.

## 11. Anti-pattern bans (reject in review)

1. `px` anywhere in classes/specs (see §2).
2. Raw hex/oklch or Tailwind palette colors in components — tokens only.
3. Display font on numbers/data; money not in Geist Mono.
4. Rainbow KPI values; loss rendered in green/purple.
5. Colored/oversized drop shadows; glassmorphism; gradient text; side-stripe borders (`border-l-4` accents).
6. Bounce/elastic/glitch/random animations; `transition-all`; decorative motion.
7. Nested cards; modal as first resort (prefer inline/progressive disclosure).
8. Text characters as icons; icon-only controls without `aria-label`.
9. Delete without undo; blocking confirm for reversible actions.
10. Blank screen while loading/refetching; spinner centered in content.
11. Technical/raw error text reaching the user (PT-BR friendly copy only, via error-code dictionary).
12. New button/input variants outside `components/ui/` primitives.
13. Raw `<button>` in feature components — always the `Button` primitive (add a variant if none fits, e.g. `quiet`). Raw interactive tags belong only inside `components/ui/` primitives.
14. **New UI dependencies.** Bundle size is constrained by infra: primitives (tooltips, icons, popovers, skeletons…) are implemented in-house in `components/ui/`, reusable and flexible — never added as npm packages (Radix and lucide were removed for this reason).

## 12. Migration snapshot (2026-07-05 — update as work lands; the sections above are the timeless law)

Target phases:

1. **Foundation** — ✅ DONE (2026-07-05): `themes/orchid-theme.css` tokens (imported in `layout.tsx` via the `@themes/*` alias — Turbopack drops relative CSS `@import`s that leave `src/`, so themes are imported as JS modules), Geist Sans/Mono, unified radius/border/shadow, `focus-ring` utility on all interactive elements, conditional money colors, undo-toast on tier/category deletes, `keepPreviousData` + dim on all report queries. All snapshot P0s below are resolved.
2. **Shell** — ✅ DONE (2026-07-05): sidebar as a borderless zone (own icons from `ui/icons/`, icon-rail `3.25rem` collapse, `Cmd+B`, ChatGPT logo↔panel hover swap, own `Tooltip` on the rail) + inset content canvas (`p-2 pl-0`, `rounded-xl border shadow-xs`) + `PageHeader`/`PageContent` on every page. State: global Zustand store (`useSidebarStore`, file `src/stores/use-sidebar-store.ts` — files kebab-case, hook names camelCase per `CLAUDE.md`) — cookie is read client-side in the store initializer (per project preference for plain global stores over providers), so a first-paint flash is possible when the sidebar was left collapsed; `suppressHydrationWarning` on the `aside`. Mobile overlay sheet still pending (rail works at any width).
3. **Perception** — ✅ DONE (2026-07-06): faithful skeletons (`Shimmer` + per-context `skeletons/` folders + `loading.tsx` as parent), optimistic create/update tier + create/rename category with rollback, per-page period persisted in localStorage (`usePersistedPeriod`), order-row hover prefetch (packing + catalog), catalog warm-start from localStorage inside `useCatalog` (seed + invalidate — done in-house instead of `persistQueryClient` to avoid new dependencies).
4. **Polish** — ✅ DONE (2026-07-06): character icons (`×`/`+`/`−`) replaced by own icon components (counter buttons, tier delete → `TrashIcon`, chips, form buttons); reusable `EmptyState` (`components/ui/empty-state.tsx`) teaching empty states on orders / tier-catalog / category-list; **scan flash** — `registerScan` in the packing store carries a `{tierId, nonce}` signal, `TierCounterCard` restarts the `scan-flash` CSS animation via the DOM node (one-shot animations are driven on the ref, never via `setState` in an effect — lint bans that) + `scrollIntoView`, reduced-motion aware; `AnimatedNumber` (`components/ui/animated-number.tsx`) count-up on KPI cards (rAF, animates only on change not first mount, `prefers-reduced-motion` → snaps to final); `G` then `P/H/D/C` navigation (`useGoToNavigation`, ignores typing targets, mounted in `Sidebar`).

P0 defects found at snapshot time — all fixed in Foundation:

- ~~Loss rendered green/purple~~ → `moneyToneClass` (`src/utils/money-tone.ts`) applied in summary cards, packing hero, history table.
- ~~Tier/category delete with no confirm/undo~~ → optimistic cache removal + 5s deferred mutation + "Desfazer" toast (note: closing the tab within the 5s window cancels the delete — accepted Gmail-style trade-off).
- ~~Period switch blanks the page~~ → `placeholderData: keepPreviousData` + `opacity-60` dim while refetching.
- ~~No visible focus ring~~ → `focus-ring` utility (2-layer ring, surface offset + primary).
- ~~Status chips bypass tokens~~ → semantic `positive/warning/primary` soft chips.
- ~~Modal animation catalog~~ → single sanctioned entrance + `prefers-reduced-motion`.
