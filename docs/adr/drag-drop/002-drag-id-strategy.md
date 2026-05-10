# ADR-002: Drag id = asana `english_name`; droppable id = step name

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Drag & drop

## Context

`@dnd-kit/core` needs a `UniqueIdentifier` on every draggable and droppable. We had two choices for asanas (`id` number or `english_name` string) and one natural choice for step columns (the `STEPS` entry).

## Decision

- **Draggable:** `useDraggable({ id: \`${asana.english_name}\` })` at [`asana-card.tsx:7-9`](../../../src/components/asana-card/asana-card.tsx#L7-L9). Template-literal wrap is cosmetic; the input is already a string.
- **Droppable:** `useDroppable({ id: \`${step}\` })` at [`training-step.tsx:11-13`](../../../src/components/training-step/training-step.tsx#L11-L13). Same cosmetic wrap.
- **Matching:** in `onDragEnd`, `active.id` (english name) and `over.id` (step name) are used directly — see [`training-page.tsx:36-61`](../../../src/components/pages/training-page/training-page.tsx#L36-L61).

This choice cascades: the drag id becomes the persisted identifier in `TrainingSteps` — see [data-model/003](../data-model/003-asana-reference-by-english-name.md).

## Edge cases & nuances

- Both `id`s pass through the `UniqueIdentifier` type (`string | number`). Nothing stops a future contributor from writing `id: asana.id` — which would render fine but would store numeric ids in `TrainingSteps`, breaking the rendering filter at [`training-page.tsx:66`](../../../src/components/pages/training-page/training-page.tsx#L66) that compares against `asana.english_name`.
- Step droppable ids are plain strings like `'set-up'`, `'warm-up'`. Any whitespace or casing drift between `STEPS` and `stepCategories` in the AI service would produce silent misses.

## Configuration

- Drag id source: `Asana.english_name`
- Drop id source: `STEPS` string entries

## Consequences

**Positive:**
- Drag events are self-describing when logged.
- One source of truth for asana identity (english name).

**Negative / risks:**
- Tight coupling between display-layer strings and storage-layer keys.
- The template-literal wrapping (`\`${asana.english_name}\``) hides that the input is already a string — if the source type ever changes to number, the coerce happens silently.

## Related

- ADR-001
- [data-model/003-asana-reference-by-english-name.md](../data-model/003-asana-reference-by-english-name.md)
- [data-model/004-steps-constant-ordering.md](../data-model/004-steps-constant-ordering.md)
