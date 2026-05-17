## Context

`training.service.ts` currently calls `localStorage.getItem` / `localStorage.setItem` synchronously on every save and load. The whole JSON array of trainings is serialised/deserialised on each operation. As history grows this blocks the main thread and risks hitting the 5 MB browser quota without warning. IndexedDB provides an async, transactional, keyed object-store API with a quota measured in hundreds of MB.

No data-model changes are needed — the existing `Training` interface maps cleanly to an IndexedDB record keyed by `Training.date`.

## Goals / Non-Goals

**Goals:**
- All storage reads/writes are non-blocking (async/await).
- Service layer returns `Result<T, Error>` — no unhandled throws reach components.
- Existing localStorage data is migrated automatically on first run.
- Unit tests run without a real browser (fake-indexeddb in jsdom).

**Non-Goals:**
- Supabase / server-side sync (no change).
- Changes to `Training`, `TrainingSteps`, or `Asana` model shapes.
- Offline service-worker caching.
- Multi-tab conflict resolution.

## Decisions

### 1. `idb` wrapper library vs raw IndexedDB API

**Decision**: use the [`idb`](https://github.com/jakearchibald/idb) package (≈ 1 kB gzipped).

| Option | Pros | Cons |
|---|---|---|
| Raw IDB | Zero new dep | `IDBRequest` callbacks are verbose; easy to miss `onerror` paths |
| `idb` | Typed, Promise-based, minimal | One extra package |
| Dexie.js | Full ORM, reactive queries | 22 kB, far more than needed |

`idb` gives clean `async/await` semantics without imposing an ORM layer. Raw IDB would require wrapping every request manually — error-prone and harder to test.

### 2. Database initialisation

A single `openDB` call is made lazily in `src/lib/db.ts` and the resulting `Promise<IDBPDatabase>` is cached in module scope. All service functions `await` the cached promise before issuing requests. This avoids repeated open calls and keeps upgrade logic in one place.

```
src/lib/db.ts
  export const getDb = () => cachedDbPromise   // lazy singleton
```

Schema: one object store `"trainings"` with `keyPath: "date"`.

### 3. Service API shape

`saveTraining` and `getTrainings` become `async` and return `Promise<Result<…, Error>>`.

```ts
saveTraining(training: Training): Promise<Result<void, Error>>
getTrainings(date: string): Promise<Result<Training | undefined, Error>>
```

Callers (TrainingPage) must `await` and handle the `ok`/`error` branch. A component-level loading state is added to cover the async gap.

### 4. localStorage → IndexedDB migration

On the first `getDb()` call (inside the `upgrade` callback at version bump from 0 → 1) we cannot access localStorage (upgrade runs synchronously in the IDB transaction context). Instead, migration runs as a one-shot async step after the DB is opened:

1. Check `localStorage.getItem('trainings')` — if present, parse and `put` each record into the IDB store.
2. On success, delete the `localStorage` key.
3. Wrap in try/catch; a migration failure returns an `error` Result but does **not** crash the app — data remains in localStorage as fallback evidence.

This follows the project convention: shape changes require a migration in `src/services/`.

### 5. Testing strategy

`fake-indexeddb` is added as a dev-dependency. It provides a spec-compliant in-memory IndexedDB that works inside jsdom. Tests import `src/lib/db.ts` after replacing `indexedDB` with the fake via `vi.stubGlobal`. Each test gets a fresh DB instance by clearing the module cache between tests.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| IndexedDB unavailable (some private-browsing modes) | `openDB` is wrapped in try/catch; service returns `{ ok: false, error }` — UI shows a toast/fallback |
| Migration runs twice if page is closed mid-migration | Migration is idempotent: `put` overwrites and the localStorage key is only cleared after all puts succeed |
| Async API adds loading state complexity to `TrainingPage` | Add a single `isLoading` boolean to TrainingPage state; show a spinner while the initial load resolves |
| `idb` package version drift | Pin to a minor version in `package.json` |

## Migration Plan

1. Install `idb` (runtime) and `fake-indexeddb` (dev).
2. Add `src/lib/db.ts` — DB open/upgrade, export `getDb`.
3. Rewrite `src/services/training.service.ts` — async, Result-typed, calls `getDb()`.
4. Add legacy-migration helper called once from `getDb()` post-open.
5. Update `TrainingPage` to `await` service calls and manage `isLoading`.
6. Replace localStorage-based tests with `fake-indexeddb`-based tests.
7. Manual smoke test: seed old data in localStorage → reload → verify data appears → verify localStorage key is gone.

**Rollback**: revert service file to previous commit; localStorage data is preserved if migration fails (key is only cleared on success).

## Open Questions

- Should `saveTraining` upsert (replace by date) or append? Current localStorage impl appends and callers search by date — upsert with `keyPath: "date"` is cleaner and fixes the implicit duplicate-date bug. **Decision: upsert.** Confirmed by user.
