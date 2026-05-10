# ADR-002: `saveTraining` appends; duplicate dates accumulate silently

- **Status:** Accepted (known defect)
- **Date:** 2026-04-22
- **Scope:** Persistence

## Context

Users click Save more than once per day. The service layer needs to decide whether a second save for the same date *replaces* the earlier entry or *appends* a new one.

## Decision (as implemented)

It appends. There is no upsert.

- [`training.service.ts:12-16`](../../../src/services/training.service.ts#L12-L16):

> `trainings.push(training); localStorage.setItem('trainings', JSON.stringify(trainings));`

No `findIndex` + replace, no key-by-date object, no Map.

The companion `getTrainings` uses `Array.prototype.find` at [`training.service.ts:9`](../../../src/services/training.service.ts#L9), which returns the FIRST match — i.e., the OLDEST save. Later saves for the same date are stored but never read.

## Edge cases & nuances

- **Save → edit → Save again same day**: two entries for the same date in the array. The second edit is unreachable on reload; the user will see the first save's content.
- **Load → immediate Save** (no edits): still appends a duplicate. The guard at [`training-page.tsx:84-88`](../../../src/components/pages/training-page/training-page.tsx#L84-L88) only checks `Object.keys(trainingSteps).length` — it doesn't short-circuit "nothing changed".
- **After many duplicates**, `find` performance stays negligible (array is tiny), but localStorage bloat grows linearly with Save clicks.
- **`onSaveClick` guard is weak**: it requires `Object.keys(trainingSteps).length` to be truthy, which it is as soon as any step has been touched — *even if every step array is empty* (an empty `steps: {}` is skipped, but `steps: { 'warm-up': [] }` is saved).

## Configuration

None.

## Consequences

**Positive:**
- Code is two lines; nothing to break.

**Negative / risks:**
- Later edits are silently discarded on reload.
- Storage grows with every click; not self-healing.
- Debugging data issues requires inspecting the raw array (older entries hide newer ones).

## Suggested fix (not yet applied)

Replace `push` with an upsert:

```
const idx = trainings.findIndex(t => t.date === training.date);
if (idx >= 0) trainings[idx] = training;
else trainings.push(training);
```

Applying this without a one-time dedupe on read will leave existing duplicates shadowing future upserts for those dates.

## Related

- ADR-001 (storage shape)
- ADR-003 (no versioning — relevant if a dedupe migration is ever applied)
