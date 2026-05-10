# ADR-001: "Calm-wellness" palette via CSS variables in `:root`

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Styling

## Context

The app is a yoga tool; the visual tone should feel grounded and soft. A prior palette was cooler/whiter; commit `aea915f` redesigned it.

## Decision

Define tokens as custom properties on `:root` in [`src/app/globals.css:5-47`](../../../src/app/globals.css#L5-L47). Components consume them via `var(--name)`.

### Palette

- `--color-bg: #F7F5F0` (warm off-white)
- `--color-surface: #FFFFFF`
- `--color-surface-2: #EFEBE2` (beige)
- `--color-primary: #6B8E7F` (sage green — buttons, FAB, accents)
- `--color-primary-hover: #5A7D6E`
- `--color-primary-soft: #E6EDE9` (isOver highlight)
- `--color-accent: #D4A574` (terracotta — apply button, focus ring)
- `--color-accent-hover: #C5985F`
- `--color-text: #2D3A36`
- `--color-text-muted: #6B7670`
- `--color-border: #E5E2DB`
- `--color-border-strong: #D6D1C4`

### Spacing, radius, shadow, typography

- `--space-1..6`: 4, 8, 12, 16, 24, 32 px ([`globals.css:24-29`](../../../src/app/globals.css#L24-L29))
- `--radius-sm..xl`: 8, 12, 16, 20 px ([`globals.css:19-22`](../../../src/app/globals.css#L19-L22))
- `--shadow-sm/md/lg`: three low-opacity shadows ([`globals.css:31-33`](../../../src/app/globals.css#L31-L33))
- `--font-heading: 'Inter', system-ui, ...` at [`globals.css:35`](../../../src/app/globals.css#L35)

### Element base

- `h1`: 1.6em / 600 ([`globals.css:67-73`](../../../src/app/globals.css#L67-L73))
- `h2`: 0.875em / uppercase / 0.06em letter-spacing — used as SECTION LABELS throughout ([`globals.css:75-83`](../../../src/app/globals.css#L75-L83))
- `button`: sage bg, white text, focus ring in `--color-accent` ([`globals.css:85-107`](../../../src/app/globals.css#L85-L107))

## Edge cases & nuances

- **No dark mode** — `:root` has no `prefers-color-scheme` fallback.
- **`h2` is globally uppercase** with letter-spacing. Any `<h2>` anywhere inherits this. `TrainingStep` uses `<h2>` for the step label ([`training-step.tsx:23`](../../../src/components/training-step/training-step.tsx#L23)), and `AsanaCard` uses `<h2>` for the pose title ([`asana-card.tsx:25`](../../../src/components/asana-card/asana-card.tsx#L25)) — pose names appear UPPERCASE on cards unless the CSS module overrides.
- **`--font-heading` defines the body font stack too** — the name is misleading (the variable sets `font-family` globally at [`globals.css:37`](../../../src/app/globals.css#L37)).
- **Geist fonts are loaded** by `next/font/local` ([`src/app/layout.tsx:5-14`](../../../src/app/layout.tsx#L5-L14)) but are NOT referenced in globals.css. The body gets `geistSans.variable` in its className, but no CSS rule consumes `var(--font-geist-sans)`. See [app-shell/003](../app-shell/003-path-alias-and-config.md).
- **Focus outline is `--color-accent` (terracotta)** not `--color-primary`. Intentional contrast for keyboard users against sage elements.

## Configuration

All tokens in [`src/app/globals.css:5-47`](../../../src/app/globals.css#L5-L47).

## Consequences

**Positive:**
- Single-file palette change propagates everywhere.
- No JS runtime cost; native browser theming.

**Negative / risks:**
- No dark mode path.
- Geist fonts are dead weight.
- Global `h2` uppercase rule makes it hard to use `h2` semantically without override CSS.

## Related

- ADR-002 (css modules)
- [app-shell/003-path-alias-and-config.md](../app-shell/003-path-alias-and-config.md)
