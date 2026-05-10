# ADR-001: Use `@dnd-kit/core` at defaults — no sensors, no collision, no overlay

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Drag & drop

## Context

The editor needs drag-and-drop of asana cards into step columns. `@dnd-kit/core` (^6.1.0, package.json line 11) is the single dependency for this. It supports extensive customization (sensors, collision, overlays), but most of that isn't needed here.

## Decision

Use `DndContext` with the default sensors and default collision detection. Handle only `onDragEnd`.

- Declaration: [`training-page.tsx:98`](../../../src/components/pages/training-page/training-page.tsx#L98) — `<DndContext onDragEnd={handleDragEnd}>`.
- No explicit `sensors`, `collisionDetection`, `onDragStart`, `onDragOver`, or `onDragCancel`.
- No `<DragOverlay>` anywhere in the codebase.
- Hooks used:
  - `useDraggable` in [`asana-card.tsx:7-9`](../../../src/components/asana-card/asana-card.tsx#L7-L9)
  - `useDroppable` in [`training-step.tsx:11-13`](../../../src/components/training-step/training-step.tsx#L11-L13)

### What you get by default

- Pointer sensor (mouse/touch) and keyboard sensor (arrow keys + space/enter).
- Collision strategy: `rectIntersection` is the library default when nothing is passed.
- Accessibility: `{...attributes}` spread onto the draggable article at [`asana-card.tsx:16`](../../../src/components/asana-card/asana-card.tsx#L16) carries `role="button"`, `aria-describedby`, `aria-roledescription="draggable"` — but none are customized.

## Edge cases & nuances

- **No activation constraint** means a single click on a card starts a drag. That is also why there is no "click to view details" UI — any mousedown becomes drag intent.
- **Keyboard support is implicit**: a user who Tab-focuses a card can drag with the spacebar then arrow keys. Nothing in the UI hints at this; there is no live region announcing state.
- **No `onDragCancel` or `onDragStart`** means no visual feedback (dragging state) in the library itself — only the CSS `:active` and the inline transform show that something is happening. See [005](./005-no-dragoverlay-inline-transform.md).

## Configuration

- `@dnd-kit/core` version `^6.1.0`
- All library options at default values

## Consequences

**Positive:**
- Minimal code; very easy to read.
- Accessibility "free tier" via attribute spread.

**Negative / risks:**
- No customization hook if future features need drag-start feedback, delay activation (to avoid accidental drags on touch), or auto-scroll on long columns.
- `rectIntersection` can pick awkward drop targets when step columns are narrow on mobile — may produce misfires at small breakpoints; would need `pointerWithin` or `closestCenter` to tune.

## Related

- ADR-003 (onDragEnd logic)
- ADR-005 (no DragOverlay)
- [styling/003-responsive-breakpoints.md](../styling/003-responsive-breakpoints.md)
