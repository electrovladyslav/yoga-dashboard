# ADR-003: `onDragEnd` removes the asana from *every* step before adding

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Drag & drop

## Context

An asana can live in at most one step at a time. Without explicit removal, dragging a card from step A to step B would leave a copy in A.

## Decision

`handleDragEnd` ([`training-page.tsx:36-61`](../../../src/components/pages/training-page/training-page.tsx#L36-L61)) rebuilds `trainingSteps` immutably:

1. Copy the current state (`{...prevTrainingSteps}`).
2. For EVERY step key, filter out the dragged asana's id — [`training-page.tsx:44-46`](../../../src/components/pages/training-page/training-page.tsx#L44-L46).
3. If there IS a drop target, append the id to `newTrainingSteps[overTrainingStep.id]` — [`training-page.tsx:49`](../../../src/components/pages/training-page/training-page.tsx#L49).

The filter-all pass runs even when the asana was in the library pool (not in any step). In that case it's a no-op; the add on the next line is the only effect.

## Execution flow

```
event = { active: {id: 'Tree Pose'}, over: {id: 'workout'} }
        │
        ▼
prev = { 'warm-up': ['Tree Pose'], 'workout': ['Warrior I'] }
        │
        ▼ remove 'Tree Pose' from every step
        { 'warm-up': [], 'workout': ['Warrior I'] }
        │
        ▼ append to over.id
        { 'warm-up': [], 'workout': ['Warrior I', 'Tree Pose'] }
```

## Edge cases & nuances

- **Dragging within the same step** (onto the same column) still runs the remove-then-add — the asana ends at the end of that step's array. If a second card was after it, order changes.
- **Ordering is preserved only by array order.** No explicit sort. Re-ordering within a step is NOT supported — the drop target is the *step*, not a position.
- **Appending uses `(...(newTrainingSteps[overTrainingStep.id] || []), draggingAsanaCard.id)`** at [`training-page.tsx:49`](../../../src/components/pages/training-page/training-page.tsx#L49) — the `|| []` handles the first-ever drop into a step (no array yet). All subsequent drops find the array.
- **The else branch doesn't use the functional setter** (see [004](./004-drop-outside-deletes.md)); that branch reads `trainingSteps` from closure. Usually safe because `onDragEnd` runs synchronously after the user releases, but it is an inconsistency worth noting.
- **No `onDragOver`** to update UI mid-drag — `isOver` on the hover target is driven by the library itself via `useDroppable`.

## Configuration

None.

## Consequences

**Positive:**
- The invariant "each asana is in ≤1 step" is enforced by the drag handler, not by a separate reconciliation step.
- Immutable update pattern makes React happy and is easy to trace.

**Negative / risks:**
- O(steps) work per drop, which is fine at 6 steps but would be quadratic with the number of cards if iterated naively elsewhere.
- Ordering within a step is an emergent property, not a modeled one. If a future "reorder within step" feature is added, the model and handler both need changes.

## Related

- ADR-002, ADR-004
- [data-model/001-training-and-trainingsteps.md](../data-model/001-training-and-trainingsteps.md)
