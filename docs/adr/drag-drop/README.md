# Drag & Drop

`@dnd-kit/core` with `MouseSensor` + `TouchSensor` activation constraints and a `DragOverlay` ghost. One `DndContext`, a `useDraggable` per asana card, a `useDroppable` per training step, and a single `onDragEnd` handler.

## Architecture

```
DndContext (sensors, onDragStart, onDragEnd)
    │
    ├─ library: ASANAS.map(getAsanaCard) ── excludes any asana already in a step
    │           │
    │           └─ <AsanaCard> — useDraggable({ id: asana.english_name })
    │                             opacity:0 when isDragging (source stays in layout)
    │
    ├─ STEPS.map → <TrainingStep step={step}>
    │                 │
    │                 └─ useDroppable({ id: step })
    │                     isOver → toggles .isOver CSS class
    │                     children = ASANAS filtered by trainingSteps[step]
    │
    └─ <DragOverlay> — portal ghost: <AsanaCard overlay /> follows pointer
                        renders only while activeDragId != null
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-dndkit-minimal-configuration.md](./001-dndkit-minimal-configuration.md) | Defaults-only DndContext; no collision strategy |
| 2 | [002-drag-id-strategy.md](./002-drag-id-strategy.md) | Drag id = `english_name`; droppable id = step name |
| 3 | [003-ondragend-remove-then-add.md](./003-ondragend-remove-then-add.md) | Remove-from-all-steps-then-add prevents cross-step duplication |
| 4 | [004-drop-outside-deletes.md](./004-drop-outside-deletes.md) | Drop outside a step removes the asana from the training |
| 5 | [005-no-dragoverlay-inline-transform.md](./005-no-dragoverlay-inline-transform.md) | ~~Dragged card moves in place; no ghost/portal overlay~~ — **Superseded by ADR-006** |
| 6 | [006-dragoverlay-and-touch-sensors.md](./006-dragoverlay-and-touch-sensors.md) | `DragOverlay` ghost + TouchSensor delay for mobile drag |

## Key files

- [`src/components/pages/training-page/training-page.tsx`](../../../src/components/pages/training-page/training-page.tsx)
- [`src/components/training-step/training-step.tsx`](../../../src/components/training-step/training-step.tsx)
- [`src/components/asana-card/asana-card.tsx`](../../../src/components/asana-card/asana-card.tsx)
