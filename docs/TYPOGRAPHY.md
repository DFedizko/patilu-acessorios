# Patilu Kits — Typography

Canonical type system. Any component that renders text follows this document; any typography change lands here first. Sizes always in Tailwind utilities or `rem` — **never `px`** (see `docs/DESIGN.md` §2).

## 1. Families

Two families, one job each ("intercalated" system):

| Token         | Font           | Job                                                                                          |
| ------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `--font-sans` | **Geist Sans** | Everything textual: titles, labels, body, buttons, nav, table text                           |
| `--font-mono` | **Geist Mono** | Everything data: money values, percentages, quantities, barcodes, dates/times in tables, IDs |

- Loaded via `next/font/google` in `layout.tsx` (`Geist`, `Geist_Mono`), exposed as CSS variables and mapped in the Tailwind theme (`--font-sans`, `--font-mono`).
- **Baloo 2 and Inter are removed.** The `--font-head` token dies; headings are Geist Sans semibold. The brand "P" mark uses Geist Sans bold.
- Never a third family. Never a display font on data.

## 2. Scale

Only canonical Tailwind steps — no arbitrary font sizes (`text-[0.8125rem]` is banned; the old 13px sizes collapse into `text-sm`/`text-xs`):

| Role                               | Utility     | Weight                                 | Family                                 | Notes                                                  |
| ---------------------------------- | ----------- | -------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| Page title (header row)            | `text-xl`   | `font-semibold tracking-tight`         | Sans                                   | one per page, lives in the page header                 |
| Section title                      | `text-base` | `font-semibold`                        | Sans                                   | e.g. category names in packing                         |
| Card/panel title                   | `text-sm`   | `font-semibold`                        | Sans                                   |                                                        |
| Body / table cell                  | `text-sm`   | `font-normal` (emphasis `font-medium`) | Sans                                   | 14px-equivalent is the dashboard norm                  |
| Caption / helper / dates in tables | `text-xs`   | `font-normal`                          | Sans (Mono when it's a date/time/code) | `text-ink-muted`                                       |
| Table header                       | `text-xs`   | `font-medium`                          | Sans                                   | sentence case, `text-ink-muted`; no uppercase tracking |
| Field label                        | `text-xs`   | `font-medium`                          | Sans                                   | `text-ink-muted`                                       |
| KPI value                          | `text-2xl`  | `font-semibold`                        | **Mono**                               | color `ink`; delta colored, not the value              |
| KPI label                          | `text-sm`   | `font-normal`                          | Sans                                   | sentence case, `text-ink-muted`                        |
| Hero number (packing margin bar)   | `text-5xl`  | `font-semibold tracking-tight`         | **Mono**                               | conditional color: `positive`/`negative`               |
| Button                             | `text-sm`   | `font-medium`                          | Sans                                   |                                                        |

Hierarchy comes from **weight + one or two size steps**, never from color variety or a third font.

## 3. Number rules

- **Every money value, percentage, count, barcode, and timestamp in a data context renders in Geist Mono.** Mono digits are fixed-width by construction — columns align, updating values never shift layout.
- Where a number appears inside Sans text (e.g. a sentence in a toast), keep Sans but add `tabular-nums`.
- Right-align numeric table columns.
- Explicit sign on deltas (`+12,4%` / `-3,1%`) + arrow + semantic color — never color alone.
- Currency formatting: `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`; values stored in integer cents (existing convention).

## 4. Micro-rules

- Line length for prose ≤ 75ch (rare in this app; tables may run wider).
- `tracking-tight` only on `text-xl`+ headings and hero numbers; default tracking elsewhere; no letter-spacing on body.
- No uppercase transforms except tiny status badges (chips) — and even there prefer sentence case.
- Truncation: `truncate` + `title` attribute for customer names in tight columns; never wrap a money value.
- Minimum text size: `text-xs`. Nothing smaller, ever.
