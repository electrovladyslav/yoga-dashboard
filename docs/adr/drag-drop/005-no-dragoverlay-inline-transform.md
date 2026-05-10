# ADR-005: No `DragOverlay` — dragged card moves in place via inline `translate3d`

- **Status:** Superseded by [ADR-006](./006-dragoverlay-and-touch-sensors.md)
- **Date:** 2026-04-22
- **Scope:** Drag & drop

## Context

`@dnd-kit` supports two visual strategies: a portal-based `DragOverlay` (a ghost clone that follows the pointer) or moving the original element via the `transform` returned by `useDraggable`.

## Decision

Move the original element in place.

- At [`asana-card.tsx:11-13`](../../../src/components/asana-card/asana-card.tsx#L11-L13): `style = transform ? { transform: \`translate3d(${transform.x}px, ${transform.y}px, 0)\` } : undefined`.
- At [`asana-card.tsx:16`](../../../src/components/asana-card/asana-card.tsx#L16): `style={style}` applied to the `<article>`.
- No `DragOverlay` import anywhere in the project.

`translate3d` is used (not `translate`) to coerce GPU compositing for smoother animation.

## Edge cases & nuances

- **Card leaves its grid position** and flies under the pointer, which means the grid visually collapses around the empty slot mid-drag. This is a standard in-place pattern; fine for small libraries, noisier for long lists.
- **z-index is NOT set** on the dragged card. If a drag crosses over another element with a higher stacking context, it can slide behind it. In this app, nothing else sits on top of the cards, so it's invisible.
- **No drop-target preview of the dragged item.** `TrainingStep` only toggles its own border via `isOver` ([`training-step.tsx:11`](../../../src/components/training-step/training-step.tsx#L11), CSS `.isOver`). There is no placeholder slot or insertion indicator inside the step.
- **Touch behavior on mobile:** drag starts on first touch because no activation constraint is configured (see [001](./001-dndkit-minimal-configuration.md)), which can conflict with page scrolling. Users may need two tries on a touch screen.

## Configuration

- Transform: `translate3d(x, y, 0)` — hardcoded in component
- No overlay

## Consequences

**Positive:**
- Simpler component tree; no portal, no state-sharing between original and overlay.
- Works well for short, non-overlapping grids.

**Negative / risks:**
- No ghost polish (shadow, rotate, scale) that an overlay would allow.
- Grid reflow on drag can be visually distracting in dense layouts.
- No mobile-specific tuning (touch activation, delay) to separate drag intent from scroll intent.

## Related

- ADR-001 (minimal config)
- [styling/003-responsive-breakpoints.md](../styling/003-responsive-breakpoints.md)
