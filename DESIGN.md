# Design context

The full design system lives in **`docs/DESIGN.md`** (tokens, shell, motion, behavioral standards, anti-pattern bans) and **`docs/TYPOGRAPHY.md`** (Geist Sans/Mono type system). Read both before any UI work.

Non-negotiables in one breath: disciplined-lilac OKLCH tokens in `themes/orchid-theme.css` (never raw colors), never `px` (tokens → Tailwind utilities → `rem`), Geist Mono for every number, conditional money colors (loss is red, always), 1px `--border` + `shadow-xs` cards, icon-rail sidebar (`16rem` ⇄ `3.25rem`, cookie-persisted), motion 120–240ms ease-out only, every component with full states (focus ring included), skeletons + `keepPreviousData` + optimistic writes + undo-toasts.
