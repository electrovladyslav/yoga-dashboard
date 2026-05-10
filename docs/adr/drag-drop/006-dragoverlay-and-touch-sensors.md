# ADR-006: `DragOverlay` + sensor activation constraints for mobile drag

- **Status:** Accepted
- **Date:** 2026-05-09
- **Scope:** Drag & drop
- **Supersedes:** [ADR-005](./005-no-dragoverlay-inline-transform.md)

## Context

On mobile the original in-place `translate3d` approach (ADR-005) caused two problems:

1. **Touch scroll vs. drag conflict.** `@dnd-kit`'s default sensor starts a drag on any `touchstart`, stealing the event before the browser can scroll. Users couldn't scroll the step grid without accidentally lifting a card.
2. **Layout jank.** The source card moved with the finger via `transform`, leaving a collapsed gap in its original grid cell and making it hard to aim at a target step.

## Decision

Branch `002-mobile-responsive` (commit `778aa7b`) replaced the no-sensor, no-overlay strategy with:

### Sensor configuration

`MouseSensor` and `TouchSensor` are composed at [`training-page.tsx:24-27`](../../../src/components/pages/training-page/training-page.tsx#L24-L27) via `useSensors`:

- `MouseSensor` activates after the pointer moves ≥ **8 px** — filters accidental micro-movements on click.
- `TouchSensor` activates after a **250 ms press-hold** with a tolerance of **5 px** of movement — the hold gives the user time to scroll normally; if they move more than 5 px before the 250 ms window closes, the drag is cancelled in favor of scroll.

### `DragOverlay` ghost

A portal-based floating clone follows the pointer instead of the source element:

- `activeDragId` state ([`training-page.tsx:22`](../../../src/components/pages/training-page/training-page.tsx#L22)) is set in `handleDragStart` ([`training-page.tsx:42-44`](../../../src/components/pages/training-page/training-page.tsx#L42-L44)) and cleared in `handleDragEnd` ([`training-page.tsx:47`](../../../src/components/pages/training-page/training-page.tsx#L47)).
- The `DragOverlay` JSX at [`training-page.tsx:143-147`](../../../src/components/pages/training-page/training-page.tsx#L143-L147) renders `<AsanaCard overlay />` only while `activeDragId` is non-null.

### `AsanaCard` dual-mode

`AsanaCard` gained an `overlay?: boolean` prop ([`asana-card.tsx:6`](../../../src/components/asana-card/asana-card.tsx#L6)):

- When `overlay=true`: `useDraggable` is disabled ([`asana-card.tsx:11`](../../../src/components/asana-card/asana-card.tsx#L11)), no `ref`/`listeners`/`attributes` are bound ([`asana-card.tsx:19-22`](../../../src/components/asana-card/asana-card.tsx#L19-L22)), so the ghost card is purely decorative.
- When dragging (`isDragging && !overlay`): the source card's opacity is set to 0 ([`asana-card.tsx:14`](../../../src/components/asana-card/asana-card.tsx#L14)), creating a "lifted" ghost effect while keeping the source slot visible in the layout.

### CSS touch fixes

`asana-card.module.css` adds `touch-action: none` ([`:15`](../../../src/components/asana-card/asana-card.module.css#L15)) and `user-select: none` ([`:16`](../../../src/components/asana-card/asana-card.module.css#L16)) to `.card`. Without `touch-action: none` the browser intercepts `touchmove` for panning before `@dnd-kit` can acquire the gesture.

### Execution flow

```
touchstart on card
    │
    ▼ TouchSensor waits 250 ms
    │
    if moved > 5 px before 250 ms  → scroll wins, no drag
    │
    if held for 250 ms             → drag starts
        │
        handleDragStart({ active }) → setActiveDragId(active.id)
        │
        DragOverlay renders <AsanaCard overlay /> at pointer position
        source card: opacity → 0
        │
        user moves finger to target step
        │
        handleDragEnd(event) → setActiveDragId(null)
            │ overTrainingStep present  → remove-then-add (see ADR-003)
            │ no over target            → delete from training (see ADR-004)
        source card: opacity → 1, DragOverlay unmounts
```

## Edge cases & nuances

- **`overlay` prop passed via spread from `ASANAS.find()`** at [`training-page.tsx:145`](../../../src/components/pages/training-page/training-page.tsx#L145): if `activeDragId` matches no asana (impossible in practice since ids are `english_name` values from the same constant), the non-null assertion `!` would throw. Safe as long as `ASANAS` is the single source of truth for ids.
- **Source card opacity 0 vs. display:none.** Keeping the element in the DOM preserves the grid slot — nothing collapses. `display:none` would reflow the grid mid-drag, which was one of the jank issues we solved.
- **250 ms delay is a UX trade-off.** Users must consciously press-hold to drag, which is intentional but can feel slow on responsive-feeling apps. There is no visual affordance (ripple, scale, haptic) during the 250 ms window to signal "drag mode starting."
- **`MouseSensor` distance constraint also applies on desktop.** Sub-8-px pointer movements no longer trigger a drag, which fixes accidental drags on click but means very small card movements require re-intent.
- **`DragOverlay` renders outside the `DndContext`'s own subtree** into a portal, so `z-index` stacking is determined by the body stacking context. The fixed-position AI notification (z-index 1000) could visually overlap the overlay ghost on small screens if both appear simultaneously.
- **No collision strategy configured** — `@dnd-kit` defaults to pointer-center vs. droppable-rect detection ([ADR-001](./001-dndkit-minimal-configuration.md)). This is unchanged.

## Configuration

- `TouchSensor` delay: `250` ms, tolerance: `5` px — hardcoded at [`training-page.tsx:26`](../../../src/components/pages/training-page/training-page.tsx#L26)
- `MouseSensor` distance: `8` px — hardcoded at [`training-page.tsx:25`](../../../src/components/pages/training-page/training-page.tsx#L25)
- Source card opacity while dragging: `0` — hardcoded at [`asana-card.tsx:14`](../../../src/components/asana-card/asana-card.tsx#L14)

## Consequences

**Positive:**
- Scroll and drag are clearly separated on touch screens — no accidental card lifts.
- `DragOverlay` ghost stays above all grid content; no z-index collisions within the step grid.
- Source slot remains in the grid (opacity 0), so the layout doesn't shift mid-drag.

**Negative / risks:**
- 250 ms hold delay is invisible — no press-feedback during the window.
- Two sensor instances increase the event listener count, though negligibly.
- `DragOverlay` z-index can conflict with the `position:fixed` AI notification if both render simultaneously.

**Neutral:**
- The `translate3d`-based transform code in `AsanaCard` was removed; the `isDragging` flag now only drives opacity. The `transform` return from `useDraggable` is ignored when `overlay` mode is active.

## Related

- [ADR-005](./005-no-dragoverlay-inline-transform.md) (superseded — original in-place strategy)
- [ADR-001](./001-dndkit-minimal-configuration.md) (DndContext minimal config)
- [ADR-003](./003-ondragend-remove-then-add.md) (remove-then-add on drop)
- [ADR-004](./004-drop-outside-deletes.md) (drop-outside deletes)
- [styling/003-responsive-breakpoints.md](../styling/003-responsive-breakpoints.md) (responsive grid context)
