# Persistence

Training data is stored in the browser's `localStorage` — there is no backend, no database, no sync. This directory documents the storage strategy and its sharp edges.

## Architecture

```
User clicks Save
    ↓
saveTraining(training)
    ↓
localStorage key 'trainings'
    = JSON.stringify(Training[])
        (append-only; duplicate dates accumulate)

Page load / date change
    ↓
getTrainings(date)
    ↓
JSON.parse(localStorage.getItem('trainings') || '[]')
    ↓
.find(t => t.date === date)   ← returns FIRST match; later duplicates shadowed
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-localstorage-as-database.md](./001-localstorage-as-database.md) | Why localStorage; single key, JSON array shape |
| 2 | [002-save-appends-without-upsert.md](./002-save-appends-without-upsert.md) | `push` without dedupe; duplicate dates silently accumulate |
| 3 | [003-no-versioning-or-error-recovery.md](./003-no-versioning-or-error-recovery.md) | No schema version, no try/catch on JSON.parse |

## Key files

- [`src/services/training.service.ts`](../../../src/services/training.service.ts)
- [`src/utils/date.utils.ts`](../../../src/utils/date.utils.ts)
