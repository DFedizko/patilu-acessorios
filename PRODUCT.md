# PRODUCT.md — Patilu Kits

## Register

register: product

## Product Purpose

Internal operations tool for **Patilu Acessórios**, a Brazilian stationery store that sells custom kits on TikTok live streams. During a live, a customer assembles a kit (e.g. 3 pens + 1 notebook); the assortment changes weekly. The tool tracks item **cost tiers** (not SKUs), so at packing time the operator counts items per tier, enters the sale price, and sees the margin instantly. Modules: Pedidos (orders to pack), Empacotar (packing flow with barcode scanner), Histórico (orders with CPA/fixed cost/net margin), Dashboard (period report + margin chart), Categorias (tier catalog + barcode labels), Configurações (fixed cost, profile).

## Users

- **The owner (primary)**: runs the TikTok lives, packs orders at a bench with a USB barcode scanner, checks margins daily. Not a tech person; fluent in WhatsApp/Instagram/TikTok-level UI. Uses desktop for dashboard/history and the packing screen while physically handling products.
- **Helper/operator (occasional)**: packs orders following the same flow.
- Language: **Portuguese (pt-BR)**. All UI copy friendly, never technical.

## Environment & Mood

Used at a home-office desk and packing bench, daytime, normal ambient light, often in a hurry between/after lives. The packing flow must be fast, forgiving, one-hand operable (scanner in the other). Dashboard/history moments are calmer "how's the business doing" check-ins.

## Brand & Tone

Patilu is playful, feminine, colorful stationery (purple/pink identity). The tool should feel light and friendly, but it is a **money tool**: margins, costs, ads. Numbers must read with total clarity and trust. Playful accents, serious data.

## Anti-references

- Generic AI-dashboard look (gradient hero metrics, identical card grids, rainbow KPI colors).
- Heavy corporate ERP density (SAP-like walls of fields).
- Anything that hides the margin math or makes the operator think during packing.

## Strategic Principles

1. Packing speed beats visual flourish: fewer clicks, big touch/scan targets, instant feedback.
2. One accent color carries the brand; money semantics (profit green / loss red) are reserved and never decorative.
3. Desktop-first, but packing screen must work on a tablet.
4. Every state visible: loading (skeletons), empty (teach the flow), error (friendly PT toast).
