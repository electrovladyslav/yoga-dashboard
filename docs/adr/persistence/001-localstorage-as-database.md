# ADR-001: `localStorage` as the only persistence layer

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Persistence

## Context

The app is single-user, single-device, no accounts. We need trainings to survive a refresh but not much else. CLAUDE.md mentions Supabase — it is not wired up in the running code (see [stale-docs/001](../stale-docs/001-claude-md-supabase-drift.md)).

## Decision

Store everything under a single `localStorage` key, `'trainings'`, as a JSON-serialized `Training[]`. All access goes through [`src/services/training.service.ts`](../../../src/services/training.service.ts).

- Exported API: `saveTraining(training)` ([`training.service.ts:3-5`](../../../src/services/training.service.ts#L3-L5)) and `getTrainings(date)` ([`training.service.ts:7-10`](../../../src/services/training.service.ts#L7-L10)).
- Internal: `localSaveTraining` ([`training.service.ts:12-16`](../../../src/services/training.service.ts#L12-L16)) and `localGetTrainings` ([`training.service.ts:18-20`](../../../src/services/training.service.ts#L18-L20)).
- Read pattern: read entire array, find by `date`. O(n) every lookup but n is small in practice (one entry per day of use).
- Write pattern: read entire array, push, write back.

## Execution flow

```
saveTraining(t) → localSaveTraining(t):
    arr = JSON.parse(localStorage.getItem('trainings') || '[]')
    arr.push(t)
    localStorage.setItem('trainings', JSON.stringify(arr))

getTrainings(date) → localGetTrainings() → arr.find(t => t.date === date)
```

## Edge cases & nuances

- **First visit.** `localStorage.getItem('trainings')` is `null`, the `|| '[]'` default produces an empty array. `find` returns `undefined`, caller (`setTrainingFromTheDate` at [`training-page.tsx:23-28`](../../../src/components/pages/training-page/training-page.tsx#L23-L28)) skips the state update — the editor stays empty. No toast, no hint.
- **`getTrainings` naming is plural but returns a single `Training | undefined`.** Signature at [`training.service.ts:7`](../../../src/services/training.service.ts#L7).
- **Lookup returns the first match.** Combined with the append-only save (see [002](./002-save-appends-without-upsert.md)), older writes for the same date are shadowed but never removed.
- **Runs only in the browser.** Any call in a server component would throw — but every caller is reachable only from inside the `TrainingPage` client boundary, so in practice this is fine.
- **No quota handling.** `localStorage.setItem` can throw `QuotaExceededError`. The ~5MB quota is enormous compared to the tiny JSON stored (kilobytes per training), but there's no try/catch; an overflow would bubble up unhandled.

## Configuration

- Storage key: `'trainings'` (hardcoded at [`training.service.ts:13`](../../../src/services/training.service.ts#L13), [`:15`](../../../src/services/training.service.ts#L15), [`:19`](../../../src/services/training.service.ts#L19))
- Shape: `Training[]` where `Training` is defined in [`models/training.model.ts:8-11`](../../../src/models/training.model.ts#L8-L11)

## Consequences

**Positive:**
- Zero infrastructure, zero config, zero privacy concerns.
- Works offline.

**Negative / risks:**
- Clearing site data wipes everything; no recovery.
- No multi-device sync.
- Key namespace is unversioned (`'trainings'`, not `'trainings_v1'`) — see [003](./003-no-versioning-or-error-recovery.md).
- `getTrainings` name implies multiple; reviewers often misread it.

## Related

- ADR-002 (append semantics)
- ADR-003 (no versioning)
- [app-shell/002-dynamic-date-route.md](../app-shell/002-dynamic-date-route.md)
- [stale-docs/001-claude-md-supabase-drift.md](../stale-docs/001-claude-md-supabase-drift.md)
