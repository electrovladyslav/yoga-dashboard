## Why

`localStorage` is synchronous and blocks the main thread on every read/write, has a hard ~5 MB quota, and offers no transaction semantics. As training history grows, this degrades UI responsiveness and risks silent data loss on quota overflow. Migrating to IndexedDB gives async, non-blocking storage with significantly higher capacity and proper transactional guarantees.

## What Changes

- Replace all `localStorage` reads/writes in `src/services/training.service.ts` with IndexedDB operations.
- The public service API (`saveTraining`, `getTrainings`) becomes **async** — returns `Promise`-wrapped `Result` types. **BREAKING**: all callers must `await` these calls.
- Add an IndexedDB initialisation helper in `src/lib/` that opens/upgrades the database and exports a typed handle.
- Update `TrainingPage` (and any other consumers) to handle the now-async service calls.
- Add a one-time migration that reads any existing `localStorage` data on first load and writes it into IndexedDB, then clears the localStorage key.

## Non-goals

- No server-side or Supabase sync as part of this change.
- No changes to the `Training` or `TrainingSteps` data models.
- No changes to drag-and-drop state management.
- No offline/service-worker caching layer.

## Capabilities

### New Capabilities

- `training-storage`: Async, IndexedDB-backed persistence for `Training` records — open/upgrade DB, save a training, retrieve training by date, and migrate legacy localStorage data on first run.

### Modified Capabilities

*(none — no existing spec files exist; the storage behaviour change is fully captured by the new capability above)*

## Impact

| Area | Change |
|---|---|
| `src/services/training.service.ts` | Full rewrite to async IndexedDB calls |
| `src/lib/db.ts` *(new)* | IndexedDB open/upgrade helper |
| `src/components/pages/training-page/` | Await async service calls; handle loading state |
| `src/services/training.service.test.ts` | Rewrite tests using fake IndexedDB (`fake-indexeddb`) |
| `package.json` | Add `fake-indexeddb` dev-dependency for tests |
