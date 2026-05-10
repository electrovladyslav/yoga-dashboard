# ADR-003: No schema versioning; `JSON.parse` is un-guarded

- **Status:** Accepted (known risk)
- **Date:** 2026-04-22
- **Scope:** Persistence

## Context

The storage shape is likely to evolve (per-asana metadata, upserts, multi-device). We also depend on the browser returning valid JSON from localStorage.

## Decision (as implemented)

- **No version field** in `Training` ([`models/training.model.ts:8-11`](../../../src/models/training.model.ts#L8-L11)). Key is `'trainings'` — no suffix.
- **No try/catch** around `JSON.parse`. Both call sites:
  - [`training.service.ts:13`](../../../src/services/training.service.ts#L13) inside `localSaveTraining`
  - [`training.service.ts:19`](../../../src/services/training.service.ts#L19) inside `localGetTrainings`
- **No shape validation** on load: whatever JSON parses is trusted.

## Edge cases & nuances

- **Corrupted `'trainings'`** (e.g., written by devtools, truncated by a storage error): `JSON.parse` throws `SyntaxError`. The call is synchronous and unwrapped, so the error propagates out of `TrainingPage`'s `useEffect` ([`training-page.tsx:30-34`](../../../src/components/pages/training-page/training-page.tsx#L30-L34)) or out of `onDateChange` ([`training-page.tsx:78-82`](../../../src/components/pages/training-page/training-page.tsx#L78-L82)) and into Next's default error handling. There is no error boundary.
- **Missing fields after a schema change.** If a future version adds e.g. `Training.holdSeconds` and an old record lacks it, the code accepts it with `undefined` — which quietly breaks any consumer that assumes it exists. TypeScript cannot catch this at runtime.
- **Type drift across app updates.** `UniqueIdentifier` being `string | number` means an old record could contain numbers even after code changes assume strings — see [data-model/001](../data-model/001-training-and-trainingsteps.md).
- **Bulk export / import** is not supported. There is no way to recover from a corrupted store except manual devtools editing.

## Configuration

- Key: `'trainings'` (no version)

## Consequences

**Positive:**
- Simpler code; no version-gating logic.

**Negative / risks:**
- One corrupted character in localStorage takes down the entire editor for that user until they clear storage.
- Future schema changes have no safe upgrade path — a migration has to detect "old" records heuristically.
- No telemetry/logging to observe how often this fails in the wild.

## Future mitigation sketch

```
try {
  return JSON.parse(localStorage.getItem('trainings_v1') || '[]');
} catch {
  console.error('trainings_v1 corrupted, resetting');
  localStorage.removeItem('trainings_v1');
  return [];
}
```

Migrating `'trainings'` → `'trainings_v1'` on first read preserves history, gives us the versioning handle we lacked, and bounds the blast radius of corruption.

## Related

- ADR-001, ADR-002
- [data-model/001-training-and-trainingsteps.md](../data-model/001-training-and-trainingsteps.md)
