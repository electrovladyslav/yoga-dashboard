# ADR-003: Responsive via `@media` queries; grid collapses 6 → 3 → 2 columns

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Styling

## Context

The training editor is a 6-column grid (one per step) on desktop. At phone widths each column shrinks to ~40px — unusable. Branch `002-mobile-responsive` addressed this.

## Decision

Three breakpoints, all max-width, all in CSS modules. No Tailwind `sm:/md:/lg:` classes, no JS-driven breakpoints.

### In [`training-page.module.css`](../../../src/components/pages/training-page/training-page.module.css)

- Desktop base: `.container` uses `grid-template-columns: repeat(6, 1fr)`.
- `@media (max-width: 1024px)` → 3 columns.
- `@media (max-width: 640px)`:
  - 2 columns
  - `.main` padding 32 → 16 px
  - `.header` allows flex-wrap; title takes full width
  - `.asanasContainer` min card width 120 → 96 px, gap 12 → 8 px
  - `.aiNotification` collapses to full-width top bar

### In [`training-step.module.css`](../../../src/components/training-step/training-step.module.css)

- Desktop: step min-height 260 px.
- `@media (max-width: 640px)`: step min-height 180 px; padding 12 → 8 px.

### In [`asana-card.module.css`](../../../src/components/asana-card/asana-card.module.css)

- Desktop: card min-height 140 px; icon circle 64×64 px.
- `@media (max-width: 640px)`: card min-height 120 px; icon 52×52; title 0.78em.

### In [`chat.module.css`](../../../src/components/chat/chat.module.css)

- Desktop: chat window 350 × 500 px fixed bottom-right.
- `@media (max-width: 480px)`: `calc(100vw - 40px) × calc(100vh - 120px)` — near full-screen.

## Edge cases & nuances

- **Breakpoints are inconsistent across modules** — chat uses 480px, everything else uses 640px / 1024px. Fine since chat owns its own viewport, but worth knowing.
- **Grid collapse (6 → 2) strands layouts of 3 or 4 cards per step in odd positions** on medium-small phones. Acceptable for six labeled sections.
- **Mobile drag is separated from scroll via `TouchSensor` (250 ms delay).** See [drag-drop/006](../drag-drop/006-dragoverlay-and-touch-sensors.md). The old conflict where a touch-down immediately started a drag (noted at time of writing) was resolved.
- **No container queries** — everything is viewport-based. The library area at the bottom doesn't adapt independently of the page.
- **No `prefers-reduced-motion` handling** — the card-drag `translate3d` and notification slide-in animate regardless.

## Configuration

Breakpoints hardcoded in module CSS files.

## Consequences

**Positive:**
- Readable, component-local responsive rules.
- No runtime measurement / resize-observer overhead.

**Negative / risks:**
- Breakpoints not centralized — changing "the phone threshold" is a multi-file edit.
- Touch drag conflicts with page scroll on long pages.
- No reduced-motion opt-out for vestibular-sensitive users.

## Related

- [drag-drop/001-dndkit-minimal-configuration.md](../drag-drop/001-dndkit-minimal-configuration.md)
- [drag-drop/005-no-dragoverlay-inline-transform.md](../drag-drop/005-no-dragoverlay-inline-transform.md)
