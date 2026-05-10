# ADR-001: `Training` and `TrainingSteps` shape

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Data model

## Context

We need a persistable shape for a day's yoga session. Constraints: no backend, stored as JSON in `localStorage`, edited via drag-and-drop.

## Decision

Two interfaces in [`src/models/training.model.ts`](../../../src/models/training.model.ts):

- `TrainingSteps` ([`training.model.ts:3-6`](../../../src/models/training.model.ts#L3-L6)) — an index signature `[key: string]: UniqueIdentifier[]`. Keys are step names from `STEPS` (see [004-steps-constant-ordering.md](./004-steps-constant-ordering.md)). Values are arrays of `UniqueIdentifier` (`@dnd-kit/core`'s `string | number`) — in practice always asana english-name strings.
- `Training` ([`training.model.ts:8-11`](../../../src/models/training.model.ts#L8-L11)) — two fields: `date: string` (ISO `YYYY-MM-DD`) and `steps: TrainingSteps`.

No IDs, no user field, no timestamps, no versioning.

### Why `UniqueIdentifier`?

It's the type `@dnd-kit/core` uses for drag/drop ids. Storing the same type on disk means no conversion between the drag layer and the persisted layer — `draggingAsanaCard.id` can be pushed directly into a step array ([`training-page.tsx:49`](../../../src/components/pages/training-page/training-page.tsx#L49)).

## Edge cases & nuances

- `TrainingSteps` is an index signature, not a fixed-shape object. Any string key is accepted — including misspellings. If a saved training has a step key `"warmup"` (no hyphen), it is loaded into state but never rendered, because [`training-page.tsx:108`](../../../src/components/pages/training-page/training-page.tsx#L108) only iterates `STEPS`.
- An empty step is stored as `[]`, not omitted. After a drag-out-of-all-steps the `Object.keys` loop ([`training-page.tsx:56-58`](../../../src/components/pages/training-page/training-page.tsx#L56-L58)) leaves each step key with an empty array.
- `Training.date` has no timezone — it's whatever `formatDate` produced from the user's `Date` at save time (UTC day via `toISOString`).
- The commented-out line at [`training.model.ts:4`](../../../src/models/training.model.ts#L4) (`// Steps: AsanaName[]`) hints at an earlier design with named step keys. The current open index signature was chosen instead.

## Configuration

- Date format: `YYYY-MM-DD` (from `formatDate`)
- Value type: `UniqueIdentifier` = `string | number` from `@dnd-kit/core`

## Consequences

**Positive:**
- Extremely small surface — trivial to serialize / compare / reason about.
- Drag-layer and storage-layer share the same id type; no mapping code.

**Negative / risks:**
- No way to attach per-asana metadata later (order within a step, hold duration, notes) without a breaking schema change.
- No schema version ⇒ migration is impossible without ambiguity (see [persistence/003](../persistence/003-no-versioning-or-error-recovery.md)).
- The `UniqueIdentifier` union (`string | number`) leaks into storage; if someone ever uses a numeric id instead of a name, both get written to JSON.

## Related

- ADR-003 (asana reference by english_name)
- ADR-004 (steps constant)
- [persistence/001-localstorage-as-database.md](../persistence/001-localstorage-as-database.md)
