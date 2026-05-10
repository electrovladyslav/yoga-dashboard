# ADR-004: Dropping outside any step deletes the asana from the training

- **Status:** Accepted (surprising default)
- **Date:** 2026-04-22
- **Scope:** Drag & drop

## Context

When the user drags a card and releases it over empty space (not over a step), `@dnd-kit` reports `over = null`. The handler must decide what to do.

## Decision

Treat "dropped on nothing" as a delete-from-training. The asana is removed from every step; if it wasn't in any step, nothing happens.

- Branch at [`training-page.tsx:53-60`](../../../src/components/pages/training-page/training-page.tsx#L53-L60): same `Object.keys(...).forEach(filter)` as the success branch, then `setTrainingSteps(newTrainingSteps)`.
- No confirmation, no undo, no toast.

## Edge cases & nuances

- **Card snaps back + disappears.** Visually, the inline transform ends (see [005](./005-no-dragoverlay-inline-transform.md)), and because the asana is removed from `trainingSteps`, the filter at [`training-page.tsx:66`](../../../src/components/pages/training-page/training-page.tsx#L66) stops rendering it inside the step — and `getAsanaCard` ([`training-page.tsx:73-76`](../../../src/components/pages/training-page/training-page.tsx#L73-L76)) re-adds it back into the library since `isAsanaInStep` is now false. Net effect: returned to library.
- **If the user drags a library card and drops on nothing**, the remove loop is a no-op and the library card stays put. Feels natural, but it's coincidental — the branch is the same code path.
- **This branch reads `trainingSteps` from closure** instead of using the functional setter (`setTrainingSteps(prev => ...)`). See [003](./003-ondragend-remove-then-add.md). In theory can lag state by one update; in practice safe because drops are one-at-a-time.
- **Drop target detection depends on `DndContext`'s default collision**. Narrow misses near a step's edge may register as `over` anyway, flipping this from "delete" to "place". Users don't always notice the difference on small screens.

## Configuration

None.

## Consequences

**Positive:**
- "Drag to trash" is a well-known gesture; this mirrors it without needing a trash zone UI.
- Step and library stay in sync without a separate delete affordance.

**Negative / risks:**
- No confirmation: a misaimed drop destroys the placement.
- No undo mechanism anywhere in the app.
- Discoverability is low; users have to guess this works.

## Related

- ADR-001, ADR-003, ADR-005
