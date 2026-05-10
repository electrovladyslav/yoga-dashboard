## 1. Dependencies & Setup

- [x] 1.1 Install `idb` as a runtime dependency and `fake-indexeddb` as a dev dependency (`npm install idb` and `npm install -D fake-indexeddb`)
- [x] 1.2 Verify TypeScript picks up `idb` types — run `npx tsc --noEmit` and confirm no missing-module errors

## 2. Database Layer — Tests First (TDD)

- [x] 2.1 Write failing tests for `src/lib/db.ts`: verify `getDb()` returns a database with a `"trainings"` object store, and that repeated calls return the same instance (use `fake-indexeddb`)
- [x] 2.2 Implement `src/lib/db.ts`: lazy `openDB` singleton with `upgrade` callback creating the `"trainings"` store keyed by `date`; export `getDb`
- [x] 2.3 Confirm db tests pass: `npm test`

## 3. Training Service — Tests First (TDD)

- [x] 3.1 Write failing tests for `saveTraining`: new record inserts, same-date record upserts, and IndexedDB-unavailable error path (use `fake-indexeddb` + `vi.stubGlobal`)
- [x] 3.2 Write failing tests for `getTrainings`: found-by-date, not-found returns `undefined`, and error path
- [x] 3.3 Implement `saveTraining` in `src/services/training.service.ts` as `async`, returning `Promise<Result<void, Error>>`, using `idb` via `getDb()`
- [x] 3.4 Implement `getTrainings` as `async`, returning `Promise<Result<Training | undefined, Error>>`
- [x] 3.5 Confirm service tests pass: `npm test`

## 4. Legacy Migration — Tests First (TDD)

- [x] 4.1 Write failing tests for the migration helper: localStorage-present migrates all records and clears the key; localStorage-absent is a no-op; malformed JSON is caught and localStorage key is preserved
- [x] 4.2 Implement `migrateFromLocalStorage` in `src/services/training.service.ts` (called once after `getDb()` resolves on app start)
- [x] 4.3 Confirm migration tests pass: `npm test`

## 5. TrainingPage Integration

- [x] 5.1 Update `TrainingPage` to `await` `saveTraining` and `getTrainings`, adding an `isLoading` boolean state; render a loading indicator while the initial fetch is in-flight
- [x] 5.2 Handle `ok: false` results in `TrainingPage` — surface an error message to the user rather than silently failing
- [ ] 5.3 Manually smoke-test: seed data in `localStorage` under key `"trainings"`, reload, verify data loads correctly, verify `localStorage` key is removed

## 6. Verification

- [x] 6.1 `npm run lint` — zero warnings
- [x] 6.2 `npx tsc --noEmit` — zero errors
- [x] 6.3 `npm test` — all tests pass
