# ADR-003: Reference asanas by `english_name` string, not numeric id

- **Status:** Accepted (load-bearing risk)
- **Date:** 2026-04-22
- **Scope:** Data model

## Context

An asana has both a numeric `id` and a string `english_name`. Something had to be the identity key in drag/drop events and in persisted trainings.

## Decision

Use `asana.english_name` (a human-readable display string) as the canonical identifier everywhere it matters:

- Drag id: `useDraggable({ id: \`${asana.english_name}\` })` at [`asana-card.tsx:7-9`](../../../src/components/asana-card/asana-card.tsx#L7-L9)
- `onDragEnd` stores the drag id into `TrainingSteps`: [`training-page.tsx:49`](../../../src/components/pages/training-page/training-page.tsx#L49)
- Render from stored names back to cards: `ASANAS.filter((asana) => currentParentChildrenName.includes(asana.english_name))` at [`training-page.tsx:66`](../../../src/components/pages/training-page/training-page.tsx#L66)
- Library de-duplication: `Object.values(trainingSteps).some(names => names.includes(asana.english_name))` at [`training-page.tsx:74`](../../../src/components/pages/training-page/training-page.tsx#L74)
- AI service selects by english name too: [`ai-yoga.service.ts:76-97`](../../../src/services/ai-yoga.service.ts#L76-L97)

The numeric `id` is only used as a React `key` prop.

## Edge cases & nuances

- **Renaming any asana breaks every saved training that referenced it.** If `"Mountain Pose"` becomes `"Mountain"` in the catalog, all localStorage trainings with `"Mountain Pose"` entries will still *load* — they just won't *render* an asana card, because the filter at [`training-page.tsx:66`](../../../src/components/pages/training-page/training-page.tsx#L66) returns nothing. The step looks empty and shows the "Drag asanas here" placeholder. No warning.
- **Deleting an asana has the same silent effect.**
- **Apostrophes and special characters survive the round trip** because JSON handles them. `"Child's Pose"` works; see it literally in the AI service pool at [`ai-yoga.service.ts:79`](../../../src/services/ai-yoga.service.ts#L79).
- **Uniqueness assumption**: two asanas with the same `english_name` would be indistinguishable at runtime and would both appear or both disappear in lockstep.

## Configuration

None — this is a code-level convention.

## Consequences

**Positive:**
- No id-to-name lookup table; rendering is a straight filter.
- URLs, debugging, and localStorage inspection are human-readable.
- Drag id is self-documenting when logged.

**Negative / risks:**
- Data integrity depends on string stability of display labels — a display change IS a breaking data migration.
- No tooling catches a rename: TypeScript doesn't know `"Mountain Pose"` was meant to match `ASANAS[0].english_name`.
- Cross-language support (i18n) is impossible without breaking stored data.

## Migration path (if ever needed)

Introduce a stable `slug` field on `Asana`, migrate `TrainingSteps` in one pass keyed off the current english name, then switch drag ids and filter keys to the slug. Must happen atomically because rollback is ambiguous.

## Related

- ADR-002 (asana schema)
- [persistence/003-no-versioning-or-error-recovery.md](../persistence/003-no-versioning-or-error-recovery.md)
